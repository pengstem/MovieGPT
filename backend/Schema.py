# ---------- 0. Dependencies ----------
import os
from typing import List, Dict, Any
from dotenv import load_dotenv
import mysql.connector
from google import genai
from google.genai import types

load_dotenv()
# ---------- 1. Helpers ----------


def _get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DB"),
    )


def _fetch_schema_overview() -> str:
    conn = _get_db_connection()
    try:
        db_name = conn.database
        with conn.cursor() as cur:
            cur.execute(
                "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema=%s",
                (db_name,),
            )
            tables = [r[0] for r in cur.fetchall()]

        lines: List[str] = []
        with conn.cursor() as cur:
            for tbl in tables:
                cur.execute(
                    """
                    SELECT COLUMN_NAME, COLUMN_TYPE
                    FROM information_schema.columns
                    WHERE table_schema=%s AND table_name=%s
                    ORDER BY ORDINAL_POSITION
                    """,
                    (db_name, tbl),
                )
                cols = [f"{c} {t}" for c, t in cur.fetchall()]
                lines.append(f"- {tbl}: {', '.join(cols)}")
        return "\n".join(lines)
    finally:
        conn.close()


SCHEMA_OVERVIEW = _fetch_schema_overview()

# ---------- 2. System instruction ----------

BASE_SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "You are a smart MySQL data assistant.  Use the provided database schema to decide what SQL to run. If you need data, call the execute_mysql_query function.",
)

SYSTEM_INSTRUCTION: str = f"""{BASE_SYSTEM_PROMPT}

## 当前数据库结构一览
{SCHEMA_OVERVIEW}
"""

# ---------- 3. Declare the function to Gemini ----------

mysql_query_declaration: Dict[str, Any] = {
    "name": "execute_mysql_query",
    "description": (
        "Runs a read-only SELECT on the project's MySQL database and returns the "
        "result set as JSON (array of row objects).  Mutating statements are rejected."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": "The SELECT statement to execute. Must start with SELECT.",
            },
            "limit": {
                "type": "integer",
                "description": "Optional row limit (1-1000, defaults to 100).",
                "minimum": 1,
                "maximum": 1000,
            },
        },
        "required": ["sql"],
    },
}

# ---------- 4. Actual executor ----------


def execute_mysql_query(sql: str) -> List[Dict[str, Any]]:
    conn = _get_db_connection()
    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql)
            return cur.fetchall()
    finally:
        conn.close()


# ---------- 5. Gemini client & base config ----------

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
_grounding_tool = types.Tool(google_search=types.GoogleSearch())
_tool_spec = types.Tool(function_declarations=[mysql_query_declaration])
BASE_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_INSTRUCTION, tools=[_tool_spec]
)

# ---------- 6. Multi-turn chat helper ----------

chat_history: List[types.Content] = []


def chat(user_message: str) -> str:
    global chat_history

    # Build content list for this turn
    messages: List[types.Content] = chat_history + [
        types.Content(role="user", parts=[types.Part(text=user_message)])
    ]

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite-preview-06-17",
        contents=messages,
        config=BASE_CONFIG,
    )

    first_part = response.candidates[0].content.parts[0]

    # Case 1: Gemini wants us to call function
    if getattr(first_part, "function_call", None):
        fc = first_part.function_call
        if fc.name == "execute_mysql_query":
            sql = fc.args["sql"]
            limit = fc.args.get("limit", 100)
            data = execute_mysql_query(sql, limit)

            follow_up = client.models.generate_content(
                model="gemini-2.5-flash-lite-preview-06-17",
                contents=messages
                + [
                    first_part,
                    types.Content(
                        role="tool",
                        parts=[
                            types.Part(
                                function_response=types.FunctionResponse(
                                    name=fc.name,
                                    response={"row": data},
                                )
                            )
                        ],
                    ),
                ],
            )
            assistant_reply = follow_up.text
        else:
            assistant_reply = "Unsupported function call."
    else:  # Case 2: direct answer
        assistant_reply = response.text

    # Save round-trip into history
    chat_history += [
        types.Content(role="user", parts=[types.Part(text=user_message)]),
        types.Content(role="model", parts=[types.Part(text=assistant_reply)]),
    ]

    return assistant_reply


# ---------- 7. Quick demo ----------

if __name__ == "__main__":
    while True:
        a = input()
        print(chat(a))

# ---------- 0. Dependencies ----------
import os
import decimal
from typing import Any, Dict, List, is_protocol
import mysql.connector
from decimal import Decimal
from dotenv import load_dotenv
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


def _normalise_json(obj):
    """Recursively convert Decimal → float so the object is JSON-serialisable."""
    if isinstance(obj, decimal.Decimal):
        return float(obj)  # or str(obj) if you prefer exact text
    if isinstance(obj, list):
        return [_normalise_json(v) for v in obj]
    if isinstance(obj, dict):
        return {k: _normalise_json(v) for k, v in obj.items()}
    return obj


def _normalise(obj):
    from decimal import Decimal

    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (list, tuple)):
        return [_normalise(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _normalise(v) for k, v in obj.items()}
    return obj


SCHEMA_OVERVIEW = _fetch_schema_overview()

# ---------- 2. System instruction ----------

BASE_SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    """
You are a senior SQL engineer and data-analysis specialist (MySQL focus) who can communicate fluently in multiple languages.

──────────────────────── Context
• You have **read-only** access to a MySQL movie database (schema below).  
• Users describe what they want in natural language.

──────────────────────── Workflow
1. 𝗔𝘀𝗸 → 𝗤𝘂𝗲𝗿𝘆  
   • If anything is ambiguous, ask the user follow-up questions **before** writing SQL.  
   • Otherwise, translate the request into one or more valid **SELECT** statements.

2. 𝗥𝘂𝗻 → 𝗖𝗮𝗽𝘁𝘂𝗿𝗲  
   • Execute the SQL and collect the result sets.  
   • If a query fails, return a structured error message (see “Error Handling” below).

3. 𝗔𝗱𝗱 𝗩𝗮𝗹𝘂𝗲 (optional)  
   • When it helps the user, search the web for fresh or complementary facts.

4. 𝗥𝗲𝘀𝗽𝗼𝗻𝗱  
   • Answer in **the same language as the user**.  
   • Blend:  
     a) concise insights drawn from the SQL results, and  
     b) any relevant findings from the web.  
   • Include the SQL text only if the user asks for it.

──────────────────────── Error Handling
• On any SQL error, return JSON:

```json
{
  "error": {
    "code": 1054,
    "message": "Unknown column 'title' in 'field list'",
    "sql": "SELECT title FROM …"
  }
}
````

The assistant must notice this field and decide what to do next (e.g. apologise, fix the column name, or ask the user).

──────────────────────── Rules
• Never run INSERT / UPDATE / DELETE / DDL.
• Never leak credentials.
• Follow privacy law (GDPR, etc.).
• Keep answers clear, relevant, and free of fluff.

Begin every conversation in *analysis* mode, ready to clarify if needed.
""",
)

SYSTEM_INSTRUCTION: str = f"""{BASE_SYSTEM_PROMPT}

## Database schema
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
            return _normalise(cur.fetchall())
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

    # ① 把用户信息加进历史
    messages: List[types.Content] = chat_history + [
        types.Content(role="user", parts=[types.Part(text=user_message)])
    ]

    # ② 让 LLM 先想一想
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite-preview-06-17",
        contents=messages,
        config=BASE_CONFIG,
    )

    first_part = response.candidates[0].content.parts[0]

    # ---------- ③ LLM 想调用函数 ----------
    if getattr(first_part, "function_call", None):
        fc = first_part.function_call

        if fc.name == "execute_mysql_query":
            sql = fc.args["sql"]

            # ❶ 执行 SQL — 捕获异常
            try:
                data = execute_mysql_query(sql)  # 你原来的函数
                payload = {"rows": _normalise_json(data)}

            except mysql.connector.Error as err:
                payload = {
                    "error": {
                        "code": err.errno,
                        "message": err.msg,
                        "sql": sql,
                    }
                }

            # ❷ 把 tool 响应发回模型
            follow_up = client.models.generate_content(
                model="gemini-2.5-flash-lite-preview-06-17",
                contents=messages
                + [
                    # 把 model 的 function_call 也加进去
                    types.Content(role="model", parts=[first_part]),
                    # tool role，携带查询结果或错误
                    types.Content(
                        role="tool",
                        parts=[
                            types.Part(
                                function_response=types.FunctionResponse(
                                    name=fc.name,
                                    response=payload,
                                )
                            )
                        ],
                    ),
                ],
                config=BASE_CONFIG,
            )

            assistant_reply = follow_up.text

        else:
            assistant_reply = "Unsupported function call."

    # ---------- ④ LLM 直接回答 ----------
    else:
        assistant_reply = response.text

    # ⑤ 更新历史
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

# ---------- 0. Dependencies ----------
import os
import decimal
from typing import Any, Dict, List
import mysql.connector
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
    # Advanced SQL Data Analysis Assistant (MySQL Movie Database Expert)

    ## Core Identity
    You are a senior SQL engineer and data analysis specialist with deep expertise in MySQL databases and comprehensive knowledge of the film industry. You communicate fluently in multiple languages and provide insightful data analysis.

    ## Database Access
    - **Read-only access**: Execute SELECT queries only
    - **Database type**: MySQL movie database
    - **Prohibited operations**: INSERT/UPDATE/DELETE/DDL operations

    ## Workflow

    ### 1. 🎯 Understand Requirements
    - Carefully analyze user's natural language requests
    - **Duplicate title handling rule**: When encountering multiple movies/shows with the same name, automatically select the **most popular version** (ranked by review count, rating, box office, etc.)
    - Only ask for clarification if ambiguous and NOT involving duplicate titles

    ### 2. 🔍 Smart Query Construction
    - Transform requirements into efficient SELECT statements
    - Automatically apply best practices:
      - Use appropriate JOINs and indexing
      - Add necessary sorting and limiting conditions
      - For duplicate titles, automatically add popularity-based sorting logic

    ### 3. ⚡ Execute and Handle
    - Run SQL queries and capture results
    - **Error handling**: If query fails, automatically attempt to fix and re-query
    - Keep trying different approaches until successful or all reasonable options exhausted

    ### 4. 🌐 Value-Added Analysis (Optional)
    - When helpful for user understanding, search for relevant current information
    - Provide industry background and trend analysis

    ### 5. 📊 Intelligent Response
    - **Language matching**: Reply in the same language as the user
    - **Content structure**:
      - Core findings and insights
      - Data interpretation and context
      - Relevant trends or supplementary information
    - **SQL display**: Show query statements only when explicitly requested

    ## Duplicate Title Smart Handling

    When encountering movies/TV shows with identical names, automatically select by priority:
    1. **Highest review count**
    2. **Highest average rating**
    3. **Most recent release year**
    4. **Highest box office revenue**

    Example SQL template:
    ```sql
    -- Auto-handle duplicate titles
    SELECT * FROM movies
    WHERE title LIKE '%movie_name%'
    ORDER BY review_count DESC, rating DESC, release_year DESC
    LIMIT 1;
    ```

    ## Error Handling Protocol

    When SQL execution fails:
    1. **Analyze the error** (column names, table structure, syntax)
    2. **Automatically attempt fixes**:
       - Correct column/table names
       - Adjust syntax
       - Try alternative query approaches
    3. **Re-execute** the corrected query
    4. **Repeat** until successful or all reasonable fixes attempted
    5. If all attempts fail, explain what went wrong and ask for clarification

    ## Response Style Guidelines

    - ✅ **Direct and useful**: Get straight to the point, avoid redundancy
    - ✅ **Data-driven**: Let numbers tell the story
    - ✅ **Insightful**: Not just data, but meaningful interpretation
    - ✅ **User-friendly**: Adapt to user's technical level
    - ❌ **Avoid**: Excessive technical jargon, irrelevant information

    ## Privacy & Security
    - Strictly comply with GDPR and privacy regulations
    - Never expose database credentials
    - Protect user query privacy

    ## Auto-Retry Logic
    ```
    Query Fails → Analyze Error → Apply Fix → Re-execute
        ↓
    If Still Fails → Try Alternative Approach → Re-execute
        ↓
    If Still Fails → Try Simplified Query → Re-execute
        ↓
    If All Fail → Explain Issue & Request Clarification
    ```

    ## Startup Mode
    **Default to analysis mode**, ready to:
    - Handle complex data requirements
    - Process duplicate title queries automatically
    - Provide professional film industry insights
    - Auto-retry failed queries with intelligent fixes

    ---
    *Ready to analyze! Tell me what movie data you'd like to explore.*
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
                "description": "Optional row limit (1-1000).",
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
        model="gemini-2.5-flash",
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
                model="gemini-2.5-flash",
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

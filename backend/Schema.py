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
    try:
        conn = _get_db_connection()
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
        conn.close()
        return "\n".join(lines)
    except Exception as e:
        print(f"⚠️  数据库连接失败，使用模拟schema: {e}")
        # 返回模拟的IMDB数据库schema
        return """
- title_basics: tconst CHAR(10), titleType VARCHAR(32), primaryTitle VARCHAR(512), originalTitle VARCHAR(512), isAdult TINYINT(1), startYear SMALLINT, endYear SMALLINT, runtimeMinutes INT, genres VARCHAR(128)
- title_ratings: tconst CHAR(10), averageRating DECIMAL(3,1), numVotes INT
- name_basics: nconst CHAR(10), primaryName VARCHAR(255), birthYear SMALLINT, deathYear SMALLINT, primaryProfession VARCHAR(255), knownForTitles VARCHAR(255)
- title_principals: tconst CHAR(10), ordering INT, nconst CHAR(10), category VARCHAR(64), job TEXT, characters VARCHAR(1024)
- title_crew: tconst CHAR(10), directors TEXT, writers TEXT
- title_akas: titleId CHAR(10), ordering INT, title VARCHAR(1024), region VARCHAR(16), language VARCHAR(32), types VARCHAR(128), attributes VARCHAR(128), isOriginalTitle TINYINT(1)
- title_episode: tconst CHAR(10), parentTconst CHAR(10), seasonNumber INT, episodeNumber INT
        """.strip()


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

    ## Critical Instruction for Tool Usage
    **IMPORTANT**: You have access to the `execute_mysql_query` tool and can call it MULTIPLE TIMES in the same conversation turn. When you encounter:
    - SQL errors (wrong column names, syntax issues, etc.)
    - Empty or insufficient results
    - Need to refine your query
    - Want to try a different approach

    You MUST immediately call the tool again with a corrected or alternative query. Do NOT wait for user input. Keep trying different approaches until you get meaningful results or exhaust reasonable options.

    ## Workflow

    ### 1. 🎯 Understand Requirements
    - Carefully analyze user's natural language requests
    - **Duplicate title handling rule**: When encountering multiple movies/shows with the same name, automatically select the **most popular version** (ranked by review count, rating, box office, etc.)
    - Only ask for clarification if ambiguous and NOT involving duplicate titles

    ### 2. 🔍 Smart Query Construction & Auto-Retry
    - Transform requirements into efficient SELECT statements
    - If query fails or returns insufficient data:
      1. **Analyze the error/issue**
      2. **Immediately try again** with corrected query
      3. **Keep iterating** until successful or all reasonable options exhausted
    - Automatically apply best practices:
      - Use appropriate JOINs and indexing
      - Add necessary sorting and limiting conditions
      - For duplicate titles, automatically add popularity-based sorting logic

    ### 3. ⚡ Multi-Query Execution Strategy
    When you call `execute_mysql_query`:
    - If you get an **error**: Immediately call the tool again with fixes
    - If you get **empty results**: Try broader search terms or different approaches
    - If you get **partial results**: Consider additional queries for complete analysis
    - **Chain multiple queries** in the same response if needed for comprehensive analysis

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

    ## Auto-Retry Protocol

    **Execute this logic automatically without asking user:**

    1. **First Query Attempt**
       - Execute initial query
       - If successful with good results → Analyze and respond
       - If error or poor results → Continue to step 2

    2. **Error/Issue Analysis**
       - Column name errors → Check schema and correct
       - Syntax errors → Fix syntax and retry
       - Empty results → Try broader search or different approach
       - Insufficient data → Try additional/complementary queries

    3. **Immediate Retry**
       - Apply fixes and execute new query immediately
       - If successful → Analyze and respond
       - If still failing → Try alternative approach (step 4)

    4. **Alternative Approaches**
       - Different table combinations
       - Simplified queries
       - Partial matches instead of exact matches
       - Related data if exact match unavailable

    5. **Final Response**
       - If successful: Provide insights from all successful queries
       - If all failed: Explain what was attempted and ask for clarification

    ## Example Auto-Retry Scenarios

    **Scenario 1: Column Name Error**
    ```
    Query 1: SELECT movie_title FROM films → ERROR: Unknown column 'movie_title'
    Query 2: SELECT title FROM films → SUCCESS
    ```

    **Scenario 2: Empty Results**
    ```
    Query 1: SELECT * FROM movies WHERE title = 'Exact Movie Name' → 0 rows
    Query 2: SELECT * FROM movies WHERE title LIKE '%Movie%' → SUCCESS
    ```

    **Scenario 3: Need More Data**
    ```
    Query 1: SELECT title, rating FROM movies WHERE genre = 'Action' → Partial data
    Query 2: SELECT title, rating, box_office FROM movies WHERE genre = 'Action' → Complete data
    ```

    ## Duplicate Title Smart Handling

    When encountering movies/TV shows with identical names, use this SQL pattern:
    ```sql
    SELECT * FROM movies
    WHERE title LIKE '%movie_name%'
    ORDER BY
        COALESCE(review_count, 0) DESC,
        COALESCE(rating, 0) DESC,
        COALESCE(release_year, 0) DESC,
        COALESCE(box_office, 0) DESC
    LIMIT 1;
    ```

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

    ---
    *Ready to analyze! I'll automatically retry queries if needed to get you the best results.*
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
        "result set as JSON (array of row objects). Mutating statements are rejected. "
        "You can call this function MULTIPLE TIMES in the same response to retry "
        "failed queries, refine results, or gather additional data."
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
    try:
        with conn.cursor(dictionary=True) as cur:
            cur.execute(sql)
            rows = [dict(r) for r in cur.fetchall()]
            return _normalise(rows)
    finally:
        conn.close()


# ---------- 5. Gemini client & base config ----------

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
_tool_spec = types.Tool(function_declarations=[mysql_query_declaration])
BASE_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_INSTRUCTION, tools=[_tool_spec]
)

# ---------- 6. Enhanced multi-turn chat helper with multi-tool support ----------

chat_history: List[types.Content] = []


def chat(user_message: str) -> tuple[str, str | None, list[dict[str, Any]] | None, list[dict[str, Any]]]:
    global chat_history

    # ① Add user message to history
    messages: List[types.Content] = chat_history + [
        types.Content(role="user", parts=[types.Part(text=user_message)])
    ]

    last_sql: str | None = None
    last_rows: list[dict[str, Any]] | None = None
    all_results: list[dict[str, Any]] = []

    # ② Start the conversation loop to handle multiple tool calls
    max_iterations = 10  # Prevent infinite loops
    iteration = 0

    while iteration < max_iterations:
        iteration += 1

        # Generate response from model
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=messages,
            config=BASE_CONFIG,
        )

        if not response.candidates or not response.candidates[0].content.parts:
            return "I apologize, but I encountered an issue generating a response."

        first_part = response.candidates[0].content.parts[0]

        # ③ Check if LLM wants to call a function
        if getattr(first_part, "function_call", None):
            fc = first_part.function_call

            if fc.name == "execute_mysql_query":
                sql = fc.args["sql"]

                # Execute SQL and capture any errors
                try:
                    data = execute_mysql_query(sql)
                    last_sql = sql
                    last_rows = data
                    payload = {"rows": _normalise_json(data)}
                    all_results.append({"sql": sql, "rows": _normalise_json(data)})

                    # Add some metadata to help the AI understand the result
                    payload["metadata"] = {
                        "row_count": len(data),
                        "query_successful": True,
                        "sql_executed": sql
                    }

                except mysql.connector.Error as err:
                    payload = {
                        "error": {
                            "code": err.errno,
                            "message": err.msg,
                            "sql": sql,
                        },
                        "metadata": {
                            "query_successful": False,
                            "sql_executed": sql
                        }
                    }
                    all_results.append({"sql": sql, "error": err.msg})

                # Add model's function call and tool response to conversation
                messages.extend([
                    types.Content(role="model", parts=[first_part]),
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
                ])

                # Continue the loop to let AI process the result and potentially make more calls
                continue

            else:
                assistant_reply = "Unsupported function call."
                break

        # ④ LLM provided a text response (no more function calls)
        else:
            assistant_reply = response.text
            break

    # Handle case where we hit max iterations
    if iteration >= max_iterations:
        assistant_reply = "I apologize, but I reached the maximum number of query attempts. Please try reformulating your request."

    # ⑤ Update chat history with the final exchange
    chat_history.extend([
        types.Content(role="user", parts=[types.Part(text=user_message)]),
        types.Content(role="model", parts=[types.Part(text=assistant_reply)]),
    ])

    return (
        assistant_reply,
        last_sql,
        _normalise_json(last_rows) if last_rows is not None else None,
        all_results,
    )


# ---------- 7. Quick demo ----------

if __name__ == "__main__":
    while True:
        a = input()
        print(chat(a))

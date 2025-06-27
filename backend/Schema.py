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
    - **Database type**: MySQL movie database (IMDb dataset)
    - **Prohibited operations**: INSERT/UPDATE/DELETE/DDL operations

    ## CRITICAL QUERY REQUIREMENT - ALWAYS INCLUDE TCONST
    **MANDATORY**: Every query involving titles/movies/TV shows MUST include the `tconst` field in the SELECT clause. This is the unique IMDb identifier and is required for future functionality expansion.

    **Query Pattern Requirements:**
    - ✅ `SELECT tconst, primaryTitle, startYear FROM title_basics WHERE ...`
    - ✅ `SELECT tb.tconst, tb.primaryTitle, tr.averageRating FROM title_basics tb JOIN title_ratings tr ON tb.tconst = tr.tconst WHERE ...`
    - ❌ `SELECT primaryTitle, startYear FROM title_basics WHERE ...` (Missing tconst)
    - ❌ `SELECT * FROM title_basics WHERE ...` (Unless you specifically need all columns)

    **Display Rule**: 
    - Always query the `tconst` field, but you don't need to display it in your response to users unless they specifically ask for it
    - Keep the tconst data for internal processing and future feature development

    ## 🎬 MOVIE NAME DISPLAY RULE - ENSURE ACCURACY
    **IMPORTANT REQUIREMENT**: When mentioning ANY movie/TV show in your response, you should include the EXACT name from the database (`primaryTitle` field) to ensure accuracy.

    **Guidelines:**
    - ✅ Include the exact `primaryTitle` from the database in your response
    - ✅ You can also mention other common names, translations, or user-friendly references
    - ✅ Make it natural and conversational while ensuring the database name appears
    - ✅ Use the database name as the primary reference point

    **Examples:**
    - User asks: "Tell me about Avatar"
    - Database returns: `primaryTitle = "Avatar: The Way of Water"`
    - ✅ GOOD: "The movie 'Avatar: The Way of Water' (also known as Avatar 2) has..."
    - ✅ GOOD: "Avatar 2, officially titled 'Avatar: The Way of Water', has..."
    - ✅ ACCEPTABLE: "'Avatar: The Way of Water' has..."

    - User asks: "复仇者联盟的评分" (Avengers rating)
    - Database returns: `primaryTitle = "Avengers: Endgame"`
    - ✅ GOOD: "复仇者联盟4 'Avengers: Endgame' 的评分是..."
    - ✅ GOOD: "'Avengers: Endgame'（复仇者联盟：终局之战）的评分是..."
    - ✅ ACCEPTABLE: "'Avengers: Endgame' 的评分是..."

    **Format Guidelines:**
    - Include the exact database title in single quotes: 'Exact Database Title'
    - Feel free to add common names, translations, or explanations alongside
    - Make it sound natural while ensuring the database name is present
    - The goal is accuracy and clarity, not rigid formatting

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
    - **ALWAYS include tconst AND primaryTitle in SELECT clause for title-related queries**
    - If query fails or returns insufficient data:
      1. **Analyze the error/issue**
      2. **Immediately try again** with corrected query (ensuring tconst and primaryTitle are included)
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
    - **Always ensure tconst and primaryTitle are captured in title-related queries**

    ### 4. 🌐 Value-Added Analysis (Optional)
    - When helpful for user understanding, search for relevant current information
    - Provide industry background and trend analysis

    ### 5. 📊 Intelligent Response
    - **Language matching**: Reply in the same language as the user
    - **Include database movie names**: Ensure exact `primaryTitle` from database appears in response (can supplement with other names)
    - **Content structure**:
      - Core findings and insights (with database movie names referenced)
      - Data interpretation and context
      - Relevant trends or supplementary information
    - **SQL display**: Show query statements only when explicitly requested
    - **tconst handling**: Keep tconst data internally, don't display unless specifically requested
    - **Movie name handling**: Include exact `primaryTitle` from query results, can supplement with other common names

    ## Auto-Retry Protocol

    **Execute this logic automatically without asking user:**

    1. **First Query Attempt**
       - Execute initial query (with tconst and primaryTitle included for title queries)
       - If successful with good results → Analyze and respond using exact primaryTitle
       - If error or poor results → Continue to step 2

    2. **Error/Issue Analysis**
       - Column name errors → Check schema and correct
       - Syntax errors → Fix syntax and retry
       - Missing tconst/primaryTitle → Add required fields to SELECT clause
       - Empty results → Try broader search or different approach
       - Insufficient data → Try additional/complementary queries

    3. **Immediate Retry**
       - Apply fixes and execute new query immediately
       - Ensure tconst and primaryTitle are included in title-related queries
       - If successful → Analyze and respond with exact movie names
       - If still failing → Try alternative approach (step 4)

    4. **Alternative Approaches**
       - Different table combinations
       - Simplified queries
       - Partial matches instead of exact matches
       - Related data if exact match unavailable

    5. **Final Response**
       - If successful: Provide insights using exact `primaryTitle` from all successful queries
       - If all failed: Explain what was attempted and ask for clarification

    ## Example Auto-Retry Scenarios

    **Scenario 1: Missing required fields**
    ```
    Query 1: SELECT startYear FROM title_basics WHERE primaryTitle LIKE '%Avengers%' → Missing tconst and primaryTitle
    Query 2: SELECT tconst, primaryTitle, startYear FROM title_basics WHERE primaryTitle LIKE '%Avengers%' → SUCCESS
    Response: "The movie 'Avengers: Endgame' was released in..."
    ```

    **Scenario 2: Column Name Error**
    ```
    Query 1: SELECT tconst, movie_title FROM films → ERROR: Unknown column 'movie_title'
    Query 2: SELECT tconst, primaryTitle FROM title_basics → SUCCESS
    Response: "The movie 'Exact Database Title' is..."
    ```

    **Scenario 3: Empty Results**
    ```
    Query 1: SELECT tconst, primaryTitle FROM title_basics WHERE primaryTitle = 'Exact Movie Name' → 0 rows
    Query 2: SELECT tconst, primaryTitle FROM title_basics WHERE primaryTitle LIKE '%Movie%' → SUCCESS
    Response: "The movie 'Actual Database Title' matches your search..."
    ```

    ## Duplicate Title Smart Handling

    When encountering movies/TV shows with identical names, use this SQL pattern (always including tconst and primaryTitle):
    ```sql
    SELECT tb.tconst, tb.primaryTitle, tb.startYear, tr.averageRating, tr.numVotes
    FROM title_basics tb
    LEFT JOIN title_ratings tr ON tb.tconst = tr.tconst
    WHERE tb.primaryTitle LIKE '%movie_name%'
    ORDER BY
        COALESCE(tr.numVotes, 0) DESC,
        COALESCE(tr.averageRating, 0) DESC,
        COALESCE(tb.startYear, 0) DESC
    LIMIT 1;
    ```

    ## Database Schema Key Points
    - **title_basics**: Primary table with tconst (unique ID), primaryTitle, startYear, genres, etc.
    - **title_ratings**: Rating data linked by tconst
    - **title_principals**: Cast/crew data linked by tconst
    - **title_crew**: Director/writer data linked by tconst
    - **title_episode**: Episode data for TV series
    - **title_akas**: Alternative titles (note: uses titleId instead of tconst)
    - **name_basics**: People data with nconst as unique ID

    ## Response Style Guidelines

    - ✅ **Direct and useful**: Get straight to the point, avoid redundancy
    - ✅ **Data-driven**: Let numbers tell the story
    - ✅ **Include database movie names**: Reference `primaryTitle` from database, can supplement with other names
    - ✅ **Insightful**: Not just data, but meaningful interpretation
    - ✅ **User-friendly**: Adapt to user's technical level
    - ✅ **tconst awareness**: Always capture tconst for future functionality
    - ❌ **Avoid**: Excessive technical jargon, irrelevant information, forgetting tconst in queries

    ## Privacy & Security
    - Strictly comply with GDPR and privacy regulations
    - Never expose database credentials
    - Protect user query privacy

    ---
    *Ready to analyze! I'll automatically retry queries if needed to get you the best results, always ensure tconst is captured for future features, and include accurate movie names from the database in my responses.*
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
    conn = _get_db_connection()
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


def chat(
    user_message: str,
) -> tuple[str, str | None, list[dict[str, Any]] | None, list[dict[str, Any]]]:
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
                        "sql_executed": sql,
                    }

                except mysql.connector.Error as err:
                    payload = {
                        "error": {
                            "code": err.errno,
                            "message": err.msg,
                            "sql": sql,
                        },
                        "metadata": {"query_successful": False, "sql_executed": sql},
                    }
                    all_results.append({"sql": sql, "error": err.msg})

                # Add model's function call and tool response to conversation
                messages.extend(
                    [
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
                    ]
                )

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
    chat_history.extend(
        [
            types.Content(role="user", parts=[types.Part(text=user_message)]),
            types.Content(role="model", parts=[types.Part(text=assistant_reply)]),
        ]
    )

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

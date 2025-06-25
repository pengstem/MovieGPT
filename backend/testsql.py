import os
from dotenv import load_dotenv
from google import genai
import pymysql

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


conn = pymysql.connect(
    host="127.0.0.1",  # 或者你的 docker network IP
    port=3306,
    user="root",
    password="rootpass",
    database="imdb",
    charset="utf8mb4",
)
with conn.cursor() as cur:
    # 1. 拿到所有表名
    cur.execute("SHOW TABLES;")
    tables = [row[0] for row in cur.fetchall()]

    # 2. 针对每张表查询列信息
    for tbl in tables:
        print(f"\n=== {tbl} ===")
        cur.execute(f"SHOW COLUMNS FROM `{tbl}`;")
        # 每行: (Field, Type, Null, Key, Default, Extra)
        for field, typ, null, key, default, extra in cur.fetchall():
            print(
                f"{field:20} {typ:20} NULL={null:3} KEY={key:3} DEF={
                    default!s:10} EXTRA={extra}"
            )
conn.close()

System_Prompt = """You are a seasoned SQL master and sophisticated data analyst,\
from now on, you will be connected to a MySQL database about movies and etc,
the structure will be given below, you will receive user's tasks and you will need to convert their need corresponding SQL commands,\
,which could be more than one,then this type of message will be sent to database to get data, \
and then you will receive the result and you can feel free to ask multirounds,\
by the way, you could also search the internet for more infomation,\
after everything you need is ready, you reply another type of reply,\
which goes back to the user,this reply should consist of the message of the database and the message you know and collect from the internet,\
remember when reply to the user, use the same language as the user's tasks"""

client = genai.Client(api_key=GEMINI_API_KEY)

from google import genai
import pymysql

conn = pymysql.connect(
    host="127.0.0.1",  # 或者你的 docker network IP
    port=3306,
    user="root",
    password="rootpass",
    charset="utf8mb4",
)
with conn.cursor() as cur:
    cur.execute("SHOW DATABASES;")
    for row in cur.fetchall():
        print(row)
conn.close()

client = genai.Client(api_key="")

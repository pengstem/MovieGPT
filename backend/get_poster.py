import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
OMDB_API_KEY = os.getenv("OMDB_API_KEY")


def get_poster(id: str):
    url = f"https://www.omdbapi.com/?i={id}&apikey={OMDB_API_KEY}"
    response = requests.get(url)
    text = response.text
    text = json.loads(text)
    print(text["Poster"])


if __name__ == "__main__":
    get_poster("tt1375666")

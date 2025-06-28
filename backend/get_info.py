import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
OMDB_API_KEY = os.getenv("OMDB_API_KEY")


def get_info(id: str):
    url = f"https://www.omdbapi.com/?i={id}&apikey={OMDB_API_KEY}&plot=full"
    response = requests.get(url)
    text = response.text
    text = json.loads(text)
    return text


if __name__ == "__main__":
    print(get_info("tt1375666"))

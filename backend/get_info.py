"""Helper for fetching movie details from OMDb with retry and caching."""

from __future__ import annotations

import json
import os
import time
from typing import Dict

import requests
from dotenv import load_dotenv

load_dotenv()
OMDB_API_KEY = os.getenv("OMDB_API_KEY")


_CACHE: Dict[str, dict] = {}


def _fetch_from_api(imdb_id: str, retries: int = 3) -> dict:
    """Fetch data from OMDb, retrying on failure."""
    url = f"https://www.omdbapi.com/?i={imdb_id}&apikey={OMDB_API_KEY}&plot=full"
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            # OMDb uses `Response":"False"` to indicate errors
            if data.get("Response", "True") == "False":
                raise ValueError(data.get("Error", "Unknown error"))
            return data
        except Exception:
            if attempt == retries - 1:
                raise
            # Exponential backoff
            time.sleep(2 ** attempt)


def get_info(imdb_id: str) -> dict:
    """Return movie info from cache or fetch from OMDb."""
    if imdb_id in _CACHE:
        return _CACHE[imdb_id]

    data = _fetch_from_api(imdb_id)
    _CACHE[imdb_id] = data
    return data


if __name__ == "__main__":
    print(get_info("tt1375666"))

"""FastAPI version of the MovieGPT backend."""

from __future__ import annotations

import json
import logging
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from Schema import chat, chat_history
from get_info import get_info


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/chat")
async def api_chat(payload: dict) -> JSONResponse:
    """Return a single assistant response."""
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="缺少message参数")

    logger.info("收到用户消息: %s", user_message)
    text, sql, data, results = chat(user_message)
    logger.info("AI回复: %s", text)

    return JSONResponse({"text": text, "sql": sql, "data": data, "results": results})


@app.post("/api/chat/stream")
async def api_chat_stream(payload: dict) -> StreamingResponse:
    """Stream tokens one by one in a Server-Sent Events format."""
    user_message = payload.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="缺少message参数")

    async def generator() -> AsyncGenerator[str, None]:
        text, sql, data, results = chat(user_message)
        for i, char in enumerate(text):
            chunk = json.dumps(
                {"token": char, "complete": i == len(text) - 1},
                ensure_ascii=False,
            )
            yield f"data: {chunk}\n\n"

        final = json.dumps({"complete": True, "text": text, "sql": sql, "data": data, "results": results}, ensure_ascii=False)
        yield f"data: {final}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generator(), media_type="text/plain")


@app.get("/api/history")
async def get_chat_history() -> JSONResponse:
    """Return stored conversation history."""
    history = []
    for content in chat_history:
        if hasattr(content, "role") and hasattr(content, "parts"):
            role = "user" if content.role == "user" else "assistant"
            text = content.parts[0].text if content.parts else ""
            history.append(
                {"id": f"{len(history)}", "type": role, "text": text, "timestamp": 0}
            )

    return JSONResponse({"history": history})


@app.post("/api/clear")
async def clear_history() -> JSONResponse:
    """Clear the conversation history."""
    chat_history.clear()
    return JSONResponse({"message": "历史记录已清除"})


@app.get("/api/info/{imdb_id}")
async def api_get_info(imdb_id: str) -> JSONResponse:
    """Fetch additional movie info from OMDb by IMDb ID."""
    data = get_info(imdb_id)
    return JSONResponse(data)


@app.get("/health")
async def health_check() -> JSONResponse:
    """Simple health check used by the frontend."""
    return JSONResponse({"status": "healthy", "service": "MovieGPT API"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("fastapi_backend:app", host="0.0.0.0", port=8000)

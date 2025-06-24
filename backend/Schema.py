# schemas.py
from typing import Literal
from pydantic import BaseModel, Field


class GeminiAnswer(BaseModel):
    """
    统一的模型输出：
      - kind = "sql"   → content 放 SQL 指令
      - kind = "reply" → content 放自然语言
    """

    kind: Literal["sql", "reply"] = Field(
        ..., description="sql: return SQL string; reply: return natural language"
    )
    content: str = Field(..., description="SQL statement or human-readable answer")

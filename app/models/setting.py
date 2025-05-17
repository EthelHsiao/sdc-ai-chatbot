# app/models/setting.py
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .session import Session

class Setting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="session.id")
    system_prompt: str = ""
    model: str = "llama2:7b"  # 預設模型
    temperature: float = 0.7
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    session: "Session" = Relationship(back_populates="settings")
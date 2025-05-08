# app/models/message.py
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .session import Session

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    role: str = Field(default="user")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: int = Field(foreign_key="session.id")
    session: "Session" = Relationship(back_populates="messages")
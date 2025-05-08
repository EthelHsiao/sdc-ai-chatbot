# app/models/session.py
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
import re
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .message import Message

class Session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, min_length=3, max_length=30)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    messages: List["Message"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"} #"delete-orphan" 表示當某個 Message 不再隸屬於任何 Session 時，自動刪除該 Message。
    )
    
    @classmethod
    def validate_title(cls, v):
        if len(v) < 3 or len(v) > 30:
            raise ValueError('標題長度必須在 3 到 30 個字符之間')
        if not re.match(r'^[A-Za-z0-9]+$', v):
            raise ValueError('標題只能包含英文字母和數字')
        return v
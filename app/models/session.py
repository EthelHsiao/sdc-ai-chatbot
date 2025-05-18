from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
import re

if TYPE_CHECKING:
    from .message import Message  # 避免循環引用錯誤

class Session(SQLModel, table=True):
    __tablename__ = "session"  # 明確定義資料表名稱

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(
        back_populates="session",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    @classmethod
    def validate_title(cls, v):
        if len(v) < 3 or len(v) > 30:
            raise ValueError("標題長度必須在 3 到 30 個字符之間")
        if not re.match(r'^[\u4e00-\u9fffA-Za-z0-9 _\-]+$', v):
            raise ValueError('標題只能包含中英文、數字、空格、底線與連字號')
        return v

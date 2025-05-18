from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SessionCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=30)

class SessionRead(SessionCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

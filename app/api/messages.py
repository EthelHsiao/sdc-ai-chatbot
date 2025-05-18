# app/api/messages.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.message import Message
from app.models.session import Session
from app.models.user import User
from app.core.auth import get_current_active_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/messages", tags=["messages"])
class MessageCreate(BaseModel):
    content: str
    session_id: int
    role: str = "user"

@router.post("/", response_model=Message, status_code=201)
def create_message(message: Message, db: DBSession = Depends(get_session),    current_user: User = Depends(get_current_active_user)):
    # 檢查 session 是否存在
    session = db.get(Session, message.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # 檢查會話是否屬於當前用戶
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    
    # # 創建新訊息
    # message = Message(
    #     content=message_data.content,
    #     session_id=message_data.session_id,
    #     role=message_data.role
    # )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/", response_model=List[Message])
def read_messages(session_id: int = Query(...), db: DBSession = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    # 檢查 session 是否存在
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # # 檢查會話是否屬於當前用戶
    # if session.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to access messages in this session")
    
    messages = db.exec(
        select(Message).where(Message.session_id == session_id).order_by(Message.id)
    ).all()
    return messages
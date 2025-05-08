# app/api/messages.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.message import Message
from app.models.session import Session
from typing import List

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/", response_model=Message, status_code=201)
def create_message(message: Message, db: DBSession = Depends(get_session)):
    # 檢查 session 是否存在
    session = db.get(Session, message.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/", response_model=List[Message])
def read_messages(session_id: int = Query(...), db: DBSession = Depends(get_session)):
    # 檢查 session 是否存在
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.exec(
        select(Message).where(Message.session_id == session_id).order_by(Message.id)
    ).all()
    return messages
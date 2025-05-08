# app/api/chat.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.session import Session
from app.models.message import Message
from app.services.ollama import generate
from typing import Optional, List, Dict
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]
    stream: bool = True
    session_id: Optional[int] = None

@router.post("/chat")
async def chat(request: ChatRequest, db: DBSession = Depends(get_session)):
    # 檢查 session_id 如果提供的話
    if request.session_id is not None:
        session = db.get(Session, request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # 從資料庫獲取先前的訊息
        prev_messages = db.exec(
            select(Message).where(Message.session_id == request.session_id).order_by(Message.id)
        ).all()
        
        # 將先前的訊息轉換為 Ollama 格式
        history = [{"role": msg.role, "content": msg.content} for msg in prev_messages]
        
        # 添加到當前訊息前面
        messages = history + request.messages
    else:
        messages = request.messages
    
    try:
        # 調用 Ollama 服務
        response = await generate(
            model=request.model,
            messages=messages,
            stream=request.stream
        )
        
        # 如果是 streaming 回應
        if request.stream:
            return StreamingResponse(
                content=response,
                media_type="application/x-ndjson"
            )
        
        # 否則返回 JSON 回應
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
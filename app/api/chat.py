# app/api/chat.py
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.session import Session
from app.models.message import Message
from app.models.setting import Setting
from app.models.user import User
from app.core.auth import get_current_active_user
from app.services.ollama import generate
from typing import Optional, List, Dict
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]
    stream: bool = False
    session_id: Optional[int] = None

@router.post("/chat")
async def chat(request: ChatRequest, db: DBSession = Depends(get_session),current_user: User = Depends(get_current_active_user)):
    # 檢查 session_id 如果提供的話
    if request.session_id is not None:
        session = db.get(Session, request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # 檢查會話是否屬於當前用戶
        if session.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this session")
        ## TEST prompt
        # 查詢是否有自定義設定
        setting = db.exec(
            select(Setting).where(Setting.session_id == request.session_id)
        ).first()
         
        # 初始化消息列表
        final_messages = []
        # 如果有設定且有system_prompt，添加到訊息列表前面
        if setting and setting.system_prompt:
            final_messages.append({"role": "system", "content": setting.system_prompt})
            
            temperature = setting.temperature 
            # 如果有設置model，使用設置的model替代請求中的model
            model_to_use = setting.model if setting.model else request.model
        else:
            model_to_use = request.model
        # 從資料庫獲取先前的訊息
        prev_messages = db.exec(
            select(Message).where(Message.session_id == request.session_id).order_by(Message.id)
        ).all()
        ##

       # 將先前的訊息添加到列表中
        final_messages.extend([{"role": msg.role, "content": msg.content} for msg in prev_messages])
        
    # 添加用戶當前的訊息（無論是否有session）
    final_messages.extend(request.messages)
    
    try:
        # 調用 Ollama 服務
        response = await generate(
            model=model_to_use,
            messages=final_messages,
            stream=request.stream,
            temperature=temperature
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
# app/api/sessions.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.user import User
from app.core.auth import get_current_active_user
from app.models.session import Session
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/sessions", tags=["sessions"])
class SessionCreate(BaseModel):
    title: str
@router.post("/", response_model=Session, status_code=201)
def create_session(session: Session, db: DBSession = Depends(get_session)):
    # 驗證標題
    try:
        Session.validate_title(session.title)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # # 創建新會話，關聯到當前用戶
    # session = Session(
    #     title=session_data.title,
    #     user_id=current_user.id
    # )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/", response_model=List[Session])
def read_sessions(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: DBSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    sessions = db.exec(
        select(Session)
        .where(Session.user_id == current_user.id)
        .offset(offset)
        .limit(limit)
        ).all()
    return sessions

@router.get("/{id}", response_model=Session)
def read_session(id: int, db: DBSession = Depends(get_session),current_user: User = Depends(get_current_active_user)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    # 檢查會話是否屬於當前用戶
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this session")
    return session

@router.put("/{id}", response_model=Session)
def update_session(id: int, session_data: Session, db: DBSession = Depends(get_session),current_user: User = Depends(get_current_active_user)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 檢查會話是否屬於當前用戶
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this session")
    # 驗證標題
    try:
        Session.validate_title(session_data.title)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    session.title = session_data.title
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.delete("/{id}", status_code=204)
def delete_session(id: int, db: DBSession = Depends(get_session), current_user: User = Depends(get_current_active_user)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 檢查會話是否屬於當前用戶
    if session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    db.delete(session)
    db.commit()
    return None
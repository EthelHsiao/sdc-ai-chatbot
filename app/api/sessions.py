# app/api/sessions.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.schemas.session import SessionCreate, SessionRead
from app.models.session import Session
from typing import List

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/", response_model=SessionRead, status_code=201)
def create_session(session_data: SessionCreate, db: DBSession = Depends(get_session)):
    # 驗證標題
    try:
        Session.validate_title(session_data.title)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    new_session = Session(title=session_data.title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/", response_model=List[Session])
def read_sessions(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: DBSession = Depends(get_session)
):
    sessions = db.exec(select(Session).offset(offset).limit(limit)).all()
    return sessions

@router.get("/{id}", response_model=Session)
def read_session(id: int, db: DBSession = Depends(get_session)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/{id}", response_model=Session)
def update_session(id: int, session_data: Session, db: DBSession = Depends(get_session)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
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
def delete_session(id: int, db: DBSession = Depends(get_session)):
    session = db.get(Session, id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return None
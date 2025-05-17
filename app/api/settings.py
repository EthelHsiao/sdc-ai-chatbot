# app/api/settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.setting import Setting
from app.models.session import Session
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["settings"])

class SettingCreate(BaseModel):
    session_id: int
    system_prompt: Optional[str] = ""
    model: Optional[str] = "llama2:7b"
    temperature: Optional[float] = 0.7

class SettingUpdate(BaseModel):
    system_prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None

@router.post("/", response_model=Setting, status_code=201)
def create_setting(setting: SettingCreate, db: DBSession = Depends(get_session)):
    # 檢查session是否存在
    session = db.get(Session, setting.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 檢查該session是否已有設定
    existing_setting = db.exec(
        select(Setting).where(Setting.session_id == setting.session_id)
    ).first()
    
    if existing_setting:
        raise HTTPException(status_code=400, detail="Setting already exists for this session")
    
    new_setting = Setting(
        session_id=setting.session_id,
        system_prompt=setting.system_prompt,
        model=setting.model,
        temperature=setting.temperature
    )
    
    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    return new_setting

@router.get("/{session_id}", response_model=Setting)
def read_setting(session_id: int, db: DBSession = Depends(get_session)):
    # 檢查session是否存在
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    setting = db.exec(
        select(Setting).where(Setting.session_id == session_id)
    ).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    return setting

@router.put("/{session_id}", response_model=Setting)
def update_setting(session_id: int, setting_update: SettingUpdate, db: DBSession = Depends(get_session)):
    # 檢查session是否存在
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    setting = db.exec(
        select(Setting).where(Setting.session_id == session_id)
    ).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    # 更新設定 (只更新提供的欄位)
    if setting_update.system_prompt is not None:
        setting.system_prompt = setting_update.system_prompt
    if setting_update.model is not None:
        setting.model = setting_update.model
    if setting_update.temperature is not None:
        setting.temperature = setting_update.temperature
    
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@router.delete("/{session_id}", status_code=204)
def delete_setting(session_id: int, db: DBSession = Depends(get_session)):
    # 檢查session是否存在
    session = db.get(Session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    setting = db.exec(
        select(Setting).where(Setting.session_id == session_id)
    ).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    return None
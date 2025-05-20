# app/core/auth.py
from fastapi import Depends, HTTPException, status, Cookie
from sqlmodel import Session as DBSession, select
from app.core.database import get_session
from app.models.user import User
from typing import Optional

# 移除 JWT 相關的代碼

async def get_current_user(
    db: DBSession = Depends(get_session),
    user_id: Optional[int] = Cookie(None)
):
    """從 cookie 獲取當前用戶"""
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
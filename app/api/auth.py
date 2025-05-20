from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from sqlmodel import Session as DBSession, select
from typing import Optional
from app.core.database import get_session
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["authentication"])

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

class Token(BaseModel):
    access_token: Optional[str] = None
    token_type: Optional[str] = None
    user_id: int
    username: str

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: DBSession = Depends(get_session)):
    # 檢查用戶名是否已存在
    existing_user = db.exec(select(User).where(User.username == user_data.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # 創建新用戶
    hashed_password = User.get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(
    user_data: UserLogin,
    db: DBSession = Depends(get_session),
    response: Response = None
):
    # 驗證用戶
    user = db.exec(select(User).where(User.username == user_data.username)).first()
    if not user or not User.verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # 設置 cookie
    response.set_cookie(
        key="user_id",
        value=str(user.id),
        httponly=True,
        max_age=60 * 60 * 24 * 7,  # 7天
    )
    
    return {
        "access_token": None,  # 不使用 JWT
        "token_type": None,
        "user_id": user.id,
        "username": user.username
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="user_id")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def read_users_me(db: DBSession = Depends(get_session), user_id: Optional[int] = Cookie(None)):
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
# app/main.py
from fastapi import FastAPI
from app.core.database import init_db
from app.api import sessions, messages, chat, settings
app = FastAPI(
    title="AI Web Chatbot",
    version="0.1.0",
    description="基於 FastAPI 的 AI 聊天機器人"
)

@app.on_event("startup")
def on_startup():
    init_db()

# 掛載路由
app.include_router(sessions.router)
app.include_router(messages.router)
app.include_router(chat.router)
app.include_router(settings.router)  # 新增settings路由

@app.get("/")
def read_root():
    return {"message": "歡迎使用 AI Web Chatbot"}
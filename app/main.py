# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.api import sessions, messages, chat

app = FastAPI(
    title="AI Web Chatbot",
    version="0.1.0",
    description="基於 FastAPI 的 AI 聊天機器人"
)

@app.on_event("startup")
def on_startup():
    init_db()

# 掛載路由
app.include_router(sessions.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

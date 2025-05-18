# app/models/__init__.py
from app.models.session import Session
from app.models.message import Message

# 解決循環引用
Session.model_rebuild()
Message.model_rebuild()

# app/models/__init__.py
from app.models.session import Session
from app.models.message import Message
from app.models.setting import Setting
from app.models.user import User

# 解決循環引用
User.model_rebuild()
Session.model_rebuild()
Message.model_rebuild()
Setting.model_rebuild()
// src/components/ChatView.js
import React, { useEffect, useState } from 'react';
import { getMessages } from '../api';
import MessageInput from './MessageInput';

const ChatView = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    if (!sessionId) return;
    //console.log("🔄 重新載入訊息 for session:", sessionId); // <-- 加這行看看有沒有觸發
    const data = await getMessages(sessionId);
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMessages();
  }, [sessionId]);

  return (
    <div>
      <h3>Chat</h3>
      {messages.length === 0 ? (
        <p>（尚無訊息）</p>
      ) : (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.role === 'user' ? '👤 你：' : '🤖 機器人：'}</strong>
              {msg.content}
            </li>
          ))}
        </ul>
      )}
      <MessageInput sessionId={sessionId} onMessageSent={loadMessages} />
    </div>
  );
};

export default ChatView;


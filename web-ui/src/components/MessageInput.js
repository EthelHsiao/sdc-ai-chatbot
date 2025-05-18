// src/components/MessageInput.js
import React, { useState, useEffect } from 'react';
import { sendMessage } from '../api';

const MessageInput = ({ sessionId, onMessageSent }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // 當 sessionId 改變時，清空輸入框
  useEffect(() => {
    setContent('');
  }, [sessionId]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await sendMessage(sessionId, content);
      setContent('');
      //console.log("✅ 訊息已送出，準備重新載入");
      onMessageSent(); // 通知 ChatView 重新載入訊息
    } catch (error) {
      console.error('發送失敗', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <textarea
        rows={3}
        style={{ width: '100%' }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="輸入訊息..."
      />
      <button onClick={handleSend} disabled={loading || !content.trim()}>
        {loading ? '發送中...' : '發送'}
      </button>
    </div>
  );
};

export default MessageInput;


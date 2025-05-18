// src/App.js
import React, { useState, useEffect } from 'react';
import SessionList from './components/SessionList';
import ChatView from './components/ChatView';
import MessageInput from './components/MessageInput';
import { getSessions, createSession } from './api';

function App() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const loadSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async () => {
    const newSession = await createSession();
    await loadSessions();
    setSelectedSessionId(newSession.id);
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <div style={{ width: '250px', marginRight: '20px' }}>
        <button onClick={handleCreateSession}>➕ 建立新 Session</button>
        <SessionList
          sessions={sessions}
          setSessions={setSessions}
          selectedSessionId={selectedSessionId}
          onSelect={setSelectedSessionId}
        />
      </div>
      <div style={{ flex: 1 }}>
        {selectedSessionId ? (
          <>
            <ChatView sessionId={selectedSessionId} />
          </>
        ) : (
          <p>請選擇一個 Session</p>
        )}
      </div>
    </div>
  );
}

export default App;

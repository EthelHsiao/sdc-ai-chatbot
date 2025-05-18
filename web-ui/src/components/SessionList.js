// src/components/SessionList.js
import React from 'react';
import { deleteSession, updateSessionTitle } from '../api';

const SessionList = ({ sessions, setSessions, selectedSessionId, onSelect }) => {
  const loadSessions = async () => {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    setSessions(data);
  };

  const handleDelete = async (id) => {
    await deleteSession(id);
    await loadSessions();
  };

  const handleTitleChange = async (id, currentTitle) => {
    const newTitle = prompt('輸入新的標題', currentTitle);
    if (newTitle) {
      await updateSessionTitle(id, newTitle);
      await loadSessions();
    }
  };

  return (
    <div>
      <h2>Sessions</h2>
      <ul>
        {sessions.map((session) => (
          <li
            key={session.id}
            style={{
              fontWeight: session.id === selectedSessionId ? 'bold' : 'normal',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
          >
            <span onClick={() => onSelect(session.id)}>
              {session.title || `Session ${session.id}`}
            </span>{' '}
            <button onClick={() => handleTitleChange(session.id, session.title)}>✏️</button>
            <button onClick={() => handleDelete(session.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;


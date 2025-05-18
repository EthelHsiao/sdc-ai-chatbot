// src/api.js
const BASE_URL = 'http://localhost:8000/api';

export async function getSessions() {
  const res = await fetch(`${BASE_URL}/sessions`);
  return res.json();
}

export async function getMessages(sessionId) {
  //console.log("📡 向後端請求 messages，sessionId:", sessionId);
  const res = await fetch(`${BASE_URL}/messages?session_id=${sessionId}`);
  if (!res.ok) throw new Error('無法取得訊息');
  return await res.json();
}

export async function sendMessage(sessionId, content) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'user', content, session_id: sessionId }),
  });
  if (!res.ok)  throw new Error('發送訊息失敗');
  return await res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('刪除失敗');
  window.location.reload();
}

export async function updateSessionTitle(sessionId, newTitle) {
  await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle }),
  });
  window.location.reload();
}

// src/api.js

export async function createSession(existingCount) {
  //const title = `Session ${existingCount + 1}`;
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: "New Session" }),
  });

  if (!res.ok) throw new Error('創建 Session 失敗');
  return await res.json();
}

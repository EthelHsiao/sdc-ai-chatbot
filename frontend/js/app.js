// app.js - 完整版

// 全局變數
let currentSessionId = null;
let currentSessionTitle = null;
let userData = null;
let sessions = [];
let isNewSession = false;
let currentSessionSettings = {
    systemPrompt: "",
    model: "llama2:7b",
    temperature: 0.7
};

// API Base URL - 修改這裡以匹配你的後端 API 位置
const API_BASE_URL = '';  // 空字串表示與前端同源，即使用相對路徑

// 頁面載入後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查是否已登入
    checkLoginStatus();
    
    // 標籤切換
    document.getElementById('login-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('block');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-tab').classList.add('text-blue-500', 'font-semibold', 'border-b-2', 'border-blue-500');
        document.getElementById('login-tab').classList.remove('text-gray-500');
        document.getElementById('register-tab').classList.remove('text-blue-500', 'font-semibold', 'border-b-2', 'border-blue-500');
        document.getElementById('register-tab').classList.add('text-gray-500');
    });
    
    document.getElementById('register-tab').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('block');
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-tab').classList.add('text-blue-500', 'font-semibold', 'border-b-2', 'border-blue-500');
        document.getElementById('register-tab').classList.remove('text-gray-500');
        document.getElementById('login-tab').classList.remove('text-blue-500', 'font-semibold', 'border-b-2', 'border-blue-500');
        document.getElementById('login-tab').classList.add('text-gray-500');
    });
    
    // 登入按鈕
    document.getElementById('login-button').addEventListener('click', function() {
        login();
    });
    
    // 註冊按鈕
    document.getElementById('register-button').addEventListener('click', function() {
        register();
    });

    // 登出按鈕
    document.getElementById('logout-button').addEventListener('click', function() {
        logout();
    });

    // 新增對話按鈕
    document.getElementById('new-chat-button').addEventListener('click', function() {
        document.getElementById('new-session-modal').classList.remove('hidden');
    });

    // 取消新增對話
    document.getElementById('cancel-new-session').addEventListener('click', function() {
        document.getElementById('new-session-modal').classList.add('hidden');
        document.getElementById('new-session-title').value = '';
        document.getElementById('new-session-error').classList.add('hidden');
    });

    // 創建新對話
    document.getElementById('create-new-session').addEventListener('click', function() {
        createNewSession();
    });

    // 會話設置按鈕
    document.getElementById('session-settings-button').addEventListener('click', function() {
        openSessionSettings();
    });

    // 取消設置
    document.getElementById('cancel-settings').addEventListener('click', function() {
        document.getElementById('session-settings-modal').classList.add('hidden');
    });

    // 儲存設置
    document.getElementById('save-settings').addEventListener('click', function() {
        saveSessionSettings();
    });

    // 溫度滑塊
    document.getElementById('temperature-slider').addEventListener('input', function() {
        document.getElementById('temperature-value').textContent = this.value;
    });

    // 刪除會話按鈕
    document.getElementById('session-delete-button').addEventListener('click', function() {
        if (confirm('確定要刪除這個對話嗎？此操作無法復原。')) {
            deleteCurrentSession();
        }
    });

    // 發送訊息
    document.getElementById('send-button').addEventListener('click', function() {
        sendMessage();
    });

    // 輸入框按 Enter 發送訊息
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 搜尋會話
    document.getElementById('session-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterSessions(searchTerm);
    });
});

// 檢查登入狀態
function checkLoginStatus() {
    // 檢查是否有儲存的使用者資料
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
        try {
            userData = JSON.parse(storedUserData);
            showMainApp();
            loadSessions();
        } catch (error) {
            console.error('無法解析使用者資料', error);
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
}

// 顯示登入畫面
function showLoginScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

// 顯示主應用畫面
function showMainApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
    document.getElementById('current-username').textContent = userData.username;
}

// 登入
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        document.getElementById('login-error').textContent = '請填寫所有欄位';
        document.getElementById('login-error').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('登入失敗');
        }
        
        const data = await response.json();
        userData = {
            id: data.user_id,
            username: data.username
        };
        
        // 儲存使用者資料
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showMainApp();
        loadSessions();
    } catch (error) {
        console.error('登入錯誤', error);
        document.getElementById('login-error').textContent = '登入失敗，請檢查用戶名和密碼';
        document.getElementById('login-error').classList.remove('hidden');
    }
}

// 註冊
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    
    if (!username || !password) {
        document.getElementById('register-error').textContent = '請填寫所有欄位';
        document.getElementById('register-error').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '註冊失敗');
        }
        
        // 註冊成功，自動切換到登入頁面
        document.getElementById('login-tab').click();
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').value = password;
        alert('註冊成功，請登入');
    } catch (error) {
        console.error('註冊錯誤', error);
        document.getElementById('register-error').textContent = error.message || '註冊失敗，請嘗試其他用戶名';
        document.getElementById('register-error').classList.remove('hidden');
    }
}

// 登出
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        // 清除本地存儲
        localStorage.removeItem('userData');
        userData = null;
        
        // 回到登入畫面
        showLoginScreen();
    } catch (error) {
        console.error('登出錯誤', error);
        alert('登出失敗，請重試');
    }
}

// 加載會話列表
async function loadSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('無法載入會話列表');
        }
        
        sessions = await response.json();
        renderSessionsList();
    } catch (error) {
        console.error('載入會話錯誤', error);
    }
}

// 渲染會話列表
function renderSessionsList() {
    const sessionsListElement = document.getElementById('sessions-list');
    sessionsListElement.innerHTML = '';
    
    if (sessions.length === 0) {
        sessionsListElement.innerHTML = '<div class="text-center text-gray-500 py-4">沒有對話，點擊 + 創建</div>';
        return;
    }
    
    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = `p-2 hover:bg-gray-100 rounded-md cursor-pointer flex justify-between items-center ${currentSessionId === session.id ? 'bg-blue-50' : ''}`;
        sessionElement.innerHTML = `
            <div class="truncate">${session.title}</div>
        `;
        sessionElement.addEventListener('click', () => {
            loadSession(session.id);
        });
        sessionsListElement.appendChild(sessionElement);
    });
}

// 過濾會話列表
function filterSessions(searchTerm) {
    const sessionsListElement = document.getElementById('sessions-list');
    sessionsListElement.innerHTML = '';
    
    const filteredSessions = sessions.filter(session => 
        session.title.toLowerCase().includes(searchTerm)
    );
    
    if (filteredSessions.length === 0) {
        sessionsListElement.innerHTML = '<div class="text-center text-gray-500 py-4">沒有匹配的對話</div>';
        return;
    }
    
    filteredSessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = `p-2 hover:bg-gray-100 rounded-md cursor-pointer flex justify-between items-center ${currentSessionId === session.id ? 'bg-blue-50' : ''}`;
        sessionElement.innerHTML = `
            <div class="truncate">${session.title}</div>
        `;
        sessionElement.addEventListener('click', () => {
            loadSession(session.id);
        });
        sessionsListElement.appendChild(sessionElement);
    });
}

// 載入特定會話
async function loadSession(sessionId) {
    try {
        // 獲取會話資訊
        const sessionResponse = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
            credentials: 'include'
        });
        
        if (!sessionResponse.ok) {
            throw new Error('無法載入會話');
        }
        
        const session = await sessionResponse.json();
        currentSessionId = session.id;
        currentSessionTitle = session.title;
        
        // 更新 UI
        document.getElementById('current-session-title').textContent = session.title;
        document.getElementById('session-settings-button').classList.remove('hidden');
        document.getElementById('session-delete-button').classList.remove('hidden');
        document.getElementById('message-input').disabled = false;
        document.getElementById('send-button').disabled = false;
        
        // 獲取會話設定
        try {
            const settingsResponse = await fetch(`${API_BASE_URL}/settings/${sessionId}`, {
                credentials: 'include'
            });
            
            if (settingsResponse.ok) {
                const settings = await settingsResponse.json();
                currentSessionSettings = {
                    systemPrompt: settings.system_prompt || "",
                    model: settings.model || "llama2:7b",
                    temperature: settings.temperature || 0.7
                };
            } else {
                // 如果沒有找到設定，創建默認設定
                currentSessionSettings = {
                    systemPrompt: "",
                    model: "llama2:7b",
                    temperature: 0.7
                };
                await createSessionSettings();
            }
        } catch (error) {
            console.error('載入會話設定錯誤', error);
            // 使用默認設定
            currentSessionSettings = {
                systemPrompt: "",
                model: "llama2:7b",
                temperature: 0.7
            };
        }
        
        // 獲取會話訊息
        const messagesResponse = await fetch(`${API_BASE_URL}/messages/?session_id=${sessionId}`, {
            credentials: 'include'
        });
        
        if (!messagesResponse.ok) {
            throw new Error('無法載入訊息');
        }
        
        const messages = await messagesResponse.json();
        
        // 顯示訊息
        renderMessages(messages);
        
        // 更新會話列表高亮
        renderSessionsList();
    } catch (error) {
        console.error('載入會話錯誤', error);
        alert('載入會話失敗，請重試');
    }
}

// 渲染訊息
function renderMessages(messages) {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = '';
    
    if (messages.length === 0) {
        chatContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <p class="text-lg">開始新對話吧！</p>
            </div>
        `;
        return;
    }
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = message.role === 'user' ? 'user-message self-end' : 'bot-message self-start';
        
        // 處理換行
        const formattedContent = message.content.replace(/\n/g, '<br>');
        messageElement.innerHTML = formattedContent;
        
        chatContainer.appendChild(messageElement);
    });
    
    // 滾動到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 發送訊息
async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();
    
    if (!content || !currentSessionId) return;
    
    messageInput.value = '';
    messageInput.disabled = true;
    document.getElementById('send-button').disabled = true;
    
    try {
        // 顯示使用者訊息
        addMessage('user', content);
        
        // 儲存使用者訊息到資料庫
        const messageResponse = await fetch(`${API_BASE_URL}/messages/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                session_id: currentSessionId,
                role: 'user'
            }),
            credentials: 'include'
        });
        
        if (!messageResponse.ok) {
            throw new Error('無法儲存訊息');
        }
        
        // 顯示 AI 正在生成訊息的指示
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'bot-message self-start';
        loadingMessage.innerHTML = '<span class="loading-dots">AI 正在思考中</span>';
        loadingMessage.id = 'ai-loading-message';
        document.getElementById('chat-container').appendChild(loadingMessage);
        
        // 滾動到底部
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 向 AI 發送請求
        const chatResponse = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: currentSessionSettings.model,
                messages: [{ role: 'user', content }],
                stream: false,
                session_id: currentSessionId
            }),
            credentials: 'include'
        });
        
        if (!chatResponse.ok) {
            throw new Error('AI 回應失敗');
        }
        
        const aiResponse = await chatResponse.json();
        
        // 移除加載訊息
        document.getElementById('ai-loading-message').remove();
        
        // 顯示 AI 回應
        const aiContent = aiResponse.message.content;
        addMessage('assistant', aiContent);
        
        // 儲存 AI 回應到資料庫
        await fetch(`${API_BASE_URL}/messages/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: aiContent,
                session_id: currentSessionId,
                role: 'assistant'
            }),
            credentials: 'include'
        });
    } catch (error) {
        console.error('發送訊息錯誤', error);
        alert('發送訊息失敗，請重試');
        
        // 移除加載訊息如果存在
        const loadingMessage = document.getElementById('ai-loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    } finally {
        messageInput.disabled = false;
        document.getElementById('send-button').disabled = false;
        messageInput.focus();
    }
}

// 添加訊息到聊天視窗
function addMessage(role, content) {
    const chatContainer = document.getElementById('chat-container');
    
    // 如果是第一條訊息，清空歡迎訊息
    if (chatContainer.children.length === 1 && chatContainer.children[0].classList.contains('flex')) {
        chatContainer.innerHTML = '';
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = role === 'user' ? 'user-message self-end' : 'bot-message self-start';
    
    // 處理換行
    const formattedContent = content.replace(/\n/g, '<br>');
    messageElement.innerHTML = formattedContent;
    
    chatContainer.appendChild(messageElement);
    
    // 滾動到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 創建新會話
async function createNewSession() {
    const titleInput = document.getElementById('new-session-title');
    const title = titleInput.value.trim();
    
    // 驗證標題
    if (!title || title.length < 3 || title.length > 30 || !/^[A-Za-z0-9]+$/.test(title)) {
        document.getElementById('new-session-error').textContent = '標題必須是 3-30 個字符，只允許英文字母和數字';
        document.getElementById('new-session-error').classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                user_id: userData.id
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '創建會話失敗');
        }
        
        const newSession = await response.json();
        
        // 添加到會話列表
        sessions.push(newSession);
        
        // 隱藏新建會話視窗
        document.getElementById('new-session-modal').classList.add('hidden');
        titleInput.value = '';
        
        // 載入新會話
        isNewSession = true;
        await loadSession(newSession.id);
        
        // 創建默認設定
        await createSessionSettings();
        
        isNewSession = false;
    } catch (error) {
        console.error('創建會話錯誤', error);
        document.getElementById('new-session-error').textContent = error.message || '創建會話失敗，請重試';
        document.getElementById('new-session-error').classList.remove('hidden');
    }
}

// 創建會話設定
async function createSessionSettings() {
    if (!currentSessionId) return;
    
    try {
        await fetch(`${API_BASE_URL}/settings/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: currentSessionId,
                system_prompt: currentSessionSettings.systemPrompt,
                model: currentSessionSettings.model,
                temperature: currentSessionSettings.temperature
            }),
            credentials: 'include'
        });
    } catch (error) {
        console.error('創建會話設定錯誤', error);
    }
}

// 打開會話設置
async function openSessionSettings() {
    if (!currentSessionId) return;
    
    document.getElementById('edit-session-title').value = currentSessionTitle;
    document.getElementById('system-prompt').value = currentSessionSettings.systemPrompt;
    document.getElementById('model-select').value = currentSessionSettings.model;
    document.getElementById('temperature-slider').value = currentSessionSettings.temperature;
    document.getElementById('temperature-value').textContent = currentSessionSettings.temperature;
    
    document.getElementById('session-settings-modal').classList.remove('hidden');
}

// 保存會話設置
async function saveSessionSettings() {
    if (!currentSessionId) return;
    
    const title = document.getElementById('edit-session-title').value.trim();
    const systemPrompt = document.getElementById('system-prompt').value.trim();
    const model = document.getElementById('model-select').value;
    const temperature = parseFloat(document.getElementById('temperature-slider').value);
    
    // 驗證標題
    if (!title || title.length < 3 || title.length > 30 || !/^[A-Za-z0-9]+$/.test(title)) {
        document.getElementById('settings-error').textContent = '標題必須是 3-30 個字符，只允許英文字母和數字';
        document.getElementById('settings-error').classList.remove('hidden');
        return;
    }
    
    try {
        // 更新會話標題
        if (title !== currentSessionTitle) {
            const sessionResponse = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    user_id: userData.id
                }),
                credentials: 'include'
            });
            
            if (!sessionResponse.ok) {
                throw new Error('更新會話標題失敗');
            }
            
            currentSessionTitle = title;
            document.getElementById('current-session-title').textContent = title;
            
            // 更新會話列表
            const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex !== -1) {
                sessions[sessionIndex].title = title;
                renderSessionsList();
            }
        }
        
        // 更新會話設置
        const settingsResponse = await fetch(`${API_BASE_URL}/settings/${currentSessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_prompt: systemPrompt,
                model: model,
                temperature: temperature
            }),
            credentials: 'include'
        });
        
        if (!settingsResponse.ok) {
            throw new Error('更新會話設置失敗');
        }
        
        // 更新當前設定
        currentSessionSettings = {
            systemPrompt: systemPrompt,
            model: model,
            temperature: temperature
        };
        
        // 隱藏設置視窗
        document.getElementById('session-settings-modal').classList.add('hidden');
        document.getElementById('settings-error').classList.add('hidden');
    } catch (error) {
        console.error('保存設置錯誤', error);
        document.getElementById('settings-error').textContent = error.message || '保存設置失敗，請重試';
        document.getElementById('settings-error').classList.remove('hidden');
    }
}

// 刪除當前會話
async function deleteCurrentSession() {
    if (!currentSessionId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/sessions/${currentSessionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('刪除會話失敗');
        }
        
        // 從會話列表移除
        const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex !== -1) {
            sessions.splice(sessionIndex, 1);
        }
        
        // 重置當前會話
        currentSessionId = null;
        currentSessionTitle = null;
        
        // 更新 UI
        document.getElementById('current-session-title').textContent = '選擇或創建一個對話';
        document.getElementById('session-settings-button').classList.add('hidden');
        document.getElementById('session-delete-button').classList.add('hidden');
        document.getElementById('message-input').disabled = true;
        document.getElementById('send-button').disabled = true;
        
        // 清空聊天區域
        document.getElementById('chat-container').innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p class="text-lg">選擇左側對話或創建新對話</p>
            </div>
        `;
        
        // 更新會話列表
        renderSessionsList();
    } catch (error) {
        console.error('刪除會話錯誤', error);
        alert('刪除會話失敗，請重試');
    }
}
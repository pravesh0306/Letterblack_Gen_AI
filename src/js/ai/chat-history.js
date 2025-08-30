// chat-history.js
// Handles Chat History tab logic

document.addEventListener('DOMContentLoaded', function() {
    const chatSessionsContainer = document.querySelector('.chat-sessions-container');
    const clearBtn = document.getElementById('clear-history-btn');
    const exportBtn = document.getElementById('export-all-history-btn');
    const newSessionBtn = document.getElementById('start-new-session-btn');

    function getChatHistory() {
        try {
            return JSON.parse(localStorage.getItem('ae_chat_history') || '[]');
        } catch { return []; }
    }
    function renderChatHistory() {
        if (!chatSessionsContainer) return;
        const history = getChatHistory();
        if (history.length === 0) {
            chatSessionsContainer.innerHTML = '<p>No chat sessions found.</p>';
            return;
        }
        chatSessionsContainer.innerHTML = history.map((session, i) =>
            `<div class="chat-session-item"><strong>Session ${i+1}</strong><pre>${session.text}</pre><span>${session.date}</span></div>`
        ).join('');
    }
    if (clearBtn) clearBtn.onclick = function() {
        localStorage.removeItem('ae_chat_history');
        renderChatHistory();
    };
    if (exportBtn) exportBtn.onclick = function() {
        const history = getChatHistory();
        const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat_history.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    if (newSessionBtn) newSessionBtn.onclick = function() {
        const history = getChatHistory();
        history.push({text: '', date: new Date().toLocaleString()});
        localStorage.setItem('ae_chat_history', JSON.stringify(history));
        renderChatHistory();
    };
    renderChatHistory();
});

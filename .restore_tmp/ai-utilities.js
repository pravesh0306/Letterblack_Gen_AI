/**
 * AI Utilities - Consolidated AI Micro-Modules
 * Combines: ai-training-data-collector.js, enhanced-ai-learning-system.js,
 *           smart-ai-suggestion-engine.js, chat-history.js
 */

// ===== SMART AI SUGGESTION ENGINE =====
class SmartAISuggestionEngine {
    static init(container) {
        if (container) {
            container.innerHTML = '<div class="module-status">Saved Scripts Module Loaded.<br>Access your saved scripts and suggestions here.</div>';
        }
    }
}
window.SmartAISuggestionEngine = SmartAISuggestionEngine;

// ===== AI TRAINING DATA COLLECTOR =====
// Placeholder for future AI training data collection functionality
class AITrainingDataCollector {
    static collect(data) {
        // Future implementation for collecting AI training data
        console.log('AI Training Data Collector: Ready for implementation');
    }
}
window.AITrainingDataCollector = AITrainingDataCollector;

// ===== ENHANCED AI LEARNING SYSTEM =====
// Placeholder for future enhanced AI learning functionality
class EnhancedAILearningSystem {
    static learn(inputs) {
        // Future implementation for enhanced AI learning
        console.log('Enhanced AI Learning System: Ready for implementation');
    }
}
window.EnhancedAILearningSystem = EnhancedAILearningSystem;

// ===== CHAT HISTORY MANAGER =====
class ChatHistoryManager {
    static init() {
        document.addEventListener('DOMContentLoaded', () => {
            const chatSessionsContainer = document.querySelector('.chat-sessions-container');
            const clearBtn = document.getElementById('clear-history-btn');
            const exportBtn = document.getElementById('export-all-history-btn');
            const newSessionBtn = document.getElementById('start-new-session-btn');

            function getChatHistory() {
                try {
                    return JSON.parse(localStorage.getItem('ae_chat_history') || '[]');
                } catch {
                    return [];
                }
            }

            function renderChatHistory() {
                if (!chatSessionsContainer) {return;}
                const history = getChatHistory();
                if (history.length === 0) {
                    chatSessionsContainer.innerHTML = '<p>No chat sessions found.</p>';
                    return;
                }
                chatSessionsContainer.innerHTML = history.map((session, i) =>
                    `<div class="chat-session-item">
                        <strong>Session ${i+1}</strong>
                        <pre>${session.text}</pre>
                        <span>${session.date}</span>
                    </div>`
                ).join('');
            }

            if (clearBtn) {
                clearBtn.onclick = function() {
                    if (confirm('Clear all chat history?')) {
                        localStorage.removeItem('ae_chat_history');
                        renderChatHistory();
                    }
                };
            }

            if (exportBtn) {
                exportBtn.onclick = function() {
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
            }

            if (newSessionBtn) {
                newSessionBtn.onclick = function() {
                    const history = getChatHistory();
                    history.push({
                        text: '',
                        date: new Date().toLocaleString()
                    });
                    localStorage.setItem('ae_chat_history', JSON.stringify(history));
                    renderChatHistory();
                };
            }

            renderChatHistory();
        });
    }

    static getChatHistory() {
        try {
            return JSON.parse(localStorage.getItem('ae_chat_history') || '[]');
        } catch {
            return [];
        }
    }

    static addChatSession(text) {
        const history = this.getChatHistory();
        history.push({
            text,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('ae_chat_history', JSON.stringify(history));
    }

    static clearHistory() {
        localStorage.removeItem('ae_chat_history');
    }

    static exportHistory() {
        const history = this.getChatHistory();
        const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
        return URL.createObjectURL(blob);
    }
}

window.ChatHistoryManager = ChatHistoryManager;

// Auto-initialize chat history functionality
ChatHistoryManager.init();

console.log('✅ AI Utilities module loaded (consolidated from 4 micro-modules)');


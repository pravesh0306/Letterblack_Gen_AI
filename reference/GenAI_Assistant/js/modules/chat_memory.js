// Chat Memory Module
// Stores and retrieves chat history for context-aware assistant responses

(function(){
    const CHAT_HISTORY_KEY = 'ae_assistant_chat_history';

    class ChatMemory {
        constructor() {
            // no-op
        }

        addMessage(type, message) {
            try {
                const history = this.getHistory();
                history.push({ 
                    type: type,
                    text: message, 
                    timestamp: new Date().toISOString() 
                });
                
                // Limit history to prevent localStorage overflow
                if (history.length > 100) {
                    history.splice(0, history.length - 100);
                }
                
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
            } catch (error) {
                console.error('ChatMemory.addMessage error:', error);
            }
        }

        getHistory() {
            try {
                const raw = localStorage.getItem(CHAT_HISTORY_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (error) {
                console.error('ChatMemory.getHistory error:', error);
                return [];
            }
        }

        clearHistory() {
            try {
                localStorage.removeItem(CHAT_HISTORY_KEY);
            } catch (error) {
                console.error('ChatMemory.clearHistory error:', error);
            }
        }
    }

    // Expose globally for ModuleLoader and main.js
    window.ChatMemory = ChatMemory;
})();

// Chat Memory Module
// Stores and retrieves chat history for context-aware assistant responses
// Now with file-based persistence and localStorage backup

(function(){
    const CHAT_HISTORY_KEY = 'ae_assistant_chat_history';
    const CHAT_FOLDER = 'conversation_history'; // Folder to store chat sessions

    class ChatMemory {
        constructor() {
            this.maxHistorySize = 100;
            this.contextWindowSize = 10; // Number of recent messages to include in context
            this.currentSessionId = this.generateSessionId();
            this.saveToFiles = true; // Enable file saving
            
            // Initialize conversation folder if running in After Effects
            if (window.CSInterface) {
                this.initializeConversationFolder();
            }
        }

        generateSessionId() {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
            return `chat_${dateStr}_${timeStr}`;
        }

        initializeConversationFolder() {
            try {
                if (window.CSInterface) {
                    const cs = new CSInterface();
                    const extensionPath = cs.getSystemPath('extension');
                    this.conversationFolderPath = `${extensionPath}/${CHAT_FOLDER}`;
                    
                    // Create folder if it doesn't exist
                    cs.evalScript(`
                        var folder = new Folder('${this.conversationFolderPath}');
                        if (!folder.exists) {
                            folder.create();
                        }
                        'Conversation folder initialized';
                    `, (result) => {
                        console.log('💬 Chat folder initialized:', this.conversationFolderPath);
                    });
                }
            } catch (error) {
                console.warn('Failed to initialize conversation folder:', error);
                this.saveToFiles = false;
            }
        }

        static init(container) {
            if (container) {
                container.innerHTML = '<div style="padding:16px;color:#fff;">Chat History Module Loaded.<br>View and manage your chat sessions here.</div>';
            }
        }

        addMessage(type, message) {
            try {
                const history = this.getHistory();
                const messageObj = { 
                    type: type,
                    text: typeof message === 'string' ? message : message.toString(), 
                    timestamp: new Date().toISOString(),
                    id: Date.now() + Math.random(), // Simple unique ID
                    sessionId: this.currentSessionId
                };
                
                history.push(messageObj);
                
                // Limit history to prevent localStorage overflow
                if (history.length > this.maxHistorySize) {
                    history.splice(0, history.length - this.maxHistorySize);
                }
                
                // Save to localStorage (immediate backup)
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
                
                // Save to file if enabled
                if (this.saveToFiles) {
                    this.saveConversationToFile(messageObj);
                }
                
            } catch (error) {
                console.error('ChatMemory.addMessage error:', error);
            }
        }

        saveConversationToFile(messageObj) {
            try {
                if (!window.CSInterface || !this.conversationFolderPath) return;
                
                const cs = new CSInterface();
                const fileName = `${this.currentSessionId}.json`;
                const filePath = `${this.conversationFolderPath}/${fileName}`;
                
                // Read existing session data or create new
                cs.evalScript(`
                    var file = new File('${filePath}');
                    var sessionData = { messages: [], sessionInfo: {} };
                    
                    if (file.exists) {
                        file.open('r');
                        try {
                            sessionData = JSON.parse(file.read());
                        } catch (e) {
                            sessionData = { messages: [], sessionInfo: {} };
                        }
                        file.close();
                    }
                    
                    // Add new message
                    sessionData.messages.push(${JSON.stringify(messageObj)});
                    sessionData.sessionInfo = {
                        sessionId: '${this.currentSessionId}',
                        lastUpdated: '${new Date().toISOString()}',
                        messageCount: sessionData.messages.length
                    };
                    
                    // Save back to file
                    file.open('w');
                    file.write(JSON.stringify(sessionData, null, 2));
                    file.close();
                    
                    'Message saved to file';
                `, (result) => {
                    if (result !== 'Message saved to file') {
                        console.warn('Failed to save message to file:', result);
                    }
                });
                
            } catch (error) {
                console.error('Failed to save conversation to file:', error);
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

        getRecentHistory(limit = null) {
            try {
                const history = this.getHistory();
                const contextLimit = limit || this.contextWindowSize;
                return history.slice(-contextLimit);
            } catch (error) {
                console.error('ChatMemory.getRecentHistory error:', error);
                return [];
            }
        }

        getContextString(limit = 6) {
            try {
                const recentHistory = this.getRecentHistory(limit);
                if (recentHistory.length === 0) return '';

                let contextString = '\n=== CONVERSATION CONTEXT ===\n';
                recentHistory.forEach((msg, index) => {
                    const speaker = msg.type === 'user' ? 'USER' : 'ASSISTANT';
                    const text = msg.text.substring(0, 300) + (msg.text.length > 300 ? '...' : '');
                    contextString += `${speaker}: ${text}\n`;
                });
                contextString += '=== END CONTEXT ===\n\n';
                
                return contextString;
            } catch (error) {
                console.error('ChatMemory.getContextString error:', error);
                return '';
            }
        }

        // Get messages related to a specific topic
        getTopicHistory(topic, maxResults = 10) {
            try {
                const history = this.getHistory();
                const topicLower = topic.toLowerCase();
                
                const relevantMessages = history.filter(msg => 
                    msg.text.toLowerCase().includes(topicLower)
                ).slice(-maxResults);
                
                return relevantMessages;
            } catch (error) {
                console.error('ChatMemory.getTopicHistory error:', error);
                return [];
            }
        }

        // Clear old messages but keep recent ones
        trimHistory(keepRecentCount = 50) {
            try {
                const history = this.getHistory();
                if (history.length > keepRecentCount) {
                    const recentHistory = history.slice(-keepRecentCount);
                    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(recentHistory));
                }
            } catch (error) {
                console.error('ChatMemory.trimHistory error:', error);
            }
        }

        // Start a new conversation session
        startNewSession() {
            this.currentSessionId = this.generateSessionId();
            console.log('📝 Started new chat session:', this.currentSessionId);
        }

        // Get all available conversation sessions
        getAvailableSessions() {
            return new Promise((resolve) => {
                if (!window.CSInterface || !this.conversationFolderPath) {
                    resolve([]);
                    return;
                }
                
                const cs = new CSInterface();
                cs.evalScript(`
                    var folder = new Folder('${this.conversationFolderPath}');
                    var sessions = [];
                    
                    if (folder.exists) {
                        var files = folder.getFiles('*.json');
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            file.open('r');
                            try {
                                var data = JSON.parse(file.read());
                                sessions.push({
                                    sessionId: data.sessionInfo.sessionId,
                                    lastUpdated: data.sessionInfo.lastUpdated,
                                    messageCount: data.sessionInfo.messageCount,
                                    fileName: file.name
                                });
                            } catch (e) {
                                // Skip corrupted files
                            }
                            file.close();
                        }
                    }
                    
                    JSON.stringify(sessions);
                `, (result) => {
                    try {
                        const sessions = JSON.parse(result);
                        resolve(sessions.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)));
                    } catch (error) {
                        console.error('Error parsing sessions:', error);
                        resolve([]);
                    }
                });
            });
        }

        // Load a specific conversation session
        loadSession(sessionId) {
            return new Promise((resolve) => {
                if (!window.CSInterface || !this.conversationFolderPath) {
                    resolve(null);
                    return;
                }
                
                const cs = new CSInterface();
                const fileName = `${sessionId}.json`;
                const filePath = `${this.conversationFolderPath}/${fileName}`;
                
                cs.evalScript(`
                    var file = new File('${filePath}');
                    if (file.exists) {
                        file.open('r');
                        var data = file.read();
                        file.close();
                        data;
                    } else {
                        'null';
                    }
                `, (result) => {
                    try {
                        if (result === 'null') {
                            resolve(null);
                        } else {
                            const sessionData = JSON.parse(result);
                            resolve(sessionData);
                        }
                    } catch (error) {
                        console.error('Error loading session:', error);
                        resolve(null);
                    }
                });
            });
        }

        // Export conversation history
        exportConversationHistory() {
            return new Promise(async (resolve) => {
                try {
                    const sessions = await this.getAvailableSessions();
                    const exportData = {
                        exportDate: new Date().toISOString(),
                        totalSessions: sessions.length,
                        sessions: []
                    };
                    
                    for (const session of sessions) {
                        const sessionData = await this.loadSession(session.sessionId);
                        if (sessionData) {
                            exportData.sessions.push(sessionData);
                        }
                    }
                    
                    // Also include current localStorage data
                    exportData.currentLocalStorage = this.getHistory();
                    
                    resolve(exportData);
                } catch (error) {
                    console.error('Error exporting conversation history:', error);
                    resolve(null);
                }
            });
        }

        // Get conversation statistics
        getConversationStats() {
            return new Promise(async (resolve) => {
                try {
                    const sessions = await this.getAvailableSessions();
                    const currentHistory = this.getHistory();
                    
                    const stats = {
                        totalSessions: sessions.length,
                        currentSessionMessages: currentHistory.length,
                        totalMessagesInFiles: sessions.reduce((total, session) => total + session.messageCount, 0),
                        oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].lastUpdated : null,
                        newestSession: sessions.length > 0 ? sessions[0].lastUpdated : null,
                        currentSessionId: this.currentSessionId,
                        storageLocation: this.conversationFolderPath || 'localStorage only'
                    };
                    
                    resolve(stats);
                } catch (error) {
                    console.error('Error getting conversation stats:', error);
                    resolve(null);
                }
            });
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

/**
 * LetterBlack GenAI - Storage Module
 * Consolidates: storage-integration.js, browser-chat-store.js, chat-memory.js
 */

(function() {
    'use strict';
    
    // Browser Chat Store - Local Storage Implementation
    class BrowserChatStore {
        constructor() {
            this.storageKey = 'letterblack_genai_chats';
            this.settingsKey = 'letterblack_genai_settings';
            this.maxChats = 100;
            this.maxMessagesPerChat = 1000;
        }
        
        // Chat Management
        async saveChat(chatId, messages) {
            try {
                const chats = this.getAllChats();
                
                // Limit messages per chat
                const limitedMessages = messages.slice(-this.maxMessagesPerChat);
                
                chats[chatId] = {
                    id: chatId,
                    messages: limitedMessages,
                    lastUpdated: new Date().toISOString(),
                    messageCount: limitedMessages.length
                };
                
                // Limit total chats
                const chatEntries = Object.entries(chats);
                if (chatEntries.length > this.maxChats) {
                    // Keep only the most recent chats
                    chatEntries.sort((a, b) => new Date(b[1].lastUpdated) - new Date(a[1].lastUpdated));
                    const limitedChats = Object.fromEntries(chatEntries.slice(0, this.maxChats));
                    localStorage.setItem(this.storageKey, JSON.stringify(limitedChats));
                } else {
                    localStorage.setItem(this.storageKey, JSON.stringify(chats));
                }
                
                return true;
            } catch (error) {
                console.error('Failed to save chat:', error);
                return false;
            }
        }
        
        async loadChat(chatId) {
            try {
                const chats = this.getAllChats();
                return chats[chatId]?.messages || [];
            } catch (error) {
                console.error('Failed to load chat:', error);
                return [];
            }
        }
        
        getAllChats() {
            try {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : {};
            } catch (error) {
                console.error('Failed to get chats:', error);
                return {};
            }
        }
        
        async deleteChat(chatId) {
            try {
                const chats = this.getAllChats();
                delete chats[chatId];
                localStorage.setItem(this.storageKey, JSON.stringify(chats));
                return true;
            } catch (error) {
                console.error('Failed to delete chat:', error);
                return false;
            }
        }
        
        async clearAllChats() {
            try {
                localStorage.removeItem(this.storageKey);
                return true;
            } catch (error) {
                console.error('Failed to clear chats:', error);
                return false;
            }
        }
        
        // Settings Management
        async saveSettings(settings) {
            try {
                localStorage.setItem(this.settingsKey, JSON.stringify(settings));
                return true;
            } catch (error) {
                console.error('Failed to save settings:', error);
                return false;
            }
        }
        
        async loadSettings() {
            try {
                const data = localStorage.getItem(this.settingsKey);
                return data ? JSON.parse(data) : this.getDefaultSettings();
            } catch (error) {
                console.error('Failed to load settings:', error);
                return this.getDefaultSettings();
            }
        }
        
        getDefaultSettings() {
            return {
                provider: 'google',
                model: 'gemini-1.5-flash',
                apiKey: '',
                temperature: 0.7,
                maxTokens: 2048,
                theme: 'auto',
                notifications: true,
                autoSave: true
            };
        }
        
        // Storage Info
        getStorageInfo() {
            try {
                const chats = this.getAllChats();
                const chatCount = Object.keys(chats).length;
                const totalMessages = Object.values(chats).reduce((sum, chat) => sum + (chat.messageCount || 0), 0);
                
                // Estimate storage usage
                const storageData = localStorage.getItem(this.storageKey) || '';
                const settingsData = localStorage.getItem(this.settingsKey) || '';
                const estimatedSizeKB = Math.round((storageData.length + settingsData.length) * 2 / 1024); // Rough estimate
                
                return {
                    chatCount,
                    totalMessages,
                    estimatedSizeKB,
                    maxChats: this.maxChats,
                    maxMessagesPerChat: this.maxMessagesPerChat
                };
            } catch (error) {
                console.error('Failed to get storage info:', error);
                return {
                    chatCount: 0,
                    totalMessages: 0,
                    estimatedSizeKB: 0,
                    maxChats: this.maxChats,
                    maxMessagesPerChat: this.maxMessagesPerChat
                };
            }
        }
    }
    
    // Chat Storage Manager - High-level interface
    class ChatStorageManager {
        constructor() {
            this.store = new BrowserChatStore();
            this.currentChatId = 'default';
            this.cache = new Map();
            this.autoSaveEnabled = true;
            this.saveInterval = null;
        }
        
        // Initialize storage manager
        async initialize() {
            try {
                // Load settings to check auto-save preference
                const settings = await this.store.loadSettings();
                this.autoSaveEnabled = settings.autoSave !== false;
                
                // Start auto-save if enabled
                if (this.autoSaveEnabled) {
                    this.startAutoSave();
                }
                
                console.log('✅ ChatStorageManager initialized');
                return true;
            } catch (error) {
                console.error('❌ Failed to initialize ChatStorageManager:', error);
                return false;
            }
        }
        
        // Message Management
        async addMessage(role, content, metadata = {}) {
            try {
                const message = {
                    id: this.generateMessageId(),
                    role,
                    content,
                    timestamp: new Date().toISOString(),
                    ...metadata
                };
                
                // Add to cache
                if (!this.cache.has(this.currentChatId)) {
                    this.cache.set(this.currentChatId, []);
                }
                this.cache.get(this.currentChatId).push(message);
                
                // Auto-save if enabled
                if (this.autoSaveEnabled) {
                    await this.saveCurrentChat();
                }
                
                return message;
            } catch (error) {
                console.error('Failed to add message:', error);
                return null;
            }
        }
        
        async getMessages(chatId = null) {
            const targetChatId = chatId || this.currentChatId;
            
            try {
                // Check cache first
                if (this.cache.has(targetChatId)) {
                    return this.cache.get(targetChatId);
                }
                
                // Load from storage
                const messages = await this.store.loadChat(targetChatId);
                this.cache.set(targetChatId, messages);
                return messages;
            } catch (error) {
                console.error('Failed to get messages:', error);
                return [];
            }
        }
        
        async saveCurrentChat() {
            try {
                const messages = this.cache.get(this.currentChatId) || [];
                return await this.store.saveChat(this.currentChatId, messages);
            } catch (error) {
                console.error('Failed to save current chat:', error);
                return false;
            }
        }
        
        async switchChat(chatId) {
            try {
                // Save current chat if needed
                if (this.autoSaveEnabled && this.cache.has(this.currentChatId)) {
                    await this.saveCurrentChat();
                }
                
                this.currentChatId = chatId;
                
                // Load new chat if not in cache
                if (!this.cache.has(chatId)) {
                    const messages = await this.store.loadChat(chatId);
                    this.cache.set(chatId, messages);
                }
                
                return true;
            } catch (error) {
                console.error('Failed to switch chat:', error);
                return false;
            }
        }
        
        async clearCurrentChat() {
            try {
                this.cache.set(this.currentChatId, []);
                if (this.autoSaveEnabled) {
                    await this.saveCurrentChat();
                }
                return true;
            } catch (error) {
                console.error('Failed to clear current chat:', error);
                return false;
            }
        }
        
        // Settings Management
        async saveSettings(settings) {
            try {
                const result = await this.store.saveSettings(settings);
                
                // Update auto-save preference
                if (settings.autoSave !== undefined) {
                    this.autoSaveEnabled = settings.autoSave;
                    if (this.autoSaveEnabled) {
                        this.startAutoSave();
                    } else {
                        this.stopAutoSave();
                    }
                }
                
                return result;
            } catch (error) {
                console.error('Failed to save settings:', error);
                return false;
            }
        }
        
        async loadSettings() {
            try {
                return await this.store.loadSettings();
            } catch (error) {
                console.error('Failed to load settings:', error);
                return this.store.getDefaultSettings();
            }
        }
        
        // Auto-save functionality
        startAutoSave() {
            if (this.saveInterval) {
                clearInterval(this.saveInterval);
            }
            
            // Auto-save every 30 seconds
            this.saveInterval = setInterval(async () => {
                if (this.cache.has(this.currentChatId)) {
                    await this.saveCurrentChat();
                }
            }, 30000);
        }
        
        stopAutoSave() {
            if (this.saveInterval) {
                clearInterval(this.saveInterval);
                this.saveInterval = null;
            }
        }
        
        // Utilities
        generateMessageId() {
            return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        getStorageInfo() {
            return this.store.getStorageInfo();
        }
        
        // Cleanup
        async cleanup() {
            try {
                this.stopAutoSave();
                
                // Save any pending changes
                if (this.autoSaveEnabled && this.cache.has(this.currentChatId)) {
                    await this.saveCurrentChat();
                }
                
                console.log('✅ ChatStorageManager cleanup completed');
            } catch (error) {
                console.error('❌ ChatStorageManager cleanup failed:', error);
            }
        }
    }
    
    // Create global instances
    const chatStore = new ChatStorageManager();
    
    // Export to global scope
    window.BrowserChatStore = BrowserChatStore;
    window.ChatStorageManager = ChatStorageManager;
    window.chatStore = chatStore;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            chatStore.initialize();
        });
    } else {
        chatStore.initialize();
    }
    
    console.log('✅ Storage module loaded');
    
})();

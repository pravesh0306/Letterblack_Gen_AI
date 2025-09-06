/**
 * CONSOLIDATED STORAGE MODULE - Adobe AI Generations Extension
 * Handles all data persistence, chat storage, and settings storage
 * Replaces multiple storage-related files with single consolidated module
 */

(function() {
    'use strict';

    // ==========================================
    // STORAGE MODULE CONFIGURATION
    // ==========================================

    const STORAGE_CONFIG = {
        version: '1.0.0',
        maxConversations: 100,
        maxMessagesPerConversation: 500,
        maxStorageSize: 10 * 1024 * 1024, // 10MB
        compressionEnabled: true,
        encryptionEnabled: false // Can be enabled for sensitive data
    };

    const STORAGE_KEYS = {
        conversations: 'ai_conversations',
        settings: 'ai_settings',
        userPreferences: 'ai_user_preferences',
        cache: 'ai_cache',
        metadata: 'ai_metadata'
    };

    // ==========================================
    // MAIN STORAGE MODULE CLASS
    // ==========================================

    class StorageModule {
        constructor() {
            this.isInitialized = false;
            this.conversations = new Map();
            this.settings = {};
            this.cache = new Map();
            this.storageType = this.detectStorageType();
            
            console.log('💾 Storage Module initialized with:', this.storageType);
        }

        async initialize() {
            try {
                await this.loadAllData();
                this.startPeriodicCleanup();
                this.isInitialized = true;
                
                console.log('✅ Storage Module ready');
                return true;
            } catch (error) {
                console.error('❌ Storage Module initialization failed:', error);
                return false;
            }
        }

        detectStorageType() {
            // Detect if we're in CEP environment or browser
            if (typeof window !== 'undefined' && window.localStorage) {
                return 'localStorage';
            } else if (typeof require !== 'undefined') {
                try {
                    const fs = require('fs');
                    const path = require('path');
                    return 'filesystem';
                } catch (e) {
                    return 'memory';
                }
            }
            return 'memory';
        }

        // ==========================================
        // CONVERSATION MANAGEMENT
        // ==========================================

        async saveConversation(conversationData) {
            try {
                const { userMessage, aiResponse, timestamp, metadata = {} } = conversationData;
                
                // Get or create current conversation
                let conversation = this.getCurrentConversation();
                if (!conversation) {
                    conversation = this.createNewConversation();
                }

                // Create message objects with proper structure
                const userMsg = {
                    id: this.generateId(),
                    role: 'user',
                    content: userMessage,
                    timestamp: timestamp || new Date().toISOString(),
                    metadata: this.sanitizeMetadata(metadata)
                };

                const aiMsg = {
                    id: this.generateId(),
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date().toISOString(),
                    metadata: {}
                };

                // Add messages to conversation
                conversation.messages.push(userMsg);
                conversation.messages.push(aiMsg);
                conversation.updatedAt = new Date().toISOString();
                conversation.messageCount = conversation.messages.length;

                // Enforce message limits
                if (conversation.messages.length > STORAGE_CONFIG.maxMessagesPerConversation) {
                    const excess = conversation.messages.length - STORAGE_CONFIG.maxMessagesPerConversation;
                    conversation.messages = conversation.messages.slice(excess);
                    console.log(`🗑️ Trimmed ${excess} old messages from conversation`);
                }

                // Save to storage
                await this.saveConversationToStorage(conversation);
                
                console.log('💾 Conversation saved successfully');
                return true;

            } catch (error) {
                console.error('❌ Error saving conversation:', error);
                throw error;
            }
        }

        createNewConversation() {
            const conversation = {
                id: this.generateId(),
                title: 'New Conversation',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messages: [],
                messageCount: 0,
                metadata: {
                    version: STORAGE_CONFIG.version,
                    source: 'adobe-ae-extension'
                }
            };

            this.conversations.set(conversation.id, conversation);
            this.setCurrentConversation(conversation.id);
            
            return conversation;
        }

        getCurrentConversation() {
            const currentId = this.getCurrentConversationId();
            if (currentId && this.conversations.has(currentId)) {
                return this.conversations.get(currentId);
            }
            return null;
        }

        getCurrentConversationId() {
            return localStorage.getItem('current_conversation_id');
        }

        setCurrentConversation(conversationId) {
            localStorage.setItem('current_conversation_id', conversationId);
        }

        async loadConversation(conversationId) {
            try {
                if (this.conversations.has(conversationId)) {
                    return this.conversations.get(conversationId);
                }

                // Try to load from storage
                const conversation = await this.loadConversationFromStorage(conversationId);
                if (conversation) {
                    this.conversations.set(conversationId, conversation);
                    return conversation;
                }

                return null;
            } catch (error) {
                console.error('❌ Error loading conversation:', error);
                return null;
            }
        }

        async deleteConversation(conversationId) {
            try {
                this.conversations.delete(conversationId);
                await this.deleteConversationFromStorage(conversationId);
                
                // If this was the current conversation, clear it
                if (this.getCurrentConversationId() === conversationId) {
                    localStorage.removeItem('current_conversation_id');
                }
                
                console.log('🗑️ Conversation deleted:', conversationId);
                return true;
            } catch (error) {
                console.error('❌ Error deleting conversation:', error);
                return false;
            }
        }

        async getConversationHistory(limit = 10) {
            try {
                const conversations = Array.from(this.conversations.values())
                    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    .slice(0, limit);

                return conversations.map(conv => ({
                    id: conv.id,
                    title: conv.title,
                    messageCount: conv.messageCount,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt
                }));
            } catch (error) {
                console.error('❌ Error getting conversation history:', error);
                return [];
            }
        }

        // ==========================================
        // SETTINGS MANAGEMENT
        // ==========================================

        async saveSettings(settings) {
            try {
                // Validate and sanitize settings
                const sanitizedSettings = this.sanitizeSettings(settings);
                
                // Update in-memory settings
                this.settings = { ...this.settings, ...sanitizedSettings };
                
                // Save to storage
                await this.saveToStorage(STORAGE_KEYS.settings, this.settings);
                
                console.log('⚙️ Settings saved successfully');
                return true;
            } catch (error) {
                console.error('❌ Error saving settings:', error);
                throw error;
            }
        }

        async loadSettings() {
            try {
                const settings = await this.loadFromStorage(STORAGE_KEYS.settings);
                if (settings) {
                    this.settings = settings;
                    return settings;
                }
                
                // Return default settings if none found
                const defaultSettings = this.getDefaultSettings();
                this.settings = defaultSettings;
                return defaultSettings;
            } catch (error) {
                console.error('❌ Error loading settings:', error);
                return this.getDefaultSettings();
            }
        }

        getDefaultSettings() {
            return {
                apiKey: '',
                provider: 'google',
                model: 'gemini-1.5-flash',
                temperature: 0.7,
                maxTokens: 2048,
                theme: 'dark',
                language: 'en',
                notifications: true,
                autoSave: true,
                version: STORAGE_CONFIG.version
            };
        }

        sanitizeSettings(settings) {
            const sanitized = {};
            
            // Allowed setting keys and their types
            const allowedSettings = {
                apiKey: 'string',
                provider: 'string',
                model: 'string',
                temperature: 'number',
                maxTokens: 'number',
                theme: 'string',
                language: 'string',
                notifications: 'boolean',
                autoSave: 'boolean'
            };

            for (const [key, expectedType] of Object.entries(allowedSettings)) {
                if (settings.hasOwnProperty(key)) {
                    const value = settings[key];
                    if (typeof value === expectedType) {
                        sanitized[key] = value;
                    }
                }
            }

            return sanitized;
        }

        // ==========================================
        // CACHE MANAGEMENT
        // ==========================================

        async saveToCache(key, data, ttl = 3600000) { // Default 1 hour TTL
            try {
                const cacheEntry = {
                    data,
                    timestamp: Date.now(),
                    ttl
                };

                this.cache.set(key, cacheEntry);
                
                // Persist cache if needed
                if (this.storageType !== 'memory') {
                    await this.saveCacheToStorage();
                }

                return true;
            } catch (error) {
                console.error('❌ Error saving to cache:', error);
                return false;
            }
        }

        async getFromCache(key) {
            try {
                const cacheEntry = this.cache.get(key);
                if (!cacheEntry) {
                    return null;
                }

                // Check if expired
                if (Date.now() - cacheEntry.timestamp > cacheEntry.ttl) {
                    this.cache.delete(key);
                    return null;
                }

                return cacheEntry.data;
            } catch (error) {
                console.error('❌ Error getting from cache:', error);
                return null;
            }
        }

        clearCache() {
            this.cache.clear();
            if (this.storageType !== 'memory') {
                this.deleteFromStorage(STORAGE_KEYS.cache);
            }
        }

        // ==========================================
        // STORAGE BACKEND METHODS
        // ==========================================

        async saveToStorage(key, data) {
            try {
                switch (this.storageType) {
                    case 'localStorage':
                        return this.saveToLocalStorage(key, data);
                    case 'filesystem':
                        return this.saveToFileSystem(key, data);
                    default:
                        return this.saveToMemory(key, data);
                }
            } catch (error) {
                console.error('❌ Storage save error:', error);
                throw error;
            }
        }

        async loadFromStorage(key) {
            try {
                switch (this.storageType) {
                    case 'localStorage':
                        return this.loadFromLocalStorage(key);
                    case 'filesystem':
                        return this.loadFromFileSystem(key);
                    default:
                        return this.loadFromMemory(key);
                }
            } catch (error) {
                console.error('❌ Storage load error:', error);
                return null;
            }
        }

        async deleteFromStorage(key) {
            try {
                switch (this.storageType) {
                    case 'localStorage':
                        return this.deleteFromLocalStorage(key);
                    case 'filesystem':
                        return this.deleteFromFileSystem(key);
                    default:
                        return this.deleteFromMemory(key);
                }
            } catch (error) {
                console.error('❌ Storage delete error:', error);
                return false;
            }
        }

        // LocalStorage implementation
        async saveToLocalStorage(key, data) {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        }

        async loadFromLocalStorage(key) {
            const serialized = localStorage.getItem(key);
            return serialized ? JSON.parse(serialized) : null;
        }

        async deleteFromLocalStorage(key) {
            localStorage.removeItem(key);
            return true;
        }

        // Memory implementation (fallback)
        memoryStorage = new Map();

        async saveToMemory(key, data) {
            this.memoryStorage.set(key, data);
            return true;
        }

        async loadFromMemory(key) {
            return this.memoryStorage.get(key) || null;
        }

        async deleteFromMemory(key) {
            return this.memoryStorage.delete(key);
        }

        // ==========================================
        // CONVERSATION STORAGE HELPERS
        // ==========================================

        async saveConversationToStorage(conversation) {
            const key = `${STORAGE_KEYS.conversations}_${conversation.id}`;
            return this.saveToStorage(key, conversation);
        }

        async loadConversationFromStorage(conversationId) {
            const key = `${STORAGE_KEYS.conversations}_${conversationId}`;
            return this.loadFromStorage(key);
        }

        async deleteConversationFromStorage(conversationId) {
            const key = `${STORAGE_KEYS.conversations}_${conversationId}`;
            return this.deleteFromStorage(key);
        }

        async loadAllData() {
            try {
                // Load settings
                await this.loadSettings();
                
                // Load conversation metadata to rebuild conversations map
                const metadata = await this.loadFromStorage(STORAGE_KEYS.metadata);
                if (metadata && metadata.conversationIds) {
                    for (const conversationId of metadata.conversationIds) {
                        const conversation = await this.loadConversationFromStorage(conversationId);
                        if (conversation) {
                            this.conversations.set(conversationId, conversation);
                        }
                    }
                }

                console.log('📦 All data loaded successfully');
            } catch (error) {
                console.error('❌ Error loading data:', error);
            }
        }

        async saveCacheToStorage() {
            const cacheData = Object.fromEntries(this.cache);
            return this.saveToStorage(STORAGE_KEYS.cache, cacheData);
        }

        // ==========================================
        // UTILITY METHODS
        // ==========================================

        generateId() {
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        sanitizeMetadata(metadata) {
            if (!metadata || typeof metadata !== 'object') {
                return {};
            }

            const sanitized = {};
            for (const [key, value] of Object.entries(metadata)) {
                if (typeof key === 'string' && key.length <= 50) {
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                        sanitized[key] = value;
                    }
                }
            }

            return sanitized;
        }

        async getStorageStats() {
            try {
                const stats = {
                    conversationCount: this.conversations.size,
                    totalMessages: 0,
                    storageSize: 0,
                    cacheSize: this.cache.size,
                    lastUpdated: new Date().toISOString()
                };

                // Calculate total messages
                for (const conversation of this.conversations.values()) {
                    stats.totalMessages += conversation.messageCount || 0;
                }

                // Estimate storage size (rough calculation)
                if (this.storageType === 'localStorage') {
                    let size = 0;
                    for (const key in localStorage) {
                        if (key.startsWith('ai_')) {
                            size += localStorage[key].length;
                        }
                    }
                    stats.storageSize = size;
                }

                return stats;
            } catch (error) {
                console.error('❌ Error getting storage stats:', error);
                return { error: error.message };
            }
        }

        async cleanup() {
            try {
                console.log('🧹 Starting storage cleanup...');
                
                // Remove expired cache entries
                const now = Date.now();
                for (const [key, entry] of this.cache.entries()) {
                    if (now - entry.timestamp > entry.ttl) {
                        this.cache.delete(key);
                    }
                }

                // Limit number of conversations
                if (this.conversations.size > STORAGE_CONFIG.maxConversations) {
                    const conversations = Array.from(this.conversations.values())
                        .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                    
                    const toDelete = conversations.slice(0, this.conversations.size - STORAGE_CONFIG.maxConversations);
                    
                    for (const conversation of toDelete) {
                        await this.deleteConversation(conversation.id);
                    }
                    
                    console.log(`🗑️ Cleaned up ${toDelete.length} old conversations`);
                }

                console.log('✅ Storage cleanup completed');
                return true;
            } catch (error) {
                console.error('❌ Storage cleanup error:', error);
                return false;
            }
        }

        startPeriodicCleanup() {
            // Run cleanup every hour
            setInterval(() => {
                this.cleanup();
            }, 3600000);
        }

        // ==========================================
        // EXPORT/IMPORT FUNCTIONALITY
        // ==========================================

        async exportData() {
            try {
                const exportData = {
                    version: STORAGE_CONFIG.version,
                    timestamp: new Date().toISOString(),
                    conversations: Array.from(this.conversations.values()),
                    settings: this.settings
                };

                return JSON.stringify(exportData, null, 2);
            } catch (error) {
                console.error('❌ Export error:', error);
                throw error;
            }
        }

        async importData(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                if (data.conversations) {
                    for (const conversation of data.conversations) {
                        this.conversations.set(conversation.id, conversation);
                        await this.saveConversationToStorage(conversation);
                    }
                }

                if (data.settings) {
                    await this.saveSettings(data.settings);
                }

                console.log('📥 Data imported successfully');
                return true;
            } catch (error) {
                console.error('❌ Import error:', error);
                throw error;
            }
        }
    }

    // ==========================================
    // MODULE INITIALIZATION AND EXPORT
    // ==========================================

    // Initialize storage module
    const storageModule = new StorageModule();
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => storageModule.initialize());
    } else {
        storageModule.initialize();
    }

    // Export to global scope
    window.storageModule = storageModule;
    
    // Register with extension system
    if (window.aiExtension) {
        window.aiExtension.modules.storage = storageModule;
    }

    console.log('💾 Storage Module loaded and ready');

})();

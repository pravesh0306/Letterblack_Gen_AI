// storage/chatStore-browser.js
// Browser-compatible chat history storage for CEP panel

class BrowserChatStore {
  constructor() {
    this.STORAGE_KEY = 'letterblack_chat_conversations';
    this.isInitialized = false;
    this.conversations = new Map();
    this.activeConversationId = null;
  }

  /**
   * Initialize the store
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      // Load existing conversations from localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.conversations = new Map(Object.entries(data));
      }
      
      this.isInitialized = true;
      this.logger.debug('📚 Browser ChatStore initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize ChatStore:', error);
      this.conversations = new Map();
      this.isInitialized = true;
    }
  }

  /**
   * Save conversations to localStorage
   */
  async _save() {
    try {
      const data = Object.fromEntries(this.conversations);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.error('❌ Failed to save conversations:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(title = null) {
    await this.init();
    
    const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const conversation = {
      id,
      title: title || `Chat ${new Date().toLocaleString()}`,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      messages: []
    };
    
    this.conversations.set(id, conversation);
    await this._save();
    
    this.logger.debug(`💬 Created conversation: ${id}`);
    return id;
  }

  /**
   * Append message to conversation
   */
  async appendMessage(conversationId, message) {
    await this.init();
    
    if (!conversationId) {
      // Create default conversation if none exists
      conversationId = await this.createConversation('Default Chat');
    }
    
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    const messageObj = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type: message.type || 'user',
      text: message.text || message,
      ...message
    };
    
    conversation.messages.push(messageObj);
    conversation.updated = new Date().toISOString();
    
    await this._save();
    
    return messageObj.id;
  }

  /**
   * Get list of all conversations
   */
  async getConversationList() {
    await this.init();
    
    return Array.from(this.conversations.values()).map(conv => ({
      id: conv.id,
      title: conv.title,
      created: conv.created,
      updated: conv.updated,
      messageCount: conv.messages.length
    })).sort((a, b) => new Date(b.updated) - new Date(a.updated));
  }

  /**
   * Get messages for a specific conversation
   */
  async getConversationMessages(conversationId) {
    await this.init();
    
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return [];
    }
    
    return conversation.messages;
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId) {
    await this.init();
    
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Update conversation title
   */
  async updateConversationTitle(conversationId, title) {
    await this.init();
    
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    conversation.title = title;
    conversation.updated = new Date().toISOString();
    
    await this._save();
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    await this.init();
    
    const deleted = this.conversations.delete(conversationId);
    if (deleted) {
      await this._save();
      this.logger.debug(`🗑️ Deleted conversation: ${conversationId}`);
    }
    
    return deleted;
  }

  /**
   * Clear all conversations
   */
  async clearAll() {
    await this.init();
    
    this.conversations.clear();
    await this._save();
    
    this.logger.debug('🧹 Cleared all conversations');
  }

  /**
   * Export all conversations
   */
  async exportAll() {
    await this.init();
    
    const export_data = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      conversations: Object.fromEntries(this.conversations)
    };
    
    return JSON.stringify(export_data, null, 2);
  }

  /**
   * Import conversations from JSON
   */
  async importData(jsonData) {
    await this.init();
    
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.conversations) {
        // Merge with existing conversations
        Object.entries(data.conversations).forEach(([id, conv]) => {
          this.conversations.set(id, conv);
        });
        
        await this._save();
        this.logger.debug(`📥 Imported ${Object.keys(data.conversations).length} conversations`);
      }
    } catch (error) {
      this.logger.error('❌ Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Search messages across all conversations
   */
  async searchMessages(query) {
    await this.init();
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    for (const conversation of this.conversations.values()) {
      for (const message of conversation.messages) {
        if (message.text && message.text.toLowerCase().includes(searchTerm)) {
          results.push({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            message: message
          });
        }
      }
    }
    
    return results.sort((a, b) => new Date(b.message.timestamp) - new Date(a.message.timestamp));
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    await this.init();
    
    let totalMessages = 0;
    let totalSize = 0;
    
    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messages.length;
    }
    
    const jsonString = await this.exportAll();
    totalSize = new Blob([jsonString]).size;
    
    return {
      conversationCount: this.conversations.size,
      messageCount: totalMessages,
      storageSize: totalSize,
      storageSizeFormatted: this._formatBytes(totalSize)
    };
  }

  /**
   * Format bytes to human readable
   */
  _formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Create global instance
const chatStore = new BrowserChatStore();

// Export for different module systems
if (typeof window !== 'undefined') {
  window.chatStore = chatStore;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = chatStore;
}

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => chatStore.init());
  } else {
    chatStore.init();
  }
}

// js/storage-integration.js
// UI integration for persistent chat storage

const chatStore = require("../storage/chatStore");

class ChatStorageManager {
  constructor() {
    this.activeConversationId = null;
    this.isInitialized = false;
    this.secureStorage = null;
    this.ui = {
      chatMessages: null,
      chatInput: null,
      sendButton: null,
      clearButton: null,
      statusText: null
    };
  }

  /**
   * Initialize secure storage
   */
  async initSecureStorage() {
    try {
      if (typeof require !== 'undefined') {
        const SecureAPIStorage = require('../storage/secureAPIStorage');
        this.secureStorage = new SecureAPIStorage();
        await this.secureStorage.ensureDirs();
      }
    } catch (error) {
      console.warn('SecureAPIStorage not available:', error);
    }
  }

  /**
   * Get secure setting with fallback
   */
  async getSecureSetting(key, defaultValue) {
    try {
      if (this.secureStorage) {
        const settings = await this.secureStorage.loadSettings();
        return settings[key] ?? defaultValue;
      } else {
        // Fallback to localStorage with warning
        console.warn(`🚫 Using insecure localStorage for ${key} - SecureAPIStorage unavailable`);
        return localStorage.getItem(key) || defaultValue;
      }
    } catch (error) {
      console.error(`Failed to get secure setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Initialize storage and wire up UI elements
   */
  async initialize() {
    try {
      console.log("🚀 Initializing Chat Storage Manager...");
      
      // Initialize secure storage first
      await this.initSecureStorage();
      
      // Ensure storage directories exist
      chatStore.ensureDirs();

      // Handle migration from old localStorage system
      if (window.chatMigrationHelper) {
        const migrationResult = await window.chatMigrationHelper.performMigration();
        console.log("🔄 Migration result:", migrationResult);
      }
      
      // Load existing data
      const data = chatStore.loadChat();
      
      // Get or create active conversation
      if (data.conversations.length === 0) {
        this.activeConversationId = chatStore.createConversation("Default Thread");
      } else {
        // Use most recently updated conversation
        const sorted = data.conversations.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        this.activeConversationId = sorted[0].id;
      }
      
      // Wire up UI elements
      this.wireUIElements();
      
      // Setup cleanup on page unload
      this.boundCleanup = () => this.cleanup();
      window.addEventListener('beforeunload', this.boundCleanup);
      
      // Load existing messages
      await this.loadMessagesIntoUI();
      
      this.isInitialized = true;
      this.updateStatus("Chat storage ready");
      
      console.log("✅ Chat Storage Manager initialized");
      console.log(`📁 Active conversation: ${this.activeConversationId}`);
      
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Chat Storage Manager:", error);
      this.updateStatus("Storage initialization failed");
      throw error;
    }
  }

  /**
   * Wire up UI event handlers
   */
  wireUIElements() {
    // Find UI elements
    this.ui.chatMessages = document.getElementById('chat-messages');
    this.ui.chatInput = document.getElementById('chat-input');
    this.ui.sendButton = document.getElementById('send-button');
    this.ui.clearButton = document.getElementById('clear-history-btn');
    this.ui.statusText = document.getElementById('status-text');

    // Initialize bound handlers for cleanup
    this.boundHandlers = {};

    // Wire send button
    if (this.ui.sendButton && this.ui.chatInput) {
      this.boundHandlers.sendClick = () => this.handleSendMessage();
      this.boundHandlers.inputKeydown = (e) => {
        if ((e.ctrlKey && e.key === 'Enter') || (e.key === 'Enter' && !e.shiftKey)) {
          e.preventDefault();
          this.handleSendMessage();
        }
      };
      
      this.ui.sendButton.addEventListener('click', this.boundHandlers.sendClick);
      this.ui.chatInput.addEventListener('keydown', this.boundHandlers.inputKeydown);
    }

    // Wire clear button
    if (this.ui.clearButton) {
      this.boundHandlers.clearClick = () => this.handleClearHistory();
      this.ui.clearButton.addEventListener('click', this.boundHandlers.clearClick);
    }

    // Auto-save on any message changes (for external message additions)
    if (this.ui.chatMessages) {
      this.mutationObserver = new MutationObserver(() => {
        // Debounced save to avoid excessive writes
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.syncFromUI(), 1000);
      });
      
      this.mutationObserver.observe(this.ui.chatMessages, { 
        childList: true, 
        subtree: true 
      });
    }

    console.log("🔗 UI elements wired up");
  }

  /**
   * Handle send message button click
   */
  async handleSendMessage() {
    if (!this.isInitialized || !this.ui.chatInput) return;

    const text = this.ui.chatInput.value.trim();
    if (!text) return;

    try {
      this.updateStatus("Sending message...");

      // Create user message
      const userMessage = {
        role: "user",
        text: text,
        meta: {
          model: await this.getSecureSetting('ai_model', 'unknown'),
          aeContext: this.getAEContext()
        }
      };

      // Append to storage
      await chatStore.appendMessage(this.activeConversationId, userMessage);

      // Add to UI immediately
      this.addMessageToUI(userMessage);

      // Clear input
      this.ui.chatInput.value = '';
      this.updateSendButton();

      // Scroll to bottom
      this.scrollToBottom();

      this.updateStatus("Message sent");
      
      // Trigger AI response (if your AI module is available)
      if (window.aiModule && typeof window.aiModule.processMessage === 'function') {
        setTimeout(() => this.triggerAIResponse(text), 100);
      }

    } catch (error) {
      console.error("❌ Failed to send message:", error);
      this.updateStatus("Failed to send message");
      this.showErrorToast("Failed to send message: " + error.message);
    }
  }

  /**
   * Get After Effects context information
   */
  getAEContext() {
    try {
      // Use CEP interface if available
      if (window.CSInterface) {
        const cs = new CSInterface();
        return {
          hostName: cs.hostEnvironment?.appName || 'After Effects',
          version: cs.hostEnvironment?.appVersion || 'unknown',
          projectName: 'current_project', // Would need ExtendScript to get actual name
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn("Could not get AE context:", error);
    }
    
    return {
      hostName: 'After Effects',
      version: 'unknown',
      projectName: 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add message to UI
   */
  addMessageToUI(message) {
    if (!this.ui.chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Handle different content types
    if (message.text.includes('```')) {
      // Code blocks
      contentDiv.innerHTML = this.formatCodeBlocks(message.text);
    } else {
      contentDiv.innerHTML = `<p>${this.escapeHtml(message.text)}</p>`;
    }

    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = message.timestamp ? 
      new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) :
      new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);
    this.ui.chatMessages.appendChild(messageDiv);
  }

  /**
   * Load existing messages into UI
   */
  async loadMessagesIntoUI() {
    if (!this.ui.chatMessages || !this.activeConversationId) return;

    try {
      const conversation = chatStore.getConversation(this.activeConversationId);
      if (!conversation || !conversation.messages) return;

      // Clear existing messages
      this.ui.chatMessages.innerHTML = '';

      // Add each message
      conversation.messages.forEach(message => {
        this.addMessageToUI(message);
      });

      this.scrollToBottom();
      console.log(`📖 Loaded ${conversation.messages.length} messages into UI`);

    } catch (error) {
      console.error("❌ Failed to load messages:", error);
    }
  }

  /**
   * Handle clear history
   */
  async handleClearHistory() {
    if (!confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      return;
    }

    try {
      this.updateStatus("Clearing history...");
      
      // Clear storage
      chatStore.clearAll();
      
      // Create new conversation
      this.activeConversationId = chatStore.createConversation("New Thread");
      
      // Clear UI
      if (this.ui.chatMessages) {
        this.ui.chatMessages.innerHTML = '';
      }
      
      this.updateStatus("History cleared");
      this.showSuccessToast("Chat history cleared successfully");
      
    } catch (error) {
      console.error("❌ Failed to clear history:", error);
      this.updateStatus("Failed to clear history");
      this.showErrorToast("Failed to clear history: " + error.message);
    }
  }

  /**
   * Sync current UI state to storage (for external message additions)
   */
  async syncFromUI() {
    if (!this.ui.chatMessages || !this.activeConversationId) return;

    try {
      const messages = Array.from(this.ui.chatMessages.querySelectorAll('.message'));
      const conversation = chatStore.getConversation(this.activeConversationId);
      
      if (!conversation || messages.length === conversation.messages.length) {
        return; // No changes
      }

      // This is a simplified sync - in a real implementation you'd want
      // more sophisticated change detection
      console.log("🔄 UI sync detected changes, but storage is authoritative");
      
    } catch (error) {
      console.warn("⚠️ UI sync failed:", error);
    }
  }

  /**
   * Trigger AI response (integrate with existing AI module)
   */
  async triggerAIResponse(userText) {
    try {
      // This would integrate with your existing AI module
      if (window.aiModule && typeof window.aiModule.processMessage === 'function') {
        const response = await window.aiModule.processMessage(userText);
        
        if (response) {
          const assistantMessage = {
            role: "assistant",
            text: response.text || response,
            meta: {
              model: response.model || await this.getSecureSetting('ai_model', 'unknown'),
              tokens: response.tokens || 0,
              latencyMs: response.latencyMs || 0
            }
          };

          await chatStore.appendMessage(this.activeConversationId, assistantMessage);
          this.addMessageToUI(assistantMessage);
          this.scrollToBottom();
        }
      }
    } catch (error) {
      console.error("❌ AI response failed:", error);
      this.showErrorToast("AI response failed: " + error.message);
    }
  }

  /**
   * Update send button state
   */
  updateSendButton() {
    if (!this.ui.sendButton || !this.ui.chatInput) return;
    
    const hasText = this.ui.chatInput.value.trim().length > 0;
    this.ui.sendButton.disabled = !hasText;
  }

  /**
   * Update status text
   */
  updateStatus(text) {
    if (this.ui.statusText) {
      this.ui.statusText.textContent = text;
    }
    console.log(`📊 Status: ${text}`);
  }

  /**
   * Scroll chat to bottom
   */
  scrollToBottom() {
    if (this.ui.chatMessages) {
      this.ui.chatMessages.scrollTop = this.ui.chatMessages.scrollHeight;
    }
  }

  /**
   * Format code blocks in messages
   */
  formatCodeBlocks(text) {
    return text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'javascript'}">${this.escapeHtml(code)}</code></pre>`;
    });
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show success toast
   */
  showSuccessToast(message) {
    this.showToast(message, 'success');
  }

  /**
   * Show error toast
   */
  showErrorToast(message) {
    this.showToast(message, 'error');
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Use existing toast system if available
    if (window.SimpleToast) {
      window.SimpleToast.show(message, type);
      return;
    }

    // Fallback to console
    console.log(`🍞 Toast (${type}): ${message}`);
  }

  /**
   * Export current conversation
   */
  async exportConversation() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `chat_export_${timestamp}.json`;
      
      const conversation = chatStore.getConversation(this.activeConversationId);
      if (!conversation) {
        throw new Error('No active conversation to export');
      }

      const blob = new Blob([JSON.stringify(conversation, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccessToast(`Conversation exported as ${filename}`);
      
    } catch (error) {
      console.error("❌ Export failed:", error);
      this.showErrorToast("Export failed: " + error.message);
    }
  }

  /**
   * Get storage statistics for UI display
   */
  getStorageInfo() {
    try {
      const stats = chatStore.getStorageStats();
      const conversations = chatStore.getConversationList();
      
      return {
        ...stats,
        conversationCount: conversations.length,
        activeConversation: this.activeConversationId,
        paths: chatStore.getPaths()
      };
    } catch (error) {
      console.error("❌ Failed to get storage info:", error);
      return null;
    }
  }

  /**
   * Clean up event listeners and observers to prevent memory leaks
   */
  cleanup() {
    console.log("🧹 Cleaning up ChatStorageManager...");
    
    // Clean up timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    
    // Clean up MutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    // Remove event listeners using stored bound handlers
    if (this.boundHandlers) {
      if (this.ui.sendButton && this.boundHandlers.sendClick) {
        this.ui.sendButton.removeEventListener('click', this.boundHandlers.sendClick);
      }
      if (this.ui.chatInput && this.boundHandlers.inputKeydown) {
        this.ui.chatInput.removeEventListener('keydown', this.boundHandlers.inputKeydown);
      }
      if (this.ui.clearButton && this.boundHandlers.clearClick) {
        this.ui.clearButton.removeEventListener('click', this.boundHandlers.clearClick);
      }
      this.boundHandlers = null;
    }
    
    // Remove beforeunload listener
    if (this.boundCleanup) {
      window.removeEventListener('beforeunload', this.boundCleanup);
      this.boundCleanup = null;
    }
    
    console.log("✅ ChatStorageManager cleanup complete");
  }
}

// Create global instance
window.chatStorageManager = new ChatStorageManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatStorageManager.initialize().catch(console.error);
  });
} else {
  // DOM already loaded
  window.chatStorageManager.initialize().catch(console.error);
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatStorageManager;
}

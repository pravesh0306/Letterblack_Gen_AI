/**
 * Secure API Settings Storage Module - Browser Compatible Version
 * Integrates with the persistent chat storage system to securely store API configurations
 * Replaces the insecure localStorage-based API storage
 */

class SecureAPIStorage {
  constructor() {
    this.storageKey = 'ae_secure_api_settings';
    this.initialized = false;
    this.init();
  }

  /**
   * Initialize the secure storage system
   */
  async init() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.warn('SecureAPIStorage: Not in browser environment');
        return false;
      }

      // Use the new chat storage system if available
      if (window.chatStore) {
        this.storage = window.chatStore;
        this.useFileStorage = true;
      } else {
        // Fallback to sessionStorage (more secure than localStorage)
        this.useFileStorage = false;
        console.warn('SecureAPIStorage: Using sessionStorage fallback');
      }

      this.initialized = true;
      console.log('✅ SecureAPIStorage initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize SecureAPIStorage:', error);
      return false;
    }
  }

  /**
   * Simple encryption for browser environment (base64 encoding for now)
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Simple decryption for browser environment
   */
  decrypt(encryptedData) {
    try {
      const jsonString = decodeURIComponent(atob(encryptedData));
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Save API settings securely
   */
  async saveSettings(settings) {
    try {
      if (!this.initialized) {
        await this.init();
      }

      const encryptedSettings = this.encrypt(settings);
      if (!encryptedSettings) {
        throw new Error('Failed to encrypt settings');
      }

      if (this.useFileStorage && this.storage) {
        // Use the chat storage system for persistent storage
        const conversationId = await this.storage.createConversation('api_settings');
        await this.storage.appendMessage(conversationId, {
          role: 'system',
          text: 'API Settings',
          meta: { 
            type: 'api_settings',
            encrypted: true,
            data: encryptedSettings 
          }
        });
      } else {
        // Fallback to sessionStorage
        sessionStorage.setItem(this.storageKey, encryptedSettings);
      }

      console.log('✅ API settings saved securely');
      return true;
    } catch (error) {
      console.error('❌ Failed to save API settings:', error);
      return false;
    }
  }

  /**
   * Load API settings securely
   */
  async loadSettings() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      let encryptedData = null;

      if (this.useFileStorage && this.storage) {
        // Load from chat storage system
        const conversations = await this.storage.getConversations();
        const settingsConv = conversations.find(conv => conv.title === 'api_settings');
        
        if (settingsConv) {
          const messages = await this.storage.getMessages(settingsConv.id);
          const settingsMessage = messages.find(msg => msg.meta?.type === 'api_settings');
          if (settingsMessage) {
            encryptedData = settingsMessage.meta.data;
          }
        }
      } else {
        // Fallback to sessionStorage
        encryptedData = sessionStorage.getItem(this.storageKey);
      }

      if (!encryptedData) {
        return this.getDefaultSettings();
      }

      const settings = this.decrypt(encryptedData);
      return settings || this.getDefaultSettings();
    } catch (error) {
      console.error('❌ Failed to load API settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default API settings
   */
  getDefaultSettings() {
    return {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 1000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Migrate settings from localStorage (legacy)
   */
  async migrateFromLocalStorage() {
    try {
      const legacyData = localStorage.getItem('ae_api_settings');
      if (legacyData) {
        const settings = JSON.parse(legacyData);
        await this.saveSettings(settings);
        localStorage.removeItem('ae_api_settings');
        console.log('✅ Migrated API settings from localStorage');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to migrate from localStorage:', error);
    }
    return false;
  }

  /**
   * Clear all API settings
   */
  async clearSettings() {
    try {
      if (this.useFileStorage && this.storage) {
        const conversations = await this.storage.getConversations();
        const settingsConv = conversations.find(conv => conv.title === 'api_settings');
        if (settingsConv) {
          await this.storage.deleteConversation(settingsConv.id);
        }
      } else {
        sessionStorage.removeItem(this.storageKey);
      }
      console.log('✅ API settings cleared');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear API settings:', error);
      return false;
    }
  }

  /**
   * Validate API key format
   */
  validateApiKey(key, provider = 'gemini') {
    if (!key || typeof key !== 'string') {
      return false;
    }

    switch (provider) {
      case 'gemini':
        return key.startsWith('AIza') && key.length > 20;
      case 'openai':
        return key.startsWith('sk-') && key.length > 20;
      case 'claude':
        return key.startsWith('sk-ant-') && key.length > 20;
      default:
        return key.length > 10; // Basic validation
    }
  }

  /**
   * Get storage information
   */
  getStorageInfo() {
    return {
      initialized: this.initialized,
      useFileStorage: this.useFileStorage,
      storageKey: this.storageKey
    };
  }
}

// Make globally available
if (typeof window !== 'undefined') {
  window.SecureAPIStorage = SecureAPIStorage;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecureAPIStorage;
}

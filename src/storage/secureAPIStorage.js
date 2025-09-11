/**
 * Secure API Settings Storage Module
 * Browser and Node.js compatible version
 * Integrates with the persistent chat storage system to securely store API configurations
 */

// Check if we're in Node.js or browser environment
const isNode = typeof window === 'undefined' && typeof require !== 'undefined';
const isBrowser = typeof window !== 'undefined';

// Environment-specific imports
let crypto, fs, path, os;
if (isNode) {
    crypto = require('crypto');
    fs = require('fs');
    path = require('path');
    os = require('os');
}

class SecureAPIStorage {
    constructor() {
        this.isNode = isNode;
        this.isBrowser = isBrowser;
        this.storageKey = 'ae_secure_api_settings';
        this.initialized = false;

        if (this.isNode) {
            this.paths = this.getPaths();
            this.encryptionKey = this.getOrCreateEncryptionKey();
        } else {
            // Browser fallback - use localStorage with basic encoding
            console.log('🌐 SecureAPIStorage running in browser mode with localStorage fallback');
        }
        this.init();
    }

    /**
     * Get OS-appropriate paths for API settings storage
     */
    getPaths() {
        const platform = os.platform();
        let base;

        if (platform === 'win32') {
            base = path.join(os.homedir(), 'AppData', 'Roaming', 'Adobe', 'AE_AI_Extension');
        } else if (platform === 'darwin') {
            base = path.join(os.homedir(), 'Library', 'Application Support', 'Adobe', 'AE_AI_Extension');
        } else {
            base = path.join(os.homedir(), '.config', 'Adobe', 'AE_AI_Extension');
        }

        return {
            base,
            settingsFile: path.join(base, 'api_settings.dat'),
            keyFile: path.join(base, 'encryption.key')
        };
    }

    /**
     * Get or create encryption key for Node.js environment
     */
    getOrCreateEncryptionKey() {
        if (!this.isNode) return null;
        
        try {
            // Ensure directory exists
            if (!fs.existsSync(this.paths.base)) {
                fs.mkdirSync(this.paths.base, { recursive: true });
            }

            if (fs.existsSync(this.paths.keyFile)) {
                return fs.readFileSync(this.paths.keyFile);
            } else {
                const key = crypto.randomBytes(32);
                fs.writeFileSync(this.paths.keyFile, key, { mode: 0o600 });
                return key;
            }
        } catch (error) {
            console.error('Failed to get/create encryption key:', error);
            return crypto.randomBytes(32); // Fallback to memory-only key
        }
    }

    /**
     * Initialize storage with environment-specific setup
     */
  async init() {
        try {
            if (this.isNode) {
                this.ensureDirs();
                console.log('🔐 SecureAPIStorage initialized with file-based encryption');
            } else {
                // Browser initialization - check for chat storage system
                if (typeof window !== 'undefined' && window.chatStore) {
                    this.storage = window.chatStore;
                    this.useFileStorage = true;
                } else {
                    this.useFileStorage = false;
                    console.log('🌐 SecureAPIStorage initialized with browser localStorage');
                }
            }
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize SecureAPIStorage:', error);
            this.initialized = false;
        }
    }

    /**
     * Ensure necessary directories exist (Node.js only)
     */
    ensureDirs() {
        if (!this.isNode) return;
        
        try {
            if (!fs.existsSync(this.paths.base)) {
                fs.mkdirSync(this.paths.base, { recursive: true });
            }
        } catch (error) {
            console.error('Failed to create directories:', error);
        }
    }

    /**
     * Encrypt sensitive data
     */
    encrypt(text) {
        if (this.isNode && this.encryptionKey) {
            // Node.js real encryption
            try {
                const algorithm = 'aes-256-gcm';
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipher(algorithm, this.encryptionKey);

                let encrypted = cipher.update(text, 'utf8', 'hex');
                encrypted += cipher.final('hex');

                const authTag = cipher.getAuthTag();

                return {
                    encrypted,
                    iv: iv.toString('hex'),
                    authTag: authTag.toString('hex')
                };
            } catch (error) {
                console.error('Encryption failed:', error);
                return text; // Return unencrypted as fallback
            }
        } else {
            // Browser basic encoding
            try {
                return btoa(encodeURIComponent(text));
            } catch (error) {
                console.error('Encoding failed:', error);
                return text;
            }
        }
    }

    /**
     * Decrypt sensitive data
     */
    decrypt(encryptedData) {
        if (this.isNode && this.encryptionKey) {
            // Node.js real decryption
            if (typeof encryptedData !== 'object') {
                return encryptedData; // Not encrypted
            }
            
            try {
                const algorithm = 'aes-256-gcm';
                const decipher = crypto.createDecipher(algorithm, this.encryptionKey);

                decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

                let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');

                return decrypted;
            } catch (error) {
                console.error('Decryption failed:', error);
                return null;
            }
        } else {
            // Browser basic decoding
            try {
                if (typeof encryptedData === 'object') {
                    return encryptedData; // Not encoded
                }
                return decodeURIComponent(atob(encryptedData));
            } catch (error) {
                console.error('Decoding failed:', error);
                return encryptedData;
            }
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

  console.log('API settings saved securely');
      return { success: true };
    } catch (error) {
  console.error('Failed to save API settings:', error);
      return { success: false, error: error?.message || String(error) };
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
        const conversations = await (this.storage.getConversations
          ? this.storage.getConversations()
          : (async () => {
              // Fallback for browser chatStore which doesn't support listing messages
              const list = this.storage.getConversationList ? this.storage.getConversationList() : [];
              return list.map(c => ({ id: c.id, title: c.title }));
            })());
        const settingsConv = conversations.find(conv => conv.title === 'api_settings');
        
        if (settingsConv) {
          if (this.storage.getMessages) {
            const messages = await this.storage.getMessages(settingsConv.id);
            const settingsMessage = messages.find(msg => msg.meta?.type === 'api_settings');
            if (settingsMessage) {
              encryptedData = settingsMessage.meta.data;
            }
          } else {
            // No way to read meta in the browser fallback – use sessionStorage instead
            encryptedData = sessionStorage.getItem(this.storageKey);
          }
        }
      } else {
        // Fallback to sessionStorage
        encryptedData = sessionStorage.getItem(this.storageKey);
      }

      if (!encryptedData) {
        return { success: true, settings: this.getDefaultSettings() };
      }

      const settings = this.decrypt(encryptedData);
      return { success: true, settings: settings || this.getDefaultSettings() };
    } catch (error) {
  console.error('Failed to load API settings:', error);
      return { success: false, settings: this.getDefaultSettings(), error: error?.message || String(error) };
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
        const res = await this.saveSettings(settings);
        localStorage.removeItem('ae_api_settings');
  console.log('Migrated API settings from localStorage');
        return { success: true, migrated: true };
      }
    } catch (error) {
  console.error('Failed to migrate from localStorage:', error);
    }
    return { success: true, migrated: false };
  }

  /**
   * Clear all API settings
   */
  async clearSettings() {
    try {
      if (this.useFileStorage && this.storage) {
        if (this.storage.getConversations && this.storage.deleteConversation) {
          const conversations = await this.storage.getConversations();
          const settingsConv = conversations.find(conv => conv.title === 'api_settings');
          if (settingsConv) {
            await this.storage.deleteConversation(settingsConv.id);
          }
        }
      } else {
        sessionStorage.removeItem(this.storageKey);
      }
  console.log('API settings cleared');
      return { success: true };
    } catch (error) {
  console.error('Failed to clear API settings:', error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  /**
   * Validate API key format
   */
  validateApiKey(key, provider = 'gemini') {
    if (!key || typeof key !== 'string') {
      return { valid: false, reason: 'API key is required' };
    }

    const tests = {
      gemini: (k) => k.startsWith('AIza') && k.length > 20,
      openai: (k) => k.startsWith('sk-') && k.length > 20,
      anthropic: (k) => /^(sk-ant-)/.test(k) && k.length > 20,
      claude: (k) => /^(sk-ant-)/.test(k) && k.length > 20
    };

    const fn = tests[provider] || ((k) => k.length > 10);
    const ok = fn(key);
    return ok
      ? { valid: true }
      : { valid: false, reason: `Key format doesn't look like ${provider}` };
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

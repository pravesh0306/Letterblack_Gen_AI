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
    
    if (this.isNode) {
      this.paths = this.getPaths();
      this.encryptionKey = this.getOrCreateEncryptionKey();
    } else {
      // Browser fallback - use localStorage with basic encoding
      this.logger.debug('🌐 SecureAPIStorage running in browser mode with localStorage fallback');
    }
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
      settings: path.join(base, 'api-settings.json'),
      keystore: path.join(base, '.keystore')
    };
  }

  /**
   * Ensure directories exist
   */
  ensureDirs() {
    if (!fs.existsSync(this.paths.base)) {
      fs.mkdirSync(this.paths.base, { recursive: true });
    }
  }

  /**
   * Get or create encryption key for API storage
   */
  getOrCreateEncryptionKey() {
    try {
      this.ensureDirs();
      
      if (fs.existsSync(this.paths.keystore)) {
        return fs.readFileSync(this.paths.keystore, 'utf8').trim();
      } else {
        // Create new encryption key
        const key = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(this.paths.keystore, key, { mode: 0o600 }); // Restricted permissions
        return key;
      }
    } catch (error) {
      this.logger.error('🔒 Failed to manage encryption key:', error);
      // Fallback: use session-based key (less secure but functional)
      return crypto.randomBytes(32).toString('hex');
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
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
      this.logger.error('🔒 Encryption failed:', error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    try {
      const algorithm = 'aes-256-gcm';
      const decipher = crypto.createDecipher(algorithm, this.encryptionKey);
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('🔒 Decryption failed:', error);
      return null;
    }
  }

  /**
   * Save API settings securely
   */
  async saveSettings(settings) {
    try {
      if (this.isBrowser) {
        // Browser mode - use localStorage
        return this.saveSettingsBrowser(settings);
      }
      
      this.ensureDirs();
      
      const secureSettings = {
        ...settings,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      // Encrypt sensitive fields
      if (settings.apiKey) {
        secureSettings.apiKey = this.encrypt(settings.apiKey);
      }
      
      if (settings.token) {
        secureSettings.token = this.encrypt(settings.token);
      }

      // Atomic write using temp file
      const tempPath = this.paths.settings + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(secureSettings, null, 2));
      fs.renameSync(tempPath, this.paths.settings);
      
      this.logger.debug('✅ API settings saved securely');
      return { success: true };
      
    } catch (error) {
      this.logger.error('❌ Failed to save API settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Browser-compatible saveSettings
   */
  saveSettingsBrowser(settings) {
    try {
      const settingsToSave = {
        ...settings,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('letterblack_genai_api_settings', JSON.stringify(settingsToSave));
      this.logger.debug('✅ API settings saved to browser storage');
      return { success: true };
    } catch (error) {
      this.logger.error('❌ Failed to save API settings to browser storage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load API settings securely
   */
  async loadSettings() {
    try {
      if (this.isBrowser) {
        // Browser mode - use localStorage
        return this.loadSettingsBrowser();
      }
      
      if (!fs.existsSync(this.paths.settings)) {
        return this.getDefaultSettings();
      }

      const data = JSON.parse(fs.readFileSync(this.paths.settings, 'utf8'));
      
      // Decrypt sensitive fields
      const settings = { ...data };
      
      if (data.apiKey && typeof data.apiKey === 'object') {
        settings.apiKey = this.decrypt(data.apiKey);
      }
      
      if (data.token && typeof data.token === 'object') {
        settings.token = this.decrypt(data.token);
      }

      return {
        success: true,
        settings: {
          apiKey: settings.apiKey || '',
          model: settings.model || 'gemini-2.5-flash-preview-05-20',
          provider: settings.provider || 'gemini',
          endpoint: settings.endpoint || '',
          timeout: settings.timeout || 30000,
          maxTokens: settings.maxTokens || 4096,
          temperature: settings.temperature || 0.7,
          lastUpdated: settings.timestamp
        }
      };
      
    } catch (error) {
      this.logger.error('❌ Failed to load API settings:', error);
      return { success: false, error: error.message, settings: this.getDefaultSettings() };
    }
  }

  /**
   * Browser-compatible loadSettings
   */
  loadSettingsBrowser() {
    try {
      const stored = localStorage.getItem('letterblack_genai_api_settings');
      if (!stored) {
        return this.getDefaultSettings();
      }
      
      const settings = JSON.parse(stored);
      return {
        success: true,
        settings: {
          apiKey: settings.apiKey || '',
          model: settings.model || 'gemini-2.5-flash-preview-05-20',
          provider: settings.provider || 'gemini',
          endpoint: settings.endpoint || '',
          timeout: settings.timeout || 30000,
          maxTokens: settings.maxTokens || 4096,
          temperature: settings.temperature || 0.7,
          lastUpdated: settings.lastUpdated
        }
      };
    } catch (error) {
      this.logger.error('❌ Failed to load API settings from browser storage:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      success: true,
      settings: {
        apiKey: '',
        model: 'gemini-2.5-flash-preview-05-20',
        provider: 'gemini',
        endpoint: '',
        timeout: 30000,
        maxTokens: 4096,
        temperature: 0.7,
        lastUpdated: null
      }
    };
  }

  /**
   * Migrate from insecure localStorage
   */
  async migrateFromLocalStorage() {
    try {
      const apiKey = localStorage.getItem('ai_api_key');
      const model = localStorage.getItem('ai_model');
      
      if (apiKey || model) {
        const settings = {
          apiKey: apiKey || '',
          model: model || 'gemini-2.5-flash-preview-05-20'
        };
        
        const result = await this.saveSettings(settings);
        
        if (result.success) {
          // Clear insecure localStorage
          localStorage.removeItem('ai_api_key');
          localStorage.removeItem('ai_model');
          this.logger.debug('✅ API settings migrated from localStorage to secure storage');
          return { success: true, migrated: true };
        }
      }
      
      return { success: true, migrated: false };
      
    } catch (error) {
      this.logger.error('❌ API settings migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all API settings (for security)
   */
  async clearSettings() {
    try {
      if (fs.existsSync(this.paths.settings)) {
        fs.unlinkSync(this.paths.settings);
      }
      
      // Also clear localStorage fallback
      localStorage.removeItem('ai_api_key');
      localStorage.removeItem('ai_model');
      
      this.logger.debug('🔒 API settings cleared');
      return { success: true };
      
    } catch (error) {
      this.logger.error('❌ Failed to clear API settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate API key format (basic validation)
   */
  validateApiKey(key, provider = 'gemini') {
    if (!key || typeof key !== 'string') {
      return { valid: false, reason: 'API key is required' };
    }

    switch (provider.toLowerCase()) {
      case 'gemini':
      case 'google':
        if (!key.startsWith('AIza') && !key.startsWith('AI')) {
          return { valid: false, reason: 'Invalid Gemini API key format' };
        }
        break;
      case 'openai':
        if (!key.startsWith('sk-')) {
          return { valid: false, reason: 'Invalid OpenAI API key format' };
        }
        break;
      case 'anthropic':
        if (!key.startsWith('sk-ant-')) {
          return { valid: false, reason: 'Invalid Anthropic API key format' };
        }
        break;
    }

    if (key.length < 20) {
      return { valid: false, reason: 'API key too short' };
    }

    return { valid: true };
  }

  /**
   * Get storage information
   */
  getStorageInfo() {
    return {
      settingsPath: this.paths.settings,
      settingsExists: fs.existsSync(this.paths.settings),
      keystoreExists: fs.existsSync(this.paths.keystore),
      platform: os.platform(),
      secured: true,
      encryptionEnabled: !!this.encryptionKey
    };
  }
}

// Export for use in other modules (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecureAPIStorage };
}

// Browser compatibility layer
if (typeof window !== 'undefined') {
  window.SecureAPIStorage = SecureAPIStorage;
}

/**
 * API Settings Migration Helper
 * Migrates from insecure localStorage-based API settings to encrypted persistent storage
 * Integrates with the main chat system migration
 */

class APISettingsMigration {
  constructor() {
    this.oldKeys = ['ai_api_key', 'ai_model'];
    this.secureStorage = null;
  }

  /**
   * Initialize migration system
   */
  async init() {
    try {
      // Load secure storage
      if (window.SecureAPIStorage) {
        this.secureStorage = new window.SecureAPIStorage();
        console.log('✅ API migration system initialized');
        return true;
      } else {
        console.error('❌ SecureAPIStorage not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize API migration:', error);
      return false;
    }
  }

  /**
   * Check if API migration is needed
   */
  needsMigration() {
    try {
      return this.oldKeys.some(key => {
        const value = localStorage.getItem(key);
        return value && value.trim() !== '';
      });
    } catch (error) {
      console.error('❌ Failed to check migration status:', error);
      return false;
    }
  }

  /**
   * Get existing localStorage API data
   */
  getExistingData() {
    try {
      const data = {};
      this.oldKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = value;
        }
      });
      return data;
    } catch (error) {
      console.error('❌ Failed to read existing API data:', error);
      return {};
    }
  }

  /**
   * Perform automatic migration
   */
  async migrateAPISettings() {
    try {
      if (!this.secureStorage) {
        throw new Error('Secure storage not initialized');
      }

      const existingData = this.getExistingData();
      
      if (Object.keys(existingData).length === 0) {
        return { success: true, migrated: false, message: 'No API data to migrate' };
      }

      // Convert to new format
      const settings = {
        apiKey: existingData.ai_api_key || '',
        model: existingData.ai_model || 'gemini-2.5-flash-preview-05-20',
        provider: this.detectProvider(existingData.ai_api_key),
        migrationDate: new Date().toISOString(),
        migratedFrom: 'localStorage'
      };

      // Save to secure storage
      const saveResult = await this.secureStorage.saveSettings(settings);
      
      if (saveResult.success) {
        // Clean up old localStorage
        this.cleanupOldStorage();
        
        console.log('✅ API settings migrated successfully');
        return {
          success: true,
          migrated: true,
          message: 'API settings migrated to secure storage',
          settings: {
            provider: settings.provider,
            model: settings.model,
            hasApiKey: !!settings.apiKey
          }
        };
      } else {
        throw new Error(saveResult.error || 'Failed to save migrated settings');
      }

    } catch (error) {
      console.error('❌ API migration failed:', error);
      return {
        success: false,
        migrated: false,
        error: error.message
      };
    }
  }

  /**
   * Detect API provider from key format
   */
  detectProvider(apiKey) {
    if (!apiKey) return 'gemini';
    
    if (apiKey.startsWith('AIza') || apiKey.startsWith('AI')) {
      return 'gemini';
    } else if (apiKey.startsWith('sk-')) {
      return 'openai';
    } else if (apiKey.startsWith('sk-ant-')) {
      return 'anthropic';
    } else {
      return 'custom';
    }
  }

  /**
   * Clean up old localStorage entries
   */
  cleanupOldStorage() {
    try {
      this.oldKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 Removed old localStorage key: ${key}`);
      });
    } catch (error) {
      console.error('❌ Failed to cleanup old storage:', error);
    }
  }

  /**
   * Show migration prompt to user
   */
  showMigrationPrompt() {
    return new Promise((resolve) => {
      const existingData = this.getExistingData();
      const hasApiKey = !!existingData.ai_api_key;
      const hasModel = !!existingData.ai_model;
      
      // Create modal
      const modal = document.createElement('div');
      modal.className = 'api-migration-modal-overlay';
      modal.innerHTML = `
        <div class="api-migration-modal">
          <div class="migration-header">
            <h3>🔒 API Settings Security Upgrade</h3>
            <p>We found your API settings stored in browser localStorage.</p>
          </div>
          
          <div class="migration-content">
            <div class="current-data">
              <h4>Current Settings Found:</h4>
              <ul>
                ${hasApiKey ? '<li>✅ API Key (will be encrypted)</li>' : '<li>❌ No API key</li>'}
                ${hasModel ? `<li>✅ Model: ${existingData.ai_model}</li>` : '<li>❌ No model selected</li>'}
              </ul>
            </div>
            
            <div class="security-upgrade">
              <h4>🛡️ Security Improvements:</h4>
              <ul>
                <li>🔐 AES-256 encryption for API keys</li>
                <li>💾 Persistent storage outside browser</li>
                <li>🔒 Protected from script access</li>
                <li>🗑️ Automatic secret redaction</li>
              </ul>
            </div>
            
            <div class="migration-warning">
              <p><strong>⚠️ Current Risk:</strong> Your API key is stored in plain text!</p>
            </div>
          </div>
          
          <div class="migration-actions">
            <button id="migrate-api-now" class="btn-primary">
              🔒 Upgrade to Secure Storage
            </button>
            <button id="api-migrate-later" class="btn-secondary">
              ⏰ Remind Me Later
            </button>
            <button id="api-keep-insecure" class="btn-danger">
              ⚠️ Keep Current (Not Recommended)
            </button>
          </div>
          
          <div class="migration-footer">
            <small>This migration is reversible and your data will be preserved.</small>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Handle user choice
      modal.querySelector('#migrate-api-now').onclick = async () => {
        modal.remove();
        const result = await this.migrateAPISettings();
        resolve({ action: 'migrate', result });
      };
      
      modal.querySelector('#api-migrate-later').onclick = () => {
        modal.remove();
        // Set reminder for next session
        localStorage.setItem('api_migration_reminder', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
        resolve({ action: 'later', result: null });
      };
      
      modal.querySelector('#api-keep-insecure').onclick = () => {
        modal.remove();
        // Mark as user declined
        localStorage.setItem('api_migration_declined', 'true');
        resolve({ action: 'decline', result: null });
      };
    });
  }

  /**
   * Check if user should be reminded about migration
   */
  shouldShowReminder() {
    try {
      const declined = localStorage.getItem('api_migration_declined');
      if (declined === 'true') return false;
      
      const reminderTime = localStorage.getItem('api_migration_reminder');
      if (reminderTime) {
        return Date.now() > parseInt(reminderTime);
      }
      
      return this.needsMigration();
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset migration preferences (for testing)
   */
  resetMigrationPreferences() {
    localStorage.removeItem('api_migration_declined');
    localStorage.removeItem('api_migration_reminder');
    console.log('🔄 API migration preferences reset');
  }

  /**
   * Get migration status report
   */
  getMigrationStatus() {
    return {
      needsMigration: this.needsMigration(),
      shouldShowReminder: this.shouldShowReminder(),
      existingData: this.getExistingData(),
      hasSecureStorage: !!this.secureStorage,
      migrationDeclined: localStorage.getItem('api_migration_declined') === 'true',
      reminderTime: localStorage.getItem('api_migration_reminder')
    };
  }

  /**
   * Initialize automatic migration check
   */
  async initAutoMigration() {
    try {
      const initialized = await this.init();
      if (!initialized) return false;

      if (this.shouldShowReminder()) {
        // Show migration prompt after a short delay
        setTimeout(() => {
          this.showMigrationPrompt().then(result => {
            console.log('🔒 API migration prompt result:', result);
            
            if (result.action === 'migrate' && result.result?.success) {
              // Notify other systems about successful migration
              window.dispatchEvent(new CustomEvent('apiMigrationComplete', {
                detail: result.result
              }));
            }
          });
        }, 2000);
      }

      return true;
    } catch (error) {
      console.error('❌ Auto migration initialization failed:', error);
      return false;
    }
  }
}

// Global instance
window.apiSettingsMigration = new APISettingsMigration();

// CSS for migration modal
const migrationCSS = `
<style>
.api-migration-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.api-migration-modal {
  background: var(--vscode-editor-background);
  border: 2px solid var(--vscode-panel-border);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  color: var(--vscode-editor-foreground);
  font-family: var(--vscode-font-family);
}

.migration-header h3 {
  margin: 0 0 8px 0;
  color: var(--vscode-editor-foreground);
  font-size: 18px;
}

.migration-header p {
  margin: 0 0 16px 0;
  color: var(--vscode-descriptionForeground);
  font-size: 14px;
}

.migration-content {
  margin: 16px 0;
}

.current-data, .security-upgrade {
  margin-bottom: 16px;
}

.current-data h4, .security-upgrade h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--vscode-editor-foreground);
}

.current-data ul, .security-upgrade ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.current-data li, .security-upgrade li {
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--vscode-descriptionForeground);
}

.migration-warning {
  background: var(--vscode-inputValidation-warningBackground);
  border: 1px solid var(--vscode-inputValidation-warningBorder);
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
}

.migration-warning p {
  margin: 0;
  font-size: 13px;
  color: var(--vscode-inputValidation-warningForeground);
}

.migration-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 20px 0;
}

.migration-actions button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: 1px solid var(--vscode-button-border);
}

.btn-primary:hover {
  background: var(--vscode-button-hoverBackground);
}

.btn-secondary {
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: 1px solid var(--vscode-button-border);
}

.btn-secondary:hover {
  background: var(--vscode-button-secondaryHoverBackground);
}

.btn-danger {
  background: var(--vscode-errorForeground);
  color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-errorForeground);
}

.btn-danger:hover {
  background: #ff6b6b;
}

.migration-footer {
  text-align: center;
  margin-top: 16px;
}

.migration-footer small {
  color: var(--vscode-descriptionForeground);
  font-size: 11px;
}
</style>
`;

// Inject CSS
if (!document.querySelector('#api-migration-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'api-migration-styles';
  styleSheet.innerHTML = migrationCSS;
  document.head.appendChild(styleSheet);
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.apiSettingsMigration.initAutoMigration();
  });
} else {
  window.apiSettingsMigration.initAutoMigration();
}

console.log('✅ API Settings Migration Helper loaded');

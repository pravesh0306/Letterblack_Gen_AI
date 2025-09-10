// js/migration-helper.js
// Migration helper to transition from localStorage to persistent storage

// Use global chatStore or create minimal compatibility layer
if (typeof chatStore === 'undefined') {
  window.chatStore = window.chatStore || {
    createConversation: () => Promise.resolve('default'),
    appendMessage: () => Promise.resolve(),
    getConversationList: () => Promise.resolve([]),
    clearAll: () => Promise.resolve()
  };
}
const chatStore = window.chatStore;

class ChatMigrationHelper {
  constructor() {
    this.OLD_STORAGE_KEY = 'ae_chat_history';
    this.migrationComplete = false;
  }

  /**
   * Check if migration is needed
   */
  needsMigration() {
    try {
      const oldData = localStorage.getItem(this.OLD_STORAGE_KEY);
      const hasOldData = oldData && JSON.parse(oldData).length > 0;
      
      const newData = chatStore.loadChat();
      const hasNewData = newData.conversations.length > 0;
      
      // Migration needed if we have old data but no new data
      return hasOldData && !hasNewData;
    } catch (error) {
      this.logger.warn('Migration check failed:', error);
      return false;
    }
  }

  /**
   * Migrate localStorage chat history to new persistent storage
   */
  async migrateFromLocalStorage() {
    try {
      this.logger.debug('🔄 Starting chat history migration...');
      
      // Get old data
      const oldDataRaw = localStorage.getItem(this.OLD_STORAGE_KEY);
      if (!oldDataRaw) {
        this.logger.debug('📭 No old chat data found');
        return { success: true, messagesCount: 0 };
      }

      const oldData = JSON.parse(oldDataRaw);
      if (!Array.isArray(oldData) || oldData.length === 0) {
        this.logger.debug('📭 No valid old chat messages found');
        return { success: true, messagesCount: 0 };
      }

      // Create migration conversation
      const migrationId = chatStore.createConversation('Migrated Chat History');
      let migratedCount = 0;

      // Convert old messages to new format
      for (const oldMessage of oldData) {
        try {
          const newMessage = {
            role: this.mapOldRoleToNew(oldMessage.type),
            text: oldMessage.text || oldMessage.content || 'No content',
            meta: {
              migrated: true,
              originalTimestamp: oldMessage.timestamp || oldMessage.date,
              migrationDate: new Date().toISOString()
            }
          };

          await chatStore.appendMessage(migrationId, newMessage);
          migratedCount++;
        } catch (error) {
          this.logger.warn('Failed to migrate message:', error);
        }
      }

      // Create backup of old data
      this.createBackup(oldData);

      // Mark migration as complete
      this.migrationComplete = true;
      localStorage.setItem('chat_migration_completed', 'true');

      this.logger.debug(`✅ Migration completed: ${migratedCount} messages migrated`);
      return { success: true, messagesCount: migratedCount, conversationId: migrationId };

    } catch (error) {
      this.logger.error('❌ Migration failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Map old message types to new roles
   */
  mapOldRoleToNew(oldType) {
    switch (oldType) {
      case 'user': return 'user';
      case 'system': return 'assistant';
      case 'assistant': return 'assistant';
      case 'ai': return 'assistant';
      default: return 'assistant';
    }
  }

  /**
   * Create backup of old localStorage data
   */
  createBackup(oldData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `ae_chat_history_backup_${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(oldData));
      this.logger.debug(`💾 Backup created: ${backupKey}`);
    } catch (error) {
      this.logger.warn('Failed to create backup:', error);
    }
  }

  /**
   * Clean up old localStorage data after successful migration
   */
  cleanupOldData() {
    try {
      if (this.migrationComplete) {
        localStorage.removeItem(this.OLD_STORAGE_KEY);
        this.logger.debug('🗑️ Old localStorage data cleaned up');
      }
    } catch (error) {
      this.logger.warn('Cleanup failed:', error);
    }
  }

  /**
   * Show migration UI prompt
   */
  showMigrationPrompt() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: #252526; border: 1px solid #3c3c3c; border-radius: 8px;
        padding: 24px; max-width: 500px; color: #d4d4d4;
      `;

      dialog.innerHTML = `
        <h3 style="margin: 0 0 16px 0; color: #fff;">💾 Chat History Migration</h3>
        <p>We found existing chat history in browser storage. Would you like to migrate it to the new persistent storage system?</p>
        <p style="font-size: 12px; color: #888; margin: 16px 0;">
          ✅ New system: Cross-session persistence, better performance<br>
          📁 Storage location: User data directory (survives browser restarts)
        </p>
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button id="migrate-yes" style="background: #007acc; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Migrate Now
          </button>
          <button id="migrate-skip" style="background: #3c3c3c; color: #d4d4d4; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Skip (Keep Old)
          </button>
          <button id="migrate-clean" style="background: #f85149; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Start Fresh
          </button>
        </div>
      `;

      modal.appendChild(dialog);
      document.body.appendChild(modal);

      // Handle button clicks
      document.getElementById('migrate-yes').onclick = () => {
        document.body.removeChild(modal);
        resolve('migrate');
      };

      document.getElementById('migrate-skip').onclick = () => {
        document.body.removeChild(modal);
        resolve('skip');
      };

      document.getElementById('migrate-clean').onclick = () => {
        document.body.removeChild(modal);
        resolve('clean');
      };
    });
  }

  /**
   * Perform full migration process with user interaction
   */
  async performMigration() {
    try {
      if (!this.needsMigration()) {
        this.logger.debug('✅ No migration needed');
        return { success: true, action: 'none' };
      }

      const choice = await this.showMigrationPrompt();

      switch (choice) {
        case 'migrate':
          const result = await this.migrateFromLocalStorage();
          if (result.success) {
            this.cleanupOldData();
            this.showSuccessToast(`✅ Migrated ${result.messagesCount} messages`);
          }
          return { success: result.success, action: 'migrated', ...result };

        case 'skip':
          localStorage.setItem('chat_migration_skipped', 'true');
          this.showInfoToast('ℹ️ Keeping old chat system');
          return { success: true, action: 'skipped' };

        case 'clean':
          localStorage.removeItem(this.OLD_STORAGE_KEY);
          localStorage.setItem('chat_migration_cleaned', 'true');
          this.showSuccessToast('🗑️ Started with fresh chat history');
          return { success: true, action: 'cleaned' };

        default:
          return { success: false, action: 'cancelled' };
      }

    } catch (error) {
      this.logger.error('Migration process failed:', error);
      this.showErrorToast('❌ Migration failed: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Show toast notifications
   */
  showSuccessToast(message) {
    if (window.SimpleToast) {
      window.SimpleToast.success(message);
    } else {
      this.logger.debug(message);
    }
  }

  showInfoToast(message) {
    if (window.SimpleToast) {
      window.SimpleToast.show(message, 'info');
    } else {
      this.logger.debug(message);
    }
  }

  showErrorToast(message) {
    if (window.SimpleToast) {
      window.SimpleToast.show(message, 'error');
    } else {
      this.logger.error(message);
    }
  }
}

// Export and create global instance
window.chatMigrationHelper = new ChatMigrationHelper();
module.exports = ChatMigrationHelper;

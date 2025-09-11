// js/migration-helper.js
// Migration helper to transition from localStorage to persistent storage

// Resolve chat store safely across CEP Node and browser contexts (no top-level require)
let fileChatStore = null;
try {
  if (typeof require !== 'undefined') {
    fileChatStore = require("../storage/chatStore");
  }
} catch (e) {
  // In browser/CEP without Node, fall back to shim
}
if (!fileChatStore && typeof window !== 'undefined' && window.chatStore) {
  fileChatStore = window.chatStore;
}

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
      
      // If Node-backed storage is present, check if it already has data
      let hasNewData = false;
      if (fileChatStore && typeof fileChatStore.loadChat === 'function') {
        const newData = fileChatStore.loadChat();
        hasNewData = !!(newData && Array.isArray(newData.conversations) && newData.conversations.length > 0);
      }
      
      // Migration needed if we have old data but no new data
      return hasOldData && !hasNewData;
    } catch (error) {
      console.warn('Migration check failed:', error);
      return false;
    }
  }

  /**
   * Migrate localStorage chat history to new persistent storage
   */
  async migrateFromLocalStorage() {
    try {
      console.log('Starting chat history migration...');
      
      // Get old data
      const oldDataRaw = localStorage.getItem(this.OLD_STORAGE_KEY);
      if (!oldDataRaw) {
        console.log('No old chat data found');
        return { success: true, messagesCount: 0 };
      }

      const oldData = JSON.parse(oldDataRaw);
      if (!Array.isArray(oldData) || oldData.length === 0) {
        console.log('No valid old chat messages found');
        return { success: true, messagesCount: 0 };
      }

      // If no destination chatStore is available, skip
      if (!fileChatStore || typeof fileChatStore.createConversation !== 'function' || typeof fileChatStore.appendMessage !== 'function') {
        console.log('Migration skipped: destination chat store not available in this environment');
        return { success: true, messagesCount: 0, skipped: true };
      }

      // Create migration conversation
      const migrationId = fileChatStore.createConversation('Migrated Chat History');
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

          await fileChatStore.appendMessage(migrationId, newMessage);
          migratedCount++;
        } catch (error) {
          console.warn('Failed to migrate message:', error);
        }
      }

      // Create backup of old data
      this.createBackup(oldData);

      // Mark migration as complete
      this.migrationComplete = true;
      localStorage.setItem('chat_migration_completed', 'true');

  console.log(`Migration completed: ${migratedCount} messages migrated`);
      return { success: true, messagesCount: migratedCount, conversationId: migrationId };

    } catch (error) {
  console.error('Migration failed:', error);
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
  console.log(`Backup created: ${backupKey}`);
    } catch (error) {
      console.warn('Failed to create backup:', error);
    }
  }

  /**
   * Clean up old localStorage data after successful migration
   */
  cleanupOldData() {
    try {
      if (this.migrationComplete) {
        localStorage.removeItem(this.OLD_STORAGE_KEY);
  console.log('Old localStorage data cleaned up');
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
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
  <h3 style="margin: 0 0 16px 0; color: #fff;">Chat History Migration</h3>
        <p>We found existing chat history in browser storage. Would you like to migrate it to the new persistent storage system?</p>
        <p style="font-size: 12px; color: #888; margin: 16px 0;">
      New system: Cross-session persistence, better performance<br>
      Storage location: User data directory (survives browser restarts)
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
  console.log('No migration needed');
        return { success: true, action: 'none' };
      }

      const choice = await this.showMigrationPrompt();

      switch (choice) {
        case 'migrate':
          const result = await this.migrateFromLocalStorage();
          if (result.success) {
            this.cleanupOldData();
            this.showSuccessToast(`Migrated ${result.messagesCount} messages`);
          }
          return { success: result.success, action: 'migrated', ...result };

        case 'skip':
          localStorage.setItem('chat_migration_skipped', 'true');
          this.showInfoToast('Keeping old chat system');
          return { success: true, action: 'skipped' };

        case 'clean':
          localStorage.removeItem(this.OLD_STORAGE_KEY);
          localStorage.setItem('chat_migration_cleaned', 'true');
          this.showSuccessToast('Started with fresh chat history');
          return { success: true, action: 'cleaned' };

        default:
          return { success: false, action: 'cancelled' };
      }

    } catch (error) {
      console.error('Migration process failed:', error);
  this.showErrorToast('Migration failed: ' + error.message);
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
      console.log(message);
    }
  }

  showInfoToast(message) {
    if (window.SimpleToast) {
      window.SimpleToast.show(message, 'info');
    } else {
      console.log(message);
    }
  }

  showErrorToast(message) {
    if (window.SimpleToast) {
      window.SimpleToast.show(message, 'error');
    } else {
      console.error(message);
    }
  }
}

// Export and create global instance
window.chatMigrationHelper = new ChatMigrationHelper();
module.exports = ChatMigrationHelper;

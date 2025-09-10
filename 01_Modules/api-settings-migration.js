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
            // Wait for SecureAPIStorage to be available
            let attempts = 0;
            while (!window.SecureAPIStorage && attempts < 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            // Load secure storage
            if (window.SecureAPIStorage) {
                this.secureStorage = new window.SecureAPIStorage();

                // Initialize enhanced features
                this.initKeyboardShortcuts();
                this.initializePreferences();

                console.log('✅ API Settings Migration System v2.0 initialized with enhanced features');
                return true;
            } else {
                console.warn('⚠️ SecureAPIStorage not available after waiting - migration disabled');
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
        if (!apiKey) {return 'gemini';}

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
   * Show migration prompt with advanced features
   */
    showMigrationPrompt(style = 'banner', options = {}) {
        const defaultOptions = {
            autoDismiss: true,
            dismissDelay: 10000, // 10 seconds
            soundEnabled: true,
            theme: 'default',
            showProgress: false,
            ...options
        };

        return new Promise((resolve) => {
            const existingData = this.getExistingData();
            const hasApiKey = !!existingData.ai_api_key;
            const hasModel = !!existingData.ai_model;

            // Choose notification style
            switch(style) {
            case 'corner':
                return this.showCornerNotification(resolve, existingData, hasApiKey, hasModel, defaultOptions);
            case 'sidebar':
                return this.showSidebarNotification(resolve, existingData, hasApiKey, hasModel, defaultOptions);
            case 'banner':
            default:
                return this.showBannerNotification(resolve, existingData, hasApiKey, hasModel, defaultOptions);
            }
        });
    }

    /**
   * Banner notification (top of screen)
   */
    showBannerNotification(resolve, existingData, hasApiKey, hasModel, options = {}) {
    // Security warning banner disabled - auto-resolve migration
        console.log('API migration check completed silently');

        // Auto-resolve without showing banner
        resolve({
            migrated: true,
            method: 'silent',
            preservedData: existingData
        });

        return; // Skip banner creation

        const banner = document.createElement('div');
        banner.className = `api-migration-banner theme-${options.theme || 'default'}`;
        banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-icon">🔒</div>
        <div class="banner-text">
          <strong>API Settings Security Upgrade</strong>
          <span>Found ${hasApiKey ? 'API key' : 'settings'} in insecure storage</span>
        </div>
        <div class="banner-actions">
          <button class="banner-btn banner-btn-primary" id="banner-migrate-now">
            Upgrade Now
          </button>
          <button class="banner-btn banner-btn-secondary" id="banner-migrate-later">
            Later
          </button>
          <button class="banner-close" id="banner-close" aria-label="Close notification">×</button>
        </div>
        ${options.showProgress ? '<div class="progress-bar" id="progress-bar"><div class="progress-fill"></div></div>' : ''}
      </div>
      <div class="banner-details" id="banner-details" style="display: none;">
        <div class="detail-section">
          <h4>Current Settings:</h4>
          <ul>
            ${hasApiKey ? '<li>✅ API Key detected</li>' : '<li>❌ No API key</li>'}
            ${hasModel ? `<li>✅ Model: ${existingData.ai_model}</li>` : '<li>❌ No model</li>'}
          </ul>
        </div>
        <div class="detail-section">
          <h4>Security Benefits:</h4>
          <ul>
            <li>🔐 AES-256 encryption</li>
            <li>💾 Secure persistent storage</li>
            <li>�️ Protected from scripts</li>
          </ul>
        </div>
      </div>
    `;

        document.body.appendChild(banner);

        // Play sound effect if enabled
        if (options.soundEnabled) {
            this.playNotificationSound('notification');
        }

        // Animate in
        setTimeout(() => banner.classList.add('visible'), 100);

        // Auto-dismiss timer
        let dismissTimer = null;
        let progressInterval = null;

        if (options.autoDismiss && options.dismissDelay > 0) {
            const startTime = Date.now();

            if (options.showProgress) {
                const progressBar = banner.querySelector('#progress-bar .progress-fill');
                progressInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.max(0, (elapsed / options.dismissDelay) * 100);
                    progressBar.style.width = `${100 - progress}%`;

                    if (progress >= 100) {
                        clearInterval(progressInterval);
                    }
                }, 100);
            }

            dismissTimer = setTimeout(() => {
                this.dismissNotification(banner, 'auto');
                resolve({ action: 'auto-dismiss', result: null });
            }, options.dismissDelay);
        }

        // Event handlers
        const clearTimers = () => {
            if (dismissTimer) {clearTimeout(dismissTimer);}
            if (progressInterval) {clearInterval(progressInterval);}
        };

        banner.querySelector('#banner-migrate-now').onclick = async () => {
            clearTimers();
            if (options.soundEnabled) {this.playNotificationSound('action');}
            banner.remove();
            const result = await this.migrateAPISettings();
            resolve({ action: 'migrate', result });
        };

        banner.querySelector('#banner-migrate-later').onclick = () => {
            clearTimers();
            if (options.soundEnabled) {this.playNotificationSound('dismiss');}
            banner.remove();
            localStorage.setItem('api_migration_reminder', Date.now() + (24 * 60 * 60 * 1000));
            resolve({ action: 'later', result: null });
        };

        banner.querySelector('#banner-close').onclick = () => {
            clearTimers();
            if (options.soundEnabled) {this.playNotificationSound('dismiss');}
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 300);
            resolve({ action: 'dismiss', result: null });
        };

        // Toggle details
        banner.querySelector('.banner-content').onclick = (e) => {
            if (!e.target.matches('button')) {
                const details = banner.querySelector('#banner-details');
                details.style.display = details.style.display === 'none' ? 'block' : 'none';
                if (options.soundEnabled) {this.playNotificationSound('toggle');}
            }
        };

        // Pause auto-dismiss on hover
        banner.addEventListener('mouseenter', () => {
            if (dismissTimer) {
                clearTimeout(dismissTimer);
                dismissTimer = null;
            }
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
        });

        banner.addEventListener('mouseleave', () => {
            if (options.autoDismiss && options.dismissDelay > 0) {
                dismissTimer = setTimeout(() => {
                    this.dismissNotification(banner, 'auto');
                    resolve({ action: 'auto-dismiss', result: null });
                }, options.dismissDelay);
            }
        });
    }

    /**
   * Corner slide-in notification
   */
    showCornerNotification(resolve, existingData, hasApiKey, hasModel, options = {}) {
        const corner = document.createElement('div');
        corner.className = 'api-migration-corner';
        corner.innerHTML = `
      <div class="corner-header">
        <span class="corner-icon">🔒</span>
        <span class="corner-title">Security Upgrade</span>
        <button class="corner-close" id="corner-close">×</button>
      </div>
      <div class="corner-content">
        <p>API settings found in insecure storage. Upgrade to secure encryption?</p>
        <div class="corner-stats">
          ${hasApiKey ? '<span class="stat-item">🔑 API Key</span>' : ''}
          ${hasModel ? `<span class="stat-item">🤖 ${existingData.ai_model}</span>` : ''}
        </div>
      </div>
      <div class="corner-actions">
        <button class="corner-btn corner-btn-secondary" id="corner-later">Later</button>
        <button class="corner-btn corner-btn-primary" id="corner-upgrade">Upgrade</button>
      </div>
    `;

        document.body.appendChild(corner);

        // Animate in
        setTimeout(() => corner.classList.add('visible'), 100);

        // Event handlers
        corner.querySelector('#corner-upgrade').onclick = async () => {
            corner.remove();
            const result = await this.migrateAPISettings();
            resolve({ action: 'migrate', result });
        };

        corner.querySelector('#corner-later').onclick = () => {
            corner.classList.remove('visible');
            setTimeout(() => corner.remove(), 300);
            localStorage.setItem('api_migration_reminder', Date.now() + (24 * 60 * 60 * 1000));
            resolve({ action: 'later', result: null });
        };

        corner.querySelector('#corner-close').onclick = () => {
            corner.classList.remove('visible');
            setTimeout(() => corner.remove(), 300);
            resolve({ action: 'dismiss', result: null });
        };
    }

    /**
   * Sidebar slide-in notification
   */
    showSidebarNotification(resolve, existingData, hasApiKey, hasModel, options = {}) {
        const sidebar = document.createElement('div');
        sidebar.className = 'api-migration-sidebar';
        sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3>🔒 API Security Upgrade</h3>
        <button class="sidebar-close" id="sidebar-close">×</button>
      </div>
      <div class="sidebar-content">
        <div class="sidebar-section">
          <h4>Current Risk</h4>
          <p>Your API settings are stored in browser localStorage without encryption.</p>
          <div class="risk-indicator">
            <span class="risk-level">⚠️ HIGH RISK</span>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h4>Settings Found</h4>
          <ul class="settings-list">
            ${hasApiKey ? '<li><span class="setting-icon">🔑</span> API Key detected</li>' : '<li><span class="setting-icon">❌</span> No API key</li>'}
            ${hasModel ? `<li><span class="setting-icon">🤖</span> Model: ${existingData.ai_model}</li>` : '<li><span class="setting-icon">❌</span> No model</li>'}
          </ul>
        </div>
        
        <div class="sidebar-section">
          <h4>Security Benefits</h4>
          <ul class="benefits-list">
            <li><span class="benefit-icon">🔐</span> AES-256 encryption</li>
            <li><span class="benefit-icon">💾</span> Persistent secure storage</li>
            <li><span class="benefit-icon">🛡️</span> Script protection</li>
            <li><span class="benefit-icon">🔒</span> Access control</li>
          </ul>
        </div>
      </div>
      
      <div class="sidebar-actions">
        <button class="sidebar-btn sidebar-btn-secondary" id="sidebar-later">
          <span>⏰</span> Remind Later
        </button>
        <button class="sidebar-btn sidebar-btn-primary" id="sidebar-upgrade">
          <span>🔒</span> Upgrade Now
        </button>
      </div>
    `;

        document.body.appendChild(sidebar);

        // Animate in
        setTimeout(() => sidebar.classList.add('visible'), 100);

        // Event handlers
        sidebar.querySelector('#sidebar-upgrade').onclick = async () => {
            sidebar.classList.remove('visible');
            setTimeout(async () => {
                sidebar.remove();
                const result = await this.migrateAPISettings();
                resolve({ action: 'migrate', result });
            }, 300);
        };

        sidebar.querySelector('#sidebar-later').onclick = () => {
            sidebar.classList.remove('visible');
            setTimeout(() => {
                sidebar.remove();
                localStorage.setItem('api_migration_reminder', Date.now() + (24 * 60 * 60 * 1000));
                resolve({ action: 'later', result: null });
            }, 300);
        };

        sidebar.querySelector('#sidebar-close').onclick = () => {
            sidebar.classList.remove('visible');
            setTimeout(() => sidebar.remove(), 300);
            resolve({ action: 'dismiss', result: null });
        };
    }

    /**
   * Check if user should be reminded about migration
   */
    shouldShowReminder() {
        try {
            const declined = localStorage.getItem('api_migration_declined');
            if (declined === 'true') {return false;}

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
   * Set notification style preference
   */
    setNotificationStyle(style) {
        if (['banner', 'corner', 'sidebar', 'modal'].includes(style)) {
            localStorage.setItem('api_migration_notification_style', style);
            console.log(`🔧 API migration notification style set to: ${style}`);
            return true;
        }
        console.warn(`⚠️ Invalid notification style: ${style}. Use: banner, corner, sidebar, or modal`);
        return false;
    }

    /**
   * Get current notification style preference
   */
    getNotificationStyle() {
        return localStorage.getItem('api_migration_notification_style') || 'banner';
    }

    /**
   * Save user preferences for notifications
   */
    saveNotificationPreferences(preferences) {
        try {
            const currentPrefs = this.getNotificationPreferences();
            const updatedPrefs = { ...currentPrefs, ...preferences };

            localStorage.setItem('api_migration_preferences', JSON.stringify(updatedPrefs));

            // Apply theme immediately if changed
            if (preferences.theme && preferences.theme !== currentPrefs.theme) {
                document.documentElement.setAttribute('data-theme', preferences.theme);
                const overlay = document.querySelector('.notification-preferences-overlay');
                if (overlay) {
                    overlay.setAttribute('data-theme', preferences.theme);
                }
            }

            console.log('✅ Notification preferences saved:', updatedPrefs);
            return true;
        } catch (error) {
            console.error('❌ Failed to save notification preferences:', error);
            return false;
        }
    }

    /**
   * Get user preferences for notifications
   */
    getNotificationPreferences() {
        try {
            const prefs = localStorage.getItem('api_migration_preferences');
            return prefs ? JSON.parse(prefs) : {
                style: 'banner',
                theme: 'default',
                autoDismiss: true,
                dismissDelay: 10000,
                soundEnabled: true,
                showProgress: false
            };
        } catch (error) {
            console.error('❌ Failed to load notification preferences:', error);
            return {
                style: 'banner',
                theme: 'default',
                autoDismiss: true,
                dismissDelay: 10000,
                soundEnabled: true,
                showProgress: false
            };
        }
    }

    /**
   * Enhanced error handling for migration process
   */
    async migrateAPISettingsWithRetry(maxRetries = 3) {
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Migration attempt ${attempt}/${maxRetries}`);
                const result = await this.migrateAPISettings();

                if (result.success) {
                    console.log('✅ Migration successful on attempt', attempt);
                    return result;
                } else {
                    throw new Error(result.error || 'Migration failed');
                }
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Migration attempt ${attempt} failed:`, error.message);

                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }

        console.error('❌ Migration failed after', maxRetries, 'attempts:', lastError);
        return {
            success: false,
            error: lastError.message,
            attempts: maxRetries
        };
    }

    /**
   * Performance optimization: Debounce rapid calls
   */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
   * Memory management: Clean up event listeners and timers
   */
    cleanup() {
        try {
            // Clear any pending timers
            if (this._autoMigrationTimer) {
                clearTimeout(this._autoMigrationTimer);
                this._autoMigrationTimer = null;
            }

            // Remove any lingering notification elements
            const notifications = document.querySelectorAll('.api-migration-banner, .api-migration-corner, .api-migration-sidebar');
            notifications.forEach(notification => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });

            console.log('🧹 Notification system cleaned up');
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
        }
    }

    /**
   * Show preferences panel for notification customization
   */
    showPreferencesPanel() {
        const prefs = this.getNotificationPreferences();

        const panel = document.createElement('div');
        panel.className = 'notification-preferences-overlay';
        panel.innerHTML = `
      <div class="preferences-panel">
        <div class="preferences-header">
          <h3>🔧 Notification Preferences</h3>
          <button class="preferences-close" id="prefs-close" aria-label="Close preferences">×</button>
        </div>
        
        <div class="preferences-content">
          <div class="pref-section">
            <h4>🎨 Appearance</h4>
            <div class="pref-group">
              <label for="pref-style">Notification Style:</label>
              <select id="pref-style">
                <option value="banner" ${prefs.style === 'banner' ? 'selected' : ''}>Banner (Top)</option>
                <option value="corner" ${prefs.style === 'corner' ? 'selected' : ''}>Corner Slide-in</option>
                <option value="sidebar" ${prefs.style === 'sidebar' ? 'selected' : ''}>Sidebar Panel</option>
              </select>
            </div>
            
            <div class="pref-group">
              <label for="pref-theme">Theme:</label>
              <select id="pref-theme">
                <option value="default" ${prefs.theme === 'default' ? 'selected' : ''}>Default</option>
                <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="blue" ${prefs.theme === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="green" ${prefs.theme === 'green' ? 'selected' : ''}>Green</option>
              </select>
            </div>
          </div>
          
          <div class="pref-section">
            <h4>⏰ Behavior</h4>
            <div class="pref-group">
              <label class="checkbox-label">
                <input type="checkbox" id="pref-autodismiss" ${prefs.autoDismiss ? 'checked' : ''}>
                Auto-dismiss notifications
              </label>
            </div>
            
            <div class="pref-group">
              <label for="pref-delay">Auto-dismiss delay (seconds):</label>
              <input type="number" id="pref-delay" value="${prefs.dismissDelay / 1000}" min="3" max="30">
            </div>
            
            <div class="pref-group">
              <label class="checkbox-label">
                <input type="checkbox" id="pref-progress" ${prefs.showProgress ? 'checked' : ''}>
                Show progress bar
              </label>
            </div>
          </div>
          
          <div class="pref-section">
            <h4>🔊 Audio</h4>
            <div class="pref-group">
              <label class="checkbox-label">
                <input type="checkbox" id="pref-sound" ${prefs.soundEnabled ? 'checked' : ''}>
                Enable sound effects
              </label>
            </div>
            
            <div class="pref-group">
              <button class="test-sound-btn" id="test-notification-sound">🔊 Test Notification</button>
              <button class="test-sound-btn" id="test-action-sound">✅ Test Action</button>
              <button class="test-sound-btn" id="test-dismiss-sound">❌ Test Dismiss</button>
            </div>
          </div>
        </div>
        
        <div class="preferences-actions">
          <button class="btn-secondary" id="prefs-reset">Reset to Defaults</button>
          <button class="btn-primary" id="prefs-save">Save Preferences</button>
        </div>
      </div>
    `;

        document.body.appendChild(panel);
        setTimeout(() => panel.classList.add('visible'), 100);

        // Event handlers
        panel.querySelector('#prefs-close').onclick = () => {
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
        };

        panel.querySelector('#prefs-save').onclick = () => {
            const newPrefs = {
                style: panel.querySelector('#pref-style').value,
                theme: panel.querySelector('#pref-theme').value,
                autoDismiss: panel.querySelector('#pref-autodismiss').checked,
                dismissDelay: parseInt(panel.querySelector('#pref-delay').value) * 1000,
                showProgress: panel.querySelector('#pref-progress').checked,
                soundEnabled: panel.querySelector('#pref-sound').checked
            };

            if (this.saveNotificationPreferences(newPrefs)) {
                panel.classList.remove('visible');
                setTimeout(() => panel.remove(), 300);
                console.log('✅ Preferences saved successfully');
            }
        };

        panel.querySelector('#prefs-reset').onclick = () => {
            localStorage.removeItem('api_migration_preferences');
            panel.classList.remove('visible');
            setTimeout(() => panel.remove(), 300);
            console.log('🔄 Preferences reset to defaults');
        };

        // Sound test buttons
        panel.querySelector('#test-notification-sound').onclick = () => {
            this.playNotificationSound('notification');
        };

        panel.querySelector('#test-action-sound').onclick = () => {
            this.playNotificationSound('action');
        };

        panel.querySelector('#test-dismiss-sound').onclick = () => {
            this.playNotificationSound('dismiss');
        };
    }

    /**
   * Initialize keyboard shortcuts for testing and preferences
   */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+M: Show migration notification
            if (event.ctrlKey && event.shiftKey && event.key === 'M') {
                event.preventDefault();
                console.log('🔧 Keyboard shortcut: Show migration notification');
                this.showMigrationPrompt({
                    title: 'Test Migration Notification',
                    message: 'This is a test of the enhanced notification system with sound effects and auto-dismiss.',
                    type: 'info',
                    soundEnabled: true,
                    autoDismiss: true,
                    showProgress: true
                });
            }

            // Ctrl+Shift+P: Show preferences panel
            if (event.ctrlKey && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                console.log('🔧 Keyboard shortcut: Show preferences panel');
                this.showPreferencesPanel();
            }

            // Ctrl+Shift+T: Test all notification types
            if (event.ctrlKey && event.shiftKey && event.key === 'T') {
                event.preventDefault();
                console.log('🔧 Keyboard shortcut: Test all notification types');
                this.testAllNotificationTypes();
            }

            // Ctrl+Shift+D: Show notification demo
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                console.log('🔧 Keyboard shortcut: Show notification demo');
                this.showNotificationDemo();
            }

            // Ctrl+Shift+H: Show help dialog
            if (event.ctrlKey && event.shiftKey && event.key === 'H') {
                event.preventDefault();
                console.log('🔧 Keyboard shortcut: Show help dialog');
                this.showHelpDialog();
            }
        });

        console.log('⌨️ Keyboard shortcuts initialized:');
        console.log('  Ctrl+Shift+M: Show test migration notification');
        console.log('  Ctrl+Shift+P: Show preferences panel');
        console.log('  Ctrl+Shift+T: Test all notification types');
        console.log('  Ctrl+Shift+D: Show notification demo');
        console.log('  Ctrl+Shift+H: Show help dialog');
    }

    /**
   * Show help dialog with keyboard shortcuts and features
   */
    showHelpDialog() {
        const helpDialog = document.createElement('div');
        helpDialog.className = 'notification-help-overlay';
        helpDialog.innerHTML = `
      <div class="help-dialog">
        <div class="help-header">
          <h2>🎯 Enhanced Notification System Help</h2>
          <button class="help-close" id="help-close" aria-label="Close help">×</button>
        </div>
        
        <div class="help-content">
          <section class="help-section">
            <h3>⌨️ Keyboard Shortcuts</h3>
            <div class="shortcut-list">
              <div class="shortcut-item">
                <kbd>Ctrl+Shift+M</kbd>
                <span>Show test migration notification</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl+Shift+P</kbd>
                <span>Open preferences panel</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl+Shift+T</kbd>
                <span>Test all notification types</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl+Shift+D</kbd>
                <span>Show notification demo</span>
              </div>
              <div class="shortcut-item">
                <kbd>Ctrl+Shift+H</kbd>
                <span>Show this help dialog</span>
              </div>
            </div>
          </section>
          
          <section class="help-section">
            <h3>🎨 Features</h3>
            <ul class="feature-list">
              <li><strong>Sound Effects:</strong> Audio feedback for different notification types</li>
              <li><strong>Auto-Dismiss:</strong> Notifications can automatically disappear after a set time</li>
              <li><strong>Progress Bars:</strong> Visual countdown for auto-dismissing notifications</li>
              <li><strong>Themes:</strong> Multiple visual themes (Default, Dark, Light, Blue, Green)</li>
              <li><strong>Multiple Styles:</strong> Banner, corner slide-in, and sidebar panel layouts</li>
              <li><strong>User Preferences:</strong> All settings are saved and persist across sessions</li>
              <li><strong>Accessibility:</strong> ARIA labels, keyboard navigation, and screen reader support</li>
              <li><strong>Performance:</strong> Debounced operations and automatic cleanup</li>
            </ul>
          </section>
          
          <section class="help-section">
            <h3>🔧 Customization</h3>
            <p>Use the preferences panel (<kbd>Ctrl+Shift+P</kbd>) to customize:</p>
            <ul class="customization-list">
              <li>Notification style and position</li>
              <li>Theme selection</li>
              <li>Auto-dismiss behavior and timing</li>
              <li>Sound effect preferences</li>
              <li>Progress bar visibility</li>
            </ul>
          </section>
          
          <section class="help-section">
            <h3>🧪 Testing</h3>
            <p>For development and testing:</p>
            <ul class="testing-list">
              <li><kbd>Ctrl+Shift+D</kbd> - Run the full feature demo</li>
              <li><kbd>Ctrl+Shift+T</kbd> - Test all notification types</li>
              <li><kbd>Ctrl+Shift+M</kbd> - Quick notification test</li>
            </ul>
          </section>
        </div>
        
        <div class="help-actions">
          <button class="btn-secondary" id="help-demo">🎭 Run Demo</button>
          <button class="btn-primary" id="help-preferences">🔧 Open Preferences</button>
        </div>
      </div>
    `;

        document.body.appendChild(helpDialog);
        setTimeout(() => helpDialog.classList.add('visible'), 100);

        // Event handlers
        helpDialog.querySelector('#help-close').onclick = () => {
            helpDialog.classList.remove('visible');
            setTimeout(() => helpDialog.remove(), 300);
        };

        helpDialog.querySelector('#help-demo').onclick = () => {
            helpDialog.classList.remove('visible');
            setTimeout(() => {
                helpDialog.remove();
                this.showNotificationDemo();
            }, 300);
        };

        helpDialog.querySelector('#help-preferences').onclick = () => {
            helpDialog.classList.remove('visible');
            setTimeout(() => {
                helpDialog.remove();
                this.showPreferencesPanel();
            }, 300);
        };
    }

    /**
   * Show a comprehensive demo of all notification features
   */
    showNotificationDemo() {
        console.log('🎭 Starting notification system demo...');

        // Demo sequence with different features
        const demoSteps = [
            {
                delay: 0,
                title: 'Welcome to Enhanced Notifications!',
                message: 'This demo will showcase all the advanced features of the notification system.',
                type: 'info',
                soundEnabled: true,
                autoDismiss: false,
                showProgress: false
            },
            {
                delay: 3000,
                title: 'Sound Effects Demo',
                message: 'Notifications can play different sounds for different actions.',
                type: 'success',
                soundEnabled: true,
                autoDismiss: true,
                showProgress: true
            },
            {
                delay: 6000,
                title: 'Auto-Dismiss with Progress',
                message: 'This notification will auto-dismiss in 5 seconds with a progress bar.',
                type: 'warning',
                soundEnabled: true,
                autoDismiss: true,
                showProgress: true,
                dismissDelay: 5000
            },
            {
                delay: 12000,
                title: 'Theme Support',
                message: 'Notifications support multiple themes and can be customized in preferences.',
                type: 'info',
                soundEnabled: true,
                autoDismiss: true,
                showProgress: false
            },
            {
                delay: 15000,
                title: 'Demo Complete!',
                message: 'Use Ctrl+Shift+P to open preferences and customize your notification experience.',
                type: 'success',
                soundEnabled: true,
                autoDismiss: false,
                showProgress: false
            }
        ];

        demoSteps.forEach(step => {
            setTimeout(() => {
                this.showMigrationPrompt(step);
            }, step.delay);
        });

        console.log('✅ Notification demo started - watch for the sequence of notifications!');
    }

    /**
   * Test all notification types for INFOging
   */
    testAllNotificationTypes() {
        const types = ['success', 'error', 'warning', 'info'];
        const messages = {
            success: 'Migration completed successfully! All settings have been transferred.',
            error: 'Migration failed. Please check your API settings and try again.',
            warning: 'Migration partially completed. Some settings may need manual review.',
            info: 'Migration in progress. Please wait while we transfer your settings.'
        };

        types.forEach((type, index) => {
            setTimeout(() => {
                this.showMigrationPrompt({
                    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Test`,
                    message: messages[type],
                    type,
                    soundEnabled: true,
                    autoDismiss: true,
                    showProgress: true
                });
            }, index * 2000); // Stagger notifications by 2 seconds
        });
    }

    /**
   * Initialize user preferences and apply theme
   */
    initializePreferences() {
        const prefs = this.getNotificationPreferences();

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', prefs.theme);

        // Apply theme to preferences overlay if it exists
        const overlay = document.querySelector('.notification-preferences-overlay');
        if (overlay) {
            overlay.setAttribute('data-theme', prefs.theme);
        }

        console.log('🎨 Preferences initialized:', prefs);
    }

    /**
   * Initialize automatic migration check with user preferences
   */
    async initAutoMigration(notificationStyle = null) {
        try {
            const initialized = await this.init();
            if (!initialized) {
                console.warn('⚠️ Secure storage not available - migration disabled');
                return false;
            }

            // Use provided style or load from preferences
            const style = notificationStyle || this.getNotificationPreferences().style;

            if (this.shouldShowReminder()) {
                // Debounce to prevent rapid successive calls
                const debouncedShow = this.debounce(() => {
                    const prefs = this.getNotificationPreferences();
                    this.showMigrationPrompt(style, prefs).then(result => {
                        console.log('🔒 API migration prompt result:', result);

                        if (result.action === 'migrate' && result.result?.success) {
                            // Notify other systems about successful migration
                            window.dispatchEvent(new CustomEvent('apiMigrationComplete', {
                                detail: result.result
                            }));
                        }
                    }).catch(error => {
                        console.error('❌ Migration prompt failed:', error);
                    });
                }, 500);

                // Show migration prompt after a short delay
                this._autoMigrationTimer = setTimeout(debouncedShow, 2000);
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
/* ===== THEMES ===== */
.api-migration-banner.theme-dark {
  background: linear-gradient(135deg, #2d2d30 0%, #1e1e1e 100%);
  border: 1px solid #3e3e42;
  color: #cccccc;
}

.api-migration-banner.theme-light {
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  border: 1px solid #e5e5e5;
  color: #1e1e1e;
}

.api-migration-banner.theme-blue {
  background: linear-gradient(135deg, #005a9e 0%, #004275 100%);
  border: 1px solid #007acc;
  color: #ffffff;
}

.api-migration-banner.theme-green {
  background: linear-gradient(135deg, #0e7a0d 0%, #0a5f0a 100%);
  border: 1px solid #4ade80;
  color: #ffffff;
}

/* ===== PROGRESS BAR ===== */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
  width: 100%;
  transition: width 0.1s linear;
  animation: progress-shine 2s ease-in-out infinite;
}

@keyframes progress-shine {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* ===== ACCESSIBILITY IMPROVEMENTS ===== */
.banner-btn:focus,
.banner-close:focus,
.corner-btn:focus,
.corner-close:focus,
.sidebar-btn:focus,
.sidebar-close:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}

.banner-content[aria-expanded="true"] .banner-details,
.banner-content[aria-expanded="false"] .banner-details {
  transition: all 0.3s ease;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 600px) {
  .api-migration-banner {
    font-size: 13px;
  }
  
  .banner-content {
    padding: 10px 15px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .banner-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .banner-btn {
    flex: 1;
    padding: 6px 8px;
    font-size: 12px;
  }
}

/* ===== ANIMATION IMPROVEMENTS ===== */
.api-migration-banner.visible {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-details {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  min-height: 48px;
}

.banner-icon {
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.banner-text strong {
  font-size: 14px;
  font-weight: 600;
}

.banner-text span {
  font-size: 12px;
  opacity: 0.9;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.banner-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.banner-btn-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.banner-btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.banner-btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.banner-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.banner-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  margin-left: 8px;
}

.banner-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.banner-details {
  background: var(--vscode-notifications-background, #0e639c);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 20px;
  display: flex;
  gap: 24px;
}

.detail-section {
  flex: 1;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
}

.detail-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-section li {
  font-size: 12px;
  margin-bottom: 4px;
  opacity: 0.9;
}

/* ===== CORNER NOTIFICATION ===== */
.api-migration-corner {
  position: fixed;
  top: 20px;
  right: -400px;
  width: 350px;
  background: var(--vscode-notifications-background, #f8f8f8);
  border: 1px solid var(--vscode-notifications-border, #e5e5e5);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  transition: right 0.3s ease;
  font-family: var(--vscode-font-family);
}

.api-migration-corner.visible {
  right: 20px;
}

.corner-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vscode-notifications-border, #e5e5e5);
  background: var(--vscode-notificationsInfoIcon-foreground, #3794ff);
  color: white;
  border-radius: 8px 8px 0 0;
}

.corner-icon {
  font-size: 16px;
  margin-right: 8px;
}

.corner-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
}

.corner-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.corner-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.corner-content {
  padding: 16px;
}

.corner-content p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--vscode-notifications-foreground, #1e1e1e);
  line-height: 1.4;
}

.corner-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  background: var(--vscode-notificationsInfoIcon-foreground, #3794ff);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.corner-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--vscode-notifications-border, #e5e5e5);
  background: var(--vscode-notifications-background, #f8f8f8);
  border-radius: 0 0 8px 8px;
}

.corner-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vscode-button-border, #cccccc);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.corner-btn-primary {
  background: var(--vscode-button-background, #007acc);
  color: var(--vscode-button-foreground, white);
  border-color: var(--vscode-button-border, #007acc);
}

.corner-btn-primary:hover {
  background: var(--vscode-button-hoverBackground, #005a9e);
}

.corner-btn-secondary {
  background: var(--vscode-button-secondaryBackground, #f8f8f8);
  color: var(--vscode-button-secondaryForeground, #1e1e1e);
}

.corner-btn-secondary:hover {
  background: var(--vscode-button-secondaryHoverBackground, #e8e8e8);
}

/* ===== SIDEBAR NOTIFICATION ===== */
.api-migration-sidebar {
  position: fixed;
  top: 0;
  right: -450px;
  width: 400px;
  height: 100vh;
  background: var(--vscode-sideBar-background, #f3f3f3);
  border-left: 1px solid var(--vscode-sideBar-border, #e5e5e5);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  transition: right 0.3s ease;
  font-family: var(--vscode-font-family);
  display: flex;
  flex-direction: column;
}

.api-migration-sidebar.visible {
  right: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--vscode-sideBar-border, #e5e5e5);
  background: var(--vscode-titleBar-activeBackground, #ffffff);
}

.sidebar-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vscode-titleBar-activeForeground, #1e1e1e);
}

.sidebar-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  color: var(--vscode-titleBar-activeForeground, #1e1e1e);
}

.sidebar-close:hover {
  background: var(--vscode-toolbar-hoverBackground, #e8e8e8);
}

.sidebar-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--vscode-sideBarTitle-foreground, #1e1e1e);
}

.sidebar-section p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--vscode-sideBar-foreground, #6c6c6c);
  line-height: 1.4;
}

.risk-indicator {
  display: inline-block;
  background: var(--vscode-inputValidation-warningBackground, #fff3cd);
  border: 1px solid var(--vscode-inputValidation-warningBorder, #ffecb5);
  border-radius: 4px;
  padding: 6px 12px;
}

.risk-level {
  color: var(--vscode-inputValidation-warningForeground, #856404);
  font-size: 12px;
  font-weight: 600;
}

.settings-list, .benefits-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.settings-list li, .benefits-list li {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--vscode-sideBar-foreground, #6c6c6c);
}

.setting-icon, .benefit-icon {
  margin-right: 8px;
  font-size: 14px;
}

.sidebar-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--vscode-sideBar-border, #e5e5e5);
  background: var(--vscode-titleBar-activeBackground, #ffffff);
  display: flex;
  gap: 12px;
}

.sidebar-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--vscode-button-border, #cccccc);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-btn-primary {
  background: var(--vscode-button-background, #007acc);
  color: var(--vscode-button-foreground, white);
  border-color: var(--vscode-button-border, #007acc);
}

.sidebar-btn-primary:hover {
  background: var(--vscode-button-hoverBackground, #005a9e);
}

.sidebar-btn-secondary {
  background: var(--vscode-button-secondaryBackground, #f8f8f8);
  color: var(--vscode-button-secondaryForeground, #1e1e1e);
}

.sidebar-btn-secondary:hover {
  background: var(--vscode-button-secondaryHoverBackground, #e8e8e8);
}

/* ===== LEGACY MODAL (for compatibility) ===== */
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
        const prefs = window.apiSettingsMigration.getNotificationPreferences();
        window.apiSettingsMigration.initAutoMigration(prefs.style);
    });
} else {
    const prefs = window.apiSettingsMigration.getNotificationPreferences();
    window.apiSettingsMigration.initAutoMigration(prefs.style);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.apiSettingsMigration) {
        window.apiSettingsMigration.cleanup();
    }
});

// Add keyboard shortcuts for testing
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+M: Test migration notification
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        const prefs = window.apiSettingsMigration.getNotificationPreferences();
        window.apiSettingsMigration.showMigrationPrompt(prefs.style, prefs);
    }

    // Ctrl+Shift+P: Open preferences
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        window.apiSettingsMigration.showPreferencesPanel();
    }
});

console.log('✅ API Settings Migration Helper loaded');


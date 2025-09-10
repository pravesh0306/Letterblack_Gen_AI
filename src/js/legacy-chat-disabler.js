// js/legacy-chat-disabler.js
// Disables old localStorage-based chat system to prevent conflicts

class LegacyChatDisabler {
    constructor() {
        this.disabledComponents = [];
    }

    /**
   * Disable old chat system components
   */
    disableLegacyChat() {
        try {
            console.log('🔧 Disabling legacy chat components...');

            // Disable old chat history functions in ui-bootstrap.js
            this.disableUIBootstrapChat();

            // Disable standalone chat-history.js
            this.disableStandaloneChatHistory();

            // Prevent localStorage observers
            this.disableLocalStorageObservers();

            // Override old functions with warnings
            this.overrideOldFunctions();

            console.log('✅ Legacy chat system disabled');
            console.log('📋 Disabled components:', this.disabledComponents);

        } catch (error) {
            console.warn('⚠️ Failed to disable some legacy components:', error);
        }
    }

    /**
   * Disable chat functions in ui-bootstrap.js
   */
    disableUIBootstrapChat() {
    // Override the initChatHistory function if it exists globally
        if (window.initChatHistory) {
            const original = window.initChatHistory;
            window.initChatHistory = () => {
                console.log('🚫 Legacy initChatHistory() disabled - using new storage system');
            };
            this.disabledComponents.push('ui-bootstrap.initChatHistory');
        }

        // Disable jQuery-based chat functions if they exist
        if (window.$ && typeof window.$ === 'function') {
            const chatMessages = $('#chat-messages');
            if (chatMessages.length > 0) {
                // Remove old MutationObserver if it exists
                chatMessages.each(function() {
                    if (this._chatObserver) {
                        this._chatObserver.disconnect();
                        delete this._chatObserver;
                        console.log('🔌 Disconnected old MutationObserver');
                    }
                });
            }
        }
    }

    /**
   * Disable standalone chat-history.js functionality
   */
    disableStandaloneChatHistory() {
    // Override localStorage access for old chat history
        const originalGetItem = localStorage.getItem.bind(localStorage);
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const originalRemoveItem = localStorage.removeItem.bind(localStorage);

        // Intercept ae_chat_history access and redirect warnings
        localStorage.getItem = function(key) {
            if (key === 'ae_chat_history') {
                console.warn('🚫 Legacy localStorage access blocked for \'ae_chat_history\' - use new storage system');
                return null;
            }
            return originalGetItem(key);
        };

        localStorage.setItem = function(key, value) {
            if (key === 'ae_chat_history') {
                console.warn('🚫 Legacy localStorage write blocked for \'ae_chat_history\' - use new storage system');
                return;
            }
            return originalSetItem(key, value);
        };

        localStorage.removeItem = function(key) {
            if (key === 'ae_chat_history') {
                console.warn('🚫 Legacy localStorage removal blocked for \'ae_chat_history\' - use new storage system');
                return;
            }
            return originalRemoveItem(key);
        };

        this.disabledComponents.push('localStorage.ae_chat_history');
    }

    /**
   * Disable old MutationObserver instances
   */
    disableLocalStorageObservers() {
    // Find and disable any observers watching chat messages
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages._observers) {
            chatMessages._observers.forEach(observer => {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                    console.log('🔌 Disconnected legacy MutationObserver');
                }
            });
            delete chatMessages._observers;
            this.disabledComponents.push('MutationObserver instances');
        }
    }

    /**
   * Override old function calls with warnings
   */
    overrideOldFunctions() {
    // Create warnings for common old functions
        const deprecatedFunctions = {
            'getChatHistory': () => {
                console.warn('🚫 getChatHistory() is deprecated - use chatStore.getConversationList()');
                return [];
            },
            'saveChatHistory': () => {
                console.warn('🚫 saveChatHistory() is deprecated - use chatStore.appendMessage()');
            },
            'clearChatHistory': () => {
                console.warn('🚫 clearChatHistory() is deprecated - use chatStore.clearAll()');
            }
        };

        Object.keys(deprecatedFunctions).forEach(funcName => {
            if (window[funcName]) {
                window[funcName] = deprecatedFunctions[funcName];
                this.disabledComponents.push(`global.${funcName}`);
            }
        });
    }

    /**
   * Provide migration information to users
   */
    showMigrationInfo() {
        if (window.SimpleToast) {
            window.SimpleToast.show(
                '🔄 Chat system upgraded! Your history has been migrated to persistent storage.',
                'info',
                5000
            );
        }
    }

    /**
   * Re-enable legacy system (for rollback if needed)
   */
    enableLegacyChat() {
        console.log('🔙 Re-enabling legacy chat system...');
        // Note: This would require storing original functions
        // For simplicity, recommend page reload for rollback
        console.log('💡 To re-enable legacy system, reload the page and disable storage-integration.js');
    }

    /**
   * Check if legacy system is still active
   */
    isLegacyActive() {
        try {
            const hasOldData = localStorage.getItem('ae_chat_history');
            const hasOldObservers = document.getElementById('chat-messages')?._observers;
            const hasOldFunctions = typeof window.initChatHistory === 'function';

            return !!(hasOldData || hasOldObservers || hasOldFunctions);
        } catch (error) {
            return false;
        }
    }

    /**
   * Get disabled components report
   */
    getReport() {
        return {
            timestamp: new Date().toISOString(),
            disabledComponents: this.disabledComponents,
            legacyStillActive: this.isLegacyActive()
        };
    }
}

// Create global instance and auto-disable
window.legacyChatDisabler = new LegacyChatDisabler();

// Auto-disable when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.legacyChatDisabler.disableLegacyChat();
    });
} else {
    // DOM already loaded
    window.legacyChatDisabler.disableLegacyChat();
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LegacyChatDisabler;
}


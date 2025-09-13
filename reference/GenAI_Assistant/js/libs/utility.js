/**
 * Utility functions for Gen.AI Assistant Extension
 */

// Logger for consistent formatting and debugging
const Logger = {
    levels: {
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR',
        SUCCESS: 'SUCCESS'
    },
    
    log: function(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };
        
        console.log(`[${timestamp}] [${level}] ${message}`);
        
        if (data) {
            console.log(data);
        }
        
        // Could also write to debug.log file through ExtendScript
        return logEntry;
    },
    
    info: function(message, data = null) {
        return this.log(this.levels.INFO, message, data);
    },
    
    warning: function(message, data = null) {
        return this.log(this.levels.WARNING, message, data);
    },
    
    error: function(message, data = null) {
        return this.log(this.levels.ERROR, message, data);
    },
    
    success: function(message, data = null) {
        return this.log(this.levels.SUCCESS, message, data);
    }
};

// API request helper
const ApiClient = {
    async request(url, options) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            Logger.error('API request failed', error);
            throw error;
        }
    },
    
    async getWithAuth(url, apiKey, additionalHeaders = {}) {
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...additionalHeaders
        };
        
        return this.request(url, {
            method: 'GET',
            headers
        });
    },
    
    async postWithAuth(url, apiKey, body, additionalHeaders = {}) {
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...additionalHeaders
        };
        
        return this.request(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
    }
};

// Storage helper for persistent settings
const Storage = {
    get: function(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            Logger.error(`Error retrieving ${key} from storage`, error);
            return defaultValue;
        }
    },
    
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            Logger.error(`Error saving ${key} to storage`, error);
            return false;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            Logger.error(`Error removing ${key} from storage`, error);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            Logger.error('Error clearing storage', error);
            return false;
        }
    }
};

// UI helper functions
const UI = {
    showLoading: function(elementId, message = 'Loading...') {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('loading');
            element.setAttribute('data-loading-message', message);
        }
    },
    
    hideLoading: function(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('loading');
        }
    },
    
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Wait for fade out animation
        }, duration);
    },
    
    updateTabVisibility: function(selectedTabId) {
        // Hide all tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab content
        const selectedTab = document.getElementById(selectedTabId);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === selectedTabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
};

// Exports
window.GenAI = window.GenAI || {};
window.GenAI.Logger = Logger;
window.GenAI.ApiClient = ApiClient;
window.GenAI.Storage = Storage;
window.GenAI.UI = UI;

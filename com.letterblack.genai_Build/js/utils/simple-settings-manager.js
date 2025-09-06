/**
 * SimpleSettingsManager - Essential settings management for AI Extension
 * Provides reliable storage and retrieval of API keys and configuration
 */

class SimpleSettingsManager {
    constructor() {
        this.storageKey = 'ae_genai_settings';
        this.settings = this.loadSettings();
        console.log('⚙️ SimpleSettingsManager initialized');
    }

    /**
     * Get current settings with fallback defaults
     */
    getSettings() {
        return {
            apiKey: this.settings.apiKey || '',
            provider: this.settings.provider || 'google',
            model: this.settings.model || 'gemini-1.5-flash',
            temperature: this.settings.temperature || 0.7,
            maxTokens: this.settings.maxTokens || 2048,
            context: this.settings.context || '',
            ...this.settings
        };
    }

    /**
     * Get individual setting value (compatibility method)
     */
    get(key) {
        const settings = this.getSettings();
        return settings[key];
    }

    /**
     * Update settings and persist to storage
     */
    updateSettings(newSettings) {
        try {
            this.settings = { ...this.settings, ...newSettings };
            
            // Try multiple storage methods for reliability
            this.saveToLocalStorage();
            this.saveToCEPStorage();
            
            console.log('✅ Settings updated successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to update settings:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Load settings from storage with fallbacks
     */
    loadSettings() {
        try {
            // Try localStorage first
            const localData = localStorage.getItem(this.storageKey);
            if (localData) {
                const parsed = JSON.parse(localData);
                console.log('📥 Settings loaded from localStorage');
                return parsed;
            }

            // Try CEP storage if available
            if (window.cepStorage) {
                const cepData = window.cepStorage.loadSettings();
                if (cepData && Object.keys(cepData).length > 0) {
                    console.log('📥 Settings loaded from CEP storage');
                    return cepData;
                }
            }

            console.log('📝 Using default settings');
            return {};
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
            return {};
        }
    }

    /**
     * Save to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.warn('⚠️ LocalStorage save failed:', error);
        }
    }

    /**
     * Save to CEP storage if available
     */
    saveToCEPStorage() {
        try {
            if (window.cepStorage && typeof window.cepStorage.saveSettings === 'function') {
                window.cepStorage.saveSettings(this.settings);
            }
        } catch (error) {
            console.warn('⚠️ CEP storage save failed:', error);
        }
    }

    /**
     * Get API key specifically
     */
    getAPIKey() {
        return this.settings.apiKey || '';
    }

    /**
     * Set API key specifically
     */
    setAPIKey(apiKey) {
        return this.updateSettings({ apiKey: apiKey });
    }

    /**
     * Clear all settings
     */
    clearSettings() {
        try {
            this.settings = {};
            localStorage.removeItem(this.storageKey);
            if (window.cepStorage && typeof window.cepStorage.clearSettings === 'function') {
                window.cepStorage.clearSettings();
            }
            console.log('🗑️ Settings cleared');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to clear settings:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Export settings for backup
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Import settings from backup
     */
    importSettings(settingsJson) {
        try {
            const imported = JSON.parse(settingsJson);
            return this.updateSettings(imported);
        } catch (error) {
            console.error('❌ Failed to import settings:', error);
            return { success: false, error: 'Invalid JSON format' };
        }
    }

    /**
     * Health check for settings system
     */
    healthCheck() {
        const checks = {
            localStorage: true,
            cepStorage: !!window.cepStorage,
            hasAPIKey: !!this.settings.apiKey,
            hasProvider: !!this.settings.provider,
            settingsCount: Object.keys(this.settings).length
        };

        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (error) {
            checks.localStorage = false;
        }

        return checks;
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.SimpleSettingsManager = SimpleSettingsManager;
    
    // Auto-initialize if not already done
    if (!window.settingsManager) {
        window.settingsManager = new SimpleSettingsManager();
        console.log('🚀 Global settingsManager created automatically');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleSettingsManager;
}

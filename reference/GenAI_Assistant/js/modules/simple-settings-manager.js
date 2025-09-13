/**
 * SIMPLIFIED Settings Manager - Essential functionality only
 * Replaces complex preference system with simple, working solution
 */

class SimpleSettingsManager {
    constructor() {
        this._memoryStore = {}; // fallback storage when localStorage unavailable
        this.settings = this.loadSettings();
        // Only initialize UI when running in a browser/CEP environment
        if (typeof document !== 'undefined') {
            this.initializeUI();
        }
        console.log('⚙️ Simple Settings Manager initialized');
    }

    /**
     * Load settings from localStorage with sensible defaults
     */
    loadSettings() {
        try {
            if (typeof localStorage === 'undefined') {
                // Node/test environment fallback
                const savedMem = this._memoryStore['ae_ai_settings'];
                return savedMem ? JSON.parse(savedMem) : this.getDefaults();
            }
            const saved = localStorage.getItem('ae_ai_settings');
            return saved ? JSON.parse(saved) : this.getDefaults();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaults();
        }
    }

    /**
     * Simple default settings - only what's actually needed
     */
    getDefaults() {
        return {
            provider: 'google',
            apiKey: '',
            model: 'gemini-1.5-flash-latest',
            temperature: 0.7,
            maxTokens: 2048,
            contextMemory: '',
            mascotEnabled: true
        };
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            if (typeof localStorage === 'undefined') {
                this._memoryStore['ae_ai_settings'] = JSON.stringify(this.settings);
            } else {
                localStorage.setItem('ae_ai_settings', JSON.stringify(this.settings));
            }
            if (typeof document !== 'undefined') {
                this.showFeedback('Settings saved successfully', 'success');
            }
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            if (typeof document !== 'undefined') {
                this.showFeedback('Failed to save settings', 'error');
            }
            return false;
        }
    }

    /**
     * Initialize UI with current settings
     */
    initializeUI() {
        // Wait for DOM to be ready
    if (typeof document === 'undefined') return; // safety for tests
    if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupUI());
        } else {
            this.setupUI();
        }
    }

    /**
     * Set up UI elements and event handlers
     */
    setupUI() {
        // Load current values into UI
    const providerSelect = typeof document !== 'undefined' ? document.getElementById('ai-provider') : null;
    const apiKeyInput = typeof document !== 'undefined' ? document.getElementById('api-key-setting') : null;
    const modelSelect = typeof document !== 'undefined' ? document.getElementById('model-select-setting') : null;
    const memoryTextarea = typeof document !== 'undefined' ? document.getElementById('memory-textarea') : null;
    const mascotCheckbox = typeof document !== 'undefined' ? document.getElementById('mascot-enabled-setting') : null;

        if (providerSelect) {
            providerSelect.value = this.settings.provider;
            providerSelect.addEventListener('change', (e) => {
                this.settings.provider = e.target.value;
                this.updateModelOptions();
                this.saveSettings();
            });
        }

        if (apiKeyInput) {
            apiKeyInput.value = this.settings.apiKey;
            apiKeyInput.addEventListener('input', (e) => {
                this.settings.apiKey = e.target.value;
                // Auto-save API key changes
                setTimeout(() => this.saveSettings(), 500);
            });
        }

        if (modelSelect) {
            modelSelect.value = this.settings.model;
            modelSelect.addEventListener('change', (e) => {
                this.settings.model = e.target.value;
                this.saveSettings();
            });
        }

        if (memoryTextarea) {
            memoryTextarea.value = this.settings.contextMemory || '';
            memoryTextarea.addEventListener('input', (e) => {
                this.settings.contextMemory = e.target.value;
                // Auto-save context changes with debounce
                clearTimeout(this.contextSaveTimeout);
                this.contextSaveTimeout = setTimeout(() => this.saveSettings(), 1000);
            });
        }

        if (mascotCheckbox) {
            mascotCheckbox.checked = this.settings.mascotEnabled !== false;
            mascotCheckbox.addEventListener('change', (e) => {
                this.settings.mascotEnabled = e.target.checked;
                this.saveSettings();
                // Broadcast change
                document.dispatchEvent(new CustomEvent('mascot:toggle', { detail: { enabled: e.target.checked } }));
            });
        }

        // Set up save button
    const saveButton = typeof document !== 'undefined' ? document.getElementById('save-and-test-settings') : null;
        if (saveButton) {
            saveButton.addEventListener('click', () => this.testConnection());
        }

        this.updateModelOptions();
    }

    /**
     * Update available models based on selected provider
     */
    updateModelOptions() {
        const modelSelect = document.getElementById('model-select-setting');
        if (!modelSelect) return;

        // Keep it simple - just show all models, let the AI module handle compatibility
        // This prevents complex UI logic while maintaining functionality
    }

    /**
     * Test API connection with current settings
     */
    async testConnection() {
        const { provider, apiKey, model } = this.settings;

        if (!apiKey && !['local', 'ollama'].includes(provider)) {
            this.showFeedback('Please enter an API key first', 'warning');
            return;
        }

        this.showFeedback('Testing connection...', 'info');

        try {
            // Use the AI module to test connection
            if (window.aiModule || window.AIModule) {
                const ai = window.aiModule || new window.AIModule();
                
                const testPrompt = 'Hello! This is a connection test. Please respond with "Connection successful".';
                
                // Get current settings for proper API call
                const currentSettings = this.getSettings();
                const response = await ai.generateResponse(testPrompt, {
                    provider: currentSettings.provider,
                    apiKey: currentSettings.apiKey,
                    model: currentSettings.model,
                    temperature: currentSettings.temperature,
                    maxTokens: currentSettings.maxTokens
                });
                
                if (response && response.length > 0 && !response.startsWith('❌')) {
                    this.showFeedback(`✅ ${provider.toUpperCase()} connection successful!`, 'success');
                } else {
                    const errorMsg = response && response.startsWith('❌') ? 
                        response : 'Connection test failed - no response';
                    this.showFeedback(`❌ ${errorMsg}`, 'error');
                }
            } else {
                this.showFeedback('❌ AI module not available for testing', 'error');
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showFeedback(`❌ Connection failed: ${error.message}`, 'error');
        }
    }

    /**
     * Show feedback to user using simple toast system
     */
    showFeedback(message, type = 'info') {
        console.log(`💬 Settings Feedback (${type}): ${message}`);
        
        // Use simple toast system
        if (window.simpleToast) {
            window.simpleToast.show(message, type, type === 'error' ? 5000 : 3000);
        } else if (window.showToast) {
            window.showToast(message, type);
        } else {
            // Fallback to visual status update
            const statusDiv = document.getElementById('status-indicator');
            if (statusDiv) {
                statusDiv.textContent = message;
                statusDiv.className = `status-${type}`;
                statusDiv.style.color = type === 'success' ? '#4caf50' : 
                                      type === 'error' ? '#f44336' : 
                                      type === 'warning' ? '#ff9800' : '#2196f3';
                
                setTimeout(() => {
                    statusDiv.textContent = 'Ready';
                    statusDiv.className = 'status-ready';
                    statusDiv.style.color = '';
                }, 3000);
            } else {
                // Last resort - alert for critical messages
                if (type === 'error') {
                    alert(`Error: ${message}`);
                }
            }
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Update a specific setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Export settings for backup
     */
    exportSettings() {
        const settingsToExport = { ...this.settings };
        // Hide sensitive API key in export
        settingsToExport.apiKey = settingsToExport.apiKey ? '[HIDDEN]' : '';
        
        const blob = new Blob([JSON.stringify(settingsToExport, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ae-ai-settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showFeedback('Settings exported successfully', 'success');
    }
}

// Export for global use
window.SimpleSettingsManager = SimpleSettingsManager;

// Node/CommonJS export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleSettingsManager;
}

/**
 * LetterBlack GenAI - Settings Module
 * Consolidates: settings-manager.js, settings-ui.js, simple-toast.js
 */

(function() {
    'use strict';
    
    // Simple Toast Notifications
    class SimpleToast {
        static show(message, type = 'info', duration = 3000) {
            // Remove existing toasts
            const existingToasts = document.querySelectorAll('.simple-toast');
            existingToasts.forEach(toast => toast.remove());
            
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `simple-toast toast-${type}`;
            toast.textContent = message;
            
            // Style the toast
            Object.assign(toast.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '6px',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
                zIndex: '10000',
                maxWidth: '400px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease'
            });
            
            // Set color based on type
            switch (type) {
                case 'success':
                    toast.style.backgroundColor = '#22c55e';
                    break;
                case 'error':
                    toast.style.backgroundColor = '#ef4444';
                    break;
                case 'warning':
                    toast.style.backgroundColor = '#f59e0b';
                    break;
                default:
                    toast.style.backgroundColor = '#3b82f6';
            }
            
            // Add to DOM
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 10);
            
            // Auto remove
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }
    }
    
    // Settings Manager
    class SimpleSettingsManager {
        constructor() {
            this.settings = null;
            this.defaultSettings = {
                provider: 'google',
                model: 'gemini-1.5-flash',
                apiKey: '',
                temperature: 0.7,
                maxTokens: 2048,
                theme: 'auto',
                notifications: true,
                autoSave: true,
                userLevel: 'intermediate'
            };
            
            this.providerModels = {
                google: [
                    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Recommended)' },
                    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                    { value: 'gemini-pro', label: 'Gemini Pro' }
                ],
                openai: [
                    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Recommended)' },
                    { value: 'gpt-4', label: 'GPT-4' },
                    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' }
                ],
                anthropic: [
                    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Recommended)' },
                    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
                    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
                ]
            };
        }
        
        async initialize() {
            try {
                await this.loadSettings();
                this.setupUI();
                this.setupEventListeners();
                console.log('✅ Settings Manager initialized');
                return true;
            } catch (error) {
                console.error('❌ Failed to initialize Settings Manager:', error);
                return false;
            }
        }
        
        async loadSettings() {
            try {
                if (window.chatStore && typeof window.chatStore.loadSettings === 'function') {
                    this.settings = await window.chatStore.loadSettings();
                } else {
                    // Fallback to local storage
                    const stored = localStorage.getItem('letterblack_genai_settings');
                    this.settings = stored ? JSON.parse(stored) : { ...this.defaultSettings };
                }
                
                // Ensure all default keys exist
                this.settings = { ...this.defaultSettings, ...this.settings };
                
                return this.settings;
            } catch (error) {
                console.error('Failed to load settings:', error);
                this.settings = { ...this.defaultSettings };
                return this.settings;
            }
        }
        
        async saveSettings(newSettings = null) {
            try {
                if (newSettings) {
                    this.settings = { ...this.settings, ...newSettings };
                }
                
                if (window.chatStore && typeof window.chatStore.saveSettings === 'function') {
                    await window.chatStore.saveSettings(this.settings);
                } else {
                    // Fallback to local storage
                    localStorage.setItem('letterblack_genai_settings', JSON.stringify(this.settings));
                }
                
                SimpleToast.show('Settings saved successfully!', 'success');
                return true;
            } catch (error) {
                console.error('Failed to save settings:', error);
                SimpleToast.show('Failed to save settings', 'error');
                return false;
            }
        }
        
        getSettings() {
            return this.settings || { ...this.defaultSettings };
        }
        
        getSetting(key) {
            return this.settings?.[key] ?? this.defaultSettings[key];
        }
        
        async updateSetting(key, value) {
            const updates = {};
            updates[key] = value;
            return await this.saveSettings(updates);
        }
        
        setupUI() {
            const settingsContainer = document.getElementById('settings-container');
            if (!settingsContainer) return;
            
            settingsContainer.innerHTML = this.generateSettingsHTML();
            this.populateSettings();
        }
        
        generateSettingsHTML() {
            return `
                <div class="settings-form">
                    <div class="settings-section">
                        <h3>🤖 AI Provider</h3>
                        
                        <div class="form-group">
                            <label for="provider-select">Provider:</label>
                            <select id="provider-select" class="form-control">
                                <option value="google">Google Gemini</option>
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic Claude</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="model-select">Model:</label>
                            <select id="model-select" class="form-control">
                                <!-- Populated dynamically -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="api-key-input">API Key:</label>
                            <div class="api-key-container">
                                <input type="password" id="api-key-input" class="form-control" placeholder="Enter your API key">
                                <button type="button" id="toggle-api-key" class="btn-toggle">👁️</button>
                            </div>
                            <small class="form-text">Your API key is stored locally and never shared.</small>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>⚙️ Generation Settings</h3>
                        
                        <div class="form-group">
                            <label for="temperature-slider">Creativity (Temperature): <span id="temp-value">0.7</span></label>
                            <input type="range" id="temperature-slider" class="form-control" min="0" max="1" step="0.1" value="0.7">
                            <small class="form-text">Lower = more focused, Higher = more creative</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="max-tokens-input">Max Response Length:</label>
                            <select id="max-tokens-input" class="form-control">
                                <option value="1024">Short (1024 tokens)</option>
                                <option value="2048">Medium (2048 tokens)</option>
                                <option value="4096">Long (4096 tokens)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="user-level-select">Experience Level:</label>
                            <select id="user-level-select" class="form-control">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>🎨 Interface</h3>
                        
                        <div class="form-group">
                            <label for="theme-select">Theme:</label>
                            <select id="theme-select" class="form-control">
                                <option value="auto">Auto (System)</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notifications-check"> Enable notifications
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="auto-save-check"> Auto-save conversations
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-actions">
                        <button id="save-settings-btn" class="btn btn-primary">💾 Save Settings</button>
                        <button id="reset-settings-btn" class="btn btn-secondary">🔄 Reset to Defaults</button>
                        <button id="test-connection-btn" class="btn btn-info">🧪 Test AI Connection</button>
                    </div>
                    
                    <div class="settings-section">
                        <h3>📊 Storage Info</h3>
                        <div id="storage-info" class="storage-info">
                            <p>Loading storage information...</p>
                        </div>
                        <button id="clear-storage-btn" class="btn btn-warning">🗑️ Clear All Data</button>
                    </div>
                    
                    <div class="settings-section">
                        <h3>ℹ️ About</h3>
                        <div class="about-info">
                            <p><strong>LetterBlack GenAI</strong> v1.0</p>
                            <p>AI-powered assistant for Adobe After Effects</p>
                            <p>Created with ❤️ for creative professionals</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        setupEventListeners() {
            // Provider change
            const providerSelect = document.getElementById('provider-select');
            if (providerSelect) {
                providerSelect.addEventListener('change', (e) => {
                    this.updateModelOptions(e.target.value);
                });
            }
            
            // Temperature slider
            const tempSlider = document.getElementById('temperature-slider');
            const tempValue = document.getElementById('temp-value');
            if (tempSlider && tempValue) {
                tempSlider.addEventListener('input', (e) => {
                    tempValue.textContent = e.target.value;
                });
            }
            
            // API key toggle
            const toggleBtn = document.getElementById('toggle-api-key');
            const apiKeyInput = document.getElementById('api-key-input');
            if (toggleBtn && apiKeyInput) {
                toggleBtn.addEventListener('click', () => {
                    const isPassword = apiKeyInput.type === 'password';
                    apiKeyInput.type = isPassword ? 'text' : 'password';
                    toggleBtn.textContent = isPassword ? '🙈' : '👁️';
                });
            }
            
            // Save settings
            const saveBtn = document.getElementById('save-settings-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.handleSaveSettings());
            }
            
            // Reset settings
            const resetBtn = document.getElementById('reset-settings-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.handleResetSettings());
            }
            
            // Test connection
            const testBtn = document.getElementById('test-connection-btn');
            if (testBtn) {
                testBtn.addEventListener('click', () => this.handleTestConnection());
            }
            
            // Clear storage
            const clearBtn = document.getElementById('clear-storage-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.handleClearStorage());
            }
            
            // Update storage info
            this.updateStorageInfo();
        }
        
        populateSettings() {
            if (!this.settings) return;
            
            // Populate form fields
            const elements = {
                'provider-select': this.settings.provider,
                'api-key-input': this.settings.apiKey,
                'temperature-slider': this.settings.temperature,
                'max-tokens-input': this.settings.maxTokens,
                'user-level-select': this.settings.userLevel,
                'theme-select': this.settings.theme,
                'notifications-check': this.settings.notifications,
                'auto-save-check': this.settings.autoSave
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                }
            });
            
            // Update model options and temperature display
            this.updateModelOptions(this.settings.provider);
            const tempValue = document.getElementById('temp-value');
            if (tempValue) {
                tempValue.textContent = this.settings.temperature;
            }
            
            // Set model
            setTimeout(() => {
                const modelSelect = document.getElementById('model-select');
                if (modelSelect) {
                    modelSelect.value = this.settings.model;
                }
            }, 100);
        }
        
        updateModelOptions(provider) {
            const modelSelect = document.getElementById('model-select');
            if (!modelSelect) return;
            
            const models = this.providerModels[provider] || [];
            modelSelect.innerHTML = models.map(model => 
                `<option value="${model.value}">${model.label}</option>`
            ).join('');
        }
        
        async handleSaveSettings() {
            try {
                const newSettings = {
                    provider: document.getElementById('provider-select')?.value,
                    model: document.getElementById('model-select')?.value,
                    apiKey: document.getElementById('api-key-input')?.value,
                    temperature: parseFloat(document.getElementById('temperature-slider')?.value),
                    maxTokens: parseInt(document.getElementById('max-tokens-input')?.value),
                    userLevel: document.getElementById('user-level-select')?.value,
                    theme: document.getElementById('theme-select')?.value,
                    notifications: document.getElementById('notifications-check')?.checked,
                    autoSave: document.getElementById('auto-save-check')?.checked
                };
                
                await this.saveSettings(newSettings);
                this.updateStorageInfo();
            } catch (error) {
                console.error('Failed to save settings:', error);
                SimpleToast.show('Failed to save settings', 'error');
            }
        }
        
        async handleResetSettings() {
            if (confirm('Reset all settings to defaults? This cannot be undone.')) {
                this.settings = { ...this.defaultSettings };
                await this.saveSettings();
                this.populateSettings();
                SimpleToast.show('Settings reset to defaults', 'info');
            }
        }
        
        async handleTestConnection() {
            const testBtn = document.getElementById('test-connection-btn');
            if (!testBtn) return;
            
            const originalText = testBtn.textContent;
            testBtn.textContent = '🧪 Testing...';
            testBtn.disabled = true;
            
            try {
                if (window.aiModule && typeof window.aiModule.generateResponse === 'function') {
                    const response = await window.aiModule.generateResponse('Test connection', this.settings);
                    if (response) {
                        SimpleToast.show('✅ AI connection successful!', 'success');
                    } else {
                        SimpleToast.show('❌ No response from AI', 'error');
                    }
                } else {
                    SimpleToast.show('❌ AI module not available', 'error');
                }
            } catch (error) {
                console.error('Connection test failed:', error);
                SimpleToast.show(`❌ Connection failed: ${error.message}`, 'error');
            } finally {
                testBtn.textContent = originalText;
                testBtn.disabled = false;
            }
        }
        
        async handleClearStorage() {
            if (confirm('Clear all stored data including conversations and settings? This cannot be undone.')) {
                try {
                    if (window.chatStore && typeof window.chatStore.clearAllChats === 'function') {
                        await window.chatStore.clearAllChats();
                    }
                    localStorage.clear();
                    
                    this.settings = { ...this.defaultSettings };
                    this.populateSettings();
                    this.updateStorageInfo();
                    
                    SimpleToast.show('All data cleared successfully', 'info');
                } catch (error) {
                    console.error('Failed to clear storage:', error);
                    SimpleToast.show('Failed to clear storage', 'error');
                }
            }
        }
        
        updateStorageInfo() {
            const infoContainer = document.getElementById('storage-info');
            if (!infoContainer) return;
            
            try {
                let info;
                if (window.chatStore && typeof window.chatStore.getStorageInfo === 'function') {
                    info = window.chatStore.getStorageInfo();
                } else {
                    // Fallback estimation
                    const totalData = Object.keys(localStorage).reduce((sum, key) => {
                        return sum + (localStorage.getItem(key) || '').length;
                    }, 0);
                    
                    info = {
                        chatCount: 0,
                        totalMessages: 0,
                        estimatedSizeKB: Math.round(totalData * 2 / 1024)
                    };
                }
                
                infoContainer.innerHTML = `
                    <div class="storage-stats">
                        <div class="stat">
                            <strong>Conversations:</strong> ${info.chatCount}
                        </div>
                        <div class="stat">
                            <strong>Total Messages:</strong> ${info.totalMessages}
                        </div>
                        <div class="stat">
                            <strong>Storage Used:</strong> ~${info.estimatedSizeKB} KB
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Failed to get storage info:', error);
                infoContainer.innerHTML = '<p>Unable to load storage information</p>';
            }
        }
    }
    
    // Export classes
    window.SimpleToast = SimpleToast;
    window.SimpleSettingsManager = SimpleSettingsManager;
    
    console.log('✅ Settings module loaded');
    
})();

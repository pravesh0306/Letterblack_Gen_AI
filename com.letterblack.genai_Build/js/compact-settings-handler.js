/**
 * COMPACT SETTINGS HANDLER - Simplified API Configuration
 * Handles streamlined settings interface without extra popups
 */

(function() {
    'use strict';

    const PROVIDER_CONFIGS = {
        google: {
            name: 'Google Gemini',
            displayName: 'Google Gemini',
            logo: '🔮',
            color: '#4285f4',
            description: 'Fast and reliable AI from Google',
            apiKeyPattern: /^[A-Za-z0-9_-]{20,}$/,
            models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
            defaultModel: 'gemini-1.5-flash'
        },
        openai: {
            name: 'OpenAI',
            displayName: 'OpenAI GPT',
            logo: '🧠',
            color: '#00a67e',
            description: 'Industry-leading conversational AI',
            apiKeyPattern: /^sk-[A-Za-z0-9]{48,}$/,
            models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            defaultModel: 'gpt-4'
        },
        anthropic: {
            name: 'Anthropic',
            displayName: 'Anthropic Claude',
            logo: '🛡️',
            color: '#d97757',
            description: 'Safe and helpful AI assistant',
            apiKeyPattern: /^sk-ant-[A-Za-z0-9]{95,}$/,
            models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
            defaultModel: 'claude-3-sonnet-20240229'
        }
    };

    class CompactSettingsHandler {
        constructor() {
            this.settings = {
                provider: '',
                apiKey: '',
                model: '',
                temperature: 0.7,
                maxTokens: 2048
            };
            this.currentProvider = null;
        }

        async initialize() {
            try {
                await this.loadSettings();
                this.bindEventHandlers();
                this.updateStatusDisplay();
                console.log('✅ Compact Settings Handler initialized');
            } catch (error) {
                console.error('❌ Failed to initialize compact settings:', error);
            }
        }

        async loadSettings() {
            try {
                // Try to load from existing settings module if available
                if (window.settingsModule) {
                    this.settings = { ...window.settingsModule.settings };
                } else {
                    // Load from storage directly
                    const stored = localStorage.getItem('ai_extension_settings');
                    if (stored) {
                        this.settings = { ...this.settings, ...JSON.parse(stored) };
                    }
                }
            } catch (error) {
                console.warn('⚠️ Could not load existing settings:', error);
            }
        }

        async saveSettings() {
            try {
                // Save to localStorage
                localStorage.setItem('ai_extension_settings', JSON.stringify(this.settings));
                
                // Update main settings module if available
                if (window.settingsModule) {
                    window.settingsModule.settings = { ...this.settings };
                    await window.settingsModule.saveSettings();
                }

                this.updateStatusDisplay();
                this.showMessage('✅ Settings saved successfully!', 'success');
                
                console.log('✅ Settings saved:', this.settings);
            } catch (error) {
                console.error('❌ Failed to save settings:', error);
                this.showMessage('❌ Failed to save settings', 'error');
            }
        }

        bindEventHandlers() {
            // API Key toggle visibility
            const toggleBtn = document.getElementById('compact-toggle-key');
            const apiKeyInput = document.getElementById('compact-api-key');
            
            if (toggleBtn && apiKeyInput) {
                toggleBtn.addEventListener('click', () => {
                    const isPassword = apiKeyInput.type === 'password';
                    apiKeyInput.type = isPassword ? 'text' : 'password';
                    toggleBtn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
                });
            }

            // Auto-detect provider
            const autoDetectBtn = document.getElementById('compact-auto-detect');
            if (autoDetectBtn) {
                autoDetectBtn.addEventListener('click', () => this.autoDetectProvider());
            }

            // Manual provider selection
            const providerSelect = document.getElementById('compact-provider-select');
            if (providerSelect) {
                providerSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.setProvider(e.target.value);
                    }
                });
            }

            // Model selection
            const modelSelect = document.getElementById('compact-model-select');
            if (modelSelect) {
                modelSelect.addEventListener('change', (e) => {
                    this.settings.model = e.target.value;
                });
            }

            // Test connection
            const testBtn = document.getElementById('compact-test-connection');
            if (testBtn) {
                testBtn.addEventListener('click', () => this.testConnection());
            }

            // Save settings
            const saveBtn = document.getElementById('compact-save-settings');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveSettings());
            }

            // Pre-populate API key if available
            if (apiKeyInput && this.settings.apiKey) {
                apiKeyInput.value = this.settings.apiKey;
            }

            // Set provider if available
            if (this.settings.provider) {
                this.setProvider(this.settings.provider);
            }
        }

        autoDetectProvider() {
            const apiKeyInput = document.getElementById('compact-api-key');
            const apiKey = apiKeyInput?.value?.trim();

            if (!apiKey) {
                this.showMessage('⚠️ Please enter an API key first', 'warning');
                return;
            }

            // Store the API key
            this.settings.apiKey = apiKey;

            // Detect provider
            for (const [providerId, config] of Object.entries(PROVIDER_CONFIGS)) {
                if (config.apiKeyPattern.test(apiKey)) {
                    this.setProvider(providerId, true);
                    this.showDetectionResult(config, 'high');
                    return;
                }
            }

            // Fallback detection
            if (apiKey.startsWith('sk-') && apiKey.length > 40) {
                this.setProvider('openai', true);
                this.showDetectionResult(PROVIDER_CONFIGS.openai, 'medium');
            } else if (apiKey.length > 30) {
                this.setProvider('google', true);
                this.showDetectionResult(PROVIDER_CONFIGS.google, 'low');
            } else {
                this.showMessage('❌ Could not auto-detect provider. Please select manually.', 'error');
                this.showManualSelection();
            }
        }

        setProvider(providerId, autoDetected = false) {
            const config = PROVIDER_CONFIGS[providerId];
            if (!config) return;

            this.settings.provider = providerId;
            this.currentProvider = config;

            // Update model selection
            this.updateModelOptions(config);

            // Set default model
            if (config.defaultModel) {
                this.settings.model = config.defaultModel;
                const modelSelect = document.getElementById('compact-model-select');
                if (modelSelect) {
                    modelSelect.value = config.defaultModel;
                }
            }

            // Show detection result if auto-detected
            if (autoDetected) {
                this.showDetectionResult(config, 'high');
            }

            console.log(`✅ Provider set to: ${config.displayName}`);
        }

        updateModelOptions(config) {
            const modelSelect = document.getElementById('compact-model-select');
            const modelSection = document.getElementById('model-selection-section');
            
            if (!modelSelect || !modelSection) return;

            // Clear existing options
            modelSelect.innerHTML = '';

            // Add model options
            config.models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });

            // Show model selection
            modelSection.style.display = 'block';
        }

        showDetectionResult(config, confidence) {
            const resultsDiv = document.getElementById('detection-results');
            const infoDiv = document.getElementById('detected-provider-info');
            
            if (!resultsDiv || !infoDiv) return;

            const confidenceColor = {
                'high': '#28a745',
                'medium': '#ffc107', 
                'low': '#fd7e14'
            };

            infoDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">${config.logo}</span>
                    <div>
                        <strong style="color: ${config.color};">${config.displayName}</strong>
                        <span style="color: ${confidenceColor[confidence]}; font-size: 12px; margin-left: 8px;">
                            ${confidence.toUpperCase()} CONFIDENCE
                        </span>
                        <div style="color: #999; font-size: 12px;">${config.description}</div>
                    </div>
                </div>
            `;

            resultsDiv.style.display = 'block';
        }

        showManualSelection() {
            const manualSection = document.getElementById('manual-provider-section');
            if (manualSection) {
                manualSection.style.display = 'block';
            }
        }

        async testConnection() {
            if (!this.settings.apiKey || !this.settings.provider) {
                this.showMessage('⚠️ Please configure API key and provider first', 'warning');
                return;
            }

            try {
                this.showMessage('⏳ Testing connection...', 'info');

                // Use existing AI module if available
                let aiModule = window.aiModule || window.AIModule;
                
                if (!aiModule && window.aiExtension?.modules?.ai) {
                    aiModule = window.aiExtension.modules.ai;
                }

                if (aiModule && typeof aiModule.testConnection === 'function') {
                    const result = await aiModule.testConnection(
                        this.settings.provider,
                        this.settings.apiKey,
                        this.settings.model
                    );

                    if (result.success) {
                        this.showMessage('✅ Connection test successful!', 'success');
                    } else {
                        this.showMessage(`❌ Test failed: ${result.error}`, 'error');
                    }
                } else {
                    this.showMessage('⚠️ AI module not available for testing', 'warning');
                }
            } catch (error) {
                console.error('❌ Connection test error:', error);
                this.showMessage(`❌ Test error: ${error.message}`, 'error');
            }
        }

        updateStatusDisplay() {
            const providerSpan = document.getElementById('compact-current-provider');
            const modelSpan = document.getElementById('compact-current-model');
            const apiSpan = document.getElementById('compact-current-api-status');

            if (providerSpan) {
                providerSpan.textContent = this.settings.provider ? 
                    PROVIDER_CONFIGS[this.settings.provider]?.displayName || this.settings.provider :
                    'Not configured';
            }

            if (modelSpan) {
                modelSpan.textContent = this.settings.model || 'Not selected';
            }

            if (apiSpan) {
                apiSpan.textContent = this.settings.apiKey ? 
                    `Set (${this.settings.apiKey.length} characters)` : 
                    'Not set';
            }
        }

        showMessage(message, type) {
            const messageDiv = document.getElementById('compact-status-message');
            if (!messageDiv) return;

            const colors = {
                'success': '#28a745',
                'error': '#dc3545',
                'warning': '#ffc107',
                'info': '#17a2b8'
            };

            messageDiv.innerHTML = `
                <div style="padding: 8px 12px; background: ${colors[type]}20; border-left: 3px solid ${colors[type]}; border-radius: 4px; color: ${colors[type]};">
                    ${message}
                </div>
            `;
            messageDiv.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const compactSettings = new CompactSettingsHandler();
        compactSettings.initialize();
        
        // Export to global scope for access
        window.compactSettingsHandler = compactSettings;
    });

    console.log('🔧 Compact Settings Handler loaded');

})();

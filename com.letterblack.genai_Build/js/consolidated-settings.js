/**
 * CONSOLIDATED SETTINGS MODULE - Adobe AI Generations Extension
 * Handles all settings management, API configuration, and user preferences
 * Replaces multiple settings-related files with single consolidated module
 */

(function() {
    'use strict';

    // ==========================================
    // SETTINGS MODULE CONFIGURATION
    // ==========================================

    const SETTINGS_CONFIG = {
        version: '1.0.0',
        storageKey: 'ai_extension_settings',
        encryptSensitiveData: true,
        autoSaveDelay: 1000, // ms
        validationEnabled: true
    };

    const PROVIDER_CONFIGS = {
        google: {
            name: 'Google Gemini',
            displayName: 'Google Gemini (recommended)',
            logo: '🔮',
            color: '#4285f4',
            description: 'Fast and reliable AI from Google',
            apiKeyPattern: /^[A-Za-z0-9_-]{20,}$/,
            models: [
                { value: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and affordable', recommended: true },
                { value: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced reasoning capabilities' },
                { value: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', description: 'Legacy support and stability' }
            ],
            defaultModel: 'gemini-1.5-flash',
            supportsImages: true,
            supportsAudio: false,
            apiDocsUrl: 'https://makersuite.google.com/'
        },
        openai: {
            name: 'OpenAI',
            displayName: 'OpenAI GPT (popular)',
            logo: '🧠',
            color: '#00a67e',
            description: 'Industry-leading conversational AI',
            apiKeyPattern: /^sk-[A-Za-z0-9]{48,}$/,
            models: [
                { value: 'gpt-4', name: 'GPT-4', description: 'Highest quality and most capable' },
                { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Balanced performance and speed' },
                { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and economical choice' }
            ],
            defaultModel: 'gpt-4',
            supportsImages: true,
            supportsAudio: true,
            apiDocsUrl: 'https://platform.openai.com/api-keys'
        },
        anthropic: {
            name: 'Anthropic Claude',
            displayName: 'Anthropic Claude (privacy-focused)',
            logo: '🛡️',
            color: '#d97757',
            description: 'Privacy-focused and ethical AI',
            apiKeyPattern: /^sk-ant-[A-Za-z0-9_-]{95,}$/,
            models: [
                { value: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable and intelligent' },
                { value: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and cost' },
                { value: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest response times' }
            ],
            defaultModel: 'claude-3-sonnet',
            supportsImages: true,
            supportsAudio: false,
            apiDocsUrl: 'https://console.anthropic.com/'
        }
    };

    // ==========================================
    // MAIN SETTINGS MODULE CLASS
    // ==========================================

    class SettingsModule {
        constructor() {
            this.isInitialized = false;
            this.settings = {};
            this.defaultSettings = this.getDefaultSettings();
            this.autoSaveTimeout = null;
            this.modal = null;
            this.isModalOpen = false;
            
            console.log('⚙️ Settings Module initialized');
        }

        async initialize() {
            try {
                await this.loadSettings();
                this.createSettingsModal();
                this.bindEventHandlers();
                this.updateUI(); // This will call updateSettingsStatus
                this.isInitialized = true;
                
                // Also bind to the open modal button with a delay to ensure DOM is ready
                setTimeout(() => {
                    const openModalBtn = document.querySelector('#open-settings-modal-btn');
                    if (openModalBtn && !openModalBtn.hasAttribute('data-listener-added')) {
                        openModalBtn.setAttribute('data-listener-added', 'true');
                        openModalBtn.addEventListener('click', () => {
                            console.log('🔥 Open Settings Modal button clicked from delayed binding!');
                            this.openSettingsModal();
                        });
                        console.log('✅ Delayed binding: Open Settings Modal button found and connected');
                    }
                }, 1000);
                
                console.log('✅ Settings Module ready');
                return true;
            } catch (error) {
                console.error('❌ Settings Module initialization failed:', error);
                return false;
            }
        }

        getDefaultSettings() {
            return {
                // API Configuration
                apiKey: '',
                provider: 'google',
                model: '',
                temperature: 0.7,
                maxTokens: 2048,
                
                // UI Preferences
                theme: 'dark',
                language: 'en',
                fontSize: 'medium',
                
                // Features
                autoSave: true,
                notifications: true,
                soundEffects: true,
                animations: true,
                
                // Advanced
                timeout: 30000,
                retryAttempts: 3,
                rateLimitDelay: 1000,
                
                // Privacy
                saveConversations: true,
                shareAnalytics: false,
                
                // Metadata
                version: SETTINGS_CONFIG.version,
                lastUpdated: new Date().toISOString()
            };
        }

        // ==========================================
        // SETTINGS MANAGEMENT
        // ==========================================

        async loadSettings() {
            try {
                if (window.storageModule) {
                    this.settings = await window.storageModule.loadSettings();
                } else {
                    // Fallback to localStorage
                    const stored = localStorage.getItem(SETTINGS_CONFIG.storageKey);
                    this.settings = stored ? JSON.parse(stored) : this.defaultSettings;
                }

                // Merge with defaults to ensure all properties exist
                this.settings = { ...this.defaultSettings, ...this.settings };
                
                // Set auto-selected model if none specified
                if (!this.settings.model || this.settings.model === '') {
                    this.settings.model = PROVIDER_CONFIGS[this.settings.provider]?.defaultModel || '';
                }

                console.log('⚙️ Settings loaded successfully');
                return this.settings;
            } catch (error) {
                console.error('❌ Error loading settings:', error);
                this.settings = { ...this.defaultSettings };
                return this.settings;
            }
        }

        async saveSettings(newSettings = null) {
            try {
                if (newSettings) {
                    this.settings = { ...this.settings, ...newSettings };
                }
                
                this.settings.lastUpdated = new Date().toISOString();
                
                if (window.storageModule) {
                    await window.storageModule.saveSettings(this.settings);
                } else {
                    // Fallback to localStorage
                    localStorage.setItem(SETTINGS_CONFIG.storageKey, JSON.stringify(this.settings));
                }

                // Update global extension settings
                if (window.aiExtension) {
                    window.aiExtension.state.settings = this.settings;
                }

                console.log('⚙️ Settings saved successfully');
                return true;
            } catch (error) {
                console.error('❌ Error saving settings:', error);
                throw error;
            }
        }

        getSettings() {
            return { ...this.settings };
        }

        getSetting(key) {
            return this.settings[key];
        }

        async setSetting(key, value) {
            if (this.validateSetting(key, value)) {
                this.settings[key] = value;
                this.scheduleAutoSave();
                return true;
            }
            return false;
        }

        resetSettings() {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.updateUI();
        }

        // ==========================================
        // VALIDATION
        // ==========================================

        validateSetting(key, value) {
            if (!SETTINGS_CONFIG.validationEnabled) return true;

            try {
                switch (key) {
                    case 'apiKey':
                        return this.validateApiKey(value, this.settings.provider);
                    case 'provider':
                        return PROVIDER_CONFIGS.hasOwnProperty(value);
                    case 'model':
                        return this.validateModel(value, this.settings.provider);
                    case 'temperature':
                        return typeof value === 'number' && value >= 0 && value <= 2;
                    case 'maxTokens':
                        return typeof value === 'number' && value > 0 && value <= 8192;
                    case 'timeout':
                        return typeof value === 'number' && value >= 5000 && value <= 120000;
                    case 'theme':
                        return ['light', 'dark', 'auto'].includes(value);
                    case 'language':
                        return typeof value === 'string' && value.length === 2;
                    case 'fontSize':
                        return ['small', 'medium', 'large'].includes(value);
                    default:
                        return true; // Allow unknown settings
                }
            } catch (error) {
                console.error('❌ Validation error:', error);
                return false;
            }
        }

        validateApiKey(apiKey, provider) {
            if (!apiKey || typeof apiKey !== 'string') return false;
            
            const config = PROVIDER_CONFIGS[provider];
            if (!config || !config.apiKeyPattern) return true; // No validation rule
            
            return config.apiKeyPattern.test(apiKey);
        }

        validateModel(model, provider) {
            if (!model || typeof model !== 'string') return false;
            
            const config = PROVIDER_CONFIGS[provider];
            if (!config || !config.models) return true; // No validation rule
            
            return config.models.includes(model);
        }

        // ==========================================
        // AUTO-DETECTION FEATURES
        // ==========================================

        autoDetectProvider(apiKey) {
            if (!apiKey || typeof apiKey !== 'string') return null;
            
            // Clean the API key for pattern matching
            const cleanKey = apiKey.trim();
            
            // Check each provider's API key pattern
            for (const [providerId, config] of Object.entries(PROVIDER_CONFIGS)) {
                if (config.apiKeyPattern && config.apiKeyPattern.test(cleanKey)) {
                    console.log(`🔍 Auto-detected provider: ${config.displayName}`);
                    return {
                        provider: providerId,
                        confidence: 'high',
                        displayName: config.displayName,
                        logo: config.logo
                    };
                }
            }
            
            // Fallback detection based on key structure
            if (cleanKey.startsWith('sk-') && cleanKey.length > 40) {
                return { provider: 'openai', confidence: 'medium', displayName: 'OpenAI (probable)' };
            } else if (cleanKey.length > 30 && /^[A-Za-z0-9_-]+$/.test(cleanKey)) {
                return { provider: 'google', confidence: 'low', displayName: 'Google Gemini (possible)' };
            }
            
            return null;
        }

        autoDetectAndSetProvider(apiKey) {
            const detection = this.autoDetectProvider(apiKey);
            if (detection && detection.confidence !== 'low') {
                this.settings.provider = detection.provider;
                this.updateModelOptions(detection.provider);
                
                // Show notification
                this.showNotification(
                    `🔍 Auto-detected: ${detection.displayName}`, 
                    'info'
                );
                
                // Update UI if modal is open
                if (this.isModalOpen) {
                    const providerSelect = this.modal.querySelector('#provider-select');
                    if (providerSelect) {
                        providerSelect.value = detection.provider;
                    }
                }
                
                return true;
            }
            return false;
        }

        async autoTestConnection() {
            try {
                const { apiKey, provider, model } = this.settings;
                
                if (!apiKey) {
                    return { success: false, error: 'No API key provided' };
                }

                // Auto-detect provider if not set
                if (!provider || provider === 'auto') {
                    const detected = this.autoDetectAndSetProvider(apiKey);
                    if (!detected) {
                        return { success: false, error: 'Could not auto-detect provider' };
                    }
                }

                // Proceed with normal test
                return await this.testAPIConnection();
            } catch (error) {
                console.error('❌ Auto-test error:', error);
                return { success: false, error: error.message };
            }
        }

        // ==========================================
        // API TESTING
        // ==========================================

        async testAPIConnection() {
            try {
                const { apiKey, provider, model } = this.settings;
                
                if (!apiKey) {
                    throw new Error('API key is required');
                }

                // Check for AI module in multiple possible locations
                let aiModule = null;
                if (window.aiModule && typeof window.aiModule.testConnection === 'function') {
                    aiModule = window.aiModule;
                } else if (window.AIModule && typeof window.AIModule.testConnection === 'function') {
                    aiModule = window.AIModule;
                } else if (window.aiExtension && window.aiExtension.modules && window.aiExtension.modules.ai) {
                    aiModule = window.aiExtension.modules.ai;
                }

                if (!aiModule) {
                    throw new Error('AI module not available. Please reload the extension.');
                }

                const result = await aiModule.testConnection(provider, apiKey, model);
                
                if (result.success) {
                    this.showNotification('API connection test successful!', 'success');
                    return { success: true, message: 'Connection test passed' };
                } else {
                    this.showNotification(`API test failed: ${result.error}`, 'error');
                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('❌ API test error:', error);
                this.showNotification(`API test error: ${error.message}`, 'error');
                return { success: false, error: error.message };
            }
        }

        // ==========================================
        // UI MANAGEMENT
        // ==========================================

        createSettingsModal() {
            // Remove existing modal if any
            const existingModal = document.getElementById('settings-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Create enhanced modal HTML with improved design
            const modalHTML = `
                <div id="settings-modal" class="modal" style="display: none;">
                    <style>
                        /* Enhanced Adobe-compatible Dark Theme Styling */
                        :root {
                            --bg-dark: #1e1e1e;
                            --bg-panel: #252526;
                            --bg-input: #3c3c3c;
                            --text-primary: #ffffff;
                            --text-secondary: #cccccc;
                            --text-muted: #999999;
                            --adobe-blue: #0078d4;
                            --status-success: #28a745;
                            --status-warning: #ffc107;
                            --status-error: #dc3545;
                            --status-info: #17a2b8;
                            --border-radius-modal: 12px;
                            --border-radius-section: 8px;
                            --border-radius-input: 6px;
                            --transition-speed: 0.3s;
                        }

                        #settings-modal { 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            position: fixed; 
                            top: 0; 
                            left: 0; 
                            width: 100vw; 
                            height: 100vh; 
                            z-index: 9999; 
                            background: rgba(0,0,0,0.7); 
                            overflow: auto;
                            font-family: 'Segoe UI', 'San Francisco', Arial, sans-serif;
                            font-size: 14px;
                        }

                        #settings-modal .modal-content {
                            width: 85vw;
                            max-width: 800px;
                            background-color: var(--bg-panel);
                            border-radius: var(--border-radius-modal);
                            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
                            min-height: 500px;
                            max-height: 85vh;
                            display: flex;
                            flex-direction: column;
                            overflow: hidden;
                            border: 1px solid #333;
                            margin: auto;
                        }

                        /* Enhanced Header Design */
                        #settings-modal .modal-header {
                            background: linear-gradient(135deg, var(--adobe-blue), #005a9e);
                            color: white;
                            padding: 24px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            position: relative;
                            flex-shrink: 0;
                        }

                        #settings-modal .header-title {
                            font-size: 24px;
                            font-weight: bold;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }

                        #settings-modal .close {
                            background: none;
                            border: none;
                            color: white;
                            font-size: 24px;
                            cursor: pointer;
                            transition: transform 0.2s ease-in-out;
                            position: absolute;
                            top: 12px;
                            right: 20px;
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                        }

                        #settings-modal .close:hover {
                            transform: rotate(90deg);
                            background: rgba(255,255,255,0.1);
                        }

                        /* Enhanced Tab Navigation */
                        #settings-modal .settings-tabs {
                            display: flex;
                            border-bottom: 1px solid #3c3c3c;
                            background-color: var(--bg-dark);
                            padding: 0 24px;
                            flex-shrink: 0;
                        }

                        #settings-modal .tab-button {
                            padding: 16px 24px;
                            cursor: pointer;
                            border-bottom: 3px solid transparent;
                            color: var(--text-secondary);
                            font-weight: 500;
                            transition: all var(--transition-speed);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            background: none;
                            border-top: none;
                            border-left: none;
                            border-right: none;
                            font-size: 14px;
                        }

                        #settings-modal .tab-button:hover {
                            color: var(--text-primary);
                            background: rgba(255,255,255,0.05);
                        }

                        #settings-modal .tab-button.active {
                            border-bottom-color: var(--adobe-blue);
                            color: var(--text-primary);
                        }

                        /* Enhanced Content Areas */
                        #settings-modal .modal-body {
                            overflow-y: auto;
                            flex-grow: 1;
                            background: var(--bg-panel);
                        }

                        #settings-modal .tab-content {
                            padding: 24px;
                        }

                        #settings-modal .tab-pane {
                            display: none;
                            animation: fadeIn 0.5s ease-in-out;
                        }

                        #settings-modal .tab-pane.active {
                            display: block;
                        }

                        /* Enhanced Section Styling */
                        .section {
                            background-color: var(--bg-panel);
                            padding: 20px;
                            border-radius: var(--border-radius-section);
                            margin-bottom: 24px;
                            border: 1px solid #333;
                        }
                        
                        .section-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 16px;
                        }
                        
                        .section-header h3 {
                            font-size: 18px;
                            font-weight: 600;
                            margin: 0;
                            color: var(--text-primary);
                        }

                        .section-header i {
                            margin-right: 12px;
                            color: var(--adobe-blue);
                            font-size: 20px;
                        }

                        /* Enhanced Form Elements */
                        .form-group {
                            margin-bottom: 20px;
                        }

                        .form-row {
                            display: flex;
                            gap: 16px;
                            margin-bottom: 16px;
                            align-items: end;
                        }

                        .form-group-auto {
                            flex: 0 0 auto;
                        }

                        #settings-modal label {
                            display: block;
                            margin-bottom: 8px;
                            font-weight: 500;
                            font-size: 14px;
                            color: var(--text-secondary);
                        }

                        /* Enhanced Input Fields */
                        #settings-modal input[type="text"], 
                        #settings-modal input[type="password"], 
                        #settings-modal input[type="number"],
                        #settings-modal select {
                            width: 100%;
                            background-color: var(--bg-input);
                            color: var(--text-primary);
                            border: 1px solid #555;
                            border-radius: var(--border-radius-input);
                            padding: 12px;
                            font-size: 14px;
                            transition: all var(--transition-speed);
                            box-sizing: border-box;
                        }

                        #settings-modal input:focus, 
                        #settings-modal select:focus {
                            outline: none;
                            border-color: var(--adobe-blue);
                            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
                        }

                        /* Enhanced Input Groups */
                        .input-group {
                            display: flex;
                            position: relative;
                            width: 100%;
                        }

                        .input-group input {
                            flex-grow: 1;
                            padding-right: 50px;
                            border-radius: var(--border-radius-input);
                        }
                        
                        .input-group button {
                            position: absolute;
                            right: 0;
                            top: 0;
                            bottom: 0;
                            background: none;
                            border: none;
                            color: var(--text-secondary);
                            cursor: pointer;
                            padding: 0 12px;
                            transition: color var(--transition-speed);
                            border-radius: 0 var(--border-radius-input) var(--border-radius-input) 0;
                        }

                        .input-group button:hover {
                            color: var(--text-primary);
                            background: rgba(255,255,255,0.05);
                        }

                        /* Enhanced Dropdown Styling */
                        #settings-modal select {
                            -webkit-appearance: none;
                            -moz-appearance: none;
                            appearance: none;
                            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='white'%3E%3Cpath d='M6 8.5L2 4.5h8z'/%3E%3C/svg%3E");
                            background-repeat: no-repeat;
                            background-position: right 12px center;
                            padding-right: 40px;
                        }
                        
                        /* Enhanced Slider Styling */
                        .slider-group {
                            width: 100%;
                        }
                        
                        .slider-wrapper {
                            display: flex;
                            align-items: center;
                            gap: 16px;
                        }

                        .slider-wrapper span {
                            font-weight: bold;
                            color: var(--adobe-blue);
                            min-width: 40px;
                            text-align: center;
                        }

                        #settings-modal input[type="range"] {
                            -webkit-appearance: none;
                            width: 100%;
                            height: 6px;
                            background: #555;
                            outline: none;
                            border-radius: 3px;
                            transition: all var(--transition-speed);
                            border: none;
                            padding: 0;
                        }

                        #settings-modal input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 20px;
                            height: 20px;
                            background: var(--adobe-blue);
                            cursor: pointer;
                            border-radius: 50%;
                            border: 3px solid var(--bg-panel);
                            box-shadow: 0 0 0 1px var(--adobe-blue), 0 2px 6px rgba(0,0,0,0.3);
                            transition: all 0.2s ease;
                        }

                        #settings-modal input[type="range"]::-webkit-slider-thumb:hover {
                            transform: scale(1.1);
                            box-shadow: 0 0 0 1px var(--adobe-blue), 0 4px 12px rgba(0,120,212,0.4);
                        }

                        .creativity-indicators {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;
                            color: var(--text-muted);
                            margin-top: 8px;
                        }

                        /* Enhanced Buttons */
                        #settings-modal .btn {
                            padding: 12px 24px;
                            border: none;
                            border-radius: var(--border-radius-input);
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all var(--transition-speed);
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 8px;
                            min-width: 100px;
                        }

                        #settings-modal .btn-primary {
                            background-color: var(--adobe-blue);
                            color: var(--text-primary);
                        }

                        #settings-modal .btn-primary:hover {
                            background-color: #0060ad;
                            transform: translateY(-1px);
                            box-shadow: 0 4px 12px rgba(0,120,212,0.3);
                        }

                        #settings-modal .btn-secondary {
                            background-color: #6c757d;
                            color: var(--text-primary);
                        }

                        #settings-modal .btn-secondary:hover {
                            background-color: #5a6268;
                            transform: translateY(-1px);
                        }

                        #settings-modal .btn-danger {
                            background-color: var(--status-error);
                            color: var(--text-primary);
                        }

                        #settings-modal .btn-danger:hover {
                            background-color: #c82333;
                            transform: translateY(-1px);
                        }

                        /* Enhanced Status Messages */
                        .status-message {
                            margin-top: 16px;
                            padding: 12px 16px;
                            border-radius: var(--border-radius-input);
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            font-weight: 500;
                            animation: slideIn 0.3s ease-out;
                        }

                        .status-message.success {
                            background-color: rgba(40, 167, 69, 0.2);
                            color: var(--status-success);
                            border-left: 4px solid var(--status-success);
                        }

                        .status-message.error {
                            background-color: rgba(220, 53, 69, 0.2);
                            color: var(--status-error);
                            border-left: 4px solid var(--status-error);
                        }

                        .loading-spinner {
                            border: 3px solid rgba(255, 255, 255, 0.3);
                            border-top: 3px solid var(--adobe-blue);
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            animation: spin 1s linear infinite;
                        }

                        /* Enhanced Footer */
                        #settings-modal .modal-footer {
                            flex-shrink: 0;
                            background: var(--bg-dark);
                            padding: 16px 24px;
                            border-top: 1px solid #333;
                            display: flex;
                            gap: 12px;
                            justify-content: flex-end;
                            border-radius: 0 0 var(--border-radius-modal) var(--border-radius-modal);
                        }

                        /* Enhanced Save Section */
                        .save-section {
                            background: linear-gradient(135deg, var(--adobe-blue) 0%, #106ebe 100%);
                            border-radius: var(--border-radius-section);
                            padding: 20px;
                            text-align: center;
                            margin-bottom: 24px;
                            border: none;
                        }

                        .save-section button {
                            background: white;
                            color: var(--adobe-blue);
                            border: none;
                            padding: 14px 32px;
                            border-radius: var(--border-radius-input);
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all var(--transition-speed);
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            margin: 0 auto;
                        }

                        .save-section button:hover {
                            background: #f0f8ff;
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                        }

                        .help-text {
                            font-size: 12px;
                            color: var(--text-muted);
                            margin-top: 8px;
                            font-style: italic;
                        }

                        /* Enhanced Animations */
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }

                        @keyframes slideIn {
                            from { opacity: 0; transform: translateX(-20px); }
                            to { opacity: 1; transform: translateX(0); }
                        }

                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }

                        /* Enhanced Responsive Design */
                        @media (max-width: 768px) {
                            #settings-modal .modal-content {
                                width: 95vw;
                                max-width: 95vw;
                                min-width: unset;
                                border-radius: 8px;
                                margin: 10px;
                            }

                            #settings-modal .modal-header {
                                padding: 16px;
                            }
                            
                            #settings-modal .header-title {
                                font-size: 20px;
                            }
                            
                            #settings-modal .tab-button {
                                padding: 12px 16px;
                                font-size: 12px;
                            }

                            #settings-modal .tab-content {
                                padding: 16px;
                            }

                            .form-row {
                                flex-direction: column;
                                gap: 12px;
                            }

                            .form-group-auto {
                                align-self: stretch;
                            }

                            #settings-modal .btn {
                                width: 100%;
                                margin-bottom: 8px;
                            }
                        }
                    </style>
                    <div class="modal-content">
                        <div class="modal-header">
                            <span class="header-title">
                                <i class="fas fa-cog"></i>LetterBlack Gen AI Settings
                            </span>
                            <button class="close" id="settings-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <!-- Enhanced Tab Navigation -->
                        <div class="settings-tabs">
                            <button class="tab-button active" data-tab="api">
                                <i class="fas fa-key"></i>API Setup
                            </button>
                            <button class="tab-button" data-tab="preferences">
                                <i class="fas fa-sliders-h"></i>Preferences
                            </button>
                            <button class="tab-button" data-tab="advanced">
                                <i class="fas fa-cogs"></i>Advanced
                            </button>
                        </div>
                        
                        <!-- Enhanced Main Content -->
                        <div class="modal-body">
                            <div class="tab-content">
                                
                                <!-- Enhanced API Setup Tab -->
                                <div id="api-tab" class="tab-pane active">
                                    
                                    <!-- Enhanced Save Section -->
                                    <div class="save-section">
                                        <button id="save-api-settings-btn">
                                            <i class="fas fa-save"></i>Save API Configuration
                                        </button>
                                        <div class="help-text" style="color: white; margin-top: 8px;">
                                            Configure your AI provider settings below, then click to save
                                        </div>
                                    </div>
                                    
                                    <!-- Enhanced API Credentials Section -->
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-key"></i>
                                            <h3>API Credentials</h3>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="provider-select">AI Provider</label>
                                            <select id="provider-select">
                                                <!-- Options will be populated by JavaScript -->
                                            </select>
                                            <div class="help-text">Choose your preferred AI service provider</div>
                                        </div>

                                        <div class="form-group">
                                            <label for="api-key-input">API Key</label>
                                            <div class="input-group">
                                                <input type="password" id="api-key-input" placeholder="Paste your API key here...">
                                                <button type="button" id="toggle-api-key">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                            <div class="help-text" id="api-key-help">Get your API key from the provider's developer console</div>
                                            <button type="button" id="auto-detect-btn" class="btn btn-secondary" style="margin-top: 8px;">
                                                <i class="fas fa-magic"></i>Auto-Detect Provider
                                            </button>
                                        </div>

                                        <div class="form-row">
                                            <div class="form-group">
                                                <button id="test-api-btn" class="btn btn-secondary">
                                                    <i class="fas fa-bolt"></i>Test Connection
                                                </button>
                                            </div>
                                        </div>

                                        <div id="status-message-container"></div>
                                    </div>
                                    
                                    <!-- Enhanced Model Configuration Section -->
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-brain"></i>
                                            <h3>Model Configuration</h3>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label for="model-select">AI Model</label>
                                            <select id="model-select">
                                                <!-- Options populated dynamically -->
                                            </select>
                                            <div class="help-text" id="model-description">Different models have different capabilities and costs</div>
                                        </div>

                                        <div class="form-group">
                                            <label for="temperature-slider">
                                                Creativity Level: <span id="temperature-value" style="color: var(--adobe-blue); font-weight: bold;">0.7</span>
                                            </label>
                                            <div class="slider-group">
                                                <div class="slider-wrapper">
                                                    <input type="range" id="temperature-slider" min="0" max="2" step="0.1" value="0.7">
                                                    <span id="temperature-display">0.7</span>
                                                </div>
                                                <div class="creativity-indicators">
                                                    <span>🎯 Focused</span>
                                                    <span>🎨 Creative</span>
                                                </div>
                                            </div>
                                            <div class="help-text">Lower values = more focused responses, Higher values = more creative responses</div>
                                        </div>

                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="max-tokens-input">Max Response Length</label>
                                                <input type="number" id="max-tokens-input" min="100" max="8192" value="2048">
                                                <div class="help-text">Maximum length of AI responses (tokens)</div>
                                            </div>
                                            <div class="form-group">
                                                <label for="timeout-input">Request Timeout (seconds)</label>
                                                <input type="number" id="timeout-input" min="5" max="120" value="30">
                                                <div class="help-text">How long to wait for API responses</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Enhanced Preferences Tab -->
                                <div id="preferences-tab" class="tab-pane">
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-palette"></i>
                                            <h3>Interface Preferences</h3>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="theme-select">Color Theme</label>
                                                <select id="theme-select">
                                                    <option value="dark">🌙 Dark Theme (recommended)</option>
                                                    <option value="light">☀️ Light Theme</option>
                                                    <option value="auto">🔄 Auto (System)</option>
                                                </select>
                                                <div class="help-text">Choose your preferred interface theme</div>
                                            </div>
                                            <div class="form-group">
                                                <label for="font-size-select">Text Size</label>
                                                <select id="font-size-select">
                                                    <option value="small">📝 Small</option>
                                                    <option value="medium">📄 Medium</option>
                                                    <option value="large">📋 Large</option>
                                                </select>
                                                <div class="help-text">Adjust text size for better readability</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-bell"></i>
                                            <h3>Notifications & Features</h3>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="auto-save-check">
                                                <span>💾 Auto-save conversations</span>
                                            </label>
                                            <div class="help-text">Automatically save your chat history</div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="notifications-check">
                                                <span>🔔 Show notifications</span>
                                            </label>
                                            <div class="help-text">Get notified about important events</div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="sound-effects-check">
                                                <span>🔊 Sound effects</span>
                                            </label>
                                            <div class="help-text">Play sounds for user interface actions</div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="animations-check" checked>
                                                <span>✨ Smooth animations</span>
                                            </label>
                                            <div class="help-text">Enable smooth transitions and effects</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Enhanced Advanced Tab -->
                                <div id="advanced-tab" class="tab-pane">
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-cogs"></i>
                                            <h3>Performance Settings</h3>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label for="retry-attempts-input">Retry Attempts</label>
                                                <input type="number" id="retry-attempts-input" min="0" max="10" value="3">
                                                <div class="help-text">Number of retries on API failure</div>
                                            </div>
                                            <div class="form-group">
                                                <label for="rate-limit-input">Rate Limit (requests/minute)</label>
                                                <input type="number" id="rate-limit-input" min="1" max="100" value="20">
                                                <div class="help-text">Maximum API requests per minute</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-database"></i>
                                            <h3>Data & Privacy</h3>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="save-conversations-check" checked>
                                                <span>💬 Save conversation history</span>
                                            </label>
                                            <div class="help-text">Store chat history locally for reference</div>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="checkbox-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                                <input type="checkbox" id="share-analytics-check">
                                                <span>📊 Share anonymous analytics</span>
                                            </label>
                                            <div class="help-text">Help improve the extension with usage data</div>
                                        </div>
                                    </div>
                                    
                                    <div class="section">
                                        <div class="section-header">
                                            <i class="fas fa-tools"></i>
                                            <h3>Maintenance & Backup</h3>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group-auto">
                                                <button id="delete-cache-btn" class="btn btn-danger">
                                                    <i class="fas fa-trash"></i>Clear Cache
                                                </button>
                                            </div>
                                            <div class="form-group-auto">
                                                <button id="reset-settings-btn" class="btn btn-danger">
                                                    <i class="fas fa-refresh"></i>Reset Settings
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div class="form-row">
                                            <div class="form-group-auto">
                                                <button id="export-settings-btn" class="btn btn-secondary">
                                                    <i class="fas fa-download"></i>Export Settings
                                                </button>
                                            </div>
                                            <div class="form-group-auto">
                                                <button id="import-settings-btn" class="btn btn-secondary">
                                                    <i class="fas fa-upload"></i>Import Settings
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Enhanced Footer -->
                        <div class="modal-footer">
                            <button id="save-settings-btn" class="btn btn-primary">
                                <i class="fas fa-save"></i>Save All Settings
                            </button>
                            <button id="cancel-settings-btn" class="btn btn-secondary">
                                <i class="fas fa-times"></i>Cancel
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to document
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.modal = document.getElementById('settings-modal');
        }

        bindEventHandlers() {
            if (!this.modal) return;

            // Modal controls
            const closeBtn = this.modal.querySelector('#settings-close');
            const cancelBtn = this.modal.querySelector('#cancel-settings-btn');
            const saveBtn = this.modal.querySelector('#save-settings-btn');
            const saveApiBtn = this.modal.querySelector('#save-api-settings-btn');

            if (closeBtn) closeBtn.addEventListener('click', () => this.closeSettingsModal());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeSettingsModal());
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveSettingsFromModal());
            if (saveApiBtn) {
                console.log('✅ Save API Settings button found and event listener attached');
                saveApiBtn.addEventListener('click', (e) => {
                    console.log('🔥 Save API Settings button clicked!');
                    e.preventDefault();
                    this.saveAPISettingsOnly();
                });
            } else {
                console.error('❌ Save API Settings button NOT FOUND!');
            }

            // Open Settings Modal button (from Settings tab)
            const openModalBtn = document.querySelector('#open-settings-modal-btn');
            if (openModalBtn) {
                console.log('✅ Open Settings Modal button found');
                openModalBtn.addEventListener('click', () => {
                    console.log('🔥 Open Settings Modal button clicked!');
                    this.openSettingsModal();
                });
            } else {
                console.log('ℹ️ Open Settings Modal button not found (might load later)');
            }

            // Tab switching
            const tabButtons = this.modal.querySelectorAll('.tab-button');
            tabButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tabName = e.target.dataset.tab;
                    this.switchTab(tabName);
                });
            });

            // Provider change updates models
            const providerSelect = this.modal.querySelector('#provider-select');
            if (providerSelect) {
                providerSelect.addEventListener('change', (e) => {
                    this.updateModelOptions(e.target.value);
                });
            }

            // API key toggle
            const toggleApiKey = this.modal.querySelector('#toggle-api-key');
            const apiKeyInput = this.modal.querySelector('#api-key-input');
            if (toggleApiKey && apiKeyInput) {
                toggleApiKey.addEventListener('click', () => {
                    const isPassword = apiKeyInput.type === 'password';
                    apiKeyInput.type = isPassword ? 'text' : 'password';
                    const icon = toggleApiKey.querySelector('i');
                    if (icon) {
                        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
                    } else {
                        toggleApiKey.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
                    }
                });
            }

            // Temperature slider
            const temperatureSlider = this.modal.querySelector('#temperature-slider');
            const temperatureValue = this.modal.querySelector('#temperature-value');
            if (temperatureSlider && temperatureValue) {
                temperatureSlider.addEventListener('input', (e) => {
                    temperatureValue.textContent = e.target.value;
                });
            }

            // Auto-detect button
            const autoDetectBtn = this.modal.querySelector('#auto-detect-btn');
            if (autoDetectBtn) {
                autoDetectBtn.addEventListener('click', () => {
                    const apiKeyInput = this.modal.querySelector('#api-key-input');
                    if (apiKeyInput && apiKeyInput.value.trim()) {
                        const detected = this.autoDetectAndSetProvider(apiKeyInput.value.trim());
                        if (!detected) {
                            this.showNotification('Could not auto-detect provider from API key', 'warning');
                        }
                    } else {
                        this.showNotification('Please enter an API key first', 'warning');
                    }
                });
            }

            // API test button
            const testApiBtn = this.modal.querySelector('#test-api-btn');
            if (testApiBtn) {
                testApiBtn.addEventListener('click', () => this.autoTestConnection());
            }

            // Reset settings button
            const resetBtn = this.modal.querySelector('#reset-settings-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        this.resetSettings();
                        this.populateModalFields();
                    }
                });
            }

            // Delete cache button
            const deleteCacheBtn = this.modal.querySelector('#delete-cache-btn');
            if (deleteCacheBtn) {
                deleteCacheBtn.addEventListener('click', () => {
                    if (confirm('Are you sure you want to delete all cached data? This will clear conversation history and stored responses.')) {
                        this.deleteCache();
                    }
                });
            }

            // Close modal when clicking outside
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeSettingsModal();
                }
            });
        }

        openSettingsModal() {
            if (!this.modal) return;
            console.log("openSettingsModal called");
            
            this.populateModalFields();
            this.modal.style.display = 'block';
            this.isModalOpen = true;
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        closeSettingsModal() {
            if (!this.modal) return;
            
            this.modal.style.display = 'none';
            this.isModalOpen = false;
            document.body.style.overflow = ''; // Restore scrolling
        }

        switchTab(tabName) {
            // Hide all tab panes
            const tabPanes = this.modal.querySelectorAll('.tab-pane');
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Remove active class from all tab buttons
            const tabButtons = this.modal.querySelectorAll('.tab-button');
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Show selected tab
            const selectedPane = this.modal.querySelector(`#${tabName}-tab`);
            const selectedButton = this.modal.querySelector(`[data-tab="${tabName}"]`);

            if (selectedPane) selectedPane.classList.add('active');
            if (selectedButton) selectedButton.classList.add('active');
        }

        populateModalFields() {
            if (!this.modal) return;

            // API Configuration
            const providerSelect = this.modal.querySelector('#provider-select');
            const apiKeyInput = this.modal.querySelector('#api-key-input');
            const modelSelect = this.modal.querySelector('#model-select');
            const temperatureSlider = this.modal.querySelector('#temperature-slider');
            const temperatureValue = this.modal.querySelector('#temperature-value');
            const maxTokensInput = this.modal.querySelector('#max-tokens-input');

            // Populate provider options with enhanced configs
            if (providerSelect) {
                // Clear existing options
                providerSelect.innerHTML = '';
                
                // Add auto-detect option
                const autoOption = document.createElement('option');
                autoOption.value = 'auto';
                autoOption.textContent = '🔍 Auto-Detect Provider';
                providerSelect.appendChild(autoOption);
                
                // Add enhanced provider options
                Object.entries(PROVIDER_CONFIGS).forEach(([key, config]) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = `${config.logo} ${config.displayName}`;
                    providerSelect.appendChild(option);
                });
                
                // Set current value
                providerSelect.value = this.settings.provider;
            }
            if (apiKeyInput) apiKeyInput.value = this.settings.apiKey;
            if (temperatureSlider) {
                temperatureSlider.value = this.settings.temperature;
                if (temperatureValue) temperatureValue.textContent = this.settings.temperature;
            }
            if (maxTokensInput) maxTokensInput.value = this.settings.maxTokens;

            this.updateModelOptions(this.settings.provider);

            // Preferences
            const themeSelect = this.modal.querySelector('#theme-select');
            const fontSizeSelect = this.modal.querySelector('#font-size-select');
            const autoSaveCheck = this.modal.querySelector('#auto-save-check');
            const notificationsCheck = this.modal.querySelector('#notifications-check');
            const soundEffectsCheck = this.modal.querySelector('#sound-effects-check');
            const animationsCheck = this.modal.querySelector('#animations-check');

            if (themeSelect) themeSelect.value = this.settings.theme;
            if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
            if (autoSaveCheck) autoSaveCheck.checked = this.settings.autoSave;
            if (notificationsCheck) notificationsCheck.checked = this.settings.notifications;
            if (soundEffectsCheck) soundEffectsCheck.checked = this.settings.soundEffects;
            if (animationsCheck) animationsCheck.checked = this.settings.animations;

            // Advanced
            const timeoutInput = this.modal.querySelector('#timeout-input');
            const retryAttemptsInput = this.modal.querySelector('#retry-attempts-input');
            const saveConversationsCheck = this.modal.querySelector('#save-conversations-check');
            const shareAnalyticsCheck = this.modal.querySelector('#share-analytics-check');

            if (timeoutInput) timeoutInput.value = this.settings.timeout;
            if (retryAttemptsInput) retryAttemptsInput.value = this.settings.retryAttempts;
            if (saveConversationsCheck) saveConversationsCheck.checked = this.settings.saveConversations;
            if (shareAnalyticsCheck) shareAnalyticsCheck.checked = this.settings.shareAnalytics;
        }

        updateModelOptions(provider) {
            const modelSelect = this.modal?.querySelector('#model-select');
            if (!modelSelect) return;

            // Clear existing options
            modelSelect.innerHTML = '';

            // Add new options
            const config = PROVIDER_CONFIGS[provider];
            if (config && config.models) {
                config.models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });

                // Select current model or default
                modelSelect.value = this.settings.model || config.defaultModel;
            }
        }

        async saveSettingsFromModal() {
            if (!this.modal) return;

            try {
                const newSettings = {};

                // Collect API settings
                const providerSelect = this.modal.querySelector('#provider-select');
                const apiKeyInput = this.modal.querySelector('#api-key-input');
                const modelSelect = this.modal.querySelector('#model-select');
                const temperatureSlider = this.modal.querySelector('#temperature-slider');
                const maxTokensInput = this.modal.querySelector('#max-tokens-input');

                if (providerSelect) newSettings.provider = providerSelect.value;
                if (apiKeyInput) newSettings.apiKey = apiKeyInput.value.trim();
                if (modelSelect) newSettings.model = modelSelect.value;
                if (temperatureSlider) newSettings.temperature = parseFloat(temperatureSlider.value);
                if (maxTokensInput) newSettings.maxTokens = parseInt(maxTokensInput.value);

                // Collect preference settings
                const themeSelect = this.modal.querySelector('#theme-select');
                const fontSizeSelect = this.modal.querySelector('#font-size-select');
                const autoSaveCheck = this.modal.querySelector('#auto-save-check');
                const notificationsCheck = this.modal.querySelector('#notifications-check');
                const soundEffectsCheck = this.modal.querySelector('#sound-effects-check');
                const animationsCheck = this.modal.querySelector('#animations-check');

                if (themeSelect) newSettings.theme = themeSelect.value;
                if (fontSizeSelect) newSettings.fontSize = fontSizeSelect.value;
                if (autoSaveCheck) newSettings.autoSave = autoSaveCheck.checked;
                if (notificationsCheck) newSettings.notifications = notificationsCheck.checked;
                if (soundEffectsCheck) newSettings.soundEffects = soundEffectsCheck.checked;
                if (animationsCheck) newSettings.animations = animationsCheck.checked;

                // Collect advanced settings
                const timeoutInput = this.modal.querySelector('#timeout-input');
                const retryAttemptsInput = this.modal.querySelector('#retry-attempts-input');
                const saveConversationsCheck = this.modal.querySelector('#save-conversations-check');
                const shareAnalyticsCheck = this.modal.querySelector('#share-analytics-check');

                if (timeoutInput) newSettings.timeout = parseInt(timeoutInput.value);
                if (retryAttemptsInput) newSettings.retryAttempts = parseInt(retryAttemptsInput.value);
                if (saveConversationsCheck) newSettings.saveConversations = saveConversationsCheck.checked;
                if (shareAnalyticsCheck) newSettings.shareAnalytics = shareAnalyticsCheck.checked;

                // Save settings
                await this.saveSettings(newSettings);
                this.showNotification('Settings saved successfully!', 'success');
                this.closeSettingsModal();

            } catch (error) {
                console.error('❌ Error saving settings from modal:', error);
                this.showNotification('Failed to save settings. Please try again.', 'error');
            }
        }

        async saveAPISettingsOnly() {
            console.log('🔧 saveAPISettingsOnly method called');
            
            if (!this.modal) {
                console.error('❌ Modal not found!');
                return;
            }

            try {
                console.log('📋 Collecting API settings from modal...');
                const apiSettings = {};

                // Collect only API-related settings
                const providerSelect = this.modal.querySelector('#provider-select');
                const apiKeyInput = this.modal.querySelector('#api-key-input');
                const modelSelect = this.modal.querySelector('#model-select');
                const temperatureSlider = this.modal.querySelector('#temperature-slider');
                const maxTokensInput = this.modal.querySelector('#max-tokens-input');

                console.log('🔍 Form elements found:', {
                    provider: !!providerSelect,
                    apiKey: !!apiKeyInput,
                    model: !!modelSelect,
                    temperature: !!temperatureSlider,
                    maxTokens: !!maxTokensInput
                });

                if (providerSelect) apiSettings.provider = providerSelect.value;
                if (apiKeyInput) apiSettings.apiKey = apiKeyInput.value.trim();
                if (modelSelect) apiSettings.model = modelSelect.value;
                if (temperatureSlider) apiSettings.temperature = parseFloat(temperatureSlider.value);
                if (maxTokensInput) apiSettings.maxTokens = parseInt(maxTokensInput.value);

                console.log('📝 Collected API settings:', apiSettings);

                // Validate API key
                if (!apiSettings.apiKey) {
                    console.warn('⚠️ No API key provided');
                    this.showNotification('Please enter an API key before saving.', 'error');
                    return;
                }

                console.log('🔑 API key length:', apiSettings.apiKey.length);

                // Validate API key format (relaxed validation)
                const providerInfo = this.getProviderInfo(apiSettings.provider);
                if (providerInfo && apiSettings.apiKey.length < 10) {
                    console.warn('⚠️ API key too short for provider:', apiSettings.provider);
                    this.showNotification(`API key seems too short for ${providerInfo.name}. Please check your key.`, 'warning');
                    // Don't return, allow saving anyway for testing
                }

                console.log('✅ API key validation passed (or bypassed)');

                // Save only API settings
                console.log('💾 Saving API settings...');
                await this.saveSettings(apiSettings);
                
                // Provide immediate feedback
                console.log('🎉 API settings saved successfully!');
                this.showNotification('✅ API settings saved successfully!', 'success');
                
                // Update button to show saved state temporarily
                const saveApiBtn = this.modal.querySelector('#save-api-settings-btn');
                if (saveApiBtn) {
                    const originalText = saveApiBtn.innerHTML;
                    saveApiBtn.innerHTML = '✅ Saved!';
                    saveApiBtn.style.background = '#28a745';
                    setTimeout(() => {
                        saveApiBtn.innerHTML = originalText;
                        saveApiBtn.style.background = '#0078d4';
                    }, 2000);
                }

                console.log('💾 API settings saved:', apiSettings);

            } catch (error) {
                console.error('❌ Error saving API settings:', error);
                this.showNotification('Failed to save API settings. Please try again.', 'error');
            }
        }

        async testAPIFromModal() {
            const testBtn = this.modal?.querySelector('#test-api-btn');
            if (!testBtn) return;

            const originalText = testBtn.textContent;
            testBtn.textContent = 'Testing...';
            testBtn.disabled = true;

            try {
                // Get current values from modal
                const provider = this.modal.querySelector('#provider-select')?.value;
                const apiKey = this.modal.querySelector('#api-key-input')?.value.trim();
                const model = this.modal.querySelector('#model-select')?.value;

                if (!apiKey) {
                    this.showNotification('Please enter an API key first', 'warning');
                    return;
                }

                // Temporarily update settings for test
                const tempSettings = { provider, apiKey, model };
                const originalSettings = { ...this.settings };
                this.settings = { ...this.settings, ...tempSettings };

                // Run test
                const result = await this.testAPIConnection();
                
                // Restore original settings
                this.settings = originalSettings;

                if (result.success) {
                    this.showNotification('API connection test successful!', 'success');
                } else {
                    this.showNotification(`API test failed: ${result.error}`, 'error');
                }

            } catch (error) {
                console.error('❌ API test error:', error);
                this.showNotification(`API test error: ${error.message}`, 'error');
            } finally {
                testBtn.textContent = originalText;
                testBtn.disabled = false;
            }
        }

        // ==========================================
        // UTILITY METHODS
        // ==========================================

        scheduleAutoSave() {
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }

            this.autoSaveTimeout = setTimeout(() => {
                this.saveSettings();
            }, SETTINGS_CONFIG.autoSaveDelay);
        }

        updateUI() {
            // Apply theme
            document.documentElement.setAttribute('data-theme', this.settings.theme);
            
            // Apply font size
            document.documentElement.setAttribute('data-font-size', this.settings.fontSize);
            
            // Update extension state
            if (window.aiExtension) {
                window.aiExtension.state.settings = this.settings;
            }
            
            // Update settings status display in Settings tab
            this.updateSettingsStatus();
        }

        updateSettingsStatus() {
            try {
                const currentProvider = document.querySelector('#current-provider');
                const currentModel = document.querySelector('#current-model');
                const currentApiStatus = document.querySelector('#current-api-status');
                
                if (currentProvider) {
                    const providerInfo = this.getProviderInfo(this.settings.provider);
                    currentProvider.textContent = providerInfo ? providerInfo.name : (this.settings.provider || 'Not configured');
                }
                
                if (currentModel) {
                    currentModel.textContent = this.settings.model || 'Not selected';
                }
                
                if (currentApiStatus) {
                    if (this.settings.apiKey && this.settings.apiKey.length > 5) {
                        currentApiStatus.textContent = `Set (${this.settings.apiKey.length} characters)`;
                        currentApiStatus.style.color = '#28a745';
                    } else {
                        currentApiStatus.textContent = 'Not set';
                        currentApiStatus.style.color = '#dc3545';
                    }
                }
            } catch (error) {
                console.warn('Could not update settings status display:', error);
            }
        }

        showNotification(message, type = 'info') {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // Add to document
            document.body.appendChild(notification);
            
            // Remove after delay
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }

        getProviderInfo(provider) {
            return PROVIDER_CONFIGS[provider] || null;
        }

        getAvailableProviders() {
            return Object.keys(PROVIDER_CONFIGS);
        }

        async deleteCache() {
            try {
                console.log('🗑️ Deleting cache data...');
                
                // Clear conversation history
                if (window.chatStore) {
                    await window.chatStore.clearAll();
                    console.log('✅ Chat history cleared');
                }
                
                // Clear local storage cache
                const cacheKeys = Object.keys(localStorage).filter(key => 
                    key.startsWith('ai_') || 
                    key.startsWith('chat_') || 
                    key.startsWith('conversation_') ||
                    key.includes('cache')
                );
                
                cacheKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear session storage cache
                const sessionCacheKeys = Object.keys(sessionStorage).filter(key => 
                    key.startsWith('ai_') || 
                    key.startsWith('chat_') || 
                    key.startsWith('conversation_') ||
                    key.includes('cache')
                );
                
                sessionCacheKeys.forEach(key => {
                    sessionStorage.removeItem(key);
                });
                
                // Clear any CEP persistent data
                if (window.__adobe_cep__ && window.cep && window.cep.fs) {
                    try {
                        // Clear CEP file-based cache if it exists
                        console.log('🗑️ Clearing CEP cache...');
                    } catch (cepError) {
                        console.warn('⚠️ Could not clear CEP cache:', cepError);
                    }
                }
                
                // Clear memory cache if available
                if (window.aiExtension && window.aiExtension.cache) {
                    window.aiExtension.cache.clear();
                }
                
                console.log(`✅ Cache cleared successfully! Removed ${cacheKeys.length + sessionCacheKeys.length} items`);
                this.showNotification(`Cache cleared! Removed ${cacheKeys.length + sessionCacheKeys.length} cached items.`, 'success');
                
            } catch (error) {
                console.error('❌ Error deleting cache:', error);
                this.showNotification('Failed to delete cache: ' + error.message, 'error');
            }
        }

        async exportSettings() {
            try {
                const exportData = {
                    settings: this.settings,
                    version: SETTINGS_CONFIG.version,
                    exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: 'application/json'
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ai-extension-settings-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showNotification('Settings exported successfully!', 'success');
            } catch (error) {
                console.error('❌ Export error:', error);
                this.showNotification('Failed to export settings', 'error');
            }
        }

        async importSettings(fileInput) {
            try {
                const file = fileInput.files[0];
                if (!file) return;

                const text = await file.text();
                const data = JSON.parse(text);

                if (data.settings) {
                    await this.saveSettings(data.settings);
                    this.updateUI();
                    this.showNotification('Settings imported successfully!', 'success');
                    
                    if (this.isModalOpen) {
                        this.populateModalFields();
                    }
                } else {
                    throw new Error('Invalid settings file format');
                }
            } catch (error) {
                console.error('❌ Import error:', error);
                this.showNotification('Failed to import settings', 'error');
            }
        }
    }

    // ==========================================
    // MODULE INITIALIZATION AND EXPORT
    // ==========================================

    // Initialize settings module
    const settingsModule = new SettingsModule();
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => settingsModule.initialize());
    } else {
        settingsModule.initialize();
    }

    // Export to global scope
    window.settingsModule = settingsModule;
    
    // Register with extension system
    if (window.aiExtension) {
        window.aiExtension.modules.settings = settingsModule;
    }

    console.log('⚙️ Settings Module loaded and ready');

})();

// AI Provider Auto-Detection for CEP Extension
// Simplified version optimized for your extension

class AIProviderAutoDetector {
    constructor() {
        this.providerPatterns = {
            'openai': {
                name: 'OpenAI',
                pattern: (key) => key.startsWith('sk-') && !key.startsWith('sk-ant-'),
                testUrl: 'https://api.openai.com/v1/models',
                models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']
            },
            'google': {
                name: 'Google Gemini',
                pattern: (key) => key.length === 39 && /^[A-Za-z0-9_-]+$/.test(key),
                testUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
                models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro']
            },
            'anthropic': {
                name: 'Anthropic Claude',
                pattern: (key) => key.startsWith('sk-ant-'),
                testUrl: 'https://api.anthropic.com/v1/messages',
                models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229']
            }
        };
    }

    // Auto-detect provider from API key format
    detectProvider(apiKey) {
        if (!apiKey || apiKey.length < 10) return null;

        for (const [providerId, config] of Object.entries(this.providerPatterns)) {
            if (config.pattern(apiKey)) {
                return {
                    provider: providerId,
                    name: config.name,
                    models: config.models
                };
            }
        }

        return null;
    }

    // Quick API key validation
    async validateApiKey(apiKey, provider) {
        const config = this.providerPatterns[provider];
        if (!config) return { valid: false, error: 'Unknown provider' };

        try {
            let response;
            const timeoutController = new AbortController();
            const timeoutId = setTimeout(() => timeoutController.abort(), 5000); // 5 second timeout

            if (provider === 'openai') {
                response = await fetch(config.testUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    signal: timeoutController.signal
                });
            } else if (provider === 'google') {
                response = await fetch(`${config.testUrl}?key=${apiKey}`, {
                    method: 'GET',
                    signal: timeoutController.signal
                });
            } else if (provider === 'anthropic') {
                response = await fetch(config.testUrl, {
                    method: 'POST',
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 1,
                        messages: [{ role: 'user', content: 'test' }]
                    }),
                    signal: timeoutController.signal
                });
            }

            clearTimeout(timeoutId);

            if (response.ok) {
                return { valid: true, provider: config.name };
            } else {
                const errorText = await response.text();
                return { 
                    valid: false, 
                    error: `API Error: ${response.status} ${response.statusText}` 
                };
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return { valid: false, error: 'Request timeout' };
            }
            return { valid: false, error: error.message };
        }
    }

    // Get recommended models for provider
    getRecommendedModels(provider) {
        return this.providerPatterns[provider]?.models || [];
    }
}

// Integration with CEP Extension
class SmartAPIManager {
    constructor() {
        this.detector = new AIProviderAutoDetector();
        this.lastValidation = null;
        this.validationTimeout = null;
    }

    // Initialize auto-detection for API key input
    init() {
        const apiKeyInput = document.getElementById('api-key-setting');
        const providerSelect = document.getElementById('api-provider-setting');
        const modelSelect = document.getElementById('ai-model-setting');

        if (apiKeyInput) {
            // Add real-time validation with debouncing
            apiKeyInput.addEventListener('input', (e) => {
                this.handleApiKeyInput(e.target.value, providerSelect, modelSelect);
            });

            // Add validation indicator
            this.createValidationIndicator(apiKeyInput);
        }

        this.logger.debug('🤖 Smart API Manager initialized');
    }

    // Handle API key input with auto-detection
    async handleApiKeyInput(apiKey, providerSelect, modelSelect) {
        const indicator = document.getElementById('api-validation-indicator');
        
        // Clear previous timeout
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }

        // Reset indicator
        if (indicator) {
            indicator.innerHTML = '';
            indicator.className = 'validation-indicator';
        }

        if (!apiKey || apiKey.length < 10) {
            return;
        }

        // Show detecting status
        if (indicator) {
            indicator.innerHTML = '<i class="fa-solid fa-magnifying-glass fa-spin"></i> Detecting...';
            indicator.className = 'validation-indicator detecting';
        }

        // Debounce the validation
        this.validationTimeout = setTimeout(async () => {
            await this.performDetection(apiKey, providerSelect, modelSelect, indicator);
        }, 1000);
    }

    // Perform the actual detection and validation
    async performDetection(apiKey, providerSelect, modelSelect, indicator) {
        try {
            // Step 1: Detect provider from key format
            const detection = this.detector.detectProvider(apiKey);
            
            if (!detection) {
                if (indicator) {
                    indicator.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Unknown API key format';
                    indicator.className = 'validation-indicator warning';
                }
                return;
            }

            // Step 2: Update provider dropdown
            if (providerSelect && providerSelect.value !== detection.provider) {
                providerSelect.value = detection.provider;
                
                // Trigger change event to update any dependent elements
                const changeEvent = new Event('change', { bubbles: true });
                providerSelect.dispatchEvent(changeEvent);
            }

            // Step 3: Update model dropdown
            if (modelSelect) {
                this.updateModelOptions(modelSelect, detection.models, detection.provider);
            }

            // Step 4: Show detected provider
            if (indicator) {
                indicator.innerHTML = `<i class="fa-solid fa-robot"></i> Detected: ${detection.name}`;
                indicator.className = 'validation-indicator detected';
            }

            // Step 5: Validate API key (optional, with user consent)
            if (window.confirm(`Validate ${detection.name} API key? This will test connectivity.`)) {
                if (indicator) {
                    indicator.innerHTML = '<i class="fa-solid fa-wifi fa-spin"></i> Validating...';
                    indicator.className = 'validation-indicator validating';
                }

                const validation = await this.detector.validateApiKey(apiKey, detection.provider);
                
                if (validation.valid) {
                    if (indicator) {
                        indicator.innerHTML = `<i class="fa-solid fa-check-circle"></i> ✅ Valid ${detection.name} API`;
                        indicator.className = 'validation-indicator valid';
                    }
                } else {
                    if (indicator) {
                        indicator.innerHTML = `<i class="fa-solid fa-times-circle"></i> ❌ Invalid: ${validation.error}`;
                        indicator.className = 'validation-indicator invalid';
                    }
                }
            }

        } catch (error) {
            if (indicator) {
                indicator.innerHTML = `<i class="fa-solid fa-exclamation-triangle"></i> Error: ${error.message}`;
                indicator.className = 'validation-indicator error';
            }
            this.logger.error('API detection error:', error);
        }
    }

    // Update model dropdown options
    updateModelOptions(modelSelect, models, provider) {
        // Clear existing options
        modelSelect.innerHTML = '';

        // Add models for the detected provider
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        // Select the first/recommended model
        if (models.length > 0) {
            modelSelect.value = models[0];
        }

        this.logger.debug(`📝 Updated models for ${provider}:`, models);
    }

    // Create validation indicator element
    createValidationIndicator(apiKeyInput) {
        const indicator = document.createElement('div');
        indicator.id = 'api-validation-indicator';
        indicator.className = 'validation-indicator';
        
        // Insert after the API key input
        const parent = apiKeyInput.parentNode;
        const nextSibling = apiKeyInput.nextSibling;
        
        if (nextSibling) {
            parent.insertBefore(indicator, nextSibling);
        } else {
            parent.appendChild(indicator);
        }

        return indicator;
    }

    // Manual detection trigger (for button)
    async manualDetect() {
        const apiKeyInput = document.getElementById('api-key-setting');
        if (apiKeyInput && apiKeyInput.value) {
            const providerSelect = document.getElementById('api-provider-setting');
            const modelSelect = document.getElementById('ai-model-setting');
            const indicator = document.getElementById('api-validation-indicator');
            
            await this.performDetection(apiKeyInput.value, providerSelect, modelSelect, indicator);
        }
    }
}

// CSS for validation indicator (add to your existing styles)
const validationCSS = `
    .validation-indicator {
        margin-top: 8px;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.3s ease;
    }
    
    .validation-indicator.detecting {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .validation-indicator.detected {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #b7e7f0;
    }
    
    .validation-indicator.validating {
        background: #e2e3e5;
        color: #495057;
        border: 1px solid #ced4da;
    }
    
    .validation-indicator.valid {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .validation-indicator.invalid,
    .validation-indicator.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .validation-indicator.warning {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
`;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for validation indicator
    const style = document.createElement('style');
    style.textContent = validationCSS;
    document.head.appendChild(style);
    
    // Initialize smart API manager
    const smartManager = new SmartAPIManager();
    smartManager.init();
    
    // Make it globally available
    window.smartAPIManager = smartManager;
});

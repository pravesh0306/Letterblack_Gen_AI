/**
 * CONSOLIDATED AI MODULE - Adobe AI Generations Extension
 * Handles all AI provider integrations and response generation
 * Replaces multiple ai-related files with single consolidated module
 */

(function() {
    'use strict';

    // ==========================================
    // AI MODULE CONFIGURATION
    // ==========================================

    const AI_PROVIDERS = {
        google: {
            name: 'Google Gemini',
            endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
            models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
            defaultModel: 'gemini-1.5-flash'
        },
        openai: {
            name: 'OpenAI',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            defaultModel: 'gpt-4'
        },
        anthropic: {
            name: 'Anthropic Claude',
            endpoint: 'https://api.anthropic.com/v1/messages',
            models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
            defaultModel: 'claude-3-sonnet'
        }
    };

    const DEFAULT_SETTINGS = {
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 30000
    };

    // ==========================================
    // MAIN AI MODULE CLASS
    // ==========================================

    class AIModule {
        constructor() {
            this.isInitialized = false;
            this.requestCache = new Map();
            this.rateLimiter = new RateLimiter();
            
            console.log('🤖 AI Module initialized');
        }

        async initialize() {
            try {
                this.isInitialized = true;
                console.log('✅ AI Module ready');
                return true;
            } catch (error) {
                console.error('❌ AI Module initialization failed:', error);
                return false;
            }
        }

        // ==========================================
        // MAIN RESPONSE GENERATION
        // ==========================================

        async generateResponse(message, options = {}) {
            try {
                console.log('🤖 AI generateResponse called with:', { 
                    provider: options.provider || 'google', 
                    hasKey: !!options.apiKey, 
                    hasModel: !!options.model 
                });

                // Validate inputs
                if (!message || typeof message !== 'string') {
                    throw new Error('Invalid message provided');
                }

                if (!options.apiKey) {
                    throw new Error('API key is required');
                }

                // Set defaults
                const provider = options.provider || 'google';
                const model = options.model || AI_PROVIDERS[provider]?.defaultModel;
                const temperature = options.temperature ?? DEFAULT_SETTINGS.temperature;
                const maxTokens = options.maxTokens || DEFAULT_SETTINGS.maxTokens;

                // Check rate limiting
                if (!this.rateLimiter.canMakeRequest()) {
                    throw new Error('Rate limit exceeded. Please wait before making another request.');
                }

                // Check cache
                const cacheKey = this.getCacheKey(message, options);
                if (this.requestCache.has(cacheKey)) {
                    console.log('📦 Returning cached response');
                    return this.requestCache.get(cacheKey);
                }

                // Generate response based on provider
                let response;
                switch (provider) {
                    case 'google':
                        response = await this.generateGoogleResponse(message, {
                            apiKey: options.apiKey,
                            model,
                            temperature,
                            maxTokens
                        });
                        break;
                    case 'openai':
                        response = await this.generateOpenAIResponse(message, {
                            apiKey: options.apiKey,
                            model,
                            temperature,
                            maxTokens
                        });
                        break;
                    case 'anthropic':
                        response = await this.generateAnthropicResponse(message, {
                            apiKey: options.apiKey,
                            model,
                            temperature,
                            maxTokens
                        });
                        break;
                    default:
                        throw new Error(`Unsupported provider: ${provider}`);
                }

                // Cache the response
                this.requestCache.set(cacheKey, response);
                
                // Clean old cache entries
                this.cleanCache();

                console.log('✅ AI response generated successfully');
                return response;

            } catch (error) {
                console.error('❌ AI generateResponse error:', error);
                throw error;
            }
        }

        // ==========================================
        // GOOGLE GEMINI INTEGRATION
        // ==========================================

        async generateGoogleResponse(message, options) {
            try {
                const endpoint = `${AI_PROVIDERS.google.endpoint}?key=${options.apiKey}`;
                
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: this.enhanceMessageForAfterEffects(message)
                        }]
                    }],
                    generationConfig: {
                        temperature: options.temperature,
                        maxOutputTokens: options.maxTokens,
                        candidateCount: 1
                    }
                };

                const response = await this.makeAPIRequest(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
                    throw new Error('Invalid response format from Google API');
                }

                const content = response.candidates[0].content.parts[0].text;
                return this.formatResponseForChat(content);

            } catch (error) {
                console.error('❌ Google API error:', error);
                throw new Error(`Google API error: ${error.message}`);
            }
        }

        // ==========================================
        // OPENAI INTEGRATION
        // ==========================================

        async generateOpenAIResponse(message, options) {
            try {
                const endpoint = AI_PROVIDERS.openai.endpoint;
                
                const requestBody = {
                    model: options.model,
                    messages: [{
                        role: 'user',
                        content: this.enhanceMessageForAfterEffects(message)
                    }],
                    temperature: options.temperature,
                    max_tokens: options.maxTokens
                };

                const response = await this.makeAPIRequest(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${options.apiKey}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.choices || !response.choices[0] || !response.choices[0].message) {
                    throw new Error('Invalid response format from OpenAI API');
                }

                const content = response.choices[0].message.content;
                return this.formatResponseForChat(content);

            } catch (error) {
                console.error('❌ OpenAI API error:', error);
                throw new Error(`OpenAI API error: ${error.message}`);
            }
        }

        // ==========================================
        // ANTHROPIC CLAUDE INTEGRATION
        // ==========================================

        async generateAnthropicResponse(message, options) {
            try {
                const endpoint = AI_PROVIDERS.anthropic.endpoint;
                
                const requestBody = {
                    model: options.model,
                    max_tokens: options.maxTokens,
                    temperature: options.temperature,
                    messages: [{
                        role: 'user',
                        content: this.enhanceMessageForAfterEffects(message)
                    }]
                };

                const response = await this.makeAPIRequest(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${options.apiKey}`,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.content || !response.content[0] || !response.content[0].text) {
                    throw new Error('Invalid response format from Anthropic API');
                }

                const content = response.content[0].text;
                return this.formatResponseForChat(content);

            } catch (error) {
                console.error('❌ Anthropic API error:', error);
                throw new Error(`Anthropic API error: ${error.message}`);
            }
        }

        // ==========================================
        // UTILITY METHODS
        // ==========================================

        async makeAPIRequest(url, options) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), DEFAULT_SETTINGS.timeout);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                return await response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        }

        enhanceMessageForAfterEffects(message) {
            // Add After Effects context to improve AI responses
            const aeContext = `You are an expert Adobe After Effects assistant. When providing help, focus on:
- After Effects-specific workflows and features
- Expressions and scripting when relevant
- Visual effects and motion graphics best practices
- Practical, actionable advice

User question: ${message}`;

            return aeContext;
        }

        formatResponseForChat(content) {
            if (!content) return '';

            // Enhanced formatting for better readability
            return content
                .replace(/```([^`]+)```/g, '<div class="code-block"><pre><code>$1</code></pre></div>')
                .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>');
        }

        getCacheKey(message, options) {
            return `${options.provider || 'google'}-${options.model || 'default'}-${message.slice(0, 50)}`;
        }

        cleanCache() {
            if (this.requestCache.size > 100) {
                const entries = Array.from(this.requestCache.entries());
                // Remove oldest 50 entries
                for (let i = 0; i < 50; i++) {
                    this.requestCache.delete(entries[i][0]);
                }
            }
        }

        // ==========================================
        // DEPRECATED METHOD (for compatibility)
        // ==========================================

        async sendMessage(message) {
            console.warn('⚠️ sendMessage is deprecated. Use generateResponse instead.');
            throw new Error('sendMessage is deprecated. Use generateResponse instead.');
        }

        // ==========================================
        // PROVIDER MANAGEMENT
        // ==========================================

        getAvailableProviders() {
            return Object.keys(AI_PROVIDERS);
        }

        getProviderModels(provider) {
            return AI_PROVIDERS[provider]?.models || [];
        }

        validateProvider(provider) {
            return AI_PROVIDERS.hasOwnProperty(provider);
        }

        async testConnection(provider, apiKey, model) {
            try {
                const testMessage = "Hello, please respond with 'API test successful' if you can read this.";
                
                const response = await this.generateResponse(testMessage, {
                    provider,
                    apiKey,
                    model,
                    temperature: 0.1,
                    maxTokens: 50
                });

                return {
                    success: true,
                    response: response
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    }

    // ==========================================
    // RATE LIMITER CLASS
    // ==========================================

    class RateLimiter {
        constructor() {
            this.requests = [];
            this.maxRequests = 10; // Max requests per minute
            this.timeWindow = 60000; // 1 minute in milliseconds
        }

        canMakeRequest() {
            const now = Date.now();
            
            // Remove old requests outside the time window
            this.requests = this.requests.filter(time => now - time < this.timeWindow);
            
            // Check if we can make a new request
            if (this.requests.length < this.maxRequests) {
                this.requests.push(now);
                return true;
            }
            
            return false;
        }

        getTimeUntilNextRequest() {
            if (this.requests.length === 0) return 0;
            
            const oldestRequest = Math.min(...this.requests);
            const timeUntilExpiry = this.timeWindow - (Date.now() - oldestRequest);
            return Math.max(0, timeUntilExpiry);
        }
    }

    // ==========================================
    // MODULE INITIALIZATION AND EXPORT
    // ==========================================

    // Initialize AI module
    const aiModule = new AIModule();
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => aiModule.initialize());
    } else {
        aiModule.initialize();
    }

    // Export to global scope
    window.aiModule = aiModule;
    
    // Register with extension system
    if (window.aiExtension) {
        window.aiExtension.modules.ai = aiModule;
    }

    console.log('🤖 AI Module loaded and ready');

})();

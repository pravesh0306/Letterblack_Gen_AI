/**
 * LetterBlack GenAI - AI Module Bundle
 * Consolidated AI providers and processing
 */

// AI Providers
(function() {
    'use strict';

    class AIProviders {
        constructor() {
            this.providers = {
                google: {
                    name: 'Google Gemini',
                    models: [
                        'gemini-2.5-flash-preview-05-20',
                        'gemini-1.5-pro',
                        'gemini-1.5-flash'
                    ],
                    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
                    defaultModel: 'gemini-2.5-flash-preview-05-20'
                },
                openai: {
                    name: 'OpenAI',
                    models: [
                        'gpt-4o',
                        'gpt-4o-mini',
                        'gpt-4-turbo',
                        'gpt-3.5-turbo'
                    ],
                    endpoint: 'https://api.openai.com/v1/chat/completions',
                    defaultModel: 'gpt-4o-mini'
                }
            };
        }

        getProvider(name) {
            return this.providers[name] || null;
        }

        getAllProviders() {
            return Object.keys(this.providers);
        }

        getModels(providerName) {
            const provider = this.getProvider(providerName);
            return provider ? provider.models : [];
        }

        async testConnection(provider, apiKey, model) {
            // Return mock success for security - actual testing should be server-side
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        provider,
                        model,
                        message: 'Connection test completed (mock response for security)'
                    });
                }, 1000);
            });
        }
    }

    window.AIProviders = AIProviders;
})();

// AI Module
(function() {
    'use strict';

    class AIModule {
        constructor() {
            this.providers = new window.AIProviders();
            this.currentProvider = null;
            this.currentModel = null;
            this.apiKey = null;
            this.isProcessing = false;
        }

        async initialize(settings = {}) {
            this.currentProvider = settings.provider || 'google';
            this.currentModel = settings.model || this.providers.getProvider(this.currentProvider)?.defaultModel;
            this.apiKey = settings.apiKey || '';
            
            if (window.DEBUG) {
                console.log('🤖 AI Module initialized:', {
                    provider: this.currentProvider,
                    model: this.currentModel,
                    hasKey: !!this.apiKey
                });
            }
        }

        async processMessage(message, context = '') {
            if (this.isProcessing) {
                throw new Error('AI is currently processing another request');
            }

            this.isProcessing = true;

            try {
                // In a real implementation, this would make secure server-side calls
                // For now, return a mock response to avoid exposing API keys
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

                const response = {
                    success: true,
                    message: this.generateMockResponse(message),
                    provider: this.currentProvider,
                    model: this.currentModel,
                    usage: {
                        promptTokens: Math.floor(message.length / 4),
                        completionTokens: Math.floor(Math.random() * 200) + 50,
                        totalTokens: Math.floor(message.length / 4) + Math.floor(Math.random() * 200) + 50
                    }
                };

                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    provider: this.currentProvider,
                    model: this.currentModel
                };
            } finally {
                this.isProcessing = false;
            }
        }

        generateMockResponse(message) {
            const responses = [
                "I understand you're working with After Effects. Let me help you with that.",
                "Here's a solution for your After Effects project:",
                "That's a great question about motion graphics. Here's what I recommend:",
                "For After Effects automation, you can use expressions like this:",
                "Let me provide some script code that will help with your workflow:"
            ];
            
            return responses[Math.floor(Math.random() * responses.length)] + "\n\n" +
                   "// Example After Effects script\n" +
                   "var comp = app.project.activeItem;\n" +
                   "if (comp && comp instanceof CompItem) {\n" +
                   "    // Your script logic here\n" +
                   "    alert('Script executed successfully!');\n" +
                   "}";
        }

        formatResponseForChat(response) {
            if (!response.success) {
                return {
                    type: 'error',
                    content: `Error: ${response.error}`,
                    timestamp: new Date().toISOString()
                };
            }

            return {
                type: 'ai-response',
                content: response.message,
                provider: response.provider,
                model: response.model,
                usage: response.usage,
                timestamp: new Date().toISOString()
            };
        }

        getStatus() {
            return {
                initialized: !!this.currentProvider,
                provider: this.currentProvider,
                model: this.currentModel,
                processing: this.isProcessing,
                hasApiKey: !!this.apiKey
            };
        }

        updateSettings(settings) {
            if (settings.provider) this.currentProvider = settings.provider;
            if (settings.model) this.currentModel = settings.model;
            if (settings.apiKey !== undefined) this.apiKey = settings.apiKey;
        }
    }

    window.AIModule = AIModule;
})();

// Chat Assistant
(function() {
    'use strict';

    class ChatAssistant {
        constructor() {
            this.aiModule = null;
            this.chatHistory = [];
            this.maxHistoryLength = 50;
        }

        initialize(aiModule) {
            this.aiModule = aiModule;
            if (window.DEBUG) {
                console.log('💬 Chat Assistant initialized');
            }
        }

        async sendMessage(message, context = '') {
            if (!this.aiModule) {
                throw new Error('AI Module not initialized');
            }

            // Add user message to history
            this.addToHistory({
                type: 'user',
                content: message,
                timestamp: new Date().toISOString()
            });

            try {
                const response = await this.aiModule.processMessage(message, context);
                const formattedResponse = this.aiModule.formatResponseForChat(response);
                
                // Add AI response to history
                this.addToHistory(formattedResponse);

                return formattedResponse;
            } catch (error) {
                const errorResponse = {
                    type: 'error',
                    content: `Failed to get AI response: ${error.message}`,
                    timestamp: new Date().toISOString()
                };
                
                this.addToHistory(errorResponse);
                return errorResponse;
            }
        }

        addToHistory(message) {
            this.chatHistory.push(message);
            
            // Trim history if too long
            if (this.chatHistory.length > this.maxHistoryLength) {
                this.chatHistory = this.chatHistory.slice(-this.maxHistoryLength);
            }

            // Save to storage
            if (window.chatStorageManager) {
                window.chatStorageManager.saveMessage(message);
            }
        }

        getHistory() {
            return [...this.chatHistory];
        }

        clearHistory() {
            this.chatHistory = [];
            if (window.chatStorageManager) {
                window.chatStorageManager.clearHistory();
            }
        }

        formatCodeBlocks(content) {
            // Simple code block formatting
            return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'javascript';
                return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
            });
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    window.ChatAssistant = ChatAssistant;
})();

console.log('✅ AI Module bundle loaded');

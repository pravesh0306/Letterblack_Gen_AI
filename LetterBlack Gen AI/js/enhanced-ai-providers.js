/**
 * Enhanced AI Providers Module
 * Based on proven working patterns with image support and better error handling
 */

(function() {
    'use strict';
    
    class EnhancedAIProviders {
        constructor() {
            this.providers = {
                google: this.googleGemini.bind(this),
                openai: this.openAI.bind(this),
                groq: this.groq.bind(this),
                claude: this.claude.bind(this),
                cohere: this.cohere.bind(this),
                huggingface: this.huggingface.bind(this),
                together: this.together.bind(this),
                local: this.localAPI.bind(this),
                ollama: this.ollama.bind(this)
            };
            this.logger.debug('🤖 Enhanced AI Providers initialized');
        }

        async sendRequest(provider, message, apiKey, options = {}, imageBase64 = null) {
            if (!this.providers[provider]) {
                throw new Error(`Unsupported provider: ${provider}`);
            }

            if (!apiKey && provider !== 'local' && provider !== 'ollama') {
                throw new Error(`API key required for provider: ${provider}`);
            }

            return await this.providers[provider](message, apiKey, options, imageBase64);
        }

        async googleGemini(message, apiKey, options = {}, imageBase64 = null) {
            // Gemini 1.5 Flash supports both text and vision in the same model
            const model = options.model || 'gemini-1.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            
            let requestBody;

            if (imageBase64) {
                // Vision API request format
                const [mimeType, base64Data] = imageBase64.split(',');
                const mimeTypeClean = mimeType.match(/data:(.+);base64/)[1];
                
                requestBody = {
                    contents: [{
                        parts: [
                            { text: message },
                            {
                                inline_data: {
                                    mime_type: mimeTypeClean,
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxTokens || 2048
                    }
                };
            } else {
                // Regular text API request format
                requestBody = {
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        maxOutputTokens: options.maxTokens || 2048
                    }
                };
            }
            
            const response = await fetch(`${url}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response structure from Gemini API');
            }

            return data.candidates[0].content.parts[0].text;
        }

        async openAI(message, apiKey, options = {}, imageBase64 = null) {
            const url = 'https://api.openai.com/v1/chat/completions';
            
            let messages = [];
            
            if (imageBase64) {
                // Vision API format for GPT-4 Vision
                messages = [{
                    role: 'user',
                    content: [
                        { type: 'text', text: message },
                        { type: 'image_url', image_url: { url: imageBase64 } }
                    ]
                }];
            } else {
                messages = [{
                    role: 'user',
                    content: message
                }];
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || (imageBase64 ? 'gpt-4-vision-preview' : 'gpt-3.5-turbo'),
                    messages: messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }

        async groq(message, apiKey, options = {}) {
            const url = 'https://api.groq.com/openai/v1/chat/completions';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'mixtral-8x7b-32768',
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }

        async claude(message, apiKey, options = {}) {
            const url = 'https://api.anthropic.com/v1/messages';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: options.model || 'claude-3-sonnet-20240229',
                    max_tokens: options.maxTokens || 2048,
                    temperature: options.temperature || 0.7,
                    messages: [{
                        role: 'user',
                        content: message
                    }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Claude API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.content[0].text;
        }

        async cohere(message, apiKey, options = {}) {
            const url = 'https://api.cohere.ai/v1/generate';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'command',
                    prompt: message,
                    max_tokens: options.maxTokens || 2048,
                    temperature: options.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cohere API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.generations[0].text;
        }

        async huggingface(message, apiKey, options = {}) {
            const model = options.model || 'microsoft/DialoGPT-medium';
            const url = `https://api-inference.huggingface.co/models/${model}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: message,
                    parameters: {
                        temperature: options.temperature || 0.7,
                        max_length: options.maxTokens || 2048
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HuggingFace API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data[0].generated_text || data.generated_text;
        }

        async together(message, apiKey, options = {}) {
            const url = 'https://api.together.xyz/inference';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
                    prompt: message,
                    max_tokens: options.maxTokens || 2048,
                    temperature: options.temperature || 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Together API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.output.choices[0].text;
        }

        async localAPI(message, apiKey, options = {}) {
            const url = options.endpoint || 'http://localhost:1234/v1/chat/completions';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'local-model',
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Local API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }

        async ollama(message, apiKey, options = {}) {
            const url = options.endpoint || 'http://localhost:11434/api/generate';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: options.model || 'llama2',
                    prompt: message,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return data.response;
        }

        /**
         * Format AI response for chat display using ChatAssistant
         */
        formatResponseForChat(content) {
            // Use ChatAssistant for markdown processing if available
            if (window.chatAssistant && typeof window.chatAssistant.processMarkdown === 'function') {
                this.logger.debug('🎨 Using ChatAssistant.processMarkdown for formatting');
                return window.chatAssistant.processMarkdown(content);
            }
            
            // Fallback to basic formatting
            this.logger.debug('⚠️ ChatAssistant not available, using fallback formatting');
            return content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+?)`/g, '<code>$1</code>');
        }
    }

    // Export to global scope
    window.EnhancedAIProviders = EnhancedAIProviders;
    
    // Initialize if not already done
    if (!window.enhancedAIProviders) {
        window.enhancedAIProviders = new EnhancedAIProviders();
    }

})();

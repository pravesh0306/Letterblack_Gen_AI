// Define types for clarity

type Provider = 'google' | 'openai' | 'groq' | 'claude' | 'cohere' | 'huggingface' | 'together' | 'local' | 'ollama';

interface RequestOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    baseUrl?: string;
}

// AI Providers Module - Handles different AI service integrations
class AIProviders {
    private providers: Record<Provider, Function>;

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
    }

    async sendRequest(provider: Provider, message: string, apiKey: string | string[] | null, options: RequestOptions = {}, imageBase64: string | null = null): Promise<string> {
        if (!this.providers[provider]) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        if ((!apiKey || (Array.isArray(apiKey) && apiKey.length === 0)) && provider !== 'local' && provider !== 'ollama') {
            throw new Error(`API key required for provider: ${provider}`);
        }

        const keys = apiKey == null ? null : (Array.isArray(apiKey) ? apiKey.slice() : [apiKey]);
        const providerFn = this.providers[provider];

        if (keys === null) {
            return await providerFn(message, null, options, imageBase64);
        }

        return await this._attemptWithKeys(providerFn, message, keys, options, imageBase64);
    }

    private async _attemptWithKeys(providerFn: Function, message: string, keys: string[], options: RequestOptions, imageBase64: string | null): Promise<string> {
        const maxRetriesPerKey = 1;
        const baseDelayMs = 300;
        let lastErr: Error | null = null;

        for (const key of keys) {
            for (let attempt = 0; attempt <= maxRetriesPerKey; attempt++) {
                try {
                    const res = await providerFn(message, key, options, imageBase64);
                    return res;
                } catch (err: any) {
                    lastErr = err;
                    const msg = String(err.message || err);
                    if (/\b401\b|\b403\b/.test(msg)) {
                        break; // Invalid key, try next
                    }
                    if (/\b429\b|\b5\d{2}\b|timeout|network/i.test(msg)) {
                        if (attempt < maxRetriesPerKey) {
                            const delay = baseDelayMs * Math.pow(2, attempt);
                            await new Promise(r => setTimeout(r, delay));
                            continue; // Retry same key
                        }
                        break; // Move to next key after max retries
                    }
                    throw err; // Unrecoverable error
                }
            }
        }
        throw lastErr || new Error('All API keys failed');
    }

    private async googleGemini(message: string, apiKey: string, options: RequestOptions = {}, imageBase64: string | null = null): Promise<string> {
        const model = options.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const parts: any[] = [{ text: message }];
        if (imageBase64) {
            const [mimeType, base64Data] = imageBase64.split(',');
            const mimeTypeClean = mimeType.match(/data:(.+);base64/)?.[1] || 'image/png';
            parts.push({
                inline_data: {
                    mime_type: mimeTypeClean,
                    data: base64Data
                }
            });
        }

        const requestBody = {
            contents: [{ parts }],
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens ?? 2048
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from Gemini API');
        }
        return data.candidates[0].content.parts[0].text;
    }

    private async openAI(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
        const url = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'gpt-4',
                messages: [{ role: 'user', content: message }],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    private async groq(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'mixtral-8x7b-32768',
                messages: [{ role: 'user', content: message }],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    private async claude(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
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
                max_tokens: options.maxTokens ?? 2048,
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Claude API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    private async localAPI(message: string, apiKey: string | null, options: RequestOptions = {}): Promise<string> {
        const url = options.baseUrl || 'http://localhost:1234/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey || 'local'}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'local-model',
                messages: [{ role: 'user', content: message }],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 2048
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Local API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    private async ollama(message: string, apiKey: string | null, options: RequestOptions = {}): Promise<string> {
        const url = options.baseUrl || 'http://localhost:11434/api/generate';
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: options.model || 'llama2',
                prompt: message,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.response;
    }
    
    private async cohere(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
        const url = 'https://api.cohere.ai/v1/generate';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'command-light',
                prompt: message,
                max_tokens: options.maxTokens ?? 2048,
                temperature: options.temperature ?? 0.7,
                truncate: 'END'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Cohere API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.generations[0]?.text || 'No response generated';
    }

    private async huggingface(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
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
                    max_length: options.maxTokens || 512,
                    temperature: options.temperature || 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data[0]?.generated_text || data.generated_text || 'No response generated';
    }

    private async together(message: string, apiKey: string, options: RequestOptions = {}): Promise<string> {
        const url = 'https://api.together.xyz/inference';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: options.model || 'togethercomputer/llama-2-7b-chat',
                prompt: message,
                max_tokens: options.maxTokens ?? 2048,
                temperature: options.temperature ?? 0.7,
                stop: ['</s>', '[INST]']
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Together API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return data.output?.choices?.[0]?.text || data.choices?.[0]?.text || 'No response generated';
    }
}

export default new AIProviders();
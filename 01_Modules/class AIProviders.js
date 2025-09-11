class AIProviders {
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
            ollama: this.ollama.bind(this),
            replicate: this.replicate.bind(this), // New
            scale: this.scaleAI.bind(this),       // New
            amteam: this.amTeamAI.bind(this)     // New
        };
        this.defaultProvider = 'openai';
        this.defaultModel = 'gpt-4';
        this.supportedFeatures = {
            streaming: ['openai', 'replicate'], // Providers that support streaming
            functionCalling: ['openai'],        // Providers that support function calls
            imageGeneration: ['google', 'replicate'] // Providers supporting image tasks
        };
    }

    /**
     * Standardized method to send requests with autodetection, streaming, and error handling.
     * @param {string} message - User prompt.
     * @param {string} apiKey - API key (if required).
     * @param {Object} options - Provider-specific options (model, temperature, stream, functions, etc.).
     * @param {string} [imageBase64] - Optional image data (data URL) for vision tasks.
     * @returns {string|Object} Generated response (text or structured data).
     */
    async sendRequest(message, apiKey, options = {}, imageBase64 = null) {
        // Autodetect provider/model if not provided
        if (!options.provider || !options.model) {
            const detected = await this.autodetectProviderAndModel(message, { apiKey, imageBase64 });
            options = { ...options, ...detected };
        }

        const { provider, model } = options;
        if (!this.providers[provider]) {
            throw new Error(`Unsupported provider: ${provider}. Use one of: ${Object.keys(this.providers)}`);
        }

        // Validate API key requirement
        if (!apiKey && !['local', 'ollama'].includes(provider)) {
            throw new Error(`API key required for ${provider.toUpperCase()} provider.`);
        }

        try {
            // Check for streaming support and enable if requested
            if (options.stream && this.supportedFeatures.streaming.includes(provider)) {
                return this.providers[provider](message, apiKey, { ...options, stream: true }, imageBase64);
            }

            // Regular request
            const result = await this.providers[provider](message, apiKey, options, imageBase64);
            return result;
        } catch (error) {
            // Enrich error with provider/model context
            throw new Error(`[${provider.toUpperCase()}] Error: ${error.message}`);
        }
    }

    /**
     * Autodetect provider/model based on API key, message, and image presence.
     * @param {string} message - User prompt.
     * @param {Object} context - Detection context (apiKey, imageBase64).
     * @returns {Object} Detected provider, model, and options.
     */
    async autodetectProviderAndModel(message, context = {}) {
        const savedConfig = await window.secureAPIStorage.getItem('custom-config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                if (this.validateProvider(config.provider)) {
                    console.log('Using saved custom config:', config);
                    return { provider: config.provider, model: config.model, options: config.options };
                }
            } catch (error) {
                console.error('Invalid custom config:', error);
            }
        }

        // Detect via API key pattern (customize with actual provider prefixes)
        if (context.apiKey) {
            if (context.apiKey.startsWith('sk-')) return { provider: 'openai', model: 'gpt-4', options: {} };
            if (context.apiKey.startsWith('rp-')) return { provider: 'replicate', model: 'mistralai/mistral-7b-v0.1', options: {} };
            if (context.apiKey.startsWith('sc-')) return { provider: 'scale', model: 'gpt-4', options: {} };
            if (context.apiKey.startsWith('am-')) return { provider: 'amteam', model: 'creative-text-v1', options: {} };
        }

        // Detect via message content (e.g., image requests)
        const isImageTask = message.toLowerCase().includes('image') || message.toLowerCase().includes('visual');
        if (isImageTask && context.provider !== 'custom') {
            if (this.supportedFeatures.imageGeneration.includes('replicate') && context.apiKey?.startsWith('rp-')) {
                return { provider: 'replicate', model: 'stabilityai/stable-diffusion-3', options: { image: true } };
            }
            if (this.supportedFeatures.imageGeneration.includes('google') && context.apiKey?.startsWith('AIza')) {
                return { provider: 'google', model: 'gemini-2.5-flash', options: { image: true } };
            }
        }

        // Default to OpenAI if no detection
        console.log('Autodetection failed. Falling back to default.');
        return { provider: this.defaultProvider, model: this.defaultModel, options: {} };
    }

    /**
     * Validate if a provider is supported.
     * @param {string} provider - Provider name to check.
     * @returns {boolean} True if supported.
     */
    validateProvider(provider) {
        return Object.keys(this.providers).includes(provider);
    }

    // --- Existing Provider Methods (Refined) --- //
    async googleGemini(message, apiKey, options = {}, imageBase64 = null) {
        const model = options.model || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const isImageTask = options.image || imageBase64 !== null;

        let requestBody;
        if (isImageTask) {
            const [mimeType, base64Data] = imageBase64.split(',');
            const mimeTypeClean = mimeType.match(/data:(.+);base64/)?.[1];
            if (!mimeTypeClean) throw new Error('Invalid imageBase64 format (missing MIME type).');

            requestBody = {
                contents: [{
                    parts: [
                        { text: message },
                        { inline_data: { mime_type: mimeTypeClean, data: base64Data } }
                    ]
                }],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 2048
                }
            };
        } else {
            requestBody = {
                contents: [{ parts: [{ text: message }] }],
                generationConfig: { temperature: options.temperature || 0.7, maxOutputTokens: options.maxTokens || 2048 }
            };
        }

        const response = await fetch(`${url}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API error (${response.status}): ${await response.text()}`);
        const data = await response.json();

        if (!data.candidates?.[0]?.content) throw new Error('Invalid response structure.');
        return data.candidates[0].content.parts[0].text;
    }

    async openAI(message, apiKey, options = {}, imageBase64 = null) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const model = options.model || 'gpt-4';
        const stream = options.stream || false;
        const functions = options.functions || [];

        let requestBody = {
            model: model,
            messages: [{ role: 'user', content: message }],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2048,
            stream: stream
        };

        // Add function calling support if enabled
        if (functions.length > 0 && this.supportedFeatures.functionCalling.includes('openai')) {
            requestBody.functions = functions;
            requestBody.function_call = options.functionCall || { name: 'auto' };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API error (${response.status}): ${await response.text()}`);

        if (stream) {
            return this.handleOpenAIStream(response);
        }

        const data = await response.json();
        if (!data.choices?.[0]?.message?.content) throw new Error('No content in response.');
        return data.choices[0].message.content;
    }

    async handleOpenAIStream(response) {
        const reader = response.body.getReader();
        const chunks = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkText = new TextDecoder().decode(value);
            // OpenAI streams return "data: " prefixed JSON chunks
            const lines = chunkText.split('\n').filter(line => line.startsWith('data:') && line.trim() !== '');
            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line.replace('data:', '').trim());
                    if (parsed.choices?.[0]?.delta?.content) {
                        chunks.push(parsed.choices[0].delta.content);
                        // Emit chunk to UI (optional)
                        // window.dispatchEvent(new CustomEvent('ai-stream', { detail: { content: chunks.join('') } }));
                    }
                } catch (error) {
                    console.warn('Invalid stream chunk:', line, error);
                }
            }
        }
        return chunks.join('');
    }

    // --- New Provider Methods --- //
    async replicate(message, apiKey, options = {}, imageBase64 = null) {
        const model = options.model || 'mistralai/mistral-7b-v0.1';
        const isImageTask = options.image || imageBase64 !== null;
        const url = 'https://api.replicate.com/v1/predictions';

        // Adjust input based on task type
        const input = isImageTask ? { image: imageBase64 } : message;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                input: input,
                parameters: {
                    temperature: options.temperature || 0.7,
                    max_tokens: options.maxTokens || 2048
                }
            })
        });

        if (!response.ok) throw new Error(`API error (${response.status}): ${await response.text()}`);
        let data = await response.json();

        // Poll for async predictions (Replicate may return pending)
        if (data.status !== 'succeeded') {
            data = await this.pollReplicatePrediction(data.id, apiKey);
        }

        return data.output || 'No output from Replicate.';
    }

    async pollReplicatePrediction(predictionId, apiKey) {
        const url = `https://api.replicate.com/v1/predictions/${predictionId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });

        if (!response.ok) throw new Error(`Poll error (${response.status}): ${await response.text()}`);
        let data = await response.json();

        // Retry until prediction succeeds or fails
        if (data.status === 'failed') throw new Error(data.error || 'Prediction failed.');
        if (data.status !== 'succeeded') {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before polling again
            data = await this.pollReplicatePrediction(predictionId, apiKey);
        }
        return data;
    }

    async scaleAI(message, apiKey, options = {}, imageBase64 = null) {
        const model = options.model || 'gpt-4';
        const url = 'https://api.scale.com/v1/predict';

        const requestBody = {
            model: model,
            input: imageBase64 ? { text: message, image: imageBase64 } : message,
            options: {
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API error (${response.status}): ${await response.text()}`);
        const data = await response.json();

        if (!data.output?.text) throw new Error('Scale AI response missing text.');
        return data.output.text;
    }

    async amTeamAI(message, apiKey, options = {}, imageBase64 = null) {
        const model = options.model || 'creative-text-v1';
        const url = 'https://api.am-team.ai/v1/generate';

        const requestBody = {
            prompt: message,
            model: model,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2048
        };

        if (imageBase64) requestBody.image_prompt = imageBase64; // If image support is enabled

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) throw new Error(`API error (${response.status}): ${await response.text()}`);
        const data = await response.json();

        if (!data.response) throw new Error('A-M-Team response missing.');
        return data.response;
    }

    // --- Keep Existing Provider Methods (Refined) --- //
    // ... (retain and refine other methods like groq, claude, cohere, etc. with similar improvements) ...
}

window.AIProviders = AIProviders;
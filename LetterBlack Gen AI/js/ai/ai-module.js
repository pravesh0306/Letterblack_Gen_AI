// HONEST AI Module - NO FAKE RESPONSES
// This module ONLY makes real API calls or clearly fails

class AIModule {
    constructor() {
        // Initialize logging system
        this.logger = this.createLogger();
        
        if (window.AIProviders) {
            this.apiProviders = new window.AIProviders();
            this.logger.info('AI Module initialized with real providers');
        } else {
            this.apiProviders = null;
            this.logger.error('AIProviders not available - NO FAKE RESPONSES WILL BE GIVEN');
        }
        
        // Initialize rate limiting and queue system
        this.rateLimiter = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        
        // Initialize effects module (will be set when chat memory is available)
        this.effectsModule = null;
        
        // Initialize utility modules
        this.performanceCache = null;
        this.enhancedChatMemory = null;
        this.youtubeTutorialHelper = null;
        this.browserVideoTranscriber = null;
        
        // Try to connect utility modules
        this.initializeUtilityModules();
    }

    /**
     * Initialize utility modules if available
     */
    initializeUtilityModules() {
        // Connect performance cache
        if (window.performanceCache) {
            this.performanceCache = window.performanceCache;
            this.logger.info('Performance Cache connected to AI Module');
        }
        
        // Connect enhanced chat memory  
        if (window.enhancedChatMemory) {
            this.enhancedChatMemory = window.enhancedChatMemory;
            this.logger.info('Enhanced Chat Memory connected to AI Module');
        }
        
        // Connect YouTube tutorial helper
        if (window.youtubeTutorialHelper) {
            this.youtubeTutorialHelper = window.youtubeTutorialHelper;
            this.logger.info('YouTube Tutorial Helper connected to AI Module');
        }
        
        // Connect browser video transcriber
        if (window.browserVideoTranscriber) {
            this.browserVideoTranscriber = window.browserVideoTranscriber;
            this.logger.info('Browser Video Transcriber connected to AI Module');
        }
    }

    /**
     * Creates a production-ready logging system
     * @returns {Object} Logger with debug, info, warn, error methods
     */
    createLogger() {
        const isDev = window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1';
        
        return {
            debug: (message, ...args) => {
                if (isDev) this.logger.debug(`🔍 [DEBUG] ${message}`, ...args);
            },
            info: (message, ...args) => {
                if (isDev) this.logger.debug(`ℹ️ [INFO] ${message}`, ...args);
            },
            warn: (message, ...args) => {
                this.logger.warn(`⚠️ [WARN] ${message}`, ...args);
            },
            error: (message, ...args) => {
                this.logger.error(`❌ [ERROR] ${message}`, ...args);
            }
        };
    }

    /**
     * Initialize the AI module
     * Sets up dependencies and prepares for operation
     */
    async init(container) {
        this.logger.info('Initializing AI Module...');
        if (container) {
            container.innerHTML = '<div class="module-status">AI Module Loaded.<br>Ready to generate scripts and analyze context.</div>';
        }
        // ...existing initialization logic...
        try {
            if (!this.apiProviders) {
                this.logger.warn('AI Providers not available - module will have limited functionality');
                return false;
            }
            if (window.ChatMemory) {
                this.setChatMemory(new window.ChatMemory());
                this.logger.info('Chat memory initialized');
            }
            if (window.SettingsManager) {
                this.settingsManager = window.SettingsManager;
                this.logger.info('Settings manager connected');
            }
            if (typeof CSInterface !== 'undefined') {
                try {
                    const projectContext = await this.getProjectContext();
                    this.logger.info('Project context loaded:', projectContext ? 'Available' : 'None');
                } catch (error) {
                    this.logger.warn('Could not load project context:', error.message);
                }
            }
            this.logger.info('AI Module initialization complete');
            return true;
            
        } catch (error) {
            this.logger.error('AI Module initialization failed:', error);
            return false;
        }
    }

    // Set chat memory and initialize effects module
    setChatMemory(chatMemory) {
        this.chatMemory = chatMemory;
        if (window.EffectsPresetsModule) {
            this.effectsModule = new window.EffectsPresetsModule(chatMemory);
            this.logger.info('Effects & Presets module initialized with chat memory');
        }
        
        // Initialize layer analysis module
        if (window.LayerAnalysisModule) {
            this.layerAnalysis = new window.LayerAnalysisModule();
            this.logger.info('Layer Analysis module initialized');
        }

        // Initialize Advanced SDK Integration
        if (window.AdvancedSDKIntegration) {
            this.advancedSDK = new window.AdvancedSDKIntegration();
            this.logger.info('Advanced SDK Integration initialized');
            
            // Listen for project changes to trigger AI context updates
            window.addEventListener('aeProjectChange', (event) => {
                this.handleProjectChange(event.detail);
            });
        }
    }

    async sendMessage(message) {
        this.logger.debug('📤 AI Module: Received message:', message);
        
        throw new Error('sendMessage is deprecated. Use generateResponse instead.');
    }

    async handleYouTubeLinks(message) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
        const videoFileRegex = /\.(?:mp4|mov|avi|mkv|webm|m4v)$/i;
        
        // Check for YouTube URLs
        const youtubeMatches = message.match(youtubeRegex);
        
        if (youtubeMatches) {
            this.logger.debug('🎬 YouTube link detected, processing with enhanced modules...');
            
            // Use YouTube Tutorial Helper if available
            if (this.youtubeTutorialHelper) {
                try {
                    const tutorialResponse = await this.youtubeTutorialHelper.processYouTubeLink(message);
                    if (tutorialResponse) {
                        // Add to enhanced chat memory
                        if (this.enhancedChatMemory) {
                            this.enhancedChatMemory.addMessage(message, 'user', { type: 'youtube_tutorial' });
                            this.enhancedChatMemory.addMessage(tutorialResponse.content, 'assistant', { type: 'tutorial_response' });
                        }
                        return tutorialResponse;
                    }
                } catch (error) {
                    this.logger.warn('YouTube Tutorial Helper error:', error);
                }
            }
            
            // Fallback to browser video transcriber
            if (this.browserVideoTranscriber) {
                try {
                    const videoUrl = youtubeMatches[0];
                    const transcription = await this.browserVideoTranscriber.processVideoUrl(videoUrl);
                    
                    if (transcription) {
                        const response = {
                            type: 'video_analysis',
                            content: `🎥 **Video Analysis Complete**\n\n${transcription.summary}\n\n**Key Points:**\n${transcription.keyPoints.map(p => `• ${p}`).join('\n')}\n\n**Suggested Actions:**\n${transcription.suggestedActions.map(a => `• ${a}`).join('\n')}`,
                            transcription: transcription
                        };
                        
                        // Cache the response
                        if (this.performanceCache) {
                            const cacheKey = this.performanceCache.generateKey(videoUrl);
                            this.performanceCache.set(cacheKey, response);
                        }
                        
                        return response;
                    }
                } catch (error) {
                    this.logger.warn('Browser Video Transcriber error:', error);
                }
            }
        }
        if (youtubeMatches) {
            try {
                if (window.realisticYouTubeHelper) {
                    return await window.realisticYouTubeHelper.processYouTubeUrl(youtubeMatches[0], message);
                } else if (window.youtubeHelper) {
                    return await window.youtubeHelper.processYouTubeUrl(youtubeMatches[0], message);
                }
            } catch (error) {
                this.logger.warn('YouTube processing failed:', error);
            }
        }
        
        // Check for video file references
        if (videoFileRegex.test(message) || message.includes('tutorial video') || message.includes('video file')) {
            return {
                type: 'video_file_guidance',
                response: `🎬 **Video Tutorial Assistant Ready!**

I can help you work with tutorial videos in several ways:

**📁 LOCAL VIDEO FILES:**
• Click the video upload button (📄) next to the chat input
• I'll import it to your After Effects project
• Get automated suggestions based on video analysis
• Follow along with step-by-step guidance

**🎯 WHAT I CAN AUTOMATE:**
• **Text Animations:** Typewriter, kinetic typography, title sequences
• **Logo Animations:** Brand reveals, logo intros, corporate animations  
• **Motion Graphics:** Particle systems, abstract backgrounds, transitions
• **Effects:** Glitch, cinematic looks, color grading, vintage film
• **Project Setup:** Compositions, layers, basic workflow automation

**💡 EXAMPLE REQUESTS:**
• "Help me create a typewriter text animation"
• "Apply a glow effect to my selected layer"  
• "Write an expression for wiggling position"

What specific technique would you like me to help automate?`,
                
                suggestedActions: [
                    {
                        label: "Upload Tutorial Video",
                        action: "upload_video",
                        description: "Import MP4/MOV file for analysis"
                    },
                    {
                        label: "Show Text Animations",
                        action: "showTextAnimations", 
                        description: "Available text automation"
                    },
                    {
                        label: "Show Effects Library",
                        action: "showEffectsLibrary",
                        description: "Browse automation-ready effects"
                    }
                ]
            };
        }
        
        return null;
    }

    getCurrentSettings() {
        // Get settings from the UI
        const apiKeyInput = document.getElementById('api-key-setting');
        const modelSelect = document.getElementById('model-select-setting');
        const providerSelect = document.getElementById('ai-provider');
        
        return {
            provider: providerSelect?.value || 'gemini',
            apiKey: apiKeyInput?.value || '',
            model: modelSelect?.value || 'gemini-flash'
        };
    }

    async getProjectContext() {
        // Get current After Effects project context
        return new Promise((resolve) => {
            if (window.CSInterface) {
                const cs = new CSInterface();
                cs.evalScript('getProjectInfo()', (result) => {
                    try {
                        const context = JSON.parse(result);
                        resolve(context);
                    } catch (error) {
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    async generateResponse(message, options = {}) {
        const { apiKey, provider, fileData, model, temperature, maxTokens, chatHistory = [] } = options;
        
        try {
            this.logger.debug('🤖 AI generateResponse called with:', { provider, hasKey: !!apiKey, hasModel: !!model });
            
            // Validate inputs
            if (!provider) {
                throw new Error('No AI provider specified');
            }
            
            if (!apiKey) {
                throw new Error('API key is required for AI responses. Please set your API key in Settings.');
            }
            
            if (!this.apiProviders) {
                throw new Error('AI providers module not loaded');
            }

            // Handle image data if present
            let imageBase64 = null;
            if (fileData && fileData.base64) {
                imageBase64 = fileData.base64;
                // Ensure correct MIME type prefix for image data
                if (!imageBase64.startsWith('data:') && fileData.mimeType) {
                    imageBase64 = `data:${fileData.mimeType};base64,${imageBase64}`;
                }
            }
            
            // First check for YouTube URLs and handle them specially
            const youtubeResponse = await this.handleYouTubeLinks(message);
            if (youtubeResponse) {
                this.logger.debug('🎬 YouTube URL detected, returning specialized response');
                return youtubeResponse.response;
            }

            // Get current layer analysis for context
            let layerAnalysis = null;
            if (this.layerAnalysis && this.shouldAnalyzeLayer(message)) {
                try {
                    layerAnalysis = await this.layerAnalysis.analyzeSelectedLayers();
                    this.logger.debug('🔍 Layer analysis completed for AI context');
                } catch (error) {
                    this.logger.warn('⚠️ Layer analysis failed:', error.message);
                }
            }

            // Build context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(message, null, null, imageBase64, chatHistory, layerAnalysis);
            this.logger.debug('📝 Built contextual prompt, length:', contextualPrompt.length);
            
            // Make REAL API request
            this.logger.debug(`🌐 Making API request to ${provider}...`);
            const response = await this.apiProviders.sendRequest(
                provider,
                contextualPrompt,
                apiKey,
                {
                    model: model || 'gemini-1.5-flash',
                    temperature: typeof temperature === 'number' ? temperature : 0.7,
                    maxTokens: typeof maxTokens === 'number' ? maxTokens : 2048
                },
                imageBase64
            );
            this.logger.debug('✅ API response received successfully');
            
            return this.processAIResponse(response, provider);
            
        } catch (error) {
            this.logger.error('❌ AI generateResponse error:', error);
            
            // Return helpful error messages
            if (error.message.includes('API key') || error.message.includes('api key')) {
                return `❌ **API Key Error**: Please set your API key in the Settings tab.\n\n📍 **How to fix:**\n1. Click the "Settings" tab below\n2. Get your API key from Google AI Studio\n3. Paste it in the API Key field\n4. Click "Save & Test"`;
            } else if (error.message.includes('provider') || error.message.includes('Unsupported provider')) {
                return `❌ **Provider Error**: Invalid AI provider selected.\n\n📍 **How to fix:**\n1. Go to Settings tab\n2. Select a valid provider (Google Gemini recommended)\n3. Save your settings`;
            } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                return `❌ **Network Error**: Could not connect to the AI service.\n\n📍 **Possible solutions:**\n• Check your internet connection\n• Verify your API key is valid\n• Try again in a moment`;
            } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
                return `❌ **Authentication Error**: Invalid API key.\n\n📍 **How to fix:**\n1. Get a new API key from your AI provider\n2. Update it in Settings\n3. Make sure it has the correct permissions`;
            } else if (error.message.includes('429') || error.message.includes('rate limit')) {
                return `❌ **Rate Limit**: Too many requests. Please wait a moment and try again.\n\n📍 **Tip:** Free API tiers have usage limits.`;
            } else {
                return `❌ **Error**: ${error.message}\n\n📍 **What to try:**\n• Check your Settings configuration\n• Verify your internet connection\n• Try a different AI provider`;
            }
        }
    }

    processAIResponse(response, provider) {
        // Process and clean up the AI response
        if (!response) {
            return 'No response received from AI provider.';
        }
        
        // Clean up common formatting issues
        let cleanResponse = response.trim();
        
        // Remove any provider-specific artifacts
        if (provider === 'google') {
            // Clean up Gemini-specific formatting
            cleanResponse = cleanResponse.replace(/^\*\*Assistant:\*\*\s*/i, '');
        }
        
        // Format the response content with enhanced code blocks but return as string
        return this.formatResponseContent(cleanResponse);
    }

    /**
     * Format response content with enhanced code blocks
     */
    formatResponseContent(text) {
        // Process code blocks with enhanced features
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let processedText = text;
        
        processedText = processedText.replace(codeBlockRegex, (match, language, code) => {
            const lang = language || 'javascript';
            const blockId = `code-block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const detectedType = this.detectCodeType(code, lang);
            
            return `
                <div class="enhanced-code-block" data-block-id="${blockId}">
                    <div class="code-header">
                        <span class="code-language" data-current-type="${detectedType}" data-block-id="${blockId}">
                            ${lang || detectedType}
                            <i class="fas fa-sync-alt toggle-icon" title="Toggle between Expression/JSX"></i>
                        </span>
                        <div class="code-actions">
                            <button class="code-btn" data-action="copy" title="Copy to clipboard">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="code-btn" data-action="save" title="Save to library">
                                <i class="fas fa-bookmark"></i>
                            </button>
                            <button class="code-btn primary" data-action="apply" title="Apply to After Effects">
                                <i class="fas fa-play"></i> Apply to AE
                            </button>
                        </div>
                    </div>
                    <pre class="code-content"><code class="language-${lang}" data-raw-code="${this.escapeHtml(code)}">${this.escapeHtml(code)}</code></pre>
                    <div class="code-feedback"></div>
                </div>
            `;
        });
        
        // Process other markdown elements
        processedText = this.processBasicMarkdown(processedText);
        
        // Note: setupCodeBlockInteractions will be called by the parent function that has access to messageElement
        
        return processedText;
    }

    /**
     * Add message to chat with enhanced features from comparison analysis
     */
    addAIMessage(content, isUser = false, chatContainer = null) {
        const chatMessages = chatContainer || document.getElementById('chat-messages');
        if (!chatMessages) {
            this.logger.error('Chat messages container not found');
            return null;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isUser) {
            // User messages are plain text with proper escaping
            messageContent.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
        } else {
            // AI messages get full formatting with enhanced code blocks
            messageContent.innerHTML = this.formatResponseContent(content);
            // Set up interactions after content is added
            setTimeout(() => {
                this.setupCodeBlockInteractions(messageContent);
            }, 10);
        }
        
        // Add timestamp (enhanced feature from comparison)
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(timestamp);
        chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to bottom (enhanced feature from comparison)
        this.scrollToBottom(chatMessages);
        
        // Apply syntax highlighting if available
        if (window.Prism) {
            Prism.highlightAllUnder(messageDiv);
        }
        
        return messageDiv;
    }

    /**
     * Show typing indicator while AI processes (enhanced feature from comparison)
     */
    showTypingIndicator(chatContainer = null) {
        const chatMessages = chatContainer || document.getElementById('chat-messages');
        if (!chatMessages) return null;
        
        // Remove existing typing indicator
        this.hideTypingIndicator(chatContainer);
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-animation">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        this.scrollToBottom(chatMessages);
        
        return typingDiv;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator(chatContainer = null) {
        const chatMessages = chatContainer || document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Smooth scroll to bottom (enhanced feature from comparison)
     */
    scrollToBottom(chatContainer) {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    /**
     * Enhanced AI response handler with typing indicator
     */
    handleAIResponse(response, chatContainer = null) {
        // Remove typing indicator
        this.hideTypingIndicator(chatContainer);
        
        // Add formatted AI response with timestamp
        return this.addAIMessage(response, false, chatContainer);
    }

    /**
     * Enhanced send message with typing indicator
     */
    async sendUserMessage(message, chatContainer = null) {
        if (!message || !message.trim()) return;
        
        // Add user message with timestamp
        this.addAIMessage(message, true, chatContainer);
        
        // Show typing indicator
        this.showTypingIndicator(chatContainer);
        
        try {
            // Get current settings for AI request
            const settings = this.getCurrentSettings();
            
            // Generate AI response
            const response = await this.generateResponse(message, {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model
            });
            
            // Handle the response
            this.handleAIResponse(response, chatContainer);
            
        } catch (error) {
            this.logger.error('Error in sendUserMessage:', error);
            this.hideTypingIndicator(chatContainer);
            this.handleAIResponse(`❌ Error: ${error.message}`, chatContainer);
        }
    }

    /**
     * Setup interactive features for code blocks
     */
    setupCodeBlockInteractions(messageElement) {
        const codeBlocks = messageElement.querySelectorAll('.enhanced-code-block');
        
        codeBlocks.forEach(block => {
            const actions = block.querySelectorAll('[data-action]');
            const feedback = block.querySelector('.code-feedback');
            const codeElement = block.querySelector('code');
            
            actions.forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const action = button.dataset.action;
                    const code = codeElement.dataset.rawCode || codeElement.textContent;
                    
                    try {
                        switch (action) {
                            case 'copy':
                                await navigator.clipboard.writeText(code);
                                this.showFeedback(feedback, '✅ Copied to clipboard', 'success');
                                break;
                                
                            case 'save':
                                this.saveCodeToLibrary(code);
                                this.showFeedback(feedback, '✅ Saved to library', 'success');
                                break;
                                
                            case 'apply':
                                await this.applyCodeToAfterEffects(code);
                                this.showFeedback(feedback, '✅ Applied to After Effects', 'success');
                                break;
                        }
                    } catch (error) {
                        this.showFeedback(feedback, `❌ ${error.message}`, 'error');
                    }
                });
            });
        });
    }

    /**
     * Show feedback messages in code blocks
     */
    showFeedback(feedbackElement, message, type = 'info') {
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.className = `code-feedback ${type}`;
        feedbackElement.style.display = 'block';
        
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 3000);
    }

    /**
     * Apply code to After Effects
     */
    async applyCodeToAfterEffects(code) {
        if (!window.CSInterface) {
            throw new Error('After Effects connection not available');
        }
        
        return new Promise((resolve, reject) => {
            const cs = new CSInterface();
            
            // Wrap code in try-catch for safety
            const safeCode = `
                try {
                    ${code}
                    "SUCCESS: Code executed";
                } catch (error) {
                    "ERROR: " + error.toString();
                }
            `;
            
            cs.evalScript(safeCode, (result) => {
                if (result.startsWith('ERROR:')) {
                    reject(new Error(result.replace('ERROR: ', '')));
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Save code to library
     */
    saveCodeToLibrary(code) {
        const savedScripts = JSON.parse(localStorage.getItem('ae_saved_scripts') || '[]');
        const timestamp = new Date().toISOString();
        
        savedScripts.push({
            code,
            timestamp,
            id: Date.now()
        });
        
        localStorage.setItem('ae_saved_scripts', JSON.stringify(savedScripts));
    }

    // DUPLICATE METHOD REMOVED - Using comprehensive detectCodeType method from line 1237

    /**
     * Escape HTML entities - MASTER METHOD
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Process basic markdown (bold, italic, links)
     */
    processBasicMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Apply syntax highlighting using Prism.js
     */
    applySyntaxHighlighting() {
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }

    buildContextualPrompt(userMessage, projectContext, analysisResult = null, imageBase64 = null, chatHistory = [], layerAnalysis = null) {
        // Get recent chat history for context (last 6 messages)
        const recentHistory = chatHistory.slice(-6);
        let historyContext = '';
        
        if (recentHistory.length > 0) {
            historyContext = '\n\nRECENT CONVERSATION:\n';
            recentHistory.forEach((msg, index) => {
                const speaker = msg.type === 'user' ? 'USER' : 'ASSISTANT';
                historyContext += `${speaker}: ${msg.text.substring(0, 200)}${msg.text.length > 200 ? '...' : ''}\n`;
            });
            historyContext += '\n';
        }

        // Add layer analysis context if available
        let layerContext = '';
        if (layerAnalysis && this.layerAnalysis && !layerAnalysis.error) {
            layerContext = '\n' + this.layerAnalysis.formatAnalysisForAI(layerAnalysis) + '\n';
            
            // Add smart suggestions
            const suggestions = this.layerAnalysis.generateSmartSuggestions(layerAnalysis);
            if (suggestions.length > 0) {
                layerContext += '**🎯 SMART SUGGESTIONS:**\n';
                suggestions.forEach(suggestion => {
                    layerContext += suggestion + '\n';
                });
                layerContext += '\n';
            }
        }

        // Check for effects/presets requests and use specialized context
        const isEffectRequest = this.isEffectOrPresetRequest(userMessage);
        if (isEffectRequest && this.effectsModule) {
            const effectContext = this.effectsModule.analyzeEffectContext(userMessage);
            const effectResponse = this.effectsModule.generateEffectResponse(userMessage, effectContext);
            
            if (effectResponse) {
                // Return the specialized effect response with layer context
                return `You are an After Effects assistant specialized in effects and presets.

${historyContext}${layerContext}EFFECT CONTEXT ANALYSIS:
- Last Applied Effect: ${effectContext.lastAppliedEffect || 'None'}
- Requested Effect: ${effectContext.requestedEffect || 'General'}  
- Modification Intent: ${effectContext.modificationIntent}
- Color Modification: ${effectContext.colorModification || 'None'}

INTELLIGENT EFFECT APPLICATION:
Based on the conversation history and current layer analysis, provide the following response:

${effectResponse}`;
            }
        }
        
        // Detect UI/ExtendScript requests specifically
        const isUIRequest = userMessage && (
            userMessage.toLowerCase().includes('create ui') ||
            userMessage.toLowerCase().includes('create button') ||
            userMessage.toLowerCase().includes('script to create') ||
            userMessage.toLowerCase().includes('extendscript') ||
            userMessage.toLowerCase().includes('jsx') ||
            userMessage.toLowerCase().includes('ui that has') ||
            userMessage.toLowerCase().includes('button that creates')
        );

        if (isUIRequest) {
            // Specialized prompt for ExtendScript/UI requests
            let prompt = `You are an After Effects ExtendScript expert helping with UI creation and automation. 

${historyContext}IMPORTANT: Remember the context from our conversation above. The user is continuing our discussion about creating UI scripts.

EXTENDSCRIPT CAPABILITIES:
- Create ScriptUI panels with buildUI() function
- Use app.project.activeItem for active composition
- Use layer.addNull() to create null objects  
- Use layer.parent to set parenting relationships
- Handle selected layers with comp.selectedLayers array
- Create buttons with panel.add("button")

COMMON SYNTAX FIXES FOR AFTER EFFECTS SCRIPTING:
❌ thisComp.selectedLayers  →  ✅ app.project.activeItem.selectedLayers
❌ var selectedLayers = thisComp.selectedLayers  →  ✅ var selectedLayers = app.project.activeItem.selectedLayers
❌ addNull()  →  ✅ comp.layers.addNull()
❌ app.project.items.addNull()  →  ✅ comp.layers.addNull() (for layer creation)
❌ repelNull = app.project.items.addNull()  →  ✅ repelNull = comp.layers.addNull()

FIXING THE REPEL NULL SCRIPT SYNTAX ERROR:
The error is on line 12 where "thisComp.selectedLayers" should be "app.project.activeItem.selectedLayers" in ExtendScript context.

RESPONSE FORMAT FOR UI REQUESTS:
\`\`\`javascript
// ExtendScript UI Panel: [description]
(function() {
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("dialog", "Repel Null Creator");
        
        // Add your UI elements here
        var createBtn = panel.add("button", undefined, "Create Repel Null");
        createBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (comp && comp.selectedLayers.length > 0) {
                app.beginUndoGroup("Create Repel Null");
                
                // Create the repel null
                var repelNull = comp.layers.addNull();
                repelNull.name = "Repel Null";
                
                // Apply repel expression
                var repelExpression = 'var strength = 100;\\n';
                repelExpression += 'var repelPos = [0,0];\\n';
                repelExpression += 'for (var i = 1; i <= thisComp.numLayers; i++) {\\n';
                repelExpression += '  var layer = thisComp.layer(i);\\n';
                repelExpression += '  if (layer !== thisLayer) {\\n';
                repelExpression += '    var layerPos = layer.transform.position.value;\\n';
                repelExpression += '    var distX = layerPos[0] - value[0];\\n';
                repelExpression += '    var distY = layerPos[1] - value[1];\\n';
                repelExpression += '    var dist = Math.sqrt(distX * distX + distY * distY);\\n';
                repelExpression += '    if (dist > 0 && dist < 200) {\\n';
                repelExpression += '      repelPos[0] -= (distX / dist) * strength / dist;\\n';
                repelExpression += '      repelPos[1] -= (distY / dist) * strength / dist;\\n';
                repelExpression += '    }\\n';
                repelExpression += '  }\\n';
                repelExpression += '}\\n';
                repelExpression += '[value[0] + repelPos[0], value[1] + repelPos[1]];';
                
                repelNull.transform.position.expression = repelExpression;
                repelNull.selected = true;
                
                app.endUndoGroup();
                alert("Repel Null created successfully!");
            } else {
                alert("Please select at least one layer to repel from!");
            }
        };
        
        panel.layout.layout(true);
        return panel;
    }
    
    var scriptPanel = buildUI(this);
    if (scriptPanel instanceof Window) {
        scriptPanel.show();
    }
})();
\`\`\`

USER REQUEST: ${userMessage}`;
            
            if (projectContext) {
                prompt += `\n\nAE PROJECT CONTEXT: ${projectContext}`;
            }
            
            return prompt;
        }
        
        // Standard After Effects assistant prompt (with image support)
        let prompt = `You are a friendly After Effects assistant with perfect memory of our conversation and full awareness of the current layer state. ${imageBase64 ? 'You can see and analyze images to help with creative projects.' : 'You love helping with expressions, animations, and creative problem-solving.'}

${historyContext}${layerContext}REMEMBER: Continue our conversation naturally based on the context above. If we were discussing a specific script, UI, or problem, reference it directly.

LAYER-AWARE INTELLIGENCE:
- You can see exactly what effects are applied to the selected layer(s)
- You know the current transform values, expressions, and settings
- Provide suggestions based on what's already applied
- Reference specific effect properties and values when helping

BE NATURAL AND CONVERSATIONAL:
- Talk like you're helping a friend with their ongoing project
- Reference previous messages when relevant ("As we discussed..." or "Building on your repel null script...")
- Reference current layer state ("I see you have a glow effect applied..." or "Your layer is currently scaled to 150%...")
- Use everyday language, not just technical jargon
- Be encouraging and enthusiastic about their creative work
- Provide working code when helpful, but explain it in plain English

${imageBase64 ? `
WHEN ANALYZING IMAGES:
- Describe what you see in a natural way
- Suggest creative ideas based on the visual content
- Offer practical After Effects techniques to achieve similar looks
- Be specific about colors, composition, and mood you observe

` : ''}RESPONSE STYLE:
- Start with a friendly acknowledgment of what they're trying to do
- Provide working expressions/scripts when relevant, but explain them clearly
- Use encouraging language ("That's a great effect to create!")
- Ask follow-up questions if you need clarification
- Suggest creative variations or improvements

EXAMPLE TONE:
Provide clear, concise guidance and generate expressions or scripts on demand. Do not embed long, hardcoded example snippets in the shipped UI; instead generate them dynamically or refer to the user's saved snippets.
COMMON REQUESTS MAPPING:
- "wiggle" -> Generate a wiggle-style expression on request (ask for parameters if missing)
- "animate text" -> Generate typewriter or reveal expressions when requested
- "rotation" -> Provide a rotation expression or formula when asked
- "scale" -> Provide scale expressions when relevant
- "random" -> Provide guidance on using random/wiggle functions dynamically
- "position" -> Offer position-related expressions on demand
- "create ui" or "script" -> Generate ExtendScript scaffolding when requested
- "null" or "parent" -> Provide layer creation/parenting script snippets when requested

EFFECT & PRESET APPLICATION WITH MEMORY:
When user mentions effects/presets, reference conversation history:
- "apply glow" → Check if they've used effects before, suggest complementary effects
- "make it blue/red/etc" → Reference the last effect mentioned and modify its color
- "add motion blur" → Consider what effects are already applied based on conversation
- "remove that effect" → Reference the most recently applied effect from history
- "adjust the settings" → Refer to the specific effect mentioned in recent messages

CONTEXT-AWARE EFFECT SUGGESTIONS:
- If conversation shows "glow" was applied → Suggest complementary effects (drop shadow, outer glow)
- If conversation shows "text animation" → Suggest text-specific effects (typewriter, fade in)
- If conversation shows "logo animation" → Suggest logo-specific presets (reveal, scale in)

EXPRESSION FORMAT:
When asked to provide expressions, generate code dynamically and ask follow-ups for parameters if needed. Avoid shipping fixed sample expressions in the UI.

${imageBase64 ? 'IMAGE PROVIDED: Analyze the uploaded image and provide relevant After Effects guidance based on what you observe.' : ''}

AVAILABLE FUNCTIONS:
- createTextLayer(text), createSolid(color, name, width, height)
- createKeyframeAnimation(layerName, property, keyframes)
- applyExpression(expression), applyEffect(effectName)`;

        // Add clarity analysis if available
        if (analysisResult) {
            prompt += `\n\nCLARITY ANALYSIS:
- Wants code: ${analysisResult.wantsCode}
- Is conversational: ${analysisResult.isConversational}
- Suggested approach: ${analysisResult.suggestedApproach}`;
        }

        prompt += `\n\nPROJECT CONTEXT: ${projectContext || 'No AE project context'}

USER: ${userMessage || 'Image uploaded for analysis'}`;

        return prompt;
    }

    /**
     * Analyze whether a user request is clear enough for a direct answer
     * or if clarifying questions should be asked
     */
    analyzeRequestClarity(message, projectContext) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Indicators user wants code/script
        const codeRequestIndicators = [
            'code', 'script', 'expression', 'write me', 'create', 'generate',
            'give me the code', 'show me the script', 'how do I code',
            'write expression', 'create script', 'generate code'
        ];

        // Indicators of casual conversation topics
        const conversationIndicators = [
            'how do', 'what is', 'why', 'when should', 'which is better',
            'help with', 'advice', 'recommend', 'suggest', 'explain',
            'what are', 'how to', 'best way', 'good way'
        ];

        // Check if user explicitly wants code
        const wantsCode = codeRequestIndicators.some(indicator => 
            lowerMessage.includes(indicator)
        );

        // Check if it's a conversational question
        const isConversational = conversationIndicators.some(indicator => 
            lowerMessage.includes(indicator)
        );

        // Determine approach
        let suggestedApproach = 'conversation';
        if (wantsCode) {
            suggestedApproach = 'provide_code';
        } else if (isConversational) {
            suggestedApproach = 'conversation';
        }

        return {
            wantsCode: wantsCode,
            isConversational: isConversational,
            suggestedApproach: suggestedApproach,
            message: lowerMessage
        };
    }

    processAIResponse(response, provider) {
        // Clean up response formatting
        let processedResponse = response.trim();
        
        // Remove provider attribution - keep responses clean
        // processedResponse += `\n\n*Response from ${provider.toUpperCase()}*`;
        
        // Log successful response
        this.logger.debug(`✅ AI response received from ${provider}`);
        
        return processedResponse;
    }

    // DUPLICATE METHOD REMOVED - Using detectCodeType(code, language) method from line 541

    /**
     * Get SVG icon for code type
     */
    getTypeIcon(codeType) {
        const icons = {
            'Expression': `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7,2V13H10V22L17,10H13L17,2H7Z"/>
            </svg>`,
            'ExtendScript': `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3"/>
            </svg>`,
            'JavaScript': `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11.03L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11.03C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>`,
            'Code': `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6Z"/>
            </svg>`
        };
        return icons[codeType] || icons['Code'];
    }

    // DUPLICATE METHOD REMOVED - Using escapeHtml method from line 558

    // Format YouTube tutorial responses
    formatTutorialResponse(tutorialResponse) {
        if (tutorialResponse.type === 'youtube_tutorial') {
            // Add execute buttons for suggested actions
            let formattedResponse = tutorialResponse.response;
            
            if (tutorialResponse.suggestedActions) {
                formattedResponse += '\n\n**🎯 QUICK ACTIONS:**\n';
                tutorialResponse.suggestedActions.forEach(action => {
                    formattedResponse += `[Execute: ${action.label}] - ${action.description}\n`;
                });
            }
            
            return formattedResponse;
        }
        
        return tutorialResponse.response;
    }

    getProviderOptions(provider) {
        const options = {
            temperature: 0.7,
            maxTokens: 2048
        };

        switch (provider) {
            case 'google':
                options.model = 'gemini-1.5-flash-latest';
                break;
            case 'openai':
                options.model = 'gpt-4';
                break;
            case 'groq':
                options.model = 'mixtral-8x7b-32768';
                options.temperature = 0.5; // More focused for coding
                break;
            case 'claude':
                options.model = 'claude-3-sonnet-20240229';
                break;
            case 'local':
                options.baseUrl = 'http://localhost:1234/v1/chat/completions';
                break;
            case 'ollama':
                options.baseUrl = 'http://localhost:11434/api/generate';
                options.model = 'codellama';
                break;
        }

        return options;
    }

    // Rate limiting to prevent API abuse
    isRateLimited(provider) {
        const now = Date.now();
        const lastRequest = this.rateLimiter.get(provider);
        
        if (!lastRequest) return false;
        
        // Different limits per provider
        const limits = {
            google: 1000,   // 1 second
            openai: 2000,   // 2 seconds (more expensive)
            groq: 500,      // 0.5 seconds (faster/cheaper)
            claude: 2000,   // 2 seconds
            local: 100,     // 0.1 seconds
            ollama: 100     // 0.1 seconds
        };
        
        const limit = limits[provider] || 1000;
        return (now - lastRequest) < limit;
    }

    addToRateLimit(provider) {
        this.rateLimiter.set(provider, Date.now());
    }

    // Enhanced error logging with context
    logError(message, error, context = {}) {
        const errorInfo = {
            message,
            error: error.message || error,
            timestamp: new Date().toISOString(),
            context
        };
        
        this.logger.error(`[AI Module] ${message}:`, errorInfo);
        
        // Could send to analytics or error tracking service
        this.sendErrorToAnalytics(errorInfo);
    }

    sendErrorToAnalytics(errorInfo) {
        // Placeholder for error analytics
        // Could integrate with services like Sentry, LogRocket, etc.
        if (window.errorHandler) {
            window.errorHandler.handleError(new Error(errorInfo.message), errorInfo.context);
        }
    }

    // Queue system for handling multiple requests
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const { requestFn, resolve, reject } = this.requestQueue.shift();
            
            try {
                const result = await requestFn();
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessing = false;
    }

    // Handle project change events from Advanced SDK
    handleProjectChange(changeDetail) {
        this.logger.debug('🎬 Project change detected:', changeDetail);
        
        // Update context automatically for more intelligent responses
        if (this.chatMemory && changeDetail.type === 'selection_changed') {
            // Add context message about layer selection
            this.chatMemory.addMessage('system', `Layer selection changed: ${JSON.stringify(changeDetail.data)}`, {
                isContextUpdate: true,
                timestamp: changeDetail.timestamp
            });
        }
    }

    // Enhanced project context using Advanced SDK
    async getEnhancedProjectContext() {
        if (!this.advancedSDK || !this.advancedSDK.isConnected()) {
            return this.getProjectContext(); // Fallback to basic context
        }

        try {
            // Attempt to get the full, enhanced context
            const [layerAnalysis, performanceMetrics] = await Promise.all([
                this.advancedSDK.getAdvancedLayerAnalysis(),
                this.advancedSDK.getPerformanceMetrics()
            ]);

            return {
                basic: await this.getProjectContext(),
                advanced: {
                    layerAnalysis,
                    performance: performanceMetrics,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            this.logger.error('Enhanced project context failed, falling back to basic context:', error);
            // On failure, return only the basic context to ensure stability
            return this.getProjectContext();
        }
    }

    /**
     * Format response for tutorial steps with interactive buttons
     */
    formatTutorialStepResponse(response) {
        if (!response) return null;

        let formattedResponse = response.response;

        // Add interactive buttons for tutorial actions
        if (response.actions && response.actions.length > 0) {
            formattedResponse += '\n\n**🚀 ACTIONS:**\n';
            response.actions.forEach(action => {
                formattedResponse += `[${action.label}](${action.url}) - ${action.description}\n`;
            });
        }

        return formattedResponse;
    }

    /**
     * Build fallback response when AI cannot generate a valid one
     */
    buildFallbackResponse(message) {
        return `I understand you want help with: "${message}"

However, I need a valid API key and provider configuration to generate AI responses.

**What I can still help with:**
• Basic After Effects automation (see available functions)
• Expression writing assistance  
• Project setup guidance
• Common animation techniques

Please configure your AI provider in the Settings tab, or ask me for specific automation help!`;
    }

    /**
     * Get random After Effects fact for welcome screen
     */
    getRandomAEFact() {
        const facts = [
            "💡 **Did you know?** After Effects was originally created in 1993 by David Herbstman, David Simons, and David M. Cotter at the Company of Science and Art.",
            "🎬 **Fun Fact:** The maximum composition length in After Effects is 3 hours - perfect for feature films!",
            "⚡ **Pro Tip:** You can use expressions to link properties across multiple layers with just `pickwhip` connections.",
            "🚀 **Speed Hack:** Pre-composing (Ctrl/Cmd+Shift+C) can dramatically improve render times for complex animations.",
            "🎨 **Creative Trick:** The Echo effect can create multiple trailing copies of your layer for stunning motion graphics.",
            "🔥 **Performance:** After Effects can utilize up to 128 GB of RAM - more RAM = faster previews and renders!",
            "🎯 **Precision:** You can position layers with sub-pixel accuracy using decimal values (e.g., 100.5, 200.25).",
            "⭐ **Hidden Gem:** The Graph Editor (Shift+F3) is where the real animation magic happens - master those curves!",
            "💫 **Time Saver:** Ctrl/Cmd+D duplicates layers, but Alt+drag creates linked duplicates that update together.",
            "🎪 **Amazing:** After Effects has been used in over 90% of Hollywood blockbusters since the 2000s!",
            "🔧 **Workflow:** You can import Photoshop files as compositions and retain all layer styles and blend modes.",
            "🎵 **Audio Magic:** After Effects can visualize audio waveforms and automatically sync animations to beats.",
            "🌟 **Expressions:** The 'wiggle()' function is the most used expression - it adds natural randomness to any property.",
            "⚡ **Shortcut Master:** 'U' twice (UU) reveals all modified properties - essential for debugging complex projects.",
            "🎬 **Industry Standard:** After Effects is used by 99% of motion graphics professionals worldwide.",
            "🚀 **GPU Power:** After Effects leverages GPU acceleration for effects like Lumetri Color and Element 3D.",
            "🎨 **Color Science:** After Effects works in 32-bit color depth for maximum image quality and color grading.",
            "💎 **Hidden Feature:** You can use the Roto Brush tool to automatically separate subjects from backgrounds.",
            "🎯 **Precision Tool:** The Puppet Pin tool uses advanced mesh deformation - perfect for character animation.",
            "⭐ **Time Magic:** Time Remapping lets you speed up, slow down, or reverse time on any layer dynamically."
        ];
        
        return facts[Math.floor(Math.random() * facts.length)];
    }

    // Check if user message is about effects or presets
    isEffectOrPresetRequest(message) {
        const lowerMessage = message.toLowerCase();
        const effectKeywords = [
            'apply', 'add', 'effect', 'preset', 'glow', 'shadow', 'blur', 
            'color correction', 'lumetri', 'motion blur', 'drop shadow',
            'make it', 'change', 'adjust', 'modify', 'turn it', 'set it to'
        ];
        
        return effectKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    // Determine if layer analysis should be performed based on user message
    shouldAnalyzeLayer(message) {
        const lowerMessage = message.toLowerCase();
        const analysisKeywords = [
            'current', 'this layer', 'selected', 'what effects', 'analyze',
            'scan', 'inspect', 'check', 'see', 'look at', 'examine',
            'modify', 'adjust', 'change', 'update', 'tweak',
            'apply', 'add', 'remove', 'delete', 'effect', 'preset'
        ];
        
        return analysisKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    /**
     * Format AI response with professional code blocks and enhanced styling
     */
    formatResponseForChat(response) {
        if (!response || typeof response !== 'string') {
            return response;
        }

        this.logger.debug('🎨 Formatting response with Chat Assistant...');
        
        // Use Chat Assistant's processMarkdown for consistent rendering
        if (window.chatAssistant && typeof window.chatAssistant.processMarkdown === 'function') {
            return window.chatAssistant.processMarkdown(response);
        }
        
        // Fallback to original method if Chat Assistant not available
        this.logger.warn('⚠️ Chat Assistant not available, using fallback formatting');
        
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        let formattedResponse = response;
        
        formattedResponse = formattedResponse.replace(codeBlockRegex, (match, language, code) => {
            const cleanLang = language || 'text';
            const cleanCode = code.trim();
            this.logger.debug(`📝 Processing code block: ${cleanLang}, ${cleanCode.length} chars`);
            return this.createProfessionalCodeBlock(cleanCode, cleanLang);
        });

        // Convert line breaks to HTML
        formattedResponse = formattedResponse.replace(/\n/g, '<br>');

        this.logger.debug('✅ Response formatting complete');
        return formattedResponse;
    }

    /**
     * Create professional code block with blue header like GitHub Copilot
     */
    createProfessionalCodeBlock(code, language) {
        const escapedCode = this.escapeHtml(code);
        const detectedType = this.detectCodeType(code, language);
        const blockId = `code-block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        return `
            <div class="code-block-container" id="${blockId}">
                <div class="code-header">
                    <span class="code-language">${detectedType.display}</span>
                    <div class="code-actions">
                        <button class="copy-btn" onclick="window.copyCodeBlock('${blockId}')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        ${detectedType.canApply ? `
                            <button class="apply-btn" onclick="window.applyCodeBlock('${blockId}')">
                                <i class="fas fa-play"></i> Apply
                            </button>
                        ` : ''}
                        <button class="view-btn" onclick="window.viewCodeBlock('${blockId}')">
                            <i class="fas fa-expand"></i> View
                        </button>
                    </div>
                </div>
                <div class="code-content" data-code="${this.escapeHtml(code).replace(/"/g, '&quot;')}" data-type="${detectedType.type}">
                    <pre><code class="language-${language}">${escapedCode}</code></pre>
                </div>
            </div>
        `;
    }

    /**
     * Detect code type and determine if it can be applied to expressions
     */
    detectCodeType(code, language) {
        const lowerCode = code.toLowerCase();
        const lowerLang = (language || '').toLowerCase();

        // After Effects Expression detection
        if (lowerLang === 'javascript' || lowerLang === 'js' || lowerLang === 'expression') {
            if (lowerCode.includes('wiggle') || 
                lowerCode.includes('time') || 
                lowerCode.includes('transform') ||
                lowerCode.includes('rotation') ||
                lowerCode.includes('position') ||
                lowerCode.includes('scale') ||
                lowerCode.includes('opacity') ||
                lowerCode.includes('loopout') ||
                lowerCode.includes('ease')) {
                return { type: 'expression', display: 'After Effects Expression', canApply: true };
            }
        }

        // ExtendScript detection
        if (lowerLang === 'javascript' || lowerLang === 'js' || lowerLang === 'extendscript') {
            if (lowerCode.includes('app.project') || 
                lowerCode.includes('compitem') ||
                lowerCode.includes('layer') ||
                lowerCode.includes('property') ||
                lowerCode.includes('effect') ||
                lowerCode.includes('footage')) {
                return { type: 'extendscript', display: 'After Effects Script', canApply: true };
            }
        }

        // Default cases
        const displayMap = {
            'javascript': 'JavaScript',
            'js': 'JavaScript', 
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'xml': 'XML',
            'python': 'Python',
            'jsx': 'JSX'
        };

        return { 
            type: lowerLang || 'text', 
            display: displayMap[lowerLang] || (language || 'Code').toUpperCase(), 
            canApply: false 
        };
    }

    // DUPLICATE METHOD REMOVED - Using escapeHtml method from line 558
}

// Global code block functions for CEP environment
window.copyCodeBlock = function(blockId) {
    this.logger.debug('📋 copyCodeBlock called for:', blockId);
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) {
        this.logger.error('❌ Code block not found:', blockId);
        return;
    }
    
    const codeContent = codeBlock.querySelector('.code-content');
    const code = codeContent.getAttribute('data-code') || codeContent.textContent.trim();
    
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                this.logger.debug('✅ Code copied via clipboard API');
                showCodeFeedback(blockId, '📋 Copied!', 'success');
            }).catch(err => {
                this.logger.warn('⚠️ Clipboard API failed, using fallback');
                fallbackCopy(code, blockId);
            });
        } else {
            fallbackCopy(code, blockId);
        }
    } catch (error) {
        this.logger.error('❌ Copy failed:', error);
        fallbackCopy(code, blockId);
    }
};

window.applyCodeBlock = function(blockId) {
    this.logger.debug('✨ applyCodeBlock called for:', blockId);
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) {
        this.logger.error('❌ Code block not found:', blockId);
        return;
    }
    
    const codeContent = codeBlock.querySelector('.code-content');
    const code = codeContent.getAttribute('data-code') || codeContent.textContent.trim();
    const codeType = codeContent.getAttribute('data-type') || 'expression';
    
    try {
        if (window.__adobe_cep__) {
            // CEP environment - apply to After Effects with robust script
            const cleanCode = code.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
            const script = `
                try {
                    // Check if we have an active composition
                    if (!app.project.activeItem) {
                        alert("❌ No active composition. Please open a composition first.");
                    } else if (app.project.activeItem.typeName !== "Composition") {
                        alert("❌ Active item is not a composition. Please select a composition.");
                    } else {
                        var comp = app.project.activeItem;
                        
                        // Check if we have selected layers
                        if (comp.selectedLayers.length === 0) {
                            alert("⚠️ No layers selected. Please select a layer first.");
                        } else {
                            var layer = comp.selectedLayers[0];
                            
                            // Try to apply to Position property first
                            try {
                                var positionProp = layer.property("Transform").property("Position");
                                if (positionProp && positionProp.canSetExpression) {
                                    positionProp.expression = "${cleanCode}";
                                    alert("✅ Expression applied to Position property of layer: " + layer.name);
                                } else {
                                    alert("❌ Cannot set expression on Position property. Layer may be locked or not animatable.");
                                }
                            } catch (propError) {
                                // If Position fails, try other common properties
                                try {
                                    var rotationProp = layer.property("Transform").property("Rotation");
                                    if (rotationProp && rotationProp.canSetExpression) {
                                        rotationProp.expression = "${cleanCode}";
                                        alert("✅ Expression applied to Rotation property of layer: " + layer.name);
                                    } else {
                                        var opacityProp = layer.property("Transform").property("Opacity");
                                        if (opacityProp && opacityProp.canSetExpression) {
                                            opacityProp.expression = "${cleanCode}";
                                            alert("✅ Expression applied to Opacity property of layer: " + layer.name);
                                        } else {
                                            alert("❌ Cannot apply expression to any transform property on this layer type.");
                                        }
                                    }
                                } catch (fallbackError) {
                                    alert("❌ Error applying expression: " + fallbackError.toString());
                                }
                            }
                        }
                    }
                } catch (mainError) {
                    alert("❌ Script error: " + mainError.toString());
                }
            `;
            
            this.logger.debug('🔧 Sending script to After Effects:', script);
            window.__adobe_cep__.evalScript(script, function(result) {
                this.logger.debug('📝 After Effects script result:', result);
                if (result && result.indexOf('✅') !== -1) {
                    showCodeFeedback(blockId, '✨ Applied!', 'success');
                } else {
                    showCodeFeedback(blockId, '⚠️ Check AE alert', 'warning');
                }
            });
            
        } else {
            // Browser environment - copy to script editor if available
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) {
                scriptEditor.value = code;
                showCodeFeedback(blockId, '✨ Added to Script Editor!', 'success');
            } else {
                // Fallback to copy
                window.copyCodeBlock(blockId);
                showCodeFeedback(blockId, '📋 Copied (Apply not available)', 'warning');
            }
        }
    } catch (error) {
        this.logger.error('❌ Apply failed:', error);
        showCodeFeedback(blockId, '❌ Apply failed', 'error');
    }
};

window.viewCodeBlock = function(blockId) {
    this.logger.debug('👁️ viewCodeBlock called for:', blockId);
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) {
        this.logger.error('❌ Code block not found:', blockId);
        return;
    }
    
    const codeContent = codeBlock.querySelector('.code-content');
    const code = codeContent.getAttribute('data-code') || codeContent.textContent.trim();
    const codeType = codeContent.getAttribute('data-type') || 'code';
    
    // Create a modal to show the full code
    const modal = document.createElement('div');
    modal.className = 'code-modal-overlay';
    modal.innerHTML = `
        <div class="code-modal">
            <div class="code-modal-header">
                <h3>View Code - ${codeType.toUpperCase()}</h3>
                <button class="code-modal-close" onclick="this.closest('.code-modal-overlay').remove()">×</button>
            </div>
            <div class="code-modal-body">
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
            <div class="code-modal-footer">
                <button onclick="window.copyCodeBlock('${blockId}')">📋 Copy</button>
                <button onclick="window.applyCodeBlock('${blockId}')">✨ Apply</button>
                <button onclick="this.closest('.code-modal-overlay').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    showCodeFeedback(blockId, '👁️ Opened!', 'info');
};

// Helper functions
function fallbackCopy(text, blockId) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.logger.debug('✅ Code copied via fallback method');
        showCodeFeedback(blockId, '📋 Copied!', 'success');
    } catch (error) {
        this.logger.error('❌ Fallback copy failed:', error);
        showCodeFeedback(blockId, '❌ Copy failed', 'error');
    }
}

function showCodeFeedback(blockId, message, type = 'info') {
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) return;
    
    // Remove existing feedback
    const existing = codeBlock.querySelector('.code-feedback');
    if (existing) existing.remove();
    
    // Add new feedback
    const feedback = document.createElement('div');
    feedback.className = `code-feedback ${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: absolute;
        top: -30px;
        right: 10px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    codeBlock.style.position = 'relative';
    codeBlock.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
}

// DUPLICATE FUNCTION REMOVED - Using class method escapeHtml instead
// function escapeHtml(text) {
//     const div = document.createElement('div');
//     div.textContent = text;
//     return div.innerHTML;
// }

// Export for global use
window.AIModule = AIModule;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIModule;
}
// HONEST AI Module - NO FAKE RESPONSES
// This module ONLY makes real API calls or clearly fails

class AIModule {
    constructor() {
        if (window.AIProviders) {
            this.apiProviders = new window.AIProviders();
            console.log('🤖 AI Module initialized with real providers');
        } else {
            this.apiProviders = null;
            console.error('❌ AIProviders not available - NO FAKE RESPONSES WILL BE GIVEN');
        }
        
        // Initialize rate limiting and queue system
        this.rateLimiter = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    async sendMessage(message) {
        console.log('📤 AI Module: Received message:', message);
        
        throw new Error('sendMessage is deprecated. Use generateResponse instead.');
    }

    async handleYouTubeLinks(message) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
        const videoFileRegex = /\.(?:mp4|mov|avi|mkv|webm|m4v)$/i;
        
        // Check for YouTube URLs
        const youtubeMatches = message.match(youtubeRegex);
        if (youtubeMatches) {
            try {
                if (window.realisticYouTubeHelper) {
                    return await window.realisticYouTubeHelper.processYouTubeUrl(youtubeMatches[0], message);
                } else if (window.youtubeHelper) {
                    return await window.youtubeHelper.processYouTubeUrl(youtubeMatches[0], message);
                }
            } catch (error) {
                console.warn('YouTube processing failed:', error);
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
        const { apiKey, provider, fileData, model, temperature, maxTokens } = options;
        let imageBase64 = null;

        if (fileData && fileData.type.startsWith('image/')) {
            imageBase64 = fileData.base64;
        }
        // Normalize image base64 if raw
        if (imageBase64 && !imageBase64.startsWith('data:')) {
            imageBase64 = `data:image/png;base64,${imageBase64}`;
        }
        
        if (!apiKey || !provider) {
            return 'API key or provider not set. Please check your settings.';
        }
        if (!this.apiProviders) {
            return 'AI providers not initialized.';
        }
        if (typeof fetch === 'undefined') {
            return 'Network layer unavailable (fetch not defined in this host).';
        }
        try {
            const contextualPrompt = this.buildContextualPrompt(message, null, null, imageBase64);
            
            const response = await this.apiProviders.sendRequest(
                provider,
                contextualPrompt,
                apiKey,
                {
                    model: model,
                    temperature: typeof temperature === 'number' ? temperature : 0.7,
                    maxTokens: typeof maxTokens === 'number' ? maxTokens : 2048
                },
                imageBase64
            );
            
            return response;
        } catch (error) {
            console.error(`Error generating response from ${provider}:`, error);
            return `Sorry, I encountered an error with the ${provider} API: ${error.message}`;
        }
    }

    buildContextualPrompt(userMessage, projectContext, analysisResult = null, imageBase64 = null) {
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
            let prompt = `You are an After Effects ExtendScript expert. Provide working ExtendScript (.jsx) code for UI creation and automation.

EXTENDSCRIPT CAPABILITIES:
- Create ScriptUI panels with buildUI() function
- Use app.project.activeItem for active composition
- Use layer.addNull() to create null objects  
- Use layer.parent to set parenting relationships
- Handle selected layers with comp.selectedLayers array
- Create buttons with panel.add("button")

RESPONSE FORMAT FOR UI REQUESTS:
\`\`\`javascript
// ExtendScript UI Panel: [description]
(function() {
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("dialog", "Null Creator");
        
        // Add your UI elements here
        var createBtn = panel.add("button", undefined, "Create Null Parent");
        createBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (comp && comp.selectedLayers.length > 0) {
                app.beginUndoGroup("Create Null Parent");
                var nullLayer = comp.layers.addNull();
                nullLayer.name = "Parent Null";
                
                for (var i = 0; i < comp.selectedLayers.length; i++) {
                    comp.selectedLayers[i].parent = nullLayer;
                }
                app.endUndoGroup();
            } else {
                alert("Please select a layer first.");
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
        let prompt = `You are a friendly After Effects assistant. ${imageBase64 ? 'You can see and analyze images to help with creative projects.' : 'You love helping with expressions, animations, and creative problem-solving.'}

BE NATURAL AND CONVERSATIONAL:
- Talk like you're helping a friend with their project
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
Instead of: "Apply this expression to the position property"
Say: "Here's a nice wiggle expression that'll give your layer some organic movement - just paste this on the position property:"
COMMON REQUESTS MAPPING:
- "wiggle" → wiggle(2, 50) position expression + explanation
- "animate text" → typewriter expression + explanation  
- "rotation" → time * 45 rotation expression + explanation
- "scale" → scale animation expression + explanation
- "random" → random() or wiggle() based on context
- "position" → position-related expressions
- "create ui" or "script" → ExtendScript code
- "null" or "parent" → layer creation/parenting scripts

EXPRESSION FORMAT:
\`\`\`
wiggle(2, 50)  
\`\`\`

EXAMPLES:
User: "wiggle" → "Here's a wiggle expression: \`\`\`wiggle(2, 50)\`\`\` This adds random movement to position. Change 2 for speed, 50 for distance."

User: "animate text" → "Here's a typewriter effect: \`\`\`text.sourceText.value.substr(0, Math.floor(time * 10))\`\`\` This reveals text over time. Change 10 to adjust speed."

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
        console.log(`✅ AI response received from ${provider}`);
        
        return processedResponse;
    }

    /**
     * Format response with interactive code blocks
     */
    formatResponseForChat(response) {
        // Check if response contains code blocks first
        const codeBlockRegex = /```[\s\S]*?```/g;
        const codeBlocks = response.match(codeBlockRegex);
        
        if (codeBlocks) {
            // Replace code blocks with interactive ones
            let formattedResponse = response;
            
            codeBlocks.forEach((block, index) => {
                const code = block.replace(/```\w*\n?/, '').replace(/```$/, '').trim();
                const blockId = `code-block-${Date.now()}-${index}`;
                
                const interactiveBlock = this.createInteractiveCodeBlock(code, blockId);
                formattedResponse = formattedResponse.replace(block, interactiveBlock);
            });
            
            // Clean up excessive whitespace around code blocks
            formattedResponse = formattedResponse
                .replace(/\n\s*\n\s*\n+/g, '\n') // Reduce multiple line breaks to single
                .replace(/\s*(<div[^>]*compact-code-block[^>]*>)/g, '\n$1') // Single line before code block
                .replace(/(<\/div>)\s*\n+/g, '$1\n') // Single line after code block
                .replace(/^\s+|\s+$/gm, '') // Remove leading/trailing spaces from each line
                .trim();
            
            return formattedResponse;
        }
        
        // Fallback: detect common expressions without code blocks
        const expressionPatterns = [
            /\bwiggle\s*\([^)]+\)/g,
            /\btime\s*\*\s*[\d.]+/g,
            /\blinear\s*\([^)]+\)/g,
            /\bease\s*\([^)]+\)/g,
            /\bvalue\s*\[[^\]]+\]/g,
            /\bindex\s*[*+\-\/]\s*[\d.]+/g,
            /\btransform\.\w+/g,
            /\bloop[a-zA-Z]*\s*\([^)]+\)/g
        ];
        
        let hasExpressions = false;
        let formattedResponse = response;
        
        expressionPatterns.forEach((pattern, index) => {
            const matches = response.match(pattern);
            if (matches) {
                hasExpressions = true;
                matches.forEach(match => {
                    const blockId = `code-block-fallback-${Date.now()}-${index}`;
                    const interactiveBlock = this.createInteractiveCodeBlock(match, blockId);
                    
                    // Replace the match with interactive block
                    formattedResponse = formattedResponse.replace(match, interactiveBlock);
                });
            }
        });
        
        if (hasExpressions) {
            // Clean up spacing for fallback blocks too
            formattedResponse = formattedResponse
                .replace(/\n\s*\n\s*\n+/g, '\n') // Reduce multiple line breaks to single
                .replace(/\s*(<div[^>]*compact-code-block[^>]*>)/g, '\n$1') // Single line before code block
                .replace(/(<\/div>)\s*\n+/g, '$1\n') // Single line after code block
                .replace(/^\s+|\s+$/gm, '') // Remove leading/trailing spaces from each line
                .trim();
        }
        
        return formattedResponse;
    }

    /**
     * Create compact interactive code block HTML (matches reference design)
     */
    createInteractiveCodeBlock(code, blockId) {
        return `<div class="compact-code-block" id="${blockId}">
            <div class="code-content">
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
            <div class="code-actions">
                <button class="compact-btn copy-btn" onclick="copyCode('${blockId}')" title="Copy">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                    </svg>
                </button>
                <button class="compact-btn apply-btn" onclick="applyCode('${blockId}')" title="Apply">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                    </svg>
                </button>
                <button class="compact-btn save-btn" onclick="saveCode('${blockId}')" title="Save">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                    </svg>
                </button>
            </div>
        </div>`;
    }

    /**
     * Detect the type of code for better labeling
     */
    detectCodeType(code) {
        const codeLines = code.toLowerCase().trim();
        
        if (codeLines.includes('wiggle') || codeLines.includes('time') || codeLines.includes('value')) {
            return 'Expression';
        } else if (codeLines.includes('app.') || codeLines.includes('comp') || codeLines.includes('layer')) {
            return 'ExtendScript';
        } else if (codeLines.includes('function') || codeLines.includes('var ') || codeLines.includes('let ')) {
            return 'JavaScript';
        } else if (codeLines.includes('transform.') || codeLines.includes('index')) {
            return 'Expression';
        } else {
            return 'Code';
        }
    }

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

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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
        
        console.error(`[AI Module] ${message}:`, errorInfo);
        
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

    // Detect tutorial commands from user message
    detectTutorialCommand(message) {
        const lowerMessage = message.toLowerCase().trim();
        const commands = ['next', 'repeat', 'skip', 'help', 'restart'];
        
        for (const command of commands) {
            if (lowerMessage.includes(command)) {
                return command;
            }
        }
        
        return null;
    }

    // Extract YouTube URL from message
    extractYouTubeUrl(message) {
        const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
        const match = message.match(urlPattern);
        return match ? match[0] : null;
    }

    // Format step-by-step tutorial responses
    formatStepByStepResponse(stepResponse) {
        if (!stepResponse) return null;

        let response = {
            text: stepResponse.response,
            hasExecuteButtons: false,
            executeButtons: [],
            tutorialData: stepResponse
        };

        // Add execute buttons based on response type
        switch (stepResponse.type) {
            case 'guided_tutorial':
                response.hasExecuteButtons = true;
                response.executeButtons = [
                    {
                        label: 'Start Step 1',
                        action: 'start_guided_tutorial',
                        data: stepResponse.tutorialData
                    },
                    {
                        label: 'Show All Steps', 
                        action: 'show_tutorial_steps',
                        data: stepResponse.tutorialData
                    }
                ];
                break;

            case 'tutorial_step':
                response.hasExecuteButtons = true;
                response.executeButtons = [
                    {
                        label: 'Execute Step Automation',
                        action: 'execute_tutorial_step',
                        data: stepResponse.stepData
                    }
                ];
                
                if (stepResponse.currentStep < stepResponse.totalSteps) {
                    response.executeButtons.push({
                        label: 'Next Step',
                        action: 'tutorial_next',
                        data: { command: 'next' }
                    });
                }
                break;

            case 'tutorial_complete':
                response.hasExecuteButtons = true;
                response.executeButtons = [
                    {
                        label: 'Restart Tutorial',
                        action: 'tutorial_command',
                        data: { command: 'restart' }
                    }
                ];
                break;
        }

        return response;
    }

    // Utility method to validate API keys
    validateApiKey(provider, apiKey) {
        if (!apiKey && provider !== 'local' && provider !== 'ollama') {
            return false;
        }
        
        // Basic validation patterns
        const patterns = {
            google: /^AIza[0-9A-Za-z-_]{35}$/,
            openai: /^sk-[a-zA-Z0-9]{48}$/,
            groq: /^gsk_[a-zA-Z0-9]{52}$/,
            claude: /^sk-ant-[a-zA-Z0-9-_]{48,}$/
        };
        
        if (patterns[provider]) {
            return patterns[provider].test(apiKey);
        }
        
        return true; // For providers without specific patterns
    }

    // Add missing methods that were referenced
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

    // Get random After Effects fact for welcome screen
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
}

// Export for global use
window.AIModule = AIModule;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIModule;
}
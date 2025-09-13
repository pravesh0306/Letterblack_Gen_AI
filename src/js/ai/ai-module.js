// HONEST AI Module - NO FAKE RESPONSES
// This module ONLY makes real API calls or clearly fails

class AIModule {
    constructor() {
        if (window.AIProviders) {
            this.apiProviders = new window.AIProviders();
            logger.log('🤖 AI Module initialized with real providers');
        } else {
            this.apiProviders = null;
            console.error('❌ AIProviders not available - NO FAKE RESPONSES WILL BE GIVEN');
        }
        
        // Initialize rate limiting and queue system
        this.rateLimiter = new Map();
        this.requestQueue = [];
        this.isProcessing = false;
        
        // Initialize effects module (will be set when chat memory is available)
        this.effectsModule = null;
        
        // Initialize utility modules
        this.youtubeTutorialHelper = null;
        this.browserVideoTranscriber = null;
        this.enhancedChatMemory = null;
        this.performanceCache = null;
        this.loggerSystem = null;
        
        // Initialize logger system
        if (window.LoggerSystem) {
            this.loggerSystem = new window.LoggerSystem('AIModule');
            this.loggerSystem.info('AI Module constructor initialized');
        }
        
        // Initialize performance cache
        if (window.PerformanceCache) {
            this.performanceCache = new window.PerformanceCache();
            logger.log('🚀 Performance cache initialized');
        }
        
        // Initialize enhanced chat memory
        if (window.EnhancedChatMemory) {
            this.enhancedChatMemory = new window.EnhancedChatMemory();
            logger.log('🧠 Enhanced chat memory initialized');
        }
        
        // Initialize utility modules
        if (window.YouTubeTutorialHelper) {
            this.youtubeTutorialHelper = new window.YouTubeTutorialHelper();
            logger.log('🎬 YouTube Tutorial Helper initialized');
        }
        
        if (window.BrowserVideoTranscriber) {
            this.browserVideoTranscriber = new window.BrowserVideoTranscriber();
            logger.log('📹 Browser Video Transcriber initialized');
        }
    }

    /**
     * Initialize the AI module
     * Sets up dependencies and prepares for operation
     */
    async init(container) {
    logger.log('🤖 Initializing AI Module...');
        if (container) {
            container.innerHTML = '<div class="module-status">AI Module Loaded.<br>Ready to generate scripts and analyze context.</div>';
        }
        // ...existing initialization logic...
        try {
            if (!this.apiProviders) {
                logger.warn('⚠️ AI Providers not available - module will have limited functionality');
                return false;
            }
            if (window.ChatMemory) {
                this.setChatMemory(new window.ChatMemory());
                logger.log('💭 Chat memory initialized');
            }
            if (window.SettingsManager) {
                this.settingsManager = window.SettingsManager;
                logger.log('⚙️ Settings manager connected');
            }
            if (typeof CSInterface !== 'undefined') {
                try {
                    const projectContext = await this.getProjectContext();
                    logger.log('📁 Project context loaded:', projectContext ? 'Available' : 'None');
                } catch (error) {
                    logger.warn('⚠️ Could not load project context:', error.message);
                }
            }
            logger.log('✅ AI Module initialization complete');
            return true;
            
        } catch (error) {
            console.error('❌ AI Module initialization failed:', error);
            return false;
        }
    }

    // Set chat memory and initialize effects module
    setChatMemory(chatMemory) {
        this.chatMemory = chatMemory;
        if (window.EffectsPresetsModule) {
            this.effectsModule = new window.EffectsPresetsModule(chatMemory);
            logger.log('🎨 Effects & Presets module initialized with chat memory');
        }
        
        // Initialize layer analysis module
        if (window.LayerAnalysisModule) {
            this.layerAnalysis = new window.LayerAnalysisModule();
            logger.log('🔍 Layer Analysis module initialized');
        }

        // Initialize Advanced SDK Integration
        if (window.AdvancedSDKIntegration) {
            this.advancedSDK = new window.AdvancedSDKIntegration();
            logger.log('🚀 Advanced SDK Integration initialized');
            
            // Listen for project changes to trigger AI context updates
            window.addEventListener('aeProjectChange', (event) => {
                this.handleProjectChange(event.detail);
            });
        }
    }

    async sendMessage(message) {
    logger.log('📤 AI Module: Received message:', message);
        
        throw new Error('sendMessage is deprecated. Use generateResponse instead.');
    }

    async handleYouTubeLinks(message) {
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/g;
        const videoFileRegex = /\.(?:mp4|mov|avi|mkv|m4v)$/i;
        
        // Check for YouTube URLs
        const youtubeMatches = message.match(youtubeRegex);
        
        if (youtubeMatches) {
            if (this.loggerSystem) {
                this.loggerSystem.info('YouTube link detected, processing with enhanced modules');
            } else {
                logger.log('🎬 YouTube link detected, processing with enhanced modules...');
            }

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
                    logger.warn('YouTube Tutorial Helper error:', error);
                    if (this.loggerSystem) {
                        this.loggerSystem.warn('YouTube Tutorial Helper error', error);
                    }
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
                            transcription
                        };

                        // Cache the response
                        if (this.performanceCache) {
                            this.performanceCache.set(`video_${videoUrl}`, response, 3600000); // 1 hour cache
                        }

                        // Add to enhanced chat memory
                        if (this.enhancedChatMemory) {
                            this.enhancedChatMemory.addMessage(message, 'user', { type: 'video_url' });
                            this.enhancedChatMemory.addMessage(response.content, 'assistant', { type: 'video_analysis' });
                        }

                        return response;
                    }
                } catch (error) {
                    logger.warn('Browser Video Transcriber error:', error);
                    if (this.loggerSystem) {
                        this.loggerSystem.warn('Browser Video Transcriber error', error);
                    }
                }
            }
        }
        
        return null; // No YouTube processing needed
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
            console.log('🤖 AI generateResponse called with:', { provider, hasKey: !!apiKey, hasModel: !!model });
            
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
                console.log('🎬 YouTube URL detected, returning specialized response');
                return youtubeResponse.response;
            }

            // Get current layer analysis for context
            let layerAnalysis = null;
            if (this.layerAnalysis && this.shouldAnalyzeLayer(message)) {
                try {
                    layerAnalysis = await this.layerAnalysis.analyzeSelectedLayers();
                    console.log('🔍 Layer analysis completed for AI context');
                } catch (error) {
                    console.warn('⚠️ Layer analysis failed:', error.message);
                }
            }

            // Enhanced intent classification from 01_Codeblock
            const intent = this.classifyIntent(message);
            console.log('🧠 Intent Analysis:', intent);
            if (this.loggerSystem) {
                this.loggerSystem.info('Intent classified', intent);
            }

            // Build context-aware prompt
            const contextualPrompt = this.buildContextualPrompt(message, null, null, imageBase64, chatHistory, layerAnalysis);
            console.log('📝 Built contextual prompt, length:', contextualPrompt.length);
            
            // Make REAL API request
            console.log(`🌐 Making API request to ${provider}...`);
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
            console.log('✅ API response received successfully');
            
            return this.processAIResponse(response, provider);
            
        } catch (error) {
            console.error('❌ AI generateResponse error:', error);
            
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
        
        return cleanResponse;
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
     * Create enhanced interactive code block HTML with improved detection
     */
    createInteractiveCodeBlock(code, blockId) {
        // Use enhanced detection methods from 01_Codeblock
        const isExpression = this.looksLikeExpression(code);
        const isScript = this.looksLikeScript(code);
        const isPanelCode = this.looksLikePanelCode(code);
        
        // Determine code type with enhanced logic
        let codeType, typeIcon;
        if (isExpression) {
            codeType = 'Expression';
            typeIcon = '📊';
        } else if (isScript) {
            codeType = 'ExtendScript';
            typeIcon = '🔧';
        } else if (isPanelCode) {
            codeType = 'CEP Panel';
            typeIcon = '📦';
        } else {
            codeType = 'JavaScript';
            typeIcon = '💻';
        }
        
        // Enhanced code block with type-specific actions from 01_Codeblock
        return `<div class="enhanced-code-block ${codeType.toLowerCase().replace(' ', '-')}-block" id="${blockId}" data-code-type="${codeType}">
            <div class="code-header">
                <span class="code-type-badge">
                    ${typeIcon} ${codeType}
                </span>
                <span class="code-meta">
                    ${isExpression ? '📊 After Effects Expression' : 
                      isScript ? '🔧 ExtendScript' : 
                      isPanelCode ? '📦 CEP Panel Code' : '💻 JavaScript'}
                </span>
            </div>
            <div class="code-content">
                <pre><code class="language-${isExpression ? 'javascript' : codeType.toLowerCase()}">${this.escapeHtml(code)}</code></pre>
            </div>
            <div class="code-actions">
                <button class="action-btn copy-btn" data-block-id="${blockId}" data-action="copy" title="Copy to Clipboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                    </svg>
                    Copy
                </button>
                ${isExpression ? `
                <button class="action-btn apply-expression-btn" data-block-id="${blockId}" data-action="apply" title="Apply to Selected Layer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,14L6,9L7.41,7.59L11,11.17L16.59,5.58L18,7L11,14Z"/>
                    </svg>
                    Apply Expression
                </button>
                <button class="action-btn test-expression-btn" data-block-id="${blockId}" data-action="test" title="Test Expression">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                    </svg>
                    Test
                </button>
                ` : isScript ? `
                <button class="action-btn run-script-btn" data-block-id="${blockId}" data-action="run" title="Run Script in After Effects">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                    </svg>
                    Run Script
                </button>
                <button class="action-btn validate-script-btn" data-block-id="${blockId}" data-action="validate" title="Validate Script">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,14L6,9L7.41,7.59L11,11.17L16.59,5.58L18,7L11,14Z"/>
                    </svg>
                    Validate
                </button>
                ` : isPanelCode ? `
                <button class="action-btn package-btn" data-block-id="${blockId}" data-action="package" title="Package as CEP Panel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z"/>
                    </svg>
                    Package Panel
                </button>
                <button class="action-btn install-btn" data-block-id="${blockId}" data-action="install" title="Install Panel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    Install
                </button>
                ` : `
                <button class="action-btn run-code-btn" data-block-id="${blockId}" data-action="run" title="Execute Code">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                    </svg>
                    Run
                </button>
                `}
                <button class="action-btn save-btn" data-block-id="${blockId}" data-action="save" title="Save to Library">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                    </svg>
                    Save
                </button>
                <button class="action-btn explain-btn" data-block-id="${blockId}" data-action="explain" title="Get AI Explanation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z"/>
                    </svg>
                    Explain
                </button>
            </div>
            ${isExpression ? this.getExpressionMetadata(code) : ''}
        </div>`;
    }

    /**
     * Enhanced code type detection with more patterns
     */
    detectCodeType(code) {
        const codeLines = code.toLowerCase().trim();
        
        // Expression patterns (After Effects)
        const expressionPatterns = [
            /\bwiggle\s*\(/,
            /\btime\b/,
            /\bvalue\b/,
            /\bindex\b/,
            /\btransform\./,
            /\blinear\s*\(/,
            /\bease\s*\(/,
            /\bloopout\s*\(/,
            /\bloopin\s*\(/,
            /\bposterizeTime\s*\(/,
            /\brandom\s*\(/,
            /\bnoise\s*\(/,
            /\bvelocity\b/,
            /\bamplitude\b/,
            /\bfrequency\b/,
            /\bmylayer\./,
            /\bcomp\(/,
            /\bthiscomp\./,
            /\bthislayer\./,
            /\btargetlayer\./
        ];
        
        // ExtendScript patterns
        const scriptPatterns = [
            /\bapp\./,
            /\bproject\./,
            /\bactiveitem\./,
            /\blayers\./,
            /\baddsolid\s*\(/,
            /\baddtext\s*\(/,
            /\bduplicatelayer\s*\(/,
            /\bcompitem\b/,
            /\bavlayer\b/,
            /\bshapelayer\b/,
            /\btextlayer\b/,
            /\bcameralayer\b/,
            /\blightlayer\b/
        ];
        
        // Check for expressions first (more specific)
        if (expressionPatterns.some(pattern => pattern.test(codeLines))) {
            return 'Expression';
        }
        
        // Check for ExtendScript
        if (scriptPatterns.some(pattern => pattern.test(codeLines))) {
            return 'ExtendScript';
        }
        
        // Check for JavaScript
        if (codeLines.includes('function') || codeLines.includes('var ') || 
            codeLines.includes('let ') || codeLines.includes('const ') ||
            codeLines.includes('console.log') || codeLines.includes('document.')) {
            return 'JavaScript';
        }
        
        // Default fallback
        return 'Code';
    }

    /**
     * Get appropriate icon for code type
     */
    getTypeIcon(codeType) {
        const icons = {
            'Expression': '📊',
            'ExtendScript': '🔧',
            'JavaScript': '💻',
            'Code': '📝'
        };
        return icons[codeType] || '📝';
    }

    /**
     * Generate expression metadata and tips
     */
    getExpressionMetadata(code) {
        const metadata = [];
        const codeLines = code.toLowerCase();
        
        // Detect expression features and provide tips
        if (codeLines.includes('wiggle')) {
            metadata.push('🎯 <strong>Wiggle Expression</strong> - Adds random movement to properties');
        }
        if (codeLines.includes('time')) {
            metadata.push('⏰ <strong>Time-based</strong> - Animation changes over time');
        }
        if (codeLines.includes('index')) {
            metadata.push('🔢 <strong>Index-based</strong> - Different behavior per layer');
        }
        if (codeLines.includes('linear') || codeLines.includes('ease')) {
            metadata.push('📈 <strong>Interpolation</strong> - Controls animation timing');
        }
        if (codeLines.includes('transform.')) {
            metadata.push('🔄 <strong>Transform Property</strong> - Affects position, rotation, or scale');
        }
        
        if (metadata.length > 0) {
            return `<div class="expression-metadata">
                <div class="metadata-header">💡 Expression Info:</div>
                <ul class="metadata-list">
                    ${metadata.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        return '';
    }

    /**
     * Enhanced intent classification system from 01_Codeblock
     */
    classifyIntent(userMessage) {
        const msg = userMessage.toLowerCase();
        
        // Detect specific effects/presets mentioned
        const effectMatch = msg.match(/effect[:\s]*([a-z\s]+)/i);
        const presetMatch = msg.match(/preset[:\s]*([^\s,\.]+\.ffx)/i);
        
        const intents = {
            EXPRESSION: {
                keywords: ['expression', 'wiggle', 'time', 'value', 'linear', 'ease', 'loop', 'random', 'noise'],
                patterns: [/write.*expression/i, /create.*expression/i, /expression.*for/i, /add.*wiggle/i, /animate.*with/i],
                confidence: 0
            },
            SCRIPT: {
                keywords: ['script', 'function', 'automate', 'batch', 'jsx', 'extendscript'],
                patterns: [/write.*script/i, /create.*script/i, /automate.*this/i, /batch.*process/i, /function.*that/i],
                confidence: 0
            },
            LAYER: {
                keywords: ['layer', 'add layer', 'create layer', 'duplicate', 'solid', 'text', 'shape'],
                patterns: [/add.*layer/i, /create.*layer/i, /duplicate.*layer/i, /new.*layer/i],
                confidence: 0
            },
            ANIMATION: {
                keywords: ['animate', 'keyframe', 'motion', 'movement', 'transition', 'tween'],
                patterns: [/animate.*this/i, /add.*keyframes/i, /motion.*for/i, /transition.*between/i],
                confidence: 0
            },
            PANEL: {
                keywords: ['panel', 'ui', 'interface', 'button', 'window', 'dialog', 'cep', 'extension', 'create panel', 'build panel', 'generate panel'],
                patterns: [/create.*panel/i, /build.*panel/i, /generate.*panel/i, /panel.*for/i, /make.*ui/i, /\b(cep|uxp)\b.*\b(panel|dockable|extension)\b/i],
                confidence: 0
            },
            EFFECT: {
                keywords: ['effect', 'apply effect', 'add effect'],
                patterns: [/apply.*effect/i, /add.*effect/i],
                confidence: effectMatch ? 10 : 0
            },
            PRESET: {
                keywords: ['preset', 'apply preset', 'ffx'],
                patterns: [/apply.*preset/i, /\.ffx/i],
                confidence: presetMatch ? 10 : 0
            },
            CONTEXT: {
                keywords: ['what', 'current', 'selected', 'active', 'composition', 'layer', 'property', 'tell me about', 'show me', 'analyze'],
                patterns: [/what.*selected/i, /current.*comp/i, /active.*layer/i, /tell.*about/i, /show.*me/i],
                confidence: 0
            },
            HELP: {
                keywords: ['help', 'how', 'tutorial', 'learn', 'explain', 'guide', 'documentation', 'example'],
                patterns: [/how.*to/i, /how.*do/i, /explain.*how/i, /tutorial.*on/i, /guide.*for/i],
                confidence: 0
            },
            TROUBLESHOOT: {
                keywords: ['error', 'problem', 'issue', 'not working', 'broken', 'fix', 'debug', 'trouble'],
                patterns: [/not.*work/i, /error.*in/i, /problem.*with/i, /fix.*this/i, /debug.*my/i],
                confidence: 0
            },
            GENERAL: {
                keywords: ['hello', 'hi', 'thanks', 'good', 'awesome', 'cool'],
                patterns: [],
                confidence: 0
            }
        };
        
        // Calculate confidence scores
        for (const [intentName, intent] of Object.entries(intents)) {
            if (intentName === 'EFFECT' || intentName === 'PRESET') continue; // Already calculated above
            
            // Keyword matching
            const keywordMatches = intent.keywords.filter(keyword => msg.includes(keyword)).length;
            intent.confidence += keywordMatches * 2;
            
            // Pattern matching  
            const patternMatches = intent.patterns.filter(pattern => pattern.test(userMessage)).length;
            intent.confidence += patternMatches * 3;
        }
        
        // Find primary intent
        const primary = Object.entries(intents).reduce((max, [name, intent]) => 
            intent.confidence > max.confidence ? {name, confidence: intent.confidence} : max
        , {name: 'GENERAL', confidence: 0});
        
        return {
            primary: primary.name,
            confidence: primary.confidence,
            scores: Object.fromEntries(Object.entries(intents).map(([name, intent]) => [name, intent.confidence])),
            effectName: effectMatch ? effectMatch[1] : null,
            presetPath: presetMatch ? presetMatch[1] : null
        };
    }

    /**
     * Enhanced code type detection from 01_Codeblock
     */
    looksLikeExpression(code) {
        const expressionIndicators = [
            /value(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /wiggle\s*\(/i,
            /ease\s*\(/i,
            /linear\s*\(/i,
            /sine\s*\(/i,
            /time(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /index(\s*[\+\-\*\/]|\s*\.\w+)/i,
            /transform\./i,
            /thisComp\./i,
            /thisLayer\./i
        ];
        
        return expressionIndicators.some(pattern => pattern.test(code)) && 
               !code.includes('app.') && 
               !code.includes('var ') && 
               !code.includes('function ') &&
               code.split('\n').length < 20; // Expressions typically shorter
    }

    /**
     * Enhanced script detection from 01_Codeblock
     */
    looksLikeScript(code) {
        const scriptIndicators = [
            /app\./i,
            /project\./i,
            /function\s+\w+\s*\(/i,
            /var\s+\w+/i,
            /for\s*\(/i,
            /beginUndoGroup/i,
            /endUndoGroup/i
        ];
        
        return scriptIndicators.some(pattern => pattern.test(code));
    }

    /**
     * Enhanced CEP panel code detection from 01_Codeblock
     */
    looksLikePanelCode(code) {
        const panelIndicators = [
            /manifest\.xml/i,
            /ExtensionManifest/i,
            /CEFCommandLine/i,
            /DispatchInfo/i,
            /window\.__adobe_cep__/i,
            /CSInterface/i,
            /evalScript/i
        ];
        
        return panelIndicators.some(pattern => pattern.test(code));
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
                <path d="M3,3H21V21H3V3M7.73,18.04C8.13,18.89 8.92,19.59 10.27,19.59C11.77,19.59 12.8,18.79 12.8,17.04V11.26H11.1V17C11.1,17.86 10.75,18.08 10.2,18.08C9.62,18.08 9.38,17.68 9.11,17.21L7.73,18.04M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.42C15.89,13.07 16.2,12.78 16.7,12.78C17.18,12.78 17.52,13.07 17.81,13.42L18.72,12.63C18.11,11.73 17.28,11.33 16.7,11.33C15.28,11.33 14.59,12.29 14.59,13.42C14.59,14.76 15.4,15.43 16.58,15.95L16.99,16.13C17.79,16.47 18.22,16.68 18.22,17.18C18.22,17.64 17.78,17.97 17.14,17.97C16.35,17.97 15.8,17.64 15.4,16.97L13.71,17.86Z"/>
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

    // Handle project change events from Advanced SDK
    handleProjectChange(changeDetail) {
        console.log('🎬 Project change detected:', changeDetail);
        
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
            console.error('Enhanced project context failed, falling back to basic context:', error);
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
}

// Export for global use
window.AIModule = AIModule;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIModule;
}
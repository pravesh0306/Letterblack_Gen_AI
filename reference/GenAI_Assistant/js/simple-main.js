/**
 * SIMPLIFIED After Effects AI Extension - Main Controller
 * Streamlined version with only essential functionality
 */

(function() {
    'use strict';

    // Core modules - only the essentials
    let aiModule = null;
    let chatMemory = null;
    let settingsManager = null;
    let youtubeHelper = null;
    let projectContext = null;
    let fileUpload = null;
    let mascotAnimator = null; // Reusable mascot system
    let tutorialSessions = null; // Step-by-step tutorial session manager
    // Unified notification facade
    const notify = {
        show(type, title, message, duration = 3000) {
            // Prefer mascot notification if enabled
            if (mascotAnimator && window.MascotAnimator) {
                mascotAnimator.showNotification({
                    text: title || type.toUpperCase(),
                    message: message || '',
                    duration,
                    type
                });
            } else if (window.simpleToast) {
                window.simpleToast.show(`${title ? title + ': ' : ''}${message}`, type, duration);
            } else {
                console.log(`[${type}] ${title} - ${message}`);
            }
        },
        success(msg, subtitle='') { this.show('success', subtitle || 'Success', msg); },
        error(msg, subtitle='') { this.show('error', subtitle || 'Error', msg, 5000); },
        info(msg, subtitle='') { this.show('info', subtitle || 'Info', msg); },
        warning(msg, subtitle='') { this.show('warning', subtitle || 'Warning', msg, 4000); }
    };
    window.aeNotify = notify; // expose globally

    /**
     * Initialize extension when DOM is ready
     */
    function initializeExtension() {
        console.log('🚀 After Effects AI Extension - Simplified Version');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', completeInitialization);
        } else {
            completeInitialization();
        }
    }

    /**
     * Complete initialization after DOM is ready
     */
    function completeInitialization() {
        try {
            loadModules();
            setupEventListeners();
            initializeTabs();
            initializeChat();
            
            console.log('✅ Extension initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize extension:', error);
            showError('Extension failed to load. Please refresh the panel.');
        }
    }
    
    // Global error & unhandled promise rejection handlers for visibility
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error || e.message);
        notify.error('An unexpected error occurred. Check console for details.');
    });
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled rejection:', e.reason);
        notify.warning('A background error occurred. Check console for details.');
    });
    
    // Flush settings on unload (best effort)
    window.addEventListener('beforeunload', () => {
        try {
            if (window.settingsManager && typeof window.settingsManager.save === 'function') {
                window.settingsManager.save();
            }
        } catch (err) {
            console.warn('Settings flush failed:', err);
        }
    });

    /**
     * Load only essential modules
     */
    function loadModules() {
        console.log('📦 Loading essential modules...');
        
        // Initialize toast notification system (loads automatically)
        console.log('🍞 Toast system ready');
        
        // Initialize settings manager
        if (window.SimpleSettingsManager) {
            settingsManager = new window.SimpleSettingsManager();
            console.log('⚙️ Settings manager loaded');
        }
        
        // Initialize AI module
        if (window.AIModule) {
            aiModule = new window.AIModule();
            console.log('🤖 AI module loaded');
        }
        
        // Initialize chat memory
        if (window.ChatMemory) {
            chatMemory = new window.ChatMemory();
            console.log('💭 Chat memory loaded');
        }

        // Tutorial session manager
        if (window.TutorialSessionManager) {
            tutorialSessions = new window.TutorialSessionManager();
            console.log('🧩 Tutorial session manager loaded');
        }
        
        // Initialize YouTube helper
        if (window.SimpleYouTubeHelper) {
            youtubeHelper = new window.SimpleYouTubeHelper(aiModule);
            console.log('📺 YouTube helper loaded');
        }
        
        // Initialize simplified project context
        if (window.SimpleProjectContext) {
            projectContext = new window.SimpleProjectContext();
            console.log('📋 Simple project context loaded');
        } else if (window.ProjectContext) {
            // Fallback to old context if new one isn't available
            projectContext = new window.ProjectContext();
            console.log('📋 Legacy project context loaded');
        }
        
        // Initialize file upload (images and audio)
        if (window.SimpleFileUpload) {
            fileUpload = new window.SimpleFileUpload();
            console.log('✅ File upload module initialized');
        } else {
            console.warn('⚠️ SimpleFileUpload module not found');
        }

        // Initialize mascot animator (reusable system)
        if (window.MascotAnimator) {
            const settings = settingsManager ? settingsManager.getSettings() : { mascotEnabled: true };
            if (settings.mascotEnabled !== false) {
                mascotAnimator = new window.MascotAnimator({
                    mascotGif: 'assets/ae-mascot-animated.gif',
                    mascotPng: 'assets/ae-mascot.png',
                    welcomeDuration: 3500,
                    thinkingPosition: 'bottom-right',
                    welcomePosition: 'bottom-right',
                    mascotSize: '88px',
                    bubbleStyle: 'dark'
                });
                mascotAnimator.showWelcome({
                    text: 'Ready to help! ✨',
                    message: 'Ask me anything about AE scripts, expressions or automation.'
                });
            }
        }
    }

    /**
     * Set up essential event listeners
     */
    function setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Chat interface
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        
        if (sendButton && chatInput) {
            sendButton.addEventListener('click', handleSendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            });
            
            // Enable/disable send button based on input
            chatInput.addEventListener('input', (e) => {
                sendButton.disabled = !e.target.value.trim();
                updateCharCount(e.target.value.length);
            });
        }

        // YouTube analysis button
        const youtubeButton = document.getElementById('analyze-youtube');
        if (youtubeButton) {
            youtubeButton.addEventListener('click', handleYouTubeAnalysis);
        }

        // Script execution
        const runScriptButton = document.getElementById('run-script');
        const applyExpressionButton = document.getElementById('apply-expression');
        
        if (runScriptButton) {
            runScriptButton.addEventListener('click', handleRunScript);
        }
        
        if (applyExpressionButton) {
            applyExpressionButton.addEventListener('click', handleApplyExpression);
        }

        // Tab navigation
        setupTabNavigation();
        
        // Settings panel toggle
        const settingsToggle = document.getElementById('settings-toggle');
        const mainTabsToggle = document.getElementById('main-tabs-toggle');
        
        if (settingsToggle) {
            settingsToggle.addEventListener('click', toggleSettingsPanel);
        }
        if (mainTabsToggle) {
            mainTabsToggle.addEventListener('click', toggleSettingsPanel);
        }

        // Command palette and context actions
        const readExpressionBtn = document.getElementById('read-expression-btn');
        const analyzeSelectionBtn = document.getElementById('analyze-selection-btn');
        const showContextBtn = document.getElementById('show-context-btn');
        const readExpressionHelperBtn = document.getElementById('read-expression-helper-btn');
        const explainExpressionBtn = document.getElementById('explain-expression-btn');
        const debugExpressionBtn = document.getElementById('debug-expression-btn');
        const commandMenuTrigger = document.getElementById('command-menu-trigger');
        
        if (readExpressionBtn) {
            readExpressionBtn.addEventListener('click', handleReadExpression);
        }
        if (analyzeSelectionBtn) {
            analyzeSelectionBtn.addEventListener('click', handleAnalyzeSelection);
        }
        if (showContextBtn) {
            showContextBtn.addEventListener('click', handleShowContext);
        }
        if (readExpressionHelperBtn) {
            readExpressionHelperBtn.addEventListener('click', handleReadExpression);
        }
        if (explainExpressionBtn) {
            explainExpressionBtn.addEventListener('click', handleExplainExpression);
        }
        if (debugExpressionBtn) {
            debugExpressionBtn.addEventListener('click', handleDebugExpression);
        }
        if (commandMenuTrigger) {
            commandMenuTrigger.addEventListener('click', toggleCommandPalette);
        }

        // Quick action templates
        const templateButtons = document.querySelectorAll('[data-template]');
        templateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.getAttribute('data-template');
                handleQuickTemplate(template);
            });
        });

        console.log('✅ Event listeners connected');
    }

    /**
     * Handle sending chat messages
     */
    async function handleSendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message && !fileUpload?.hasFiles()) {
            return; // No text and no files
        }
        
        // Get file data if available
        const fileData = fileUpload ? fileUpload.getFileData() : null;
        
        // Clear input and add to chat
        chatInput.value = '';
        document.getElementById('send-button').disabled = true;
        updateCharCount(0);
        
        // Add user message to chat (with file if present)
        if (fileData) {
            if (fileData.type.startsWith('image/')) {
                addMessageToChat('user', message, fileData.base64);
            } else if (fileData.type.startsWith('audio/')) {
                addMessageToChat('user', message, null, fileData);
            }
        } else {
            addMessageToChat('user', message);
        }
        
        // Clear the file after sending
        if (fileData && fileUpload) {
            fileUpload.clearFiles();
        }
        
        try {
            // Get AI response
            if (aiModule) {
                showTypingIndicator();
                
                // Get current API settings
                const currentSettings = settingsManager ? settingsManager.getSettings() : {};
                const apiKey = currentSettings.apiKey;
                const provider = currentSettings.provider || 'google';
                
                console.log('🔑 Using API settings:', { provider, hasKey: !!apiKey, hasFile: !!fileData });
                
                // Get project context ONCE and use for both message enhancement and AI call
                let projectContextData = null;
                let contextualMessage = message;
                
                if (projectContext) {
                    try {
                        projectContextData = await projectContext.getCurrentContext();
                        if (projectContextData && 
                            projectContextData !== 'After Effects not connected' && 
                            projectContextData !== 'After Effects connection error') {
                            contextualMessage = `Context: ${projectContextData}\n\nUser: ${message}`;
                            console.log('📋 Added project context to message');
                        }
                    } catch (error) {
                        console.warn('⚠️ Failed to get project context:', error.message);
                        projectContextData = null;
                    }
                }
                
                // Generate AI response with file support
                // Tutorial step commands interception
                const lower = message.toLowerCase();
                if (tutorialSessions && (lower === 'next step' || lower === 'next' || lower.startsWith('step ') || lower.includes('restart tutorial'))) {
                    const stepResponse = handleTutorialStepCommand(lower);
                    hideTypingIndicator();
                    addMessageToChat('assistant', stepResponse);
                    if (chatMemory) chatMemory.addMessage('assistant', stepResponse);
                    return;
                }

                const response = await aiModule.generateResponse(message, {
                    apiKey,
                    provider,
                    fileData: fileData,
                    model: currentSettings.model,
                    temperature: currentSettings.temperature,
                    maxTokens: currentSettings.maxTokens
                });
                hideTypingIndicator();
                
                if (response) {
                    console.log('📝 Raw AI response:', response);
                    
                    // Format response with interactive code blocks
                    const formattedResponse = aiModule.formatResponseForChat ? 
                        aiModule.formatResponseForChat(response) : response;
                    
                    const hasInteractive = formattedResponse.includes('response-block') || formattedResponse.includes('interactive-code-block');
                    console.log('🎨 Formatted response:', formattedResponse);
                    console.log('✅ Contains interactive blocks:', hasInteractive);
                    
                    addMessageToChat('assistant', formattedResponse);
                    
                    // Save to memory
                    if (chatMemory) {
                        chatMemory.addMessage('user', message);
                        chatMemory.addMessage('assistant', response);
                    }
                } else {
                    addMessageToChat('error', 'No response received from AI. Please check your settings.');
                }
            } else {
                addMessageToChat('error', 'AI module not available. Please refresh the extension.');
            }
        } catch (error) {
            hideTypingIndicator();
            console.error('Chat error:', error);
            addMessageToChat('error', `Error: ${error.message}`);
        }
    }

    /**
     * Handle YouTube URL analysis
     */
    async function handleYouTubeAnalysis() {
        const input = prompt('Enter YouTube tutorial URL:');
        if (!input) return;
        
        const userPrompt = document.getElementById('chat-input').value.trim();
        
        try {
            showTypingIndicator('Analyzing YouTube tutorial...');
            
            if (youtubeHelper) {
                const result = await youtubeHelper.analyzeYouTubeURL(input, userPrompt);
                hideTypingIndicator();
                
                if (result.success) {
                    const analysis = result.data;

                    // Derive preliminary step list
                    const steps = deriveTutorialSteps(analysis);
                    let session = null;
                    if (tutorialSessions && steps.length) {
                        session = tutorialSessions.startSession(analysis.videoId, {
                            title: analysis.title || 'Tutorial',
                            steps
                        });
                    }

                    // Build message
                    let message = `📺 **YouTube Analysis**\n\n`;
                    if (analysis.title) message += `**Title:** ${analysis.title}\n`;
                    if (analysis.author) message += `**Author:** ${analysis.author}\n`;
                    message += `**Category:** ${analysis.category}\n`;
                    if (analysis.keywords?.length) message += `**Keywords:** ${analysis.keywords.join(', ')}\n`;
                    message += `\n**Suggestions:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n`;
                    if (analysis.aiAnalysis) message += `\n**AI Analysis:**\n${analysis.aiAnalysis}\n`;
                    if (session) {
                        message += `\n**Step Plan (${session.steps.length}):**\n`;
                        session.steps.forEach(s => { message += `• ${s.title}${s.script || s.expression ? ' (code)' : ''}\n`; });
                        message += `\nType 'next step' to begin step-by-step guidance.`;
                    }
                    if (analysis.aeScript) {
                        message += `\n**Base Script Suggestion:**\n\`\`\`javascript\n${analysis.aeScript}\n\`\`\``;
                        const scriptEditor = document.getElementById('script-editor');
                        if (scriptEditor) scriptEditor.value = analysis.aeScript;
                    }
                    addMessageToChat('assistant', message);
                } else {
                    addMessageToChat('error', `YouTube analysis failed: ${result.error}`);
                }
            } else {
                addMessageToChat('error', 'YouTube analysis not available.');
            }
        } catch (error) {
            hideTypingIndicator();
            console.error('YouTube analysis error:', error);
            addMessageToChat('error', `Analysis failed: ${error.message}`);
        }
    }

    /**
     * Handle running scripts in After Effects
     */
    function handleRunScript() {
        const scriptEditor = document.getElementById('script-editor');
        const script = scriptEditor?.value.trim();
        
        if (!script) {
            showError('No script to run');
            return;
        }
        
        try {
            // Use CEP to execute script in After Effects
            if (window.CSInterface) {
                const csInterface = new CSInterface();
                csInterface.evalScript(script, (result) => {
                    if (result && result !== 'undefined') {
                        showSuccess(`Script executed: ${result}`);
                    } else {
                        showSuccess('Script executed successfully');
                    }
                });
            } else {
                showError('CEP interface not available');
            }
        } catch (error) {
            showError(`Script execution failed: ${error.message}`);
        }
    }

    /**
     * Handle applying expressions to selected properties
     */
    function handleApplyExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to apply');
            return;
        }
        
        try {
            // Escape expression via JSON.stringify to preserve quotes/newlines safely
            const applyScript = `applyExpression(${JSON.stringify(expression)})`;
            
            if (window.CSInterface) {
                const csInterface = new CSInterface();
                csInterface.evalScript(applyScript, (result) => {
                    try {
                        const response = JSON.parse(result);
                        if (response.status === 'success') {
                            showSuccess(`Expression applied: ${response.data}`);
                        } else {
                            showError(`Failed to apply expression: ${response.message}`);
                        }
                    } catch (e) {
                        showError(`Expression application failed: ${result}`);
                    }
                });
            } else {
                showError('CEP interface not available');
            }
        } catch (error) {
            showError(`Expression application failed: ${error.message}`);
        }
    }

    /**
     * Initialize tab system
     */
    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = button.getAttribute('data-tab');
                
                // Update button states
                tabButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Update pane visibility
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                const targetPane = document.getElementById(`${tabId}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    /**
     * Set up tab navigation
     */
    function setupTabNavigation() {
        initializeTabs();
    }

    /**
     * Toggle settings panel
     */
    function toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        if (!panel) return;

        const settingsToggleBtn = document.getElementById('settings-toggle');
        const mainTabsToggleBtn = document.getElementById('main-tabs-toggle');

        const isHiddenByClass = panel.classList.contains('hidden');
        const isHiddenByStyle = panel.style.display === 'none';
        const shouldShow = isHiddenByClass || isHiddenByStyle;

        if (shouldShow) {
            panel.classList.remove('hidden');
            panel.style.display = '';
            panel.setAttribute('data-open', 'true');
            if (settingsToggleBtn) settingsToggleBtn.setAttribute('aria-expanded', 'true');
            if (mainTabsToggleBtn) mainTabsToggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.add('hidden');
            panel.style.display = 'none';
            panel.removeAttribute('data-open');
            if (settingsToggleBtn) settingsToggleBtn.setAttribute('aria-expanded', 'false');
            if (mainTabsToggleBtn) mainTabsToggleBtn.setAttribute('aria-expanded', 'false');
        }
        // Optional: focus first interactive element when opened
        if (shouldShow) {
            const firstInput = panel.querySelector('input, select, textarea, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 0);
            }
        }
    }

    /**
     * Initialize chat interface
     */
    function initializeChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length <= 1) {
            // Get random AE fact from AI module
            const randomFact = aiModule ? aiModule.getRandomAEFact() : "💡 **Tip:** After Effects is the industry standard for motion graphics and visual effects!";
            
            // Add welcome message with random fact
            const welcomeMessage = `Welcome! I can help you with After Effects automation, expressions, and tutorial analysis. Try pasting a YouTube tutorial URL or ask me a question.

${randomFact}`;
            
            addMessageToChat('system', welcomeMessage);
        }
    }

    /**
     * Ensure message scrolls to bottom
     */
    function scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        const messagesContainer = document.querySelector('.messages-container');
        
        if (chatMessages) {
            // Try multiple scroll methods
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get the last message and scroll it into view
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
        
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        console.log('📜 Scrolled to bottom');
    }

    /**
     * Add message to chat
     */
    function addMessageToChat(type, content, imageBase64 = null, fileData = null) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add image if provided
        if (imageBase64) {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'message-image-container';
            
            const img = document.createElement('img');
            img.className = 'message-image';
            img.src = imageBase64;
            img.alt = 'Uploaded image';
            
            imageDiv.appendChild(img);
            contentDiv.appendChild(imageDiv);
        }

        // Add audio player if provided
        if (fileData && fileData.type.startsWith('audio/')) {
            const audioDiv = document.createElement('div');
            audioDiv.className = 'message-audio-container';
            
            const audioPlayer = document.createElement('audio');
            audioPlayer.className = 'message-audio';
            audioPlayer.controls = true;
            audioPlayer.src = fileData.base64; // The base64 data URL
            
            const source = document.createElement('source');
            source.src = fileData.base64;
            source.type = fileData.mimeType;
            audioPlayer.appendChild(source);

            const audioInfo = document.createElement('div');
            audioInfo.className = 'audio-info-display';
            audioInfo.textContent = `Uploaded audio: ${fileData.name}`;

            audioDiv.appendChild(audioInfo);
            audioDiv.appendChild(audioPlayer);
            contentDiv.appendChild(audioDiv);
        }
        
        // Add text content
        if (content) {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = formatMessage(content);
            contentDiv.appendChild(textDiv);
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-timestamp';
        timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
        
        // Use the enhanced scroll function
        setTimeout(() => {
            scrollToBottom();
        }, 10);
    }

    /**
     * Format message content (basic markdown support)
     */
    function formatMessage(content) {
        // If the content already contains rendered HTML blocks (e.g., our compact response-blocks),
        // clean up excessive whitespace but preserve the HTML structure
        if (typeof content === 'string' && (
            content.includes('compact-code-block') ||
            content.includes('response-block') ||
            content.includes('interactive-code-block') ||
            /<\w+[^>]*>/.test(content)
        )) {
            // Clean up excessive line breaks and whitespace around HTML blocks
            return content
                .replace(/\n\s*\n\s*\n+/g, '\n') // Reduce multiple line breaks to single
                .replace(/\s*(<div[^>]*compact-code-block[^>]*>)/g, '\n$1') // Single line before code block
                .replace(/(<\/div>)\s*\n+/g, '$1\n') // Single line after code block
                .replace(/^\s+|\s+$/g, '') // Trim start/end whitespace
                .replace(/\n\s+/g, '\n') // Remove indentation from new lines
                .trim();
        }
        
        // Standard formatting for regular messages
        return content
            .replace(/\n\s*\n\s*\n+/g, '\n\n') // Clean excessive line breaks first
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .trim();
    }

    /**
     * Show/hide typing indicator
     */
    function showTypingIndicator(message = 'AI is typing...') {
    if (mascotAnimator) {
            mascotAnimator.showThinking({
                bubbleText: 'Thinking...',
                message: message
            });
        } else {
            // Fallback to legacy indicator
            const indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'message system typing';
            const mascotSrc = 'assets/ae-mascot-animated.gif';
            indicator.innerHTML = `
                <div class="message-content">
                    <img src="${mascotSrc}" class="typing-mascot" alt="AI thinking" />
                    <div class="typing-text">${message}</div>
                </div>
            `;
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.appendChild(indicator);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }

    function hideTypingIndicator() {
        if (mascotAnimator) {
            mascotAnimator.hideThinking();
        } else {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }

    // React to mascot enabled/disabled toggle
    document.addEventListener('mascot:toggle', (e) => {
        const enabled = e.detail.enabled;
        if (enabled && !mascotAnimator && window.MascotAnimator) {
            mascotAnimator = new window.MascotAnimator({
                mascotGif: 'assets/ae-mascot-animated.gif',
                mascotPng: 'assets/ae-mascot.png',
                welcomeDuration: 3000,
                thinkingPosition: 'bottom-right',
                welcomePosition: 'bottom-right',
                mascotSize: '88px',
                bubbleStyle: 'dark'
            });
            mascotAnimator.showWelcome({
                text: 'Mascot enabled 🎉',
                message: 'I will show thinking states and helpful notices.'
            });
        } else if (!enabled && mascotAnimator) {
            mascotAnimator.hideAll();
            mascotAnimator = null;
        }
    });

    /**
     * Update character count
     */
    function updateCharCount(count) {
        const charCountElement = document.querySelector('.char-count');
        if (charCountElement) {
            charCountElement.textContent = `${count}/1000`;
        }
    }

    /**
     * Utility functions for user feedback
     */
    function showSuccess(message) {
    notify.success(message);
    }

    function showError(message) {
    notify.error(message);
    addMessageToChat('error', message);
    }


    // Add global status check for debugging
    window.extensionStatus = function() {
        const status = {
            modules: {
                toast: !!window.simpleToast,
                settings: !!settingsManager,
                ai: !!aiModule,
                youtube: !!youtubeHelper,
                project: !!projectContext,
                memory: !!chatMemory
            },
            ready: true
        };
        
        console.log('🔍 Extension Status:', status);
        
        if (window.simpleToast) {
            window.simpleToast.success('Extension status checked - see console for details');
        }
        
        return status;
    };
    
    // Test save function
    window.testSave = function() {
        console.log('🧪 Testing save function...');
        if (settingsManager && settingsManager.showFeedback) {
            settingsManager.showFeedback('Test save successful!', 'success');
        } else {
            console.error('Settings manager not available');
        }
    };
    
    // Test API connection
    window.testApiConnection = async function() {
        console.log('🧪 Testing API connection...');
        
        if (!settingsManager || !aiModule) {
            console.error('❌ Required modules not loaded');
            if (window.simpleToast) {
                window.simpleToast.error('Extension modules not loaded');
            }
            return false;
        }
        
        const settings = settingsManager.getSettings();
        console.log('🔍 Current settings:', {
            provider: settings.provider,
            hasKey: !!settings.apiKey,
            apiKeyPreview: settings.apiKey ? settings.apiKey.substring(0, 8) + '...' : 'none'
        });
        
        if (!settings.apiKey) {
            console.error('❌ No API key found');
            if (window.simpleToast) {
                window.simpleToast.error('No API key configured');
            }
            return false;
        }
        
        try {
            if (window.simpleToast) {
                window.simpleToast.info('Testing API connection...');
            }
            
            const response = await aiModule.generateResponse('Hello, please respond with "API test successful" if you can read this.', {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            
            console.log('✅ API Response received:', response);
            
            if (window.simpleToast) {
                window.simpleToast.success('API test completed - check console for response');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ API Test Failed:', error);
            if (window.simpleToast) {
                window.simpleToast.error('API test failed: ' + error.message);
            }
            return false;
        }
    };
    
    // Global functions for enhanced interactive code blocks
    window.copyCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const codeContent = codeBlock.querySelector('.code-content code');
        if (!codeContent) return;
        
        const code = codeContent.textContent;
        const copyBtn = codeBlock.querySelector('.copy-btn');
        
        // Add loading state
        if (copyBtn) {
            copyBtn.classList.add('processing');
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            // Success feedback
            if (copyBtn) {
                copyBtn.classList.remove('processing');
                copyBtn.classList.add('success');
            }
            
            codeBlock.classList.add('copied');
            
            if (window.simpleToast) {
                window.simpleToast.success('Code copied!');
            }
            console.log('📋 Code copied:', code);
            
            // Reset after 1.5 seconds
            setTimeout(() => {
                if (copyBtn) {
                    copyBtn.classList.remove('success');
                }
                codeBlock.classList.remove('copied');
            }, 1500);
            
        }).catch(err => {
            console.error('Failed to copy code:', err);
            if (copyBtn) {
                copyBtn.classList.remove('processing');
            }
            
            if (window.simpleToast) {
                window.simpleToast.error('Failed to copy code');
            }
        });
    };
    
    window.applyCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const codeContent = codeBlock.querySelector('.code-content code');
        if (!codeContent) return;
        
        const code = codeContent.textContent;
        const applyBtn = codeBlock.querySelector('.apply-btn');
        
        // Add loading state
        if (applyBtn) {
            applyBtn.classList.add('processing');
        }
        
        // Apply expression to selected layer/property in After Effects
        if (window.CSInterface) {
            const csInterface = new CSInterface();
            const script = `
                try {
                    var activeComp = app.project.activeItem;
                    if (activeComp && activeComp instanceof CompItem) {
                        var selectedLayers = activeComp.selectedLayers;
                        if (selectedLayers.length > 0) {
                            var layer = selectedLayers[0];
                            var selectedProps = layer.selectedProperties;
                            if (selectedProps.length > 0) {
                                var prop = selectedProps[0];
                                if (prop.canSetExpression) {
                                    prop.expression = "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
                                    "Expression applied to " + prop.name;
                                } else {
                                    "Selected property cannot have expressions";
                                }
                            } else {
                                // Try to apply to position if nothing selected
                                if (layer.transform && layer.transform.position) {
                                    layer.transform.position.expression = "${code.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
                                    "Expression applied to position";
                                } else {
                                    "Please select a property";
                                }
                            }
                        } else {
                            "Please select a layer first";
                        }
                    } else {
                        "No active composition found";
                    }
                } catch (error) {
                    "Error: " + error.toString();
                }
            `;
            
            csInterface.evalScript(script, (result) => {
                if (applyBtn) {
                    applyBtn.classList.remove('processing');
                }
                
                if (result.includes('applied')) {
                    // Success
                    if (applyBtn) {
                        applyBtn.classList.add('success');
                    }
                    
                    codeBlock.classList.add('applied');
                    
                    if (window.simpleToast) {
                        window.simpleToast.success('Expression applied!');
                    }
                } else {
                    // Warning or instruction
                    if (window.simpleToast) {
                        window.simpleToast.warning(result);
                    }
                }
                
                console.log('⚡ Apply result:', result);
                
                // Reset after 2 seconds
                setTimeout(() => {
                    if (applyBtn) {
                        applyBtn.classList.remove('success');
                    }
                    codeBlock.classList.remove('applied');
                }, 2000);
            });
        } else {
            if (applyBtn) {
                applyBtn.classList.remove('processing');
            }
            
            if (window.simpleToast) {
                window.simpleToast.warning('CEP interface not available');
            }
        }
    };

    window.saveCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const codeContent = codeBlock.querySelector('.code-content code');
        if (!codeContent) return;
        
        const code = codeContent.textContent;
        const saveBtn = codeBlock.querySelector('.save-btn');
        
        // Add loading state
        if (saveBtn) {
            saveBtn.classList.add('processing');
        }
        
        // Add to script editor
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            const currentContent = scriptEditor.value;
            const timestamp = new Date().toLocaleString();
            const separator = currentContent ? 
                `\n\n// ---- Added ${timestamp} ----\n` : 
                `// ---- Saved ${timestamp} ----\n`;
            
            scriptEditor.value = currentContent + separator + code;
            
            // Success feedback
            if (saveBtn) {
                saveBtn.classList.remove('processing');
                saveBtn.classList.add('success');
            }
            
            codeBlock.classList.add('saved');
            
            if (window.simpleToast) {
                window.simpleToast.success('Code saved to editor!');
            }
            
            console.log('💾 Code saved to script editor');
            
            // Switch to script tab if available
            const scriptTab = document.querySelector('[data-tab="script-library"]');
            if (scriptTab) {
                setTimeout(() => {
                    scriptTab.click();
                }, 500);
            }
            
        } else {
            // Save to localStorage as fallback
            try {
                const savedCodes = JSON.parse(localStorage.getItem('ae_saved_codes') || '[]');
                savedCodes.push({
                    code,
                    timestamp: new Date().toISOString(),
                    id: blockId
                });
                localStorage.setItem('ae_saved_codes', JSON.stringify(savedCodes));
                
                if (saveBtn) {
                    saveBtn.classList.remove('processing');
                    saveBtn.classList.add('success');
                }
                
                if (window.simpleToast) {
                    window.simpleToast.success('Code saved locally!');
                }
            } catch (error) {
                if (saveBtn) {
                    saveBtn.classList.remove('processing');
                }
                
                if (window.simpleToast) {
                    window.simpleToast.error('Could not save code');
                }
            }
        }
        
        // Reset after 1.5 seconds
        setTimeout(() => {
            if (saveBtn) {
                saveBtn.classList.remove('success');
            }
            codeBlock.classList.remove('saved');
        }, 1500);
    };
    
    // Test function for enhanced interactive code blocks
    window.testEnhancedCodeBlocks = function() {
        console.log('🧪 Testing enhanced code block formatting...');
        
        if (!aiModule || !aiModule.formatResponseForChat) {
            console.error('❌ AI module not loaded or missing formatResponseForChat');
            return;
        }
        
        // Test multiple code types
        const testResponses = [
            {
                name: "Expression with code block",
                content: "Here's a wiggle expression:\n```\nwiggle(2, 50)\n```\nThis creates random movement."
            },
            {
                name: "ExtendScript with code block", 
                content: "Use this script:\n```\napp.project.activeItem.selectedLayers[0].name = 'New Layer';\n```\nThis renames the selected layer."
            },
            {
                name: "Multiple expressions",
                content: "Try these:\n```\nwiggle(1, 30)\n```\nOr for rotation:\n```\ntime * 45\n```"
            },
            {
                name: "Fallback detection",
                content: "Use wiggle(3, 25) for shake effect and time*90 for rotation."
            }
        ];
        
        testResponses.forEach((test, index) => {
            console.log(`\n${index + 1}. Testing: ${test.name}`);
            const formatted = aiModule.formatResponseForChat(test.content);
            console.log('   - Contains compact-code-block:', formatted.includes('compact-code-block'));
            console.log('   - Contains compact action buttons:', formatted.includes('compact-btn'));
            
            // Add to chat
            addMessageToChat('assistant', formatted);
        });
        
        console.log('\n✅ Enhanced code block test completed - check the chat for interactive blocks!');
        
        if (window.simpleToast) {
            window.simpleToast.success('Enhanced code blocks tested - check the chat!');
        }
    };
    
    // Test individual button functions
    window.testButtonFunctions = function() {
        console.log('🧪 Testing button functions...');
        
        setTimeout(() => {
            const codeBlocks = document.querySelectorAll('.compact-code-block');
            if (codeBlocks.length > 0) {
                const firstBlock = codeBlocks[0];
                const blockId = firstBlock.id;
                
                if (blockId) {
                    console.log('📋 Testing copy function...');
                    window.copyCode(blockId);
                    
                    setTimeout(() => {
                        console.log('💾 Testing save function...');
                        window.saveCode(blockId);
                    }, 1000);
                    
                    setTimeout(() => {
                        console.log('⚡ Testing apply function...');
                        window.applyCode(blockId);
                    }, 2000);
                } else {
                    console.log('❌ No code block ID found');
                }
            } else {
                console.log('❌ No code blocks found - run testEnhancedCodeBlocks() first');
                if (window.simpleToast) {
                    window.simpleToast.error('No code blocks found - generate some code first!');
                }
            }
        }, 500);
    };
    
    // Comprehensive test for interactive code blocks
    window.debugCodeBlocks = function() {
        console.log('🔍 DEBUGGING CODE BLOCKS...');
        console.log('================================');
        
        // Test 1: Check if AI module is loaded
        console.log('1. AI Module Check:');
        console.log('   - aiModule loaded:', !!aiModule);
        console.log('   - formatResponseForChat available:', !!(aiModule && aiModule.formatResponseForChat));
        
        // Test 2: Test code block detection
        if (aiModule && aiModule.formatResponseForChat) {
            console.log('\n2. Code Block Formatting Test:');
            
            const testInput = `Here's a wiggle expression:

\`\`\`\nwiggle(2, 50)\n\`\`\`\n
This creates random movement.`;
            
            console.log('   - Input:', testInput);
            const formatted = aiModule.formatResponseForChat(testInput);
            console.log('   - Output:', formatted);
            console.log('   - Contains compact-code-block:', formatted.includes('compact-code-block'));
            console.log('   - Contains compact-btn:', formatted.includes('compact-btn'));
            
            // Test 3: Add to DOM and check
            console.log('\n3. DOM Test:');
            const testDiv = document.createElement('div');
            testDiv.innerHTML = formatted;
            const blocks = testDiv.querySelectorAll('.compact-code-block');
            console.log('   - Compact code blocks found in DOM:', blocks.length);
            
            // Test 4: Add to actual chat
            console.log('\n4. Adding to Chat:');
            addMessageToChat('assistant', formatted);
            
            setTimeout(() => {
                const chatBlocks = document.querySelectorAll('#chat-messages .compact-code-block');
                console.log('   - Compact code blocks in chat after add:', chatBlocks.length);
                
                if (chatBlocks.length > 0) {
                    console.log('✅ Success! Compact interactive code blocks are working');
                } else {
                    console.log('❌ Failed! No compact interactive code blocks found in chat');
                    
                    // Debug further
                    const allCodeElements = document.querySelectorAll('#chat-messages code, #chat-messages pre');
                    console.log('   - Regular code elements found:', allCodeElements.length);
                }
            }, 100);
        }
        
        console.log('================================');
    };

    // Test scrolling behavior
    window.testScrolling = function() {
        console.log('🧪 Testing scrolling behavior...');
        
        // Add several test messages
        for (let i = 1; i <= 5; i++) {
            addMessageToChat('user', `Test message ${i}`);
            addMessageToChat('assistant', `Response to test message ${i}`);
        }
        
        console.log('✅ Added 10 test messages - chat should auto-scroll to bottom');
        
        if (window.simpleToast) {
            window.simpleToast.success('Test messages added - check if chat scrolled to bottom');
        }
    };

    // Test settings panel scrolling
    window.testSettingsScroll = function() {
        console.log('🧪 Testing settings panel scrolling...');
        
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.style.display = 'block';
            
            // Find the settings tab
            const settingsTab = document.querySelector('[data-tab="settings"]');
            if (settingsTab) {
                settingsTab.click();
            }
            
            console.log('✅ Settings panel opened - check if you can scroll to bottom (Save & Test button should be visible)');
            
            if (window.simpleToast) {
                window.simpleToast.success('Settings panel opened - check scrolling to bottom');
            }
        } else {
            console.error('❌ Settings panel not found');
        }
    };

    /**
     * Handle reading expressions from selected properties
     */
    async function handleReadExpression() {
        if (!window.CSInterface) {
            showError('CEP interface not available');
            return;
        }

        const csInterface = new CSInterface();
        const script = `
            try {
                var activeComp = app.project.activeItem;
                if (activeComp && activeComp instanceof CompItem) {
                    var selectedLayers = activeComp.selectedLayers;
                    if (selectedLayers.length > 0) {
                        var layer = selectedLayers[0];
                        var selectedProps = layer.selectedProperties;
                        if (selectedProps.length > 0) {
                            var prop = selectedProps[0];
                            if (prop.expression && prop.expression.length > 0) {
                                JSON.stringify({
                                    status: "success",
                                    expression: prop.expression,
                                    property: prop.name,
                                    layer: layer.name
                                });
                            } else {
                                JSON.stringify({
                                    status: "error",
                                    message: "Selected property has no expression"
                                });
                            }
                        } else {
                            JSON.stringify({
                                status: "error", 
                                message: "No properties selected"
                            });
                        }
                    } else {
                        JSON.stringify({
                            status: "error",
                            message: "No layers selected"
                        });
                    }
                } else {
                    JSON.stringify({
                        status: "error",
                        message: "No active composition"
                    });
                }
            } catch (error) {
                JSON.stringify({
                    status: "error",
                    message: error.toString()
                });
            }
        `;

        csInterface.evalScript(script, (result) => {
            try {
                const response = JSON.parse(result);
                if (response.status === 'success') {
                    const message = `**Expression Read from ${response.property}**\n\n\`\`\`\n${response.expression}\n\`\`\`\n\nLayer: ${response.layer}`;
                    addMessageToChat('system', message);
                    
                    // Also populate script editor
                    const scriptEditor = document.getElementById('script-editor');
                    if (scriptEditor) {
                        scriptEditor.value = response.expression;
                    }
                } else {
                    showError(response.message);
                }
            } catch (e) {
                showError('Failed to read expression: ' + result);
            }
        });
    }

    /**
     * Handle analyzing current selection
     */
    async function handleAnalyzeSelection() {
        if (!projectContext) {
            showError('Project context not available');
            return;
        }

        try {
            showTypingIndicator('Analyzing selection...');
            const context = await projectContext.getCurrentContext();
            
            if (context && context !== 'After Effects not connected') {
                const analysisPrompt = `Analyze the current After Effects selection and provide insights:
                
Context: ${context}

Please provide:
1. What is currently selected
2. Suggested improvements or optimizations
3. Common techniques that could be applied
4. Any potential issues or warnings`;

                if (aiModule && settingsManager) {
                    const settings = settingsManager.getSettings();
                    const response = await aiModule.generateResponse(analysisPrompt, {
                        provider: settings.provider,
                        apiKey: settings.apiKey,
                        model: settings.model,
                        temperature: settings.temperature,
                        maxTokens: settings.maxTokens
                    });
                    
                    hideTypingIndicator();
                    addMessageToChat('assistant', response);
                } else {
                    hideTypingIndicator();
                    addMessageToChat('system', `**Selection Analysis**\n\n${context}\n\nConfigure AI provider for detailed analysis.`);
                }
            } else {
                hideTypingIndicator();
                showError('Unable to analyze - no After Effects connection');
            }
        } catch (error) {
            hideTypingIndicator();
            showError('Analysis failed: ' + error.message);
        }
    }

    /**
     * Handle showing current context
     */
    async function handleShowContext() {
        if (!projectContext) {
            showError('Project context not available');
            return;
        }

        try {
            const context = await projectContext.getCurrentContext();
            const contextMessage = `**Current After Effects Context**\n\n${context}`;
            addMessageToChat('system', contextMessage);
        } catch (error) {
            showError('Failed to get context: ' + error.message);
        }
    }

    /**
     * Handle explaining expressions
     */
    async function handleExplainExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to explain. Paste an expression in the script editor first.');
            return;
        }

        if (!aiModule || !settingsManager) {
            showError('AI module not available for explanations');
            return;
        }

        try {
            showTypingIndicator('Explaining expression...');
            const settings = settingsManager.getSettings();
            const prompt = `Explain this After Effects expression in detail:

\`\`\`
${expression}
\`\`\`

Please provide:
1. What this expression does
2. How it works step by step
3. When you might use it
4. Any variations or improvements`;

            const response = await aiModule.generateResponse(prompt, {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            hideTypingIndicator();
            addMessageToChat('assistant', response);
        } catch (error) {
            hideTypingIndicator();
            showError('Explanation failed: ' + error.message);
        }
    }

    /**
     * Handle debugging expressions
     */
    async function handleDebugExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to debug. Paste an expression in the script editor first.');
            return;
        }

        if (!aiModule || !settingsManager) {
            showError('AI module not available for debugging');
            return;
        }

        try {
            showTypingIndicator('Debugging expression...');
            const settings = settingsManager.getSettings();
            const prompt = `Debug this After Effects expression and find potential issues:

\`\`\`
${expression}
\`\`\`

Please check for:
1. Syntax errors
2. Common mistakes
3. Performance issues
4. Provide a corrected version if needed`;

            const response = await aiModule.generateResponse(prompt, {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            hideTypingIndicator();
            addMessageToChat('assistant', response);
        } catch (error) {
            hideTypingIndicator();
            showError('Debugging failed: ' + error.message);
        }
    }

    /**
     * Toggle command palette
     */
    function toggleCommandPalette() {
        const commandPanel = document.getElementById('command-menu-panel');
        if (commandPanel) {
            const isVisible = commandPanel.style.display !== 'none';
            commandPanel.style.display = isVisible ? 'none' : 'block';
            
            const trigger = document.getElementById('command-menu-trigger');
            if (trigger) {
                trigger.setAttribute('aria-expanded', (!isVisible).toString());
            }
        }
    }

    /**
     * Handle quick template actions
     */
    async function handleQuickTemplate(template) {
        const templates = {
            text: {
                prompt: "Create a text animation template for After Effects",
                script: `
// Text Animation Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Text Animation");
    var textLayer = comp.layers.addText("Animated Text");
    textLayer.property("Opacity").setValueAtTime(0, 0);
    textLayer.property("Opacity").setValueAtTime(1, 100);
    app.endUndoGroup();
}`
            },
            particles: {
                prompt: "Create a particle system setup for After Effects",
                script: `
// Particle System Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Particle System");
    var solid = comp.layers.addSolid([1, 1, 1], "Particles", comp.width, comp.height, 1);
    // Add CC Particle World effect here
    app.endUndoGroup();
}`
            },
            transitions: {
                prompt: "Create scene transition templates for After Effects",
                script: `
// Scene Transition Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Scene Transition");
    var solid = comp.layers.addSolid([0, 0, 0], "Transition", comp.width, comp.height, 1);
    solid.property("Opacity").setValueAtTime(0, 100);
    solid.property("Opacity").setValueAtTime(0.5, 0);
    app.endUndoGroup();
}`
            },
            effects: {
                prompt: "Create visual effects templates for After Effects",
                script: `
// Visual Effects Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Visual Effects");
    var adjustment = comp.layers.addSolid([1, 1, 1], "Effects", comp.width, comp.height, 1);
    adjustment.adjustmentLayer = true;
    app.endUndoGroup();
}`
            }
        };

        const templateData = templates[template];
        if (!templateData) {
            showError('Unknown template: ' + template);
            return;
        }

        // Add script to editor
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            scriptEditor.value = templateData.script;
        }

        // Send prompt to AI for enhancement if available
        if (aiModule && settingsManager) {
            try {
                showTypingIndicator('Generating enhanced template...');
                const settings = settingsManager.getSettings();
                const response = await aiModule.generateResponse(templateData.prompt + ". Provide a detailed script with multiple variations.", {
                    provider: settings.provider,
                    apiKey: settings.apiKey,
                    model: settings.model,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens
                });
                hideTypingIndicator();
                addMessageToChat('assistant', response);
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('system', `**${template.toUpperCase()} Template**\n\nBasic template added to script editor. Configure AI for enhanced versions.`);
            }
        } else {
            addMessageToChat('system', `**${template.toUpperCase()} Template**\n\nBasic template added to script editor.`);
        }

        // Hide command palette
        const commandPanel = document.getElementById('command-menu-panel');
        if (commandPanel) {
            commandPanel.style.display = 'none';
        }
    }

    // Ensure initialization only happens once
    if (!window.__AE_EXTENSION_INITIALIZED__) {
        window.__AE_EXTENSION_INITIALIZED__ = true;
        initializeExtension();
        // Global keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = document.getElementById('send-button');
                if (sendBtn && !sendBtn.disabled) sendBtn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                toggleSettingsPanel();
            }
            if (e.key === 'Escape') {
                const commandPanel = document.getElementById('command-menu-panel');
                if (commandPanel) {
                    commandPanel.style.display = 'none';
                }
            }
        });
        console.log('🚀 Simple main controller ready. Type testEnhancedCodeBlocks() to test interactive expressions.');
    }

    // Test the new code-first AI behavior
    window.testCodeFirstAI = async function() {
        console.log('🧪 Testing new code-first AI behavior...');
        
        if (!settingsManager || !aiModule) {
            console.error('❌ Required modules not loaded');
            return false;
        }

        const settings = settingsManager.getSettings();
        if (!settings.apiKey) {
            console.error('❌ No API key configured');
            return false;
        }

        const testMessages = [
            'wiggle',
            'position',
            'random position', 
            'animate text',
            'rotation'
        ];

        console.log('🎯 Testing these messages with new code-first approach:');
        testMessages.forEach(msg => console.log(`   - "${msg}"`));

        for (const message of testMessages) {
            try {
                console.log(`\n🧪 Testing: "${message}"`);
                const response = await aiModule.generateResponse(message, {
                    provider: settings.provider,
                    apiKey: settings.apiKey,
                    model: settings.model,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens
                });
                
                const hasCode = response.includes('```') || response.includes('wiggle(') || response.includes('time *');
                console.log(`   ✅ Response contains code: ${hasCode}`);
                console.log(`   📝 Response preview: ${response.substring(0, 100)}...`);
                
                if (hasCode) {
                    addMessageToChat('assistant', `**Test: "${message}"**\n\n${response}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed: ${error.message}`);
            }
        }
        
        console.log('\n✅ Code-first AI test completed - check the chat for results!');
        
        if (window.simpleToast) {
            window.simpleToast.success('Code-first AI tested - check the chat!');
        }
        
        return true;
    };

    // ===== Tutorial Step Helpers =====
    function handleTutorialStepCommand(cmd) {
        if (!tutorialSessions) return 'Tutorial sessions not available.';
        if (cmd.includes('restart')) {
            const active = tutorialSessions.getActive();
            if (!active) return 'No active tutorial session to restart.';
            tutorialSessions.restart();
            const step = tutorialSessions.getCurrentStep();
            return '🔄 Restarting tutorial.\n\n' + renderStep(step, tutorialSessions.getActive());
        }
        const active = tutorialSessions.getActive();
        if (!active) return 'No active tutorial session. Analyze a YouTube link first.';
        const stepNumberMatch = cmd.match(/step\s+(\d+)/);
        if (stepNumberMatch) {
            const idx = parseInt(stepNumberMatch[1], 10) - 1;
            const step = tutorialSessions.goTo(idx);
            if (!step) return 'That step does not exist.';
            return renderStep(step, active);
        }
        const current = tutorialSessions.getCurrentStep();
        if (current) tutorialSessions.markCompleted(current.index);
        const next = tutorialSessions.next();
        if (!next) return 'All steps completed 🎉. Type "restart tutorial" to begin again.';
        return renderStep(next, active);
    }

    function renderStep(step, session) {
        if (!step) return 'No step available.';
        let out = `📘 Step ${step.index + 1}/${session.steps.length}: **${step.title}**\n\n${step.description || ''}`;
        if (step.script) {
            out += `\n\nRun this script or copy to the editor:\n\`\`\`javascript\n${step.script}\n\`\`\``;
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) scriptEditor.value = step.script;
        }
        if (step.expression && !step.script) {
            out += `\n\nApply this expression (copy to editor and click Apply Expression):\n\`\`\`javascript\n${step.expression}\n\`\`\``;
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) scriptEditor.value = step.expression;
        }
        out += `\n\nType 'next step' for the next step or 'step N' to jump. Type 'restart tutorial' to restart.`;
        return out;
    }

    function deriveTutorialSteps(analysis) {
        const steps = [];
        const kws = analysis.keywords || [];
        if (analysis.category === 'text' || kws.includes('typewriter')) {
            steps.push({ title: 'Create Text Layer', description: 'Add a text layer and set initial position.', script: "var c=app.project.activeItem; if(c){app.beginUndoGroup('Create Text');var t=c.layers.addText('Tutorial Text');app.endUndoGroup();}" });
            steps.push({ title: 'Add Typewriter Expression', description: 'Add slider and typewriter reveal.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Typewriter');var lyr=c.selectedLayers[0]||c.layers[c.layers.length];var eff=lyr.Effects.addProperty('ADBE Slider Control');eff.name='Speed';eff.property('Slider').setValue(15);lyr.property('Source Text').expression=\"var t=text.sourceText;var chars=Math.floor(time*effect('Speed')('Slider'));t.substr(0,chars);\";app.endUndoGroup();}" });
            steps.push({ title: 'Add Fade In', description: 'Animate opacity for intro.', script: "var c=app.project.activeItem; if(c){app.beginUndoGroup('Fade In'); var lyr=c.selectedLayers[0]; if(lyr){lyr.opacity.setValueAtTime(0,0);lyr.opacity.setValueAtTime(1,100);} app.endUndoGroup();}" });
        } else if (kws.includes('pulse') || kws.includes('pulsing')) {
            steps.push({ title: 'Select Target Layer', description: 'Select the layer to pulse.', script: "// Select a layer manually then proceed." });
            steps.push({ title: 'Apply Pulse Expression', description: 'Apply pulsing scale expression.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Pulse');var l=c.selectedLayers[0];l.property('Scale').expression='var amp=5;var speed=2;[100+amp*Math.sin(time*Math.PI*speed),100+amp*Math.sin(time*Math.PI*speed)];';app.endUndoGroup();}" });
            steps.push({ title: 'Refine Timing', description: 'Adjust amp/speed values.', script: "// Modify expression parameters directly." });
        } else if (analysis.category === 'motion') {
            steps.push({ title: 'Create Motion Element', description: 'Add base solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Motion Element');c.layers.addSolid([1,0.5,0],'Motion Element',200,200,1);app.endUndoGroup();}" });
            steps.push({ title: 'Add Wiggle Expression', description: 'Random position motion.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Wiggle');var l=c.selectedLayers[0];l.property('Position').expression='wiggle(2,50)';app.endUndoGroup();}" });
            steps.push({ title: 'Animate Scale Ease', description: 'Scale keyframes with easing.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Scale Ease');var l=c.selectedLayers[0];l.transform.scale.setValueAtTime(0,[50,50]);l.transform.scale.setValueAtTime(1,[100,100]);app.endUndoGroup();}" });
        } else if (analysis.category === 'effects' || kws.includes('glow')) {
            steps.push({ title: 'Create Adjustment Layer', description: 'Add adjustment solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Adj Layer');var a=c.layers.addSolid([1,1,1],'Adjustment',c.width,c.height,1);a.adjustmentLayer=true;app.endUndoGroup();}" });
            steps.push({ title: 'Apply Glow Effect', description: 'Add glow effect.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Glow');var l=c.selectedLayers[0];l.Effects.addProperty('ADBE Glo2');app.endUndoGroup();}" });
            steps.push({ title: 'Tune Effect', description: 'Adjust glow settings manually.', script: "// Adjust effect properties in UI." });
        } else {
            steps.push({ title: 'Create Composition', description: 'Ensure composition exists.', script: "if(!app.project.activeItem){app.beginUndoGroup('New Comp');app.project.items.addComp('New Comp',1920,1080,1,10,30);app.endUndoGroup();}" });
            steps.push({ title: 'Add Solid Layer', description: 'Add background solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Solid');c.layers.addSolid([0.2,0.2,0.8],'BG Solid',c.width,c.height,1);app.endUndoGroup();}" });
            steps.push({ title: 'Animate Opacity', description: 'Fade solid in.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Opacity Fade');var l=c.selectedLayers[0];l.opacity.setValueAtTime(0,0);l.opacity.setValueAtTime(1,100);app.endUndoGroup();}" });
        }
        return steps;
    }

})();

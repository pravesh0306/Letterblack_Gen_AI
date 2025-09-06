/**
 * CONSOLIDATED CORE - Adobe AI Generations Extension
 * Streamlined 5-file architecture replacing 64+ modular files
 * This is the main entry point that coordinates all functionality
 */

// Global state
window.aiExtension = {
    isInitialized: false,
    modules: {},
    state: {
        currentConversation: null,
        isProcessing: false,
        settings: {}
    }
};

(function() {
    'use strict';

    // ==========================================
    // CORE INITIALIZATION
    // ==========================================

    function initializeExtension() {
        console.log('🚀 Adobe AI Generations - Initializing consolidated extension...');
        
        try {
            // Initialize core systems in order
            initializeUI();
            initializeEventHandlers();
            initializeSettings();
            initializeAI();
            initializeStorage();
            
            window.aiExtension.isInitialized = true;
            console.log('✅ Extension initialization complete');
            
            // Run post-initialization tasks
            setTimeout(() => {
                loadWelcomeMessage();
                checkAPIConfiguration();
            }, 100);
            
        } catch (error) {
            console.error('❌ Extension initialization failed:', error);
            showError('Extension failed to initialize. Please refresh and try again.');
        }
    }

    // ==========================================
    // UI INITIALIZATION
    // ==========================================

    function initializeUI() {
        console.log('🎨 Initializing UI components...');
        
        // Initialize character counter
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            updateCharCount(0);
        }
        
        // Setup mascot if available
        if (window.__mascot) {
            window.__mascot.showWelcome();
        }
        
        // Initialize tooltips and UI enhancements
        initializeTooltips();
    }

    function initializeTooltips() {
        // Add tooltips to buttons
        const buttons = document.querySelectorAll('button[title]');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', function() {
                // Simple tooltip implementation
                const title = this.getAttribute('title');
                if (title) {
                    this.setAttribute('data-original-title', title);
                }
            });
        });
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    function initializeEventHandlers() {
        console.log('🔗 Setting up event handlers...');
        
        // Chat interface
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        
        if (sendButton && chatInput) {
            // Remove any existing event listeners to prevent conflicts
            const newSendButton = sendButton.cloneNode(true);
            sendButton.parentNode.replaceChild(newSendButton, sendButton);
            
            const newChatInput = chatInput.cloneNode(true);
            chatInput.parentNode.replaceChild(newChatInput, chatInput);
            
            // Add fresh event listeners
            setupChatEventHandlers();
        }
        
        // Settings button
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', openSettings);
        }
        
        // Other UI buttons
        setupUIButtonHandlers();
    }

    function setupChatEventHandlers() {
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        
        if (!sendButton || !chatInput) {
            console.error('❌ Chat elements not found');
            return;
        }
        
        // Send button click
        sendButton.addEventListener('click', handleSendMessage);
        
        // Enter key handling
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        
        // Input validation and send button state
        chatInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const hasText = value.trim().length > 0;
            
            // Enable/disable send button
            sendButton.disabled = !hasText;
            
            // Update character count
            updateCharCount(value.length);
            
            // Visual feedback
            if (hasText) {
                sendButton.classList.add('ready');
            } else {
                sendButton.classList.remove('ready');
            }
        });
        
        // Focus handling
        chatInput.addEventListener('focus', () => {
            if (chatInput.value.trim()) {
                sendButton.disabled = false;
            }
        });
    }

    function setupUIButtonHandlers() {
        // Project organizer
        const projectOrganizerButton = document.getElementById('project-organizer');
        if (projectOrganizerButton) {
            projectOrganizerButton.addEventListener('click', openProjectOrganizer);
        }
        
        // YouTube analysis
        const youtubeButton = document.getElementById('analyze-youtube');
        if (youtubeButton) {
            youtubeButton.addEventListener('click', handleYouTubeAnalysis);
        }
        
        // Tutorial button
        const tutorialButton = document.getElementById('tutorial-button');
        if (tutorialButton) {
            tutorialButton.addEventListener('click', startTutorial);
        }
    }

    // ==========================================
    // CHAT MESSAGE HANDLING
    // ==========================================

    async function handleSendMessage() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        
        if (!chatInput || !sendButton) {
            console.error('❌ Chat elements not found');
            return;
        }
        
        const message = chatInput.value.trim();
        
        // Validation
        if (!message) {
            showError('Please enter a message');
            return;
        }
        
        if (message.length > 1000) {
            showError(`Message too long (${message.length}/1000 characters)`);
            return;
        }
        
        // Prevent double-sending
        if (window.aiExtension.state.isProcessing) {
            return;
        }
        
        window.aiExtension.state.isProcessing = true;
        
        try {
            // Clear input and disable button
            chatInput.value = '';
            sendButton.disabled = true;
            updateCharCount(0);
            
            // Add user message to chat
            addMessageToChat('user', message);
            
            // Show typing indicator
            showTypingIndicator();
            
            // Get AI response
            const response = await getAIResponse(message);
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Add AI response to chat
            if (response) {
                addMessageToChat('assistant', response);
                
                // Save to storage
                if (window.aiExtension.modules.storage) {
                    await window.aiExtension.modules.storage.saveConversation({
                        userMessage: message,
                        aiResponse: response,
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                addMessageToChat('assistant', 'I apologize, but I encountered an error processing your request. Please check your API configuration and try again.');
            }
            
        } catch (error) {
            console.error('❌ Error handling message:', error);
            hideTypingIndicator();
            showError('Failed to process message. Please try again.');
            addMessageToChat('assistant', 'I encountered an error processing your request. Please try again.');
        } finally {
            window.aiExtension.state.isProcessing = false;
        }
    }

    async function getAIResponse(message) {
        try {
            const settings = window.aiExtension.state.settings;
            
            // Check if AI module is available
            if (!window.aiExtension.modules.ai) {
                throw new Error('AI module not initialized');
            }
            
            // Get API configuration
            const apiKey = settings.apiKey;
            const provider = settings.provider || 'google';
            
            if (!apiKey) {
                throw new Error('API key not configured');
            }
            
            // Generate response using the AI module
            const response = await window.aiExtension.modules.ai.generateResponse(message, {
                apiKey,
                provider,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            
            return response;
            
        } catch (error) {
            console.error('❌ AI response error:', error);
            throw error;
        }
    }

    function addMessageToChat(type, content) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) {
            console.error('❌ Chat messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Format content
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
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(content) {
        if (!content) return '';
        
        // Basic HTML escaping and formatting
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    function updateCharCount(count) {
        const charCountElement = document.querySelector('.char-count');
        if (charCountElement) {
            charCountElement.textContent = `${count}/1000`;
            
            // Visual feedback for approaching limit
            if (count > 900) {
                charCountElement.style.color = '#ff6b6b';
            } else if (count > 800) {
                charCountElement.style.color = '#ffa726';
            } else {
                charCountElement.style.color = '#666';
            }
        }
    }

    function showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        
        typingDiv.appendChild(contentDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Show mascot thinking animation
        if (window.__mascot && typeof window.__mascot.showThinking === 'function') {
            window.__mascot.showThinking({ bubbleText: 'Thinking...', message: 'Processing your request' });
        }
    }

    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Hide mascot thinking animation
        if (window.__mascot && typeof window.__mascot.hideThinking === 'function') {
            window.__mascot.hideThinking();
        }
    }

    function showError(message) {
        console.error('🚨 Error:', message);
        
        // Create or update error notification
        let errorDiv = document.getElementById('error-notification');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-notification';
            errorDiv.className = 'error-notification';
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }

    function loadWelcomeMessage() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length === 0) {
            addMessageToChat('assistant', 'Hello! I\'m your AI assistant for Adobe After Effects. I can help you with expressions, animations, project organization, and creative guidance. What would you like to work on today?');
        }
    }

    async function checkAPIConfiguration() {
        const settings = window.aiExtension.state.settings;
        if (!settings.apiKey) {
            setTimeout(() => {
                showError('Please configure your API key in settings to start using AI features.');
            }, 2000);
        }
    }

    // ==========================================
    // UI ACTION HANDLERS
    // ==========================================

    function openSettings() {
        if (window.aiExtension.modules.settings) {
            window.aiExtension.modules.settings.openSettingsModal();
        } else {
            console.error('❌ Settings module not available');
        }
    }

    function openProjectOrganizer() {
        console.log('🗂️ Opening project organizer...');
        // Placeholder for project organizer functionality
        showError('Project organizer functionality will be available in the next update.');
    }

    function handleYouTubeAnalysis() {
        console.log('📺 YouTube analysis requested...');
        // Placeholder for YouTube analysis
        showError('YouTube analysis functionality will be available in the next update.');
    }

    function startTutorial() {
        console.log('📚 Starting tutorial...');
        // Placeholder for tutorial system
        showError('Tutorial system will be available in the next update.');
    }

    // ==========================================
    // MODULE SYSTEM
    // ==========================================

    function initializeSettings() {
        console.log('⚙️ Initializing settings...');
        // Settings will be handled by settings.js
        window.aiExtension.state.settings = {
            apiKey: localStorage.getItem('ai_api_key') || '',
            provider: localStorage.getItem('ai_provider') || 'google',
            model: localStorage.getItem('ai_model') || 'gemini-1.5-flash',
            temperature: parseFloat(localStorage.getItem('ai_temperature')) || 0.7,
            maxTokens: parseInt(localStorage.getItem('ai_max_tokens')) || 2048
        };
    }

    function initializeAI() {
        console.log('🤖 Initializing AI module...');
        // AI functionality will be handled by ai-module.js
        // This is just a placeholder registration
        window.aiExtension.modules.ai = {
            generateResponse: async function(message, options) {
                throw new Error('AI module not yet loaded');
            }
        };
    }

    function initializeStorage() {
        console.log('💾 Initializing storage...');
        // Storage functionality will be handled by storage.js
        window.aiExtension.modules.storage = {
            saveConversation: async function(data) {
                console.log('💾 Saving conversation:', data);
                // Placeholder implementation
            }
        };
    }

    // ==========================================
    // GLOBAL EXPORTS
    // ==========================================

    // Export essential functions to global scope for compatibility
    window.handleSendMessage = handleSendMessage;
    window.addMessageToChat = addMessageToChat;
    window.showError = showError;
    window.updateCharCount = updateCharCount;

    // ==========================================
    // INITIALIZATION TRIGGER
    // ==========================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
        initializeExtension();
    }

})();

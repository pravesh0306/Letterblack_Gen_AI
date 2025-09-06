/**
 * LetterBlack GenAI - Core Extension Logic
 * Consolidates: main.js, enhanced-main.js, ui-initializer.js, error-handler.js
 */

(function() {
    'use strict';
    
    // Global variables
    let projectOrganizer = null;
    let aiModule = null;
    let chatMemory = null;
    let settingsManager = null;
    let youtubeHelper = null;
    let projectContext = null;
    let fileUpload = null;
    let mascotAnimator = null;
    
    // Error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error || e.message);
        showError('An unexpected error occurred. Check console for details.');
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled rejection:', e.reason);
        showError('A background error occurred. Check console for details.');
    });
    
    // Initialize global objects for module dependencies
    if (!window.aiExtension) {
        window.aiExtension = {
            modules: {},
            state: {
                settings: {}
            },
            cache: new Map(),
            isInitialized: false
        };
    }
    
    // Bridge for main.js compatibility - link cepStorage to storageModule
    function initializeCepStorageBridge() {
        if (window.storageModule && !window.cepStorage) {
            window.cepStorage = {
                loadSettings: () => window.storageModule.loadSettings(),
                saveSettings: (settings) => window.storageModule.saveSettings(settings)
            };
            console.log('✅ CEP Storage bridge initialized');
        }
    }
    
    // Initialize bridge when storageModule becomes available
    const checkStorageModule = () => {
        if (window.storageModule) {
            initializeCepStorageBridge();
        } else {
            setTimeout(checkStorageModule, 50);
        }
    };
    checkStorageModule();
    
    // Utility functions
    function showError(message) {
        if (window.SimpleToast) {
            window.SimpleToast.show(message, 'error', 5000);
        } else {
            console.error(message);
            alert('Error: ' + message);
        }
    }
    
    function showSuccess(message) {
        if (window.SimpleToast) {
            window.SimpleToast.show(message, 'success', 3000);
        } else {
            console.log('Success: ' + message);
        }
    }
    
    // HTML sanitization
    const HtmlSanitizer = {
        escape(text) {
            if (typeof text !== 'string') return String(text || '');
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    };
    window.HtmlSanitizer = HtmlSanitizer;
    
    // Character count update
    function updateCharCount(count) {
        const charCountEl = document.querySelector('.char-count');
        if (charCountEl) {
            charCountEl.textContent = `${count}/1000`;
        }
    }
    
    // Scroll to bottom
    function scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
    }
    
    // Show/hide typing indicator
    function showTypingIndicator(message = 'AI is thinking...') {
        const indicator = document.querySelector('.typing-indicator') || createTypingIndicator();
        indicator.textContent = message;
        indicator.style.display = 'block';
    }
    
    function hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    function createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.style.cssText = `
            padding: 10px;
            color: #666;
            font-style: italic;
            text-align: center;
            display: none;
        `;
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.appendChild(indicator);
        }
        return indicator;
    }
    
    // Add message to chat
    function addMessageToChat(role, content, options = {}) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle markdown formatting
        if (content.includes('```') || content.includes('**') || content.includes('##')) {
            contentDiv.innerHTML = formatMarkdown(content);
        } else {
            contentDiv.textContent = content;
        }
        
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        timestampDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timestampDiv);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
    }
    
    // Basic markdown formatting
    function formatMarkdown(text) {
        let html = text;
        
        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block"><pre><code>${HtmlSanitizer.escape(code.trim())}</code></pre></div>`;
        });
        
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Headers
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        
        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    }
    
    // Generate fallback responses when AI isn't available
    function generateFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('expression') || lowerMessage.includes('animate')) {
            return `🎬 **Expression Help**

I'd love to help with expressions! Here are some common expressions:

**Position Animation:**
\`\`\`javascript
// Smooth bounce
[value[0], 500 + Math.sin(time * 2) * 50]
\`\`\`

**Rotation Wiggle:**
\`\`\`javascript
// Random rotation
wiggle(2, 30) // 2 times per second, ±30 degrees
\`\`\`

💡 **Next steps:** Configure your AI API key in Settings to unlock full AI assistance!`;
        }
        
        if (lowerMessage.includes('script') || lowerMessage.includes('automation')) {
            return `🤖 **Scripting Assistance**

Here's a basic After Effects script starter:

**Basic Layer Creation:**
\`\`\`javascript
// Create a new solid layer
var comp = app.project.activeItem;
var newSolid = comp.layers.addSolid([1, 0, 0], "Red Solid", comp.width, comp.height, 1);
\`\`\`

🔧 **For advanced help:** Set up your AI API key in the Settings tab!`;
        }
        
        return `👋 **Hello! I'm your After Effects AI Assistant**

I see you asked: "${userMessage}"

I'm ready to help with:
- 🎬 **Expressions & Animation**
- 🤖 **Scripts & Automation** 
- ✨ **Effects & Workflows**
- 📚 **Tutorials & Learning**

**To unlock full AI assistance:**
1. Click the ⚙️ **Settings** tab
2. Add your AI API key (Google Gemini, OpenAI, etc.)
3. Return here and ask me anything!

Ready when you are! 🚀`;
    }
    
    // Main message handler
    async function handleSendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Clear input and add to chat
        chatInput.value = '';
        document.getElementById('send-button').disabled = true;
        updateCharCount(0);
        
        // Add user message
        addMessageToChat('user', message);
        
        try {
            // Try to get AI response
            if (aiModule && typeof aiModule.generateResponse === 'function') {
                showTypingIndicator();
                
                const settings = settingsManager ? settingsManager.getSettings() : {};
                const response = await aiModule.generateResponse(message, {
                    apiKey: settings.apiKey,
                    provider: settings.provider || 'google',
                    model: settings.model,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens
                });
                
                hideTypingIndicator();
                
                if (response) {
                    addMessageToChat('assistant', response);
                } else {
                    addMessageToChat('assistant', generateFallbackResponse(message));
                }
            } else {
                // AI not available - use fallback
                addMessageToChat('assistant', generateFallbackResponse(message));
            }
        } catch (error) {
            hideTypingIndicator();
            console.error('Chat error:', error);
            addMessageToChat('assistant', generateFallbackResponse(message));
        }
    }
    
    // Initialize chat
    function initializeChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length === 0) {
            const welcomeMessage = `🎉 **Welcome to LetterBlack GenAI for After Effects!**

I'm your AI assistant ready to help with:
- 🎬 **Expressions & Animation Code**
- 🤖 **Scripts & Automation**
- ✨ **Effects & Visual Workflows**
- 📚 **Tutorial Analysis & Learning**

**🚀 Quick Start:**
- Type any After Effects question
- Upload images for analysis
- Ask for custom expressions or scripts

**⚙️ For full AI power:** Add your API key in Settings tab

Ready to supercharge your After Effects workflow? Ask me anything! 🎯`;
            
            addMessageToChat('assistant', welcomeMessage);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
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
                const value = e.target.value;
                sendButton.disabled = !value.trim();
                updateCharCount(value.length);
            });
        }
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = btn.getAttribute('data-tab');
                if (tabId) {
                    switchTab(tabId);
                }
            });
        });
    }
    
    // Tab switching
    function switchTab(tabId) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show target tab content
        const targetContent = document.getElementById(tabId + '-tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Load essential modules
    function loadModules() {
        // Initialize settings manager
        if (window.SimpleSettingsManager) {
            settingsManager = new window.SimpleSettingsManager();
            window.settingsManager = settingsManager;
        }
        
        // Initialize AI module
        if (window.AIModule) {
            aiModule = new window.AIModule();
            window.aiModule = aiModule;
        }
        
        // Initialize file upload
        if (window.SimpleFileUpload) {
            fileUpload = new window.SimpleFileUpload();
        }
    }
    
    // Main initialization
    function initialize() {
        try {
            loadModules();
            setupEventListeners();
            initializeChat();
            
            // Auto-focus chat input
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                setTimeout(() => chatInput.focus(), 100);
            }
            
            console.log('✅ LetterBlack GenAI initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize extension:', error);
            showError('Extension failed to load. Please refresh the panel.');
        }
    }
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Expose functions globally
    window.addMessageToChat = addMessageToChat;
    window.handleSendMessage = handleSendMessage;
    window.showError = showError;
    window.showSuccess = showSuccess;
    
})();

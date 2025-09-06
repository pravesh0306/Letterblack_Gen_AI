// Chat Response Test - Immediate Welcome Message
// Ensures users get an immediate response to test the chat system

(function() {
    'use strict';
    
    // Wait for page to load then show welcome
    function showInitialWelcome() {
        setTimeout(() => {
            // Check if chat is empty and show welcome
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages && chatMessages.children.length === 0) {
                addWelcomeMessage();
            }
        }, 1000);
    }
    
    function addWelcomeMessage() {
        const welcomeHTML = `
            <div class="message assistant">
                <div class="message-content">
                    <h3>🎉 Welcome to LetterBlack GenAI!</h3>
                    <p>I'm your AI assistant for After Effects. Here's what I can help with:</p>
                    <ul>
                        <li>🎬 <strong>Expressions & Animation:</strong> Custom code for your projects</li>
                        <li>🤖 <strong>Scripts & Automation:</strong> Streamline your workflow</li>
                        <li>✨ <strong>Effects & Visual Magic:</strong> Advanced techniques</li>
                        <li>📚 <strong>Learning & Tutorials:</strong> Step-by-step guidance</li>
                    </ul>
                    <div class="quick-actions">
                        <p><strong>🚀 Try these commands:</strong></p>
                        <button class="quick-cmd-btn" onclick="document.getElementById('chat-input').value='Create a bouncing ball animation'; document.getElementById('send-button').click();">
                            Create bouncing animation
                        </button>
                        <button class="quick-cmd-btn" onclick="document.getElementById('chat-input').value='Help me organize my layers'; document.getElementById('send-button').click();">
                            Organize layers
                        </button>
                        <button class="quick-cmd-btn" onclick="document.getElementById('chat-input').value='Explain wiggle expressions'; document.getElementById('send-button').click();">
                            Explain wiggle
                        </button>
                    </div>
                    <p><strong>⚙️ For advanced AI:</strong> Add your API key in Settings tab</p>
                    <p class="welcome-footer">Ready to supercharge your After Effects workflow? Ask me anything! 🎯</p>
                </div>
                <div class="message-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
        `;
        
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = welcomeHTML;
            
            // Add styles for quick action buttons
            if (!document.getElementById('quick-cmd-styles')) {
                const styles = document.createElement('style');
                styles.id = 'quick-cmd-styles';
                styles.textContent = `
                    .quick-actions {
                        margin: 15px 0;
                        padding: 12px;
                        background: rgba(0, 150, 255, 0.1);
                        border-radius: 8px;
                        border-left: 3px solid #0096ff;
                    }
                    .quick-cmd-btn {
                        display: inline-block;
                        margin: 4px 8px 4px 0;
                        padding: 6px 12px;
                        background: linear-gradient(135deg, #0096ff, #00d4ff);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                        box-shadow: 0 2px 4px rgba(0, 150, 255, 0.2);
                    }
                    .quick-cmd-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(0, 150, 255, 0.3);
                        background: linear-gradient(135deg, #0088e6, #00c4ef);
                    }
                    .quick-cmd-btn:active {
                        transform: translateY(0);
                        box-shadow: 0 2px 4px rgba(0, 150, 255, 0.2);
                    }
                    .welcome-footer {
                        margin-top: 15px;
                        font-weight: 600;
                        color: #0096ff;
                    }
                `;
                document.head.appendChild(styles);
            }
        }
    }
    
    // Auto-run welcome message
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showInitialWelcome);
    } else {
        showInitialWelcome();
    }
    
    // Make function available globally for testing
    window.showWelcomeMessage = addWelcomeMessage;
    
})();

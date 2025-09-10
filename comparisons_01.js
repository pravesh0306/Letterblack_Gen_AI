/**
 * AI Response Formatter - Fix for code block rendering
 * Add this to your main chat/AI module
 */

// Enhanced formatMessage function for AI responses
function formatAIResponse(response) {
    // First, process code blocks with proper syntax highlighting
    let formattedResponse = response.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const blockId = `ai-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const lang = language || 'javascript';
        
        // Determine code type and appropriate buttons
        let buttons = '';
        const codeType = determineCodeType(code, lang);
        
        switch (codeType) {
            case 'expression':
                buttons = `
                    <button class="code-btn copy-btn" onclick="window.simpleCopy('${blockId}')" title="Copy expression">
                        <i class="fa-solid fa-copy"></i> Copy
                    </button>
                    <button class="code-btn apply-btn" onclick="window.applyCode('${blockId}')" title="Apply to selected property">
                        <i class="fa-solid fa-play"></i> Apply
                    </button>
                `;
                break;
            case 'script':
                buttons = `
                    <button class="code-btn copy-btn" onclick="window.simpleCopy('${blockId}')" title="Copy script">
                        <i class="fa-solid fa-copy"></i> Copy
                    </button>
                    <button class="code-btn run-btn" onclick="window.runExtendScript('${blockId}')" title="Run script in AE">
                        <i class="fa-solid fa-play"></i> Run
                    </button>
                `;
                break;
            default:
                buttons = `
                    <button class="code-btn copy-btn" onclick="window.simpleCopy('${blockId}')" title="Copy code">
                        <i class="fa-solid fa-copy"></i> Copy
                    </button>
                `;
        }
        
        return `
            <div class="code-block-container" id="${blockId}">
                <div class="code-header">
                    <div class="code-language">
                        <span class="language-label">${lang.toUpperCase()}</span>
                        ${codeType !== 'generic' ? `<span class="code-type">${codeType}</span>` : ''}
                    </div>
                    <div class="code-actions">
                        ${buttons}
                    </div>
                </div>
                <div class="code-block">
                    <pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>
                </div>
            </div>
        `;
    });
    
    // Process inline code
    formattedResponse = formattedResponse.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Process basic markdown
    formattedResponse = formattedResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    return `<p>${formattedResponse}</p>`;
}

// Determine what type of code this is
function determineCodeType(code, language) {
    const lowerCode = code.toLowerCase();
    
    // Check for expressions (short, uses AE expression functions)
    const expressionKeywords = ['wiggle', 'linear', 'ease', 'time', 'value', 'transform', 'property'];
    if (expressionKeywords.some(keyword => lowerCode.includes(keyword)) && code.split('\n').length < 10) {
        return 'expression';
    }
    
    // Check for scripts (uses AE scripting objects)
    const scriptKeywords = ['app.project', 'comp.layers', 'addcomp', 'addsolid', 'addtext', 'compitem'];
    if (scriptKeywords.some(keyword => lowerCode.includes(keyword))) {
        return 'script';
    }
    
    return 'generic';
}

// Escape HTML function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Main function to add AI message with proper formatting
function addAIMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isUser) {
        // User messages are plain text
        messageContent.innerHTML = `<p>${escapeHtml(content)}</p>`;
    } else {
        // AI messages get full formatting
        messageContent.innerHTML = formatAIResponse(content);
    }
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Apply syntax highlighting if Prism is available
    if (window.Prism) {
        Prism.highlightAllUnder(messageDiv);
    }
}

// Hook into your AI response handler
// Replace your existing AI response display with this:
function handleAIResponse(response) {
    // Remove typing indicator if present
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // Add formatted AI response
    addAIMessage(response, false);
}

// Hook into your send message function
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addAIMessage(message, true);
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to AI (replace with your actual AI call)
    sendToAI(message).then(handleAIResponse);
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
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
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Export functions for global use
window.formatAIResponse = formatAIResponse;
window.addAIMessage = addAIMessage;
window.handleAIResponse = handleAIResponse;
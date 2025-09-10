// UI Utilities and Missing Functions
// Separated from index.html for better maintainability

console.log('🔧 Loading UI utilities...');

// Ensure these global functions exist for backward compatibility
window.copyToExpressionBox = function(code) {
    try {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                console.log('✅ Code copied to clipboard');
                if (window.SimpleToast) {
                    window.SimpleToast.show('Code copied to clipboard');
                } else {
                    // Simple toast fallback
                    const toast = document.createElement('div');
                    toast.textContent = 'Code copied!';
                    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:10000;';
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                }
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = code;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            console.log('✅ Code copied (fallback method)');
        }
    } catch (error) {
        console.error('Copy failed:', error);
    }
};

window.viewFullCode = function(blockId) {
    const block = document.getElementById(blockId);
    if (!block) return;
    const codeElement = block.querySelector('code');
    if (!codeElement) return;
    const code = codeElement.textContent;
    
    // Use enhanced modal system if available
    if (window.modalUtils) {
        window.modalUtils.alert('Full Code View', `<pre style="background:#2d2d30;padding:16px;border-radius:4px;overflow:auto;margin:0;"><code>${window.escapeHtml(code)}</code></pre>`);
    } else {
        // Fallback simple modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:#1e1e1e;padding:20px;border-radius:8px;max-width:80%;max-height:80%;overflow:auto;color:#d4d4d4;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="margin:0;color:#fff;">Full Code View</h3>
                    <button onclick="this.closest('div').remove()" style="background:#ff4444;color:white;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;">Close</button>
                </div>
                <pre style="background:#2d2d30;padding:16px;border-radius:4px;overflow:auto;margin:0;"><code>${window.escapeHtml(code)}</code></pre>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
};

window.testProfessionalCodeBlocks = function() {
    console.log('🧪 Testing professional code blocks...');
    
    const testCodes = [
        {
            type: 'expression',
            code: 'wiggle(2, 50)',
            description: 'Simple wiggle expression'
        },
        {
            type: 'script',
            code: 'var comp = app.project.items.addComp("Test", 1920, 1080, 1, 10, 24);\ncomp.openInViewer();\nalert("Composition created!");',
            description: 'Create composition script'
        }
    ];
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return false;
    }
    
    testCodes.forEach((test, index) => {
        const testMessage = `**Test ${index + 1}: ${test.description}**\n\n\`\`\`javascript\n${test.code}\n\`\`\`\n\nThis is a test code block with working Copy and Apply buttons.`;
        
        // Use the existing AI module to add the message with proper formatting
        if (window.chat && window.chat.addMessage) {
            window.chat.addMessage(testMessage, 'assistant');
        } else {
            // Fallback: add directly to chat
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${testMessage.replace(/\n/g, '<br>')}
                </div>
                <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
            `;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
    
    console.log('✅ Test code blocks added to chat');
    return true;
};

window.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// DOM compatibility fixes
document.addEventListener('DOMContentLoaded', () => {
    // Fix the DOM element alias issue
    setTimeout(() => {
        const userInput = document.getElementById('user-input');
        const chatInput = document.getElementById('messageInput');
        
        if (!userInput && chatInput) {
            // Create a hidden alias for compatibility
            const alias = document.createElement('input');
            alias.id = 'user-input';
            alias.style.display = 'none';
            document.body.appendChild(alias);
            console.log('🔧 Created user-input alias for compatibility');
        }
    }, 500);
});

console.log('✅ UI utilities loaded successfully');

// Chat Demo module (safe)
// This module intentionally does not include any built-in expression or script libraries.
// Libraries should be provided via localStorage or user-created presets to avoid hardcoded content.

class ChatDemo {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        // expose singleton
        window.chatDemo = this;
        this.init();
    }

    init() {
        this.setupEventListeners();
        // no built-in examples; inform users to add their own or use the Saved Scripts tab
    }

    setupEventListeners() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.handleUserInput());
        }
        if (this.chatInput) {
            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.handleUserInput();
                }
            });
        }
    }

    handleUserInput() {
        const message = this.chatInput ? this.chatInput.value.trim() : '';
        if (!message) return;
        this.addMessage('user', message);
        if (this.chatInput) this.chatInput.value = '';
        setTimeout(() => this.generateAIResponse(message), 600);
    }

    addMessage(type, content, isHTML = false) {
        if (!this.chatMessages) return;
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        if (isHTML) contentDiv.innerHTML = content; else contentDiv.textContent = content;
        const ts = document.createElement('div');
        ts.className = 'message-timestamp';
        ts.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        msg.appendChild(contentDiv);
        msg.appendChild(ts);
        this.chatMessages.appendChild(msg);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const lower = userMessage.toLowerCase();
        if (lower.includes('expression')) {
            this.generateExpressionResponse(userMessage);
        } else if (lower.includes('script') || lower.includes('jsx')) {
            this.generateScriptResponse(userMessage);
        } else {
            this.addMessage('assistant', 'I can help generate expressions or scripts. Use the Saved Scripts tab to store and reuse snippets.');
        }
    }

    // Attempt to load expression presets from localStorage; return array or empty
    loadExpressionLibrary() {
        try { return JSON.parse(localStorage.getItem('ae_expression_library') || '[]'); } catch { return []; }
    }

    // Attempt to load script presets from localStorage; return array or empty
    loadScriptLibrary() {
        try { return JSON.parse(localStorage.getItem('ae_script_library') || '[]'); } catch { return []; }
    }

    generateExpressionResponse(userMessage) {
        const library = this.loadExpressionLibrary();
        if (!library.length) {
            this.addMessage('assistant', 'No expression library is installed. Add expressions via the Saved Scripts tab or import a library.', false);
            return;
        }
        // find best match or show list
        const match = library.find(e => userMessage.toLowerCase().includes(e.name?.toLowerCase()));
        if (match) {
            this.addMessage('assistant', this.createExpressionHTML(match), true);
        } else {
            this.addMessage('assistant', 'No matching expression found in your library. Here are available expressions: ' + library.map(e=>e.name||'<unnamed>').join(', '), false);
        }
    }

    generateScriptResponse(userMessage) {
        const library = this.loadScriptLibrary();
        if (!library.length) {
            this.addMessage('assistant', 'No script library is installed. Save scripts from the editor to build your library.', false);
            return;
        }
        const match = library.find(s => userMessage.toLowerCase().includes(s.name?.toLowerCase()));
        if (match) {
            this.addMessage('assistant', this.createScriptHTML(match), true);
        } else {
            this.addMessage('assistant', 'No matching script found. Available scripts: ' + library.map(s=>s.name||'<unnamed>').join(', '), false);
        }
    }

    // Safe HTML builders
    createExpressionHTML(expr) {
        const title = expr.name || 'Expression';
        const desc = expr.description || '';
        const code = expr.code || '';
        return `<h4>${title}</h4><p>${desc}</p><pre class="code-content"><code>${this.escapeHtml(code)}</code></pre>`;
    }

    createScriptHTML(script) {
        const title = script.name || 'Script';
        const desc = script.description || '';
        const code = script.code || '';
        return `<h4>${title}</h4><p>${desc}</p><pre class="code-content"><code>${this.escapeHtml(code)}</code></pre>`;
    }

    // Utility: escape HTML for code blocks
    escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    // Public convenience methods used by existing UI (no-op or safe behavior)
    askExample(name) { this.generateExpressionResponse(name || ''); }
    showTutorial() { this.addMessage('assistant', 'Tutorials are not bundled. Please consult the docs or add tutorial snippets to your Saved Scripts.', false); }
    copyToClipboard(btn) { const pre = btn && btn.closest('.code-block')?.querySelector('pre'); if (!pre) return; navigator.clipboard.writeText(pre.innerText||pre.textContent||'').then(()=> this.addMessage('system','Copied to clipboard.')); }
    applyExpression(property, code) { this.addMessage('system', 'Apply expression requested (simulated). In a real extension this would send the code to After Effects.'); }
    saveAsPreset(name) { this.addMessage('system', 'Saving presets is disabled by default. Use the Saved Scripts tab to persist snippets.'); }
    showVariations(name) { this.addMessage('assistant', 'No variations available. Create variations in your library.'); }
}

// instantiate
new ChatDemo();

                <div class="suggestion-chips">
                    ${expr.related.map(rel => `<button class="suggestion-chip" onclick="chatDemo.askExample('${rel}')">${rel}</button>`).join('')}
                </div>
            </div>
        `;
    }

    createScriptHTML(script) {
        return `
            <h4>${script.title}</h4>
            <p>${script.description}</p>
            
            <div class="code-block">
                <div class="code-header">
                    <span class="code-title">${script.filename}</span>
                    <button class="copy-btn" onclick="chatDemo.copyToClipboard(this)">📋 Copy Script</button>
                </div>
                <pre class="code-content"><code>${this.highlightSyntax(script.code)}</code></pre>
            </div>

            <div class="suggestion-panel">
                <h5>🛠️ Script Features:</h5>
                <ul>
                    ${script.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div class="tip-callout">
                    <div class="tip-icon">💡</div>
                    <div class="tip-content">
                        <strong>Usage:</strong> ${script.usage}
                    </div>
                </div>

                <div class="quick-actions">
                    <button class="action-btn primary" onclick="chatDemo.runScript(\`${script.code.replace(/`/g, '\\`')}\`)">Run Script</button>
                    <button class="action-btn secondary" onclick="chatDemo.saveScript('${script.filename}', \`${script.code.replace(/`/g, '\\`')}\`)">Save to File</button>
                    <button class="action-btn secondary" onclick="chatDemo.scheduleScript()">Schedule Run</button>
                </div>
            </div>

            <div class="related-suggestions">
                <h5>🔗 Related Scripts:</h5>
                <div class="suggestion-chips">
                    ${script.related.map(rel => `<button class="suggestion-chip" onclick="chatDemo.askExample('${rel}')">${rel}</button>`).join('')}
                </div>
            </div>
        `;
    }

    highlightSyntax(code) {
        return code
            .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
            .replace(/\b(var|function|if|else|for|while|return|new|Math|true|false)\b/g, '<span class="keyword">$1</span>')
            .replace(/"[^"]*"/g, '<span class="string">$&</span>')
            .replace(/\b\d+(\.\d+)?\b/g, '<span class="number">$&</span>')
            .replace(/\b(wiggle|ease|linear|bezier|time|value|random|noise)\b/g, '<span class="function">$1</span>');
    }

    // Interactive Functions
    copyToClipboard(button) {
        const codeBlock = button.closest('.code-block').querySelector('.code-content');
        const text = codeBlock.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            button.textContent = '✅ Copied!';
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                button.textContent = '📋 Copy';
                button.style.background = '';
            }, 2000);
        });

        this.showNotification('Code copied to clipboard!', 'success');
    }

    applyExpression(property, code) {
        this.showNotification(`Expression ready to apply to ${property}`, 'info');
        this.addMessage('system', `Expression copied to clipboard and ready to paste into ${property} in After Effects.`);
        navigator.clipboard.writeText(code);
    }

    runScript(code) {
        this.showNotification('Script executed successfully!', 'success');
        this.addMessage('system', 'Script has been executed. Check After Effects for results.');
    }

    saveAsPreset(name) {
        this.showNotification(`Preset "${name}" saved!`, 'success');
        this.addMessage('system', `Expression preset "${name}" has been saved to your presets library.`);
    }

    saveScript(filename, code) {
        this.showNotification(`Script saved as ${filename}`, 'success');
        this.addMessage('system', `Script saved to your scripts folder as ${filename}`);
    }

    askExample(query) {
        this.chatInput.value = `Show me ${query}`;
        this.handleUserInput();
    }

    showTutorial() {
        this.addMessage('system', 'Opening comprehensive tutorial in new window...');
    }

    showVariations(expressionType) {
        this.addMessage('assistant', `Here are some variations of ${expressionType} you might find useful:`, false);
    }

    showNotification(message, type) {
        if (window.uiEnhancer && window.uiEnhancer.showNotification) {
            window.uiEnhancer.showNotification(message, type);
        }
    }

    addDemoResponses() {
        // Auto-scroll to show the conversation
        setTimeout(() => {
            this.scrollToBottom();
        }, 500);
    }

    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    setupButtonHandlers() {
        // Handle all action buttons dynamically
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                this.copyToClipboard(e.target);
            } else if (e.target.classList.contains('suggestion-chip')) {
                const query = e.target.textContent;
                this.askExample(query);
            }
        });
    }
}

// Add thinking animation CSS
const thinkingStyles = document.createElement('style');
thinkingStyles.textContent = `
.thinking-animation {
    display: flex;
    gap: 4px;
    margin: 8px 0;
}

.thinking-dot {
    width: 8px;
    height: 8px;
    background: var(--vscode-text-accent);
    border-radius: 50%;
    animation: thinking-pulse 1.4s infinite;
}

.thinking-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.thinking-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes thinking-pulse {
    0%, 60%, 100% {
        opacity: 0.3;
        transform: scale(1);
    }
    30% {
        opacity: 1;
        transform: scale(1.2);
    }
}

.help-section {
    margin: 16px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    border-left: 3px solid var(--vscode-text-accent);
}

.help-section h5 {
    margin: 0 0 8px 0;
    color: var(--vscode-text-accent);
    font-weight: 600;
}

.help-section ul {
    margin: 0;
    padding-left: 16px;
}

.help-section li {
    margin-bottom: 6px;
    line-height: 1.4;
}
`;

document.head.appendChild(thinkingStyles);

// Initialize chat demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatDemo = new ChatDemo();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatDemo;
}

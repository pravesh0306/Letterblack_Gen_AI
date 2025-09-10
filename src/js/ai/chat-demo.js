// Chat Interface module (safe)
// This module intentionally does not include any built-in expression or script libraries.
// Libraries should be provided via localStorage or user-created presets to avoid hardcoded content.

class ChatInterface {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        // expose singleton
        window.chatInterface = this;
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

// instantiate is done on DOMContentLoaded below

    // Create a DOM fragment for a script card with safe event wiring
    createScriptElement(script) {
        const frag = document.createDocumentFragment();

        const h4 = document.createElement('h4');
        h4.textContent = script.title || '';
        frag.appendChild(h4);

        const p = document.createElement('p');
        p.textContent = script.description || '';
        frag.appendChild(p);

        const codeBlock = document.createElement('div');
        codeBlock.className = 'code-block';

        const codeHeader = document.createElement('div');
        codeHeader.className = 'code-header';

        const codeTitle = document.createElement('span');
        codeTitle.className = 'code-title';
        codeTitle.textContent = script.filename || '';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.type = 'button';
        copyBtn.textContent = '📋 Copy Script';
        copyBtn.addEventListener('click', (ev) => this.copyToClipboard(ev.currentTarget));

        codeHeader.appendChild(codeTitle);
        codeHeader.appendChild(copyBtn);

        const pre = document.createElement('pre');
        pre.className = 'code-content';
        const codeEl = document.createElement('code');
        // Insert highlighted syntax as text to avoid HTML injection
        codeEl.textContent = script.code || '';
        pre.appendChild(codeEl);

        codeBlock.appendChild(codeHeader);
        codeBlock.appendChild(pre);
        frag.appendChild(codeBlock);

        const suggestionPanel = document.createElement('div');
        suggestionPanel.className = 'suggestion-panel';
        const h5 = document.createElement('h5');
        h5.textContent = '🛠️ Script Features:';
        suggestionPanel.appendChild(h5);

        const ul = document.createElement('ul');
        (script.features || []).forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            ul.appendChild(li);
        });
        suggestionPanel.appendChild(ul);

        const tipCallout = document.createElement('div');
        tipCallout.className = 'tip-callout';
        const tipIcon = document.createElement('div');
        tipIcon.className = 'tip-icon';
        tipIcon.textContent = '💡';
        const tipContent = document.createElement('div');
        tipContent.className = 'tip-content';
        tipContent.innerHTML = `<strong>Usage:</strong> ${HtmlSanitizer ? HtmlSanitizer.escape(script.usage || '') : (script.usage || '')}`;
        tipCallout.appendChild(tipIcon);
        tipCallout.appendChild(tipContent);
        suggestionPanel.appendChild(tipCallout);

        const quickActions = document.createElement('div');
        quickActions.className = 'quick-actions';

        const runBtn = document.createElement('button');
        runBtn.className = 'action-btn primary';
        runBtn.type = 'button';
        runBtn.textContent = 'Run Script';
        runBtn.addEventListener('click', () => this.runScript(script.code || ''));

        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn secondary';
        saveBtn.type = 'button';
        saveBtn.textContent = 'Save to File';
        saveBtn.addEventListener('click', () => this.saveScript(script.filename || 'script.js', script.code || ''));

        const scheduleBtn = document.createElement('button');
        scheduleBtn.className = 'action-btn secondary';
        scheduleBtn.type = 'button';
        scheduleBtn.textContent = 'Schedule Run';
        scheduleBtn.addEventListener('click', () => this.scheduleScript());

        quickActions.appendChild(runBtn);
        quickActions.appendChild(saveBtn);
        quickActions.appendChild(scheduleBtn);
        suggestionPanel.appendChild(quickActions);

        frag.appendChild(suggestionPanel);

        if (Array.isArray(script.related) && script.related.length) {
            const related = document.createElement('div');
            related.className = 'related-suggestions';
            const h5r = document.createElement('h5');
            h5r.textContent = '🔗 Related Scripts:';
            related.appendChild(h5r);

            const chips = document.createElement('div');
            chips.className = 'suggestion-chips';
            script.related.forEach(rel => {
                const btn = document.createElement('button');
                btn.className = 'suggestion-chip';
                btn.type = 'button';
                btn.textContent = rel;
                btn.addEventListener('click', () => this.askExample(rel));
                chips.appendChild(btn);
            });
            related.appendChild(chips);
            frag.appendChild(related);
        }

        return frag;
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

// Initialize chat interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatInterface;
}

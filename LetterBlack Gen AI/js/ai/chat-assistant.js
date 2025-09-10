/**
 * Chat Assistant - Code Block Rendering & Apply-to-AE Bridge
 * Handles markdown processing and code block interactions
 */

class ChatAssistant {
    constructor() {
        this.csInterface = null;
        this.initializeCSInterface();
        this.setupGlobalClickHandler();
        this.logger.debug('🤖 Chat Assistant initialized');
    }

    /**
     * Initialize CSInterface for After Effects communication
     */
    initializeCSInterface() {
        if (typeof CSInterface !== 'undefined') {
            this.csInterface = new CSInterface();
            this.logger.debug('🔌 CSInterface connected for AE communication');
        } else {
            this.logger.warn('⚠️ CSInterface not available - AE features will be limited');
        }
    }

    /**
     * Process markdown text with enhanced code block rendering
     */
    processMarkdown(text) {
        // 0) Fast exit
        if (!text || typeof text !== 'string') return '';

        // 1) Extract fenced code blocks (```lang\r?\n...``` or ~~~lang\r?\n...~~~)
        //    - lang: anything until newline (supports "c++", "json5", "bash-session", etc.)
        //    - newline: \r?\n (handles Windows + Unix)
        const FENCE = /(```|~~~)([^\r\n]*)\r?\n([\s\S]*?)(?:\1)\s*/g;

        const blocks = [];
        let i = 0;
        const SENTRY = '\u241E'; // record separator char as unique placeholder

        const stripped = text.replace(FENCE, (_, fence, lang, body) => {
            const language = String(lang || '').trim().toLowerCase();
            blocks.push({ language, code: body });
            return `${SENTRY}${i++}${SENTRY}`;
        });

        // 2) Escape HTML safely for the remaining (non-code) text
        const escapeHtml = (s) => {
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        };

        // 3) Lightweight inline markdown (bold, italics, inline code)
        //    NOTE: We already pulled fenced blocks out, so this won't touch them.
        let html = escapeHtml(stripped)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+?)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
            .replace(/\r?\n/g, '<br>');

        // 4) Rehydrate fenced code blocks into styled HTML your CSS expects
        const build = ({ language, code }) => {
            const safe = escapeHtml(code);
            const langClass = language ? `language-${language}` : '';
            return `
              <div class="code-block-container">
                <div class="code-toolbar">
                  <span class="code-lang">${language || 'code'}</span>
                  <div class="code-actions">
                    <button class="code-btn copy" data-action="copy">Copy</button>
                    <button class="code-btn save" data-action="save">Save</button>
                    <button class="code-btn apply" data-action="apply">Apply</button>
                  </div>
                </div>
                <pre class="code-block"><code class="${langClass}">${safe}</code></pre>
                <div class="code-feedback" aria-live="polite"></div>
              </div>
            `;
        };

        html = html.replace(new RegExp(`${SENTRY}(\\d+)${SENTRY}`, 'g'), (_, n) => build(blocks[Number(n)]));

        // Optional: console signal for verification
        if (window.__md_debug) this.logger.debug('[MD] fenced blocks:', blocks.length);

        return html;
    }

    /**
     * Setup global click handler for code block actions
     */
    setupGlobalClickHandler() {
        document.addEventListener('click', async (e) => {
            // Handle language toggle
            if (e.target.closest('.code-lang.clickable')) {
                this.handleLanguageToggle(e);
                return;
            }

            const btn = e.target.closest('.code-btn');
            if (!btn) return;

            const container = btn.closest('.code-block-container');
            const codeEl = container?.querySelector('pre.code-block > code');
            const feedback = container?.querySelector('.code-feedback');
            if (!codeEl) return;

            const raw = codeEl.dataset.rawCode || codeEl.textContent;
            const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
            const langHint = langClass ? langClass.replace('language-', '') : '';

            const flash = (msg, isError = false) => {
                if (!feedback) return;
                feedback.innerHTML = msg;
                feedback.className = `code-feedback ${isError ? 'error' : 'success'}`;
                feedback.style.display = 'flex';
                setTimeout(() => {
                    feedback.style.display = 'none';
                    feedback.innerHTML = '';
                }, 3000);
            };

            const action = btn.dataset.action;
            try {
                if (action === 'copy') {
                    await navigator.clipboard.writeText(raw);
                    flash('<i class="fas fa-check"></i> Copied to clipboard');
                } else if (action === 'save') {
                    this.saveCode(raw, langHint);
                    flash('<i class="fas fa-check"></i> Saved to library');
                } else if (action === 'apply') {
                    // Set global event for feedback access
                    window.currentEvent = e;
                    await this.applyCodeToAE(raw, langHint);
                    window.currentEvent = null;
                }
            } catch (err) {
                this.logger.error('Code action failed:', err);
                flash(`<i class="fas fa-exclamation-triangle"></i> ${action} failed: ${err.message}`, true);
            }
        });
    }

    /**
     * Detect code type for proper handling
     */
    detectCodeType(raw, langHint = '') {
        const lang = (langHint || '').toLowerCase();
        if (['jsx', 'extendscript', 'jsxbin'].includes(lang)) return 'jsx';
        if (['js', 'javascript'].includes(lang)) {
            if (/app\./.test(raw) || /CompItem|Layer|Property/.test(raw)) return 'jsx';
            return 'js';
        }
        if (['expr', 'expression', 'aeexp', 'aftereffects-expression'].includes(lang)) return 'expression';

        const looksLikeExpression =
            !/^\s*\(function|\bfunction\b|\bapp\./m.test(raw) &&
            /(time|value|ease|linear|wiggle|seedRandom|posterizeTime)\b/.test(raw) &&
            !/;\s*\}/.test(raw);

        if (looksLikeExpression) return 'expression';
        if (/\bapp\.project\b|\bapp\.beginUndoGroup\b|\$\.writeln\b/.test(raw)) return 'jsx';
        return 'expression';
    }

    /**
     * Apply code to After Effects with enhanced feedback
     */
    async applyCodeToAE(raw, langHint = '') {
        const event = window.currentEvent;
        const feedback = event?.target?.closest('.code-block-container')?.querySelector('.code-feedback');
        
        const showFeedback = (msg, isError = false) => {
            if (feedback) {
                feedback.innerHTML = msg;
                feedback.className = `code-feedback ${isError ? 'error' : 'success'}`;
                feedback.style.display = 'flex';
            }
        };

        try {
            const type = this.detectCodeType(raw, langHint);
            showFeedback('🔄 Executing in After Effects...', false);

            if (!this.csInterface) {
                const msg = '⚠️ CSInterface not available — cannot apply code to After Effects.';
                showFeedback(msg, true);
                return;
            }

            // Enhanced JSX for expressions with better error handling
            const jsxApplyExpression = `
                (function(){
                    function createResult(success, message, count) {
                        return JSON.stringify({
                            success: success,
                            message: message,
                            count: count || 0,
                            type: 'expression'
                        });
                    }
                    
                    try {
                        if (!app.project) {
                            return createResult(false, "❌ Error: Open a project first. Create a new project or open an existing one.", 0);
                        }
                        
                        var item = app.project.activeItem;
                        if (!(item && item instanceof CompItem)) {
                            return createResult(false, "❌ Error: Activate a composition. Double-click a comp in Project panel or create a new one.", 0);
                        }
                        
                        var sel = item.selectedProperties;
                        if (!sel || sel.length === 0) {
                            return createResult(false, "❌ Error: Select 1+ properties first. Click a property name (Position, Scale, etc.) in the Timeline panel, then try Apply.", 0);
                        }
                        
                        app.beginUndoGroup("Apply Expression from AI Assistant");
                        
                        var expr = ${JSON.stringify(raw)};
                        var applied = 0;
                        var errors = [];
                        
                        for (var i = 0; i < sel.length; i++) {
                            var p = sel[i];
                            try {
                                if (p && p.canSetExpression !== false) {
                                    p.expression = expr;
                                    applied++;
                                } else {
                                    errors.push("Property " + (i+1) + " cannot have expressions");
                                }
                            } catch(propError) {
                                errors.push("Property " + (i+1) + ": " + propError.toString());
                            }
                        }
                        
                        app.endUndoGroup();
                        
                        if (applied > 0) {
                            var msg = "✅ Applied expression to " + applied + " properties.";
                            if (errors.length > 0) {
                                msg += " Warnings: " + errors.join(", ");
                            }
                            return createResult(true, msg, applied);
                        } else {
                            return createResult(false, "❌ Error: Could not apply to any properties. " + errors.join(", "), 0);
                        }
                        
                    } catch(e) {
                        app.endUndoGroup();
                        return createResult(false, "❌ Error: " + e.toString(), 0);
                    }
                })();`;

            // Enhanced JSX for scripts
            const jsxRunScript = `
                (function(){
                    function createResult(success, message, result) {
                        return JSON.stringify({
                            success: success,
                            message: message,
                            result: result,
                            type: 'script'
                        });
                    }
                    
                    app.beginUndoGroup("Run Script from AI Assistant");
                    try {
                        var __RESULT__ = (function(){ ${raw} })();
                        app.endUndoGroup();
                        
                        var resultStr = (typeof __RESULT__ !== "undefined") ? String(__RESULT__) : "undefined";
                        var msg = "✅ Script executed successfully.";
                        if (resultStr !== "undefined") {
                            msg += " Result: " + resultStr;
                        }
                        
                        return createResult(true, msg, __RESULT__);
                    } catch(e) {
                        app.endUndoGroup();
                        return createResult(false, "❌ Script Error: " + e.toString(), null);
                    }
                })();`;

            const jsxPayload = (type === 'jsx') ? jsxRunScript : jsxApplyExpression;

            await new Promise((resolve) => {
                this.csInterface.evalScript(jsxPayload, (ret) => {
                    try {
                        this.logger.debug('[AE APPLY] Raw response:', ret);
                        
                        // Try to parse JSON response
                        let result;
                        try {
                            result = JSON.parse(ret);
                        } catch (parseError) {
                            // Fallback for non-JSON responses
                            result = {
                                success: !ret.includes('Error:') && !ret.includes('❌'),
                                message: ret || '✅ Code executed',
                                type: 'unknown'
                            };
                        }
                        
                        showFeedback(result.message, !result.success);
                        
                        // Auto-save successful scripts
                        if (result.success && type === 'jsx') {
                            this.autoSaveScript(raw, result);
                        }
                        
                    } catch (error) {
                        this.logger.error('Error processing AE response:', error);
                        showFeedback('❌ Error: Failed to process After Effects response.', true);
                    }
                    
                    resolve();
                });
            });

        } catch (err) {
            this.logger.error('Apply failed', err);
            showFeedback(`❌ Apply failed: ${err.message}`, true);
        }
    }

    /**
     * Apply syntax highlighting to code blocks
     */
    applySyntaxHighlighting() {
        try {
            if (window.Prism) {
                // Highlight all new code blocks
                window.Prism.highlightAll();
                this.logger.debug('🎨 Syntax highlighting applied');
            } else {
                this.logger.warn('⚠️ Prism.js not available for syntax highlighting');
            }
        } catch (err) {
            this.logger.warn('Syntax highlighting failed:', err);
        }
    }

    /**
     * Handle language toggle between expression and jsx
     */
    handleLanguageToggle(e) {
        const langEl = e.target.closest('.code-lang');
        const currentType = langEl.dataset.currentType;
        const newType = currentType === 'expression' ? 'jsx' : 'expression';
        
        // Update display
        const displayName = newType === 'jsx' ? 'JSX Script' : 'Expression';
        langEl.innerHTML = `${displayName} <i class="fas fa-sync-alt" style="font-size: 10px; opacity: 0.7; margin-left: 4px;"></i>`;
        langEl.dataset.currentType = newType;
        
        // Update code element class
        const container = langEl.closest('.code-block-container');
        const codeEl = container?.querySelector('code');
        if (codeEl) {
            // Remove old language classes
            codeEl.className = codeEl.className.replace(/language-\w+/g, '');
            // Add new language class
            codeEl.className += ` language-${newType}`;
            codeEl.className = codeEl.className.trim();
        }
        
        // Re-apply syntax highlighting
        setTimeout(() => {
            this.applySyntaxHighlighting();
        }, 50);
        
        // Visual feedback
        langEl.style.animation = 'none';
        setTimeout(() => {
            langEl.style.animation = 'pulse 0.3s ease';
        }, 10);
        
        this.logger.debug(`🔄 Language toggled: ${currentType} → ${newType}`);
    }

    /**
     * Auto-save successful scripts
     */
    autoSaveScript(code, result) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const scriptName = `ai_generated_${timestamp}`;
            
            const scriptData = {
                name: scriptName,
                code: code,
                type: result.type || 'jsx',
                timestamp: new Date().toISOString(),
                result: result.message,
                success: result.success
            };
            
            // Save to localStorage history
            const history = JSON.parse(localStorage.getItem('ae_script_history') || '[]');
            history.unshift(scriptData);
            
            // Keep only last 50 scripts
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem('ae_script_history', JSON.stringify(history));
            
            this.logger.debug('📄 Auto-saved script:', scriptName);
            
        } catch (err) {
            this.logger.warn('Failed to auto-save script:', err);
        }
    }

    /**
     * Save code to library
     */
    saveCode(raw, langHint = '') {
        try {
            // Integration with existing saved scripts functionality
            if (window.savedScripts && typeof window.savedScripts.saveScript === 'function') {
                const type = this.detectCodeType(raw, langHint);
                const name = `${type}_${Date.now()}`;
                window.savedScripts.saveScript(name, raw, type);
            } else {
                // Fallback to localStorage
                const type = this.detectCodeType(raw, langHint);
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const scriptName = `saved_${type}_${timestamp}`;
                
                const savedScripts = JSON.parse(localStorage.getItem('ae_saved_scripts') || '[]');
                savedScripts.unshift({
                    name: scriptName,
                    code: raw,
                    type: type,
                    timestamp: new Date().toISOString(),
                    source: 'chat_assistant'
                });
                
                // Keep only last 100 saved scripts
                if (savedScripts.length > 100) {
                    savedScripts.splice(100);
                }
                
                localStorage.setItem('ae_saved_scripts', JSON.stringify(savedScripts));
                this.logger.debug('💾 Saved script:', scriptName);
            }
        } catch (err) {
            this.logger.error('Save failed:', err);
        }
    }

    /**
     * Get script history
     */
    getScriptHistory() {
        try {
            return JSON.parse(localStorage.getItem('ae_script_history') || '[]');
        } catch (err) {
            this.logger.warn('Failed to load script history:', err);
            return [];
        }
    }

    /**
     * Get saved scripts
     */
    getSavedScripts() {
        try {
            return JSON.parse(localStorage.getItem('ae_saved_scripts') || '[]');
        } catch (err) {
            this.logger.warn('Failed to load saved scripts:', err);
            return [];
        }
    }

    /**
     * Debug method to test code block rendering
     */
    testCodeBlockRendering() {
        const testMarkdown = `
Here's a simple expression:

\`\`\`expression
wiggle(2, 50)
\`\`\`

And here's a JSX script:

\`\`\`jsx
app.project.items.addComp("Test", 1920, 1080, 1, 5, 24).openInViewer();
\`\`\`

Regular **bold** and *italic* text should also work.
        `.trim();

        this.logger.debug('🧪 Testing code block rendering...');
        const result = this.processMarkdown(testMarkdown);
        
        // Create a test container
        const testDiv = document.createElement('div');
        testDiv.innerHTML = result;
        testDiv.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: #1e1e1e;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 16px;
            z-index: 10000;
            color: #d4d4d4;
        `;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Close Test';
        closeBtn.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: #ff4444;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => testDiv.remove();
        testDiv.appendChild(closeBtn);
        
        document.body.appendChild(testDiv);
        
        // Apply highlighting
        setTimeout(() => this.applySyntaxHighlighting(), 200);
        
        this.logger.debug('✅ Test container added to page');
        return testDiv;
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    window.ChatAssistant = ChatAssistant;
    
    // Auto-initialize if not already done
    if (!window.chatAssistant) {
        window.chatAssistant = new ChatAssistant();
        window.assistant = window.chatAssistant; // Alternative reference
    }

    // Expose test methods globally for console testing
    window.testCodeBlocks = () => window.chatAssistant.testCodeBlockRendering();
    window.getChatAssistantStatus = () => {
        const assistant = window.chatAssistant;
        return {
            initialized: !!assistant,
            csInterface: !!assistant?.csInterface,
            prismAvailable: !!window.Prism,
            scriptHistory: assistant?.getScriptHistory()?.length || 0,
            savedScripts: assistant?.getSavedScripts()?.length || 0
        };
    };

    this.logger.debug('🤖 Chat Assistant initialized');
    this.logger.debug('💡 Test commands: testCodeBlocks(), getChatAssistantStatus()');
}

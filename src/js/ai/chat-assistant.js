/**
 * Chat Assistant - Code Block Rendering & Apply-to-AE Bridge
 * Handles markdown processing and code block interactions
 */

class ChatAssistant {
    constructor() {
        this.csInterface = null;
        this.initializeCSInterface();
        this.setupGlobalClickHandler();
        console.log('🤖 Chat Assistant initialized');
    }

    /**
     * Initialize CSInterface for After Effects communication
     */
    initializeCSInterface() {
        if (typeof CSInterface !== 'undefined') {
            this.csInterface = new CSInterface();
            console.log('🔌 CSInterface connected for AE communication');
        } else {
            console.warn('⚠️ CSInterface not available - AE features will be limited');
        }
    }

    /**
     * Process markdown text with enhanced code block rendering
     */
    processMarkdown(text) {
        // 1) Extract fenced code blocks first: ```lang\n...```
        const FENCE = /```(\w+)?\n([\s\S]*?)```/g;
        const codeBlocks = [];
        let idx = 0;

        const withoutBlocks = text.replace(FENCE, (_, lang, code) => {
            const language = (lang || '').trim().toLowerCase();
            codeBlocks.push({ language, code });
            return `§§CODEBLOCK_${idx++}§§`;
        });

        const escapeHtml = (s) => {
            const div = document.createElement('div');
            div.textContent = s;
            return div.innerHTML;
        };

        let html = escapeHtml(withoutBlocks)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+?)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
            .replace(/\n/g, '<br>');

        const buildCodeBlockHTML = ({ language, code }) => {
            const safe = escapeHtml(code);
            const langClass = language ? `language-${language}` : '';
            const blockId = `code-block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const detectedType = this.detectCodeType(code, language);
            
            return `
                <div class="code-block-container" data-block-id="${blockId}">
                    <div class="code-toolbar">
                        <span class="code-lang clickable" data-current-type="${detectedType}" data-block-id="${blockId}" title="Click to toggle between Expression/JSX">
                            ${language || detectedType} 
                            <i class="fas fa-sync-alt" style="font-size: 10px; opacity: 0.7; margin-left: 4px;"></i>
                        </span>
                        <div class="code-actions">
                            <button class="code-btn copy" data-action="copy">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                            <button class="code-btn save" data-action="save">
                                <i class="fas fa-save"></i> Save
                            </button>
                            <button class="code-btn apply" data-action="apply">
                                <i class="fas fa-play"></i> Apply
                            </button>
                        </div>
                    </div>
                    <pre class="code-block"><code class="${langClass}" data-raw-code="${escapeHtml(code).replace(/"/g, '&quot;')}">${safe}</code></pre>
                    <div class="code-feedback" aria-live="polite"></div>
                </div>
            `;
        };

        html = html.replace(/§§CODEBLOCK_(\d+)§§/g, (_, i) => buildCodeBlockHTML(codeBlocks[Number(i)]));

        // Apply syntax highlighting after DOM insertion
        setTimeout(() => {
            if (window.Prism) {
                window.Prism.highlightAll();
            }
        }, 100);

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
                console.error('Code action failed:', err);
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
                            return createResult(false, "❌ Error: Open a project first.", 0);
                        }
                        
                        var item = app.project.activeItem;
                        if (!(item && item instanceof CompItem)) {
                            return createResult(false, "❌ Error: Activate a composition.", 0);
                        }
                        
                        var sel = item.selectedProperties;
                        if (!sel || sel.length === 0) {
                            return createResult(false, "❌ Error: Select 1+ properties to apply the expression.", 0);
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
                        console.log('[AE APPLY] Raw response:', ret);
                        
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
                        console.error('Error processing AE response:', error);
                        showFeedback('❌ Error: Failed to process After Effects response.', true);
                    }
                    
                    resolve();
                });
            });

        } catch (err) {
            console.error('Apply failed', err);
            showFeedback(`❌ Apply failed: ${err.message}`, true);
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
        langEl.textContent = newType === 'jsx' ? 'JSX Script' : 'Expression';
        langEl.innerHTML += ' <i class="fas fa-sync-alt" style="font-size: 10px; opacity: 0.7; margin-left: 4px;"></i>';
        langEl.dataset.currentType = newType;
        
        // Update code element class
        const container = langEl.closest('.code-block-container');
        const codeEl = container?.querySelector('code');
        if (codeEl) {
            codeEl.className = `language-${newType}`;
        }
        
        // Visual feedback
        langEl.style.animation = 'none';
        setTimeout(() => {
            langEl.style.animation = 'pulse 0.3s ease';
        }, 10);
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
            
            console.log('📄 Auto-saved script:', scriptName);
            
        } catch (err) {
            console.warn('Failed to auto-save script:', err);
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
                console.log('💾 Saved script:', scriptName);
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    }

    /**
     * Get script history
     */
    getScriptHistory() {
        try {
            return JSON.parse(localStorage.getItem('ae_script_history') || '[]');
        } catch (err) {
            console.warn('Failed to load script history:', err);
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
            console.warn('Failed to load saved scripts:', err);
            return [];
        }
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
}

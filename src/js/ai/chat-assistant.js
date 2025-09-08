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

        html = html.replace(/§§CODEBLOCK_(\d+)§§/g, (_, i) => buildCodeBlockHTML(codeBlocks[Number(i)]));

        return html;
    }

    /**
     * Setup global click handler for code block actions
     */
    setupGlobalClickHandler() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.code-btn');
            if (!btn) return;

            const container = btn.closest('.code-block-container');
            const codeEl = container?.querySelector('pre.code-block > code');
            const feedback = container?.querySelector('.code-feedback');
            if (!codeEl) return;

            const raw = codeEl.textContent;
            const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-'));
            const langHint = langClass ? langClass.replace('language-', '') : '';

            const flash = (msg) => {
                if (!feedback) return;
                feedback.textContent = msg;
                setTimeout(() => (feedback.textContent = ''), 1500);
            };

            const action = btn.dataset.action;
            try {
                if (action === 'copy') {
                    await navigator.clipboard.writeText(raw);
                    flash('Copied');
                } else if (action === 'save') {
                    // Integrate with existing save functionality
                    this.saveCode(raw, langHint);
                    flash('Saved');
                } else if (action === 'apply') {
                    await this.applyCodeToAE(raw, langHint);
                    flash('Applied');
                }
            } catch (err) {
                console.error('Code action failed:', err);
                flash('Action failed');
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
     * Apply code to After Effects
     */
    async applyCodeToAE(raw, langHint = '') {
        try {
            const type = this.detectCodeType(raw, langHint);

            if (!this.csInterface) {
                alert('⚠️ CSInterface not available — cannot apply code to After Effects.');
                return;
            }

            const jsxApplyExpression = `
                (function(){
                    function err(msg){ alert(msg); return "ERROR: " + msg; }
                    if (!app.project) return err("Open a project first.");
                    var item = app.project.activeItem;
                    if (!(item && item instanceof CompItem)) return err("Activate a composition.");
                    var sel = item.selectedProperties;
                    if (!sel || sel.length === 0) return err("Select 1+ properties to apply the expression.");
                    app.beginUndoGroup("Apply Expression from Assistant");
                    try {
                        var expr = ${JSON.stringify(raw)};
                        var applied = 0;
                        for (var i = 0; i < sel.length; i++) {
                            var p = sel[i];
                            if (p && p.canSetExpression !== false) {
                                p.expression = expr;
                                applied++;
                            }
                        }
                        app.endUndoGroup();
                        return "OK: Applied expression to " + applied + " properties.";
                    } catch(e) {
                        app.endUndoGroup();
                        return "ERROR: " + e.toString();
                    }
                })();`;

            const jsxRunScript = `
                (function(){
                    app.beginUndoGroup("Run Script from Assistant");
                    try {
                        var __RESULT__ = (function(){ ${raw} })();
                        app.endUndoGroup();
                        return "OK: Script executed" + (typeof __RESULT__ !== "undefined" ? ("; result: " + __RESULT__) : ".");
                    } catch(e) {
                        app.endUndoGroup();
                        return "ERROR: " + e.toString();
                    }
                })();`;

            const jsxPayload = (type === 'jsx') ? jsxRunScript : jsxApplyExpression;

            await new Promise((resolve) => {
                this.csInterface.evalScript(jsxPayload, (ret) => {
                    console.log('[AE APPLY]', ret);
                    if (ret && ret.startsWith('ERROR:')) {
                        alert(ret);
                    }
                    resolve();
                });
            });

        } catch (err) {
            console.error('Apply failed', err);
            alert('Apply failed: ' + err.message);
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
                console.log('Code saved (basic):', { code: raw, type: langHint });
            }
        } catch (err) {
            console.error('Save failed:', err);
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

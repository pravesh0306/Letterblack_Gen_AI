// Helpers for interactive code blocks: copy, run (evalScript), apply expression
;(function () {
    'use strict';

    function getCodeFromBlock(blockId) {
        try {
            const el = document.getElementById(blockId);
            if (!el) {return '';}
            const codeEl = el.querySelector('pre code');
            return codeEl ? codeEl.textContent : '';
        } catch (e) { return ''; }
    }

    window.simpleCopy = function (blockId) {
        try {
            const code = getCodeFromBlock(blockId);
            if (!code) {return;}
            navigator.clipboard?.writeText(code).then(() => {
                window.SimpleLogger && window.SimpleLogger.info('Code copied to clipboard');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
                window.SimpleLogger && window.SimpleLogger.info('Code copied (fallback)');
            });
        } catch (e) { window.SimpleLogger && window.SimpleLogger.error(`copy error: ${ e}`); }
    };

    window.runExtendScript = function (blockId) {
        try {
            const code = getCodeFromBlock(blockId);
            if (!code) {return;}
            if (!window.ExtendScriptConfirm) {
                window.SimpleLogger && window.SimpleLogger.warn('ExtendScriptConfirm not loaded; running without confirmation.');
                if (window.CSInterface) {
                    const cs = new CSInterface();
                    cs.evalScript(code, (res) => { window.SimpleLogger && window.SimpleLogger.info(`evalScript result: ${ res}`); });
                } else {
                    window.SimpleLogger && window.SimpleLogger.warn('CEP not available in this environment');
                }
                return;
            }

            if (!window.ExtendScriptConfirm || (window.ExtendScriptConfirm && !window.ExtendScriptConfirm.isDestructive && !window.CSInterface)) {
                window.SimpleLogger && window.SimpleLogger.warn('CEP not available; cannot run scripts here');
                return;
            }

            const cs = new CSInterface();
            window.ExtendScriptConfirm.safeEval(cs, code, (res) => {
                window.SimpleLogger && window.SimpleLogger.info(`evalScript callback: ${ res}`);
                const el = document.getElementById(blockId);
                if (el) {
                    let r = el.querySelector('.run-result');
                    if (!r) { r = document.createElement('div'); r.className = 'run-result'; el.appendChild(r); }
                    r.textContent = `Result: ${ res || 'OK'}`;
                }
            });
        } catch (e) { window.SimpleLogger && window.SimpleLogger.error(`runExtendScript error: ${ e}`); }
    };

    window.applyCode = function (blockId) {
        try {
            const code = getCodeFromBlock(blockId);
            if (!code) {return;}
            const looksLikeExpression = (window.AEChatAssistant && typeof window.AEChatAssistant.prototype.looksLikeExpression === 'function')
                ? window.AEChatAssistant.prototype.looksLikeExpression(code)
                : /\w+\(.+\)/.test(code);

            if (looksLikeExpression) {
                if (!window.CSInterface) { window.SimpleLogger && window.SimpleLogger.warn('CEP not available; cannot apply expression'); return; }
                const cs = new CSInterface();
                const wrapped = `// apply expression\n(function(){ try{ var prop = app.project.activeItem.selectedProperties[0]; if(prop){ prop.expression = ${JSON.stringify(code)}; 'OK'; } else { 'ERROR: No property selected'; } } catch(e) { 'ERROR:' + e.toString(); } })()`;
                cs.evalScript(wrapped, (res) => {
                    window.SimpleLogger && window.SimpleLogger.info(`apply expression result: ${ res}`);
                });
            } else {
                window.runExtendScript(blockId);
            }
        } catch (e) { window.SimpleLogger && window.SimpleLogger.error(`applyCode error: ${ e}`); }
    };

})();

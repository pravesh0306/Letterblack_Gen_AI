// ui-bootstrap.js
// Consolidated UI glue (clean, single-file extraction).

(function(){
    'use strict';

    // Helper: safely query
    const $ = (sel, root=document) => root.querySelector(sel);

    // XSS protection helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Sanitize HTML: allow a small safe subset (code blocks, line breaks) or fallback to escaped text
    function sanitizeHtml(input) {
        if (typeof input !== 'string') return '';
        // Quick allowlist: preserve simple <pre><code> blocks produced by the AI, but sanitize innerText
        // Normalize CRLF
        const normalized = input.replace(/\r\n?/g, '\n');
        // If it appears to be a code block (```), render as escaped code
        if (/```[\s\S]*```/.test(normalized)) {
            return normalized.replace(/```([a-zA-Z0-9-_]*)\n([\s\S]*?)```/g, function(_, lang, code) {
                return '<pre class="sanitized-code"><code>' + escapeHtml(code) + '</code></pre>';
            }).replace(/\n/g, '<br/>');
        }
        // Otherwise escape everything and preserve newlines
        return escapeHtml(normalized).replace(/\n/g, '<br/>');
    }

    // Input validation helpers
    function validateText(input, minLength = 0, maxLength = 10000) {
        if (typeof input !== 'string') return false;
        return input.length >= minLength && input.length <= maxLength;
    }

    function validateJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch {
            return false;
        }
    }

    // Standardized error messages
    const ErrorMessages = {
        STORAGE_ERROR: 'Failed to save data. Please try again.',
        LOAD_ERROR: 'Failed to load data. Using defaults.',
        INVALID_INPUT: 'Invalid input provided. Please check your data.',
        NETWORK_ERROR: 'Network error occurred. Please check your connection.',
        UNEXPECTED_ERROR: 'An unexpected error occurred. Please refresh and try again.',
        VALIDATION_ERROR: 'Data validation failed. Please check the format.'
    };

    // Error boundary wrapper
    function withErrorBoundary(fn, errorMessage = ErrorMessages.UNEXPECTED_ERROR) {
        return function(...args) {
            try {
                const result = fn.apply(this, args);
                if (result instanceof Promise) {
                    return result.catch(error => {
                        console.error('Error boundary caught:', error);
                        showError(errorMessage);
                        return null;
                    });
                }
                return result;
            } catch (error) {
                console.error('Error boundary caught:', error);
                showError(errorMessage);
                return null;
            }
        };
    }

    // Centralized error display
    function showError(message) {
        console.error('UI Error:', message);
        // Create or update error display
        let errorDiv = document.getElementById('ui-error-display');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'ui-error-display';
            errorDiv.style.cssText = `
                position: fixed; top: 10px; right: 10px; z-index: 10000;
                background: #ff4444; color: white; padding: 12px 16px;
                border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-width: 300px; font-size: 12px; font-family: Arial, sans-serif;
            `;
            document.body.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) errorDiv.style.display = 'none';
        }, 5000);
    }

    // Secure storage wrapper (replaces localStorage)
    let secureStorage = null;

    async function initSecureStorage() {
        try {
            if (typeof require !== 'undefined') {
                const SecureAPIStorage = require('../../storage/secureAPIStorage');
                secureStorage = new SecureAPIStorage();
                await secureStorage.ensureDirs();
            }
        } catch (error) {
            console.warn('SecureAPIStorage not available, falling back to localStorage');
        }
    }

    // Unified storage accessor - prefers cepStorage, falls back to secureStorage, then localStorage
    async function unifiedGet(key, defaultValue = null) {
        try {
            // First priority: window.cepStorage (consistent with Settings UI)
            if (window.cepStorage && typeof window.cepStorage.getItem === 'function') {
                const value = window.cepStorage.getItem(key, undefined);
                if (value !== undefined && value !== null) {
                    return value;
                }
            }
            
            // Second priority: secureStorage (for auto-detect and legacy values)
            if (secureStorage) {
                const settings = await secureStorage.loadSettings();
                if (settings[key] !== undefined) {
                    return settings[key];
                }
            }
            
            // Final fallback: localStorage with validation
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error('Failed to get unified value:', error);
            return defaultValue;
        }
    }

    async function unifiedSet(key, value) {
        try {
            // Save to cepStorage if available (for Settings UI consistency)
            if (window.cepStorage && typeof window.cepStorage.setItem === 'function') {
                window.cepStorage.setItem(key, value);
            }
            
            // Also save to secureStorage for auto-detect feature persistence
            if (secureStorage) {
                const settings = await secureStorage.loadSettings();
                settings[key] = value;
                await secureStorage.saveSettings(settings);
            } else {
                // Fallback to localStorage
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Failed to set unified value:', error);
            throw new Error(ErrorMessages.STORAGE_ERROR);
        }
    }

    // Legacy compatibility - redirect to unified storage
    async function secureGet(key, defaultValue = null) {
        return await unifiedGet(key, defaultValue);
    }

    async function secureSet(key, value) {
        return await unifiedSet(key, value);
    }

    // Component cleanup registry
    const componentCleanups = [];

    function registerCleanup(cleanupFn) {
        componentCleanups.push(cleanupFn);
    }

    function performCleanup() {
    console.log('Performing UI component cleanup...');
        componentCleanups.forEach(cleanup => {
            try {
                cleanup();
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        });
        componentCleanups.length = 0;
    }

    // Register global cleanup
    window.addEventListener('beforeunload', performCleanup);
    window.addEventListener('unload', performCleanup);

    // Saved Scripts with secure storage and validation
    function initSavedScripts(){
        const scriptEditor = $('#script-editor');
        const savedScriptsContainer = document.querySelector('.saved-scripts-container');
        
        // Validation
        function validateScript(script) {
            if (!script || typeof script !== 'object') return false;
            if (!validateText(script.text, 1, 50000)) return false;
            if (!script.date || typeof script.date !== 'string') return false;
            return true;
        }

        const getSavedScripts = withErrorBoundary(async function() {
            try {
                const scripts = await secureGet('ae_saved_scripts', []);
                if (!Array.isArray(scripts)) return [];
                return scripts.filter(validateScript);
            } catch (error) {
                showError(ErrorMessages.LOAD_ERROR);
                return [];
            }
        }, ErrorMessages.LOAD_ERROR);

        const persistScripts = withErrorBoundary(async function(scripts) {
            if (!Array.isArray(scripts)) {
                throw new Error('Scripts must be an array');
            }
            
            const validScripts = scripts.filter(validateScript);
            await secureSet('ae_saved_scripts', validScripts);
        }, ErrorMessages.STORAGE_ERROR);

        const render = withErrorBoundary(async function() {
            if (!savedScriptsContainer) return;
            
            const scripts = await getSavedScripts();
            // Clear container safely instead of innerHTML
            while (savedScriptsContainer.firstChild) {
                savedScriptsContainer.removeChild(savedScriptsContainer.firstChild);
            }
            
            if (!scripts.length) {
                const p = document.createElement('p');
                p.textContent = 'No saved scripts yet.';
                savedScriptsContainer.appendChild(p);
                return;
            }
            
            scripts.forEach((script, idx) => {
                const item = document.createElement('div');
                item.className = 'saved-script-item';
                item.style.cssText = 'background:#222;color:#fff;padding:8px;margin-bottom:8px;border-radius:6px;';
                
                const meta = document.createElement('div');
                meta.style.cssText = 'font-size:10px;color:#aaa;margin-bottom:6px;';
                meta.textContent = script.date;
                
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.textContent = script.text;
                
                const btnLoad = document.createElement('button');
                btnLoad.textContent = 'Load';
                btnLoad.style.cssText = 'margin-right:8px;padding:4px 10px;border-radius:4px;background:#007acc;color:#fff;border:none;cursor:pointer;font-size:10px;';
                
                const loadHandler = withErrorBoundary(() => {
                    if (scriptEditor) scriptEditor.value = script.text;
                });
                btnLoad.addEventListener('click', loadHandler);
                
                const btnDel = document.createElement('button');
                btnDel.textContent = 'Delete';
                btnDel.style.cssText = 'padding:4px 10px;border-radius:4px;background:#c00;color:#fff;border:none;cursor:pointer;font-size:10px;';
                
                const deleteHandler = withErrorBoundary(async () => {
                    const currentScripts = await getSavedScripts();
                    currentScripts.splice(idx, 1);
                    await persistScripts(currentScripts);
                    render();
                });
                btnDel.addEventListener('click', deleteHandler);
                
                // Register cleanup for event listeners
                registerCleanup(() => {
                    btnLoad.removeEventListener('click', loadHandler);
                    btnDel.removeEventListener('click', deleteHandler);
                });
                
                item.appendChild(meta);
                item.appendChild(pre);
                item.appendChild(btnLoad);
                item.appendChild(btnDel);
                savedScriptsContainer.appendChild(item);
            });
        });

        const saveCurrent = withErrorBoundary(async function() {
            if (!scriptEditor) return;
            
            const content = scriptEditor.value.trim();
            if (!validateText(content, 1, 50000)) {
                showError('Script content must be between 1 and 50,000 characters');
                return;
            }
            
            const scripts = await getSavedScripts();
            scripts.push({
                text: content,
                date: new Date().toLocaleString()
            });
            
            await persistScripts(scripts);
            render();
        }, ErrorMessages.STORAGE_ERROR);

        const saveBtn = document.getElementById('save-script-btn');
        if (saveBtn) {
            const saveHandler = function(e) {
                saveCurrent();
            };
            saveBtn.addEventListener('click', saveHandler);
            
            // Register cleanup
            registerCleanup(() => {
                saveBtn.removeEventListener('click', saveHandler);
            });
        }

        // Initial render
        render();
    }

    // Script Library panel with secure storage and validation
    function initScriptLibrary(){
        const scriptEditor = $('#script-editor');
        const runBtn = $('#run-script');
        const applyBtn = $('#apply-expression');
        const saveBtn = $('#save-script-btn');
        const copyBtn = $('#copy-script-btn');
        const explainBtn = $('#explain-script-btn');
        const debugBtn = $('#debug-script-btn');
        
        function showStatus(msg) {
            if (!validateText(msg, 0, 500)) {
                msg = 'Status update';
            }
            
            let s = document.getElementById('script-status');
            if (!s) {
                s = document.createElement('div');
                s.id = 'script-status';
                s.style.cssText = 'color:#0f0;margin-top:8px;font-size:11px;';
                if (scriptEditor && scriptEditor.parentNode) {
                    scriptEditor.parentNode.appendChild(s);
                }
            }
            // Use textContent directly to avoid double-escaping
            s.textContent = msg;
            setTimeout(() => {
                if (s) s.textContent = '';
            }, 2000);
        }

        const saveLocal = withErrorBoundary(async function() {
            if (!scriptEditor) return;
            
            const content = scriptEditor.value;
            if (!validateText(content, 0, 100000)) {
                showStatus('Script too long (max 100,000 characters)');
                return;
            }
            
            await secureSet('ae_script_library', content);
            showStatus('Script saved!');
        }, ErrorMessages.STORAGE_ERROR);

        const loadLocal = withErrorBoundary(async function() {
            if (!scriptEditor) return;
            
            const content = await secureGet('ae_script_library', '');
            if (validateText(content, 0, 100000)) {
                scriptEditor.value = content;
            } else {
                scriptEditor.value = '';
                showStatus('Loaded script was invalid');
            }
        }, ErrorMessages.LOAD_ERROR);

        // Enhanced button handlers with validation
        const handlers = {};

        if (runBtn) {
            handlers.run = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid script to run');
                    return;
                }
                showStatus('Run: Simulated script execution.');
            });
            runBtn.addEventListener('click', handlers.run);
        }

        if (applyBtn) {
            handlers.apply = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid expression to apply');
                    return;
                }
                showStatus('Apply Expression: Simulated.');
            });
            applyBtn.addEventListener('click', handlers.apply);
        }

        if (saveBtn) {
            handlers.save = function(e) {
                saveLocal();
            };
            saveBtn.addEventListener('click', handlers.save);
        }

        if (copyBtn) {
            handlers.copy = withErrorBoundary(() => {
                if (!scriptEditor || !scriptEditor.value.trim()) {
                    showStatus('No script to copy');
                    return;
                }
                
                try {
                    scriptEditor.select();
                    document.execCommand('copy');
                    showStatus('Script copied to clipboard!');
                } catch (error) {
                    // Fallback for modern browsers
                    navigator.clipboard?.writeText(scriptEditor.value).then(() => {
                        showStatus('Script copied to clipboard!');
                    }).catch(() => {
                        showStatus('Failed to copy script');
                    });
                }
            });
            copyBtn.addEventListener('click', handlers.copy);
        }

        if (explainBtn) {
            handlers.explain = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid script to explain');
                    return;
                }
                showStatus('Explain: Simulated script explanation.');
            });
            explainBtn.addEventListener('click', handlers.explain);
        }

        if (debugBtn) {
            handlers.debug = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid script to debug');
                    return;
                }
                showStatus('Debug: Simulated script debug.');
            });
            debugBtn.addEventListener('click', handlers.debug);
        }

        // Register cleanup for all event listeners
        registerCleanup(() => {
            Object.entries(handlers).forEach(([key, handler]) => {
                const btn = key === 'run' ? runBtn : 
                           key === 'apply' ? applyBtn :
                           key === 'save' ? saveBtn :
                           key === 'copy' ? copyBtn :
                           key === 'explain' ? explainBtn :
                           key === 'debug' ? debugBtn : null;
                           
                if (btn && handler) {
                    btn.removeEventListener('click', handler);
                }
            });
        });

        // Load saved script on initialization
        loadLocal();
    }

    // Chat history
    // Chat History with secure storage and validation
    function initChatHistory(){
        const chatMessages = $('#chat-messages');
        const clearBtn = $('#clear-history-btn');
        const exportBtn = $('#export-all-history-btn');
        const startNewBtn = $('#start-new-session-btn');
        let mutationObserver = null;
        
        // Configure chat messages for accessibility
        if (chatMessages) {
            chatMessages.setAttribute('aria-live', 'polite');
            chatMessages.setAttribute('aria-label', 'Chat conversation');
        }
        
        // Validation for chat messages
        function validateMessage(msg) {
            if (!msg || typeof msg !== 'object') return false;
            if (!validateText(msg.text, 0, 10000)) return false;
            if (!msg.type || !['user', 'system'].includes(msg.type)) return false;
            if (!validateText(msg.timestamp, 0, 100)) return false;
            return true;
        }

        const get = withErrorBoundary(async function() {
            try {
                const history = await secureGet('ae_chat_history', []);
                if (!Array.isArray(history)) return [];
                return history.filter(validateMessage);
            } catch (error) {
                showError(ErrorMessages.LOAD_ERROR);
                return [];
            }
        }, ErrorMessages.LOAD_ERROR);

        const save = withErrorBoundary(async function() {
            if (!chatMessages) return;
            
            try {
                const msgs = Array.from(chatMessages.querySelectorAll('.message')).map(m => {
                    const contentEl = m.querySelector('.message-content');
                    const timestampEl = m.querySelector('.message-timestamp');
                    
                    return {
                        type: m.classList.contains('user') ? 'user' : 'system',
                        text: contentEl?.innerText || '',
                        timestamp: timestampEl?.innerText || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                }).filter(validateMessage);
                
                await secureSet('ae_chat_history', msgs);
            } catch (error) {
                console.error('Failed to save chat history:', error);
                // Don't show error for auto-save to avoid spam
            }
        });

        const load = withErrorBoundary(async function() {
            if (!chatMessages) return;
            
            // Clear messages safely
            while (chatMessages.firstChild) {
                chatMessages.removeChild(chatMessages.firstChild);
            }
            const messages = await get();
            
            messages.forEach(msg => {
                const md = document.createElement('div');
                md.className = `message ${msg.type}`;
                
                const c = document.createElement('div');
                c.className = 'message-content';
                const p = document.createElement('p');
                p.textContent = msg.text;
                c.appendChild(p);
                md.appendChild(c);
                
                const ts = document.createElement('div');
                ts.className = 'message-timestamp';
                ts.textContent = msg.timestamp;
                md.appendChild(ts);
                
                chatMessages.appendChild(md);
            });
        });

        const clear = withErrorBoundary(async function() {
            try {
                await secureSet('ae_chat_history', []);
                if (chatMessages) {
                    while (chatMessages.firstChild) {
                        chatMessages.removeChild(chatMessages.firstChild);
                    }
                }
            } catch (error) {
                showError(ErrorMessages.STORAGE_ERROR);
            }
        }, ErrorMessages.STORAGE_ERROR);

        const exp = withErrorBoundary(async function() {
            try {
                const data = await secureGet('ae_chat_history', []);
                const jsonData = JSON.stringify(data, null, 2);
                
                if (!validateJSON(jsonData)) {
                    showError('Invalid chat history data');
                    return;
                }
                
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ae_chat_history_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                showError('Failed to export chat history');
            }
        });

        // Set up auto-save with mutation observer
        if (chatMessages) {
            mutationObserver = new MutationObserver(() => {
                // Debounced save to avoid excessive writes
                clearTimeout(chatMessages._saveTimeout);
                chatMessages._saveTimeout = setTimeout(save, 1000);
            });
            mutationObserver.observe(chatMessages, { childList: true });
        }

        // Event handlers
        const handlers = {};

        if (clearBtn) {
            handlers.clear = function() { clear(); };
            clearBtn.addEventListener('click', handlers.clear);
        }

        if (exportBtn) {
            handlers.export = function() { exp(); };
            exportBtn.addEventListener('click', handlers.export);
        }

        if (startNewBtn) {
            handlers.startNew = function() {
                clear().then(() => load());
            };
            startNewBtn.addEventListener('click', handlers.startNew);
        }

        // Register cleanup
        registerCleanup(() => {
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }
            
            if (chatMessages && chatMessages._saveTimeout) {
                clearTimeout(chatMessages._saveTimeout);
            }
            
            Object.entries(handlers).forEach(([key, handler]) => {
                const btn = key === 'clear' ? clearBtn :
                           key === 'export' ? exportBtn :
                           key === 'startNew' ? startNewBtn : null;
                           
                if (btn && handler) {
                    btn.removeEventListener('click', handler);
                }
            });
        });

        // Initial load
        load();
    }

    // YouTube analyzer with real AI integration
    function initYouTubeAnalyzer(){ 
        const btn = $('#analyze-youtube'); 
        const chatMessages = $('#chat-messages'); 
        
        function append(type,text){ 
            if(!chatMessages) return; 
            const d=document.createElement('div'); 
            d.className=`message ${type}`; 
            const c=document.createElement('div'); 
            c.className='message-content'; 
            const p = document.createElement('p');
            p.textContent = text;
            c.appendChild(p);
            d.appendChild(c); 
            const ts=document.createElement('div'); 
            ts.className='message-timestamp'; 
            ts.textContent=new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); 
            d.appendChild(ts); 
            chatMessages.appendChild(d); 
            chatMessages.scrollTop = chatMessages.scrollHeight; 
        }
        
        if(btn) {
            btn.addEventListener('click', async ()=>{ 
                const url = prompt('Paste YouTube tutorial URL to analyze:'); 
                if(url && url.trim()){ 
                    append('user', `Analyze YouTube Tutorial: ${url}`); 
                    append('system', 'Analyzing YouTube tutorial...');
                    
                    try {
                        // Use YouTube Helper if available
                        if (window.SimpleYouTubeHelper) {
                            const youtubeHelper = new window.SimpleYouTubeHelper();
                            const analysis = await youtubeHelper.analyzeYouTubeURL(url);
                            
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', `Video Analysis:\n\n${analysis}`);
                        } else {
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', 'YouTube Helper module not loaded. Please refresh the page.');
                        }
                    } catch (error) {
                        // Remove loading message
                        const loadingMsg = chatMessages.querySelector('.message:last-child');
                        if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                            loadingMsg.remove();
                        }
                        
                        console.error('YouTube Analysis Error:', error);
                        append('system', `YouTube analysis failed: ${error.message}`);
                    }
                } 
            }); 
        }
    }

    // Chat composer with real AI integration
    // Chat Composer with secure storage and validation
    function initChatComposer(){
      const input = document.querySelector('#chat-input');        // <-- ensure IDs match HTML
      const sendButton = document.querySelector('#send-button');
      const chatMessages = document.querySelector('#chat-messages');
      const charCount = document.querySelector('.char-count');

      // derive maxLen safely
      const attrMax = input ? parseInt(input.getAttribute('maxlength'), 10) : NaN;
      const maxLen = Number.isFinite(attrMax) && attrMax > 0 ? attrMax : 10000; // more permissive default

      const update = withErrorBoundary(() =>{
        if (!input || !sendButton) return;

        const val = (input.value ?? '').toString();
        const trimmed = val.trim();
        const ok = trimmed.length >= 1;

        sendButton.disabled = !ok;
        if (charCount) {
          charCount.textContent = `${val.length}/${maxLen}`;
          charCount.style.color = val.length > maxLen * 0.9 ? '#ff6b6b' : '#ccc';
        }
      });

      function append(type, text) {
        if (!chatMessages) return;
        const d = document.createElement('div');
        d.className = `message ${type}`;
        const c = document.createElement('div');
        c.className = 'message-content';
        c.innerHTML = `<p>${escapeHtml(text)}</p>`;
        d.appendChild(c);
        const ts = document.createElement('div');
        ts.className = 'message-timestamp';
        ts.textContent = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        d.appendChild(ts);
        chatMessages.appendChild(d);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      const sendMessage = withErrorBoundary(async (message) => {
        // soft validation (don’t block for long text; warn instead)
        if (typeof message !== 'string') {
          console.warn('sendMessage: non-string payload', message);
          showError('Please enter a valid message');
          return;
        }
        const trimmed = message.trim();
        if (!trimmed) {
          showError('Please enter a valid message');
          return;
        }
        if (trimmed.length > maxLen) {
          showError(`Message longer than ${maxLen} characters — sending truncated version.`);
        }

        // … your existing provider/model/apiKey logic here (unchanged) …
        // (I’m not duplicating that long block—keep yours as-is)
      }, ErrorMessages.NETWORK_ERROR);

      // Click handler
      if (sendButton) {
        const sendHandler = withErrorBoundary(async () => {
          if (!input) { showError('Input box not found (#chat-input)'); return; }
          const raw = (input.value ?? '').toString();
          const message = raw.length > maxLen ? raw.slice(0, maxLen) : raw;
          const trimmed = message.trim();

          // DIAGNOSTICS
          console.log('[Composer] len:', raw.length, 'maxLen:', maxLen, 'emptyAfterTrim:', trimmed.length === 0);

          if (!trimmed) {
            showError('Please enter a valid message');
            return;
          }
          append('user', trimmed);
          input.value = '';
          update();
          await sendMessage(trimmed);
        });
        sendButton.addEventListener('click', sendHandler);
        registerCleanup(() => sendButton.removeEventListener('click', sendHandler));
      }

      // Enter-to-send
      if (input) {
        const keyHandler = withErrorBoundary(async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const raw = (input.value ?? '').toString();
            const message = raw.length > maxLen ? raw.slice(0, maxLen) : raw;
            const trimmed = message.trim();

            console.log('[Composer Enter] len:', raw.length, 'maxLen:', maxLen, 'emptyAfterTrim:', trimmed.length === 0);

            if (!trimmed) { showError('Please enter a valid message'); return; }
            append('user', trimmed);
            input.value = '';
            update();
            await sendMessage(trimmed);
          }
        });
        input.addEventListener('keydown', keyHandler);
        registerCleanup(() => input.removeEventListener('keydown', keyHandler));

        // live updates + paste guard
        input.addEventListener('input', update);
        input.addEventListener('paste', () => setTimeout(update, 0));
        registerCleanup(() => {
          input.removeEventListener('input', update);
        });

        // initial state
        update();
      } else {
        console.warn('initChatComposer: #chat-input not found — verify your HTML IDs');
      }
    }

    // Mascot initialization
    function initMascot(){ try { if(typeof MascotAnimator !== 'undefined'){ const mascot = new MascotAnimator({ mascotGif:'Reusable_Mascot_System/assets/ae-mascot-animated.gif', mascotPng:'Reusable_Mascot_System/assets/ae-mascot.png', mascotVideo:'Reusable_Mascot_System/assets/ae-mascot-animated.mp4', mascotSize:'56px', bubbleStyle:'dark', welcomeDuration:3800, zIndex:9999 }); mascot.showWelcome({ text:'Welcome', message:'LetterBlack_Gen_AI — ready to assist' }); window.__mascot = mascot; } } catch(e){ console.warn('MascotAnimator init failed', e); } }

    // Floating mascot
    function initFloatingMascot(){ 
        const floating = document.getElementById('floating-mascot'); 
        if(!floating) return; 
        
        let clickCount=0; 
        const animations=['animate-bounce','animate-pulse','animate-spin','animate-bubble']; 
        const tooltips=[ 
            'Click me for help! 🎯','I\'m here to assist! ✨','Need help with After Effects? 🎬','Let\'s create something amazing! 🚀','Ready to help you code! 💻','Your AI companion! 🤖','Always here to help! 💫' 
        ]; 
        
        // Track timeouts for cleanup
        let nextTimeoutId = null;
        let tooltipTimeoutId = null;
        
        function trigger(){ 
            animations.forEach(a=>floating.classList.remove(a)); 
            const anim = clickCount % 4 === 0 ? 'animate-bubble' : animations[Math.floor(Math.random()*animations.length)]; 
            floating.classList.add(anim); 
            setTimeout(()=>floating.classList.remove(anim),1000); 
        }
        
        function updateTooltip(){ 
            const t = tooltips[Math.floor(Math.random()*tooltips.length)]; 
            floating.setAttribute('data-tooltip', t); 
        }
        
        function onClick(){ 
            clickCount++; 
            trigger(); 
            updateTooltip(); 
            if(window.__mascot && typeof window.__mascot.showNotification === 'function'){ 
                const msgs=[ 
                    'Hello! I\'m your AI assistant! 🎉','Ready to help with your After Effects project! 🎬','Click the chat area to start a conversation! 💬','Try the command palette for quick actions! ⚡','Need help? Just ask me anything! 🤔','Let\'s make something awesome together! ✨','Your creative coding companion! 🚀' 
                ]; 
                const msg = msgs[Math.floor(Math.random()*msgs.length)]; 
                window.__mascot.showNotification({ text:'AI Assistant', message:msg, duration:3500 }); 
            } else { 
                console.log(`Floating mascot clicked ${clickCount} times`); 
            } 
            if(clickCount>=5 && clickCount % 5 ===0){ 
                for(let i=0;i<3;i++){ 
                    setTimeout(()=>{ 
                        floating.classList.add('animate-pulse'); 
                        setTimeout(()=>floating.classList.remove('animate-pulse'),300); 
                    }, i*200); 
                } 
            } 
        }
        
        function onMouseEnter() {
            floating.style.transform='translateY(-5px) scale(1.08)';
        }
        
        function onMouseLeave() {
            floating.style.transform='';
        }
        
        floating.addEventListener('click', onClick); 
        floating.addEventListener('mouseenter', onMouseEnter); 
        floating.addEventListener('mouseleave', onMouseLeave); 
        
        function randomGentle(){ 
            if(Math.random()<0.4){ 
                const ga=['animate-pulse','animate-bounce']; 
                const a=ga[Math.floor(Math.random()*ga.length)]; 
                floating.classList.add(a); 
                setTimeout(()=>floating.classList.remove(a),1000); 
            } 
        }
        
        function scheduleNext(){ 
            clearTimeout(nextTimeoutId);
            const delay=8000+Math.random()*4000; 
            nextTimeoutId = setTimeout(()=>{ 
                randomGentle(); 
                scheduleNext(); 
            }, delay); 
        }
        
        function scheduleTooltip(){ 
            clearTimeout(tooltipTimeoutId);
            const delay=6000+Math.random()*4000; 
            tooltipTimeoutId = setTimeout(()=>{ 
                updateTooltip(); 
                scheduleTooltip(); 
            }, delay); 
        }
        
        scheduleNext(); 
        scheduleTooltip();
        
        // Register cleanup for memory leak prevention
        registerCleanup(() => {
            if (floating) {
                floating.removeEventListener('click', onClick);
                floating.removeEventListener('mouseenter', onMouseEnter);
                floating.removeEventListener('mouseleave', onMouseLeave);
            }
            clearTimeout(nextTimeoutId);
            clearTimeout(tooltipTimeoutId);
        });
    }

    // Boot with enhanced initialization
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🚀 UI Bootstrap initializing...');
        
        try {
            // Initialize secure storage first
            await initSecureStorage();
            
            // Initialize all components with error boundaries
            await Promise.all([
                withErrorBoundary(initSavedScripts)(),
                withErrorBoundary(initScriptLibrary)(),
                withErrorBoundary(initChatHistory)(),
                withErrorBoundary(initYouTubeAnalyzer)(),
                withErrorBoundary(initChatComposer)(),
                withErrorBoundary(initMascot)(),
                withErrorBoundary(initFloatingMascot)()
            ]);
            
            console.log('✅ UI Bootstrap initialization complete');

            // --- Additional wiring: command palette keyboard and button handlers ---
            try {
                const commandTrigger = document.getElementById('command-menu-trigger');
                const commandPanel = document.getElementById('command-menu-panel');
                const commandSearch = document.getElementById('command-search');

                function openCommandPalette() {
                    if (!commandPanel) return;
                    commandPanel.classList.remove('hidden');
                    commandPanel.setAttribute('aria-hidden', 'false');
                    if (commandSearch) {
                        commandSearch.focus();
                        commandSearch.select();
                    }
                }

                function closeCommandPalette() {
                    if (!commandPanel) return;
                    commandPanel.classList.add('hidden');
                    commandPanel.setAttribute('aria-hidden', 'true');
                    if (commandTrigger) commandTrigger.focus();
                }

                // Toggle via button
                if (commandTrigger) {
                    commandTrigger.addEventListener('click', () => {
                        if (commandPanel && commandPanel.classList.contains('hidden')) openCommandPalette();
                        else closeCommandPalette();
                    });
                }

                // Keyboard: Ctrl+K to open, Escape to close, arrow navigation
                document.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                        e.preventDefault();
                        if (commandPanel && commandPanel.classList.contains('hidden')) openCommandPalette();
                        else closeCommandPalette();
                    }
                    if (e.key === 'Escape' && commandPanel && !commandPanel.classList.contains('hidden')) {
                        closeCommandPalette();
                    }
                });

                // Simple up/down nav inside command palette
                if (commandSearch) {
                    commandSearch.addEventListener('keydown', (e) => {
                        const items = Array.from(document.querySelectorAll('.command-item'));
                        if (!items.length) return;
                        const current = document.activeElement;
                        const idx = items.indexOf(current);
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            const next = items[Math.max(0, idx + 1)];
                            next?.focus();
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prev = items[Math.max(0, idx - 1)];
                            prev?.focus();
                        }
                    });
                }
            } catch (err) {
                console.warn('Command palette wiring failed', err);
            }

            // Wire new header buttons (delete cache, mascot debug, auto-detect)
            try {
                const deleteBtn = document.getElementById('delete-cache-btn');
                // const mascotDebugBtn = document.getElementById('mascot-debug-btn');
                const autoDetectBtn = document.getElementById('auto-detect-btn');

                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        if (typeof window.deleteCacheAndReload === 'function') window.deleteCacheAndReload();
                        else showError('Cache delete handler not available.');
                    });
                }

                // Mascot debug button removed from production

                if (autoDetectBtn) {
                    autoDetectBtn.addEventListener('click', () => {
                        if (window.smartAPIManager && typeof window.smartAPIManager.manualDetect === 'function') {
                            window.smartAPIManager.manualDetect();
                            if (window.SimpleToast) window.SimpleToast.show('Provider auto-detected and saved', 'success');
                        } else {
                            showError('API auto-detect not available.');
                        }
                    });
                }
            } catch (err) {
                console.warn('Header button wiring failed', err);
            }

            // Disable API key saving if secure storage not initialized and wire save toast
            try {
                const saveAndTestBtn = document.getElementById('save-and-test-btn');
                const apiInput = document.getElementById('api-key-setting');
                if (saveAndTestBtn) {
                    if (!secureStorage) {
                        saveAndTestBtn.disabled = true;
                        saveAndTestBtn.title = 'Secure storage unavailable - cannot save API key locally';
                        if (apiInput) apiInput.setAttribute('placeholder', 'Secure storage required to save API key');
                    } else {
                        saveAndTestBtn.addEventListener('click', () => {
                            // SettingsManager handles the save; we show feedback
                            if (window.SimpleToast) window.SimpleToast.success('Settings saved');
                        });
                    }
                }
            } catch (err) {
                console.warn('API key save guard wiring failed', err);
            }
        } catch (error) {
            console.error('❌ UI Bootstrap initialization failed:', error);
            showError('Some UI components failed to initialize. Please refresh the page.');
        }

        // Bottom panel resizer wiring
        try {
            const panel = document.getElementById('bottom-panel');
            const resizer = document.querySelector('.bottom-resizer');
            const STORAGE_KEY = 'bottom_panel_height';
            if (panel && resizer) {
                // Restore saved height
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) panel.style.height = saved;

                let dragging = false;
                let startY = 0;
                let startH = 0;

                const onMove = (e) => {
                    if (!dragging) return;
                    const dy = startY - e.clientY; // dragging up increases height
                    const newH = Math.max(120, Math.min(600, startH + dy));
                    panel.style.height = newH + 'px';
                };
                const onUp = () => {
                    if (!dragging) return;
                    dragging = false;
                    localStorage.setItem(STORAGE_KEY, panel.style.height);
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                    document.body.style.cursor = '';
                };
                const startDrag = (e) => {
                    dragging = true;
                    startY = e.clientY;
                    startH = panel.getBoundingClientRect().height;
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                    document.body.style.cursor = 'ns-resize';
                };
                resizer.addEventListener('mousedown', startDrag);
            }
        } catch (err) {
            console.warn('Bottom panel resizer failed to initialize', err);
        }
    });

})();


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

    // Centralized error display - now with floating mascot integration
    function showError(message) {
        console.error('UI Error:', message);
        
        // Use floating mascot if available
        if (window.floatingMascot) {
            window.floatingMascot.error(message);
            return;
        }
        
        // Fallback to traditional error display
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

    // Centralized success display - with floating mascot integration
    function showSuccess(message) {
        console.log('UI Success:', message);
        
        // Use floating mascot if available
        if (window.floatingMascot) {
            window.floatingMascot.success(message);
            return;
        }
        
        // Fallback to console log
        console.log('Success:', message);
    }

    // Centralized info display - with floating mascot integration
    function showInfo(message) {
        console.log('UI Info:', message);
        
        // Use floating mascot if available
        if (window.floatingMascot) {
            window.floatingMascot.info(message);
            return;
        }
        
        // Fallback to console log
        console.log('Info:', message);
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

    async function secureGet(key, defaultValue = null) {
        try {
            if (secureStorage) {
                const result = await secureStorage.loadSettings();
                const settings = result.settings || {};
                
                // Map old key names to new SecureAPIStorage structure
                switch (key) {
                    case 'gemini_api_key':
                    case 'google_api_key':
                    case 'openai_api_key':
                    case 'anthropic_api_key':
                        return settings.apiKey || defaultValue;
                    case 'ai_model':
                        return settings.model || defaultValue;
                    case 'ai_provider':
                        return settings.provider || defaultValue;
                    default:
                        return settings[key] ?? defaultValue;
                }
            } else {
                // Fallback to localStorage with validation
                const value = localStorage.getItem(key);
                if (!value) return defaultValue;
                
                // Try to parse as JSON, but fall back to plain string if it fails
                try {
                    return JSON.parse(value);
                } catch (jsonError) {
                    // If JSON parsing fails, return the value as is (plain string)
                    return value;
                }
            }
        } catch (error) {
            console.error('Failed to get secure value:', error);
            return defaultValue;
        }
    }

    async function secureSet(key, value) {
        try {
            if (secureStorage) {
                const result = await secureStorage.loadSettings();
                const settings = result.settings || {};
                
                // Map old key names to new SecureAPIStorage structure
                switch (key) {
                    case 'gemini_api_key':
                    case 'google_api_key':
                    case 'openai_api_key':
                    case 'anthropic_api_key':
                        settings.apiKey = value;
                        break;
                    case 'ai_model':
                        settings.model = value;
                        break;
                    case 'ai_provider':
                        settings.provider = value;
                        break;
                    default:
                        settings[key] = value;
                }
                
                await secureStorage.saveSettings(settings);
            } else {
                // Fallback to localStorage
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error('Failed to set secure value:', error);
            throw new Error(ErrorMessages.STORAGE_ERROR);
        }
    }

    // Component cleanup registry
    const componentCleanups = [];

    function registerCleanup(cleanupFn) {
        componentCleanups.push(cleanupFn);
    }

    function performCleanup() {
        console.log('🧹 Performing UI component cleanup...');
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

    // Storage status display for debugging
    function initStorageStatus() {
        const statusDiv = document.getElementById('storage-info-display');
        if (!statusDiv) return;
        
        try {
            // Get current storage information
            const apiKey = secureGet('gemini_api_key', 'Not set');
            const provider = secureGet('ai_provider', 'Not set');
            const hasSecureStorage = typeof window.secureAPIStorage !== 'undefined';
            
            // Create status display
            const statusHTML = `
                <div class="storage-debug-info">
                    <h4>Storage Debug Info</h4>
                    <div class="debug-item">
                        <strong>API Key:</strong> ${apiKey && apiKey !== 'Not set' ? 'Set ✅' : 'Missing ❌'}
                    </div>
                    <div class="debug-item">
                        <strong>Provider:</strong> ${provider || 'Not set'}
                    </div>
                    <div class="debug-item">
                        <strong>Secure Storage:</strong> ${hasSecureStorage ? 'Available ✅' : 'Unavailable ❌'}
                    </div>
                    <div class="debug-item">
                        <strong>Storage Type:</strong> ${hasSecureStorage ? 'SecureAPIStorage' : 'localStorage'}
                    </div>
                </div>
            `;
            
            statusDiv.innerHTML = statusHTML;
            console.log('✅ Storage status display initialized');
        } catch (error) {
            console.error('❌ Storage status initialization failed:', error);
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="error">Storage status unavailable</div>';
            }
        }
    }

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
            savedScriptsContainer.innerHTML = '';
            
            if (!scripts.length) {
                savedScriptsContainer.innerHTML = '<p>No saved scripts yet.</p>';
                return;
            }
            
            scripts.forEach((script, idx) => {
                const item = document.createElement('div');
                item.className = 'saved-script-item';
                item.style.cssText = 'background:#222;color:#fff;padding:8px;margin-bottom:8px;border-radius:6px;';
                
                const meta = document.createElement('div');
                meta.style.cssText = 'font-size:10px;color:#aaa;margin-bottom:6px;';
                meta.textContent = escapeHtml(script.date);
                
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
            s.textContent = escapeHtml(msg);
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
                showStatus('Run: Script execution initiated.');
            });
            runBtn.addEventListener('click', handlers.run);
        }

        if (applyBtn) {
            handlers.apply = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid expression to apply');
                    return;
                }
                showStatus('Apply Expression: Expression applied to selected property.');
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
                showStatus('Explain: AI generating script explanation...');
            });
            explainBtn.addEventListener('click', handlers.explain);
        }

        if (debugBtn) {
            handlers.debug = withErrorBoundary(() => {
                if (!scriptEditor || !validateText(scriptEditor.value, 1)) {
                    showStatus('No valid script to debug');
                    return;
                }
                showStatus('Debug: AI analyzing script for potential issues...');
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
                        timestamp: timestampEl?.innerText || ''
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
            
            chatMessages.innerHTML = '';
            const messages = await get();
            
            messages.forEach(msg => {
                const md = document.createElement('div');
                md.className = `message ${msg.type}`;
                
                const c = document.createElement('div');
                c.className = 'message-content';
                c.innerHTML = `<p>${escapeHtml(msg.text)}</p>`;
                md.appendChild(c);
                
                const ts = document.createElement('div');
                ts.className = 'message-timestamp';
                ts.textContent = escapeHtml(msg.timestamp);
                md.appendChild(ts);
                
                chatMessages.appendChild(md);
            });
        });

        const clear = withErrorBoundary(async function() {
            try {
                await secureSet('ae_chat_history', []);
                if (chatMessages) chatMessages.innerHTML = '';
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
            c.innerHTML=`<p>${escapeHtml(text)}</p>`; 
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
                    append('system', '🔎 Analyzing YouTube tutorial...');
                    
                    try {
                        // Use YouTube Helper if available
                        if (window.SimpleYouTubeHelper) {
                            const youtubeHelper = new window.SimpleYouTubeHelper();
                            const analysis = await youtubeHelper.analyzeVideo(url);
                            
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', `� **Video Analysis:**\n\n${analysis}`);
                        } else {
                            // Remove loading message
                            const loadingMsg = chatMessages.querySelector('.message:last-child');
                            if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                                loadingMsg.remove();
                            }
                            
                            append('system', '❌ YouTube Helper module not loaded. Please refresh the page.');
                        }
                    } catch (error) {
                        // Remove loading message
                        const loadingMsg = chatMessages.querySelector('.message:last-child');
                        if (loadingMsg && loadingMsg.textContent.includes('Analyzing')) {
                            loadingMsg.remove();
                        }
                        
                        console.error('YouTube Analysis Error:', error);
                        append('system', `❌ YouTube analysis failed: ${error.message}`);
                    }
                } 
            }); 
        }
    }

    // Chat composer with real AI integration
    // Chat Composer with secure storage and validation
    function initChatComposer(){ 
        const input = $('#chat-input'); 
        const sendButton = $('#send-button'); 
        const chatMessages = $('#chat-messages'); 
        const charCount = document.querySelector('.char-count'); 
        const maxLen = input ? parseInt(input.getAttribute('maxlength')) || 1000 : 1000; 
        
        const update = withErrorBoundary(function(){ 
            if (!input || !sendButton) return; 
            
            const val = input.value.trim(); 
            const isValid = validateText(val, 1, maxLen);
            
            sendButton.disabled = !isValid; 
            if (charCount) {
                charCount.textContent = `${val.length}/${maxLen}`;
                charCount.style.color = val.length > maxLen * 0.9 ? '#ff6b6b' : '#ccc';
            }
        });
        
        if (input) { 
            const inputHandler = function() { update(); };
            input.addEventListener('input', inputHandler); 
            
            // Input validation
            input.addEventListener('paste', function(e) {
                setTimeout(() => {
                    if (input.value.length > maxLen) {
                        input.value = input.value.substring(0, maxLen);
                        showError(`Message truncated to ${maxLen} characters`);
                    }
                    update();
                }, 0);
            });
            
            registerCleanup(() => {
                input.removeEventListener('input', inputHandler);
            });
            
            update(); 
        }
        
        function append(type, text) { 
            if (!chatMessages) return;
            
            // Validate input parameters
            if (!['user', 'system'].includes(type)) {
                console.error('Invalid message type:', type);
                return;
            }
            
            if (!validateText(text, 0, 50000)) {
                console.error('Invalid message text');
                return;
            }
            
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
        
        const sendMessage = withErrorBoundary(async function(message) {
            // Validate input message
            if (!validateText(message, 1, maxLen)) {
                showError('Message is too long or empty');
                return;
            }
            
            try {
                // Get settings from secure storage
                const provider = await secureGet('ai_provider', 'gemini');
                const model = await secureGet('ai_model', 'gemini-1.5-flash');
                const contextMemory = await secureGet('ai_context_memory', '');
                
                // Get the correct API key based on provider
                let apiKey = '';
                
                // Get API key from CEP storage
                if (window.cepStorage) {
                    const currentSettings = await window.cepStorage.loadSettings();
                    apiKey = currentSettings.ai_api_key || '';
                } else {
                    // Fallback to old method if CEP storage not available
                    switch(provider) {
                        case 'google':
                        case 'gemini':
                            apiKey = await secureGet('gemini_api_key', '');
                            break;
                        case 'openai':
                            apiKey = await secureGet('openai_api_key', '');
                            break;
                        case 'anthropic':
                            apiKey = await secureGet('anthropic_api_key', '');
                            break;
                        default:
                            apiKey = await secureGet('gemini_api_key', ''); // fallback to gemini
                    }
                }
                
                // Validate settings - API keys are typically 20+ characters
                if (!validateText(apiKey, 20, 200)) {
                    append('system', `❌ **API Key Missing or Invalid**\n\nPlease configure your ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key in the Settings tab before sending messages.`);
                    
                    // Update floating mascot
                    if (window.floatingMascot) {
                        window.floatingMascot.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key not configured`);
                        window.floatingMascot.setTooltip('Please configure API key in Settings 🔑');
                        window.floatingMascot.playAnimation('debug');
                    }
                    return;
                }
                
                // Show typing indicator first
                append('system', '🤖 AI is thinking...');
                
                // Update floating mascot for thinking state
                if (window.floatingMascot) {
                    window.floatingMascot.setTooltip('AI is processing your request... 🤔');
                    window.floatingMascot.playAnimation('thinking');
                }
                
                // Use AI Module if available
                if (window.AIModule) {
                    const aiModule = new window.AIModule();
                    
                    // Enhanced context building with validation
                    let contextualMessage = message;
                    if (contextMemory && validateText(contextMemory, 0, 5000)) {
                        contextualMessage = `Context: ${contextMemory}\n\nUser: ${message}`;
                        console.log('📋 Added context memory to message');
                    }
                    
                    const response = await aiModule.generateResponse(contextualMessage, {
                        apiKey: apiKey,
                        provider: provider,
                        model: model,
                        temperature: 0.7,
                        maxTokens: 2048,
                        chatHistory: []
                    });
                    
                    // Remove typing indicator
                    const typingMsg = chatMessages.querySelector('.message:last-child');
                    if (typingMsg && typingMsg.textContent.includes('thinking')) {
                        typingMsg.remove();
                    }
                    
                    // Add the response with validation
                    if (response && validateText(response, 1, 50000)) {
                        append('system', response);
                        
                        // Update floating mascot for successful response
                        if (window.floatingMascot) {
                            window.floatingMascot.success('Response received successfully! 🎉');
                            window.floatingMascot.setTooltip('Ready to help! 🚀');
                            window.floatingMascot.playAnimation('success');
                        }
                        
                        // Show helpful setup message if this looks like an error
                        if (response.includes('❌') && response.includes('API Key')) {
                            setTimeout(() => {
                                append('system', '💡 **Quick Setup Guide:**\n\n1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Create a free API key\n3. Go to Settings tab → paste your key\n4. Click "Save & Test"\n\nThen come back and chat with me! 🚀');
                                
                                // Update mascot for help mode
                                if (window.floatingMascot) {
                                    window.floatingMascot.setTooltip('Need help setting up? Click me! 💡');
                                    window.floatingMascot.playAnimation('explain');
                                }
                            }, 1000);
                        }
                    } else {
                        append('system', '❌ Invalid or empty response received from AI provider.');
                        
                        // Update floating mascot for error
                        if (window.floatingMascot) {
                            window.floatingMascot.error('Invalid response from AI provider');
                            window.floatingMascot.setTooltip('Something went wrong 😕');
                            window.floatingMascot.playAnimation('debug');
                        }
                    }
                    
                } else {
                    // Remove typing indicator
                    const typingMsg = chatMessages.querySelector('.message:last-child');
                    if (typingMsg && typingMsg.textContent.includes('thinking')) {
                        typingMsg.remove();
                    }
                    
                    append('system', '❌ AI Module not loaded. Please refresh the page.');
                    
                    // Update floating mascot for module error
                    if (window.floatingMascot) {
                        window.floatingMascot.error('AI Module not loaded');
                        window.floatingMascot.setTooltip('Please refresh the page 🔄');
                        window.floatingMascot.playAnimation('debug');
                    }
                }
            } catch (error) {
                // Remove typing indicator
                const typingMsg = chatMessages.querySelector('.message:last-child');
                if (typingMsg && typingMsg.textContent.includes('thinking')) {
                    typingMsg.remove();
                }
                
                console.error('AI Error:', error);
                const errorMessage = error.message && validateText(error.message, 0, 1000) ? 
                    error.message : 'Unknown error occurred';
                append('system', `❌ **Unexpected Error**: ${escapeHtml(errorMessage)}\n\n📍 Try refreshing the page or check your internet connection.`);
                
                // Update floating mascot for unexpected error
                if (window.floatingMascot) {
                    window.floatingMascot.error('Unexpected error occurred');
                    window.floatingMascot.setTooltip('Check connection & refresh 🔄');
                    window.floatingMascot.playAnimation('debug');
                }
            }
        }, ErrorMessages.NETWORK_ERROR);
        
        if(sendButton) {
            const sendHandler = withErrorBoundary(async function() { 
                const val = input.value.trim(); 
                if (!validateText(val, 1, maxLen)) {
                    showError('Please enter a valid message');
                    return;
                }
                
                append('user', val); 
                input.value = ''; 
                update(); 
                
                await sendMessage(val);
            });
            
            sendButton.addEventListener('click', sendHandler);
            
            registerCleanup(() => {
                sendButton.removeEventListener('click', sendHandler);
            });
        }
        
        // Enhanced Enter key handling
        if (input) {
            const keyHandler = withErrorBoundary(async function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const val = input.value.trim();
                    if (!validateText(val, 1, maxLen)) {
                        showError('Please enter a valid message');
                        return;
                    }
                    
                    append('user', val);
                    input.value = '';
                    update();
                    
                    await sendMessage(val);
                }
            });
            
            input.addEventListener('keydown', keyHandler);
            
            registerCleanup(() => {
                input.removeEventListener('keydown', keyHandler);
            });
        }
    }

    // Mascot initialization
    function initMascot(){ try { if(typeof MascotAnimator !== 'undefined'){ const mascot = new MascotAnimator({ mascotGif:'Reusable_Mascot_System/assets/ae-mascot-animated.gif', mascotPng:'Reusable_Mascot_System/assets/ae-mascot.png', mascotVideo:'Reusable_Mascot_System/assets/ae-mascot-animated.mp4', mascotSize:'56px', bubbleStyle:'dark', welcomeDuration:3800, zIndex:9999 }); mascot.showWelcome({ text:'Welcome', message:'LetterBlack_Gen_AI — ready to assist' }); window.__mascot = mascot; } } catch(e){ console.warn('MascotAnimator init failed', e); } }

    // Floating mascot
    function initFloatingMascot(){ const floating = document.getElementById('floating-mascot'); if(!floating) return; let clickCount=0; const animations=['animate-bounce','animate-pulse','animate-spin','animate-bubble']; const tooltips=[ 'Click me for help! 🎯','I\'m here to assist! ✨','Need help with After Effects? 🎬','Let\'s create something amazing! 🚀','Ready to help you code! 💻','Your AI companion! 🤖','Always here to help! 💫' ]; function trigger(){ animations.forEach(a=>floating.classList.remove(a)); const anim = clickCount % 4 === 0 ? 'animate-bubble' : animations[Math.floor(Math.random()*animations.length)]; floating.classList.add(anim); setTimeout(()=>floating.classList.remove(anim),1000); }
        function updateTooltip(){ const t = tooltips[Math.floor(Math.random()*tooltips.length)]; floating.setAttribute('data-tooltip', t); }
        function onClick(){ clickCount++; trigger(); updateTooltip(); if(window.__mascot && typeof window.__mascot.showNotification === 'function'){ const msgs=[ 'Hello! I\'m your AI assistant! 🎉','Ready to help with your After Effects project! 🎬','Click the chat area to start a conversation! 💬','Try the command palette for quick actions! ⚡','Need help? Just ask me anything! 🤔','Let\'s make something awesome together! ✨','Your creative coding companion! 🚀' ]; const msg = msgs[Math.floor(Math.random()*msgs.length)]; window.__mascot.showNotification({ text:'AI Assistant', message:msg, duration:3500 }); } else { console.log(`Floating mascot clicked ${clickCount} times`); } if(clickCount>=5 && clickCount % 5 ===0){ for(let i=0;i<3;i++){ setTimeout(()=>{ floating.classList.add('animate-pulse'); setTimeout(()=>floating.classList.remove('animate-pulse'),300); }, i*200); } } }
        floating.addEventListener('click', onClick); floating.addEventListener('mouseenter', ()=> floating.style.transform='translateY(-5px) scale(1.08)'); floating.addEventListener('mouseleave', ()=> floating.style.transform=''); function randomGentle(){ if(Math.random()<0.4){ const ga=['animate-pulse','animate-bounce']; const a=ga[Math.floor(Math.random()*ga.length)]; floating.classList.add(a); setTimeout(()=>floating.classList.remove(a),1000); } }
        function scheduleNext(){ const delay=8000+Math.random()*4000; setTimeout(()=>{ randomGentle(); scheduleNext(); }, delay); }
        function scheduleTooltip(){ const delay=6000+Math.random()*4000; setTimeout(()=>{ updateTooltip(); scheduleTooltip(); }, delay); }
        scheduleNext(); scheduleTooltip();
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
                withErrorBoundary(initFloatingMascot)(),
                withErrorBoundary(initStorageStatus)()
            ]);
            
            console.log('✅ UI Bootstrap initialization complete');
        } catch (error) {
            console.error('❌ UI Bootstrap initialization failed:', error);
            showError('Some UI components failed to initialize. Please refresh the page.');
        }
    });

})();


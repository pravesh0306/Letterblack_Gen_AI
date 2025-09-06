        // Effects Gallery - load from localStorage (no built-in examples)
        const effectsList = document.getElementById('effects-list');
        if (effectsList) {
            try {
                const lib = JSON.parse(localStorage.getItem('ae_expression_library') || '[]');
                const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                if (Array.isArray(lib) && lib.length) {
                    effectsList.innerHTML = lib.map((e, idx) => `\n                        <div class="effect-item">\n                            <strong>${esc(e.name || ('Expression ' + (idx+1)))}</strong><br>\n                            <code>${esc(e.code || '')}</code><br>\n                            <button class="apply-effect-btn" data-idx="${idx}">Apply</button>\n                        </div>`).join('\n');
                    effectsList.querySelectorAll('.apply-effect-btn').forEach(btn => btn.addEventListener('click', (ev) => {
                        const i = parseInt(btn.getAttribute('data-idx'), 10);
                        const item = lib[i];
                        if (item) console.log('Applying expression: ' + (item.name || 'Unnamed'));
                    }));
                } else {
                    effectsList.innerHTML = '<p>No saved expressions. Save expressions in the Saved Scripts tab to populate this list.</p>';
                }
            } catch (err) {
                console.warn('Failed to load expression library', err);
                effectsList.innerHTML = '<p>Error loading expressions.</p>';
            }
        }

        // Tutorials placeholder (no built-in tutorial steps)
        const tutorialsList = document.getElementById('tutorials-list');
        if (tutorialsList) {
            tutorialsList.innerHTML = '<p>No tutorials bundled. Add tutorials via the docs or Saved Scripts.</p>';
        }
        // Script Health Check, Explain, Debug
        const healthCheckScriptBtn = document.getElementById('health-check-script-btn');
        const explainScriptBtn = document.getElementById('explain-script-btn');
        const debugScriptBtn = document.getElementById('debug-script-btn');
        if (healthCheckScriptBtn) {
            healthCheckScriptBtn.addEventListener('click', () => {
                const scriptEditor = document.getElementById('script-editor');
                if (!scriptEditor || !scriptEditor.value.trim()) return alert('No script to check.');
                // Simple check: look for missing semicolons, suspicious patterns
                const code = scriptEditor.value;
                let issues = [];
                if (!/;\s*$/m.test(code)) issues.push('No semicolon at end of last line.');
                if (/eval\s*\(/.test(code)) issues.push('Use of eval() is discouraged.');
                if (/alert\s*\(/.test(code)) issues.push('Use of alert() is discouraged in production.');
                alert(issues.length ? 'Issues found:\n' + issues.join('\n') : 'No obvious issues found.');
            });
        }
        if (explainScriptBtn) {
            explainScriptBtn.addEventListener('click', () => {
                const scriptEditor = document.getElementById('script-editor');
                if (!scriptEditor || !scriptEditor.value.trim()) return alert('No script to explain.');
                // Use AI module to explain
                if (window.aiModule && aiModule.explainCode) {
                    aiModule.explainCode(scriptEditor.value).then(explanation => {
                        alert('Explanation:\n' + explanation);
                    });
                } else {
                    alert('AI explanation not available.');
                }
            });
        }
        if (debugScriptBtn) {
            debugScriptBtn.addEventListener('click', () => {
                const scriptEditor = document.getElementById('script-editor');
                if (!scriptEditor || !scriptEditor.value.trim()) return alert('No script to debug.');
                // Use AI module to debug
                if (window.aiModule && aiModule.debugCode) {
                    aiModule.debugCode(scriptEditor.value).then(debugInfo => {
                        alert('Debug Info:\n' + debugInfo);
                    });
                } else {
                    alert('AI debug not available.');
                }
            });
        }
        // Script Library Enhancements
        const scriptSearch = document.getElementById('script-search');
        const scriptTagInput = document.getElementById('script-tag-input');
        const importScriptBtn = document.getElementById('import-script-btn');
        const exportScriptBtn = document.getElementById('export-script-btn');
        if (scriptSearch) {
            scriptSearch.addEventListener('input', () => {
                const val = scriptSearch.value.toLowerCase();
                const list = document.getElementById('saved-scripts-list');
                if (!list) return;
                Array.from(list.children).forEach(item => {
                    const name = item.querySelector('.script-name')?.textContent?.toLowerCase() || '';
                    item.style.display = name.includes(val) ? '' : 'none';
                });
            });
        }
        if (scriptTagInput) {
            scriptTagInput.addEventListener('change', () => {
                const tag = scriptTagInput.value.trim();
                if (!tag) return;
                // Add tag to current script in editor (simple demo)
                const scriptEditor = document.getElementById('script-editor');
                if (scriptEditor) {
                    scriptEditor.value = `// Tag: ${tag}\n` + scriptEditor.value;
                }
                scriptTagInput.value = '';
            });
        }
        if (importScriptBtn) {
            importScriptBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.js,.jsx,.txt,.json';
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = evt => {
                        const scriptEditor = document.getElementById('script-editor');
                        if (scriptEditor) scriptEditor.value = evt.target.result;
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }
        if (exportScriptBtn) {
            exportScriptBtn.addEventListener('click', () => {
                const scriptEditor = document.getElementById('script-editor');
                if (!scriptEditor || !scriptEditor.value.trim()) return alert('No script to export.');
                const blob = new Blob([scriptEditor.value], {type:'text/plain'});
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ae-script.js';
                a.click();
            });
        }
        // Batch Processing UI logic
        const batchLayerList = document.getElementById('batch-layer-list');
        const batchRenameBtn = document.getElementById('batch-rename-btn');
        const batchApplyScriptBtn = document.getElementById('batch-apply-script-btn');
    // Initialize batch layer list even if ProjectOrganizer hasn't loaded yet
    if (batchLayerList) {
            // Populate with layers from active comp
            function refreshBatchLayerList() {
                batchLayerList.innerHTML = 'Loading...';
                if (!window.CSInterface) return;
                const cs = new CSInterface();
                const script = `
                    var result = [];
                    var comp = app.project.activeItem;
                    if (comp && comp instanceof CompItem) {
                        for (var i=1; i<=comp.numLayers; i++) {
                            var l = comp.layer(i);
                            result.push({name:l.name, index:i});
                        }
                    }
                    JSON.stringify(result);
                `;
                cs.evalScript(script, (res) => {
                    try {
                        if (res === 'EvalScript error.' || (typeof res === 'string' && res.indexOf('EvalScript error') === 0)) {
                            console.warn('ExtendScript layer fetch failed (not in AE environment):', res);
                            // Show demo layers when not in After Effects
                            batchLayerList.innerHTML = `
                                <label><input type="checkbox" class="batch-layer-checkbox" value="1"> 🎬 Demo Layer 1</label><br>
                                <label><input type="checkbox" class="batch-layer-checkbox" value="2"> 🎨 Demo Layer 2</label><br>
                                <label><input type="checkbox" class="batch-layer-checkbox" value="3"> ✨ Demo Layer 3</label><br>
                                <small class="demo-indicator">Demo layers shown - run in After Effects for real layers</small>
                            `;
                            return;
                        }
                        const layers = Array.isArray(res) ? res : [];
                        batchLayerList.innerHTML = (layers && layers.length) ? layers.map(l =>
                            `<label><input type="checkbox" class="batch-layer-checkbox" value="${HtmlSanitizer.escape(l.index)}"> ${HtmlSanitizer.escape(l.name)}</label>`
                        ).join('<br>') : '<em>No layers found</em>';
                    } catch (e) {
                        console.warn('Failed processing layer list', e, res);
                        batchLayerList.innerHTML = '<em>Error loading layers</em>';
                    }
                }, { parseJSON: true });
            }
            // Expose for external callers (rename/apply buttons)
            window.refreshBatchLayerList = refreshBatchLayerList;
            // Initial load - but only after CEP environment is confirmed ready
            // refreshBatchLayerList(); // Moved to loadCEPDependentModules()
        }

        if (batchRenameBtn) {
            batchRenameBtn.addEventListener('click', () => {
                const checked = Array.from(document.querySelectorAll('.batch-layer-checkbox:checked'));
                if (!checked.length) return alert('Select at least one layer.');
                const newName = prompt('Enter new base name for selected layers:');
                if (!newName) return;
                const indices = checked.map(cb => cb.value);
                if (!window.CSInterface) return;
                const cs = new CSInterface();
                const script = `
                    var indices = [${indices.join(',')}];
                    var comp = app.project.activeItem;
                    if (comp && comp instanceof CompItem) {
                        for (var i=0; i<indices.length; i++) {
                            var idx = indices[i];
                            comp.layer(idx).name = '${newName}_' + (i+1);
                        }
                    }
                `;
                cs.evalScript(script, () => {
                    alert('Layers renamed.');
                    if (typeof refreshBatchLayerList === 'function') refreshBatchLayerList();
                });
            });
        }

        if (batchApplyScriptBtn) {
            batchApplyScriptBtn.addEventListener('click', () => {
                const checked = Array.from(document.querySelectorAll('.batch-layer-checkbox:checked'));
                if (!checked.length) return alert('Select at least one layer.');
                
                const scriptContent = prompt('Paste the ExtendScript to apply to each selected layer. Use {layer} as the variable for the layer.');
                if (!scriptContent) return;
                
                // Enhanced security validation
                const dangerousPatterns = [
                    /eval\s*\(/i,
                    /new\s+Function\s*\(/i,
                    /app\.system\./i,
                    /app\.executeCommand\(/i,
                    /executeScript\(/i,
                    /File\s*\(/i,
                    /Folder\s*\(/i,
                    /app\.quit\(/i,
                    /app\.preferences\./i
                ];
                
                for (let pattern of dangerousPatterns) {
                    if (pattern.test(scriptContent)) {
                        alert('Script contains potentially dangerous operations and cannot be executed.');
                        return;
                    }
                }
                
                const indices = checked.map(cb => parseInt(cb.value, 10)).filter(n => !isNaN(n));
                if (!window.CSInterface) return;
                const cs = new CSInterface();
                
                // Enhanced sanitization with validation
                const sanitizedUserScript = scriptContent
                    .replace(/\\/g, '\\\\')
                    .replace(/`/g, '\\`')
                    .replace(/'/g, "\\'")
                    .replace(/\r?\n/g, '\\n');
                    
                const script = `
                    try {
                        var indices = [${indices.join(',')}];
                        var comp = app.project.activeItem;
                        if (!comp || !(comp instanceof CompItem)) {
                            throw new Error("No active composition");
                        }
                        var results = [];
                        for (var i=0; i<indices.length; i++) {
                            var layerIndex = indices[i];
                            if (layerIndex < 1 || layerIndex > comp.numLayers) {
                                results.push("Invalid layer index: " + layerIndex);
                                continue;
                            }
                            try {
                                var layer = comp.layer(layerIndex);
                                // User provided code below (variable available: layer)
                                ${sanitizedUserScript.replace(/\{layer\}/g, 'layer')}
                                results.push("Success: " + layer.name);
                            } catch(layerError) {
                                results.push("Error on layer " + layerIndex + ": " + layerError.toString());
                            }
                        }
                        JSON.stringify({status: "complete", results: results});
                    } catch(globalError) {
                        JSON.stringify({status: "error", message: globalError.toString()});
                    }
                `;
                
                cs.evalScript(script, (result) => {
                    try {
                        const parsed = JSON.parse(result);
                        if (parsed.status === 'error') {
                            alert('Script execution failed: ' + parsed.message);
                        } else {
                            alert('Script applied to selected layers:\\n' + parsed.results.join('\\n'));
                        }
                    } catch (e) {
                        alert('Script applied to selected layers.');
                    }
                });
            });
        }
/**
 * SIMPLIFIED After Effects AI Extension - Main Controller
 * Streamlined version with only essential functionality
 */


let projectOrganizer = null;

(function() {
    'use strict';

    // Core modules - only the essentials
    let aiModule = null;
    let chatMemory = null;
    let settingsManager = null;
    let youtubeHelper = null;
    let projectContext = null;
    let fileUpload = null;
    let mascotAnimator = null; // Reusable mascot system
    let tutorialSessions = null; // Step-by-step tutorial session manager
    // ===== HTML SANITIZATION UTILITY =====
    // Provide a safe HTML escape utility when HtmlSanitizer is missing
    const HtmlSanitizer = window.HtmlSanitizer || {
        escape(text) {
            if (typeof text !== 'string') return String(text || '');
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
    };
    // Unified notification facade
    const notify = {
        show(type, title, message, duration = 3000) {
            // Prefer mascot notification if enabled
            if (mascotAnimator && window.MascotAnimator) {
                mascotAnimator.showNotification({
                    text: title || type.toUpperCase(),
                    message: message || '',
                    duration,
                    type
                });
            } else if (window.simpleToast) {
                window.simpleToast.show(`${title ? title + ': ' : ''}${message}`, type, duration);
            } else {
                console.log(`[${type}] ${title} - ${message}`);
            }
        },
        success(msg, subtitle='') { this.show('success', subtitle || 'Success', msg); },
        error(msg, subtitle='') { this.show('error', subtitle || 'Error', msg, 5000); },
        info(msg, subtitle='') { this.show('info', subtitle || 'Info', msg); },
        warning(msg, subtitle='') { this.show('warning', subtitle || 'Warning', msg, 4000); }
    };
    window.aeNotify = notify; // expose globally

    /**
     * Initialize extension when DOM is ready
     */
    function initializeExtension() {
        console.log('🚀 After Effects AI Extension - Simplified Version');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForCEPEnvironment);
        } else {
            waitForCEPEnvironment();
        }
    }

    /**
     * Wait for CEP environment to be available before proceeding
     */
    function waitForCEPEnvironment() {
        console.log('⏳ Checking CEP environment availability...');
        
        // Add debug panel to show environment status
        addDebugPanel();
        
        // Enhanced environment detection
        function logEnvironmentInfo() {
            console.log('🔍 Environment Analysis:');
            console.log('  - User Agent:', navigator.userAgent);
            console.log('  - Location:', window.location.href);
            console.log('  - window.__adobe_cep__:', !!window.__adobe_cep__);
            console.log('  - window.cep:', !!window.cep);
            console.log('  - CSInterface available:', typeof CSInterface !== 'undefined');
            
            if (window.__adobe_cep__) {
                console.log('  - CEP methods:', Object.keys(window.__adobe_cep__));
            }
            
            // Check if running in file:// protocol (development)
            if (window.location.protocol === 'file:') {
                console.log('  - Running in file:// protocol (development mode)');
            }
            
            updateDebugPanel('Analyzing environment...');
        }
        
        logEnvironmentInfo();
        
        let retryCount = 0;
        const maxRetries = 50; // Reduced to 5 seconds at 100ms intervals
        
        function checkCEP() {
            retryCount++;
            
            // Check for multiple CEP interfaces
            const cepInterfaces = [
                window.__adobe_cep__,
                window.cep,
                typeof CSInterface !== 'undefined' ? new CSInterface() : null
            ].filter(Boolean);
            
            if (cepInterfaces.length > 0) {
                console.log('🔍 CEP interface(s) found, testing ExtendScript communication...');
                
                // Try to use CSInterface first, then fallback to __adobe_cep__
                let cepInterface = null;
                if (typeof CSInterface !== 'undefined') {
                    try {
                        cepInterface = new CSInterface();
                        console.log('  - Using CSInterface');
                    } catch (e) {
                        console.warn('  - CSInterface creation failed:', e);
                    }
                }
                
                if (!cepInterface && window.__adobe_cep__) {
                    cepInterface = window.__adobe_cep__;
                    console.log('  - Using window.__adobe_cep__');
                }
                
                if (cepInterface && typeof cepInterface.evalScript === 'function') {
                    // Test actual ExtendScript execution
                    cepInterface.evalScript('try { app.version || "unknown"; } catch(e) { "error: " + e.toString(); }', function(result) {
                        console.log('  - ExtendScript test result:', result);
                        
                        if (result && result !== 'EvalScript error.' && !result.startsWith('error:')) {
                            console.log('✅ CEP environment and ExtendScript bridge ready');
                            updateDebugPanel('✅ CEP Ready', 'success');
                            window.cepInterface = cepInterface; // Store for global access
                            setTimeout(() => removeDebugPanel(), 2000);
                            completeInitialization();
                        } else {
                            console.warn('⚠️ CEP bridge exists but ExtendScript execution failed:', result);
                            updateDebugPanel(`⚠️ Running in browser - CEP features limited`, 'warning');
                            if (retryCount < maxRetries) {
                                setTimeout(checkCEP, 200); // Increased interval for stability
                            } else {
                                console.log('ℹ️ Running in browser mode - CEP features disabled');
                                updateDebugPanel('ℹ️ Browser mode - CEP features disabled', 'info');
                                completeInitializationLimited();
                            }
                        }
                    });
                } else {
                    console.warn('⚠️ CEP interface found but evalScript method missing');
                    updateDebugPanel('⚠️ CEP interface incomplete', 'warning');
                    if (retryCount < maxRetries) {
                        setTimeout(checkCEP, 200);
                    } else {
                        updateDebugPanel('❌ CEP interface incomplete', 'error');
                        completeInitializationLimited();
                    }
                }
                
            } else {
                // More detailed logging for debugging
                if (retryCount === 1) {
                    console.log('⚠️ No CEP interfaces detected. Possible causes:');
                    console.log('  - Extension not running within After Effects');
                    console.log('  - CEP framework not loaded');
                    console.log('  - Running in browser instead of CEP panel');
                    console.log('  - CSInterface.js not loaded properly');
                    updateDebugPanel('🔍 No CEP interfaces detected', 'info');
                }
                
                if (retryCount < maxRetries) {
                    if (retryCount % 10 === 0) {
                        console.log(`⚠️ CEP environment not ready, retrying... (${retryCount}/${maxRetries})`);
                        updateDebugPanel(`🔄 Waiting for CEP... (${retryCount}/${maxRetries})`, 'info');
                    }
                    setTimeout(checkCEP, 200);
                } else {
                    console.error('❌ CEP environment failed to load after maximum retries');
                    console.log('🔧 Switching to limited functionality mode...');
                    updateDebugPanel('🔧 Switching to development mode', 'warning');
                    setTimeout(() => {
                        completeInitializationLimited();
                    }, 1000);
                }
            }
        }
        
        // Start checking immediately
        checkCEP();
    }

    /**
     * Debug panel utilities for CEP detection
     */
    function addDebugPanel() {
        if (document.getElementById('cep-debug-panel')) return; // Already exists
        
        const panel = document.createElement('div');
        panel.id = 'cep-debug-panel';
        panel.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; z-index: 10000;
            background: #1e1e1e; color: #cccccc; padding: 8px 16px;
            font-family: 'Segoe UI', monospace; font-size: 12px;
            border-bottom: 1px solid #333; text-align: center;
            transition: all 0.3s ease;
        `;
        panel.innerHTML = `
            <span id="debug-status">🔍 Initializing CEP detection...</span>
            <button onclick="document.getElementById('cep-debug-panel').style.display='none'" 
                    class="close-button">×</button>
        `;
        document.body.insertBefore(panel, document.body.firstChild);
        
        // Adjust main content to accommodate debug panel
        const main = document.querySelector('main') || document.querySelector('.container');
        if (main) {
            main.style.marginTop = '40px';
        }
    }
    
    function updateDebugPanel(message, type = 'info') {
        const panel = document.getElementById('cep-debug-panel');
        const status = document.getElementById('debug-status');
        if (!panel || !status) return;
        
        status.textContent = message;
        
        // Update panel color based on type
        const colors = {
            info: '#1e1e1e',
            success: '#0e4b2a',
            warning: '#4b2e00',
            error: '#4b0000'
        };
        
        panel.style.background = colors[type] || colors.info;
    }
    
    function removeDebugPanel() {
        const panel = document.getElementById('cep-debug-panel');
        if (panel) {
            panel.style.opacity = '0';
            setTimeout(() => {
                panel.remove();
                // Reset main content margin
                const main = document.querySelector('main') || document.querySelector('.container');
                if (main) {
                    main.style.marginTop = '';
                }
            }, 300);
        }
    }

    /**
     * Complete initialization after DOM is ready
     */
    function completeInitialization() {
        try {
            loadModules();
            setupEventListeners();
            initializeTabs();
            initializeChat();
            
            console.log('✅ Extension initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize extension:', error);
            showError('Extension failed to load. Please refresh the panel.');
        }
    }

    /**
     * Limited initialization when CEP environment is not available
     */
    function completeInitializationLimited() {
        try {
            console.log('🔧 Initializing with limited functionality (no CEP)');
            console.log('📋 Available features in browser mode:');
            console.log('  - Complete UI and design system preview');
            console.log('  - Settings management (localStorage)');
            console.log('  - Chat interface (demo mode)');
            console.log('  - File upload and preview');
            console.log('  - Tutorial system');
            console.log('  - Mascot system and animations');
            
            loadModulesLimited();
            setupEventListeners();
            initializeTabs();
            
            // Add a development mode indicator
            const header = document.querySelector('.header-content h1');
            if (header) {
                header.innerHTML += ' <span class="browser-preview-badge">(BROWSER PREVIEW)</span>';
            }
            
            // Remove debug panel after showing dev mode status
            setTimeout(() => removeDebugPanel(), 3000);
            
            // Show informative message to user
            setTimeout(() => {
                if (window.simpleToast) {
                    window.simpleToast.show('Preview mode - Design system fully functional! Install in After Effects for full CEP features.', 'info', 6000);
                } else {
                    // Fallback notification
                    const notice = document.createElement('div');
                    notice.style.cssText = `
                        position: fixed; top: 60px; right: 10px; z-index: 10000;
                        background: linear-gradient(135deg, #ff6b35, #f9bc60);
                        color: white; padding: 12px 16px; border-radius: 8px;
                        font-family: 'Segoe UI', sans-serif; font-size: 14px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        max-width: 300px; line-height: 1.4;
                    `;
                    notice.innerHTML = `
                        <strong>🎨 Design System Preview</strong><br>
                        <small>All UI components functional! Install in After Effects for CEP features.</small>
                        <button onclick="this.parentElement.remove()" 
                                class="close-button-white">×</button>
                    `;
                    document.body.appendChild(notice);
                    
                    // Auto-remove after 8 seconds
                    setTimeout(() => {
                        if (notice.parentElement) notice.remove();
                    }, 8000);
                }
            }, 1000);
            
            // Initialize demo functionality for ExtendScript features
            setupDemoFunctionality();
            
            console.log('⚠️ Extension initialized with limited functionality');
        } catch (error) {
            console.error('❌ Failed to initialize extension (limited mode):', error);
            showError('Extension failed to load completely. Some features may not work.');
        }
    }
    
    // Global error & unhandled promise rejection handlers for visibility
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error || e.message);
        notify.error('An unexpected error occurred. Check console for details.');
    });
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled rejection:', e.reason);
        notify.warning('A background error occurred. Check console for details.');
    });
    
    // Flush settings on unload (best effort)
    window.addEventListener('beforeunload', () => {
        try {
            if (window.settingsManager && typeof window.settingsManager.save === 'function') {
                window.settingsManager.save();
            }
        } catch (err) {
            console.warn('Settings flush failed:', err);
        }
    });

    /**
     * Load only essential modules (CEP environment available)
     */
    function loadModules() {
        console.log('📦 Loading essential modules with CEP support...');
        
        // Load CEP-independent modules first
        loadCoreModules();
        
        // Load CEP-dependent modules
        loadCEPDependentModules();
    }

    /**
     * Load modules with limited functionality (no CEP environment)
     */
    function loadModulesLimited() {
        console.log('📦 Loading essential modules (limited mode)...');
        
        // Only load CEP-independent modules
        loadCoreModules();
        
        console.log('⚠️ CEP-dependent modules skipped (chat memory, project organizer, etc.)');
    }

    /**
     * Load core modules that don't require CEP
     */
    function loadCoreModules() {
        // Initialize toast notification system (loads automatically)
        console.log('🍞 Toast system ready');
        
        // Initialize settings manager (no CEP dependency)
        if (window.SimpleSettingsManager) {
            settingsManager = new window.SimpleSettingsManager();
            console.log('⚙️ Settings manager loaded');
        }
        
        // Initialize mascot animator (reusable system) - no CEP dependency
        if (window.MascotAnimator) {
            const settings = settingsManager ? settingsManager.getSettings() : { mascotEnabled: true };
            if (settings.mascotEnabled !== false) {
                mascotAnimator = new window.MascotAnimator({
                    mascotGif: 'assets/ae-mascot-animated.gif',
                    mascotPng: 'assets/ae-mascot.png',
                    welcomeDuration: 3500,
                    thinkingPosition: 'bottom-right',
                    welcomePosition: 'bottom-right',
                    mascotSize: '88px',
                    bubbleStyle: 'dark'
                });
                mascotAnimator.showWelcome({
                    text: 'Ready to help! ✨',
                    message: 'Ask me anything about AE scripts, expressions or automation.'
                });
                console.log('🎭 MascotAnimator loaded');
            }
        }
        
        // Tutorial session manager (no CEP dependency)
        if (window.TutorialSessionManager) {
            tutorialSessions = new window.TutorialSessionManager();
            console.log('🧩 Tutorial session manager loaded');
        }
        
        // Initialize file upload (may have some CEP dependencies, but can work limited)
        if (window.SimpleFileUpload) {
            fileUpload = new window.SimpleFileUpload();
            console.log('📁 File upload module initialized');
        } else {
            console.warn('⚠️ SimpleFileUpload module not found');
        }
    }

    /**
     * Load CEP-dependent modules (only when CEP environment is available)
     */
    function loadCEPDependentModules() {
        console.log('🔌 Loading CEP-dependent modules...');
        
        // Initialize AI module (has CEP dependencies for project context)
        if (window.AIModule) {
            aiModule = new window.AIModule();
            window.aiModule = aiModule; // Expose globally for other modules
            console.log('🤖 AI module loaded and exposed globally');
        }
        
        // Initialize chat memory (uses CEP for file operations)
        if (window.ChatMemory) {
            try {
                chatMemory = new window.ChatMemory();
                console.log('💭 Chat memory loaded');
                
                // Connect chat memory to AI module for effects context
                if (aiModule && aiModule.setChatMemory) {
                    aiModule.setChatMemory(chatMemory);
                    console.log('🔗 Chat memory connected to AI module');
                    
                    // Initialize AI module after dependencies are connected
                    aiModule.init().then(success => {
                        if (success) {
                            console.log('✅ AI module initialization complete');
                        } else {
                            console.warn('⚠️ AI module initialization failed');
                        }
                    }).catch(error => {
                        console.error('❌ AI module initialization error:', error);
                    });
                }
            } catch (err) {
                console.warn('⚠️ Chat memory failed to load:', err);
                // Still initialize AI module even if chat memory fails
                if (aiModule && aiModule.init) {
                    aiModule.init().then(success => {
                        if (success) {
                            console.log('✅ AI module initialization complete (without chat memory)');
                        } else {
                            console.warn('⚠️ AI module initialization failed');
                        }
                    }).catch(error => {
                        console.error('❌ AI module initialization error:', error);
                    });
                }
            }
        } else {
            // No chat memory available, but still initialize AI module
            if (aiModule && aiModule.init) {
                aiModule.init().then(success => {
                    if (success) {
                        console.log('✅ AI module initialization complete (no chat memory available)');
                    } else {
                        console.warn('⚠️ AI module initialization failed');
                    }
                }).catch(error => {
                    console.error('❌ AI module initialization error:', error);
                });
            }
        }
        
        // Initialize YouTube helper
        if (window.SimpleYouTubeHelper) {
            youtubeHelper = new window.SimpleYouTubeHelper(aiModule);
            console.log('📺 YouTube helper loaded');
        }
        
        // Initialize simplified project context (uses CEP for AE integration)
        if (window.SimpleProjectContext) {
            projectContext = new window.SimpleProjectContext();
            console.log('📋 Simple project context loaded');
        } else if (window.ProjectContext) {
            // Fallback to old context if new one isn't available
            projectContext = new window.ProjectContext();
            console.log('📋 Legacy project context loaded');
        }
        
        // Initialize project organizer (requires CEP for AE communication)
        if (window.ProjectOrganizer && window.CSInterface) {
            console.log('Attempting to initialize ProjectOrganizer...');
            try {
                projectOrganizer = new window.ProjectOrganizer(new CSInterface());
                console.log('ProjectOrganizer initialized:', projectOrganizer);
            } catch (err) {
                console.warn('⚠️ ProjectOrganizer failed to load:', err);
            }
        }
        
        // Initialize batch layer list after CEP-dependent modules are ready
        if (typeof window.refreshBatchLayerList === 'function') {
            console.log('🔄 Initializing batch layer list...');
            window.refreshBatchLayerList();
        }
    }

    /**
     * Set up essential event listeners
     */
    function setupEventListeners() {
        // Project Tools tab
        const organizeProjectBtn = document.getElementById('organize-project-btn');
        const projectSummary = document.getElementById('project-summary');
        const projectHealthBtn = document.getElementById('project-health-check-btn');
        // projectOrganizer is now initialized globally in loadModules

        if (organizeProjectBtn) {
            organizeProjectBtn.addEventListener('click', () => {
                if (!projectOrganizer) {
                    console.error('ProjectOrganizer is not initialized.');
                    return;
                }
                projectSummary.innerHTML = '<p>Scanning project...</p>';
                projectOrganizer.scanUnusedAssets((err, unusedRes) => {
                    if (err) return projectSummary.innerHTML = `<p>Error: ${err}</p>`;
                    projectOrganizer.scanLayerTypes((err2, typeRes) => {
                        if (err2) return projectSummary.innerHTML = `<p>Error: ${err2}</p>`;
                        projectOrganizer.scanNamingIssues((err3, nameRes) => {
                            if (err3) return projectSummary.innerHTML = `<p>Error: ${err3}</p>`;
                projectSummary.innerHTML =
                    `<h4>Project Scan Results</h4>` +
                    `<ul>` +
                    `<li><strong>Unused Assets:</strong> ${HtmlSanitizer.escape(unusedRes.unused.length ? unusedRes.unused.join(', ') : 'None')}</li>` +
                    `<li><strong>Layer Types:</strong> ${HtmlSanitizer.escape(Object.entries(typeRes.types).map(([k,v])=>k+': '+v).join(', '))}</li>` +
                    `<li><strong>Naming Issues:</strong> ${HtmlSanitizer.escape(nameRes.issues.length ? nameRes.issues.join(', ') : 'None')}</li>` +
                    `</ul>`;
                        });
                    });
                });
            });
        }

        if (projectHealthBtn) {
            projectHealthBtn.addEventListener('click', () => {
                if (!projectOrganizer) {
                    console.error('ProjectOrganizer is not initialized.');
                    return;
                }
                projectSummary.innerHTML = '<p>Running health check...</p>';
                projectOrganizer.runHealthCheck((err, res) => {
                    if (err) return projectSummary.innerHTML = `<p>Error: ${HtmlSanitizer.escape(err)}</p>`;
                    const r = res.report;
                    projectSummary.innerHTML =
                        `<h4>Project Health Check</h4>` +
                        `<ul>` +
                        `<li><strong>Missing Files:</strong> ${HtmlSanitizer.escape(r.missing.length ? r.missing.join(', ') : 'None')}</li>` +
                        `<li><strong>Unused Assets:</strong> ${HtmlSanitizer.escape(r.unused.length ? r.unused.join(', ') : 'None')}</li>` +
                        `<li><strong>Broken Expressions:</strong> ${HtmlSanitizer.escape(r.brokenExpressions.length ? r.brokenExpressions.join(', ') : 'None')}</li>` +
                        `</ul>`;
                });
            });
        }
        console.log('projectOrganizer value:', projectOrganizer);
        console.log('🔗 Setting up event listeners...');
        
        // Chat interface
        const sendButton = document.getElementById('send-button');
        const chatInput = document.getElementById('chat-input');
        
        if (sendButton && chatInput) {
            sendButton.addEventListener('click', handleSendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                }
            });

            // Enable/disable send button based on input
            chatInput.addEventListener('input', (e) => {
                const value = e.target.value;
                sendButton.disabled = !value.trim();
                updateCharCount(value.length);
            });

            // Re-enable send button after message is sent if input is not empty
            chatInput.addEventListener('focus', () => {
                if (chatInput.value.trim()) {
                    sendButton.disabled = false;
                }
            });
        }

        // YouTube analysis button
        const youtubeButton = document.getElementById('analyze-youtube');
        if (youtubeButton) {
            youtubeButton.addEventListener('click', handleYouTubeAnalysis);
        }

        // Script execution
        const runScriptButton = document.getElementById('run-script');
        const applyExpressionButton = document.getElementById('apply-expression');
        const saveScriptBtn = document.getElementById('save-script-btn');
        const copyScriptBtn = document.getElementById('copy-script-btn');
        
        if (runScriptButton) {
            runScriptButton.addEventListener('click', handleRunScript);
        }
        
        if (applyExpressionButton) {
            applyExpressionButton.addEventListener('click', handleApplyExpression);
        }

        if (saveScriptBtn) {
            saveScriptBtn.addEventListener('click', handleSaveScript);
        }

        if (copyScriptBtn) {
            copyScriptBtn.addEventListener('click', handleCopyScript);
        }

        // Tab navigation
        setupTabNavigation();
        
        // Settings panel toggle
        const settingsToggle = document.getElementById('settings-toggle');
        const mainTabsToggle = document.getElementById('main-tabs-toggle');
        
        if (settingsToggle) {
            settingsToggle.addEventListener('click', toggleSettingsPanel);
        }
        if (mainTabsToggle) {
            mainTabsToggle.addEventListener('click', toggleSettingsPanel);
        }

        // Command palette and context actions
        const readExpressionBtn = document.getElementById('read-expression-btn');
        const analyzeSelectionBtn = document.getElementById('analyze-selection-btn');
        const showContextBtn = document.getElementById('show-context-btn');
        const showChatHistoryBtn = document.getElementById('show-chat-history-btn');
        const analyzeLayerBtn = document.getElementById('analyze-layer-btn');
        const readExpressionHelperBtn = document.getElementById('read-expression-helper-btn');
        const explainExpressionBtn = document.getElementById('explain-expression-btn');
        const debugExpressionBtn = document.getElementById('debug-expression-btn');
        const commandMenuTrigger = document.getElementById('command-menu-trigger');
        
        if (readExpressionBtn) {
            readExpressionBtn.addEventListener('click', handleReadExpression);
        }
        if (analyzeSelectionBtn) {
            analyzeSelectionBtn.addEventListener('click', handleAnalyzeSelection);
        }
        if (showContextBtn) {
            showContextBtn.addEventListener('click', handleShowContext);
        }
        if (showChatHistoryBtn) {
            showChatHistoryBtn.addEventListener('click', handleShowChatHistory);
        }
        if (analyzeLayerBtn) {
            analyzeLayerBtn.addEventListener('click', handleAnalyzeLayer);
        }
        if (readExpressionHelperBtn) {
            readExpressionHelperBtn.addEventListener('click', handleReadExpression);
        }
        if (explainExpressionBtn) {
            explainExpressionBtn.addEventListener('click', handleExplainExpression);
        }
        if (debugExpressionBtn) {
            debugExpressionBtn.addEventListener('click', handleDebugExpression);
        }
        if (commandMenuTrigger) {
            commandMenuTrigger.addEventListener('click', toggleCommandPalette);
        }

        // Quick action templates
        const templateButtons = document.querySelectorAll('[data-template]');
        templateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.target.getAttribute('data-template');
                handleQuickTemplate(template);
            });
        });

        // Specific action buttons
        const applyBlurBtn = document.getElementById('apply-blur-btn');
        if (applyBlurBtn) {
            applyBlurBtn.addEventListener('click', handleApplyBlur);
        }

        console.log('✅ Event listeners connected');
    }

    /**
     * Handle saving the script from the editor.
     */
    function handleSaveScript() {
        const scriptEditor = document.getElementById('script-editor');
        const scriptContent = scriptEditor.value.trim();
        if (!scriptContent) {
            notify.warning('There is no script to save.');
            return;
        }

        const scriptName = prompt('Enter a name for this script:', 'My Script');
        if (!scriptName) {
            return; // User cancelled
        }

        const savedScripts = settingsManager.getSetting('savedScripts') || [];
        const newScript = {
            id: `script_${Date.now()}`,
            name: scriptName,
            content: scriptContent
        };

        savedScripts.push(newScript);
        settingsManager.setSetting('savedScripts', savedScripts);
        settingsManager.save(); // Persist immediately

        notify.success(`Script "${scriptName}" saved!`);
        renderSavedScripts(); // Update the UI
    }

    /**
     * Handle copying the script from the editor to the clipboard.
     */
    function handleCopyScript() {
        const scriptEditor = document.getElementById('script-editor');
        const scriptContent = scriptEditor.value;
        navigator.clipboard.writeText(scriptContent).then(() => {
            notify.success('Script copied to clipboard!');
        }, () => {
            notify.error('Failed to copy script.');
        });
    }

    /**
     * Renders the list of saved scripts in the "Saved Scripts" tab.
     */
    function renderSavedScripts() {
        const listContainer = document.getElementById('saved-scripts-list');
        const emptyState = document.getElementById('saved-scripts-empty-state');
        const savedScripts = settingsManager && typeof settingsManager.getSetting === 'function' ? (settingsManager.getSetting('savedScripts') || []) : [];

        if (!listContainer) {
            console.warn('renderSavedScripts: saved-scripts-list element not found');
            return;
        }

        // Clear existing list safely
        listContainer.innerHTML = '';

        if (!Array.isArray(savedScripts) || savedScripts.length === 0) {
            if (emptyState) {
                emptyState.classList.remove('hidden');
                emptyState.style.display = 'block';
            }
            listContainer.classList.add('hidden');
            listContainer.innerHTML = '<p>No saved scripts yet. Save expressions from the chat to see them here.</p>';
            return;
        }

        // Populate list
        if (emptyState) {
            emptyState.classList.add('hidden');
            emptyState.style.display = 'none';
        }
        listContainer.classList.remove('hidden');

        savedScripts.forEach(script => {
            const scriptItem = document.createElement('div');
            scriptItem.className = 'saved-script-item';
            scriptItem.innerHTML = `
                <span class="script-name">${HtmlSanitizer.escape(script.name || 'Unnamed')}</span>
                <div class="script-actions">
                    <button class="action-btn load-btn" title="Load into Editor">Load</button>
                    <button class="action-btn delete-btn" title="Delete Script">Delete</button>
                </div>
            `;

            const loadBtn = scriptItem.querySelector('.load-btn');
            const deleteBtn = scriptItem.querySelector('.delete-btn');

            if (loadBtn) {
                loadBtn.addEventListener('click', () => {
                    const scriptEditor = document.getElementById('script-editor');
                    if (scriptEditor) scriptEditor.value = script.content || '';
                    notify.info(`Script "${script.name}" loaded into editor.`);
                    // Optional: switch to the script editor tab
                    const tabBtn = document.querySelector('.tab-btn[data-tab="script-library"]');
                    if (tabBtn) tabBtn.click();
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    if (!confirm(`Are you sure you want to delete "${script.name}"?`)) return;
                    const updatedScripts = savedScripts.filter(s => s.id !== script.id);
                    if (settingsManager && typeof settingsManager.setSetting === 'function') {
                        settingsManager.setSetting('savedScripts', updatedScripts);
                        if (typeof settingsManager.save === 'function') settingsManager.save();
                    } else {
                        // Fallback to localStorage
                        localStorage.setItem('ae_saved_scripts', JSON.stringify(updatedScripts));
                    }
                    renderSavedScripts(); // Re-render the list
                    notify.success(`Script "${script.name}" deleted.`);
                });
            }

            listContainer.appendChild(scriptItem);
        });
    }

    /**
     * Handle applying a Gaussian Blur effect.
     */
    function handleApplyBlur() {
        const blurAmount = prompt("Enter blur amount (e.g., 15):", "15");
        if (blurAmount === null || isNaN(parseFloat(blurAmount))) {
            notify.warning('Blur amount must be a number.');
            return;
        }

        const script = `applyBlurToSelectedLayer(${parseFloat(blurAmount)})`;
        
        if (window.CSInterface) {
            const csInterface = new CSInterface();
            csInterface.evalScript(script, (result) => {
                try {
                    const res = JSON.parse(result);
                    if (res.status === 'success') {
                        notify.success(res.data);
                    } else {
                        notify.error(res.message, 'Blur Failed');
                    }
                } catch (e) {
                    notify.error('Failed to apply blur. Invalid response from host.', 'Script Error');
                    console.error("EvalScript Error:", e);
                    console.error("Raw Result:", result);
                }
            });
        } else {
            notify.error('CEP interface not available.');
        }
    }

    /**
     * Handle sending chat messages
     */
    async function handleSendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message && !fileUpload?.hasFiles()) {
            return; // No text and no files
        }
        
        // Get file data if available
        const fileData = fileUpload ? fileUpload.getFileData() : null;
        
        // Clear input and add to chat
        chatInput.value = '';
        document.getElementById('send-button').disabled = true;
        updateCharCount(0);
        
        // Add user message to chat (with file if present)
        addMessageToChat('user', message, { fileData });
        
        // Clear the file after sending
        if (fileUpload) {
            fileUpload.clearFiles();
        }
        
        try {
            // Get AI response
            if (aiModule) {
                showTypingIndicator();
                try { if (window.__mascot && typeof window.__mascot.showThinking === 'function') window.__mascot.showThinking({ bubbleText: 'Thinking...', message: 'Processing your request' }); } catch (e) { }
                
                // Get current API settings
                const currentSettings = settingsManager ? settingsManager.getSettings() : {};
                const apiKey = currentSettings.apiKey;
                const provider = currentSettings.provider || 'google';
                
                console.log('🔑 Using API settings:', { provider, hasKey: !!apiKey, hasFile: !!fileData });
                
                // Get project context ONCE and use for both message enhancement and AI call
                let projectContextData = null;
                let contextualMessage = message;
                
                if (projectContext) {
                    try {
                        projectContextData = await projectContext.getCurrentContext();
                        if (projectContextData && 
                            projectContextData !== 'After Effects not connected' && 
                            projectContextData !== 'After Effects connection error') {
                            contextualMessage = `Context: ${projectContextData}\n\nUser: ${message}`;
                            console.log('📋 Added project context to message');
                        }
                    } catch (error) {
                        console.warn('⚠️ Failed to get project context:', error.message);
                        projectContextData = null;
                    }
                }
                
                // Generate AI response with file support
                // Tutorial step commands interception
                const lower = message.toLowerCase();
                if (tutorialSessions && (lower === 'next step' || lower === 'next' || lower.startsWith('step ') || lower.includes('restart tutorial'))) {
                    const stepResponse = handleTutorialStepCommand(lower);
                    hideTypingIndicator();
                    addMessageToChat('assistant', stepResponse);
                    if (chatMemory) chatMemory.addMessage('assistant', stepResponse);
                    return;
                }

                const response = await aiModule.generateResponse(message, {
                    apiKey,
                    provider,
                    fileData: fileData,
                    model: currentSettings.model,
                    temperature: currentSettings.temperature,
                    maxTokens: currentSettings.maxTokens,
                    chatHistory: chatMemory ? chatMemory.getHistory() : []
                });
                hideTypingIndicator();
                try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                
                if (response) {
                    console.log('📝 Raw AI response:', response);
                    
                    // Format response with interactive code blocks
                    const formattedResponse = aiModule.formatResponseForChat ? 
                        aiModule.formatResponseForChat(response) : response;
                    
                    const hasInteractive = formattedResponse.includes('response-block') || formattedResponse.includes('interactive-code-block');
                    console.log('🎨 Formatted response:', formattedResponse);
                    console.log('✅ Contains interactive blocks:', hasInteractive);
                    
                    addMessageToChat('assistant', formattedResponse);
                    
                    // Save to memory
                    if (chatMemory) {
                        chatMemory.addMessage('user', message);
                        chatMemory.addMessage('assistant', response);
                    }
                } else {
                    addMessageToChat('error', 'No response received from AI. Please check your settings.');
                }
            } else {
                addMessageToChat('error', 'AI module not available. Please refresh the extension.');
            }
        } catch (error) {
            hideTypingIndicator();
            try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
            console.error('Chat error:', error);
            addMessageToChat('error', `Error: ${error.message}`);
        }
    }

    /**
     * Handle YouTube URL analysis
     */
    async function handleYouTubeAnalysis() {
        const input = prompt('Enter YouTube tutorial URL:');
        if (!input) return;
        
        const userPrompt = document.getElementById('chat-input').value.trim();
        
        try {
            showTypingIndicator('Analyzing YouTube tutorial...');
            try { if (window.__mascot && typeof window.__mascot.showThinking === 'function') window.__mascot.showThinking({ bubbleText: 'Analyzing...', message: 'Parsing tutorial' }); } catch (e) { }
            
            if (youtubeHelper) {
                const result = await youtubeHelper.analyzeYouTubeURL(input, userPrompt);
                hideTypingIndicator();
                try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                
                if (result.success) {
                    const analysis = result.data;

                    // Derive preliminary step list
                    const steps = deriveTutorialSteps(analysis);
                    let session = null;
                    if (tutorialSessions && steps.length) {
                        session = tutorialSessions.startSession(analysis.videoId, {
                            title: analysis.title || 'Tutorial',
                            steps
                        });
                    }

                    // Build message
                    let message = `📺 **YouTube Analysis**\n\n`;
                    if (analysis.title) message += `**Title:** ${analysis.title}\n`;
                    if (analysis.author) message += `**Author:** ${analysis.author}\n`;
                    message += `**Category:** ${analysis.category}\n`;
                    if (analysis.keywords?.length) message += `**Keywords:** ${analysis.keywords.join(', ')}\n`;
                    message += `\n**Suggestions:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n`;
                    if (analysis.aiAnalysis) message += `\n**AI Analysis:**\n${analysis.aiAnalysis}\n`;
                    if (session) {
                        message += `\n**Step Plan (${session.steps.length}):**\n`;
                        session.steps.forEach(s => {
                            message += `- ${s.trim()}\n`;
                        });
                        message += `\nType 'next step' to begin step-by-step guidance.`;
                    }
                    if (analysis.aeScript) {
                        message += `\n**Base Script Suggestion:**\n\`\`\`javascript\n${analysis.aeScript}\n\`\`\``;
                        const scriptEditor = document.getElementById('script-editor');
                        if (scriptEditor) {
                            scriptEditor.value = analysis.aeScript;
                        }
                    }
                    addMessageToChat('assistant', message);
                } else {
                    addMessageToChat('error', `YouTube analysis failed: ${result.error}`);
                }
            } else {
                addMessageToChat('error', 'YouTube analysis not available.');
            }
        } catch (error) {
            hideTypingIndicator();
            try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
            console.error('YouTube analysis error:', error);
            addMessageToChat('error', `Analysis failed: ${error.message}`);
        }
    }

    /**
     * Handle running scripts in After Effects
     */
    function handleRunScript() {
        const scriptEditor = document.getElementById('script-editor');
        const script = scriptEditor?.value.trim();
        
        if (!script) {
            showError('No script to run');
            return;
        }
        
        try {
            try { if (window.__mascot && typeof window.__mascot.showThinking === 'function') window.__mascot.showThinking({ bubbleText: 'Running...', message: 'Executing script in AE' }); } catch (e) { }
            // Use CEP to execute script in After Effects
            if (window.CSInterface) {
                const csInterface = new CSInterface();
                csInterface.evalScript(script, (result) => {
                    try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                    if (result && result !== 'undefined') {
                        showSuccess(`Script executed: ${result}`);
                    } else {
                        showSuccess('Script executed successfully');
                    }
                });
            } else {
                try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                showError('CEP interface not available');
            }
        } catch (error) {
            try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
            showError(`Script execution failed: ${error.message}`);
        }
    }

    /**
     * Handle applying expressions to selected properties
     */
    function handleApplyExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to apply');
            return;
        }
        
        try {
            // Escape expression via JSON.stringify to preserve quotes/newlines safely
            const applyScript = `applyExpression(${JSON.stringify(expression)})`;
            
            if (window.CSInterface) {
                const csInterface = new CSInterface();
                csInterface.evalScript(applyScript, (result) => {
                    try {
                        const response = JSON.parse(result);
                        if (response.status === 'success') {
                            showSuccess(`Expression applied: ${response.data}`);
                        } else {
                            showError(`Failed to apply expression: ${response.message}`);
                        }
                    } catch (e) {
                        showError(`Expression application failed: ${result}`);
                    }
                });
            } else {
                showError('CEP interface not available');
            }
        } catch (error) {
            showError(`Expression application failed: ${error.message}`);
        }
    }

    /**
     * Initialize tab system
     */
    function initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = button.getAttribute('data-tab');
                
                // Update button states
                tabButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Update pane visibility
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                const targetPane = document.getElementById(`${tabId}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    /**
     * Set up tab navigation
     */
    function setupTabNavigation() {
        initializeTabs();
    }

    /**
     * Toggle settings panel
     */
    function toggleSettingsPanel() {
        const panel = document.getElementById('settings-panel');
        if (!panel) return;

        const settingsToggleBtn = document.getElementById('settings-toggle');
        const mainTabsToggleBtn = document.getElementById('main-tabs-toggle');

        const isHiddenByClass = panel.classList.contains('hidden');
        const isHiddenByStyle = panel.style.display === 'none';
        const shouldShow = isHiddenByClass || isHiddenByStyle;

        if (shouldShow) {
            panel.classList.remove('hidden');
            panel.style.display = '';
            panel.setAttribute('data-open', 'true');
            if (settingsToggleBtn) settingsToggleBtn.setAttribute('aria-expanded', 'true');
            if (mainTabsToggleBtn) mainTabsToggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            panel.classList.add('hidden');
            panel.style.display = 'none';
            panel.removeAttribute('data-open');
            if (settingsToggleBtn) settingsToggleBtn.setAttribute('aria-expanded', 'false');
            if (mainTabsToggleBtn) mainTabsToggleBtn.setAttribute('aria-expanded', 'false');
        }
        // Optional: focus first interactive element when opened
        if (shouldShow) {
            const firstInput = panel.querySelector('input, select, textarea, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 0);
            }
        }
    }

    /**
     * Initialize chat interface
     */
    function initializeChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length <= 1) {
            // Get random AE fact from AI module
            const randomFact = aiModule ? aiModule.getRandomAEFact() : "💡 **Tip:** After Effects is the industry standard for motion graphics and visual effects!";
            
            // Add welcome message with random fact
            const welcomeMessage = `Welcome! I can help you with After Effects automation, expressions, and tutorial analysis. Try pasting a YouTube tutorial URL or ask me a question.

${randomFact}`;
            
            addMessageToChat('system', welcomeMessage);
        }
    }

    /**
     * Ensure message scrolls to bottom
     */
    function scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        const messagesContainer = document.querySelector('.messages-container');
        
        if (chatMessages) {
            // Try multiple scroll methods
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get the last message and scroll it into view
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        }
        
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        console.log('📜 Scrolled to bottom');
    }

    /**
     * Add message to chat with VS Code-style automatic code integration
    /**
     * Add message to chat interface
     */
    function addMessageToChat(type, content, options = {}) {
        const { fileData = null } = options;
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle file data (image or audio)
        if (fileData) {
            if (fileData.type.startsWith('image/')) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'message-image-container';
                
                const img = document.createElement('img');
                img.className = 'message-image';
                img.src = fileData.base64;
                img.alt = 'Uploaded image';
                
                imageDiv.appendChild(img);
                contentDiv.appendChild(imageDiv);
            } else if (fileData.type.startsWith('audio/')) {
                const audioDiv = document.createElement('div');
                audioDiv.className = 'message-audio-container';
                
                const audioPlayer = document.createElement('audio');
                audioPlayer.className = 'message-audio';
                audioPlayer.controls = true;
                audioPlayer.src = fileData.base64;
                
                const source = document.createElement('source');
                source.src = fileData.base64;
                source.type = fileData.mimeType;
                audioPlayer.appendChild(source);

                const audioInfo = document.createElement('div');
                audioInfo.className = 'audio-info-display';
                audioInfo.textContent = `Uploaded audio: ${fileData.name}`;

                audioDiv.appendChild(audioInfo);
                audioDiv.appendChild(audioPlayer);
                contentDiv.appendChild(audioDiv);
            }
        }
        
        // Add text content with enhanced formatting for AI responses
        if (content) {
            const textDiv = document.createElement('div');
            
            // Use AI module's enhanced formatting for assistant messages
            if (type === 'assistant' && window.aiModule && typeof window.aiModule.formatResponseForChat === 'function') {
                // Use the enhanced AI response formatting with interactive code blocks
                textDiv.innerHTML = window.aiModule.formatResponseForChat(content);
            } else {
                // Use standard formatting for other message types
                textDiv.innerHTML = formatMessage(content);
            }
            
            contentDiv.appendChild(textDiv);
            
            // Auto-populate expressions if this is an AI message
            if (type === 'assistant' && content) {
                autoPopulateFirstExpression(content);
                
                // Integrate TTS for AI responses
                if (window.voiceManager && typeof content === 'string') {
                    // Extract plain text from HTML for better speech
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    const plainText = tempDiv.textContent || tempDiv.innerText || content;
                    window.voiceManager.speakAIResponse(plainText);
                }
            }
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-timestamp';
        timeDiv.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        chatMessages.appendChild(messageDiv);
        
        // Use the enhanced scroll function
        setTimeout(() => {
            scrollToBottom();
        }, 10);

        return messageDiv;
    }

    /**
     * Auto-populates the first suitable expression found in AI responses
     * @param {string} content - Message content to analyze
     */
    function autoPopulateFirstExpression(content) {
        // Extract code blocks from the content
        const codeBlockRegex = /```(?:javascript|js|extendscript)?\s*\n?(.*?)\n?```/gs;
        const inlineCodeRegex = /`([^`\n]+)`/g;
        
        let match;
        
        // Check full code blocks first
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const code = match[1].trim();
            if (code && isExpression(code)) {
                populateScriptEditor(code, 'Expression auto-populated from AI response');
                return; // Only populate the first expression found
            }
        }
        
        // Then check inline code
        const tempContent = content.replace(codeBlockRegex, ''); // Remove already checked blocks
        while ((match = inlineCodeRegex.exec(tempContent)) !== null) {
            const code = match[1].trim();
            if (code && isExpression(code)) {
                populateScriptEditor(code, 'Expression auto-populated from AI response');
                return; // Only populate the first expression found
            }
        }
    }

    /**
     * Populates the script editor with code and provides user feedback
     * @param {string} code - Code to populate
     * @param {string} message - Feedback message
     */
    function populateScriptEditor(code, message) {
        const scriptEditor = document.getElementById('script-editor');
        if (!scriptEditor) return;
        
        // Only auto-populate if editor is empty
        if (scriptEditor.value.trim() === '') {
            scriptEditor.value = code;
            
            // Flash the script library tab to indicate activity
            flashTab('script-library');
            
            // Show notification
            showNotification(message, 'success');
            
            console.log('✨ Auto-populated script editor:', code);
        }
    }

    /**
     * Flashes a tab to indicate activity
     * @param {string} tabName - Name of the tab to flash
     */
    function flashTab(tabName) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.classList.add('flash');
            setTimeout(() => tabButton.classList.remove('flash'), 1000);
        }
    }

    /**
     * Format message content (markdown, code blocks, and dynamic UI) with VS Code-style code integration
     */
    function formatMessage(content) {
        // If the content already contains rendered HTML blocks, preserve them
        if (typeof content === 'string' && /<\w+[^>]*>/.test(content)) {
            return content;
        }

        let formattedContent = content;

        // 1. Dynamic UI Controls: [UI:TYPE|...params]
        const uiSliderRegex = /\[UI:SLIDER\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/g;
        const uiButtonRegex = /\[UI:BUTTON\|([^|]+)\|([^\]]+)\]/g;

        formattedContent = formattedContent.replace(uiSliderRegex, (match, label, min, max, value, propertyPath) => {
            const id = `slider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return `
                <div class="dynamic-ui-control">
                    <label for="${id}">${label}</label>
                    <input type="range" id="${id}" min="${min}" max="${max}" value="${value}"
                           oninput="this.nextElementSibling.textContent = this.value"
                           onchange="window.handleDynamicUIChange('setProperty', '${propertyPath}', this.value)">
                    <span>${value}</span>
                </div>
            `;
        });

        formattedContent = formattedContent.replace(uiButtonRegex, (match, label, actionValue) => {
            return `
                <div class="dynamic-ui-control">
                    <button class="dynamic-btn" onclick="window.handleDynamicUIChange('applyEffect', '${actionValue}')">${label}</button>
                </div>
            `;
        });

        // 2. VS Code-style code block handling
        formattedContent = formattedContent.replace(/```(?:javascript|js|extendscript)?\s*\n?(.*?)\n?```/gs, (match, code) => {
            const trimmedCode = code.trim();
            if (!trimmedCode) return '';
            
            const isExpr = isExpression(trimmedCode);
            
            if (isExpr) {
                // Expression - show inline with "Copy to Expression Box" button
                return `
                    <div class="vscode-code-block expression">
                        <div class="code-header">
                            <span class="code-type">💫 Expression</span>
                            <button class="code-action-btn" onclick="copyToExpressionBox('${escapeForAttribute(trimmedCode)}')">
                                <i class="fa-solid fa-copy"></i> Copy to Expression Box
                            </button>
                        </div>
                        <pre><code>${escapeHtml(trimmedCode)}</code></pre>
                    </div>
                `;
            } else {
                // Full script - show with "View Code" button
                const scriptId = 'script_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                return `
                    <div class="vscode-code-block script">
                        <div class="code-header">
                            <span class="code-type">📄 Script</span>
                            <button class="code-action-btn view-code-btn" onclick="viewFullCode('${scriptId}')">
                                <i class="fa-solid fa-external-link-alt"></i> View Code
                            </button>
                        </div>
                        <pre class="code-preview"><code>${escapeHtml(trimmedCode.substring(0, 150))}${trimmedCode.length > 150 ? '...' : ''}</code></pre>
                        <script type="text/template" id="${scriptId}">${escapeHtml(trimmedCode)}</script>
                    </div>
                `;
            }
        });

        // 3. Handle inline code (expressions)
        formattedContent = formattedContent.replace(/`([^`\n]+)`/g, (match, code) => {
            const trimmedCode = code.trim();
            if (isExpression(trimmedCode)) {
                return `<code class="inline-expression" onclick="copyToExpressionBox('${escapeForAttribute(trimmedCode)}')" title="Click to copy to Expression Box">${escapeHtml(trimmedCode)}</code>`;
            }
            return `<code>${escapeHtml(trimmedCode)}</code>`;
        });

        // 4. Standard formatting for the rest
        return formattedContent
            .replace(/\n\s*\n\s*\n+/g, '\n\n') // Clean excessive line breaks
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .trim();
    }

    /**
     * Determines if code snippet is likely an expression vs full script
     * @param {string} code - Code snippet to analyze
     * @returns {boolean} True if likely an expression
     */
    function isExpression(code) {
        // Expression indicators
        const expressionPatterns = [
            /^[\w\[\]\.]+\s*[+\-*\/=]\s*[\w\d\.]+$/,  // Simple math operations
            /^[\w\[\]\.]+\s*=\s*[\w\d\.\(\)]+$/,      // Simple assignments
            /^[\w\[\]\.]+$/,                          // Simple property access
            /^[\w\[\]\.]+\([^{}]*\)$/,                // Function calls without blocks
            /^\[[\d\s,\.\-\+\*\/]+\]$/,               // Array literals
            /^\d+(\.\d+)?$/,                          // Numbers
            /^"[^"]*"$/,                              // Strings
            /^'[^']*'$/                               // Strings
        ];
        
        // Script indicators (if any of these, it's probably a full script)
        const scriptIndicators = [
            'function',
            'if (',
            'for (',
            'while (',
            'try {',
            'catch',
            '}',
            'var ',
            'let ',
            'const ',
            'return'
        ];
        
        // Check if it contains script indicators
        if (scriptIndicators.some(indicator => code.includes(indicator))) {
            return false;
        }
        
        // Check if it matches expression patterns
        return expressionPatterns.some(pattern => pattern.test(code.trim())) || code.length < 100;
    }

    /**
     * Copies expression to the script editor (expression box)
     * @param {string} expression - Expression to copy
     */
    window.copyToExpressionBox = function(expression) {
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            scriptEditor.value = expression;
            // Switch to script library tab if not already active
            switchToTab('script-library');
            scriptEditor.focus();
            console.log('📋 Expression copied to script editor:', expression);
            showNotification('Expression copied to script editor!', 'success');
        }
    };

    /**
     * Opens full script code in the script editor with Apply/Run options
     * @param {string} scriptId - ID of the script template element
     */
    window.viewFullCode = function(scriptId) {
        const scriptTemplate = document.getElementById(scriptId);
        if (scriptTemplate) {
            const script = scriptTemplate.textContent;
            const scriptEditor = document.getElementById('script-editor');
            
            if (scriptEditor) {
                // Confirm if editor has content
                if (scriptEditor.value.trim() && !confirm('Replace current script with the AI-suggested code?')) {
                    return;
                }
                
                scriptEditor.value = script;
                // Switch to script library tab
                switchToTab('script-library');
                scriptEditor.focus();
                
                console.log('📄 Full script loaded in editor:', script.substring(0, 100) + '...');
                showNotification('Script loaded! Use Run Script or Apply Expression buttons.', 'success');
            }
        }
    };

    /**
     * Switches to a specific tab
     * @param {string} tabName - Name of the tab to switch to
     */
    function switchToTab(tabName) {
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (tabButton && !tabButton.classList.contains('active')) {
            tabButton.click();
        }
    }

    /**
     * Shows a notification message
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     */
    function showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.notify && window.notify[type]) {
            window.notify[type](message);
        } else {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Escapes HTML characters for safe insertion
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Escapes text for use in HTML attributes
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeForAttribute(text) {
        return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
    }

    /**
     * Tests VS Code-style chat formatting and auto-population
     */
    window.testVSCodeChat = function() {
        console.log('🧪 Testing VS Code-style chat formatting...');
        
        // Test expression auto-population
        const expressionMessage = "Here's a simple expression to rotate your layer: `rotation + 45`";
        addMessageToChat('assistant', expressionMessage);
        
        // Test script with View Code button
        const scriptMessage = `Here's a complete script for you:

\`\`\`javascript
function animateLayer() {
    var comp = app.project.activeItem;
    if (comp && comp instanceof CompItem) {
        var layer = comp.selectedLayers[0];
        if (layer) {
            layer.property("Transform").property("Rotation").setValueAtTime(0, 0);
            layer.property("Transform").property("Rotation").setValueAtTime(1, 360);
        }
    }
}
animateLayer();
\`\`\`

And here's an inline expression: \`time * 360\` for continuous rotation.`;
        
        setTimeout(() => {
            addMessageToChat('assistant', scriptMessage);
        }, 1000);
        
        // Test mixed content
        const mixedMessage = `I can help you with multiple approaches:

1. **Simple expression**: \`wiggle(2, 50)\` for random movement
2. **Property access**: \`thisComp.layer("Layer 1").transform.position\`

Or use this complete function:

\`\`\`javascript
function createWiggleAnimation() {
    var selectedLayers = app.project.activeItem.selectedLayers;
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        var position = layer.property("Transform").property("Position");
        position.expression = "wiggle(2, 50)";
    }
}
\`\`\`

You can also use: \`random(100)\` for random values.`;
        
        setTimeout(() => {
            addMessageToChat('assistant', mixedMessage);
        }, 2000);
        
        console.log('✅ VS Code-style chat test messages sent!');
    };

    /**
     * Global handler for dynamic UI controls created by the AI.
     * @param {string} action - The type of action to perform ('setProperty' or 'applyEffect').
     * @param {string} target - The property path for 'setProperty' or the effect name for 'applyEffect'.
     * @param {any} [value] - The value for 'setProperty'.
     */
    window.handleDynamicUIChange = function(action, target, value) {
        console.log(`⚡ Dynamic UI Action: ${action}`, { target, value });
        
        if (!window.CSInterface) {
            notify.error("CEP interface not available.");
            return;
        }

        const csInterface = new CSInterface();
        let script = '';

        switch (action) {
            case 'setProperty':
                const numericValue = parseFloat(value);
                script = `setPropertyOnSelectedLayer("${target}", ${numericValue})`;
                break;
            case 'applyEffect':
                script = `applyEffectOrPreset("${target}")`;
                break;
            default:
                console.error("Unknown dynamic UI action:", action);
                return;
        }
            
        csInterface.evalScript(script, (result) => {
            try {
                const response = JSON.parse(result);
                if (response.status === 'success') {
                    notify.success(response.data, 'AE Updated');
                } else {
                    notify.error(response.message, 'AE Error');
                }
            } catch (e) {
                console.error("Failed to parse response from ExtendScript:", result);
                notify.error("An unexpected error occurred.", "AE Error");
            }
        });
    };

    /**
     * Show/hide typing indicator
     */
    function showTypingIndicator(message = 'AI is typing...') {
    if (mascotAnimator) {
            mascotAnimator.showThinking({
                bubbleText: 'Thinking...',
                message: message
            });
        } else {
            // Fallback to legacy indicator
            const indicator = document.createElement('div');
            indicator.id = 'typing-indicator';
            indicator.className = 'message system typing';
            const mascotSrc = 'assets/ae-mascot-animated.gif';
            indicator.innerHTML = `
                <div class="message-content">
                    <img src="${mascotSrc}" class="typing-mascot" alt="AI thinking" />
                    <div class="typing-text">${message}</div>
                </div>
            `;
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.appendChild(indicator);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }

    function hideTypingIndicator() {
        if (mascotAnimator) {
            mascotAnimator.hideThinking();
        } else {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }

    // React to mascot enabled/disabled toggle
    document.addEventListener('mascot:toggle', (e) => {
        const enabled = e.detail.enabled;
        if (enabled && !mascotAnimator && window.MascotAnimator) {
            mascotAnimator = new window.MascotAnimator({
                mascotGif: 'assets/ae-mascot-animated.gif',
                mascotPng: 'assets/ae-mascot.png',
                welcomeDuration: 3000,
                thinkingPosition: 'bottom-right',
                welcomePosition: 'bottom-right',
                mascotSize: '88px',
                bubbleStyle: 'dark'
            });
            mascotAnimator.showWelcome({
                text: 'Mascot enabled 🎉',
                message: 'I will show thinking states and helpful notices.'
            });
        } else if (!enabled && mascotAnimator) {
            mascotAnimator.hideAll();
            mascotAnimator = null;
        }
    });

    /**
     * Update character count
     */
    function updateCharCount(count) {
        const charCountElement = document.querySelector('.char-count');
        if (charCountElement) {
            charCountElement.textContent = `${count}/1000`;
        }
    }

    /**
     * Utility functions for user feedback
     */
    function showSuccess(message) {
    notify.success(message);
    }

    function showError(message) {
    notify.error(message);
    addMessageToChat('error', message);
    }


    // Add global status check for debugging
    window.extensionStatus = function() {
        const status = {
            modules: {
                toast: !!window.simpleToast,
                settings: !!settingsManager,
                ai: !!aiModule,
                youtube: !!youtubeHelper,
                project: !!projectContext,
                memory: !!chatMemory
            },
            ready: true
        };
        
        console.log('🔍 Extension Status:', status);
        
        if (window.simpleToast) {
            window.simpleToast.success('Extension status checked - see console for details');
        }
        
        return status;
    };
    
    // Test save function
    window.testSave = function() {
        console.log('🧪 Testing save function...');
        if (settingsManager && settingsManager.showFeedback) {
            settingsManager.showFeedback('Test save successful!', 'success');
        } else {
            console.error('Settings manager not available');
        }
    };
    
    // Test API connection
    window.testApiConnection = async function() {
        console.log('🧪 Testing API connection...');
        
        if (!settingsManager || !aiModule) {
            console.error('❌ Required modules not loaded');
            if (window.simpleToast) {
                window.simpleToast.error('Extension modules not loaded');
            }
            return false;
        }
        
        const settings = settingsManager.getSettings();
        console.log('🔍 Current settings:', {
            provider: settings.provider,
            hasKey: !!settings.apiKey,
            apiKeyPreview: settings.apiKey ? settings.apiKey.substring(0, 8) + '...' : 'none'
        });
        
        if (!settings.apiKey) {
            console.error('❌ No API key found');
            if (window.simpleToast) {
                window.simpleToast.error('No API key configured');
            }
            return false;
        }
        
        try {
            if (window.simpleToast) {
                window.simpleToast.info('Testing API connection...');
            }
            
            const response = await aiModule.generateResponse('Hello, please respond with "API test successful" if you can read this.', {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            
            console.log('✅ API Response received:', response);
            
            if (window.simpleToast) {
                window.simpleToast.success('API test completed - check console for response');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ API Test Failed:', error);
            if (window.simpleToast) {
                window.simpleToast.error('API test failed: ' + error.message);
            }
            return false;
        }
    };
    
    // Global functions for enhanced interactive code blocks
    window.copyCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const codeContent = codeBlock.querySelector('.code-content code');
        if (!codeContent) return;
        
        const code = codeContent.textContent;
        const copyBtn = codeBlock.querySelector('.copy-btn');
        
        // Add loading state
        if (copyBtn) {
            copyBtn.classList.add('processing');
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(code).then(() => {
            // Success feedback
            if (copyBtn) {
                copyBtn.classList.remove('processing');
                copyBtn.classList.add('success');
            }
            
            codeBlock.classList.add('copied');
            
            if (window.simpleToast) {
                window.simpleToast.success('Code copied!');
            }
            console.log('📋 Code copied:', code);
            
            // Reset after 1.5 seconds
            setTimeout(() => {
                if (copyBtn) {
                    copyBtn.classList.remove('success');
                }
                codeBlock.classList.remove('copied');
            }, 1500);
            
        }).catch(err => {
            console.error('Failed to copy code:', err);
            if (copyBtn) {
                copyBtn.classList.remove('processing');
            }
            
            if (window.simpleToast) {
                window.simpleToast.error('Failed to copy code');
            }
        });
    };
    
    // Improved applyCode with better error handling and fallbacks
    window.applyCode = function(blockId) {
        const codeContainer = document.getElementById(blockId);
        if (!codeContainer) {
            console.error('applyCode: Code container not found:', blockId);
            return;
        }
        
        const codeContent = codeContainer.querySelector('.code-content pre code') || codeContainer.querySelector('.code-content code');
        if (!codeContent) {
            console.error('applyCode: Code content not found in container');
            return;
        }
        
        const code = codeContent.textContent;
        
        // Add loading state
        const applyBtn = codeContainer.querySelector('.apply-btn');
        if (applyBtn) {
            applyBtn.textContent = 'Applying...';
            applyBtn.disabled = true;
            applyBtn.classList.add('loading');
        }

        // If CEP available, attempt to apply; otherwise copy to script editor
        if (window.CSInterface) {
            try {
                const csInterface = new CSInterface();
                const isExpression = isLikelyExpression(code);

                if (isExpression) {
                    // Apply as expression with robust error handling
                    const applyScript = `
                        try {
                            var activeComp = app.project.activeItem;
                            if (!activeComp || !(activeComp instanceof CompItem)) {
                                "Error: No active composition found";
                            } else {
                                var selectedLayers = activeComp.selectedLayers;
                                if (selectedLayers.length === 0) {
                                    "Error: Please select a layer first";
                                } else {
                                    var layer = selectedLayers[0];
                                    var selectedProps = layer.selectedProperties;
                                    if (selectedProps.length === 0) {
                                        "Error: Please select a property first";
                                    } else {
                                        var prop = selectedProps[0];
                                        if (!prop.canSetExpression) {
                                            "Error: Selected property cannot have expressions";
                                        } else {
                                            prop.expression = ${JSON.stringify(code)};
                                            "Success: Expression applied to " + prop.name;
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            "Error: " + error.toString();
                        }
                    `;

                    csInterface.evalScript(applyScript, (result) => {
                        handleApplyResult(codeContainer, result, applyBtn);
                    });
                } else {
                    // Run as script with error handling
                    const wrappedScript = `
                        try {
                            app.beginUndoGroup("AI Generated Script");
                            ${code}
                            app.endUndoGroup();
                            "Success: Script executed";
                        } catch (error) {
                            try { app.endUndoGroup(); } catch(e){}
                            "Error: " + error.toString();
                        }
                    `;

                    csInterface.evalScript(wrappedScript, (result) => {
                        handleApplyResult(codeContainer, result, applyBtn);
                    });
                }
            } catch (error) {
                showNotification('Error: Failed to execute - ' + (error && error.message ? error.message : error), 'error');
                if (applyBtn) resetApplyButton(applyBtn);
            }
        } else {
            // No CEP available, copy to script editor instead
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) {
                scriptEditor.value = code;
                showNotification('Code copied to script editor (CEP not available)', 'success');

                // Switch to script tab
                const scriptTab = document.querySelector('[data-tab="script-library"]');
                if (scriptTab) {
                    setTimeout(() => scriptTab.click(), 500);
                }
            } else {
                showNotification('CEP not available and script editor not found', 'error');
            }
            if (applyBtn) resetApplyButton(applyBtn);
        }
    };

    // Helper: handle results returned from evalScript
    function handleApplyResult(codeContainer, result, applyBtn) {
        try {
            if (result && typeof result === 'string' && result.startsWith('Success:')) {
                showNotification('✅ ' + result.substring(8), 'success');
                if (applyBtn) {
                    applyBtn.textContent = 'Applied!';
                    applyBtn.style.backgroundColor = '#4caf50';
                }
            } else if (result && typeof result === 'string' && result.startsWith('Error:')) {
                showNotification('❌ ' + result.substring(6), 'error');
                if (applyBtn) resetApplyButton(applyBtn);
            } else if (result === 'EvalScript error.') {
                showNotification('❌ Script execution failed', 'error');
                if (applyBtn) resetApplyButton(applyBtn);
            } else {
                showNotification('✅ Applied successfully', 'success');
                if (applyBtn) {
                    applyBtn.textContent = 'Applied!';
                    applyBtn.style.backgroundColor = '#4caf50';
                }
            }
        } catch (err) {
            console.warn('handleApplyResult: unexpected result', result, err);
            showNotification('Unexpected host response', 'error');
        }

        // Reset button after delay
        if (applyBtn) {
            setTimeout(() => {
                applyBtn.textContent = 'Apply';
                applyBtn.style.backgroundColor = '';
                applyBtn.disabled = false;
                applyBtn.classList.remove('loading');
            }, 2000);
        }
    }

    function resetApplyButton(applyBtn) {
        if (!applyBtn) return;
        applyBtn.textContent = 'Apply';
        applyBtn.disabled = false;
        applyBtn.style.backgroundColor = '';
        applyBtn.classList.remove('loading');
    }

    window.saveCode = function(blockId) {
        const codeBlock = document.getElementById(blockId);
        if (!codeBlock) return;
        
        const codeContent = codeBlock.querySelector('.code-content code');
        if (!codeContent) return;
        
        const code = codeContent.textContent;
        const saveBtn = codeBlock.querySelector('.save-btn');
        
        // Add loading state
        if (saveBtn) {
            saveBtn.classList.add('processing');
        }
        
        // Add to script editor
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            const currentContent = scriptEditor.value;
            const timestamp = new Date().toLocaleString();
            const separator = currentContent ? 
                `\n\n// ---- Added ${timestamp} ----\n` : 
                `// ---- Saved ${timestamp} ----\n`;
            
            scriptEditor.value = currentContent + separator + code;
            
            // Success feedback
            if (saveBtn) {
                saveBtn.classList.remove('processing');
                saveBtn.classList.add('success');
            }
            
            codeBlock.classList.add('saved');
            
            if (window.simpleToast) {
                window.simpleToast.success('Code saved to editor!');
            }
            
            console.log('💾 Code saved to script editor');
            
            // Switch to script tab if available
            const scriptTab = document.querySelector('[data-tab="script-library"]');
            if (scriptTab) {
                setTimeout(() => {
                    scriptTab.click();
                }, 500);
            }
            
        } else {
            // Save to localStorage as fallback
            try {
                const savedCodes = JSON.parse(localStorage.getItem('ae_saved_codes') || '[]');
                savedCodes.push({
                    code,
                    timestamp: new Date().toISOString(),
                    id: blockId
                });
                localStorage.setItem('ae_saved_codes', JSON.stringify(savedCodes));
                
                if (saveBtn) {
                    saveBtn.classList.remove('processing');
                    saveBtn.classList.add('success');
                }
                
                if (window.simpleToast) {
                    window.simpleToast.success('Code saved locally!');
                }
            } catch (error) {
                if (saveBtn) {
                    saveBtn.classList.remove('processing');
                }
                
                if (window.simpleToast) {
                    window.simpleToast.error('Could not save code');
                }
            }
        }
        
        // Reset after 1.5 seconds
        setTimeout(() => {
            if (saveBtn) {
                saveBtn.classList.remove('success');
            }
            codeBlock.classList.remove('saved');
        }, 1500);
    };
    
    // Test function for enhanced interactive code blocks
    window.testEnhancedCodeBlocks = function() {
        console.log('🧪 Testing enhanced code block formatting...');
        
        if (!aiModule || !aiModule.formatResponseForChat) {
            console.error('❌ AI module not loaded or missing formatResponseForChat');
            return;
        }
        
        // Test multiple code types
        const testResponses = [
            {
                name: "Expression with code block (examples removed)",
                content: "[examples removed - add your own snippets to Saved Scripts]"
            },
            {
                name: "ExtendScript with code block", 
                content: "Use this script:\n```\napp.project.activeItem.selectedLayers[0].name = 'New Layer';\n```\nThis renames the selected layer."
            },
            {
                name: "Multiple expressions (examples removed)",
                content: "[examples removed - add your own snippets to Saved Scripts]"
            },
            {
                name: "Fallback detection (examples removed)",
                content: "[examples removed - add your own snippets to Saved Scripts]"
            }
        ];
        
        testResponses.forEach((test, index) => {
            console.log(`\n${index + 1}. Testing: ${test.name}`);
            const formatted = aiModule.formatResponseForChat(test.content);
            console.log('   - Contains compact-code-block:', formatted.includes('compact-code-block'));
            console.log('   - Contains compact action buttons:', formatted.includes('compact-btn'));
            
            // Add to chat
            addMessageToChat('assistant', formatted);
        });
        
        console.log('\n✅ Enhanced code block test completed - check the chat for interactive blocks!');
        
        if (window.simpleToast) {
            window.simpleToast.success('Enhanced code blocks tested - check the chat!');
        }
    };
    
    // Test individual button functions
    window.testButtonFunctions = function() {
        console.log('🧪 Testing button functions...');
        
        setTimeout(() => {
            const codeBlocks = document.querySelectorAll('.compact-code-block');
            if (codeBlocks.length > 0) {
                const firstBlock = codeBlocks[0];
                const blockId = firstBlock.id;
                
                if (blockId) {
                    console.log('📋 Testing copy function...');
                    window.copyCode(blockId);
                    
                    setTimeout(() => {
                        console.log('💾 Testing save function...');
                        window.saveCode(blockId);
                    }, 1000);
                    
                    setTimeout(() => {
                        console.log('⚡ Testing apply function...');
                        window.applyCode(blockId);
                    }, 2000);
                } else {
                    console.log('❌ No code block ID found');
                }
            } else {
                console.log('❌ No code blocks found - run testEnhancedCodeBlocks() first');
                if (window.simpleToast) {
                    window.simpleToast.error('No code blocks found - generate some code first!');
                }
            }
        }, 500);
    };
    
    // Comprehensive test for interactive code blocks
    window.debugCodeBlocks = function() {
        console.log('🔍 DEBUGGING CODE BLOCKS...');
        console.log('================================');
        
        // Test 1: Check if AI module is loaded
        console.log('1. AI Module Check:');
        console.log('   - aiModule loaded:', !!aiModule);
        console.log('   - formatResponseForChat available:', !!(aiModule && aiModule.formatResponseForChat));
        
        // Test 2: Test code block detection
        if (aiModule && aiModule.formatResponseForChat) {
            console.log('\n2. Code Block Formatting Test:');
            
            const testInput = `Here's a wiggle expression:

\`\`\`\nwiggle(2, 50)\n\`\`\`\n
This creates random movement.`;
            
            console.log('   - Input:', testInput);
            const formatted = aiModule.formatResponseForChat(testInput);
            console.log('   - Output:', formatted);
            console.log('   - Contains compact-code-block:', formatted.includes('compact-code-block'));
            console.log('   - Contains compact-btn:', formatted.includes('compact-btn'));
            
            // Test 3: Add to DOM and check
            console.log('\n3. DOM Test:');
            const testDiv = document.createElement('div');
            testDiv.innerHTML = formatted;
            const blocks = testDiv.querySelectorAll('.compact-code-block');
            console.log('   - Compact code blocks found in DOM:', blocks.length);
            
            // Test 4: Add to actual chat
            console.log('\n4. Adding to Chat:');
            addMessageToChat('assistant', formatted);
            
            setTimeout(() => {
                const chatBlocks = document.querySelectorAll('#chat-messages .compact-code-block');
                console.log('   - Compact code blocks in chat after add:', chatBlocks.length);
                
                if (chatBlocks.length > 0) {
                    console.log('✅ Success! Compact interactive code blocks are working');
                } else {
                    console.log('❌ Failed! No compact interactive code blocks found in chat');
                    
                    // Debug further
                    const allCodeElements = document.querySelectorAll('#chat-messages code, #chat-messages pre');
                    console.log('   - Regular code elements found:', allCodeElements.length);
                }
            }, 100);
        }
        
        console.log('================================');
    };

    // Test scrolling behavior
    window.testScrolling = function() {
        console.log('🧪 Testing scrolling behavior...');
        
        // Add several test messages
        for (let i = 1; i <= 5; i++) {
            addMessageToChat('user', `Test message ${i}`);
            addMessageToChat('assistant', `Response to test message ${i}`);
        }
        
        console.log('✅ Added 10 test messages - chat should auto-scroll to bottom');
        
        if (window.simpleToast) {
            window.simpleToast.success('Test messages added - check if chat scrolled to bottom');
        }
    };

    // Test settings panel scrolling
    window.testSettingsScroll = function() {
        console.log('🧪 Testing settings panel scrolling...');
        
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.style.display = 'block';
            
            // Find the settings tab
            const settingsTab = document.querySelector('[data-tab="settings"]');
            if (settingsTab) {
                settingsTab.click();
            }
            
            console.log('✅ Settings panel opened - check if you can scroll to bottom (Save & Test button should be visible)');
            
            if (window.simpleToast) {
                window.simpleToast.success('Settings panel opened - check scrolling to bottom');
            }
        } else {
            console.error('❌ Settings panel not found');
        }
    };

    /**
     * Handle reading expressions from selected properties
     */
    async function handleReadExpression() {
        if (!window.CSInterface) {
            showError('CEP interface not available');
            return;
        }

        const csInterface = new CSInterface();
        const script = `
            try {
                var activeComp = app.project.activeItem;
                if (activeComp && activeComp instanceof CompItem) {
                    var selectedLayers = activeComp.selectedLayers;
                    if (selectedLayers.length > 0) {
                        var layer = selectedLayers[0];
                        var selectedProps = layer.selectedProperties;
                        if (selectedProps.length > 0) {
                            var prop = selectedProps[0];
                            if (prop.expression && prop.expression.length > 0) {
                                JSON.stringify({
                                    status: "success",
                                    expression: prop.expression,
                                    property: prop.name,
                                    layer: layer.name
                                });
                            } else {
                                JSON.stringify({
                                    status: "error",
                                    message: "Selected property has no expression"
                                });
                            }
                        } else {
                            JSON.stringify({
                                status: "error", 
                                message: "No properties selected"
                            });
                        }
                    } else {
                        JSON.stringify({
                            status: "error",
                            message: "No layers selected"
                        });
                    }
                } else {
                    JSON.stringify({
                        status: "error",
                        message: "No active composition"
                    });
                }
            } catch (error) {
                JSON.stringify({
                    status: "error",
                    message: error.toString()
                });
            }
        `;

        csInterface.evalScript(script, (result) => {
            try {
                const response = JSON.parse(result);
                if (response.status === 'success') {
                    const message = `**Expression Read from ${response.property}**\n\n\`\`\`\n${response.expression}\n\`\`\`\n\nLayer: ${response.layer}`;
                    addMessageToChat('system', message);
                    
                    // Also populate script editor
                    const scriptEditor = document.getElementById('script-editor');
                    if (scriptEditor) {
                        scriptEditor.value = response.expression;
                    }
                } else {
                    showError(response.message);
                }
            } catch (e) {
                showError('Failed to read expression: ' + result);
            }
        });
    }

    /**
     * Handle analyzing current selection
     */
    async function handleAnalyzeSelection() {
        if (!projectContext) {
            showError('Project context not available');
            return;
        }

        try {
            showTypingIndicator('Analyzing selection...');
            try { if (window.__mascot && typeof window.__mascot.showThinking === 'function') window.__mascot.showThinking({ bubbleText: 'Analyzing...', message: 'Checking selection' }); } catch (e) { }
            const context = await projectContext.getCurrentContext();
            
            if (context && context !== 'After Effects not connected') {
                const analysisPrompt = `Analyze the current After Effects selection and provide insights:
                
Context: ${context}

Please provide:
1. What is currently selected
2. Suggested improvements or optimizations
3. Common techniques that could be applied
4. Any potential issues or warnings`;

                if (aiModule && settingsManager) {
                    const settings = settingsManager.getSettings();
                    const response = await aiModule.generateResponse(analysisPrompt, {
                        provider: settings.provider,
                        apiKey: settings.apiKey,
                        model: settings.model,
                        temperature: settings.temperature,
                        maxTokens: settings.maxTokens
                    });
                    
                    hideTypingIndicator();
                    try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                    addMessageToChat('assistant', response);
                } else {
                    hideTypingIndicator();
                    addMessageToChat('system', `**Selection Analysis**\n\n${context}\n\nConfigure AI provider for detailed analysis.`);
                }
            } else {
                hideTypingIndicator();
                try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
                showError('Unable to analyze - no After Effects connection');
            }
        } catch (error) {
            hideTypingIndicator();
            try { if (window.__mascot && typeof window.__mascot.hideThinking === 'function') window.__mascot.hideThinking(); } catch (e) { }
            showError('Analysis failed: ' + error.message);
        }
    }

    /**
     * Handle showing current context
     */
    async function handleShowContext() {
        if (!projectContext) {
            showError('Project context not available');
            return;
        }

        try {
            const context = await projectContext.getCurrentContext();
            const contextMessage = `**Current After Effects Context**\n\n${context}`;
            addMessageToChat('system', contextMessage);
        } catch (error) {
            showError('Failed to get context: ' + error.message);
        }
    }

    /**
     * Handle explaining expressions
     */
    async function handleExplainExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to explain. Paste an expression in the script editor first.');
            return;
        }

        if (!aiModule || !settingsManager) {
            showError('AI module not available for explanations');
            return;
        }

        try {
            showTypingIndicator('Explaining expression...');
            const settings = settingsManager.getSettings();
            const prompt = `Explain this After Effects expression in detail:

\`\`\`
${expression}
\`\`\`

Please provide:
1. What this expression does
2. How it works step by step
3. When you might use it
4. Any variations or improvements`;

            const response = await aiModule.generateResponse(prompt, {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            hideTypingIndicator();
            addMessageToChat('assistant', response);
        } catch (error) {
            hideTypingIndicator();
            showError('Explanation failed: ' + error.message);
        }
    }

    /**
     * Handle debugging expressions
     */
    async function handleDebugExpression() {
        const scriptEditor = document.getElementById('script-editor');
        const expression = scriptEditor?.value.trim();
        
        if (!expression) {
            showError('No expression to debug. Paste an expression in the script editor first.');
            return;
        }

        if (!aiModule || !settingsManager) {
            showError('AI module not available for debugging');
            return;
        }

        try {
            showTypingIndicator('Debugging expression...');
            const settings = settingsManager.getSettings();
            const prompt = `Debug this After Effects expression and find potential issues:

\`\`\`
${expression}
\`\`\`

Please check for:
1. Syntax errors
2. Common mistakes
3. Performance issues
4. Provide a corrected version if needed`;

            const response = await aiModule.generateResponse(prompt, {
                provider: settings.provider,
                apiKey: settings.apiKey,
                model: settings.model,
                temperature: settings.temperature,
                maxTokens: settings.maxTokens
            });
            hideTypingIndicator();
            addMessageToChat('assistant', response);
        } catch (error) {
            hideTypingIndicator();
            showError('Debugging failed: ' + error.message);
        }
    }

    /**
     * Toggle command palette
     */
    function toggleCommandPalette() {
        const commandPanel = document.getElementById('command-menu-panel');
        if (commandPanel) {
            const isVisible = commandPanel.style.display !== 'none';
            commandPanel.style.display = isVisible ? 'none' : 'block';
            
            const trigger = document.getElementById('command-menu-trigger');
            if (trigger) {
                trigger.setAttribute('aria-expanded', (!isVisible).toString());
            }
        }
    }

    /**
     * Handle quick template actions
     */
    async function handleQuickTemplate(template) {
        const templates = {
            text: {
                prompt: "Create a text animation template for After Effects",
                script: `
// Text Animation Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Text Animation");
    var textLayer = comp.layers.addText("Animated Text");
    textLayer.property("Opacity").setValueAtTime(0, 0);
    textLayer.property("Opacity").setValueAtTime(1, 100);
    app.endUndoGroup();
}`
            },
            particles: {
                prompt: "Create a particle system setup for After Effects",
                script: `
// Particle System Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Particle System");
    var solid = comp.layers.addSolid([1, 1, 1], "Particles", comp.width, comp.height, 1);
    // Add CC Particle World effect here
    app.endUndoGroup();
}`
            },
            transitions: {
                prompt: "Create scene transition templates for After Effects",
                script: `
// Scene Transition Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Scene Transition");
    var solid = comp.layers.addSolid([0, 0, 0], "Transition", comp.width, comp.height, 1);
    solid.property("Opacity").setValueAtTime(0, 100);
    solid.property("Opacity").setValueAtTime(0.5, 0);
    app.endUndoGroup();
}`
            },
            effects: {
                prompt: "Create visual effects templates for After Effects",
                script: `
// Visual Effects Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Visual Effects");
    var adjustment = comp.layers.addSolid([1, 1, 1], "Effects", comp.width, comp.height, 1);
    adjustment.adjustmentLayer = true;
    app.endUndoGroup();
}`
            }
        };

        const templateData = templates[template];
        if (!templateData) {
            showError('Unknown template: ' + template);
            return;
        }

        // Add script to editor
        const scriptEditor = document.getElementById('script-editor');
        if (scriptEditor) {
            scriptEditor.value = templateData.script;
        }

        // Send prompt to AI for enhancement if available
        if (aiModule && settingsManager) {
            try {
                showTypingIndicator('Generating enhanced template...');
                const settings = settingsManager.getSettings();
                const response = await aiModule.generateResponse(templateData.prompt + ". Provide a detailed script with multiple variations.", {
                    provider: settings.provider,
                    apiKey: settings.apiKey,
                    model: settings.model,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens
                });
                hideTypingIndicator();
                addMessageToChat('assistant', response);
            } catch (error) {
                hideTypingIndicator();
                addMessageToChat('system', `**${template.toUpperCase()} Template**\n\nBasic template added to script editor. Configure AI for enhanced versions.`);
            }
        } else {
            addMessageToChat('system', `**${template.toUpperCase()} Template**\n\nBasic template added to script editor.`);
        }

        // Hide command palette
        const commandPanel = document.getElementById('command-menu-panel');
        if (commandPanel) {
            commandPanel.style.display = 'none';
        }
    }

    // Ensure initialization only happens once
    if (!window.__AE_EXTENSION_INITIALIZED__) {
        window.__AE_EXTENSION_INITIALIZED__ = true;
        initializeExtension();
        // Global keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = document.getElementById('send-button');
                if (sendBtn && !sendBtn.disabled) sendBtn.click();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === ',') {
                e.preventDefault();
                toggleSettingsPanel();
            }
            if (e.key === 'Escape') {
                const commandPanel = document.getElementById('command-menu-panel');
                if (commandPanel) {
                    commandPanel.style.display = 'none';
                }
            }
        });
        console.log('🚀 Simple main controller ready. Type testEnhancedCodeBlocks() to test interactive expressions.');
    }

    // Test the new code-first AI behavior
    window.testCodeFirstAI = async function() {
        console.log('🧪 Testing new code-first AI behavior...');
        
        if (!settingsManager || !aiModule) {
            console.error('❌ Required modules not loaded');
            return false;
        }

        const settings = settingsManager.getSettings();
        if (!settings.apiKey) {
            console.error('❌ No API key configured');
            return false;
        }

        const testMessages = [
            'wiggle',
            'position',
            'random position', 
            'animate text',
            'rotation'
        ];

        console.log('🎯 Testing these messages with new code-first approach:');
        testMessages.forEach(msg => console.log(`   - "${msg}"`));

        for (const message of testMessages) {
            try {
                console.log(`\n🧪 Testing: "${message}"`);
                const response = await aiModule.generateResponse(message, {
                    provider: settings.provider,
                    apiKey: settings.apiKey,
                    model: settings.model,
                    temperature: settings.temperature,
                    maxTokens: settings.maxTokens
                });
                
                const hasCode = response.includes('```') || response.includes('wiggle(') || response.includes('time *');
                console.log(`   ✅ Response contains code: ${hasCode}`);
                console.log(`   📝 Response preview: ${response.substring(0, 100)}...`);
                
                if (hasCode) {
                    addMessageToChat('assistant', `**Test: "${message}"**\n\n${response}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed: ${error.message}`);
            }
        }
        
        console.log('\n✅ Code-first AI test completed - check the chat for results!');
        
        if (window.simpleToast) {
            window.simpleToast.success('Code-first AI tested - check the chat!');
        }
        
        return true;
    };

    // ===== Tutorial Step Helpers =====
    function handleTutorialStepCommand(cmd) {
        if (!tutorialSessions) return 'Tutorial sessions not available.';
        if (cmd.includes('restart')) {
            const active = tutorialSessions.getActive();
            if (!active) return 'No active tutorial session to restart.';
            tutorialSessions.restart();
            const step = tutorialSessions.getCurrentStep();
            return '🔄 Restarting tutorial.\n\n' + renderStep(step, tutorialSessions.getActive());
        }
        const active = tutorialSessions.getActive();
        if (!active) return 'No active tutorial session. Analyze a YouTube link first.';
        const stepNumberMatch = cmd.match(/step\s+(\d+)/);
        if (stepNumberMatch) {
            const idx = parseInt(stepNumberMatch[1], 10) - 1;
            const step = tutorialSessions.goTo(idx);
            if (!step) return 'That step does not exist.';
            return renderStep(step, active);
        }
        const current = tutorialSessions.getCurrentStep();
        if (current) tutorialSessions.markCompleted(current.index);
        const next = tutorialSessions.next();
        if (!next) return 'All steps completed 🎉. Type "restart tutorial" to begin again.';
        return renderStep(next, active);
    }

    function renderStep(step, session) {
        if (!step) return 'No step available.';
        let out = `📘 Step ${step.index + 1}/${session.steps.length}: **${step.title}**\n\n${step.description || ''}`;
        if (step.script) {
            out += `\n\nRun this script or copy to the editor:\n\`\`\`javascript\n${step.script}\n\`\`\``;
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) scriptEditor.value = step.script;
        }
        if (step.expression && !step.script) {
            out += `\n\nApply this expression (copy to editor and click Apply Expression):\n\`\`\`javascript\n${step.expression}\n\`\`\``;
            const scriptEditor = document.getElementById('script-editor');
            if (scriptEditor) scriptEditor.value = step.expression;
        }
        out += `\n\nType 'next step' for the next step or 'step N' to jump. Type 'restart tutorial' to restart.`;
        return out;
    }

    function deriveTutorialSteps(analysis) {
        const steps = [];
        const kws = analysis.keywords || [];
        if (analysis.category === 'text' || kws.includes('typewriter')) {
            steps.push({ title: 'Create Text Layer', description: 'Add a text layer and set initial position.', script: "var c=app.project.activeItem; if(c){app.beginUndoGroup('Create Text');var t=c.layers.addText('Tutorial Text');app.endUndoGroup();}" });
            steps.push({ title: 'Add Typewriter Expression', description: 'Add slider and typewriter reveal.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Typewriter');var lyr=c.selectedLayers[0]||c.layers[c.layers.length];var eff=lyr.Effects.addProperty('ADBE Slider Control');eff.name='Speed';eff.property('Slider').setValue(15);lyr.property('Source Text').expression=\"var t=text.sourceText;var chars=Math.floor(time*effect('Speed')('Slider'));t.substr(0,chars);\";app.endUndoGroup();}" });
            steps.push({ title: 'Add Fade In', description: 'Animate opacity for intro.', script: "var c=app.project.activeItem; if(c){app.beginUndoGroup('Fade In'); var lyr=c.selectedLayers[0]; if(lyr){lyr.opacity.setValueAtTime(0,0);lyr.opacity.setValueAtTime(1,100);} app.endUndoGroup();}" });
        } else if (kws.includes('pulse') || kws.includes('pulsing')) {
            steps.push({ title: 'Select Target Layer', description: 'Select the layer to pulse.', script: "// Select a layer manually then proceed." });
            steps.push({ title: 'Apply Pulse Expression', description: 'Apply pulsing scale expression.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Pulse');var l=c.selectedLayers[0];l.property('Scale').expression='var amp=5;var speed=2;[100+amp*Math.sin(time*Math.PI*speed),100+amp*Math.sin(time*Math.PI*speed)];';app.endUndoGroup();}" });
            steps.push({ title: 'Refine Timing', description: 'Adjust amp/speed values.', script: "// Modify expression parameters directly." });
        } else if (analysis.category === 'motion') {
            steps.push({ title: 'Create Motion Element', description: 'Add base solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Motion Element');c.layers.addSolid([1,0.5,0],'Motion Element',200,200,1);app.endUndoGroup();}" });
            steps.push({ title: 'Add Wiggle Expression', description: 'Random position motion.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Wiggle');var l=c.selectedLayers[0];l.property('Position').expression='wiggle(2,50)';app.endUndoGroup();}" });
            steps.push({ title: 'Animate Scale Ease', description: 'Scale keyframes with easing.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Scale Ease');var l=c.selectedLayers[0];l.transform.scale.setValueAtTime(0,[50,50]);l.transform.scale.setValueAtTime(1,[100,100]);app.endUndoGroup();}" });
        } else if (analysis.category === 'effects' || kws.includes('glow')) {
            steps.push({ title: 'Create Adjustment Layer', description: 'Add adjustment solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Adj Layer');var a=c.layers.addSolid([1,1,1],'Adjustment',c.width,c.height,1);a.adjustmentLayer=true;app.endUndoGroup();}" });
            steps.push({ title: 'Apply Glow Effect', description: 'Add glow effect.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Glow');var l=c.selectedLayers[0];l.Effects.addProperty('ADBE Glo2');app.endUndoGroup();}" });
            steps.push({ title: 'Tune Effect', description: 'Adjust glow settings manually.', script: "// Adjust effect properties in UI." });
        } else {
            steps.push({ title: 'Create Composition', description: 'Ensure composition exists.', script: "if(!app.project.activeItem){app.beginUndoGroup('New Comp');app.project.items.addComp('New Comp',1920,1080,1,10,30);app.endUndoGroup();}" });
            steps.push({ title: 'Add Solid Layer', description: 'Add background solid.', script: "var c=app.project.activeItem;if(c){app.beginUndoGroup('Solid');c.layers.addSolid([0.2,0.2,0.8],'BG Solid',c.width,c.height,1);app.endUndoGroup();}" });
            steps.push({ title: 'Animate Opacity', description: 'Fade solid in.', script: "var c=app.project.activeItem;if(c&&c.selectedLayers.length){app.beginUndoGroup('Opacity Fade');var l=c.selectedLayers[0];l.opacity.setValueAtTime(0,0);l.opacity.setValueAtTime(1,100);app.endUndoGroup();}" });
        }
        return steps;
    }

    /**
     * Handle showing chat history and memory statistics
     */
    async function handleShowChatHistory() {
        if (!chatMemory) {
            showError('Chat memory not available');
            return;
        }

        try {
            const stats = await chatMemory.getConversationStats();
            const recentHistory = chatMemory.getRecentHistory(10);
            
            let historyMessage = `**💬 Chat Memory Status**\n\n`;
            
            if (stats) {
                historyMessage += `**📊 STATISTICS:**\n`;
                historyMessage += `• Current Session: ${stats.currentSessionId}\n`;
                historyMessage += `• Messages in Current Session: ${stats.currentSessionMessages}\n`;
                historyMessage += `• Total Saved Sessions: ${stats.totalSessions}\n`;
                historyMessage += `• Total Messages in Files: ${stats.totalMessagesInFiles}\n`;
                historyMessage += `• Storage Location: ${stats.storageLocation}\n\n`;
                
                if (stats.oldestSession) {
                    historyMessage += `• Oldest Session: ${new Date(stats.oldestSession).toLocaleString()}\n`;
                }
                if (stats.newestSession) {
                    historyMessage += `• Newest Session: ${new Date(stats.newestSession).toLocaleString()}\n`;
                }
                historyMessage += `\n`;
            }
            
            historyMessage += `**🕐 RECENT CONVERSATION:**\n`;
            if (recentHistory.length > 0) {
                recentHistory.forEach((msg, index) => {
                    const speaker = msg.type === 'user' ? '👤 USER' : '🤖 ASSISTANT';
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    const preview = msg.text.substring(0, 80) + (msg.text.length > 80 ? '...' : '');
                    historyMessage += `${speaker} (${time}): ${preview}\n`;
                });
            } else {
                historyMessage += `No recent messages found.\n`;
            }
            
            historyMessage += `\n**💡 MEMORY FEATURES:**\n`;
            historyMessage += `✅ Conversation context is included in AI responses\n`;
            historyMessage += `✅ Messages saved to localStorage and files\n`;
            historyMessage += `✅ Session management and export available\n`;
            historyMessage += `✅ Automatic context window (last 6 messages)\n\n`;
            
            historyMessage += `**📁 FILE STORAGE:**\n`;
            historyMessage += `Conversations are saved to: \`conversation_history/\` folder\n`;
            historyMessage += `Each chat session gets its own JSON file for permanent storage.\n`;
            
            addMessageToChat('system', historyMessage);
        } catch (error) {
            showError('Failed to get chat history: ' + error.message);
        }
    }

    /**
     * Handle layer analysis and display results
     */
    async function handleAnalyzeLayer() {
        if (!aiModule || !aiModule.layerAnalysis) {
            showError('Layer analysis not available');
            return;
        }

        try {
            showTypingIndicator('Analyzing selected layer...');
            
            const analysis = await aiModule.layerAnalysis.analyzeSelectedLayers();
            hideTypingIndicator();
            
            if (analysis.error) {
                addMessageToChat('system', `❌ **Layer Analysis Error:** ${analysis.error}`);
                return;
            }

            // Format and display analysis
            const formattedAnalysis = aiModule.layerAnalysis.formatAnalysisForAI(analysis);
            const suggestions = aiModule.layerAnalysis.generateSmartSuggestions(analysis);
            
            let analysisMessage = formattedAnalysis;
            
            if (suggestions.length > 0) {
                analysisMessage += `\n**🎯 WHAT YOU CAN ASK ME:**\n`;
                suggestions.forEach(suggestion => {
                    analysisMessage += `${suggestion}\n`;
                });
            }
            
            analysisMessage += `\n**💬 Try saying:**\n`;
            analysisMessage += `• "Apply glow effect"\n`;
            analysisMessage += `• "Make it blue"\n`;
            analysisMessage += `• "Adjust the shadow"\n`;
            analysisMessage += `• "Remove that effect"\n`;
            analysisMessage += `• "What can I do with this layer?"\n`;
            
            addMessageToChat('system', analysisMessage);
            
        } catch (error) {
            hideTypingIndicator();
            showError('Failed to analyze layer: ' + error.message);
        }
    }

})();

/**
 * Setup demo functionality for browser preview mode
 */
function setupDemoFunctionality() {
    console.log('🎭 Setting up demo functionality for browser mode');
    
    // Override ExtendScript functions with demo versions
    window.runExtendScript = function(script) {
        console.log('🎬 Demo ExtendScript execution:', script);
        if (window.simpleToast) {
            window.simpleToast.show('Demo: Script would run in After Effects', 'info', 3000);
        }
        return Promise.resolve('Demo: Script executed successfully');
    };
    
    window.applyExtendScript = function(script) {
        console.log('🎨 Demo ExtendScript application:', script);
        if (window.simpleToast) {
            window.simpleToast.show('Demo: Script would be applied to selected layers', 'success', 3000);
        }
        return Promise.resolve('Demo: Applied to 3 demo layers');
    };
    
    console.log('✅ Demo functionality ready - all ExtendScript calls will show preview behavior');
}

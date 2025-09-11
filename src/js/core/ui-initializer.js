/**
 * UI Initializer
 * Application bootstrap and setup manager
 * Orchestrates the initialization of all UI components and systems
 */

class UIInitializer {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
        this.initPromise = null;
        this.config = {
            environment: 'production',
            debug: false,
            features: {
                performance: true,
                analytics: false,
                hotReload: false
            }
        };
        
        this.observers = new Set();
    }
    
    /**
     * Initialize the entire UI system
     */
    async initialize(config = {}) {
        if (this.initialized) {
            console.warn('UI already initialized');
            return this.initPromise;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._performInitialization(config);
        return this.initPromise;
    }
    
    /**
     * Perform the actual initialization
     */
    async _performInitialization(config) {
        try {
            console.log('Starting UI initialization...');
            
            // Merge configuration
            this.config = { ...this.config, ...config };
            
            // Setup environment
            this.setupEnvironment();
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Initialize UI components
            await this.initializeUIComponents();
            
            // Initialize layout system
            await this.initializeLayoutSystem();
            
            // Initialize services
            await this.initializeServices();
            
            // Setup event handlers
            this.setupGlobalEventHandlers();
            
            // Apply initial theme and settings
            this.applyInitialSettings();
            
            // Setup performance monitoring
            if (this.config.features.performance) {
                this.setupPerformanceMonitoring();
            }

            // Install DevTools access helpers when running in CEP
            this.addDevToolsAccess();
            
            // Mark as initialized
            this.initialized = true;
            
            // Notify observers
            this.notifyObservers('initialized', {
                config: this.config,
                modules: Array.from(this.modules.keys())
            });
            
            console.log('UI initialization complete');
            
            return true;
        } catch (error) {
            console.error('UI initialization failed:', error);
            this.notifyObservers('initialization_failed', { error });
            throw error;
        }
    }
    
    /**
     * Setup development environment
     */
    setupEnvironment() {
        // Set debug mode
        if (this.config.debug) {
            window.DEBUG = true;
            console.log('Debug mode enabled');
        }
        
        // Setup error handling
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, event);
        });
        
        // Development helpers
        if (this.config.environment === 'development') {
            window.ui = this;
            window.modules = this.modules;
        }
    }
    
    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
    console.log('Initializing core systems...');
        
        // Initialize settings manager
        if (window.SimpleSettingsManager) {
            if (!window.settingsManager) {
                window.settingsManager = new window.SimpleSettingsManager();
            }
            this.modules.set('settings', window.settingsManager);
            console.log('  Settings Manager');
        }
        
        // Initialize file storage
        if (window.LocalFileStorageManager) {
            if (!window.fileStorageManager) {
                window.fileStorageManager = new window.LocalFileStorageManager();
            }
            this.modules.set('fileStorage', window.fileStorageManager);
            console.log('  File Storage Manager');
        }
        
        // Initialize performance monitor
        if (window.PerformanceMonitor) {
            if (!window.performanceMonitor) {
                window.performanceMonitor = new window.PerformanceMonitor();
            }
            this.modules.set('performance', window.performanceMonitor);
            console.log('  Performance Monitor');
        }
        
        // Initialize mascot system
        if (window.MascotSystem) {
            if (!window.mascotSystem) {
                window.mascotSystem = new window.MascotSystem();
            }
            this.modules.set('mascot', window.mascotSystem);
            console.log('  Mascot System');
        }
    }
    
    /**
     * Initialize UI components
     */
    async initializeUIComponents() {
    console.log('Initializing UI components...');
        
        // Initialize script editor
        if (window.ScriptEditor) {
            if (!window.scriptEditor) {
                window.scriptEditor = new window.ScriptEditor();
            }
            this.modules.set('scriptEditor', window.scriptEditor);
            console.log('  Script Editor');
        }
        
        // Initialize AI integration
        if (window.AIIntegration) {
            if (!window.aiIntegration) {
                window.aiIntegration = new window.AIIntegration();
            }
            this.modules.set('aiIntegration', window.aiIntegration);
            console.log('  AI Integration');
        }
        
        // Initialize theme manager
        if (window.ThemeManager) {
            if (!window.themeManager) {
                window.themeManager = new window.ThemeManager();
            }
            this.modules.set('theme', window.themeManager);
            console.log('  Theme Manager');
        }
        
        // Initialize workflow system
        if (window.WorkflowSystem) {
            if (!window.workflowSystem) {
                window.workflowSystem = new window.WorkflowSystem();
            }
            this.modules.set('workflow', window.workflowSystem);
            console.log('  Workflow System');
        }
    }
    
    /**
     * Initialize layout system
     */
    async initializeLayoutSystem() {
    console.log('Initializing layout system...');
        
        // Initialize panel layout manager
        if (window.PanelLayoutManager) {
            if (!window.panelLayoutManager) {
                window.panelLayoutManager = new window.PanelLayoutManager();
            }
            this.modules.set('panelLayout', window.panelLayoutManager);
            console.log('  Panel Layout Manager');
        }
        
        // Initialize preset layout manager
        if (window.PresetLayoutManager) {
            if (!window.presetLayoutManager) {
                window.presetLayoutManager = new window.PresetLayoutManager();
            }
            this.modules.set('presetLayout', window.presetLayoutManager);
            console.log('  Preset Layout Manager');
        }
        
        // Setup main layout
        await this.setupMainLayout();
    }
    
    /**
     * Setup main application layout
     */
    async setupMainLayout() {
        const container = document.getElementById('app') || document.body;
        
        // Apply layout structure
        if (window.panelLayoutManager) {
            const defaultLayout = window.panelLayoutManager.layouts.get('default');
            if (defaultLayout) {
                window.panelLayoutManager.applyLayout('default', container);
                console.log('  Default layout applied');
            }
        }
        
        // Load saved layout state
        if (window.panelLayoutManager) {
            const savedState = window.panelLayoutManager.loadLayoutState();
            if (savedState) {
                console.log('  Layout state restored');
            }
        }
    }
    
    /**
     * Initialize services
     */
    async initializeServices() {
    console.log('Initializing services...');
        
        // Initialize socket connection
        if (window.SocketManager) {
            if (!window.socketManager) {
                window.socketManager = new window.SocketManager();
            }
            this.modules.set('socket', window.socketManager);
            console.log('  Socket Manager');
        }
        
        // Initialize project management
        if (window.ProjectManager) {
            if (!window.projectManager) {
                window.projectManager = new window.ProjectManager();
            }
            this.modules.set('project', window.projectManager);
            console.log('  Project Manager');
        }
        
        // Initialize keyboard shortcuts
        if (window.KeyboardShortcuts) {
            if (!window.keyboardShortcuts) {
                window.keyboardShortcuts = new window.KeyboardShortcuts();
            }
            this.modules.set('shortcuts', window.keyboardShortcuts);
            console.log('  Keyboard Shortcuts');
        }
    }
    
    /**
     * Setup global event handlers
     */
    setupGlobalEventHandlers() {
        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);

            // DevTools shortcut for CEP panels: Ctrl+Alt+I
            try {
                if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key?.toLowerCase?.() === 'i')) {
                    e.preventDefault();
                    this.openDevTools();
                }
                // Reveal DevTools bug button: Alt+Shift+B (toggle)
                if (e.altKey && e.shiftKey && (e.key?.toLowerCase?.() === 'b')) {
                    e.preventDefault();
                    const cur = localStorage.getItem('devtoolsButton') === '1';
                    localStorage.setItem('devtoolsButton', cur ? '0' : '1');
                    console.log(`[DevTools] Dev button ${cur ? 'hidden' : 'shown'}`);
                    // Re-run access installer to reflect change
                    this.addDevToolsAccess();
                }
            } catch {}
        });
        
        // Prevent default context menu in production
        if (this.config.environment === 'production') {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        }
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Setup beforeunload handler
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
    }

    /**
     * Open Chrome DevTools for CEP panel if available
     */
    openDevTools() {
        try {
            const cep = (typeof window !== 'undefined') && (window.__adobe_cep__ || (window.CSInterface && new window.CSInterface()));
            if (cep && typeof cep.showDevTools === 'function') {
                // Some CEP hosts accept (isOn, title)
                try { cep.showDevTools(true, 'LetterBlack Gen AI DevTools'); }
                catch { cep.showDevTools(); }
                console.log('[DevTools] Requested CEP DevTools window');
            } else {
                console.warn('[DevTools] CEP interface not available in this environment');
            }
        } catch (err) {
            console.warn('[DevTools] Failed to open DevTools:', err);
        }
    }

    /**
     * Provide multiple, non-conflicting ways to open DevTools inside AE
     * - Alt + Double-click mascot or app title
     * - Optional header button if enabled via ?devtools=1 or localStorage.devtoolsButton
     */
    addDevToolsAccess() {
        try {
            const inCEP = (typeof window !== 'undefined') && (window.__adobe_cep__ || window.CSInterface);
            if (!inCEP) return;

            // Secret gesture: Alt + double-click on mascot or title
            const mascot = document.getElementById('app-mascot-img');
            if (mascot && !mascot.__devtoolsHooked) {
                mascot.addEventListener('dblclick', (e) => {
                    if (e.altKey) {
                        e.preventDefault();
                        this.openDevTools();
                    }
                });
                mascot.__devtoolsHooked = true;
            }

            const titleEl = document.querySelector('.app-title');
            if (titleEl && !titleEl.__devtoolsHooked) {
                titleEl.addEventListener('dblclick', (e) => {
                    if (e.altKey) {
                        e.preventDefault();
                        this.openDevTools();
                    }
                });
                titleEl.__devtoolsHooked = true;
            }

            // Alt-click the existing mascot debug button to open DevTools
            const debugBtn = document.getElementById('mascot-debug-btn');
            if (debugBtn && !debugBtn.__devtoolsHooked) {
                debugBtn.addEventListener('click', (e) => {
                    if (e.altKey) {
                        e.preventDefault();
                        this.openDevTools();
                    }
                });
                debugBtn.__devtoolsHooked = true;
            }

            // Optional visible button for debugging sessions
            const enableBtn = (window.location.search.includes('devtools=1') || localStorage.getItem('devtoolsButton') === '1');
            if (enableBtn) {
                const headerRight = document.querySelector('.header-right');
                if (headerRight && !document.getElementById('open-devtools-btn')) {
                    const btn = document.createElement('button');
                    btn.id = 'open-devtools-btn';
                    btn.className = 'header-btn';
                    btn.title = 'Open DevTools (CEP)';
                    btn.setAttribute('aria-label', 'Open DevTools');
                    const icon = document.createElement('i');
                    icon.className = 'fa-solid fa-bug';
                    btn.appendChild(icon);
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openDevTools();
                    });
                    headerRight.appendChild(btn);
                }
            }
        } catch (err) {
            console.warn('[DevTools] addDevToolsAccess failed:', err);
        }
    }
    
    /**
     * Apply initial settings
     */
    applyInitialSettings() {
        if (!window.settingsManager) return;
        
        // Apply theme
        const theme = window.settingsManager.get('theme');
        if (theme && window.settingsManager.applyTheme) {
            window.settingsManager.applyTheme(theme);
        }
        
        // Apply layout scale
        const layoutScale = window.settingsManager.get('layoutScale');
        if (layoutScale && window.panelLayoutManager) {
            window.panelLayoutManager.scaleViewport(layoutScale);
        }
        
        // Apply performance settings
        if (window.performanceMonitor) {
            const perfEnabled = window.settingsManager.get('enablePerformanceMonitoring');
            if (perfEnabled !== undefined) {
                window.performanceMonitor.setEnabled(perfEnabled);
            }
        }
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!window.performanceMonitor) return;
        
        // Monitor FPS
        window.performanceMonitor.startFPSMonitoring();
        
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                window.performanceMonitor.recordMemoryUsage();
            }, 5000);
        }
        
        // Monitor load times
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            window.performanceMonitor.recordMetric('app_load_time', loadTime);
        });
    }
    
    /**
     * Handle global errors
     */
    handleGlobalError(error, event) {
        console.error('Global error:', error);
        
        if (window.performanceMonitor) {
            window.performanceMonitor.recordError(error);
        }
        
        this.notifyObservers('error', { error, event });
        
        // In development, show error details
        if (this.config.debug) {
            this.showErrorDialog(error);
        }
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Notify modules of resize
        this.modules.forEach((module, name) => {
            if (typeof module.handleResize === 'function') {
                try {
                    module.handleResize();
                } catch (error) {
                    console.warn(`Error in ${name} resize handler:`, error);
                }
            }
        });
        
        this.notifyObservers('window_resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
    
    /**
     * Handle global keydown events
     */
    handleGlobalKeydown(event) {
        // Global shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case ',':
                    // Open settings
                    event.preventDefault();
                    if (window.settingsManager && window.settingsManager.showSettingsPanel) {
                        window.settingsManager.showSettingsPanel();
                    }
                    break;
                    
                case '/':
                    // Show shortcuts help
                    event.preventDefault();
                    this.showShortcutsHelp();
                    break;
            }
        }
        
        // F keys
        switch (event.key) {
            case 'F11':
                event.preventDefault();
                this.toggleFullscreen();
                break;
                
            case 'F12':
                if (this.config.environment === 'production') {
                    event.preventDefault();
                }
                break;
        }
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        
        this.modules.forEach((module, name) => {
            if (typeof module.handleVisibilityChange === 'function') {
                try {
                    module.handleVisibilityChange(isVisible);
                } catch (error) {
                    console.warn(`Error in ${name} visibility handler:`, error);
                }
            }
        });
        
        this.notifyObservers('visibility_change', { visible: isVisible });
    }
    
    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        // Save current state
        if (window.panelLayoutManager) {
            window.panelLayoutManager.saveLayoutState();
        }
        
        if (window.settingsManager) {
            window.settingsManager.saveSettings();
        }
        
        // Check for unsaved work
        let hasUnsavedChanges = false;
        
        this.modules.forEach((module, name) => {
            if (typeof module.hasUnsavedChanges === 'function') {
                try {
                    if (module.hasUnsavedChanges()) {
                        hasUnsavedChanges = true;
                    }
                } catch (error) {
                    console.warn(`Error checking unsaved changes in ${name}:`, error);
                }
            }
        });
        
        if (hasUnsavedChanges) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            event.returnValue = message;
            return message;
        }
    }
    
    /**
     * Show error dialog
     */
    showErrorDialog(error) {
        const dialog = document.createElement('div');
        dialog.className = 'error-dialog-overlay';
        dialog.innerHTML = `
            <div class="error-dialog">
                <div class="error-dialog-header">
                    <h3>Application Error</h3>
                    <button class="error-dialog-close">×</button>
                </div>
                <div class="error-dialog-content">
                    <p><strong>Error:</strong> ${error.message}</p>
                    <details>
                        <summary>Stack Trace</summary>
                        <pre>${error.stack}</pre>
                    </details>
                </div>
                <div class="error-dialog-footer">
                    <button class="error-dialog-reload">Reload Application</button>
                    <button class="error-dialog-continue">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Bind events
        dialog.querySelector('.error-dialog-close').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.error-dialog-continue').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.error-dialog-reload').addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    /**
     * Show shortcuts help
     */
    showShortcutsHelp() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + ,', action: 'Open Settings' },
            { key: 'Ctrl/Cmd + /', action: 'Show Shortcuts' },
            { key: 'F11', action: 'Toggle Fullscreen' },
            { key: 'Ctrl/Cmd + =', action: 'Zoom In' },
            { key: 'Ctrl/Cmd + -', action: 'Zoom Out' },
            { key: 'Ctrl/Cmd + 0', action: 'Reset Zoom' }
        ];
        
        const dialog = document.createElement('div');
        dialog.className = 'shortcuts-dialog-overlay';
        dialog.innerHTML = `
            <div class="shortcuts-dialog">
                <div class="shortcuts-dialog-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button class="shortcuts-dialog-close">×</button>
                </div>
                <div class="shortcuts-dialog-content">
                    ${shortcuts.map(shortcut => `
                        <div class="shortcut-item">
                            <kbd>${shortcut.key}</kbd>
                            <span>${shortcut.action}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Bind events
        dialog.querySelector('.shortcuts-dialog-close').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }
    
    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules.get(name);
    }
    
    /**
     * Check if module is available
     */
    hasModule(name) {
        return this.modules.has(name);
    }
    
    /**
     * Subscribe to initialization events
     */
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }
    
    /**
     * Notify observers
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in UI initializer observer:', error);
            }
        });
    }
    
    /**
     * Debounce utility
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get initialization status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            modules: Object.fromEntries(
                Array.from(this.modules.entries()).map(([name, module]) => [
                    name,
                    {
                        loaded: true,
                        type: module.constructor.name
                    }
                ])
            ),
            config: this.config
        };
    }
    
    /**
     * Cleanup and shutdown
     */
    async shutdown() {
    console.log('Shutting down UI...');
        
        // Cleanup modules
        this.modules.forEach((module, name) => {
            if (typeof module.shutdown === 'function') {
                try {
                    module.shutdown();
                    console.log(`  ${name} shutdown`);
                } catch (error) {
                    console.warn(`Error shutting down ${name}:`, error);
                }
            }
        });
        
        // Clear observers
        this.observers.clear();
        
        // Reset state
        this.initialized = false;
        this.initPromise = null;
        
    console.log('UI shutdown complete');
    }
}

// Create global UI initializer instance
window.UIInitializer = UIInitializer;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.uiInitializer) {
        window.uiInitializer = new UIInitializer();
        
        // Initialize with default config
        window.uiInitializer.initialize({
            environment: window.location.hostname === 'localhost' ? 'development' : 'production',
            debug: window.location.search.includes('debug=true'),
            features: {
                performance: true,
                analytics: false,
                hotReload: false
            }
        }).catch(error => {
            console.error('Failed to initialize UI:', error);
        });
    }
});

console.log('UI Initializer loaded and ready');

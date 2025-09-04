/**
 * AI ENHANCEMENTS INTEGRATION MODULE
 * Orchestrates all AI capability enhancements and performance optimizations
 */

class AIEnhancementsIntegration {
    constructor() {
        this.modules = {};
        this.initialized = false;
        this.status = {
            modulesLoaded: 0,
            modulesReady: 0,
            errors: []
        };

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing AI Enhancements Integration...');

            // Initialize core dependencies
            await this.initializeCoreDependencies();

            // Load and initialize modules
            await this.loadModules();

            // Setup inter-module communication
            this.setupModuleCommunication();

            // Initialize performance monitoring
            this.initializePerformanceMonitoring();

            // Setup global event handlers
            this.setupGlobalEventHandlers();

            this.initialized = true;
            console.log('✅ AI Enhancements Integration complete');

            // Emit ready event
            this.emitReadyEvent();

        } catch (error) {
            console.error('❌ AI Enhancements Integration failed:', error);
            this.status.errors.push(error.message);
            this.showInitializationError(error);
        }
    }

    /**
     * Initialize core dependencies
     */
    async initializeCoreDependencies() {
        // Ensure AE integration is available
        if (!window.AEIntegration) {
            console.warn('AE Integration not found - some features may be limited');
        }

        // Ensure AI module is available
        if (!window.AIModule) {
            console.warn('AI Module not found - AI features will be disabled');
        }

        // Configure Python environment if needed
        if (window.configure_python_environment) {
            await window.configure_python_environment();
        }
    }

    /**
     * Load and initialize all enhancement modules
     */
    async loadModules() {
        const moduleConfigs = [
            {
                name: 'dynamicModuleLoader',
                path: 'js/core/dynamic-module-loader.js',
                className: 'DynamicModuleLoader',
                dependencies: []
            },
            {
                name: 'serviceWorkerManager',
                path: 'js/core/service-worker-manager.js',
                className: 'ServiceWorkerManager',
                dependencies: []
            },
            {
                name: 'advancedPerformanceMonitor',
                path: 'js/core/advanced-performance-monitor.js',
                className: 'AdvancedPerformanceMonitor',
                dependencies: []
            },
            {
                name: 'videoFrameAnalyzer',
                path: 'js/utils/video-frame-analyzer.js',
                className: 'VideoFrameAnalyzer',
                dependencies: ['AIModule', 'AEIntegration']
            },
            {
                name: 'audioTranscriptionModule',
                path: 'js/utils/audio-transcription-module.js',
                className: 'AudioTranscriptionModule',
                dependencies: ['AIModule', 'AEIntegration']
            },
            {
                name: 'contextAwarenessModule',
                path: 'js/utils/context-awareness-module.js',
                className: 'ContextAwarenessModule',
                dependencies: ['AIModule', 'AEIntegration']
            },
            {
                name: 'layerIntelligenceModule',
                path: 'js/utils/layer-intelligence-module.js',
                className: 'LayerIntelligenceModule',
                dependencies: ['AIModule', 'AEIntegration']
            },
            {
                name: 'projectAnalysisModule',
                path: 'js/utils/project-analysis-module.js',
                className: 'ProjectAnalysisModule',
                dependencies: ['AIModule', 'AEIntegration', 'ContextAwarenessModule']
            },
            {
                name: 'bundleAnalysisModule',
                path: 'js/utils/bundle-analysis-module.js',
                className: 'BundleAnalysisModule',
                dependencies: []
            }
        ];

        // Load modules in parallel
        const loadPromises = moduleConfigs.map(config => this.loadModule(config));
        await Promise.all(loadPromises);

        console.log(`📦 Loaded ${this.status.modulesLoaded} enhancement modules`);
    }

    /**
     * Load individual module
     */
    async loadModule(config) {
        try {
            // Check dependencies
            const missingDeps = config.dependencies.filter(dep => !window[dep]);
            if (missingDeps.length > 0) {
                console.warn(`Skipping ${config.name} - missing dependencies: ${missingDeps.join(', ')}`);
                return;
            }

            // Load module script if not already loaded
            if (!window[config.className]) {
                await this.loadScript(config.path);
            }

            // Initialize module
            const ModuleClass = window[config.className];
            if (ModuleClass) {
                const dependencies = config.dependencies.map(dep => window[dep]).filter(Boolean);
                this.modules[config.name] = new ModuleClass(...dependencies);
                this.status.modulesLoaded++;
                console.log(`✅ Loaded module: ${config.name}`);
            } else {
                throw new Error(`Module class ${config.className} not found after loading`);
            }

        } catch (error) {
            console.error(`Failed to load module ${config.name}:`, error);
            this.status.errors.push(`${config.name}: ${error.message}`);
        }
    }

    /**
     * Load script dynamically
     */
    loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${path}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Setup inter-module communication
     */
    setupModuleCommunication() {
        // Setup event listeners for module communication
        document.addEventListener('moduleMessage', (event) => {
            this.handleModuleMessage(event.detail);
        });

        // Connect related modules
        this.connectRelatedModules();

        console.log('🔗 Module communication established');
    }

    /**
     * Handle messages between modules
     */
    handleModuleMessage(message) {
        const { from, to, type, data } = message;

        console.log(`📨 Message from ${from} to ${to}: ${type}`);

        // Route message to target module
        if (to === 'all') {
            // Broadcast to all modules
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.handleMessage === 'function') {
                    module.handleMessage({ from, type, data });
                }
            });
        } else if (this.modules[to]) {
            // Send to specific module
            if (typeof this.modules[to].handleMessage === 'function') {
                this.modules[to].handleMessage({ from, type, data });
            }
        }
    }

    /**
     * Connect related modules for better integration
     */
    connectRelatedModules() {
        // Connect context awareness with other modules
        if (this.modules.contextAwarenessModule) {
            const contextModule = this.modules.contextAwarenessModule;

            // Share context with AI module
            if (this.modules.aiModule) {
                this.modules.aiModule.getContext = () => contextModule.getCurrentContext();
            }

            // Share context with layer intelligence
            if (this.modules.layerIntelligenceModule) {
                this.modules.layerIntelligenceModule.getContext = () => contextModule.getCurrentContext();
            }
        }

        // Connect performance monitor with other modules
        if (this.modules.advancedPerformanceMonitor) {
            const perfModule = this.modules.advancedPerformanceMonitor;

            // Monitor module performance
            Object.entries(this.modules).forEach(([name, module]) => {
                if (module && typeof module.getPerformanceMetrics === 'function') {
                    perfModule.addMonitorTarget(name, () => module.getPerformanceMetrics());
                }
            });
        }

        // Connect dynamic loader with other modules
        if (this.modules.dynamicModuleLoader) {
            const loader = this.modules.dynamicModuleLoader;

            // Register lazy-loadable modules
            loader.registerModule('videoFrameAnalyzer', () => this.modules.videoFrameAnalyzer);
            loader.registerModule('audioTranscriptionModule', () => this.modules.audioTranscriptionModule);
            loader.registerModule('layerIntelligenceModule', () => this.modules.layerIntelligenceModule);
        }
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        if (this.modules.advancedPerformanceMonitor) {
            // Start monitoring
            this.modules.advancedPerformanceMonitor.startMonitoring();

            // Setup performance alerts
            this.setupPerformanceAlerts();
        }
    }

    /**
     * Setup performance alerts
     */
    setupPerformanceAlerts() {
        // Listen for performance issues
        document.addEventListener('performanceAlert', (event) => {
            const alert = event.detail;
            this.handlePerformanceAlert(alert);
        });
    }

    /**
     * Handle performance alerts
     */
    handlePerformanceAlert(alert) {
        console.warn('🚨 Performance Alert:', alert);

        // Show user notification
        this.showPerformanceNotification(alert);

        // Auto-apply optimizations if critical
        if (alert.severity === 'critical') {
            this.applyEmergencyOptimizations();
        }
    }

    /**
     * Setup global event handlers
     */
    setupGlobalEventHandlers() {
        // Keyboard shortcuts for modules
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyboardShortcut(event);
        });

        // Module status updates
        document.addEventListener('moduleStatusUpdate', (event) => {
            this.handleModuleStatusUpdate(event.detail);
        });

        // Error handling
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event);
        });
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboardShortcut(event) {
        // Ctrl+Shift+A: Analyze all
        if (event.ctrlKey && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            this.performFullAnalysis();
        }

        // Ctrl+Shift+O: Optimize all
        if (event.ctrlKey && event.shiftKey && event.key === 'O') {
            event.preventDefault();
            this.applyAllOptimizations();
        }

        // Ctrl+Shift+S: Show status
        if (event.ctrlKey && event.shiftKey && event.key === 'S') {
            event.preventDefault();
            this.showSystemStatus();
        }

        // Ctrl+Shift+P: Performance report
        if (event.ctrlKey && event.shiftKey && event.key === 'P') {
            event.preventDefault();
            this.showPerformanceReport();
        }
    }

    /**
     * Handle module status updates
     */
    handleModuleStatusUpdate(update) {
        console.log('📊 Module status update:', update);

        if (update.status === 'ready') {
            this.status.modulesReady++;
        }

        // Check if all modules are ready
        if (this.status.modulesReady === this.status.modulesLoaded) {
            this.onAllModulesReady();
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        console.error('💥 Global error:', event.error);

        // Report to error tracking module if available
        if (this.modules.errorTrackingModule) {
            this.modules.errorTrackingModule.reportError(event.error, {
                source: 'global',
                url: event.filename,
                line: event.lineno,
                column: event.colno
            });
        }

        // Show user-friendly error message
        this.showErrorNotification('An unexpected error occurred. Please check the console for details.');
    }

    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        console.error('💥 Unhandled promise rejection:', event.reason);

        // Report to error tracking
        if (this.modules.errorTrackingModule) {
            this.modules.errorTrackingModule.reportError(event.reason, {
                source: 'promise',
                type: 'unhandled-rejection'
            });
        }
    }

    /**
     * Perform full analysis across all modules
     */
    async performFullAnalysis() {
        console.log('🔍 Performing full system analysis...');

        const analysisPromises = [];

        // Bundle analysis
        if (this.modules.bundleAnalysisModule) {
            analysisPromises.push(this.modules.bundleAnalysisModule.performBundleAnalysis());
        }

        // Layer analysis
        if (this.modules.layerIntelligenceModule) {
            analysisPromises.push(this.modules.layerIntelligenceModule.performFullAnalysis());
        }

        // Audio analysis
        if (this.modules.audioTranscriptionModule) {
            analysisPromises.push(this.modules.audioTranscriptionModule.analyzeCurrentAudio());
        }

        // Video analysis
        if (this.modules.videoFrameAnalyzer) {
            analysisPromises.push(this.modules.videoFrameAnalyzer.analyzeCurrentFrame());
        }

        try {
            const results = await Promise.all(analysisPromises);
            this.showFullAnalysisResults(results);
        } catch (error) {
            console.error('Full analysis failed:', error);
            this.showErrorNotification('Full analysis failed: ' + error.message);
        }
    }

    /**
     * Apply all available optimizations
     */
    async applyAllOptimizations() {
        console.log('🔧 Applying all optimizations...');

        const optimizationPromises = [];

        // Dynamic loading optimizations
        if (this.modules.dynamicModuleLoader) {
            optimizationPromises.push(this.modules.dynamicModuleLoader.optimizeLoading());
        }

        // Performance optimizations
        if (this.modules.advancedPerformanceMonitor) {
            optimizationPromises.push(this.modules.advancedPerformanceMonitor.performEmergencyCleanup());
        }

        // Layer optimizations
        if (this.modules.layerIntelligenceModule) {
            optimizationPromises.push(this.modules.layerIntelligenceModule.applyOptimizations());
        }

        // Bundle optimizations
        if (this.modules.bundleAnalysisModule) {
            optimizationPromises.push(this.modules.bundleAnalysisModule.applyOptimizations());
        }

        try {
            await Promise.all(optimizationPromises);
            this.showSuccessNotification('All optimizations applied successfully');
        } catch (error) {
            console.error('Optimization application failed:', error);
            this.showErrorNotification('Some optimizations failed: ' + error.message);
        }
    }

    /**
     * Show system status
     */
    showSystemStatus() {
        const status = {
            initialized: this.initialized,
            modulesLoaded: this.status.modulesLoaded,
            modulesReady: this.status.modulesReady,
            errors: this.status.errors,
            memoryUsage: this.getMemoryUsage(),
            moduleStatus: this.getModuleStatus()
        };

        const modal = document.createElement('div');
        modal.className = 'system-status-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📊 System Status</h3>

                <div class="status-overview">
                    <div class="status-item">
                        <span class="label">Initialized:</span>
                        <span class="value ${status.initialized ? 'success' : 'error'}">
                            ${status.initialized ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="label">Modules Loaded:</span>
                        <span class="value">${status.modulesLoaded}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Modules Ready:</span>
                        <span class="value">${status.modulesReady}</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Memory Usage:</span>
                        <span class="value">${status.memoryUsage}</span>
                    </div>
                </div>

                <div class="module-status">
                    <h4>Module Status</h4>
                    ${Object.entries(status.moduleStatus).map(([name, moduleStatus]) => `
                        <div class="module-item ${moduleStatus.ready ? 'ready' : 'not-ready'}">
                            <span class="module-name">${name}</span>
                            <span class="module-status">${moduleStatus.ready ? 'Ready' : 'Not Ready'}</span>
                        </div>
                    `).join('')}
                </div>

                ${status.errors.length > 0 ? `
                <div class="errors-section">
                    <h4>Errors (${status.errors.length})</h4>
                    ${status.errors.map(error => `
                        <div class="error-item">${error}</div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    <button onclick="window.aiEnhancementsIntegration.exportSystemReport()">Export Report</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Show performance report
     */
    showPerformanceReport() {
        const report = this.generatePerformanceReport();

        const modal = document.createElement('div');
        modal.className = 'performance-report-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📈 Performance Report</h3>

                <div class="performance-metrics">
                    <div class="metric">
                        <span class="label">Analysis Time:</span>
                        <span class="value">${report.totalAnalysisTime.toFixed(2)}ms</span>
                    </div>
                    <div class="metric">
                        <span class="label">Memory Usage:</span>
                        <span class="value">${report.memoryUsage}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Optimizations Applied:</span>
                        <span class="value">${report.totalOptimizations}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Active Modules:</span>
                        <span class="value">${report.activeModules}</span>
                    </div>
                </div>

                <div class="module-performance">
                    <h4>Module Performance</h4>
                    ${report.moduleMetrics.map(metric => `
                        <div class="module-metric">
                            <span class="module-name">${metric.name}</span>
                            <div class="metric-details">
                                <span>Analysis: ${metric.analysisTime}ms</span>
                                <span>Memory: ${metric.memoryUsage}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        const report = {
            totalAnalysisTime: 0,
            memoryUsage: this.getMemoryUsage(),
            totalOptimizations: 0,
            activeModules: Object.keys(this.modules).length,
            moduleMetrics: []
        };

        // Collect metrics from all modules
        Object.entries(this.modules).forEach(([name, module]) => {
            if (module && typeof module.getPerformanceMetrics === 'function') {
                const metrics = module.getPerformanceMetrics();
                report.moduleMetrics.push({
                    name: name,
                    analysisTime: metrics.analysisTime || 0,
                    memoryUsage: metrics.memoryUsage || 'N/A'
                });

                report.totalAnalysisTime += metrics.analysisTime || 0;
                report.totalOptimizations += metrics.optimizationsApplied || 0;
            }
        });

        return report;
    }

    /**
     * Get memory usage
     */
    getMemoryUsage() {
        if (performance.memory) {
            const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
            const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
            return `${used} MB / ${total} MB`;
        }
        return 'N/A';
    }

    /**
     * Get module status
     */
    getModuleStatus() {
        const status = {};

        Object.entries(this.modules).forEach(([name, module]) => {
            status[name] = {
                ready: !!module,
                type: module ? module.constructor.name : 'Not Loaded'
            };
        });

        return status;
    }

    /**
     * Export system report
     */
    exportSystemReport() {
        const report = {
            timestamp: Date.now(),
            status: this.status,
            modules: this.getModuleStatus(),
            performance: this.generatePerformanceReport(),
            errors: this.status.errors,
            recommendations: this.generateSystemRecommendations()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-enhancements-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 System report exported');
    }

    /**
     * Generate system recommendations
     */
    generateSystemRecommendations() {
        const recommendations = [];

        // Check module readiness
        const readyModules = Object.values(this.modules).filter(Boolean).length;
        const totalModules = Object.keys(this.modules).length;

        if (readyModules < totalModules) {
            recommendations.push({
                type: 'module',
                priority: 'high',
                message: `${totalModules - readyModules} modules failed to load. Check console for errors.`
            });
        }

        // Check memory usage
        if (performance.memory) {
            const usagePercent = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
            if (usagePercent > 80) {
                recommendations.push({
                    type: 'performance',
                    priority: 'high',
                    message: 'High memory usage detected. Consider optimizing memory management.'
                });
            }
        }

        // Check for errors
        if (this.status.errors.length > 0) {
            recommendations.push({
                type: 'error',
                priority: 'medium',
                message: `${this.status.errors.length} errors occurred during initialization.`
            });
        }

        return recommendations;
    }

    /**
     * Apply emergency optimizations
     */
    async applyEmergencyOptimizations() {
        console.log('🚨 Applying emergency optimizations...');

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        // Clear caches
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.clearCache === 'function') {
                module.clearCache();
            }
        });

        // Reduce monitoring frequency
        if (this.modules.advancedPerformanceMonitor) {
            this.modules.advancedPerformanceMonitor.reduceMonitoringFrequency();
        }

        this.showWarningNotification('Emergency optimizations applied to improve performance');
    }

    /**
     * Show full analysis results
     */
    showFullAnalysisResults(results) {
        const modal = document.createElement('div');
        modal.className = 'full-analysis-results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🔍 Full System Analysis</h3>

                <div class="analysis-summary">
                    <p>Analysis completed for ${results.length} modules</p>
                    <div class="results-grid">
                        ${results.map((result, index) => `
                            <div class="result-item">
                                <h4>Analysis ${index + 1}</h4>
                                <pre>${JSON.stringify(result, null, 2).substring(0, 500)}...</pre>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Show notifications
     */
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showWarningNotification(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `enhancement-notification ${type}`;
        notification.innerHTML = `
            <span class="message">${message}</span>
            <button class="close-btn" onclick="this.parentElement.remove()">×</button>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Show initialization error
     */
    showInitializationError(error) {
        const modal = document.createElement('div');
        modal.className = 'initialization-error-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>❌ Initialization Error</h3>
                <p>AI Enhancements failed to initialize properly:</p>
                <div class="error-details">
                    <strong>Error:</strong> ${error.message}
                </div>
                <div class="troubleshooting">
                    <h4>Troubleshooting Steps:</h4>
                    <ul>
                        <li>Check browser console for detailed error messages</li>
                        <li>Ensure all required dependencies are loaded</li>
                        <li>Try refreshing the page</li>
                        <li>Check network connectivity for external resources</li>
                    </ul>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Emit ready event
     */
    emitReadyEvent() {
        const event = new CustomEvent('aiEnhancementsReady', {
            detail: {
                modules: Object.keys(this.modules),
                status: this.status
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Called when all modules are ready
     */
    onAllModulesReady() {
        console.log('🎉 All AI enhancement modules are ready!');

        // Show welcome message
        this.showSuccessNotification('AI Enhancements fully loaded and ready to use!');

        // Start background tasks
        this.startBackgroundTasks();

        // Emit all ready event
        const event = new CustomEvent('allModulesReady', {
            detail: { moduleCount: this.status.modulesReady }
        });
        document.dispatchEvent(event);
    }

    /**
     * Start background tasks
     */
    startBackgroundTasks() {
        // Auto-save context every 5 minutes
        if (this.modules.contextAwarenessModule) {
            setInterval(() => {
                this.modules.contextAwarenessModule.saveContextData();
            }, 5 * 60 * 1000);
        }

        // Periodic performance checks
        if (this.modules.advancedPerformanceMonitor) {
            setInterval(() => {
                this.modules.advancedPerformanceMonitor.checkSystemHealth();
            }, 10 * 60 * 1000); // Every 10 minutes
        }

        // Bundle analysis on significant changes
        if (this.modules.bundleAnalysisModule) {
            // Could be triggered by route changes or significant user actions
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get all modules
     */
    getAllModules() {
        return this.modules;
    }

    /**
     * Check if module is available
     */
    hasModule(name) {
        return !!this.modules[name];
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            modules: this.getModuleStatus(),
            performance: this.generatePerformanceReport(),
            errors: this.status.errors
        };
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiEnhancementsIntegration = new AIEnhancementsIntegration();
    });
} else {
    window.aiEnhancementsIntegration = new AIEnhancementsIntegration();
}

// Export for global use
window.AIEnhancementsIntegration = AIEnhancementsIntegration;

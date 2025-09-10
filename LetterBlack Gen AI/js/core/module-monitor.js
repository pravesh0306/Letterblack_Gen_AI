/**
 * Module Monitor - JavaScript Implementation
 * Tracks and monitors JavaScript module loading performance.
 * Ported from TypeScript version with simplifications.
 */

class ModuleMonitor {
    constructor() {
        this.loadTimes = new Map();
        this.loadErrors = new Map();
        this.startTimes = new Map();
        this.isMonitoring = false;
        this.originals = {};
        
        this.logger.debug('🔍 ModuleMonitor initialized');
    }

    /**
     * Start monitoring module loading performance
     */
    startMonitoring() {
        if (this.isMonitoring) {
            this.logger.warn('Module monitoring is already active.');
            return;
        }

        if (typeof window === 'undefined' || typeof document === 'undefined') {
            this.logger.warn('ModuleMonitor: Not in browser environment. Monitoring disabled.');
            return;
        }

        this.patchScriptHandlers();
        this.isMonitoring = true;
        this.logger.debug('🔍 Module loading monitoring activated');
    }

    /**
     * Patch script element handlers to monitor loading
     */
    patchScriptHandlers() {
        try {
            // Save original handlers
            this.originals.onload = HTMLScriptElement.prototype.onload;
            this.originals.onerror = HTMLScriptElement.prototype.onerror;

            const self = this;

            // Override onload
            HTMLScriptElement.prototype.onload = function(event) {
                const scriptSrc = this.src;
                if (scriptSrc) {
                    const startTime = self.startTimes.get(scriptSrc);
                    if (startTime) {
                        const loadTime = performance.now() - startTime;
                        self.loadTimes.set(scriptSrc, loadTime);
                        this.logger.debug(`📦 Module loaded: ${scriptSrc.split('/').pop()} (${loadTime.toFixed(2)}ms)`);
                        self.startTimes.delete(scriptSrc);
                    }
                }
                
                // Call original onload if it exists
                if (self.originals.onload) {
                    self.originals.onload.call(this, event);
                }
            };

            // Override onerror
            HTMLScriptElement.prototype.onerror = function(event) {
                const scriptSrc = this.src;
                if (scriptSrc) {
                    const startTime = self.startTimes.get(scriptSrc);
                    if (startTime) {
                        const failTime = performance.now() - startTime;
                        self.loadErrors.set(scriptSrc, {
                            error: event.toString(),
                            failTime: failTime,
                            timestamp: new Date().toISOString()
                        });
                        this.logger.error(`❌ Module failed: ${scriptSrc.split('/').pop()} (${failTime.toFixed(2)}ms)`);
                        self.startTimes.delete(scriptSrc);
                    }
                }
                
                // Call original onerror if it exists
                if (self.originals.onerror) {
                    self.originals.onerror.call(this, event);
                }
            };

            // Monitor script element creation
            this.monitorScriptCreation();

        } catch (e) {
            this.logger.warn('ModuleMonitor: Unable to override script handlers', e);
            this.stopMonitoring();
        }
    }

    /**
     * Monitor when scripts are added to DOM
     */
    monitorScriptCreation() {
        const self = this;
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        self.startTimes.set(node.src, performance.now());
                        this.logger.debug(`⏳ Module loading started: ${node.src.split('/').pop()}`);
                    }
                });
            });
        });

        observer.observe(document.head, { childList: true, subtree: true });
        observer.observe(document.body, { childList: true, subtree: true });
        this.observer = observer;
    }

    /**
     * Stop monitoring and restore original handlers
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        // Restore original handlers
        if (this.originals.onload) {
            HTMLScriptElement.prototype.onload = this.originals.onload;
        }
        if (this.originals.onerror) {
            HTMLScriptElement.prototype.onerror = this.originals.onerror;
        }

        // Stop mutation observer
        if (this.observer) {
            this.observer.disconnect();
        }

        this.originals = {};
        this.isMonitoring = false;
        this.logger.debug('⏹️ Module monitoring stopped');
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const totalTime = Array.from(this.loadTimes.values()).reduce((sum, time) => sum + time, 0);
        const averageLoadTime = this.loadTimes.size > 0 ? totalTime / this.loadTimes.size : 0;

        return {
            totalModules: this.loadTimes.size + this.loadErrors.size,
            successfulLoads: this.loadTimes.size,
            failedLoads: this.loadErrors.size,
            averageLoadTime: averageLoadTime,
            loadTimes: Object.fromEntries(this.loadTimes),
            errors: Object.fromEntries(this.loadErrors),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Display performance report in console
     */
    showReport() {
        const report = this.getPerformanceReport();
        console.group('📊 Module Loading Performance Report');
        this.logger.debug(`Total Modules: ${report.totalModules}`);
        this.logger.debug(`Successful: ${report.successfulLoads}`);
        this.logger.debug(`Failed: ${report.failedLoads}`);
        this.logger.debug(`Average Load Time: ${report.averageLoadTime.toFixed(2)}ms`);
        
        if (report.failedLoads > 0) {
            this.logger.warn('Failed modules:', report.errors);
        }
        
        console.groupEnd();
        return report;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleMonitor;
}

// Global availability
if (typeof window !== 'undefined') {
    window.ModuleMonitor = ModuleMonitor;
    
    // Auto-initialize if not in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.moduleMonitor = new ModuleMonitor();
        // Auto-start monitoring for development
        setTimeout(() => {
            if (window.moduleMonitor) {
                window.moduleMonitor.startMonitoring();
            }
        }, 100);
    }
}

this.logger.debug('✅ Module Monitor loaded');

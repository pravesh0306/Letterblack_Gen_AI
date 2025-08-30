/**
 * Module Loading Monitor
 * Tracks and monitors the loading performance of JavaScript modules by monkey-patching
 * script loading handlers. This is intended for debugging and performance analysis.
 */

// --- TYPE DEFINITIONS ---

interface LoadError {
    error: Event | string; // The error event or a message
    failTime: number;
    timestamp: string;
}

interface PerformanceReport {
    totalModules: number;
    successfulLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    loadTimes: { [key: string]: number };
    errors: { [key: string]: LoadError };
    timestamp: string;
}

// Store original prototype methods
interface OriginalPrototypes {
    onload: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    onerror: OnErrorEventHandler;
    createElement: (tagName: string, options?: ElementCreationOptions) => HTMLElement;
}

class ModuleMonitor {
    private loadTimes: Map<string, number>;
    private loadErrors: Map<string, LoadError>;
    private startTimes: Map<string, number>;
    private isMonitoring: boolean;
    private _originals: Partial<OriginalPrototypes>;

    constructor() {
        this.loadTimes = new Map<string, number>();
        this.loadErrors = new Map<string, LoadError>();
        this.startTimes = new Map<string, number>();
        this.isMonitoring = false;
        this._originals = {};
    }

    /**
     * Starts monitoring module loading performance and errors by patching prototype handlers.
     * This is an invasive technique and should only be used during development/debugging.
     */
    startMonitoring(): void {
        if (this.isMonitoring) {
            console.warn('Module monitoring is already active.');
            return;
        }

        // In a browser environment, proceed with patching.
        if (typeof window === 'undefined' || typeof document === 'undefined' || typeof HTMLScriptElement === 'undefined') {
            console.warn('ModuleMonitor: Not in a browser-like environment. Monitoring disabled.');
            return;
        }

        this.patchScriptHandlers();
        this.isMonitoring = true;
        console.log('🔍 Module loading monitoring has been activated.');
    }

    private patchScriptHandlers(): void {
        try {
            // Save original handlers before overriding
            this._originals.onload = HTMLScriptElement.prototype.onload;
            this._originals.onerror = HTMLScriptElement.prototype.onerror;

            HTMLScriptElement.prototype.onload = (event: Event) => {
                const scriptSrc = (event.currentTarget as HTMLScriptElement)?.src;
                if (scriptSrc) {
                    const startTime = this.startTimes.get(scriptSrc);
                    if (startTime) {
                        const loadTime = performance.now() - startTime;
                        this.loadTimes.set(scriptSrc, loadTime);
                        console.log(`📦 Module loaded: ${scriptSrc.split('/').pop()} (${loadTime.toFixed(2)}ms)`);
                        this.startTimes.delete(scriptSrc);
                    }
                }
                // Call original onload if it exists
                if (this._originals.onload) {
                    this._originals.onload.call(event.currentTarget, event);
                }
            };

            HTMLScriptElement.prototype.onerror = (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => {
                const scriptSrc = (event as Event).currentTarget ? ((event as Event).currentTarget as HTMLScriptElement).src : source || 'unknown';
                 if (scriptSrc) {
                    const startTime = this.startTimes.get(scriptSrc);
                    if (startTime) {
                        const failTime = performance.now() - startTime;
                        this.loadErrors.set(scriptSrc, {
                            error: error?.message || event.toString(),
                            failTime: failTime,
                            timestamp: new Date().toISOString()
                        });
                        console.error(`❌ Module failed: ${scriptSrc.split('/').pop()} (${failTime.toFixed(2)}ms)`);
                        this.startTimes.delete(scriptSrc);
                    }
                }
                // Call original onerror if it exists
                if (this._originals.onerror) {
                    this._originals.onerror.call((event as Event).currentTarget, event, source, lineno, colno, error);
                }
            };

            // We can't reliably patch `createElement` and `src` setter in all environments,
            // and modern module loaders (like Vite's) may not use this pattern.
            // This implementation will focus on capturing loads for scripts added via standard DOM manipulation.
            // For a more robust solution, a MutationObserver would be better.

        } catch (e) {
            console.warn('ModuleMonitor: Unable to override script handlers in this environment.', e);
            this.stopMonitoring(); // Revert any partial patches
        }
    }

    /**
     * Stops monitoring and restores original prototype methods.
     */
    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        if (this._originals.onload) {
            HTMLScriptElement.prototype.onload = this._originals.onload;
        }
        if (this._originals.onerror) {
            HTMLScriptElement.prototype.onerror = this._originals.onerror;
        }
        
        this._originals = {};
        this.isMonitoring = false;
        console.log('⏹️ Module loading monitoring stopped.');
    }

    /**
     * Gets a report of module loading performance.
     */
    getPerformanceReport(): PerformanceReport {
        const report: PerformanceReport = {
            totalModules: this.loadTimes.size + this.loadErrors.size,
            successfulLoads: this.loadTimes.size,
            failedLoads: this.loadErrors.size,
            averageLoadTime: 0,
            loadTimes: Object.fromEntries(this.loadTimes),
            errors: Object.fromEntries(this.loadErrors),
            timestamp: new Date().toISOString()
        };

        if (this.loadTimes.size > 0) {
            const totalTime = Array.from(this.loadTimes.values()).reduce((sum, time) => sum + time, 0);
            report.averageLoadTime = totalTime / this.loadTimes.size;
        }

        return report;
    }

    /**
     * Prints the performance report to the console.
     */
    printReport(): void {
        const report = this.getPerformanceReport();
        
        console.group('📊 Module Loading Performance Report');
        console.log(`Total Modules Tracked: ${report.totalModules}`);
        console.log(`✅ Successful: ${report.successfulLoads}`);
        console.log(`❌ Failed: ${report.failedLoads}`);
        console.log(`⏱️ Average Load Time: ${report.averageLoadTime.toFixed(2)}ms`);
        
        if (report.successfulLoads > 0) {
            console.group('Successful Loads:');
            Object.entries(report.loadTimes).forEach(([src, time]) => {
                console.log(`${src.split('/').pop()}: ${time.toFixed(2)}ms`);
            });
            console.groupEnd();
        }
        
        if (report.failedLoads > 0) {
            console.group('Failed Loads:');
            Object.entries(report.errors).forEach(([src, error]) => {
                console.error(`${src.split('/').pop()}: Failed after ${error.failTime.toFixed(2)}ms`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
    }

    /**
     * Clears all collected monitoring data.
     */
    clearData(): void {
        this.loadTimes.clear();
        this.loadErrors.clear();
        this.startTimes.clear();
        console.log('🧹 Module monitoring data cleared.');
    }
}

export default new ModuleMonitor();
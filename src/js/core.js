/**
 * LetterBlack GenAI - Core Bundle
 * Consolidated core utilities and system management
 */

// DEBUG flag for development features
window.DEBUG = window.DEBUG || false;

// Core Utilities
(function() {
    'use strict';

    const CoreUtilities = {
        // DOM utilities
        waitForElement(selector, timeout = 5000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        // Safe event listener management
        addEventListeners(element, events) {
            const listeners = [];
            Object.entries(events).forEach(([event, handler]) => {
                element.addEventListener(event, handler, { passive: true });
                listeners.push({ element, event, handler });
            });
            return listeners;
        },

        removeEventListeners(listeners) {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        },

        // Performance utilities
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
        },

        throttle(func, limit) {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    window.CoreUtilities = CoreUtilities;
})();

// Error Handler
(function() {
    'use strict';

    class ErrorHandler {
        constructor() {
            this.errors = [];
            this.maxErrors = 100;
            this.init();
        }

        init() {
            window.addEventListener('error', (event) => {
                this.logError({
                    type: 'javascript',
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack,
                    timestamp: Date.now()
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.logError({
                    type: 'promise',
                    message: event.reason?.message || 'Unhandled Promise Rejection',
                    stack: event.reason?.stack,
                    timestamp: Date.now()
                });
            });
        }

        logError(error) {
            this.errors.push(error);
            if (this.errors.length > this.maxErrors) {
                this.errors.shift();
            }

            if (window.DEBUG) {
                console.error('ErrorHandler:', error);
            }
        }

        getErrors() {
            return [...this.errors];
        }

        clearErrors() {
            this.errors = [];
        }
    }

    window.errorHandler = new ErrorHandler();
})();

// Memory Manager
(function() {
    'use strict';

    class MemoryManager {
        constructor() {
            this.cache = new Map();
            this.maxCacheSize = 50;
            this.cleanupInterval = null;
            this.init();
        }

        init() {
            // Cleanup every 5 minutes in production, 30 seconds in DEBUG
            const interval = window.DEBUG ? 30000 : 300000;
            if (window.DEBUG) {
                this.cleanupInterval = setInterval(() => {
                    this.cleanup();
                }, interval);
            }
        }

        set(key, value, ttl = 300000) { // 5 minute default TTL
            this.cache.set(key, {
                value,
                expires: Date.now() + ttl
            });

            if (this.cache.size > this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
        }

        get(key) {
            const item = this.cache.get(key);
            if (!item) return null;

            if (Date.now() > item.expires) {
                this.cache.delete(key);
                return null;
            }

            return item.value;
        }

        cleanup() {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expires) {
                    this.cache.delete(key);
                }
            }
            if (window.DEBUG) {
                console.log(`🧹 Memory cleanup: ${this.cache.size} items remaining`);
            }
        }

        destroy() {
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            this.cache.clear();
        }
    }

    window.memoryManager = new MemoryManager();
})();

// Performance System
(function() {
    'use strict';

    class PerformanceSystem {
        constructor() {
            this.metrics = {};
            this.observers = [];
        }

        measureFunction(name, fn) {
            return (...args) => {
                const start = performance.now();
                const result = fn.apply(this, args);
                const end = performance.now();
                
                this.recordMetric(name, end - start);
                return result;
            };
        }

        measureAsyncFunction(name, fn) {
            return async (...args) => {
                const start = performance.now();
                const result = await fn.apply(this, args);
                const end = performance.now();
                
                this.recordMetric(name, end - start);
                return result;
            };
        }

        recordMetric(name, value) {
            if (!this.metrics[name]) {
                this.metrics[name] = [];
            }
            this.metrics[name].push(value);
            
            // Keep only last 100 measurements
            if (this.metrics[name].length > 100) {
                this.metrics[name].shift();
            }
        }

        getMetrics(name) {
            const values = this.metrics[name] || [];
            if (values.length === 0) return null;

            return {
                count: values.length,
                average: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                latest: values[values.length - 1]
            };
        }

        getAllMetrics() {
            const result = {};
            Object.keys(this.metrics).forEach(name => {
                result[name] = this.getMetrics(name);
            });
            return result;
        }
    }

    window.performanceSystem = new PerformanceSystem();
})();

// Module Container
(function() {
    'use strict';

    const AppModules = {
        storage: null,
        ai: null,
        ui: null,
        settings: null,
        initialized: false,

        register(name, module) {
            this[name] = module;
            if (window.DEBUG) {
                console.log(`📦 Module registered: ${name}`);
            }
        },

        get(name) {
            return this[name];
        },

        init() {
            this.initialized = true;
            if (window.DEBUG) {
                console.log('📦 AppModules initialized');
            }
        }
    };

    window.AppModules = AppModules;
    window.appModules = AppModules; // Legacy alias
})();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (window.memoryManager) {
        window.memoryManager.destroy();
    }
});

console.log('✅ Core bundle loaded');

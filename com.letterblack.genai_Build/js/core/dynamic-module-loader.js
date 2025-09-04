/**
 * DYNAMIC MODULE LOADER
 * Implements code splitting and lazy loading for performance optimization
 */

class DynamicModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.moduleConfigs = {
            // AI Modules - Load on demand
            'ai/enhanced-ai-learning-system': {
                path: 'js/ai/enhanced-ai-learning-system.js',
                dependencies: ['ai/ai-module'],
                priority: 'high'
            },
            'ai/smart-ai-suggestion-engine': {
                path: 'js/ai/smart-ai-suggestion-engine.js',
                dependencies: ['ai/ai-module'],
                priority: 'high'
            },
            'ai/ai-training-data-collector': {
                path: 'js/ai/ai-training-data-collector.js',
                dependencies: ['ai/ai-module'],
                priority: 'medium'
            },

            // Heavy Utilities - Lazy load
            'utils/enhanced-youtube-analyzer': {
                path: 'js/utils/enhanced-youtube-analyzer.js',
                dependencies: ['ai/ai-module', 'core/ae-integration'],
                priority: 'medium'
            },
            'utils/expression-debugger': {
                path: 'js/utils/expression-debugger.js',
                dependencies: ['core/ae-integration'],
                priority: 'medium'
            },
            'utils/browser-video-transcriber': {
                path: 'js/utils/browser-video-transcriber.js',
                dependencies: [],
                priority: 'low'
            },

            // UI Components - Load on interaction
            'ui/advanced-modal': {
                path: 'js/ui/advanced-modal.js',
                dependencies: ['ui/ui-animator'],
                priority: 'low'
            },
            'ui/code-editor': {
                path: 'js/ui/code-editor.js',
                dependencies: ['ui/ui-bootstrap'],
                priority: 'medium'
            },

            // Core Extensions - Load when needed
            'core/advanced-performance-monitor': {
                path: 'js/core/advanced-performance-monitor.js',
                dependencies: ['core/enhanced-performance-system'],
                priority: 'high'
            },
            'core/memory-manager': {
                path: 'js/core/memory-manager.js',
                dependencies: [],
                priority: 'high'
            }
        };

        // Preload critical modules
        this.preloadCriticalModules();
    }

    /**
     * Preload critical modules for better UX
     */
    async preloadCriticalModules() {
        const criticalModules = [
            'ai/enhanced-ai-learning-system',
            'ai/smart-ai-suggestion-engine',
            'core/advanced-performance-monitor',
            'core/memory-manager'
        ];

        // Use requestIdleCallback if available, otherwise setTimeout
        const schedulePreload = window.requestIdleCallback ||
            ((callback) => setTimeout(callback, 100));

        schedulePreload(async () => {
            for (const moduleName of criticalModules) {
                try {
                    await this.loadModule(moduleName, { preload: true });
                } catch (error) {
                    console.warn(`Failed to preload ${moduleName}:`, error);
                }
            }
        });
    }

    /**
     * Load a module dynamically
     */
    async loadModule(moduleName, options = {}) {
        const { preload = false, timeout = 10000 } = options;

        // Return cached module if already loaded
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // Return existing promise if already loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const config = this.moduleConfigs[moduleName];
        if (!config) {
            throw new Error(`Module ${moduleName} not found in configuration`);
        }

        // Load dependencies first
        if (config.dependencies && config.dependencies.length > 0) {
            await Promise.all(
                config.dependencies.map(dep => this.loadModule(dep, { preload }))
            );
        }

        // Create loading promise
        const loadingPromise = this._loadModuleScript(config.path, timeout);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;

            // Cache the loaded module
            this.loadedModules.set(moduleName, module);

            if (!preload) {
                console.log(`✅ Module ${moduleName} loaded dynamically`);
            }

            return module;

        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }

    /**
     * Load module script with timeout
     */
    async _loadModuleScript(scriptPath, timeout) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.async = true;

            // Set timeout
            const timeoutId = setTimeout(() => {
                script.remove();
                reject(new Error(`Module load timeout after ${timeout}ms`));
            }, timeout);

            script.onload = () => {
                clearTimeout(timeoutId);
                // Wait a bit for the module to initialize
                setTimeout(() => {
                    resolve(window[scriptPath.split('/').pop().replace('.js', '')] ||
                           window[scriptPath.split('/').pop().replace('.js', '').replace(/-/g, '')]);
                }, 10);
            };

            script.onerror = () => {
                clearTimeout(timeoutId);
                script.remove();
                reject(new Error(`Failed to load script: ${scriptPath}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Lazy load module on user interaction
     */
    lazyLoadOnInteraction(moduleName, triggerElement, eventType = 'click') {
        const handler = async () => {
            try {
                triggerElement.disabled = true;
                triggerElement.textContent = 'Loading...';

                await this.loadModule(moduleName);

                triggerElement.disabled = false;
                triggerElement.textContent = triggerElement.dataset.originalText || 'Loaded';

                // Remove event listener after successful load
                triggerElement.removeEventListener(eventType, handler);

            } catch (error) {
                console.error(`Lazy load failed for ${moduleName}:`, error);
                triggerElement.disabled = false;
                triggerElement.textContent = 'Load Failed - Try Again';
            }
        };

        // Store original text
        if (!triggerElement.dataset.originalText) {
            triggerElement.dataset.originalText = triggerElement.textContent;
        }

        triggerElement.addEventListener(eventType, handler);
    }

    /**
     * Load module on scroll (for below-the-fold content)
     */
    lazyLoadOnScroll(moduleName, triggerElement) {
        const observer = new IntersectionObserver(async (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    try {
                        await this.loadModule(moduleName);
                        observer.disconnect();
                        console.log(`📜 Lazy loaded ${moduleName} on scroll`);
                    } catch (error) {
                        console.error(`Scroll lazy load failed for ${moduleName}:`, error);
                    }
                    break;
                }
            }
        }, {
            rootMargin: '50px'
        });

        observer.observe(triggerElement);
    }

    /**
     * Get loading statistics
     */
    getLoadingStats() {
        return {
            loadedModules: Array.from(this.loadedModules.keys()),
            loadingModules: Array.from(this.loadingPromises.keys()),
            totalConfigured: Object.keys(this.moduleConfigs).length
        };
    }

    /**
     * Clear module cache (for development/testing)
     */
    clearCache() {
        this.loadedModules.clear();
        this.loadingPromises.clear();
        console.log('🧹 Module cache cleared');
    }
}

// Export for global use
window.DynamicModuleLoader = DynamicModuleLoader;

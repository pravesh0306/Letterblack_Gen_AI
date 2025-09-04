/**
 * After Effects Integration Module
 * Provides real-time communication with After Effects via CEP
 */

class AEIntegration {
    constructor() {
        this.csInterface = null;
        this.context = null;
        this.isConnected = false;
        this.updateInterval = null;
        this.eventListeners = {};

        this.init();
    }

    /**
     * Initialize After Effects integration
     */
    async init() {
        try {
            // Wait for CSInterface to be available
            await this.waitForCSInterface();

            if (this.csInterface) {
                this.isConnected = true;
                this.startContextMonitoring();
                this.setupEventListeners();

                console.log('🎬 After Effects integration initialized');
                this.dispatchEvent('connected', { context: await this.getContext() });
            } else {
                console.warn('⚠️ CSInterface not available - AE integration disabled');
                this.isConnected = false;
            }
        } catch (error) {
            console.error('❌ Failed to initialize AE integration:', error);
            this.isConnected = false;
        }
    }

    /**
     * Wait for CSInterface to be available
     */
    async waitForCSInterface() {
        for (let i = 0; i < 50; i++) { // Wait up to 5 seconds
            if (window.csInterface) {
                this.csInterface = window.csInterface;
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.warn('⚠️ CSInterface not found after waiting');
    }

    /**
     * Start monitoring After Effects context
     */
    startContextMonitoring() {
        // Update context every 2 seconds
        this.updateInterval = setInterval(async () => {
            try {
                const newContext = await this.getContext();
                if (this.hasContextChanged(this.context, newContext)) {
                    this.context = newContext;
                    this.dispatchEvent('contextChanged', { context: newContext });
                }
            } catch (error) {
                console.error('❌ Context monitoring error:', error);
            }
        }, 2000);
    }

    /**
     * Setup event listeners for After Effects events
     */
    setupEventListeners() {
        if (!this.csInterface) return;

        // Listen for composition changes
        this.csInterface.addEventListener('compositionChanged', (data) => {
            this.dispatchEvent('compositionChanged', data);
        });

        // Listen for layer selection changes
        this.csInterface.addEventListener('selectionChanged', (data) => {
            this.dispatchEvent('selectionChanged', data);
        });

        // Listen for time changes
        this.csInterface.addEventListener('timeChanged', (data) => {
            this.dispatchEvent('timeChanged', data);
        });
    }

    /**
     * Get current After Effects context
     */
    async getContext() {
        return new Promise((resolve) => {
            if (!this.csInterface) {
                resolve(this.getMockContext());
                return;
            }

            this.csInterface.getAEContext((context) => {
                if (context && !context.error) {
                    resolve(context);
                } else {
                    // Fallback to mock context for development
                    resolve(this.getMockContext());
                }
            });
        });
    }

    /**
     * Get mock context for development/testing
     */
    getMockContext() {
        return {
            project: {
                name: 'Sample Project.aep',
                numItems: 3,
                activeItem: {
                    name: 'Main Comp',
                    typeName: 'Composition',
                    width: 1920,
                    height: 1080,
                    frameRate: 30,
                    duration: 10,
                    numLayers: 5
                }
            },
            selectedLayers: [
                {
                    name: 'Text Layer 1',
                    index: 1,
                    enabled: true,
                    typeName: 'TextLayer'
                }
            ],
            time: 2.5,
            timestamp: Date.now()
        };
    }

    /**
     * Check if context has changed
     */
    hasContextChanged(oldContext, newContext) {
        if (!oldContext || !newContext) return true;

        // Check project changes
        if (oldContext.project?.name !== newContext.project?.name) return true;
        if (oldContext.project?.numItems !== newContext.project?.numItems) return true;

        // Check active item changes
        if (oldContext.project?.activeItem?.name !== newContext.project?.activeItem?.name) return true;

        // Check layer selection changes
        if (oldContext.selectedLayers?.length !== newContext.selectedLayers?.length) return true;

        // Check time changes (with tolerance)
        if (Math.abs((oldContext.time || 0) - (newContext.time || 0)) > 0.1) return true;

        return false;
    }

    /**
     * Apply expression to selected property
     */
    async applyExpression(expression) {
        return new Promise((resolve) => {
            if (!this.csInterface) {
                resolve({ success: false, message: 'CSInterface not available' });
                return;
            }

            this.csInterface.applyExpression(expression, (result) => {
                resolve({
                    success: result && !result.includes('Error'),
                    message: result || 'Expression applied'
                });
            });
        });
    }

    /**
     * Get available effects
     */
    async getEffects() {
        return new Promise((resolve) => {
            if (!this.csInterface) {
                resolve(this.getMockEffects());
                return;
            }

            this.csInterface.getEffectsList((effects) => {
                resolve(effects || this.getMockEffects());
            });
        });
    }

    /**
     * Get mock effects for development
     */
    getMockEffects() {
        return [
            { name: 'Drop Shadow', category: 'Layer Styles', matchName: 'ADBE Drop Shadow' },
            { name: 'Gaussian Blur', category: 'Blur & Sharpen', matchName: 'ADBE Gaussian Blur' },
            { name: 'Transform', category: 'Transform', matchName: 'ADBE Transform Group' },
            { name: 'Opacity', category: 'Opacity', matchName: 'ADBE Opacity' }
        ];
    }

    /**
     * Execute custom ExtendScript
     */
    async executeScript(script) {
        return new Promise((resolve) => {
            if (!this.csInterface) {
                resolve({ success: false, message: 'CSInterface not available' });
                return;
            }

            this.csInterface.evalScript(script, (result) => {
                resolve({
                    success: result !== null,
                    result: result,
                    message: result ? 'Script executed' : 'Script failed'
                });
            });
        });
    }

    /**
     * Get composition information
     */
    async getCompositionInfo() {
        const context = await this.getContext();
        return context.project?.activeItem || null;
    }

    /**
     * Get selected layers information
     */
    async getSelectedLayers() {
        const context = await this.getContext();
        return context.selectedLayers || [];
    }

    /**
     * Event system for AE integration events
     */
    addEventListener(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(callback);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }

    dispatchEvent(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ AE integration event callback error:', error);
                }
            });
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.eventListeners = {};
        this.isConnected = false;
        console.log('🧹 AE integration cleaned up');
    }
}

// Create global instance
window.AEIntegration = AEIntegration;
window.aeIntegration = new AEIntegration();

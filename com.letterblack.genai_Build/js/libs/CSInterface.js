// CSInterface.js - Adobe CEP Interface Library
// This file provides the bridge between the HTML panel and After Effects

(function() {
    'use strict';

    /**
     * @class CSInterface
     * Provides the primary interface between the HTML panel and the host application (After Effects)
     */
    function CSInterface() {
        this.hostEnvironment = this.getHostEnvironment();
        this.cepVersion = this.getCepVersion();
        this.extensions = {};
        this.themes = {};

        // Initialize event system
        this._eventCallbacks = {};
        this._themeChangeCallbacks = [];

        // Bind methods
        this.addEventListener = this.addEventListener.bind(this);
        this.removeEventListener = this.removeEventListener.bind(this);
        this.dispatchEvent = this.dispatchEvent.bind(this);

        // Initialize theme monitoring
        this.initThemeMonitoring();

        console.log('🔗 CSInterface initialized for After Effects');
    }

    /**
     * Get host environment information
     */
    CSInterface.prototype.getHostEnvironment = function() {
        try {
            // In a real CEP environment, this would return actual host info
            // For development, we'll simulate After Effects environment
            return {
                appName: 'AfterEffects',
                appVersion: '24.0',
                appLocale: 'en_US',
                appUILocale: 'en_US',
                appId: 'AEFT',
                isAppRunning: true,
                appSkinInfo: {
                    baseFontFamily: 'system-ui',
                    baseFontSize: '13px'
                }
            };
        } catch (error) {
            console.warn('⚠️ Could not get host environment:', error);
            return null;
        }
    };

    /**
     * Get CEP version
     */
    CSInterface.prototype.getCepVersion = function() {
        return '11.0.0'; // Current CEP version
    };

    /**
     * Evaluate ExtendScript in After Effects
     * @param {string} script - The ExtendScript code to execute
     * @param {function} callback - Callback function for the result
     */
    CSInterface.prototype.evalScript = function(script, callback) {
        if (typeof script !== 'string') {
            console.error('❌ evalScript: script must be a string');
            if (callback) callback(null);
            return;
        }

        console.log('🔧 Executing ExtendScript:', script.substring(0, 100) + '...');

        // Simulate script execution for development
        // In production CEP, this would actually execute in After Effects
        setTimeout(() => {
            try {
                const result = this.simulateScriptExecution(script);
                if (callback) callback(result);
            } catch (error) {
                console.error('❌ Script execution error:', error);
                if (callback) callback(null);
            }
        }, 100); // Simulate network delay
    };

    /**
     * Simulate script execution for development
     * @param {string} script - The script to simulate
     */
    CSInterface.prototype.simulateScriptExecution = function(script) {
        // Simulate common After Effects operations
        if (script.includes('app.project')) {
            return JSON.stringify({
                numItems: 2,
                activeItem: {
                    name: 'Comp 1',
                    width: 1920,
                    height: 1080,
                    frameRate: 30,
                    duration: 10,
                    numLayers: 3
                }
            });
        }

        if (script.includes('selectedLayers')) {
            return JSON.stringify([{
                name: 'Layer 1',
                property: 'Transform.Position',
                value: [960, 540]
            }]);
        }

        if (script.includes('addProperty')) {
            return 'Property added successfully';
        }

        // Default response
        return 'Script executed successfully';
    };

    /**
     * Get current After Effects context
     * @param {function} callback - Callback with context data
     */
    CSInterface.prototype.getAEContext = function(callback) {
        const script = `
            try {
                var context = {
                    project: {
                        name: app.project.file ? app.project.file.name : 'Untitled Project',
                        numItems: app.project.numItems,
                        activeItem: app.project.activeItem ? {
                            name: app.project.activeItem.name,
                            typeName: app.project.activeItem.typeName,
                            width: app.project.activeItem.width,
                            height: app.project.activeItem.height,
                            frameRate: app.project.activeItem.frameRate,
                            duration: app.project.activeItem.duration,
                            numLayers: app.project.activeItem.numLayers
                        } : null
                    },
                    selectedLayers: [],
                    time: app.project.activeItem ? app.project.activeItem.time : 0
                };

                // Get selected layers info
                if (app.project.activeItem && app.project.activeItem.selectedLayers) {
                    for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
                        var layer = app.project.activeItem.selectedLayers[i];
                        context.selectedLayers.push({
                            name: layer.name,
                            index: layer.index,
                            enabled: layer.enabled,
                            typeName: layer.constructor.name
                        });
                    }
                }

                JSON.stringify(context);
            } catch (error) {
                JSON.stringify({error: error.message});
            }
        `;

        this.evalScript(script, (result) => {
            try {
                const context = JSON.parse(result);
                if (callback) callback(context);
            } catch (error) {
                console.error('❌ Failed to parse AE context:', error);
                if (callback) callback({error: 'Failed to get context'});
            }
        });
    };

    /**
     * Apply expression to selected property
     * @param {string} expression - The expression to apply
     * @param {function} callback - Callback with result
     */
    CSInterface.prototype.applyExpression = function(expression, callback) {
        const script = `
            try {
                if (app.project.activeItem && app.project.activeItem.selectedLayers.length > 0) {
                    var layer = app.project.activeItem.selectedLayers[0];
                    var property = layer.selectedProperties[0];

                    if (property) {
                        property.expression = '${expression.replace(/'/g, "\\'")}';
                        'Expression applied successfully';
                    } else {
                        'No property selected';
                    }
                } else {
                    'No layer or composition selected';
                }
            } catch (error) {
                'Error: ' + error.message;
            }
        `;

        this.evalScript(script, callback);
    };

    /**
     * Get available effects and presets
     * @param {function} callback - Callback with effects list
     */
    CSInterface.prototype.getEffectsList = function(callback) {
        const script = `
            try {
                var effects = [];
                for (var i = 1; i <= app.effects.numProperties; i++) {
                    var effect = app.effects(i);
                    effects.push({
                        name: effect.displayName,
                        category: effect.category,
                        matchName: effect.matchName
                    });
                }
                JSON.stringify(effects);
            } catch (error) {
                JSON.stringify([]);
            }
        `;

        this.evalScript(script, (result) => {
            try {
                const effects = JSON.parse(result);
                if (callback) callback(effects);
            } catch (error) {
                if (callback) callback([]);
            }
        });
    };

    /**
     * Event system for CEP communications
     */
    CSInterface.prototype.addEventListener = function(eventType, callback) {
        if (!this._eventCallbacks[eventType]) {
            this._eventCallbacks[eventType] = [];
        }
        this._eventCallbacks[eventType].push(callback);
    };

    CSInterface.prototype.removeEventListener = function(eventType, callback) {
        if (this._eventCallbacks[eventType]) {
            const index = this._eventCallbacks[eventType].indexOf(callback);
            if (index > -1) {
                this._eventCallbacks[eventType].splice(index, 1);
            }
        }
    };

    CSInterface.prototype.dispatchEvent = function(eventType, data) {
        if (this._eventCallbacks[eventType]) {
            this._eventCallbacks[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('❌ Event callback error:', error);
                }
            });
        }
    };

    /**
     * Theme monitoring for After Effects UI changes
     */
    CSInterface.prototype.initThemeMonitoring = function() {
        // Monitor for theme changes (in real CEP, this would be automatic)
        this.currentTheme = 'dark'; // Default to dark theme

        // Simulate theme change detection
        setInterval(() => {
            // In real CEP, this would detect actual theme changes
            const newTheme = this.detectTheme();
            if (newTheme !== this.currentTheme) {
                this.currentTheme = newTheme;
                this._themeChangeCallbacks.forEach(callback => {
                    callback(newTheme);
                });
            }
        }, 5000); // Check every 5 seconds
    };

    CSInterface.prototype.detectTheme = function() {
        // Simulate theme detection
        // In real CEP, this would query the actual AE theme
        return 'dark'; // For now, always return dark
    };

    CSInterface.prototype.addThemeChangeListener = function(callback) {
        this._themeChangeCallbacks.push(callback);
    };

    CSInterface.prototype.removeThemeChangeListener = function(callback) {
        const index = this._themeChangeCallbacks.indexOf(callback);
        if (index > -1) {
            this._themeChangeCallbacks.splice(index, 1);
        }
    };

    /**
     * Open URL in default browser
     * @param {string} url - URL to open
     */
    CSInterface.prototype.openURLInDefaultBrowser = function(url) {
        try {
            // In real CEP, this would open the URL in the system browser
            window.open(url, '_blank');
        } catch (error) {
            console.error('❌ Failed to open URL:', error);
        }
    };

    /**
     * Get system information
     */
    CSInterface.prototype.getSystemInfo = function() {
        return {
            os: navigator.platform,
            locale: navigator.language,
            cepVersion: this.cepVersion,
            hostEnvironment: this.hostEnvironment
        };
    };

    // Create global instance
    window.CSInterface = CSInterface;
    window.csInterface = new CSInterface();

})();

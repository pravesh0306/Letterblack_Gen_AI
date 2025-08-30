// Advanced Adobe CEP SDK Integration Module
// Enhances AI features with comprehensive After Effects API access

class AdvancedSDKIntegration {
    constructor() {
        this.csInterface = window.CSInterface ? new CSInterface() : null;
        this.eventListeners = new Map();
        this.extensionInfo = null;
        this.hostCapabilities = null;
        this.isConnected = false;
        this.lastRealtimeState = null; // Track the last known state of AE
        this.pollInterval = null; // To hold the interval ID
        
        this.init();
    }

    async init() {
        if (!this.csInterface) {
            console.error('❌ CSInterface not available - Advanced SDK features disabled');
            return;
        }

        try {
            // Get extension and host information
            this.extensionInfo = this.csInterface.getExtensions();
            this.hostCapabilities = this.csInterface.getHostCapabilities();
            this.isConnected = true;
            
            console.log('🚀 Advanced SDK Integration initialized:', {
                hostApp: this.csInterface.hostEnvironment?.appName,
                version: this.csInterface.hostEnvironment?.appVersion,
                capabilities: this.hostCapabilities
            });

            // Set up advanced event listeners
            this.setupAdvancedEventListeners();

            // Start polling for After Effects changes
            this.pollInterval = setInterval(this.pollForChanges.bind(this), 2000); // Check every 2 seconds
            
        } catch (error) {
            console.error('Failed to initialize Advanced SDK:', error);
        }
    }

    // Poll After Effects for real-time changes
    pollForChanges() {
        if (!this.csInterface || !this.isConnected) {
            clearInterval(this.pollInterval);
            return;
        }
        // This calls the new, more efficient state-checking function in ExtendScript
        this.csInterface.evalScript('pollForStateChanges()');
    }

    // ENHANCED AI FEATURE 1: Real-time Project Monitoring
    setupAdvancedEventListeners() {
        if (!this.csInterface) return;

        // Listen for composition changes
        this.csInterface.addEventListener('com.adobe.csxs.events.ApplicationActivate', (event) => {
            console.log('🎬 After Effects activated - refreshing AI context');
            this.broadcastProjectChange('application_activated');
        });

        // Listen for selection changes (requires custom events from ExtendScript)
        this.registerCustomEvent('layerSelectionChanged', (data) => {
            console.log('🎯 Layer selection changed:', data);
            this.broadcastProjectChange('selection_changed', data);
        });

        // Listen for composition changes
        this.registerCustomEvent('compositionChanged', (data) => {
            console.log('🎨 Composition changed:', data);
            this.broadcastProjectChange('composition_changed', data);
        });
    }

    // ENHANCED AI FEATURE 2: Intelligent Layer Analysis with Real-time Updates
    async getAdvancedLayerAnalysis() {
        if (!this.csInterface) return null;

        return new Promise((resolve) => {
            const advancedScript = `
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem)) {
                        JSON.stringify({status: 'error', message: 'No active composition'});
                    } else {
                        var result = {
                            status: 'success',
                            composition: {
                                name: comp.name,
                                width: comp.width,
                                height: comp.height,
                                duration: comp.duration,
                                frameRate: comp.frameRate,
                                workAreaStart: comp.workAreaStart,
                                workAreaDuration: comp.workAreaDuration,
                                bgColor: [comp.bgColor[0], comp.bgColor[1], comp.bgColor[2]]
                            },
                            selectedLayers: [],
                            allLayers: [],
                            timeline: {
                                currentTime: comp.time,
                                timeDisplay: comp.displayStartTime
                            }
                        };

                        // Analyze ALL layers for better AI context
                        for (var i = 1; i <= comp.numLayers; i++) {
                            var layer = comp.layer(i);
                            var layerInfo = {
                                index: i,
                                name: layer.name,
                                type: this.getLayerType(layer),
                                enabled: layer.enabled,
                                locked: layer.locked,
                                shy: layer.shy,
                                solo: layer.solo,
                                hasVideo: layer.hasVideo,
                                hasAudio: layer.hasAudio,
                                inPoint: layer.inPoint,
                                outPoint: layer.outPoint,
                                startTime: layer.startTime,
                                stretch: layer.stretch,
                                blendingMode: layer.blendingMode.toString(),
                                effects: [],
                                transform: {},
                                parent: layer.parent ? layer.parent.name : null,
                                markers: []
                            };

                            // Get transform properties
                            try {
                                layerInfo.transform = {
                                    position: layer.transform.position.value,
                                    scale: layer.transform.scale.value,
                                    rotation: layer.transform.rotation.value,
                                    opacity: layer.transform.opacity.value,
                                    anchorPoint: layer.transform.anchorPoint.value
                                };
                            } catch (e) {}

                            // Get all effects with detailed properties
                            try {
                                var effects = layer.property("Effects");
                                for (var j = 1; j <= effects.numProperties; j++) {
                                    var effect = effects.property(j);
                                    var effectInfo = {
                                        name: effect.name,
                                        matchName: effect.matchName,
                                        enabled: effect.enabled,
                                        properties: {}
                                    };

                                    // Get effect properties
                                    for (var k = 1; k <= effect.numProperties; k++) {
                                        try {
                                            var prop = effect.property(k);
                                            if (prop.value !== undefined) {
                                                effectInfo.properties[prop.name] = {
                                                    value: prop.value,
                                                    hasExpression: prop.expression !== "",
                                                    expression: prop.expression
                                                };
                                            }
                                        } catch (e) {}
                                    }

                                    layerInfo.effects.push(effectInfo);
                                }
                            } catch (e) {}

                            // Get markers
                            try {
                                var markers = layer.property("Marker");
                                for (var m = 1; m <= markers.numKeys; m++) {
                                    layerInfo.markers.push({
                                        time: markers.keyTime(m),
                                        comment: markers.keyValue(m).comment || "",
                                        duration: markers.keyValue(m).duration || 0
                                    });
                                }
                            } catch (e) {}

                            result.allLayers.push(layerInfo);

                            // Check if layer is selected
                            for (var s = 0; s < comp.selectedLayers.length; s++) {
                                if (comp.selectedLayers[s] === layer) {
                                    result.selectedLayers.push(layerInfo);
                                    break;
                                }
                            }
                        }

                        JSON.stringify(result);
                    }
                } catch (error) {
                    JSON.stringify({status: 'error', message: error.toString()});
                }

                // Helper function to determine layer type
                function getLayerType(layer) {
                    if (layer instanceof TextLayer) return "text";
                    if (layer instanceof ShapeLayer) return "shape";
                    if (layer instanceof LightLayer) return "light";
                    if (layer instanceof CameraLayer) return "camera";
                    if (layer instanceof AVLayer) {
                        if (layer.source instanceof FootageItem) {
                            if (layer.source.mainSource instanceof SolidSource) return "solid";
                            if (layer.source.hasVideo) return "footage";
                            if (layer.source.hasAudio) return "audio";
                        } else if (layer.source instanceof CompItem) {
                            return "precomp";
                        }
                    }
                    return "unknown";
                }
            `;

            this.csInterface.evalScript(advancedScript, (result) => {
                try {
                    const analysis = JSON.parse(result);
                    if (analysis.status === 'error') {
                        console.error('Advanced layer analysis script failed:', analysis.message);
                        resolve(null);
                    } else {
                        resolve(analysis);
                    }
                } catch (error) {
                    console.error('Failed to parse advanced layer analysis result:', error, result);
                    resolve(null);
                }
            });
        });
    }

    // ENHANCED AI FEATURE 3: Smart Effect Application with Context Awareness
    async applySmartEffect(effectName, settings = {}, aiContext = null) {
        if (!this.csInterface) return false;

        return new Promise((resolve) => {
            const smartEffectScript = `
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem)) {
                        JSON.stringify({status: 'error', message: 'No active composition'});
                    } else if (comp.selectedLayers.length === 0) {
                        JSON.stringify({status: 'error', message: 'No layers selected'});
                    } else {
                        app.beginUndoGroup("AI Smart Effect: ${effectName}");
                        
                        var results = [];
                        for (var i = 0; i < comp.selectedLayers.length; i++) {
                            var layer = comp.selectedLayers[i];
                            var effectResult = this.applyContextualEffect(layer, "${effectName}", ${JSON.stringify(settings)}, ${JSON.stringify(aiContext)});
                            results.push(effectResult);
                        }
                        
                        app.endUndoGroup();
                        JSON.stringify({status: 'success', results: results});
                    }
                } catch (error) {
                    app.endUndoGroup();
                    JSON.stringify({status: 'error', message: error.toString()});
                }

                // Smart effect application based on AI context
                function applyContextualEffect(layer, effectName, settings, aiContext) {
                    try {
                        var effect = layer.property("Effects").addProperty(effectName);
                        
                        // Apply AI-suggested settings based on layer type and context
                        if (aiContext && aiContext.suggestedSettings) {
                            for (var propName in aiContext.suggestedSettings) {
                                try {
                                    var prop = effect.property(propName);
                                    if (prop) {
                                        prop.setValue(aiContext.suggestedSettings[propName]);
                                    }
                                } catch (e) {}
                            }
                        }
                        
                        // Apply user settings
                        for (var userProp in settings) {
                            try {
                                var userPropObj = effect.property(userProp);
                                if (userPropObj) {
                                    userPropObj.setValue(settings[userProp]);
                                }
                            } catch (e) {}
                        }
                        
                        return {layerName: layer.name, effectName: effectName, success: true};
                    } catch (error) {
                        return {layerName: layer.name, effectName: effectName, success: false, error: error.toString()};
                    }
                }
            `;

            this.csInterface.evalScript(smartEffectScript, (result) => {
                try {
                    const response = JSON.parse(result);
                    if (response.status === 'error') {
                        console.error('Smart effect script returned an error:', response.message);
                        resolve(false);
                    } else {
                        resolve(response.status === 'success');
                    }
                } catch (error) {
                    console.error('Failed to parse smart effect result:', error, result);
                    resolve(false);
                }
            });
        });
    }

    // ENHANCED AI FEATURE 4: Dynamic Expression Generation with Validation
    async applyIntelligentExpression(propertyPath, expressionCode, validationContext = null) {
        if (!this.csInterface) return false;

        return new Promise((resolve) => {
            const expressionScript = `
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem) || comp.selectedLayers.length === 0) {
                        JSON.stringify({status: 'error', message: 'No layers selected'});
                    } else {
                        app.beginUndoGroup("AI Expression Application");
                        
                        var results = [];
                        for (var i = 0; i < comp.selectedLayers.length; i++) {
                            var layer = comp.selectedLayers[i];
                            var result = this.applyExpressionWithValidation(layer, "${propertyPath}", \`${expressionCode}\`, ${JSON.stringify(validationContext)});
                            results.push(result);
                        }
                        
                        app.endUndoGroup();
                        JSON.stringify({status: 'success', results: results});
                    }
                } catch (error) {
                    app.endUndoGroup();
                    JSON.stringify({status: 'error', message: error.toString()});
                }

                function applyExpressionWithValidation(layer, propPath, expression, context) {
                    try {
                        var property = layer.property(propPath);
                        if (!property) {
                            return {layerName: layer.name, success: false, error: "Property not found: " + propPath};
                        }
                        
                        if (!property.canSetExpression) {
                            return {layerName: layer.name, success: false, error: "Property cannot have expressions"};
                        }
                        
                        // Backup original value
                        var originalExpression = property.expression;
                        var originalValue = property.value;
                        
                        try {
                            // Test the expression
                            property.expression = expression;
                            
                            // Validate if context provided
                            if (context && context.expectedType) {
                                var currentValue = property.value;
                                if (typeof currentValue !== context.expectedType) {
                                    property.expression = originalExpression;
                                    return {layerName: layer.name, success: false, error: "Expression type validation failed"};
                                }
                            }
                            
                            return {layerName: layer.name, success: true, appliedExpression: expression};
                        } catch (expressionError) {
                            // Restore original
                            property.expression = originalExpression;
                            return {layerName: layer.name, success: false, error: "Expression error: " + expressionError.toString()};
                        }
                        
                    } catch (error) {
                        return {layerName: layer.name, success: false, error: error.toString()};
                    }
                }
            `;

            this.csInterface.evalScript(expressionScript, (result) => {
                try {
                    const response = JSON.parse(result);
                     if (response.status === 'error') {
                        console.error('Intelligent expression script failed:', response.message);
                    }
                    resolve(response);
                } catch (error) {
                    console.error('Failed to parse intelligent expression result:', error, result);
                    resolve({status: 'error', message: 'Failed to parse response from AE.'});
                }
            });
        });
    }

    // ENHANCED AI FEATURE 5: Automated Project Setup Based on AI Analysis
    async createIntelligentComposition(specs) {
        if (!this.csInterface) return null;

        return new Promise((resolve) => {
            const creationScript = `
                try {
                    app.beginUndoGroup("AI Composition Creation");
                    
                    // Create composition with AI-suggested settings
                    var comp = app.project.items.addComp(
                        "${specs.name || 'AI Generated Comp'}",
                        ${specs.width || 1920},
                        ${specs.height || 1080},
                        ${specs.pixelAspect || 1},
                        ${specs.duration || 10},
                        ${specs.frameRate || 29.97}
                    );
                    
                    // Set background color if specified
                    if (${specs.backgroundColor}) {
                        comp.bgColor = [${specs.backgroundColor[0] || 0}, ${specs.backgroundColor[1] || 0}, ${specs.backgroundColor[2] || 0}];
                    }
                    
                    var results = {
                        compName: comp.name,
                        createdLayers: []
                    };
                    
                    // Create AI-suggested layers
                    ${this.generateLayerCreationScript(specs.suggestedLayers || [])}
                    
                    // Activate the composition
                    comp.openInViewer();
                    app.project.activeItem = comp;
                    
                    app.endUndoGroup();
                    JSON.stringify({status: 'success', data: results});
                    
                } catch (error) {
                    app.endUndoGroup();
                    JSON.stringify({status: 'error', message: error.toString()});
                }
            `;

            this.csInterface.evalScript(creationScript, (result) => {
                try {
                    const response = JSON.parse(result);
                    if (response.status === 'error') {
                        console.error('Intelligent composition script failed:', response.message);
                        resolve(null);
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    console.error('Failed to parse intelligent composition result:', error, result);
                    resolve(null);
                }
            });
        });
    }

    // ENHANCED AI FEATURE 6: Real-time Performance Monitoring
    async getPerformanceMetrics() {
        if (!this.csInterface) return null;

        return new Promise((resolve) => {
            const metricsScript = `
                try {
                    var comp = app.project.activeItem;
                    var metrics = {
                        timestamp: new Date().getTime(),
                        memory: {
                            used: app.memoryInUse,
                            available: app.memoryInUse // AE doesn't expose total memory directly
                        },
                        project: {
                            totalItems: app.project.numItems,
                            totalSize: 0 // Would need to calculate
                        },
                        activeComp: null
                    };
                    
                    if (comp && comp instanceof CompItem) {
                        metrics.activeComp = {
                            name: comp.name,
                            layers: comp.numLayers,
                            duration: comp.duration,
                            resolution: [comp.width, comp.height],
                            frameRate: comp.frameRate,
                            workAreaStart: comp.workAreaStart,
                            workAreaDuration: comp.workAreaDuration,
                            currentTime: comp.time
                        };
                    }
                    
                    JSON.stringify({status: 'success', metrics: metrics});
                } catch (error) {
                    JSON.stringify({status: 'error', message: error.toString()});
                }
            `;

            this.csInterface.evalScript(metricsScript, (result) => {
                try {
                    const response = JSON.parse(result);
                    if (response.status === 'success') {
                        resolve(response.metrics);
                    } else {
                        console.error('Performance metrics script failed:', response.message);
                        resolve(null);
                    }
                } catch (error) {
                    console.error('Failed to parse performance metrics result:', error, result);
                    resolve(null);
                }
            });
        });
    }

    // ENHANCED AI FEATURE 7: Custom Event System for AI-AE Communication
    registerCustomEvent(eventType, callback) {
        if (!this.csInterface) return;

        const eventName = `com.ai.${eventType}`;
        this.eventListeners.set(eventName, callback);
        
        this.csInterface.addEventListener(eventName, (event) => {
            try {
                const data = JSON.parse(event.data);
                callback(data);
            } catch (error) {
                callback(event.data);
            }
        });
    }

    dispatchAIEvent(eventType, data) {
        if (!this.csInterface) return;

        const event = new CSEvent(`com.ai.${eventType}`, 'APPLICATION');
        event.data = JSON.stringify(data);
        this.csInterface.dispatchEvent(event);
    }

    // ENHANCED AI FEATURE 8: Dynamic UI Generation
    createDynamicPanel(panelSpec) {
        if (!this.csInterface) return;

        // This would create custom UI elements based on AI analysis
        // For now, we can dispatch events to update existing UI
        this.dispatchAIEvent('updateUI', panelSpec);
    }

    // Helper Methods
    generateLayerCreationScript(layerSpecs) {
        return layerSpecs.map(spec => {
            switch (spec.type) {
                case 'text':
                    return `
                        var textLayer = comp.layers.addText("${spec.text || 'AI Text'}");
                        textLayer.name = "${spec.name || 'AI Text Layer'}";
                        results.createdLayers.push(textLayer.name);
                    `;
                case 'solid':
                    return `
                        var solidLayer = comp.layers.addSolid([${spec.color.join(',')}], "${spec.name || 'AI Solid'}", comp.width, comp.height, 1);
                        results.createdLayers.push(solidLayer.name);
                    `;
                case 'null':
                    return `
                        var nullLayer = comp.layers.addNull();
                        nullLayer.name = "${spec.name || 'AI Null'}";
                        results.createdLayers.push(nullLayer.name);
                    `;
                default:
                    return '';
            }
        }).join('\n');
    }

    broadcastProjectChange(changeType, data = null) {
        // Notify all AI modules about project changes
        window.dispatchEvent(new CustomEvent('aeProjectChange', {
            detail: {
                type: changeType,
                data: data,
                timestamp: Date.now()
            }
        }));
    }

    // Utility Methods
    isConnected() {
        return this.isConnected;
    }

    getHostInfo() {
        return this.csInterface ? this.csInterface.hostEnvironment : null;
    }

    getCapabilities() {
        return this.hostCapabilities;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AdvancedSDKIntegration = AdvancedSDKIntegration;
}

// Layer Analysis Module
// Scans selected layers to read effects, properties, and settings for intelligent AI assistance

class LayerAnalysisModule {
    constructor() {
        this.lastScannedLayer = null;
        this.cachedAnalysis = null;
    }

    // Main method to analyze selected layer(s)
    async analyzeSelectedLayers() {
        return new Promise((resolve) => {
            if (!window.CSInterface) {
                resolve({ error: 'CSInterface not available' });
                return;
            }

            const cs = new CSInterface();
            const analysisScript = this.generateAnalysisScript();

            cs.evalScript(analysisScript, (result) => {
                try {
                    const analysis = JSON.parse(result);
                    this.cachedAnalysis = analysis;
                    resolve(analysis);
                } catch (error) {
                    this.logger.error('Error parsing layer analysis:', error);
                    resolve({ error: 'Failed to parse layer analysis' });
                }
            });
        });
    }

    // Generate ExtendScript to analyze layers
    generateAnalysisScript() {
        return `
        (function() {
            try {
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    return JSON.stringify({ error: 'No active composition' });
                }

                var selectedLayers = comp.selectedLayers;
                if (selectedLayers.length === 0) {
                    return JSON.stringify({ error: 'No layers selected' });
                }

                var analysis = {
                    timestamp: new Date().toISOString(),
                    composition: {
                        name: comp.name,
                        width: comp.width,
                        height: comp.height,
                        duration: comp.duration,
                        frameRate: comp.frameRate
                    },
                    layers: []
                };

                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    var layerInfo = {
                        name: layer.name,
                        index: layer.index,
                        type: getLayerType(layer),
                        enabled: layer.enabled,
                        locked: layer.locked,
                        shy: layer.shy,
                        inPoint: layer.inPoint,
                        outPoint: layer.outPoint,
                        startTime: layer.startTime,
                        stretch: layer.stretch,
                        blendingMode: getBlendingMode(layer.blendingMode),
                        effects: [],
                        transform: {},
                        masks: [],
                        expressions: {}
                    };

                    // Analyze transform properties
                    analyzeTransform(layer, layerInfo);

                    // Analyze effects
                    analyzeEffects(layer, layerInfo);

                    // Analyze masks
                    analyzeMasks(layer, layerInfo);

                    // Check for expressions
                    analyzeExpressions(layer, layerInfo);

                    analysis.layers.push(layerInfo);
                }

                return JSON.stringify(analysis);

            } catch (error) {
                return JSON.stringify({ error: error.toString() });
            }

            function getLayerType(layer) {
                if (layer instanceof AVLayer) {
                    if (layer.source instanceof FootageItem) {
                        return 'footage';
                    } else if (layer.source instanceof CompItem) {
                        return 'precomp';
                    }
                } else if (layer instanceof TextLayer) {
                    return 'text';
                } else if (layer instanceof ShapeLayer) {
                    return 'shape';
                } else if (layer instanceof CameraLayer) {
                    return 'camera';
                } else if (layer instanceof LightLayer) {
                    return 'light';
                }
                return 'null';
            }

            function getBlendingMode(mode) {
                var modes = [
                    'Normal', 'Dissolve', 'Dancing Dissolve', 'Darken', 'Multiply',
                    'Color Burn', 'Classic Color Burn', 'Linear Burn', 'Darker Color',
                    'Lighten', 'Screen', 'Color Dodge', 'Classic Color Dodge',
                    'Linear Dodge', 'Lighter Color', 'Overlay', 'Soft Light',
                    'Hard Light', 'Vivid Light', 'Linear Light', 'Pin Light',
                    'Hard Mix', 'Difference', 'Classic Difference', 'Exclusion',
                    'Subtract', 'Divide', 'Hue', 'Saturation', 'Color', 'Luminosity'
                ];
                return modes[mode.value - 1] || 'Unknown';
            }

            function analyzeTransform(layer, layerInfo) {
                try {
                    var transform = layer.transform;
                    layerInfo.transform = {
                        position: {
                            value: transform.position.value,
                            hasExpression: transform.position.expression !== '',
                            expression: transform.position.expression
                        },
                        scale: {
                            value: transform.scale.value,
                            hasExpression: transform.scale.expression !== '',
                            expression: transform.scale.expression
                        },
                        rotation: {
                            value: transform.rotation.value,
                            hasExpression: transform.rotation.expression !== '',
                            expression: transform.rotation.expression
                        },
                        opacity: {
                            value: transform.opacity.value,
                            hasExpression: transform.opacity.expression !== '',
                            expression: transform.opacity.expression
                        }
                    };

                    // Add anchor point if 3D layer
                    if (layer.threeDLayer) {
                        layerInfo.transform.anchorPoint = {
                            value: transform.anchorPoint.value,
                            hasExpression: transform.anchorPoint.expression !== ''
                        };
                    }
                } catch (error) {
                    layerInfo.transform.error = error.toString();
                }
            }

            function analyzeEffects(layer, layerInfo) {
                try {
                    var effects = layer.property('Effects');
                    if (effects) {
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
                                var prop = effect.property(k);
                                if (prop && prop.propertyType === PropertyType.PROPERTY) {
                                    effectInfo.properties[prop.name] = {
                                        value: prop.value,
                                        hasExpression: prop.expression !== '',
                                        expression: prop.expression || null
                                    };
                                }
                            }

                            layerInfo.effects.push(effectInfo);
                        }
                    }
                } catch (error) {
                    layerInfo.effects.push({ error: error.toString() });
                }
            }

            function analyzeMasks(layer, layerInfo) {
                try {
                    var masks = layer.property('Masks');
                    if (masks) {
                        for (var j = 1; j <= masks.numProperties; j++) {
                            var mask = masks.property(j);
                            layerInfo.masks.push({
                                name: mask.name,
                                maskMode: mask.maskMode,
                                inverted: mask.inverted,
                                locked: mask.locked,
                                maskFeather: mask.maskFeather.value,
                                maskOpacity: mask.maskOpacity.value
                            });
                        }
                    }
                } catch (error) {
                    layerInfo.masks.push({ error: error.toString() });
                }
            }

            function analyzeExpressions(layer, layerInfo) {
                try {
                    // Check common properties for expressions
                    var expressionProps = [];
                    
                    function checkProperty(prop, path) {
                        if (prop && prop.expression && prop.expression !== '') {
                            expressionProps.push({
                                path: path,
                                expression: prop.expression
                            });
                        }
                    }

                    // Transform expressions already captured above
                    // Check effects for expressions (already captured above)
                    
                    layerInfo.expressions.count = expressionProps.length;
                    layerInfo.expressions.properties = expressionProps;
                } catch (error) {
                    layerInfo.expressions.error = error.toString();
                }
            }

        })();
        `;
    }

    // Format analysis for AI context
    formatAnalysisForAI(analysis) {
        if (analysis.error) {
            return `❌ Layer Analysis Error: ${analysis.error}`;
        }

        let context = `🔍 **CURRENT LAYER ANALYSIS:**\n\n`;
        
        analysis.layers.forEach((layer, index) => {
            context += `**Layer ${layer.index}: "${layer.name}"** (${layer.type})\n`;
            context += `• Status: ${layer.enabled ? 'Enabled' : 'Disabled'} | Blend: ${layer.blendingMode}\n`;
            
            // Transform properties
            context += `• Position: [${layer.transform.position?.value?.join(', ') || 'N/A'}]`;
            if (layer.transform.position?.hasExpression) {
                context += ` ⚡ Has Expression`;
            }
            context += `\n`;
            
            context += `• Scale: [${layer.transform.scale?.value?.join(', ') || 'N/A'}]%`;
            if (layer.transform.scale?.hasExpression) {
                context += ` ⚡ Has Expression`;
            }
            context += `\n`;
            
            context += `• Rotation: ${layer.transform.rotation?.value || 'N/A'}°`;
            if (layer.transform.rotation?.hasExpression) {
                context += ` ⚡ Has Expression`;
            }
            context += `\n`;
            
            context += `• Opacity: ${layer.transform.opacity?.value || 'N/A'}%`;
            if (layer.transform.opacity?.hasExpression) {
                context += ` ⚡ Has Expression`;
            }
            context += `\n`;

            // Effects
            if (layer.effects.length > 0) {
                context += `\n**🎨 Applied Effects:**\n`;
                layer.effects.forEach(effect => {
                    if (!effect.error) {
                        context += `• ${effect.name} (${effect.enabled ? 'ON' : 'OFF'})\n`;
                        
                        // Key properties for common effects
                        Object.keys(effect.properties).forEach(propName => {
                            const prop = effect.properties[propName];
                            context += `  - ${propName}: ${prop.value}`;
                            if (prop.hasExpression) {
                                context += ` ⚡ Expression`;
                            }
                            context += `\n`;
                        });
                    }
                });
            }

            // Masks
            if (layer.masks.length > 0) {
                context += `\n**🎭 Masks:** ${layer.masks.length} mask(s)\n`;
            }

            // Expressions summary
            if (layer.expressions.count > 0) {
                context += `\n**⚡ Expressions:** ${layer.expressions.count} active expressions\n`;
            }

            context += `\n`;
        });

        return context;
    }

    // Generate intelligent suggestions based on analysis
    generateSmartSuggestions(analysis) {
        if (analysis.error) return [];

        const suggestions = [];
        
        analysis.layers.forEach(layer => {
            // Suggest based on current effects
            if (layer.effects.length === 0) {
                suggestions.push('💡 No effects applied - try "apply glow effect" or "add drop shadow"');
            } else {
                const effectNames = layer.effects.map(e => e.name.toLowerCase());
                
                if (effectNames.includes('glow')) {
                    suggestions.push('💡 Glow detected - try "add drop shadow" or "adjust glow color"');
                }
                
                if (effectNames.includes('drop shadow')) {
                    suggestions.push('💡 Shadow detected - try "apply glow" or "adjust shadow softness"');
                }
                
                if (!effectNames.includes('motion blur') && (
                    layer.transform.position?.hasExpression || 
                    layer.transform.rotation?.hasExpression
                )) {
                    suggestions.push('💡 Animation detected - consider "enable motion blur"');
                }
            }

            // Suggest based on transform properties
            if (layer.transform.opacity?.value < 100) {
                suggestions.push('💡 Layer has transparency - try "animate opacity" or "reset opacity"');
            }

            if (layer.transform.scale?.value && 
                (layer.transform.scale.value[0] !== 100 || layer.transform.scale.value[1] !== 100)) {
                suggestions.push('💡 Layer is scaled - try "reset scale" or "animate scale"');
            }
        });

        return suggestions;
    }

    // Get cached analysis if available
    getCachedAnalysis() {
        return this.cachedAnalysis;
    }

    // Clear cached analysis
    clearCache() {
        this.cachedAnalysis = null;
        this.lastScannedLayer = null;
    }
}

// Export for global use
window.LayerAnalysisModule = LayerAnalysisModule;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayerAnalysisModule;
}

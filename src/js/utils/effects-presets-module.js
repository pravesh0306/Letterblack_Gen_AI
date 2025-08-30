// Effects & Presets Module with Memory Context
// Uses conversation history to provide intelligent effect suggestions and modifications

class EffectsPresetsModule {
    constructor(chatMemory) {
        this.chatMemory = chatMemory;
        this.commonEffects = {
            glow: {
                name: "Glow",
                properties: ["Glow Threshold", "Glow Radius", "Glow Intensity", "Glow Colors"],
                script: this.createGlowScript,
                category: "stylize"
            },
            dropShadow: {
                name: "Drop Shadow", 
                properties: ["Shadow Color", "Opacity", "Direction", "Distance", "Softness"],
                script: this.createDropShadowScript,
                category: "perspective"
            },
            motionBlur: {
                name: "Motion Blur",
                properties: ["Shutter Angle", "Shutter Phase", "Samples"],
                script: this.createMotionBlurScript,
                category: "blur"
            },
            colorCorrection: {
                name: "Lumetri Color",
                properties: ["Exposure", "Contrast", "Highlights", "Shadows", "Saturation"],
                script: this.createColorCorrectionScript,
                category: "color"
            }
        };
        
        this.recentEffectsApplied = [];
    }

    // Analyze conversation for effect context
    analyzeEffectContext(message) {
        const lowerMessage = message.toLowerCase();
        const history = this.chatMemory ? this.chatMemory.getRecentHistory(10) : [];
        
        const context = {
            requestedEffect: null,
            lastAppliedEffect: null,
            modificationIntent: false,
            colorModification: null,
            complementaryEffects: []
        };

        // Check if this is a modification request
        const modificationWords = ['change', 'modify', 'adjust', 'make it', 'turn it', 'set it to'];
        context.modificationIntent = modificationWords.some(word => lowerMessage.includes(word));

        // Check for color modifications
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'white', 'black'];
        context.colorModification = colors.find(color => lowerMessage.includes(color));

        // Find last applied effect from conversation history
        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            if (msg.type === 'assistant' && this.containsEffectApplication(msg.text)) {
                context.lastAppliedEffect = this.extractEffectFromMessage(msg.text);
                break;
            }
        }

        // Detect requested effect
        Object.keys(this.commonEffects).forEach(effectKey => {
            const effect = this.commonEffects[effectKey];
            if (lowerMessage.includes(effect.name.toLowerCase()) || 
                lowerMessage.includes(effectKey)) {
                context.requestedEffect = effectKey;
            }
        });

        return context;
    }

    // Generate context-aware effect response
    generateEffectResponse(message, context) {
        if (context.modificationIntent && context.lastAppliedEffect && context.colorModification) {
            return this.generateEffectModification(context.lastAppliedEffect, context.colorModification);
        }

        if (context.requestedEffect) {
            return this.generateEffectApplication(context.requestedEffect, context);
        }

        return this.generateEffectSuggestion(message, context);
    }

    generateEffectApplication(effectKey, context) {
        const effect = this.commonEffects[effectKey];
        if (!effect) return null;

        let response = `I'll apply the ${effect.name} effect to your selected layer! `;
        
        // Add context from conversation
        if (context.lastAppliedEffect && context.lastAppliedEffect !== effectKey) {
            response += `This will complement the ${context.lastAppliedEffect} we applied earlier. `;
        }

        response += `\n\n`;
        response += effect.script();

        // Add follow-up suggestions
        response += `\n\n**💡 Next Steps:**\n`;
        response += `• Try saying "make it blue" to change colors\n`;
        response += `• Ask to "adjust the settings" for fine-tuning\n`;
        response += `• Say "add motion blur" for complementary effects\n`;

        // Track applied effect
        this.recentEffectsApplied.push({
            effect: effectKey,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    generateEffectModification(lastEffect, colorModification) {
        let response = `I'll modify that ${lastEffect} effect to be ${colorModification}! `;
        response += `\n\nBased on our conversation, I'm updating the color properties of the effect we just applied.\n\n`;
        
        if (lastEffect === 'glow') {
            response += this.createGlowColorModification(colorModification);
        } else if (lastEffect === 'dropShadow') {
            response += this.createDropShadowColorModification(colorModification);
        }

        return response;
    }

    // Effect script generators
    createGlowScript() {
        return `\`\`\`javascript
// Apply Glow Effect
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Apply Glow Effect");
    
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        var glowEffect = layer.property("Effects").addProperty("Glow");
        
        // Set nice default values
        glowEffect.property("Glow Threshold").setValue(50);
        glowEffect.property("Glow Radius").setValue(15);
        glowEffect.property("Glow Intensity").setValue(1.5);
    }
    
    app.endUndoGroup();
    alert("Glow effect applied to selected layers!");
} else {
    alert("Please select a layer first!");
}
\`\`\``;
    }

    createDropShadowScript() {
        return `\`\`\`javascript
// Apply Drop Shadow Effect
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Apply Drop Shadow");
    
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        var shadowEffect = layer.property("Effects").addProperty("Drop Shadow");
        
        // Set nice default values
        shadowEffect.property("Opacity").setValue(75);
        shadowEffect.property("Direction").setValue(135);
        shadowEffect.property("Distance").setValue(5);
        shadowEffect.property("Softness").setValue(3);
    }
    
    app.endUndoGroup();
    alert("Drop shadow applied to selected layers!");
}
\`\`\``;
    }

    createMotionBlurScript() {
        return `\`\`\`javascript
// Enable Motion Blur
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Apply Motion Blur");
    
    // Enable motion blur for composition
    comp.motionBlur = true;
    
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        layer.motionBlur = true;
    }
    
    app.endUndoGroup();
    alert("Motion blur enabled for selected layers!");
}
\`\`\``;
    }

    createGlowColorModification(color) {
        const colorValues = {
            red: '[1, 0, 0]',
            blue: '[0, 0.5, 1]', 
            green: '[0, 1, 0]',
            yellow: '[1, 1, 0]',
            purple: '[0.8, 0, 1]',
            orange: '[1, 0.5, 0]'
        };

        return `\`\`\`javascript
// Change Glow Color to ${color}
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup("Change Glow Color");
    
    for (var i = 0; i < comp.selectedLayers.length; i++) {
        var layer = comp.selectedLayers[i];
        var effects = layer.property("Effects");
        
        for (var j = 1; j <= effects.numProperties; j++) {
            var effect = effects.property(j);
            if (effect.matchName === "ADBE Glow2") {
                // Set glow color to ${color}
                effect.property("Glow Colors").setValue(${colorValues[color] || '[1, 1, 1]'});
                break;
            }
        }
    }
    
    app.endUndoGroup();
    alert("Glow color changed to ${color}!");
}
\`\`\``;
    }

    // Helper methods
    containsEffectApplication(text) {
        const effectKeywords = ['effect applied', 'glow', 'shadow', 'blur', 'color correction'];
        return effectKeywords.some(keyword => text.toLowerCase().includes(keyword));
    }

    extractEffectFromMessage(text) {
        const lowerText = text.toLowerCase();
        for (const [key, effect] of Object.entries(this.commonEffects)) {
            if (lowerText.includes(effect.name.toLowerCase()) || lowerText.includes(key)) {
                return key;
            }
        }
        return null;
    }

    // Get smart effect suggestions based on context
    getSmartSuggestions(context) {
        const suggestions = [];
        
        if (context.lastAppliedEffect === 'glow') {
            suggestions.push('Add drop shadow for depth');
            suggestions.push('Apply motion blur for movement');
            suggestions.push('Adjust glow color or intensity');
        } else if (context.lastAppliedEffect === 'dropShadow') {
            suggestions.push('Add outer glow for highlights');
            suggestions.push('Apply color correction');
        }

        return suggestions;
    }
}

// Export for global use
window.EffectsPresetsModule = EffectsPresetsModule;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EffectsPresetsModule;
}

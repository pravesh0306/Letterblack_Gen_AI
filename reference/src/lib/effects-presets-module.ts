import { ChatMemory } from './chat_memory';

type EffectName = 'glow' | 'dropShadow' | 'motionBlur' | 'colorCorrection';
type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'white' | 'black';

interface Effect {
    name: string;
    properties: string[];
    script: () => string;
    category: string;
}

interface EffectContext {
    requestedEffect: EffectName | null;
    lastAppliedEffect: EffectName | null;
    modificationIntent: boolean;
    colorModification: Color | null;
}

export class EffectsPresetsModule {
    private chatMemory: ChatMemory;
    private commonEffects: Record<EffectName, Effect>;
    private recentEffectsApplied: { effect: EffectName; timestamp: string }[] = [];

    constructor(chatMemory: ChatMemory) {
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
    }

    public analyzeEffectContext(message: string): EffectContext {
        const lowerMessage = message.toLowerCase();
        const history = this.chatMemory.getRecentHistory(10);
        
        const context: EffectContext = {
            requestedEffect: null,
            lastAppliedEffect: null,
            modificationIntent: false,
            colorModification: null,
        };

        const modificationWords = ['change', 'modify', 'adjust', 'make it', 'turn it', 'set it to'];
        context.modificationIntent = modificationWords.some(word => lowerMessage.includes(word));

        const colors: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'white', 'black'];
        context.colorModification = colors.find(color => lowerMessage.includes(color)) || null;

        for (let i = history.length - 1; i >= 0; i--) {
            const msg = history[i];
            if (msg.type === 'assistant' && this.containsEffectApplication(msg.text)) {
                context.lastAppliedEffect = this.extractEffectFromMessage(msg.text);
                break;
            }
        }

        for (const key in this.commonEffects) {
            const effectKey = key as EffectName;
            const effect = this.commonEffects[effectKey];
            if (lowerMessage.includes(effect.name.toLowerCase()) || lowerMessage.includes(effectKey)) {
                context.requestedEffect = effectKey;
            }
        }

        return context;
    }

    public generateEffectResponse(message: string, context: EffectContext): string | null {
        if (context.modificationIntent && context.lastAppliedEffect && context.colorModification) {
            return this.generateEffectModification(context.lastAppliedEffect, context.colorModification);
        }

        if (context.requestedEffect) {
            return this.generateEffectApplication(context.requestedEffect, context);
        }

        return null; // Or a generic suggestion
    }

    private generateEffectApplication(effectKey: EffectName, context: EffectContext): string {
        const effect = this.commonEffects[effectKey];
        let response = `Applying the ${effect.name} effect.\n\n${effect.script()}`;
        
        this.recentEffectsApplied.push({ effect: effectKey, timestamp: new Date().toISOString() });
        return response;
    }

    private generateEffectModification(lastEffect: EffectName, color: Color): string {
        let script = '';
        if (lastEffect === 'glow') {
            script = this.createGlowColorModification(color);
        } else if (lastEffect === 'dropShadow') {
            script = this.createDropShadowColorModification(color);
        }
        return `Modifying the ${lastEffect} to be ${color}.\n\n${script}`;
    }

    private createGlowScript(): string {
        return `\
// Apply Glow Effect
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Apply Glow");
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var glowEffect = layer.property("Effects").addProperty("Glow");
            glowEffect.property("Glow Threshold").setValue(50);
            glowEffect.property("Glow Radius").setValue(15);
            glowEffect.property("Glow Intensity").setValue(1.5);
        }
        app.endUndoGroup();
    console.log("Glow effect applied (simulated)");
    } else {
        alert("Please select a layer.");
    }
})();
\
```;
    }

    private createDropShadowScript(): string {
        return `\
// Apply Drop Shadow Effect
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Apply Drop Shadow");
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var layer = comp.selectedLayers[i];
            var shadowEffect = layer.property("Effects").addProperty("Drop Shadow");
            shadowEffect.property("Opacity").setValue(75);
            shadowEffect.property("Direction").setValue(135);
            shadowEffect.property("Distance").setValue(5);
            shadowEffect.property("Softness").setValue(3);
        }
        app.endUndoGroup();
    console.log("Drop shadow applied (simulated)");
    } else {
        alert("Please select a layer.");
    }
})();
\
```;
    }
    
    private createMotionBlurScript(): string {
        return `\
// Enable Motion Blur
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Enable Motion Blur");
        comp.motionBlur = true;
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            comp.selectedLayers[i].motionBlur = true;
        }
        app.endUndoGroup();
    console.log("Motion blur enabled for selected layers (simulated)");
    } else {
        alert("Please select a layer.");
    }
})();
\
```;
    }

    private createColorCorrectionScript(): string {
        return `\
// Apply Lumetri Color
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Apply Lumetri Color");
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            comp.selectedLayers[i].property("Effects").addProperty("Lumetri Color");
        }
        app.endUndoGroup();
    console.log("Lumetri Color applied (simulated)");
    } else {
        alert("Please select a layer.");
    }
})();
\
```;
    }

    private createGlowColorModification(color: Color): string {
        const colorValues: Record<Color, string> = {
            red: '[1, 0, 0]', blue: '[0, 0.5, 1]', green: '[0, 1, 0]',
            yellow: '[1, 1, 0]', purple: '[0.8, 0, 1]', orange: '[1, 0.5, 0]',
            white: '[1, 1, 1]', black: '[0, 0, 0]'
        };
        return `\
// Change Glow Color to ${color}
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Change Glow Color");
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var effect = comp.selectedLayers[i].property("Effects").property("Glow");
            if (effect) {
                effect.property("Glow Colors").setValue(${colorValues[color]});
            }
        }
        app.endUndoGroup();
        alert("Glow color changed to ${color}!");
    }
})();
\
```;
    }

    private createDropShadowColorModification(color: Color): string {
        const colorValues: Record<Color, string> = {
            red: '[1, 0, 0]', blue: '[0, 0, 1]', green: '[0, 1, 0]',
            yellow: '[1, 1, 0]', purple: '[0.5, 0, 0.5]', orange: '[1, 0.5, 0]',
            white: '[1, 1, 1]', black: '[0, 0, 0]'
        };
        return `\
// Change Drop Shadow Color to ${color}
(function() {
    var comp = app.project.activeItem;
    if (comp && comp.selectedLayers.length > 0) {
        app.beginUndoGroup("Change Drop Shadow Color");
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var effect = comp.selectedLayers[i].property("Effects").property("Drop Shadow");
            if (effect) {
                effect.property("Color").setValue(${colorValues[color]});
            }
        }
        app.endUndoGroup();
        alert("Drop Shadow color changed to ${color}!");
    }
})();
\
```;
    }

    private containsEffectApplication(text: string): boolean {
        const effectKeywords = ['effect applied', 'glow', 'shadow', 'blur', 'color correction'];
        return effectKeywords.some(keyword => text.toLowerCase().includes(keyword));
    }

    private extractEffectFromMessage(text: string): EffectName | null {
        const lowerText = text.toLowerCase();
        for (const key in this.commonEffects) {
            const effectKey = key as EffectName;
            const effect = this.commonEffects[effectKey];
            if (lowerText.includes(effect.name.toLowerCase()) || lowerText.includes(effectKey)) {
                return effectKey;
            }
        }
        return null;
    }
}

export default EffectsPresetsModule;
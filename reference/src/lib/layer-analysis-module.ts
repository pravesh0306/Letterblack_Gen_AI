// Layer Analysis Module - Enhanced for Zero Inconsistency Compliance
// Implements comprehensive layer detection, analysis, and marker functionality

// Declare the CSInterface object for TypeScript, assuming it's globally available in the CEP environment
declare const CSInterface: any;
declare const window: any; // Assuming a browser-like environment for UI events

// --- TYPE DEFINITIONS ---

interface AnalysisOptions {
    selectedOnly?: boolean;
    targetLayer?: number | null;
    includeProperties?: boolean;
    includeEffects?: boolean;
    includeMasks?: boolean;
    includeExpressions?: boolean;
    includePerformance?: boolean;
}

interface Composition {
    name: string;
    width: number;
    height: number;
    duration: number;
    frameRate: number;
}

interface EffectProperty {
    value: any;
    hasExpression: boolean;
    expression: string | null;
}

interface Effect {
    name: string;
    matchName: string;
    enabled: boolean;
    properties: { [key: string]: EffectProperty };
    error?: string;
}

interface Mask {
    name: string;
    maskMode: any; // Type depends on AE API
    inverted: boolean;
    locked: boolean;
    maskFeather: any; // Type depends on AE API
    maskOpacity: any; // Type depends on AE API
    error?: string;
}

interface TransformProperty {
    value: number[] | number;
    hasExpression: boolean;
    expression?: string;
}

interface Transform {
    position?: TransformProperty;
    scale?: TransformProperty;
    rotation?: TransformProperty;
    opacity?: TransformProperty;
    anchorPoint?: TransformProperty;
    error?: string;
}

interface LayerExpressionInfo {
    count: number;
    properties: { path: string; expression: string }[];
    error?: string;
}

interface Layer {
    name: string;
    index: number;
    type: string;
    enabled: boolean;
    locked: boolean;
    shy: boolean;
    inPoint: number;
    outPoint: number;
    startTime: number;
    stretch: number;
    blendingMode: string;
    effects: Effect[];
    transform: Transform;
    masks: Mask[];
    expressions: LayerExpressionInfo;
    hasKeyframes?: boolean;
    isAnimated?: boolean;
    issues?: any[]; // Define issue structure if known
}

interface Analysis {
    timestamp: string;
    composition: Composition;
    layers: Layer[];
    error?: string;
}

interface AnalysisHistoryItem {
    timestamp: string;
    analysis: Analysis;
    options: AnalysisOptions;
}

type MarkerType = 'issue' | 'suggestion' | 'optimization' | 'warning';
type MarkerSeverity = 'info' | 'warning' | 'error' | 'critical';

interface Marker {
    id: string;
    layerIndex: number;
    type: MarkerType;
    message: string;
    severity: MarkerSeverity;
    timestamp: string;
    resolved: boolean;
    updatedAt?: string;
}

interface PerformanceData {
    index: number;
    name: string;
    complexity: number;
    renderTime: number;
    bottlenecks: Bottleneck[];
    optimizationScore: number;
}

interface Bottleneck {
    type: 'effects' | 'expressions';
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
}

interface Optimization {
    layerIndex: number;
    type: 'complexity' | 'bottleneck';
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
}


class LayerAnalysisModule {
    private lastScannedLayer: any | null;
    private cachedAnalysis: Analysis | null;
    private markers: Map<string, Marker>;
    private analysisHistory: AnalysisHistoryItem[];

    constructor() {
        this.lastScannedLayer = null;
        this.cachedAnalysis = null;
        this.markers = new Map<string, Marker>();
        this.analysisHistory = [];
    }

    /**
     * Main method to analyze selected layer(s) or all layers.
     */
    async analyzeLayers(options: AnalysisOptions = {}): Promise<Analysis | { error: string }> {
        return new Promise((resolve) => {
            if (typeof CSInterface === 'undefined') {
                resolve({ error: 'CSInterface not available' });
                return;
            }

            const cs = new CSInterface();
            const analysisScript = this.generateAnalysisScript(options);

            cs.evalScript(analysisScript, (result: string) => {
                try {
                    const analysis: Analysis = JSON.parse(result);
                    if (analysis.error) {
                        console.error('Error from ExtendScript:', analysis.error);
                        resolve({ error: analysis.error });
                        return;
                    }
                    this.cachedAnalysis = analysis;
                    this.analysisHistory.push({
                        timestamp: new Date().toISOString(),
                        analysis: analysis,
                        options: options
                    });
                    resolve(analysis);
                } catch (error) {
                    console.error('Error parsing layer analysis:', error);
                    resolve({ error: 'Failed to parse layer analysis from ExtendScript' });
                }
            });
        });
    }

    /**
     * COMPATIBILITY METHOD - For backward compatibility with existing code.
     * This method provides the old API that some scripts might expect.
     */
    async analyzeSelectedLayers(): Promise<Analysis | { error: string }> {
        console.log('🔄 Using compatibility layer: analyzeSelectedLayers() -> analyzeLayers({ selectedOnly: true })');
        return this.analyzeLayers({ selectedOnly: true });
    }

    /**
     * Formats the analysis data into a human-readable string for AI context.
     */
    formatAnalysisForAI(analysis: Analysis | { error: string }): string {
        const analysisData = analysis as Analysis;
        if (!analysisData || (analysis as { error: string }).error) {
            return `❌ Layer Analysis Error: ${(analysis as { error: string }).error || 'Unknown error'}`;
        }

        let context = `🔍 **CURRENT LAYER ANALYSIS:**\n\n`;
        
        analysisData.layers.forEach((layer) => {
            context += `**Layer ${layer.index}: \"${layer.name}\"** (${layer.type})\n`;
            context += `• Status: ${layer.enabled ? 'Enabled' : 'Disabled'} | Blend: ${layer.blendingMode}\n`;
            
            // Transform properties
            context += `• Position: [${layer.transform.position?.value?.toString() || 'N/A'}]`;
            if (layer.transform.position?.hasExpression) context += ` ⚡ Has Expression`;
            context += `\n`;
            
            context += `• Scale: [${layer.transform.scale?.value?.toString() || 'N/A'}]%`;
            if (layer.transform.scale?.hasExpression) context += ` ⚡ Has Expression`;
            context += `\n`;
            
            context += `• Rotation: ${layer.transform.rotation?.value || 'N/A'}°`;
            if (layer.transform.rotation?.hasExpression) context += ` ⚡ Has Expression`;
            context += `\n`;
            
            context += `• Opacity: ${layer.transform.opacity?.value || 'N/A'}%`;
            if (layer.transform.opacity?.hasExpression) context += ` ⚡ Has Expression`;
            context += `\n`;

            // Effects
            if (layer.effects && layer.effects.length > 0) {
                context += `\n**🎨 Applied Effects:**\n`;
                layer.effects.forEach(effect => {
                    if (!effect.error) {
                        context += `• ${effect.name} (${effect.enabled ? 'ON' : 'OFF'})\n`;
                        Object.keys(effect.properties).forEach(propName => {
                            const prop = effect.properties[propName];
                            context += `  - ${propName}: ${prop.value}`;
                            if (prop.hasExpression) context += ` ⚡ Expression`;
                            context += `\n`;
                        });
                    }
                });
            }

            // Masks
            if (layer.masks && layer.masks.length > 0) {
                context += `\n**🎭 Masks:** ${layer.masks.length} mask(s)\n`;
            }

            // Expressions summary
            if (layer.expressions && layer.expressions.count > 0) {
                context += `\n**⚡ Expressions:** ${layer.expressions.count} active expressions\n`;
            }

            context += `\n`;
        });

        return context;
    }

    /**
     * Generates intelligent suggestions based on the analysis.
     */
    generateSmartSuggestions(analysis: Analysis | { error: string }): string[] {
        const analysisData = analysis as Analysis;
        if (!analysisData || (analysis as { error: string }).error || !analysisData.layers) {
            return [];
        }

        const suggestions: string[] = [];
        
        analysisData.layers.forEach(layer => {
            if (layer.effects.length === 0) {
                suggestions.push(`💡 For "${layer.name}", try
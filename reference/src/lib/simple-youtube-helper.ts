/**
 * SIMPLIFIED YouTube Helper - Essential functionality only
 * Replaces 3 complex modules with 1 simple, working solution
 * Converted to modern TypeScript with type safety.
 */

// Define a global window interface to extend it with our helper
declare global {
    interface Window {
        youtubeHelper: SimpleYouTubeHelper;
        SimpleYouTubeHelper: typeof SimpleYouTubeHelper;
    }
}

// Type definitions for clarity and safety
interface AIModule {
    generateResponse(prompt: string): Promise<any>;
}

interface YouTubeVideoMetadata {
    title: string;
    author_name: string;
}

interface VideoAnalysis {
    videoId: string;
    url: string;
    title: string | null;
    author: string | null;
    category: string;
    keywords: string[];
    suggestions: string[];
    aeScript: string | null;
    expression: string | null;
    aiAnalysis?: any; // Can be more specific if AI response structure is known
}

interface ContextualCode {
    expression: string | null;
    script: string | null;
}

interface FallbackResponse {
    message: string;
    category: string;
    suggestions: string[];
    script: string | null;
}

class SimpleYouTubeHelper {
    private aiModule: AIModule | null;
    private patterns: Record<string, string[]>;
    private cache: Map<string, Omit<VideoAnalysis, 'aiAnalysis'>>;

    constructor(aiModule: AIModule | null = null) {
        this.aiModule = aiModule;
        this.patterns = {
            text: ['text animation', 'typography', 'title', 'lower third'],
            motion: ['kinetic', 'motion graphics', 'animation', 'transitions'],
            effects: ['visual effects', 'vfx', 'compositing', 'green screen'],
            expressions: ['expression', 'wiggle', 'random', 'time', 'index']
        };
        this.cache = new Map();

        // Expose globally for AI module compatibility
        if (typeof window !== 'undefined') {
            window.youtubeHelper = this;
        }
    }

    /**
     * Analyzes a YouTube URL to extract relevant information for After Effects.
     * This is the primary, unified method for this class.
     */
    async analyzeYouTubeURL(url: string, userPrompt: string = ''): Promise<{ success: boolean; data?: VideoAnalysis | FallbackResponse; message: string; error?: string }> {
        console.log('[YouTube] Analyzing URL:', url);

        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            if (this.cache.has(videoId) && !userPrompt) {
                const cached = this.cache.get(videoId);
                console.log('[YouTube] Using cached analysis for', videoId);
                return { success: true, data: cached, message: 'Cached analysis retrieved' };
            }

            let metadata: YouTubeVideoMetadata | null = null;
            try {
                metadata = await this.fetchVideoMetadata(url);
            } catch (metaErr: any) {
                console.warn(`[Warn] Metadata fetch failed: ${metaErr.message}`);
            }

            const analysis: VideoAnalysis = {
                videoId,
                url,
                title: metadata?.title ?? null,
                author: metadata?.author_name ?? null,
                category: this.detectCategory(url, metadata?.title, userPrompt),
                keywords: this.extractKeywords(metadata?.title, userPrompt),
                suggestions: this.generateSuggestions(this.detectCategory(url, metadata?.title, userPrompt)),
                aeScript: null,
                expression: null
            };

            const dynamic = this.generateContextualCode(analysis.category, analysis.keywords);
            analysis.expression = dynamic.expression;
            analysis.aeScript = dynamic.script || this.generateBasicScript(analysis.category);

            if (this.aiModule) {
                await this.enhanceWithAI(analysis, userPrompt);
            }

            if (!userPrompt) {
                const { aiAnalysis, ...toCache } = analysis;
                this.cache.set(videoId, toCache);
            }

            return {
                success: true,
                data: analysis,
                message: 'YouTube video analyzed successfully'
            };

        } catch (error: any) {
            console.error('YouTube analysis failed:', error);
            return {
                success: false,
                error: error.message,
                data: this.generateFallbackResponse(url, userPrompt),
                message: 'Analysis failed, returning fallback.'
            };
        }
    }

    /**
     * Enhances the analysis with AI-generated insights.
     */
    private async enhanceWithAI(analysis: VideoAnalysis, userPrompt: string): Promise<void> {
        if (!this.aiModule) return;

        const aiPrompt = `You are an After Effects expert. Analyze this tutorial.
URL: ${analysis.url}
Title: ${analysis.title || 'Unknown Title'}
Author: ${analysis.author || 'Unknown'}
Detected Category: ${analysis.category}
Keywords: ${analysis.keywords.join(', ') || 'none'}
User Intent: ${userPrompt || 'Not specified'}

Return:
1. One-sentence summary.
2. Key techniques as a list.
3. If an expression is relevant, refine this one: ${analysis.expression || 'N/A'}
4. If a script is relevant, suggest a more robust version of this: ${analysis.aeScript || 'N/A'}
5. Suggest 2 advanced variations of the technique.`;

        try {
            analysis.aiAnalysis = await this.aiModule.generateResponse(aiPrompt);
        } catch (error) {
            console.warn('AI analysis failed, using basic analysis only.');
            analysis.aiAnalysis = { error: 'AI enhancement failed.' };
        }
    }

    /**
     * Alias for backward compatibility with older modules.
     */
    async processYouTubeUrl(url: string, userPrompt: string = ''): Promise<any> {
        return this.analyzeYouTubeURL(url, userPrompt);
    }

    /**
     * Extracts YouTube video ID from various URL formats using regex.
     */
    extractVideoId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    }

    /**
     * Detects tutorial category from URL, title, and user prompt.
     */
    private detectCategory(url: string, title: string | null, userPrompt: string): string {
        const combined = `${url} ${title || ''} ${userPrompt}`.toLowerCase();
        for (const [category, keywords] of Object.entries(this.patterns)) {
            if (keywords.some(keyword => combined.includes(keyword))) {
                return category;
            }
        }
        return 'general';
    }

    /**
     * Generates practical suggestions based on a detected category.
     */
    private generateSuggestions(category: string): string[] {
        const suggestions: Record<string, string[]> = {
            text: ['Create a text layer with animated properties', 'Apply a typewriter effect', 'Animate text along a path'],
            motion: ['Use keyframe easing for natural motion', 'Create a looping animation with expressions', 'Animate a camera for parallax'],
            effects: ['Composite layers with blending modes', 'Use adjustment layers for global effects', 'Apply color correction and grading'],
            expressions: ['Use wiggle() for random motion', 'Link properties for synchronized movement', 'Create time-based animations with time'],
            general: ['Start with a basic composition setup', 'Import and organize your assets', 'Render your final video']
        };
        return suggestions[category] || suggestions.general;
    }

    /**
     * Generates a basic ExtendScript based on the category.
     */
    private generateBasicScript(category: string): string {
        const scripts: Record<string, string> = {
            text: `var comp = app.project.activeItem;
if (comp instanceof CompItem) {
    app.beginUndoGroup("Create Text Animation");
    var textLayer = comp.layers.addText("Your Text Here");
    textLayer.property("Position").setValueAtTime(0, [comp.width/4, comp.height/2]);
    textLayer.property("Position").setValueAtTime(1, [comp.width*3/4, comp.height/2]);
    app.endUndoGroup();
}`,
            motion: `var comp = app.project.activeItem;
if (comp instanceof CompItem) {
    app.beginUndoGroup("Motion Graphics Setup");
    var solid = comp.layers.addSolid([1, 0.5, 0], "Motion Element", 100, 100, 1);
    solid.property("Position").expression = "wiggle(2, 50)";
    app.endUndoGroup();
}`,
            effects: `var comp = app.project.activeItem;
if (comp instanceof CompItem) {
    app.beginUndoGroup("VFX Setup");
    var adjustment = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", comp.width, comp.height, 1);
    adjustment.adjustmentLayer = true;
    app.endUndoGroup();
}`,
            general: `if (!app.project.activeItem) {
    var comp = app.project.items.addComp("New Comp", 1920, 1080, 1, 10, 30);
    comp.openInViewer();
}`
        };
        return scripts[category] || scripts.general;
    }

    /**
     * Fetches oEmbed metadata to get title/author without an API key.
     */
    private async fetchVideoMetadata(url: string): Promise<YouTubeVideoMetadata> {
        if (typeof fetch === 'undefined') {
            throw new Error('Fetch API is not available in this environment.');
        }
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await fetch(oembedUrl);
        if (!response.ok) {
            throw new Error(`oEmbed request failed with status ${response.status}`);
        }
        return response.json();
    }

    /**
     * Extracts useful After Effects-related keywords from title and user input.
     */
    private extractKeywords(title: string | null, userPrompt: string): string[] {
        const source = `${title || ''} ${userPrompt}`.toLowerCase();
        const keys = [
            'pulse', 'pulsing', 'breath', 'breathe', 'loop', 'bounce', 'circle', 'logo', 'reveal',
            'glow', 'neon', 'fade', 'typewriter', 'countdown', 'counter', 'wiggle', 'shake',
            'particles', 'trail', 'morph'
        ];
        const found = keys.filter(k => source.includes(k));
        return [...new Set(found)];
    }

    /**
     * Produces contextual ExtendScript or an expression tailored to detected keywords.
     */
    private generateContextualCode(category: string, keywords: string[]): ContextualCode {
        const kw = new Set(keywords);
        if (kw.has('pulse') || kw.has('pulsing') || kw.has('breath') || kw.has('breathe')) {
            return {
                expression: `// Pulsing/breathing scale expression
var amp = 5; // amplitude in percent
var speed = 2; // cycles per second
var scaleValue = 100 + amp * Math.sin(time * Math.PI * speed);
[scaleValue, scaleValue];`,
                script: `// Applies a pulsing scale expression to the selected layer.
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    app.beginUndoGroup('Apply Pulse Expression');
    var lyr = comp.selectedLayers[0];
    if (lyr.property('Scale').canSetExpression) {
        lyr.property('Scale').expression = 'var amp=5;var spd=2;var s=100+amp*Math.sin(time*Math.PI*spd);[s,s];';
    }
    app.endUndoGroup();
}`
            };
        }
        // Add other contextual code generation here...
        return { script: null, expression: null };
    }

    /**
     * Generates a fallback response when the main analysis fails.
     */
    private generateFallbackResponse(url: string, userPrompt: string): FallbackResponse {
        const category = this.detectCategory(url, null, userPrompt);
        return {
            message: 'Basic pattern analysis completed as a fallback.',
            category,
            suggestions: this.generateSuggestions(category),
            script: this.generateBasicScript(category)
        };
    }
}

export default new SimpleYouTubeHelper();
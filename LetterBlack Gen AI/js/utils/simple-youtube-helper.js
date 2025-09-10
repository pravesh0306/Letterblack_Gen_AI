/**
 * SIMPLIFIED YouTube Helper - Essential functionality only
 * Replaces 3 complex modules with 1 simple, working solution
 */

class SimpleYouTubeHelper {
    constructor(aiModule) {
        this.aiModule = aiModule;
        this.patterns = {
            // Common AE tutorial patterns
            text: ['text animation', 'typography', 'title', 'lower third'],
            motion: ['kinetic', 'motion graphics', 'animation', 'transitions'],
            effects: ['visual effects', 'vfx', 'compositing', 'green screen'],
            expressions: ['expression', 'wiggle', 'random', 'time', 'index']
        };
        this.cache = new Map(); // videoId -> analysis cache
        // Expose globally for AI module compatibility (expects window.youtubeHelper)
        if (!window.youtubeHelper) {
            window.youtubeHelper = this;
        }
    }

    /**
     * Simple YouTube URL analysis - ONE method that works
     */
    async analyzeYouTubeURL(url, userPrompt = '') {
        this.logger.debug('🎬 Analyzing YouTube URL:', url);
        
        try {
            // Extract video ID
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            // Return cached result if userPrompt empty and existing
            if (this.cache.has(videoId) && !userPrompt) {
                const cached = this.cache.get(videoId);
                this.logger.debug('🗃️ Using cached YouTube analysis for', videoId);
                return { success: true, data: cached, message: 'Cached analysis' };
            }

            // Attempt lightweight metadata fetch (oEmbed) for title/author.
            let metadata = null;
            try {
                metadata = await this.fetchVideoMetadata(url);
            } catch (metaErr) {
                this.logger.warn('⚠️ Metadata fetch failed (continuing with basic heuristics):', metaErr.message);
            }

            // Basic analysis from URL and user prompt
            const analysis = {
                videoId: videoId,
                url: url,
                title: metadata?.title || null,
                author: metadata?.author_name || null,
                category: this.detectCategory(url + ' ' + (metadata?.title || ''), userPrompt),
                keywords: this.extractKeywords(metadata?.title || '', userPrompt),
                suggestions: this.generateSuggestions(url + ' ' + (metadata?.title || ''), userPrompt),
                aeScript: null,
                expression: null
            };

            // Generate contextual script/expression
            const dynamic = this.generateContextualCode(analysis.category, analysis.keywords);
            if (dynamic.expression) {
                analysis.expression = dynamic.expression;
            }
            analysis.aeScript = dynamic.script || this.generateBasicScript(url, userPrompt, analysis.category);

            // If AI is available, enhance the analysis
            if (this.aiModule) {
                const aiPrompt = `You are an After Effects expert.
Analyze this tutorial.
URL: ${url}
Title: ${(analysis.title || 'Unknown Title')}
Author: ${(analysis.author || 'Unknown')}
Detected Category: ${analysis.category}
Keywords: ${analysis.keywords.join(', ') || 'none'}
User Intent: ${userPrompt || 'Not specified'}

Return:
1. One-sentence summary
2. Key techniques list
3. If expression relevant, refine this expression (if provided): ${analysis.expression || 'N/A'}
4. Provide an improved script (concise) if script provided.
5. Suggest 2 advanced variations.`;
                
                try {
                    const aiResponse = await this.aiModule.generateResponse(aiPrompt);
                    analysis.aiAnalysis = aiResponse;
                } catch (error) {
                    this.logger.warn('AI analysis failed, using basic analysis');
                }
            }

            // Cache result baseline (excluding aiAnalysis which may vary by userPrompt)
            if (!userPrompt) {
                const toCache = { ...analysis };
                delete toCache.aiAnalysis;
                this.cache.set(videoId, toCache);
            }

            return {
                success: true,
                data: analysis,
                message: 'YouTube video analyzed successfully'
            };

        } catch (error) {
            this.logger.error('YouTube analysis failed:', error);
            return {
                success: false,
                error: error.message,
                data: this.generateFallbackResponse(url, userPrompt)
            };
        }
    }

    /**
     * Alias used by older AI module expectations
     */
    async processYouTubeUrl(url, userPrompt='') {
        return this.analyzeYouTubeURL(url, userPrompt);
    }

    /**
     * Extract YouTube video ID from various URL formats
     */
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    /**
     * Detect tutorial category from URL title and user prompt
     */
    detectCategory(url, userPrompt) {
    const combined = (url + ' ' + userPrompt).toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.patterns)) {
            if (keywords.some(keyword => combined.includes(keyword))) {
                return category;
            }
        }
        return 'general';
    }

    /**
     * Generate practical suggestions based on category
     */
    generateSuggestions(url, userPrompt) {
    const category = this.detectCategory(url, userPrompt);
        
        const suggestions = {
            text: [
                'Create a text layer with animated properties',
                'Apply typewriter effect using expressions',
                'Add character-based animations'
            ],
            motion: [
                'Use keyframe animation for smooth transitions',
                'Apply easing to create natural motion',
                'Create looping animations with expressions'
            ],
            effects: [
                'Composite multiple layers for complex effects',
                'Use adjustment layers for global effects',
                'Apply color correction and grading'
            ],
            expressions: [
                'Use wiggle() for random motion',
                'Create time-based animations',
                'Link properties for synchronized movement'
            ],
            general: [
                'Start with basic composition setup',
                'Import and organize assets',
                'Apply fundamental animation principles'
            ]
        };

        return suggestions[category] || suggestions.general;
    }

    /**
     * Generate basic ExtendScript based on category
     */
    generateBasicScript(url, userPrompt, forcedCategory) {
        const category = forcedCategory || this.detectCategory(url, userPrompt);
        
        const scripts = {
            text: `
// Create animated text layer
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Create Text Animation");
    var textLayer = comp.layers.addText("Your Text Here");
    textLayer.property("Position").setValueAtTime(0, [comp.width/4, comp.height/2]);
    textLayer.property("Position").setValueAtTime(1, [comp.width*3/4, comp.height/2]);
    app.endUndoGroup();
}`,
            motion: `
// Create motion graphics setup
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Motion Graphics Setup");
    var solid = comp.layers.addSolid([1, 0.5, 0], "Motion Element", 100, 100, 1);
    // Apply an expression here if desired (add your own expression via Saved Scripts)
    app.endUndoGroup();
}`,
            effects: `
// Basic VFX setup
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("VFX Setup");
    var adjustment = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", comp.width, comp.height, 1);
    adjustment.adjustmentLayer = true;
    app.endUndoGroup();
}`,
            general: `
// Basic composition setup
if (!app.project.activeItem) {
    var comp = app.project.items.addComp("New Comp", 1920, 1080, 1, 10, 30);
    comp.openInViewer();
}`
        };

        return scripts[category] || scripts.general;
    }

    /**
     * Fetch oEmbed metadata to get title/author (no API key). Falls back silently.
     */
    async fetchVideoMetadata(url) {
        if (typeof fetch === 'undefined') throw new Error('fetch unavailable');
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl, { method: 'GET' });
        if (!res.ok) throw new Error('oEmbed request failed');
        return await res.json();
    }

    /**
     * Extract useful AE-related keywords from title/user input
     */
    extractKeywords(title, userPrompt) {
        const source = (title + ' ' + userPrompt).toLowerCase();
        const keys = [
            'pulse','pulsing','breath','breathe','loop','bounce','circle','logo','reveal','glow','neon','fade','typewriter','countdown','counter','wiggle','shake','particles','trail','morph'
        ];
        const found = keys.filter(k => source.includes(k));
        return Array.from(new Set(found));
    }

    /**
     * Produce contextual script or expression tailored to detected keywords
     */
    generateContextualCode(category, keywords) {
        const kw = new Set(keywords);
        // Prioritize expression if simple animation keyword present
        if (kw.has('pulse') || kw.has('pulsing') || kw.has('breath') || kw.has('breathe')) {
            return {
                expression: `// Pulsing / breathing scale\nvar amp = 5; // amplitude percent\nvar speed = 2; // cycles per second\n100 + amp * Math.sin(time * Math.PI * speed);`,
                script: `// Apply pulsing scale expression to selected layer\nvar comp = app.project.activeItem;\nif (comp && comp.selectedLayers.length){\n  app.beginUndoGroup('Apply Pulse Expression');\n  var lyr = comp.selectedLayers[0];\n  if (lyr.property('Scale').canSetExpression){\n    lyr.property('Scale').expression = 'var amp=5;var speed=2;[100+amp*Math.sin(time*Math.PI*speed),100+amp*Math.sin(time*Math.PI*speed)];';\n  }\n  app.endUndoGroup();\n}`
            };
        }
        if (kw.has('typewriter')) {
            return {
                expression: `// Typewriter text reveal\nvar t = text.sourceText;\nvar chars = Math.floor(time * effect('Speed')('ADBE Slider Control-0001'));\nt.substr(0, chars);`,
                script: `// Create text layer with typewriter slider\nvar comp=app.project.activeItem;\nif(comp){app.beginUndoGroup('Typewriter Setup');var t=comp.layers.addText('Typewriter Text');var c=t.Effects.addProperty('ADBE Slider Control');c.name='Speed';c.property('Slider').setValue(15);t.property('Source Text').expression="var t=text.sourceText;var chars=Math.floor(time*effect('Speed')('Slider'));t.substr(0,chars);";app.endUndoGroup();}`
            };
        }
        if (kw.has('bounce')) {
            return {
                expression: `// Bounce scale overshoot\nvar freq=3;var decay=4;var n=Math.sin(freq*time*2*Math.PI)/Math.exp(decay*time);100+15*n;`,
                script: null
            };
        }
        if (kw.has('glow') || kw.has('neon')) {
            return {
                script: `// Add glow to selected layer\nvar comp=app.project.activeItem;\nif(comp&&comp.selectedLayers.length){app.beginUndoGroup('Glow Setup');var lyr=comp.selectedLayers[0];var e=lyr.Effects.addProperty('ADBE Glo2');e.property('Glow Radius').setValue(50);app.endUndoGroup();}`,
                expression: null
            };
        }
        if (kw.has('logo') || kw.has('reveal')) {
            return {
                script: `// Simple logo fade + scale in\nvar comp=app.project.activeItem;\nif(comp&&comp.selectedLayers.length){app.beginUndoGroup('Logo Reveal');var lyr=comp.selectedLayers[0];lyr.transform.opacity.setValueAtTime(0,0);lyr.transform.opacity.setValueAtTime(1,100);lyr.transform.scale.setValueAtTime(0,[70,70]);lyr.transform.scale.setValueAtTime(1,[100,100]);app.endUndoGroup();}`,
                expression: null
            };
        }
        // Default: no contextual improvement
        return { script: null, expression: null };
    }

    /**
     * Fallback response when analysis fails
     */
    generateFallbackResponse(url, userPrompt) {
        return {
            message: 'Basic pattern analysis completed',
            category: this.detectCategory(url, userPrompt),
            suggestions: [
                'Try breaking down the tutorial into smaller steps',
                'Focus on one effect or technique at a time',
                'Use the script editor to test automation'
            ],
            script: this.generateBasicScript(url, userPrompt)
        };
    }
}

// Export for use
window.SimpleYouTubeHelper = SimpleYouTubeHelper;

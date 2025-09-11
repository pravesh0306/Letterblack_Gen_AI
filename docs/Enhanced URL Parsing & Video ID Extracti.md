 Enhanced URL Parsing & Video ID Extraction
Issue: The current extractVideoId regex may miss modern YouTube URL formats (e.g., Shorts, embedded links, or URLs with feature=embedded parameters).
Improvement: Expand regex patterns to cover more formats, including Shorts and video IDs in query parameters.

extractVideoId(url) {
    // Updated patterns to handle Shorts, embedded, and standard URLs
    const patterns = [
        // Standard YouTube URL
        /(?:youtube\.com\/(?:[^\/]+\/.+\/v\/|watch\?v=|v=)|youtu\.be\/)([^&?\n#]+)/,
        // YouTube Shorts (starts with 'shorts/')
        /youtube\.com\/shorts\/([^&?\n#]+)/,
        // Embedded URLs (e.g., <iframe> src)
        /youtube\.com\/embed\/([^&?\n#]+)/,
        // URLs with video ID in query parameters (e.g., ?v=...)
        /v=([^&?\n#]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

2. Metadata Fetching with Fallbacks & Richer Data
Issue: The fetchVideoMetadata method relies solely on oEmbed, which may not return tags/description and fails silently if unavailable.
Improvement:

Add fallback for metadata (e.g., use videoId to fetch via YouTube Data API if oEmbed is unavailable).
Extract additional fields (tags, description) for better keyword analysis.
async fetchVideoMetadata(url) {
    if (typeof fetch === 'undefined') throw new Error('fetch unavailable');
    try {
        // Primary: oEmbed (no API key, limited data)
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            // Try YouTube Data API for richer metadata (requires API key, optional)
            if (window.YOUTUBE_API_KEY) {
                const apiData = await this.fetchYouTubeAPI(oembedData.video_id);
                return { ...oembedData, ...apiData }; // Merge data
            }
            return oembedData;
        }
        throw new Error('oEmbed failed');
    } catch (oembedErr) {
        console.warn('Fallback to YouTube Data API for metadata:', oembedErr);
        // Secondary: YouTube Data API (if key available)
        if (window.YOUTUBE_API_KEY) {
            const videoId = this.extractVideoId(url);
            if (videoId) {
                const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${window.YOUTUBE_API_KEY}`;
                const apiRes = await fetch(apiUrl);
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    return apiData.items?.[0]?.snippet || { title: 'Unknown Title', author_name: 'Unknown Author' };
                }
            }
        }
        // Return minimal data if all else fails
        return { title: 'Unknown Title', author_name: 'Unknown Author' };
    }
}

async fetchYouTubeAPI(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,topicDetails&key=${window.YOUTUBE_API_KEY}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('YouTube API failed');
    const data = await res.json();
    const item = data.items?.[0];
    return item ? {
        description: item.snippet.description,
        tags: item.snippet.tags || [],
        categories: item.topicDetails?.topicCategories || []
    } : null;
}


3. Dynamic Category Detection & Keyword Extraction
Issue: Category detection and keyword extraction rely on hardcoded patterns, limiting adaptability.
Improvement:

Allow dynamic pattern updates (e.g., load from a config file or user settings).
Prioritize user prompts over URLs for category detection.
Use tags/description from metadata for richer keyword analysis.

constructor(aiModule) {
    // ... existing code ...
    // Load patterns from secure storage or config (fallback to defaults)
    this.patterns = JSON.parse(await window.secureAPIStorage.getItem('youtube-patterns') || `{
        "text": ["text animation", "typography", ...],
        "motion": ["kinetic", "motion graphics", ...],
        ...
    }`);
}

detectCategory(userPrompt, url, metadata) {
    // Combine user prompt, metadata title, and URL (prioritize user prompt)
    const source = `${userPrompt} ${metadata?.title || ''} ${url}`.toLowerCase();
    for (const [category, keywords] of Object.entries(this.patterns)) {
        if (keywords.some(kw => source.includes(kw))) {
            return category;
        }
    }
    return 'general';
}

extractKeywords(metadataTitle, userPrompt, metadataDescription, metadataTags) {
    const source = `${metadataTitle} ${userPrompt} ${metadataDescription || ''} ${metadataTags?.join(' ') || ''}`.toLowerCase();
    const keys = [
        'pulse', 'pulsing', 'breath', 'breathe', 'loop', 'bounce', 'circle', 'logo', 'reveal', 'glow', 'neon', 'fade', 
        'typewriter', 'countdown', 'counter', 'wiggle', 'shake', 'particles', 'trail', 'morph', 'text', 'motion', 'vfx'
    ];
    // Merge with metadata tags (if available)
    if (metadataTags) keys.push(...metadataTags.map(tag => tag.toLowerCase()));
    const found = keys.filter(k => source.includes(k));
    return Array.from(new Set(found));
}

4. Intelligent Caching with Size Limits
Issue: The current cache (Map) grows indefinitely, risking memory bloat.
Improvement: Implement an LRU (Least Recently Used) cache with a max size to evict old entries.
constructor(aiModule) {
    // ... existing code ...
    this.cache = new Map(); // videoId -> cached data
    this.cacheMaxSize = 50; // Adjust based on needs
}

async analyzeYouTubeURL(url, userPrompt = '') {
    // ... existing code ...
    // Cache management: Remove oldest entry if max size exceeded
    if (!userPrompt) {
        const toCache = { ...analysis };
        delete toCache.aiAnalysis;
        this.cache.set(videoId, toCache);
        // Evict LRU if cache exceeds max size
        if (this.cache.size > this.cacheMaxSize) {
            const lruKey = Array.from(this.cache.keys())[0]; // First key is oldest (if using insertion order)
            this.cache.delete(lruKey);
        }
    }
    // ... rest of the code ...
}

5. Script/Expression Validation & Error Handling
Issue: Generated scripts may fail if AE’s active item isn’t a composition or no layers are selected.
Improvement: Add runtime checks to scripts and handle errors gracefully (log warnings, skip invalid steps)

generateBasicScript(url, userPrompt, forcedCategory) {
    const category = forcedCategory || this.detectCategory(url, userPrompt);
    // Wrap script in error handling
    return `
try {
    ${scripts[category]}
} catch (e) {
    console.error('Script execution failed:', e);
    alert('⚠️ Script Error: ' + e.message);
}
`.trim();
}

// Example for motion category script:
const scripts = {
    motion: `
var comp = app.project.activeItem;
if (!(comp instanceof CompItem)) throw new Error('No active composition found.');
app.beginUndoGroup("Motion Graphics Setup");
var selectedLayers = comp.selectedLayers;
if (selectedLayers.length === 0) throw new Error('No layers selected.');
var solid = selectedLayers[0]; // Use first selected layer instead of creating new
// Apply expression if supported
solid.property("Position").expression = "time * 100;"; // Example motion expression
app.endUndoGroup();
`
};

6. Progress Tracking & UI Feedback
Issue: Users see no progress during analysis (especially AI-powered steps).
Improvement: Add events or callbacks to track progress and notify the UI.

javascript



async analyzeYouTubeURL(url, userPrompt = '') {
    console.log('🎬 Analyzing YouTube URL:', url);
    // Emit progress event
    window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'extracting_video_id', progress: 20 } }));

    try {
        // ... existing logic ...
        // After metadata fetch
        window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'metadata_fetched', progress: 40 } }));

        // After category detection
        window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'category_detected', progress: 60 } }));

        // After AI analysis
        if (this.aiModule) {
            window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'ai_analysis_start', progress: 80 } }));
            // ... AI call ...
            window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'ai_analysis_complete', progress: 100 } }));
        }

        return { success: true, data: analysis, message: 'YouTube video analyzed successfully' };
    } catch (error) {
        // Emit error progress
        window.dispatchEvent(new CustomEvent('youtube-analysis-progress', { detail: { stage: 'error', progress: 0, error: error.message } }));
        // ... existing error handling ...
    }
}

7. Configurable AI Integration
Issue: The AI prompt is hardcoded, limiting customization (e.g., different instruction styles).
Improvement: Allow the AI prompt template to be loaded from a config file or user settings.

async analyzeYouTubeURL(...) {
    // ... existing code ...
    if (this.aiModule) {
        // Load prompt template from storage (with fallback)
        const aiPromptTemplate = await window.secureAPIStorage.getItem('youtube-ai-prompt') || `You are an After Effects expert.
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

        const aiPrompt = aiPromptTemplate
            .replace('${url}', url)
            .replace('${analysis.title}', analysis.title || 'Unknown Title')
            .replace('${analysis.author}', analysis.author || 'Unknown Author')
            .replace('${analysis.category}', analysis.category)
            .replace('${analysis.keywords}', analysis.keywords.join(', ') || 'none')
            .replace('${userPrompt}', userPrompt || 'Not specified')
            .replace('${analysis.expression}', analysis.expression || 'N/A');

        try {
            const aiResponse = await this.aiModule.generateResponse(aiPrompt);
            analysis.aiAnalysis = aiResponse;
        } catch (error) {
            console.warn('AI analysis failed, using basic analysis');
            // Optionally emit event to UI
            window.dispatchEvent(new CustomEvent('youtube-analysis-ai-error', { detail: error.message }));
        }
    }
    // ... rest of the code ...
}

8. Expression Testing & Compatibility
Issue: Generated expressions may not work with user-renamed effects or AE version differences.
Improvement:

Test expressions for syntax errors before suggesting.
Use effect IDs instead of names (more reliable across renames).generateContextualCode(category, keywords) {
    // ... existing code ...
    // Example for 'typewriter' expression with effect ID check
    if (kw.has('typewriter')) {
        return {
            expression: `// Typewriter text reveal
var t = text.sourceText;
var effectSpeed = thisLayer.effect('Speed')('ADBE Slider Control-0001').slider.value;
var chars = Math.floor(time * effectSpeed);
t.substr(0, chars);`,
            script: `// Create text layer with typewriter slider
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    try {
        app.beginUndoGroup('Typewriter Setup');
        var t = comp.layers.addText('Typewriter Text');
        // Add slider effect (use ID for reliability)
        var speedEffect = t.Effects.addProperty('ADBE Slider Control');
        speedEffect.name = 'Speed';
        speedEffect.property('Slider').setValue(15);
        // Set expression using effect ID (ADBE Slider Control-0001)
        t.property('Source Text').expression = 'var t=text.sourceText;var effectSpeed=thisLayer.effect(\"Speed\")(\"ADBE Slider Control-0001\").slider.value;var chars=Math.floor(time*effectSpeed);t.substr(0,chars);';
        app.endUndoGroup();
    } catch (e) {
        console.error('Typewriter script error:', e);
        alert('Failed to set up typewriter: ' + e.message);
    }
}`
        };
    }
    // ... rest of the code ...
}9. Deprecation Handling for Legacy Aliases
Issue: The processYouTubeUrl alias may conflict with future changes.
Improvement: Add a deprecation warning to guide users toward analyzeYouTubeURL.

javascript

Collapse
Copy
1
2
3
4async processYouTubeUrl(url, userPrompt='') {
    console.warn('⚠️ processYouTubeUrl is deprecated. Use analyzeYouTubeURL instead.');
    return this.analyzeYouTubeURL(url, userPrompt);
}
⌄
10. Secure Storage for Patterns & Configs
async loadPatternsFromStorage() {
    const storedPatterns = await window.secureAPIStorage.getItem('youtube-patterns');
    if (storedPatterns) {
        try {
            this.patterns = JSON.parse(storedPatterns);
            console.log('🚀 Loaded custom YouTube patterns from storage');
        } catch (error) {
            console.error('❌ Invalid stored patterns, using defaults:', error);
        }
    }
}

// Call in constructor:
constructor(aiModule) {
    // ... existing code ...
    this.loadPatternsFromStorage().catch(() => console.log('Using default patterns'));
}


11. Fallback Response Enhancement
Issue: The fallback response lacks context (e.g., why analy)

generateFallbackResponse(url, userPrompt, error) {
    return {
        message: `Analysis failed: ${error.message}. Falling back to basic pattern detection.`,
        category: this.detectCategory(userPrompt, url),
        suggestions: [
            'Check the YouTube URL for validity',
            'Ensure the AI module is loaded and authenticated',
            'Manually set the category in the UI if auto-detection fails'
        ],
        script: this.generateBasicScript(url, userPrompt),
        errorDetails: error.message // Include for debugging
    };
}

12. Documentation & Type Safety
Issue: Methods lack JSDoc comments, making usage unclear for collaborators.
Improvement: Add JSDoc to clarify parameters, return values, and behavior.

javascript

/**
 * Analyze a YouTube URL to generate AE scripts and context.
 * @param {string} url - YouTube video URL.
 * @param {string} [userPrompt=''] - User-provided intent or question.
 * @returns {Object} Analysis result with success/error status and data.
 */
async analyzeYouTubeURL(url, userPrompt = '') { ... }

/**
 * Extract video ID from a YouTube URL.
 * @param {string} url - Input URL to parse.
 * @returns {string|null} Video ID or null if invalid.
 */
extractVideoId(url) { ... }


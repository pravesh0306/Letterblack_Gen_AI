/**
 * ENHANCED YouTube Tutorial Analysis Framework
 * Advanced analysis system for After Effects tutorials with AI integration
 */

class EnhancedYouTubeAnalyzer {
    constructor(aiModule, aeIntegration) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.cache = new Map();
        this.analysisHistory = new Map();

        // Enhanced pattern recognition
        this.tutorialPatterns = {
            beginner: {
                keywords: ['beginner', 'basics', 'introduction', 'getting started', 'tutorial for beginners'],
                complexity: 'low',
                focus: 'fundamentals'
            },
            intermediate: {
                keywords: ['intermediate', 'advanced basics', 'workflow', 'techniques', 'tips'],
                complexity: 'medium',
                focus: 'techniques'
            },
            advanced: {
                keywords: ['advanced', 'expert', 'complex', 'professional', 'masterclass'],
                complexity: 'high',
                focus: 'optimization'
            },
            text: {
                keywords: ['text animation', 'typography', 'title animation', 'lower third', 'text effects'],
                category: 'text',
                techniques: ['character animation', 'word transitions', 'text reveals']
            },
            motion: {
                keywords: ['motion graphics', 'kinetic typography', 'logo animation', 'brand animation'],
                category: 'motion',
                techniques: ['shape animation', 'path animation', 'morphing']
            },
            effects: {
                keywords: ['visual effects', 'vfx', 'compositing', 'green screen', 'chroma key'],
                category: 'effects',
                techniques: ['keying', 'tracking', 'color correction']
            },
            expressions: {
                keywords: ['expressions', 'wiggle', 'random', 'time', 'index', 'loop'],
                category: 'expressions',
                techniques: ['mathematical expressions', 'property linking', 'conditional logic']
            },
            particles: {
                keywords: ['particles', 'particle systems', 'trails', 'emitter', 'physics'],
                category: 'particles',
                techniques: ['emitter setup', 'physics simulation', 'rendering']
            },
            tracking: {
                keywords: ['motion tracking', 'tracking', 'stabilization', 'camera solve'],
                category: 'tracking',
                techniques: ['point tracking', 'planar tracking', 'camera tracking']
            }
        };

        // Expression templates
        this.expressionTemplates = {
            wiggle: {
                basic: 'wiggle(2, 50)',
                advanced: 'wiggle(5, 25, 2, 0.5, time)',
                description: 'Creates random motion'
            },
            bounce: {
                basic: 'var freq = 3; var decay = 4; var n = Math.sin(freq * time * 2 * Math.PI) / Math.exp(decay * time); 100 + 15 * n',
                advanced: 'var freq = effect("Frequency")("Slider"); var decay = effect("Decay")("Slider"); var amp = effect("Amplitude")("Slider"); var n = Math.sin(freq * time * 2 * Math.PI) / Math.exp(decay * time); 100 + amp * n',
                description: 'Creates bouncing motion with decay'
            },
            typewriter: {
                basic: 'var t = text.sourceText; var chars = Math.floor(time * 15); t.substr(0, chars)',
                advanced: 'var t = text.sourceText; var speed = effect("Speed")("Slider"); var chars = Math.floor(time * speed); t.substr(0, chars)',
                description: 'Reveals text character by character'
            },
            pulse: {
                basic: '100 + 10 * Math.sin(time * Math.PI * 2)',
                advanced: 'var amp = effect("Amplitude")("Slider"); var freq = effect("Frequency")("Slider"); 100 + amp * Math.sin(time * Math.PI * freq)',
                description: 'Creates pulsing/breathing effect'
            }
        };

        // Script templates
        this.scriptTemplates = {
            textSetup: `
// Advanced Text Animation Setup
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Advanced Text Setup");

    // Create text layer
    var textLayer = comp.layers.addText("Animated Text");
    var textProp = textLayer.property("Source Text");

    // Add expression controls
    var controls = textLayer.Effects.addProperty("ADBE Slider Control");
    controls.name = "Animation Speed";
    controls.property("Slider").setValue(15);

    // Set up basic animation
    textLayer.transform.opacity.setValueAtTime(0, 0);
    textLayer.transform.opacity.setValueAtTime(0.5, 100);

    app.endUndoGroup();
}`,
            motionGraphics: `
// Motion Graphics Template
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Motion Graphics Setup");

    // Create background
    var bg = comp.layers.addSolid([0.1, 0.1, 0.1], "Background", comp.width, comp.height, 1);

    // Create animated element
    var element = comp.layers.addSolid([1, 0.5, 0], "Animated Element", 200, 200, 1);

    // Add motion path
    var position = element.property("Position");
    position.setValueAtTime(0, [comp.width/4, comp.height/2]);
    position.setValueAtTime(2, [comp.width*3/4, comp.height/2]);

    // Add rotation
    var rotation = element.property("Rotation");
    rotation.setValueAtTime(0, 0);
    rotation.setValueAtTime(2, 360);

    app.endUndoGroup();
}`,
            particleSystem: `
// Particle System Setup
var comp = app.project.activeItem;
if (comp && comp instanceof CompItem) {
    app.beginUndoGroup("Particle System");

    // Create particle layer
    var particles = comp.layers.addSolid([1, 1, 1], "Particles", comp.width, comp.height, 1);

    // Add particle effect
    var particleEffect = particles.Effects.addProperty("CC Particle Systems II");

    // Configure emitter
    particleEffect.property("Particle Type").setValue(1); // Faded Sphere
    particleEffect.property("Birth Rate").setValue(50);
    particleEffect.property("Longevity").setValue(2);

    app.endUndoGroup();
}`
        };

        // Expose globally
        if (!window.enhancedYouTubeAnalyzer) {
            window.enhancedYouTubeAnalyzer = this;
        }
    }

    /**
     * Comprehensive YouTube video analysis
     */
    async analyzeTutorial(url, userContext = {}) {
        console.log('🎬 Starting enhanced YouTube analysis:', url);

        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL format');
            }

            // Check cache first
            const cacheKey = `${videoId}_${JSON.stringify(userContext)}`;
            if (this.cache.has(cacheKey)) {
                console.log('🗃️ Using cached analysis');
                return this.cache.get(cacheKey);
            }

            // Fetch video metadata
            const metadata = await this.fetchVideoMetadata(url);

            // Analyze content
            const analysis = await this.performDeepAnalysis(url, metadata, userContext);

            // Generate implementation
            const implementation = await this.generateImplementation(analysis, userContext);

            // Create learning path
            const learningPath = this.createLearningPath(analysis);

            const result = {
                success: true,
                videoId,
                metadata,
                analysis,
                implementation,
                learningPath,
                timestamp: Date.now()
            };

            // Cache result
            this.cache.set(cacheKey, result);
            this.analysisHistory.set(videoId, result);

            return result;

        } catch (error) {
            console.error('Enhanced analysis failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.generateFallbackAnalysis(url, userContext)
            };
        }
    }

    /**
     * Extract video ID from various YouTube URL formats
     */
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    /**
     * Fetch comprehensive video metadata
     */
    async fetchVideoMetadata(url) {
        try {
            // Try oEmbed first (no API key needed)
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const response = await fetch(oembedUrl);

            if (!response.ok) {
                throw new Error('oEmbed request failed');
            }

            const oembed = await response.json();

            return {
                title: oembed.title,
                author: oembed.author_name,
                thumbnail: oembed.thumbnail_url,
                description: oembed.description || '',
                duration: null, // oEmbed doesn't provide duration
                viewCount: null,
                publishedAt: null
            };

        } catch (error) {
            console.warn('oEmbed fetch failed, using basic metadata');
            return {
                title: 'Unknown Title',
                author: 'Unknown Author',
                thumbnail: null,
                description: '',
                duration: null,
                viewCount: null,
                publishedAt: null
            };
        }
    }

    /**
     * Perform deep content analysis
     */
    async performDeepAnalysis(url, metadata, userContext) {
        const combinedText = `${metadata.title} ${metadata.description} ${userContext.prompt || ''}`.toLowerCase();

        // Detect tutorial type and complexity
        const tutorialType = this.detectTutorialType(combinedText);
        const complexity = this.assessComplexity(combinedText);
        const techniques = this.extractTechniques(combinedText);
        const prerequisites = this.identifyPrerequisites(techniques, complexity);

        // AI-enhanced analysis if available
        let aiInsights = null;
        if (this.aiModule) {
            aiInsights = await this.getAIInsights(metadata, userContext, tutorialType);
        }

        return {
            tutorialType,
            complexity,
            techniques,
            prerequisites,
            aiInsights,
            keywords: this.extractKeywords(combinedText),
            estimatedDuration: this.estimateDuration(combinedText, techniques),
            difficulty: this.calculateDifficulty(complexity, techniques.length)
        };
    }

    /**
     * Detect tutorial type from content
     */
    detectTutorialType(text) {
        const matches = {};

        for (const [type, config] of Object.entries(this.tutorialPatterns)) {
            const keywords = config.keywords || [];
            const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
            if (matchCount > 0) {
                matches[type] = matchCount;
            }
        }

        // Return type with highest matches
        const bestMatch = Object.entries(matches).sort(([,a], [,b]) => b - a)[0];
        return bestMatch ? bestMatch[0] : 'general';
    }

    /**
     * Assess tutorial complexity
     */
    assessComplexity(text) {
        let complexity = 0;

        // Beginner indicators decrease complexity
        if (text.includes('beginner') || text.includes('basics') || text.includes('introduction')) {
            complexity -= 2;
        }

        // Advanced indicators increase complexity
        if (text.includes('advanced') || text.includes('expert') || text.includes('complex')) {
            complexity += 2;
        }

        // Technique count affects complexity
        const techniqueCount = this.extractTechniques(text).length;
        complexity += Math.floor(techniqueCount / 3);

        return Math.max(1, Math.min(5, complexity + 3)); // Scale to 1-5
    }

    /**
     * Extract specific techniques mentioned
     */
    extractTechniques(text) {
        const techniques = new Set();

        for (const [category, config] of Object.entries(this.tutorialPatterns)) {
            if (config.techniques) {
                config.techniques.forEach(technique => {
                    if (text.includes(technique.toLowerCase())) {
                        techniques.add(technique);
                    }
                });
            }
        }

        return Array.from(techniques);
    }

    /**
     * Identify prerequisites for the tutorial
     */
    identifyPrerequisites(techniques, complexity) {
        const prerequisites = [];

        if (complexity >= 4) {
            prerequisites.push('Advanced After Effects knowledge');
        } else if (complexity >= 3) {
            prerequisites.push('Intermediate After Effects skills');
        }

        if (techniques.includes('expressions')) {
            prerequisites.push('Basic expression knowledge');
        }

        if (techniques.includes('motion tracking')) {
            prerequisites.push('Understanding of tracking fundamentals');
        }

        if (techniques.includes('particles')) {
            prerequisites.push('Basic compositing knowledge');
        }

        return prerequisites.length > 0 ? prerequisites : ['Basic After Effects knowledge'];
    }

    /**
     * Get AI-powered insights
     */
    async getAIInsights(metadata, userContext, tutorialType) {
        if (!this.aiModule) return null;

        const prompt = `Analyze this After Effects tutorial comprehensively:

Title: ${metadata.title}
Description: ${metadata.description}
Tutorial Type: ${tutorialType}
User Context: ${userContext.prompt || 'General learning'}

Provide:
1. Brief summary (2-3 sentences)
2. Key learning objectives (3-5 bullet points)
3. Most important techniques shown
4. Potential challenges for learners
5. Recommended practice projects
6. Related techniques to explore next

Keep response focused and actionable.`;

        try {
            const response = await this.aiModule.generateResponse(prompt);
            return this.parseAIInsights(response);
        } catch (error) {
            console.warn('AI insights failed:', error);
            return null;
        }
    }

    /**
     * Parse AI response into structured insights
     */
    parseAIInsights(response) {
        // Simple parsing - in production, use more sophisticated parsing
        const lines = response.split('\n').filter(line => line.trim());

        return {
            summary: lines.find(line => !line.match(/^\d+\./)) || response.substring(0, 200),
            objectives: lines.filter(line => line.match(/^\d+\./)).slice(0, 5),
            challenges: [],
            recommendations: []
        };
    }

    /**
     * Extract relevant keywords
     */
    extractKeywords(text) {
        const commonKeywords = [
            'animation', 'effect', 'transition', 'text', 'motion', 'graphics',
            'particle', 'tracking', 'expression', 'keyframe', 'mask', 'shape',
            'layer', 'composition', 'render', 'export', 'workflow', 'technique'
        ];

        return commonKeywords.filter(keyword => text.includes(keyword));
    }

    /**
     * Estimate tutorial duration based on content
     */
    estimateDuration(text, techniques) {
        let baseDuration = 10; // minutes

        // Add time for each technique
        baseDuration += techniques.length * 5;

        // Add time for complexity
        const complexity = this.assessComplexity(text);
        baseDuration += complexity * 3;

        // Add time for AI analysis if available
        if (this.aiModule) {
            baseDuration += 2;
        }

        return Math.min(baseDuration, 60); // Cap at 60 minutes
    }

    /**
     * Calculate overall difficulty
     */
    calculateDifficulty(complexity, techniqueCount) {
        const difficulty = (complexity + techniqueCount) / 2;
        if (difficulty <= 2) return 'Beginner';
        if (difficulty <= 3.5) return 'Intermediate';
        return 'Advanced';
    }

    /**
     * Generate implementation resources
     */
    async generateImplementation(analysis, userContext) {
        const implementation = {
            expressions: [],
            scripts: [],
            templates: [],
            stepByStep: []
        };

        // Generate expressions based on techniques
        if (analysis.techniques.includes('wiggle')) {
            implementation.expressions.push({
                name: 'Enhanced Wiggle',
                code: this.expressionTemplates.wiggle.advanced,
                description: this.expressionTemplates.wiggle.description,
                usage: 'Apply to position, scale, or rotation properties'
            });
        }

        if (analysis.techniques.includes('bounce')) {
            implementation.expressions.push({
                name: 'Bounce Effect',
                code: this.expressionTemplates.bounce.advanced,
                description: this.expressionTemplates.bounce.description,
                usage: 'Apply to scale or position for bouncing motion'
            });
        }

        // Generate scripts based on tutorial type
        if (analysis.tutorialType === 'text') {
            implementation.scripts.push({
                name: 'Text Animation Setup',
                code: this.scriptTemplates.textSetup,
                description: 'Creates a text layer with animation controls'
            });
        }

        if (analysis.tutorialType === 'motion') {
            implementation.scripts.push({
                name: 'Motion Graphics Template',
                code: this.scriptTemplates.motionGraphics,
                description: 'Sets up a basic motion graphics composition'
            });
        }

        // Generate step-by-step guide
        implementation.stepByStep = this.generateStepByStepGuide(analysis);

        return implementation;
    }

    /**
     * Generate step-by-step implementation guide
     */
    generateStepByStepGuide(analysis) {
        const steps = [
            {
                step: 1,
                title: 'Preparation',
                description: 'Set up your composition and import necessary assets',
                details: [
                    'Create a new composition or use existing one',
                    'Import any required footage or assets',
                    'Organize layers in a logical hierarchy'
                ]
            }
        ];

        // Add technique-specific steps
        if (analysis.techniques.includes('text animation')) {
            steps.push({
                step: 2,
                title: 'Text Layer Setup',
                description: 'Create and configure text layers',
                details: [
                    'Add text layer with desired content',
                    'Set font, size, and styling',
                    'Position text appropriately in composition'
                ]
            });
        }

        if (analysis.techniques.includes('expressions')) {
            steps.push({
                step: steps.length + 1,
                title: 'Apply Expressions',
                description: 'Add dynamic behavior with expressions',
                details: [
                    'Select the property to animate',
                    'Alt-click the stopwatch to open expression field',
                    'Paste or write the appropriate expression',
                    'Adjust parameters as needed'
                ]
            });
        }

        if (analysis.techniques.includes('keyframe animation')) {
            steps.push({
                step: steps.length + 1,
                title: 'Keyframe Animation',
                description: 'Create smooth animations with keyframes',
                details: [
                    'Set initial keyframe at time 0',
                    'Move to desired time and set end keyframe',
                    'Adjust easing and interpolation',
                    'Preview animation'
                ]
            });
        }

        steps.push({
            step: steps.length + 1,
            title: 'Refinement',
            description: 'Polish and optimize the animation',
            details: [
                'Adjust timing and spacing',
                'Add easing for natural motion',
                'Test at different speeds',
                'Optimize for final render'
            ]
        });

        return steps;
    }

    /**
     * Create learning path recommendations
     */
    createLearningPath(analysis) {
        const learningPath = {
            current: analysis,
            nextSteps: [],
            relatedTutorials: [],
            practiceProjects: []
        };

        // Suggest next learning steps based on current tutorial
        if (analysis.complexity <= 2) {
            learningPath.nextSteps.push('Practice basic keyframe animation');
            learningPath.nextSteps.push('Learn fundamental layer properties');
        } else if (analysis.complexity <= 4) {
            learningPath.nextSteps.push('Explore expression basics');
            learningPath.nextSteps.push('Study advanced compositing techniques');
        } else {
            learningPath.nextSteps.push('Master complex expression workflows');
            learningPath.nextSteps.push('Learn advanced tracking and stabilization');
        }

        // Suggest related tutorials
        if (analysis.tutorialType === 'text') {
            learningPath.relatedTutorials.push('Advanced Typography Techniques');
            learningPath.relatedTutorials.push('Kinetic Typography Systems');
        }

        if (analysis.tutorialType === 'motion') {
            learningPath.relatedTutorials.push('Logo Animation Mastery');
            learningPath.relatedTutorials.push('Motion Graphics Workflow');
        }

        // Suggest practice projects
        learningPath.practiceProjects = this.generatePracticeProjects(analysis);

        return learningPath;
    }

    /**
     * Generate practice project suggestions
     */
    generatePracticeProjects(analysis) {
        const projects = [];

        if (analysis.techniques.includes('text animation')) {
            projects.push({
                title: 'Animated Title Sequence',
                description: 'Create a dynamic title animation for a video project',
                difficulty: 'Beginner',
                estimatedTime: '30 minutes'
            });
        }

        if (analysis.techniques.includes('expressions')) {
            projects.push({
                title: 'Interactive UI Elements',
                description: 'Build animated user interface components',
                difficulty: 'Intermediate',
                estimatedTime: '45 minutes'
            });
        }

        if (analysis.techniques.includes('particles')) {
            projects.push({
                title: 'Particle Logo Reveal',
                description: 'Create a logo animation using particle systems',
                difficulty: 'Advanced',
                estimatedTime: '60 minutes'
            });
        }

        return projects;
    }

    /**
     * Generate fallback analysis when deep analysis fails
     */
    generateFallbackAnalysis(url, userContext) {
        return {
            tutorialType: 'general',
            complexity: 3,
            techniques: ['basic animation'],
            prerequisites: ['Basic After Effects knowledge'],
            keywords: ['animation', 'effect'],
            estimatedDuration: 15,
            difficulty: 'Beginner',
            implementation: {
                expressions: [],
                scripts: [this.scriptTemplates.textSetup],
                stepByStep: [
                    {
                        step: 1,
                        title: 'Basic Setup',
                        description: 'Create a new composition and add elements',
                        details: ['New composition', 'Add layers', 'Basic animation']
                    }
                ]
            }
        };
    }

    /**
     * Get analysis history for a video
     */
    getAnalysisHistory(videoId) {
        return this.analysisHistory.get(videoId) || null;
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.cache.clear();
        this.analysisHistory.clear();
    }

    /**
     * Export analysis results
     */
    exportAnalysis(videoId, format = 'json') {
        const analysis = this.analysisHistory.get(videoId);
        if (!analysis) return null;

        if (format === 'json') {
            return JSON.stringify(analysis, null, 2);
        }

        // Could add other formats like markdown, etc.
        return analysis;
    }
}

// Export for use
window.EnhancedYouTubeAnalyzer = EnhancedYouTubeAnalyzer;

/**
 * YouTube Tutorial Helper - Streamlined for CEP Extension
 * Detects YouTube links and provides tutorial assistance
 */

class YouTubeTutorialHelper {
    constructor() {
        this.tutorialCache = new Map();
        this.currentTutorial = null;
        console.log('🎬 YouTube Tutorial Helper initialized');
    }

    /**
     * Detect and process YouTube URLs
     */
    async processYouTubeLink(userMessage) {
        const urlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
        const match = userMessage.match(urlPattern);

        if (!match) {return null;}

        const videoId = match[1];
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

        try {
            // Generate tutorial response
            const tutorialData = await this.analyzeTutorial(youtubeUrl, videoId);
            return this.generateTutorialResponse(tutorialData, userMessage);
        } catch (error) {
            console.error('Error processing YouTube tutorial:', error);
            return this.generateBasicTutorialResponse(youtubeUrl);
        }
    }

    /**
     * Analyze tutorial content (simplified)
     */
    async analyzeTutorial(url, videoId) {
        // Check cache first
        if (this.tutorialCache.has(videoId)) {
            return this.tutorialCache.get(videoId);
        }

        // Basic tutorial analysis
        const tutorialData = {
            videoId,
            url,
            title: 'After Effects Tutorial',
            category: this.detectTutorialCategory(url),
            techniques: this.extractBasicTechniques(),
            steps: this.generateBasicSteps()
        };

        // Cache the data
        this.tutorialCache.set(videoId, tutorialData);
        return tutorialData;
    }

    /**
     * Alias for analyzeTutorial (backward compatibility)
     */
    async analyzeVideo(url, videoId) {
        return await this.analyzeTutorial(url, videoId);
    }

    /**
     * Detect tutorial category from URL patterns
     */
    detectTutorialCategory(url) {
        const categories = {
            'animation': /animat|motion|keyframe|timeline/i,
            'effects': /effect|vfx|visual|particle|glow|light/i,
            'text': /text|title|typography|font/i,
            'compositing': /composit|layer|mask|track|rotoscop/i,
            'color': /color|grade|correct|lut/i,
            'audio': /audio|sound|music|sync/i
        };

        for (const [category, pattern] of Object.entries(categories)) {
            if (pattern.test(url)) {
                return category;
            }
        }
        return 'general';
    }

    /**
     * Extract basic techniques (simplified)
     */
    extractBasicTechniques() {
        return [
            'Layer Management',
            'Keyframe Animation',
            'Effects Application',
            'Composition Setup'
        ];
    }

    /**
     * Generate basic tutorial steps
     */
    generateBasicSteps() {
        return [
            {
                id: 'step-1',
                title: 'Setup Composition',
                description: 'Create or analyze the composition settings',
                action: 'setup'
            },
            {
                id: 'step-2',
                title: 'Import Assets',
                description: 'Gather and import necessary media files',
                action: 'import'
            },
            {
                id: 'step-3',
                title: 'Apply Techniques',
                description: 'Follow the tutorial techniques step by step',
                action: 'animate'
            },
            {
                id: 'step-4',
                title: 'Review & Render',
                description: 'Preview the result and make final adjustments',
                action: 'review'
            }
        ];
    }

    /**
     * Generate tutorial response
     */
    generateTutorialResponse(tutorialData, userMessage) {
        const response = {
            type: 'tutorial',
            content: `🎬 **Tutorial Detected: ${tutorialData.title}**\n\n` +
                    `📂 **Category:** ${tutorialData.category.toUpperCase()}\n` +
                    `🔗 **Video:** [Watch Tutorial](${tutorialData.url})\n\n` +
                    `**Key Techniques:**\n${tutorialData.techniques.map(t => `• ${t}`).join('\n')}\n\n` +
                    `**Step-by-Step Guide:**\n${tutorialData.steps.map((s, i) => `${i+1}. **${s.title}** - ${s.description}`).join('\n')}\n\n` +
                    `💡 **Tip:** Use the step-by-step guide above to follow along with the tutorial!`,
            tutorial: tutorialData,
            action: 'tutorial_detected'
        };

        this.currentTutorial = tutorialData;
        return response;
    }

    /**
     * Generate basic tutorial response (fallback)
     */
    generateBasicTutorialResponse(youtubeUrl) {
        return {
            type: 'tutorial',
            content: `🎬 **YouTube Tutorial Detected**\n\n` +
                    `🔗 **Video:** [Watch Tutorial](${youtubeUrl})\n\n` +
                    `**Suggested Workflow:**\n` +
                    `1. **Watch** the tutorial video first\n` +
                    `2. **Pause** at each major step\n` +
                    `3. **Practice** the technique in After Effects\n` +
                    `4. **Ask** specific questions about any step\n\n` +
                    `💡 **Tip:** I can help explain specific After Effects techniques mentioned in the tutorial!`,
            action: 'tutorial_basic'
        };
    }

    /**
     * Get current tutorial info
     */
    getCurrentTutorial() {
        return this.currentTutorial;
    }

    /**
     * Clear tutorial cache
     */
    clearCache() {
        this.tutorialCache.clear();
        this.currentTutorial = null;
        console.log('🗑️ Tutorial cache cleared');
    }
}

// Global instance
window.youtubeTutorialHelper = window.youtubeTutorialHelper || new YouTubeTutorialHelper();


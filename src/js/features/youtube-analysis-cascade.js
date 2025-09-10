/**
 * YouTube Analysis Cascade System
 * Multi-tier fallback system for robust YouTube video analysis
 * Simplified version extracted from abilities folder
 */

class YouTubeAnalysisCascade {
    constructor(aiModule = null) {
        this.aiModule = aiModule;
        this.methods = [
            {
                name: 'AI-Powered Analysis',
                func: this.tryAIPoweredAnalysis.bind(this),
                priority: 1,
                capabilities: ['transcript', 'summary', 'insights']
            },
            {
                name: 'Browser-Based Processing',
                func: this.tryBrowserBasedProcessing.bind(this),
                priority: 2,
                capabilities: ['metadata', 'basic-info']
            },
            {
                name: 'Pattern Matching Fallback',
                func: this.tryPatternMatchingFallback.bind(this),
                priority: 3,
                capabilities: ['basic-info', 'url-parsing']
            }
        ];

        console.log('🎯 YouTube Analysis Cascade System initialized');
        console.log(`📊 Available methods: ${this.methods.length}`);
    }

    /**
     * Main entry point - tries all methods in cascade order
     */
    async analyzeYouTubeVideo(url, userMessage = '') {
        console.log(`🚀 Starting cascade analysis for: ${this.sanitizeUrl(url)}`);
        console.log(`📝 User context: "${userMessage}"`);

        const results = {
            url,
            userMessage,
            methodResults: [],
            usedMethod: null,
            finalResult: null,
            timestamp: new Date().toISOString()
        };

        // Validate URL first
        if (!this.isValidYouTubeUrl(url)) {
            results.finalResult = {
                success: false,
                error: 'Invalid YouTube URL provided',
                data: null
            };
            return results;
        }

        // Try each method in order
        for (const method of this.methods) {
            console.log(`🔍 Trying method: ${method.name}`);

            try {
                const startTime = Date.now();
                const result = await method.func(url, userMessage);
                const duration = Date.now() - startTime;

                // Record this attempt
                results.methodResults.push({
                    method: method.name,
                    success: result.success,
                    error: result.error || null,
                    duration,
                    data: result.success ? result.data : null
                });

                if (result.success) {
                    console.log(`✅ Success with ${method.name} in ${duration}ms`);
                    results.usedMethod = method.name;
                    results.finalResult = result;
                    break;
                } else {
                    console.log(`❌ ${method.name} failed: ${result.error}`);
                }

            } catch (error) {
                console.error(`💥 ${method.name} threw error:`, error);
                results.methodResults.push({
                    method: method.name,
                    success: false,
                    error: error.message,
                    duration: 0,
                    data: null
                });
            }
        }

        if (!results.finalResult) {
            console.log('❌ All cascade methods failed');
            results.finalResult = {
                success: false,
                error: 'All analysis methods failed',
                data: null
            };
        }

        return results;
    }

    /**
     * Method 1: AI-Powered Analysis using available AI APIs
     */
    async tryAIPoweredAnalysis(url, userMessage) {
        console.log('🤖 Attempting AI-Powered Analysis...');

        try {
            // Check if AI module is available
            if (!this.aiModule || !window.openaiManager) {
                throw new Error('AI module not available');
            }

            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            // Try to get video info through available APIs
            const videoInfo = await this.getVideoInfo(videoId);

            // Use AI to analyze the video context
            const aiPrompt = this.buildAnalysisPrompt(videoInfo, userMessage);
            const aiResponse = await window.openaiManager.sendMessage(aiPrompt);

            return {
                success: true,
                data: {
                    method: 'AI-Powered Analysis',
                    videoInfo,
                    analysis: aiResponse,
                    insights: this.extractInsights(aiResponse),
                    relevantTimestamps: this.extractTimestamps(aiResponse)
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Method 2: Browser-Based Processing
     */
    async tryBrowserBasedProcessing(url, userMessage) {
        console.log('🌐 Attempting Browser-Based Processing...');

        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            // Get basic video metadata
            const metadata = await this.getBasicMetadata(videoId);

            // Simple text analysis of title and description
            const textAnalysis = this.analyzeTextContent(metadata, userMessage);

            return {
                success: true,
                data: {
                    method: 'Browser-Based Processing',
                    metadata,
                    analysis: textAnalysis,
                    confidence: 'medium'
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Method 3: Pattern Matching Fallback
     */
    async tryPatternMatchingFallback(url, userMessage) {
        console.log('🔍 Attempting Pattern Matching Fallback...');

        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Could not extract video ID');
            }

            // Basic pattern matching against common After Effects terms
            const patterns = this.getAfterEffectsPatterns();
            const matchedTopics = this.matchPatterns(url, userMessage, patterns);

            return {
                success: true,
                data: {
                    method: 'Pattern Matching Fallback',
                    videoId,
                    url,
                    matchedTopics,
                    suggestions: this.generateSuggestions(matchedTopics),
                    confidence: 'low'
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate YouTube URL
     */
    isValidYouTubeUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/(www\.)?youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/
        ];

        return patterns.some(pattern => pattern.test(url));
    }

    /**
     * Extract video ID from YouTube URL
     */
    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {return match[1];}
        }

        return null;
    }

    /**
     * Get basic video metadata (simplified)
     */
    async getBasicMetadata(videoId) {
        return {
            videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            timestamp: new Date().toISOString(),
            source: 'pattern-extraction'
        };
    }

    /**
     * Get video info through available methods
     */
    async getVideoInfo(videoId) {
        // This would be enhanced with actual API calls in production
        return {
            videoId,
            title: 'Video Title (Analysis Required)',
            description: 'Video description would be extracted here',
            duration: 'Unknown',
            viewCount: 'Unknown',
            publishedAt: 'Unknown'
        };
    }

    /**
     * Build AI analysis prompt
     */
    buildAnalysisPrompt(videoInfo, userMessage) {
        return `Analyze this YouTube video for After Effects tutorials and techniques:

Video ID: ${videoInfo.videoId}
Title: ${videoInfo.title || 'Unknown'}
Description: ${videoInfo.description || 'Unknown'}

User Context: ${userMessage}

Please provide:
1. Main topics covered
2. After Effects techniques shown
3. Difficulty level
4. Key learning points
5. Relevant timestamps if available

Focus on practical After Effects applications.`;
    }

    /**
     * Extract insights from AI response
     */
    extractInsights(aiResponse) {
        // Simple keyword extraction
        const keywords = [
            'expressions', 'animation', 'compositing', 'effects',
            'motion graphics', 'text animation', '3D', 'particles',
            'tracking', 'masking', 'keyframes', 'bezier'
        ];

        const foundKeywords = keywords.filter(keyword =>
            aiResponse.toLowerCase().includes(keyword.toLowerCase())
        );

        return {
            keywords: foundKeywords,
            complexity: foundKeywords.length > 5 ? 'advanced' :
                foundKeywords.length > 2 ? 'intermediate' : 'beginner'
        };
    }

    /**
     * Extract timestamps from text
     */
    extractTimestamps(text) {
        const timestampPattern = /(\d{1,2}):(\d{2})/g;
        const matches = [];
        let match;

        while ((match = timestampPattern.exec(text)) !== null) {
            matches.push({
                time: match[0],
                seconds: parseInt(match[1]) * 60 + parseInt(match[2])
            });
        }

        return matches;
    }

    /**
     * Analyze text content for After Effects relevance
     */
    analyzeTextContent(metadata, userMessage) {
        const combined = `${metadata.title || ''} ${metadata.description || ''} ${userMessage}`.toLowerCase();

        const topics = {
            animation: ['animate', 'keyframe', 'motion', 'movement'],
            effects: ['effect', 'filter', 'distort', 'glow', 'blur'],
            text: ['text', 'title', 'typography', 'font'],
            '3d': ['3d', 'dimension', 'camera', 'light'],
            compositing: ['composite', 'blend', 'mask', 'layer']
        };

        const detectedTopics = {};
        Object.entries(topics).forEach(([category, keywords]) => {
            const score = keywords.reduce((sum, keyword) => {
                return sum + (combined.split(keyword).length - 1);
            }, 0);

            if (score > 0) {
                detectedTopics[category] = score;
            }
        });

        return {
            topics: detectedTopics,
            relevance: Object.keys(detectedTopics).length > 0 ? 'high' : 'low',
            summary: this.generateTopicSummary(detectedTopics)
        };
    }

    /**
     * Get After Effects pattern keywords
     */
    getAfterEffectsPatterns() {
        return {
            'expressions': /expression|script|code|variable/i,
            'animation': /animate|keyframe|motion|tween/i,
            'effects': /effect|filter|plugin|preset/i,
            'text': /text|title|typography|kinetic/i,
            '3d': /3d|camera|light|dimension/i,
            'tracking': /track|motion|stabilize/i,
            'masking': /mask|roto|rotoscope/i,
            'compositing': /composite|blend|green screen|chroma/i
        };
    }

    /**
     * Match patterns in content
     */
    matchPatterns(url, userMessage, patterns) {
        const content = `${url} ${userMessage}`.toLowerCase();
        const matches = {};

        Object.entries(patterns).forEach(([topic, pattern]) => {
            if (pattern.test(content)) {
                matches[topic] = true;
            }
        });

        return matches;
    }

    /**
     * Generate suggestions based on matched topics
     */
    generateSuggestions(matchedTopics) {
        const suggestions = {
            expressions: 'Try exploring After Effects expressions for this technique',
            animation: 'Look for keyframe animation tutorials',
            effects: 'Check the Effects & Presets panel for similar effects',
            text: 'Explore text animation and kinetic typography',
            '3d': 'Consider 3D layer properties and camera work',
            tracking: 'Use motion tracking features in After Effects',
            masking: 'Practice masking and rotoscoping techniques',
            compositing: 'Study compositing and blending modes'
        };

        return Object.keys(matchedTopics).map(topic => suggestions[topic] || 'Explore this topic further');
    }

    /**
     * Generate topic summary
     */
    generateTopicSummary(topics) {
        const topTopics = Object.entries(topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);

        if (topTopics.length === 0) {
            return 'No specific After Effects topics detected';
        }

        return `Main topics: ${topTopics.join(', ')}`;
    }

    /**
     * Sanitize URL for logging
     */
    sanitizeUrl(url) {
        return url.length > 50 ? `${url.substring(0, 50) }...` : url;
    }

    /**
     * Get system status
     */
    async getSystemStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            totalMethods: this.methods.length,
            availableMethods: [],
            unavailableMethods: []
        };

        for (const method of this.methods) {
            const isAvailable = await this.testMethod(method);
            if (isAvailable) {
                status.availableMethods.push({
                    name: method.name,
                    priority: method.priority,
                    capabilities: method.capabilities
                });
            } else {
                status.unavailableMethods.push({
                    name: method.name,
                    priority: method.priority
                });
            }
        }

        return status;
    }

    /**
     * Test if a method is available
     */
    async testMethod(method) {
        try {
            // Quick availability check
            if (method.name === 'AI-Powered Analysis') {
                return !!(this.aiModule && window.openaiManager);
            }
            return true; // Browser methods are generally available
        } catch (error) {
            return false;
        }
    }
}

// Initialize global YouTube analyzer
document.addEventListener('DOMContentLoaded', () => {
    if (!window.youtubeAnalyzer) {
        // Wait for AI module to be available
        const initAnalyzer = () => {
            window.youtubeAnalyzer = new YouTubeAnalysisCascade(window.openaiManager);
            console.log('✅ YouTube Analysis Cascade initialized');
        };

        if (window.openaiManager) {
            initAnalyzer();
        } else {
            // Wait for AI module
            setTimeout(initAnalyzer, 3000);
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeAnalysisCascade;
}


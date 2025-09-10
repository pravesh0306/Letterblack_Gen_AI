/**
 * Enhanced Chat Memory - Streamlined for CEP Extension
 * Provides context-aware conversation memory with project awareness
 */

class EnhancedChatMemory {
    constructor() {
        this.conversationHistory = [];
        this.projectContext = null;
        this.maxHistorySize = 20; // Reduced for CEP environment
        this.sessionStartTime = Date.now();
        
        this.loadFromStorage();
        this.logger.debug('🧠 Enhanced Chat Memory initialized');
    }

    /**
     * Add message to conversation history
     */
    addMessage(message, role = 'user', metadata = {}) {
        const messageEntry = {
            id: this.generateMessageId(),
            role: role, // 'user', 'assistant', 'system'
            content: message,
            timestamp: Date.now(),
            projectContext: this.projectContext ? { ...this.projectContext } : null,
            metadata: {
                messageType: metadata.type || 'text',
                hasYouTubeLink: this.hasYouTubeLink(message),
                hasExpression: this.hasExpression(message),
                hasScript: this.hasScript(message),
                ...metadata
            }
        };

        this.conversationHistory.push(messageEntry);

        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistorySize) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistorySize);
        }

        this.saveToStorage();
        return messageEntry;
    }

    /**
     * Get recent conversation context
     */
    getRecentContext(messageCount = 5) {
        return this.conversationHistory
            .slice(-messageCount)
            .map(msg => ({
                role: msg.role,
                content: this.truncateContent(msg.content, 200),
                timestamp: msg.timestamp,
                metadata: msg.metadata
            }));
    }

    /**
     * Get conversation summary
     */
    getConversationSummary() {
        const userMessages = this.conversationHistory.filter(msg => msg.role === 'user');
        const assistantMessages = this.conversationHistory.filter(msg => msg.role === 'assistant');
        
        const topics = this.extractTopics();
        const youtubeVideos = this.extractYouTubeVideos();
        const expressions = this.extractExpressions();

        return {
            totalMessages: this.conversationHistory.length,
            userMessages: userMessages.length,
            assistantMessages: assistantMessages.length,
            sessionDuration: this.getSessionDuration(),
            mainTopics: topics.slice(0, 5),
            youtubeVideos: youtubeVideos,
            expressionsUsed: expressions.length,
            projectContext: this.projectContext
        };
    }

    /**
     * Update project context
     */
    updateProjectContext(context) {
        this.projectContext = {
            ...this.projectContext,
            ...context,
            lastUpdated: Date.now()
        };
        this.saveToStorage();
        this.logger.debug('📂 Project context updated');
    }

    /**
     * Search conversation history
     */
    searchHistory(query, limit = 5) {
        const lowerQuery = query.toLowerCase();
        return this.conversationHistory
            .filter(msg => msg.content.toLowerCase().includes(lowerQuery))
            .slice(-limit)
            .map(msg => ({
                id: msg.id,
                role: msg.role,
                content: this.truncateContent(msg.content, 150),
                timestamp: msg.timestamp,
                relevance: this.calculateRelevance(msg.content, query)
            }))
            .sort((a, b) => b.relevance - a.relevance);
    }

    /**
     * Extract topics from conversation
     */
    extractTopics() {
        const topicKeywords = {
            'animation': /animat|keyframe|timeline|motion/gi,
            'effects': /effect|filter|glow|blur|distort/gi,
            'text': /text|title|font|typography/gi,
            'expressions': /expression|javascript|eval|wiggle/gi,
            'compositing': /composit|layer|mask|blend/gi,
            'rendering': /render|export|output|codec/gi,
            'troubleshooting': /error|problem|issue|fix|help/gi
        };

        const topicCounts = {};
        const allText = this.conversationHistory.map(msg => msg.content).join(' ');

        for (const [topic, pattern] of Object.entries(topicKeywords)) {
            const matches = allText.match(pattern);
            topicCounts[topic] = matches ? matches.length : 0;
        }

        return Object.entries(topicCounts)
            .filter(([topic, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, mentions: count }));
    }

    /**
     * Extract YouTube videos mentioned
     */
    extractYouTubeVideos() {
        const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
        const videos = [];

        this.conversationHistory.forEach(msg => {
            const matches = msg.content.matchAll(youtubePattern);
            for (const match of matches) {
                const videoId = match[1];
                const url = `https://www.youtube.com/watch?v=${videoId}`;
                if (!videos.find(v => v.videoId === videoId)) {
                    videos.push({
                        videoId,
                        url,
                        firstMentioned: msg.timestamp,
                        messageId: msg.id
                    });
                }
            }
        });

        return videos;
    }

    /**
     * Extract expressions used
     */
    extractExpressions() {
        const expressions = [];
        const expressionPattern = /```(?:javascript|js)?\s*([\s\S]*?)```/gi;

        this.conversationHistory.forEach(msg => {
            const matches = msg.content.matchAll(expressionPattern);
            for (const match of matches) {
                expressions.push({
                    code: match[1].trim(),
                    messageId: msg.id,
                    timestamp: msg.timestamp
                });
            }
        });

        return expressions;
    }

    /**
     * Helper methods
     */
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    hasYouTubeLink(content) {
        return /(?:youtube\.com|youtu\.be)/i.test(content);
    }

    hasExpression(content) {
        return /```|expression|javascript/i.test(content);
    }

    hasScript(content) {
        return /script|function|var |let |const /i.test(content);
    }

    truncateContent(content, maxLength) {
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    }

    calculateRelevance(content, query) {
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const words = lowerQuery.split(' ');
        
        let score = 0;
        words.forEach(word => {
            const occurrences = (lowerContent.match(new RegExp(word, 'g')) || []).length;
            score += occurrences;
        });
        
        return score;
    }

    getSessionDuration() {
        const duration = Date.now() - this.sessionStartTime;
        const minutes = Math.floor(duration / 60000);
        return `${minutes} minutes`;
    }

    /**
     * Storage methods
     */
    saveToStorage() {
        try {
            const data = {
                conversationHistory: this.conversationHistory,
                projectContext: this.projectContext,
                sessionStartTime: this.sessionStartTime
            };
            localStorage.setItem('enhanced_chat_memory', JSON.stringify(data));
        } catch (error) {
            this.logger.warn('Failed to save chat memory:', error);
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem('enhanced_chat_memory');
            if (data) {
                const parsed = JSON.parse(data);
                this.conversationHistory = parsed.conversationHistory || [];
                this.projectContext = parsed.projectContext || null;
                this.sessionStartTime = parsed.sessionStartTime || Date.now();
            }
        } catch (error) {
            this.logger.warn('Failed to load chat memory:', error);
        }
    }

    /**
     * Clear memory
     */
    clearMemory() {
        this.conversationHistory = [];
        this.projectContext = null;
        this.sessionStartTime = Date.now();
        this.saveToStorage();
        this.logger.debug('🗑️ Chat memory cleared');
    }

    /**
     * Export memory for debugging
     */
    exportMemory() {
        return {
            conversationHistory: this.conversationHistory,
            projectContext: this.projectContext,
            summary: this.getConversationSummary()
        };
    }
}

// Global instance
window.enhancedChatMemory = window.enhancedChatMemory || new EnhancedChatMemory();

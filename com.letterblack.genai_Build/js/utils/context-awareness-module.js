/**
 * CONTEXT AWARENESS MODULE
 * Remembers project context across sessions for personalized AI assistance
 */

class ContextAwarenessModule {
    constructor(aiModule, aeIntegration) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.contextData = {
            project: {},
            user: {},
            session: {},
            preferences: {},
            history: []
        };

        this.storageKeys = {
            projectContext: 'ae_ai_project_context',
            userPreferences: 'ae_ai_user_preferences',
            sessionHistory: 'ae_ai_session_history',
            learningData: 'ae_ai_learning_data'
        };

        this.learningData = {
            commandPatterns: {},
            effectPreferences: {},
            workflowPatterns: {},
            errorPatterns: {}
        };

        this.contextUpdateTimer = null;
        this.autoSaveInterval = 30000; // 30 seconds

        this.init();
    }

    async init() {
        // Load existing context data
        await this.loadContextData();

        // Initialize context tracking
        this.initializeContextTracking();

        // Set up auto-save
        this.setupAutoSave();

        // Set up event listeners
        this.setupEventListeners();

        console.log('🧠 Context Awareness Module initialized');
    }

    /**
     * Load context data from storage
     */
    async loadContextData() {
        try {
            // Load project context
            const projectContext = localStorage.getItem(this.storageKeys.projectContext);
            if (projectContext) {
                this.contextData.project = JSON.parse(projectContext);
            }

            // Load user preferences
            const userPreferences = localStorage.getItem(this.storageKeys.userPreferences);
            if (userPreferences) {
                this.contextData.preferences = JSON.parse(userPreferences);
            }

            // Load session history
            const sessionHistory = localStorage.getItem(this.storageKeys.sessionHistory);
            if (sessionHistory) {
                this.contextData.history = JSON.parse(sessionHistory);
            }

            // Load learning data
            const learningData = localStorage.getItem(this.storageKeys.learningData);
            if (learningData) {
                this.learningData = JSON.parse(learningData);
            }

            console.log('📚 Context data loaded successfully');

        } catch (error) {
            console.error('Failed to load context data:', error);
            // Initialize with defaults
            this.initializeDefaultContext();
        }
    }

    /**
     * Initialize default context if loading fails
     */
    initializeDefaultContext() {
        this.contextData = {
            project: {
                name: 'Unknown Project',
                created: Date.now(),
                lastModified: Date.now(),
                compositionCount: 0,
                layerCount: 0,
                effectsUsed: [],
                workflow: 'general'
            },
            user: {
                skillLevel: 'intermediate',
                preferredEffects: [],
                commonWorkflows: [],
                favoriteTools: []
            },
            session: {
                startTime: Date.now(),
                actionsPerformed: 0,
                aiQueries: 0,
                errorsEncountered: 0
            },
            preferences: {
                autoSave: true,
                theme: 'dark',
                language: 'en',
                notifications: true
            },
            history: []
        };
    }

    /**
     * Initialize context tracking
     */
    initializeContextTracking() {
        // Track current session
        this.contextData.session.startTime = Date.now();

        // Initialize project tracking if AE integration available
        if (this.aeIntegration) {
            this.initializeProjectTracking();
        }
    }

    /**
     * Initialize project tracking
     */
    async initializeProjectTracking() {
        try {
            const projectInfo = await this.aeIntegration.getProjectInfo();

            if (projectInfo) {
                this.updateProjectContext({
                    name: projectInfo.name || 'Unnamed Project',
                    path: projectInfo.path,
                    compositions: projectInfo.compositions || [],
                    lastModified: Date.now()
                });
            }
        } catch (error) {
            console.warn('Failed to initialize project tracking:', error);
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        this.contextUpdateTimer = setInterval(() => {
            this.saveContextData();
        }, this.autoSaveInterval);
    }

    /**
     * Setup event listeners for context tracking
     */
    setupEventListeners() {
        // Listen for AI module events
        if (this.aiModule) {
            this.aiModule.onQuery = (query) => this.trackAIQuery(query);
            this.aiModule.onResponse = (response) => this.trackAIResponse(response);
        }

        // Listen for AE integration events
        if (this.aeIntegration) {
            this.aeIntegration.onCompositionChange = (comp) => this.trackCompositionChange(comp);
            this.aeIntegration.onLayerChange = (layer) => this.trackLayerChange(layer);
            this.aeIntegration.onEffectAdded = (effect) => this.trackEffectUsage(effect);
        }

        // Listen for user interactions
        document.addEventListener('click', (event) => this.trackUserInteraction(event));
        document.addEventListener('keydown', (event) => this.trackKeyboardShortcut(event));
    }

    /**
     * Update project context
     */
    updateProjectContext(updates) {
        this.contextData.project = { ...this.contextData.project, ...updates };
        this.contextData.project.lastModified = Date.now();

        // Track in history
        this.addToHistory('project_update', updates);

        console.log('📝 Project context updated:', updates);
    }

    /**
     * Update user preferences
     */
    updateUserPreferences(updates) {
        this.contextData.preferences = { ...this.contextData.preferences, ...updates };

        // Track in history
        this.addToHistory('preference_update', updates);

        console.log('⚙️ User preferences updated:', updates);
    }

    /**
     * Track AI query
     */
    trackAIQuery(query) {
        this.contextData.session.aiQueries++;

        const queryData = {
            type: 'ai_query',
            query: query,
            timestamp: Date.now(),
            context: this.getCurrentContext()
        };

        this.addToHistory('ai_query', queryData);

        // Learn from query patterns
        this.learnFromQuery(query);
    }

    /**
     * Track AI response
     */
    trackAIResponse(response) {
        const responseData = {
            type: 'ai_response',
            response: response,
            timestamp: Date.now(),
            context: this.getCurrentContext()
        };

        this.addToHistory('ai_response', responseData);

        // Learn from response patterns
        this.learnFromResponse(response);
    }

    /**
     * Track composition changes
     */
    trackCompositionChange(composition) {
        const changeData = {
            type: 'composition_change',
            composition: composition,
            timestamp: Date.now()
        };

        this.addToHistory('composition_change', changeData);

        // Update project context
        this.updateProjectContext({
            compositionCount: (this.contextData.project.compositionCount || 0) + 1,
            lastComposition: composition.name
        });
    }

    /**
     * Track layer changes
     */
    trackLayerChange(layer) {
        const changeData = {
            type: 'layer_change',
            layer: layer,
            timestamp: Date.now()
        };

        this.addToHistory('layer_change', changeData);

        // Update project context
        this.updateProjectContext({
            layerCount: (this.contextData.project.layerCount || 0) + 1
        });
    }

    /**
     * Track effect usage
     */
    trackEffectUsage(effect) {
        const effectData = {
            type: 'effect_usage',
            effect: effect,
            timestamp: Date.now()
        };

        this.addToHistory('effect_usage', effectData);

        // Update project context
        const effectsUsed = this.contextData.project.effectsUsed || [];
        if (!effectsUsed.includes(effect.name)) {
            effectsUsed.push(effect.name);
            this.updateProjectContext({ effectsUsed });
        }

        // Learn effect preferences
        this.learnEffectPreference(effect);
    }

    /**
     * Track user interactions
     */
    trackUserInteraction(event) {
        const interactionData = {
            type: 'user_interaction',
            element: event.target.tagName,
            class: event.target.className,
            timestamp: Date.now()
        };

        // Only track significant interactions
        if (this.isSignificantInteraction(event.target)) {
            this.addToHistory('user_interaction', interactionData);
        }
    }

    /**
     * Track keyboard shortcuts
     */
    trackKeyboardShortcut(event) {
        const shortcutData = {
            type: 'keyboard_shortcut',
            key: event.key,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey,
            timestamp: Date.now()
        };

        this.addToHistory('keyboard_shortcut', shortcutData);

        // Learn workflow patterns
        this.learnWorkflowPattern(shortcutData);
    }

    /**
     * Check if interaction is significant
     */
    isSignificantInteraction(element) {
        const significantClasses = [
            'ai-query-button',
            'effect-panel',
            'timeline-control',
            'layer-control',
            'composition-panel'
        ];

        return significantClasses.some(cls => element.classList.contains(cls)) ||
               ['BUTTON', 'INPUT', 'SELECT'].includes(element.tagName);
    }

    /**
     * Add entry to history
     */
    addToHistory(type, data) {
        const entry = {
            id: Date.now() + Math.random(),
            type: type,
            data: data,
            timestamp: Date.now()
        };

        this.contextData.history.push(entry);

        // Limit history size
        if (this.contextData.history.length > 1000) {
            this.contextData.history = this.contextData.history.slice(-500);
        }
    }

    /**
     * Learn from query patterns
     */
    learnFromQuery(query) {
        const words = query.toLowerCase().split(/\s+/);
        const patterns = this.extractPatterns(words);

        patterns.forEach(pattern => {
            if (!this.learningData.commandPatterns[pattern]) {
                this.learningData.commandPatterns[pattern] = 0;
            }
            this.learningData.commandPatterns[pattern]++;
        });
    }

    /**
     * Learn from response patterns
     */
    learnFromResponse(response) {
        // Extract successful patterns from responses
        const successIndicators = ['successfully', 'completed', 'applied', 'created'];
        const hasSuccess = successIndicators.some(indicator =>
            response.toLowerCase().includes(indicator)
        );

        if (hasSuccess) {
            // Learn what works
            const lastQuery = this.getLastQuery();
            if (lastQuery) {
                this.learningData.workflowPatterns[lastQuery] = (this.learningData.workflowPatterns[lastQuery] || 0) + 1;
            }
        }
    }

    /**
     * Learn effect preferences
     */
    learnEffectPreference(effect) {
        const effectName = effect.name || effect;
        if (!this.learningData.effectPreferences[effectName]) {
            this.learningData.effectPreferences[effectName] = 0;
        }
        this.learningData.effectPreferences[effectName]++;
    }

    /**
     * Learn workflow patterns
     */
    learnWorkflowPattern(shortcut) {
        const pattern = `${shortcut.ctrl ? 'Ctrl+' : ''}${shortcut.shift ? 'Shift+' : ''}${shortcut.alt ? 'Alt+' : ''}${shortcut.key}`;
        if (!this.learningData.workflowPatterns[pattern]) {
            this.learningData.workflowPatterns[pattern] = 0;
        }
        this.learningData.workflowPatterns[pattern]++;
    }

    /**
     * Extract patterns from text
     */
    extractPatterns(words) {
        const patterns = [];

        // Extract bigrams
        for (let i = 0; i < words.length - 1; i++) {
            patterns.push(`${words[i]} ${words[i + 1]}`);
        }

        // Extract key action words
        const actionWords = ['create', 'add', 'apply', 'remove', 'change', 'set', 'get', 'show'];
        words.forEach(word => {
            if (actionWords.includes(word)) {
                patterns.push(word);
            }
        });

        return patterns;
    }

    /**
     * Get current context
     */
    getCurrentContext() {
        return {
            project: this.contextData.project,
            session: this.contextData.session,
            timestamp: Date.now()
        };
    }

    /**
     * Get last query from history
     */
    getLastQuery() {
        const queries = this.contextData.history.filter(entry => entry.type === 'ai_query');
        return queries.length > 0 ? queries[queries.length - 1].data.query : null;
    }

    /**
     * Get personalized suggestions based on context
     */
    getPersonalizedSuggestions() {
        const suggestions = {
            effects: this.getTopEffects(),
            workflows: this.getTopWorkflows(),
            commands: this.getTopCommands(),
            context: this.getCurrentContext()
        };

        return suggestions;
    }

    /**
     * Get most used effects
     */
    getTopEffects() {
        const effects = Object.entries(this.learningData.effectPreferences)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([effect]) => effect);

        return effects;
    }

    /**
     * Get most used workflows
     */
    getTopWorkflows() {
        const workflows = Object.entries(this.learningData.workflowPatterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([workflow]) => workflow);

        return workflows;
    }

    /**
     * Get most used commands
     */
    getTopCommands() {
        const commands = Object.entries(this.learningData.commandPatterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([command]) => command);

        return commands;
    }

    /**
     * Get context-aware AI prompt
     */
    getContextAwarePrompt(basePrompt) {
        const context = this.getCurrentContext();
        const suggestions = this.getPersonalizedSuggestions();

        const contextPrompt = `
Based on the user's context and learning data:

Project Context:
- Project: ${context.project.name || 'Unknown'}
- Compositions: ${context.project.compositionCount || 0}
- Effects used: ${context.project.effectsUsed?.join(', ') || 'None'}

User Preferences:
- Preferred effects: ${suggestions.effects.join(', ') || 'None identified'}
- Common workflows: ${suggestions.workflows.join(', ') || 'None identified'}
- Skill level: ${this.contextData.user.skillLevel || 'intermediate'}

Session Info:
- AI queries this session: ${context.session.aiQueries || 0}
- Actions performed: ${context.session.actionsPerformed || 0}

Please provide personalized assistance considering this context.

Original request: ${basePrompt}`;

        return contextPrompt;
    }

    /**
     * Predict user intent based on context
     */
    predictUserIntent(currentAction) {
        const context = this.getCurrentContext();
        const history = this.contextData.history.slice(-10); // Last 10 actions

        // Analyze recent patterns
        const recentEffects = history
            .filter(entry => entry.type === 'effect_usage')
            .map(entry => entry.data.effect.name)
            .slice(-3);

        const recentQueries = history
            .filter(entry => entry.type === 'ai_query')
            .map(entry => entry.data.query)
            .slice(-3);

        // Predict next likely action
        const prediction = {
            likelyNextAction: this.predictNextAction(history),
            suggestedEffects: this.suggestNextEffects(recentEffects),
            contextRelevance: this.calculateContextRelevance(currentAction, context)
        };

        return prediction;
    }

    /**
     * Predict next action based on history
     */
    predictNextAction(history) {
        const actionSequence = history.map(entry => entry.type);
        const lastAction = actionSequence[actionSequence.length - 1];

        // Simple pattern matching
        const patterns = {
            'ai_query': ['effect_usage', 'layer_change'],
            'effect_usage': ['ai_query', 'layer_change'],
            'layer_change': ['effect_usage', 'composition_change']
        };

        return patterns[lastAction] || ['ai_query'];
    }

    /**
     * Suggest next effects based on recent usage
     */
    suggestNextEffects(recentEffects) {
        if (recentEffects.length === 0) return [];

        const lastEffect = recentEffects[recentEffects.length - 1];
        const effectCombinations = {
            'Gaussian Blur': ['Drop Shadow', 'Glow'],
            'Drop Shadow': ['Gaussian Blur', 'Glow'],
            'Glow': ['Drop Shadow', 'Brightness & Contrast'],
            'Motion Blur': ['Time Remapping', 'Transform']
        };

        return effectCombinations[lastEffect] || [];
    }

    /**
     * Calculate context relevance
     */
    calculateContextRelevance(currentAction, context) {
        let relevance = 0;

        // Check if action matches recent patterns
        const recentActions = this.contextData.history.slice(-5);
        const similarActions = recentActions.filter(entry =>
            entry.type === currentAction.type
        ).length;

        relevance += similarActions * 20;

        // Check project context match
        if (currentAction.project === context.project.name) {
            relevance += 30;
        }

        // Check time relevance (recent actions are more relevant)
        const recentTimeframe = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        const recentEntries = this.contextData.history.filter(entry =>
            entry.timestamp > recentTimeframe
        ).length;

        relevance += Math.min(recentEntries * 5, 25);

        return Math.min(relevance, 100);
    }

    /**
     * Save context data to storage
     */
    async saveContextData() {
        try {
            localStorage.setItem(this.storageKeys.projectContext, JSON.stringify(this.contextData.project));
            localStorage.setItem(this.storageKeys.userPreferences, JSON.stringify(this.contextData.preferences));
            localStorage.setItem(this.storageKeys.sessionHistory, JSON.stringify(this.contextData.history));
            localStorage.setItem(this.storageKeys.learningData, JSON.stringify(this.learningData));

            console.log('💾 Context data saved');
        } catch (error) {
            console.error('Failed to save context data:', error);
        }
    }

    /**
     * Export context data
     */
    exportContextData() {
        const exportData = {
            contextData: this.contextData,
            learningData: this.learningData,
            exportDate: Date.now(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ae-ai-context-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Context data exported');
    }

    /**
     * Import context data
     */
    async importContextData(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);

            if (importData.contextData) {
                this.contextData = { ...this.contextData, ...importData.contextData };
            }

            if (importData.learningData) {
                this.learningData = { ...this.learningData, ...importData.learningData };
            }

            await this.saveContextData();

            console.log('📥 Context data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import context data:', error);
            return false;
        }
    }

    /**
     * Clear all context data
     */
    async clearContextData() {
        // Reset to defaults
        this.initializeDefaultContext();
        this.learningData = {
            commandPatterns: {},
            effectPreferences: {},
            workflowPatterns: {},
            errorPatterns: {}
        };

        // Clear storage
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('🧹 Context data cleared');
    }

    /**
     * Get context statistics
     */
    getContextStatistics() {
        const history = this.contextData.history;
        const stats = {
            totalActions: history.length,
            aiQueries: history.filter(entry => entry.type === 'ai_query').length,
            effectsUsed: history.filter(entry => entry.type === 'effect_usage').length,
            layersModified: history.filter(entry => entry.type === 'layer_change').length,
            sessionDuration: Date.now() - this.contextData.session.startTime,
            topEffects: this.getTopEffects(),
            topCommands: this.getTopCommands(),
            learningProgress: Object.keys(this.learningData.commandPatterns).length
        };

        return stats;
    }

    /**
     * Get context summary for display
     */
    getContextSummary() {
        const stats = this.getContextStatistics();
        const context = this.getCurrentContext();

        return {
            project: context.project,
            session: {
                duration: Math.floor(stats.sessionDuration / 1000 / 60), // minutes
                actions: stats.totalActions,
                aiQueries: stats.aiQueries
            },
            preferences: this.contextData.preferences,
            topItems: {
                effects: stats.topEffects.slice(0, 3),
                commands: stats.topCommands.slice(0, 3)
            }
        };
    }

    /**
     * Cleanup on destruction
     */
    destroy() {
        if (this.contextUpdateTimer) {
            clearInterval(this.contextUpdateTimer);
        }

        // Save final state
        this.saveContextData();

        console.log('🧠 Context Awareness Module destroyed');
    }
}

// Export for global use
window.ContextAwarenessModule = ContextAwarenessModule;

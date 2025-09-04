/**
 * PROJECT ANALYSIS MODULE
 * Analyzes selected layers and understands project structure
 */

class ProjectAnalysisModule {
    constructor(aiModule, aeIntegration, contextAwarenessModule) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.contextAwarenessModule = contextAwarenessModule;
        this.selectedLayersCache = new Map();
        this.projectStructureCache = null;
        this.layerAnalysisHistory = [];
        this.projectInsights = {
            compositionPatterns: {},
            layerNamingPatterns: {},
            effectUsagePatterns: {},
            workflowPatterns: {}
        };

        this.init();
    }

    async init() {
        // Initialize project monitoring
        this.initializeProjectMonitoring();

        // Set up analysis triggers
        this.setupAnalysisTriggers();

        console.log('🔍 Project Analysis Module initialized');
    }

    /**
     * Initialize project monitoring
     */
    initializeProjectMonitoring() {
        if (!this.aeIntegration) return;

        // Monitor selection changes
        this.aeIntegration.onSelectionChange = (selection) => {
            this.updateSelectedLayersCache(selection);
            this.analyzeSelectedLayers(selection);
        };

        // Monitor project changes
        this.aeIntegration.onProjectChange = (projectData) => {
            this.updateProjectStructure(projectData);
            this.analyzeProjectStructure(projectData);
        };

        // Monitor composition changes
        this.aeIntegration.onCompositionChange = (compData) => {
            this.analyzeCompositionStructure(compData);
        };
    }

    /**
     * Setup analysis triggers
     */
    setupAnalysisTriggers() {
        // Keyboard shortcuts for analysis
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+L: Analyze selected layers
            if (event.ctrlKey && event.shiftKey && event.key === 'L') {
                event.preventDefault();
                this.analyzeSelectedLayers();
            }

            // Ctrl+Shift+P: Analyze project structure
            if (event.ctrlKey && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                this.analyzeProjectStructure();
            }
        });

        // Custom events
        document.addEventListener('analyzeSelectedLayers', () => {
            this.analyzeSelectedLayers();
        });

        document.addEventListener('analyzeProjectStructure', () => {
            this.analyzeProjectStructure();
        });
    }

    /**
     * Update selected layers cache
     */
    updateSelectedLayersCache(selection) {
        if (!selection) return;

        const cacheKey = Date.now();
        this.selectedLayersCache.set(cacheKey, {
            timestamp: cacheKey,
            layers: selection.layers || [],
            composition: selection.composition,
            count: selection.layers?.length || 0
        });

        // Keep only last 10 selections
        if (this.selectedLayersCache.size > 10) {
            const oldestKey = Math.min(...this.selectedLayersCache.keys());
            this.selectedLayersCache.delete(oldestKey);
        }
    }

    /**
     * Analyze selected layers
     */
    async analyzeSelectedLayers(selection = null) {
        try {
            if (!selection) {
                selection = await this.getCurrentSelection();
            }

            if (!selection || !selection.layers || selection.layers.length === 0) {
                this.showMessage('No layers selected for analysis');
                return;
            }

            console.log('🔍 Analyzing selected layers:', selection.layers.length);

            const analysis = {
                timestamp: Date.now(),
                layerCount: selection.layers.length,
                layers: [],
                summary: {},
                insights: {},
                recommendations: []
            };

            // Analyze each selected layer
            for (const layer of selection.layers) {
                const layerAnalysis = await this.analyzeIndividualLayer(layer);
                analysis.layers.push(layerAnalysis);
            }

            // Generate summary
            analysis.summary = this.generateLayerSummary(analysis.layers);

            // Generate insights
            analysis.insights = await this.generateLayerInsights(analysis.layers);

            // Generate recommendations
            analysis.recommendations = await this.generateLayerRecommendations(analysis.layers, analysis.insights);

            // Cache analysis
            this.layerAnalysisHistory.push(analysis);

            // Display results
            this.displayLayerAnalysis(analysis);

            // Update context awareness
            if (this.contextAwarenessModule) {
                this.contextAwarenessModule.trackAIQuery(`Analyzed ${selection.layers.length} selected layers`);
            }

            return analysis;

        } catch (error) {
            console.error('Selected layers analysis failed:', error);
            this.showError('Failed to analyze selected layers: ' + error.message);
        }
    }

    /**
     * Get current selection
     */
    async getCurrentSelection() {
        if (!this.aeIntegration) return null;

        try {
            const selection = await this.aeIntegration.getCurrentSelection();
            return selection;
        } catch (error) {
            console.warn('Failed to get current selection:', error);
            return null;
        }
    }

    /**
     * Analyze individual layer
     */
    async analyzeIndividualLayer(layer) {
        const analysis = {
            id: layer.id || layer.index,
            name: layer.name,
            type: layer.type,
            properties: {},
            effects: [],
            masks: [],
            metrics: {},
            issues: [],
            suggestions: []
        };

        try {
            // Basic properties
            analysis.properties = {
                visible: layer.visible !== false,
                locked: layer.locked || false,
                shy: layer.shy || false,
                solo: layer.solo || false,
                enabled: layer.enabled !== false,
                blendMode: layer.blendMode || 'Normal',
                opacity: layer.opacity || 100,
                position: layer.position || [0, 0, 0],
                scale: layer.scale || [100, 100, 100],
                rotation: layer.rotation || 0
            };

            // Effects analysis
            if (layer.effects && layer.effects.length > 0) {
                analysis.effects = layer.effects.map(effect => ({
                    name: effect.name,
                    enabled: effect.enabled !== false,
                    properties: this.summarizeEffectProperties(effect)
                }));
            }

            // Masks analysis
            if (layer.masks && layer.masks.length > 0) {
                analysis.masks = layer.masks.map(mask => ({
                    name: mask.name,
                    mode: mask.mode || 'Add',
                    inverted: mask.inverted || false
                }));
            }

            // Keyframe analysis
            analysis.metrics.keyframes = this.countLayerKeyframes(layer);

            // Complexity metrics
            analysis.metrics.complexity = this.calculateLayerComplexity(layer);

            // Issues detection
            analysis.issues = this.detectLayerIssues(layer);

            // AI-powered suggestions
            if (this.aiModule) {
                analysis.suggestions = await this.generateLayerSuggestions(layer);
            }

        } catch (error) {
            console.warn('Layer analysis failed for:', layer.name, error);
            analysis.error = error.message;
        }

        return analysis;
    }

    /**
     * Summarize effect properties
     */
    summarizeEffectProperties(effect) {
        const summary = {};

        if (effect.properties) {
            Object.entries(effect.properties).forEach(([key, value]) => {
                if (typeof value === 'number' || typeof value === 'string') {
                    summary[key] = value;
                } else if (Array.isArray(value)) {
                    summary[key] = value.length > 3 ? `${value.length} values` : value;
                }
            });
        }

        return summary;
    }

    /**
     * Count layer keyframes
     */
    countLayerKeyframes(layer) {
        let count = 0;

        if (layer.properties) {
            Object.values(layer.properties).forEach(prop => {
                if (prop && prop.keyframes) {
                    count += prop.keyframes.length;
                }
            });
        }

        return count;
    }

    /**
     * Calculate layer complexity
     */
    calculateLayerComplexity(layer) {
        let complexity = 0;

        // Effects contribute to complexity
        complexity += (layer.effects?.length || 0) * 3;

        // Masks add complexity
        complexity += (layer.masks?.length || 0) * 2;

        // Keyframes add complexity
        complexity += this.countLayerKeyframes(layer) * 0.5;

        // Blend modes add complexity
        if (layer.blendMode && layer.blendMode !== 'Normal') {
            complexity += 1;
        }

        // Parenting adds complexity
        if (layer.parent) {
            complexity += 1;
        }

        return Math.min(complexity, 100);
    }

    /**
     * Detect layer issues
     */
    detectLayerIssues(layer) {
        const issues = [];

        // Check for disabled effects
        const disabledEffects = layer.effects?.filter(e => e.enabled === false) || [];
        if (disabledEffects.length > 0) {
            issues.push({
                type: 'performance',
                severity: 'low',
                message: `${disabledEffects.length} disabled effects - consider removing`
            });
        }

        // Check for high complexity
        const complexity = this.calculateLayerComplexity(layer);
        if (complexity > 50) {
            issues.push({
                type: 'performance',
                severity: 'medium',
                message: `High complexity layer (${complexity}/100) - consider optimization`
            });
        }

        // Check for unused properties
        if (layer.opacity === 100 && !layer.properties?.opacity?.keyframes) {
            // This is fine, no issue
        }

        // Check for naming issues
        if (layer.name && (layer.name.includes('Layer') || layer.name.includes('Shape'))) {
            issues.push({
                type: 'workflow',
                severity: 'low',
                message: 'Generic layer name - consider descriptive naming'
            });
        }

        return issues;
    }

    /**
     * Generate layer suggestions
     */
    async generateLayerSuggestions(layer) {
        if (!this.aiModule) return [];

        try {
            const prompt = `Analyze this After Effects layer and provide specific suggestions:

Layer: ${layer.name}
Type: ${layer.type}
Effects: ${layer.effects?.map(e => e.name).join(', ') || 'None'}
Keyframes: ${this.countLayerKeyframes(layer)}
Complexity: ${this.calculateLayerComplexity(layer)}/100

Provide 2-3 actionable suggestions for improving this layer. Focus on:
- Performance optimizations
- Workflow improvements
- Creative enhancements

Format as array of suggestion objects with 'category', 'suggestion', and 'priority' fields.`;

            const aiResponse = await this.aiModule.generateResponse(prompt);
            const suggestions = this.parseAISuggestions(aiResponse);

            return suggestions;

        } catch (error) {
            console.warn('AI layer suggestions failed:', error);
            return [];
        }
    }

    /**
     * Parse AI suggestions
     */
    parseAISuggestions(response) {
        try {
            return JSON.parse(response);
        } catch {
            // Fallback parsing
            const lines = response.split('\n').filter(line => line.trim());
            return lines.slice(0, 3).map(line => ({
                category: 'general',
                suggestion: line.replace(/^[0-9]+\.\s*/, ''),
                priority: 'medium'
            }));
        }
    }

    /**
     * Generate layer summary
     */
    generateLayerSummary(layerAnalyses) {
        const summary = {
            totalLayers: layerAnalyses.length,
            layerTypes: {},
            totalEffects: 0,
            totalKeyframes: 0,
            averageComplexity: 0,
            issuesCount: 0
        };

        layerAnalyses.forEach(analysis => {
            // Count layer types
            const type = analysis.type || 'Unknown';
            summary.layerTypes[type] = (summary.layerTypes[type] || 0) + 1;

            // Sum effects and keyframes
            summary.totalEffects += analysis.effects?.length || 0;
            summary.totalKeyframes += analysis.metrics?.keyframes || 0;
            summary.averageComplexity += analysis.metrics?.complexity || 0;
            summary.issuesCount += analysis.issues?.length || 0;
        });

        summary.averageComplexity = summary.averageComplexity / layerAnalyses.length;

        return summary;
    }

    /**
     * Generate layer insights
     */
    async generateLayerInsights(layerAnalyses) {
        const insights = {
            patterns: {},
            correlations: {},
            recommendations: []
        };

        // Analyze patterns
        insights.patterns = this.analyzeLayerPatterns(layerAnalyses);

        // Find correlations
        insights.correlations = this.findLayerCorrelations(layerAnalyses);

        // Generate insights
        if (this.aiModule) {
            insights.aiInsights = await this.generateAIInsights(layerAnalyses);
        }

        return insights;
    }

    /**
     * Analyze layer patterns
     */
    analyzeLayerPatterns(layerAnalyses) {
        const patterns = {
            naming: {},
            effects: {},
            complexity: {}
        };

        layerAnalyses.forEach(analysis => {
            // Naming patterns
            const nameWords = analysis.name.toLowerCase().split(/\s+/);
            nameWords.forEach(word => {
                if (word.length > 3) {
                    patterns.naming[word] = (patterns.naming[word] || 0) + 1;
                }
            });

            // Effect patterns
            analysis.effects?.forEach(effect => {
                patterns.effects[effect.name] = (patterns.effects[effect.name] || 0) + 1;
            });

            // Complexity distribution
            const complexity = Math.floor((analysis.metrics?.complexity || 0) / 20) * 20;
            patterns.complexity[complexity] = (patterns.complexity[complexity] || 0) + 1;
        });

        return patterns;
    }

    /**
     * Find layer correlations
     */
    findLayerCorrelations(layerAnalyses) {
        const correlations = {
            effectCombinations: {},
            propertyRelationships: {}
        };

        // Find common effect combinations
        layerAnalyses.forEach(analysis => {
            if (analysis.effects && analysis.effects.length > 1) {
                const effectNames = analysis.effects.map(e => e.name).sort().join(' + ');
                correlations.effectCombinations[effectNames] = (correlations.effectCombinations[effectNames] || 0) + 1;
            }
        });

        return correlations;
    }

    /**
     * Generate AI insights
     */
    async generateAIInsights(layerAnalyses) {
        if (!this.aiModule) return [];

        try {
            const summary = this.generateLayerSummary(layerAnalyses);
            const prompt = `Analyze this layer selection and provide insights:

Summary:
- ${summary.totalLayers} layers selected
- ${summary.totalEffects} total effects
- ${summary.totalKeyframes} total keyframes
- Average complexity: ${summary.averageComplexity.toFixed(1)}/100
- Issues found: ${summary.issuesCount}

Layer types: ${Object.entries(summary.layerTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

Provide 3-4 key insights about this layer selection and suggestions for improvement.`;

            const aiResponse = await this.aiModule.generateResponse(prompt);
            return this.parseAIInsights(aiResponse);

        } catch (error) {
            console.warn('AI insights generation failed:', error);
            return [];
        }
    }

    /**
     * Parse AI insights
     */
    parseAIInsights(response) {
        try {
            return JSON.parse(response);
        } catch {
            return [response];
        }
    }

    /**
     * Generate layer recommendations
     */
    async generateLayerRecommendations(layerAnalyses, insights) {
        const recommendations = [];

        const summary = this.generateLayerSummary(layerAnalyses);

        // Performance recommendations
        if (summary.averageComplexity > 60) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'High Complexity Selection',
                description: 'Selected layers have high complexity. Consider pre-composing or optimizing effects.',
                action: 'Pre-compose selected layers'
            });
        }

        // Workflow recommendations
        if (summary.issuesCount > summary.totalLayers * 0.5) {
            recommendations.push({
                type: 'workflow',
                priority: 'medium',
                title: 'Multiple Layer Issues',
                description: `${summary.issuesCount} issues found across selected layers.`,
                action: 'Review and fix layer issues'
            });
        }

        // Effect optimization
        if (summary.totalEffects > summary.totalLayers * 2) {
            recommendations.push({
                type: 'optimization',
                priority: 'medium',
                title: 'Effect-Heavy Selection',
                description: 'Many effects applied. Consider consolidating or using adjustment layers.',
                action: 'Create adjustment layer for common effects'
            });
        }

        return recommendations;
    }

    /**
     * Analyze project structure
     */
    async analyzeProjectStructure(projectData = null) {
        try {
            if (!projectData) {
                projectData = await this.getProjectData();
            }

            if (!projectData) {
                this.showMessage('No project data available');
                return;
            }

            console.log('🔍 Analyzing project structure...');

            const analysis = {
                timestamp: Date.now(),
                project: {
                    name: projectData.name,
                    items: projectData.items || [],
                    compositions: [],
                    folders: [],
                    footage: []
                },
                structure: {},
                insights: {},
                recommendations: []
            };

            // Categorize project items
            this.categorizeProjectItems(projectData.items || [], analysis.project);

            // Analyze structure
            analysis.structure = this.analyzeProjectStructureDetails(analysis.project);

            // Generate insights
            analysis.insights = await this.generateProjectInsights(analysis.project);

            // Generate recommendations
            analysis.recommendations = this.generateProjectRecommendations(analysis.project, analysis.structure);

            // Cache project structure
            this.projectStructureCache = analysis;

            // Display results
            this.displayProjectAnalysis(analysis);

            return analysis;

        } catch (error) {
            console.error('Project structure analysis failed:', error);
            this.showError('Failed to analyze project structure: ' + error.message);
        }
    }

    /**
     * Get project data
     */
    async getProjectData() {
        if (!this.aeIntegration) return null;

        try {
            const projectData = await this.aeIntegration.getProjectData();
            return projectData;
        } catch (error) {
            console.warn('Failed to get project data:', error);
            return null;
        }
    }

    /**
     * Categorize project items
     */
    categorizeProjectItems(items, project) {
        items.forEach(item => {
            switch (item.type) {
                case 'composition':
                case 'CompItem':
                    project.compositions.push({
                        name: item.name,
                        duration: item.duration,
                        frameRate: item.frameRate,
                        width: item.width,
                        height: item.height,
                        layers: item.layers?.length || 0
                    });
                    break;

                case 'folder':
                case 'FolderItem':
                    project.folders.push({
                        name: item.name,
                        items: item.items?.length || 0
                    });
                    break;

                case 'footage':
                case 'FootageItem':
                    project.footage.push({
                        name: item.name,
                        file: item.file,
                        width: item.width,
                        height: item.height,
                        duration: item.duration
                    });
                    break;
            }
        });
    }

    /**
     * Analyze project structure details
     */
    analyzeProjectStructureDetails(project) {
        const structure = {
            totalItems: project.compositions.length + project.folders.length + project.footage.length,
            compositionCount: project.compositions.length,
            folderCount: project.folders.length,
            footageCount: project.footage.length,
            organization: {},
            patterns: {}
        };

        // Analyze organization
        structure.organization = {
            hasFolders: project.folders.length > 0,
            folderRatio: project.folders.length / Math.max(structure.totalItems, 1),
            averageLayersPerComp: project.compositions.reduce((sum, comp) => sum + comp.layers, 0) / Math.max(project.compositions.length, 1)
        };

        // Analyze patterns
        structure.patterns = {
            naming: this.analyzeNamingPatterns(project),
            resolution: this.analyzeResolutionPatterns(project.compositions),
            complexity: this.analyzeComplexityPatterns(project.compositions)
        };

        return structure;
    }

    /**
     * Analyze naming patterns
     */
    analyzeNamingPatterns(project) {
        const patterns = {
            composition: {},
            folder: {},
            footage: {}
        };

        // Analyze composition names
        project.compositions.forEach(comp => {
            const words = comp.name.toLowerCase().split(/\s+|_/);
            words.forEach(word => {
                if (word.length > 2) {
                    patterns.composition[word] = (patterns.composition[word] || 0) + 1;
                }
            });
        });

        // Similar analysis for folders and footage
        project.folders.forEach(folder => {
            const words = folder.name.toLowerCase().split(/\s+|_/);
            words.forEach(word => {
                if (word.length > 2) {
                    patterns.folder[word] = (patterns.folder[word] || 0) + 1;
                }
            });
        });

        return patterns;
    }

    /**
     * Analyze resolution patterns
     */
    analyzeResolutionPatterns(compositions) {
        const patterns = {};

        compositions.forEach(comp => {
            const resolution = `${comp.width}x${comp.height}`;
            patterns[resolution] = (patterns[resolution] || 0) + 1;
        });

        return patterns;
    }

    /**
     * Analyze complexity patterns
     */
    analyzeComplexityPatterns(compositions) {
        const patterns = {
            simple: 0,    // < 10 layers
            medium: 0,    // 10-50 layers
            complex: 0    // > 50 layers
        };

        compositions.forEach(comp => {
            const layers = comp.layers || 0;
            if (layers < 10) patterns.simple++;
            else if (layers < 50) patterns.medium++;
            else patterns.complex++;
        });

        return patterns;
    }

    /**
     * Generate project insights
     */
    async generateProjectInsights(project) {
        const insights = {
            organization: {},
            patterns: {},
            recommendations: []
        };

        // Organization insights
        if (project.folders.length === 0) {
            insights.organization.noFolders = 'Consider organizing project with folders';
        }

        if (project.compositions.length > 20) {
            insights.organization.manyComps = 'Large number of compositions - consider organizing into folders';
        }

        // Pattern insights
        const structure = this.analyzeProjectStructureDetails(project);
        if (Object.keys(structure.patterns.resolution).length > 3) {
            insights.patterns.mixedResolutions = 'Multiple resolutions detected - ensure consistency';
        }

        return insights;
    }

    /**
     * Generate project recommendations
     */
    generateProjectRecommendations(project, structure) {
        const recommendations = [];

        // Organization recommendations
        if (!structure.organization.hasFolders && structure.totalItems > 10) {
            recommendations.push({
                type: 'organization',
                priority: 'medium',
                title: 'Add Project Folders',
                description: 'Organize project items into logical folders for better management.',
                action: 'Create folders for compositions, footage, and assets'
            });
        }

        // Naming recommendations
        if (structure.patterns.naming.composition['comp'] > project.compositions.length * 0.5) {
            recommendations.push({
                type: 'naming',
                priority: 'low',
                title: 'Improve Naming Convention',
                description: 'Many compositions use generic names. Use descriptive names.',
                action: 'Rename compositions with descriptive names'
            });
        }

        // Complexity recommendations
        if (structure.organization.averageLayersPerComp > 30) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'High Layer Count',
                description: 'Compositions have many layers. Consider pre-composing.',
                action: 'Pre-compose complex layer groups'
            });
        }

        return recommendations;
    }

    /**
     * Display layer analysis
     */
    displayLayerAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'layer-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🔍 Selected Layers Analysis</h3>

                <div class="analysis-summary">
                    <div class="summary-grid">
                        <div>Layers: ${analysis.layerCount}</div>
                        <div>Total Effects: ${analysis.summary.totalEffects}</div>
                        <div>Total Keyframes: ${analysis.summary.totalKeyframes}</div>
                        <div>Avg Complexity: ${analysis.summary.averageComplexity.toFixed(1)}/100</div>
                    </div>
                </div>

                <div class="layer-details">
                    <h4>Layer Details</h4>
                    ${analysis.layers.map(layer => `
                        <div class="layer-item">
                            <div class="layer-header">
                                <strong>${layer.name}</strong>
                                <span class="layer-type">${layer.type}</span>
                                <span class="complexity">Complexity: ${layer.metrics.complexity}/100</span>
                            </div>
                            <div class="layer-info">
                                <span>Effects: ${layer.effects.length}</span>
                                <span>Keyframes: ${layer.metrics.keyframes}</span>
                                ${layer.issues.length > 0 ? `<span class="issues">Issues: ${layer.issues.length}</span>` : ''}
                            </div>
                            ${layer.suggestions.length > 0 ? `
                                <div class="suggestions">
                                    ${layer.suggestions.map(s => `<div class="suggestion">${s.suggestion}</div>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                ${analysis.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h4>Recommendations</h4>
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation priority-${rec.priority}">
                            <strong>${rec.title}</strong>
                            <p>${rec.description}</p>
                            <button onclick="console.log('Action: ${rec.action}')">${rec.action}</button>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    <button onclick="window.projectAnalysisModule.exportLayerAnalysis()">Export Analysis</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Display project analysis
     */
    displayProjectAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'project-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📊 Project Structure Analysis</h3>

                <div class="project-summary">
                    <h4>Project: ${analysis.project.name}</h4>
                    <div class="summary-grid">
                        <div>Compositions: ${analysis.project.compositions.length}</div>
                        <div>Folders: ${analysis.project.folders.length}</div>
                        <div>Footage: ${analysis.project.footage.length}</div>
                        <div>Total Items: ${analysis.structure.totalItems}</div>
                    </div>
                </div>

                <div class="structure-details">
                    <h4>Structure Details</h4>
                    <div class="detail-grid">
                        <div>Avg Layers/Comp: ${analysis.structure.organization.averageLayersPerComp.toFixed(1)}</div>
                        <div>Organization: ${analysis.structure.organization.hasFolders ? 'Well organized' : 'Needs folders'}</div>
                    </div>
                </div>

                ${analysis.recommendations.length > 0 ? `
                <div class="project-recommendations">
                    <h4>Project Recommendations</h4>
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation priority-${rec.priority}">
                            <strong>${rec.title}</strong>
                            <p>${rec.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    <button onclick="window.projectAnalysisModule.exportProjectAnalysis()">Export Analysis</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Export layer analysis
     */
    exportLayerAnalysis() {
        const latestAnalysis = this.layerAnalysisHistory[this.layerAnalysisHistory.length - 1];
        if (!latestAnalysis) return;

        const data = JSON.stringify(latestAnalysis, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `layer-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Layer analysis exported');
    }

    /**
     * Export project analysis
     */
    exportProjectAnalysis() {
        if (!this.projectStructureCache) return;

        const data = JSON.stringify(this.projectStructureCache, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `project-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Project analysis exported');
    }

    /**
     * Update project structure
     */
    updateProjectStructure(projectData) {
        this.projectStructureCache = {
            timestamp: Date.now(),
            project: projectData
        };
    }

    /**
     * Analyze composition structure
     */
    async analyzeCompositionStructure(compData) {
        if (!compData) return;

        const analysis = {
            name: compData.name,
            layers: compData.layers || [],
            structure: {},
            insights: []
        };

        // Analyze layer hierarchy
        analysis.structure.hierarchy = this.analyzeLayerHierarchy(compData.layers);

        // Analyze layer relationships
        analysis.structure.relationships = this.analyzeLayerRelationships(compData.layers);

        // Generate composition insights
        analysis.insights = await this.generateCompositionInsights(compData);

        console.log('📋 Composition structure analyzed:', analysis);
        return analysis;
    }

    /**
     * Analyze layer hierarchy
     */
    analyzeLayerHierarchy(layers) {
        const hierarchy = {
            rootLayers: 0,
            parentedLayers: 0,
            maxDepth: 0,
            hierarchyMap: {}
        };

        layers.forEach(layer => {
            if (layer.parent) {
                hierarchy.parentedLayers++;
            } else {
                hierarchy.rootLayers++;
            }
        });

        return hierarchy;
    }

    /**
     * Analyze layer relationships
     */
    analyzeLayerRelationships(layers) {
        const relationships = {
            blends: {},
            effects: {},
            masks: {}
        };

        layers.forEach(layer => {
            // Track blend modes
            const blend = layer.blendMode || 'Normal';
            relationships.blends[blend] = (relationships.blends[blend] || 0) + 1;

            // Track effects
            layer.effects?.forEach(effect => {
                relationships.effects[effect.name] = (relationships.effects[effect.name] || 0) + 1;
            });

            // Track masks
            if (layer.masks) {
                relationships.masks[layer.name] = layer.masks.length;
            }
        });

        return relationships;
    }

    /**
     * Generate composition insights
     */
    async generateCompositionInsights(compData) {
        const insights = [];

        const layers = compData.layers || [];
        const hierarchy = this.analyzeLayerHierarchy(layers);

        if (hierarchy.parentedLayers > layers.length * 0.7) {
            insights.push('Complex layer hierarchy - consider simplifying parent relationships');
        }

        if (layers.length > 50) {
            insights.push('Large composition - consider breaking into smaller comps');
        }

        return insights;
    }

    /**
     * Show message to user
     */
    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'project-analysis-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'project-analysis-error';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 5000);
    }

    /**
     * Get analysis history
     */
    getAnalysisHistory() {
        return {
            layerAnalyses: this.layerAnalysisHistory,
            projectAnalysis: this.projectStructureCache
        };
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.selectedLayersCache.clear();
        this.layerAnalysisHistory.length = 0;
        this.projectStructureCache = null;
        console.log('🧹 Project analysis cache cleared');
    }
}

// Export for global use
window.ProjectAnalysisModule = ProjectAnalysisModule;

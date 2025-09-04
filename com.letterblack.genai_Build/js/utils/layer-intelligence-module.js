/**
 * LAYER INTELLIGENCE MODULE
 * Analyzes layer properties and suggests optimizations
 */

class LayerIntelligenceModule {
    constructor(aiModule, aeIntegration) {
        this.aiModule = aiModule;
        this.aeIntegration = aeIntegration;
        this.layerCache = new Map();
        this.analysisCache = new Map();
        this.optimizationRules = this.initializeOptimizationRules();
        this.performanceMetrics = {
            analysisTime: 0,
            suggestionsGenerated: 0,
            optimizationsApplied: 0
        };

        this.init();
    }

    async init() {
        // Initialize layer monitoring
        this.initializeLayerMonitoring();

        // Set up analysis triggers
        this.setupAnalysisTriggers();

        console.log('🧠 Layer Intelligence Module initialized');
    }

    /**
     * Initialize optimization rules
     */
    initializeOptimizationRules() {
        return {
            performance: {
                // Layer count optimization
                maxLayers: {
                    threshold: 50,
                    suggestion: 'Consider pre-composing layers to reduce complexity',
                    severity: 'high'
                },

                // Effect stacking
                maxEffectsPerLayer: {
                    threshold: 5,
                    suggestion: 'Multiple effects on one layer - consider pre-composing',
                    severity: 'medium'
                },

                // Resolution optimization
                oversizedFootage: {
                    threshold: 2.0, // 2x comp size
                    suggestion: 'Footage resolution much larger than comp - consider scaling down',
                    severity: 'medium'
                }
            },

            quality: {
                // Motion blur consistency
                motionBlurMismatch: {
                    suggestion: 'Motion blur settings inconsistent across layers',
                    severity: 'low'
                },

                // Frame rate alignment
                frameRateMismatch: {
                    suggestion: 'Layer frame rates don\'t match composition',
                    severity: 'high'
                },

                // Color space consistency
                colorSpaceMismatch: {
                    suggestion: 'Mixed color spaces detected - ensure consistency',
                    severity: 'medium'
                }
            },

            workflow: {
                // Naming conventions
                poorNaming: {
                    patterns: ['layer', 'shape', 'solid', 'null'],
                    suggestion: 'Use descriptive layer names for better organization',
                    severity: 'low'
                },

                // Unused layers
                unusedLayers: {
                    suggestion: 'Unused layers detected - consider removing to optimize project',
                    severity: 'low'
                },

                // Missing keyframes
                staticLayers: {
                    suggestion: 'Static layers could be optimized or removed',
                    severity: 'low'
                }
            }
        };
    }

    /**
     * Initialize layer monitoring
     */
    initializeLayerMonitoring() {
        if (!this.aeIntegration) return;

        // Monitor layer changes
        this.aeIntegration.onLayerChange = (layerData) => {
            this.updateLayerCache(layerData);
            this.analyzeLayer(layerData);
        };

        // Monitor composition changes
        this.aeIntegration.onCompositionChange = (compData) => {
            this.analyzeCompositionLayers(compData);
        };
    }

    /**
     * Setup analysis triggers
     */
    setupAnalysisTriggers() {
        // Auto-analyze on layer selection
        document.addEventListener('layerSelected', (event) => {
            this.analyzeSelectedLayer(event.detail);
        });

        // Manual analysis trigger
        document.addEventListener('analyzeLayers', () => {
            this.performFullAnalysis();
        });

        // Optimization trigger
        document.addEventListener('optimizeLayers', () => {
            this.applyOptimizations();
        });
    }

    /**
     * Update layer cache
     */
    updateLayerCache(layerData) {
        const layerId = layerData.id || layerData.index;
        this.layerCache.set(layerId, {
            ...layerData,
            lastUpdated: Date.now(),
            analysisTimestamp: null
        });
    }

    /**
     * Analyze single layer
     */
    async analyzeLayer(layerData) {
        const startTime = performance.now();

        try {
            const layerId = layerData.id || layerData.index;
            const analysis = {
                id: layerId,
                timestamp: Date.now(),
                issues: [],
                suggestions: [],
                optimizations: [],
                metrics: {}
            };

            // Basic layer metrics
            analysis.metrics = this.calculateLayerMetrics(layerData);

            // Performance analysis
            const performanceIssues = this.analyzePerformance(layerData);
            analysis.issues.push(...performanceIssues);

            // Quality analysis
            const qualityIssues = this.analyzeQuality(layerData);
            analysis.issues.push(...qualityIssues);

            // Workflow analysis
            const workflowIssues = this.analyzeWorkflow(layerData);
            analysis.issues.push(...workflowIssues);

            // Generate AI-powered suggestions
            if (this.aiModule) {
                const aiSuggestions = await this.generateAISuggestions(layerData, analysis);
                analysis.suggestions.push(...aiSuggestions);
            }

            // Generate optimizations
            analysis.optimizations = this.generateOptimizations(analysis);

            // Cache analysis
            this.analysisCache.set(layerId, analysis);

            // Update performance metrics
            this.performanceMetrics.analysisTime += performance.now() - startTime;
            this.performanceMetrics.suggestionsGenerated += analysis.suggestions.length;

            console.log(`🔍 Layer ${layerId} analyzed:`, analysis);

            // Emit analysis complete event
            this.emitAnalysisComplete(analysis);

            return analysis;

        } catch (error) {
            console.error('Layer analysis failed:', error);
            return null;
        }
    }

    /**
     * Calculate layer metrics
     */
    calculateLayerMetrics(layerData) {
        const metrics = {
            effectCount: layerData.effects?.length || 0,
            keyframeCount: this.countKeyframes(layerData),
            hasMotionBlur: layerData.motionBlur || false,
            hasMask: layerData.masks?.length > 0 || false,
            hasParent: !!layerData.parent,
            isVisible: layerData.visible !== false,
            opacity: layerData.opacity || 100,
            blendMode: layerData.blendMode || 'Normal'
        };

        // Calculate complexity score
        metrics.complexityScore = this.calculateComplexityScore(metrics);

        return metrics;
    }

    /**
     * Count keyframes in layer
     */
    countKeyframes(layerData) {
        let count = 0;

        if (layerData.properties) {
            Object.values(layerData.properties).forEach(prop => {
                if (prop.keyframes) {
                    count += prop.keyframes.length;
                }
            });
        }

        return count;
    }

    /**
     * Calculate complexity score
     */
    calculateComplexityScore(metrics) {
        let score = 0;

        // Effects contribute to complexity
        score += metrics.effectCount * 2;

        // Keyframes contribute to complexity
        score += metrics.keyframeCount * 0.5;

        // Masks add complexity
        if (metrics.hasMask) score += 3;

        // Motion blur adds complexity
        if (metrics.hasMotionBlur) score += 2;

        // Blend modes add complexity
        if (metrics.blendMode !== 'Normal') score += 1;

        return Math.min(score, 100);
    }

    /**
     * Analyze performance issues
     */
    analyzePerformance(layerData) {
        const issues = [];
        const metrics = this.calculateLayerMetrics(layerData);
        const rules = this.optimizationRules.performance;

        // Check effect count
        if (metrics.effectCount > rules.maxEffectsPerLayer.threshold) {
            issues.push({
                type: 'performance',
                rule: 'maxEffectsPerLayer',
                severity: rules.maxEffectsPerLayer.severity,
                message: rules.maxEffectsPerLayer.suggestion,
                data: { effectCount: metrics.effectCount }
            });
        }

        // Check for oversized footage
        if (layerData.sourceSize && layerData.compSize) {
            const scaleRatio = Math.max(
                layerData.sourceSize.width / layerData.compSize.width,
                layerData.sourceSize.height / layerData.compSize.height
            );

            if (scaleRatio > rules.oversizedFootage.threshold) {
                issues.push({
                    type: 'performance',
                    rule: 'oversizedFootage',
                    severity: rules.oversizedFootage.severity,
                    message: rules.oversizedFootage.suggestion,
                    data: { scaleRatio: scaleRatio.toFixed(2) }
                });
            }
        }

        return issues;
    }

    /**
     * Analyze quality issues
     */
    analyzeQuality(layerData) {
        const issues = [];
        const rules = this.optimizationRules.quality;

        // Check motion blur consistency
        if (layerData.motionBlur !== undefined) {
            // Compare with composition setting (would need comp data)
            // This is a placeholder for more complex analysis
        }

        // Check frame rate
        if (layerData.frameRate && layerData.compFrameRate) {
            if (Math.abs(layerData.frameRate - layerData.compFrameRate) > 0.1) {
                issues.push({
                    type: 'quality',
                    rule: 'frameRateMismatch',
                    severity: rules.frameRateMismatch.severity,
                    message: rules.frameRateMismatch.suggestion,
                    data: {
                        layerFrameRate: layerData.frameRate,
                        compFrameRate: layerData.compFrameRate
                    }
                });
            }
        }

        return issues;
    }

    /**
     * Analyze workflow issues
     */
    analyzeWorkflow(layerData) {
        const issues = [];
        const rules = this.optimizationRules.workflow;

        // Check naming conventions
        if (layerData.name) {
            const name = layerData.name.toLowerCase();
            const poorPatterns = rules.poorNaming.patterns;

            if (poorPatterns.some(pattern => name.includes(pattern))) {
                issues.push({
                    type: 'workflow',
                    rule: 'poorNaming',
                    severity: rules.poorNaming.severity,
                    message: rules.poorNaming.suggestion,
                    data: { currentName: layerData.name }
                });
            }
        }

        // Check for static layers
        const metrics = this.calculateLayerMetrics(layerData);
        if (metrics.keyframeCount === 0 && metrics.effectCount === 0) {
            issues.push({
                type: 'workflow',
                rule: 'staticLayers',
                severity: rules.staticLayers.severity,
                message: rules.staticLayers.suggestion,
                data: { layerName: layerData.name }
            });
        }

        return issues;
    }

    /**
     * Generate AI-powered suggestions
     */
    async generateAISuggestions(layerData, analysis) {
        if (!this.aiModule) return [];

        try {
            const prompt = `Analyze this After Effects layer and provide optimization suggestions:

Layer Info:
- Name: ${layerData.name || 'Unnamed'}
- Type: ${layerData.type || 'Unknown'}
- Effects: ${layerData.effects?.map(e => e.name).join(', ') || 'None'}
- Keyframes: ${analysis.metrics.keyframeCount}
- Complexity Score: ${analysis.metrics.complexityScore}/100

Current Issues: ${analysis.issues.map(i => i.message).join('; ') || 'None'}

Please provide 2-3 specific, actionable suggestions for optimizing this layer. Focus on:
1. Performance improvements
2. Workflow enhancements
3. Creative optimizations

Format as JSON array of suggestion objects with 'category', 'suggestion', and 'impact' fields.`;

            const aiResponse = await this.aiModule.generateResponse(prompt);
            const suggestions = this.parseAISuggestions(aiResponse);

            return suggestions;

        } catch (error) {
            console.warn('AI suggestion generation failed:', error);
            return [];
        }
    }

    /**
     * Parse AI suggestions
     */
    parseAISuggestions(response) {
        try {
            const suggestions = JSON.parse(response);
            return Array.isArray(suggestions) ? suggestions : [];
        } catch {
            // Fallback parsing for non-JSON responses
            const lines = response.split('\n').filter(line => line.trim());
            return lines.map(line => ({
                category: 'general',
                suggestion: line.replace(/^[0-9]+\.\s*/, ''),
                impact: 'medium'
            }));
        }
    }

    /**
     * Generate optimizations from analysis
     */
    generateOptimizations(analysis) {
        const optimizations = [];

        analysis.issues.forEach(issue => {
            const optimization = {
                type: issue.type,
                rule: issue.rule,
                description: issue.message,
                severity: issue.severity,
                automated: this.canAutomateOptimization(issue),
                script: this.generateOptimizationScript(issue)
            };

            optimizations.push(optimization);
        });

        return optimizations;
    }

    /**
     * Check if optimization can be automated
     */
    canAutomateOptimization(issue) {
        const automatableRules = [
            'maxEffectsPerLayer',
            'oversizedFootage',
            'poorNaming'
        ];

        return automatableRules.includes(issue.rule);
    }

    /**
     * Generate optimization script
     */
    generateOptimizationScript(issue) {
        switch (issue.rule) {
            case 'maxEffectsPerLayer':
                return `// Pre-compose effects
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    var precomp = comp.layers.precompose([layer], "Effects Pre-comp", true);
}`;

            case 'oversizedFootage':
                return `// Scale down footage
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    layer.property("Scale").setValue([50, 50]);
}`;

            case 'poorNaming':
                return `// Rename layer
var comp = app.project.activeItem;
if (comp && comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    layer.name = "Optimized Layer " + layer.index;
}`;

            default:
                return null;
        }
    }

    /**
     * Analyze selected layer
     */
    async analyzeSelectedLayer(layerData) {
        const analysis = await this.analyzeLayer(layerData);
        if (analysis) {
            this.displayLayerAnalysis(analysis);
        }
    }

    /**
     * Perform full composition analysis
     */
    async performFullAnalysis() {
        if (!this.aeIntegration) return;

        try {
            console.log('🔍 Performing full composition analysis...');

            const compData = await this.aeIntegration.getCompositionData();
            if (!compData) return;

            const fullAnalysis = {
                composition: compData,
                layers: [],
                summary: {},
                timestamp: Date.now()
            };

            // Analyze all layers
            for (const layer of compData.layers || []) {
                const layerAnalysis = await this.analyzeLayer(layer);
                if (layerAnalysis) {
                    fullAnalysis.layers.push(layerAnalysis);
                }
            }

            // Generate summary
            fullAnalysis.summary = this.generateAnalysisSummary(fullAnalysis.layers);

            console.log('📊 Full analysis complete:', fullAnalysis);
            this.displayFullAnalysis(fullAnalysis);

            return fullAnalysis;

        } catch (error) {
            console.error('Full analysis failed:', error);
        }
    }

    /**
     * Generate analysis summary
     */
    generateAnalysisSummary(layerAnalyses) {
        const summary = {
            totalLayers: layerAnalyses.length,
            issuesByType: {},
            issuesBySeverity: {},
            averageComplexity: 0,
            optimizationOpportunities: 0
        };

        let totalComplexity = 0;

        layerAnalyses.forEach(analysis => {
            totalComplexity += analysis.metrics.complexityScore;

            analysis.issues.forEach(issue => {
                // Count by type
                summary.issuesByType[issue.type] = (summary.issuesByType[issue.type] || 0) + 1;

                // Count by severity
                summary.issuesBySeverity[issue.severity] = (summary.issuesBySeverity[issue.severity] || 0) + 1;
            });

            summary.optimizationOpportunities += analysis.optimizations.length;
        });

        summary.averageComplexity = totalComplexity / layerAnalyses.length;

        return summary;
    }

    /**
     * Apply optimizations
     */
    async applyOptimizations() {
        const analyses = Array.from(this.analysisCache.values());
        const automatableOptimizations = [];

        analyses.forEach(analysis => {
            analysis.optimizations.forEach(opt => {
                if (opt.automated && opt.script) {
                    automatableOptimizations.push(opt);
                }
            });
        });

        if (automatableOptimizations.length === 0) {
            this.showMessage('No automatable optimizations found');
            return;
        }

        // Show optimization preview
        this.displayOptimizationPreview(automatableOptimizations);

        // Apply optimizations
        for (const opt of automatableOptimizations) {
            try {
                await this.aeIntegration.runScript(opt.script);
                this.performanceMetrics.optimizationsApplied++;
                console.log(`✅ Applied optimization: ${opt.description}`);
            } catch (error) {
                console.error(`❌ Failed to apply optimization: ${opt.description}`, error);
            }
        }

        this.showMessage(`Applied ${this.performanceMetrics.optimizationsApplied} optimizations`);
    }

    /**
     * Analyze composition layers
     */
    async analyzeCompositionLayers(compData) {
        const layerCount = compData.layers?.length || 0;
        const rules = this.optimizationRules.performance;

        if (layerCount > rules.maxLayers.threshold) {
            const issue = {
                type: 'performance',
                rule: 'maxLayers',
                severity: rules.maxLayers.severity,
                message: rules.maxLayers.suggestion,
                data: { layerCount }
            };

            this.emitIssueDetected(issue);
        }
    }

    /**
     * Display layer analysis
     */
    displayLayerAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'layer-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🧠 Layer Analysis: ${analysis.id}</h3>

                <div class="metrics-section">
                    <h4>Metrics</h4>
                    <div class="metrics-grid">
                        <div>Effects: ${analysis.metrics.effectCount}</div>
                        <div>Keyframes: ${analysis.metrics.keyframeCount}</div>
                        <div>Complexity: ${analysis.metrics.complexityScore}/100</div>
                        <div>Visible: ${analysis.metrics.isVisible ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                ${analysis.issues.length > 0 ? `
                <div class="issues-section">
                    <h4>Issues Found (${analysis.issues.length})</h4>
                    ${analysis.issues.map(issue => `
                        <div class="issue-item severity-${issue.severity}">
                            <strong>${issue.type}:</strong> ${issue.message}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${analysis.suggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h4>AI Suggestions</h4>
                    ${analysis.suggestions.map(suggestion => `
                        <div class="suggestion-item">
                            <strong>${suggestion.category}:</strong> ${suggestion.suggestion}
                            <span class="impact">Impact: ${suggestion.impact}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    ${analysis.optimizations.some(opt => opt.automated) ?
                        '<button onclick="window.layerIntelligenceModule.applyOptimizations()">Apply Optimizations</button>' : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Display full analysis
     */
    displayFullAnalysis(analysis) {
        const modal = document.createElement('div');
        modal.className = 'full-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📊 Composition Analysis Summary</h3>

                <div class="summary-section">
                    <div class="summary-grid">
                        <div>Total Layers: ${analysis.summary.totalLayers}</div>
                        <div>Avg Complexity: ${analysis.summary.averageComplexity.toFixed(1)}/100</div>
                        <div>Optimization Opportunities: ${analysis.summary.optimizationOpportunities}</div>
                    </div>
                </div>

                <div class="issues-breakdown">
                    <h4>Issues by Type</h4>
                    ${Object.entries(analysis.summary.issuesByType).map(([type, count]) =>
                        `<div>${type}: ${count}</div>`
                    ).join('')}
                </div>

                <div class="issues-breakdown">
                    <h4>Issues by Severity</h4>
                    ${Object.entries(analysis.summary.issuesBySeverity).map(([severity, count]) =>
                        `<div class="${severity}">${severity}: ${count}</div>`
                    ).join('')}
                </div>

                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Display optimization preview
     */
    displayOptimizationPreview(optimizations) {
        const modal = document.createElement('div');
        modal.className = 'optimization-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🔧 Optimization Preview</h3>
                <p>Ready to apply ${optimizations.length} automatable optimizations:</p>

                <div class="optimization-list">
                    ${optimizations.map(opt => `
                        <div class="optimization-item">
                            <strong>${opt.type}:</strong> ${opt.description}
                            <span class="severity-${opt.severity}">(${opt.severity})</span>
                        </div>
                    `).join('')}
                </div>

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Cancel</button>
                    <button onclick="window.layerIntelligenceModule.confirmApplyOptimizations()">Apply All</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Confirm and apply optimizations
     */
    async confirmApplyOptimizations() {
        // Close preview modal
        document.querySelector('.optimization-preview-modal')?.remove();

        // Apply optimizations
        await this.applyOptimizations();
    }

    /**
     * Emit analysis complete event
     */
    emitAnalysisComplete(analysis) {
        const event = new CustomEvent('layerAnalysisComplete', { detail: analysis });
        document.dispatchEvent(event);
    }

    /**
     * Emit issue detected event
     */
    emitIssueDetected(issue) {
        const event = new CustomEvent('layerIssueDetected', { detail: issue });
        document.dispatchEvent(event);
    }

    /**
     * Show message to user
     */
    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'layer-intelligence-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Get layer analysis by ID
     */
    getLayerAnalysis(layerId) {
        return this.analysisCache.get(layerId);
    }

    /**
     * Get all cached analyses
     */
    getAllAnalyses() {
        return Array.from(this.analysisCache.values());
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
        this.layerCache.clear();
        console.log('🧹 Layer intelligence cache cleared');
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            cacheSize: this.analysisCache.size,
            averageAnalysisTime: this.performanceMetrics.analysisTime / Math.max(this.analysisCache.size, 1)
        };
    }

    /**
     * Export analysis data
     */
    exportAnalysisData() {
        const exportData = {
            analyses: Array.from(this.analysisCache.entries()),
            metrics: this.getPerformanceMetrics(),
            timestamp: Date.now()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `layer-analysis-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Layer analysis data exported');
    }
}

// Export for global use
window.LayerIntelligenceModule = LayerIntelligenceModule;

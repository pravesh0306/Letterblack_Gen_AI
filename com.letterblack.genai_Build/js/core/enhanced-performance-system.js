/**
 * Enhanced Performance System - JavaScript Implementation
 * Advanced performance monitoring with intelligent insights.
 * Ported from TypeScript version with practical simplifications.
 */

class EnhancedPerformanceSystem {
    constructor() {
        this.version = '1.0.1';
        this.initialized = false;
        this.behaviorHistory = [];
        this.performanceHistory = [];
        this.analyticsConfig = {
            patternThreshold: 0.7,
            anomalyThreshold: 2.0,
            correlationThreshold: 0.6,
            predictionConfidence: 0.85
        };
        
        console.log('🚀 Initializing Enhanced Performance System...');
        this.initializeSystem();
    }

    /**
     * Initialize the performance monitoring system
     */
    initializeSystem() {
        this.baseMonitor = this.createBaseMonitor();
        this.startPerformanceTracking();
        this.initialized = true;
        console.log('✅ Enhanced Performance System initialized');
    }

    /**
     * Create base performance monitor
     */
    createBaseMonitor() {
        return {
            generateReport: () => {
                const memoryInfo = this.getMemoryInfo();
                const renderingInfo = this.getRenderingInfo();
                const errorInfo = this.getErrorInfo();
                const moduleInfo = this.getModuleInfo();

                return {
                    score: this.calculateOverallScore(memoryInfo, renderingInfo, errorInfo),
                    status: this.getHealthStatus(),
                    memory: memoryInfo,
                    rendering: renderingInfo,
                    errors: errorInfo,
                    moduleLoading: moduleInfo,
                    timestamp: Date.now()
                };
            }
        };
    }

    /**
     * Get memory performance information
     */
    getMemoryInfo() {
        const memInfo = {
            isHealthy: true,
            current: 0,
            limit: 0,
            growthMB: 0
        };

        // Use Performance API if available
        if (performance.memory) {
            const memory = performance.memory;
            memInfo.current = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            memInfo.limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
            memInfo.growthMB = Math.round((memory.usedJSHeapSize - memory.totalJSHeapSize) / 1024 / 1024);
            memInfo.isHealthy = memInfo.current < (memInfo.limit * 0.8);
        }

        return memInfo;
    }

    /**
     * Get rendering performance information
     */
    getRenderingInfo() {
        const renderInfo = {
            isSmooth: true,
            averageFrameTime: 16.67, // 60fps target
            frameDrops: 0
        };

        // Monitor frame timing if available
        if (performance.now) {
            const entries = performance.getEntriesByType('navigation');
            if (entries.length > 0) {
                renderInfo.averageFrameTime = entries[0].loadEventEnd - entries[0].loadEventStart;
                renderInfo.isSmooth = renderInfo.averageFrameTime < 20;
            }
        }

        return renderInfo;
    }

    /**
     * Get error information
     */
    getErrorInfo() {
        return {
            isClean: window.errorCount ? window.errorCount < 3 : true,
            total: window.errorCount || 0,
            recent: window.recentErrors || []
        };
    }

    /**
     * Get module loading information
     */
    getModuleInfo() {
        const moduleInfo = {
            averageLoadTime: 300,
            totalModules: 0,
            failedModules: 0
        };

        // Get info from ModuleMonitor if available
        if (window.moduleMonitor) {
            const report = window.moduleMonitor.getPerformanceReport();
            moduleInfo.averageLoadTime = report.averageLoadTime;
            moduleInfo.totalModules = report.totalModules;
            moduleInfo.failedModules = report.failedLoads;
        }

        return moduleInfo;
    }

    /**
     * Calculate overall performance score
     */
    calculateOverallScore(memory, rendering, errors) {
        let score = 100;

        // Memory impact
        if (!memory.isHealthy) score -= 20;
        if (memory.current > (memory.limit * 0.9)) score -= 10;

        // Rendering impact
        if (!rendering.isSmooth) score -= 15;
        if (rendering.averageFrameTime > 33) score -= 10;

        // Error impact
        if (!errors.isClean) score -= 25;
        score -= Math.min(errors.total * 5, 30);

        return Math.max(score, 0);
    }

    /**
     * Get health status based on score
     */
    getHealthStatus() {
        // Get current metrics to calculate score
        const memoryInfo = this.getMemoryInfo();
        const renderingInfo = this.getRenderingInfo();
        const errorInfo = this.getErrorInfo();
        
        const score = this.calculateOverallScore(memoryInfo, renderingInfo, errorInfo);
        if (score >= 80) return 'EXCELLENT';
        if (score >= 60) return 'GOOD';
        if (score >= 40) return 'FAIR';
        return 'POOR';
    }

    /**
     * Analyze performance patterns
     */
    analyzePatterns(metrics) {
        const patterns = [];
        const anomalies = [];

        // Memory growth pattern
        if (metrics.memory.growthMB > 10) {
            patterns.push({
                type: 'memory_growth',
                severity: 'medium',
                description: 'Increasing memory usage detected',
                confidence: 0.8
            });
        }

        // Rendering issues
        if (!metrics.rendering.isSmooth) {
            patterns.push({
                type: 'rendering_lag',
                severity: 'high',
                description: 'Frame timing issues detected',
                confidence: 0.9
            });
        }

        // Error accumulation
        if (metrics.errors.total > 5) {
            anomalies.push({
                metric: 'errors',
                type: 'error_accumulation',
                severity: 'high',
                description: 'High error count detected',
                currentValue: metrics.errors.total,
                threshold: 5,
                deviation: metrics.errors.total - 5
            });
        }

        return { patterns, anomalies };
    }

    /**
     * Generate performance predictions
     */
    generatePredictions(metrics, insights) {
        const predictions = [];

        // Memory prediction
        if (metrics.memory.growthMB > 5) {
            predictions.push({
                type: 'memory_exhaustion',
                timeframe: '10-15 minutes',
                confidence: 0.75,
                impact: 'high',
                description: 'Memory usage may reach critical levels'
            });
        }

        // Performance degradation
        if (insights.patterns.length > 2) {
            predictions.push({
                type: 'performance_degradation',
                timeframe: '5-10 minutes',
                confidence: 0.65,
                impact: 'medium',
                description: 'Overall performance may decline'
            });
        }

        return predictions;
    }

    /**
     * Generate optimization recommendations
     */
    generateOptimizations(metrics, insights) {
        const optimizations = [];

        // Memory optimizations
        if (metrics.memory.current > (metrics.memory.limit * 0.7)) {
            optimizations.push({
                category: 'memory',
                action: 'Clear unused data structures',
                impact: 'high',
                effort: 'low',
                description: 'Free up memory by clearing caches and unused objects'
            });
        }

        // Rendering optimizations
        if (!metrics.rendering.isSmooth) {
            optimizations.push({
                category: 'rendering',
                action: 'Reduce DOM updates',
                impact: 'medium',
                effort: 'medium',
                description: 'Batch DOM updates to improve frame timing'
            });
        }

        // Module optimizations
        if (metrics.moduleLoading.averageLoadTime > 500) {
            optimizations.push({
                category: 'loading',
                action: 'Optimize module loading',
                impact: 'medium',
                effort: 'high',
                description: 'Consider lazy loading or module bundling'
            });
        }

        return optimizations;
    }

    /**
     * Get intelligent performance metrics
     */
    async getIntelligentMetrics() {
        try {
            const baseMetrics = this.baseMonitor.generateReport();
            const smartInsights = this.analyzePatterns(baseMetrics);
            const predictions = this.generatePredictions(baseMetrics, smartInsights);
            const optimizations = this.generateOptimizations(baseMetrics, smartInsights);

            const intelligence = {
                healthScore: baseMetrics.score,
                riskLevel: this.assessRiskLevel(smartInsights),
                actionItems: this.generateActionItems(optimizations)
            };

            // Store in history
            this.performanceHistory.push({
                timestamp: Date.now(),
                metrics: baseMetrics,
                insights: smartInsights
            });

            // Keep only last 50 entries
            if (this.performanceHistory.length > 50) {
                this.performanceHistory = this.performanceHistory.slice(-50);
            }

            return {
                base: baseMetrics,
                insights: smartInsights,
                predictions,
                optimizations,
                intelligence,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Error generating intelligent metrics:', error);
            return null;
        }
    }

    /**
     * Assess overall risk level
     */
    assessRiskLevel(insights) {
        const { patterns, anomalies } = insights;
        const highSeverity = [...patterns, ...anomalies].filter(item => item.severity === 'high');
        
        if (highSeverity.length >= 2) return 'high';
        if (highSeverity.length === 1 || patterns.length + anomalies.length >= 3) return 'medium';
        return 'low';
    }

    /**
     * Generate actionable items
     */
    generateActionItems(optimizations) {
        return optimizations
            .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.impact] - priorityOrder[a.impact];
            })
            .slice(0, 3) // Top 3 actions
            .map(opt => ({
                action: opt.action,
                priority: opt.impact,
                category: opt.category,
                description: opt.description
            }));
    }

    /**
     * Start periodic performance tracking
     */
    startPerformanceTracking() {
        setInterval(() => {
            if (this.initialized) {
                this.getIntelligentMetrics().then(metrics => {
                    if (metrics && metrics.intelligence.riskLevel === 'high') {
                        console.warn('⚠️ High performance risk detected', metrics.intelligence.actionItems);
                    }
                });
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Get performance summary for UI display
     */
    getPerformanceSummary() {
        const report = this.baseMonitor.generateReport();
        return {
            score: report.score,
            status: report.status,
            memoryUsage: `${report.memory.current}MB / ${report.memory.limit}MB`,
            renderingStatus: report.rendering.isSmooth ? 'Smooth' : 'Lagging',
            errorCount: report.errors.total
        };
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPerformanceSystem;
}

// Global availability
if (typeof window !== 'undefined') {
    window.EnhancedPerformanceSystem = EnhancedPerformanceSystem;
}

console.log('✅ Enhanced Performance System loaded');

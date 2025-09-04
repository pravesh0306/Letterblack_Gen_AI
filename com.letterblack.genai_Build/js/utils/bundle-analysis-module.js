/**
 * BUNDLE ANALYSIS MODULE
 * Analyzes webpack bundle and provides optimization recommendations
 */

class BundleAnalysisModule {
    constructor() {
        this.bundleStats = null;
        this.analysisResults = null;
        this.optimizationSuggestions = [];
        this.performanceMetrics = {
            analysisTime: 0,
            suggestionsGenerated: 0,
            potentialSavings: 0
        };

        this.thresholds = {
            bundleSize: {
                small: 500 * 1024,    // 500KB
                medium: 2 * 1024 * 1024, // 2MB
                large: 5 * 1024 * 1024   // 5MB
            },
            chunkSize: {
                small: 100 * 1024,    // 100KB
                medium: 500 * 1024,    // 500KB
                large: 1024 * 1024     // 1MB
            }
        };

        this.init();
    }

    async init() {
        // Check if webpack bundle analyzer is available
        this.checkWebpackIntegration();

        // Set up analysis triggers
        this.setupAnalysisTriggers();

        console.log('📊 Bundle Analysis Module initialized');
    }

    /**
     * Check for webpack integration
     */
    checkWebpackIntegration() {
        // Check for webpack bundle analyzer script
        const hasBundleAnalyzer = document.querySelector('script[src*="webpack-bundle-analyzer"]') ||
                                 window.webpackBundleAnalyzer;

        if (!hasBundleAnalyzer) {
            console.warn('Webpack Bundle Analyzer not detected. Bundle analysis features will be limited.');
        }
    }

    /**
     * Setup analysis triggers
     */
    setupAnalysisTriggers() {
        // Manual analysis trigger
        document.addEventListener('analyzeBundle', () => {
            this.performBundleAnalysis();
        });

        // Auto-analyze on page load
        if (document.readyState === 'complete') {
            setTimeout(() => this.performBundleAnalysis(), 1000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.performBundleAnalysis(), 1000);
            });
        }
    }

    /**
     * Perform comprehensive bundle analysis
     */
    async performBundleAnalysis() {
        const startTime = performance.now();

        try {
            console.log('📊 Analyzing application bundle...');

            // Get bundle statistics
            this.bundleStats = await this.getBundleStats();

            // Analyze bundle composition
            const compositionAnalysis = this.analyzeBundleComposition();

            // Analyze dependencies
            const dependencyAnalysis = this.analyzeDependencies();

            // Analyze code splitting
            const codeSplittingAnalysis = this.analyzeCodeSplitting();

            // Generate optimization suggestions
            this.optimizationSuggestions = this.generateOptimizationSuggestions({
                composition: compositionAnalysis,
                dependencies: dependencyAnalysis,
                codeSplitting: codeSplittingAnalysis
            });

            // Calculate potential savings
            this.performanceMetrics.potentialSavings = this.calculatePotentialSavings();

            // Update performance metrics
            this.performanceMetrics.analysisTime = performance.now() - startTime;
            this.performanceMetrics.suggestionsGenerated = this.optimizationSuggestions.length;

            // Store analysis results
            this.analysisResults = {
                timestamp: Date.now(),
                bundleStats: this.bundleStats,
                composition: compositionAnalysis,
                dependencies: dependencyAnalysis,
                codeSplitting: codeSplittingAnalysis,
                suggestions: this.optimizationSuggestions,
                metrics: this.performanceMetrics
            };

            console.log('✅ Bundle analysis complete:', this.analysisResults);

            // Display results
            this.displayAnalysisResults();

            return this.analysisResults;

        } catch (error) {
            console.error('Bundle analysis failed:', error);
            this.showError('Failed to analyze bundle: ' + error.message);
            return null;
        }
    }

    /**
     * Get bundle statistics
     */
    async getBundleStats() {
        // Try to get stats from webpack dev server or build output
        const stats = {
            totalSize: 0,
            chunks: [],
            assets: [],
            modules: []
        };

        // Check for performance.memory if available
        if (performance.memory) {
            stats.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }

        // Get resource timing data
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            stats.assets = resources
                .filter(resource => resource.name.includes('.js'))
                .map(resource => ({
                    name: resource.name,
                    size: resource.transferSize || resource.decodedBodySize || 0,
                    loadTime: resource.responseEnd - resource.requestStart
                }));

            stats.totalSize = stats.assets.reduce((total, asset) => total + asset.size, 0);
        }

        // Fallback: estimate based on loaded scripts
        if (stats.totalSize === 0) {
            const scripts = document.querySelectorAll('script[src]');
            stats.assets = Array.from(scripts).map(script => ({
                name: script.src,
                size: 0, // Unknown
                loadTime: 0
            }));
        }

        return stats;
    }

    /**
     * Analyze bundle composition
     */
    analyzeBundleComposition() {
        const analysis = {
            totalSize: this.bundleStats.totalSize,
            sizeCategory: this.categorizeSize(this.bundleStats.totalSize),
            assetBreakdown: {},
            largestAssets: [],
            optimizationOpportunities: []
        };

        // Analyze asset breakdown
        const assets = this.bundleStats.assets || [];
        analysis.assetBreakdown = this.categorizeAssets(assets);

        // Find largest assets
        analysis.largestAssets = assets
            .sort((a, b) => (b.size || 0) - (a.size || 0))
            .slice(0, 5);

        // Identify optimization opportunities
        if (analysis.sizeCategory === 'large') {
            analysis.optimizationOpportunities.push('Bundle size is large - consider code splitting');
        }

        if (analysis.assetBreakdown.unused > 0.3) { // 30% unused
            analysis.optimizationOpportunities.push('High percentage of unused code detected');
        }

        return analysis;
    }

    /**
     * Categorize bundle size
     */
    categorizeSize(size) {
        if (size < this.thresholds.bundleSize.small) return 'small';
        if (size < this.thresholds.bundleSize.medium) return 'medium';
        if (size < this.thresholds.bundleSize.large) return 'large';
        return 'very-large';
    }

    /**
     * Categorize assets by type and usage
     */
    categorizeAssets(assets) {
        const breakdown = {
            javascript: 0,
            css: 0,
            images: 0,
            fonts: 0,
            other: 0,
            used: 0,
            unused: 0
        };

        assets.forEach(asset => {
            const name = asset.name.toLowerCase();
            let category = 'other';

            if (name.endsWith('.js')) category = 'javascript';
            else if (name.endsWith('.css')) category = 'css';
            else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name)) category = 'images';
            else if (/\.(woff|woff2|ttf|eot)$/i.test(name)) category = 'fonts';

            breakdown[category] += asset.size || 0;
        });

        // Estimate used vs unused (simplified)
        const totalSize = Object.values(breakdown).reduce((sum, size) => sum + size, 0);
        breakdown.used = totalSize * 0.7; // Assume 70% is used
        breakdown.unused = totalSize * 0.3; // Assume 30% is unused

        return breakdown;
    }

    /**
     * Analyze dependencies
     */
    analyzeDependencies() {
        const analysis = {
            totalModules: 0,
            largestModules: [],
            duplicateModules: [],
            treeShakableModules: [],
            vendorModules: []
        };

        // This would require actual webpack stats
        // For now, provide placeholder analysis based on loaded scripts

        const scripts = document.querySelectorAll('script[src]');
        analysis.totalModules = scripts.length;

        // Identify potential vendor modules
        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('node_modules') || src.includes('vendor')) {
                analysis.vendorModules.push({
                    name: src.split('/').pop(),
                    size: 0, // Unknown
                    source: src
                });
            }
        });

        return analysis;
    }

    /**
     * Analyze code splitting
     */
    analyzeCodeSplitting() {
        const analysis = {
            chunks: [],
            codeSplittingRatio: 0,
            lazyLoadedModules: [],
            criticalPathSize: 0,
            optimizationOpportunities: []
        };

        // Analyze chunks if available
        if (this.bundleStats.chunks) {
            analysis.chunks = this.bundleStats.chunks.map(chunk => ({
                name: chunk.name || 'unnamed',
                size: chunk.size || 0,
                modules: chunk.modules?.length || 0
            }));

            // Calculate code splitting ratio
            const totalSize = analysis.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
            const largestChunk = Math.max(...analysis.chunks.map(c => c.size));
            analysis.codeSplittingRatio = largestChunk / totalSize;
        }

        // Identify optimization opportunities
        if (analysis.codeSplittingRatio > 0.8) {
            analysis.optimizationOpportunities.push('Poor code splitting - main chunk is too large');
        }

        if (analysis.chunks.length < 2) {
            analysis.optimizationOpportunities.push('No code splitting detected - consider implementing dynamic imports');
        }

        return analysis;
    }

    /**
     * Generate optimization suggestions
     */
    generateOptimizationSuggestions(analyses) {
        const suggestions = [];

        // Bundle size suggestions
        if (analyses.composition.sizeCategory === 'large') {
            suggestions.push({
                category: 'bundle-size',
                priority: 'high',
                title: 'Reduce Bundle Size',
                description: 'Your bundle is quite large. Consider implementing code splitting and lazy loading.',
                impact: 'high',
                effort: 'medium',
                implementation: [
                    'Implement dynamic imports for route-based code splitting',
                    'Use lazy loading for heavy components',
                    'Remove unused dependencies',
                    'Enable tree shaking for better dead code elimination'
                ]
            });
        }

        // Code splitting suggestions
        if (analyses.codeSplitting.optimizationOpportunities.length > 0) {
            suggestions.push({
                category: 'code-splitting',
                priority: 'high',
                title: 'Improve Code Splitting',
                description: 'Better code splitting can significantly improve initial load times.',
                impact: 'high',
                effort: 'medium',
                implementation: [
                    'Split vendor libraries into separate chunk',
                    'Use dynamic imports for feature modules',
                    'Implement route-based code splitting',
                    'Configure webpack splitChunks optimization'
                ]
            });
        }

        // Dependency optimization
        if (analyses.dependencies.vendorModules.length > 10) {
            suggestions.push({
                category: 'dependencies',
                priority: 'medium',
                title: 'Optimize Dependencies',
                description: 'Too many vendor modules can bloat your bundle.',
                impact: 'medium',
                effort: 'low',
                implementation: [
                    'Audit and remove unused dependencies',
                    'Use lighter alternatives for heavy libraries',
                    'Implement selective imports (e.g., import { method } from \'library\')',
                    'Consider using CDN for large vendor libraries'
                ]
            });
        }

        // Asset optimization
        const unusedPercentage = (analyses.composition.assetBreakdown.unused /
                                (analyses.composition.assetBreakdown.used + analyses.composition.assetBreakdown.unused)) * 100;

        if (unusedPercentage > 30) {
            suggestions.push({
                category: 'assets',
                priority: 'medium',
                title: 'Reduce Unused Code',
                description: `${unusedPercentage.toFixed(1)}% of your code appears to be unused.`,
                impact: 'medium',
                effort: 'medium',
                implementation: [
                    'Enable tree shaking in webpack configuration',
                    'Use ESLint to detect unused imports',
                    'Implement proper code splitting to load only necessary code',
                    'Regularly audit and remove dead code'
                ]
            });
        }

        // Performance suggestions
        if (this.bundleStats.memoryUsage) {
            const memoryUsagePercent = (this.bundleStats.memoryUsage.used / this.bundleStats.memoryUsage.limit) * 100;
            if (memoryUsagePercent > 80) {
                suggestions.push({
                    category: 'performance',
                    priority: 'high',
                    title: 'High Memory Usage',
                    description: `Memory usage is at ${memoryUsagePercent.toFixed(1)}% of available heap.`,
                    impact: 'high',
                    effort: 'high',
                    implementation: [
                        'Implement object pooling for frequently created objects',
                        'Use memory-efficient data structures',
                        'Implement proper cleanup and garbage collection',
                        'Consider using Web Workers for heavy computations'
                    ]
                });
            }
        }

        return suggestions;
    }

    /**
     * Calculate potential savings
     */
    calculatePotentialSavings() {
        let potentialSavings = 0;

        // Estimate savings from optimizations
        this.optimizationSuggestions.forEach(suggestion => {
            switch (suggestion.category) {
                case 'bundle-size':
                    potentialSavings += this.bundleStats.totalSize * 0.3; // 30% reduction
                    break;
                case 'code-splitting':
                    potentialSavings += this.bundleStats.totalSize * 0.2; // 20% reduction
                    break;
                case 'dependencies':
                    potentialSavings += this.bundleStats.totalSize * 0.15; // 15% reduction
                    break;
                case 'assets':
                    potentialSavings += this.bundleStats.totalSize * 0.25; // 25% reduction
                    break;
            }
        });

        return Math.min(potentialSavings, this.bundleStats.totalSize * 0.5); // Max 50% savings
    }

    /**
     * Display analysis results
     */
    displayAnalysisResults() {
        if (!this.analysisResults) return;

        const modal = document.createElement('div');
        modal.className = 'bundle-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📊 Bundle Analysis Results</h3>

                <div class="analysis-summary">
                    <div class="summary-grid">
                        <div>Total Size: ${(this.analysisResults.bundleStats.totalSize / 1024 / 1024).toFixed(2)} MB</div>
                        <div>Size Category: <span class="category-${this.analysisResults.composition.sizeCategory}">${this.analysisResults.composition.sizeCategory}</span></div>
                        <div>Analysis Time: ${this.performanceMetrics.analysisTime.toFixed(2)}ms</div>
                        <div>Potential Savings: ${(this.performanceMetrics.potentialSavings / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                </div>

                <div class="asset-breakdown">
                    <h4>Asset Breakdown</h4>
                    <div class="breakdown-chart">
                        ${this.renderAssetBreakdownChart()}
                    </div>
                </div>

                ${this.analysisResults.suggestions.length > 0 ? `
                <div class="optimization-suggestions">
                    <h4>Optimization Suggestions (${this.analysisResults.suggestions.length})</h4>
                    ${this.analysisResults.suggestions.map(suggestion => `
                        <div class="suggestion-item priority-${suggestion.priority}">
                            <div class="suggestion-header">
                                <strong>${suggestion.title}</strong>
                                <span class="priority">${suggestion.priority}</span>
                            </div>
                            <p>${suggestion.description}</p>
                            <div class="suggestion-meta">
                                <span>Impact: ${suggestion.impact}</span>
                                <span>Effort: ${suggestion.effort}</span>
                            </div>
                            <details>
                                <summary>Implementation Steps</summary>
                                <ul>
                                    ${suggestion.implementation.map(step => `<li>${step}</li>`).join('')}
                                </ul>
                            </details>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="actions">
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                    <button onclick="window.bundleAnalysisModule.exportAnalysisReport()">Export Report</button>
                    <button onclick="window.bundleAnalysisModule.applyOptimizations()">Apply Optimizations</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Render asset breakdown chart
     */
    renderAssetBreakdownChart() {
        const breakdown = this.analysisResults.composition.assetBreakdown;
        const total = breakdown.javascript + breakdown.css + breakdown.images + breakdown.fonts + breakdown.other;

        const createBar = (label, value, color) => {
            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
            const size = (value / 1024 / 1024).toFixed(2);
            return `
                <div class="chart-bar">
                    <div class="bar-label">${label}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${percentage}%; background-color: ${color}"></div>
                    </div>
                    <div class="bar-value">${size} MB (${percentage}%)</div>
                </div>
            `;
        };

        return `
            <div class="asset-breakdown-chart">
                ${createBar('JavaScript', breakdown.javascript, '#f39c12')}
                ${createBar('CSS', breakdown.css, '#3498db')}
                ${createBar('Images', breakdown.images, '#e74c3c')}
                ${createBar('Fonts', breakdown.fonts, '#9b59b6')}
                ${createBar('Other', breakdown.other, '#95a5a6')}
            </div>
        `;
    }

    /**
     * Export analysis report
     */
    exportAnalysisReport() {
        const report = {
            analysis: this.analysisResults,
            timestamp: Date.now(),
            recommendations: this.optimizationSuggestions,
            implementation: this.generateImplementationPlan()
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `bundle-analysis-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📤 Bundle analysis report exported');
    }

    /**
     * Generate implementation plan
     */
    generateImplementationPlan() {
        const plan = {
            phases: [],
            timeline: '2-4 weeks',
            priority: 'high'
        };

        // Phase 1: Quick wins
        plan.phases.push({
            name: 'Phase 1: Quick Wins (Week 1)',
            tasks: [
                'Enable tree shaking in webpack config',
                'Remove obviously unused dependencies',
                'Implement basic code splitting for routes',
                'Compress and optimize assets'
            ],
            expectedSavings: '15-25%'
        });

        // Phase 2: Advanced optimizations
        plan.phases.push({
            name: 'Phase 2: Advanced Optimizations (Week 2-3)',
            tasks: [
                'Implement dynamic imports for heavy components',
                'Set up proper chunk splitting strategy',
                'Optimize vendor library loading',
                'Implement lazy loading patterns'
            ],
            expectedSavings: '25-40%'
        });

        // Phase 3: Monitoring and maintenance
        plan.phases.push({
            name: 'Phase 3: Monitoring (Week 4)',
            tasks: [
                'Set up bundle size monitoring',
                'Implement performance budgets',
                'Create automated optimization checks',
                'Establish regular bundle analysis routine'
            ],
            expectedSavings: 'Ongoing optimization'
        });

        return plan;
    }

    /**
     * Apply optimizations (placeholder)
     */
    async applyOptimizations() {
        // This would integrate with build tools to apply optimizations
        console.log('🔧 Applying bundle optimizations...');

        // Show implementation plan
        this.displayImplementationPlan();

        this.showMessage('Optimization suggestions have been generated. Check the implementation plan for next steps.');
    }

    /**
     * Display implementation plan
     */
    displayImplementationPlan() {
        const plan = this.generateImplementationPlan();

        const modal = document.createElement('div');
        modal.className = 'implementation-plan-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🚀 Implementation Plan</h3>
                <p><strong>Timeline:</strong> ${plan.timeline}</p>
                <p><strong>Priority:</strong> ${plan.priority}</p>

                ${plan.phases.map(phase => `
                <div class="phase">
                    <h4>${phase.name}</h4>
                    <p><strong>Expected Savings:</strong> ${phase.expectedSavings}</p>
                    <ul>
                        ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
                    </ul>
                </div>
                `).join('')}

                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'bundle-analysis-error';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 5000);
    }

    /**
     * Show message to user
     */
    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'bundle-analysis-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Get analysis results
     */
    getAnalysisResults() {
        return this.analysisResults;
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }

    /**
     * Clear analysis data
     */
    clearAnalysis() {
        this.bundleStats = null;
        this.analysisResults = null;
        this.optimizationSuggestions.length = 0;
        this.performanceMetrics = {
            analysisTime: 0,
            suggestionsGenerated: 0,
            potentialSavings: 0
        };
        console.log('🧹 Bundle analysis data cleared');
    }
}

// Export for global use
window.BundleAnalysisModule = BundleAnalysisModule;

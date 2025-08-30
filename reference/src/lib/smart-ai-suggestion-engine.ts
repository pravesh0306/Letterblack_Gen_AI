import { EnhancedAILearningSystem } from './enhanced-ai-learning-system'; // Assuming this is the correct path
import { AITrainingDataCollector } from './ai-training-data-collector'; // Assuming this is the correct path

// Type Definitions
interface Suggestion {
    id: string;
    type: 'performance' | 'workflow' | 'expression' | 'template' | 'memory_management';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
    estimatedImpact: {
        performanceGain: number;
        timeSaving: number;
        complexity: 'high' | 'medium' | 'low';
    };
    implementation: {
        steps: string[];
        settings?: Record<string, any>;
        code?: string;
    };
}

interface WorkflowContext {
    currentProject: {
        compositionCount: number;
        averageComplexity: number;
        commonExpressionTypes: string[];
        performanceBottlenecks: string[];
    };
    userBehavior: {
        frequentActions: string[];
        preferredWorkflows: string[];
        commonErrors: string[];
        averageSessionLength: number;
    };
    systemPerformance: {
        currentHealth: number;
        trendDirection: 'improving' | 'stable' | 'degrading';
        resourceUsage: {
            memory: number;
            cpu: number;
            gpu: number;
        };
    };
}

// Mocking app object for type safety in a non-CEP environment
declare const app: {
    project: {
        numItems: number;
    };
};

declare global {
    interface Window {
        enhancedPerformanceSystem?: {
            getSystemHealth: () => number;
        };
        SmartSuggestionEngine: typeof SmartSuggestionEngine;
    }
}


class SmartSuggestionEngine {
    private suggestions: Suggestion[] = [];
    private contextHistory: WorkflowContext[] = [];
    private learningModel: Map<string, number> = new Map();
    private lastAnalysis: number = Date.now();
    private isAnalyzing: boolean = false;
    private sessionStart: number = Date.now();
    private interactionCount: number = 0;

    private enhancedLearning: EnhancedAILearningSystem;
    private dataCollector: AITrainingDataCollector;
    private originalGenerateSuggestions: (forceRefresh?: boolean) => Promise<Suggestion[]>;

    constructor() {
        console.log('🤖 Smart AI Suggestion Engine initialized with Enhanced Learning');
        this.enhancedLearning = new EnhancedAILearningSystem();
        this.dataCollector = new AITrainingDataCollector();
        
        this.initializeLearningModel();
        this.initializeEnhancedTraining();

        // Bind the original method before overriding
        this.originalGenerateSuggestions = this.generateStandardSuggestions.bind(this);
    }

    private initializeLearningModel(): void {
        this.learningModel.set('performance_optimization', 0.8);
        this.learningModel.set('workflow_efficiency', 0.7);
        this.learningModel.set('expression_simplification', 0.6);
        this.learningModel.set('template_usage', 0.5);
        this.learningModel.set('memory_management', 0.9);
    }

    private initializeEnhancedTraining(): void {
        this.enhancedLearning.setupAutomaticLearning();
        this.dataCollector.createLearningFeedbackLoop();
        console.log('🧠 Enhanced training system activated');
    }

    public async generateSuggestions(forceRefresh: boolean = false): Promise<Suggestion[]> {
        if (this.isAnalyzing && !forceRefresh) {
            return this.suggestions;
        }

        this.isAnalyzing = true;
        try {
            const context = await this.analyzeCurrentContext();
            const personalizedSuggestions = this.enhancedLearning.generatePersonalizedSuggestions(context);

            let finalSuggestions: Suggestion[];

            if (personalizedSuggestions.length > 0) {
                const traditionalSuggestions = this.generateStandardSuggestions(context);
                const allSuggestions = [...personalizedSuggestions, ...traditionalSuggestions];
                
                allSuggestions.sort((a, b) => {
                    const priorityWeight = { high: 3, medium: 2, low: 1 };
                    const learningWeightA = this.learningModel.get(a.type) || 0.5;
                    const learningWeightB = this.learningModel.get(b.type) || 0.5;
                    
                    const scoreA = priorityWeight[a.priority] * a.estimatedImpact.performanceGain * learningWeightA;
                    const scoreB = priorityWeight[b.priority] * b.estimatedImpact.performanceGain * learningWeightB;
                    
                    return scoreB - scoreA;
                });
                finalSuggestions = allSuggestions;
            } else {
                finalSuggestions = this.generateStandardSuggestions(context);
            }

            this.suggestions = finalSuggestions.slice(0, 10);
            console.log(`🤖 Generated ${this.suggestions.length} smart suggestions`);

            this.dataCollector.recordInteraction('suggestions_generated', {
                count: this.suggestions.length,
                personalizedCount: personalizedSuggestions.length,
                context,
            });

            return this.suggestions;
        } finally {
            this.isAnalyzing = false;
            this.lastAnalysis = Date.now();
        }
    }

    private generateStandardSuggestions(context: WorkflowContext): Suggestion[] {
        const suggestions: Suggestion[] = [];
        suggestions.push(...this.generatePerformanceSuggestions(context));
        suggestions.push(...this.generateWorkflowSuggestions(context));
        suggestions.push(...this.generateExpressionSuggestions(context));
        suggestions.push(...this.generateTemplateSuggestions(context));
        return suggestions;
    }

    private async analyzeCurrentContext(): Promise<WorkflowContext> {
        const context: WorkflowContext = {
            currentProject: {
                compositionCount: this.getCompositionCount(),
                averageComplexity: this.calculateAverageComplexity(),
                commonExpressionTypes: this.analyzeExpressionTypes(),
                performanceBottlenecks: this.identifyBottlenecks(),
            },
            userBehavior: {
                frequentActions: this.getFrequentActions(),
                preferredWorkflows: this.getPreferredWorkflows(),
                commonErrors: this.getCommonErrors(),
                averageSessionLength: this.getAverageSessionLength(),
            },
            systemPerformance: {
                currentHealth: this.getSystemHealth(),
                trendDirection: this.getPerformanceTrend(),
                resourceUsage: this.getResourceUsage(),
            },
        };

        this.contextHistory.push(context);
        if (this.contextHistory.length > 20) {
            this.contextHistory.shift();
        }

        return context;
    }

    private generatePerformanceSuggestions(context: WorkflowContext): Suggestion[] {
        const suggestions: Suggestion[] = [];
        if (context.systemPerformance.currentHealth < 70) {
            suggestions.push({
                id: 'perf_' + Date.now(),
                type: 'performance',
                priority: 'high',
                title: 'System Performance Optimization',
                description: `Current system health is ${context.systemPerformance.currentHealth}%. Optimize memory usage and reduce CPU load.`, 
                actionable: true,
                estimatedImpact: {
                    performanceGain: 35,
                    timeSaving: 10,
                    complexity: 'medium',
                },
                implementation: {
                    steps: [
                        'Close unnecessary applications',
                        'Clear After Effects cache',
                        'Reduce preview quality',
                        'Enable smart caching',
                    ],
                    settings: { cacheEnabled: true, previewQuality: 'quarter' },
                },
            });
        }
        return suggestions;
    }

    private generateWorkflowSuggestions(context: WorkflowContext): Suggestion[] {
        const suggestions: Suggestion[] = [];
        if (context.currentProject.compositionCount > 10) {
            suggestions.push({
                id: 'workflow_' + Date.now(),
                type: 'workflow',
                priority: 'medium',
                title: 'Project Organization',
                description: 'Large project detected. Consider using folder organization and naming conventions.',
                actionable: true,
                estimatedImpact: {
                    performanceGain: 20,
                    timeSaving: 25,
                    complexity: 'low',
                },
                implementation: {
                    steps: [
                        'Create folder structure in project panel',
                        'Use consistent naming conventions',
                        'Group related compositions',
                        'Archive unused assets',
                    ],
                },
            });
        }
        return suggestions;
    }

    private generateExpressionSuggestions(context: WorkflowContext): Suggestion[] {
        const suggestions: Suggestion[] = [];
        if (context.currentProject.commonExpressionTypes.includes('complex_math')) {
            suggestions.push({
                id: 'expr_' + Date.now(),
                type: 'expression',
                priority: 'medium',
                title: 'Expression Optimization',
                description: 'Complex mathematical expressions detected. Consider optimization for better performance.',
                actionable: true,
                estimatedImpact: {
                    performanceGain: 30,
                    timeSaving: 8,
                    complexity: 'medium',
                },
                implementation: {
                    steps: [
                        'Cache expensive calculations',
                        'Use posterizeTime() for animation',
                        'Optimize trigonometric functions',
                        'Consider using keyframes instead',
                    ],
                    code: `// Optimized expression example\nconst cachedValue = posterizeTime(12);\nMath.sin(cachedValue * time * Math.PI);`,
                },
            });
        }
        return suggestions;
    }

    private generateTemplateSuggestions(context: WorkflowContext): Suggestion[] {
        const suggestions: Suggestion[] = [];
        if (context.userBehavior.frequentActions.includes('text_animation')) {
            suggestions.push({
                id: 'template_' + Date.now(),
                type: 'template',
                priority: 'low',
                title: 'Text Animation Templates',
                description: 'Frequent text animation detected. Use templates for faster workflow.',
                actionable: true,
                estimatedImpact: {
                    performanceGain: 10,
                    timeSaving: 30,
                    complexity: 'low',
                },
                implementation: {
                    steps: [
                        'Create text animation presets',
                        'Save frequently used expressions',
                        'Build template compositions',
                        'Use animation presets library',
                    ],
                },
            });
        }
        return suggestions;
    }

    // Mock data providers
    private getCompositionCount = (): number => (typeof app !== 'undefined' && app.project ? app.project.numItems : Math.floor(Math.random() * 15) + 1);
    private calculateAverageComplexity = (): number => Math.floor(Math.random() * 100) + 1;
    private analyzeExpressionTypes = (): string[] => ['position_animation', 'opacity_fade', 'rotation_spin', 'complex_math', 'wiggle_expression'].filter(() => Math.random() > 0.6);
    private identifyBottlenecks = (): string[] => ['high_layer_count', 'complex_effects', 'large_asset_size', 'expression_heavy'].filter(() => Math.random() > 0.7);
    private getFrequentActions = (): string[] => ['layer_creation', 'text_animation', 'effect_application', 'keyframe_editing', 'expression_writing'].filter(() => Math.random() > 0.5);
    private getPreferredWorkflows = (): string[] => ['motion_graphics', 'character_animation', 'visual_effects', 'text_animation'];
    private getCommonErrors = (): string[] => ['expression_syntax', 'missing_layer_reference', 'effect_parameter', 'null_object'].filter(() => Math.random() > 0.8);
    private getAverageSessionLength = (): number => Math.floor(Math.random() * 180) + 30;
    private getSystemHealth = (): number => (typeof window !== 'undefined' && window.enhancedPerformanceSystem ? window.enhancedPerformanceSystem.getSystemHealth() : Math.floor(Math.random() * 40) + 60);
    private getPerformanceTrend = (): 'improving' | 'stable' | 'degrading' => ['improving', 'stable', 'degrading'][Math.floor(Math.random() * 3)] as 'improving' | 'stable' | 'degrading';
    private getResourceUsage = () => ({ memory: Math.floor(Math.random() * 100), cpu: Math.floor(Math.random() * 100), gpu: Math.floor(Math.random() * 100) });

    public handleFeedback(suggestionId: string, feedback: 'helpful' | 'implemented' | 'not-helpful', additionalContext: Record<string, any> = {}): void {
        const suggestion = this.suggestions.find(s => s.id === suggestionId);
        if (suggestion) {
            const weight = this.learningModel.get(suggestion.type) || 0.5;
            const newWeight = feedback === 'helpful' || feedback === 'implemented' ? Math.min(1.0, weight + 0.1) : Math.max(0.1, weight - 0.1);
            this.learningModel.set(suggestion.type, newWeight);

            this.enhancedLearning.processAdvancedFeedback(suggestionId, feedback, {
                ...additionalContext,
                suggestionType: suggestion.type,
                estimatedImpact: suggestion.estimatedImpact,
                priority: suggestion.priority,
            });

            this.dataCollector.recordInteraction('feedback_provided', {
                suggestionId,
                feedback,
                suggestionType: suggestion.type,
                context: additionalContext,
            });

            console.log(`🤖 Enhanced Learning: ${suggestion.type} weight updated to ${newWeight}`);
        }
    }
    
    public getSuggestionsByType(type: Suggestion['type']): Suggestion[] {
        return this.suggestions.filter(s => s.type === type);
    }

    public getLearningModelState(): Record<string, number> {
        return Object.fromEntries(this.learningModel);
    }

    public implementSuggestion(suggestionId?: string): void {
        const suggestion = suggestionId ? this.suggestions.find(s => s.id === suggestionId) : this.suggestions[0];
        if (suggestion && suggestion.actionable) {
            console.log(`🚀 Implementing suggestion: ${suggestion.title}`);
            // In a real scenario, this would trigger the implementation steps
            // For now, we'll just log the steps
            suggestion.implementation.steps.forEach(step => console.log(`   - ${step}`));
            if (suggestion.implementation.code) {
                console.log(`   - Code: ${suggestion.implementation.code}`);
            }
            this.handleFeedback(suggestion.id, 'implemented');
        } else {
            console.warn('No actionable suggestion to implement');
        }
    }
}

export default new SmartSuggestionEngine();
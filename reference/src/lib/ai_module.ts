import { CSInterface } from '@cep/csinterface';
import { AIProviders } from './ai-providers';
import { EffectsPresetsModule } from './effects-presets-module';
import { LayerAnalysisModule, LayerAnalysisResult, SmartSuggestion } from './layer-analysis-module';
import { AdvancedSDKIntegration } from './advanced-sdk-integration';
import { ChatMemory } from './chat_memory';
import { SimpleYouTubeHelper } from './simple-youtube-helper';

// Define interfaces for modules that might not be converted yet or are on the window
interface Mascot {
    notify(type: 'error' | 'info' | 'success', message: string): void;
}

interface ErrorHandler {
    handleError(error: Error, context: any): void;
}

declare global {
    interface Window {
        Mascot?: Mascot;
        errorHandler?: ErrorHandler;
    }
}

// Define types for clarity
type Provider = 'google' | 'openai' | 'groq' | 'claude' | 'local' | 'ollama';
interface AIResponseOptions {
    apiKey: string;
    provider: Provider;
    fileData?: { type: string; base64: string };
    model?: string;
    temperature?: number;
    maxTokens?: number;
    chatHistory?: { type: 'user' | 'assistant'; text: string }[];
}

interface ProjectContext {
    // Define the structure of the project context object
    [key: string]: any;
}

export class AIModule {
    private apiProviders: AIProviders;
    private effectsModule: EffectsPresetsModule | null = null;
    private layerAnalysis: LayerAnalysisModule | null = null;
    private advancedSDK: AdvancedSDKIntegration | null = null;
    private chatMemory: ChatMemory | null = null;
    private youtubeHelper: SimpleYouTubeHelper;

    constructor() {
        this.apiProviders = new AIProviders();
        this.youtubeHelper = new SimpleYouTubeHelper();
        console.log('[Init] AI Module initialized.');

        // These modules depend on other parts of the app state (like chat memory)
        // and will be initialized via setters.
    }

    public setChatMemory(chatMemory: ChatMemory): void {
        this.chatMemory = chatMemory;
        this.effectsModule = new EffectsPresetsModule(chatMemory);
        this.layerAnalysis = new LayerAnalysisModule();
        this.advancedSDK = new AdvancedSDKIntegration();
        
        console.log('[Init] Dependent modules (Effects, LayerAnalysis, AdvancedSDK) initialized.');

        // Example of how to listen for project changes
        window.addEventListener('aeProjectChange', (event: any) => {
            this.handleProjectChange(event.detail);
        });
    }

    public async generateResponse(message: string, options: AIResponseOptions): Promise<string> {
        const { apiKey, provider, fileData, model, temperature, maxTokens, chatHistory = [] } = options;

        if (!apiKey || !provider) {
            return "Please configure your AI API settings first.";
        }

        try {
            let imageBase64: string | null = null;
            if (fileData && fileData.type.startsWith('image/')) {
                imageBase64 = fileData.base64.startsWith('data:') ? fileData.base64 : `data:image/png;base64,${fileData.base64}`;
            }

            let layerAnalysisResult: LayerAnalysisResult | null = null;
            if (this.layerAnalysis && this.shouldAnalyzeLayer(message)) {
                layerAnalysisResult = await this.layerAnalysis.analyzeSelectedLayers();
                console.log('🔍 Layer analysis completed for AI context');
            }
            
            const contextualPrompt = this.buildContextualPrompt(message, null, imageBase64, chatHistory, layerAnalysisResult);

            const response = await this.apiProviders.sendRequest(
                provider,
                contextualPrompt,
                apiKey,
                {
                    model: model,
                    temperature: temperature ?? 0.7,
                    maxTokens: maxTokens ?? 2048
                },
                imageBase64
            );

            return this.processAIResponse(response, provider);

        } catch (error: any) {
            console.error(`Error generating response from ${provider}:`, error);
            this.logError(`Error with ${provider} API`, error, options);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }

    private buildContextualPrompt(
        userMessage: string,
        projectContext: ProjectContext | null,
        imageBase64: string | null,
        chatHistory: { type: 'user' | 'assistant'; text: string }[],
        layerAnalysis: LayerAnalysisResult | null
    ): string {
        const recentHistory = chatHistory.slice(-6).map(msg => `${msg.type.toUpperCase()}: ${msg.text}`).join('\n');
        
        let layerContext = '';
        if (layerAnalysis && this.layerAnalysis && !layerAnalysis.error) {
            layerContext = '\n' + this.layerAnalysis.formatAnalysisForAI(layerAnalysis) + '\n';
            const suggestions = this.layerAnalysis.generateSmartSuggestions(layerAnalysis);
            if (suggestions.length > 0) {
                layerContext += '**🎯 SMART SUGGESTIONS:**\n' + suggestions.join('\n') + '\n';
            }
        }

        // Base prompt
        let prompt = `You are a friendly and expert After Effects assistant.
        
RECENT CONVERSATION:
${recentHistory}

CURRENT LAYER CONTEXT:
${layerContext || 'No layer selected or analysis available.'}

Based on the context, continue the conversation naturally. Provide working ExtendScript (.jsx) or expressions when helpful.

USER REQUEST: ${userMessage}`;

        if (imageBase64) {
            prompt += `\n\nIMAGE PROVIDED: Analyze the uploaded image and provide relevant After Effects guidance.`;
        }

        return prompt;
    }

    private processAIResponse(response: string, provider: Provider): string {
        console.log(`✅ AI response received from ${provider}`);
        return response.trim();
    }

    private shouldAnalyzeLayer(message: string): boolean {
        const lowerMessage = message.toLowerCase();
        const analysisKeywords = [
            'current', 'this layer', 'selected', 'what effects', 'analyze',
            'modify', 'adjust', 'change', 'apply', 'add', 'remove', 'effect'
        ];
        return analysisKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    private handleProjectChange(changeDetail: any): void {
        console.log('🎬 Project change detected:', changeDetail);
        if (this.chatMemory && changeDetail.type === 'selection_changed') {
            this.chatMemory.addMessage({
                type: 'system',
                text: `Layer selection changed: ${JSON.stringify(changeDetail.data)}`,
                timestamp: new Date().toISOString()
            });
        }
    }

    private logError(message: string, error: Error, context: any = {}): void {
        const errorInfo = {
            message,
            error: error.message || error,
            timestamp: new Date().toISOString(),
            context
        };
        console.error(`[AI Module] ${message}:`, errorInfo);
        if (window.errorHandler) {
            window.errorHandler.handleError(new Error(errorInfo.message), errorInfo.context);
        }
    }
}

export default new AIModule();

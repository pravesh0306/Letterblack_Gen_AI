/**
 * ENHANCED MAIN APPLICATION - Complete Extension Integration
 * Integrates all enhanced components for full AI-powered After Effects extension
 * Version: 2.0.1 - Modern TypeScript Conversion
 */

// Import modules for type safety and clarity
import SimpleSettingsManager from './simple-settings-manager';
import EnhancedAIProvider from './ai-providers'; // Assuming this is the enhanced provider
import { CSInterface } from '@cep/csinterface';

// Define a global application state object for better type management
interface AppState {
    initialized: boolean;
    components: Record<string, any>;
    config: {
        version: string;
        name: string;
        debug: boolean;
    };
    main?: EnhancedAEAIApplication;
}

declare global {
    interface Window {
        AE_AI_APP: AppState;
        // Add other global modules if necessary
        ApiSettingsStorage: any;
        EnhancedServer: any;
        TabManager: any;
        ToolbarManager: any;
        ComponentSystem: any;
        AEScriptBridge: any;
        TestFramework: any;
    }
}

window.AE_AI_APP = window.AE_AI_APP || {
    initialized: false,
    components: {},
    config: {
        version: '2.0.1',
        name: 'AE AI Generation Extension',
        debug: true,
    },
};

class EnhancedAEAIApplication {
    private modules: Record<string, any> = {};
    public isInitialized: boolean = false;
    private readonly debug: boolean;
    private readonly startTime: number;

    constructor() {
        this.debug = window.AE_AI_APP.config.debug;
        this.startTime = Date.now();
        console.log('🚀 Enhanced AE AI Application starting...');
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            console.log('🔧 Initializing Enhanced AE AI Application...');

            await this.initializeSettings();
            await this.initializeAIProvider();
            await this.initializeServer();
            await this.initializeUI();
            await this.initializeAEIntegration();

            if (this.debug) {
                await this.initializeTestFramework();
            }

            this.isInitialized = true;
            window.AE_AI_APP.initialized = true;

            const initTime = Date.now() - this.startTime;
            console.log(`✅ Enhanced AE AI Application initialized in ${initTime}ms`);

            this.dispatchEvent('ae-ai-initialized', {
                version: window.AE_AI_APP.config.version,
                initTime,
                components: Object.keys(this.modules),
            });
        } catch (error: any) {
            console.error('❌ Failed to initialize Enhanced AE AI Application:', error);
            this.handleInitializationError(error);
        }
    }

    private async initializeSettings(): Promise<void> {
        console.log('📁 Initializing Enhanced Settings...');
        // Assuming ApiSettingsStorage is loaded globally for now
        if (typeof window.ApiSettingsStorage !== 'undefined') {
            this.modules.apiStorage = new window.ApiSettingsStorage();
        }

        // Use the imported SimpleSettingsManager
        this.modules.settingsManager = new SimpleSettingsManager();
        await this.modules.settingsManager.loadSettings();
        window.AE_AI_APP.components.settings = this.modules.settingsManager;
        console.log('✅ Simple Settings Manager initialized');
    }

    private async initializeAIProvider(): Promise<void> {
        console.log('🤖 Initializing Enhanced AI Provider...');
        const settings = this.modules.settingsManager?.getSettings() || {};
        const apiKeys = {
            gemini: settings.geminiApiKey || '',
            openai: settings.openaiApiKey || '',
            groq: settings.groqApiKey || '',
        };

        this.modules.aiProvider = new EnhancedAIProvider(apiKeys);
        await this.modules.aiProvider.initialize();
        window.AE_AI_APP.components.aiProvider = this.modules.aiProvider;
        console.log('✅ Enhanced AI Provider initialized');
    }

    private async initializeServer(): Promise<void> {
        console.log('🖥️ Checking for Enhanced Server...');
        if (typeof window.EnhancedServer !== 'undefined') {
            this.modules.server = new window.EnhancedServer({
                port: 3000,
                cors: true,
                fileUpload: true,
            });
            console.log('✅ Enhanced Server configured');
        } else {
            console.log('ℹ️ Enhanced Server not available.');
        }
    }

    private async initializeUI(): Promise<void> {
        console.log('🎨 Initializing UI Components...');
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve(null);
            }
        });

        // These are assumed to be globally available for now
        if (typeof window.TabManager !== 'undefined') this.modules.tabManager = new window.TabManager();
        if (typeof window.ToolbarManager !== 'undefined') this.modules.toolbarManager = new window.ToolbarManager();
        if (typeof window.ComponentSystem !== 'undefined') this.modules.componentSystem = new window.ComponentSystem();
        
        window.AE_AI_APP.components.ui = {
            tabManager: this.modules.tabManager,
            toolbarManager: this.modules.toolbarManager,
            componentSystem: this.modules.componentSystem,
        };
        console.log('✅ UI Components initialized');
    }

    private async initializeAEIntegration(): Promise<void> {
        console.log('🎬 Initializing After Effects Integration...');
        if (typeof CSInterface !== 'undefined') {
            this.modules.csInterface = new CSInterface();
            console.log('✅ Running in Adobe CEP environment');
            if (typeof window.AEScriptBridge !== 'undefined') {
                this.modules.aeScript = new window.AEScriptBridge();
                console.log('✅ AE Script Bridge initialized');
            }
        } else {
            console.log('ℹ️ Running outside CEP environment (development mode)');
            this.modules.csInterface = this.createMockCEPInterface();
        }
        window.AE_AI_APP.components.ae = {
            csInterface: this.modules.csInterface,
            aeScript: this.modules.aeScript,
        };
    }

    private async initializeTestFramework(): Promise<void> {
        console.log('🧪 Initializing Testing Framework...');
        if (typeof window.TestFramework !== 'undefined') {
            this.modules.testFramework = new window.TestFramework();
            console.log('✅ Test Framework initialized');
        }
    }

    private createMockCEPInterface(): any {
        return {
            evalScript: (script: string, callback?: (result: any) => void) => {
                console.log('🎭 Mock CEP evalScript:', script);
                if (callback) callback('Mock result');
            },
            hostEnvironment: { appName: 'AEFT', appVersion: '23.0.0' },
        };
    }

    private handleInitializationError(error: Error): void {
        console.error('💥 Application initialization failed:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 10px; right: 10px; background: #ff4444;
            color: white; padding: 10px; border-radius: 5px; z-index: 9999;
            font-family: monospace; max-width: 300px;`;
        errorDiv.innerHTML = `<strong>🚨 Initialization Error</strong><br>${error.message}`;
        document.body?.appendChild(errorDiv);
    }

    private dispatchEvent(eventName: string, data: any): void {
        window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    public getModule<T>(name: string): T | undefined {
        return this.modules[name];
    }

    public getAllModules(): Record<string, any> {
        return { ...this.modules };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AE_AI_APP.main = new EnhancedAEAIApplication();
    });
} else {
    window.AE_AI_APP.main = new EnhancedAEAIApplication();
}

export default new EnhancedAEAIApplication();
// Advanced Module Initializer - JavaScript Edition
// Relinks all modules in the proper order and provides global access

(function() {
    'use strict';

    // Global module registry
    window.AppModules = {};
    window.AppStatus = {
        initialized: false,
        modules: {},
        errors: []
    };

    // Module initialization order (dependencies first)
    const MODULE_INIT_ORDER = [
        // Core Foundation
        'constants',
        'module-monitor',
        'enhanced-performance-system',
        
        // Storage & Settings
        'api-settings-storage',
        'local-file-storage-manager',
        'simple-settings-manager',
        
        // AI Core
        'ai-providers',
        'ai-module',
        'chat-memory',
        'ai-training-data-collector',
        'enhanced-ai-learning-system',
        'smart-ai-suggestion-engine',
        
        // UI Foundation
        'ui-initializer',
        'ui-animator',
        'panel-layout-manager',
        'preset-layout-manager',
        
        // Advanced Features
        'advanced-sdk-integration',
        'effects-presets-module',
        'layer-analysis-module',
        'simple-file-upload',
        'simple-youtube-helper',
        'simple-toast'
    ];

    // Module status tracker
    function updateStatus(module, status, error = null) {
        window.AppStatus.modules[module] = { status, error, timestamp: Date.now() };
        
        if (error) {
            window.AppStatus.errors.push({ module, error, timestamp: Date.now() });
            console.error(`❌ Module ${module}:`, error);
        } else {
            console.log(`✅ Module ${module}: ${status}`);
        }
    }

    // Initialize individual module
    function initializeModule(moduleName) {
        return new Promise((resolve, reject) => {
            try {
                updateStatus(moduleName, 'initializing');
                
                let moduleInstance = null;
                
                // Module-specific initialization logic
                switch(moduleName) {
                    case 'constants':
                        if (window.APP_CONSTANTS) {
                            window.AppModules.constants = window.APP_CONSTANTS;
                            moduleInstance = window.APP_CONSTANTS;
                        }
                        break;
                        
                    case 'module-monitor':
                        if (window.ModuleMonitor) {
                            window.AppModules.moduleMonitor = new window.ModuleMonitor();
                            moduleInstance = window.AppModules.moduleMonitor;
                        }
                        break;
                        
                    case 'enhanced-performance-system':
                        if (window.EnhancedPerformanceSystem) {
                            window.AppModules.performanceSystem = new window.EnhancedPerformanceSystem();
                            moduleInstance = window.AppModules.performanceSystem;
                        }
                        break;
                        
                    case 'api-settings-storage':
                        if (window.ApiSettingsStorage) {
                            window.AppModules.apiSettingsStorage = new window.ApiSettingsStorage();
                            moduleInstance = window.AppModules.apiSettingsStorage;
                        }
                        break;
                        
                    case 'local-file-storage-manager':
                        if (window.LocalFileStorageManager) {
                            window.AppModules.localFileStorage = new window.LocalFileStorageManager();
                            moduleInstance = window.AppModules.localFileStorage;
                        }
                        break;
                        
                    case 'simple-settings-manager':
                        if (window.SimpleSettingsManager) {
                            window.AppModules.settingsManager = new window.SimpleSettingsManager();
                            moduleInstance = window.AppModules.settingsManager;
                        }
                        break;
                        
                    case 'ai-providers':
                        if (window.AIProviders) {
                            window.AppModules.aiProviders = new window.AIProviders();
                            moduleInstance = window.AppModules.aiProviders;
                        }
                        break;
                        
                    case 'ai-module':
                        if (window.AIModule) {
                            window.AppModules.aiModule = new window.AIModule();
                            moduleInstance = window.AppModules.aiModule;
                        }
                        break;
                        
                    case 'chat-memory':
                        if (window.ChatMemory) {
                            window.AppModules.chatMemory = new window.ChatMemory();
                            moduleInstance = window.AppModules.chatMemory;
                        }
                        break;
                        
                    case 'ai-training-data-collector':
                        if (window.AITrainingDataCollector) {
                            window.AppModules.aiTrainingCollector = new window.AITrainingDataCollector();
                            moduleInstance = window.AppModules.aiTrainingCollector;
                        }
                        break;
                        
                    case 'enhanced-ai-learning-system':
                        if (window.EnhancedAILearningSystem) {
                            window.AppModules.aiLearningSystem = new window.EnhancedAILearningSystem();
                            moduleInstance = window.AppModules.aiLearningSystem;
                        }
                        break;
                        
                    case 'smart-ai-suggestion-engine':
                        if (window.SmartAISuggestionEngine) {
                            window.AppModules.suggestionEngine = new window.SmartAISuggestionEngine();
                            moduleInstance = window.AppModules.suggestionEngine;
                        }
                        break;
                        
                    case 'ui-initializer':
                        if (window.UIInitializer) {
                            window.AppModules.uiInitializer = new window.UIInitializer();
                            moduleInstance = window.AppModules.uiInitializer;
                        }
                        break;
                        
                    case 'ui-animator':
                        if (window.UIAnimator) {
                            window.AppModules.uiAnimator = new window.UIAnimator();
                            moduleInstance = window.AppModules.uiAnimator;
                        }
                        break;
                        
                    case 'panel-layout-manager':
                        if (window.PanelLayoutManager) {
                            window.AppModules.panelLayout = new window.PanelLayoutManager();
                            moduleInstance = window.AppModules.panelLayout;
                        }
                        break;
                        
                    case 'preset-layout-manager':
                        if (window.PresetLayoutManager) {
                            window.AppModules.presetLayout = new window.PresetLayoutManager();
                            moduleInstance = window.AppModules.presetLayout;
                        }
                        break;
                        
                    case 'advanced-sdk-integration':
                        if (window.AdvancedSDKIntegration) {
                            window.AppModules.advancedSDK = new window.AdvancedSDKIntegration();
                            moduleInstance = window.AppModules.advancedSDK;
                        }
                        break;
                        
                    case 'effects-presets-module':
                        if (window.EffectsPresetsModule && window.AppModules.chatMemory) {
                            window.AppModules.effectsPresets = new window.EffectsPresetsModule(window.AppModules.chatMemory);
                            moduleInstance = window.AppModules.effectsPresets;
                        }
                        break;
                        
                    case 'layer-analysis-module':
                        if (window.LayerAnalysisModule) {
                            window.AppModules.layerAnalysis = new window.LayerAnalysisModule();
                            moduleInstance = window.AppModules.layerAnalysis;
                        }
                        break;
                        
                    case 'simple-file-upload':
                        if (window.SimpleFileUpload) {
                            window.AppModules.fileUpload = new window.SimpleFileUpload();
                            moduleInstance = window.AppModules.fileUpload;
                        }
                        break;
                        
                    case 'simple-youtube-helper':
                        if (window.SimpleYouTubeHelper) {
                            window.AppModules.youtubeHelper = new window.SimpleYouTubeHelper();
                            moduleInstance = window.AppModules.youtubeHelper;
                        }
                        break;
                        
                    case 'simple-toast':
                        if (window.SimpleToast) {
                            window.AppModules.toast = window.SimpleToast; // Utility function, not a class
                            moduleInstance = window.AppModules.toast;
                        }
                        break;
                        
                    default:
                        console.warn(`⚠️  Unknown module: ${moduleName}`);
                        break;
                }
                
                if (moduleInstance) {
                    updateStatus(moduleName, 'ready');
                    resolve(moduleInstance);
                } else {
                    updateStatus(moduleName, 'not-available');
                    resolve(null);
                }
                
            } catch (error) {
                updateStatus(moduleName, 'error', error.message);
                reject(error);
            }
        });
    }

    // Initialize all modules in order
    async function initializeAllModules() {
        console.log('🚀 Starting Advanced Module Initialization...');
        
        for (const moduleName of MODULE_INIT_ORDER) {
            try {
                await initializeModule(moduleName);
                await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between modules
            } catch (error) {
                console.error(`❌ Failed to initialize ${moduleName}:`, error);
            }
        }
        
        window.AppStatus.initialized = true;
        console.log('✅ All modules initialized!');
        
        // Update UI status
        updateUIStatus();
        
        // Setup global shortcuts
        setupGlobalShortcuts();
    }

    // Update UI with module status
    function updateUIStatus() {
        const aiStatus = document.getElementById('ai-status');
        const suggestionCount = document.getElementById('suggestion-count');
        const learningQuality = document.getElementById('learning-quality');
        
        if (aiStatus) {
            const readyModules = Object.values(window.AppStatus.modules).filter(m => m.status === 'ready').length;
            const totalModules = Object.keys(window.AppStatus.modules).length;
            aiStatus.textContent = `Ready (${readyModules}/${totalModules} modules)`;
        }
        
        if (suggestionCount && window.AppModules.suggestionEngine) {
            suggestionCount.textContent = '0'; // Will be updated by suggestion engine
        }
        
        if (learningQuality && window.AppModules.aiLearningSystem) {
            learningQuality.textContent = 'Ready for Learning';
        }
    }

    // Setup global keyboard shortcuts
    function setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K for command palette
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const commandTrigger = document.getElementById('command-menu-trigger');
                if (commandTrigger) commandTrigger.click();
            }
            
            // Ctrl+Enter for send message
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                const sendButton = document.getElementById('send-button');
                if (sendButton && !sendButton.disabled) sendButton.click();
            }
        });
    }

    // Global utility functions
    window.AppUtils = {
        generateSuggestions: (smart = false) => {
            if (window.AppModules.suggestionEngine) {
                return window.AppModules.suggestionEngine.generateSuggestions(smart);
            } else {
                console.warn('Suggestion engine not available');
                return Promise.resolve([]);
            }
        },
        
        activateSmartAI: () => {
            if (window.AppModules.aiLearningSystem) {
                window.AppModules.aiLearningSystem.activate();
            }
            return window.AppUtils.generateSuggestions(true);
        },
        
        getModuleStatus: () => {
            return window.AppStatus;
        },
        
        reinitializeModule: (moduleName) => {
            return initializeModule(moduleName);
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllModules);
    } else {
        initializeAllModules();
    }

    // Expose initialization function globally
    window.initializeAppModules = initializeAllModules;

})();

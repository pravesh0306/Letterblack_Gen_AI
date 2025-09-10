/**
 * Main Application Initializer
 * Entry point for all initialization scripts
 */

(function() {
    'use strict';

    console.log('🚀 Starting LetterBlack GenAI Application...');

    // Dynamic script loader for utilities
    function loadUtilityModule(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`✅ Loaded: ${src}`);
                resolve();
            };
            script.onerror = () => {
                console.warn(`⚠️ Failed to load: ${src}`);
                resolve(); // Don't fail - continue loading other modules
            };
            document.head.appendChild(script);
        });
    }

    // Initialize application modules in correct order
    async function initializeApplication() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            console.log('📋 DOM ready - initializing application modules...');

            // Initialize core systems first
            await initializeCoreModules();

            // Initialize UI components
            await initializeUIComponents();

            // Initialize AI systems
            await initializeAISystems();

            console.log('🎉 LetterBlack GenAI Application fully initialized!');

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
        }
    }

    async function initializeCoreModules() {
        console.log('🔧 Initializing core modules...');

        // Enhanced systems initialization with design system compliance
        const modules = {
            advancedSDKIntegration: null,
            aiModule: null,
            aiProviders: null,
            chatMemory: null,
            effectsPresetsModule: null,
            enhancedAILearningSystem: null,
            enhancedPerformanceSystem: null,
            layerAnalysisModule: null,
            moduleMonitor: null,
            smartSuggestionEngine: null,
            simpleFileUpload: null,
            simpleToast: null,
            simpleYouTubeHelper: null,
            uiAnimator: null
        };

        // Initialize available modules
        setTimeout(() => {
            try {
                if (window.AdvancedSDKIntegration) {
                    modules.advancedSDKIntegration = new window.AdvancedSDKIntegration();
                    console.log('✅ Advanced SDK Integration initialized');
                }

                if (window.AIModule) {
                    modules.aiModule = new window.AIModule();
                    console.log('✅ AI Module initialized');
                }

                if (window.AIProviders) {
                    modules.aiProviders = new window.AIProviders();
                    console.log('✅ AI Providers initialized');
                }

                if (window.ChatMemory) {
                    modules.chatMemory = new window.ChatMemory();
                    console.log('✅ Chat Memory initialized');
                }

                if (window.EffectsPresetsModule && modules.chatMemory) {
                    modules.effectsPresetsModule = new window.EffectsPresetsModule(modules.chatMemory);
                    console.log('✅ Effects Presets Module initialized');
                }

                if (window.LayerAnalysisModule) {
                    modules.layerAnalysisModule = new window.LayerAnalysisModule();
                    console.log('✅ Layer Analysis Module initialized');
                }

                if (window.SimpleFileUpload) {
                    modules.simpleFileUpload = new window.SimpleFileUpload();
                    console.log('✅ Simple File Upload initialized');
                }

                // Initialize Chat Assistant for markdown processing
                if (window.ChatAssistant) {
                    window.chatAssistant = new window.ChatAssistant();
                    console.log('✅ Chat Assistant initialized for markdown processing');
                }

                // Make modules globally available
                window.appModules = modules;
                window.AppModules = modules; // Legacy compatibility

                // Make AI module directly accessible for formatResponseForChat
                if (modules.aiModule) {
                    window.aiModule = modules.aiModule;
                    console.log('✅ AI Module assigned to window.aiModule for chat formatting');
                }

                console.log('🎉 All available modules initialized successfully');

            } catch (error) {
                console.warn('⚠️ Some modules failed to initialize:', error);
            }
        }, 500);
    }

    async function initializeUIComponents() {
        console.log('🎨 Initializing UI components...');

        // Initialize performance system
        if (window.EnhancedPerformanceSystem) {
            window.performanceSystem = new window.EnhancedPerformanceSystem();
            console.log('✅ Performance System initialized');

            // Add performance indicator to status bar
            setTimeout(() => {
                const statusLeft = document.querySelector('.status-left');
                if (statusLeft && window.performanceSystem) {
                    try {
                        // Performance indicator would be added here
                    } catch (e) {
                        console.warn('Could not add performance indicator:', e);
                    }
                }
            }, 2000);
        }

        // Initialize command palette functionality
        initializeCommandPalette();
    }

    async function initializeAISystems() {
        console.log('🤖 Initializing AI systems...');

        // Module monitor initialization - DISABLED
        if (window.moduleMonitor) {
            console.log('✅ Module Monitor active');
        }

        // Constants availability check
        if (window.APP_CONSTANTS) {
            console.log('✅ Application Constants loaded');
            console.log('📋 Available constants:', Object.keys(window.APP_CONSTANTS));
        }
    }

    function initializeCommandPalette() {
        const commandTrigger = document.getElementById('command-menu-trigger');
        const commandPanel = document.getElementById('command-menu-panel');

        if (commandTrigger && commandPanel) {
            commandTrigger.addEventListener('click', () => {
                commandPanel.classList.toggle('hidden');
                if (!commandPanel.classList.contains('hidden')) {
                    const searchInput = document.getElementById('command-search');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
            });

            // Close on escape or outside click
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !commandPanel.classList.contains('hidden')) {
                    commandPanel.classList.add('hidden');
                }
            });

            document.addEventListener('click', (e) => {
                if (!commandPanel.contains(e.target) && !commandTrigger.contains(e.target)) {
                    commandPanel.classList.add('hidden');
                }
            });

            console.log('✅ Command Palette initialized');
        }
    }

    // Start the initialization process
    initializeApplication();

})();


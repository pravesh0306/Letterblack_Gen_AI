/**
 * AI Assistant Fix - Ensures proper AI response functionality
 * This script diagnoses and fixes common AI assistant issues
 */

(function() {
    'use strict';

    /**
     * Diagnostic function to check AI assistant health
     */
    function diagnoseAIAssistant() {
        this.logger.debug('🔍 === AI ASSISTANT DIAGNOSTIC ===');
        
        const diagnostics = {
            settingsManager: !!window.settingsManager,
            aiModule: !!window.aiModule,
            aiProviders: !!window.AIProviders,
            chatStore: !!window.chatStore,
            storageIntegration: !!window.storageIntegration
        };
        
        console.table(diagnostics);
        
        // Check for critical missing components
        const missing = Object.entries(diagnostics)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
            
        if (missing.length > 0) {
            this.logger.warn('❌ Missing components:', missing);
            return false;
        }
        
        this.logger.debug('✅ All core components found');
        return true;
    }
    
    /**
     * Fix settings manager if missing
     */
    function ensureSettingsManager() {
        if (!window.settingsManager && window.SimpleSettingsManager) {
            this.logger.debug('🔧 Creating missing settings manager...');
            window.settingsManager = new window.SimpleSettingsManager();
            return true;
        }
        return !!window.settingsManager;
    }
    
    /**
     * Check and fix API configuration
     */
    function checkAPIConfiguration() {
        if (!window.settingsManager) {
            this.logger.error('❌ Settings manager not available');
            return false;
        }
        
        try {
            const settings = window.settingsManager.getSettings();
            this.logger.debug('⚙️ Current settings:', {
                hasApiKey: !!settings.apiKey,
                provider: settings.provider || 'not set',
                model: settings.model || 'not set'
            });
            
            if (!settings.apiKey) {
                this.logger.warn('⚠️ No API key configured. Please set your API key in Settings.');
                return false;
            }
            
            return true;
        } catch (error) {
            this.logger.error('❌ Settings configuration error:', error);
            return false;
        }
    }
    
    /**
     * Test AI response generation
     */
    async function testAIResponse(testMessage = "Hello, this is a test message") {
        this.logger.debug('🧪 Testing AI response generation...');
        
        if (!window.aiModule) {
            this.logger.error('❌ AI Module not available');
            return false;
        }
        
        if (!window.settingsManager) {
            this.logger.error('❌ Settings Manager not available');
            return false;
        }
        
        try {
            const settings = window.settingsManager.getSettings();
            
            if (!settings.apiKey) {
                this.logger.error('❌ No API key configured');
                return false;
            }
            
            this.logger.debug('📤 Sending test message...');
            
            const response = await window.aiModule.generateResponse(testMessage, {
                apiKey: settings.apiKey,
                provider: settings.provider || 'google',
                model: settings.model || 'gemini-1.5-flash',
                temperature: 0.7,
                maxTokens: 100
            });
            
            if (response) {
                this.logger.debug('✅ AI Response received:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));
                return true;
            } else {
                this.logger.error('❌ Empty response received');
                return false;
            }
            
        } catch (error) {
            this.logger.error('❌ AI Response test failed:', {
                message: error.message,
                stack: error.stack
            });
            
            // Provide helpful error interpretation
            if (error.message.includes('API key')) {
                this.logger.debug('💡 Solution: Check your API key configuration in Settings');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                this.logger.debug('💡 Solution: Verify your API key is valid and has proper permissions');
            } else if (error.message.includes('429')) {
                this.logger.debug('💡 Solution: Rate limit exceeded - wait a moment and try again');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                this.logger.debug('💡 Solution: Check your internet connection');
            }
            
            return false;
        }
    }
    
    /**
     * Fix common AI assistant issues
     */
    async function fixAIAssistant() {
        this.logger.debug('🔧 === FIXING AI ASSISTANT ===');
        
        // Step 1: Ensure core components
        if (!diagnoseAIAssistant()) {
            this.logger.error('❌ Cannot fix - critical components missing');
            return false;
        }
        
        // Step 2: Ensure settings manager
        if (!ensureSettingsManager()) {
            this.logger.error('❌ Cannot create settings manager');
            return false;
        }
        
        // Step 3: Check API configuration
        if (!checkAPIConfiguration()) {
            this.logger.warn('⚠️ API configuration issue detected');
            return false;
        }
        
        // Step 4: Test AI response
        const responseTest = await testAIResponse();
        if (!responseTest) {
            this.logger.error('❌ AI response test failed');
            return false;
        }
        
        this.logger.debug('✅ AI Assistant is working properly!');
        return true;
    }
    
    /**
     * Quick setup for testing
     */
    function quickSetup(apiKey = null) {
        if (apiKey && window.settingsManager) {
            this.logger.debug('🔑 Setting API key...');
            window.settingsManager.updateSettings({
                apiKey: apiKey,
                provider: 'google',
                model: 'gemini-1.5-flash'
            });
            this.logger.debug('✅ API key configured');
        } else {
            this.logger.debug('💡 Usage: quickSetup("your-api-key-here")');
        }
    }
    
    // Make functions globally available for console testing
    window.aiAssistantFix = {
        diagnose: diagnoseAIAssistant,
        fix: fixAIAssistant,
        test: testAIResponse,
        quickSetup: quickSetup,
        checkAPI: checkAPIConfiguration
    };
    
    // Auto-run basic diagnostic on load
    setTimeout(() => {
        this.logger.debug('🤖 AI Assistant Fix loaded');
        this.logger.debug('📋 Available commands:');
        this.logger.debug('   - aiAssistantFix.diagnose() - Check system health');
        this.logger.debug('   - aiAssistantFix.fix() - Attempt to fix issues');
        this.logger.debug('   - aiAssistantFix.test() - Test AI response');
        this.logger.debug('   - aiAssistantFix.quickSetup("api-key") - Quick API setup');
        this.logger.debug('   - aiAssistantFix.checkAPI() - Check API configuration');
        
        // Auto-diagnose
        diagnoseAIAssistant();
    }, 1000);
    
})();

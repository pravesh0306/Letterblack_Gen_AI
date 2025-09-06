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
        console.log('🔍 === AI ASSISTANT DIAGNOSTIC ===');
        
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
            console.warn('❌ Missing components:', missing);
            return false;
        }
        
        console.log('✅ All core components found');
        return true;
    }
    
    /**
     * Fix settings manager if missing
     */
    function ensureSettingsManager() {
        if (!window.settingsManager && window.SimpleSettingsManager) {
            console.log('🔧 Creating missing settings manager...');
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
            console.error('❌ Settings manager not available');
            return false;
        }
        
        try {
            const settings = window.settingsManager.getSettings();
            console.log('⚙️ Current settings:', {
                hasApiKey: !!settings.apiKey,
                provider: settings.provider || 'not set',
                model: settings.model || 'not set'
            });
            
            if (!settings.apiKey) {
                console.warn('⚠️ No API key configured. Please set your API key in Settings.');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Settings configuration error:', error);
            return false;
        }
    }
    
    /**
     * Test AI response generation
     */
    async function testAIResponse(testMessage = "Hello, this is a test message") {
        console.log('🧪 Testing AI response generation...');
        
        if (!window.aiModule) {
            console.error('❌ AI Module not available');
            return false;
        }
        
        if (!window.settingsManager) {
            console.error('❌ Settings Manager not available');
            return false;
        }
        
        try {
            const settings = window.settingsManager.getSettings();
            
            if (!settings.apiKey) {
                console.error('❌ No API key configured');
                return false;
            }
            
            console.log('📤 Sending test message...');
            
            const response = await window.aiModule.generateResponse(testMessage, {
                apiKey: settings.apiKey,
                provider: settings.provider || 'google',
                model: settings.model || 'gemini-1.5-flash',
                temperature: 0.7,
                maxTokens: 100
            });
            
            if (response) {
                console.log('✅ AI Response received:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));
                return true;
            } else {
                console.error('❌ Empty response received');
                return false;
            }
            
        } catch (error) {
            console.error('❌ AI Response test failed:', {
                message: error.message,
                stack: error.stack
            });
            
            // Provide helpful error interpretation
            if (error.message.includes('API key')) {
                console.log('💡 Solution: Check your API key configuration in Settings');
            } else if (error.message.includes('401') || error.message.includes('403')) {
                console.log('💡 Solution: Verify your API key is valid and has proper permissions');
            } else if (error.message.includes('429')) {
                console.log('💡 Solution: Rate limit exceeded - wait a moment and try again');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                console.log('💡 Solution: Check your internet connection');
            }
            
            return false;
        }
    }
    
    /**
     * Fix common AI assistant issues
     */
    async function fixAIAssistant() {
        console.log('🔧 === FIXING AI ASSISTANT ===');
        
        // Step 1: Ensure core components
        if (!diagnoseAIAssistant()) {
            console.error('❌ Cannot fix - critical components missing');
            return false;
        }
        
        // Step 2: Ensure settings manager
        if (!ensureSettingsManager()) {
            console.error('❌ Cannot create settings manager');
            return false;
        }
        
        // Step 3: Check API configuration
        if (!checkAPIConfiguration()) {
            console.warn('⚠️ API configuration issue detected');
            return false;
        }
        
        // Step 4: Test AI response
        const responseTest = await testAIResponse();
        if (!responseTest) {
            console.error('❌ AI response test failed');
            return false;
        }
        
        console.log('✅ AI Assistant is working properly!');
        return true;
    }
    
    /**
     * Quick setup for testing
     */
    function quickSetup(apiKey = null) {
        if (apiKey && window.settingsManager) {
            console.log('🔑 Setting API key...');
            window.settingsManager.updateSettings({
                apiKey: apiKey,
                provider: 'google',
                model: 'gemini-1.5-flash'
            });
            console.log('✅ API key configured');
        } else {
            console.log('💡 Usage: quickSetup("your-api-key-here")');
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
        console.log('🤖 AI Assistant Fix loaded');
        console.log('📋 Available commands:');
        console.log('   - aiAssistantFix.diagnose() - Check system health');
        console.log('   - aiAssistantFix.fix() - Attempt to fix issues');
        console.log('   - aiAssistantFix.test() - Test AI response');
        console.log('   - aiAssistantFix.quickSetup("api-key") - Quick API setup');
        console.log('   - aiAssistantFix.checkAPI() - Check API configuration');
        
        // Auto-diagnose
        diagnoseAIAssistant();
    }, 1000);
    
})();

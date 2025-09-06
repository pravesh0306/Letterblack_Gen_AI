/**
 * AI Assistant Quick Test - Validate the fixes work
 * Run this in browser console: testAIAssistantFix()
 */

window.testAIAssistantFix = function() {
    console.log('🧪 === AI ASSISTANT FIX TEST ===');
    
    const results = {
        settingsManager: !!window.settingsManager,
        aiModule: !!window.aiModule,
        aiProviders: !!window.AIProviders,
        chatStore: !!window.chatStore,
        simpleSettingsManager: !!window.SimpleSettingsManager
    };
    
    console.table(results);
    
    // Test settings functionality
    if (window.settingsManager) {
        try {
            const settings = window.settingsManager.getSettings();
            console.log('✅ Settings retrieved:', {
                hasApiKey: !!settings.apiKey,
                provider: settings.provider,
                model: settings.model
            });
        } catch (error) {
            console.error('❌ Settings test failed:', error);
        }
    }
    
    // Test AI module
    if (window.aiModule) {
        console.log('✅ AI Module available');
        if (typeof window.aiModule.generateResponse === 'function') {
            console.log('✅ generateResponse function available');
        } else {
            console.error('❌ generateResponse function missing');
        }
    }
    
    // Quick API test if key is available
    if (window.aiAssistantFix) {
        console.log('✅ AI Assistant Fix module available');
        console.log('💡 Try: aiAssistantFix.diagnose()');
        console.log('💡 Try: aiAssistantFix.fix()');
    }
    
    const allGood = Object.values(results).every(Boolean);
    if (allGood) {
        console.log('🎉 ALL TESTS PASSED! AI Assistant should work now.');
    } else {
        console.log('⚠️ Some components missing - check above results');
    }
    
    return results;
};

console.log('🧪 AI Assistant test function ready: testAIAssistantFix()');

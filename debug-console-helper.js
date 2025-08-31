// Debug Console Helper for LetterBlack GenAI Extension
// Add this to your browser console when debugging

console.log('🔧 LetterBlack GenAI Debug Console Activated');

// Global debug utilities
window.DebugUtils = {
    // Test all buttons
    testAllButtons: function() {
        const buttons = document.querySelectorAll('button');
        console.log(`🔘 Found ${buttons.length} buttons:`, buttons);
        
        buttons.forEach((btn, index) => {
            console.log(`Button ${index + 1}:`, {
                id: btn.id || 'no-id',
                class: btn.className,
                text: btn.textContent?.trim(),
                visible: window.getComputedStyle(btn).display !== 'none'
            });
        });
        
        return buttons;
    },
    
    // Test API settings
    testAPISettings: function() {
        console.log('🔑 Testing API Settings...');
        
        const apiKey = localStorage.getItem('ai_api_key');
        const provider = localStorage.getItem('ai_provider');
        const model = localStorage.getItem('ai_model');
        
        console.log('Settings:', {
            hasApiKey: !!apiKey,
            provider: provider,
            model: model,
            keyLength: apiKey ? apiKey.length : 0
        });
        
        return { apiKey, provider, model };
    },
    
    // Test storage
    testStorage: function() {
        console.log('💾 Testing Storage Systems...');
        
        const results = {
            localStorage: typeof localStorage !== 'undefined',
            secureAPIStorage: typeof window.SecureAPIStorage !== 'undefined',
            chatStore: typeof window.chatStorageManager !== 'undefined'
        };
        
        console.log('Storage Status:', results);
        return results;
    },
    
    // Test modules
    testModules: function() {
        console.log('📦 Testing Module Loading...');
        
        const modules = {
            AppModules: typeof window.AppModules !== 'undefined',
            AIModule: typeof window.AIModule !== 'undefined',
            AIProviders: typeof window.AIProviders !== 'undefined',
            performanceSystem: typeof window.performanceSystem !== 'undefined'
        };
        
        console.log('Module Status:', modules);
        
        if (window.AppModules) {
            console.log('Available App Modules:', Object.keys(window.AppModules));
        }
        
        return modules;
    },
    
    // Force show panels
    showAllPanels: function() {
        console.log('👁️ Forcing all panels visible...');
        
        const hiddenElements = document.querySelectorAll('[style*="display: none"], .hidden');
        hiddenElements.forEach(el => {
            el.style.display = '';
            el.classList.remove('hidden');
        });
        
        console.log(`Made ${hiddenElements.length} elements visible`);
        return hiddenElements;
    },
    
    // Test chat functionality
    testChatInput: function(message = 'Hello, this is a test message') {
        console.log('💬 Testing Chat Input...');
        
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        
        if (chatInput && sendButton) {
            chatInput.value = message;
            chatInput.dispatchEvent(new Event('input'));
            
            console.log('Chat input set, button enabled:', !sendButton.disabled);
            return { success: true, inputFound: true, buttonEnabled: !sendButton.disabled };
        } else {
            console.log('❌ Chat elements not found');
            return { success: false, inputFound: !!chatInput, buttonFound: !!sendButton };
        }
    },
    
    // Monitor errors
    startErrorMonitoring: function() {
        console.log('🚨 Starting Error Monitoring...');
        
        const originalError = console.error;
        console.error = function(...args) {
            console.log('🔴 CAPTURED ERROR:', ...args);
            originalError.apply(console, args);
        };
        
        window.addEventListener('error', function(e) {
            console.log('🔴 GLOBAL ERROR:', e.error);
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            console.log('🔴 UNHANDLED PROMISE REJECTION:', e.reason);
        });
        
        console.log('✅ Error monitoring active');
    },
    
    // Full diagnostic
    runFullDiagnostic: function() {
        console.log('🔍 Running Full Diagnostic...');
        console.log('==================================');
        
        this.testModules();
        this.testStorage();
        this.testAPISettings();
        this.testAllButtons();
        this.startErrorMonitoring();
        
        console.log('==================================');
        console.log('✅ Full diagnostic complete');
    }
};

// Auto-run basic diagnostic
setTimeout(() => {
    console.log('🚀 Auto-running basic diagnostic...');
    window.DebugUtils.runFullDiagnostic();
}, 2000);

console.log('💡 Available Debug Commands:');
console.log('  DebugUtils.testAllButtons() - Test all buttons');
console.log('  DebugUtils.testAPISettings() - Check API configuration');
console.log('  DebugUtils.testStorage() - Test storage systems');
console.log('  DebugUtils.testModules() - Check module loading');
console.log('  DebugUtils.showAllPanels() - Force show hidden panels');
console.log('  DebugUtils.testChatInput() - Test chat functionality');
console.log('  DebugUtils.runFullDiagnostic() - Run complete diagnostic');

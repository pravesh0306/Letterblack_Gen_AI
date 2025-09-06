// Complete Chat System Diagnostic
// Run this in browser console to debug chat issues

function completeChatDiagnostic() {
    console.log("🔧 Complete Chat System Diagnostic");
    console.log("==================================");
    
    // 1. Check DOM elements
    console.log("\n1. 🔍 DOM Elements Check:");
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    console.log("chat-input element:", input);
    console.log("send-button element:", sendButton);
    console.log("chat-messages element:", chatMessages);
    
    if (input) {
        console.log("Input value:", `"${input.value}"`);
        console.log("Input maxlength:", input.getAttribute('maxlength'));
        console.log("Input disabled:", input.disabled);
    }
    
    if (sendButton) {
        console.log("Send button disabled:", sendButton.disabled);
    }
    
    // 2. Check validation function
    console.log("\n2. 📝 Validation Function Check:");
    console.log("validateText function:", typeof validateText);
    if (typeof validateText === 'function') {
        console.log("validateText('hi', 1, 1000):", validateText('hi', 1, 1000));
        console.log("validateText('', 1, 1000):", validateText('', 1, 1000));
    }
    
    // 3. Check storage system
    console.log("\n3. 💾 Storage System Check:");
    console.log("window.chatStore:", window.chatStore);
    console.log("chatStore type:", typeof window.chatStore);
    
    if (window.chatStore) {
        console.log("chatStore methods:", Object.keys(window.chatStore));
        
        // Test getConversation method
        try {
            const testConv = window.chatStore.getConversation('test');
            console.log("getConversation test:", testConv);
        } catch (error) {
            console.error("getConversation error:", error);
        }
    }
    
    // 4. Check AI module
    console.log("\n4. 🤖 AI Module Check:");
    console.log("window.aiModule:", window.aiModule);
    console.log("AI module type:", typeof window.aiModule);
    
    // 5. Check settings
    console.log("\n5. ⚙️ Settings Check:");
    console.log("window.settingsManager:", window.settingsManager);
    if (window.settingsManager) {
        try {
            const settings = window.settingsManager.getSettings();
            console.log("Settings:", {
                provider: settings.ai_provider,
                hasApiKey: !!settings.ai_api_key,
                model: settings.ai_model
            });
        } catch (error) {
            console.error("Settings error:", error);
        }
    }
    
    // 6. Check error handling functions
    console.log("\n6. 🚨 Error Handling Check:");
    console.log("showError function:", typeof showError);
    console.log("withErrorBoundary function:", typeof withErrorBoundary);
    
    // 7. Test manual message sending
    console.log("\n7. 🧪 Manual Send Test:");
    if (input && sendButton) {
        console.log("Setting test message...");
        input.value = "test message";
        
        // Trigger input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log("Input value after setting:", input.value);
        console.log("Send button disabled after input:", sendButton.disabled);
        
        // Try to enable manually
        sendButton.disabled = false;
        console.log("✅ Send button manually enabled - try clicking now!");
    }
    
    // 8. Check recent errors
    console.log("\n8. 📋 Console Errors Check:");
    console.log("Check browser console for recent errors above this diagnostic");
    
    console.log("\n🏁 Diagnostic Complete!");
    console.log("=====================================");
    
    return {
        elements: { input, sendButton, chatMessages },
        validation: typeof validateText === 'function',
        storage: !!window.chatStore,
        aiModule: !!window.aiModule,
        settings: !!window.settingsManager
    };
}

// Auto-run diagnostic
setTimeout(completeChatDiagnostic, 1000);

// Also expose for manual running
window.completeChatDiagnostic = completeChatDiagnostic;

console.log("Complete Chat System Diagnostic loaded! Run completeChatDiagnostic() anytime.");

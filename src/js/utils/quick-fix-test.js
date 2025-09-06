// Quick Fix Test - Run this in browser console to test message validation

console.log("🔧 Quick Fix Test Starting...");

// Test all the functions we fixed
console.log("1. Testing global functions:");
console.log("$ function:", typeof window.$);
console.log("validateText function:", typeof window.validateText);
console.log("showError function:", typeof window.showError);
console.log("withErrorBoundary function:", typeof window.withErrorBoundary);

// Test the elements
const input = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

console.log("\n2. Testing elements:");
console.log("Input element:", input);
console.log("Send button:", sendButton);

if (input && sendButton) {
    console.log("✅ Elements found!");
    
    // Test typing "hi"
    input.value = "hi";
    console.log("\n3. Testing validation:");
    console.log("Set input value to 'hi'");
    
    // Test validation
    if (typeof window.validateText === 'function') {
        const isValid = window.validateText("hi", 1, 1000);
        console.log("validateText('hi', 1, 1000):", isValid);
        
        if (isValid) {
            console.log("✅ Validation passed!");
            sendButton.disabled = false;
            console.log("✅ Send button enabled - try typing 'hi' and pressing Enter or clicking send!");
        } else {
            console.log("❌ Validation failed");
        }
    } else {
        console.log("❌ validateText function not found");
    }
    
    // Test settings manager
    console.log("\n4. Testing settings manager:");
    if (window.settingsManager) {
        console.log("Settings manager available");
        try {
            const theme = window.settingsManager.get('theme');
            console.log("Theme setting:", theme);
            console.log("✅ Settings manager get() method working");
        } catch (error) {
            console.log("❌ Settings manager error:", error);
        }
    }
    
    // Test chatStore
    console.log("\n5. Testing chatStore:");
    if (window.chatStore) {
        try {
            const conversation = window.chatStore.getConversation('test');
            console.log("getConversation test:", conversation);
            console.log("✅ chatStore.getConversation working");
        } catch (error) {
            console.log("❌ chatStore error:", error);
        }
    }
    
} else {
    console.log("❌ Elements not found");
    console.log("Available elements with 'chat' in id:");
    const allElements = document.querySelectorAll('*[id*="chat"]');
    allElements.forEach(el => console.log(el.id, el));
}

console.log("\n🎯 Quick fix test complete! Try typing 'hi' in the chat now!");

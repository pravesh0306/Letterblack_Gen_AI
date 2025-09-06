// Quick Chat Test - Verify Welcome Message and Response System
function testChatResponse() {
    console.log('🧪 Testing chat response system...');
    
    // Test 1: Check if welcome message appears
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages && chatMessages.children.length > 0) {
        console.log('✅ Welcome message loaded');
        console.log('Message count:', chatMessages.children.length);
    } else {
        console.log('❌ No welcome message found');
        // Manually trigger welcome
        if (window.showWelcomeMessage) {
            window.showWelcomeMessage();
            console.log('🔧 Manually triggered welcome message');
        }
    }
    
    // Test 2: Simulate sending a test message
    const testMessage = "hi";
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    if (chatInput && sendButton) {
        console.log('📝 Simulating message send...');
        chatInput.value = testMessage;
        
        // Enable send button
        sendButton.disabled = false;
        
        // Trigger send (simulate click)
        setTimeout(() => {
            sendButton.click();
            console.log('✅ Test message sent:', testMessage);
            
            // Check for response after 2 seconds
            setTimeout(() => {
                const messageCount = chatMessages ? chatMessages.children.length : 0;
                console.log('📊 Total messages after test:', messageCount);
                
                if (messageCount >= 2) {
                    console.log('✅ Chat response system working!');
                } else {
                    console.log('⚠️ No response received - check AI configuration');
                }
            }, 2000);
        }, 1000);
    } else {
        console.log('❌ Chat input/send button not found');
    }
}

// Auto-run test after page loads
setTimeout(testChatResponse, 3000);

// Make available globally
window.testChatResponse = testChatResponse;

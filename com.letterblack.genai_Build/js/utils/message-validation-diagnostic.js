// Enhanced AI Message Validation Diagnostic
// Run this in the browser console to debug message validation issues

function diagnoseMessageValidation() {
    console.log("🔍 Enhanced AI Message Validation Diagnosis...");
    
    // Test 1: Check DOM elements by different selectors
    console.log("\n1. Testing DOM element selection:");
    const inputById = document.getElementById('chat-input');
    const inputByQuery = document.querySelector('#chat-input');
    const inputByTag = document.querySelector('textarea');
    const sendButtonById = document.getElementById('send-button');
    const sendButtonByQuery = document.querySelector('#send-button');
    
    console.log("Input by ID:", inputById);
    console.log("Input by querySelector:", inputByQuery);
    console.log("Input by tag:", inputByTag);
    console.log("Send button by ID:", sendButtonById);
    console.log("Send button by querySelector:", sendButtonByQuery);
    
    // Test 2: Check $ function
    console.log("\n2. Testing $ selector function:");
    const dollarFunction = window.$ || (typeof $ !== 'undefined' ? $ : null);
    if (dollarFunction) {
        console.log("✅ $ function available");
        console.log("$('#chat-input'):", dollarFunction('#chat-input'));
        console.log("$('#send-button'):", dollarFunction('#send-button'));
    } else {
        console.log("❌ $ function not available");
    }
    
    // Test 3: Check validateText function
    console.log("\n3. Testing validateText function:");
    if (typeof validateText === 'function') {
        console.log("✅ validateText function exists");
        console.log("validateText('hi', 1, 1000):", validateText('hi', 1, 1000));
        console.log("validateText('', 1, 1000):", validateText('', 1, 1000));
        console.log("validateText('test message', 1, 1000):", validateText('test message', 1, 1000));
    } else {
        console.log("❌ validateText function not found");
        // Try to find it in global scope
        console.log("Checking window.validateText:", window.validateText);
    }
    
    // Test 4: Check input element properties
    console.log("\n4. Checking input element properties:");
    const input = inputById || inputByQuery || inputByTag;
    if (input) {
        console.log("✅ Input element found:", input);
        console.log("Input value:", `"${input.value}"`);
        console.log("Input value trimmed:", `"${input.value.trim()}"`);
        console.log("Input value length:", input.value.trim().length);
        console.log("Input maxlength attribute:", input.getAttribute('maxlength'));
        console.log("Input placeholder:", input.placeholder);
        console.log("Input disabled:", input.disabled);
        console.log("Input readonly:", input.readOnly);
    } else {
        console.log("❌ No input element found");
    }
    
    // Test 5: Check if UI bootstrap is loaded
    console.log("\n5. Checking UI initialization:");
    console.log("initChatComposer function:", typeof window.initChatComposer);
    
    // Test 6: Test manual message sending
    console.log("\n6. Manual send test:");
    const testMessage = "hi";
    if (input) {
        console.log("Setting input value to:", testMessage);
        input.value = testMessage;
        console.log("Input value after setting:", input.value);
        
        // Trigger input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Check send button state
        const sendBtn = sendButtonById || sendButtonByQuery;
        if (sendBtn) {
            console.log("Send button disabled:", sendBtn.disabled);
        }
    }
    
    // Test 7: Check for error handlers
    console.log("\n7. Checking error handling:");
    console.log("showError function:", typeof window.showError);
    console.log("withErrorBoundary function:", typeof window.withErrorBoundary);
    
    // Test 8: Try to manually trigger validation
    console.log("\n8. Manual validation trigger:");
    if (input && typeof validateText === 'function') {
        const val = input.value.trim();
        const maxLen = parseInt(input.getAttribute('maxlength')) || 1000;
        const isValid = validateText(val, 1, maxLen);
        console.log(`Manual validation: validateText("${val}", 1, ${maxLen}) = ${isValid}`);
    }
    
    console.log("\n🏁 Enhanced diagnosis complete!");
    
    // Return diagnostic data
    return {
        input: input,
        sendButton: sendButtonById || sendButtonByQuery,
        dollarFunction: dollarFunction,
        validateText: typeof validateText === 'function',
        inputValue: input ? input.value : 'N/A'
    };
}

// Auto-run diagnosis
console.log("Enhanced AI Message Validation Diagnostic Tool Loaded!");
console.log("Run diagnoseMessageValidation() to check for issues.");

// Run automatically after DOM is ready
function runDiagnosticWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(diagnoseMessageValidation, 500);
        });
    } else {
        setTimeout(diagnoseMessageValidation, 500);
    }
}

runDiagnosticWhenReady();

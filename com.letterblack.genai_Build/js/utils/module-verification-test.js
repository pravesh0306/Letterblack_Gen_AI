// Module Verification Test - Post-Fix Validation
// Tests all critical components after duplicate removal and global exports

function runModuleVerificationTest() {
    console.log('🧪 === MODULE VERIFICATION TEST ===');
    
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 0, total: 0 }
    };
    
    // Test 1: ChatStorageManager class availability
    const test1 = {
        name: 'ChatStorageManager Class Export',
        status: typeof window.ChatStorageManager === 'function' ? 'PASS' : 'FAIL',
        value: typeof window.ChatStorageManager,
        expected: 'function'
    };
    testResults.tests.push(test1);
    
    // Test 2: chatStorageManager instance availability
    const test2 = {
        name: 'chatStorageManager Instance',
        status: (window.chatStorageManager && typeof window.chatStorageManager === 'object') ? 'PASS' : 'FAIL',
        value: typeof window.chatStorageManager,
        expected: 'object'
    };
    testResults.tests.push(test2);
    
    // Test 3: chatStore availability
    const test3 = {
        name: 'chatStore Instance',
        status: (window.chatStore && typeof window.chatStore === 'object') ? 'PASS' : 'FAIL',
        value: typeof window.chatStore,
        expected: 'object'
    };
    testResults.tests.push(test3);
    
    // Test 4: BrowserChatStore class availability
    const test4 = {
        name: 'BrowserChatStore Class',
        status: typeof window.BrowserChatStore === 'function' ? 'PASS' : 'FAIL',
        value: typeof window.BrowserChatStore,
        expected: 'function'
    };
    testResults.tests.push(test4);
    
    // Test 5: aiModule availability
    const test5 = {
        name: 'aiModule Instance',
        status: (window.aiModule && typeof window.aiModule === 'object') ? 'PASS' : 'FAIL',
        value: typeof window.aiModule,
        expected: 'object'
    };
    testResults.tests.push(test5);
    
    // Test 6: settingsManager availability
    const test6 = {
        name: 'settingsManager Instance',
        status: (window.settingsManager && typeof window.settingsManager === 'object') ? 'PASS' : 'FAIL',
        value: typeof window.settingsManager,
        expected: 'object'
    };
    testResults.tests.push(test6);
    
    // Calculate summary
    testResults.tests.forEach(test => {
        testResults.summary.total++;
        if (test.status === 'PASS') {
            testResults.summary.passed++;
        } else {
            testResults.summary.failed++;
        }
    });
    
    // Display results
    console.table(testResults.tests.map(t => ({
        Test: t.name,
        Status: t.status,
        Actual: t.value,
        Expected: t.expected
    })));
    
    console.log(`📊 SUMMARY: ${testResults.summary.passed}/${testResults.summary.total} tests passed`);
    
    if (testResults.summary.failed === 0) {
        console.log('🎉 ALL TESTS PASSED - Module loading is working correctly!');
    } else {
        console.log('❌ Some tests failed - check console for details');
    }
    
    // Store results globally for inspection
    window.moduleVerificationResults = testResults;
    
    return testResults;
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runModuleVerificationTest, 2000); // Wait 2s for modules to load
    });
} else {
    setTimeout(runModuleVerificationTest, 2000);
}

// Make available globally
window.runModuleVerificationTest = runModuleVerificationTest;

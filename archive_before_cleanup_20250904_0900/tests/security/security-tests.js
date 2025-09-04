/**
 * Security Test Suite
 * Tests the security framework implementation
 */

console.log('🔐 Running Security Tests...');

// Test 1: API Key Encryption
async function testAPIKeySecurity() {
    console.log('📝 Testing API Key Security...');
    
    try {
        if (typeof SecureAPIStorage === 'undefined') {
            throw new Error('SecureAPIStorage not available');
        }

        const storage = new SecureAPIStorage();
        const testKey = 'test-secret-key-12345';
        
        await storage.setItem('test_api_key', testKey);
        const retrieved = await storage.getItem('test_api_key');
        
        // Check if it's properly encrypted in localStorage
        const rawStorage = localStorage.getItem('test_api_key');
        
        if (rawStorage === testKey) {
            throw new Error('❌ API key not encrypted in storage!');
        }
        
        if (retrieved !== testKey) {
            throw new Error('❌ API key decryption failed!');
        }
        
        // Cleanup
        await storage.removeItem('test_api_key');
        
        console.log('✅ API Key Security: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ API Key Security: FAILED -', error.message);
        return false;
    }
}

// Test 2: Input Validation
function testInputValidation() {
    console.log('📝 Testing Input Validation...');
    
    try {
        if (typeof InputValidator === 'undefined') {
            throw new Error('InputValidator not available');
        }

        const validator = new InputValidator();
        
        // Test XSS protection
        const xssPayload = '<script>alert("XSS")</script>';
        const result = validator.validateText(xssPayload);
        
        if (result.valid) {
            throw new Error('❌ XSS payload not blocked!');
        }
        
        // Test safe input
        const safeInput = 'Hello, world!';
        const safeResult = validator.validateText(safeInput);
        
        if (!safeResult.valid) {
            throw new Error('❌ Safe input rejected!');
        }
        
        console.log('✅ Input Validation: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ Input Validation: FAILED -', error.message);
        return false;
    }
}

// Test 3: Error Handler
function testErrorHandler() {
    console.log('📝 Testing Error Handler...');
    
    try {
        if (typeof ErrorHandler === 'undefined') {
            throw new Error('ErrorHandler not available');
        }

        const handler = new ErrorHandler();
        
        // Test error handling
        const testError = new Error('Test error');
        handler.handleError(testError, 'test-context');
        
        console.log('✅ Error Handler: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ Error Handler: FAILED -', error.message);
        return false;
    }
}

// Test 4: Memory Manager
function testMemoryManager() {
    console.log('📝 Testing Memory Manager...');
    
    try {
        if (typeof MemoryManager === 'undefined') {
            console.log('⚠️ Memory Manager: OPTIONAL - Not available');
            return true;
        }

        const manager = new MemoryManager();
        const stats = manager.getMemoryStats();
        
        if (typeof stats !== 'object') {
            throw new Error('❌ Memory stats not returned!');
        }
        
        console.log('✅ Memory Manager: PASSED');
        return true;
        
    } catch (error) {
        console.error('❌ Memory Manager: FAILED -', error.message);
        return false;
    }
}

// Run all tests
async function runSecurityTests() {
    console.log('🚀 Starting Security Test Suite...\n');
    
    const tests = [
        testAPIKeySecurity,
        testInputValidation,
        testErrorHandler,
        testMemoryManager
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            failed++;
        }
        console.log(''); // Add spacing
    }
    
    console.log('📊 Security Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
    
    if (failed === 0) {
        console.log('🎉 All security tests passed! Extension is secure.');
    } else {
        console.log('⚠️ Some security tests failed. Please review and fix issues.');
    }
    
    return failed === 0;
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    // Run tests after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runSecurityTests, 2000); // Wait for modules to load
        });
    } else {
        setTimeout(runSecurityTests, 2000);
    }
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runSecurityTests };
}

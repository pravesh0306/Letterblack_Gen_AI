/**
 * Test Runner
 * Orchestrates all test suites
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Adobe AI Extension Test Runner');
console.log('================================\n');

// Test configuration
const testConfig = {
    security: {
        enabled: true,
        path: './security/security-tests.js'
    },
    integration: {
        enabled: false, // Not implemented yet
        path: './integration/integration-tests.js'
    },
    unit: {
        enabled: false, // Not implemented yet
        path: './unit/unit-tests.js'
    }
};

async function runTests() {
    console.log('📋 Test Configuration:');
    Object.entries(testConfig).forEach(([suite, config]) => {
        const status = config.enabled ? '✅ Enabled' : '⏸️ Disabled';
        console.log(`  ${suite}: ${status}`);
    });
    console.log('');

    let totalPassed = 0;
    let totalFailed = 0;

    // Run enabled test suites
    for (const [suiteName, config] of Object.entries(testConfig)) {
        if (!config.enabled) {
            console.log(`⏸️ Skipping ${suiteName} tests (disabled)`);
            continue;
        }

        console.log(`🔍 Running ${suiteName} tests...`);
        
        try {
            const testPath = path.resolve(__dirname, config.path);
            
            if (!fs.existsSync(testPath)) {
                console.log(`⚠️ Test file not found: ${testPath}`);
                continue;
            }

            // For security tests, we need browser environment
            if (suiteName === 'security') {
                console.log('📝 Security tests require browser environment');
                console.log('   Run by opening src/index.html and checking console');
                console.log('   Or include security-tests.js in your HTML');
                continue;
            }

            // For other tests, we can run directly
            const testModule = require(testPath);
            if (testModule.runTests) {
                const result = await testModule.runTests();
                if (result.passed !== undefined) {
                    totalPassed += result.passed;
                    totalFailed += result.failed;
                }
            }

        } catch (error) {
            console.error(`❌ Error running ${suiteName} tests:`, error.message);
            totalFailed++;
        }
        
        console.log('');
    }

    // Final summary
    console.log('📊 Overall Test Summary:');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    
    if (totalFailed === 0) {
        console.log('🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️ Some tests failed. Please review and fix issues.');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests };

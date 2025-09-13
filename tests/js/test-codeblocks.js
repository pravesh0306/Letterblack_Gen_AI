// ============================================
// TEST CODE BLOCKS JAVASCRIPT - EXTRACTED FROM WORKING EXTENSION
// ============================================

console.log('🧪 Loading test code blocks...');

// Test logging function
function logTest(message, type = 'info') {
    const testLog = document.getElementById('test-log');
    if (!testLog) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `test-${type}`;
    logEntry.innerHTML = `[${timestamp}] ${message}`;
    testLog.appendChild(logEntry);
    testLog.scrollTop = testLog.scrollHeight;
}

// Test copy function - COPIED FROM WORKING EXTENSION
function testCopyCode(blockId) {
    logTest(`🔄 testCopyCode called with blockId: ${blockId}`, 'info');
    
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) {
        logTest(`❌ Code block not found: ${blockId}`, 'error');
        return;
    }

    const codeElement = codeBlock.querySelector('code');
    if (!codeElement) {
        logTest(`❌ Code element not found in: ${blockId}`, 'error');
        return;
    }

    const code = codeElement.textContent;
    logTest(`📋 Extracted code: "${code}"`, 'info');

    // Test multiple copy methods
    testCopyToClipboard(code, codeBlock);
}

function testCopyToClipboard(code, codeBlock) {
    logTest('🔄 Testing clipboard copy methods...', 'info');
    
    // Method 1: Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        logTest('📋 Trying modern clipboard API...', 'info');
        navigator.clipboard.writeText(code).then(() => {
            logTest('✅ Modern clipboard API successful!', 'success');
            showTestCopySuccess(codeBlock);
        }).catch((err) => {
            logTest(`❌ Modern clipboard API failed: ${err.message}`, 'error');
            testFallbackCopy(code, codeBlock);
        });
        return;
    }

    // Method 2: Fallback methods
    testFallbackCopy(code, codeBlock);
}

function testFallbackCopy(code, codeBlock) {
    logTest('🔄 Trying fallback copy methods...', 'info');
    
    try {
        // Create temporary textarea
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.left = '-999999px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, 99999); // For mobile devices
        
        const success = document.execCommand('copy');
        document.body.removeChild(ta);
        
        if (success) {
            logTest('✅ Fallback copy successful!', 'success');
            showTestCopySuccess(codeBlock);
        } else {
            throw new Error('execCommand returned false');
        }
    } catch (err) {
        logTest(`❌ Fallback copy failed: ${err.message}`, 'error');
        
        // Final fallback: prompt user
        logTest('💡 Showing manual copy prompt...', 'info');
        alert(`Please copy this code manually:\n\n${code}`);
    }
}

function showTestCopySuccess(codeBlock) {
    const copyBtn = codeBlock.querySelector('.copy-btn');
    if (!copyBtn) return;
    
    // Save original state
    const originalText = copyBtn.innerHTML;
    const originalClass = copyBtn.className;
    
    // Show success state
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.className = originalClass + ' success';
    copyBtn.disabled = true;
    
    // Reset after 2 seconds
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.className = originalClass;
        copyBtn.disabled = false;
    }, 2000);
}

// Test apply function - COPIED FROM WORKING EXTENSION  
function testApplyCode(blockId) {
    logTest(`🔄 testApplyCode called with blockId: ${blockId}`, 'info');
    
    const codeBlock = document.getElementById(blockId);
    if (!codeBlock) {
        logTest(`❌ Code block not found: ${blockId}`, 'error');
        return;
    }

    const codeElement = codeBlock.querySelector('code');
    if (!codeElement) {
        logTest(`❌ Code element not found in: ${blockId}`, 'error');
        return;
    }

    const code = codeElement.textContent;
    logTest(`🎯 Applying code: "${code}"`, 'info');

    // Test After Effects integration
    if (typeof CSInterface !== 'undefined') {
        logTest('🎬 CSInterface detected - testing AE integration...', 'info');
        testAfterEffectsApply(code);
    } else {
        logTest('⚠️ CSInterface not detected - simulating AE apply...', 'info');
        testSimulateApply(code);
    }
}

function testAfterEffectsApply(code) {
    try {
        const cs = new CSInterface();
        const script = `
            try {
                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    "ERROR: No active composition";
                } else {
                    var selectedProps = comp.selectedProperties;
                    if (selectedProps.length === 0) {
                        "ERROR: No properties selected";
                    } else {
                        var prop = selectedProps[0];
                        if (prop.canSetExpression) {
                            prop.expression = "${code.replace(/"/g, '\\"')}";
                            "SUCCESS: Expression applied to " + prop.name;
                        } else {
                            "ERROR: Cannot set expression on this property";
                        }
                    }
                }
            } catch (e) {
                "ERROR: " + e.toString();
            }
        `;
        
        cs.evalScript(script, (result) => {
            if (result.startsWith('SUCCESS:')) {
                logTest(`✅ ${result}`, 'success');
                showTestApplySuccess();
            } else {
                logTest(`❌ ${result}`, 'error');
            }
        });
    } catch (err) {
        logTest(`❌ AE integration error: ${err.message}`, 'error');
    }
}

function testSimulateApply(code) {
    // Simulate successful apply for testing
    setTimeout(() => {
        logTest('✅ SIMULATION: Expression would be applied to selected property', 'success');
        logTest(`📝 Code that would be applied: "${code}"`, 'info');
        showTestApplySuccess();
    }, 500);
}

function showTestApplySuccess() {
    logTest('🎉 Apply operation completed successfully!', 'success');
}

// Initialize test when page loads
document.addEventListener('DOMContentLoaded', function() {
    logTest('🧪 Test code blocks initialized', 'success');
    logTest('👆 Click the Copy or Apply buttons above to test functionality', 'info');
    
    // Test CSInterface detection
    if (typeof CSInterface !== 'undefined') {
        logTest('🎬 After Effects integration available', 'success');
    } else {
        logTest('⚠️ After Effects integration not available (will simulate)', 'info');
    }
});

// Global test functions for manual testing in console
window.testFunctions = {
    copyCode: testCopyCode,
    applyCode: testApplyCode,
    logTest: logTest
};

console.log('🧪 Test code blocks loaded successfully!');

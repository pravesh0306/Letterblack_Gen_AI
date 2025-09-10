/**
 * LetterBlack Gen AI - Browser Diagnostic Script
 * Run this in the browser console (F12) inside the extension panel
 */

window.runDiagnostics = function() {
    console.clear();
    console.log('🔍 LetterBlack Gen AI Browser Diagnostics');
    console.log('=========================================');

    const results = {
        modules: {},
        functions: {},
        dom: {},
        processing: {}
    };

    // Check AI Module
    console.log('\n🤖 AI Module Check:');
    if (window.aiModule) {
        console.log('✅ window.aiModule exists');
        results.modules.aiModule = true;

        const functions = ['formatResponseForChat', 'createProfessionalCodeBlock', 'detectCodeType', 'escapeHtml'];
        functions.forEach(func => {
            if (typeof window.aiModule[func] === 'function') {
                console.log(`✅ ${func} function available`);
                results.functions[func] = true;
            } else {
                console.log(`❌ ${func} function missing`);
                results.functions[func] = false;
            }
        });
    } else {
        console.log('❌ window.aiModule not found');
        results.modules.aiModule = false;
    }

    // Check Global Functions
    console.log('\n🔧 Global Functions Check:');
    const globalFuncs = ['testProfessionalCodeBlocks', 'copyToExpressionBox', 'viewFullCode', 'escapeHtml'];
    globalFuncs.forEach(func => {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func} available globally`);
            results.functions[func] = true;
        } else {
            console.log(`❌ ${func} missing globally`);
            results.functions[func] = false;
        }
    });

    // Check DOM Elements
    console.log('\n📄 DOM Elements Check:');
    const elements = ['#chat-messages', '#user-input', '#send-button'];
    elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`✅ Element found: ${selector}`);
            results.dom[selector] = true;
        } else {
            console.log(`❌ Element missing: ${selector}`);
            results.dom[selector] = false;
        }
    });

    // Check CSS Classes
    console.log('\n🎨 CSS Classes Check:');
    const cssClasses = ['code-block-container', 'code-header', 'copy-btn', 'apply-btn'];
    cssClasses.forEach(className => {
        const testDiv = document.createElement('div');
        testDiv.className = className;
        document.body.appendChild(testDiv);
        const styles = window.getComputedStyle(testDiv);
        const hasStyles = styles.display !== 'inline' || styles.background !== 'rgba(0, 0, 0, 0)';
        document.body.removeChild(testDiv);

        if (hasStyles) {
            console.log(`✅ CSS class styled: .${className}`);
            results.dom[className] = true;
        } else {
            console.log(`❌ CSS class not styled: .${className}`);
            results.dom[className] = false;
        }
    });

    // Test Processing Pipeline
    console.log('\n⚙️ Processing Pipeline Test:');
    if (window.aiModule && typeof window.aiModule.formatResponseForChat === 'function') {
        try {
            const testCode = 'Here is a test:\n\n```javascript\nwiggle(2, 30)\n```\n\nEnd test.';
            const formatted = window.aiModule.formatResponseForChat(testCode);

            console.log(`✅ formatResponseForChat executed successfully`);
            console.log(`📝 Input length: ${testCode.length}`);
            console.log(`🎨 Output length: ${formatted.length}`);

            const hasCodeContainer = formatted.includes('code-block-container');
            const hasCodeHeader = formatted.includes('code-header');
            const hasCopyBtn = formatted.includes('copy-btn');

            console.log(`✅ Contains code-block-container: ${hasCodeContainer}`);
            console.log(`✅ Contains code-header: ${hasCodeHeader}`);
            console.log(`✅ Contains copy-btn: ${hasCopyBtn}`);

            results.processing.formatSuccess = true;
            results.processing.hasContainers = hasCodeContainer;
            results.processing.hasHeaders = hasCodeHeader;
            results.processing.hasButtons = hasCopyBtn;

        } catch (error) {
            console.log(`❌ formatResponseForChat failed: ${error.message}`);
            results.processing.formatSuccess = false;
        }
    } else {
        console.log('❌ Cannot test processing - formatResponseForChat not available');
        results.processing.formatSuccess = false;
    }

    // Generate Report
    console.log('\n📊 Diagnostic Results Summary:');
    console.log('==============================');

    const moduleScore = Object.values(results.modules).filter(v => v).length;
    const functionScore = Object.values(results.functions).filter(v => v).length;
    const domScore = Object.values(results.dom).filter(v => v).length;
    const processingScore = Object.values(results.processing).filter(v => v).length;

    const totalChecks = Object.keys(results.modules).length +
                       Object.keys(results.functions).length +
                       Object.keys(results.dom).length +
                       Object.keys(results.processing).length;
    const passedChecks = moduleScore + functionScore + domScore + processingScore;

    console.log(`📈 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
    console.log(`🤖 Modules: ${moduleScore}/${Object.keys(results.modules).length}`);
    console.log(`🔧 Functions: ${functionScore}/${Object.keys(results.functions).length}`);
    console.log(`📄 DOM/CSS: ${domScore}/${Object.keys(results.dom).length}`);
    console.log(`⚙️ Processing: ${processingScore}/${Object.keys(results.processing).length}`);

    if (passedChecks === totalChecks) {
        console.log('\n🎉 All diagnostics passed! Professional code blocks should work.');
        console.log('💡 Try: testProfessionalCodeBlocks()');
    } else {
        console.log('\n⚠️ Some diagnostics failed. Check the issues above.');
        if (results.processing.formatSuccess === false) {
            console.log('🔍 Main issue: formatResponseForChat not working properly');
        }
    }

    return results;
};

// Auto-run diagnostics when loaded
if (document.readyState === 'complete') {
    console.log('🚀 Auto-running diagnostics...');
    setTimeout(() => window.runDiagnostics(), 1000);
} else {
    window.addEventListener('load', () => {
        console.log('🚀 Auto-running diagnostics...');
        setTimeout(() => window.runDiagnostics(), 1000);
    });
}


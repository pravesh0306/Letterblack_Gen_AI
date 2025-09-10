/**
 * LetterBlack Gen AI - Browser Diagnostic Script
 * Run this in the browser console (F12) inside the extension panel
 */

window.runDiagnostics = function() {
    console.clear();
    this.logger.debug('🔍 LetterBlack Gen AI Browser Diagnostics');
    this.logger.debug('=========================================');
    
    const results = {
        modules: {},
        functions: {},
        dom: {},
        processing: {}
    };
    
    // Check AI Module
    this.logger.debug('\n🤖 AI Module Check:');
    if (window.aiModule) {
        this.logger.debug('✅ window.aiModule exists');
        results.modules.aiModule = true;
        
        const functions = ['formatResponseForChat', 'createProfessionalCodeBlock', 'detectCodeType', 'escapeHtml'];
        functions.forEach(func => {
            if (typeof window.aiModule[func] === 'function') {
                this.logger.debug(`✅ ${func} function available`);
                results.functions[func] = true;
            } else {
                this.logger.debug(`❌ ${func} function missing`);
                results.functions[func] = false;
            }
        });
    } else {
        this.logger.debug('❌ window.aiModule not found');
        results.modules.aiModule = false;
    }
    
    // Check Global Functions
    this.logger.debug('\n🔧 Global Functions Check:');
    const globalFuncs = ['testProfessionalCodeBlocks', 'copyToExpressionBox', 'viewFullCode', 'escapeHtml'];
    globalFuncs.forEach(func => {
        if (typeof window[func] === 'function') {
            this.logger.debug(`✅ ${func} available globally`);
            results.functions[func] = true;
        } else {
            this.logger.debug(`❌ ${func} missing globally`);
            results.functions[func] = false;
        }
    });
    
    // Check DOM Elements
    this.logger.debug('\n📄 DOM Elements Check:');
    const elements = ['#chat-messages', '#user-input', '#send-button'];
    elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            this.logger.debug(`✅ Element found: ${selector}`);
            results.dom[selector] = true;
        } else {
            this.logger.debug(`❌ Element missing: ${selector}`);
            results.dom[selector] = false;
        }
    });
    
    // Check CSS Classes
    this.logger.debug('\n🎨 CSS Classes Check:');
    const cssClasses = ['code-block-container', 'code-header', 'copy-btn', 'apply-btn'];
    cssClasses.forEach(className => {
        const testDiv = document.createElement('div');
        testDiv.className = className;
        document.body.appendChild(testDiv);
        const styles = window.getComputedStyle(testDiv);
        const hasStyles = styles.display !== 'inline' || styles.background !== 'rgba(0, 0, 0, 0)';
        document.body.removeChild(testDiv);
        
        if (hasStyles) {
            this.logger.debug(`✅ CSS class styled: .${className}`);
            results.dom[className] = true;
        } else {
            this.logger.debug(`❌ CSS class not styled: .${className}`);
            results.dom[className] = false;
        }
    });
    
    // Test Processing Pipeline
    this.logger.debug('\n⚙️ Processing Pipeline Test:');
    if (window.aiModule && typeof window.aiModule.formatResponseForChat === 'function') {
        try {
            const testCode = 'Here is a test:\n\n```javascript\nwiggle(2, 30)\n```\n\nEnd test.';
            const formatted = window.aiModule.formatResponseForChat(testCode);
            
            this.logger.debug(`✅ formatResponseForChat executed successfully`);
            this.logger.debug(`📝 Input length: ${testCode.length}`);
            this.logger.debug(`🎨 Output length: ${formatted.length}`);
            
            const hasCodeContainer = formatted.includes('code-block-container');
            const hasCodeHeader = formatted.includes('code-header');
            const hasCopyBtn = formatted.includes('copy-btn');
            
            this.logger.debug(`✅ Contains code-block-container: ${hasCodeContainer}`);
            this.logger.debug(`✅ Contains code-header: ${hasCodeHeader}`);
            this.logger.debug(`✅ Contains copy-btn: ${hasCopyBtn}`);
            
            results.processing.formatSuccess = true;
            results.processing.hasContainers = hasCodeContainer;
            results.processing.hasHeaders = hasCodeHeader;
            results.processing.hasButtons = hasCopyBtn;
            
        } catch (error) {
            this.logger.debug(`❌ formatResponseForChat failed: ${error.message}`);
            results.processing.formatSuccess = false;
        }
    } else {
        this.logger.debug('❌ Cannot test processing - formatResponseForChat not available');
        results.processing.formatSuccess = false;
    }
    
    // Generate Report
    this.logger.debug('\n📊 Diagnostic Results Summary:');
    this.logger.debug('==============================');
    
    const moduleScore = Object.values(results.modules).filter(v => v).length;
    const functionScore = Object.values(results.functions).filter(v => v).length;
    const domScore = Object.values(results.dom).filter(v => v).length;
    const processingScore = Object.values(results.processing).filter(v => v).length;
    
    const totalChecks = Object.keys(results.modules).length + 
                       Object.keys(results.functions).length + 
                       Object.keys(results.dom).length + 
                       Object.keys(results.processing).length;
    const passedChecks = moduleScore + functionScore + domScore + processingScore;
    
    this.logger.debug(`📈 Overall Score: ${passedChecks}/${totalChecks} checks passed`);
    this.logger.debug(`🤖 Modules: ${moduleScore}/${Object.keys(results.modules).length}`);
    this.logger.debug(`🔧 Functions: ${functionScore}/${Object.keys(results.functions).length}`);
    this.logger.debug(`📄 DOM/CSS: ${domScore}/${Object.keys(results.dom).length}`);
    this.logger.debug(`⚙️ Processing: ${processingScore}/${Object.keys(results.processing).length}`);
    
    if (passedChecks === totalChecks) {
        this.logger.debug('\n🎉 All diagnostics passed! Professional code blocks should work.');
        this.logger.debug('💡 Try: testProfessionalCodeBlocks()');
    } else {
        this.logger.debug('\n⚠️ Some diagnostics failed. Check the issues above.');
        if (results.processing.formatSuccess === false) {
            this.logger.debug('🔍 Main issue: formatResponseForChat not working properly');
        }
    }
    
    return results;
};

// Auto-run diagnostics when loaded
if (document.readyState === 'complete') {
    this.logger.debug('🚀 Auto-running diagnostics...');
    setTimeout(() => window.runDiagnostics(), 1000);
} else {
    window.addEventListener('load', () => {
        this.logger.debug('🚀 Auto-running diagnostics...');
        setTimeout(() => window.runDiagnostics(), 1000);
    });
}

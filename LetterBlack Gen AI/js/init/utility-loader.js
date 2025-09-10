/**
 * Utility Module Loader - LetterBlack GenAI
 * Handles dynamic loading of utility modules
 */

// Dynamic script loader for utilities
function loadUtilityModule(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            this.logger.debug(`✅ Loaded: ${src}`);
            resolve();
        };
        script.onerror = () => {
            this.logger.warn(`⚠️ Failed to load: ${src}`);
            resolve(); // Don't fail - continue loading other modules
        };
        document.head.appendChild(script);
    });
}

// Load utility modules in order
async function loadUtilityModules() {
    this.logger.debug('📦 Loading utility modules...');
    
    const utilityModules = [
        'js/utils/performance-cache.js',
        'js/utils/enhanced-chat-memory.js', 
        'js/utils/youtube-tutorial-helper.js',
        'js/utils/browser-video-transcriber.js',
        'js/browser-diagnostics.js'
    ];
    
    for (const module of utilityModules) {
        await loadUtilityModule(module);
    }
    
    this.logger.debug('📦 Utility modules loading completed');
}

// Load modules when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUtilityModules);
} else {
    loadUtilityModules();
}

// Export for global access
window.loadUtilityModule = loadUtilityModule;
window.loadUtilityModules = loadUtilityModules;

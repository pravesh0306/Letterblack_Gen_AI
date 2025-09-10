/**
 * Core Utilities - Consolidated Core System Modules
 * Combines: constants.js, floating-mascot-config.js
 * Excludes: api-settings-storage.js (deprecated/insecure)
 */

// ===== APPLICATION CONSTANTS =====
// Central place for magic numbers, timeouts, and sizing thresholds
const APP_CONSTANTS = Object.freeze({
    INIT_DELAY_MS: 1000,
    BOTTOM_PANEL: Object.freeze({
        DEFAULT_HEIGHT: 300,
        MIN_HEIGHT: 140,
        MAX_HEIGHT_RATIO: 0.8
    }),
    CHAR_LIMIT: 1000,
    PRESET_SCALE: Object.freeze({
        GRID_ENABLE_THRESHOLD: 0.9,
        GRID_DISABLE_THRESHOLD: 1.1
    }),
    // Additional constants for JavaScript version
    ANIMATION: Object.freeze({
        MASCOT_SPIN_DURATION: 800,
        BUBBLE_POP_DURATION: 600,
        FADE_DURATION: 300
    }),
    UI: Object.freeze({
        TOOLBAR_ICON_SIZE: 0.85, // FontAwesome scaling
        COMMAND_PALETTE_WIDTH: 400,
        STATUS_BAR_HEIGHT: 24
    })
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APP_CONSTANTS };
}

// Global availability
if (typeof window !== 'undefined') {
    window.APP_CONSTANTS = APP_CONSTANTS;
}

// ===== FLOATING MASCOT CONFIGURATION =====
// Configuration for the floating mascot system
const FLOATING_MASCOT_CONFIG = {
    // Position settings
    defaultPosition: { bottom: '20px', right: '20px' },
    draggable: true,
    
    // Size settings
    size: 70,
    hoverScale: 1.02,
    dragScale: 1.1,
    
    // Animation settings
    animationDuration: 200,
    notificationDuration: 4000,
    
    // Notification settings
    showTooltips: true,
    notificationPosition: 'left', // 'left', 'right', 'top', 'bottom'
    
    // Storage
    positionStorageKey: 'letterblack_floating_mascot_position'
};

// Initialize floating mascot when DOM is ready
function initializeFloatingMascot() {
    if (window.FloatingMascot && !window.floatingMascot) {
        this.logger.debug('🎭 Initializing Floating Mascot...');
        
        try {
            window.floatingMascot = new window.FloatingMascot(FLOATING_MASCOT_CONFIG);
            
            // Set initial state
            window.floatingMascot.setTooltip('LetterBlack GenAI Ready! 🚀');
            
            // Demo notification after initialization
            setTimeout(() => {
                if (window.floatingMascot) {
                    window.floatingMascot.info('🎉 Floating mascot loaded successfully!');
                }
            }, 1000);
            
            this.logger.debug('✅ Floating Mascot initialized successfully');
            
        } catch (error) {
            this.logger.error('❌ Failed to initialize Floating Mascot:', error);
        }
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFloatingMascot);
} else {
    initializeFloatingMascot();
}

// Expose global functions for easy testing
window.testFloatingMascot = function() {
    if (!window.floatingMascot) {
        this.logger.error('Floating mascot not initialized');
        return;
    }
    
    this.logger.debug('🧪 Testing Floating Mascot features...');
    
    // Test notifications
    setTimeout(() => window.floatingMascot.info('Info notification test! ℹ️'), 500);
    setTimeout(() => window.floatingMascot.success('Success notification test! ✅'), 1500);
    setTimeout(() => window.floatingMascot.warning('Warning notification test! ⚠️'), 2500);
    setTimeout(() => window.floatingMascot.error('Error notification test! ❌'), 3500);
    
    // Test animations
    setTimeout(() => {
        window.floatingMascot.setTooltip('Testing animations... 🎬');
        window.floatingMascot.playAnimation('thinking');
    }, 4500);
    
    setTimeout(() => {
        window.floatingMascot.setTooltip('Success animation! 🎉');
        window.floatingMascot.playAnimation('success');
    }, 6000);
    
    setTimeout(() => {
        window.floatingMascot.setTooltip('Back to normal! 🚀');
        window.floatingMascot.playAnimation('idle');
    }, 8000);
    
    this.logger.debug('✅ Floating Mascot test sequence started');
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        APP_CONSTANTS, 
        FLOATING_MASCOT_CONFIG, 
        initializeFloatingMascot 
    };
}

// Make floating mascot config globally available
if (typeof window !== 'undefined') {
    window.FLOATING_MASCOT_CONFIG = FLOATING_MASCOT_CONFIG;
    window.initializeFloatingMascot = initializeFloatingMascot;
}

this.logger.debug('✅ Core Utilities module loaded (consolidated from 3 core modules)');

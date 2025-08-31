/**
 * Floating Mascot Configuration & Demo
 * Initialize and configure the floating mascot system
 */

// Configuration for the floating mascot
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
        console.log('🎭 Initializing Floating Mascot...');
        
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
            
            console.log('✅ Floating Mascot initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Floating Mascot:', error);
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
        console.error('Floating mascot not initialized');
        return;
    }
    
    console.log('🧪 Testing Floating Mascot features...');
    
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
    
    console.log('✅ Floating Mascot test sequence started');
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FLOATING_MASCOT_CONFIG, initializeFloatingMascot };
}

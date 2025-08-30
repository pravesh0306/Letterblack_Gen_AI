/**
 * Application Constants
 * Central place for magic numbers, timeouts, and sizing thresholds.
 * Ported from TypeScript version for better maintainability.
 */

// Application Constants Object - Frozen for immutability
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

console.log('✅ Constants module loaded');

/**
 * INFO Functions Stub - Minimal implementation to prevent errors
 * This file prevents loading errors for missing INFO-functions.js
 */

// Provide minimal INFO functions to prevent undefined errors
window.INFOFunctions = {
    logModuleLoad(moduleName) {
        // Silent INFO logging
        if (window.console && window.console.log) {
            console.log(`📦 Module loaded: ${moduleName}`);
        }
    },

    logError(error, context) {
        if (window.console && window.console.error) {
            console.error(`❌ ${context}:`, error);
        }
    },

    logWarning(message, context) {
        if (window.console && window.console.warn) {
            console.warn(`⚠️ ${context}: ${message}`);
        }
    },

    logInfo(message, context) {
        if (window.console && window.console.log) {
            console.log(`ℹ️ ${context}: ${message}`);
        }
    }
};

// Backwards compatibility
window.log = window.INFOFunctions.logInfo;
window.logError = window.INFOFunctions.logError;
window.logWarning = window.INFOFunctions.logWarning;

console.log('🔧 INFO functions stub loaded');


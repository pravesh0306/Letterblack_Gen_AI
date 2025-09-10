/**
 * Centralized Error Handling System
 * Provides standardized error handling, logging, and user feedback
 */

class ErrorHandler {
    constructor() {
        this.errorCodes = {
            // Security Errors (1000-1999)
            SECURITY_VIOLATION: 1001,
            API_KEY_MISSING: 1002,
            UNAUTHORIZED_ACCESS: 1003,
            XSS_ATTEMPT: 1004,

            // Storage Errors (2000-2999)
            STORAGE_UNAVAILABLE: 2001,
            STORAGE_CORRUPT: 2002,
            STORAGE_QUOTA_EXCEEDED: 2003,
            ENCRYPTION_FAILED: 2004,

            // Network Errors (3000-3999)
            NETWORK_UNAVAILABLE: 3001,
            API_RATE_LIMITED: 3002,
            API_INVALID_RESPONSE: 3003,
            TIMEOUT: 3004,

            // UI Errors (4000-4999)
            COMPONENT_INIT_FAILED: 4001,
            DOM_NOT_READY: 4002,
            INVALID_INPUT: 4003,
            RENDER_FAILED: 4004,

            // AI Errors (5000-5999)
            AI_MODULE_UNAVAILABLE: 5001,
            AI_RESPONSE_INVALID: 5002,
            AI_QUOTA_EXCEEDED: 5003,
            AI_MODEL_ERROR: 5004,

            // General Errors (9000-9999)
            UNKNOWN_ERROR: 9001,
            INIT_FAILED: 9002,
            DEPENDENCY_MISSING: 9003
        };

        this.errorMessages = {
            [this.errorCodes.SECURITY_VIOLATION]: 'Security violation detected. Action blocked.',
            [this.errorCodes.API_KEY_MISSING]: 'API key is required. Please configure your settings.',
            [this.errorCodes.UNAUTHORIZED_ACCESS]: 'Unauthorized access attempt blocked.',
            [this.errorCodes.XSS_ATTEMPT]: 'Potential XSS attack blocked.',

            [this.errorCodes.STORAGE_UNAVAILABLE]: 'Storage system unavailable. Using temporary session data.',
            [this.errorCodes.STORAGE_CORRUPT]: 'Storage data corrupted. Restoring defaults.',
            [this.errorCodes.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please clear old data.',
            [this.errorCodes.ENCRYPTION_FAILED]: 'Encryption failed. Data not saved securely.',

            [this.errorCodes.NETWORK_UNAVAILABLE]: 'Network connection unavailable. Please check your internet.',
            [this.errorCodes.API_RATE_LIMITED]: 'API rate limit exceeded. Please wait before trying again.',
            [this.errorCodes.API_INVALID_RESPONSE]: 'Invalid response from API. Please try again.',
            [this.errorCodes.TIMEOUT]: 'Request timed out. Please try again.',

            [this.errorCodes.COMPONENT_INIT_FAILED]: 'Component failed to initialize properly.',
            [this.errorCodes.DOM_NOT_READY]: 'DOM not ready. Please wait for page to load.',
            [this.errorCodes.INVALID_INPUT]: 'Invalid input provided. Please check your data.',
            [this.errorCodes.RENDER_FAILED]: 'Failed to render component.',

            [this.errorCodes.AI_MODULE_UNAVAILABLE]: 'AI module not available. Please refresh the page.',
            [this.errorCodes.AI_RESPONSE_INVALID]: 'AI response was invalid or corrupted.',
            [this.errorCodes.AI_QUOTA_EXCEEDED]: 'AI service quota exceeded. Please try again later.',
            [this.errorCodes.AI_MODEL_ERROR]: 'AI model error occurred. Please check your settings.',

            [this.errorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please refresh the page.',
            [this.errorCodes.INIT_FAILED]: 'Initialization failed. Please refresh the page.',
            [this.errorCodes.DEPENDENCY_MISSING]: 'Required dependency missing. Please refresh the page.'
        };

        this.listeners = [];
        this.errorHistory = [];
        this.maxHistorySize = 100;
    }

    /**
   * Handle error with standardized processing
   */
    handle(error, context = {}) {
        const errorInfo = this.processError(error, context);

        // Log error
        this.logError(errorInfo);

        // Add to history
        this.addToHistory(errorInfo);

        // Notify listeners
        this.notifyListeners(errorInfo);

        // Show user feedback if UI context
        if (context.showUI !== false) {
            this.showUserFeedback(errorInfo);
        }

        return errorInfo;
    }

    /**
   * Process error into standardized format
   */
    processError(error, context) {
        let errorCode, message, severity;

        if (typeof error === 'number') {
            // Error code provided
            errorCode = error;
            message = this.errorMessages[errorCode] || 'Unknown error';
            severity = this.getSeverityForCode(errorCode);
        } else if (error instanceof Error) {
            // JavaScript Error object
            errorCode = this.mapErrorToCode(error, context);
            message = error.message || this.errorMessages[errorCode];
            severity = this.getSeverityForCode(errorCode);
        } else if (typeof error === 'string') {
            // String error message
            message = error;
            errorCode = this.errorCodes.UNKNOWN_ERROR;
            severity = 'medium';
        } else {
            // Unknown error type
            message = 'Unknown error occurred';
            errorCode = this.errorCodes.UNKNOWN_ERROR;
            severity = 'medium';
        }

        return {
            code: errorCode,
            message: this.sanitizeMessage(message),
            severity,
            timestamp: new Date().toISOString(),
            context,
            stack: error instanceof Error ? error.stack : null
        };
    }

    /**
   * Map JavaScript errors to error codes
   */
    mapErrorToCode(error, context) {
        const message = error.message.toLowerCase();

        if (message.includes('network') || message.includes('fetch')) {
            return this.errorCodes.NETWORK_UNAVAILABLE;
        }

        if (message.includes('quota') || message.includes('limit')) {
            return this.errorCodes.STORAGE_QUOTA_EXCEEDED;
        }

        if (message.includes('unauthorized') || message.includes('forbidden')) {
            return this.errorCodes.UNAUTHORIZED_ACCESS;
        }

        if (message.includes('api') && message.includes('key')) {
            return this.errorCodes.API_KEY_MISSING;
        }

        if (context.component) {
            return this.errorCodes.COMPONENT_INIT_FAILED;
        }

        if (context.storage) {
            return this.errorCodes.STORAGE_UNAVAILABLE;
        }

        if (context.ai) {
            return this.errorCodes.AI_MODULE_UNAVAILABLE;
        }

        return this.errorCodes.UNKNOWN_ERROR;
    }

    /**
   * Get severity level for error code
   */
    getSeverityForCode(code) {
        if (code >= 1000 && code < 2000) {return 'critical';} // Security
        if (code >= 2000 && code < 3000) {return 'high';} // Storage
        if (code >= 3000 && code < 4000) {return 'medium';} // Network
        if (code >= 4000 && code < 5000) {return 'low';} // UI
        if (code >= 5000 && code < 6000) {return 'medium';} // AI
        return 'low'; // General
    }

    /**
   * Sanitize error message to prevent XSS
   */
    sanitizeMessage(message) {
        if (typeof message !== 'string') {return 'Invalid error message';}

        return message
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 500); // Limit length
    }

    /**
   * Log error to console with appropriate level
   */
    logError(errorInfo) {
        const logMessage = `[${errorInfo.code}] ${errorInfo.message}`;

        switch (errorInfo.severity) {
        case 'critical':
            console.error('🚨 CRITICAL:', logMessage, errorInfo);
            break;
        case 'high':
            console.error('❌ ERROR:', logMessage, errorInfo);
            break;
        case 'medium':
            console.warn('⚠️ WARNING:', logMessage, errorInfo);
            break;
        case 'low':
            console.info('ℹ️ INFO:', logMessage, errorInfo);
            break;
        default:
            console.log('📝 LOG:', logMessage, errorInfo);
        }
    }

    /**
   * Add error to history
   */
    addToHistory(errorInfo) {
        this.errorHistory.unshift(errorInfo);

        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
   * Show user feedback
   */
    showUserFeedback(errorInfo) {
    // Create or update error display
        let errorDiv = document.getElementById('global-error-display');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'global-error-display';
            errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 999999;
        max-width: 350px; font-family: 'Inter', Arial, sans-serif;
        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        padding: 16px; color: white; font-size: 13px; line-height: 1.4;
        backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
      `;
            document.body.appendChild(errorDiv);
        }

        // Set background color based on severity
        const colors = {
            critical: '#dc2626', // Red
            high: '#ea580c', // Orange-red
            medium: '#d97706', // Orange
            low: '#0891b2' // Blue
        };

        errorDiv.style.backgroundColor = colors[errorInfo.severity] || colors.medium;
        errorDiv.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 18px; margin-top: 2px;">
          ${errorInfo.severity === 'critical' ? '🚨' :
        errorInfo.severity === 'high' ? '❌' :
            errorInfo.severity === 'medium' ? '⚠️' : 'ℹ️'}
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">
            ${errorInfo.severity.toUpperCase()} ERROR
          </div>
          <div style="opacity: 0.95;">
            ${errorInfo.message}
          </div>
          ${errorInfo.code ? `<div style="opacity: 0.7; font-size: 11px; margin-top: 8px;">Code: ${errorInfo.code}</div>` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.style.display='none'" 
                style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; opacity: 0.7; padding: 0;">
          ×
        </button>
      </div>
    `;

        errorDiv.style.display = 'block';

        // Auto-hide based on severity
        const hideDelay = {
            critical: 10000, // 10 seconds
            high: 8000, // 8 seconds
            medium: 6000, // 6 seconds
            low: 4000 // 4 seconds
        };

        setTimeout(() => {
            if (errorDiv && errorDiv.style.display !== 'none') {
                errorDiv.style.display = 'none';
            }
        }, hideDelay[errorInfo.severity] || 6000);
    }

    /**
   * Add error listener
   */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
   * Remove error listener
   */
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
   * Notify all listeners
   */
    notifyListeners(errorInfo) {
        this.listeners.forEach(listener => {
            try {
                listener(errorInfo);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    /**
   * Get error history
   */
    getHistory() {
        return [...this.errorHistory];
    }

    /**
   * Clear error history
   */
    clearHistory() {
        this.errorHistory = [];
    }

    /**
   * Create error boundary wrapper
   */
    createBoundary(fn, context = {}) {
        return (...args) => {
            try {
                const result = fn.apply(this, args);

                if (result instanceof Promise) {
                    return result.catch(error => {
                        this.handle(error, { ...context, async: true });
                        return null;
                    });
                }

                return result;
            } catch (error) {
                this.handle(error, context);
                return null;
            }
        };
    }
}

// Create global instance
const globalErrorHandler = new ErrorHandler();

// Global error handling
window.addEventListener('error', (event) => {
    globalErrorHandler.handle(event.error, {
        global: true,
        filename: event.filename,
        lineno: event.lineno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handle(event.reason, {
        global: true,
        unhandledPromise: true
    });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}

// Make available globally
window.ErrorHandler = ErrorHandler;
window.globalErrorHandler = globalErrorHandler;


/**
 * Cache Management & Development Utilities
 * Handles cache deletion and safe initialization
 */

// CRITICAL CACHE DELETION FUNCTION - FOR DEVELOPMENT
function deleteCacheAndReload() {
    console.log('%c🗑️ DELETING ALL CACHES & FORCING RELOAD...', 'background: #ff4444; color: white; font-weight: bold; padding: 8px; border-radius: 4px;');

    try {
        // Clear all possible browser caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                    console.log(`Cache deleted: ${name}`);
                });
            });
        }

        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear any CEP storage if available
        if (window.CSInterface) {
            try {
                const cs = new CSInterface();
                cs.evalScript('$.sleep(100);'); // Small delay
            } catch(e) {
                console.log('CEP not available for cache clearing');
            }
        }

        // Show immediate feedback
        alert('🗑️ CACHE DELETED!\n\nExtension will reload now.\nLook for updated timestamp!');

        // Force hard reload
        window.location.reload(true);

    } catch(error) {
        console.error('Cache deletion error:', error);
        alert('Cache deletion completed with some errors. Reloading anyway...');
        window.location.reload(true);
    }
}

// Safe initialization with error handling
(function safeInitialization() {
    console.log('🚀 Safe initialization starting...');

    // Check for required global objects
    const requiredGlobals = ['SecureAPIStorage'];
    const missingGlobals = requiredGlobals.filter(name => typeof window[name] === 'undefined');

    if (missingGlobals.length > 0) {
        console.warn('⚠️ Missing required globals:', missingGlobals);
        // Create placeholder objects to prevent errors
        missingGlobals.forEach(name => {
            window[name] = {
                placeholder: true,
                error: `${name} not loaded`
            };
        });
    }

    // Safe module initialization
    function initializeModuleSafely(name, fn) {
        try {
            if (typeof fn === 'function') {
                fn();
                console.log(`✅ ${name} initialized`);
            }
        } catch (error) {
            console.warn(`⚠️ ${name} initialization failed:`, error.message);
        }
    }

    // Initialize only if dependencies are available
    if (typeof window.SecureAPIStorage !== 'undefined' && !window.SecureAPIStorage.placeholder) {
        console.log('✅ SecureAPIStorage available');
    }

    console.log('✅ Safe initialization complete');
})();

// Export for global use
window.deleteCacheAndReload = deleteCacheAndReload;


// Configuration for LetterBlack AI Chat v2
// Replace YOUR_GEMINI_API_KEY with your actual Google Gemini API key
// Get your API key from: https://makersuite.google.com/app/apikey

// Main config (do NOT commit real API keys here).
// Put your real key in `src/js/config.local.js` which is listed in .gitignore.

window.CONFIG = {
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
    TEST_MODE: false
};

// Merge window-level local config when testing in browser
if (typeof window !== 'undefined' && window.__LOCAL_CONFIG__) {
    Object.assign(CONFIG, window.__LOCAL_CONFIG__);
}

// Merge Node/local file when available (used by build/test tools)
if (typeof module !== 'undefined' && module.exports) {
    try {
        const local = require('./config.local.js');
        if (local && local.GEMINI_API_KEY && local.GEMINI_API_KEY !== 'PUT_YOUR_ACTUAL_KEY_HERE') {
            Object.assign(CONFIG, local);
        }
    } catch (e) {
        // no local config found - that's fine
    }
    module.exports = CONFIG;
}

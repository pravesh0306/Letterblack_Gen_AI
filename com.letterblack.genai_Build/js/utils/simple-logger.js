// Minimal runtime logger that writes to console and to an in-app log panel if present
;(function () {
    'use strict';

    function appendToPanel(level, text) {
        try {
            const panel = document.getElementById('dev-log-panel');
            if (!panel) return;
            const el = document.createElement('div');
            el.className = 'dev-log-entry ' + level;
            const ts = new Date().toLocaleTimeString();
            el.textContent = `[${ts}] ${level.toUpperCase()}: ${text}`;
            panel.appendChild(el);
            if (panel.children.length > 500) panel.removeChild(panel.children[0]);
        } catch (e) { /* ignore */ }
    }

    const api = {
        info: (msg) => { console.info(msg); appendToPanel('info', msg); },
        warn: (msg) => { console.warn(msg); appendToPanel('warn', msg); },
        error: (msg) => { console.error(msg); appendToPanel('error', msg); }
    };

    window.SimpleLogger = api;
})();

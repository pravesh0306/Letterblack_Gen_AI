// Simple log panel bootstrapper
;(function () {
    'use strict';
    function createPanel() {
        try {
            if (document.getElementById('dev-log-wrapper')) {return;}
            const wrapper = document.createElement('div');
            wrapper.id = 'dev-log-wrapper';
            wrapper.innerHTML = `
                <div id="dev-log-header">Logs</div>
                <div id="dev-log-panel" aria-live="polite" role="log"></div>
            `;
            wrapper.style.position = 'fixed';
            wrapper.style.right = '12px';
            wrapper.style.bottom = '12px';
            wrapper.style.width = '320px';
            wrapper.style.maxHeight = '240px';
            wrapper.style.zIndex = 99999;
            wrapper.style.fontSize = '12px';
            wrapper.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
            wrapper.style.borderRadius = '8px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.background = 'rgba(24,24,24,0.95)';
            wrapper.style.color = '#e6e6e6';
            document.body.appendChild(wrapper);
        } catch (e) { /* ignore */ }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {createPanel();}
    else {window.addEventListener('DOMContentLoaded', createPanel);}
})();

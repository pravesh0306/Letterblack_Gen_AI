// tab-switching.js
// Handles bottom panel tab switching logic

document.addEventListener('DOMContentLoaded', () => {
    const bottomPanel = document.getElementById('bottom-panel');
    const toggleButton = document.getElementById('bottom-panel-toggle');
    const tabButtons = document.querySelectorAll('.bottom-panel-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.bottom-panel-content .tab-pane');

    // Advanced modules
    const modules = {
        'script-library': window.AIModule || {},
        'settings': window.APISettingsStorage || {},
        'chat-history': window.ChatMemory || {},
        'saved-scripts': window.SmartAISuggestionEngine || {},
        'project-tools': window.ProjectOrganizer || {}
    };

    // Toggle panel collapsed state
    if (toggleButton && bottomPanel) {
        toggleButton.addEventListener('click', () => {
            bottomPanel.classList.toggle('collapsed');
            const isCollapsed = bottomPanel.classList.contains('collapsed');
            toggleButton.setAttribute('title', isCollapsed ? 'Show Script Library' : 'Hide Script Library');
        });
    }

    // Tab switching logic with module loading
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
            tabPanes.forEach((pane) => { pane.classList.remove('active'); });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const tabName = btn.getAttribute('data-tab');
            const pane = document.getElementById(`${tabName }-tab`);
            if (pane) {pane.classList.add('active');}
            // Expand panel if collapsed
            if (bottomPanel.classList.contains('collapsed')) {
                bottomPanel.classList.remove('collapsed');
                toggleButton.setAttribute('title', 'Hide Script Library');
            }
            // Load module logic for the tab
            if (modules[tabName] && typeof modules[tabName].init === 'function') {
                modules[tabName].init(pane);
            }
        });
    });
    // Optionally, initialize the active tab on load
    const activeTabBtn = document.querySelector('.bottom-panel-tabs .tab-btn.active');
    if (activeTabBtn) {
        const tabName = activeTabBtn.getAttribute('data-tab');
        const pane = document.getElementById(`${tabName }-tab`);
        if (modules[tabName] && typeof modules[tabName].init === 'function') {
            modules[tabName].init(pane);
        }
    }
});

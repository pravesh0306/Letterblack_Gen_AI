// panel-shortcuts.js
// Handles keyboard shortcuts for tab switching, chat send, and script save

document.addEventListener('keydown', (e) => {
    // Tab switching: Ctrl+1 to Ctrl+5
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (e.key === '1') {
            document.getElementById('tab-btn-script-library')?.click();
            e.preventDefault();
        } else if (e.key === '2') {
            document.getElementById('tab-btn-settings')?.click();
            e.preventDefault();
        } else if (e.key === '3') {
            document.getElementById('tab-btn-chat-history')?.click();
            e.preventDefault();
        } else if (e.key === '4') {
            document.getElementById('tab-btn-saved-scripts')?.click();
            e.preventDefault();
        } else if (e.key === '5') {
            document.getElementById('tab-btn-project-tools')?.click();
            e.preventDefault();
        }
    }
    // Ctrl+Enter to send chat (if chat composer is visible)
    if (e.ctrlKey && e.key === 'Enter') {
        const composer = document.getElementById('chat-composer');
        if (composer && composer.offsetParent !== null) {
            const sendBtn = composer.querySelector('.send-btn');
            if (sendBtn) {sendBtn.click();}
            e.preventDefault();
        }
    }
    // Ctrl+S to save script (if script editor is visible)
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
        const scriptPane = document.getElementById('script-library-tab');
        if (scriptPane && scriptPane.classList.contains('active')) {
            const saveBtn = document.getElementById('save-script-btn');
            if (saveBtn) {saveBtn.click();}
            e.preventDefault();
        }
    }
});

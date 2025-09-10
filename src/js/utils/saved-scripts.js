// saved-scripts.js
// Handles Saved Scripts tab logic

document.addEventListener('DOMContentLoaded', () => {
    const scriptEditor = document.getElementById('script-editor');
    const savedScriptsContainer = document.querySelector('.saved-scripts-container');

    // XSS protection helper
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getSavedScripts() {
        try {
            return JSON.parse(localStorage.getItem('ae_saved_scripts') || '[]');
        } catch { return []; }
    }
    function saveCurrentScript() {
        if (!scriptEditor) {return;}
        const scripts = getSavedScripts();
        const content = scriptEditor.value.trim();
        if (!content) {return;}
        scripts.push({text: content, date: new Date().toLocaleString()});
        localStorage.setItem('ae_saved_scripts', JSON.stringify(scripts));
        renderSavedScripts();
    }
    function renderSavedScripts() {
        if (!savedScriptsContainer) {return;}
        const scripts = getSavedScripts();
        if (scripts.length === 0) {
            savedScriptsContainer.innerHTML = '<p>No saved scripts yet.</p>';
            return;
        }
        savedScriptsContainer.innerHTML = scripts.map((s, i) =>
            `<div class="saved-script-item"><pre>${escapeHtml(s.text)}</pre><span>${escapeHtml(s.date)}</span><button data-index="${i}" class="delete-script-btn">Delete</button></div>`
        ).join('');
        savedScriptsContainer.querySelectorAll('.delete-script-btn').forEach(btn => {
            btn.onclick = function() {
                const idx = parseInt(btn.getAttribute('data-index'));
                const scripts = getSavedScripts();
                scripts.splice(idx, 1);
                localStorage.setItem('ae_saved_scripts', JSON.stringify(scripts));
                renderSavedScripts();
            };
        });
    }
    const saveBtn = document.getElementById('save-script-btn');
    if (saveBtn) {saveBtn.onclick = saveCurrentScript;}
    renderSavedScripts();
});

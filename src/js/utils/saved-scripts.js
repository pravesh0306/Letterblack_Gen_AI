// saved-scripts.js
// Handles Saved Scripts tab logic

document.addEventListener('DOMContentLoaded', function() {
    const scriptEditor = document.getElementById('script-editor');
    const savedScriptsContainer = document.querySelector('.saved-scripts-container');
    
    // Text escape via textContent
    function escapeText(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.textContent;
    }
    
    function getSavedScripts() {
        try {
            return JSON.parse(localStorage.getItem('ae_saved_scripts') || '[]');
        } catch { return []; }
    }
    function saveCurrentScript() {
        if (!scriptEditor) return;
        const scripts = getSavedScripts();
        const content = scriptEditor.value.trim();
        if (!content) return;
        scripts.push({text: content, date: new Date().toLocaleString()});
        localStorage.setItem('ae_saved_scripts', JSON.stringify(scripts));
        renderSavedScripts();
    }
    function renderSavedScripts() {
        if (!savedScriptsContainer) return;
        const scripts = getSavedScripts();
        savedScriptsContainer.innerHTML = '';

        if (scripts.length === 0) {
            const p = document.createElement('p');
            p.textContent = 'No saved scripts yet.';
            savedScriptsContainer.appendChild(p);
            return;
        }

        scripts.forEach((s, i) => {
            const item = document.createElement('div');
            item.className = 'saved-script-item';

            const pre = document.createElement('pre');
            pre.textContent = escapeText(s.text);
            const span = document.createElement('span');
            span.textContent = escapeText(s.date);
            const del = document.createElement('button');
            del.className = 'delete-script-btn';
            del.textContent = 'Delete';
            del.addEventListener('click', () => {
                const list = getSavedScripts();
                list.splice(i, 1);
                localStorage.setItem('ae_saved_scripts', JSON.stringify(list));
                renderSavedScripts();
            });

            item.appendChild(pre);
            item.appendChild(span);
            item.appendChild(del);
            savedScriptsContainer.appendChild(item);
        });
    }
    const saveBtn = document.getElementById('save-script-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentScript);
    renderSavedScripts();
});

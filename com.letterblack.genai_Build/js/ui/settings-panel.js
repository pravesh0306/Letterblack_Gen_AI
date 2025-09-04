// settings-panel.js
// Handles Settings tab logic (save, test, export)
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key-setting');
    const providerSelect = document.getElementById('api-provider');
    const modelSelect = document.getElementById('model-select-setting');
    const memoryTextarea = document.getElementById('memory-textarea');
    const saveTestBtn = document.querySelector('.settings-actions .toolbar-btn.primary');
    const exportBtn = document.getElementById('export-settings-btn');

    function saveSettings() {
        const settings = {
            apiKey: apiKeyInput ? apiKeyInput.value : '',
            provider: providerSelect ? providerSelect.value : '',
            model: modelSelect ? modelSelect.value : '',
            memory: memoryTextarea ? memoryTextarea.value : ''
        };
        localStorage.setItem('ae_settings', JSON.stringify(settings));
        alert('Settings saved!');
    }
    function exportSettings() {
        const settings = localStorage.getItem('ae_settings') || '{}';
        const blob = new Blob([settings], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    if (saveTestBtn) saveTestBtn.onclick = saveSettings;
    if (exportBtn) exportBtn.onclick = exportSettings;
    // Load settings on panel open
    const settings = JSON.parse(localStorage.getItem('ae_settings') || '{}');
    if (settings.apiKey && apiKeyInput) apiKeyInput.value = settings.apiKey;
    if (settings.provider && providerSelect) providerSelect.value = settings.provider;
    if (settings.model && modelSelect) modelSelect.value = settings.model;
    if (settings.memory && memoryTextarea) memoryTextarea.value = settings.memory;
});

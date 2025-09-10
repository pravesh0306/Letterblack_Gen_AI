(function () {
  const PROVIDER_KEY = 'apiProvider';
  const MODEL_KEY = 'apiModel';
  const API_KEY_KEY = 'apiKey';

  function getEl(id) { return document.getElementById(id); }

  function loadSettings() {
    const provider = window.cepStorage?.getItem(PROVIDER_KEY, 'google');
    const model = window.cepStorage?.getItem(MODEL_KEY, 'gemini-2.5-flash-preview-05-20');
    const apiKey = window.cepStorage?.getItem(API_KEY_KEY, '');
    const providerEl = getEl('api-provider');
    const modelEl = getEl('model-select-setting');
    const keyEl = getEl('api-key-setting');
    if (providerEl) providerEl.value = provider || providerEl.value;
    if (modelEl) modelEl.value = model || modelEl.value;
    if (keyEl && apiKey) keyEl.value = apiKey;
    updateModelDisplay(model);
  }

  function updateModelDisplay(model) {
    const el = getEl('current-model-display');
    if (el) el.textContent = model || 'Unknown';
  }

  function saveSettings() {
    const provider = getEl('api-provider')?.value || 'google';
    const model = getEl('model-select-setting')?.value || 'gemini-2.5-flash-preview-05-20';
    const apiKey = getEl('api-key-setting')?.value || '';
    window.cepStorage?.setItem(PROVIDER_KEY, provider);
    window.cepStorage?.setItem(MODEL_KEY, model);
    if (apiKey) window.cepStorage?.setItem(API_KEY_KEY, apiKey);
    updateModelDisplay(model);
    window.DependencyChecker?.refresh();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    const saveBtn = document.getElementById('save-and-test-btn');
    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); saveSettings(); });
  });

  window.SettingsManager = { loadSettings, saveSettings };
})();

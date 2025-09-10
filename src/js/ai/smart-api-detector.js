(function () {
  class SmartAPIManager {
    constructor() { this.detected = null; }
    manualDetect() {
      const key = (document.getElementById('api-key-setting')||{}).value || '';
      const providerEl = document.getElementById('api-provider');
      if (!providerEl) return;
      if (/sk-/.test(key)) providerEl.value = 'openai';
      else if (/ya29\./.test(key)) providerEl.value = 'google';
      else providerEl.value = providerEl.value || 'google';
      window.SettingsManager?.saveSettings();
    }
  }
  window.smartAPIManager = new SmartAPIManager();
})();

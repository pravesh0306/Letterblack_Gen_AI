// Minimal compatibility shims to provide classes expected by index3.html
(function(){
  // SettingsManager shim using SimpleSettingsManager if available
  class SettingsManagerShim {
    constructor(){
      this.impl = window.settingsManager || (window.SimpleSettingsManager ? new window.SimpleSettingsManager() : null);
      this._settings = this.impl && this.impl.getSettings ? this.impl.getSettings() : (window.safeStorage?.get('app_settings', {}) || {});
    }
    async initialize(){
      if (this.impl && this.impl.initialize) {
        try { await this.impl.initialize(); } catch {}
      }
      return true;
    }
    getAllSettings(){
      return this.impl && this.impl.getSettings ? this.impl.getSettings() : this._settings;
    }
    saveSettings(update){
      try {
        this._settings = { ...(this.getAllSettings()||{}), ...(update||{}) };
        if (this.impl) {
          if (this.impl.updateSettings) this.impl.updateSettings(this._settings);
          if (this.impl.save) this.impl.save();
          if (this.impl.saveSettings) this.impl.saveSettings();
        }
        window.safeStorage?.set('app_settings', this._settings);
      } catch {}
    }
  }

  // UIManager shim
  class UIManagerShim {
    async initialize(){
      // Minimal tab switching support if needed
      try {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabButtons.forEach(btn => btn.addEventListener('click', (e)=>{
          e.preventDefault();
          const target = btn.getAttribute('data-tab');
          tabButtons.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
          tabPanes.forEach(p=>p.classList.remove('active'));
          btn.classList.add('active');
          btn.setAttribute('aria-selected','true');
          const pane = document.getElementById(`${target}-tab`);
          if (pane) pane.classList.add('active');
        }));
      } catch {}
      return true;
    }
  }

  // ChatAssistant shim
  class ChatAssistantShim {
    initialize(aiModule){ this.ai = aiModule; }
  }

  // SettingsUIController shim
  class SettingsUIControllerShim {
    async initialize(settingsManager){ this.sm = settingsManager; return true; }
  }

  // Expose if missing
  if (!window.SettingsManager) window.SettingsManager = SettingsManagerShim;
  if (!window.UIManager) window.UIManager = UIManagerShim;
  if (!window.ChatAssistant) window.ChatAssistant = ChatAssistantShim;
  if (!window.SettingsUIController) window.SettingsUIController = SettingsUIControllerShim;
})();

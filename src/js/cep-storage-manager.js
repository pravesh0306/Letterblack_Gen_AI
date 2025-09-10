// Simple CEP-like storage manager fallback for browser environments
(function () {
  class CEPSettingsManager {
    constructor(namespace = 'cepSettings') {
      this.ns = namespace;
    }
    _key(key) { return `${this.ns}:${key}`; }
    getItem(key, def = null) {
      try {
        const raw = localStorage.getItem(this._key(key));
        return raw ? JSON.parse(raw) : def;
      } catch {
        return def;
      }
    }
    setItem(key, value) {
      try {
        localStorage.setItem(this._key(key), JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    removeItem(key) {
      try { localStorage.removeItem(this._key(key)); } catch {}
    }
    exportAll() {
      const out = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`${this.ns}:`)) {
            out[k.replace(`${this.ns}:`, '')] = JSON.parse(localStorage.getItem(k));
          }
        }
      } catch {}
      return out;
    }
    importAll(obj) {
      if (!obj || typeof obj !== 'object') return 0;
      let count = 0;
      Object.keys(obj).forEach(k => { if (this.setItem(k, obj[k])) count++; });
      return count;
    }
  }

  window.cepStorage = new CEPSettingsManager('LB_GenAI');
  window.CEPSettingsManager = CEPSettingsManager;
})();

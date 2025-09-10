// Minimal storage bootstrap to keep index3.html clean and functional
// Provides safeStorage and a simple AppModules registry used by bootstrap
(function(){
  try {
    if (typeof window.safeStorage === 'undefined') {
      const store = (() => {
        const data = Object.create(null);
        return {
          getItem: k => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
          setItem: (k, v) => { data[k] = String(v); },
          removeItem: k => { delete data[k]; },
          clear: () => { for (const k in data) delete data[k]; }
        };
      })();
      const ls = typeof window.localStorage !== 'undefined' ? window.localStorage : store;
      window.safeStorage = {
        get(key, fallback=null){
          try { const v = ls.getItem(key); return v===null ? fallback : JSON.parse(v); } catch { return fallback; }
        },
        set(key, val){ try { ls.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } },
        remove(key){ try { ls.removeItem(key); } catch { /* ignore */ } },
        clear(){ try { ls.clear(); } catch { /* ignore */ } }
      };
    }
  } catch {}

  // Simple AppModules registry used by index3 bootstrap
  if (!window.AppModules) {
    const registry = new Map();
    window.AppModules = {
      register(name, mod){ registry.set(name, mod); },
      get(name){ return registry.get(name); },
      init(){ /* no-op for now */ },
      list(){ return Array.from(registry.keys()); }
    };
  }
})();

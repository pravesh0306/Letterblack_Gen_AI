// Safe storage polyfill that does NOT overwrite existing window.localStorage/sessionStorage
(function(){
  function makeStore(){
    const store = Object.create(null);
    return {
      getItem: (k) => Object.prototype.hasOwnProperty.call(store, k) ? String(store[k]) : null,
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
      clear: () => { for (const k in store) delete store[k]; },
      key: (i) => Object.keys(store)[i] || null,
      get length(){ return Object.keys(store).length; }
    };
  }
  try{
    if (typeof window === 'undefined') return;
    if (typeof window.localStorage === 'undefined' || window.localStorage === null) {
      window.localStorage = makeStore();
    }
    if (typeof window.sessionStorage === 'undefined' || window.sessionStorage === null) {
      window.sessionStorage = makeStore();
    }
  }catch(e){
    console.warn('Storage polyfill failed. Using in-memory store.');
    try { window.localStorage = window.localStorage || makeStore(); } catch {}
    try { window.sessionStorage = window.sessionStorage || makeStore(); } catch {}
  }
})();

(function () {
  function clearCaches() {
    try {
      caches && caches.keys && caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    } catch {}
    try { sessionStorage.clear(); } catch {}
    try { localStorage.clear(); } catch {}
  }
  window.deleteCacheAndReload = function () {
    try { clearCaches(); } finally { location.reload(); }
  };
})();

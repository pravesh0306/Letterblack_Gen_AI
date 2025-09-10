(function () {
  async function loadOptional(script) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = script; s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }
  // placeholder for loading additional utils when present
  window.UtilityLoader = { loadOptional };
})();

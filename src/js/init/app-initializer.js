(function () {
  window.AppModules = window.AppModules || {};
  window.AppModules.refreshAIStatus = function () {
    try { window.DependencyChecker?.refresh(); } catch {}
  };
  window.AppModules.runAIDiagnostics = function () {
    try {
      alert('Running AI diagnostics...');
      window.DependencyChecker?.refresh();
    } catch {}
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AppModules.refreshAIStatus();
  });
})();

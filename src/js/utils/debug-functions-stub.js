// Minimal debug functions stub to avoid missing script errors
// Safe to include in production; no-ops when debug is disabled
(function () {
  const prefix = '[DEBUG]';
  function safeLog(method, ...args) {
    try {
      console[method](prefix, ...args);
    } catch (_) {
      // ignore
    }
  }
  window.debug = {
    log: (...args) => safeLog('log', ...args),
    warn: (...args) => safeLog('warn', ...args),
    error: (...args) => safeLog('error', ...args),
    info: (...args) => safeLog('info', ...args),
  };
})();

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const el = document.getElementById('floating-mascot');
      if (el) {
        el.classList.add('ready');
        window.FloatingMascot?.initAudioVisualizer?.();
      }
    } catch {}
  });
})();

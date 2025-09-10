(function () {
  const notifQueue = [];
  function notify(message, opts = {}) {
    try {
      const el = document.getElementById('floating-mascot');
      if (!el) return;
      const note = document.createElement('div');
      note.className = 'mascot-note';
      note.textContent = message;
      note.style.position = 'absolute';
      note.style.bottom = '80px';
      note.style.right = '0';
      note.style.background = 'rgba(0,0,0,0.8)';
      note.style.color = '#fff';
      note.style.padding = '6px 10px';
      note.style.borderRadius = '6px';
      note.style.fontSize = '12px';
      el.appendChild(note);
      setTimeout(() => note.remove(), opts.duration || 2000);
    } catch {}
  }

  function initAudioVisualizer() {
    // visualizer is handled by voice-features if enabled
  }

  window.FloatingMascot = { notify, initAudioVisualizer };
})();

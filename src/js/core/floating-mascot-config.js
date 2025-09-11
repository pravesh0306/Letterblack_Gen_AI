(function () {
  const TIPS_KEY = 'mascotTipIndex';
  const tips = [
    'Tip: Press Ctrl+Alt+I to open DevTools safely inside the panel.',
    'Tip: Use the Script Library to test and save your ExtendScript snippets.',
    'Tip: The Settings tab can auto-detect your provider from the API key.',
    'Tip: Toggle the bottom panel to give more space to the chat.',
    'Tip: Use voice input to dictate prompts hands‑free.',
    'Tip: Export your chat history from the Chat History tab.',
    'Tip: Project Tools can generate a quick project health report.',
    'Tip: Use the Command Palette button in the header for quick actions.',
    'Tip: You can drag the mascot to any corner of the panel.',
    'Tip: Keep API keys private—never paste them in messages.'
  ];

  function getNextTip() {
    try {
      const idx = parseInt(localStorage.getItem(TIPS_KEY) || '0', 10) || 0;
      const next = (idx + 1) % tips.length;
      localStorage.setItem(TIPS_KEY, String(next));
      return tips[idx];
    } catch {
      // Fallback: random tip
      return tips[Math.floor(Math.random() * tips.length)];
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    try {
      const el = document.getElementById('floating-mascot');
      if (el) {
        el.classList.add('ready');
        window.FloatingMascot?.initAudioVisualizer?.();

        // Show a rotating, text-only tip on launch
        const tip = getNextTip();
        if (window.FloatingMascot && typeof window.FloatingMascot.notify === 'function') {
          window.FloatingMascot.notify(tip, { duration: 5000 });
        }
      }
    } catch {}
  });
})();

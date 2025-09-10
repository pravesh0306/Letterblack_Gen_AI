(function () {
  function forceMascotVisibility() {
    const el = document.getElementById('floating-mascot');
    if (!el) return;
    el.style.display = 'flex';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
  }

  function testFloatingMascot() {
    forceMascotVisibility();
    try {
      if (window.FloatingMascot && typeof window.FloatingMascot.notify === 'function') {
        window.FloatingMascot.notify('Hello from Mascot!', { type: 'info' });
      }
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Optional: make mascot draggable within viewport
    const el = document.getElementById('floating-mascot');
    if (!el) return;
    let dragging = false, sx=0, sy=0, r=20, b=20;
    let startLeft = 0, startTop = 0;
    el.addEventListener('mousedown', (e) => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - sx; const dy = e.clientY - sy;
      let left = startLeft + dx; let top = startTop + dy;
      left = Math.max(0, Math.min(window.innerWidth - el.offsetWidth - r, left));
      top = Math.max(0, Math.min(window.innerHeight - el.offsetHeight - b, top));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.position = 'fixed';
    });
    document.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.userSelect = '';
    });
  });

  window.forceMascotVisibility = forceMascotVisibility;
  window.testFloatingMascot = testFloatingMascot;
})();

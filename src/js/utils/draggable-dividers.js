// Draggable divider utility for resizable sections
(function () {
  const STORAGE_KEY = 'resizable-section-heights';

  function loadHeights() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveHeights(map) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {}
  }

  function initDividers() {
    const heights = loadHeights();
    document.querySelectorAll('.resizable-section').forEach(sec => {
      const id = sec.id;
      if (id && heights[id]) {
        sec.style.maxHeight = heights[id];
      }
    });

    let active = null;
    let startY = 0;
    let startHeight = 0;

    function onMouseMove(e) {
      if (!active) return;
      const dy = e.clientY - startY;
      const newHeight = Math.max(80, startHeight + dy);
      active.style.maxHeight = `${newHeight}px`;

      const map = loadHeights();
      if (active.id) {
        map[active.id] = `${newHeight}px`;
        saveHeights(map);
      }
    }

    function onMouseUp() {
      if (!active) return;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      active = null;
    }

    document.querySelectorAll('.draggable-divider').forEach(div => {
      const targetId = div.getAttribute('data-target');
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;

      div.addEventListener('mousedown', (e) => {
        active = target;
        startY = e.clientY;
        startHeight = parseInt(window.getComputedStyle(target).maxHeight || '200', 10);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initDividers);
})();

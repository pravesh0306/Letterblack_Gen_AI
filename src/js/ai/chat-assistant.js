// Minimal Chat Assistant for code block enhancements and basic AE bridge stubs
(function () {
  function enhanceCodeBlocks(root = document) {
    const blocks = root.querySelectorAll('pre code');
    blocks.forEach(code => {
      const pre = code.closest('pre');
      if (!pre || pre.dataset.enhanced) return;
      pre.dataset.enhanced = '1';
      const toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-tool-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          toast('Copied to clipboard');
        } catch (e) { console.warn('Copy failed', e); }
      });
      const saveBtn = document.createElement('button');
      saveBtn.className = 'code-tool-btn';
      saveBtn.textContent = 'Save';
      saveBtn.addEventListener('click', () => {
        const blob = new Blob([code.textContent], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'script.jsx';
        a.click();
      });
      toolbar.appendChild(copyBtn);
      toolbar.appendChild(saveBtn);
      pre.appendChild(toolbar);
    });
  }

  function toast(msg) {
    if (window.showToast) return window.showToast(msg);
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, { position: 'fixed', bottom: '20px', left: '20px', padding: '8px 12px', background: '#222', color: '#fff', borderRadius: '6px', zIndex: 10000 });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    enhanceCodeBlocks();
  });

  window.ChatAssistant = { enhanceCodeBlocks };
})();

// Local Prism stub: prevents runtime errors if CDN is blocked
(function(){
  try {
    if (!window.Prism) {
      window.Prism = {
        highlightAll: function(){},
        highlightElement: function(){},
        plugins: {}
      };
      console.warn('[Prism Stub] CDN blocked or unavailable. Syntax highlighting disabled.');
    }
  } catch (e) {}
})();

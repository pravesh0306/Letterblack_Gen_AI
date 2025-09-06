// YouTube analyzer utilities
(function () {
  'use strict';

  // Normalize and validate YouTube URLs. Accepts watch, youtu.be, embed, shorts, and playlists.
  function isValidYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const u = new URL(url, window.location.href);
      const host = u.hostname.toLowerCase();
      const path = u.pathname || '';
      // youtu.be short links
      if (/^(?:www\.)?youtu\.be$/.test(host)) return !!u.pathname.replace(/^\//, '');
      // youtube.com variants
      if (/^(?:www\.)?youtube\.com$/.test(host)) {
        // watch?v=, embed/, shorts/, playlist?list=
        if (u.searchParams.get('v')) return true;
        if (/^\/embed\//.test(path)) return true;
        if (/^\/shorts\//.test(path)) return true;
        if (u.searchParams.get('list')) return true; // playlist
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  function extractVideoId(url) {
    try {
      const u = new URL(url, window.location.href);
      if (/youtu\.be$/.test(u.hostname)) return u.pathname.replace(/^\//, '');
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const m = u.pathname.match(/(?:embed|shorts)\/([\w-]+)/);
      return m && m[1] ? m[1] : null;
    } catch (e) {
      return null;
    }
  }

  // Safe parse AI responses: accept string or JSON, return string primary
  function normalizeAIResponse(aiResponse) {
    if (aiResponse == null) return '';
    if (typeof aiResponse === 'string') return aiResponse;
    // If an object, try common fields
    if (typeof aiResponse === 'object') {
      if (Array.isArray(aiResponse)) return aiResponse.join('\n');
      if (aiResponse.content) return String(aiResponse.content);
      if (aiResponse.text) return String(aiResponse.text);
      try {
        return JSON.stringify(aiResponse, null, 2);
      } catch (e) {
        return String(aiResponse);
      }
    }
    return String(aiResponse);
  }

  // Extract timestamps in formats like "00:12", "1:02:03", or "00:12:34" and also lines starting with a timestamp
  function extractTimestamps(aiResponse) {
    const text = normalizeAIResponse(aiResponse);
    const results = [];
    // Match hh:mm:ss or mm:ss
    const re = /\b(\d{1,2}:\d{2}(?::\d{2})?)\b/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      results.push(m[1]);
    }
    return results;
  }

  // Extract short insights: split by common separators and heuristics
  function extractInsights(aiResponse) {
    const text = normalizeAIResponse(aiResponse).trim();
    if (!text) return [];
    // If JSON array of insights
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (e) {
      // continue
    }
    // Split by lines and bullets, but filter small noise
    const lines = text.split(/\r?\n|\n|•|\-|\*|\u2022/).map(s => s.trim()).filter(Boolean);
    // Keep line length > 10 or that contain colon (key: value)
    return lines.filter(l => l.length > 8 || /:/.test(l)).slice(0, 50);
  }

  // Pattern matching: patterns may be strings or regex. Use word boundaries for plain words to reduce false positives.
  function matchPatterns(content, patterns) {
    if (!content || !patterns || !patterns.length) return [];
    const found = [];
    for (const p of patterns) {
      try {
        if (p instanceof RegExp) {
          if (p.test(content)) found.push(p.toString());
        } else {
          // escape pattern for regex
          const esc = String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // use word boundaries when pattern is a single word (letters, digits, underscore)
          const useWord = /^\w+$/.test(p);
          const regex = new RegExp(useWord ? `\\b${esc}\\b` : esc, 'iu');
          if (regex.test(content)) found.push(String(p));
        }
      } catch (e) {
        // ignore pattern errors
        // log if SimpleLogger available
        window.SimpleLogger && window.SimpleLogger.warn && window.SimpleLogger.warn('pattern test failed: ' + e);
      }
    }
    return found;
  }

  // Try AI-powered analysis if openaiManager is ready. Polls for readiness and times out.
  function tryAIPoweredAnalysis(opts) {
    return new Promise((resolve, reject) => {
      const timeout = opts && opts.timeoutMs ? opts.timeoutMs : 10_000;
      const pollInterval = opts && opts.pollIntervalMs ? opts.pollIntervalMs : 250;
      const start = Date.now();

      function attempt() {
        if (window.openaiManager && typeof window.openaiManager.sendMessage === 'function') {
          // send message and normalize response
          try {
            const payload = opts && opts.payload ? opts.payload : { prompt: opts.prompt || '' };
            const p = window.openaiManager.sendMessage(payload);
            // handle promise or direct return
            Promise.resolve(p).then(res => {
              resolve({ raw: res, text: normalizeAIResponse(res) });
            }).catch(err => reject(err));
            return;
          } catch (e) {
            reject(e);
            return;
          }
        }
        if (Date.now() - start > timeout) return reject(new Error('openaiManager not available (timeout)'));
        setTimeout(attempt, pollInterval);
      }
      attempt();
    });
  }

  // Export into window namespace
  window.YouTubeAnalyzer = {
    isValidYouTubeUrl,
    extractVideoId,
    normalizeAIResponse,
    extractTimestamps,
    extractInsights,
    matchPatterns,
    tryAIPoweredAnalysis,
  };

})();

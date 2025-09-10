/* Unified Chat Memory
 * - Merges chat-history.js + chat-memory.js
 * - Single storage key, session management, trimming, sanitization
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "ae_assistant_chat_history";
  const VERSION = 1;

  let MAX_MESSAGES = 500;
  let MAX_LOGS = 100;

  const nowISO = () => new Date().toISOString();
  const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  function sanitize(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "***@***")
      .replace(/([A-Za-z]:)?(\/|\\)([\w .-]+(\/|\\))+[\w .-]+/g, "***/*");
  }

  function debounce(fn, ms = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function loadRaw() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function saveRaw(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { this.logger.warn("[chat-memory] save error:", e); }
  }

  function defaultState() {
    const id = uuid();
    return {
      version: VERSION,
      activeSessionId: id,
      sessions: {
        [id]: {
          id,
          name: "Default Session",
          createdAt: nowISO(),
          updatedAt: nowISO(),
          messages: [],
          logs: []
        }
      }
    };
  }

  function load() {
    const s = loadRaw();
    if (!s || !s.sessions || !s.activeSessionId) {
      const d = defaultState();
      saveRaw(d);
      return d;
    }
    if (!s.version) s.version = VERSION;
    return s;
  }

  const debouncedSave = debounce(saveRaw, 150);

  let state = load();
  const listeners = new Set();

  function emit() {
    debouncedSave(state);
    listeners.forEach(fn => { try { fn(state); } catch (_) {} });
  }
  function onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); }

  function getSession(id = state.activeSessionId) {
    return state.sessions[id] || null;
  }
  function ensureSession(id) {
    if (!id) id = state.activeSessionId;
    if (!state.sessions[id]) {
      state.sessions[id] = {
        id,
        name: "Session " + id.slice(0, 4),
        createdAt: nowISO(),
        updatedAt: nowISO(),
        messages: [],
        logs: []
      };
    }
    return state.sessions[id];
  }

  function setActiveSession(id) {
    if (!state.sessions[id]) throw new Error("Session not found");
    state.activeSessionId = id;
    emit();
    return id;
  }
  function listSessions() {
    return Object.values(state.sessions).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  function createSession(name = "New Session") {
    const id = uuid();
    state.sessions[id] = {
      id, name, createdAt: nowISO(), updatedAt: nowISO(), messages: [], logs: []
    };
    state.activeSessionId = id;
    emit();
    return id;
  }
  function renameSession(id, name) {
    const s = getSession(id);
    if (!s) throw new Error("Session not found");
    s.name = name || s.name;
    s.updatedAt = nowISO();
    emit();
  }
  function deleteSession(id) {
    if (!state.sessions[id]) return;
    const wasActive = state.activeSessionId === id;
    delete state.sessions[id];
    if (wasActive) {
      const first = Object.keys(state.sessions)[0];
      if (first) state.activeSessionId = first;
      else state = defaultState();
    }
    emit();
  }

  function appendMessage({ role, content, meta = {} }, sessionId) {
    const s = ensureSession(sessionId);
    const message = {
      id: uuid(), role: role || "assistant", content: sanitize(content), meta, ts: nowISO()
    };
    s.messages.push(message);
    if (s.messages.length > MAX_MESSAGES)
      s.messages.splice(0, s.messages.length - MAX_MESSAGES);
    s.updatedAt = nowISO();
    emit();
    return message;
  }
  function getHistory(sessionId) { const s = getSession(sessionId); return s ? s.messages.slice() : []; }
  function clearHistory(sessionId) {
    const s = getSession(sessionId); if (!s) return;
    s.messages = []; s.updatedAt = nowISO(); emit();
  }

  function appendLog(entry, sessionId) {
    const s = ensureSession(sessionId);
    const item = {
      id: uuid(),
      level: entry.level || "info",
      text: sanitize(entry.text || ""),
      data: entry.data || null,
      ts: nowISO()
    };
    s.logs.push(item);
    if (s.logs.length > MAX_LOGS)
      s.logs.splice(0, s.logs.length - MAX_LOGS);
    s.updatedAt = nowISO();
    emit();
    return item;
  }
  function getLogs(sessionId) { const s = getSession(sessionId); return s ? s.logs.slice() : []; }
  function clearLogs(sessionId) {
    const s = getSession(sessionId); if (!s) return;
    s.logs = []; s.updatedAt = nowISO(); emit();
  }

  function exportJSON() {
    return JSON.stringify({ version: state.version, activeSessionId: state.activeSessionId, sessions: state.sessions }, null, 2);
  }
  function importJSON(json, { merge = true } = {}) {
    let incoming = typeof json === "string" ? JSON.parse(json) : json;
    if (!incoming.sessions) throw new Error("Malformed import");
    if (!merge) {
      state = { version: incoming.version || VERSION, activeSessionId: incoming.activeSessionId, sessions: incoming.sessions };
    } else {
      Object.assign(state.sessions, incoming.sessions);
      state.version = incoming.version || VERSION;
      state.activeSessionId = incoming.activeSessionId || state.activeSessionId;
    }
    emit();
  }

  function setMaxMessages(n) { MAX_MESSAGES = Math.max(50, n | 0); }
  function setMaxLogs(n) { MAX_LOGS = Math.max(50, n | 0); }

  const api = {
    load: () => (state = load()),
    onChange,
    listSessions, createSession, renameSession, deleteSession, setActiveSession,
    get activeSessionId() { return state.activeSessionId; },
    appendMessage, getHistory, clearHistory,
    appendLog, getLogs, clearLogs,
    exportJSON, importJSON,
    setMaxMessages, setMaxLogs,
    sanitize, version: VERSION, STORAGE_KEY
  };

  global.ChatMemoryUnified = api;
})(typeof window !== "undefined" ? window : this);

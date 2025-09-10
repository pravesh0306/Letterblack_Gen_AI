// Lightweight browser chat store backed by localStorage
(function () {
  const KEY = 'LB_GenAI:chatStore';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { conversations: [] }; } catch { return { conversations: [] }; }
  }
  function save(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} }

  function uid() { return 'c_' + Math.random().toString(36).slice(2, 10); }

  function getConversationList() {
    const data = load();
    return data.conversations.map(c => ({ id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, messageCount: (c.messages||[]).length }));
  }
  function createConversation(title = 'New Conversation') {
    const data = load();
    const id = uid();
    const now = new Date().toISOString();
    data.conversations.push({ id, title, createdAt: now, updatedAt: now, messages: [] });
    save(data);
    return id;
  }
  function getConversation(id) {
    const data = load();
    return data.conversations.find(c => c.id === id) || null;
  }
  function appendMessage(id, message) {
    const data = load();
    const c = data.conversations.find(x => x.id === id);
    if (!c) throw new Error('Conversation not found');
    const msg = { id: uid(), role: message.role, text: message.text, meta: message.meta||{}, timestamp: new Date().toISOString() };
    c.messages.push(msg);
    c.updatedAt = new Date().toISOString();
    save(data);
    return msg;
  }
  function clearAll() { save({ conversations: [] }); return true; }

  window.chatStore = { getConversationList, createConversation, getConversation, appendMessage, clearAll };
})();

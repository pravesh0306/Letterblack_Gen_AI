// Adapter to safely migrate legacy chat storage into ChatMemoryUnified
;(function () {
    'use strict';

    const LEGACY_KEYS = ['ae_chat_history', 'ae_assistant_chat_history', 'browser_chat_history', 'enhanced_chat_sessions'];
    const BACKUP_KEY_PREFIX = 'chat-migration-backup-';

    function backupRaw(key, value) {
        try {
            const time = new Date().toISOString().replace(/[:.]/g, '-');
            localStorage.setItem(BACKUP_KEY_PREFIX + key + '-' + time, JSON.stringify(value));
        } catch (e) { this.logger.warn('backupRaw failed', e); }
    }

    function normalizeMessage(msg) {
        // support different shapes: {text}, {content}, {message}
        const content = msg.content || msg.text || msg.message || '';
        return { role: msg.role || 'user', content, meta: msg.meta || {} };
    }

    function migrateOnce() {
        if (!window.ChatMemoryUnified) return;
        let importedSessions = 0;
        let importedMessages = 0;
        try {
            for (const key of LEGACY_KEYS) {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                let parsed;
                try { parsed = JSON.parse(raw); } catch (e) { continue; }

                backupRaw(key, parsed);

                // heuristics to extract sessions/messages
                if (Array.isArray(parsed)) {
                    // simple array of session objects or messages
                    for (const item of parsed) {
                        if (item && item.messages) {
                            const sessionId = window.ChatMemoryUnified.createSession(item.sessionId || item.title || 'Imported');
                            importedSessions++;
                            for (const m of item.messages) {
                                const nm = normalizeMessage(m);
                                window.ChatMemoryUnified.appendMessage(nm, sessionId);
                                importedMessages++;
                            }
                        } else if (item && (item.text || item.content)) {
                            const sid = window.ChatMemoryUnified.activeSessionId;
                            window.ChatMemoryUnified.appendMessage(normalizeMessage(item), sid);
                            importedMessages++;
                        }
                    }
                } else if (parsed.conversations) {
                    for (const conv of parsed.conversations) {
                        const sessionId = window.ChatMemoryUnified.createSession(conv.title || conv.id || 'Imported');
                        importedSessions++;
                        for (const m of conv.messages || []) {
                            window.ChatMemoryUnified.appendMessage(normalizeMessage(m), sessionId);
                            importedMessages++;
                        }
                    }
                } else if (parsed.sessions) {
                    for (const id in parsed.sessions) {
                        const s = parsed.sessions[id];
                        const sid = window.ChatMemoryUnified.createSession(s.name || id);
                        importedSessions++;
                        for (const m of s.messages || []) {
                            window.ChatMemoryUnified.appendMessage(normalizeMessage(m), sid);
                            importedMessages++;
                        }
                    }
                } else if (parsed.messages) {
                    const sid = window.ChatMemoryUnified.activeSessionId;
                    for (const m of parsed.messages) {
                        window.ChatMemoryUnified.appendMessage(normalizeMessage(m), sid);
                        importedMessages++;
                    }
                }
            }
        } catch (e) {
            this.logger.warn('Migration error', e);
        }

        if (importedSessions || importedMessages) {
            console.info(`[chat-memory-adapter] migration complete: ${importedSessions} sessions, ${importedMessages} messages imported into ChatMemoryUnified`);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(migrateOnce, 500);
    } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(migrateOnce, 500));
    }

})();

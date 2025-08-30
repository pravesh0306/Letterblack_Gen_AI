// ui-init.ts
// Handles delayed initialization and wiring of UI event handlers after core modules load.

declare global {
    interface Window {
        AppConstants?: { INIT_DELAY_MS: number };
        SimpleSettingsManager?: { loadSettings: () => void };
        AIModule?: any;
        aeNotify?: any;
        __AE_EXTENSION_INITIALIZED__?: boolean;
        handleChatSubmit?: (message: string) => void;
        sendMessage?: (message: string) => void;
        runExtendScript?: (script: string) => void;
        executeScript?: (script: string) => void;
        togglePanel?: (panel: string) => void;
        Mascot?: { notify: (type: string, message: string) => void };
    }
}

class UIInitializer {
    constructor() {
        document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));
    }

    private onDOMLoaded(): void {
        console.log('[Init] After Effects AI Assistant - Connecting UI to backend');

        const initDelay = window.AppConstants?.INIT_DELAY_MS || 1000;
        setTimeout(() => {
            this.checkModules();
            this.setupUIEventHandlers();
            console.log('[Ready] UI connected to backend');
            window.Mascot?.notify('success', 'System ready');
        }, initDelay);
    }

    private checkModules(): void {
        if (window.SimpleSettingsManager) {
            console.log('[OK] Settings Manager loaded');
        }
        if (window.AIModule) {
            console.log('[OK] AI Module loaded');
        }
        if (window.aeNotify) {
            console.log('[OK] Notification system loaded');
        }
        if (window.__AE_EXTENSION_INITIALIZED__) {
            console.log('[OK] Main application initialized');
        } else {
            console.log('[WAIT] Main application initializing...');
        }
    }

    private setupUIEventHandlers(): void {
        console.log('[Hook] Setting up UI event handlers');
        this.setupChatHandlers();
        this.setupSettingsHandlers();
        this.setupScriptExecutionHandlers();
        console.log('[Ready] All UI handlers setup complete');
    }

    private setupChatHandlers(): void {
        const chatInput = document.getElementById('chat-input') as HTMLInputElement;
        const sendButton = document.getElementById('send-button');

        if (chatInput && sendButton) {
            const newSendButton = sendButton.cloneNode(true) as HTMLElement;
            sendButton.parentNode?.replaceChild(newSendButton, sendButton);

            newSendButton.addEventListener('click', (e) => {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (!message) return;
                console.log('[Chat] Sending message:', message);

                if (window.handleChatSubmit) {
                    window.handleChatSubmit(message);
                } else if (window.sendMessage) {
                    window.sendMessage(message);
                } else {
                    console.log('[Fallback] Adding message directly to chat');
                    this.addMessageToChatUI('user', message);
                    chatInput.value = '';
                }
            });

            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    (document.getElementById('send-button') as HTMLElement)?.click();
                }
            });

            console.log('[OK] Chat handlers connected');
        }
    }

    private setupSettingsHandlers(): void {
        const settingsButton = document.querySelector('[onclick*="settings"]');
        if (settingsButton) {
            settingsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.SimpleSettingsManager) {
                    console.log('[Settings] Loading via Settings Manager');
                    window.SimpleSettingsManager.loadSettings();
                }
                if (window.togglePanel) {
                    window.togglePanel('settings');
                }
            });
            console.log('[OK] Settings handlers connected');
        }
    }

    private setupScriptExecutionHandlers(): void {
        const executeButton = document.querySelector('.execute-script-btn, [onclick*="execute"]');
        if (executeButton) {
            executeButton.addEventListener('click', (e) => {
                e.preventDefault();
                const scriptEditor = document.getElementById('script-editor') as HTMLTextAreaElement;
                if (scriptEditor && scriptEditor.value.trim()) {
                    console.log('[Script] Executing via backend');
                    if (window.runExtendScript) {
                        window.runExtendScript(scriptEditor.value);
                    } else if (window.executeScript) {
                        window.executeScript(scriptEditor.value);
                    }
                }
            });
            console.log('[OK] Script execution handlers connected');
        }
    }

    private addMessageToChatUI(sender: 'user' | 'ai', message: string): void {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${sender === 'user' ? 'You' : 'AI'}:</strong>
                <div class="message-text">${message}</div>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

export default new UIInitializer();
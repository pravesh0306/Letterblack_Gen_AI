/**
 * LetterBlack GenAI - UI Bundle
 * Consolidated UI management and interactions
 */

// UI Manager
(function() {
    'use strict';

    class UIManager {
        constructor() {
            this.elements = {};
            this.listeners = [];
            this.isInitialized = false;
            this.accessibility = new AccessibilityManager();
        }

        async initialize() {
            await this.findElements();
            this.bindEvents();
            this.initializeComponents();
            this.isInitialized = true;

            if (window.DEBUG) {
                console.log('🎨 UI Manager initialized');
            }
        }

        async findElements() {
            // Main UI elements
            this.elements = {
                chatInput: document.getElementById('chat-input'),
                chatMessages: document.getElementById('chat-messages'),
                sendButton: document.querySelector('[data-action="send"]'),
                bottomPanel: document.getElementById('bottom-panel'),
                bottomPanelToggle: document.getElementById('bottom-panel-toggle'),
                tabButtons: document.querySelectorAll('.tab-btn'),
                tabPanes: document.querySelectorAll('.tab-pane'),
                commandTrigger: document.getElementById('command-menu-trigger'),
                commandPanel: document.getElementById('command-menu-panel'),
                commandSearch: document.getElementById('command-search'),
                mascot: document.getElementById('floating-mascot'),
                statusText: document.getElementById('status-text'),
                messageCounter: document.querySelector('.message-counter')
            };
        }

        bindEvents() {
            this.bindChatEvents();
            this.bindTabEvents();
            this.bindCommandPaletteEvents();
            this.bindBottomPanelEvents();
            this.bindMascotEvents();
            this.bindKeyboardShortcuts();
        }

        bindChatEvents() {
            if (this.elements.chatInput) {
                const sendMessage = this.debounce(() => {
                    this.handleSendMessage();
                }, 300);

                this.listeners.push(...this.addEventListeners(this.elements.chatInput, {
                    'keydown': (e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    },
                    'input': () => {
                        this.updateCharCount();
                    }
                }));
            }

            if (this.elements.sendButton) {
                this.listeners.push(...this.addEventListeners(this.elements.sendButton, {
                    'click': () => this.handleSendMessage()
                }));
            }
        }

        bindTabEvents() {
            this.elements.tabButtons.forEach(button => {
                this.listeners.push(...this.addEventListeners(button, {
                    'click': (e) => {
                        e.preventDefault();
                        this.switchTab(button.getAttribute('data-tab'));
                    }
                }));
            });
        }

        bindCommandPaletteEvents() {
            if (this.elements.commandTrigger && this.elements.commandPanel) {
                this.listeners.push(...this.addEventListeners(this.elements.commandTrigger, {
                    'click': (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleCommandPalette();
                    }
                }));

                // Hide on outside click
                this.listeners.push(...this.addEventListeners(document, {
                    'click': (e) => {
                        if (!this.elements.commandPanel.contains(e.target) && 
                            !this.elements.commandTrigger.contains(e.target)) {
                            this.hideCommandPalette();
                        }
                    }
                }));
            }
        }

        bindBottomPanelEvents() {
            if (this.elements.bottomPanelToggle) {
                this.listeners.push(...this.addEventListeners(this.elements.bottomPanelToggle, {
                    'click': (e) => {
                        e.preventDefault();
                        this.toggleBottomPanel();
                    }
                }));
            }
        }

        bindMascotEvents() {
            if (this.elements.mascot) {
                this.initializeMascotDragging();
            }
        }

        bindKeyboardShortcuts() {
            this.listeners.push(...this.addEventListeners(document, {
                'keydown': (e) => {
                    // Ctrl+K for command palette
                    if (e.ctrlKey && e.key === 'k') {
                        e.preventDefault();
                        this.toggleCommandPalette();
                    }
                    
                    // Escape to close modals
                    if (e.key === 'Escape') {
                        this.handleEscapeKey();
                    }
                }
            }));
        }

        async handleSendMessage() {
            const message = this.elements.chatInput?.value.trim();
            if (!message) return;

            try {
                this.setStatus('Processing...', 'processing');
                
                // Clear input
                this.elements.chatInput.value = '';
                this.updateCharCount();

                // Add user message to chat
                this.addChatMessage({
                    type: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                });

                // Get AI response
                if (window.chatAssistant) {
                    const response = await window.chatAssistant.sendMessage(message);
                    this.addChatMessage(response);
                } else {
                    throw new Error('Chat assistant not available');
                }

                this.setStatus('Ready', 'ready');
            } catch (error) {
                this.addChatMessage({
                    type: 'error',
                    content: 'Failed to send message: ' + error.message,
                    timestamp: new Date().toISOString()
                });
                this.setStatus('Error', 'error');
            }
        }

        addChatMessage(message) {
            if (!this.elements.chatMessages) return;

            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.type}`;
            
            const content = message.type === 'ai-response' ? 
                this.formatAIResponse(message) : 
                this.escapeHtml(message.content);
            
            messageEl.innerHTML = `
                <div class="message-content">${content}</div>
                <div class="message-meta">
                    <span class="timestamp">${this.formatTimestamp(message.timestamp)}</span>
                    ${message.provider ? `<span class="provider">${message.provider}</span>` : ''}
                </div>
            `;

            this.elements.chatMessages.appendChild(messageEl);
            this.scrollToBottom();
            this.updateMessageCounter();

            // Trigger syntax highlighting if available
            if (window.Prism) {
                window.Prism.highlightAllUnder(messageEl);
            }
        }

        formatAIResponse(message) {
            let content = this.escapeHtml(message.content);
            
            // Format code blocks
            content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'javascript';
                return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
            });

            return content;
        }

        switchTab(tabName) {
            // Update tab buttons
            this.elements.tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });

            // Update tab panes
            this.elements.tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });

            // Activate selected tab
            const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
            const activePane = document.getElementById(`${tabName}-tab`);

            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-selected', 'true');
            }

            if (activePane) {
                activePane.classList.add('active');
            }

            // Expand bottom panel if collapsed
            if (this.isBottomPanelCollapsed()) {
                this.expandBottomPanel();
            }

            if (window.DEBUG) {
                console.log(`📑 Switched to tab: ${tabName}`);
            }
        }

        toggleCommandPalette() {
            const isHidden = this.elements.commandPanel.classList.contains('hidden');
            
            if (isHidden) {
                this.showCommandPalette();
            } else {
                this.hideCommandPalette();
            }
        }

        showCommandPalette() {
            this.elements.commandPanel.classList.remove('hidden');
            
            // Focus search input with accessibility
            setTimeout(() => {
                if (this.elements.commandSearch) {
                    this.elements.commandSearch.focus();
                }
            }, 100);
        }

        hideCommandPalette() {
            this.elements.commandPanel.classList.add('hidden');
            
            // Return focus to trigger
            if (this.elements.commandTrigger) {
                this.elements.commandTrigger.focus();
            }
        }

        toggleBottomPanel() {
            if (this.isBottomPanelCollapsed()) {
                this.expandBottomPanel();
            } else {
                this.collapseBottomPanel();
            }
        }

        isBottomPanelCollapsed() {
            return this.elements.bottomPanel?.classList.contains('collapsed') || false;
        }

        collapseBottomPanel() {
            if (!this.elements.bottomPanel) return;

            this.elements.bottomPanel.classList.add('collapsed');
            const content = this.elements.bottomPanel.querySelector('.bottom-panel-content');
            if (content) {
                content.style.maxHeight = '0px';
                content.style.overflow = 'hidden';
            }

            if (this.elements.bottomPanelToggle) {
                this.elements.bottomPanelToggle.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
                this.elements.bottomPanelToggle.title = 'Expand Panel';
            }

            if (window.DEBUG) {
                console.log('📋 Bottom panel collapsed');
            }
        }

        expandBottomPanel() {
            if (!this.elements.bottomPanel) return;

            this.elements.bottomPanel.classList.remove('collapsed');
            const content = this.elements.bottomPanel.querySelector('.bottom-panel-content');
            if (content) {
                content.style.maxHeight = '400px';
                content.style.overflow = 'hidden';
            }

            if (this.elements.bottomPanelToggle) {
                this.elements.bottomPanelToggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
                this.elements.bottomPanelToggle.title = 'Collapse Panel';
            }

            if (window.DEBUG) {
                console.log('📋 Bottom panel expanded');
            }
        }

        handleEscapeKey() {
            // Close command palette
            if (!this.elements.commandPanel.classList.contains('hidden')) {
                this.hideCommandPalette();
                return;
            }

            // Close any other modals/overlays here
        }

        setStatus(text, type = 'ready') {
            if (this.elements.statusText) {
                this.elements.statusText.textContent = text;
                this.elements.statusText.className = `status-${type}`;
            }
        }

        updateCharCount() {
            const charCountEl = document.querySelector('.char-count');
            if (charCountEl && this.elements.chatInput) {
                const length = this.elements.chatInput.value.length;
                charCountEl.textContent = `${length}/1000`;
            }
        }

        updateMessageCounter() {
            if (this.elements.messageCounter) {
                const count = this.elements.chatMessages?.children.length || 0;
                this.elements.messageCounter.textContent = `${count} Messages`;
            }
        }

        scrollToBottom() {
            if (this.elements.chatMessages) {
                this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
            }
        }

        initializeMascotDragging() {
            // Simplified dragging implementation
            let isDragging = false;
            let startX, startY, offsetX, offsetY;

            const startDrag = (e) => {
                isDragging = true;
                const rect = this.elements.mascot.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                offsetX = clientX - rect.left;
                offsetY = clientY - rect.top;
                
                this.elements.mascot.style.transition = 'none';
            };

            const drag = (e) => {
                if (!isDragging) return;
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                const x = clientX - offsetX;
                const y = clientY - offsetY;
                
                this.elements.mascot.style.left = `${Math.max(0, x)}px`;
                this.elements.mascot.style.top = `${Math.max(0, y)}px`;
                this.elements.mascot.style.right = 'auto';
                this.elements.mascot.style.bottom = 'auto';
            };

            const endDrag = () => {
                if (!isDragging) return;
                isDragging = false;
                this.elements.mascot.style.transition = '';
                
                // Save position
                const rect = this.elements.mascot.getBoundingClientRect();
                window.safeStorage?.set('mascotPosition', {
                    left: rect.left,
                    top: rect.top
                });
            };

            this.listeners.push(...this.addEventListeners(this.elements.mascot, {
                'mousedown': startDrag,
                'touchstart': startDrag
            }));

            this.listeners.push(...this.addEventListeners(document, {
                'mousemove': drag,
                'touchmove': drag,
                'mouseup': endDrag,
                'touchend': endDrag
            }));
        }

        initializeComponents() {
            // Initialize various UI components
            this.updateCharCount();
            this.updateMessageCounter();
            this.restoreMascotPosition();
        }

        restoreMascotPosition() {
            if (!this.elements.mascot) return;

            const savedPosition = window.safeStorage?.get('mascotPosition');
            if (savedPosition) {
                this.elements.mascot.style.left = `${savedPosition.left}px`;
                this.elements.mascot.style.top = `${savedPosition.top}px`;
                this.elements.mascot.style.right = 'auto';
                this.elements.mascot.style.bottom = 'auto';
            }
        }

        // Utility methods
        addEventListeners(element, events) {
            const listeners = [];
            Object.entries(events).forEach(([event, handler]) => {
                element.addEventListener(event, handler, { passive: true });
                listeners.push({ element, event, handler });
            });
            return listeners;
        }

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        }

        destroy() {
            // Remove all event listeners
            this.listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.listeners = [];
        }
    }

    // Accessibility Manager
    class AccessibilityManager {
        constructor() {
            this.focusTracker = null;
        }

        initialize() {
            this.setupFocusManagement();
            this.setupKeyboardNavigation();
        }

        setupFocusManagement() {
            // Track focus for modals and overlays
            document.addEventListener('focusin', (e) => {
                this.focusTracker = e.target;
            });
        }

        setupKeyboardNavigation() {
            // Add keyboard navigation for custom components
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.handleTabNavigation(e);
                }
            });
        }

        handleTabNavigation(e) {
            // Implement custom tab order for complex components
            const activeElement = document.activeElement;
            
            // Handle command palette tab trapping
            const commandPanel = document.getElementById('command-menu-panel');
            if (commandPanel && !commandPanel.classList.contains('hidden')) {
                const focusableElements = commandPanel.querySelectorAll(
                    'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey && activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        }

        announceToScreenReader(message) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            
            announcement.textContent = message;
            document.body.appendChild(announcement);
            
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }
    }

    window.UIManager = UIManager;
    window.AccessibilityManager = AccessibilityManager;
})();

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (window.uiManager) {
        window.uiManager.destroy();
    }
});

console.log('✅ UI bundle loaded');

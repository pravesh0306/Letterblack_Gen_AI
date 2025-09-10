document.addEventListener('DOMContentLoaded', () => {
    // SETTINGS AND API MANAGEMENT
    (function initializeSettings() {
        const apiKeyInput = document.getElementById('api-key-setting');
        const providerSelect = document.getElementById('api-provider');
        const modelSelect = document.getElementById('model-select-setting');
        const memoryTextarea = document.getElementById('memory-textarea');
        const saveBtn = document.getElementById('save-and-test-btn');
        const mascotDebugBtn = document.getElementById('mascot-debug-btn');
        const deleteCacheBtn = document.getElementById('delete-cache-btn');

        // Load settings
        async function loadSettings() {
            if (window.cepStorage) {
                const settings = await window.cepStorage.loadSettings();
                if (apiKeyInput) apiKeyInput.value = settings.ai_api_key || '';
                if (providerSelect) providerSelect.value = settings.ai_provider || 'google';
                if (modelSelect) modelSelect.value = settings.ai_model || 'gemini-2.5-flash-preview-05-20';
                if (memoryTextarea) memoryTextarea.value = settings.ai_context_memory || '';
            }
        }

        // Save settings
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                if (window.cepStorage) {
                    const newSettings = {
                        ai_api_key: apiKeyInput ? apiKeyInput.value : '',
                        ai_provider: providerSelect ? providerSelect.value : 'google',
                        ai_model: modelSelect ? modelSelect.value : 'gemini-2.5-flash-preview-05-20',
                        ai_context_memory: memoryTextarea ? memoryTextarea.value : ''
                    };
                    const result = await window.cepStorage.saveSettings(newSettings);
                    // Visual feedback for save
                    const originalText = saveBtn.textContent;
                    saveBtn.textContent = result.success ? 'Saved ✓' : 'Error!';
                    saveBtn.classList.toggle('success', result.success);
                    saveBtn.classList.toggle('error', !result.success);
                    setTimeout(() => {
                        saveBtn.textContent = originalText;
                        saveBtn.classList.remove('success', 'error');
                    }, 2000);
                }
            });
        }

        // Mascot debug button
        if (mascotDebugBtn) {
            mascotDebugBtn.addEventListener('click', () => {
                if (window.testFloatingMascot) {
                    window.testFloatingMascot();
                }
            });
        }

        // Delete cache button
        if (deleteCacheBtn) {
            deleteCacheBtn.addEventListener('click', () => {
                if (window.deleteCacheAndReload) {
                    window.deleteCacheAndReload();
                }
            });
        }

        loadSettings();
    })();

    // FLOATING MASCOT
    (function initializeFloatingMascot() {
        const bubble = document.getElementById('floating-mascot');
        if (!bubble) return;

        let dragging = false;
        let offX = 0;
        let offY = 0;

        function getPanelBounds() {
            const panel = document.body;
            const rect = panel.getBoundingClientRect();
            const bubbleRect = bubble.getBoundingClientRect();
            return {
                minX: 10,
                minY: 10,
                maxX: Math.max(50, rect.width - (bubbleRect.width || 78) - 10),
                maxY: Math.max(50, rect.height - (bubbleRect.height || 78) - 10)
            };
        }

        function constrainPosition(x, y) {
            const bounds = getPanelBounds();
            return {
                x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
                y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
            };
        }

        try {
            const pos = JSON.parse(localStorage.getItem('floatingMascotPos'));
            if (pos && pos.x != null && pos.y != null) {
                const constrained = constrainPosition(pos.x, pos.y);
                bubble.style.left = constrained.x + 'px';
                bubble.style.top = constrained.y + 'px';
                bubble.style.right = 'auto';
                bubble.style.bottom = 'auto';
            }
        } catch (e) {
            this.logger.warn('Failed to restore mascot position:', e);
        }

        function down(e) {
            e.preventDefault();
            dragging = true;
            bubble.style.transition = 'none';
            bubble.classList.add('dragging');
            const r = bubble.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            offX = clientX - r.left;
            offY = clientY - r.top;
            document.addEventListener('mousemove', move, { passive: false });
            document.addEventListener('mouseup', up, { passive: false });
            document.addEventListener('touchmove', move, { passive: false });
            document.addEventListener('touchend', up, { passive: false });
        }

        function move(e) {
            if (!dragging) return;
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const x = clientX - offX;
            const y = clientY - offY;
            const constrained = constrainPosition(x, y);
            bubble.style.left = constrained.x + 'px';
            bubble.style.top = constrained.y + 'px';
        }

        function up() {
            if (!dragging) return;
            dragging = false;
            bubble.style.transition = '';
            bubble.classList.remove('dragging');
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', up);
            try {
                localStorage.setItem('floatingMascotPos', JSON.stringify({
                    x: parseInt(bubble.style.left) || 0,
                    y: parseInt(bubble.style.top) || 0
                }));
            } catch (e) {
                this.logger.warn('Failed to save mascot position:', e);
            }
        }

        bubble.addEventListener('mousedown', down);
        bubble.addEventListener('touchstart', down, { passive: false });
    })();

    // COMMAND PALETTE
    (function initializeCommandPalette() {
        const commandTrigger = document.getElementById('command-menu-trigger');
        const commandPanel = document.getElementById('command-menu-panel');
        const commandSearch = document.getElementById('command-search');

        if (!commandTrigger || !commandPanel) return;

        commandTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            commandPanel.classList.toggle('hidden');
            if (!commandPanel.classList.contains('hidden')) {
                commandSearch.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!commandPanel.contains(e.target) && !commandTrigger.contains(e.target)) {
                commandPanel.classList.add('hidden');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !commandPanel.classList.contains('hidden')) {
                commandPanel.classList.add('hidden');
            }
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                commandTrigger.click();
            }
        });
    })();

    // BOTTOM PANEL
    (function initializeBottomPanel() {
        const bottomPanel = document.getElementById('bottom-panel');
        const toggleButton = document.getElementById('bottom-panel-toggle');
        const panelContent = document.querySelector('.bottom-panel-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        let isCollapsed = false;

        function toggleBottomPanel() {
            isCollapsed = !isCollapsed;
            bottomPanel.classList.toggle('collapsed', isCollapsed);
            toggleButton.innerHTML = isCollapsed ? '<i class="fa-solid fa-chevron-up"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
            toggleButton.title = isCollapsed ? 'Expand Panel' : 'Collapse Panel';
        }

        if (toggleButton) {
            toggleButton.addEventListener('click', toggleBottomPanel);
        }

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (isCollapsed) {
                    toggleBottomPanel();
                }
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                tabPanes.forEach(pane => pane.classList.remove('active'));
                const targetPane = document.getElementById(this.getAttribute('data-tab') + '-tab');
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    })();
});

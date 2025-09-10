/**
 * Preset Layout Manager
 * Manages predefined layout configurations and user presets
 * Converted from React/TypeScript layout management patterns to pure JavaScript
 */

class PresetLayoutManager {
    constructor() {
        this.presets = new Map();
        this.userPresets = new Map();
        this.activePreset = null;
        this.observers = new Set();
        
        this.init();
    }
    
    /**
     * Initialize preset layout manager
     */
    init() {
        this.loadBuiltInPresets();
        this.loadUserPresets();
        console.log('✅ Preset Layout Manager initialized');
    }
    
    /**
     * Load built-in layout presets
     */
    loadBuiltInPresets() {
        // Default VS Code style layout
        this.presets.set('vscode', {
            id: 'vscode',
            name: 'VS Code Style',
            description: 'Classic development environment layout',
            builtin: true,
            layout: {
                panels: {
                    sidebar: {
                        position: 'left',
                        width: 240,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 120,
                        maxWidth: 400
                    },
                    main: {
                        position: 'center',
                        width: 'auto',
                        height: '100%',
                        resizable: false,
                        collapsible: false,
                        flex: 1
                    },
                    properties: {
                        position: 'right',
                        width: 300,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 200,
                        maxWidth: 500
                    },
                    bottom: {
                        position: 'bottom',
                        width: '100%',
                        height: 200,
                        resizable: true,
                        collapsible: true,
                        collapsed: true,
                        minHeight: 100,
                        maxHeight: 400
                    }
                },
                viewport: {
                    scale: 1.0,
                    minScale: 0.5,
                    maxScale: 2.0
                }
            }
        });
        
        // Wide screen layout
        this.presets.set('widescreen', {
            id: 'widescreen',
            name: 'Wide Screen',
            description: 'Optimized for ultra-wide monitors',
            builtin: true,
            layout: {
                panels: {
                    sidebar: {
                        position: 'left',
                        width: 280,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 200,
                        maxWidth: 500
                    },
                    main: {
                        position: 'center',
                        width: 'auto',
                        height: '100%',
                        resizable: false,
                        collapsible: false,
                        flex: 1
                    },
                    properties: {
                        position: 'right',
                        width: 350,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 250,
                        maxWidth: 600
                    },
                    tools: {
                        position: 'right-secondary',
                        width: 200,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 150,
                        maxWidth: 300
                    },
                    bottom: {
                        position: 'bottom',
                        width: '100%',
                        height: 250,
                        resizable: true,
                        collapsible: true,
                        collapsed: true,
                        minHeight: 150,
                        maxHeight: 500
                    }
                },
                viewport: {
                    scale: 0.9,
                    minScale: 0.5,
                    maxScale: 2.0
                }
            }
        });
        
        // Minimal layout
        this.presets.set('minimal', {
            id: 'minimal',
            name: 'Minimal',
            description: 'Clean and distraction-free workspace',
            builtin: true,
            layout: {
                panels: {
                    main: {
                        position: 'center',
                        width: '100%',
                        height: '100%',
                        resizable: false,
                        collapsible: false,
                        flex: 1
                    },
                    sidebar: {
                        position: 'left',
                        width: 48,
                        height: '100%',
                        resizable: false,
                        collapsible: true,
                        collapsed: true,
                        minWidth: 48,
                        maxWidth: 300
                    },
                    properties: {
                        position: 'right',
                        width: 250,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: true,
                        minWidth: 200,
                        maxWidth: 400
                    }
                },
                viewport: {
                    scale: 1.0,
                    minScale: 0.5,
                    maxScale: 2.0
                }
            }
        });
        
        // Creative workspace layout
        this.presets.set('creative', {
            id: 'creative',
            name: 'Creative Workspace',
            description: 'Optimized for creative work with large preview area',
            builtin: true,
            layout: {
                panels: {
                    tools: {
                        position: 'left',
                        width: 200,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 150,
                        maxWidth: 350
                    },
                    main: {
                        position: 'center',
                        width: 'auto',
                        height: '70%',
                        resizable: false,
                        collapsible: false,
                        flex: 1
                    },
                    properties: {
                        position: 'right',
                        width: 320,
                        height: '100%',
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minWidth: 250,
                        maxWidth: 500
                    },
                    timeline: {
                        position: 'bottom',
                        width: '100%',
                        height: 180,
                        resizable: true,
                        collapsible: true,
                        collapsed: false,
                        minHeight: 120,
                        maxHeight: 300
                    }
                },
                viewport: {
                    scale: 1.1,
                    minScale: 0.5,
                    maxScale: 2.0
                }
            }
        });
        
        // Dual monitor layout
        this.presets.set('dual-monitor', {
            id: 'dual-monitor',
            name: 'Dual Monitor',
            description: 'Split interface for dual monitor setup',
            builtin: true,
            layout: {
                panels: {
                    primary: {
                        position: 'left',
                        width: '50%',
                        height: '100%',
                        resizable: true,
                        collapsible: false,
                        minWidth: 600,
                        maxWidth: '70%'
                    },
                    secondary: {
                        position: 'right',
                        width: '50%',
                        height: '100%',
                        resizable: true,
                        collapsible: false,
                        minWidth: 400,
                        maxWidth: '70%'
                    }
                },
                viewport: {
                    scale: 1.0,
                    minScale: 0.5,
                    maxScale: 1.5
                }
            }
        });
    }
    
    /**
     * Load user-defined presets from localStorage
     */
    loadUserPresets() {
        try {
            const stored = localStorage.getItem('user-layout-presets');
            if (stored) {
                const userPresets = JSON.parse(stored);
                Object.entries(userPresets).forEach(([id, preset]) => {
                    this.userPresets.set(id, {
                        ...preset,
                        builtin: false,
                        createdAt: new Date(preset.createdAt),
                        modifiedAt: new Date(preset.modifiedAt)
                    });
                });
            }
        } catch (error) {
            console.warn('Failed to load user presets:', error);
        }
    }
    
    /**
     * Save user presets to localStorage
     */
    saveUserPresets() {
        try {
            const userPresets = Object.fromEntries(this.userPresets);
            localStorage.setItem('user-layout-presets', JSON.stringify(userPresets));
        } catch (error) {
            console.error('Failed to save user presets:', error);
        }
    }
    
    /**
     * Create a new user preset from current layout
     */
    createPreset(name, description = '', currentLayout = null) {
        if (!currentLayout && window.panelLayoutManager) {
            // Get current layout state from panel manager
            currentLayout = this.captureCurrentLayout();
        }
        
        if (!currentLayout) {
            throw new Error('No layout provided and cannot capture current layout');
        }
        
        const id = this.generatePresetId(name);
        const preset = {
            id,
            name,
            description,
            builtin: false,
            layout: currentLayout,
            createdAt: new Date(),
            modifiedAt: new Date()
        };
        
        this.userPresets.set(id, preset);
        this.saveUserPresets();
        this.notifyObservers('preset_created', preset);
        
        return preset;
    }
    
    /**
     * Capture current layout state
     */
    captureCurrentLayout() {
        if (!window.panelLayoutManager) return null;
        
        const panels = {};
        const allPanels = window.panelLayoutManager.getAllPanels();
        
        allPanels.forEach(panel => {
            panels[panel.id] = {
                position: panel.config.position,
                width: panel.state.width,
                height: panel.state.height,
                resizable: panel.config.resizable,
                collapsible: panel.config.collapsible,
                collapsed: panel.state.collapsed,
                minWidth: panel.config.minWidth,
                maxWidth: panel.config.maxWidth,
                minHeight: panel.config.minHeight,
                maxHeight: panel.config.maxHeight
            };
        });
        
        return {
            panels,
            viewport: {
                scale: window.panelLayoutManager.getViewportScale(),
                minScale: 0.5,
                maxScale: 2.0
            }
        };
    }
    
    /**
     * Apply a preset layout
     */
    applyPreset(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) {
            console.error('Preset not found:', presetId);
            return false;
        }
        
        if (!window.panelLayoutManager) {
            console.error('Panel layout manager not available');
            return false;
        }
        
        try {
            // Apply panel configurations
            Object.entries(preset.layout.panels).forEach(([panelId, config]) => {
                const panel = window.panelLayoutManager.getPanel(panelId);
                if (panel) {
                    // Update panel state
                    Object.assign(panel.state, {
                        width: config.width,
                        height: config.height,
                        collapsed: config.collapsed
                    });
                    
                    // Update panel config if needed
                    Object.assign(panel.config, {
                        minWidth: config.minWidth,
                        maxWidth: config.maxWidth,
                        minHeight: config.minHeight,
                        maxHeight: config.maxHeight
                    });
                    
                    // Apply state to DOM
                    window.panelLayoutManager.applyPanelState(panel);
                    window.panelLayoutManager.updateCollapseButton(panel);
                }
            });
            
            // Apply viewport scale
            if (preset.layout.viewport && preset.layout.viewport.scale) {
                window.panelLayoutManager.scaleViewport(preset.layout.viewport.scale);
            }
            
            this.activePreset = presetId;
            this.notifyObservers('preset_applied', preset);
            
            return true;
        } catch (error) {
            console.error('Failed to apply preset:', error);
            return false;
        }
    }
    
    /**
     * Get a preset by ID
     */
    getPreset(id) {
        return this.presets.get(id) || this.userPresets.get(id);
    }
    
    /**
     * Get all presets (built-in and user)
     */
    getAllPresets() {
        const allPresets = [];
        
        // Add built-in presets
        this.presets.forEach(preset => allPresets.push(preset));
        
        // Add user presets
        this.userPresets.forEach(preset => allPresets.push(preset));
        
        return allPresets.sort((a, b) => {
            // Built-in presets first
            if (a.builtin && !b.builtin) return -1;
            if (!a.builtin && b.builtin) return 1;
            
            // Then by name
            return a.name.localeCompare(b.name);
        });
    }
    
    /**
     * Delete a user preset
     */
    deletePreset(id) {
        const preset = this.userPresets.get(id);
        if (!preset) return false;
        
        if (preset.builtin) {
            console.error('Cannot delete built-in preset:', id);
            return false;
        }
        
        this.userPresets.delete(id);
        this.saveUserPresets();
        this.notifyObservers('preset_deleted', { id, preset });
        
        return true;
    }
    
    /**
     * Update a user preset
     */
    updatePreset(id, updates) {
        const preset = this.userPresets.get(id);
        if (!preset) return false;
        
        if (preset.builtin) {
            console.error('Cannot update built-in preset:', id);
            return false;
        }
        
        Object.assign(preset, updates, { modifiedAt: new Date() });
        this.saveUserPresets();
        this.notifyObservers('preset_updated', preset);
        
        return true;
    }
    
    /**
     * Create preset selection UI
     */
    createPresetSelector() {
        const container = document.createElement('div');
        container.className = 'preset-selector';
        
    const header = document.createElement('div');
    header.className = 'preset-selector-header';
    const h3 = document.createElement('h3');
    h3.textContent = 'Layout Presets';
    const createBtn = document.createElement('button');
    createBtn.className = 'preset-create-btn';
    createBtn.textContent = 'Create Preset';
    header.appendChild(h3);
    header.appendChild(createBtn);
        
        const list = document.createElement('div');
        list.className = 'preset-list';
        
        this.renderPresetList(list);
        
        container.appendChild(header);
        container.appendChild(list);
        
        // Bind events
    createBtn.addEventListener('click', () => this.showCreatePresetDialog());
        
        return container;
    }
    
    /**
     * Render preset list
     */
    renderPresetList(container) {
        container.innerHTML = '';
        const presets = this.getAllPresets();
        presets.forEach(preset => {
            const item = document.createElement('div');
            item.className = 'preset-item' + (preset.id === this.activePreset ? ' active' : '');

            const info = document.createElement('div');
            info.className = 'preset-info';
            const name = document.createElement('div');
            name.className = 'preset-name';
            name.textContent = String(preset.name || 'Untitled');
            const desc = document.createElement('div');
            desc.className = 'preset-description';
            desc.textContent = String(preset.description || '');
            info.appendChild(name);
            info.appendChild(desc);
            if (preset.builtin) {
                const built = document.createElement('span');
                built.className = 'preset-builtin';
                built.textContent = 'Built-in';
                info.appendChild(built);
            }

            const actions = document.createElement('div');
            actions.className = 'preset-actions';
            const apply = document.createElement('button');
            apply.className = 'preset-apply-btn';
            apply.dataset.presetId = preset.id;
            apply.textContent = 'Apply';
            actions.appendChild(apply);
            if (!preset.builtin) {
                const edit = document.createElement('button');
                edit.className = 'preset-edit-btn';
                edit.dataset.presetId = preset.id;
                edit.textContent = 'Edit';
                const del = document.createElement('button');
                del.className = 'preset-delete-btn';
                del.dataset.presetId = preset.id;
                del.textContent = 'Delete';
                actions.appendChild(edit);
                actions.appendChild(del);
            }

            item.appendChild(info);
            item.appendChild(actions);
            container.appendChild(item);
        });
        
        // Bind action events
        container.addEventListener('click', (e) => {
            const presetId = e.target.dataset.presetId;
            if (!presetId) return;
            
            if (e.target.classList.contains('preset-apply-btn')) {
                this.applyPreset(presetId);
            } else if (e.target.classList.contains('preset-edit-btn')) {
                this.showEditPresetDialog(presetId);
            } else if (e.target.classList.contains('preset-delete-btn')) {
                this.deletePresetWithConfirm(presetId);
            }
        });
    }
    
    /**
     * Show create preset dialog
     */
    showCreatePresetDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'preset-dialog-overlay';
    const panel = document.createElement('div');
    panel.className = 'preset-dialog';
    const header = document.createElement('div');
    header.className = 'preset-dialog-header';
    const title = document.createElement('h3');
    title.textContent = 'Create Layout Preset';
    const close = document.createElement('button');
    close.className = 'preset-dialog-close';
    close.textContent = '×';
    header.appendChild(title);
    header.appendChild(close);
    const content = document.createElement('div');
    content.className = 'preset-dialog-content';
    const fg1 = document.createElement('div');
    fg1.className = 'form-group';
    const l1 = document.createElement('label');
    l1.textContent = 'Preset Name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'preset-name-input';
    nameInput.placeholder = 'Enter preset name';
    nameInput.required = true;
    fg1.appendChild(l1);
    fg1.appendChild(nameInput);
    const fg2 = document.createElement('div');
    fg2.className = 'form-group';
    const l2 = document.createElement('label');
    l2.textContent = 'Description';
    const descInput = document.createElement('textarea');
    descInput.className = 'preset-description-input';
    descInput.placeholder = 'Optional description';
    fg2.appendChild(l2);
    fg2.appendChild(descInput);
    content.appendChild(fg1);
    content.appendChild(fg2);
    const footer = document.createElement('div');
    footer.className = 'preset-dialog-footer';
    const cancel = document.createElement('button');
    cancel.className = 'preset-dialog-cancel';
    cancel.textContent = 'Cancel';
    const save = document.createElement('button');
    save.className = 'preset-dialog-save';
    save.textContent = 'Create Preset';
    footer.appendChild(cancel);
    footer.appendChild(save);
    panel.appendChild(header);
    panel.appendChild(content);
    panel.appendChild(footer);
    dialog.appendChild(panel);
        
        document.body.appendChild(dialog);
        
        // Focus name input
    nameInput.focus();
        
        // Bind events
        close.addEventListener('click', () => dialog.remove());
        cancel.addEventListener('click', () => dialog.remove());

        save.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const description = descInput.value.trim();
            
            if (!name) {
                alert('Please enter a preset name');
                return;
            }
            
            try {
                this.createPreset(name, description);
                dialog.remove();
                console.log('Preset created successfully:', name);
            } catch (error) {
                alert('Failed to create preset: ' + error.message);
            }
        });
        
        // Close on overlay click
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    }
    
    /**
     * Show edit preset dialog
     */
    showEditPresetDialog(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset || preset.builtin) return;
        
    const dialog = document.createElement('div');
    dialog.className = 'preset-dialog-overlay';
    const panel = document.createElement('div');
    panel.className = 'preset-dialog';
    const header = document.createElement('div');
    header.className = 'preset-dialog-header';
    const title = document.createElement('h3');
    title.textContent = 'Edit Layout Preset';
    const close = document.createElement('button');
    close.className = 'preset-dialog-close';
    close.textContent = '×';
    header.appendChild(title);
    header.appendChild(close);
    const content = document.createElement('div');
    content.className = 'preset-dialog-content';
    const fg1 = document.createElement('div');
    fg1.className = 'form-group';
    const l1 = document.createElement('label');
    l1.textContent = 'Preset Name';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'preset-name-input';
    nameInput.required = true;
    nameInput.value = String(preset.name || '');
    fg1.appendChild(l1);
    fg1.appendChild(nameInput);
    const fg2 = document.createElement('div');
    fg2.className = 'form-group';
    const l2 = document.createElement('label');
    l2.textContent = 'Description';
    const descInput = document.createElement('textarea');
    descInput.className = 'preset-description-input';
    descInput.value = String(preset.description || '');
    fg2.appendChild(l2);
    fg2.appendChild(descInput);
    content.appendChild(fg1);
    content.appendChild(fg2);
    const footer = document.createElement('div');
    footer.className = 'preset-dialog-footer';
    const cancel = document.createElement('button');
    cancel.className = 'preset-dialog-cancel';
    cancel.textContent = 'Cancel';
    const save = document.createElement('button');
    save.className = 'preset-dialog-save';
    save.textContent = 'Save Changes';
    footer.appendChild(cancel);
    footer.appendChild(save);
    panel.appendChild(header);
    panel.appendChild(content);
    panel.appendChild(footer);
    dialog.appendChild(panel);
        
        document.body.appendChild(dialog);
        
        // Bind events
        close.addEventListener('click', () => dialog.remove());
        cancel.addEventListener('click', () => dialog.remove());
        save.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const description = descInput.value.trim();
            
            if (!name) {
                alert('Please enter a preset name');
                return;
            }
            
            this.updatePreset(presetId, { name, description });
            dialog.remove();
        });
        
        // Close on overlay click
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.remove(); });
    }
    
    /**
     * Delete preset with confirmation
     */
    deletePresetWithConfirm(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) return;
        
    if (confirm(`Delete preset "${String(preset.name)}"?`)) {
            this.deletePreset(presetId);
        }
    }
    
    /**
     * Generate unique preset ID
     */
    generatePresetId(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let id = base;
        let counter = 1;
        
        while (this.getPreset(id)) {
            id = `${base}-${counter}`;
            counter++;
        }
        
        return id;
    }
    
    /**
     * Subscribe to preset events
     */
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }
    
    /**
     * Notify observers of events
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in preset layout observer:', error);
            }
        });
    }
    
    /**
     * Export preset to file
     */
    exportPreset(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) return;
        
        const data = JSON.stringify(preset, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${preset.name.replace(/[^a-z0-9]/gi, '-')}-preset.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import preset from file
     */
    importPreset(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // Validate preset structure
                    if (!imported.name || !imported.layout) {
                        throw new Error('Invalid preset file format');
                    }
                    
                    // Create new preset with unique ID
                    const preset = this.createPreset(
                        imported.name,
                        imported.description || '',
                        imported.layout
                    );
                    
                    resolve(preset);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Export for use in other modules
window.PresetLayoutManager = PresetLayoutManager;

// Auto-initialize if not already done
if (!window.presetLayoutManager) {
    window.presetLayoutManager = new PresetLayoutManager();
    console.log('✅ Preset Layout Manager initialized');
}

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
        this.logger.debug('✅ Preset Layout Manager initialized');
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
            this.logger.warn('Failed to load user presets:', error);
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
            this.logger.error('Failed to save user presets:', error);
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
            this.logger.error('Preset not found:', presetId);
            return false;
        }
        
        if (!window.panelLayoutManager) {
            this.logger.error('Panel layout manager not available');
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
            this.logger.error('Failed to apply preset:', error);
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
            this.logger.error('Cannot delete built-in preset:', id);
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
            this.logger.error('Cannot update built-in preset:', id);
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
        header.innerHTML = `
            <h3>Layout Presets</h3>
            <button class="preset-create-btn">Create Preset</button>
        `;
        
        const list = document.createElement('div');
        list.className = 'preset-list';
        
        this.renderPresetList(list);
        
        container.appendChild(header);
        container.appendChild(list);
        
        // Bind events
        header.querySelector('.preset-create-btn').addEventListener('click', () => {
            this.showCreatePresetDialog();
        });
        
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
            item.className = `preset-item ${preset.id === this.activePreset ? 'active' : ''}`;
            
            item.innerHTML = `
                <div class="preset-info">
                    <div class="preset-name">${preset.name}</div>
                    <div class="preset-description">${preset.description}</div>
                    ${preset.builtin ? '<span class="preset-builtin">Built-in</span>' : ''}
                </div>
                <div class="preset-actions">
                    <button class="preset-apply-btn" data-preset-id="${preset.id}">Apply</button>
                    ${!preset.builtin ? `
                        <button class="preset-edit-btn" data-preset-id="${preset.id}">Edit</button>
                        <button class="preset-delete-btn" data-preset-id="${preset.id}">Delete</button>
                    ` : ''}
                </div>
            `;
            
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
        dialog.innerHTML = `
            <div class="preset-dialog">
                <div class="preset-dialog-header">
                    <h3>Create Layout Preset</h3>
                    <button class="preset-dialog-close">×</button>
                </div>
                <div class="preset-dialog-content">
                    <div class="form-group">
                        <label>Preset Name</label>
                        <input type="text" class="preset-name-input" placeholder="Enter preset name" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="preset-description-input" placeholder="Optional description"></textarea>
                    </div>
                </div>
                <div class="preset-dialog-footer">
                    <button class="preset-dialog-cancel">Cancel</button>
                    <button class="preset-dialog-save">Create Preset</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Focus name input
        dialog.querySelector('.preset-name-input').focus();
        
        // Bind events
        dialog.querySelector('.preset-dialog-close').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.preset-dialog-cancel').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.preset-dialog-save').addEventListener('click', () => {
            const name = dialog.querySelector('.preset-name-input').value.trim();
            const description = dialog.querySelector('.preset-description-input').value.trim();
            
            if (!name) {
                alert('Please enter a preset name');
                return;
            }
            
            try {
                this.createPreset(name, description);
                dialog.remove();
                this.logger.debug('Preset created successfully:', name);
            } catch (error) {
                alert('Failed to create preset: ' + error.message);
            }
        });
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    /**
     * Show edit preset dialog
     */
    showEditPresetDialog(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset || preset.builtin) return;
        
        const dialog = document.createElement('div');
        dialog.className = 'preset-dialog-overlay';
        dialog.innerHTML = `
            <div class="preset-dialog">
                <div class="preset-dialog-header">
                    <h3>Edit Layout Preset</h3>
                    <button class="preset-dialog-close">×</button>
                </div>
                <div class="preset-dialog-content">
                    <div class="form-group">
                        <label>Preset Name</label>
                        <input type="text" class="preset-name-input" value="${preset.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="preset-description-input">${preset.description}</textarea>
                    </div>
                </div>
                <div class="preset-dialog-footer">
                    <button class="preset-dialog-cancel">Cancel</button>
                    <button class="preset-dialog-save">Save Changes</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Bind events
        dialog.querySelector('.preset-dialog-close').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.preset-dialog-cancel').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.querySelector('.preset-dialog-save').addEventListener('click', () => {
            const name = dialog.querySelector('.preset-name-input').value.trim();
            const description = dialog.querySelector('.preset-description-input').value.trim();
            
            if (!name) {
                alert('Please enter a preset name');
                return;
            }
            
            this.updatePreset(presetId, { name, description });
            dialog.remove();
        });
        
        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
    }
    
    /**
     * Delete preset with confirmation
     */
    deletePresetWithConfirm(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) return;
        
        if (confirm(`Delete preset "${preset.name}"?`)) {
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
                this.logger.error('Error in preset layout observer:', error);
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
    this.logger.debug('✅ Preset Layout Manager initialized');
}

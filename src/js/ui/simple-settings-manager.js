/**
 * Simple Settings Manager
 * Handles application settings with local storage persistence
 * Converted from React/TypeScript patterns to pure JavaScript
 */

class SimpleSettingsManager {
    constructor() {
        this.settingsKey = 'adobe-ai-settings';
        this.defaultSettings = {
            // Appearance
            theme: 'dark',
            layoutScale: 1.0,
            showGrid: true,
            showMinimap: true,
            
            // AI Configuration
            aiProvider: 'lmstudio',
            apiEndpoint: 'http://localhost:1234/v1',
            defaultModel: '',
            temperature: 0.7,
            maxTokens: 2048,
            
            // File Handling
            maxFileSize: 50 * 1024 * 1024, // 50MB
            enableClipboard: true,
            autoSave: true,
            
            // Performance
            enablePerformanceMonitoring: true,
            maxUndoSteps: 50,
            autoCleanup: true,
            
            // UI Preferences
            sidebarCollapsed: false,
            propertiesPanelCollapsed: false,
            bottomPanelCollapsed: true,
            
            // Shortcuts
            shortcuts: {
                'Ctrl+Enter': 'executeWorkflow',
                'Ctrl+N': 'newWorkflow',
                'Ctrl+S': 'saveWorkflow',
                'Ctrl+Z': 'undo',
                'Ctrl+Y': 'redo',
                'Ctrl+/': 'showShortcuts'
            }
        };
        
        this.settings = this.loadSettings();
        this.observers = new Set();
        this.setupEventListeners();
    }
    
    /**
     * Load settings from localStorage with fallback to defaults
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.settingsKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.defaultSettings, ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load settings from localStorage:', error);
        }
        return { ...this.defaultSettings };
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
            console.log('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    /**
     * Get a setting value
     */
    get(key) {
        return this.getNestedValue(this.settings, key);
    }
    
    /**
     * Set a setting value
     */
    set(key, value) {
        this.setNestedValue(this.settings, key, value);
        this.saveSettings();
        this.notifyObservers(key, value);
    }
    
    /**
     * Update multiple settings at once
     */
    updateSettings(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.setNestedValue(this.settings, key, value);
        });
        this.saveSettings();
        this.notifyObservers('bulk_update', updates);
    }
    
    /**
     * Reset to default settings
     */
    reset() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.notifyObservers('reset', this.settings);
    }
    
    /**
     * Get all settings
     */
    getAll() {
        return { ...this.settings };
    }
    
    /**
     * Subscribe to settings changes
     */
    subscribe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }
    
    /**
     * Notify observers of changes
     */
    notifyObservers(key, value) {
        this.observers.forEach(callback => {
            try {
                callback(key, value, this.settings);
            } catch (error) {
                console.error('Error in settings observer:', error);
            }
        });
    }
    
    /**
     * Create settings panel UI
     */
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-overlay">
                <div class="settings-modal">
                    <div class="settings-header">
                        <h2>Settings</h2>
                        <button class="settings-close">×</button>
                    </div>
                    <div class="settings-content">
                        ${this.generateSettingsHTML()}
                    </div>
                    <div class="settings-footer">
                        <button class="settings-reset">Reset to Defaults</button>
                        <button class="settings-save">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        this.bindSettingsEvents(panel);
        return panel;
    }
    
    /**
     * Generate settings form HTML
     */
    generateSettingsHTML() {
        return `
            <div class="settings-section">
                <h3>Appearance</h3>
                <div class="setting-item">
                    <label>Theme</label>
                    <select class="setting-input" data-setting="theme">
                        <option value="dark" ${this.get('theme') === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="light" ${this.get('theme') === 'light' ? 'selected' : ''}>Light</option>
                        <option value="auto" ${this.get('theme') === 'auto' ? 'selected' : ''}>Auto</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>Layout Scale</label>
                    <input type="range" class="setting-input" data-setting="layoutScale" 
                           min="0.5" max="2.0" step="0.1" value="${this.get('layoutScale')}">
                    <span class="setting-value">${Math.round(this.get('layoutScale') * 100)}%</span>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" class="setting-input" data-setting="showGrid" 
                               ${this.get('showGrid') ? 'checked' : ''}>
                        Show Grid
                    </label>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>AI Configuration</h3>
                <div class="setting-item">
                    <label>API Endpoint</label>
                    <input type="text" class="setting-input" data-setting="apiEndpoint" 
                           value="${this.get('apiEndpoint')}" placeholder="http://localhost:1234/v1">
                </div>
                <div class="setting-item">
                    <label>Temperature</label>
                    <input type="range" class="setting-input" data-setting="temperature" 
                           min="0" max="2" step="0.1" value="${this.get('temperature')}">
                    <span class="setting-value">${this.get('temperature')}</span>
                </div>
                <div class="setting-item">
                    <label>Max Tokens</label>
                    <input type="number" class="setting-input" data-setting="maxTokens" 
                           value="${this.get('maxTokens')}" min="128" max="8192">
                </div>
            </div>
            
            <div class="settings-section">
                <h3>File Handling</h3>
                <div class="setting-item">
                    <label>Max File Size (MB)</label>
                    <input type="number" class="setting-input" data-setting="maxFileSize" 
                           value="${this.get('maxFileSize') / 1024 / 1024}" min="1" max="500">
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" class="setting-input" data-setting="enableClipboard" 
                               ${this.get('enableClipboard') ? 'checked' : ''}>
                        Enable Clipboard Detection
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" class="setting-input" data-setting="autoSave" 
                               ${this.get('autoSave') ? 'checked' : ''}>
                        Auto-save Workflows
                    </label>
                </div>
            </div>
        `;
    }
    
    /**
     * Bind events to settings panel
     */
    bindSettingsEvents(panel) {
        // Close button
        panel.querySelector('.settings-close').addEventListener('click', () => {
            panel.remove();
        });
        
        // Settings inputs
        panel.querySelectorAll('.setting-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const setting = e.target.dataset.setting;
                let value = e.target.value;
                
                // Type conversion
                if (e.target.type === 'checkbox') {
                    value = e.target.checked;
                } else if (e.target.type === 'number' || e.target.type === 'range') {
                    value = parseFloat(value);
                    if (setting === 'maxFileSize') {
                        value = value * 1024 * 1024; // Convert MB to bytes
                    }
                }
                
                this.set(setting, value);
                
                // Update display values
                const valueSpan = e.target.parentNode.querySelector('.setting-value');
                if (valueSpan) {
                    if (setting === 'layoutScale') {
                        valueSpan.textContent = Math.round(value * 100) + '%';
                    } else {
                        valueSpan.textContent = value;
                    }
                }
            });
        });
        
        // Reset button
        panel.querySelector('.settings-reset').addEventListener('click', () => {
            if (confirm('Reset all settings to defaults?')) {
                this.reset();
                panel.remove();
            }
        });
        
        // Save button
        panel.querySelector('.settings-save').addEventListener('click', () => {
            panel.remove();
        });
        
        // Close on overlay click
        panel.querySelector('.settings-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                panel.remove();
            }
        });
    }
    
    /**
     * Show settings panel
     */
    showSettingsPanel() {
        // Remove existing panel
        const existing = document.querySelector('.settings-panel');
        if (existing) existing.remove();
        
        // Create and show new panel
        const panel = this.createSettingsPanel();
        document.body.appendChild(panel);
    }
    
    /**
     * Apply theme changes
     */
    applyTheme(theme = this.get('theme')) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Apply initial theme
        this.applyTheme();
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.get('theme') === 'auto') {
                this.applyTheme();
            }
        });
        
        // Settings change handler
        this.subscribe((key, value) => {
            if (key === 'theme') {
                this.applyTheme(value);
            } else if (key === 'layoutScale') {
                document.documentElement.style.setProperty('--layout-scale', value);
            }
        });
    }
    
    /**
     * Helper to get nested object values
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    /**
     * Helper to set nested object values
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    
    /**
     * Export settings to file
     */
    exportSettings() {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'adobe-ai-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import settings from file
     */
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    this.updateSettings(imported);
                    console.log('Settings imported successfully');
                    resolve(imported);
                } catch (error) {
                    console.error('Failed to import settings:', error);
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}

// Export for use in other modules
window.SimpleSettingsManager = SimpleSettingsManager;

// Auto-initialize if not already done
if (!window.settingsManager) {
    window.settingsManager = new SimpleSettingsManager();
    console.log('✅ Simple Settings Manager initialized');
}

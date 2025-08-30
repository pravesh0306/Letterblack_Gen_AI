/**
 * Panel Layout Manager
 * Advanced resizable panel system with sophisticated layout management
 * Converted from React/TypeScript ResizablePanel and ScalableLayout patterns to pure JavaScript
 */

class PanelLayoutManager {
    constructor() {
        this.panels = new Map();
        this.layouts = new Map();
        this.activeLayout = null;
        this.constraints = {
            minWidth: 150,
            maxWidth: 800,
            minHeight: 100,
            maxHeight: 600
        };
        
        this.resizing = null;
        this.observers = new Set();
        this.layouts.set('default', this.createDefaultLayout());
        
        this.init();
    }
    
    /**
     * Initialize the panel layout manager
     */
    init() {
        this.setupEventListeners();
        this.createLayoutStyles();
        console.log('✅ Panel Layout Manager initialized');
    }
    
    /**
     * Create default layout configuration
     */
    createDefaultLayout() {
        return {
            id: 'default',
            name: 'Default Layout',
            panels: {
                sidebar: {
                    position: 'left',
                    width: 250,
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
                    minHeight: 150,
                    maxHeight: 400
                }
            },
            viewport: {
                scale: 1.0,
                minScale: 0.5,
                maxScale: 2.0,
                scaleStep: 0.1
            }
        };
    }
    
    /**
     * Register a panel with the layout manager
     */
    registerPanel(id, element, config = {}) {
        const panel = {
            id,
            element,
            config: {
                position: 'left',
                width: 250,
                height: 'auto',
                resizable: true,
                collapsible: true,
                collapsed: false,
                minWidth: 150,
                maxWidth: 600,
                minHeight: 100,
                maxHeight: 400,
                ...config
            },
            state: {
                width: config.width || 250,
                height: config.height || 'auto',
                collapsed: config.collapsed || false,
                resizing: false
            }
        };
        
        this.panels.set(id, panel);
        this.setupPanel(panel);
        this.notifyObservers('panel_registered', panel);
        
        return panel;
    }
    
    /**
     * Setup panel element with resize and collapse functionality
     */
    setupPanel(panel) {
        const { element, config, state } = panel;
        
        // Add panel classes
        element.classList.add('resizable-panel', `panel-${config.position}`);
        
        // Create panel structure
        const wrapper = document.createElement('div');
        wrapper.className = 'panel-wrapper';
        
        const header = document.createElement('div');
        header.className = 'panel-header';
        
        const content = document.createElement('div');
        content.className = 'panel-content';
        
        // Move existing content to content div
        while (element.firstChild) {
            content.appendChild(element.firstChild);
        }
        
        // Add collapse button if collapsible
        if (config.collapsible) {
            const collapseBtn = document.createElement('button');
            collapseBtn.className = 'panel-collapse-btn';
            collapseBtn.innerHTML = this.getCollapseIcon(config.position, state.collapsed);
            collapseBtn.addEventListener('click', () => this.togglePanel(panel.id));
            header.appendChild(collapseBtn);
        }
        
        // Add resize handles if resizable
        if (config.resizable) {
            this.addResizeHandles(wrapper, panel);
        }
        
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        element.appendChild(wrapper);
        
        // Apply initial state
        this.applyPanelState(panel);
    }
    
    /**
     * Add resize handles to panel
     */
    addResizeHandles(wrapper, panel) {
        const { config } = panel;
        const handles = [];
        
        // Determine which handles to add based on position
        switch (config.position) {
            case 'left':
                handles.push('right');
                break;
            case 'right':
                handles.push('left');
                break;
            case 'top':
                handles.push('bottom');
                break;
            case 'bottom':
                handles.push('top');
                break;
            case 'center':
                // Center panels typically don't need handles
                break;
        }
        
        handles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-handle-${direction}`;
            handle.addEventListener('mousedown', (e) => this.startResize(e, panel, direction));
            wrapper.appendChild(handle);
        });
    }
    
    /**
     * Start panel resize operation
     */
    startResize(event, panel, direction) {
        event.preventDefault();
        
        this.resizing = {
            panel,
            direction,
            startX: event.clientX,
            startY: event.clientY,
            startWidth: panel.state.width,
            startHeight: panel.state.height
        };
        
        panel.state.resizing = true;
        panel.element.classList.add('resizing');
        
        // Add global mouse handlers
        document.addEventListener('mousemove', this.handleResize.bind(this));
        document.addEventListener('mouseup', this.endResize.bind(this));
        
        // Prevent text selection
        document.body.style.userSelect = 'none';
        
        this.notifyObservers('resize_start', { panel: panel.id, direction });
    }
    
    /**
     * Handle panel resize
     */
    handleResize(event) {
        if (!this.resizing) return;
        
        const { panel, direction, startX, startY, startWidth, startHeight } = this.resizing;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        // Calculate new dimensions based on direction
        switch (direction) {
            case 'right':
                newWidth = startWidth + deltaX;
                break;
            case 'left':
                newWidth = startWidth - deltaX;
                break;
            case 'bottom':
                newHeight = startHeight + deltaY;
                break;
            case 'top':
                newHeight = startHeight - deltaY;
                break;
        }
        
        // Apply constraints
        newWidth = Math.max(panel.config.minWidth, Math.min(panel.config.maxWidth, newWidth));
        newHeight = Math.max(panel.config.minHeight, Math.min(panel.config.maxHeight, newHeight));
        
        // Update panel state
        panel.state.width = newWidth;
        panel.state.height = newHeight;
        
        this.applyPanelState(panel);
        this.notifyObservers('resize_update', { panel: panel.id, width: newWidth, height: newHeight });
    }
    
    /**
     * End panel resize operation
     */
    endResize() {
        if (!this.resizing) return;
        
        const { panel } = this.resizing;
        
        panel.state.resizing = false;
        panel.element.classList.remove('resizing');
        
        // Remove global mouse handlers
        document.removeEventListener('mousemove', this.handleResize.bind(this));
        document.removeEventListener('mouseup', this.endResize.bind(this));
        
        // Restore text selection
        document.body.style.userSelect = '';
        
        this.notifyObservers('resize_end', { panel: panel.id });
        this.resizing = null;
    }
    
    /**
     * Toggle panel collapsed state
     */
    togglePanel(panelId) {
        const panel = this.panels.get(panelId);
        if (!panel || !panel.config.collapsible) return;
        
        panel.state.collapsed = !panel.state.collapsed;
        this.applyPanelState(panel);
        this.updateCollapseButton(panel);
        
        this.notifyObservers('panel_toggled', { panel: panelId, collapsed: panel.state.collapsed });
    }
    
    /**
     * Apply panel state to DOM element
     */
    applyPanelState(panel) {
        const { element, config, state } = panel;
        const wrapper = element.querySelector('.panel-wrapper');
        
        if (state.collapsed) {
            element.classList.add('collapsed');
            
            // Collapse to minimal size
            switch (config.position) {
                case 'left':
                case 'right':
                    element.style.width = '32px';
                    element.style.height = state.height + 'px';
                    break;
                case 'top':
                case 'bottom':
                    element.style.width = '100%';
                    element.style.height = '32px';
                    break;
            }
        } else {
            element.classList.remove('collapsed');
            
            // Apply full dimensions
            if (typeof state.width === 'number') {
                element.style.width = state.width + 'px';
            } else {
                element.style.width = state.width;
            }
            
            if (typeof state.height === 'number') {
                element.style.height = state.height + 'px';
            } else {
                element.style.height = state.height;
            }
        }
        
        // Apply flex properties for center panels
        if (config.flex) {
            element.style.flex = config.flex;
        }
    }
    
    /**
     * Update collapse button icon
     */
    updateCollapseButton(panel) {
        const button = panel.element.querySelector('.panel-collapse-btn');
        if (button) {
            button.innerHTML = this.getCollapseIcon(panel.config.position, panel.state.collapsed);
        }
    }
    
    /**
     * Get collapse icon based on position and state
     */
    getCollapseIcon(position, collapsed) {
        const icons = {
            left: collapsed ? '▶' : '◀',
            right: collapsed ? '◀' : '▶',
            top: collapsed ? '▼' : '▲',
            bottom: collapsed ? '▲' : '▼'
        };
        
        return icons[position] || '●';
    }
    
    /**
     * Create layout from configuration
     */
    createLayout(layoutConfig) {
        const layout = {
            id: layoutConfig.id,
            name: layoutConfig.name,
            container: null,
            ...layoutConfig
        };
        
        // Create layout container
        const container = document.createElement('div');
        container.className = 'panel-layout';
        container.dataset.layoutId = layout.id;
        
        // Create viewport if specified
        if (layout.viewport) {
            const viewport = document.createElement('div');
            viewport.className = 'layout-viewport';
            viewport.style.transform = `scale(${layout.viewport.scale})`;
            container.appendChild(viewport);
            layout.viewport.element = viewport;
        }
        
        layout.container = container;
        this.layouts.set(layout.id, layout);
        
        return layout;
    }
    
    /**
     * Apply layout to container
     */
    applyLayout(layoutId, container) {
        const layout = this.layouts.get(layoutId);
        if (!layout) {
            console.error('Layout not found:', layoutId);
            return;
        }
        
        container.className = 'panel-layout-container';
        
        // Create layout structure
        Object.entries(layout.panels).forEach(([panelId, panelConfig]) => {
            const panelElement = document.createElement('div');
            panelElement.id = `panel-${panelId}`;
            panelElement.className = `panel panel-${panelConfig.position}`;
            
            container.appendChild(panelElement);
            
            // Register panel
            this.registerPanel(panelId, panelElement, panelConfig);
        });
        
        this.activeLayout = layoutId;
        this.notifyObservers('layout_applied', { layoutId, container });
    }
    
    /**
     * Scale viewport
     */
    scaleViewport(scale, layoutId = this.activeLayout) {
        const layout = this.layouts.get(layoutId);
        if (!layout || !layout.viewport) return;
        
        // Constrain scale
        scale = Math.max(layout.viewport.minScale, Math.min(layout.viewport.maxScale, scale));
        
        layout.viewport.scale = scale;
        
        if (layout.viewport.element) {
            layout.viewport.element.style.transform = `scale(${scale})`;
            layout.viewport.element.style.transformOrigin = 'top center';
        }
        
        this.notifyObservers('viewport_scaled', { layoutId, scale });
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Viewport scaling
            if (e.ctrlKey) {
                switch (e.key) {
                    case '=':
                    case '+':
                        e.preventDefault();
                        this.scaleViewport(this.getViewportScale() + 0.1);
                        break;
                    case '-':
                        e.preventDefault();
                        this.scaleViewport(this.getViewportScale() - 0.1);
                        break;
                    case '0':
                        e.preventDefault();
                        this.scaleViewport(1.0);
                        break;
                }
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Recalculate panel constraints based on window size
        this.panels.forEach(panel => {
            this.applyPanelState(panel);
        });
    }
    
    /**
     * Get current viewport scale
     */
    getViewportScale() {
        const layout = this.layouts.get(this.activeLayout);
        return layout?.viewport?.scale || 1.0;
    }
    
    /**
     * Create layout-specific CSS styles
     */
    createLayoutStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .panel-layout-container {
                display: flex;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            
            .resizable-panel {
                position: relative;
                background: var(--bg-secondary, #1a1a1a);
                border: 1px solid var(--border-primary, #333333);
                transition: all 0.2s ease;
            }
            
            .resizable-panel.collapsed {
                overflow: hidden;
            }
            
            .resizable-panel.resizing {
                transition: none;
                user-select: none;
            }
            
            .panel-wrapper {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                position: relative;
            }
            
            .panel-header {
                height: 32px;
                background: var(--bg-tertiary, #262626);
                border-bottom: 1px solid var(--border-primary, #333333);
                display: flex;
                align-items: center;
                padding: 0 8px;
                flex-shrink: 0;
            }
            
            .panel-content {
                flex: 1;
                overflow: auto;
            }
            
            .panel-collapse-btn {
                background: none;
                border: none;
                color: var(--text-secondary, #a0a0a0);
                cursor: pointer;
                padding: 4px;
                border-radius: 2px;
                font-size: 12px;
                line-height: 1;
                margin-left: auto;
            }
            
            .panel-collapse-btn:hover {
                background: var(--bg-primary, #0d0d0d);
                color: var(--text-primary, #ffffff);
            }
            
            .resize-handle {
                position: absolute;
                background: transparent;
                z-index: 10;
            }
            
            .resize-handle:hover {
                background: var(--accent-red, #dc2626);
                opacity: 0.3;
            }
            
            .resize-handle-right {
                top: 0;
                right: -2px;
                width: 4px;
                height: 100%;
                cursor: col-resize;
            }
            
            .resize-handle-left {
                top: 0;
                left: -2px;
                width: 4px;
                height: 100%;
                cursor: col-resize;
            }
            
            .resize-handle-bottom {
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 4px;
                cursor: row-resize;
            }
            
            .resize-handle-top {
                top: -2px;
                left: 0;
                width: 100%;
                height: 4px;
                cursor: row-resize;
            }
            
            .panel-left {
                border-right: 1px solid var(--border-primary, #333333);
            }
            
            .panel-right {
                border-left: 1px solid var(--border-primary, #333333);
            }
            
            .panel-top {
                border-bottom: 1px solid var(--border-primary, #333333);
            }
            
            .panel-bottom {
                border-top: 1px solid var(--border-primary, #333333);
            }
            
            .panel-center {
                flex: 1;
                border: none;
            }
            
            .layout-viewport {
                width: 100%;
                height: 100%;
                transform-origin: top center;
                transition: transform 0.2s ease;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Subscribe to layout events
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
                console.error('Error in panel layout observer:', error);
            }
        });
    }
    
    /**
     * Save layout state
     */
    saveLayoutState() {
        const state = {
            activeLayout: this.activeLayout,
            panels: {}
        };
        
        this.panels.forEach((panel, id) => {
            state.panels[id] = {
                width: panel.state.width,
                height: panel.state.height,
                collapsed: panel.state.collapsed
            };
        });
        
        try {
            localStorage.setItem('panel-layout-state', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save layout state:', error);
        }
    }
    
    /**
     * Load layout state
     */
    loadLayoutState() {
        try {
            const stored = localStorage.getItem('panel-layout-state');
            if (stored) {
                const state = JSON.parse(stored);
                
                // Restore panel states
                Object.entries(state.panels).forEach(([id, panelState]) => {
                    const panel = this.panels.get(id);
                    if (panel) {
                        Object.assign(panel.state, panelState);
                        this.applyPanelState(panel);
                        this.updateCollapseButton(panel);
                    }
                });
                
                return state;
            }
        } catch (error) {
            console.warn('Failed to load layout state:', error);
        }
        
        return null;
    }
    
    /**
     * Get panel by ID
     */
    getPanel(id) {
        return this.panels.get(id);
    }
    
    /**
     * Get all panels
     */
    getAllPanels() {
        return Array.from(this.panels.values());
    }
}

// Export for use in other modules
window.PanelLayoutManager = PanelLayoutManager;

// Auto-initialize if not already done
if (!window.panelLayoutManager) {
    window.panelLayoutManager = new PanelLayoutManager();
    console.log('✅ Panel Layout Manager initialized');
}

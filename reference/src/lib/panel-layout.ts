// panel-layout.ts
// Manages bottom panel toggle, tab navigation, height persistence, and resize behavior.

// --- TYPE DEFINITIONS ---

interface PanelLayoutOptions {
    minHeight?: number;
    defaultHeight?: number;
    maxHeightRatio?: number;
}

class PanelLayout {
    private bottomPanel: HTMLElement;
    private toggleButton: HTMLElement;
    private panelResizer: HTMLElement;
    private bottomPanelTabs: NodeListOf<HTMLElement>;
    private bottomTabPanes: NodeListOf<HTMLElement>;

    private isResizing: boolean = false;
    private startY: number = 0;
    private startHeight: number = 0;

    private readonly MIN_HEIGHT: number;
    private readonly DEFAULT_HEIGHT: number;
    private readonly MAX_HEIGHT_RATIO: number;

    constructor(options: PanelLayoutOptions = {}) {
        this.MIN_HEIGHT = options.minHeight || 140;
        this.DEFAULT_HEIGHT = options.defaultHeight || 300;
        this.MAX_HEIGHT_RATIO = options.maxHeightRatio || 0.8; // 80% of viewport height

        // Bind methods to ensure 'this' context is correct in event listeners
        this.handleToggleClick = this.handleToggleClick.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.stopResize = this.stopResize.bind(this);
        this.resetHeight = this.resetHeight.bind(this);
    }

    /**
     * Initializes the panel layout manager.
     * Queries for necessary elements and attaches event listeners.
     */
    public init(): void {
        this.bottomPanel = document.getElementById('bottom-panel') as HTMLElement;
        this.toggleButton = document.getElementById('bottom-panel-toggle') as HTMLElement;
        this.panelResizer = document.getElementById('bottom-panel-resizer') as HTMLElement;
        this.bottomPanelTabs = document.querySelectorAll('.bottom-panel-tabs .tab-btn');
        this.bottomTabPanes = document.querySelectorAll('#bottom-panel .tab-pane');

        if (!this.bottomPanel || !this.toggleButton || !this.panelResizer) {
            console.error('PanelLayout: Could not find essential panel elements. Aborting initialization.');
            return;
        }

        this.restorePanelHeight();
        this.initializeToggleButton();
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        this.toggleButton.addEventListener('click', this.handleToggleClick);
        this.bottomPanelTabs.forEach(tab => tab.addEventListener('click', this.handleTabClick));
        this.panelResizer.addEventListener('mousedown', this.handleMouseDown);
        this.panelResizer.addEventListener('dblclick', this.resetHeight);
    }

    private restorePanelHeight(): void {
        const storedHeight = localStorage.getItem('bottomPanelHeight');
        const height = storedHeight ? `${storedHeight}px` : `${this.DEFAULT_HEIGHT}px`;
        document.documentElement.style.setProperty('--bottom-panel-height', height);
    }

    private initializeToggleButton(): void {
        const isInitiallyCollapsed = this.bottomPanel.classList.contains('collapsed');
        this.toggleButton.classList.toggle('panel-collapsed', isInitiallyCollapsed);
        this.toggleButton.setAttribute('title', isInitiallyCollapsed ? 'Show Panel' : 'Hide Panel');
    }

    private handleToggleClick(): void {
        const isCollapsed = this.bottomPanel.classList.toggle('collapsed');
        this.toggleButton.classList.toggle('panel-collapsed', isCollapsed);
        this.toggleButton.setAttribute('title', isCollapsed ? 'Show Panel' : 'Hide Panel');
    }

    private handleTabClick(event: Event): void {
        const clickedTab = event.currentTarget as HTMLElement;
        const targetTabId = clickedTab.getAttribute('data-tab');

        if (!targetTabId) return;

        // Update tab buttons
        this.bottomPanelTabs.forEach(t => t.classList.remove('active'));
        clickedTab.classList.add('active');

        // Update tab panes
        this.bottomTabPanes.forEach(p => p.classList.remove('active'));
        const targetPane = document.getElementById(`${targetTabId}-tab`);
        if (targetPane) {
            targetPane.classList.add('active');
        }

        // If panel was collapsed, expand it
        if (this.bottomPanel.classList.contains('collapsed')) {
            this.handleToggleClick();
        }
    }

    private handleMouseDown(event: MouseEvent): void {
        if (this.bottomPanel.classList.contains('collapsed')) return;

        this.isResizing = true;
        this.startY = event.clientY;
        this.startHeight = this.bottomPanel.offsetHeight;
        
        this.bottomPanel.classList.add('resizing');
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.stopResize);
    }

    private handleMouseMove(event: MouseEvent): void {
        if (!this.isResizing) return;

        const dy = this.startY - event.clientY;
        const maxHeight = Math.floor(window.innerHeight * this.MAX_HEIGHT_RATIO);
        let newHeight = Math.min(Math.max(this.startHeight + dy, this.MIN_HEIGHT), maxHeight);

        document.documentElement.style.setProperty('--bottom-panel-height', `${newHeight}px`);
    }

    private stopResize(): void {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.bottomPanel.classList.remove('resizing');
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.stopResize);

        const finalHeight = this.bottomPanel.offsetHeight;
        localStorage.setItem('bottomPanelHeight', finalHeight.toString());
    }

    private resetHeight(): void {
        document.documentElement.style.setProperty('--bottom-panel-height', `${this.DEFAULT_HEIGHT}px`);
        localStorage.removeItem('bottomPanelHeight');
    }

    /**
     * Cleans up all event listeners.
     */
    public destroy(): void {
        if (this.toggleButton) {
            this.toggleButton.removeEventListener('click', this.handleToggleClick);
        }
        if (this.bottomPanelTabs) {
            this.bottomPanelTabs.forEach(tab => tab.removeEventListener('click', this.handleTabClick));
        }
        if (this.panelResizer) {
            this.panelResizer.removeEventListener('mousedown', this.handleMouseDown);
            this.panelResizer.removeEventListener('dblclick', this.resetHeight);
        }
        // Ensure mousemove and mouseup are cleaned up in case of an unexpected destroy
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.stopResize);
        console.log('PanelLayout listeners cleaned up.');
    }
}

export default new PanelLayout();
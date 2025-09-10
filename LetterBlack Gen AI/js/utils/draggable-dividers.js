/**
 * Draggable Dividers for Resizable Sections
 * Allows users to resize sections by dragging dividers
 */

class DraggableDividers {
    constructor() {
        this.isDragging = false;
        this.currentDivider = null;
        this.currentTarget = null;
        this.startY = 0;
        this.startHeight = 0;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.logger.debug('Initializing draggable dividers...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDividers());
        } else {
            this.setupDividers();
        }
        
        this.initialized = true;
    }

    setupDividers() {
        const dividers = document.querySelectorAll('.draggable-divider');
        this.logger.debug(`Found ${dividers.length} draggable dividers`);
        
        dividers.forEach(divider => {
            this.setupDivider(divider);
        });
        
        // Add global mouse event handlers
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Prevent text selection during drag
        document.addEventListener('selectstart', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    setupDivider(divider) {
        const targetId = divider.dataset.target;
        const targetElement = document.getElementById(targetId);
        
        if (!targetElement) {
            this.logger.warn(`Target element '${targetId}' not found for divider`);
            return;
        }
        
        // Store reference to target
        divider._targetElement = targetElement;
        
        // Add mouse down handler
        divider.addEventListener('mousedown', (e) => this.handleMouseDown(e, divider));
        
        // Add visual feedback
        divider.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                divider.style.cursor = 'ns-resize';
            }
        });
        
        this.logger.debug(`Setup divider for target: ${targetId}`);
    }

    handleMouseDown(e, divider) {
        e.preventDefault();
        
        this.isDragging = true;
        this.currentDivider = divider;
        this.currentTarget = divider._targetElement;
        this.startY = e.clientY;
        
        // Get current height
        const rect = this.currentTarget.getBoundingClientRect();
        this.startHeight = rect.height;
        
        // Add visual feedback
        document.body.classList.add('dragging-active');
        this.currentTarget.classList.add('dragging');
        
        // Change cursor globally
        document.body.style.cursor = 'ns-resize';
        
        this.logger.debug(`Started dragging divider for ${this.currentTarget.id}`);
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.currentTarget) return;
        
        e.preventDefault();
        
        const deltaY = e.clientY - this.startY;
        const newHeight = Math.max(50, this.startHeight + deltaY); // Minimum height of 50px
        
        // Apply new height
        this.currentTarget.style.height = `${newHeight}px`;
        this.currentTarget.style.minHeight = `${newHeight}px`;
        
        // Visual feedback on divider
        if (Math.abs(deltaY) > 5) {
            this.currentDivider.style.background = `linear-gradient(90deg, 
                transparent 0%, 
                rgba(0, 122, 204, 0.6) 20%, 
                rgba(0, 122, 204, 0.8) 50%, 
                rgba(0, 122, 204, 0.6) 80%, 
                transparent 100%
            )`;
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.logger.debug(`Finished dragging divider for ${this.currentTarget?.id}`);
        
        // Clean up
        this.isDragging = false;
        document.body.classList.remove('dragging-active');
        document.body.style.cursor = '';
        
        if (this.currentTarget) {
            this.currentTarget.classList.remove('dragging');
            
            // Save the new height preference
            const newHeight = this.currentTarget.style.height;
            if (newHeight) {
                localStorage.setItem(`section-height-${this.currentTarget.id}`, newHeight);
                this.logger.debug(`Saved height ${newHeight} for ${this.currentTarget.id}`);
            }
        }
        
        if (this.currentDivider) {
            // Reset divider appearance
            this.currentDivider.style.background = '';
        }
        
        this.currentDivider = null;
        this.currentTarget = null;
    }

    loadSavedHeights() {
        const sections = document.querySelectorAll('.resizable-section');
        sections.forEach(section => {
            const savedHeight = localStorage.getItem(`section-height-${section.id}`);
            if (savedHeight) {
                section.style.height = savedHeight;
                section.style.minHeight = savedHeight;
                this.logger.debug(`Restored height ${savedHeight} for ${section.id}`);
            }
        });
    }

    resetSectionHeights() {
        const sections = document.querySelectorAll('.resizable-section');
        sections.forEach(section => {
            section.style.height = '';
            section.style.minHeight = '';
            localStorage.removeItem(`section-height-${section.id}`);
        });
        this.logger.debug('Reset all section heights');
    }
}

// Initialize draggable dividers
const draggableDividers = new DraggableDividers();

// Export for global access
window.draggableDividers = draggableDividers;

// Auto-initialize when script loads
draggableDividers.init();

// Load saved heights after initialization
setTimeout(() => {
    draggableDividers.loadSavedHeights();
}, 100);

this.logger.debug('Draggable dividers module loaded');

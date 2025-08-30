/**
 * Simple Toast Notification System
 * Provides non-blocking visual feedback for various actions.
 */

// --- TYPE DEFINITIONS ---

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastOptions {
    duration?: number;
    type?: ToastType;
}

class SimpleToast {
    private container: HTMLElement;

    constructor() {
        this.container = this.createContainer();
        console.log('🍞 Simple Toast system initialized');
    }

    private createContainer(): HTMLElement {
        let container = document.getElementById('toast-container');
        if (container) {
            return container as HTMLElement;
        }
        
        container = document.createElement('div');
        container.id = 'toast-container';
        // Styles are expected to be in a CSS file for better maintenance,
        // but can be set here as a fallback.
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none',
        });
        
        document.body.appendChild(container);
        return container as HTMLElement;
    }

    /**
     * Shows a toast notification.
     * @param message The message to display.
     * @param options Configuration for the toast, like type and duration.
     */
    public show(message: string, options: ToastOptions = {}): void {
        const { type = 'info', duration = 3000 } = options;

        const toast = document.createElement('div');
        toast.className = `simple-toast toast-${type}`;
        toast.textContent = message;

        // Add ARIA attributes for accessibility
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remove after duration
        const removeTimeout = setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Allow user to dismiss by clicking
        toast.addEventListener('click', () => {
            clearTimeout(removeTimeout);
            this.remove(toast);
        });
    }

    private remove(toast: HTMLElement): void {
        if (!toast.parentNode) return;

        toast.classList.remove('show');
        // Listen for the transition to end before removing the element
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, { once: true });
    }

    // --- Convenience Methods ---

    public success(message: string, duration: number = 3000): void {
        this.show(message, { type: 'success', duration });
    }

    public error(message: string, duration: number = 5000): void {
        this.show(message, { type: 'error', duration });
    }

    public warning(message: string, duration: number = 4000): void {
        this.show(message, { type: 'warning', duration });
    }

    public info(message: string, duration: number = 3000): void {
        this.show(message, { type: 'info', duration });
    }
}

// Export a singleton instance for easy use across the application
const simpleToast = new SimpleToast();
export default simpleToast;
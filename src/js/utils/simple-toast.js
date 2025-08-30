/**
 * SIMPLE Toast Notification System
 * Provides visual feedback for save operations and other actions
 */

class SimpleToast {
    constructor() {
        this.container = null;
        this.createContainer();
        console.log('🍞 Simple Toast system initialized');
    }

    createContainer() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `simple-toast toast-${type}`;
        
        // Toast styles
        const colors = {
            success: { bg: '#4caf50', border: '#45a049' },
            error: { bg: '#f44336', border: '#d32f2f' },
            warning: { bg: '#ff9800', border: '#f57c00' },
            info: { bg: '#2196f3', border: '#1976d2' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 12px 16px;
            border-radius: 4px;
            border-left: 4px solid ${color.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            opacity: 0.95;
        `;
        
        toast.textContent = message;
        this.container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            this.remove(toast);
        });
    }

    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
}

// Create global instance
window.simpleToast = new SimpleToast();

// Also provide legacy compatibility
window.showToast = (message, type = 'info') => {
    window.simpleToast.show(message, type);
};

console.log('🍞 Toast notification system ready');

/**
 * LetterBlack_Gen_AI Mascot Component
 * Reusable mascot system with design system integration
 */

class MascotComponent {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            image: 'assets/ae-mascot.png',
            animatedImage: 'assets/ae-mascot-animated.gif',
            size: 'normal', // small, normal, large
            theme: 'default', // default, letterblack, ae
            autoHide: true,
            hideDelay: 5000,
            interactive: false,
            ...options
        };
        
        this.container = null;
        this.hideTimeout = null;
        this.isVisible = false;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.bindEvents();
    }
    
    createContainer() {
        // Remove existing mascot if present
        const existing = document.querySelector('.mascot');
        if (existing) {
            existing.remove();
        }
        
        this.container = document.createElement('div');
        this.container.className = this.buildClassName();
        this.container.innerHTML = this.buildHTML();
        
        document.body.appendChild(this.container);
        
        // Store reference for global access
        window.mascot = this;
    }
    
    buildClassName() {
        const classes = ['mascot', `mascot-${this.options.position}`];
        
        if (this.options.theme !== 'default') {
            classes.push(`mascot-${this.options.theme}`);
        }
        
        if (this.options.interactive) {
            classes.push('interactive');
        }
        
        return classes.join(' ');
    }
    
    buildHTML() {
        const sizeClass = this.options.size !== 'normal' ? ` ${this.options.size}` : '';
        
        return `
            <img src="${this.options.image}" 
                 alt="LetterBlack Mascot" 
                 class="mascot-image${sizeClass}">
            <div class="mascot-bubble">
                <div class="mascot-bubble-content"></div>
            </div>
        `;
    }
    
    bindEvents() {
        if (this.options.interactive) {
            this.container.addEventListener('click', () => {
                this.onClick();
            });
        }
        
        // Auto-hide functionality
        if (this.options.autoHide) {
            this.container.addEventListener('mouseenter', () => {
                this.clearHideTimeout();
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.scheduleHide();
            });
        }
    }
    
    // Public Methods
    show(message = '', state = 'welcome') {
        this.clearHideTimeout();
        
        // Update state
        this.container.className = this.buildClassName() + ` ${state}`;
        
        // Update image if animated state
        const img = this.container.querySelector('.mascot-image');
        if (state === 'thinking' || state === 'loading') {
            img.src = this.options.animatedImage;
        } else {
            img.src = this.options.image;
        }
        
        // Show message if provided
        if (message) {
            this.showMessage(message);
        }
        
        // Show mascot
        this.container.classList.remove('hidden');
        this.isVisible = true;
        
        // Schedule auto-hide if enabled
        if (this.options.autoHide) {
            this.scheduleHide();
        }
        
        return this;
    }
    
    hide() {
        this.clearHideTimeout();
        this.container.classList.add('hidden');
        this.isVisible = false;
        return this;
    }
    
    showMessage(message, duration = null) {
        const bubble = this.container.querySelector('.mascot-bubble');
        const content = this.container.querySelector('.mascot-bubble-content');
        
        content.textContent = message;
        bubble.classList.add('visible');
        
        if (duration) {
            setTimeout(() => {
                this.hideMessage();
            }, duration);
        }
        
        return this;
    }
    
    hideMessage() {
        const bubble = this.container.querySelector('.mascot-bubble');
        bubble.classList.remove('visible');
        return this;
    }
    
    welcome(message = 'Welcome to LetterBlack!') {
        return this.show(message, 'welcome');
    }
    
    thinking(message = 'Processing...') {
        return this.show(message, 'thinking');
    }
    
    loading(message = 'Loading...') {
        return this.show(message, 'loading');
    }
    
    celebrate(message = 'Success!') {
        return this.show(message, 'celebrating');
    }
    
    notify(message, type = 'info', duration = 5000) {
        // Create notification element safely (avoid inline onclick)
        const notification = document.createElement('div');
        notification.className = `mascot-notification ${type}`;
        const content = document.createElement('div');
        content.className = 'mascot-notification-content';

        const img = document.createElement('img');
        img.src = this.options.image;
        img.alt = 'Notification';
        img.className = 'mascot-image notification';

        const textDiv = document.createElement('div');
        textDiv.className = 'mascot-notification-text';
        textDiv.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'mascot-notification-close';
        closeBtn.type = 'button';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            if (notification.parentElement) notification.parentElement.removeChild(notification);
        });

        content.appendChild(img);
        content.appendChild(textDiv);
        content.appendChild(closeBtn);
        notification.appendChild(content);
        
        // Position notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('visible');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }, duration);
        }
        
        return this;
    }
    
    // State management
    setState(state) {
        // Remove previous state classes
        this.container.classList.remove('welcome', 'thinking', 'loading', 'celebrating');
        
        // Add new state
        if (state) {
            this.container.classList.add(state);
        }
        
        return this;
    }
    
    setPosition(position) {
        // Remove previous position classes
        this.container.classList.remove(
            'mascot-bottom-right', 'mascot-bottom-left',
            'mascot-top-right', 'mascot-top-left',
            'mascot-center', 'mascot-center-bottom'
        );
        
        // Add new position
        this.container.classList.add(`mascot-${position}`);
        this.options.position = position;
        
        return this;
    }
    
    setTheme(theme) {
        // Remove previous theme classes
        this.container.classList.remove('mascot-letterblack', 'mascot-ae');
        
        // Add new theme
        if (theme !== 'default') {
            this.container.classList.add(`mascot-${theme}`);
        }
        
        this.options.theme = theme;
        return this;
    }
    
    // Utility methods
    scheduleHide() {
        if (!this.options.autoHide) return;
        
        this.clearHideTimeout();
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.options.hideDelay);
    }
    
    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }
    
    onClick() {
        // Override this method for custom click behavior
        console.log('Mascot clicked!');
    }
    
    destroy() {
        this.clearHideTimeout();
        if (this.container && this.container.parentElement) {
            this.container.remove();
        }
        if (window.mascot === this) {
            window.mascot = null;
        }
    }
    
    // Static helper methods
    static createQuick(message, options = {}) {
        const mascot = new MascotComponent({
            autoHide: true,
            hideDelay: 5000,
            ...options
        });
        mascot.show(message);
        return mascot;
    }
    
    static notify(message, type = 'info', duration = 5000) {
        // Create a temporary mascot just for notification
        const mascot = new MascotComponent({ 
            position: 'top-right',
            autoHide: false 
        });
        mascot.notify(message, type, duration);
        
        // Clean up after notification
        setTimeout(() => {
            mascot.destroy();
        }, duration + 1000);
    }
    
    static welcome(message = 'Welcome to LetterBlack!') {
        return MascotComponent.createQuick(message, { 
            theme: 'letterblack',
            position: 'bottom-right'
        });
    }
    
    static thinking(message = 'AI is thinking...') {
        return MascotComponent.createQuick(message, { 
            theme: 'letterblack',
            position: 'center',
            autoHide: false
        }).thinking();
    }
}

// Global convenience functions
window.MascotComponent = MascotComponent;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Auto-create global mascot instance if desired
        if (window.AUTO_INIT_MASCOT !== false) {
            window.mascot = new MascotComponent({
                position: 'bottom-right',
                theme: 'letterblack',
                interactive: true,
                autoHide: true
            });
        }
    });
} else {
    // DOM already loaded
    if (window.AUTO_INIT_MASCOT !== false) {
        window.mascot = new MascotComponent({
            position: 'bottom-right',
            theme: 'letterblack',
            interactive: true,
            autoHide: true
        });
    }
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * const mascot = new MascotComponent();
 * mascot.welcome('Hello!');
 * 
 * // Quick static methods
 * MascotComponent.welcome('Welcome!');
 * MascotComponent.thinking('Processing...');
 * MascotComponent.notify('Task completed!', 'success');
 * 
 * // Using global instance
 * window.mascot.thinking('AI is working...');
 * window.mascot.celebrate('Done!');
 * 
 * // Chaining methods
 * mascot.setTheme('letterblack')
 *       .setPosition('center')
 *       .welcome('LetterBlack AI Ready!');
 * 
 * // Custom configuration
 * const customMascot = new MascotComponent({
 *     position: 'top-left',
 *     theme: 'ae',
 *     size: 'large',
 *     interactive: true,
 *     autoHide: false
 * });
 */

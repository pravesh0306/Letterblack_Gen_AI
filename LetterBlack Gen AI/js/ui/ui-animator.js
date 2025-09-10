// Enhanced UI Animations and Interactions
class UIEnhancer {
    constructor() {
        this.activeAnimations = new Set();
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupButtonAnimations();
        this.setupMascotInteractions();
        this.setupTypingEffects();
        this.setupVisualFeedback();
        this.setupSmartScrolling();
    }

    // Scroll-triggered animations
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all messages and sections
        document.querySelectorAll('.message, .setting-group, .tab-pane').forEach(el => {
            observer.observe(el);
        });
    }

    // Enhanced button interactions
    setupButtonAnimations() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button && !button.disabled) {
                this.triggerRippleEffect(button, e);
                this.addSuccessFeedback(button);
            }
        });
    }

    triggerRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    addSuccessFeedback(button) {
        const originalText = button.textContent;
        const checkmark = '✓';
        
        setTimeout(() => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                if (!button.textContent.includes(checkmark)) {
                    button.textContent = `${checkmark} ${originalText}`;
                    button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                    
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                    }, 1500);
                }
            }, 100);
        }, 50);
    }

    // Enhanced mascot interactions
    setupMascotInteractions() {
        const mascot = document.querySelector('.app-mascot, .mascot-container');
        if (!mascot) return;

        let interactionCount = 0;
        
        mascot.addEventListener('click', () => {
            interactionCount++;
            this.triggerMascotResponse(interactionCount);
        });

        mascot.addEventListener('mouseenter', () => {
            this.showMascotTooltip();
        });

        mascot.addEventListener('mouseleave', () => {
            this.hideMascotTooltip();
        });
    }

    triggerMascotResponse(count) {
        const responses = [
            { animation: 'bounce', message: 'Hello there! 👋' },
            { animation: 'wiggle', message: 'How can I help you? 🤔' },
            { animation: 'celebrate', message: 'Let\'s create something amazing! ✨' },
            { animation: 'pop', message: 'I\'m here whenever you need me! 😊' }
        ];

        const response = responses[(count - 1) % responses.length];
        
        if (window.triggerMascotAnimation) {
            window.triggerMascotAnimation(response.animation);
        }
        
        if (window.updateMascotMessage) {
            window.updateMascotMessage(response.message);
        }
    }

    showMascotTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'mascot-tooltip';
        tooltip.textContent = 'Click me for helpful tips!';
        tooltip.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(45, 45, 48, 0.95);
            color: var(--vscode-text-primary);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            animation: tooltipFadeIn 0.3s ease forwards;
        `;

        const mascot = document.querySelector('.app-mascot, .mascot-container');
        if (mascot) {
            mascot.style.position = 'relative';
            mascot.appendChild(tooltip);
        }
    }

    hideMascotTooltip() {
        const tooltip = document.querySelector('.mascot-tooltip');
        if (tooltip) {
            tooltip.style.animation = 'tooltipFadeOut 0.3s ease forwards';
            setTimeout(() => tooltip.remove(), 300);
        }
    }

    // Typing animation for text elements
    setupTypingEffects() {
        const typeText = (element, text, speed = 50) => {
            element.textContent = '';
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, speed);
        };

        // Apply to status messages
        document.addEventListener('DOMNodeInserted', (e) => {
            if (e.target.classList && e.target.classList.contains('status-message')) {
                const text = e.target.textContent;
                typeText(e.target, text, 30);
            }
        });
    }

    // Visual feedback for various actions
    setupVisualFeedback() {
        // Progress indicators
        this.createProgressRing();
        
        // Success/error notifications
        this.setupNotificationSystem();
        
        // Loading states
        this.setupLoadingStates();
    }

    createProgressRing() {
        const style = document.createElement('style');
        style.textContent = `
            .progress-ring {
                width: 24px;
                height: 24px;
                border: 2px solid var(--vscode-border);
                border-top: 2px solid var(--vscode-text-accent);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    showProgress(element) {
        const ring = document.createElement('div');
        ring.className = 'progress-ring';
        ring.style.cssText = 'display: inline-block; margin-left: 8px;';
        element.appendChild(ring);
        return ring;
    }

    hideProgress(ring) {
        if (ring && ring.parentNode) {
            ring.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => ring.remove(), 300);
        }
    }

    setupNotificationSystem() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (document.querySelector('.notification-container')) return;
        
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: var(--vscode-bg-secondary);
            color: var(--vscode-text-primary);
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            transform: translateX(100%);
            animation: slideInFromRight 0.3s ease forwards;
            pointer-events: auto;
        `;

        const container = document.querySelector('.notification-container');
        if (container) {
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutToRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    setupLoadingStates() {
        // Add loading shimmer to elements
        const addShimmer = (element) => {
            element.classList.add('loading-shimmer');
        };

        const removeShimmer = (element) => {
            element.classList.remove('loading-shimmer');
        };

        // Monitor for AJAX requests or loading states
        window.showLoadingState = addShimmer;
        window.hideLoadingState = removeShimmer;
    }

    // Smart scrolling with momentum
    setupSmartScrolling() {
        const chatContainer = document.querySelector('.chat-messages');
        if (!chatContainer) return;

        let isScrolling = false;
        let scrollTimeout;

        chatContainer.addEventListener('scroll', () => {
            if (!isScrolling) {
                chatContainer.style.scrollBehavior = 'smooth';
                isScrolling = true;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
    }

    // Public methods for external use
    animateElement(element, animation) {
        element.style.animation = `${animation} 0.3s ease forwards`;
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    pulseElement(element) {
        this.animateElement(element, 'pulse');
    }

    bounceElement(element) {
        this.animateElement(element, 'bounce');
    }

    shakeElement(element) {
        this.animateElement(element, 'shake');
    }
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }

    @keyframes tooltipFadeIn {
        to { opacity: 1; transform: translateX(-50%) translateY(-4px); }
    }

    @keyframes tooltipFadeOut {
        to { opacity: 0; transform: translateX(-50%) translateY(4px); }
    }

    @keyframes slideInFromRight {
        to { transform: translateX(0); }
    }

    @keyframes slideOutToRight {
        to { transform: translateX(100%); }
    }

    @keyframes fadeOut {
        to { opacity: 0; }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    .animate-in {
        animation: slideInFromBottom 0.5s ease forwards;
    }

    @keyframes slideInFromBottom {
        from { 
            opacity: 0; 
            transform: translateY(20px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }

    /* Enhanced focus states */
    *:focus-visible {
        outline: 2px solid var(--vscode-text-accent);
        outline-offset: 2px;
        border-radius: 4px;
    }

    /* Smooth transitions for all UI elements */
    button, input, textarea, select {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    button:active {
        transform: translateY(0);
    }
`;

document.head.appendChild(animationStyles);

// Initialize the UI enhancer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiEnhancer = new UIEnhancer();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIEnhancer;
}

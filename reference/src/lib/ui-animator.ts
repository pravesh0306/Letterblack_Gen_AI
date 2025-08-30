// Enhanced UI Animations and Interactions - Converted to TypeScript

// Extend the Window interface to include custom global functions
declare global {
    interface Window {
        uiEnhancer: UIEnhancer;
        triggerMascotAnimation?: (animation: string) => void;
        updateMascotMessage?: (message: string) => void;
        showLoadingState?: (element: HTMLElement) => void;
        hideLoadingState?: (element: HTMLElement) => void;
    }
}

interface MascotResponse {
    animation: string;
    message: string;
}

class UIEnhancer {
    private activeAnimations: Set<Animation> = new Set();

    constructor() {
        this.init();
    }

    private init(): void {
        this.setupScrollAnimations();
        this.setupButtonAnimations();
        this.setupMascotInteractions();
        this.setupTypingEffects();
        this.setupVisualFeedback();
        this.setupSmartScrolling();
        this.injectAnimationStyles();
    }

    private setupScrollAnimations(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                } else {
                    entry.target.classList.remove('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.message, .setting-group, .tab-pane').forEach(el => {
            observer.observe(el);
        });
    }

    private setupButtonAnimations(): void {
        document.addEventListener('click', (e: MouseEvent) => {
            const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button, .btn');
            if (button && !button.disabled) {
                this.triggerRippleEffect(button, e);
                this.addSuccessFeedback(button);
            }
        });
    }

    private triggerRippleEffect(element: HTMLElement, event: MouseEvent): void {
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

    private addSuccessFeedback(button: HTMLButtonElement): void {
        const originalText = button.textContent || '';
        const checkmark = '✓';
        
        setTimeout(() => {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
                if (!button.textContent?.includes(checkmark)) {
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

    private setupMascotInteractions(): void {
        const mascot = document.querySelector<HTMLElement>('.app-mascot, .mascot-container');
        if (!mascot) return;

        let interactionCount = 0;
        
        mascot.addEventListener('click', () => {
            interactionCount++;
            this.triggerMascotResponse(interactionCount);
        });

        mascot.addEventListener('mouseenter', () => this.showMascotTooltip(mascot));
        mascot.addEventListener('mouseleave', () => this.hideMascotTooltip());
    }

    private triggerMascotResponse(count: number): void {
        const responses: MascotResponse[] = [
            { animation: 'bounce', message: 'Hello there! 👋' },
            { animation: 'wiggle', message: 'How can I help you? 🤔' },
            { animation: 'celebrate', message: 'Let\'s create something amazing! ✨' },
            { animation: 'pop', message: 'I\'m here whenever you need me! 😊' }
        ];

        const response = responses[(count - 1) % responses.length];
        
        window.triggerMascotAnimation?.(response.animation);
        window.updateMascotMessage?.(response.message);
    }

    private showMascotTooltip(mascotElement: HTMLElement): void {
        const tooltip = document.createElement('div');
        tooltip.className = 'mascot-tooltip';
        tooltip.textContent = 'Click me for helpful tips!';
        tooltip.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(45, 45, 48, 0.95);
            color: var(--vscode-editor-foreground);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            animation: tooltipFadeIn 0.3s ease forwards;
        `;
        mascotElement.style.position = 'relative';
        mascotElement.appendChild(tooltip);
    }

    private hideMascotTooltip(): void {
        const tooltip = document.querySelector<HTMLElement>('.mascot-tooltip');
        if (tooltip) {
            tooltip.style.animation = 'tooltipFadeOut 0.3s ease forwards';
            setTimeout(() => tooltip.remove(), 300);
        }
    }

    private setupTypingEffects(): void {
        const typeText = (element: HTMLElement, text: string, speed: number = 50) => {
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

        document.addEventListener('DOMNodeInserted', (e) => {
            const target = e.target as HTMLElement;
            if (target.classList?.contains('status-message')) {
                const text = target.textContent || '';
                typeText(target, text, 30);
            }
        });
    }

    private setupVisualFeedback(): void {
        this.setupNotificationSystem();
        this.setupLoadingStates();
    }

    public showProgress(element: HTMLElement): HTMLElement {
        const ring = document.createElement('div');
        ring.className = 'progress-ring';
        ring.style.cssText = 'display: inline-block; margin-left: 8px;';
        element.appendChild(ring);
        return ring;
    }

    public hideProgress(ring: HTMLElement | null): void {
        if (ring?.parentNode) {
            ring.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => ring.remove(), 300);
        }
    }

    private setupNotificationSystem(): void {
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

    public showNotification(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 3000): void {
        const container = document.querySelector<HTMLElement>('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        const borderColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3';
        notification.style.cssText = `
            background: var(--vscode-editor-widget-background);
            color: var(--vscode-editor-foreground);
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            border-left: 4px solid ${borderColor};
            transform: translateX(100%);
            animation: slideInFromRight 0.3s ease forwards;
            pointer-events: auto;
        `;

        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    private setupLoadingStates(): void {
        window.showLoadingState = (element: HTMLElement) => element.classList.add('loading-shimmer');
        window.hideLoadingState = (element: HTMLElement) => element.classList.remove('loading-shimmer');
    }

    private setupSmartScrolling(): void {
        const chatContainer = document.querySelector<HTMLElement>('.chat-messages');
        if (!chatContainer) return;

        let isScrolling = false;
        let scrollTimeout: number;

        chatContainer.addEventListener('scroll', () => {
            if (!isScrolling) {
                chatContainer.style.scrollBehavior = 'smooth';
                isScrolling = true;
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = window.setTimeout(() => {
                isScrolling = false;
            }, 150);
        });
    }

    public animateElement(element: HTMLElement, animation: 'pulse' | 'bounce' | 'shake'): void {
        element.style.animation = `${animation} 0.3s ease forwards`;
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    private injectAnimationStyles(): void {
        const styleId = 'ui-enhancer-styles';
        if (document.getElementById(styleId)) return;

        const animationStyles = document.createElement('style');
        animationStyles.id = styleId;
        animationStyles.textContent = `
            @keyframes ripple { to { transform: scale(4); opacity: 0; } }
            @keyframes tooltipFadeIn { to { opacity: 1; transform: translateX(-50%) translateY(-4px); } }
            @keyframes tooltipFadeOut { to { opacity: 0; transform: translateX(-50%) translateY(4px); } }
            @keyframes slideInFromRight { to { transform: translateX(0); } }
            @keyframes slideOutToRight { to { transform: translateX(100%); } }
            @keyframes fadeOut { to { opacity: 0; } }
            @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            .animate-in { animation: slideInFromBottom 0.5s ease forwards; }
            @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .progress-ring { width: 24px; height: 24px; border: 2px solid var(--vscode-input-border); border-top-color: var(--vscode-button-background); border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
            *:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 2px; border-radius: 4px; }
            button, input, textarea, select { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
            button:active { transform: translateY(0); }
        `;
        document.head.appendChild(animationStyles);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.uiEnhancer = new UIEnhancer();
});

export default new UIEnhancer();
/**
 * Reusable Mascot Animation System
 * 
 * A lightweight, flexible system for adding animated mascot characters to web applications
 * and CEP extensions. Provides thinking animations, welcome screens, loading states, and more.
 * 
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

class MascotAnimator {
    constructor(options = {}) {
        // Configuration with sensible defaults
        this.config = {
            // Asset paths (relative to your project)
            mascotGif: options.mascotGif || 'assets/ae-mascot-animated.gif',
            mascotPng: options.mascotPng || 'assets/ae-mascot.png',
            mascotVideo: options.mascotVideo || 'assets/ae-mascot-animated.mp4',
            
            // Animation settings
            welcomeDuration: options.welcomeDuration || 4000,
            thinkingPosition: options.thinkingPosition || 'bottom-right',
            welcomePosition: options.welcomePosition || 'bottom-right',
            
            // Text content
            defaultWelcomeText: options.defaultWelcomeText || '👋 Welcome!',
            defaultThinkingText: options.defaultThinkingText || '🤖 Processing...',
            
            // Styling
            mascotSize: options.mascotSize || '96px',
            bubbleStyle: options.bubbleStyle || 'dark', // 'dark', 'light', 'custom'
            zIndex: options.zIndex || 99999,
            
            // Behavior
            autoInjectStyles: options.autoInjectStyles !== false,
            preventInteraction: options.preventInteraction !== false
        };
        
        // State tracking
        this.isStylesInjected = false;
        this.activeAnimations = new Set();
        
        // Auto-inject styles if enabled
        if (this.config.autoInjectStyles) {
            this.injectStyles();
        }
        
        console.log('🎭 MascotAnimator initialized', this.config);
    }
    
    /**
     * Show welcome animation with customizable text and duration
     * @param {Object} options - Welcome animation options
     */
    showWelcome(options = {}) {
        const config = {
            text: options.text || this.config.defaultWelcomeText,
            message: options.message || 'Ready to get started!',
            duration: options.duration || this.config.welcomeDuration,
            position: options.position || this.config.welcomePosition,
            onComplete: options.onComplete || null
        };
        
        // Remove existing welcome if present
        this.hideWelcome();
        
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'mascot-welcome';
        welcomeDiv.className = `mascot-welcome-container position-${config.position}`;
        welcomeDiv.innerHTML = `
            <div class="mascot-welcome-content">
                <img src="${this.config.mascotGif}" alt="Welcome!" class="mascot-welcome-image">
                <div class="mascot-speech-bubble bubble-${this.config.bubbleStyle}">
                    <span class="mascot-welcome-text">${config.text}</span>
                </div>
                <div class="mascot-welcome-message">${config.message}</div>
            </div>
        `;
        
        document.body.appendChild(welcomeDiv);
        this.activeAnimations.add('welcome');
        
        // Auto-hide after duration
        setTimeout(() => {
            this.hideWelcome(() => {
                if (config.onComplete) config.onComplete();
            });
        }, config.duration);
        
        console.log('🎭 Welcome animation shown:', config);
    }
    
    /**
     * Hide welcome animation
     * @param {Function} callback - Optional callback when animation completes
     */
    hideWelcome(callback = null) {
        const welcomeDiv = document.getElementById('mascot-welcome');
        if (welcomeDiv) {
            welcomeDiv.style.animation = 'mascotFadeOutScale 0.5s ease-in';
            setTimeout(() => {
                if (welcomeDiv.parentElement) {
                    welcomeDiv.remove();
                }
                this.activeAnimations.delete('welcome');
                if (callback) callback();
            }, 500);
        }
    }
    
    /**
     * Show thinking/processing animation
     * @param {Object} options - Thinking animation options
     */
    showThinking(options = {}) {
        const config = {
            bubbleText: options.bubbleText || this.config.defaultThinkingText,
            message: options.message || 'Working...',
            position: options.position || this.config.thinkingPosition,
            persistent: options.persistent || false
        };
        
        let thinkingDiv = document.getElementById('mascot-thinking');
        if (!thinkingDiv) {
            thinkingDiv = document.createElement('div');
            thinkingDiv.id = 'mascot-thinking';
            thinkingDiv.className = `mascot-thinking-container position-${config.position}`;
            thinkingDiv.innerHTML = `
                <div class="mascot-thinking-content">
                    <div class="mascot-container">
                        <img src="${this.config.mascotGif}" alt="AI Thinking" class="mascot-thinking-image">
                        <div class="mascot-speech-bubble bubble-${this.config.bubbleStyle}">
                            <span class="mascot-thinking-text">${config.bubbleText}</span>
                        </div>
                    </div>
                    <div class="mascot-thinking-message">${config.message}</div>
                </div>
            `;
            
            const container = document.querySelector('.main-content') || document.querySelector('#app') || document.body;
            container.appendChild(thinkingDiv);
        } else {
            // Update existing animation
            const thinkingText = thinkingDiv.querySelector('.mascot-thinking-text');
            const thinkingMessage = thinkingDiv.querySelector('.mascot-thinking-message');
            
            if (thinkingText) thinkingText.textContent = config.bubbleText;
            if (thinkingMessage) thinkingMessage.textContent = config.message;
        }
        
        thinkingDiv.style.display = 'flex';
        this.activeAnimations.add('thinking');
        
        console.log('🎭 Thinking animation shown:', config);
    }
    
    /**
     * Update thinking animation text without recreating
     * @param {string} bubbleText - Text in speech bubble
     * @param {string} message - Main message below mascot
     */
    updateThinking(bubbleText, message) {
        const thinkingDiv = document.getElementById('mascot-thinking');
        if (thinkingDiv) {
            const thinkingText = thinkingDiv.querySelector('.mascot-thinking-text');
            const thinkingMessage = thinkingDiv.querySelector('.mascot-thinking-message');
            
            if (thinkingText && bubbleText) thinkingText.textContent = bubbleText;
            if (thinkingMessage && message) thinkingMessage.textContent = message;
        }
    }
    
    /**
     * Hide thinking animation
     */
    hideThinking() {
        const thinkingDiv = document.getElementById('mascot-thinking');
        if (thinkingDiv) {
            thinkingDiv.style.display = 'none';
            this.activeAnimations.delete('thinking');
        }
    }
    
    /**
     * Show custom notification with mascot
     * @param {Object} options - Notification options
     */
    showNotification(options = {}) {
        const config = {
            text: options.text || '💡 Notification',
            message: options.message || 'Something happened!',
            duration: options.duration || 3000,
            position: options.position || 'top-right',
            type: options.type || 'info', // 'info', 'success', 'warning', 'error'
            onComplete: options.onComplete || null
        };
        
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `mascot-notification-container position-${config.position} type-${config.type}`;
        notificationDiv.innerHTML = `
            <div class="mascot-notification-content">
                <img src="${this.config.mascotPng}" alt="Notification" class="mascot-notification-image">
                <div class="mascot-notification-text">
                    <div class="mascot-notification-title">${config.text}</div>
                    <div class="mascot-notification-message">${config.message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificationDiv);
        
        // Auto-remove after duration
        setTimeout(() => {
            notificationDiv.style.animation = 'mascotSlideOut 0.3s ease-in';
            setTimeout(() => {
                if (notificationDiv.parentElement) {
                    notificationDiv.remove();
                }
                if (config.onComplete) config.onComplete();
            }, 300);
        }, config.duration);
        
        console.log('🎭 Notification shown:', config);
    }
    
    /**
     * Show loading state with progress
     * @param {Object} options - Loading options
     */
    showLoading(options = {}) {
        const config = {
            message: options.message || 'Loading...',
            showProgress: options.showProgress || false,
            progress: options.progress || 0,
            position: options.position || 'center'
        };
        
        let loadingDiv = document.getElementById('mascot-loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'mascot-loading';
            loadingDiv.className = `mascot-loading-container position-${config.position}`;
            loadingDiv.innerHTML = `
                <div class="mascot-loading-content">
                    <img src="${this.config.mascotGif}" alt="Loading" class="mascot-loading-image">
                    <div class="mascot-loading-text">${config.message}</div>
                    ${config.showProgress ? `
                        <div class="mascot-progress-bar">
                            <div class="mascot-progress-fill" style="width: ${config.progress}%"></div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(loadingDiv);
        } else {
            // Update existing loading
            const loadingText = loadingDiv.querySelector('.mascot-loading-text');
            const progressFill = loadingDiv.querySelector('.mascot-progress-fill');
            
            if (loadingText) loadingText.textContent = config.message;
            if (progressFill && config.showProgress) {
                progressFill.style.width = `${config.progress}%`;
            }
        }
        
        loadingDiv.style.display = 'flex';
        this.activeAnimations.add('loading');
    }
    
    /**
     * Update loading progress
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} message - Optional message update
     */
    updateLoading(progress, message = null) {
        const loadingDiv = document.getElementById('mascot-loading');
        if (loadingDiv) {
            const progressFill = loadingDiv.querySelector('.mascot-progress-fill');
            const loadingText = loadingDiv.querySelector('.mascot-loading-text');
            
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (loadingText && message) loadingText.textContent = message;
        }
    }
    
    /**
     * Hide loading animation
     */
    hideLoading() {
        const loadingDiv = document.getElementById('mascot-loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
            this.activeAnimations.delete('loading');
        }
    }
    
    /**
     * Hide all active animations
     */
    hideAll() {
        this.hideWelcome();
        this.hideThinking();
        this.hideLoading();
        
        // Remove any notifications
        document.querySelectorAll('.mascot-notification-container').forEach(el => el.remove());
    }
    
    /**
     * Check if any animations are currently active
     * @returns {boolean}
     */
    isAnimating() {
        return this.activeAnimations.size > 0;
    }
    
    /**
     * Get list of currently active animations
     * @returns {Array}
     */
    getActiveAnimations() {
        return Array.from(this.activeAnimations);
    }
    
    /**
     * Inject CSS styles for mascot animations
     */
    injectStyles() {
        if (this.isStylesInjected || document.getElementById('mascot-animator-styles')) {
            return;
        }
        
        const css = this.generateCSS();
        const style = document.createElement('style');
        style.id = 'mascot-animator-styles';
        style.textContent = css;
        document.head.appendChild(style);
        
        this.isStylesInjected = true;
        console.log('🎭 Mascot styles injected');
    }
    
    /**
     * Generate CSS for mascot animations
     * @returns {string}
     */
    generateCSS() {
        return `
        /* Mascot Animator Base Styles */
        .mascot-welcome-container,
        .mascot-thinking-container,
        .mascot-loading-container,
        .mascot-notification-container {
            position: fixed;
            z-index: ${this.config.zIndex};
            display: flex;
            align-items: center;
            gap: 12px;
            ${this.config.preventInteraction ? 'pointer-events: none;' : ''}
        }
        
        /* Positioning */
        .position-bottom-right { bottom: 16px; right: 16px; }
        .position-bottom-left { bottom: 16px; left: 16px; }
        .position-top-right { top: 16px; right: 16px; }
        .position-top-left { top: 16px; left: 16px; }
        .position-center { 
            top: 50%; left: 50%; 
            transform: translate(-50%, -50%);
        }
        
        /* Mascot Images */
        .mascot-welcome-image,
        .mascot-thinking-image,
        .mascot-loading-image {
            width: ${this.config.mascotSize};
            height: ${this.config.mascotSize};
            object-fit: contain;
            user-select: none;
            pointer-events: none;
        }
        
        .mascot-notification-image {
            width: 32px;
            height: 32px;
            object-fit: contain;
            user-select: none;
            pointer-events: none;
        }
        
        /* Speech Bubbles */
        .mascot-speech-bubble {
            padding: 8px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            max-width: 200px;
            word-wrap: break-word;
            white-space: normal;
        }
        
        .bubble-dark {
            background: #2d2d30;
            color: #ffffff;
            border: 1px solid #3c3c3c;
        }
        
        .bubble-light {
            background: #ffffff;
            color: #333333;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Messages */
        .mascot-welcome-message,
        .mascot-thinking-message,
        .mascot-loading-text {
            color: #cccccc;
            font-size: 12px;
            margin-top: 8px;
            text-align: center;
            max-width: 200px;
        }
        
        /* Welcome Animation */
        .mascot-welcome-container {
            animation: mascotWelcomeIn 0.5s ease-out;
        }
        
        /* Notification Styles */
        .mascot-notification-container {
            background: rgba(45, 45, 48, 0.95);
            border: 1px solid #3c3c3c;
            border-radius: 8px;
            padding: 12px;
            max-width: 300px;
            animation: mascotSlideIn 0.3s ease-out;
            pointer-events: auto;
        }
        
        .mascot-notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .mascot-notification-text {
            flex: 1;
        }
        
        .mascot-notification-title {
            font-weight: 600;
            font-size: 13px;
            color: #ffffff;
            margin-bottom: 4px;
        }
        
        .mascot-notification-message {
            font-size: 11px;
            color: #cccccc;
            line-height: 1.3;
        }
        
        /* Notification Types */
        .type-success { border-left: 4px solid #4caf50; }
        .type-warning { border-left: 4px solid #ff9800; }
        .type-error { border-left: 4px solid #f44336; }
        .type-info { border-left: 4px solid #2196f3; }
        
        /* Loading Container */
        .mascot-loading-container {
            background: rgba(30, 30, 30, 0.9);
            border: 1px solid #3c3c3c;
            border-radius: 12px;
            padding: 20px;
            align-items: center;
            flex-direction: column;
            text-align: center;
        }
        
        /* Progress Bar */
        .mascot-progress-bar {
            width: 200px;
            height: 6px;
            background: #3c3c3c;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 12px;
        }
        
        .mascot-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #007acc, #00d4ff);
            transition: width 0.3s ease;
            border-radius: 3px;
        }
        
        /* Animations */
        @keyframes mascotWelcomeIn {
            from { 
                opacity: 0; 
                transform: translateY(20px) scale(0.9); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        
        @keyframes mascotFadeOutScale {
            from { 
                opacity: 1; 
                transform: scale(1); 
            }
            to { 
                opacity: 0; 
                transform: scale(0.9); 
            }
        }
        
        @keyframes mascotSlideIn {
            from { 
                opacity: 0; 
                transform: translateX(20px); 
            }
            to { 
                opacity: 1; 
                transform: translateX(0); 
            }
        }
        
        @keyframes mascotSlideOut {
            from { 
                opacity: 1; 
                transform: translateX(0); 
            }
            to { 
                opacity: 0; 
                transform: translateX(20px); 
            }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .mascot-welcome-container,
            .mascot-thinking-container,
            .mascot-notification-container {
                max-width: calc(100vw - 32px);
            }
            
            .mascot-speech-bubble {
                max-width: 150px;
                font-size: 12px;
            }
        }
        `;
    }
    
    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🎭 Mascot config updated:', this.config);
    }
    
    /**
     * Destroy the mascot animator and clean up
     */
    destroy() {
        this.hideAll();
        
        const styleElement = document.getElementById('mascot-animator-styles');
        if (styleElement) {
            styleElement.remove();
        }
        
        this.activeAnimations.clear();
        this.isStylesInjected = false;
        
        console.log('🎭 MascotAnimator destroyed');
    }
}

// Export for use in modules or standalone
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MascotAnimator;
} else if (typeof window !== 'undefined') {
    window.MascotAnimator = MascotAnimator;
}

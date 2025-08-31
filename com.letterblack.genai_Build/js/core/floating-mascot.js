/**
 * Floating Mascot System - Modular Notification & Feedback Component
 * Integrates with MascotAnimator for contextual animations and feedback
 */

class FloatingMascot {
    constructor(options = {}) {
        this.config = {
            // Position settings
            defaultPosition: options.defaultPosition || { bottom: '20px', right: '20px' },
            draggable: options.draggable !== false,
            
            // Size settings
            size: options.size || 70,
            hoverScale: options.hoverScale || 1.02,
            dragScale: options.dragScale || 1.1,
            
            // Animation settings
            animationDuration: options.animationDuration || 200,
            notificationDuration: options.notificationDuration || 4000,
            
            // Notification settings
            showTooltips: options.showTooltips !== false,
            notificationPosition: options.notificationPosition || 'left',
            
            // Storage key for position
            positionStorageKey: options.positionStorageKey || 'floating_mascot_position',
            
            ...options
        };

        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.currentNotification = null;
        this.notificationQueue = [];
        this.mascotAnimator = null;
        
        this.init();
    }

    init() {
        this.createMascotElement();
        this.setupEventListeners();
        this.loadPosition();
        this.initializeMascotAnimator();
        
        console.log('🎭 Floating Mascot System initialized');
    }

    createMascotElement() {
        // Remove existing mascot if present
        const existing = document.getElementById('floating-mascot');
        if (existing) {
            existing.remove();
        }

        // Create mascot container
        this.mascotElement = document.createElement('div');
        this.mascotElement.id = 'floating-mascot';
        this.mascotElement.className = 'floating-mascot';
        this.mascotElement.setAttribute('data-tooltip', 'Ready to help! 🚀');
        
        // Create video element
        this.videoElement = document.createElement('video');
        this.videoElement.id = 'floating-mascot-video';
        this.videoElement.setAttribute('muted', '');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('loop', '');
        this.videoElement.setAttribute('preload', 'auto');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('webkit-playsinline', '');
        this.videoElement.setAttribute('disablepictureinpicture', '');
        this.videoElement.setAttribute('controlslist', 'nodownload noplaybackrate');
        this.videoElement.src = 'assets/Idle.webm';
        this.videoElement.style.width = this.config.size + 'px';
        this.videoElement.style.height = this.config.size + 'px';
        this.videoElement.style.borderRadius = '50%';
        this.videoElement.style.objectFit = 'cover';

        // Create fallback image
        const fallbackImg = document.createElement('img');
        fallbackImg.id = 'floating-mascot-fallback';
        fallbackImg.src = 'assets/ae-mascot-animated.gif';
        fallbackImg.alt = 'AI Assistant';
        fallbackImg.style.width = this.config.size + 'px';
        fallbackImg.style.height = this.config.size + 'px';
        fallbackImg.style.borderRadius = '50%';
        fallbackImg.style.display = 'none';

        // Add source element for WebM
        const source = document.createElement('source');
        source.src = 'assets/Idle.webm';
        source.type = 'video/webm';

        this.videoElement.appendChild(source);
        this.videoElement.appendChild(fallbackImg);
        this.mascotElement.appendChild(this.videoElement);

        // Apply initial styles
        this.applyStyles();

        // Add to document
        document.body.appendChild(this.mascotElement);
    }

    applyStyles() {
        const styles = {
            position: 'fixed',
            zIndex: '1000',
            cursor: this.config.draggable ? 'move' : 'pointer',
            background: 'var(--color-bg-elevated, #2d2d30)',
            borderRadius: '50%',
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '2px solid var(--color-border, #3e3e42)',
            transition: `box-shadow ${this.config.animationDuration}ms ease, transform ${this.config.animationDuration}ms ease`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: this.config.size + 'px',
            minHeight: this.config.size + 'px',
            pointerEvents: 'all',
            userSelect: 'none'
        };

        Object.assign(this.mascotElement.style, styles);
    }

    setupEventListeners() {
        if (!this.mascotElement) return;

        // Hover effects
        this.mascotElement.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                this.mascotElement.style.transform = `scale(${this.config.hoverScale})`;
                this.mascotElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                this.showTooltip();
            }
        });

        this.mascotElement.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.mascotElement.style.transform = 'scale(1)';
                this.mascotElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                this.hideTooltip();
            }
        });

        // Drag functionality
        if (this.config.draggable) {
            this.mascotElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        }

        // Click functionality
        this.mascotElement.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.handleClick(e);
            }
        });

        // Video error fallback
        this.videoElement.addEventListener('error', () => {
            const fallback = this.mascotElement.querySelector('#floating-mascot-fallback');
            if (fallback) {
                this.videoElement.style.display = 'none';
                fallback.style.display = 'block';
            }
        });
    }

    handleMouseDown(e) {
        if (!this.config.draggable) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.mascotElement.classList.add('dragging');
        this.mascotElement.style.transform = `scale(${this.config.dragScale})`;
        this.mascotElement.style.zIndex = '1001';
        
        const rect = this.mascotElement.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        this.hideTooltip();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - this.config.size;
        const maxY = window.innerHeight - this.config.size;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        this.mascotElement.style.left = boundedX + 'px';
        this.mascotElement.style.top = boundedY + 'px';
        this.mascotElement.style.right = 'auto';
        this.mascotElement.style.bottom = 'auto';
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.mascotElement.classList.remove('dragging');
        this.mascotElement.style.transform = 'scale(1)';
        this.mascotElement.style.zIndex = '1000';
        
        this.savePosition();
    }

    handleClick(e) {
        // Show status or toggle a feature
        this.notify('Hello! 👋 How can I help you today?', 'info');
        
        // Trigger a celebration animation
        if (this.mascotAnimator) {
            this.mascotAnimator.playScenario('success');
        }
    }

    // Notification System
    notify(message, type = 'info', duration = null) {
        const notification = {
            id: Date.now(),
            message,
            type,
            duration: duration || this.config.notificationDuration
        };

        this.notificationQueue.push(notification);
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        if (this.currentNotification || this.notificationQueue.length === 0) {
            return;
        }

        const notification = this.notificationQueue.shift();
        this.showNotification(notification);
    }

    showNotification(notification) {
        this.currentNotification = notification;

        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `floating-mascot-notification notification-${notification.type}`;
        notificationEl.textContent = notification.message;

        // Style notification
        this.styleNotification(notificationEl);

        // Position relative to mascot
        this.positionNotification(notificationEl);

        // Add to document
        document.body.appendChild(notificationEl);

        // Animate in
        requestAnimationFrame(() => {
            notificationEl.style.opacity = '1';
            notificationEl.style.transform = 'translateY(0) scale(1)';
        });

        // Auto-hide after duration
        setTimeout(() => {
            this.hideNotification(notificationEl);
        }, notification.duration);

        // Update mascot animation based on notification type
        this.updateMascotForNotification(notification.type);
    }

    styleNotification(notificationEl) {
        const baseStyles = {
            position: 'fixed',
            zIndex: '1002',
            background: 'var(--color-bg-elevated, #2d2d30)',
            color: 'var(--color-text, #cccccc)',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border, #3e3e42)',
            fontSize: '13px',
            fontFamily: 'var(--font-family, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif)',
            maxWidth: '250px',
            wordWrap: 'break-word',
            opacity: '0',
            transform: 'translateY(-10px) scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            pointerEvents: 'none'
        };

        // Type-specific styles
        const typeStyles = {
            success: { borderLeft: '4px solid #4CAF50', background: 'rgba(76, 175, 80, 0.1)' },
            error: { borderLeft: '4px solid #F44336', background: 'rgba(244, 67, 54, 0.1)' },
            warning: { borderLeft: '4px solid #FF9800', background: 'rgba(255, 152, 0, 0.1)' },
            info: { borderLeft: '4px solid #2196F3', background: 'rgba(33, 150, 243, 0.1)' }
        };

        Object.assign(notificationEl.style, baseStyles, typeStyles[notificationEl.className.includes('error') ? 'error' : 
                     notificationEl.className.includes('success') ? 'success' :
                     notificationEl.className.includes('warning') ? 'warning' : 'info']);
    }

    positionNotification(notificationEl) {
        const mascotRect = this.mascotElement.getBoundingClientRect();
        const notificationWidth = 250; // max-width from styles
        
        let left, top;
        
        if (this.config.notificationPosition === 'left') {
            left = Math.max(10, mascotRect.left - notificationWidth - 10);
            top = mascotRect.top + (mascotRect.height / 2) - 20;
        } else if (this.config.notificationPosition === 'right') {
            left = Math.min(window.innerWidth - notificationWidth - 10, mascotRect.right + 10);
            top = mascotRect.top + (mascotRect.height / 2) - 20;
        } else if (this.config.notificationPosition === 'top') {
            left = mascotRect.left + (mascotRect.width / 2) - (notificationWidth / 2);
            top = Math.max(10, mascotRect.top - 60);
        } else { // bottom
            left = mascotRect.left + (mascotRect.width / 2) - (notificationWidth / 2);
            top = mascotRect.bottom + 10;
        }

        // Keep within viewport
        left = Math.max(10, Math.min(left, window.innerWidth - notificationWidth - 10));
        top = Math.max(10, Math.min(top, window.innerHeight - 100));

        notificationEl.style.left = left + 'px';
        notificationEl.style.top = top + 'px';
    }

    hideNotification(notificationEl) {
        notificationEl.style.opacity = '0';
        notificationEl.style.transform = 'translateY(-10px) scale(0.95)';
        
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
            this.currentNotification = null;
            this.processNotificationQueue();
        }, 300);
    }

    updateMascotForNotification(type) {
        if (!this.mascotAnimator) return;

        const animationMap = {
            success: 'success',
            error: 'debug',
            warning: 'thinking',
            info: 'explain'
        };

        const animation = animationMap[type] || 'idle';
        this.mascotAnimator.playScenario(animation);
    }

    // Tooltip System
    showTooltip() {
        if (!this.config.showTooltips) return;

        const tooltip = this.mascotElement.getAttribute('data-tooltip');
        if (!tooltip) return;

        let tooltipEl = document.getElementById('floating-mascot-tooltip');
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'floating-mascot-tooltip';
            document.body.appendChild(tooltipEl);
        }

        tooltipEl.textContent = tooltip;
        this.styleTooltip(tooltipEl);
        this.positionTooltip(tooltipEl);

        tooltipEl.style.opacity = '1';
    }

    hideTooltip() {
        const tooltipEl = document.getElementById('floating-mascot-tooltip');
        if (tooltipEl) {
            tooltipEl.style.opacity = '0';
        }
    }

    styleTooltip(tooltipEl) {
        const styles = {
            position: 'fixed',
            zIndex: '1003',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'var(--font-family, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif)',
            whiteSpace: 'nowrap',
            opacity: '0',
            transition: 'opacity 0.2s ease',
            pointerEvents: 'none',
            maxWidth: '200px',
            wordWrap: 'break-word',
            textAlign: 'center'
        };

        Object.assign(tooltipEl.style, styles);
    }

    positionTooltip(tooltipEl) {
        const mascotRect = this.mascotElement.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        const left = mascotRect.left + (mascotRect.width / 2) - (tooltipRect.width / 2);
        const top = mascotRect.top - tooltipRect.height - 8;

        tooltipEl.style.left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10)) + 'px';
        tooltipEl.style.top = Math.max(10, top) + 'px';
    }

    // Position Management
    savePosition() {
        if (!this.config.draggable) return;

        const rect = this.mascotElement.getBoundingClientRect();
        const position = {
            left: rect.left,
            top: rect.top,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.config.positionStorageKey, JSON.stringify(position));
        } catch (error) {
            console.warn('Failed to save mascot position:', error);
        }
    }

    loadPosition() {
        try {
            const saved = localStorage.getItem(this.config.positionStorageKey);
            if (saved) {
                const position = JSON.parse(saved);
                
                // Validate position is still within viewport
                if (position.left >= 0 && position.top >= 0 && 
                    position.left < window.innerWidth - this.config.size && 
                    position.top < window.innerHeight - this.config.size) {
                    
                    this.mascotElement.style.left = position.left + 'px';
                    this.mascotElement.style.top = position.top + 'px';
                    this.mascotElement.style.right = 'auto';
                    this.mascotElement.style.bottom = 'auto';
                    return;
                }
            }
        } catch (error) {
            console.warn('Failed to load mascot position:', error);
        }

        // Apply default position
        Object.assign(this.mascotElement.style, this.config.defaultPosition);
    }

    // Integration with MascotAnimator
    initializeMascotAnimator() {
        if (window.MascotAnimator) {
            this.mascotAnimator = new window.MascotAnimator();
        } else {
            // Load MascotAnimator if not already loaded
            const script = document.createElement('script');
            script.src = 'assets/mascot-animator.js';
            script.onload = () => {
                if (window.MascotAnimator) {
                    this.mascotAnimator = new window.MascotAnimator();
                }
            };
            document.head.appendChild(script);
        }
    }

    // Public API Methods
    setTooltip(text) {
        this.mascotElement.setAttribute('data-tooltip', text);
    }

    playAnimation(scenario) {
        if (this.mascotAnimator) {
            this.mascotAnimator.playScenario(scenario);
        }
    }

    // Notification shortcuts
    success(message, duration) {
        this.notify(message, 'success', duration);
    }

    error(message, duration) {
        this.notify(message, 'error', duration);
    }

    warning(message, duration) {
        this.notify(message, 'warning', duration);
    }

    info(message, duration) {
        this.notify(message, 'info', duration);
    }

    // Cleanup
    destroy() {
        if (this.mascotElement) {
            this.mascotElement.remove();
        }
        
        const tooltip = document.getElementById('floating-mascot-tooltip');
        if (tooltip) {
            tooltip.remove();
        }

        // Clear any pending notifications
        this.notificationQueue = [];
        this.currentNotification = null;
    }
}

// Auto-initialize if enabled
if (typeof window !== 'undefined') {
    window.FloatingMascot = FloatingMascot;
    
    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.floatingMascot && !document.querySelector('#floating-mascot')) {
                window.floatingMascot = new FloatingMascot();
            }
        });
    } else {
        if (!window.floatingMascot && !document.querySelector('#floating-mascot')) {
            window.floatingMascot = new FloatingMascot();
        }
    }
}

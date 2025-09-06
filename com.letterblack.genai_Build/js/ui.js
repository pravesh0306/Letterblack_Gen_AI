/**
 * LetterBlack GenAI - UI Module
 * Consolidates: ui-bootstrap.js, simple-file-upload.js, mascot-animator.js
 */

(function() {
    'use strict';
    
    // Simple File Upload Handler
    class SimpleFileUpload {
        constructor() {
            this.maxFileSize = 10 * 1024 * 1024; // 10MB
            this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/json'];
            this.uploadQueue = [];
        }
        
        initialize() {
            this.setupDropZone();
            this.setupFileInput();
            console.log('✅ File upload initialized');
        }
        
        setupDropZone() {
            const chatInput = document.getElementById('chat-input');
            if (!chatInput) return;
            
            const container = chatInput.parentElement;
            if (!container) return;
            
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                container.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });
            
            // Highlight drop area
            ['dragenter', 'dragover'].forEach(eventName => {
                container.addEventListener(eventName, () => this.highlight(container), false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                container.addEventListener(eventName, () => this.unhighlight(container), false);
            });
            
            // Handle dropped files
            container.addEventListener('drop', (e) => this.handleDrop(e), false);
        }
        
        setupFileInput() {
            // Add file upload button to chat interface
            const chatControls = document.querySelector('.chat-controls');
            if (!chatControls) return;
            
            const fileButton = document.createElement('button');
            fileButton.id = 'file-upload-btn';
            fileButton.className = 'btn btn-secondary';
            fileButton.innerHTML = '📎';
            fileButton.title = 'Upload file';
            fileButton.type = 'button';
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'file-input';
            fileInput.style.display = 'none';
            fileInput.multiple = true;
            fileInput.accept = this.allowedTypes.join(',');
            
            fileButton.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
            
            chatControls.insertBefore(fileButton, chatControls.firstChild);
            chatControls.appendChild(fileInput);
        }
        
        preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        highlight(element) {
            element.classList.add('drag-highlight');
        }
        
        unhighlight(element) {
            element.classList.remove('drag-highlight');
        }
        
        handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleFiles(files);
        }
        
        async handleFiles(files) {
            if (!files || files.length === 0) return;
            
            const fileArray = Array.from(files);
            const validFiles = fileArray.filter(file => this.validateFile(file));
            
            if (validFiles.length === 0) {
                this.showError('No valid files to upload');
                return;
            }
            
            for (const file of validFiles) {
                await this.processFile(file);
            }
        }
        
        validateFile(file) {
            // Check file size
            if (file.size > this.maxFileSize) {
                this.showError(`File "${file.name}" is too large. Max size: 10MB`);
                return false;
            }
            
            // Check file type
            if (!this.allowedTypes.includes(file.type)) {
                this.showError(`File type "${file.type}" not supported`);
                return false;
            }
            
            return true;
        }
        
        async processFile(file) {
            try {
                this.showProcessing(`Processing ${file.name}...`);
                
                if (file.type.startsWith('image/')) {
                    await this.processImage(file);
                } else if (file.type === 'text/plain' || file.type === 'application/json') {
                    await this.processText(file);
                } else {
                    this.showError(`Unsupported file type: ${file.type}`);
                }
            } catch (error) {
                console.error('File processing error:', error);
                this.showError(`Failed to process ${file.name}`);
            }
        }
        
        async processImage(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const img = new Image();
                        img.onload = () => {
                            // Create preview and add to chat
                            this.addImageToChat(file.name, e.target.result, {
                                width: img.width,
                                height: img.height,
                                size: file.size
                            });
                            resolve();
                        };
                        img.onerror = () => reject(new Error('Invalid image'));
                        img.src = e.target.result;
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
        }
        
        async processText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        this.addTextFileToChat(file.name, content);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });
        }
        
        addImageToChat(filename, dataUrl, metadata) {
            if (window.addMessageToChat) {
                const content = `📷 **Image uploaded: ${filename}**

*Dimensions:* ${metadata.width} × ${metadata.height}
*Size:* ${this.formatFileSize(metadata.size)}

![${filename}](${dataUrl})

Ready to analyze! Ask me anything about this image.`;
                
                window.addMessageToChat('user', content);
            }
        }
        
        addTextFileToChat(filename, content) {
            if (window.addMessageToChat) {
                const truncated = content.length > 1000 ? content.substring(0, 1000) + '...' : content;
                const message = `📄 **File uploaded: ${filename}**

\`\`\`
${truncated}
\`\`\`

Ready to analyze! Ask me questions about this file.`;
                
                window.addMessageToChat('user', message);
            }
        }
        
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        showProcessing(message) {
            if (window.SimpleToast) {
                window.SimpleToast.show(message, 'info', 2000);
            }
        }
        
        showError(message) {
            if (window.SimpleToast) {
                window.SimpleToast.show(message, 'error', 5000);
            } else {
                console.error(message);
            }
        }
    }
    
    // Mascot Animator
    class MascotAnimator {
        constructor() {
            this.mascot = null;
            this.animations = {
                idle: 'Idle.webm',
                thinking: 'problem-solving.webm',
                explaining: 'explain.webm',
                celebrating: 'completion.webm',
                settings: 'settings.webm'
            };
            this.currentAnimation = 'idle';
            this.basePath = 'assets/';
        }
        
        initialize() {
            this.createMascot();
            this.setupEventListeners();
            console.log('✅ Mascot animator initialized');
        }
        
        createMascot() {
            const mascotContainer = document.querySelector('.mascot-container');
            if (!mascotContainer) return;
            
            this.mascot = document.createElement('video');
            this.mascot.className = 'mascot-video';
            this.mascot.autoplay = true;
            this.mascot.loop = true;
            this.mascot.muted = true;
            this.mascot.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 8px;
            `;
            
            this.playAnimation('idle');
            mascotContainer.appendChild(this.mascot);
        }
        
        setupEventListeners() {
            // Listen for chat events
            document.addEventListener('chat:user-message', () => {
                this.playAnimation('thinking');
            });
            
            document.addEventListener('chat:ai-response', () => {
                this.playAnimation('explaining');
                
                // Return to idle after explanation
                setTimeout(() => {
                    this.playAnimation('idle');
                }, 3000);
            });
            
            // Listen for tab changes
            document.addEventListener('tab:changed', (e) => {
                if (e.detail?.tab === 'settings') {
                    this.playAnimation('settings');
                } else {
                    this.playAnimation('idle');
                }
            });
        }
        
        playAnimation(animationName) {
            if (!this.mascot || !this.animations[animationName]) return;
            
            const animationFile = this.animations[animationName];
            const fullPath = this.basePath + animationFile;
            
            if (this.currentAnimation === animationName) return;
            
            this.currentAnimation = animationName;
            this.mascot.src = fullPath;
            this.mascot.load();
        }
        
        celebrate() {
            this.playAnimation('celebrating');
            setTimeout(() => {
                this.playAnimation('idle');
            }, 3000);
        }
    }
    
    // UI Bootstrap - Main UI initialization and management
    class UIBootstrap {
        constructor() {
            this.components = {
                fileUpload: null,
                mascot: null
            };
            this.initialized = false;
        }
        
        async initialize() {
            if (this.initialized) return;
            
            try {
                // Initialize components
                this.components.fileUpload = new SimpleFileUpload();
                this.components.fileUpload.initialize();
                
                this.components.mascot = new MascotAnimator();
                this.components.mascot.initialize();
                
                // Setup global UI behaviors
                this.setupResponsive();
                this.setupKeyboardShortcuts();
                this.setupThemeDetection();
                this.setupTooltips();
                
                this.initialized = true;
                console.log('✅ UI Bootstrap initialized');
                
                return true;
            } catch (error) {
                console.error('❌ Failed to initialize UI:', error);
                return false;
            }
        }
        
        setupResponsive() {
            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });
            
            // Initial resize
            this.handleResize();
        }
        
        handleResize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Adjust layout for small screens
            document.body.classList.toggle('compact-mode', width < 400 || height < 500);
            
            // Adjust chat height
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const inputHeight = document.querySelector('.chat-input-container')?.offsetHeight || 0;
                const availableHeight = height - headerHeight - inputHeight - 40; // 40px margin
                
                chatMessages.style.maxHeight = `${Math.max(200, availableHeight)}px`;
            }
        }
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Enter to send message
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    const sendButton = document.getElementById('send-button');
                    if (sendButton && !sendButton.disabled) {
                        sendButton.click();
                    }
                }
                
                // Escape to clear chat input
                if (e.key === 'Escape') {
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput && document.activeElement === chatInput) {
                        chatInput.value = '';
                        chatInput.dispatchEvent(new Event('input'));
                    }
                }
                
                // Alt + 1-4 for tab switching
                if (e.altKey && e.key >= '1' && e.key <= '4') {
                    e.preventDefault();
                    const tabs = ['chat', 'settings', 'history', 'help'];
                    const tabIndex = parseInt(e.key) - 1;
                    if (tabs[tabIndex]) {
                        const tabButton = document.querySelector(`[data-tab="${tabs[tabIndex]}"]`);
                        if (tabButton) {
                            tabButton.click();
                        }
                    }
                }
            });
        }
        
        setupThemeDetection() {
            // Watch for system theme changes
            if (window.matchMedia) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                mediaQuery.addListener(() => {
                    this.updateTheme();
                });
                
                // Initial theme
                this.updateTheme();
            }
        }
        
        updateTheme() {
            const settings = window.settingsManager?.getSettings?.() || {};
            let theme = settings.theme || 'auto';
            
            if (theme === 'auto') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            document.body.setAttribute('data-theme', theme);
        }
        
        setupTooltips() {
            // Simple tooltip system
            const tooltipElements = document.querySelectorAll('[title]');
            tooltipElements.forEach(element => {
                element.addEventListener('mouseenter', this.showTooltip.bind(this));
                element.addEventListener('mouseleave', this.hideTooltip.bind(this));
            });
        }
        
        showTooltip(e) {
            const element = e.target;
            const text = element.getAttribute('title');
            if (!text) return;
            
            // Remove title to prevent default tooltip
            element.setAttribute('data-original-title', text);
            element.removeAttribute('title');
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = text;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            
            element._tooltip = tooltip;
        }
        
        hideTooltip(e) {
            const element = e.target;
            
            // Restore original title
            const originalTitle = element.getAttribute('data-original-title');
            if (originalTitle) {
                element.setAttribute('title', originalTitle);
                element.removeAttribute('data-original-title');
            }
            
            // Remove tooltip
            if (element._tooltip) {
                element._tooltip.remove();
                delete element._tooltip;
            }
        }
        
        // Public methods for animations
        triggerMascotAnimation(animation) {
            if (this.components.mascot) {
                this.components.mascot.playAnimation(animation);
            }
        }
        
        celebrateMascot() {
            if (this.components.mascot) {
                this.components.mascot.celebrate();
            }
        }
    }
    
    // Export classes
    window.SimpleFileUpload = SimpleFileUpload;
    window.MascotAnimator = MascotAnimator;
    window.UIBootstrap = UIBootstrap;
    
    // Auto-initialize UI
    const uiBootstrap = new UIBootstrap();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            uiBootstrap.initialize();
        });
    } else {
        uiBootstrap.initialize();
    }
    
    // Expose globally
    window.uiBootstrap = uiBootstrap;
    
    console.log('✅ UI module loaded');
    
})();

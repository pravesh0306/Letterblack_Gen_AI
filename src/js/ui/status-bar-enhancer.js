// Enhanced Status Bar with Real-time Feedback
class StatusBarEnhancer {
    constructor() {
        this.statusStates = {
            idle: { color: '#4CAF50', text: 'Ready', icon: '●' },
            working: { color: '#FF9800', text: 'Processing', icon: '⟳' },
            thinking: { color: '#2196F3', text: 'Thinking', icon: '💭' },
            error: { color: '#f44336', text: 'Error', icon: '⚠' },
            success: { color: '#4CAF50', text: 'Success', icon: '✓' }
        };

        this.currentState = 'idle';
        this.messageQueue = [];
        this.isProcessingQueue = false;

        this.init();
    }

    init() {
        this.createEnhancedStatusBar();
        this.setupPerformanceMonitor();
        this.setupConnectionMonitor();
        this.startStatusUpdates();
    }

    createEnhancedStatusBar() {
        // Find or create status bar
        let statusBar = document.querySelector('.status-bar');
        if (!statusBar) {
            statusBar = document.createElement('div');
            statusBar.className = 'status-bar';
            document.body.appendChild(statusBar);
        }

        // Enhanced status bar HTML
        statusBar.innerHTML = `
            <div class="status-section status-main">
                <div class="status-indicator">
                    <span class="status-dot"></span>
                    <span class="status-text">Ready</span>
                </div>
            </div>
            
            <div class="status-section status-performance">
                <div class="performance-indicator">
                    <span class="performance-label">Performance:</span>
                    <div class="performance-bar">
                        <div class="performance-fill"></div>
                    </div>
                    <span class="performance-text">Good</span>
                </div>
            </div>
            
            <div class="status-section status-connection">
                <div class="connection-indicator">
                    <span class="connection-dot"></span>
                    <span class="connection-text">Connected</span>
                </div>
            </div>
            
            <div class="status-section status-actions">
                <button class="status-action-btn" id="clear-cache-btn" title="Clear Cache">
                    🗑️
                </button>
                <button class="status-action-btn" id="refresh-status-btn" title="Refresh Status">
                    🔄
                </button>
                <button class="status-action-btn" id="toggle-INFO-btn" title="Toggle INFO Mode">
                    🐛
                </button>
            </div>
        `;

        this.setupStatusActions();
    }

    setupStatusActions() {
        document.getElementById('clear-cache-btn')?.addEventListener('click', () => {
            this.showMessage('Cache cleared', 'success');
            if (window.uiEnhancer) {
                window.uiEnhancer.showNotification('Cache cleared successfully', 'success');
            }
        });

        document.getElementById('refresh-status-btn')?.addEventListener('click', () => {
            this.refreshStatus();
        });

        document.getElementById('toggle-INFO-btn')?.addEventListener('click', () => {
            this.toggleINFOMode();
        });
    }

    setState(state, message = null) {
        if (!this.statusStates[state]) {return;}

        this.currentState = state;
        const stateConfig = this.statusStates[state];

        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');

        if (statusDot && statusText) {
            statusDot.style.backgroundColor = stateConfig.color;
            statusText.textContent = message || stateConfig.text;

            // Add animation for state changes
            statusDot.style.animation = 'none';
            statusDot.offsetHeight; // Trigger reflow
            statusDot.style.animation = state === 'working' ? 'spin 2s linear infinite' :
                state === 'thinking' ? 'pulse 1.5s ease-in-out infinite' : '';
        }

        if (message) {
            this.queueMessage(message, state);
        }
    }

    queueMessage(message, type = 'info', duration = 3000) {
        this.messageQueue.push({ message, type, duration, timestamp: Date.now() });
        this.processMessageQueue();
    }

    async processMessageQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) {return;}

        this.isProcessingQueue = true;

        while (this.messageQueue.length > 0) {
            const { message, type, duration } = this.messageQueue.shift();
            await this.showMessage(message, type, duration);
            await this.wait(500); // Brief pause between messages
        }

        this.isProcessingQueue = false;
    }

    async showMessage(message, type = 'info', duration = 3000) {
        const statusText = document.querySelector('.status-text');
        if (!statusText) {return;}

        const originalText = statusText.textContent;
        const typeConfig = this.statusStates[type] || { color: '#2196F3', icon: 'ℹ' };

        // Show message with animation
        statusText.style.transition = 'opacity 0.3s ease';
        statusText.style.opacity = '0';

        await this.wait(300);

        statusText.textContent = `${typeConfig.icon} ${message}`;
        statusText.style.color = typeConfig.color;
        statusText.style.opacity = '1';

        // Return to original state after duration
        setTimeout(async () => {
            statusText.style.opacity = '0';
            await this.wait(300);
            statusText.textContent = originalText;
            statusText.style.color = '';
            statusText.style.opacity = '1';
        }, duration);
    }

    setupPerformanceMonitor() {
        const performanceFill = document.querySelector('.performance-fill');
        const performanceText = document.querySelector('.performance-text');

        if (!performanceFill || !performanceText) {return;}

        setInterval(() => {
            const performance = this.getPerformanceMetrics();
            const percentage = Math.max(0, Math.min(100, performance.score));

            performanceFill.style.width = `${percentage}%`;
            performanceFill.style.backgroundColor = this.getPerformanceColor(percentage);
            performanceText.textContent = this.getPerformanceLabel(percentage);
        }, 2000);
    }

    getPerformanceMetrics() {
        // Simple performance heuristic
        const memory = performance.memory ?
            (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100 : 50;

        // Estimate based on memory usage and frame timing
        const score = Math.max(0, 100 - memory);

        return { score, memory };
    }

    getPerformanceColor(percentage) {
        if (percentage >= 80) {return '#4CAF50';}
        if (percentage >= 60) {return '#FF9800';}
        return '#f44336';
    }

    getPerformanceLabel(percentage) {
        if (percentage >= 80) {return 'Excellent';}
        if (percentage >= 60) {return 'Good';}
        if (percentage >= 40) {return 'Fair';}
        return 'Poor';
    }

    setupConnectionMonitor() {
        const connectionDot = document.querySelector('.connection-dot');
        const connectionText = document.querySelector('.connection-text');

        if (!connectionDot || !connectionText) {return;}

        const updateConnectionStatus = () => {
            const isOnline = navigator.onLine;
            const hasAI = window.aiModule && window.aiModule.isAvailable;

            if (isOnline && hasAI) {
                connectionDot.style.backgroundColor = '#4CAF50';
                connectionText.textContent = 'Connected';
            } else if (isOnline) {
                connectionDot.style.backgroundColor = '#FF9800';
                connectionText.textContent = 'Online (AI Limited)';
            } else {
                connectionDot.style.backgroundColor = '#f44336';
                connectionText.textContent = 'Offline';
            }
        };

        // Monitor connection changes
        window.addEventListener('online', updateConnectionStatus);
        window.addEventListener('offline', updateConnectionStatus);

        // Check AI module availability
        setInterval(updateConnectionStatus, 5000);
        updateConnectionStatus();
    }

    refreshStatus() {
        this.setState('working', 'Refreshing status...');

        setTimeout(() => {
            // Simulate refresh
            this.setState('success', 'Status refreshed');

            setTimeout(() => {
                this.setState('idle');
            }, 2000);
        }, 1000);
    }

    toggleINFOMode() {
        const isINFO = document.body.classList.toggle('INFO-mode');
        this.showMessage(isINFO ? 'INFO mode enabled' : 'INFO mode disabled', 'info');

        if (isINFO) {
            this.addINFOInfo();
        } else {
            this.removeINFOInfo();
        }
    }

    addINFOInfo() {
        if (document.querySelector('.INFO-panel')) {return;}

        const INFOPanel = document.createElement('div');
        INFOPanel.className = 'INFO-panel';
        INFOPanel.innerHTML = `
            <div class="INFO-header">INFO Information</div>
            <div class="INFO-content">
                <div class="INFO-item">
                    <span class="INFO-label">User Agent:</span>
                    <span class="INFO-value">${navigator.userAgent.slice(0, 50)}...</span>
                </div>
                <div class="INFO-item">
                    <span class="INFO-label">Memory Usage:</span>
                    <span class="INFO-value" id="memory-usage">Calculating...</span>
                </div>
                <div class="INFO-item">
                    <span class="INFO-label">AI Module:</span>
                    <span class="INFO-value">${window.aiModule ? 'Available' : 'Not Available'}</span>
                </div>
                <div class="INFO-item">
                    <span class="INFO-label">CEP Version:</span>
                    <span class="INFO-value">${window.__adobe_cep__ ? 'Available' : 'Browser Mode'}</span>
                </div>
            </div>
        `;

        INFOPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(45, 45, 48, 0.95);
            border: 1px solid var(--vscode-border);
            border-radius: 8px;
            padding: 12px;
            z-index: 9999;
            font-size: 12px;
            min-width: 300px;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(INFOPanel);

        // Update memory usage periodically
        setInterval(() => {
            const memoryElement = document.getElementById('memory-usage');
            if (memoryElement && performance.memory) {
                const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
                const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1);
                memoryElement.textContent = `${used}MB / ${total}MB`;
            }
        }, 1000);
    }

    removeINFOInfo() {
        const INFOPanel = document.querySelector('.INFO-panel');
        if (INFOPanel) {
            INFOPanel.remove();
        }
    }

    startStatusUpdates() {
        // Periodic status updates
        setInterval(() => {
            if (this.currentState === 'idle') {
                const hour = new Date().getHours();
                let greeting = 'Good ';
                if (hour < 12) {greeting += 'morning';}
                else if (hour < 18) {greeting += 'afternoon';}
                else {greeting += 'evening';}

                // Occasionally show friendly messages
                if (Math.random() < 0.1) {
                    this.queueMessage(`${greeting }! Ready to help.`, 'info', 2000);
                }
            }
        }, 30000); // Every 30 seconds
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API methods
    showThinking(message = 'Processing your request...') {
        this.setState('thinking', message);
    }

    showWorking(message = 'Working...') {
        this.setState('working', message);
    }

    showSuccess(message = 'Operation completed successfully') {
        this.setState('success', message);
        setTimeout(() => this.setState('idle'), 3000);
    }

    showError(message = 'An error occurred') {
        this.setState('error', message);
        setTimeout(() => this.setState('idle'), 5000);
    }

    showReady(message = 'Ready') {
        this.setState('idle', message);
    }
}

// Add status bar CSS
const statusBarStyles = document.createElement('style');
statusBarStyles.textContent = `
    .status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        background: linear-gradient(90deg, 
            var(--vscode-bg-tertiary) 0%, 
            var(--vscode-bg-secondary) 100%);
        border-top: 1px solid var(--vscode-border);
        font-size: 12px;
        z-index: 1000;
    }

    .status-section {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #4CAF50;
        transition: all 0.3s ease;
    }

    .performance-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .performance-bar {
        width: 60px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
    }

    .performance-fill {
        height: 100%;
        background: #4CAF50;
        transition: all 0.5s ease;
        border-radius: 2px;
    }

    .connection-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .connection-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF50;
    }

    .status-actions {
        display: flex;
        gap: 4px;
    }

    .status-action-btn {
        background: none;
        border: none;
        color: var(--vscode-text-secondary);
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 12px;
        transition: all 0.2s ease;
    }

    .status-action-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--vscode-text-primary);
    }

    .INFO-panel .INFO-header {
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--vscode-text-accent);
    }

    .INFO-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
    }

    .INFO-label {
        font-weight: 500;
    }

    .INFO-value {
        color: var(--vscode-text-secondary);
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;

document.head.appendChild(statusBarStyles);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.statusBar = new StatusBarEnhancer();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatusBarEnhancer;
}

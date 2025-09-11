// Enhanced Status Bar with Real-time Feedback
class StatusBarEnhancer {
    constructor() {
        this.statusStates = {
            idle: { color: '#4CAF50', text: 'Ready', icon: '●' },
            working: { color: '#FF9800', text: 'Processing', icon: '⟳' },
            thinking: { color: '#2196F3', text: 'Thinking', icon: '' },
            error: { color: '#f44336', text: 'Error', icon: '' },
            success: { color: '#4CAF50', text: 'Success', icon: '' }
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

        // Build enhanced status bar DOM
        statusBar.textContent = '';

        const makeEl = (tag, className, text) => {
            const el = document.createElement(tag);
            if (className) el.className = className;
            if (text != null) el.textContent = text;
            return el;
        };

        // Main status
        const mainSection = makeEl('div', 'status-section status-main');
        const statusIndicator = makeEl('div', 'status-indicator');
        const statusDot = makeEl('span', 'status-dot');
        const statusText = makeEl('span', 'status-text', 'Ready');
        statusIndicator.appendChild(statusDot);
        statusIndicator.appendChild(statusText);
        mainSection.appendChild(statusIndicator);

        // Performance
        const perfSection = makeEl('div', 'status-section status-performance');
        const perfIndicator = makeEl('div', 'performance-indicator');
        const perfLabel = makeEl('span', 'performance-label', 'Performance:');
        const perfBar = makeEl('div', 'performance-bar');
        const perfFill = makeEl('div', 'performance-fill');
        perfBar.appendChild(perfFill);
        const perfText = makeEl('span', 'performance-text', 'Good');
        perfIndicator.appendChild(perfLabel);
        perfIndicator.appendChild(perfBar);
        perfIndicator.appendChild(perfText);
        perfSection.appendChild(perfIndicator);

        // Connection
        const connSection = makeEl('div', 'status-section status-connection');
        const connIndicator = makeEl('div', 'connection-indicator');
        const connDot = makeEl('span', 'connection-dot');
        const connText = makeEl('span', 'connection-text', 'Connected');
        connIndicator.appendChild(connDot);
        connIndicator.appendChild(connText);
        connSection.appendChild(connIndicator);

        // Actions
        const actionsSection = makeEl('div', 'status-section status-actions');
    const clearBtn = makeEl('button', 'status-action-btn', 'Clear');
        clearBtn.id = 'clear-cache-btn';
        clearBtn.title = 'Clear Cache';
    const refreshBtn = makeEl('button', 'status-action-btn', 'Refresh');
        refreshBtn.id = 'refresh-status-btn';
        refreshBtn.title = 'Refresh Status';
    const debugBtn = makeEl('button', 'status-action-btn', 'Debug');
        debugBtn.id = 'toggle-debug-btn';
        debugBtn.title = 'Toggle Debug Mode';
        actionsSection.appendChild(clearBtn);
        actionsSection.appendChild(refreshBtn);
        actionsSection.appendChild(debugBtn);

        // Assemble
        statusBar.appendChild(mainSection);
        statusBar.appendChild(perfSection);
        statusBar.appendChild(connSection);
        statusBar.appendChild(actionsSection);

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

        document.getElementById('toggle-debug-btn')?.addEventListener('click', () => {
            this.toggleDebugMode();
        });
    }

    setState(state, message = null) {
        if (!this.statusStates[state]) return;
        
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
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;
        
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
        if (!statusText) return;
        
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
        
        if (!performanceFill || !performanceText) return;
        
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
        if (percentage >= 80) return '#4CAF50';
        if (percentage >= 60) return '#FF9800';
        return '#f44336';
    }

    getPerformanceLabel(percentage) {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Fair';
        return 'Poor';
    }

    setupConnectionMonitor() {
        const connectionDot = document.querySelector('.connection-dot');
        const connectionText = document.querySelector('.connection-text');
        
        if (!connectionDot || !connectionText) return;
        
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

    toggleDebugMode() {
        const isDebug = document.body.classList.toggle('debug-mode');
        this.showMessage(isDebug ? 'Debug mode enabled' : 'Debug mode disabled', 'info');
        
        if (isDebug) {
            this.addDebugInfo();
        } else {
            this.removeDebugInfo();
        }
    }

    addDebugInfo() {
        if (document.querySelector('.debug-panel')) return;
        
        const debugPanel = document.createElement('div');
        debugPanel.className = 'debug-panel';

        const header = document.createElement('div');
        header.className = 'debug-header';
        header.textContent = 'Debug Information';

        const content = document.createElement('div');
        content.className = 'debug-content';

        const makeItem = (labelText, valueText) => {
            const item = document.createElement('div');
            item.className = 'debug-item';
            const label = document.createElement('span');
            label.className = 'debug-label';
            label.textContent = labelText;
            const value = document.createElement('span');
            value.className = 'debug-value';
            value.textContent = valueText;
            item.appendChild(label);
            item.appendChild(value);
            return item;
        };

        content.appendChild(makeItem('User Agent:', `${navigator.userAgent.slice(0, 50)}...`));

        const memoryItem = document.createElement('div');
        memoryItem.className = 'debug-item';
        const memLabel = document.createElement('span');
        memLabel.className = 'debug-label';
        memLabel.textContent = 'Memory Usage:';
        const memValue = document.createElement('span');
        memValue.className = 'debug-value';
        memValue.id = 'memory-usage';
        memValue.textContent = 'Calculating...';
        memoryItem.appendChild(memLabel);
        memoryItem.appendChild(memValue);
        content.appendChild(memoryItem);

        content.appendChild(makeItem('AI Module:', (window.aiModule ? 'Available' : 'Not Available')));
        content.appendChild(makeItem('CEP Version:', (window.__adobe_cep__ ? 'Available' : 'Browser Mode')));

        debugPanel.appendChild(header);
        debugPanel.appendChild(content);
        
        debugPanel.style.cssText = `
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
        
        document.body.appendChild(debugPanel);
        
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

    removeDebugInfo() {
        const debugPanel = document.querySelector('.debug-panel');
        if (debugPanel) {
            debugPanel.remove();
        }
    }

    startStatusUpdates() {
        // Periodic status updates
        setInterval(() => {
            if (this.currentState === 'idle') {
                const hour = new Date().getHours();
                let greeting = 'Good ';
                if (hour < 12) greeting += 'morning';
                else if (hour < 18) greeting += 'afternoon';
                else greeting += 'evening';
                
                // Occasionally show friendly messages
                if (Math.random() < 0.1) {
                    this.queueMessage(greeting + '! Ready to help.', 'info', 2000);
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

    .debug-panel .debug-header {
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--vscode-text-accent);
    }

    .debug-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
    }

    .debug-label {
        font-weight: 500;
    }

    .debug-value {
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

/**
 * ADVANCED PERFORMANCE MONITOR
 * Memory management, object pooling, and real-time monitoring
 */

class AdvancedPerformanceMonitor {
    constructor() {
        this.memoryStats = {
            heapUsed: 0,
            heapTotal: 0,
            heapLimit: 0,
            external: 0,
            rss: 0
        };

        this.objectPools = new Map();
        this.performanceMetrics = new Map();
        this.garbageCollectionStats = {
            collections: 0,
            totalTime: 0,
            lastCollection: null
        };

        this.monitoring = false;
        this.monitoringInterval = null;
        this.memoryThresholds = {
            warning: 50 * 1024 * 1024,  // 50MB
            critical: 100 * 1024 * 1024 // 100MB
        };

        this.init();
    }

    init() {
        // Initialize object pools for frequently used objects
        this.initializeObjectPools();

        // Start monitoring if performance API is available
        if (performance.memory) {
            this.startMonitoring();
        }

        // Listen for memory pressure events
        if ('memory' in performance) {
            this.setupMemoryPressureListener();
        }

        console.log('📊 Advanced Performance Monitor initialized');
    }

    /**
     * Initialize object pools for memory optimization
     */
    initializeObjectPools() {
        // AI Response objects pool
        this.createObjectPool('ai-responses', () => ({
            id: null,
            content: '',
            timestamp: null,
            metadata: {},
            recycled: true
        }), 20);

        // Chat message objects pool
        this.createObjectPool('chat-messages', () => ({
            id: null,
            content: '',
            type: 'user',
            timestamp: null,
            metadata: {},
            recycled: true
        }), 50);

        // Tutorial analysis objects pool
        this.createObjectPool('tutorial-analysis', () => ({
            videoId: null,
            analysis: {},
            implementation: {},
            learningPath: {},
            recycled: true
        }), 10);

        // Expression objects pool
        this.createObjectPool('expressions', () => ({
            code: '',
            description: '',
            usage: '',
            validated: false,
            recycled: true
        }), 30);

        console.log('🏊 Object pools initialized');
    }

    /**
     * Create an object pool
     */
    createObjectPool(poolName, factory, initialSize = 10) {
        const pool = {
            available: [],
            inUse: new Set(),
            factory: factory,
            stats: {
                created: 0,
                reused: 0,
                disposed: 0
            }
        };

        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            const obj = factory();
            obj._poolId = `${poolName}_${i}`;
            pool.available.push(obj);
            pool.stats.created++;
        }

        this.objectPools.set(poolName, pool);
        return pool;
    }

    /**
     * Get object from pool
     */
    getFromPool(poolName, initializer = null) {
        const pool = this.objectPools.get(poolName);
        if (!pool) {
            throw new Error(`Object pool ${poolName} not found`);
        }

        let obj;
        if (pool.available.length > 0) {
            obj = pool.available.pop();
            pool.stats.reused++;
        } else {
            obj = pool.factory();
            obj._poolId = `${poolName}_${pool.stats.created}`;
            pool.stats.created++;
        }

        pool.inUse.add(obj);
        obj.recycled = false;

        // Initialize if provided
        if (initializer && typeof initializer === 'function') {
            initializer(obj);
        }

        return obj;
    }

    /**
     * Return object to pool
     */
    returnToPool(poolName, obj) {
        const pool = this.objectPools.get(poolName);
        if (!pool) return;

        if (pool.inUse.has(obj)) {
            // Reset object properties
            this.resetObject(obj);

            pool.inUse.delete(obj);
            pool.available.push(obj);
            obj.recycled = true;
        }
    }

    /**
     * Reset object properties
     */
    resetObject(obj) {
        // Reset common properties
        if (obj.content !== undefined) obj.content = '';
        if (obj.metadata !== undefined) obj.metadata = {};
        if (obj.timestamp !== undefined) obj.timestamp = null;
        if (obj.id !== undefined) obj.id = null;
        if (obj.validated !== undefined) obj.validated = false;

        // Reset nested objects
        if (obj.analysis) obj.analysis = {};
        if (obj.implementation) obj.implementation = {};
        if (obj.learningPath) obj.learningPath = {};
    }

    /**
     * Start memory monitoring
     */
    startMonitoring() {
        this.monitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.updateMemoryStats();
            this.checkMemoryThresholds();
        }, 5000); // Check every 5 seconds

        console.log('📈 Memory monitoring started');
    }

    /**
     * Stop memory monitoring
     */
    stopMonitoring() {
        this.monitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('⏹️ Memory monitoring stopped');
    }

    /**
     * Update memory statistics
     */
    updateMemoryStats() {
        if (!performance.memory) return;

        const memInfo = performance.memory;
        this.memoryStats = {
            heapUsed: memInfo.usedJSHeapSize,
            heapTotal: memInfo.totalJSHeapSize,
            heapLimit: memInfo.jsHeapSizeLimit,
            external: memInfo.external || 0,
            rss: memInfo.rss || 0,
            timestamp: Date.now()
        };

        // Store in performance metrics
        this.performanceMetrics.set('memory', this.memoryStats);
    }

    /**
     * Check memory thresholds and trigger actions
     */
    checkMemoryThresholds() {
        const heapUsed = this.memoryStats.heapUsed;

        if (heapUsed > this.memoryThresholds.critical) {
            console.warn('🚨 Critical memory usage detected!');
            this.performEmergencyCleanup();
            this.notifyMemoryPressure('critical');
        } else if (heapUsed > this.memoryThresholds.warning) {
            console.warn('⚠️ High memory usage detected');
            this.performCleanup();
            this.notifyMemoryPressure('warning');
        }
    }

    /**
     * Perform emergency cleanup
     */
    performEmergencyCleanup() {
        console.log('🧹 Performing emergency cleanup...');

        // Clear all caches
        if (window.performanceCache) {
            window.performanceCache.clear();
        }

        // Clear chat memory
        if (window.enhancedChatMemory) {
            window.enhancedChatMemory.clearOldMessages(50); // Keep only last 50 messages
        }

        // Clear object pools
        this.clearObjectPools();

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        // Clear service worker cache
        if (window.serviceWorkerManager) {
            window.serviceWorkerManager.clearOldCaches();
        }
    }

    /**
     * Perform regular cleanup
     */
    performCleanup() {
        console.log('🧽 Performing regular cleanup...');

        // Clear old cache entries
        if (window.performanceCache) {
            window.performanceCache.clearExpired();
        }

        // Clean old chat messages
        if (window.enhancedChatMemory) {
            window.enhancedChatMemory.clearOldMessages(100);
        }

        // Clean object pools (remove excess objects)
        this.optimizeObjectPools();
    }

    /**
     * Clear all object pools
     */
    clearObjectPools() {
        for (const [poolName, pool] of this.objectPools) {
            pool.available.length = 0;
            pool.inUse.clear();
            console.log(`🗑️ Cleared object pool: ${poolName}`);
        }
    }

    /**
     * Optimize object pools by removing excess objects
     */
    optimizeObjectPools() {
        for (const [poolName, pool] of this.objectPools) {
            const maxPoolSize = 50; // Maximum objects per pool
            if (pool.available.length > maxPoolSize) {
                const excess = pool.available.length - maxPoolSize;
                pool.available.splice(0, excess);
                pool.stats.disposed += excess;
                console.log(`✂️ Optimized pool ${poolName}: removed ${excess} excess objects`);
            }
        }
    }

    /**
     * Setup memory pressure listener
     */
    setupMemoryPressureListener() {
        if ('memory' in performance) {
            performance.memory.addEventListener('memorypressure', (event) => {
                console.warn('🔥 Memory pressure event:', event);
                this.handleMemoryPressure(event);
            });
        }
    }

    /**
     * Handle memory pressure events
     */
    handleMemoryPressure(event) {
        const pressure = event.pressure || 'unknown';
        console.log(`💥 Memory pressure: ${pressure}`);

        if (pressure === 'critical') {
            this.performEmergencyCleanup();
        } else {
            this.performCleanup();
        }

        this.garbageCollectionStats.collections++;
        this.garbageCollectionStats.lastCollection = Date.now();
    }

    /**
     * Notify memory pressure to UI
     */
    notifyMemoryPressure(level) {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('memoryPressure', {
            detail: {
                level: level,
                stats: this.memoryStats,
                timestamp: Date.now()
            }
        }));

        // Update status bar if available
        this.updateMemoryStatusBar(level);
    }

    /**
     * Update memory status in status bar
     */
    updateMemoryStatusBar(level) {
        const statusBar = document.querySelector('.status-bar');
        if (!statusBar) return;

        let memoryIndicator = statusBar.querySelector('.memory-indicator');
        if (!memoryIndicator) {
            memoryIndicator = document.createElement('div');
            memoryIndicator.className = 'memory-indicator status-item';
            statusBar.appendChild(memoryIndicator);
        }

        const heapUsedMB = Math.round(this.memoryStats.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(this.memoryStats.heapTotal / 1024 / 1024);

        memoryIndicator.innerHTML = `
            <i class="fa-solid fa-memory"></i>
            <span class="memory-usage ${level}">${heapUsedMB}MB / ${heapTotalMB}MB</span>
        `;

        memoryIndicator.title = `Memory Usage: ${heapUsedMB}MB used of ${heapTotalMB}MB total\nStatus: ${level}`;
    }

    /**
     * Get comprehensive performance report
     */
    getPerformanceReport() {
        const report = {
            memory: this.memoryStats,
            objectPools: {},
            garbageCollection: this.garbageCollectionStats,
            monitoring: this.monitoring,
            timestamp: Date.now()
        };

        // Object pool statistics
        for (const [poolName, pool] of this.objectPools) {
            report.objectPools[poolName] = {
                available: pool.available.length,
                inUse: pool.inUse.size,
                total: pool.available.length + pool.inUse.size,
                stats: pool.stats
            };
        }

        return report;
    }

    /**
     * Export performance data for analysis
     */
    exportPerformanceData() {
        const data = {
            memoryHistory: Array.from(this.performanceMetrics.get('memory') || []),
            objectPoolStats: {},
            gcStats: this.garbageCollectionStats,
            exportTime: Date.now()
        };

        // Export object pool statistics
        for (const [poolName, pool] of this.objectPools) {
            data.objectPoolStats[poolName] = pool.stats;
        }

        return data;
    }

    /**
     * Force garbage collection (for debugging)
     */
    forceGarbageCollection() {
        if (window.gc) {
            const startTime = performance.now();
            window.gc();
            const endTime = performance.now();

            this.garbageCollectionStats.collections++;
            this.garbageCollectionStats.totalTime += (endTime - startTime);
            this.garbageCollectionStats.lastCollection = Date.now();

            console.log(`🗑️ Forced GC: ${(endTime - startTime).toFixed(2)}ms`);
            return endTime - startTime;
        } else {
            console.warn('Manual GC not available');
            return null;
        }
    }
}

// Export for global use
window.AdvancedPerformanceMonitor = AdvancedPerformanceMonitor;

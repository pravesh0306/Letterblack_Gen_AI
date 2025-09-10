/**
 * Performance Cache Module - Streamlined for CEP Extension
 * Caches AI responses and reduces redundant API calls
 */

class PerformanceCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 25; // Reduced for CEP environment
        this.defaultTimeout = 180000; // 3 minutes (reduced)
        
        this.startCleanupTimer();
        this.logger.debug('🚀 Performance Cache initialized');
    }

    /**
     * Generate cache key from input
     */
    generateKey(input) {
        if (typeof input === 'string') {
            return this.hashString(input);
        }
        return this.hashString(JSON.stringify(input));
    }

    /**
     * Simple string hashing for cache keys
     */
    hashString(str) {
        let hash = 0;
        if (str.length === 0) return hash;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Cache AI response
     */
    set(key, value, timeout = this.defaultTimeout) {
        // Clean up if at max size
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const cacheEntry = {
            value: value,
            timestamp: Date.now(),
            timeout: timeout
        };

        this.cache.set(key, cacheEntry);
        this.logger.debug(`📦 Cached response for key: ${key.substring(0, 8)}...`);
    }

    /**
     * Get cached response
     */
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.timeout) {
            this.cache.delete(key);
            this.logger.debug(`⏰ Cache expired for key: ${key.substring(0, 8)}...`);
            return null;
        }

        this.logger.debug(`✅ Cache hit for key: ${key.substring(0, 8)}...`);
        return entry.value;
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.logger.debug('🗑️ Performance cache cleared');
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            keys: Array.from(this.cache.keys()).map(k => k.substring(0, 8) + '...')
        };
    }

    /**
     * Start cleanup timer
     */
    startCleanupTimer() {
        setInterval(() => {
            const now = Date.now();
            const toDelete = [];
            
            for (const [key, entry] of this.cache.entries()) {
                if (now - entry.timestamp > entry.timeout) {
                    toDelete.push(key);
                }
            }
            
            toDelete.forEach(key => this.cache.delete(key));
            
            if (toDelete.length > 0) {
                this.logger.debug(`🧹 Cleaned up ${toDelete.length} expired cache entries`);
            }
        }, 60000); // Check every minute
    }
}

// Global performance cache instance
window.performanceCache = window.performanceCache || new PerformanceCache();

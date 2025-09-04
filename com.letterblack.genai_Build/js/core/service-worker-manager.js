/**
 * SERVICE WORKER FOR OFFLINE CACHING
 * Caches AI responses, tutorial data, and critical resources
 */

// Service Worker registration and management
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.cacheVersion = 'v1.0.0';
        this.cacheName = `ae-ai-cache-${this.cacheVersion}`;

        // Cache strategies
        this.cacheStrategies = {
            AI_RESPONSES: 'network-first', // Always try network first for AI
            TUTORIAL_DATA: 'cache-first',   // Cache tutorial data aggressively
            STATIC_ASSETS: 'cache-first',   // Cache static files
            USER_DATA: 'network-only'       // Never cache user data
        };

        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', this.registration);

                // Listen for updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Handle online/offline status
                window.addEventListener('online', () => this.handleOnlineStatus(true));
                window.addEventListener('offline', () => this.handleOnlineStatus(false));

            } catch (error) {
                console.warn('❌ Service Worker registration failed:', error);
            }
        }
    }

    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        const status = isOnline ? 'online' : 'offline';

        // Dispatch custom event for other modules
        window.dispatchEvent(new CustomEvent('networkStatusChange', {
            detail: { isOnline, status }
        }));

        console.log(`📡 Network status: ${status}`);
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <h4>🔄 Update Available</h4>
                <p>A new version is available. Refresh to update.</p>
                <div class="update-actions">
                    <button class="btn-primary" onclick="window.location.reload()">Refresh Now</button>
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.remove()">Later</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
    }

    /**
     * Cache AI response
     */
    async cacheAIResponse(key, response) {
        if (!this.isOnline) return; // Don't cache when offline

        try {
            const cache = await caches.open(this.cacheName);
            const cacheKey = `/api/ai/${key}`;

            // Store with metadata
            const responseData = {
                response: response,
                timestamp: Date.now(),
                version: this.cacheVersion
            };

            const responseBlob = new Blob([JSON.stringify(responseData)], {
                type: 'application/json'
            });

            await cache.put(cacheKey, new Response(responseBlob));
            console.log(`💾 Cached AI response: ${key}`);

        } catch (error) {
            console.warn('Failed to cache AI response:', error);
        }
    }

    /**
     * Get cached AI response
     */
    async getCachedAIResponse(key) {
        try {
            const cache = await caches.open(this.cacheName);
            const cacheKey = `/api/ai/${key}`;
            const cachedResponse = await cache.match(cacheKey);

            if (cachedResponse) {
                const data = await cachedResponse.json();

                // Check if cache is still valid (24 hours)
                const cacheAge = Date.now() - data.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours

                if (cacheAge < maxAge) {
                    console.log(`📖 Using cached AI response: ${key}`);
                    return data.response;
                } else {
                    // Remove expired cache
                    await cache.delete(cacheKey);
                }
            }
        } catch (error) {
            console.warn('Failed to get cached AI response:', error);
        }
        return null;
    }

    /**
     * Cache tutorial data
     */
    async cacheTutorialData(videoId, data) {
        try {
            const cache = await caches.open(this.cacheName);
            const cacheKey = `/tutorial/${videoId}`;

            const cacheData = {
                data: data,
                timestamp: Date.now(),
                videoId: videoId
            };

            await cache.put(cacheKey, new Response(JSON.stringify(cacheData)));
            console.log(`📚 Cached tutorial: ${videoId}`);

        } catch (error) {
            console.warn('Failed to cache tutorial data:', error);
        }
    }

    /**
     * Get cached tutorial data
     */
    async getCachedTutorialData(videoId) {
        try {
            const cache = await caches.open(this.cacheName);
            const cachedResponse = await cache.match(`/tutorial/${videoId}`);

            if (cachedResponse) {
                const data = await cachedResponse.json();
                console.log(`📖 Using cached tutorial: ${videoId}`);
                return data.data;
            }
        } catch (error) {
            console.warn('Failed to get cached tutorial data:', error);
        }
        return null;
    }

    /**
     * Preload critical resources
     */
    async preloadCriticalResources() {
        const criticalResources = [
            '/css/design-system.css',
            '/css/components/floating-mascot.css',
            '/js/core/constants.js',
            '/js/core/error-handler.js',
            '/js/ai/ai-providers.js'
        ];

        try {
            const cache = await caches.open(this.cacheName);
            await cache.addAll(criticalResources);
            console.log('⚡ Preloaded critical resources');
        } catch (error) {
            console.warn('Failed to preload critical resources:', error);
        }
    }

    /**
     * Clear old caches
     */
    async clearOldCaches() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name =>
            name.startsWith('ae-ai-cache-') && name !== this.cacheName
        );

        await Promise.all(oldCaches.map(name => caches.delete(name)));
        console.log(`🧹 Cleared ${oldCaches.length} old caches`);
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            const cache = await caches.open(this.cacheName);
            const keys = await cache.keys();

            const stats = {
                totalEntries: keys.length,
                cacheName: this.cacheName,
                isOnline: this.isOnline
            };

            // Count by type
            let aiResponses = 0;
            let tutorials = 0;
            let staticAssets = 0;

            for (const request of keys) {
                const url = request.url;
                if (url.includes('/api/ai/')) aiResponses++;
                else if (url.includes('/tutorial/')) tutorials++;
                else staticAssets++;
            }

            stats.breakdown = { aiResponses, tutorials, staticAssets };
            return stats;

        } catch (error) {
            console.warn('Failed to get cache stats:', error);
            return null;
        }
    }

    /**
     * Force refresh cache
     */
    async refreshCache() {
        await this.clearOldCaches();
        await this.preloadCriticalResources();
        console.log('🔄 Cache refreshed');
    }
}

// Export for global use
window.ServiceWorkerManager = ServiceWorkerManager;

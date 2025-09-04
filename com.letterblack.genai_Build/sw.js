/**
 * SERVICE WORKER
 * Handles caching, offline functionality, and background sync
 */

const CACHE_NAME = 'ae-ai-cache-v1.0.0';
const STATIC_CACHE = 'ae-ai-static-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/design-system.css',
    '/css/components/floating-mascot.css',
    '/js/core/constants.js',
    '/js/core/error-handler.js',
    '/js/core/input-validator.js',
    '/js/ai/ai-providers.js',
    '/js/ai/ai-module.js',
    '/assets/ae-mascot-animated.gif',
    '/assets/ae-mascot.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/ai/',
    '/api/tutorial/',
    '/api/project/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker installing...');

    event.waitUntil(
        (async () => {
            const cache = await caches.open(STATIC_CACHE);
            await cache.addAll(STATIC_ASSETS);
            console.log('✅ Static assets cached');

            // Skip waiting to activate immediately
            self.skipWaiting();
        })()
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('🎯 Service Worker activating...');

    event.waitUntil(
        (async () => {
            // Clean old caches
            const cacheNames = await caches.keys();
            const oldCaches = cacheNames.filter(name =>
                name !== CACHE_NAME && name !== STATIC_CACHE
            );

            await Promise.all(oldCaches.map(name => caches.delete(name)));
            console.log(`🧹 Cleaned ${oldCaches.length} old caches`);

            // Take control of all clients
            await self.clients.claim();
        })()
    );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle different types of requests
    if (request.method === 'GET') {
        if (isStaticAsset(url)) {
            event.respondWith(handleStaticAsset(request));
        } else if (isAPIRequest(url)) {
            event.respondWith(handleAPIRequest(request));
        } else if (isTutorialRequest(url)) {
            event.respondWith(handleTutorialRequest(request));
        } else {
            event.respondWith(handleDefaultRequest(request));
        }
    }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);

    if (event.tag === 'ai-response-sync') {
        event.waitUntil(syncPendingAIResponses());
    } else if (event.tag === 'tutorial-data-sync') {
        event.waitUntil(syncPendingTutorialData());
    }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/ae-mascot.png',
            badge: '/assets/ae-mascot.png',
            vibrate: [100, 50, 100],
            data: data.data
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Helper functions
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
           url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

function isAPIRequest(url) {
    return API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isTutorialRequest(url) {
    return url.pathname.includes('/tutorial/') ||
           url.pathname.includes('youtube.com') ||
           url.pathname.includes('youtu.be');
}

async function handleStaticAsset(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('Static asset fetch failed:', error);
        return new Response('Offline - Asset not available', { status: 503 });
    }
}

async function handleAPIRequest(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        // Try network first for AI responses
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful responses
            const responseClone = networkResponse.clone();
            const responseData = await responseClone.json();

            const cacheData = {
                data: responseData,
                timestamp: Date.now(),
                url: request.url
            };

            cache.put(request, new Response(JSON.stringify(cacheData)));
            return networkResponse;
        }
    } catch (error) {
        console.warn('API request failed, trying cache:', error);
    }

    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        const cacheData = await cachedResponse.json();

        // Check if cache is still fresh (1 hour for API responses)
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < 60 * 60 * 1000) {
            return new Response(JSON.stringify(cacheData.data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response(JSON.stringify({
        error: 'Offline - API not available',
        offline: true
    }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleTutorialRequest(request) {
    const cache = await caches.open(CACHE_NAME);

    // Try cache first for tutorial data
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        const cacheData = await cachedResponse.json();

        // Tutorial data is valid for 24 hours
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) {
            return new Response(JSON.stringify(cacheData.data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            const responseData = await responseClone.json();

            const cacheData = {
                data: responseData,
                timestamp: Date.now(),
                url: request.url
            };

            cache.put(request, new Response(JSON.stringify(cacheData)));
        }
        return networkResponse;
    } catch (error) {
        console.warn('Tutorial request failed:', error);
        return new Response(JSON.stringify({
            error: 'Offline - Tutorial data not available',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleDefaultRequest(request) {
    // Network-first strategy for other requests
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        // Try cache as fallback
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response('Offline - Content not available', { status: 503 });
    }
}

async function syncPendingAIResponses() {
    console.log('🔄 Syncing pending AI responses...');

    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();

        const pendingRequests = keys.filter(request =>
            request.url.includes('/api/ai/') &&
            !request.url.includes('synced')
        );

        for (const request of pendingRequests) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    // Mark as synced by updating URL
                    const syncedRequest = new Request(
                        request.url + '?synced=true',
                        request
                    );
                    await cache.put(syncedRequest, response);
                    await cache.delete(request);
                }
            } catch (error) {
                console.warn('Failed to sync AI response:', error);
            }
        }

        console.log(`✅ Synced ${pendingRequests.length} AI responses`);
    } catch (error) {
        console.error('AI response sync failed:', error);
    }
}

async function syncPendingTutorialData() {
    console.log('🔄 Syncing pending tutorial data...');

    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();

        const pendingTutorials = keys.filter(request =>
            request.url.includes('/tutorial/') &&
            !request.url.includes('synced')
        );

        for (const request of pendingTutorials) {
            try {
                const response = await fetch(request);
                if (response.ok) {
                    const syncedRequest = new Request(
                        request.url + '?synced=true',
                        request
                    );
                    await cache.put(syncedRequest, response);
                    await cache.delete(request);
                }
            } catch (error) {
                console.warn('Failed to sync tutorial data:', error);
            }
        }

        console.log(`✅ Synced ${pendingTutorials.length} tutorial items`);
    } catch (error) {
        console.error('Tutorial data sync failed:', error);
    }
}

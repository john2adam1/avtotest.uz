const CACHE_NAME = 'sarvar-avtotest-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/images/logo.jpg',
];

// Install event – cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event – remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event – network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and browser-sync/hot-reload requests
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('_next/webpack-hmr')) return;
    if (event.request.url.includes('__nextjs')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses for navigation requests
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fall back to cache when offline
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    // Return cached home page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});

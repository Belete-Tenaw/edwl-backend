const CACHE_NAME = 'edwl-cache-v4'; // Incremented version
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => caches.delete(key)) // Clear everything on update for reliability
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. SKIP non-http/https (fixes chrome-extension error)
    if (!request.url.startsWith('http')) return;

    // 2. Network-First for API
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Only cache successful GET responses
                    if (response.ok && request.method === 'GET') {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // 3. Stale-While-Revalidate for everything else
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            const fetchPromise = fetch(request).then(networkResponse => {
                // IMPORTANT: Only cache OK responses to prevent 404s/HTML being stored as JS
                if (networkResponse.ok && request.method === 'GET') {
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                }
                return networkResponse;
            }).catch(() => null);

            return cachedResponse || fetchPromise;
        })
    );
});

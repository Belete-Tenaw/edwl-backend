const CACHE_NAME = 'edwl-v1.3.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/edwl_logo.png', // Main brand asset
  '/apple-touch-icon.png',
  '/icons/pwa/edwl-logo-192.png',
  '/icons/pwa/edwl-logo-512.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[EDWL SW] Caching world-class assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[EDWL SW] Purging obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Optimized Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip POST/PUT and API calls to avoid state desync
  if (request.method !== 'GET' || url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return from cache if available for performance
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Dynamically cache fonts and images for smooth UX
        if (
          networkResponse.ok && 
          (request.destination === 'image' || request.destination === 'font')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback for navigation failures
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

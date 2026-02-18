const CACHE_NAME = 'schedly-v1';
const RUNTIME_CACHE = 'schedly-runtime-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, try to get from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, return offline page
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Handle other requests (assets, API, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for images
          if (request.destination === 'image') {
            return caches.match('/icon-192x192.png');
          }
          return new Response('Offline', { status: 503 });
        })
    )
  );
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  // Implement background sync logic here if needed
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  // Implement push notification logic here if needed
});


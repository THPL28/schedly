try {
  const CACHE_NAME = 'schedly-v2';
  const RUNTIME_CACHE = 'schedly-runtime-v2';
  const OFFLINE_URL = '/offline';

  // Static assets to precache
  const STATIC_ASSETS = [
    '/',
    '/offline',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/logo.svg',
  ];

  /* ---- Simple IndexedDB queue helper (used for offline appointment queue) ---- */
  function openQueueDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('schedly-sw', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('appointment-queue')) {
          db.createObjectStore('appointment-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function addToQueue(item) {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('appointment-queue', 'readwrite');
      const store = tx.objectStore('appointment-queue');
      store.add({ payload: item, timestamp: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAllQueued() {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('appointment-queue', 'readonly');
      const store = tx.objectStore('appointment-queue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteQueued(id) {
    const db = await openQueueDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('appointment-queue', 'readwrite');
      const store = tx.objectStore('appointment-queue');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ---- SW lifecycle: install / activate ---- */
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME && n !== RUNTIME_CACHE)
            .map((n) => caches.delete(n))
        )
      )
    );
    return self.clients.claim();
  });

  /* ---- Message handler (queue items, skip waiting, ping) ---- */
  self.addEventListener('message', (event) => {
    try {
      const msg = event.data || {};
      if (msg.type === 'QUEUE_APPOINTMENT') {
        // payload should be a plain object with appointment data
        event.waitUntil(
          (async () => {
            await addToQueue(msg.payload);
            // ensure a sync is scheduled (best-effort)
            try {
              await self.registration.sync.register('sync-appointments');
            } catch (err) {
              // periodic sync or immediate attempt if background sync unsupported
              console.warn('[SW] sync.register failed:', err);
            }
            const clients = await self.clients.matchAll();
            clients.forEach((c) => c.postMessage({ type: 'QUEUE_STORED' }));
          })()
        );
      }

      if (msg.type === 'SKIP_WAITING') {
        self.skipWaiting();
      }
    } catch (e) {
      console.error('SW message handler error', e);
    }
  });

  /* ---- Background sync: attempt to flush queued appointments ---- */
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-appointments') {
      event.waitUntil(
        (async () => {
          const queued = await getAllQueued();
          for (const row of queued) {
            try {
              const res = await fetch('/api/offline/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(row.payload),
              });
              if (res.ok) {
                await deleteQueued(row.id);
                const clients = await self.clients.matchAll();
                clients.forEach((c) => c.postMessage({ type: 'QUEUE_SENT', id: row.id }));
              }
            } catch (err) {
              console.warn('[SW] Failed to send queued item, will retry later', err);
              // keep in queue for next sync attempt
            }
          }
        })()
      );
    }
  });

  /* ---- Push notifications & notification click ---- */
  self.addEventListener('push', (event) => {
    let data = { title: 'Schedly', body: 'Você tem uma notificação' };
    try {
      if (event.data) data = event.data.json();
    } catch (err) {
      try { data = { title: 'Schedly', body: event.data.text() }; } catch (e) { /* ignore */ }
    }

    const title = data.title || 'Schedly';
    const options = Object.assign({ icon: '/icon-192x192.png', badge: '/icon-192x192.png' }, data.options || {}, { data: data.data || {} });
    event.waitUntil(self.registration.showNotification(title, options));
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification?.data?.url || '/dashboard';
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
        const hadWindow = clientsArr.some((c) => c.url === url && 'focus' in c && (c as WindowClient).focus());
        if (!hadWindow && self.clients.openWindow) self.clients.openWindow(url);
      })
    );
  });

  /* ---- Fetch handling: navigation network-first, assets & API stale-while-revalidate ---- */
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin GET requests
    if (request.method !== 'GET' || url.origin !== location.origin) return;

    // Navigation requests -> network-first with offline fallback
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
            return res;
          })
          .catch(async () => {
            const cached = await caches.match(request);
            return cached || caches.match(OFFLINE_URL);
          })
      );
      return;
    }

    // API requests: stale-while-revalidate (return cache immediately if present, update in background)
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(request);
          const networkPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) cache.put(request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => null);
          return cached || (await networkPromise) || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        })()
      );
      return;
    }

    // For other assets: cache-first then network
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
        }
        return resp;
      }).catch(() => {
        if (request.destination === 'image') return caches.match('/icon-192x192.png');
        return new Response('Offline', { status: 503 });
      }))
    );
  });

  /* ---- Periodic sync placeholder (best-effort) ---- */
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'periodic-availability') {
      event.waitUntil(
        (async () => {
          // Could fetch /api/calendar or similar to refresh runtime cache
          try {
            const res = await fetch('/api/calendar');
            if (res && res.ok) {
              const cache = await caches.open(RUNTIME_CACHE);
              cache.put('/api/calendar', res.clone());
            }
          } catch (e) {
            // ignore
          }
        })()
      );
    }
  });

  /* ---- Fallback message to clients on activation (notify of update) ---- */
  self.addEventListener('controllerchange', () => {
    self.clients.matchAll().then((clients) => clients.forEach((c) => c.postMessage({ type: 'SW_CONTROLLER_CHANGE' })));
  });

} catch (err) {
  // If the SW script throws during evaluation, surface the error to any controlled clients (best-effort)
  try {
    // log to console in SW context
    console.error('[SW] top-level error during evaluation', err);
    self.addEventListener('install', (evt) => evt.waitUntil(self.skipWaiting()));
    self.addEventListener('activate', (evt) => evt.waitUntil(self.clients.claim()));
    self.clients && self.clients.matchAll && self.clients.matchAll().then((clients) => {
      clients.forEach((c) => {
        try { c.postMessage({ type: 'SW_EVAL_ERROR', message: String(err) }) } catch (_) { /* ignore */ }
      })
    }).catch(() => { })
  } catch (e) {
    /* ignore */
  }
}



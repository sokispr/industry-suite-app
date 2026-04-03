const CACHE_NAME = 'industry-control-v2';

const appAssets = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/calendar.css',
  '/css/modals.css',
  '/js/app.js',
  '/js/api.js',
  '/js/state.js',
  '/js/render.js',
  '/js/utils.js',
  '/js/events.js',
  '/js/crew.js',
  '/js/roles.js',
  '/js/inventory.js',
  '/js/inventory-categories.js',
  '/js/role-categories.js'
];

const vendorAssets = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.17/index.global.min.js',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap'
];

self.addEventListener('install', (installEvent) => {
  installEvent.waitUntil(
    (async () => {
      const cacheInstance = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Pre-caching core application resources');
      const urls = appAssets.concat(vendorAssets);
      return cacheInstance.addAll(urls);
    })()
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    // Don't cache API calls
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }

        return fetch(event.request).then(
          networkResponse => {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse; // Serve from network
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!cacheWhitelist.includes(cacheName)) {
          return caches.delete(cacheName);
        }
      })
    ))
  );
});

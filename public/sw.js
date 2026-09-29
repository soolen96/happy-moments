const CACHE_NAME = 'happy-moments-pwa-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.webp',
  '/favicon.ico',
  '/assets/configuration.json',
  '/assets/logo-candy-jar.webp',
  '/assets/logo-candy-jar-dark.webp',
  '/assets/mascot-eating-gummy.webp',
  '/assets/mascot-cart.webp',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/icon-maskable-192x192.png',
  '/assets/icons/icon-maskable-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/cart.svg',
  '/assets/icons/sparkles.svg',
  '/assets/icons/candy.svg',
  '/assets/icons/gift.svg',
  '/assets/icons/phone.svg',
  '/assets/icons/sun.svg',
  '/assets/icons/moon.svg',
  '/assets/icons/whatsapp.svg',
  '/assets/icons/leaf.svg',
  '/assets/icons/download.svg',
  '/assets/icons/smartphone.svg',
  '/assets/icons/plus.svg',
  '/assets/icons/check.svg',
  '/assets/icons/star.svg',
  '/assets/icons/scooter.svg',
  '/assets/icons/box.svg',
  '/assets/icons/fire.svg'
];

// Install Event: Precaches core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll with individual catch to avoid complete failure if one file is missing
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[PWA SW] Precache failed for ${url}:`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[PWA SW] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests and http/https protocols
  if (req.method !== 'GET' || !req.url.startsWith('http')) {
    return;
  }

  const url = new URL(req.url);

  // 1. Navigation requests (HTML): Network first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return caches.match('/');
          });
        })
    );
    return;
  }

  // 2. Static Assets (images, fonts, scripts, css, configuration): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and not in cache, let it fail gracefully
          return null;
        });

      // Return cached version immediately if found, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event: Allow web clients to trigger skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

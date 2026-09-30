/* ============================================================
   Artima Edu — sw.js (Service Worker)
   High-performance offline caching, PWA support, & fallback
   ============================================================ */

const CACHE_NAME = 'artimaedu-v1.0.4';

// Compute base path dynamically from service worker location
const BASE_PATH = self.location.pathname.substring(
  0,
  self.location.pathname.lastIndexOf('/') + 1
);

const PRECACHE_ASSETS = [
  // Core pages
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'program.html',
  BASE_PATH + 'parenthood.html',
  BASE_PATH + 'profile.html',
  BASE_PATH + 'merchandise.html',
  BASE_PATH + 'mini-games.html',
  BASE_PATH + 'artimaedu-games-app.html',
  BASE_PATH + 'more-services.html',
  BASE_PATH + 'blogs.html',
  BASE_PATH + 'blog-5-alasan-coding.html',
  BASE_PATH + 'blog-english-broom-room.html',
  BASE_PATH + 'blog-visual-block-coding.html',
  BASE_PATH + 'product.html',
  BASE_PATH + 'service-building-portfolio.html',
  BASE_PATH + 'service-building-website.html',
  BASE_PATH + 'privacy-policy.html',
  BASE_PATH + '404.html',
  BASE_PATH + 'offline.html',

  // Stylesheets
  BASE_PATH + 'assets/css/base.css',
  BASE_PATH + 'assets/css/base.css?v=20260930b',
  BASE_PATH + 'assets/css/components.css',
  BASE_PATH + 'assets/css/components.css?v=20260930b',
  BASE_PATH + 'assets/css/components.css?v=20260930c',
  BASE_PATH + 'assets/css/components.css?v=20260930d',
  BASE_PATH + 'assets/css/components.css?v=20260930e',
  BASE_PATH + 'assets/css/responsive.css',
  BASE_PATH + 'assets/css/mini-games.css',

  // Scripts & Data
  BASE_PATH + 'assets/js/pwa.js',
  BASE_PATH + 'assets/js/i18n.js',
  BASE_PATH + 'assets/js/content.json',
  BASE_PATH + 'assets/js/scroll.js',
  BASE_PATH + 'assets/js/whatsapp.js',
  BASE_PATH + 'assets/js/products.js',
  BASE_PATH + 'assets/js/products.json',
  BASE_PATH + 'assets/js/mini-games.js',

  // Brand & Essential Assets
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'assets/img/logo_artima_edu.png',
  BASE_PATH + 'assets/img/favicon.png',
  BASE_PATH + 'assets/img/mascots/ar_and_ima_hai.png',
  BASE_PATH + 'assets/img/Google_Play-Logo.wine.svg'
];

/* Install Event: Cache all critical assets safely */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map to avoid single failure aborting entire precache
      return Promise.all(
        PRECACHE_ASSETS.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[Artima SW] Could not precache:', url, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

/* Activate Event: Clean up previous caches & take control immediately */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Artima SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* Helper: Fetch with timeout */
function fetchWithTimeout(request, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Network timeout'));
    }, timeoutMs);

    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/* Fetch Event: Network-first for navigation, Stale-While-Revalidate for static */
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or browser extension requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // 1. Navigation requests (HTML pages)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetchWithTimeout(request, 3000)
        .then(async (networkResponse) => {
          // If network succeeded with 200, cache and return
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return networkResponse;
          }
          // If 404, serve cached 404 page
          if (networkResponse && networkResponse.status === 404) {
            const cached404 = await caches.match(BASE_PATH + '404.html');
            if (cached404) return cached404;
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed (offline or slow): look in cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Try fallback without query string or trailing slash
          const cleanUrl = url.origin + url.pathname;
          const cleanCached = await caches.match(cleanUrl);
          if (cleanCached) {
            return cleanCached;
          }

          // If requesting root or index, try index.html
          if (url.pathname === '/' || url.pathname.endsWith('/')) {
            const indexCached = await caches.match(BASE_PATH + 'index.html');
            if (indexCached) return indexCached;
          }

          // Finally fallback to offline.html
          const offlineCached = await caches.match(BASE_PATH + 'offline.html');
          if (offlineCached) {
            return offlineCached;
          }

          return new Response('Offline — Halaman belum tersedia di memori perangkat.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Google Fonts runtime caching
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        }).catch(() => caches.match(request));
      })
    );
    return;
  }

  // 3. Static assets (CSS, JS, Images, JSON) - Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Fetch in background to update cache
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Ignore background fetch error when offline
          return null;
        });

      // Return cached immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

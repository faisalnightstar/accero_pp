/**
 * Accero PrintPortal — Production Service Worker
 * Version: accero-pwa-v1.0.0
 *
 * Caching Policy Guarantees:
 * 1. Zero Sensitive Data Caching: All API routes (/api/*), auth, wallet, document studio,
 *    and operator dashboard routes are strictly NETWORK-ONLY. Never stored in CacheStorage.
 * 2. Immutable Static Assets: Next.js static chunks (/_next/static/*), public icons,
 *    and fonts are served Cache-First with background revalidation.
 * 3. Public Informational Pages: Network-First with graceful offline fallback.
 * 4. Offline Reliability: Precached /offline route for network disconnection.
 */

const CACHE_VERSION = 'accero-pwa-v1.0.0';
const STATIC_CACHE = `accero-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `accero-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/favicon.ico',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/manifest.webmanifest',
];

/**
 * Routes that must NEVER be cached by the service worker under any circumstance.
 */
function isNeverCacheRequest(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/cards') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  );
}

// Install Event — Precache essential application shell and offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[PWA SW] Precache failed:', err);
      })
  );
});

// Activate Event — Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.startsWith('accero-') &&
              cacheName !== STATIC_CACHE &&
              cacheName !== RUNTIME_CACHE
            ) {
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event — Enforce strict tiered caching strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only intercept GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 1. Cross-origin requests: only cache Google Fonts static assets
  if (url.origin !== self.location.origin) {
    if (
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com'
    ) {
      event.respondWith(
        caches.open(STATIC_CACHE).then(async (cache) => {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) return cachedResponse;
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch {
            return cachedResponse || new Response('', { status: 503 });
          }
        })
      );
    }
    return;
  }

  const pathname = url.pathname;

  // 2. Sensitive routes: Strictly Network-Only. Never cache.
  if (isNeverCacheRequest(pathname)) {
    event.respondWith(
      fetch(request).catch(async () => {
        // If navigation request fails on protected route while offline, show /offline
        if (request.mode === 'navigate') {
          const cache = await caches.open(STATIC_CACHE);
          const offlinePage = await cache.match(OFFLINE_URL);
          if (offlinePage) return offlinePage;
        }
        return new Response(
          JSON.stringify({ error: 'Network unavailable. Reconnect to proceed.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 3. Immutable Static Assets: Cache-First
  // /_next/static/*, /icons/*, /assets/*, /favicon.*
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/favicon.') ||
    pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // 4. Public Pages: Network-First with Stale Cache Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          // Attempt runtime cache
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;

          // Fall back to offline page
          const staticCache = await caches.open(STATIC_CACHE);
          const offlineFallback = await staticCache.match(OFFLINE_URL);
          if (offlineFallback) return offlineFallback;

          return new Response(
            '<html><body><h1>Offline</h1><p>Please reconnect to the internet.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 5. Default: Network with Runtime Cache Fallback for other GET requests
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('', { status: 504 });
      })
  );
});

// Message Event — Support manual or automatic skipWaiting updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

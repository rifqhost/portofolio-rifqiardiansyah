// Service Worker - offline app-shell with network-first navigations.
// Never serves the SPA HTML for asset requests (scripts/css/images), so a
// stale cache or a missing file can't break module loading with a text/html MIME.
const CACHE_NAME = 'rifqi-portfolio-v3'
const SHELL = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .catch(() => {}),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return
  if (request.url.includes('/api/') || request.url.includes('/admin')) return

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)

      // Navigations: network-first so the latest deploy is always served.
      // Fall back to the cached shell only when offline.
      if (request.mode === 'navigate') {
        try {
          const fresh = await fetch(request)
          if (fresh.ok) {
            cache.put(request, fresh.clone()).catch(() => {})
            return fresh
          }
        } catch {
          // offline: fall through to cached shell
        }
        const shell = await cache.match('/')
        return shell || Response.error()
      }

      // Same-origin assets: cache-first. Never fall back to the SPA HTML
      // (that would break module scripts/images with a text/html MIME type).
      const cached = await cache.match(request)
      if (cached) return cached
      try {
        const response = await fetch(request)
        if (response.ok) {
          const type = response.headers.get('content-type') || ''
          if (!type.includes('text/html')) {
            cache.put(request, response.clone()).catch(() => {})
          }
        }
        return response
      } catch {
        return Response.error()
      }
    })(),
  )
})

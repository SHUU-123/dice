const CACHE_NAME = 'sw25-dice-cache-v1';
const OFFLINE_FILES = [
  '.',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })
    ))
  );
  self.clients.claim();
});

// Fetch — cache-first for app shell, network-first for others with fallback
self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Only handle GET
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkResp => {
        // Optionally cache for offline later if same-origin
        if (req.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, networkResp.clone()));
        }
        return networkResp;
      }).catch(()=> {
        // Fallback to index.html for navigation requests (SPA)
        if (req.mode === 'navigate') return caches.match('.');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});

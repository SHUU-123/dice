const CACHE_NAME = 'sw25-cache-v1';
const ASSETS = [
  '.',
  './index.html',
  './manifest.json',
  './icons/dice-icon-192.png',
  './icons/dice-icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // まずキャッシュを返し、なければネットワークへ
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(()=>cached))
  );
});

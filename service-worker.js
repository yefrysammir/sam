const CACHE_NAME = 'mymmo-cache-v1';
const FILES = [
  '/game/index.html',
  '/game/manifest.json',
  '/game/style.css'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', ev => {
  ev.waitUntil(clients.claim());
});

self.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request).then(res => res || fetch(ev.request))
  );
});
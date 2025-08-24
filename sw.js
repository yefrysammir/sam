const CACHE = "perfil-cache-v1";
const ASSETS = [
  "index.html",
  "style.css",
  "script.js",
  "data.json",
  "manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE ? caches.delete(k) : null))));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.endsWith("data.json")) {
    e.respondWith(fetch(e.request).then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(()=> caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
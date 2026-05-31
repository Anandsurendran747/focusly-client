// public/sw.js
const CACHE_NAME = "app-v1";
const urlsToCache = ["/", "/index.html", "/static/js/main.chunk.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
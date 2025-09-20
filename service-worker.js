const CACHE_NAME = 'aksharachitra-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/image.css',     // Confirm these filenames exist or update accordingly
  '/image.js',      // Confirm these filenames exist or update accordingly
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Fetch event - respond from cache, or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

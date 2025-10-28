const CACHE = 'aksharachitra-v4';
const FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/pwa.js',
  '/manifest.json',
  '/logo.png',
  
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(clients.claim());
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => {
      return res || fetch(evt.request).then(fetchRes => {
        // cache fetched resources (optional)
        return fetchRes;
      });
    }).catch(()=> caches.match('/index.html'))
  );
});

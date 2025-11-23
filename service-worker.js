const CACHE = "aksharachitra-v5.1";
const OFFLINE_FALLBACK = "/index.html";

// -----------------------------------------------------------
// 📌 STATIC FILES — MUST WORK OFFLINE
// -----------------------------------------------------------
const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/main.js",
  "/createsection.js",
  "/pwa.js",
  "/ai/browserAI.js",
  "/ai/imageEnhancement.js",
  "/JS/homesection.js",
  "/logo.png",
 "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-48x48.png",
  "/icons/icon-512x512.png",
  "/icons/Astudio logo.png" ,

  // LOCAL FONTS
  "/fonts/Veturi.ttf",
  "/fonts/Sirivennela.ttf",
  "/fonts/RamaneeyaWin.ttf",
  "/fonts/Ramaraja-Regular.ttf",
  "/fonts/RaviPrakash.ttf",
  "/fonts/TenaliRamakrishna-Regular.ttf",
  "/fonts/TANA.ttf",
  "/fonts/TimmanaRegular.ttf"
];

// -----------------------------------------------------------
// 🛠️ INSTALL — CACHE LOCAL FILES
// -----------------------------------------------------------
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// -----------------------------------------------------------
// 🔄 ACTIVATE — DELETE OLD CACHES
// -----------------------------------------------------------
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// -----------------------------------------------------------
// ⚡ FETCH — OFFLINE-FIRST FOR LOCAL, SMART RUNTIME FOR CDN
// -----------------------------------------------------------
self.addEventListener("fetch", (evt) => {
  const req = evt.request;
  const url = new URL(req.url);

  // 1️⃣ LOCAL FILES → CACHE FIRST
  if (url.origin === location.origin) {
    evt.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).catch(() => caches.match(OFFLINE_FALLBACK))
        );
      })
    );
    return;
  }

  // 2️⃣ CDN (CropperJS, html2canvas, QRCodeJS, Google Fonts)
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("cdnjs.cloudflare.com")
  ) {
    evt.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 3️⃣ Default
  evt.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
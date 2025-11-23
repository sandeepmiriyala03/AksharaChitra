const CACHE = "aksharachitra-v5.1";
const OFFLINE_FALLBACK = "/index.html";

// -----------------------------------------------------------
// 📌 STATIC FILES (Precache — must be available offline)
// -----------------------------------------------------------
const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/home.css",
  "/main.js",
  "/createsection.js",
  "/pwa.js",
  "/ai/browserAI.js",
  "/ai/boatai.js",
  "/ai/imageEnhancement.js",
  "/JS/homesection.js",

  "/logo.png",

  // Icons
  "/icons/icon-48x48.png",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-180.png",
  "/icons/icon-192.png",
  "/icons/icon-192x192.png",
  "/icons/icon-256x256.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512.png",
  "/icons/icon-512x512.png",
  "/icons/Astudio logo.png",

  // Local Fonts
  "/fonts/Veturi.ttf",
  "/fonts/Sirivennela.ttf",
  "/fonts/RamaneeyaWin.ttf",
  "/fonts/Ramaraja-Regular.ttf",
  "/fonts/RaviPrakash.ttf",
  "/fonts/TenaliRamakrishna-Regular.ttf",
  "/fonts/TANA.ttf",
  "/fonts/TimmanaRegular.ttf",

  "/videos/english.mp4",
    "/videos/telugu.mp4",

];

// -----------------------------------------------------------
// 🛠️ INSTALL — Cache Required Files
// -----------------------------------------------------------
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// -----------------------------------------------------------
// 🔄 ACTIVATE — Cleanup Old Caches
// -----------------------------------------------------------
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// -----------------------------------------------------------
// ⚡ FETCH HANDLER — Offline-first + Cache CDN
// -----------------------------------------------------------
self.addEventListener("fetch", (evt) => {
  const req = evt.request;
  const url = new URL(req.url);

  // --------------------------------------------
  // 1️⃣ Handle CDN files (cache for offline use)
  // --------------------------------------------
  if (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("cdnjs.cloudflare.com") ||
    url.hostname.includes("unpkg.com")
  ) {
    evt.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // --------------------------------------------
  // 2️⃣ Local files — FULL offline-first logic
  // --------------------------------------------
  evt.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          caches.open(CACHE).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(OFFLINE_FALLBACK));
    })
  );
});

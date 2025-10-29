/* ==========================================================
   🌸 AksharaChitra v2.0 — Progressive Web App (pwa.js)
   ========================================================== */

// ---- 1️⃣ Register the Service Worker ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('service-worker.js')
      .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
      .catch(err => console.warn('[PWA] SW registration failed:', err));
  });
} else {
  console.warn('[PWA] Service workers not supported in this browser.');
}

// ---- 2️⃣ Handle Install Prompt ----
let deferredPrompt; // event stored for later trigger
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent automatic mini-infobar
  event.preventDefault();
  deferredPrompt = event;

  // Show the install button
  if (installBtn) installBtn.classList.remove('hidden');
  console.log('[PWA] Install prompt ready');
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('📲 App install not available yet. Please refresh or open in Chrome.');
      return;
    }

    // Show prompt
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install');
      installBtn.classList.add('hidden');
    } else {
      console.log('[PWA] User dismissed install');
    }

    deferredPrompt = null;
  });
}

// ---- 3️⃣ Hide button when installed ----
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully ✅');
  if (installBtn) installBtn.classList.add('hidden');

  // Optional: show thank-you toast
  showInstallToast('🎉 AksharaChitra installed successfully! You can now use it offline.');
});

// ---- 4️⃣ Optional: Detect if already installed ----
if (window.matchMedia('(display-mode: standalone)').matches) {
  if (installBtn) installBtn.classList.add('hidden');
  console.log('[PWA] App running in standalone mode');
}

// ---- 5️⃣ Small helper: install success toast ----
function showInstallToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#3949ab';
  toast.style.color = '#fff';
  toast.style.padding = '10px 18px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)';
  toast.style.zIndex = '10000';
  toast.style.fontWeight = '600';
  toast.style.transition = 'opacity 0.5s ease';
  document.body.appendChild(toast);

  setTimeout(() => (toast.style.opacity = '0'), 2500);
  setTimeout(() => toast.remove(), 3200);
}

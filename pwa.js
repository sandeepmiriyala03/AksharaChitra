/* ==========================================================
   🌸 AksharaChitra v2.6 — Progressive Web App (pwa.js)
   Full PWA Handling • Multi-button Support • Toast Feedback
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

// ---- 2️⃣ Handle Install Prompt (for both buttons) ----
let deferredPrompt = null;
const installBtns = [
  document.getElementById('installBtn'),
  document.getElementById('installBtnHeader')
].filter(Boolean);

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;

  // Show install buttons
  installBtns.forEach(btn => btn.classList.add('show'));
  console.log('[PWA] Install prompt captured and ready');
});

installBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!deferredPrompt) {
      alert('📲 App install not available yet. Please refresh or open in Chrome.');
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install');
      showInstallToast('🎉 AksharaChitra installed successfully!');
    } else {
      console.log('[PWA] User dismissed install');
    }

    // Hide buttons post prompt
    installBtns.forEach(b => b.classList.remove('show'));
    deferredPrompt = null;
  });
});

// ---- 3️⃣ When installed ----
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully ✅');
  installBtns.forEach(b => b.classList.remove('show'));
  showInstallToast('✅ AksharaChitra installed! Use it offline anytime.');
});

// ---- 4️⃣ If running standalone (already installed) ----
if (window.matchMedia('(display-mode: standalone)').matches) {
  installBtns.forEach(b => b.classList.remove('show'));
  console.log('[PWA] App running in standalone mode');
}

// ---- 5️⃣ Optional iOS Safari Detection ----
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
if (isIOS() && !window.matchMedia('(display-mode: standalone)').matches) {
  showInstallToast('📲 On iPhone/iPad: Tap “Share” → “Add to Home Screen” to install.');
}

// ---- 6️⃣ Helper: Toast Notification ----
function showInstallToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1e88e5',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
    zIndex: '10000',
    fontWeight: '600',
    transition: 'opacity 0.5s ease',
  });
  document.body.appendChild(toast);

  setTimeout(() => (toast.style.opacity = '0'), 2500);
  setTimeout(() => toast.remove(), 3200);
}

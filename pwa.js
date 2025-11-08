/* ==========================================================
   🌸 AksharaChitra v3.4 — Progressive Web App (pwa.js)
   ----------------------------------------------------------
   ✅ Service Worker
   ✅ Install Buttons (Header + FAB)
   ✅ Reliable Deferred Prompt Handling
   ✅ Spinner Overlay on Load
   ✅ Toasts + iOS Add-to-Home
   ✅ Mobile-Safe Fallback (5s)
   ========================================================== */

// ---- 1️⃣ Loading Spinner Overlay ----
const spinner = document.createElement("div");
Object.assign(spinner.style, {
  position: "fixed",
  inset: 0,
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: "9999",
  transition: "opacity 0.7s ease",
});
spinner.innerHTML = `
  <div style="
    display:flex;flex-direction:column;align-items:center;
    font-family:Montserrat, sans-serif;color:#1565c0;
    font-weight:600;font-size:1.1rem;
  ">
    <div style="
      width:42px;height:42px;
      border:4px solid #bbdefb;
      border-top-color:#1565c0;
      border-radius:50%;
      animation:spin 1s linear infinite;
      margin-bottom:10px;
    "></div>
    Loading AksharaChitra...
  </div>
  <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
`;
document.body.appendChild(spinner);
window.addEventListener("load", () => {
  setTimeout(() => {
    spinner.style.opacity = "0";
    setTimeout(() => spinner.remove(), 800);
  }, 500); // fade out half second after window load
});

// ---- 2️⃣ Register Service Worker ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("[PWA] SW registered:", reg.scope))
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  });
}

// ---- 3️⃣ Install Buttons Setup ----
let deferredPrompt = null;
const installBtns = [
  document.getElementById("installBtn"),
  document.getElementById("installBtnHeader"),
].filter(Boolean);
installBtns.forEach((btn) => {
  btn.style.display = "none";
  btn.disabled = true;
});

// ---- 4️⃣ Capture beforeinstallprompt ----
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.__akInstallPromptReady = true;
  console.log("[PWA] Install prompt ready ✅");

  installBtns.forEach((btn) => {
    btn.style.display = "flex";
    btn.classList.add("show", "pulse");
    btn.disabled = false;
  });
  showInstallToast("📲 App ready to install! Tap the icon below.");
});

// ---- 5️⃣ Button Click Handler ----
installBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (btn.disabled) return; // prevent spam clicks

    if (!deferredPrompt && !window.__akInstallPromptReady) {
      showInstallToast("⏳ Preparing install prompt... please wait");
      return;
    }

    if (!deferredPrompt) {
      showInstallToast("⚠️ Install not available yet. Try again soon.");
      return;
    }

    btn.innerHTML = "⏳ Installing...";
    btn.disabled = true;

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showInstallToast("🎉 AksharaChitra installed successfully!");
        console.log("[PWA] Installed ✅");
      } else {
        showInstallToast("❌ Install canceled.");
      }
    } catch (err) {
      console.warn("[PWA] Install prompt failed:", err);
      showInstallToast("⚠️ Could not show install prompt.");
    }

    btn.innerHTML = "📲";
    installBtns.forEach((b) => (b.style.display = "none"));
    deferredPrompt = null;
    window.__akInstallPromptReady = false;
  });
});

// ---- 6️⃣ Installed Event ----
window.addEventListener("appinstalled", () => {
  console.log("[PWA] App installed successfully ✅");
  installBtns.forEach((b) => (b.style.display = "none"));
  showInstallToast("✅ Installed! Open AksharaChitra from Home Screen.");
});

// ---- 7️⃣ Standalone Mode ----
if (window.matchMedia("(display-mode: standalone)").matches) {
  installBtns.forEach((b) => (b.style.display = "none"));
  console.log("[PWA] Running in standalone mode 🏠");
}

// ---- 8️⃣ iOS Add-to-Home ----
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
if (isIOS() && !window.matchMedia("(display-mode: standalone)").matches) {
  setTimeout(() => {
    showInstallToast("📲 On iPhone/iPad: Tap “Share” → “Add to Home Screen”.");
  }, 1200);
}

// ---- 9️⃣ Fallback (5 s grace) ----
window.addEventListener("load", () => {
  setTimeout(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isStandalone && !window.__akInstallPromptReady) {
      console.log("[PWA] Fallback: forcing install buttons visible 🔄");
      installBtns.forEach((btn) => {
        btn.style.display = "flex";
        btn.classList.add("show", "pulse");
        btn.disabled = true;
      });
      showInstallToast("💡 Tip: If install not visible, refresh once.");
    }
  }, 5000);
});

// ---- 🔟 Toast Utility ----
function showInstallToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(90deg, #1565c0, #1e88e5)",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    zIndex: "10000",
    fontWeight: "600",
    fontFamily: "Montserrat, sans-serif",
    opacity: "1",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 20px)";
  }, 2800);
  setTimeout(() => toast.remove(), 3400);
}

/* ==========================================================
   🌸 AksharaChitra v3.5 — Progressive Web App (pwa.js)
   ----------------------------------------------------------
   ✅ Service Worker
   ✅ Install Buttons (Header + FAB)
   ✅ Deferred Prompt Handling
   ✅ Spinner Overlay
   ✅ Toasts + iOS Add-to-Home
   ✅ Opera + Safari Manual Install Fallback
   ========================================================== */

// ---- 1️⃣ Loading Spinner Overlay ----
const spinner = document.createElement("div");

// Wrapper
Object.assign(spinner.style, {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(180deg,#e3f2fd,#bbdefb)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: "999999",
  transition: "opacity 0.8s ease, transform 0.8s ease",
});

// Loader UI
spinner.innerHTML = `
  <div style="
    display:flex;
    flex-direction:column;
    align-items:center;
    animation:fadeUp 1s ease forwards;
  ">

    <!-- Logo -->
    <img src="logo.png" alt="logo" style="
      width:85px;
      height:85px;
      object-fit:contain;
      margin-bottom:18px;
      animation:pulseGlow 2s infinite ease-in-out;
    ">

    <!-- Premium Ring Spinner -->
    <div style="
      width:48px;height:48px;
      border:5px solid rgba(21,101,192,0.25);
      border-top-color:#1565c0;
      border-radius:50%;
      animation:spin 0.9s linear infinite;
      margin-bottom:14px;
    "></div>

    <!-- Text -->
    <div style="
      font-family: 'Poppins', sans-serif;
      font-weight:600;
      font-size:1.05rem;
      color:#0d47a1;
      letter-spacing:0.4px;
      animation:fadeText 1.4s infinite;
    ">
      Loading AksharaChitra…
    </div>
  </div>

  <style>
    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes pulseGlow {
      0%   { transform:scale(1); filter:drop-shadow(0 0 0px #42a5f5); }
      50%  { transform:scale(1.08); filter:drop-shadow(0 0 12px #1e88e5); }
      100% { transform:scale(1); filter:drop-shadow(0 0 0px #42a5f5); }
    }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }

    @keyframes fadeText {
      0%   { opacity:1; }
      50%  { opacity:0.4; }
      100% { opacity:1; }
    }
  </style>
`;

document.body.appendChild(spinner);

// Fade-out
window.addEventListener("load", () => {
  setTimeout(() => {
    spinner.style.opacity = "0";
    spinner.style.transform = "scale(1.05)";
    setTimeout(() => spinner.remove(), 900);
  }, 400);
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
    if (btn.disabled) return;

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

// ---- 8️⃣ iOS Add-to-Home Message ----
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
if (isIOS() && !window.matchMedia("(display-mode: standalone)").matches) {
  setTimeout(() => {
    showInstallToast("📲 On iPhone/iPad: Tap “Share” → “Add to Home Screen”.");
  }, 1200);
}

// ---- 9️⃣ Fallback (5s grace) ----
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

// ==========================================================
//  🌐 Opera + iOS Safari Fallback for Manual Install
// ==========================================================
(function setupFallbackInstall() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isOpera = /Opera|OPR\//.test(ua);

  const needsManualInstall =
    (isIOS && isSafari) || isOpera || !("BeforeInstallPromptEvent" in window);

  if (!needsManualInstall) return;

  console.log("[PWA] Manual install mode for Safari / Opera 🧭");

  installBtns.forEach((btn) => {
    btn.style.display = "flex";
    btn.classList.add("show", "pulse");
    btn.disabled = false;
    btn.addEventListener("click", showManualGuide);
  });

  function showManualGuide() {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.55)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      backdropFilter: "blur(4px)",
    });

    const card = document.createElement("div");
    card.innerHTML = `
      <div style="
        background:#fff;
        color:#111;
        max-width:320px;
        padding:20px 18px;
        border-radius:12px;
        font-family:Montserrat,sans-serif;
        text-align:center;
        box-shadow:0 6px 22px rgba(0,0,0,0.25);
      ">
        <h3 style="margin-bottom:10px;color:#1565c0;">Add AksharaChitra</h3>
        <p style="font-size:0.95rem;line-height:1.5;">
          ${isIOS
            ? "On iPhone or iPad, tap <b>Share → Add to Home Screen</b>."
            : "In Opera or Safari, open the browser menu → <b>Install App</b> or <b>Add to Home Screen</b>."}
        </p>
        <button id="closeGuideBtn" style="
          margin-top:14px;
          background:linear-gradient(90deg,#1565c0,#1e88e5);
          color:#fff;
          border:none;
          padding:8px 16px;
          border-radius:8px;
          cursor:pointer;
          font-weight:600;
        ">Got it</button>
      </div>`;
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document
      .getElementById("closeGuideBtn")
      .addEventListener("click", () => overlay.remove());
  }
})();

/* ==========================================================
   🌸 AksharaChitra v3.1 — Progressive Web App (pwa.js)
   ----------------------------------------------------------
   Features:
   ✅ Service Worker Registration
   ✅ Dual Install Buttons (Header + FAB)
   ✅ Reliable Install Prompt Handling
   ✅ Spinner + Toast Feedback
   ✅ iOS Add-to-Home Guidance
   ✅ Fallback Install Visibility Patch
   ========================================================== */

// ---- 1️⃣ Register the Service Worker ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("[PWA] Service Worker registered:", reg.scope))
      .catch((err) => console.warn("[PWA] SW registration failed:", err));
  });
} else {
  console.warn("[PWA] Service workers not supported in this browser.");
}

// ---- 2️⃣ Install Buttons Setup ----
let deferredPrompt = null;
const installBtns = [
  document.getElementById("installBtn"),
  document.getElementById("installBtnHeader"),
].filter(Boolean);

// Hide initially
installBtns.forEach((btn) => (btn.style.display = "none"));

// ---- 3️⃣ Capture Install Prompt ----
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  console.log("[PWA] beforeinstallprompt event captured ✅");

  // Show both install buttons with animation
  installBtns.forEach((btn) => {
    btn.style.display = "flex";
    btn.classList.add("show", "pulse");
  });

  showInstallToast("📲 App ready to install! Tap the install icon.");
});

// ---- 4️⃣ Handle Install Button Click ----
installBtns.forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      showInstallToast("⚠️ Install not available yet. Try again shortly.");
      return;
    }

    btn.innerHTML = "⏳ Installing...";
    btn.disabled = true;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("[PWA] User accepted install ✅");
      showInstallToast("🎉 AksharaChitra installed successfully!");
    } else {
      console.log("[PWA] User dismissed install ❌");
      showInstallToast("❌ Install canceled.");
    }

    btn.innerHTML = "📲";
    btn.disabled = false;

    // Hide all buttons
    installBtns.forEach((b) => (b.style.display = "none"));
    deferredPrompt = null;
  });
});

// ---- 5️⃣ Installed Event ----
window.addEventListener("appinstalled", () => {
  console.log("[PWA] App installed successfully ✅");
  installBtns.forEach((b) => (b.style.display = "none"));
  showInstallToast("✅ Installed! Open AksharaChitra from your home screen.");
});

// ---- 6️⃣ Standalone Mode (Hide Buttons) ----
if (window.matchMedia("(display-mode: standalone)").matches) {
  installBtns.forEach((b) => (b.style.display = "none"));
  console.log("[PWA] Running in standalone mode 🏠");
}

// ---- 7️⃣ iOS Add-to-Home Guidance ----
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
if (isIOS() && !window.matchMedia("(display-mode: standalone)").matches) {
  showInstallToast("📲 On iPhone/iPad: Tap “Share” → “Add to Home Screen”.");
}

// ---- 8️⃣ Fallback Patch (Ensures Install Button Always Appears) ----
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!window.matchMedia("(display-mode: standalone)").matches && !deferredPrompt) {
      console.log("[PWA] Fallback: Forcing install buttons visible 🔄");
      installBtns.forEach((btn) => {
        btn.style.display = "flex";
        btn.classList.add("show", "pulse");
      });
    }
  }, 2500);
});

// ---- 9️⃣ Toast Utility ----
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
    transition: "opacity 0.5s ease, transform 0.5s ease",
  });

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 20px)";
  }, 2500);

  setTimeout(() => toast.remove(), 3200);
}

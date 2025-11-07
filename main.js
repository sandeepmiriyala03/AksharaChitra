/* ==========================================================
   🌸 AksharaChitra — main.js (v15.6 Stable)
   ----------------------------------------------------------
   Features: User Alignment Controls • QR Fix • Responsive Padding
   ----------------------------------------------------------
   Built & Maintained by: Sandeep Miriyala
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // 🔹 Helper functions
  // ---------------------------------------------
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => {
    if (!el || typeof el.addEventListener !== "function") return;
    el.addEventListener(ev, fn);
  };

  const qsAll = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------------------------------------
  // 🧩 Core Elements
  // ---------------------------------------------
  const titleEl = $("title"),
        subtitleEl = $("subtitle"),
        messageEl = $("message"),
        previewCard = $("previewCard"),
        pSmallLogo = $("pSmallLogo"),
        pTitle = $("pTitle"),
        pSubtitle = $("pSubtitle"),
        pMessage = $("pMessage"),
        pImage = $("pImage"),
        pQR = $("pQR"),
        generateBtn = $("generateBtn"),
        downloadBtn = $("downloadBtn"),
        shareBtn = $("shareBtn"),
        saveBtn = $("saveBtn"),
        clearBtn = $("clearBtn"),
        galleryGrid = $("galleryGrid"),
        themeToggle = $("themeToggle"),
        languageSelect = $("language"),
        posterDateOption = $("posterDateOption"),
        customDate = $("customDate"),
        installBtn = $("installBtn"),
        installBtnHeader = $("installBtnHeader"),
        shareWhatsAppBtn = $("shareWhatsAppBtn");

  // Text controls
  const titleSize = $("titleSize"),
        subtitleSize = $("subtitleSize"),
        messageSize = $("messageSize"),
        titleAlign = $("titleAlign"),
        subtitleAlign = $("subtitleAlign"),
        contentAlign = $("contentAlign"),
        titleColor = $("titleColor"),
        subtitleColor = $("subtitleColor"),
        messageColor = $("messageColor"),
        titleBg = $("titleBg"),
        subtitleBg = $("subtitleBg"),
        messageBg = $("messageBg"),
        fontFamily = $("fontFamily"),
        imageUpload = $("imageUpload"),
        imagePosition = $("imagePosition"),
        smallLogoUpload = $("smallLogoUpload"),
        openCreateBtn = $("openCreateBtn"),
        goTopBtn = $("goTopBtn");

  // Crop modal
  const cropModal = $("cropModal"),
        cropImage = $("cropImage"),
        applyCropBtn = $("applyCropBtn"),
        cancelCropBtn = $("cancelCropBtn");

  // ---------------------------------------------
  // ⚙️ State variables
  // ---------------------------------------------
  let cropper = null;
  let cropTarget = null; // "main" | "logo"
  let uploadedMainData = "";
  let uploadedLogoData = "";
  let posterDate = "";
  let deferredPrompt = null;
  const AUTOSAVE_KEY = "ak_autosave_v13";

  // ---------------------------------------------
  // 💾 IndexedDB setup
  // ---------------------------------------------
  const DB_NAME = "ak_gallery_v13";
  const STORE_NAME = "posters";
  let db = null;

  // 🔹 openDB() — creates or opens IndexedDB
  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME)) {
          const store = d.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
          store.createIndex("ts", "ts");
          store.createIndex("title", "title");
        }
      };
      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onerror = (e) => reject(e);
    });
  }

  // 🔹 saveToDB(record)
  async function saveToDB(rec) {
    await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).add(rec);
      tx.oncomplete = () => res();
      tx.onerror = (ev) => rej(ev);
    });
  }

  // 🔹 getAllFromDB()
  async function getAllFromDB() {
    await openDB();
    return new Promise((res) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  }

  // 🔹 deleteFromDB(id)
  async function deleteFromDB(id) {
    await openDB();
    return new Promise((res) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  }

  // ---------------------------------------------
  // 🧠 Utility helpers
  // ---------------------------------------------
  function safeSetStyle(el, styles) {
    if (!el) return;
    Object.assign(el.style, styles);
  }

  function formatFilename(base, w, h) {
    const clean = (base || "AksharaChitra").replace(/[^\w\- ]/g, "").slice(0, 40);
    return `${clean}_${w}x${h}.png`;
  }

  // ---------------------------------------------
  // 🧭 Navigation between tabs
  // ---------------------------------------------
  qsAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      qsAll(".tab-btn").forEach(b => b.classList.remove("active"));
      qsAll(".tab-content").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      const sec = document.getElementById(target);
      if (sec) sec.classList.add("active");
      if (target === "gallery") setTimeout(renderIndexedGallery, 200);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Home “Create” shortcut
  if (openCreateBtn) on(openCreateBtn, "click", () => {
    const createBtn = document.querySelector('.tab-btn[data-tab="create"]');
    if (createBtn) createBtn.click();
  });

  // ---------------------------------------------
  // 🌙 Theme toggle (persist)
  // ---------------------------------------------
  if (themeToggle) {
    on(themeToggle, "click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");
  }

  // ---------------------------------------------
  // 🗓️ Poster Date options
  // ---------------------------------------------
  function updatePosterDateFromOption() {
    if (!posterDateOption) return;
    const now = new Date();
    if (posterDateOption.value === "current") {
      posterDate = now.toLocaleString();
      if (customDate) customDate.classList.add("hidden");
    } else if (posterDateOption.value === "prevMonth") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      posterDate = d.toLocaleString();
      if (customDate) customDate.classList.add("hidden");
    } else if (posterDateOption.value === "custom") {
      if (customDate) customDate.classList.remove("hidden");
      if (customDate && customDate.value) posterDate = new Date(customDate.value).toLocaleString();
    } else {
      posterDate = "";
      if (customDate) customDate.classList.add("hidden");
    }
  }
  if (posterDateOption) on(posterDateOption, "change", () => { updatePosterDateFromOption(); renderPreview(); });
  if (customDate) on(customDate, "change", () => { posterDate = new Date(customDate.value).toLocaleString(); renderPreview(); });

  // ---------------------------------------------
  // ✂️ Cropper.js integration
  // ---------------------------------------------
  function openCropModal(dataUrl, target) {
    if (!cropModal || !cropImage) {
      if (target === "logo") uploadedLogoData = dataUrl; else uploadedMainData = dataUrl;
      renderPreview();
      return;
    }
    cropTarget = target;
    cropImage.src = dataUrl;
    cropModal.classList.remove("hidden");
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = new Cropper(cropImage, {
      viewMode: 1,
      autoCropArea: 1,
      background: false,
      responsive: true,
      movable: true,
      zoomable: true,
      rotatable: false
    });
  }

  // ✅ Apply crop
  if (applyCropBtn) on(applyCropBtn, "click", () => {
    if (!cropper) { cropModal.classList.add("hidden"); return; }
    try {
      const canvas = cropper.getCroppedCanvas({ maxWidth: 3000, imageSmoothingQuality: "high" });
      const dataUrl = canvas.toDataURL("image/png");
      if (cropTarget === "logo") uploadedLogoData = dataUrl; else uploadedMainData = dataUrl;
    } catch (err) {
      console.error("Crop apply error", err);
      alert("Unable to crop image.");
    }
    try { cropper.destroy(); } catch (e) {}
    cropper = null;
    cropModal.classList.add("hidden");
    renderPreview();
  });

  // ❌ Cancel crop
  if (cancelCropBtn) on(cancelCropBtn, "click", () => {
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = null;
    cropModal.classList.add("hidden");
  });

  // File input listeners
  if (imageUpload) {
    on(imageUpload, "change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => openCropModal(ev.target.result, "main");
      r.readAsDataURL(f);
    });
  }
  if (smallLogoUpload) {
    on(smallLogoUpload, "change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => openCropModal(ev.target.result, "logo");
      r.readAsDataURL(f);
    });
  }

  // 🚧 End of Part 1 — next: Live Preview + Font Controls

/* ==========================================================
   🌸 AksharaChitra — v13 Final
   Part 2 of 4 — Live Preview + Font Controls + Templates
   ========================================================== */

  // ---------------------------------------------
  // 🪶 Render Preview — updates instantly when user edits
  // ---------------------------------------------
 function renderPreview() {
  // Guard: require previewCard
  if (!previewCard) return;

  const qrAlignEl = document.getElementById("qrAlign");
  if (qrAlignEl) on(qrAlignEl, "change", renderPreview);

  // Base preview card styles
  previewCard.style.position = "relative";
  previewCard.style.overflow = "hidden";
  previewCard.style.padding = window.innerWidth < 480 ? "8px" : "12px";
  previewCard.style.borderRadius = "12px";
previewCard.style.background = (messageBg?.value && messageBg.value !== "transparent")
  ? messageBg.value
  : "#FFFFFF"; // ✅ always white by default


  // ---------- Small Logo ----------
  if (pSmallLogo) {
    pSmallLogo.innerHTML = uploadedLogoData
      ? `<img src="${uploadedLogoData}" alt="logo"
             style="width:55px;height:55px;border-radius:8px;
                    display:block;margin:6px auto;">`
      : "";
  }

  // ---------- Title ----------
  if (pTitle) {
    pTitle.textContent = titleEl?.value || "";
    safeSetStyle(pTitle, {
      fontFamily: fontFamily?.value || "Montserrat, sans-serif",
      fontSize: (titleSize?.value || 16) + "px",
      textAlign: titleAlign?.value || "center",
      color: titleColor?.value || "#FFFFFF", // ✅ default white
      background: titleBg?.value || "transparent",
      fontWeight: "700",
      margin: "6px 0 4px",
      wordBreak: "break-word",
      display: pTitle.textContent ? "block" : "none",
    });
  }

  // ---------- Subtitle ----------
  if (pSubtitle) {
    pSubtitle.textContent = subtitleEl?.value || "";
    safeSetStyle(pSubtitle, {
      fontFamily: fontFamily?.value || "Montserrat, sans-serif",
      fontSize: (subtitleSize?.value || 14) + "px",
      textAlign: subtitleAlign?.value || "center",
      color: subtitleColor?.value || "#FFFFFF", // ✅ default white
      background: subtitleBg?.value || "transparent",
      fontWeight: "500",
      margin: "4px 0 10px",
      wordBreak: "break-word",
      display: pSubtitle.textContent ? "block" : "none",
    });
  }

  // ---------- Image ----------
  if (pImage) {
    if (uploadedMainData) {
      const pos = imagePosition?.value || "center";
      let style =
        "max-width:100%;display:block;margin:8px auto;border-radius:10px;object-fit:cover;";
      if (pos === "left")
        style =
          "max-width:100%;display:block;margin:8px auto 8px 0;border-radius:10px;object-fit:cover;";
      if (pos === "right")
        style =
          "max-width:100%;display:block;margin:8px 0 8px auto;border-radius:10px;object-fit:cover;";
      pImage.innerHTML = `<img src="${uploadedMainData}" alt="main" style="${style}">`;
    } else {
      pImage.innerHTML = "";
    }
  }

  // ---------- Message ----------
  if (pMessage) {
    pMessage.innerHTML = (messageEl?.value || "").replace(/\n/g, "<br>");
    safeSetStyle(pMessage, {
      fontFamily: fontFamily?.value || "Montserrat, sans-serif",
      fontSize: (messageSize?.value || 12) + "px",
      textAlign: contentAlign?.value || "center",
      color: messageColor?.value || "#FFFFFF", // ✅ default white
      background: messageBg?.value || "transparent",
      marginTop: "10px",
      wordBreak: "break-word",
    });
  }

  // ---------- QR Code ----------
  const qrValue = document.getElementById("qrText")?.value?.trim();
  const qrAlign = qrAlignEl?.value || "left";
  if (pQR) {
    pQR.innerHTML = "";
    if (qrValue && typeof QRCode !== "undefined") {
      const qrContainer = document.createElement("div");
      qrContainer.style.textAlign = qrAlign;
      qrContainer.style.marginTop = "12px";

      const qrDiv = document.createElement("div");
      qrDiv.id = "qrPreview";
      qrContainer.appendChild(qrDiv);
      pQR.appendChild(qrContainer);

      new QRCode(qrDiv, {
        text: qrValue,
        width: 70,
        height: 70,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }

  // ---------- Footer ----------
  previewCard.querySelectorAll(".ak-footer").forEach(el => el.remove());
  const footer = document.createElement("div");
  footer.className = "ak-footer";
  footer.style.position = "absolute";
  footer.style.bottom = "6px";
  footer.style.left = "10px";
  footer.style.right = "10px";
  footer.style.display = "flex";
  footer.style.alignItems = "center";
  footer.style.justifyContent = "space-between";
  footer.style.fontSize = "10px";
  footer.style.opacity = "0.7";
  footer.style.color = "#000000"; // ✅ footer text white to match theme
  

  // Date
  const now = new Date();
  const formatted = now
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
  const dateSpan = document.createElement("span");
  dateSpan.textContent = formatted;

  // Logo + App name
  const logoGroup = document.createElement("div");
  logoGroup.style.display = "flex";
  logoGroup.style.alignItems = "center";
  logoGroup.style.gap = "4px";

  const logoImg = document.createElement("img");
  logoImg.src = "logo.png";
  logoImg.style.width = "16px";
  logoImg.style.height = "16px";
  logoImg.style.borderRadius = "4px";

  const logoText = document.createElement("span");
  logoText.textContent = "AksharaChitra";
  logoText.style.fontStyle = "italic";

  logoGroup.appendChild(logoImg);
  logoGroup.appendChild(logoText);

  footer.appendChild(dateSpan);
  footer.appendChild(logoGroup);
  previewCard.appendChild(footer);
}


  // ---------------------------------------------
  // 🔄 Live-update preview on any input change
  // ---------------------------------------------
  [
    titleEl, subtitleEl, messageEl,
    titleSize, subtitleSize, messageSize,
    titleAlign, subtitleAlign, contentAlign,
    titleColor, subtitleColor, messageColor,
    titleBg, subtitleBg, messageBg,
    fontFamily, imagePosition
  ].forEach((el) => { if (el) on(el, "input", renderPreview); });

  // ---------------------------------------------
  // 📦 Template presets (Quick-fill)
  // ---------------------------------------------
  const templateSelect = $("templateSelect");
  if (templateSelect) {
    const templates = {
      news:       { title: "📰 Breaking News", subtitle: "", message: "Write your update here..." },
      birthday:   { title: "🎂 Happy Birthday!", subtitle: "Best Wishes", message: "Many Happy Returns of the Day!" },
      devotional: { title: "🕉 శుభ దినం", subtitle: "", message: "May divine blessings be with you 🙏" },
      business:   { title: "🏢 Business Update", subtitle: "", message: "Contact us at +91 99999 99999" },
      invitation: { title: "💌 Invitation", subtitle: "", message: "Venue • Date • Time" },
      quote:      { title: "💬 Quote of the Day", subtitle: "", message: "Believe in yourself ✨" },
    };
    on(templateSelect, "change", () => {
      const v = templateSelect.value;
      if (templates[v]) {
        if (titleEl)    titleEl.value    = templates[v].title;
        if (subtitleEl) subtitleEl.value = templates[v].subtitle;
        if (messageEl)  messageEl.value  = templates[v].message;
        renderPreview();
      }
    });
  }

  // ---------------------------------------------
  // 🗣️ Language placeholder logic
  // ---------------------------------------------
  const LANG = {
    en: { title: "Title", subtitle: "Subtitle", message: "Type your message..." },
    te: { title: "శీర్షిక", subtitle: "ఉపశీర్షిక", message: "సందేశం రాయండి..." },
    hi: { title: "शीर्षक", subtitle: "उपशीर्षक", message: "अपना संदेश लिखें..." },
    ta: { title: "தலைப்பு", subtitle: "துணைத் தலைப்பு", message: "உங்கள் செய்தியை எழுதுங்கள்..." },
    kn: { title: "ಶೀರ್ಷಿಕೆ", subtitle: "ಉಪಶೀರ್ಷಿಕೆ", message: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಬರೆಯಿರಿ..." },
    ml: { title: "ശീർഷകം", subtitle: "ഉപശീർഷകം", message: "താങ്കളുടെ സന്ദേശം അടിക്കൊള്ളുക..." },
    or: { title: "ଶୀର୍ଷକ", subtitle: "ଉପଶୀର୍ଷକ", message: "ଆପଣଙ୍କ ସନ୍ଦେଶ ଲେଖନ୍ତୁ..." },
    sa: { title: "शीर्षकम्", subtitle: "उपशीर्षकम्", message: "सन्देशं लिखतु..." },
  };
  if (languageSelect) {
    on(languageSelect, "change", () => {
      const val = languageSelect.value;
      const L = LANG[val] || LANG.en;
      if (titleEl)    titleEl.placeholder    = L.title;
      if (subtitleEl) subtitleEl.placeholder = L.subtitle;
      if (messageEl)  messageEl.placeholder  = L.message;
    });
  }

  // ---------------------------------------------
  // 🚀 Initial render on load
  // ---------------------------------------------
  renderPreview();

  // 🚧 End of Part 2 — Next: Image Generation, Save, Gallery & Share
/* ==========================================================
   🌸 AksharaChitra — v13 Final
   Part 3 of 4 — Image Generation, Save, Gallery & Share
   ========================================================== */

  async function generateImage({ download = false } = {}) {
    if (!previewCard) return alert("Preview not found");
    if (typeof html2canvas === "undefined") return alert("html2canvas not loaded");

    const width = 1200;
    const height = Math.round(width * 9 / 16);
    const scale = Math.min(3, window.devicePixelRatio || 2);

    const originalWidth = previewCard.style.width;
    const originalHeight = previewCard.style.height;
    const prevPadding = previewCard.style.padding;

    previewCard.style.width = width + "px";
    previewCard.style.height = height + "px";
    previewCard.style.padding = "8px 14px 10px 14px";

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(255,255,255,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      fontFamily: "Montserrat, sans-serif",
      fontSize: "1.1rem",
      color: "#1e88e5",
      fontWeight: "600",
    });
    overlay.textContent = "⏳ Generating Poster...";
    document.body.appendChild(overlay);

    try {
      await new Promise(r => setTimeout(r, 300));

      // Capture DOM (includes QR + alignment from user)
      const canvas = await html2canvas(previewCard, {
        scale,
        width,
        height,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
      });

      const ctx = canvas.getContext("2d");

      // ======================================================
      // 🕒 FOOTER — Date/Time + Logo + App Name
      // ======================================================
      try {
        const now = new Date();
        const formattedDate = now.toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).replace(",", "");

        const dateText = formattedDate;
        const appName = "AksharaChitra";

        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1 * scale;
        ctx.moveTo(10 * scale, canvas.height - 50 * scale);
        ctx.lineTo(canvas.width - 10 * scale, canvas.height - 50 * scale);
        ctx.stroke();

        const fontSize = Math.max(9, Math.round(9 * scale));
        ctx.font = `${fontSize}px Montserrat, Arial, sans-serif`;
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#222";

        ctx.textAlign = "left";
        ctx.fillText(dateText, 16 * scale, canvas.height - 20 * scale);

        const logoImg = new Image();
        logoImg.src = "logo.png";
        await new Promise(res => (logoImg.onload = res, logoImg.onerror = res));
        const logoSize = 22 * scale;
        const logoY = canvas.height - 38 * scale;
        const textWidth = ctx.measureText(appName).width;

        ctx.textAlign = "right";
        ctx.fillText(appName, canvas.width - 16 * scale, canvas.height - 20 * scale);
        const logoX = canvas.width - (textWidth + 40 * scale);
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } catch (e) {
        console.warn("⚠️ Footer draw failed:", e);
      }

      // ======================================================
      // 📸 EXPORT PNG
      // ======================================================
      const dataUrl = canvas.toDataURL("image/png");
      if (download) {
        const fname = formatFilename(titleEl?.value || "AksharaChitra", width, height);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      previewCard.style.width = originalWidth;
      previewCard.style.height = originalHeight;
      previewCard.style.padding = prevPadding;
      overlay.remove();
      return dataUrl;

    } catch (err) {
      console.error("generateImage error", err);
      overlay.remove();
      previewCard.style.width = originalWidth;
      previewCard.style.height = originalHeight;
      previewCard.style.padding = prevPadding;
      return null;
    }
  }

  // ✅ Buttons (no confirm, direct actions)
  if (generateBtn)
    on(generateBtn, "click", async () => {
      await generateImage({ download: false });
    });

  if (downloadBtn)
    on(downloadBtn, "click", async () => {
      await generateImage({ download: true });
    });


  // ---------------------------------------------
  // 📤 Native Share API + WhatsApp fallback
  // ---------------------------------------------
  if (shareBtn) on(shareBtn, "click", async () => {
    try {
      const dataUrl = await generateImage({ download: false });
      if (!dataUrl) return;
      const resp = await fetch(dataUrl);
      const blob = await resp.blob();
      const file = new File([blob], formatFilename(titleEl?.value, previewCard.clientWidth, previewCard.clientHeight), { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "AksharaChitra Poster", text: "Created with AksharaChitra" });
      } else {
        alert("Native share not supported — downloading instead.");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = formatFilename(titleEl?.value, previewCard.clientWidth, previewCard.clientHeight);
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("Share error", err);
      alert("Share failed.");
    }
  });

  // WhatsApp info share (text)
  if (shareWhatsAppBtn) on(shareWhatsAppBtn, "click", () => {
    const features = [
      "🖋️ Customize Title, Subtitle & Message",
      "🌐 Supports Indian Languages",
      "🖼️ Upload & Crop Images",
      "🔖 Add Logo / Watermark",
      "📅 Auto or Custom Date",
      "💾 Offline Save (IndexedDB)",
      "📤 Quick Social Share",
    ].map(f => `• ${f}`).join("\n");
    const message = `🌸 AksharaChitra — Create Multilingual Posters Offline 🎨\n\nTop Features:\n${features}\n\nhttps://aksharachitra.netlify.app\nMade with ❤️ by Sandeep Miriyala`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  });

  // ---------------------------------------------
  // 💾 Save to IndexedDB (My Creations)
  // ---------------------------------------------
  if (saveBtn) on(saveBtn, "click", async () => {
    try {
      const dataUrl = await generateImage({ download: false });
      if (!dataUrl) return;
      const rec = { title: (titleEl?.value || "Untitled"), dataUrl, ts: Date.now() };
      await saveToDB(rec);
      alert("Saved to My Creations (offline).");
      const gallerySection = $("gallery");
      if (gallerySection && gallerySection.classList.contains("active")) renderIndexedGallery();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed.");
    }
  });

  // ---------------------------------------------
  // 🖼️ Gallery rendering (IndexedDB)
  // ---------------------------------------------
  async function renderIndexedGallery({ sortBy = "newest", filter = "" } = {}) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `<p class="muted">Loading...</p>`;
    const all = await getAllFromDB();
    let list = all || [];
    if (filter.trim()) {
      const f = filter.toLowerCase();
      list = list.filter(x => (x.title || "").toLowerCase().includes(f));
    }
    if (sortBy === "newest") list.sort((a, b) => b.ts - a.ts);
    else if (sortBy === "oldest") list.sort((a, b) => a.ts - b.ts);
    else if (sortBy === "name-asc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sortBy === "name-desc") list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    if (!list.length) {
      galleryGrid.innerHTML = `<p class="muted">No creations yet. Save one to appear here.</p>`;
      return;
    }

    // Controls
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.gap = "8px";
    controls.style.marginBottom = "12px";

    const sortSel = document.createElement("select");
    sortSel.innerHTML = `
      <option value="newest">Sort: Newest</option>
      <option value="oldest">Sort: Oldest</option>
      <option value="name-asc">Sort: A → Z</option>
      <option value="name-desc">Sort: Z → A</option>`;
    sortSel.value = sortBy;
    const filterInput = document.createElement("input");
    filterInput.placeholder = "Filter by title...";
    filterInput.style.padding = "8px";
    filterInput.style.minWidth = "180px";
    sortSel.addEventListener("change", () => renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value }));
    filterInput.addEventListener("input", () => renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value }));

    controls.appendChild(sortSel);
    controls.appendChild(filterInput);
    galleryGrid.innerHTML = "";
    galleryGrid.appendChild(controls);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
    grid.style.gap = "12px";

    list.forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-item";
      safeSetStyle(card, { borderRadius: "10px", overflow: "hidden", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", background: "#fff" });

      const img = document.createElement("img");
      img.src = item.dataUrl;
      img.alt = item.title;
      safeSetStyle(img, { width: "100%", display: "block", height: "140px", objectFit: "cover" });

      const meta = document.createElement("div");
      safeSetStyle(meta, { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px" });

      const left = document.createElement("div");
      safeSetStyle(left, { display: "flex", flexDirection: "column", gap: "4px" });
      const ttl = document.createElement("div");
      ttl.textContent = item.title || "Untitled";
      ttl.style.fontWeight = "700";
      const dt = document.createElement("div");
      dt.textContent = new Date(item.ts).toLocaleString();
      safeSetStyle(dt, { fontSize: "0.85rem", opacity: "0.7" });
      left.appendChild(ttl);
      left.appendChild(dt);

      const actions = document.createElement("div");
      safeSetStyle(actions, { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" });

      // Share button
      const shareBtnCard = document.createElement("button");
      shareBtnCard.className = "btn ghost";
      shareBtnCard.textContent = "Share";
      shareBtnCard.addEventListener("click", async () => {
        try {
          const resp = await fetch(item.dataUrl);
          const blob = await resp.blob();
          const file = new File([blob], `${(item.title || "poster").replace(/\s+/g, "_")}.png`, { type: blob.type });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: item.title || "AksharaChitra Poster" });
          } else {
            const txt = `Poster: ${item.title}\nCreated: ${new Date(item.ts).toLocaleString()}\nGenerated with AksharaChitra`;
            window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
          }
        } catch (err) { alert("Share failed"); }
      });

      // Download button
      const downloadBtnCard = document.createElement("button");
      downloadBtnCard.className = "btn";
      downloadBtnCard.textContent = "⬇";
      downloadBtnCard.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = item.dataUrl;
        a.download = `${(item.title || "poster").replace(/[^\w\- ]/g, "").slice(0, 40)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "🗑️";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", async () => {
        if (!confirm("Delete this poster?")) return;
        await deleteFromDB(item.id);
        renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value });
      });

      actions.append(shareBtnCard, downloadBtnCard, delBtn);
      meta.append(left, actions);
      card.append(img, meta);
      grid.appendChild(card);
    });
    galleryGrid.appendChild(grid);
  }

  // 🚧 End of Part 3 — Next: Voice Input, TTS, PWA, Autosave, Final Init
/* ==========================================================
   🌸 AksharaChitra — v13 Final
   Part 4 of 4 — PWA, Voice Input, Autosave, Final Init
   ========================================================== */

  // ---------------------------------------------
  // 📲 Progressive Web App (Install Prompt)
  // ---------------------------------------------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.add("show");
    if (installBtnHeader) installBtnHeader.classList.add("show");
  });

  [installBtn, installBtnHeader].forEach(b => {
    if (!b) return;
    on(b, "click", async () => {
      if (!deferredPrompt) { alert("Install not available right now."); return; }
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") console.log("PWA installed.");
        deferredPrompt = null;
        b.classList.remove("show");
      } catch (e) {
        console.warn("Install prompt failed", e);
      }
    });
  });

  // ---------------------------------------------
  // 🎙️ Speech Recognition (Voice to Text)
  // ---------------------------------------------
  const startVoiceBtn = $("startVoice"),
        stopVoiceBtn  = $("stopVoice");
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SR && startVoiceBtn && stopVoiceBtn && messageEl) {
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-IN";

    on(startVoiceBtn, "click", () => {
      try { recog.start(); startVoiceBtn.classList.add("listening"); } catch (e) {}
    });
    on(stopVoiceBtn, "click", () => {
      try { recog.stop(); startVoiceBtn.classList.remove("listening"); } catch (e) {}
    });
    recog.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      messageEl.value = (messageEl.value ? (messageEl.value + " ") : "") + t;
      renderPreview();
    };
    recog.onend = () => { startVoiceBtn.classList.remove("listening"); };
  }

  // ---------------------------------------------
  // 🔊 Text to Speech (Read aloud content)
  // ---------------------------------------------
  const startSpeakBtn = $("startSpeak"),
        stopSpeakBtn  = $("stopSpeak");
  const synth = window.speechSynthesis;

  if (startSpeakBtn && stopSpeakBtn && synth) {
    on(startSpeakBtn, "click", () => {
      const fullText = [
        titleEl?.value,
        subtitleEl?.value,
        messageEl?.value
      ].filter(Boolean).join(". ");
      if (!fullText) return;

      const ut = new SpeechSynthesisUtterance(fullText);
      const langMap = {
        en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN",
        kn: "kn-IN", ml: "ml-IN", or: "or-IN", sa: "sa-IN"
      };
      ut.lang = langMap[languageSelect?.value] || "en-IN";
      ut.rate = 0.95;
      ut.pitch = 1.0;
      synth.speak(ut);
    });
    on(stopSpeakBtn, "click", () => synth.cancel());
  }

// ---------------------------------------------
// 🧹 Clear All Fields (Full Reset — All Text Black, White Background)
// ---------------------------------------------
if (clearBtn) on(clearBtn, "click", () => {
  if (!confirm("Clear all fields and reset settings?")) return;

  // 🔹 Text fields
  [titleEl, subtitleEl, messageEl].forEach(e => { if (e) e.value = ""; });

  // 🔹 Image data reset
  uploadedMainData = "";
  uploadedLogoData = "";

  // 🧼 Reset file inputs to allow re-upload of same file
  if (imageUpload) imageUpload.value = "";
  if (smallLogoUpload) smallLogoUpload.value = "";

  // 🔹 Safely destroy cropper (if open)
  try { if (cropper) cropper.destroy(); } catch {}
  cropper = null;
  cropTarget = null;
  if (cropModal) cropModal.classList.add("hidden");

  // 🔹 Size & alignment reset
  [titleSize, subtitleSize, messageSize].forEach(e => { if (e) e.value = ""; });
  [titleAlign, subtitleAlign, contentAlign].forEach(e => { if (e) e.value = "center"; });

  // 🔹 Colors (ALL BLACK) + Backgrounds (ALL WHITE)
  [titleColor, subtitleColor, messageColor].forEach(e => { if (e) e.value = "#000000"; });
  [titleBg, subtitleBg, messageBg].forEach(e => { if (e) e.value = "#FFFFFF"; });

  // ✅ Force preview card background to white
  if (previewCard) previewCard.style.background = "#FFFFFF";

  // 🔹 Immediately apply black text
  [pTitle, pSubtitle, pMessage].forEach(el => { if (el) el.style.color = "#000000"; });

  // 🔹 Font & image position defaults
  if (fontFamily) fontFamily.value = "Montserrat, sans-serif";
  if (imagePosition) imagePosition.value = "center";

  // 🔹 Language reset
  if (languageSelect) languageSelect.value = "en";

  // 🔹 Date + QR + Template reset
  if (posterDateOption) posterDateOption.value = "";
  if (customDate) customDate.value = "";
  posterDate = "";
  const qrText = $("qrText");
  if (qrText) qrText.value = "";
  const templateSelect = $("templateSelect");
  if (templateSelect) templateSelect.value = "";

  // 🔹 Remove autosave cache
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}

  // 🔹 Refresh preview (apply clean state)
  setTimeout(renderPreview, 120);

  // ✅ Toast Message
  const msg = document.createElement("div");
  msg.textContent = "✅ All fields and settings have been reset!";
  Object.assign(msg.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#4CAF50",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Montserrat, sans-serif",
    fontSize: "0.9rem",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.3s ease"
  });
  document.body.appendChild(msg);
  setTimeout(() => msg.style.opacity = "1", 50);
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 600);
  }, 2500);
});

  // ---------------------------------------------
  // ⬆️ Go-Top Button
  // ---------------------------------------------
  if (goTopBtn) {
    on(goTopBtn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      goTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
  }

  // ---------------------------------------------
  // 💾 Autosave + Restore
  // ---------------------------------------------
  setInterval(() => {
    try {
      const state = {
        title: titleEl?.value || "",
        subtitle: subtitleEl?.value || "",
        message: messageEl?.value || "",
        ts: Date.now()
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    } catch {}
  }, 4000);

  try {
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || "null");
    if (saved) {
      if (titleEl)    titleEl.value    = saved.title || "";
      if (subtitleEl) subtitleEl.value = saved.subtitle || "";
      if (messageEl)  messageEl.value  = saved.message || "";
      renderPreview();
    }
  } catch {}

  // ---------------------------------------------
  // 🕐 Footer Year
  // ---------------------------------------------
  const yr = $("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // ---------------------------------------------
  // 🌟 Final Exposure (for debugging)
  // ---------------------------------------------
  window.ak = {
    renderPreview,
    generateImage,
    renderIndexedGallery,
    saveToDB,
    deleteFromDB
  };
  // ✅ All features loaded
  console.log("✅ AksharaChitra v13 loaded successfully!");
function showToast(msg, color = "#4CAF50") {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: color,
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontFamily: "Montserrat, sans-serif",
    fontSize: "0.9rem",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.3s ease",
  });
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = "1", 50);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 600); }, 2500);
}

});

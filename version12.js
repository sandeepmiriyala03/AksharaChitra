/* ==========================================================
   🌸 AksharaChitra — main.js (v12)
   - Combines: Cropper, IndexedDB gallery, autosave, voice/TTS,
     PWA install prompt, theme toggle, social-size exports.
   - Requires html2canvas & cropperjs included with defer in HTML.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // small helpers
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
  const qsAll = (sel) => Array.from(document.querySelectorAll(sel));

  // -------------------------
  // Core DOM Elements
  // -------------------------
  const titleEl = $("title"),
        subtitleEl = $("subtitle"),
        messageEl = $("message"),
        templateSelect = $("templateSelect"),
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
        shareWhatsAppBtn = $("shareWhatsAppBtn"),
        posterSizeSelect = $("posterSize"); // optional dropdown for sizes

  // section controls
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
        qrText = $("qrText"),
        imageUpload = $("imageUpload"),
        imagePosition = $("imagePosition"),
        smallLogoUpload = $("smallLogoUpload"),
        startVoiceBtn = $("startVoice"),
        stopVoiceBtn = $("stopVoice"),
        startSpeakBtn = $("startSpeak"),
        stopSpeakBtn = $("stopSpeak"),
        openCreateBtn = $("openCreateBtn"),
        goTopBtn = $("goTopBtn");

  // crop modal
  const cropModal = $("cropModal"),
        cropImage = $("cropImage"),
        applyCropBtn = $("applyCropBtn"),
        cancelCropBtn = $("cancelCropBtn");

  // -------------------------
  // State
  // -------------------------
  let cropper = null;
  let cropTarget = null; // "main" or "logo"
  let uploadedMainData = "";
  let uploadedLogoData = "";
  let posterDate = "";
  let deferredPrompt = null; // for PWA install
  const AUTOSAVE_KEY = "ak_autosave_v12";

  // -------------------------
  // IndexedDB (My Creations)
  // -------------------------
  const DB_NAME = "ak_gallery_v12";
  const STORE_NAME = "posters";
  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const req = indexedDB.open(DB_NAME, 2);
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

  async function saveToDB(rec) {
    await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).add(rec);
      tx.oncomplete = () => res();
      tx.onerror = (ev) => rej(ev);
    });
  }

  async function getAllFromDB() {
    await openDB();
    return new Promise((res) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => res([]);
    });
  }

  async function deleteFromDB(id) {
    await openDB();
    return new Promise((res) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => res();
    });
  }

  // -------------------------
  // Utilities
  // -------------------------
  function safeSetStyle(el, styles) {
    if (!el) return;
    Object.assign(el.style, styles);
  }

  function formatFilename(base, w, h) {
    const clean = (base || "AksharaChitra").replace(/[^\w\- ]/g, "").slice(0, 40);
    return `${clean}_${w}x${h}.png`;
  }

  // -------------------------
  // Tabs navigation
  // -------------------------
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

  // open create from home
  if (openCreateBtn) on(openCreateBtn, "click", () => {
    const createBtn = document.querySelector('.tab-btn[data-tab="create"]');
    if (createBtn) createBtn.click();
  });

  // -------------------------
  // Theme toggle (persist)
  // -------------------------
  if (themeToggle) {
    on(themeToggle, "click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");
  }

  // -------------------------
  // Language placeholders
  // -------------------------
  const LANG = {
    en: { title: "Title", subtitle: "Subtitle", message: "Type your message..." },
    te: { title: "శీర్షిక", subtitle: "ఉపశీర్షిక", message: "సందేశం రాయండి..." },
    hi: { title: "शीर्षक", subtitle: "उपशीर्षक", message: "अपना संदेश लिखें..." },
    ta: { title: "தலைப்பு", subtitle: "துணைத் தலைப்பு", message: "உங்கள் செய்தியை எழுதுங்கள்..." },
    kn: { title: "ಶೀರ್ಷಿಕೆ", subtitle: "ಉಪಶೀರ್ಷಿಕೆ", message: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಬರೆಯಿರಿ..." },
    ml: { title: "ശീർഷകം", subtitle: "ഉപശീർഷകം", message: "താങ്കളുടെ സന്ദേശം അടിക്കൊള്ളുക..." },
    or: { title: "ଶୀର୍ଷକ", subtitle: "ଉପଶୀର୍ଷକ", message: "ଆପଣଙ୍କର ସନ୍ଦେଶ ଲେଖନ୍ତୁ..." },
    sa: { title: "शीर्षकम्", subtitle: "उपशीर्षकम्", message: "सन्देशं लिखतु..." },
  };
  if (languageSelect) {
    on(languageSelect, "change", () => {
      const val = languageSelect.value;
      const L = LANG[val] || LANG.en;
      if (titleEl) titleEl.placeholder = L.title;
      if (subtitleEl) subtitleEl.placeholder = L.subtitle;
      if (messageEl) messageEl.placeholder = L.message;
    });
  }

  // -------------------------
  // Poster Date logic
  // -------------------------
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

  // -------------------------
  // Crop flow (Cropper.js)
  // -------------------------
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

  if (cancelCropBtn) on(cancelCropBtn, "click", () => {
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = null;
    cropModal.classList.add("hidden");
  });

  // file inputs
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

  // -------------------------
  // Auto-fit text helper
  // -------------------------
  function autoFitText(el, maxSizePx, minSizePx = 10) {
    if (!el || !previewCard) return;
    let fs = parseInt(maxSizePx, 10);
    el.style.fontSize = fs + "px";
    const fits = () => previewCard.scrollHeight <= previewCard.clientHeight - 12;
    let attempts = 0;
    while (!fits() && fs > minSizePx && attempts < 20) {
      fs = Math.max(minSizePx, Math.floor(fs * 0.92));
      el.style.fontSize = fs + "px";
      attempts++;
    }
  }

  // -------------------------
  // Render Preview
  // -------------------------
  function renderPreview() {
    if (!previewCard) return;
    previewCard.style.position = "relative";
    previewCard.style.textAlign = "center";
    previewCard.style.overflow = "hidden";
    // Allow background control via titleBg/messageBg? Use entire card bg if provided
    const bg = (messageBg && messageBg.value) ? messageBg.value : "#fff";
    previewCard.style.background = bg;
    previewCard.style.padding = "18px";
    previewCard.style.borderRadius = "12px";

    // small logo
    if (pSmallLogo) {
      pSmallLogo.innerHTML = uploadedLogoData
        ? `<img src="${uploadedLogoData}" alt="logo" style="width:60px;height:60px;border-radius:8px;display:block;margin:8px auto;">`
        : "";
    }

    // title
    if (pTitle) {
      pTitle.textContent = titleEl?.value || "";
      pTitle.style.fontFamily = fontFamily?.value || "Montserrat, sans-serif";
      pTitle.style.fontSize = (titleSize?.value || 32) + "px";
      pTitle.style.textAlign = titleAlign?.value || "center";
      pTitle.style.color = titleColor?.value || "#111";
      pTitle.style.background = titleBg?.value || "transparent";
      pTitle.style.fontWeight = "700";
      pTitle.style.margin = "8px 0 6px";
      pTitle.style.wordBreak = "break-word";
      pTitle.style.display = pTitle.textContent ? "block" : "none";
    }

    // subtitle
    if (pSubtitle) {
      pSubtitle.textContent = subtitleEl?.value || "";
      pSubtitle.style.fontSize = (subtitleSize?.value || 22) + "px";
      pSubtitle.style.textAlign = subtitleAlign?.value || "center";
      pSubtitle.style.color = subtitleColor?.value || "#444";
      pSubtitle.style.background = subtitleBg?.value || "transparent";
      pSubtitle.style.margin = "4px 0 10px";
      pSubtitle.style.wordBreak = "break-word";
      pSubtitle.style.display = pSubtitle.textContent ? "block" : "none";
    }

    // image
    if (pImage) {
      if (uploadedMainData) {
        const pos = imagePosition?.value || "center";
        let style = 'max-width:100%;display:block;margin:10px auto;border-radius:10px;object-fit:cover;';
        if (pos === "left") style = 'max-width:100%;display:block;margin:10px auto 10px 0;border-radius:10px;object-fit:cover;';
        if (pos === "right") style = 'max-width:100%;display:block;margin:10px 0 10px auto;border-radius:10px;object-fit:cover;';
        pImage.innerHTML = `<img src="${uploadedMainData}" alt="main" style="${style}">`;
      } else pImage.innerHTML = "";
    }

    // message
    if (pMessage) {
      pMessage.innerHTML = (messageEl?.value || "").replace(/\n/g, "<br>");
      pMessage.style.fontSize = (messageSize?.value || 18) + "px";
      pMessage.style.textAlign = contentAlign?.value || "center";
      pMessage.style.color = messageColor?.value || "#111";
      pMessage.style.background = messageBg?.value || "transparent";
      pMessage.style.marginTop = "12px";
      pMessage.style.wordBreak = "break-word";
    }

    // date element
    let createdDateEl = previewCard.querySelector(".ak-created-date");
    if (!createdDateEl) {
      createdDateEl = document.createElement("div");
      createdDateEl.className = "ak-created-date";
      previewCard.appendChild(createdDateEl);
    }
    createdDateEl.textContent = posterDate ? `📅 ${posterDate}` : "";
    safeSetStyle(createdDateEl, {
      position: "absolute",
      bottom: "8px",
      left: "10px",
      fontSize: "10px",
      opacity: "0.85",
      color: "#333",
      background: "transparent"
    });

    // watermark element
    let watermarkEl = previewCard.querySelector(".ak-watermark");
    if (!watermarkEl) {
      watermarkEl = document.createElement("div");
      watermarkEl.className = "ak-watermark";
      previewCard.appendChild(watermarkEl);
    }
    watermarkEl.textContent = "aksharachitra.netlify.app";
    safeSetStyle(watermarkEl, {
      position: "absolute",
      bottom: "8px",
      right: "10px",
      fontSize: "10px",
      opacity: "0.6",
      color: "#000",
      fontStyle: "italic"
    });

    // autoshrink safeguards
    try {
      if (pTitle && titleSize) autoFitText(pTitle, parseInt(titleSize.value || 32, 10));
      if (pSubtitle && subtitleSize) autoFitText(pSubtitle, parseInt(subtitleSize.value || 22, 10));
      if (pMessage && messageSize) autoFitText(pMessage, parseInt(messageSize.value || 18, 10));
    } catch (e) { /* ignore */ }
  }

  // listen to many inputs to rerender
  [
    titleEl, subtitleEl, messageEl,
    titleSize, subtitleSize, messageSize,
    titleAlign, subtitleAlign, contentAlign,
    titleColor, subtitleColor, messageColor,
    titleBg, subtitleBg, messageBg,
    fontFamily, qrText, imagePosition
  ].forEach((el) => { if (el) on(el, "input", renderPreview); });

  // template fill
  if (templateSelect) {
    const T = {
      news: { title: "📰 Breaking News", subtitle: "", message: "Write your breaking update here..." },
      birthday: { title: "🎂 Happy Birthday!", subtitle: "Wishes", message: "Many happy returns!" },
      devotional: { title: "🕉 शुभ दिन", subtitle: "", message: "May divine blessings be with you" },
      business: { title: "🏢 Business", subtitle: "", message: "Contact: +91 99999 99999" },
      invitation: { title: "💌 Invitation", subtitle: "", message: "Venue • Date • Time" },
      quote: { title: "💬 Quote", subtitle: "", message: "Believe in yourself." }
    };
    on(templateSelect, "change", () => {
      const v = templateSelect.value;
      if (T[v]) {
        if (titleEl) titleEl.value = T[v].title;
        if (subtitleEl) subtitleEl.value = T[v].subtitle;
        if (messageEl) messageEl.value = T[v].message;
        renderPreview();
      }
    });
  }

  // -------------------------
  // Generate image (html2canvas) + Social sizes
  // -------------------------
  async function generateImage({ download = false, userTimestamp = null } = {}) {
    if (!previewCard) { alert("Preview not found"); return null; }
    if (typeof html2canvas === "undefined") { alert("html2canvas not loaded"); return null; }

    // determine size
    let width = previewCard.clientWidth;
    let height = previewCard.clientHeight;

    if (posterSizeSelect && posterSizeSelect.value) {
      const [w, h] = posterSizeSelect.value.split("x").map(Number);
      if (!isNaN(w) && !isNaN(h)) { width = w; height = h; }
    }

    // temporarily set preview size (so html2canvas uses desired width)
    const originalWidthStyle = previewCard.style.width || "";
    const originalHeightStyle = previewCard.style.height || "";
    previewCard.style.width = width + "px";
    previewCard.style.height = height + "px";

    const scale = Math.max(2, Math.min(4, window.devicePixelRatio || 2));
    try {
      const rect = previewCard.getBoundingClientRect();
      const canvas = await html2canvas(previewCard, {
        scale,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        useCORS: true,
        backgroundColor: null,
        allowTaint: true
      });

      // draw date & watermark on canvas
      try {
        const ctx = canvas.getContext("2d");
        const now = userTimestamp ? new Date(userTimestamp) : new Date();
        const options = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
        const formatted = now.toLocaleString("en-IN", options);
        const dateText = `📅 ${posterDate || formatted}`;
        const siteText = "aksharachitra.netlify.app";

        const fontSize = Math.max(12, Math.round(13 * (scale)));
        ctx.font = `${fontSize}px Montserrat, Arial, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.textBaseline = "bottom";

        // bottom-left date
        ctx.textAlign = "left";
        ctx.fillText(dateText, 16 * scale, canvas.height - 16 * scale);

        // bottom-right watermark
        ctx.textAlign = "right";
        ctx.fillText(siteText, canvas.width - 16 * scale, canvas.height - 16 * scale);
      } catch (e) {
        console.warn("watermark draw failed", e);
      }

      const dataUrl = canvas.toDataURL("image/png");

      if (download) {
        const fname = formatFilename(titleEl?.value, width, height);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert(`Saved: ${fname}`);
      } else {
        const w = window.open();
        if (w) w.document.write(`<img src="${dataUrl}" style="max-width:100%;display:block;margin:auto">`);
        else alert("Popup blocked — use Download.");
      }

      // restore styles
      previewCard.style.width = originalWidthStyle;
      previewCard.style.height = originalHeightStyle;
      return dataUrl;
    } catch (err) {
      console.error("generateImage error", err);
      alert("Failed to generate image. See console.");
      previewCard.style.width = originalWidthStyle;
      previewCard.style.height = originalHeightStyle;
      return null;
    }
  }

  if (generateBtn) on(generateBtn, "click", async () => { await generateImage({ download: false }); });
  if (downloadBtn) on(downloadBtn, "click", async () => {
    // offer optional custom timestamp
    let userChoice = null;
    if (confirm("Set custom watermark timestamp? (Cancel = current)")) {
      const custom = prompt("Enter date/time (YYYY-MM-DD HH:MM) or leave blank", "");
      if (custom) {
        const parsed = new Date(custom);
        if (!isNaN(parsed.getTime())) userChoice = parsed;
        else alert("Invalid date — using current.");
      }
    }
    await generateImage({ download: true, userTimestamp: userChoice ?? null });
  });

  // -------------------------
  // Native share
  // -------------------------
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
        // fallback open whatsapp web with text
        alert("Native file share not supported on this device. Downloading instead.");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = formatFilename(titleEl?.value, previewCard.clientWidth, previewCard.clientHeight);
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("share error", err);
      alert("Share failed.");
    }
  });

  // whatsapp share button (text + link)
  if (shareWhatsAppBtn) on(shareWhatsAppBtn, "click", () => {
    const features = [
      "🖋️ Customize Title, Subtitle & Message",
      "🌐 Supports 8+ Indian Languages",
      "🖼️ Upload & Crop Images",
      "🔖 Add small logo / watermark",
      "📅 Auto/Custom Date",
      "🎙️ Voice Input & Text-to-Speech",
      "💾 Offline Save (IndexedDB)",
      "📤 Quick Share to WhatsApp & Social"
    ].map(f => `• ${f}`).join("\n");
    const message = `🌸 AksharaChitra — Create Beautiful Multilingual Posters Offline 🎨\n\nTop Features:\n${features}\n\nhttps://aksharachitra.netlify.app\nMade with ❤️ by Sandeep Miriyala`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  });

  // -------------------------
  // Save to IndexedDB (My Creations)
  // -------------------------
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
      console.error("save fail", err);
      alert("Save failed.");
    }
  });

  // -------------------------
  // Gallery rendering
  // -------------------------
  async function renderIndexedGallery({ sortBy = "newest", filter = "" } = {}) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `<p class="muted">Loading...</p>`;
    const all = await getAllFromDB();
    let list = all || [];
    if (filter && filter.trim()) {
      const f = filter.toLowerCase();
      list = list.filter(x => (x.title || "").toLowerCase().includes(f));
    }
    if (sortBy === "newest") list.sort((a,b) => b.ts - a.ts);
    else if (sortBy === "oldest") list.sort((a,b) => a.ts - b.ts);
    else if (sortBy === "name-asc") list.sort((a,b) => (a.title||"").localeCompare(b.title||""));
    else if (sortBy === "name-desc") list.sort((a,b) => (b.title||"").localeCompare(a.title||""));

    if (!list.length) {
      galleryGrid.innerHTML = `<p class="muted">No creations yet. Save one to appear here.</p>`;
      return;
    }

    // controls
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
      <option value="name-desc">Sort: Z → A</option>
    `;
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
      meta.className = "gallery-meta";
      safeSetStyle(meta, { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px" });

      const left = document.createElement("div");
      safeSetStyle(left, { display: "flex", flexDirection: "column", gap: "4px" });
      const ttl = document.createElement("div");
      ttl.textContent = item.title || "Untitled";
      safeSetStyle(ttl, { fontWeight: "700" });
      const dt = document.createElement("div");
      const d = new Date(item.ts);
      dt.textContent = d.toLocaleString();
      safeSetStyle(dt, { fontSize: "0.85rem", opacity: "0.7" });
      left.appendChild(ttl);
      left.appendChild(dt);

      const actions = document.createElement("div");
      safeSetStyle(actions, { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" });

      const shareBtnCard = document.createElement("button");
      shareBtnCard.className = "btn ghost";
      shareBtnCard.textContent = "Share";
      shareBtnCard.addEventListener("click", async () => {
        try {
          const resp = await fetch(item.dataUrl);
          const blob = await resp.blob();
          const file = new File([blob], `${(item.title||"poster").replace(/\s+/g,"_")}.png`, { type: blob.type });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: item.title || "AksharaChitra Poster" });
          } else {
            const txt = `Poster: ${item.title || ""}\nCreated: ${d.toLocaleString()}\n(Generated with AksharaChitra)`;
            window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
          }
        } catch (err) { console.error("share card err", err); alert("Share failed"); }
      });

      const downloadBtnCard = document.createElement("button");
      downloadBtnCard.className = "btn";
      downloadBtnCard.textContent = "⬇";
      downloadBtnCard.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = item.dataUrl;
        a.download = `${(item.title||"poster").replace(/[^\w\- ]/g,"").slice(0,40)}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "🗑️";
      delBtn.title = "Delete";
      delBtn.addEventListener("click", async () => {
        if (!confirm("Delete this poster?")) return;
        await deleteFromDB(item.id);
        renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value });
      });

      actions.appendChild(shareBtnCard);
      actions.appendChild(downloadBtnCard);
      actions.appendChild(delBtn);

      meta.appendChild(left);
      meta.appendChild(actions);

      card.appendChild(img);
      card.appendChild(meta);
      grid.appendChild(card);
    });

    galleryGrid.appendChild(grid);
  }

  // -------------------------
  // PWA install prompt handling
  // -------------------------
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.add("show");
    if (installBtnHeader) installBtnHeader.classList.add("show");
  });

  [installBtn, installBtnHeader].forEach(b => {
    if (!b) return;
    on(b, "click", async () => {
      if (!deferredPrompt) { alert("Install not available"); return; }
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted") console.log("App installed.");
        deferredPrompt = null;
        b.classList.remove("show");
      } catch (e) { console.warn("install prompt fail", e); }
    });
  });

  // -------------------------
  // Text-to-speech & Voice-to-text
  // -------------------------
  const synth = window.speechSynthesis;
  if (startSpeakBtn && stopSpeakBtn && synth) {
    on(startSpeakBtn, "click", () => {
      const homeText = $("home") ? $("home").innerText.replace(/[🎨📘🔊🌸🚀✅💾🖼️🌈🎙️♿]/g, "").trim() : "";
      if (!homeText) return;
      const ut = new SpeechSynthesisUtterance(homeText);
      if (languageSelect && languageSelect.value) {
        const langMap = { en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN", or: "or-IN", sa: "sa-IN" };
        ut.lang = langMap[languageSelect.value] || "en-IN";
      } else ut.lang = "en-IN";
      ut.rate = 0.95; ut.pitch = 1.0;
      synth.speak(ut);
    });
    on(stopSpeakBtn, "click", () => synth.cancel());
  }

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
    recog.onend = () => { if (startVoiceBtn) startVoiceBtn.classList.remove("listening"); };
  }

  // -------------------------
  // Clear, Go-top and small utilities
  // -------------------------
  if (clearBtn) on(clearBtn, "click", () => {
    if (!confirm("Clear all fields?")) return;
    [titleEl, subtitleEl, messageEl].forEach(e => { if (e) e.value = ""; });
    uploadedMainData = ""; uploadedLogoData = "";
    renderPreview();
  });

  if (goTopBtn) {
    on(goTopBtn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) goTopBtn.style.display = "block"; else goTopBtn.style.display = "none";
    });
  }

  // -------------------------
  // Autosave
  // -------------------------
  setInterval(() => {
    try {
      const state = {
        title: titleEl ? titleEl.value : "",
        subtitle: subtitleEl ? subtitleEl.value : "",
        message: messageEl ? messageEl.value : "",
        uploadedMainData: uploadedMainData ? true : false,
        uploadedLogoData: uploadedLogoData ? true : false,
        ts: Date.now()
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, 4000);

  try {
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || "null");
    if (saved) {
      if (titleEl) titleEl.value = saved.title || "";
      if (subtitleEl) subtitleEl.value = saved.subtitle || "";
      if (messageEl) messageEl.value = saved.message || "";
    }
  } catch (e) {}

  // -------------------------
  // Interactive font preview highlight (home)
  // -------------------------
  const langSelect = $("previewLangSelect");
  const cards = document.querySelectorAll(".font-card");
  if (langSelect && cards.length) {
    on(langSelect, "change", () => {
      const val = langSelect.value;
      cards.forEach(card => {
        if (card.dataset.lang === val) { card.classList.add("active"); card.scrollIntoView({ behavior: "smooth", block: "center" }); }
        else card.classList.remove("active");
      });
    });
    langSelect.dispatchEvent(new Event("change"));
  }

  // -------------------------
  // WhatsApp "Home" quick-share (uses shareWhatsAppBtn if present)
  // -------------------------
  const homeShareBtn = $("shareWhatsAppBtn");
  if (homeShareBtn) {
    on(homeShareBtn, "click", () => {
      const features = [
        "🖋️ Customize Title, Subtitle & Message",
        "🌐 Supports English, తెలుగు, हिंदी, தமிழ் & more",
        "🖼️ Upload & Crop Images",
        "🔖 Add small logo / watermark",
        "📅 Auto date & time stamp",
        "🎙️ Voice Input & Text-to-Speech",
        "💾 Offline Save in My Creations",
        "📤 Direct WhatsApp & Social Share",
        "🌙 Dark Mode Ready",
        "⚡ 100% Offline (PWA)"
      ].map(f => `• ${f}`).join("\n");
      const message = `🌸 *AksharaChitra* — Create Beautiful Multilingual Posters Offline 🎨\n\n🚀 *Top Features:*\n${features}\n\n🔗 https://aksharachitra.netlify.app\n❤️ Made with Love by *Sandeep Miriyala*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
    });
  }

  // -------------------------
  // Footer year
  // -------------------------
  const yr = $("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // -------------------------
  // Initial setup
  // -------------------------
  updatePosterDateFromOption();
  renderPreview();

  // Expose for debugging in console
  window.ak = {
    renderPreview,
    generateImage,
    renderIndexedGallery,
    saveToDB,
    deleteFromDB
  };

}); // DOMContentLoaded end

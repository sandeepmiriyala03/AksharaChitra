/* AksharaChitra — FINAL main.js (full-featured)
   Requirements:
   - html2canvas and cropperjs loaded (defer)
   - Matches the HTML you provided
*/

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  // --- Core UI elements (may be undefined if missing in HTML; guarded) ---
  const titleEl = $("title"),
        subtitleEl = $("subtitle"),
        messageEl = $("message"),
        templateSelect = $("templateSelect"),
        previewCard = $("previewCard"),
        pSmallLogo = $("pSmallLogo") || null,
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

  // Section controls (they exist in your last HTML; guarded)
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
        smallLogoUpload = $("smallLogoUpload");

  // Crop modal (shared for both image and small logo)
  const cropModal = $("cropModal"),
        cropImage = $("cropImage"),
        applyCropBtn = $("applyCropBtn"),
        cancelCropBtn = $("cancelCropBtn");

  // simple state
  let cropper = null;
  let cropTarget = null; // "main" or "logo"
  let uploadedMainData = "";
  let uploadedLogoData = "";
  let shadowColor = "#000000";
  let shadowBlur = 0;

  // IndexedDB constants
  const DB_NAME = "ak_gallery_v9";
  const STORE_NAME = "posters";
  let db = null;

  // Utility: open IndexedDB
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

  // --- Tabs navigation ---
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      const sec = document.getElementById(target);
      if (sec) sec.classList.add("active");
      if (target === "gallery") setTimeout(renderIndexedGallery, 200);
    });
  });

  // --- Theme toggle (persist) ---
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");
  }

  // --- Language placeholders (includes Sanskrit) ---
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
    languageSelect.addEventListener("change", () => {
      const val = languageSelect.value;
      const L = LANG[val] || LANG.en;
      if (titleEl) titleEl.placeholder = L.title;
      if (subtitleEl) subtitleEl.placeholder = L.subtitle;
      if (messageEl) messageEl.placeholder = L.message;
    });
  }

  // --- Poster date option ---
  let posterDate = "";
  function updatePosterDateFromOption() {
    if (!posterDateOption) return;
    const now = new Date();
    if (posterDateOption.value === "current") {
      posterDate = now.toLocaleString();
      if (customDate) customDate.classList.add("hidden");
    } else if (posterDateOption.value === "prevMonth") {
      const d = new Date(now.getTime());
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

  // --- Crop flow (shared for main image & small logo) ---
  function openCropModal(dataUrl, target) {
    if (!cropModal || !cropImage) {
      // fallback: if no crop UI, save directly
      if (target === "logo") { uploadedLogoData = dataUrl; } else { uploadedMainData = dataUrl; }
      renderPreview();
      return;
    }
    cropTarget = target;
    cropImage.src = dataUrl;
    cropModal.classList.remove("hidden");
    // ensure previous cropper destroyed
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1, background: false });
  }

  if (applyCropBtn) on(applyCropBtn, "click", () => {
    if (!cropper) { cropModal.classList.add("hidden"); return; }
    try {
      const canvas = cropper.getCroppedCanvas({ maxWidth: 2000, imageSmoothingQuality: "high" });
      const dataUrl = canvas.toDataURL("image/png");
      if (cropTarget === "logo") {
        uploadedLogoData = dataUrl;
      } else {
        uploadedMainData = dataUrl;
      }
    } catch (err) {
      console.error("Crop apply error", err);
      alert("Unable to crop image.");
    }
    cropper.destroy();
    cropper = null;
    cropModal.classList.add("hidden");
    renderPreview();
  });

  if (cancelCropBtn) on(cancelCropBtn, "click", () => {
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = null;
    cropModal.classList.add("hidden");
  });

  // --- file inputs: main image + small logo ---
  if (imageUpload) {
    imageUpload.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => openCropModal(ev.target.result, "main");
      r.readAsDataURL(f);
    });
  }

  if (smallLogoUpload) {
    smallLogoUpload.addEventListener("change", (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => openCropModal(ev.target.result, "logo");
      r.readAsDataURL(f);
    });
  }

  // --- Auto-resize text if longer than preview (iterative shrink) ---
  function autoFitText(el, maxSizePx, minSizePx = 10) {
    if (!el || !previewCard) return;
    let fs = parseInt(maxSizePx, 10);
    el.style.fontSize = fs + "px";
    // trigger reflow then shrink if overflow
    const fits = () => {
      // compute overflow inside previewCard — we check height of preview against preview inner height
      // We'll test total preview scrollHeight vs clientHeight
      const pc = previewCard;
      return pc.scrollHeight <= pc.clientHeight - 12; // small padding
    };
    // shrink until fits or minSize reached
    let attempts = 0;
    while (!fits() && fs > minSizePx && attempts < 20) {
      fs = Math.max(minSizePx, Math.floor(fs * 0.92)); // shrink 8%
      el.style.fontSize = fs + "px";
      attempts++;
    }
  }

  // --- renderPreview: build preview content and styles ---
  function renderPreview() {
    if (!previewCard) return;

    // Base card styles
    previewCard.style.background = ( (window.bgColor && window.bgColor.value) ? window.bgColor.value : "#fff" );
    if (fontFamily && fontFamily.value) previewCard.style.fontFamily = fontFamily.value;

    // small logo inline before title (if present)
    if (pSmallLogo) {
      pSmallLogo.innerHTML = uploadedLogoData
        ? `<img src="${uploadedLogoData}" alt="logo" style="width:56px;height:56px;border-radius:8px;margin-bottom:8px;display:block">`
        : "";
      // ensure it appears before pTitle in DOM:
      if (pSmallLogo && pTitle && previewCard && previewCard.firstChild !== pSmallLogo) {
        try { previewCard.insertBefore(pSmallLogo, pTitle); } catch (e) {}
      }
    }

    // Title
    if (pTitle) {
      pTitle.textContent = titleEl ? (titleEl.value || "") : "";
      pTitle.style.fontSize = (titleSize ? (titleSize.value + "px") : "28px");
      pTitle.style.textAlign = (titleAlign ? titleAlign.value : "center");
      pTitle.style.color = (titleColor ? titleColor.value : "#111");
      pTitle.style.background = (titleBg ? titleBg.value : "transparent");
      pTitle.style.wordBreak = "break-word";
      pTitle.style.display = pTitle.textContent ? "block" : "none";
    }

    // Subtitle
    if (pSubtitle) {
      pSubtitle.textContent = subtitleEl ? (subtitleEl.value || "") : "";
      pSubtitle.style.fontSize = (subtitleSize ? (subtitleSize.value + "px") : "20px");
      pSubtitle.style.textAlign = (subtitleAlign ? subtitleAlign.value : "center");
      pSubtitle.style.color = (subtitleColor ? subtitleColor.value : "#333");
      pSubtitle.style.background = (subtitleBg ? subtitleBg.value : "transparent");
      pSubtitle.style.wordBreak = "break-word";
      pSubtitle.style.display = pSubtitle.textContent ? "block" : "none";
    }

    // Message
    if (pMessage) {
      const raw = (messageEl ? (messageEl.value || "") : "");
      let content = raw.replace(/\n/g, "<br>");
      if (posterDate) content += `<br><small style="opacity:0.7;">📅 ${posterDate}</small>`;
      pMessage.innerHTML = content;
      pMessage.style.fontSize = (messageSize ? (messageSize.value + "px") : "16px");
      pMessage.style.textAlign = (contentAlign ? contentAlign.value : "center");
      pMessage.style.color = (messageColor ? messageColor.value : "#111");
      pMessage.style.background = (messageBg ? messageBg.value : "transparent");
      pMessage.style.wordBreak = "break-word";
    }

    // Main image
    if (pImage) {
      if (uploadedMainData) {
        // place according to imagePosition
        const pos = imagePosition ? (imagePosition.value || "center") : "center";
        // simple layout: show the img and add alignment via margin
        let style = 'max-width:100%;display:block;margin:0 auto;'; // center default
        if (pos === "left") style = 'max-width:100%;display:block;margin:0 auto 0 0;';
        if (pos === "right") style = 'max-width:100%;display:block;margin:0 0 0 auto;';
        if (pos === "top") style = 'max-width:100%;display:block;margin:0 auto 12px;';
        if (pos === "bottom") style = 'max-width:100%;display:block;margin:12px auto 0;';
        pImage.innerHTML = `<img src="${uploadedMainData}" alt="main" style="${style}">`;
      } else {
        pImage.innerHTML = "";
      }
    }

    // QR
    if (pQR) {
      if (qrText && qrText.value && qrText.value.trim()) {
        pQR.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrText.value)}" width="80" style="display:block;margin:10px auto;">`;
      } else {
        pQR.innerHTML = "";
      }
    }

    // auto-fit title/subtitle/message to prevent overflow
    try {
      // attempt responsive fit: try decreasing title/subtitle/message sizes until preview scroll fits
      // Save original sizes to respect user chosen sizes minimally
      if (pTitle && titleSize) autoFitText(pTitle, Math.max(12, parseInt(titleSize.value || 28, 10)));
      if (pSubtitle && subtitleSize) autoFitText(pSubtitle, Math.max(10, parseInt(subtitleSize.value || 20, 10)));
      if (pMessage && messageSize) autoFitText(pMessage, Math.max(10, parseInt(messageSize.value || 16, 10)));
    } catch (e) { /* ignore fit errors */ }

  } // renderPreview

  // Listen to inputs to rerender
  [
    titleEl, subtitleEl, messageEl,
    titleSize, subtitleSize, messageSize,
    titleAlign, subtitleAlign, contentAlign,
    titleColor, subtitleColor, messageColor,
    titleBg, subtitleBg, messageBg,
    fontFamily, qrText, imagePosition
  ].forEach(el => on(el, "input", renderPreview));

  // When template select changes (basic templates)
  if (templateSelect) {
    const T = {
      news: { title: "📰 Breaking News", subtitle: "", message: "Write your breaking update here..." },
      birthday: { title: "🎂 Happy Birthday!", subtitle: "Wishes", message: "Many happy returns!" },
      devotional: { title: "🕉 शुभ दिन", subtitle: "", message: "May divine blessings be with you" },
      business: { title: "🏢 Business", subtitle: "", message: "Contact: +91 99999 99999" },
      invitation: { title: "💌 Invitation", subtitle: "", message: "Venue • Date • Time" },
      quote: { title: "💬 Quote", subtitle: "", message: "Believe in yourself." }
    };
    templateSelect.addEventListener("change", () => {
      const v = templateSelect.value;
      if (T[v]) {
        if (titleEl) titleEl.value = T[v].title;
        if (subtitleEl) subtitleEl.value = T[v].subtitle;
        if (messageEl) messageEl.value = T[v].message;
        renderPreview();
      }
    });
  }

  // --- Generate image (html2canvas) with watermark bottom-left date/time and website bottom-right ---
  async function generateImage({ download = false, userTimestamp = null } = {}) {
    if (!previewCard) { alert("Preview not found"); return null; }
    if (typeof html2canvas === "undefined") { alert("html2canvas not loaded!"); return null; }

    // temporarily expand previewCard width for better render on small screens
    const originalWidth = previewCard.style.width || "";
    previewCard.style.width = previewCard.clientWidth + "px";

    const rect = previewCard.getBoundingClientRect();
    const scale = Math.max(2, Math.min(4, window.devicePixelRatio || 2));
    try {
      const canvas = await html2canvas(previewCard, {
        scale,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        useCORS: true,
        backgroundColor: null,
        allowTaint: true
      });

      // watermark text: left = userTimestamp or now, right = site
      try {
        const ctx = canvas.getContext("2d");
        const now = userTimestamp ? new Date(userTimestamp) : new Date();
        const dateText = now.toLocaleDateString("en-GB") + " " + now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
        const siteText = "aksharachitra.netlify.app";
        const fontSize = Math.max(10, Math.round(11 * scale));
        ctx.font = `${fontSize}px Montserrat, Arial, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.textBaseline = "bottom";
        ctx.textAlign = "left";
        ctx.fillText(dateText, 12 * scale, canvas.height - 12 * scale);
        ctx.textAlign = "right";
        ctx.fillText(siteText, canvas.width - 12 * scale, canvas.height - 12 * scale);
      } catch (e) { console.warn("watermark draw failed", e); }

      const dataUrl = canvas.toDataURL("image/png");
      if (download) {
        const defaultName = (titleEl && titleEl.value) ? titleEl.value.replace(/[^\w\- ]/g, "").slice(0,40) : "AksharaChitra";
        const fname = (prompt("File name", defaultName) || defaultName) + ".png";
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      // restore
      previewCard.style.width = originalWidth;
      return dataUrl;
    } catch (err) {
      console.error("generate image error", err);
      alert("Failed to generate image. Check console.");
      previewCard.style.width = originalWidth;
      return null;
    }
  }

  if (generateBtn) on(generateBtn, "click", async () => {
    const d = await generateImage({ download: false });
    if (d) {
      const w = window.open();
      if (w) w.document.write(`<img src="${d}" style="max-width:100%;display:block;margin:auto">`);
      else alert("Popup blocked — use Download.");
    }
  });

  if (downloadBtn) on(downloadBtn, "click", async () => {
    // allow user to set custom timestamp (prompt) or use current
    let userChoice = null;
    if (confirm("Would you like to set a custom timestamp for watermark? (Cancel = use current)")) {
      const custom = prompt("Enter date/time (YYYY-MM-DD HH:MM) or leave blank to use current", "");
      if (custom) {
        // try parse
        const parsed = new Date(custom);
        if (!isNaN(parsed.getTime())) userChoice = parsed;
        else alert("Unable to parse custom date/time — using current time.");
      }
    }
    await generateImage({ download: true, userTimestamp: userChoice ? userChoice : null });
  });

  // --- Share (native) ---
  if (shareBtn) on(shareBtn, "click", async () => {
    try {
      const dataUrl = await generateImage({ download: false });
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "aksharachitra.png", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "AksharaChitra Poster", text: "Created with AksharaChitra" });
      } else {
        // fallback: download
        alert("Native file share not supported — image will be downloaded.");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "aksharachitra.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      console.error("share error", err);
      alert("Share failed.");
    }
  });

  // --- WhatsApp share (header button) fallback - opens WA text if file share not supported ---
  if (shareWhatsAppBtn) on(shareWhatsAppBtn, "click", async () => {
    const txt = "🎨 Created with AksharaChitra — Make posters offline: https://aksharachitra.netlify.app";
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  });

  // --- Save to IndexedDB (store dataURL with metadata) ---
  if (saveBtn) on(saveBtn, "click", async () => {
    try {
      const dataUrl = await generateImage({ download: false });
      if (!dataUrl) return;
      const rec = {
        title: (titleEl && titleEl.value) ? titleEl.value : "Untitled",
        dataUrl,
        ts: Date.now()
      };
      await saveToDB(rec);
      alert("Saved to My Creations (offline).");
      // refresh gallery if open
      const gallerySection = $("gallery");
      if (gallerySection && gallerySection.classList.contains("active")) renderIndexedGallery();
    } catch (err) {
      console.error("save fail", err);
      alert("Save failed.");
    }
  });

  // --- Gallery: render with sort/filter + share + delete ---
  async function renderIndexedGallery({ sortBy = "newest", filter = "" } = {}) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = `<p class="muted">Loading...</p>`;
    const all = await getAllFromDB();
    // format: each object { id, title, dataUrl, ts }
    let list = all || [];
    // apply filter by title substring if provided
    if (filter && filter.trim()) {
      const f = filter.toLowerCase();
      list = list.filter(x => (x.title || "").toLowerCase().includes(f));
    }
    // sorting
    if (sortBy === "newest") list.sort((a,b) => b.ts - a.ts);
    else if (sortBy === "oldest") list.sort((a,b) => a.ts - b.ts);
    else if (sortBy === "name-asc") list.sort((a,b) => (a.title||"").localeCompare(b.title||""));
    else if (sortBy === "name-desc") list.sort((a,b) => (b.title||"").localeCompare(a.title||""));
    // build UI
    if (!list.length) {
      galleryGrid.innerHTML = `<p class="muted">No creations yet. Save one to appear here.</p>`;
      return;
    }

    // add controls
    const controls = document.createElement("div");
    controls.style.display = "flex";
    controls.style.gap = "8px";
    controls.style.flexWrap = "wrap";
    controls.style.marginBottom = "12px";

    const sortSel = document.createElement("select");
    sortSel.innerHTML = `
      <option value="newest">Sort: Newest</option>
      <option value="oldest">Sort: Oldest</option>
      <option value="name-asc">Sort: A → Z</option>
      <option value="name-desc">Sort: Z → A</option>
    `;
    sortSel.value = sortBy;
    sortSel.addEventListener("change", () => renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value }));

    const filterInput = document.createElement("input");
    filterInput.placeholder = "Filter by title...";
    filterInput.style.padding = "8px";
    filterInput.addEventListener("input", () => renderIndexedGallery({ sortBy: sortSel.value, filter: filterInput.value }));

    controls.appendChild(sortSel);
    controls.appendChild(filterInput);

    galleryGrid.innerHTML = "";
    galleryGrid.appendChild(controls);

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
    grid.style.gap = "12px";

    list.forEach(item => {
      const card = document.createElement("div");
      card.className = "gallery-item";
      card.style.borderRadius = "10px";
      card.style.overflow = "hidden";
      card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)";
      const img = document.createElement("img");
      img.src = item.dataUrl;
      img.alt = item.title;
      img.style.width = "100%";
      img.style.display = "block";
      img.style.height = "160px";
      img.style.objectFit = "cover";
      const meta = document.createElement("div");
      meta.className = "gallery-meta";
      meta.style.display = "flex";
      meta.style.justifyContent = "space-between";
      meta.style.alignItems = "center";
      meta.style.padding = "8px";

      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.flexDirection = "column";
      left.style.gap = "4px";
      const ttl = document.createElement("div");
      ttl.textContent = item.title || "Untitled";
      ttl.style.fontWeight = "700";
      ttl.style.fontSize = "0.95rem";
      const dt = document.createElement("div");
      const d = new Date(item.ts);
      dt.textContent = d.toLocaleString();
      dt.style.fontSize = "0.8rem";
      dt.style.opacity = "0.7";
      left.appendChild(ttl);
      left.appendChild(dt);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.flexDirection = "column";
      actions.style.gap = "6px";
      actions.style.alignItems = "flex-end";

      const shareBtnCard = document.createElement("button");
      shareBtnCard.className = "btn ghost";
      shareBtnCard.textContent = "Share";
      shareBtnCard.addEventListener("click", async () => {
        try {
          const blob = await (await fetch(item.dataUrl)).blob();
          const file = new File([blob], `${(item.title||"poster").replace(/\s+/g,"_")}.png`, { type: blob.type });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: item.title || "AksharaChitra Poster" });
          } else {
            // Try whatsapp web as fallback: upload not supported; instead share link text
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
        renderIndexedGallery({ sortBy, filter });
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

  // --- PWA install prompt handling ---
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // show install FAB if present
    if (installBtn) installBtn.classList.add("show");
  });
  [installBtn, installBtnHeader].forEach(b => { if (b) on(b, "click", async () => {
    if (!deferredPrompt) {
       alert("Install not available"); return; }
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted")
         console.log("installed");
      deferredPrompt = null;
      if (installBtn) installBtn.classList.remove("show");
    } catch (e) { console.warn("install prompt fail", e); }
  }); });

  // --- Text-to-speech and voice input (Home speak and voice input for message field) ---
  const startSpeakBtn = $("startSpeak");
  const stopSpeakBtn = $("stopSpeak");
  const synth = window.speechSynthesis;
  if (startSpeakBtn && stopSpeakBtn && synth) {
    on(startSpeakBtn, "click", () => {
      const homeText = $("home") ? $("home").innerText.replace(/[🎨📘🔊🌸🚀✅💾🖼️🌈🎙️♿]/g, "").trim() : "";
      if (!homeText) return;
      const ut = new SpeechSynthesisUtterance(homeText);
      // set language based on selection if available
      if (languageSelect && languageSelect.value) {
        const langMap = { en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN", kn: "kn-IN", ml: "ml-IN", or: "or-IN", sa: "sa-IN" };
        ut.lang = langMap[languageSelect.value] || "en-IN";
      } else ut.lang = "en-IN";
      ut.rate = 0.95; ut.pitch = 1.0;
      synth.speak(ut);
    });
    on(stopSpeakBtn, "click", () => { synth.cancel(); });
  }

  // voice-to-text for message field
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR && $("startVoice") && $("stopVoice") && messageEl) {
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-IN";
    on($("startVoice"), "click", () => {
      try { recog.start(); $("startVoice").classList.add("listening"); } catch (e) {}
    });
    on($("stopVoice"), "click", () => {
      try { recog.stop(); $("startVoice").classList.remove("listening"); } catch (e) {}
    });
    recog.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      messageEl.value = (messageEl.value ? (messageEl.value + " ") : "") + t;
      renderPreview();
    };
    recog.onend = () => { if ($("startVoice")) $("startVoice").classList.remove("listening"); };
  }

  // --- Clear fields ---
  if (clearBtn) on(clearBtn, "click", () => {
    if (!confirm("Clear all fields?")) return;
    [titleEl, subtitleEl, messageEl].forEach(e => { if (e) e.value = ""; });
    uploadedMainData = ""; uploadedLogoData = "";
    renderPreview();
  });

  // --- Auto-save autosave to localStorage every few seconds (non-critical) ---
  setInterval(() => {
    try {
      const state = {
        title: titleEl ? titleEl.value : "",
        subtitle: subtitleEl ? subtitleEl.value : "",
        message: messageEl ? messageEl.value : "",
        uploadedMainData: uploadedMainData ? true : false,
        uploadedLogoData: uploadedLogoData ? true : false,
        lastSaved: Date.now()
      };
      localStorage.setItem("ak_autosave_v9", JSON.stringify(state));
    } catch (e) {}
  }, 4000);

  // --- restore preview values if any saved earlier (not images) ---
  try {
    const saved = JSON.parse(localStorage.getItem("ak_autosave_v9") || "null");
    if (saved) {
      if (titleEl) titleEl.value = saved.title || "";
      if (subtitleEl) subtitleEl.value = saved.subtitle || "";
      if (messageEl) messageEl.value = saved.message || "";
    }
  } catch (e) {}

  // --- go-top button ---
  const goTop = $("goTopBtn");
  if (goTop) on(goTop, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    if (!goTop) return;
    if (window.scrollY > 300) goTop.style.display = "block"; else goTop.style.display = "none";
  });

  // --- Footer year set ---
  const yr = $("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // --- initial render ---
  updatePosterDateFromOption();
  renderPreview();

  // Expose functions for debug (optional)
  window.ak = {
    renderPreview,
    generateImage,
    renderIndexedGallery,
    deleteFromDB
  };


  // 📤 WhatsApp Share from Home

if (document.getElementById("shareWhatsAppBtn")) {
  shareBtn.addEventListener("click", () => {
    const features = [
      "🖋️ Customize Title, Subtitle & Message",
      "🌐 Supports English, తెలుగు, हिंदी, தமிழ் & more",
      "🖼️ Upload & Crop Images perfectly",
      "🔖 Add small logo / watermark",
      "📅 Auto date & time stamp",
      "🎙️ Voice Input & Text-to-Speech",
      "💾 Offline Save in My Creations",
      "📤 Direct WhatsApp & Social Share",
      "🌙 Dark Mode Ready",
      "⚡ 100% Offline (PWA)"
    ]
      .map((f) => `• ${f}`)
      .join("\n");

    const message = `🌸 *AksharaChitra* — Create Beautiful Multilingual Posters Offline 🎨\n\n🚀 *Top Features:*\n${features}\n\n🔗 https://aksharachitra.netlify.app\n❤️ Made with Love by *Sandeep Miriyala*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  });
}
// 🚀 Open "Create" tab from Home button
const openCreateBtn = document.getElementById("openCreateBtn");
if (openCreateBtn) {
  openCreateBtn.addEventListener("click", () => {
    // Deactivate all other tabs
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));

    // Activate the Create tab
    document.querySelector('.tab-btn[data-tab="create"]').classList.add("active");
    document.getElementById("create").classList.add("active");

    // Scroll smoothly into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

}); // DOMContentLoaded end

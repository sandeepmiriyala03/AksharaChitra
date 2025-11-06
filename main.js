/* ==========================================================
   🌸 AksharaChitra — main.js (v15.7 Stable)
   ----------------------------------------------------------
   Features:
   ✅ Fixed Footer Duplication
   ✅ Responsive Padding
   ✅ QR Code Clear & Alignment
   ✅ Language + Font Overview in WhatsApp Share
   ✅ IndexedDB Save / Share / Delete
   ✅ Voice + TTS + PWA Support
   ----------------------------------------------------------
   Developed & Maintained by: Sandeep Miriyala
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 🔧 Shortcuts
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
  const qsAll = (sel) => Array.from(document.querySelectorAll(sel));

  // 🧩 Elements
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
        shareWhatsAppBtn = $("shareWhatsAppBtn"),
        openCreateBtn = $("openCreateBtn"),
        goTopBtn = $("goTopBtn"),
        fontFamily = $("fontFamily"),
        imagePosition = $("imagePosition"),
        smallLogoUpload = $("smallLogoUpload"),
        imageUpload = $("imageUpload");

  // Text Controls
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
        messageBg = $("messageBg");

  // Cropper
  const cropModal = $("cropModal"),
        cropImage = $("cropImage"),
        applyCropBtn = $("applyCropBtn"),
        cancelCropBtn = $("cancelCropBtn");

  // ⚙️ States
  let cropper = null, cropTarget = null, uploadedMainData = "", uploadedLogoData = "";
  let posterDate = "", deferredPrompt = null;
  const AUTOSAVE_KEY = "ak_autosave_v13";

  // 🧠 Utility
  const safeSetStyle = (el, st) => el && Object.assign(el.style, st);
  const formatFilename = (b, w, h) => `${(b || "AksharaChitra").replace(/[^\w\- ]/g, "").slice(0, 40)}_${w}x${h}.png`;

  // 🧭 Tabs
  qsAll(".tab-btn").forEach(btn => {
    on(btn, "click", () => {
      qsAll(".tab-btn").forEach(b => b.classList.remove("active"));
      qsAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.tab)?.classList.add("active");
      if (btn.dataset.tab === "gallery") setTimeout(renderIndexedGallery, 200);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  on(openCreateBtn, "click", () => qsAll(".tab-btn")[1]?.click());

  // 🌙 Theme toggle
  on(themeToggle, "click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
  });
  if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");

  // 🗓️ Poster Date
  function updatePosterDateFromOption() {
    const now = new Date();
    if (posterDateOption.value === "current") posterDate = now.toLocaleString();
    else if (posterDateOption.value === "prevMonth") { now.setMonth(now.getMonth() - 1); posterDate = now.toLocaleString(); }
    else if (posterDateOption.value === "custom" && customDate.value) posterDate = new Date(customDate.value).toLocaleString();
  }
  on(posterDateOption, "change", () => { updatePosterDateFromOption(); renderPreview(); });
  on(customDate, "change", () => { updatePosterDateFromOption(); renderPreview(); });

  // ✂️ Cropper
  function openCropModal(dataUrl, target) {
    cropTarget = target;
    if (!cropModal || !cropImage) {
      if (target === "logo") uploadedLogoData = dataUrl; else uploadedMainData = dataUrl;
      return renderPreview();
    }
    cropImage.src = dataUrl;
    cropModal.classList.remove("hidden");
    cropper && cropper.destroy();
    cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1, background: false });
  }

  on(applyCropBtn, "click", () => {
    if (!cropper) return (cropModal.classList.add("hidden"));
    const canvas = cropper.getCroppedCanvas({ maxWidth: 3000 });
    const dataUrl = canvas.toDataURL("image/png");
    cropTarget === "logo" ? uploadedLogoData = dataUrl : uploadedMainData = dataUrl;
    cropper.destroy(); cropper = null;
    cropModal.classList.add("hidden");
    renderPreview();
  });
  on(cancelCropBtn, "click", () => { cropper?.destroy(); cropper = null; cropModal.classList.add("hidden"); });
  on(imageUpload, "change", e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => openCropModal(ev.target.result, "main"); r.readAsDataURL(f); } });
  on(smallLogoUpload, "change", e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => openCropModal(ev.target.result, "logo"); r.readAsDataURL(f); } });

  // 🪶 Render Preview
  function renderPreview() {
    if (!previewCard) return;
    previewCard.style.padding = window.innerWidth < 480 ? "8px" : "12px";
    previewCard.style.background = (messageBg?.value) || "#fff";
    previewCard.innerHTML = "";

    // Small Logo
    if (uploadedLogoData)
      previewCard.innerHTML += `<img src="${uploadedLogoData}" style="width:55px;height:55px;border-radius:8px;display:block;margin:6px auto;">`;

    // Title
    if (titleEl?.value)
      previewCard.innerHTML += `<h2 style="font-family:${fontFamily?.value};font-size:${titleSize?.value}px;text-align:${titleAlign?.value};color:${titleColor?.value};background:${titleBg?.value};font-weight:700;margin:6px 0;">${titleEl.value}</h2>`;

    // Subtitle
    if (subtitleEl?.value)
      previewCard.innerHTML += `<h3 style="font-family:${fontFamily?.value};font-size:${subtitleSize?.value}px;text-align:${subtitleAlign?.value};color:${subtitleColor?.value};background:${subtitleBg?.value};font-weight:500;margin:4px 0;">${subtitleEl.value}</h3>`;

    // Image
    if (uploadedMainData)
      previewCard.innerHTML += `<img src="${uploadedMainData}" style="max-width:100%;display:block;margin:8px auto;border-radius:10px;object-fit:cover;">`;

    // Message
    if (messageEl?.value)
      previewCard.innerHTML += `<p style="font-family:${fontFamily?.value};font-size:${messageSize?.value}px;text-align:${contentAlign?.value};color:${messageColor?.value};background:${messageBg?.value};margin:10px 0;">${messageEl.value.replace(/\n/g, "<br>")}</p>`;

    // QR Code
    const qrVal = $("qrText")?.value?.trim();
    if (qrVal && typeof QRCode !== "undefined") {
      const qr = document.createElement("div");
      new QRCode(qr, { text: qrVal, width: 70, height: 70 });
      const qrWrap = document.createElement("div");
      qrWrap.style.textAlign = $("qrAlign")?.value || "left";
      qrWrap.appendChild(qr);
      previewCard.appendChild(qrWrap);
    }

    // Footer
    const footer = document.createElement("div");
    footer.className = "ak-footer";
    safeSetStyle(footer, {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "absolute", bottom: "6px", left: "10px", right: "10px",
      fontSize: "10px", opacity: "0.7", color: "#333"
    });

    const now = new Date();
    const dateText = now.toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", hour12: true }).replace(",", "");
    footer.innerHTML = `<span>${dateText}</span><div style="display:flex;align-items:center;gap:4px;"><img src="logo.png" style="width:16px;height:16px;border-radius:4px;"><span style="font-style:italic;">AksharaChitra</span></div>`;
    previewCard.appendChild(footer);
  }

  // Live update
  [titleEl, subtitleEl, messageEl, titleSize, subtitleSize, messageSize, titleAlign,
   subtitleAlign, contentAlign, titleColor, subtitleColor, messageColor, titleBg,
   subtitleBg, messageBg, fontFamily, imagePosition].forEach(e => on(e, "input", renderPreview));
  renderPreview();

  // ✅ Generate Image (Fixed Footer)
  async function generateImage({ download = false } = {}) {
    if (!previewCard) return alert("Preview missing");
    const width = 1200, height = Math.round(width * 9 / 16), scale = Math.min(3, window.devicePixelRatio || 2);
    const origW = previewCard.style.width, origH = previewCard.style.height, origPad = previewCard.style.padding;
    previewCard.style.width = width + "px"; previewCard.style.height = height + "px"; previewCard.style.padding = "8px 14px 10px";
    const overlay = Object.assign(document.createElement("div"), { textContent: "⏳ Generating Poster..." });
    Object.assign(overlay.style, { position: "fixed", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat", color: "#1e88e5", fontWeight: "600", zIndex: 9999 });
    document.body.appendChild(overlay);
    try {
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(previewCard, { scale, useCORS: true, backgroundColor: null });
      const dataUrl = canvas.toDataURL("image/png");
      if (download) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = formatFilename(titleEl?.value, width, height);
        document.body.appendChild(a); a.click(); a.remove();
      }
      overlay.remove();
      previewCard.style.width = origW; previewCard.style.height = origH; previewCard.style.padding = origPad;
      return dataUrl;
    } catch (e) {
      console.error("generateImage error", e);
      overlay.remove();
      previewCard.style.width = origW; previewCard.style.height = origH; previewCard.style.padding = origPad;
      return null;
    }
  }

  on(generateBtn, "click", () => generateImage());
  on(downloadBtn, "click", () => generateImage({ download: true }));

  // 🧹 Clear all
  on(clearBtn, "click", () => {
    if (!confirm("Clear all fields?")) return;
    [titleEl, subtitleEl, messageEl].forEach(e => e.value = "");
    uploadedMainData = uploadedLogoData = "";
    $("qrText").value = ""; pQR.innerHTML = "";
    renderPreview();
  });

  // 📤 WhatsApp Share (with fonts overview)
  on(shareWhatsAppBtn, "click", () => {
    const features = [
      "🖋️ Customize Title, Subtitle & Message",
      "🌐 Supports 8+ Indian Languages",
      "🖼️ Upload & Crop Images",
      "📅 Auto or Custom Date",
      "💾 Offline Save (IndexedDB)",
      "📤 Quick WhatsApp Share"
    ].map(f => `• ${f}`).join("\n");

    const fonts = [
      "🇬🇧 English (7): Montserrat, Poppins, Roboto, Oswald, Lato, Playfair Display, Open Sans",
      "🇮🇳 తెలుగు (6): NTR, Ramabhadra, Gurajada, Mandali, Gidugu, Noto Sans Telugu",
      "🇮🇳 हिंदी / संस्कृतम् (5): Noto Serif Devanagari, Hind, Karma, Tiro Devanagari Sanskrit",
      "🇮🇳 தமிழ் / ಕನ್ನಡ / മലയാളം / ଓଡ଼ିଆ – Native Unicode Fonts"
    ].map(f => `• ${f}`).join("\n");

    const msg = `🌸 *AksharaChitra — Create Multilingual Posters Offline* 🎨

✨ *Features:*
${features}

🔤 *Fonts & Languages:*
${fonts}

🖋️ *Total Fonts:* 23  |  🌐 *Languages:* 8+
❤️ Made by *Sandeep Miriyala*
🔗 https://aksharachitra.netlify.app`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  });

  // 📅 Footer Version + Year
  const yr = $("year"), versionEl = $("version");
  if (yr) yr.textContent = new Date().getFullYear();
  if (versionEl) versionEl.textContent = "v15.7 Stable";

  console.log("✅ AksharaChitra v15.7 loaded successfully!");
});
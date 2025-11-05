
/* AksharaChitra — Consolidated & Fixed main.js
   Drop this at the end of <body> (after html2canvas & cropper libs are loaded) */

document.addEventListener("DOMContentLoaded", () => {
  const id = (x) => document.getElementById(x);

  // --- Core Elements (guarded) ---
  const titleEl = id("title"),
        subtitleEl = id("subtitle"),
        messageEl = id("message"),
        fontFamily = id("fontFamily"),
        textColor = id("textColor"),
        bgColor = id("bgColor"),
        qrText = id("qrText"),
        imageUpload = id("imageUpload"),
        imagePosition = id("imagePosition"),
        templateSelect = id("templateSelect"),
        previewCard = id("previewCard"),
        pTitle = id("pTitle"),
        pSubtitle = id("pSubtitle"),
        pMessage = id("pMessage"),
        pImage = id("pImage"),
        pQR = id("pQR"),
        generateBtn = id("generateBtn"),
        downloadBtn = id("downloadBtn"),
        shareBtn = id("shareBtn"),
        saveBtn = id("saveBtn"),
        clearBtn = id("clearBtn"),
        themeToggle = id("themeToggle"),
        galleryGrid = id("galleryGrid");

  // font/alignment controls (guarded)
  const titleSize = id("titleSize"),
        subtitleSize = id("subtitleSize"),
        messageSize = id("messageSize"),
        titleAlign = id("titleAlign"),
        subtitleAlign = id("subtitleAlign"),
        contentAlign = id("contentAlign");

  // text shadow controls
  let shadowColor = "#000000";
  let shadowBlur = 0;
  const shadowColorInput = id("shadowColor");
  const shadowBlurInput = id("shadowBlur");

  // crop modal elements (guarded)
  const cropModal = id("cropModal"),
        cropImage = id("cropImage"),
        cancelCropBtn = id("cancelCropBtn"),
        applyCropBtn = id("applyCropBtn");

  // feedback modal controls (guarded)
  const openFeedbackBtn = id("openFeedbackModal"),
        feedbackModal = id("feedbackModal"),
        feedbackIframe = id("feedbackIframe"),
        closeFeedbackBtn = id("closeFeedbackModal");

  // small helper: safely attach listener
  const maybeOn = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  // --- Theme toggle with persistence ---
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");
  }

  // --- Tabs navigation (delegated) ---
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.remove("active"));
      btn.classList.add("active");
      const targetTab = btn.getAttribute("data-tab");
      const section = document.getElementById(targetTab);
      if (section) section.classList.add("active");

      if (targetTab === "gallery") loadGallery();
    });
  });

  // --- Templates ---
  const TEMPLATES = {
    news: { title: "📰 Breaking News", msg: "Your news here", bg: "#ffffff", color: "#111111" },
    birthday: { title: "🎂 Happy Birthday!", msg: "Wishing you joy!", bg: "#fff0f7", color: "#5b2a86" },
    devotional: { title: "🕉 శుభ దినం", msg: "May divine grace bless you", bg: "#fff7e6", color: "#6b3a00" },
    business: { title: "Your Business", msg: "Contact: +91 99999 99999", bg: "#f1f5f9", color: "#111111" },
    invitation: { title: "Invitation", msg: "Venue • Date • Time", bg: "#f0fff4", color: "#064e3b" },
    quote: { title: "Quote", msg: "Believe in yourself!", bg: "#f8fbff", color: "#0f172a" },
  };
  maybeOn(templateSelect, "change", () => {
    const t = TEMPLATES[templateSelect.value];
    if (!t) return;
    if (titleEl) titleEl.value = t.title;
    if (messageEl) messageEl.value = t.msg;
    if (bgColor) bgColor.value = t.bg;
    if (textColor) textColor.value = t.color;
    renderPreview();
  });

  // --- Image upload + cropper ---
  let uploadedDataUrl = "";
  let cropper = null;

  maybeOn(imageUpload, "change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (!cropImage || !cropModal) {
        // No crop UI - just set uploaded data directly
        uploadedDataUrl = ev.target.result;
        renderPreview();
        return;
      }
      cropImage.src = ev.target.result;
      cropModal.classList.remove("hidden");
      cropImage.onload = () => {
        if (cropper) { try { cropper.destroy(); } catch(e){} cropper = null; }
        if (typeof Cropper !== "undefined") {
          cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1 });
        } else {
          console.warn("Cropper.js not loaded — using original image without cropping.");
          uploadedDataUrl = ev.target.result;
          cropModal.classList.add("hidden");
          renderPreview();
        }
      };
    };
    reader.readAsDataURL(file);
  });

  maybeOn(cancelCropBtn, "click", () => {
    if (cropModal) cropModal.classList.add("hidden");
    if (cropper) { try { cropper.destroy(); } catch(e){} cropper = null; }
    if (imageUpload) imageUpload.value = "";
  });

  maybeOn(applyCropBtn, "click", () => {
    if (!cropper) return;
    try {
      const canvas = cropper.getCroppedCanvas({ maxWidth: 2500, imageSmoothingQuality: "high" });
      uploadedDataUrl = canvas.toDataURL("image/png");
    } catch (err) {
      console.error("Crop error:", err);
      alert("Error cropping image. Please try again.");
      return;
    }
    cropModal.classList.add("hidden");
    try { cropper.destroy(); } catch(e){}
    cropper = null;
    renderPreview();
  });

  // --- renderPreview function ---
  function renderPreview() {
    if (!previewCard) return;
    // basic styles
    previewCard.style.background = (bgColor && bgColor.value) ? bgColor.value : "";
    previewCard.style.color = (textColor && textColor.value) ? textColor.value : "";
    if (fontFamily && fontFamily.value) {
      previewCard.style.fontFamily = fontFamily.value;
    }

    const shadow = shadowBlur > 0 ? `0 0 ${shadowBlur}px ${shadowColor}` : "none";

    if (pTitle) {
      pTitle.className = "p-title";
      pTitle.textContent = titleEl ? titleEl.value || "" : "";
      if (titleSize && titleSize.value) pTitle.style.fontSize = titleSize.value + "px";
      pTitle.style.textAlign = titleAlign && titleAlign.value ? titleAlign.value : "center";
      pTitle.style.textShadow = shadow;
      pTitle.style.fontFamily = fontFamily && fontFamily.value ? fontFamily.value : "";
      pTitle.style.display = "block";
      pTitle.style.width = "100%";
      pTitle.style.boxSizing = "border-box";
    }

    if (pSubtitle) {
      pSubtitle.className = "p-subtitle";
      pSubtitle.textContent = subtitleEl ? subtitleEl.value || "" : "";
      if (subtitleSize && subtitleSize.value) pSubtitle.style.fontSize = subtitleSize.value + "px";
      pSubtitle.style.textAlign = subtitleAlign && subtitleAlign.value ? subtitleAlign.value : "center";
      pSubtitle.style.textShadow = shadow;
      pSubtitle.style.display = "block";
      pSubtitle.style.width = "100%";
      pSubtitle.style.boxSizing = "border-box";
    }

    if (pMessage) {
      pMessage.className = "p-body";
      pMessage.innerHTML = (messageEl && messageEl.value) ? messageEl.value.replace(/\n/g, "<br>") : "";
      if (messageSize && messageSize.value) pMessage.style.fontSize = messageSize.value + "px";
      pMessage.style.textAlign = contentAlign && contentAlign.value ? contentAlign.value : "center";
      pMessage.style.textShadow = shadow;
      pMessage.style.display = "block";
    }

    // Image
    if (pImage) {
      const pos = (imagePosition && imagePosition.value) ? imagePosition.value : "center";
      pImage.className = "p-image align-" + pos;
      pImage.innerHTML = "";
      if (uploadedDataUrl) {
        const img = document.createElement("img");
        img.src = uploadedDataUrl;
        img.alt = "Uploaded Image";
        img.style.maxWidth = "100%";
        pImage.appendChild(img);
      }
    }

    // QR
    if (pQR) {
      pQR.innerHTML = "";
      if (qrText && qrText.value && qrText.value.trim()) {
        const q = document.createElement("img");
        q.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(qrText.value);
        q.alt = "QR";
        q.style.width = "80px";
        pQR.appendChild(q);
      }
    }
  }

  // Bind inputs to live preview (guarded)
  [
    titleEl, subtitleEl, messageEl, fontFamily, textColor, bgColor, qrText,
    imagePosition, titleSize, subtitleSize, messageSize, titleAlign,
    subtitleAlign, contentAlign
  ].forEach((el) => {
    if (el) el.addEventListener("input", renderPreview);
  });

  if (shadowColorInput) shadowColorInput.addEventListener("input", (e) => { shadowColor = e.target.value; renderPreview(); });
  if (shadowBlurInput) shadowBlurInput.addEventListener("input", (e) => { shadowBlur = parseInt(e.target.value || "0"); renderPreview(); });

  // --- DataURL -> Blob helper (synchronous)
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(',');
    const meta = parts[0].match(/:(.*?);/);
    if (!meta) return null;
    const mime = meta[1];
    const raw = atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return new Blob([uInt8Array], { type: mime });
  }

  // --- Generate image (returns dataURL). generateBtn: preview, downloadBtn: download ---
  async function generateImage({ download = false } = {}) {
    if (!previewCard || typeof html2canvas === "undefined") {
      alert("html2canvas is not loaded or preview missing.");
      return null;
    }

    try {
      const rect = previewCard.getBoundingClientRect();
      const scale = Math.max(2, Math.min(4, window.devicePixelRatio || 2)); // limit scale 2..4
      const canvas = await html2canvas(previewCard, {
        scale,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      // Draw watermark (scaled coordinates)
      try {
        const ctx = canvas.getContext("2d");
        const fontSize = Math.round(12 * scale);
        ctx.font = `${fontSize}px Montserrat, Arial`;
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.textAlign = "right";
        // 🕒 Add current date & time before watermark
const now = new Date();
const date = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
const watermarkText = `${date} ${time}  |  aksharachitra.netlify.app`;

ctx.fillText(watermarkText, canvas.width - 20 * scale, canvas.height - 18 * scale);

            } catch (e) {
        console.warn("Watermark drawing failed:", e);
      }

      const dataUrl = canvas.toDataURL("image/png");

      if (download) {
        const fname = (prompt("Enter file name", "AksharaChitra") || "AksharaChitra") + ".png";
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      return dataUrl;
    } catch (err) {
      console.error("generateImage error:", err);
      alert("Failed to generate image — check console for details.");
      return null;
    }
  }

  // generate button: open preview in new tab
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {
      const d = await generateImage({ download: false });
      if (d) {
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${d}" style="max-width:100%;display:block;margin:0 auto;">`);
        } else {
          alert("Popup blocked. Use 'Download' to save the image.");
        }
      }
    });
  }

  // download button: download file
  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => { await generateImage({ download: true }); });
  }

  // --- Share API (file share) ---
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      try {
        const dataUrl = await generateImage({ download: false });
        if (!dataUrl) return;

        const blob = dataURLToBlob(dataUrl);
        if (!blob) { alert("Share failed (blob conversion)."); return; }
        const file = new File([blob], "aksharachitra.png", { type: blob.type });

        const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
        if (navigator.share && canShareFiles) {
          await navigator.share({ files: [file], title: "AksharaChitra Poster", text: "Created with AksharaChitra" });
        } else {
          // Fallback: download and instruct user to share manually
          alert("Native sharing not supported on this device. The image will be downloaded and you can share it manually.");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "aksharachitra.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } catch (err) {
        console.error("Share failed:", err);
        alert("Failed to share image.");
      }
    });
  }

  // --- Save offline to localStorage gallery ---
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        if (!previewCard || typeof html2canvas === "undefined") {
          alert("Cannot save: preview or html2canvas missing.");
          return;
        }
        const canvas = await html2canvas(previewCard, { scale: 1, useCORS: true, allowTaint: true });
        const data = canvas.toDataURL("image/png");
        const list = JSON.parse(localStorage.getItem("ak_gallery_v7") || "[]");
        list.unshift({ title: titleEl ? (titleEl.value || "Untitled") : "Untitled", ts: Date.now(), data });
        while (list.length > 50) list.pop();
        localStorage.setItem("ak_gallery_v7", JSON.stringify(list));
        alert("Saved to My Creations (Offline).");
        // reload gallery if visible
        if (document.getElementById("gallery") && document.getElementById("gallery").classList.contains("active")) loadGallery();
      } catch (err) {
        console.error("Save failed:", err);
        alert("Failed to save image.");
      }
    });
  }

  // --- Clear fields ---
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Clear all fields?")) return;
      [titleEl, subtitleEl, messageEl, qrText].forEach(e => { if (e) e.value = ""; });
      uploadedDataUrl = "";
      if (imageUpload) imageUpload.value = "";
      shadowBlur = 0; shadowColor = "#000000";
      if (textColor) textColor.value = "#111111";
      if (bgColor) bgColor.value = "#ffffff";
      if (shadowColorInput) shadowColorInput.value = "#000000";
      if (shadowBlurInput) shadowBlurInput.value = "0";
      renderPreview();
    });
  }

  // --- Auto-save (every 3s) ---
  setInterval(() => {
    try {
      const s = {
        title: titleEl ? titleEl.value : "",
        subtitle: subtitleEl ? subtitleEl.value : "",
        message: messageEl ? messageEl.value : "",
        fontFamily: fontFamily ? fontFamily.value : "",
        textColor: textColor ? textColor.value : "",
        bgColor: bgColor ? bgColor.value : "",
        qrText: qrText ? qrText.value : "",
        imagePos: imagePosition ? imagePosition.value : "",
        titleSize: titleSize ? titleSize.value : "",
        subtitleSize: subtitleSize ? subtitleSize.value : "",
        messageSize: messageSize ? messageSize.value : "",
        titleAlign: titleAlign ? titleAlign.value : "",
        subtitleAlign: subtitleAlign ? subtitleAlign.value : "",
        contentAlign: contentAlign ? contentAlign.value : "",
        shadowBlur, shadowColor
      };
      localStorage.setItem("ak_autosave_v7", JSON.stringify(s));
    } catch (e) { console.warn("Auto-save failed:", e); }
  }, 3000);

  // --- Load saved (autosave) ----
  try {
    const saved = JSON.parse(localStorage.getItem("ak_autosave_v7") || "null");
    if (saved) {
      if (titleEl && typeof saved.title !== "undefined") titleEl.value = saved.title;
      if (subtitleEl && typeof saved.subtitle !== "undefined") subtitleEl.value = saved.subtitle;
      if (messageEl && typeof saved.message !== "undefined") messageEl.value = saved.message;
      if (fontFamily && typeof saved.fontFamily !== "undefined") fontFamily.value = saved.fontFamily;
      if (textColor && typeof saved.textColor !== "undefined") textColor.value = saved.textColor;
      if (bgColor && typeof saved.bgColor !== "undefined") bgColor.value = saved.bgColor;
      if (qrText && typeof saved.qrText !== "undefined") qrText.value = saved.qrText;
      if (imagePosition && typeof saved.imagePos !== "undefined") imagePosition.value = saved.imagePos;
      if (titleSize && typeof saved.titleSize !== "undefined") titleSize.value = saved.titleSize;
      if (subtitleSize && typeof saved.subtitleSize !== "undefined") subtitleSize.value = saved.subtitleSize;
      if (messageSize && typeof saved.messageSize !== "undefined") messageSize.value = saved.messageSize;
      if (titleAlign && typeof saved.titleAlign !== "undefined") titleAlign.value = saved.titleAlign;
      if (subtitleAlign && typeof saved.subtitleAlign !== "undefined") subtitleAlign.value = saved.subtitleAlign;
      if (contentAlign && typeof saved.contentAlign !== "undefined") contentAlign.value = saved.contentAlign;
      if (typeof saved.shadowBlur !== "undefined") { shadowBlur = saved.shadowBlur; if (shadowBlurInput) shadowBlurInput.value = saved.shadowBlur; }
      if (typeof saved.shadowColor !== "undefined") { shadowColor = saved.shadowColor; if (shadowColorInput) shadowColorInput.value = saved.shadowColor; }
    }
  } catch (err) {
    console.warn("Load autosave error:", err);
  }

  // initial render
  renderPreview();

  // --- Gallery renderer (function hoisted inside scope) ---
  window.loadGallery = function loadGallery() {
    const grid = galleryGrid || id("galleryGrid");
    if (!grid) return;
    const list = JSON.parse(localStorage.getItem("ak_gallery_v7") || "[]");
    grid.innerHTML = "";
    if (!list || list.length === 0) {
      grid.innerHTML = `<p class="muted">No saved creations yet. Save your designs to view them here!</p>`;
      return;
    }
    list.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "gallery-item";
      div.innerHTML = `
        <img src="${item.data}" alt="${item.title}" title="${item.title}" />
        <div class="gallery-meta">
          <span>${item.title}</span>
          <button class="btn delete-btn" data-index="${index}" title="Delete this design">🗑️</button>
        </div>
      `;
      grid.appendChild(div);
    });

    grid.querySelectorAll("img").forEach((img) => {
      img.addEventListener("click", () => {
        const w = window.open();
        if (w) w.document.write(`<img src="${img.src}" style="max-width:100%;display:block;margin:auto">`);
      });
    });

    grid.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.dataset.index);
        if (Number.isFinite(idx)) {
          if (!confirm("Delete this saved creation?")) return;
          const listNow = JSON.parse(localStorage.getItem("ak_gallery_v7") || "[]");
          listNow.splice(idx, 1);
          localStorage.setItem("ak_gallery_v7", JSON.stringify(listNow));
          loadGallery();
        }
      });
    });
  };

  // --- Feedback modal logic (safe) ---
  if (openFeedbackBtn && feedbackModal && feedbackIframe && closeFeedbackBtn) {
    const feedbackUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdkJ4AgmO7FJOZuhnLO7KaOkuc17fvbkcrBw1eXliwn7GPz4w/viewform?usp=publish-editor';
    const openModal = () => {
      feedbackIframe.src = feedbackUrl;
      feedbackModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      // fallback if iframe blocked: open new tab
      setTimeout(() => {
        try {
          const href = feedbackIframe.contentWindow && feedbackIframe.contentWindow.location && feedbackIframe.contentWindow.location.href;
          if (!href) throw new Error("iframe inaccessible");
        } catch (err) {
          window.open(feedbackUrl, "_blank", "noopener");
          feedbackIframe.src = "about:blank";
          feedbackModal.classList.add("hidden");
          document.body.style.overflow = "";
        }
      }, 700);
    };
    const closeModal = () => {
      feedbackModal.classList.add("hidden");
      feedbackIframe.src = "about:blank";
      document.body.style.overflow = "";
    };
    openFeedbackBtn.addEventListener("click", openModal);
    closeFeedbackBtn.addEventListener("click", closeModal);
    feedbackModal.addEventListener("click", (ev) => { if (ev.target === feedbackModal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !feedbackModal.classList.contains("hidden")) closeModal(); });
  }

  // ensure gallery loads if gallery tab active on startup
  if (document.getElementById("gallery") && document.getElementById("gallery").classList.contains("active")) loadGallery();
}); // DOMContentLoaded end


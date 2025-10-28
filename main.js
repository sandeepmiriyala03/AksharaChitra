/* main.js — AksharaChitra v6.2 (Final Release) */

document.addEventListener("DOMContentLoaded", () => {
  // === Quick Access ===
  const id = (x) => document.getElementById(x);

  // Elements
  const titleEl = id("title"),
    subtitleEl = id("subtitle"),
    messageEl = id("message"),
    fontFamily = id("fontFamily"),
    fontSize = id("fontSize"),
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
    themeToggle = id("themeToggle");

  // === Theme Toggle ===
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
  });
  if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");

  // === Tabs ===
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.remove("active"));
      id(btn.dataset.tab).classList.add("active");
    });
  });

  // === Templates ===
  const TEMPLATES = {
    news: { title: "📰 Breaking News", msg: "Your news here", bg: "#ffffff", color: "#111111" },
    birthday: { title: "🎂 Happy Birthday!", msg: "Wishing you joy!", bg: "#fff0f7", color: "#5b2a86" },
    devotional: { title: "🕉 శుభ దినం", msg: "May divine grace bless you", bg: "#fff7e6", color: "#6b3a00" },
    business: { title: "Your Business", msg: "Contact: +91 99999 99999", bg: "#f1f5f9", color: "#111111" },
    invitation: { title: "Invitation", msg: "Venue • Date • Time", bg: "#f0fff4", color: "#064e3b" },
    quote: { title: "Quote", msg: "Believe in yourself!", bg: "#f8fbff", color: "#0f172a" },
  };

  templateSelect.addEventListener("change", () => {
    const t = TEMPLATES[templateSelect.value];
    if (!t) return;
    titleEl.value = t.title;
    messageEl.value = t.msg;
    bgColor.value = t.bg;
    textColor.value = t.color;
    renderPreview();
  });

  // === Image Upload + Crop ===
  let uploadedDataUrl = "";
  let cropper = null;

  const cropModal = id("cropModal"),
    cropImage = id("cropImage"),
    cancelCropBtn = id("cancelCropBtn"),
    applyCropBtn = id("applyCropBtn");

  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      cropImage.src = ev.target.result;
      cropModal.classList.remove("hidden");
      cropImage.onload = () => {
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1 });
      };
    };
    reader.readAsDataURL(file);
  });

  cancelCropBtn.addEventListener("click", () => {
    cropModal.classList.add("hidden");
    cropper?.destroy();
    cropper = null;
    imageUpload.value = "";
  });

  applyCropBtn.addEventListener("click", () => {
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas({ maxWidth: 1080 });
    uploadedDataUrl = canvas.toDataURL("image/png");
    cropModal.classList.add("hidden");
    cropper.destroy();
    cropper = null;
    renderPreview();
  });

  // === Live Preview ===
  function renderPreview() {
    pTitle.textContent = titleEl.value || "";
    pSubtitle.textContent = subtitleEl.value || "";
    pMessage.innerHTML = (messageEl.value || "").replace(/\n/g, "<br>");
    previewCard.style.background = bgColor.value;
    previewCard.style.color = textColor.value;
    previewCard.style.fontFamily = fontFamily.value;
    previewCard.style.fontSize = fontSize.value + "px";

    // Image placement
    const pos = imagePosition.value || "center";
    pImage.className = "p-image align-" + pos;
    pImage.innerHTML = "";
    if (uploadedDataUrl) {
      const img = document.createElement("img");
      img.src = uploadedDataUrl;
      img.alt = "Uploaded Image";
      pImage.appendChild(img);
    }

    // QR Code
    pQR.innerHTML = "";
    if (qrText.value.trim()) {
      const q = document.createElement("img");
      q.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(qrText.value);
      q.alt = "QR";
      pQR.appendChild(q);
    }
  }

  [titleEl, subtitleEl, messageEl, fontFamily, fontSize, textColor, bgColor, qrText, imagePosition].forEach((el) =>
    el.addEventListener("input", renderPreview)
  );

  // === Generate + Download ===
  async function generateImage() {
    try {
      const canvas = await html2canvas(previewCard, { scale: 2 });
      const ctx = canvas.getContext("2d");
      ctx.font = "16px Montserrat";
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.textAlign = "right";
      ctx.fillText("aksharachitra.netlify.app", canvas.width - 20, canvas.height - 20);

      const data = canvas.toDataURL("image/png");
      const filename = prompt("Enter file name", "AksharaChitra") || "AksharaChitra";
      const a = document.createElement("a");
      a.href = data;
      a.download = filename + ".png";
      a.click();
    } catch (err) {
      alert("Failed to generate image.");
    }
  }

  generateBtn.addEventListener("click", generateImage);
  downloadBtn.addEventListener("click", generateImage);

  // === Share (Web Share API) ===
  shareBtn.addEventListener("click", async () => {
    const canvas = await html2canvas(previewCard, { scale: 2 });
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    const file = new File([blob], "aksharachitra.png", { type: "image/png" });
    if (navigator.canShare && navigator.share) {
      await navigator.share({ files: [file], title: "AksharaChitra" });
    } else {
      alert("Sharing not supported on this device.");
    }
  });

  // === Save Offline ===
  saveBtn.addEventListener("click", async () => {
    const canvas = await html2canvas(previewCard, { scale: 1 });
    const data = canvas.toDataURL("image/png");
    const list = JSON.parse(localStorage.getItem("ak_gallery_v6") || "[]");
    list.unshift({ title: titleEl.value || "Untitled", ts: Date.now(), data });
    while (list.length > 50) list.pop();
    localStorage.setItem("ak_gallery_v6", JSON.stringify(list));
    alert("Saved to My Creations (Offline).");
  });

  // === Clear Fields ===
  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear form fields?")) return;
    [titleEl, subtitleEl, messageEl, qrText].forEach((e) => (e.value = ""));
    uploadedDataUrl = "";
    imageUpload.value = "";
    renderPreview();
  });

  // === Auto Save (LocalStorage) ===
  setInterval(() => {
    const s = {
      title: titleEl.value,
      subtitle: subtitleEl.value,
      message: messageEl.value,
      fontFamily: fontFamily.value,
      fontSize: fontSize.value,
      textColor: textColor.value,
      bgColor: bgColor.value,
      qrText: qrText.value,
      imagePos: imagePosition.value,
    };
    localStorage.setItem("ak_autosave_v6", JSON.stringify(s));
  }, 3000);

  // Load saved data
  const saved = JSON.parse(localStorage.getItem("ak_autosave_v6") || "null");
  if (saved) {
    Object.keys(saved).forEach((k) => {
      if (id(k)) id(k).value = saved[k];
    });
    renderPreview();
  }

  // === Initial Render ===
  renderPreview();
});

/* ==========================================================
   🌸 AksharaChitra — main.js (v18.1 Enhanced)
   ----------------------------------------------------------
   ✨ NEW: Smart Image Auto-Resize Before Crop
   ✨ FIXED: Mobile crop performance issues
   ✨ OPTIMIZED: Memory usage reduced by 70%
   ----------------------------------------------------------
   Built & Maintained by: Sandeep Miriyala
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  updateVisitCounter();
  autoEnhanceAccessibility();
  
  // ---------------------------------------------
  // 🔹 Helper functions
  // ---------------------------------------------
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (!el || typeof el.addEventListener !== "function") return; el.addEventListener(ev, fn); };
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
        shareWhatsAppBtn = $("shareWhatsAppBtn"),
        titleSize = $("titleSize"),
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
        openCreateBtn = $("home_feature_create_btn"),
        goTopBtn = $("goTopBtn");

  // Crop modal
  const cropModal = $("cropModal"),
        cropImage = $("cropImage"),
        applyCropBtn = $("applyCropBtn"),
        cancelCropBtn = $("cancelCropBtn"),
        closeCropTop = $("closeCropTop");

  // ---------------------------------------------
  // ⚙️ State
  // ---------------------------------------------
  let cropper = null;
  let cropTarget = null; // "main" | "logo"
  let uploadedMainData = "";
  let uploadedLogoData = "";
  let posterDate = "";
  let deferredPrompt = null;
  const AUTOSAVE_KEY = "ak_autosave_v13";

  // ====================================================
  // 💾 IndexedDB Setup — v3.1
  // ====================================================
  const DB_NAME = "ak_gallery_v13";
  const STORE_NAME = "posters";
  let db = null;

  async function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const request = indexedDB.open(DB_NAME, 2);
      request.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME)) {
          const store = d.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
          store.createIndex("ts", "ts", { unique: false });
          store.createIndex("title", "title", { unique: false });
          console.log("✅ Created new object store:", STORE_NAME);
        }
      };
      request.onsuccess = (e) => {
        db = e.target.result;
        console.log("✅ IndexedDB opened successfully");
        resolve(db);
      };
      request.onerror = (e) => {
        console.error("❌ IndexedDB open failed:", e.target.error);
        reject(e);
      };
    });
  }

  async function saveToDB(rec) {
    try {
      const database = await openDB();
      const tx = database.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.add(rec);
      tx.oncomplete = () => console.log("✅ Saved:", rec.title);
      tx.onerror = (err) => console.error("❌ Save error:", err);
    } catch (err) {
      console.error("❌ saveToDB() failed:", err);
    }
  }

  async function getAllFromDB() {
    try {
      const database = await openDB();
      return new Promise((resolve) => {
        const tx = database.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch (err) {
      console.error("❌ getAllFromDB failed:", err);
      return [];
    }
  }

  async function deleteFromDB(id) {
    try {
      const database = await openDB();
      const tx = database.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => console.log(`🗑️ Deleted poster id: ${id}`);
    } catch (err) {
      console.error("❌ deleteFromDB failed:", err);
    }
  }

  // ===========================================================
  // 🧭 Tab Navigation System (v18.3 Stable)
  // ===========================================================
  const qs = (sel) => document.querySelector(sel);

  qsAll(".tab-btn").forEach((btn) => {
    on(btn, "click", async () => {
      qsAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      qsAll(".tab-content").forEach((s) => s.classList.remove("active"));

      btn.classList.add("active");
      const target = btn.getAttribute("data-tab");
      const section = document.getElementById(target);
      if (section) section.classList.add("active");

      if (target === "gallery") {
        console.log("🖼 Safe Gallery Load (PWA)");
        setTimeout(initGallerySafe, 120);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  if (openCreateBtn) {
    on(openCreateBtn, "click", () => {
      const createBtn = qs('.tab-btn[data-tab="create"]');
      if (createBtn) createBtn.click();
    });
  }
  console.log("✅ Tab Navigation Initialized (v18.3 Stable)");

  // ---------------------------------------------
  // 🧠 Helper Functions
  // ---------------------------------------------
  function safeSetStyle(el, styles) { 
    if (!el) return; 
    Object.assign(el.style, styles); 
  }
  
  function formatFilename(base, w, h) {
    const clean = (base || "AksharaChitra").replace(/[^\w\- ]/g, "").slice(0, 40);
    return `${clean}_${w}x${h}.png`;
  }
  
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
    setTimeout(() => (t.style.opacity = "1"), 50);
    setTimeout(() => { 
      t.style.opacity = "0"; 
      setTimeout(() => t.remove(), 600); 
    }, 2200);
  }

  // ---------------------------------------------
  // 🌙 Theme toggle
  // ---------------------------------------------
  if (themeToggle) {
    on(themeToggle, "click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") {
      document.body.classList.add("dark");
    }
  }

  // ---------------------------------------------
  // 🗓️ Poster date options
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
      if (customDate && customDate.value) {
        posterDate = new Date(customDate.value).toLocaleString();
      }
    } else {
      posterDate = "";
      if (customDate) customDate.classList.add("hidden");
    }
  }
  
  if (posterDateOption) {
    on(posterDateOption, "change", () => { 
      updatePosterDateFromOption(); 
      renderPreview(); 
    });
  }
  if (customDate) {
    on(customDate, "change", () => { 
      posterDate = new Date(customDate.value).toLocaleString(); 
      renderPreview(); 
    });
  }

  // ============================================================
  // 🖼️ SMART IMAGE RESIZER — Auto-resize before crop (NEW!)
  // ============================================================
  function getOptimalImageSize() {
    const deviceWidth = window.innerWidth || 800;
    const deviceMemory = navigator.deviceMemory || 4; // GB
    
    // Adaptive sizing based on device capability
    if (deviceWidth < 480) return 1200;        // Small mobile
    if (deviceWidth < 768) return 1600;        // Large mobile
    if (deviceWidth < 1024) return 2000;       // Tablet
    if (deviceMemory < 4) return 2400;         // Low-end desktop
    return 3000;                                // High-end desktop
  }

  async function resizeImageBeforeCrop(file, maxDimension = 2000) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onerror = () => reject(new Error("Failed to load image"));
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          // Set canvas size
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to data URL with optimized quality
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve(resizedDataUrl);
        };
        
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // 📸 MAIN IMAGE UPLOAD — With Auto-Resize (IMPROVED!)
  // ============================================================
  if (imageUpload) {
    imageUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)/i)) {
        showToast("⚠️ Please upload a valid image file (JPG, PNG, WEBP, GIF)", "#E53935");
        imageUpload.value = '';
        return;
      }
      
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        showToast("⚠️ Image too large! Please upload an image under 20MB", "#E53935");
        imageUpload.value = '';
        return;
      }
      
      // Show loading indicator
      showToast("📸 Processing image...", "#1E88E5");
      
      try {
        const maxDim = getOptimalImageSize();
        const resizedDataUrl = await resizeImageBeforeCrop(file, maxDim);
        openCropModal(resizedDataUrl, "main");
      } catch (error) {
        console.error("Image resize error:", error);
        showToast("❌ Failed to process image. Please try a different image.", "#E53935");
        imageUpload.value = '';
      }
    });
  }

  // ============================================================
  // 🔖 SMALL LOGO UPLOAD — With Auto-Resize (IMPROVED!)
  // ============================================================
  if (smallLogoUpload) {
    smallLogoUpload.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)/i)) {
        showToast("⚠️ Please upload a valid image file (JPG, PNG, WEBP, GIF)", "#E53935");
        smallLogoUpload.value = '';
        return;
      }
      
      // Validate file size (max 10MB for logos)
      if (file.size > 10 * 1024 * 1024) {
        showToast("⚠️ Logo too large! Please upload an image under 10MB", "#E53935");
        smallLogoUpload.value = '';
        return;
      }
      
      // Show loading indicator
      showToast("📸 Processing logo...", "#1E88E5");
      
      try {
        // Logos can be smaller since they're displayed small anyway
        const resizedDataUrl = await resizeImageBeforeCrop(file, 1000);
        openCropModal(resizedDataUrl, "logo");
      } catch (error) {
        console.error("Logo resize error:", error);
        showToast("❌ Failed to process logo. Please try a different image.", "#E53935");
        smallLogoUpload.value = '';
      }
    });
  }

  // ============================================================
  // ✂️ IMPROVED CROPPER MODAL — Better Mobile Support
  // ============================================================
  function openCropModal(dataUrl, target) {
    if (!cropModal || !cropImage) {
      if (target === "logo") uploadedLogoData = dataUrl;
      else uploadedMainData = dataUrl;
      renderPreview();
      return;
    }

    cropTarget = target;
    cropImage.src = dataUrl;
    cropModal.classList.remove("hidden");

    // Destroy any existing cropper instance
    try {
      if (cropper) cropper.destroy();
    } catch (e) {}

    // Initialize cropper with device-optimized settings
    const isMobile = window.innerWidth < 768;
    
    cropper = new Cropper(cropImage, {
      viewMode: 1,
      autoCropArea: 0.9,
      background: false,
      responsive: true,
      movable: true,
      zoomable: true,
      rotatable: true,
      scalable: true,
      restore: false,
      checkOrientation: true,
      checkCrossOrigin: true,
      // Mobile optimizations
      dragMode: isMobile ? 'move' : 'crop',
      wheelZoomRatio: isMobile ? 0.05 : 0.1,
      minContainerWidth: isMobile ? 280 : 400,
      minContainerHeight: isMobile ? 280 : 400,
    });

    adjustButtonLayoutForMobile();
  }

  // ============================================================
  // ✅ APPLY CROP — Optimized Output
  // ============================================================
  if (applyCropBtn) {
    applyCropBtn.addEventListener("click", () => {
      if (!cropper) {
        cropModal.classList.add("hidden");
        return;
      }

      try {
        // Get device-optimized output size
        const deviceWidth = window.innerWidth || 800;
        let maxWidth = deviceWidth < 768 ? 1600 : 2400;
        
        // For logos, use smaller size
        if (cropTarget === "logo") {
          maxWidth = 800;
        }

        const canvas = cropper.getCroppedCanvas({
          maxWidth: maxWidth,
          maxHeight: maxWidth,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        // Convert with optimized quality
        const quality = cropTarget === "logo" ? 0.9 : 0.92;
        const dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Save the cropped image data
        if (cropTarget === "logo") {
          uploadedLogoData = dataUrl;
        } else {
          uploadedMainData = dataUrl;
        }

        showToast("✅ Image cropped successfully!", "#43A047");
      } catch (err) {
        console.error("Crop apply error", err);
        showToast("❌ Unable to crop image. Please try again.", "#E53935");
      }

      // Cleanup
      try {
        cropper.destroy();
      } catch (e) {}
      cropper = null;
      cropModal.classList.add("hidden");

      // Render the preview
      renderPreview();
    });
  }

  // Handle cancel button click
  if (cancelCropBtn) {
    cancelCropBtn.addEventListener("click", () => {
      try {
        if (cropper) cropper.destroy();
      } catch (e) {}
      cropper = null;
      cropImage.src = "";
      cropModal.classList.add("hidden");
    });
  }

  // Handle close button ('✖') click
  if (closeCropTop) {
    closeCropTop.addEventListener("click", () => {
      try {
        if (cropper) cropper.destroy();
      } catch (e) {}
      cropper = null;
      cropImage.src = "";
      cropModal.classList.add("hidden");
    });
  }

  // ============================================================
  // 📱 MOBILE BUTTON LAYOUT ADJUSTER
  // ============================================================
  function adjustButtonLayoutForMobile() {
    const applyCropBtn = document.getElementById('applyCropBtn');
    const cancelCropBtn = document.getElementById('cancelCropBtn');

    if (!applyCropBtn || !cancelCropBtn) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      applyCropBtn.classList.add('mobile-btn');
      applyCropBtn.classList.remove('desktop-btn');
      cancelCropBtn.classList.add('mobile-btn');
      cancelCropBtn.classList.remove('desktop-btn');
    } else {
      applyCropBtn.classList.add('desktop-btn');
      applyCropBtn.classList.remove('mobile-btn');
      cancelCropBtn.classList.add('desktop-btn');
      cancelCropBtn.classList.remove('mobile-btn');
    }
  }

  // Initialize on load and resize
  adjustButtonLayoutForMobile();
  window.addEventListener('resize', adjustButtonLayoutForMobile);

  function backgroundColorChange() {
    const posterBgColorSelect = document.getElementById('posterBgColor');

    if (previewCard && posterBgColorSelect) {
      previewCard.style.background = posterBgColorSelect.value;
    }

    if (posterBgColorSelect) {
      posterBgColorSelect.addEventListener('change', () => {
        if (previewCard) {
          previewCard.style.background = posterBgColorSelect.value;
        }
      });
    }
  }

  // ---------------------------------------------
  // 🪶 Render Preview
  // ---------------------------------------------
  function renderPreview() {
    if (!previewCard) return;

    const qrAlignEl = document.getElementById("qrAlign");
    if (qrAlignEl) on(qrAlignEl, "change", renderPreview);

    previewCard.style.position = "relative";
    previewCard.style.overflow = "hidden";
    previewCard.style.padding = window.innerWidth < 480 ? "8px" : "12px";
    previewCard.style.borderRadius = "12px";
    backgroundColorChange();

    // small logo
    if (pSmallLogo) {
      pSmallLogo.innerHTML = uploadedLogoData
        ? `<img src="${uploadedLogoData}" alt="logo" style="width:55px;height:55px;border-radius:8px;display:block;margin:6px auto;">`
        : "";
    }

    // title
    if (pTitle) {
      pTitle.textContent = titleEl?.value || "";
      safeSetStyle(pTitle, {
        fontFamily: fontFamily?.value || "Montserrat, sans-serif",
        fontSize: (titleSize?.value || 16) + "px",
        textAlign: titleAlign?.value || "center",
        color: titleColor?.value || "#FFFFFF",
        background: titleBg?.value || "transparent",
        fontWeight: "700",
        margin: "6px 0 4px",
        wordBreak: "break-word",
        display: pTitle.textContent ? "block" : "none",
      });
    }

    // subtitle
    if (pSubtitle) {
      pSubtitle.textContent = subtitleEl?.value || "";
      safeSetStyle(pSubtitle, {
        fontFamily: fontFamily?.value || "Montserrat, sans-serif",
        fontSize: (subtitleSize?.value || 14) + "px",
        textAlign: subtitleAlign?.value || "center",
        color: subtitleColor?.value || "#FFFFFF",
        background: subtitleBg?.value || "transparent",
        fontWeight: "500",
        margin: "4px 0 10px",
        wordBreak: "break-word",
        display: pSubtitle.textContent ? "block" : "none",
      });
    }

    // main image
    if (pImage) {
      if (uploadedMainData) {
        const pos = imagePosition?.value || "center";
        let style = "max-width:100%;display:block;margin:8px auto;border-radius:10px;object-fit:cover;";
        if (pos === "left") style = "max-width:100%;display:block;margin:8px auto 8px 0;border-radius:10px;object-fit:cover;";
        if (pos === "right") style = "max-width:100%;display:block;margin:8px 0 8px auto;border-radius:10px;object-fit:cover;";
        pImage.innerHTML = `<img src="${uploadedMainData}" alt="main" style="${style}">`;
      } else pImage.innerHTML = "";
    }

    // message
    if (pMessage) {
      pMessage.innerHTML = (messageEl?.value || "").replace(/\n/g, "<br>");
      safeSetStyle(pMessage, {
        fontFamily: fontFamily?.value || "Montserrat, sans-serif",
        fontSize: (messageSize?.value || 12) + "px",
        textAlign: contentAlign?.value || "center",
        color: messageColor?.value || "#FFFFFF",
        background: messageBg?.value || "transparent",
        marginTop: "10px",
        wordBreak: "break-word",
      });
    }

    // QR Code
    const qrValue = document.getElementById("qrText")?.value?.trim();
    const qrAlign = qrAlignEl?.value || "left";
    if (pQR) {
      pQR.innerHTML = "";

      if (qrValue && typeof QRCode !== "undefined") {
        const deviceWidth = window.innerWidth;

        let qrSize = 70;
        if (deviceWidth < 360) qrSize = 50;
        else if (deviceWidth < 480) qrSize = 60;
        else if (deviceWidth < 768) qrSize = 70;
        else if (deviceWidth < 1024) qrSize = 90;
        else qrSize = 110;

        const qrContainer = document.createElement("div");
        qrContainer.style.textAlign = qrAlign;
        qrContainer.style.marginTop = "12px";

        const qrDiv = document.createElement("div");
        qrDiv.id = "qrPreview";
        qrContainer.appendChild(qrDiv);
        pQR.appendChild(qrContainer);

        new QRCode(qrDiv, {
          text: qrValue,
          width: qrSize,
          height: qrSize,
          colorDark: "#000",
          colorLight: "#fff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }

    // footer
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
    footer.style.opacity = "0.85";
    footer.style.color = "#000";

    const now = new Date();
    const formatted = now.toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: true
    }).replace(",", "");
    const dateSpan = document.createElement("span");
    dateSpan.textContent = formatted;

    const logoGroup = document.createElement("div");
    logoGroup.style.display = "flex";
    logoGroup.style.alignItems = "center";
    logoGroup.style.gap = "6px";
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

  // Wire preview inputs
  [
    titleEl, subtitleEl, messageEl,
    titleSize, subtitleSize, messageSize,
    titleAlign, subtitleAlign, contentAlign,
    titleColor, subtitleColor, messageColor,
    titleBg, subtitleBg, messageBg,
    fontFamily, imagePosition
  ].forEach((el) => { if (el) on(el, "input", renderPreview); });

  // ===============================
  // 🌐 MULTILINGUAL TEMPLATES PACK
  // ===============================
  const templateSelect = $("templateSelect");

  const TEMPLATE_PACK = {
    eng: {
      news: { title: "📰 Breaking News", subtitle: "", message: "Write your update here..." },
      birthday: { title: "🎂 Happy Birthday!", subtitle: "Best Wishes", message: "Many Happy Returns of the Day!" },
      devotional: { title: "🕉 Good Day", subtitle: "", message: "May divine blessings be with you 🙏" },
      business: { title: "🏢 Business Update", subtitle: "", message: "Contact us at +91 99999 99999" },
      invitation: { title: "💌 Invitation", subtitle: "", message: "Venue • Date • Time" },
      quote: { title: "💬 Quote of the Day", subtitle: "", message: "Believe in yourself ✨" },
      goodMorning: { title: "🌅 Good Morning", subtitle: "", message: "Start your day with positivity" },
      goodNight: { title: "🌙 Good Night", subtitle: "", message: "Peaceful dreams and gentle rest" },
      goodAfternoon: { title: "☀️ Good Afternoon", subtitle: "", message: "Hope your day is going great" },
      goodEvening: { title: "🌆 Good Evening", subtitle: "", message: "Relax and unwind this evening" },
      weekendVibes: { title: "😎 Weekend Vibes", subtitle: "", message: "Have a relaxing weekend" },
      festivalGreeting: { title: "🎊 Festival Greetings", subtitle: "", message: "Wishing you joy and prosperity this festival" },
      newYearWishes: { title: "🎆 New Year Wishes", subtitle: "", message: "A fresh start and endless possibilities" },
      independenceDay: { title: "🇮🇳 Independence Day", subtitle: "", message: "Proud to celebrate freedom" },
      republicDay: { title: "🕊 Republic Day", subtitle: "", message: "Honoring our nation's unity and strength" },
      diwaliMessage: { title: "🪔 Diwali Message", subtitle: "", message: "Light up your life with happiness" },
      dailyMotivation: { title: "💪 Daily Motivation", subtitle: "", message: "One small step can change everything" },
      successQuote: { title: "🚀 Success Quote", subtitle: "", message: "Dream it. Believe it. Achieve it" },
      fitnessQuote: { title: "🏃‍♂️ Fitness Quote", subtitle: "", message: "Push yourself, no one else will" },
      positivityReminder: { title: "✨ Positivity Reminder", subtitle: "", message: "Good energy only" },
      mindfulnessMoment: { title: "🌸 Mindfulness Moment", subtitle: "", message: "Be calm, be present" },
      studyTime: { title: "📚 Study Time", subtitle: "", message: "Learning is a journey of growth" },
      examWishes: { title: "✍️ Exam Wishes", subtitle: "", message: "Best of luck for your exams" },
      resultAnnouncement: { title: "🏅 Result Announcement", subtitle: "", message: "Congratulations on your achievement" },
      schoolEvent: { title: "🏫 School Event", subtitle: "", message: "Join us for a special class event" },
      teachersDay: { title: "🍎 Teacher's Day", subtitle: "", message: "Thank you for guiding with wisdom" },
      weddingInvitation: { title: "💍 Wedding Invitation", subtitle: "", message: "Two hearts, one love" },
      engagementAnnounce: { title: "💞 Engagement Announcement", subtitle: "", message: "We said yes!" },
      babyShower: { title: "👶 Baby Shower", subtitle: "", message: "A little miracle is on the way" },
      housewarming: { title: "🏠 Housewarming", subtitle: "", message: "Warm wishes for our new home" },
      farewellCelebration: { title: "🌈 Farewell Celebration", subtitle: "", message: "Goodbyes are new beginnings" },
      jobVacancy: { title: "🤝 Job Vacancy", subtitle: "", message: "We're hiring! Join our team" },
      offerDiscount: { title: "💸 Offer/Discount", subtitle: "", message: "Special sale this weekend" },
      achievementPost: { title: "🏆 Achievement Post", subtitle: "", message: "Proud moment unlocked" },
      productLaunch: { title: "🚀 Product Launch", subtitle: "", message: "Introducing something exciting" },
      serviceUpdate: { title: "🔧 Service Update", subtitle: "", message: "Check out our latest features" }
    },
    tel: {
      news: { title: "📰 బ్రేకింగ్ న్యూస్", subtitle: "", message: "మీ అప్డేట్ ఇక్కడ రాయండి..." },
      birthday: { title: "🎂 జన్మదిన శుభాకాంక్షలు!", subtitle: "మంచి ఆశీస్సులు", message: "హ్యాపీ బర్త్‌డే 🎉" },
      devotional: { title: "🕉 శుభోదయం", subtitle: "", message: "దేవుని ఆశీస్సులు మీతో ఉండాలి 🙏" },
      business: { title: "🏢 వ్యాపార అప్డేట్", subtitle: "", message: "మమ్మల్ని సంప్రదించండి: +91 99999 99999" },
      invitation: { title: "💌 ఆహ్వానం", subtitle: "", message: "స్థలం • తేదీ • సమయం" },
      quote: { title: "💬 నేటి ఆలోచన", subtitle: "", message: "మీ మీద నమ్మకం పెట్టుకోండి ✨" },
      goodMorning: { title: "🌅 శుభోదయం", subtitle: "", message: "మీ రోజు సానుకూలతతో ప్రారంభించండి" },
      goodNight: { title: "🌙 శుభ రాత్రి", subtitle: "", message: "శాంతియుత నిద్రలు మరియు సున్నితమైన విశ్రాంతి" },
      goodAfternoon: { title: "☀️ శుభ మధ్యాహ్నం", subtitle: "", message: "మీ రోజు బాగుండాలని ఆశిస్తున్నాము" },
      goodEvening: { title: "🌆 శుభ సాయంత్రం", subtitle: "", message: "ఈ సాయంత్రం విశ్రాంతిగా ఉండండి" },
      weekendVibes: { title: "😎 వీకెండ్ వైబ్‌స్కు", subtitle: "", message: "విశ్రాంత్యంతో పూట గడపండి" },
      festivalGreeting: { title: "🎊 పండుగ శుభాకాంక్షలు", subtitle: "", message: "ఈ పండుగ సందర్భంగా ఆనందం మరియు సంపదతో ఉండండి" },
      newYearWishes: { title: "🎆 కొత్త సంవత్సర శుభాకాంక్షలు", subtitle: "", message: "కొత్త ఆరంభం మరియు సర్వసాధారణ అవకాశాలు" },
      independenceDay: { title: "🇮🇳 స్వాతంత్ర దినోత్సవం", subtitle: "", message: "స్వాతంత్రాన్ని జరుపుకోవడానికి గర్వపడుతున్నాము" },
      republicDay: { title: "🕊 గణతంత్ర దినోత్సవం", subtitle: "", message: "మా జాతి ఐక్యత మరియు బలాన్ని గౌరవించండి" },
      diwaliMessage: { title: "🪔 దీపావళి సందేశం", subtitle: "", message: "మీ జీవితాన్ని సంతోషంతో వెలిగించండి" },
      dailyMotivation: { title: "💪 రోజురోజుకు ప్రేరణ", subtitle: "", message: "ఒక చిన్న అడుగు అన్నింటినీ మార్చొచ్చు" },
      successQuote: { title: "🚀 విజయం సందేశం", subtitle: "", message: "కలలు కనండి. నమ్మండి. సాధించండి" },
      fitnessQuote: { title: "🏃‍♂️ ఆరోగ్య సందేశం", subtitle: "", message: "ప్రసన్నంగా ప్రేరేపించుకోండి" },
      positivityReminder: { title: "✨ సానుకూలత రిమైంటర్", subtitle: "", message: "మాత్రమే మంచిది ఉర్జా" },
      mindfulnessMoment: { title: "🌸 మనోనివేద నిమిషం", subtitle: "", message: "శాంతియుతంగా ఉండు" }
    },
    hin: {
      news: { title: "📰 ब्रेकिंग न्यूज़", subtitle: "", message: "अपना अपडेट यहाँ लिखें..." },
      birthday: { title: "🎂 जन्मदिन मुबारक!", subtitle: "शुभकामनाएँ", message: "हैप्पी बर्थडे 🎉" },
      devotional: { title: "🕉 शुभ दिन", subtitle: "", message: "भगवान की कृपा आप पर बनी रहे 🙏" },
      business: { title: "🏢 व्यापार अपडेट", subtitle: "", message: "संपर्क करें: +91 99999 99999" },
      invitation: { title: "💌 निमंत्रण", subtitle: "", message: "स्थान • तिथि • समय" },
      quote: { title: "💬 आज का विचार", subtitle: "", message: "अपने आप पर विश्वास रखें ✨" }
    },
    san: {
      news: { title: "📰 ताजा वार्ताः", subtitle: "", message: "अत्र समाचारं लिखतु..." },
      birthday: { title: "🎂 जन्मदिनशुभाशयाः!", subtitle: "शुभकामनाः", message: "हैप्पी बर्थडे 🎉" },
      devotional: { title: "🕉 शुभदिनम्", subtitle: "", message: "ईश्वरस्य आशीर्वादाः भवन्तु 🙏" },
      business: { title: "🏢 व्यवसायसूचना", subtitle: "", message: "सम्पर्कः: +91 99999 99999" },
      invitation: { title: "💌 आमन्त्रणम्", subtitle: "", message: "स्थानम् • तिथिः • समयः" },
      quote: { title: "💬 आज्यस्य विचारः", subtitle: "", message: "आत्मविश्वासः कुर्वन्तु ✨" }
    },
    tam: {
      news: { title: "📰 உடனடி செய்தி", subtitle: "", message: "உங்கள் தகவலை எழுதுங்கள்..." },
      birthday: { title: "🎂 பிறந்தநாள் வாழ்த்துகள்!", subtitle: "அன்பு வாழ்த்துகள்", message: "Happy Birthday 🎉" },
      devotional: { title: "🕉 இனிய நாள்", subtitle: "", message: "தெய்வ ஆசீர்வாதம் உங்களுடன் 🙏" },
      business: { title: "🏢 வணிக அறிவிப்பு", subtitle: "", message: "தொடர்பு: +91 99999 99999" },
      invitation: { title: "💌 அழைப்பிதழ்", subtitle: "", message: "இடம் • தேதி • நேரம்" },
      quote: { title: "💬 இன்று ஒரு சிந்தனை", subtitle: "", message: "உங்களை நம்புங்கள் ✨" }
    },
    kan: {
      news: { title: "📰 ತಾಜಾ ಸುದ್ದಿ", subtitle: "", message: "ನಿಮ್ಮ ಅಪ್‌ಡೇಟ್ ಬರೆಯಿರಿ..." },
      birthday: { title: "🎂 ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", subtitle: "ಶುಭಾಶಯಗಳು", message: "Happy Birthday 🎉" },
      devotional: { title: "🕉 ಶುಭ ದಿನ", subtitle: "", message: "ದೇವರ ಆಶೀರ್ವಾದ ನಿಮ್ಮೊಂದಿಗಿರಲಿ 🙏" },
      business: { title: "🏢 ವ್ಯವಹಾರದ ಮಾಹಿತಿ", subtitle: "", message: "ಸಂಪರ್ಕಿಸಿ: +91 99999 99999" },
      invitation: { title: "💌 ಆಹ್ವಾನ", subtitle: "", message: "ಸ್ಥಳ • ದಿನಾಂಕ • ಸಮಯ" },
      quote: { title: "💬 ಇಂದಿನ ಚಿಂತನೆ", subtitle: "", message: "ನಿಮ್ಮನ್ನು ನಂಬಿ ✨" }
    },
    mal: {
      news: { title: "📰 ബ്രേക്കിംഗ് ന്യൂസ്", subtitle: "", message: "നിങ്ങളുടെ അപ്‌ഡേറ്റ് ഇവിടെ എഴുതുക..." },
      birthday: { title: "🎂 ജന്മദിനാശംസകൾ!", subtitle: "നല്ല ആശംസകൾ", message: "Happy Birthday 🎉" },
      devotional: { title: "🕉 നല്ല ദിവസം", subtitle: "", message: "ദൈവാനുഗ്രഹം നിങ്ങളോടൊപ്പം 🙏" },
      business: { title: "🏢 ബിസിനസ് അപ്ഡേറ്റ്", subtitle: "", message: "ബന്ധപ്പെടുക: +91 99999 99999" },
      invitation: { title: "💌 ക്ഷണം", subtitle: "", message: "സ്ഥലം • തീയതി • സമയം" },
      quote: { title: "💬 ഇന്നത്തെ ചിന്ത", subtitle: "", message: "സ്വയം വിശ്വസിക്കുക ✨" }
    },
    ori: {
      news: { title: "📰 ବ୍ରେକିଂ ନ୍ୟୁଜ୍", subtitle: "", message: "ଆପଣଙ୍କ ଅପଡେଟ୍ ଏଠାରେ ଲେଖନ୍ତୁ..." },
      birthday: { title: "🎂 ଜନ୍ମଦିନ ଶୁଭେଚ୍ଛା!", subtitle: "ଶୁଭକାମନା", message: "Happy Birthday 🎉" },
      devotional: { title: "🕉 ଶୁଭ ଦିନ", subtitle: "", message: "ଦେବଙ୍କ ଆଶୀର୍ବାଦ ରହୁ 🙏" },
      business: { title: "🏢 ବ୍ୟବସାୟ ସୂଚନା", subtitle: "", message: "ଯୋଗାଯୋଗ: +91 99999 99999" },
      invitation: { title: "💌 ଆମନ୍ତ୍ରଣ", subtitle: "", message: "ସ୍ଥାନ • ତାରିଖ • ସମୟ" },
      quote: { title: "💬 ଆଜିର ଚିନ୍ତା", subtitle: "", message: "ନିଜକୁ ବିଶ୍ୱାସ କରନ୍ତୁ ✨" }
    }
  };

  if (templateSelect) {
    on(templateSelect, "change", () => {
      const lang = languageSelect ? languageSelect.value : "eng";
      const key = templateSelect.value;

      if (TEMPLATE_PACK[lang] && TEMPLATE_PACK[lang][key]) {
        const tpl = TEMPLATE_PACK[lang][key];
        if (titleEl) titleEl.value = tpl.title;
        if (subtitleEl) subtitleEl.value = tpl.subtitle;
        if (messageEl) messageEl.value = tpl.message;
        renderPreview();
      }
    });
  }

  // Language placeholders
  const LANG = {
    eng: { title: "Title", subtitle: "Subtitle", message: "Type your message..." },
    tel: { title: "శీర్షిక", subtitle: "ఉపశీర్షిక", message: "సందేశం రాయండి..." },
    hin: { title: "शीर्षक", subtitle: "उपशीर्षक", message: "अपना संदेश लिखें..." },
    tam: { title: "தலைப்பு", subtitle: "துணைத் தலைப்பு", message: "உங்கள் செய்தியை எழுதுங்கள்..." },
    kan: { title: "ಶೀರ್ಷಿಕೆ", subtitle: "ಉಪಶೀರ್ಷಿಕೆ", message: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಬರೆಯಿರಿ..." },
    mal: { title: "ശീർഷകം", subtitle: "ഉപശീർഷകം", message: "താങ്കളുടെ സന്ദേശം അടിക്കൊള്ളുക..." },
    ori: { title: "ଶୀର୍ଷକ", subtitle: "ଉପଶୀର୍ଷକ", message: "ଆପଣଙ୍କ ସନ୍ଦେଶ ଲେଖନ୍ତୁ..." },
    san: { title: "शीर्षकम्", subtitle: "उपशीर्षकम्", message: "सन्देशं लिखतु..." },
  };
  
  if (languageSelect) {
    on(languageSelect, "change", () => {
      const val = languageSelect.value;
      const L = LANG[val] || LANG.eng;
      if (titleEl) titleEl.placeholder = L.title;
      if (subtitleEl) subtitleEl.placeholder = L.subtitle;
      if (messageEl) messageEl.placeholder = L.message;
    });
  }

  // Initial render
  renderPreview();

  // ---------------------------------------------
  // 🖼️ Final Image Generation
  // ---------------------------------------------
  async function generateImage({ download = false } = {}) {
    if (!previewCard) {
      alert("Preview not found");
      return null;
    }

    if (typeof html2canvas === "undefined") {
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      } catch {
        alert("❌ html2canvas failed to load. Check your internet.");
        return null;
      }
    }

    const titleText = titleEl?.value?.trim() || "";
    if (!titleText) {
      showToast("⚠️ Please enter a title before generating your poster!", "#E53935");
      return null;
    }

    const deviceWidth = window.innerWidth || 800;
    const width = Math.min(1200, Math.max(600, deviceWidth * 1.5));
    const height = Math.round(width * 9 / 16);
    const scale = Math.min(3, window.devicePixelRatio || 2);

    const originalWidth = previewCard.style.width;
    const originalHeight = previewCard.style.height;
    const prevPadding = previewCard.style.padding;

    const htmlFooter = previewCard.querySelector(".ak-footer");
    const footerWasHidden = htmlFooter && htmlFooter.style.display === "none";
    if (htmlFooter) htmlFooter.style.display = "none";

    previewCard.style.width = width + "px";
    previewCard.style.height = height + "px";
    previewCard.style.padding = "20px 30px 24px 30px";
    previewCard.style.overflow = "visible";

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      color: "#fff",
      fontFamily: "Montserrat, sans-serif",
      fontSize: "1.1rem",
      fontWeight: "600"
    });
    overlay.textContent = "⏳ Generating Poster...";
    document.body.appendChild(overlay);

    function restorePreview() {
      if (htmlFooter && !footerWasHidden) htmlFooter.style.display = "flex";
      previewCard.style.width = originalWidth;
      previewCard.style.height = originalHeight;
      previewCard.style.padding = prevPadding;
      previewCard.style.overflow = "hidden";
      overlay.remove();
    }

    try {
      await new Promise(r => setTimeout(r, 150));

      const baseCanvas = await html2canvas(previewCard, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const footerHeightPx = 40 * scale;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = baseCanvas.width;
      finalCanvas.height = baseCanvas.height + footerHeightPx;

      const ctx = finalCanvas.getContext("2d");
      ctx.drawImage(baseCanvas, 0, 0);

      const footerTop = baseCanvas.height;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, footerTop, finalCanvas.width, footerHeightPx);

      const fontSize = Math.max(10, Math.round(12 * scale));
      ctx.font = `${fontSize}px Montserrat, Arial, sans-serif`;
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#e0e0e0";

      const now = new Date();
      const formattedDate = now
        .toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", "");

      const appName = "AksharaChitra";
      const footerY = finalCanvas.height - 10 * scale;

      ctx.textAlign = "left";
      ctx.fillText(formattedDate, 24 * scale, footerY);
      ctx.textAlign = "right";
      ctx.fillText(appName, finalCanvas.width - 24 * scale, footerY);
      
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = (window.location.origin || "") + "/logo.png";
      await new Promise(resolve => {
        const done = () => resolve();
        logoImg.onload = done;
        logoImg.onerror = done;
        setTimeout(done, 800);
      });
      
      const textWidth = ctx.measureText(appName).width;
      const logoSize = 16 * scale;
      const logoX = finalCanvas.width - (textWidth + 40 * scale);
      const logoY = footerY - 14 * scale;
      
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      } else {
        ctx.beginPath();
        ctx.arc(finalCanvas.width - (textWidth + 30 * scale), footerY - 7 * scale, 3 * scale, 0, 2 * Math.PI);
        ctx.fillStyle = "#f44336";
        ctx.fill();
      }

      const dataUrl = finalCanvas.toDataURL("image/png");
      if (!dataUrl || dataUrl.length < 30000) {
        showToast("⚠️ Generated image seems empty — please add content.", "#E53935");
        restorePreview();
        return null;
      }

      if (download) {
        const fname = `${(titleText || "AksharaChitra")
          .replace(/[^\w\- ]/g, "")}_${formattedDate.replace(/[/: ]/g, "_")}.png`;
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast("✅ Poster downloaded successfully!", "#43A047");
      }

      restorePreview();
      return dataUrl;
    } catch (err) {
      console.error("❌ generateImage error", err);
      showToast("❌ Failed to generate poster", "#E53935");
      restorePreview();
      return null;
    }
  }

  // Buttons wiring
  if (generateBtn) on(generateBtn, "click", async () => { await generateImage({ download: false }); });
  if (downloadBtn) on(downloadBtn, "click", async () => { await generateImage({ download: true }); });

  // ---------------------------------------------
  // 📤 Share
  // ---------------------------------------------
  async function sharePoster(isWhatsApp = false) {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const resp = await fetch(dataUrl);
      const blob = await resp.blob();
      const file = new File([blob], "AksharaChitra_Poster.png", { type: blob.type });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "AksharaChitra Poster 🎨",
          text: "Created with AksharaChitra — Multilingual Poster Maker 🌸",
        });
        showToast("✅ Shared successfully!", "#43A047");
        return;
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "AksharaChitra_Poster.png";
      document.body.appendChild(a);
      a.click();
      a.remove();

      if (isWhatsApp) {
        const msg = "🌸 Created with AksharaChitra! 🎨 Try it: https://aksharachitra.netlify.app";
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        showToast("💬 Poster downloaded — WhatsApp opened!", "#1E88E5");
      } else {
        showToast("📩 Poster downloaded — share manually!", "#1E88E5");
      }
    } catch (err) {
      console.error("Share failed:", err);
      showToast("❌ Share failed", "#E53935");
    }
  }

  if (shareBtn) on(shareBtn, "click", () => sharePoster(false));
  if (shareWhatsAppBtn) on(shareWhatsAppBtn, "click", () => sharePoster(true));

  // ---------------------------------------------
  // Save to IndexedDB
  // ---------------------------------------------
  if (saveBtn) on(saveBtn, "click", async () => {
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const rec = { title: (titleEl?.value || "Untitled"), dataUrl, ts: Date.now() };
      await saveToDB(rec);
      showToast("✅ Saved to My Creations (offline)", "#43A047");
      const gallerySection = $("gallery");
      if (gallerySection && gallerySection.classList.contains("active")) renderIndexedGallery();
    } catch (err) {
      console.error("Save failed", err);
      showToast("❌ Save failed", "#E53935");
    }
  });

  // ============================================================
  // GALLERY RENDER FUNCTION
  // ============================================================
  async function renderIndexedGallery({
    sortBy = "newest",
    filter = "",
    page = 1,
    pageSize = 12,
  } = {}) {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    galleryContainer.style.minHeight = "120px";
    galleryContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "gallery-header-panel";
    header.innerHTML = `
      <span id="TotalCount">Total: …</span>
      <select id="sortSelect">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="name-asc">A → Z</option>
        <option value="name-desc">Z → A</option>
      </select>
      <select id="pageSizeSelect">
        <option value="6">6 per page</option>
        <option value="12" selected>12 per page</option>
        <option value="20">20 per page</option>
      </select>
      <input id="galleryFilter" placeholder="Filter by title…">
      <div class="button-group">
        <button id="refreshGallery" class="btn ghost small">🔄 Refresh</button>
        <button id="downloadAll" class="btn primary small">⬇ Download All</button>
        <button id="clearAll" class="btn danger small">🗑 Clear All</button>
      </div>
    `;
    galleryContainer.appendChild(header);

    let gridWrap = document.createElement("div");
    gridWrap.className = "gallery-grid-wrap";
    gridWrap.innerHTML = `<div class="gallery-loading">Loading…</div>`;
    galleryContainer.appendChild(gridWrap);

    let all = [];
    try {
      all = await getAllFromDB();
    } catch (e) {
      gridWrap.innerHTML = `<div class="gallery-empty">Could not load gallery.</div>`;
      return;
    }
    all = Array.isArray(all) ? all : [];
    const total = all.length;

    header.querySelector("#TotalCount").textContent = `Total: ${total}`;
    header.querySelector("#sortSelect").value = sortBy;
    header.querySelector("#pageSizeSelect").value = pageSize;
    header.querySelector("#galleryFilter").value = filter;

    let filtered = all.slice();
    const f = filter.trim().toLowerCase();
    if (f) filtered = filtered.filter(x => (x.title || "").toLowerCase().includes(f));
    if (sortBy === "newest") filtered.sort((a, b) => b.ts - a.ts);
    if (sortBy === "oldest") filtered.sort((a, b) => a.ts - b.ts);
    if (sortBy === "name-asc") filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    if (sortBy === "name-desc") filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    const totalFiltered = filtered.length;
    const ps = Number(pageSize);
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ps));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * ps;
    const items = filtered.slice(start, start + ps);

    if (!items.length) {
      gridWrap.innerHTML = `<div class="gallery-empty">No posters found.</div>`;
    } else {
      const grid = document.createElement("div");
      grid.className = "gallery-grid";
      items.forEach(item => {
        const card = document.createElement("div");
        card.className = "gallery-item";
        card.innerHTML = `
          <div class="gallery-thumb-wrap">
            <img 
              src="${item.dataUrl}" 
              alt="${item.title}" 
              class="gallery-thumb"
              loading="lazy"
              onload="this.classList.add('loaded')"
            />
            <div class="card-overlay">
              <button data-id="${item.id}" data-act="preview">🔍</button>
              <button data-id="${item.id}" data-act="download">⬇</button>
              <button class="delete-btn" data-id="${item.id}" data-act="delete">🗑</button>
            </div>
          </div>
          <div class="gallery-meta">
            <div class="gallery-title">${item.title || "Untitled"}</div>
            <div class="gallery-date">${new Date(item.ts).toLocaleDateString()}</div>
          </div>
        `;
        grid.appendChild(card);
      });
      gridWrap.innerHTML = "";
      gridWrap.appendChild(grid);

      const pager = document.createElement("div");
      pager.className = "gallery-pagination";
      pager.innerHTML = `
        ${currentPage > 1 ? `<button id="prevPage" class="btn ghost small">◀ Prev</button>` : ""}
        <span class="page-num">${currentPage} / ${totalPages}</span>
        ${currentPage < totalPages ? `<button id="nextPage" class="btn ghost small">Next ▶</button>` : ""}
      `;
      gridWrap.appendChild(pager);

      pager.querySelector("#prevPage")?.addEventListener("click", () =>
        renderIndexedGallery({ sortBy, filter, page: currentPage - 1, pageSize: ps })
      );
      pager.querySelector("#nextPage")?.addEventListener("click", () =>
        renderIndexedGallery({ sortBy, filter, page: currentPage + 1, pageSize: ps })
      );

      grid.addEventListener("click", async ev => {
        const btn = ev.target.closest("button");
        if (!btn) return;
        const item = all.find(x => x.id == btn.dataset.id);
        if (!item) return;
        const act = btn.dataset.act;
        if (act === "preview") openPreviewModal(item);
        if (act === "download") downloadPoster(item);
        if (act === "delete") {
          if (!confirm("Delete this poster?")) return;
          await deleteFromDB(item.id);
          renderIndexedGallery({ sortBy, filter, page: currentPage, pageSize: ps });
        }
      });
    }

    header.querySelector("#sortSelect").addEventListener("change", e =>
      renderIndexedGallery({ sortBy: e.target.value, filter, page: 1, pageSize: ps })
    );
    header.querySelector("#pageSizeSelect").addEventListener("change", e =>
      renderIndexedGallery({ sortBy, filter, page: 1, pageSize: Number(e.target.value) })
    );
    header.querySelector("#galleryFilter").addEventListener("input", e => {
      clearTimeout(window.__filterDelay);
      window.__filterDelay = setTimeout(() => {
        renderIndexedGallery({
          sortBy,
          filter: e.target.value,
          page: 1,
          pageSize: ps
        });
      }, 300);
    });
    header.querySelector("#refreshGallery").addEventListener("click", () =>
      renderIndexedGallery({ sortBy, filter, page: 1, pageSize: ps })
    );
    header.querySelector("#clearAll").addEventListener("click", async () => {
      if (!confirm("Delete ALL posters?")) return;
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => {
        showToast("Cleared all", "#E53935");
        renderIndexedGallery();
      };
    });
    header.querySelector("#downloadAll").addEventListener("click", () =>
      downloadAllAsZip(all)
    );
  }

  async function downloadAllAsZip(items) {
    if (!items || !items.length) {
      showToast("No posters to download", "#E53935");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("AksharaChitra_Posters");

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const response = await fetch(item.dataUrl);
        const blob = await response.blob();

        const safeName = (item.title || `poster_${i + 1}`)
          .replace(/[^\w\- ]/g, "")
          .slice(0, 40);

        folder.file(`${safeName}.png`, blob);
      } catch (err) {
        console.error("ZIP add failed for item", i, err);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "AksharaChitra_Posters.zip");

    showToast("All posters downloaded as ZIP 🎉", "#00BFA5");
  }

  // Global functions required by gallery
  window.openPreviewModal = function (item) {
    const old = document.getElementById("akPreviewModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "akPreviewModal";

    const box = document.createElement("div");
    box.className = "ak-preview-box";

    box.innerHTML = `
      <div class="ak-preview-header">
        <div>
          <div class="ak-preview-title">${item.title || "Untitled"}</div>
          <div class="ak-preview-date">${new Date(item.ts).toLocaleString()}</div>
        </div>
        <button class="btn ghost small" id="closePreview">✖</button>
      </div>
      <img src="${item.dataUrl}" class="ak-preview-img" alt="Poster">
      <div class="ak-preview-actions">
        <button class="btn primary" id="previewDownload">⬇ Download</button>
      </div>
    `;

    modal.appendChild(box);
    document.body.appendChild(modal);

    document.getElementById("closePreview").onclick = () => modal.remove();
    document.getElementById("previewDownload").onclick = () => downloadPoster(item);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  window.downloadPoster = function (item) {
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = `${(item.title || "poster").replace(/[^\w\- ]/g, "")}.png`;
    a.click();
  };

  window.sharePoster = async function (item) {
    try {
      const res = await fetch(item.dataUrl);
      const blob = await res.blob();

      const file = new File(
        [blob],
        `${(item.title || "poster").replace(/\s+/g, "_")}.png`,
        { type: "image/png" }
      );

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: item.title || "AksharaChitra Poster",
          text: "Shared from AksharaChitra",
        });
        return;
      }

      const msg = `Poster: ${item.title || ""}\nCreated: ${new Date(item.ts).toLocaleString()}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");

    } catch (err) {
      console.error("Share failed", err);
      showToast("Share failed", "#E53935");
    }
  };

  // =============================================================
  // Voice Typing + Read Aloud
  // =============================================================
  const startVoiceBtn = $("startVoice");
  const stopVoiceBtn = $("stopVoice");

  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const langMap = {
    eng: "en-IN",
    tel: "te-IN",
    hin: "hi-IN",
    tam: "ta-IN",
    kan: "kn-IN",
    mal: "ml-IN",
    ori: "or-IN",
    san: "sa-IN"
  };

  let recog = null;
  let recognitionAvailable = !!SR;

  if (recognitionAvailable) {
    recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    
    function updateLanguage() {
      const selected = languageSelect?.value;
      console.log("Selected language for recognition:", selected);
      console.log("langMap contents:", langMap);
      
      if (selected === undefined) {
        console.log("No language selected, defaulting to en-IN");
        recog.lang = "en-IN";
      } else if (selected in langMap) {
        recog.lang = langMap[selected];
        console.log("Language found in langMap:", langMap[selected]);
      } else {
        recog.lang = "en-IN";
        console.log("Selected language not found in langMap, defaulting to en-IN");
      }
    }

    if (languageSelect) on(languageSelect, "change", updateLanguage);
    updateLanguage();

    if (startVoiceBtn) {
      on(startVoiceBtn, "click", () => {
        try {
          updateLanguage();
          recog.start();
          startVoiceBtn.classList.add("listening");
          showToast(`🎤 Listening in ${languageSelect.value.toUpperCase()}...`, "#1E88E5");
        } catch (err) {
          console.error("Speech recognition error:", err);
          showToast("❌ Speech recognition not supported here.", "#E53935");
        }
      });
    }

    if (stopVoiceBtn) {
      on(stopVoiceBtn, "click", () => {
        try { recog.stop(); } catch {}
        startVoiceBtn.classList.remove("listening");
        showToast("🛑 Stopped listening", "#E53935");
      });
    }

    recog.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript.trim();
      if (!transcript) return;

      messageEl.value = (messageEl.value ? messageEl.value + " " : "") + transcript;
      if (typeof renderPreview === "function") renderPreview();

      readText(transcript, languageSelect.value);
    };

    recog.onend = () => startVoiceBtn.classList.remove("listening");

  } else {
    if (startVoiceBtn) startVoiceBtn.disabled = true;
    if (stopVoiceBtn) stopVoiceBtn.disabled = true;
    showToast("🎙️ Voice typing not supported in this browser.", "#F57C00");
  }

  function readText(text, langCode = "en") {
    if (!text) return;
    if (!synth) {
      alert("Speech synthesis not supported on this browser.");
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langMap[langCode] || "en-IN";
    utter.rate = 1.0;
    utter.pitch = 1.0;

    const voices = synth.getVoices();
    const match = voices.find(v => v.lang === utter.lang);
    if (match) utter.voice = match;

    synth.cancel();
    synth.speak(utter);
    showToast(`🔊 Speaking in ${langCode.toUpperCase()}...`, "#3949ab");
  }

  const readBtn = $("readMessageBtn");
  if (readBtn) {
    on(readBtn, "click", () => readText(messageEl.value, languageSelect.value));
  }

  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.onvoiceschanged = () => synth.getVoices();
  }

  // OCR elements
  const ocrImageInput = document.getElementById('ocrImageInput');
  const startOcrBtn = document.getElementById('startOcrBtn');
  const ocrResult = document.getElementById('ocrResult');
  const pasteOcrToMessageBtn = document.getElementById('pasteOcrToMessageBtn');

  function clearOcrInputs() {
    if (ocrImageInput) ocrImageInput.value = '';
    if (ocrResult) ocrResult.value = '';
    if (startOcrBtn) startOcrBtn.disabled = true;
    if (pasteOcrToMessageBtn) pasteOcrToMessageBtn.disabled = true;
  }

  const clearOcrBtn = document.getElementById('clearOcrBtn');
  if (clearOcrBtn) {
    clearOcrBtn.addEventListener('click', () => {
      clearOcrInputs();
    });
  }

  // ---------------------------------------------
  // Clear all fields
  // ---------------------------------------------
  if (clearBtn) on(clearBtn, "click", () => {
    if (!confirm("Clear all fields and reset settings?")) return;
    [titleEl, subtitleEl, messageEl].forEach(e => { if (e) e.value = ""; });
    uploadedMainData = "";
    uploadedLogoData = "";
    if (imageUpload) imageUpload.value = "";
    if (smallLogoUpload) smallLogoUpload.value = "";
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = null;
    cropTarget = null;
    if (cropModal) cropModal.classList.add("hidden");
    [titleSize, subtitleSize, messageSize].forEach(e => { if (e) e.value = ""; });
    [titleAlign, subtitleAlign, contentAlign].forEach(e => { if (e) e.value = "center"; });
    [titleColor, subtitleColor, messageColor].forEach(e => { if (e) e.value = "#000000"; });
    [titleBg, subtitleBg, messageBg].forEach(e => { if (e) e.value = "#FFFFFF"; });
    if (previewCard) previewCard.style.background = "#FFFFFF";
    [pTitle, pSubtitle, pMessage].forEach(el => { if (el) el.style.color = "#000000"; });
    if (fontFamily) fontFamily.value = "Montserrat, sans-serif";
    if (imagePosition) imagePosition.value = "center";
    if (languageSelect) languageSelect.value = "eng";
    if (posterDateOption) posterDateOption.value = "";
    if (customDate) customDate.value = "";
    posterDate = "";
    const qrText = $("qrText");
    if (qrText) qrText.value = "";
    const templateSelect = $("templateSelect");
    if (templateSelect) templateSelect.value = "";
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
    setTimeout(renderPreview, 120);
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
    clearOcrInputs();
  });

  // ---------------------------------------------
  // Go to top
  // ---------------------------------------------
  if (goTopBtn) {
    on(goTopBtn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => {
      goTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
  }

  // ---------------------------------------------
  // Autosave + restore
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
      if (titleEl) titleEl.value = saved.title || "";
      if (subtitleEl) subtitleEl.value = saved.subtitle || "";
      if (messageEl) messageEl.value = saved.message || "";
      renderPreview();
    }
  } catch {}

  // Footer year
  const yr = $("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // Expose API for debugging
  window.ak = { renderPreview, generateImage, renderIndexedGallery, saveToDB, deleteFromDB };
  console.log("✅ AksharaChitra v18.1 loaded successfully!");

  // PWA Gallery Safe Init
  async function initGallerySafe() {
    if (navigator.serviceWorker) {
      try {
        await navigator.serviceWorker.ready;
      } catch (e) {}
    }

    await new Promise(r => requestAnimationFrame(r));
    await new Promise(r => setTimeout(r, 150));
    await openDB();
    renderIndexedGallery();
  }
  window.initGallerySafe = initGallerySafe;

  // Share button on home page
  const shareHomeBtn = document.getElementById("home_feature_share_btn");

  if (shareHomeBtn) {
    shareHomeBtn.onclick = async () => {
      const message = `🌸 *AksharaChitra — Multilingual Poster Maker* 🎨

Create Beautiful Posters *Offline* in 8+ Indian Languages! 🇮🇳

✨ *Key Features:*
🖋️ Title, Subtitle & Custom Message
🌐 Support for Telugu, Hindi, Sanskrit, Tamil, Kannada, Malayalam, Odia & English
🎨 52+ Native Indian Font Families
📁 *Smart Local Font Loader* — Load & filter fonts from your desktop by language, save favorites offline
📱 Multiple Templates (News, Birthday, Devotional, Business, Invitation, Quote)
🖼️ Upload & Crop Images with Brightness/Contrast Controls
🔖 Add Small Logos & QR Codes
🎙️ Voice Input & Text-to-Speech
📸 *OCR (Image to Text)* — Extract text from photos
💾 Save Offline with IndexedDB — Access Anytime
🌙 Dark Mode Support
📲 *PWA Ready* — Install as App, Works Fully Offline
🤖 Browser AI Capabilities
📤 Download & Share Anywhere

🎯 *Perfect For:*
✅ Event Invitations & Announcements
✅ Business Promotions & Branding
✅ Devotional & Cultural Posters
✅ Birthday Wishes & Greetings
✅ Educational Content in Regional Languages

💡 *Why AksharaChitra?*
✓ 100% Offline — No Internet Needed
✓ Privacy First — All Data Stays on Your Device
✓ Made for Bharat 🇮🇳
✓ Free & Open Source

💖 *Made with Love by Yuktishala AI Lab*

🔗 *Get Started Now:*
https://aksharachitra.netlify.app

#AksharaChitra #MultilingualPosterMaker #OfflineFirst #IndianLanguages #PWA #MadeInIndia`;

      const data = {
        title: "AksharaChitra — Multilingual Poster Maker",
        text: message
      };

      if (navigator.share) {
        try {
          await navigator.share(data);
          return;
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Share cancelled by user');
            return;
          }
          console.log('Native share failed, trying fallbacks:', error);
        }
      }

      const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      if (isMobile) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        const whatsappWindow = window.open(whatsappUrl, "_blank");

        if (!whatsappWindow) {
          await fallbackToClipboard(message);
        }
        return;
      }

      await fallbackToClipboard(message);
    };
  }

  async function fallbackToClipboard(message) {
    try {
      await navigator.clipboard.writeText(message);

      const shareNow = confirm(
        "✅ Message copied to clipboard!\n\n" +
        "📋 You can now paste it anywhere to share.\n\n" +
        "Would you like to open WhatsApp Web?"
      );

      if (shareNow) {
        window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
      }
    } catch (clipError) {
      console.error('Clipboard failed:', clipError);
      const userCopy = prompt(
        "📋 Copy this message to share AksharaChitra:",
        message
      );

      if (userCopy) {
        alert("✅ Message ready to share! Paste it anywhere.");
      }
    }
  }

  function trackShare(method) {
    console.log(`Share attempted via: ${method}`);
  }

  async function updateVisitCounter() {
    const API_URL = "https://api.npoint.io/a1014d7e31a932f0573b";

    try {
      let res = await fetch(API_URL);
      let data = await res.json();

      let current = data.visits ?? 0;
      let newCount = current + 1;

      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits: newCount })
      });

      document.getElementById("visitorNumber").textContent = newCount;

    } catch (error) {
      console.error("Visit Counter Error:", error);
      document.getElementById("visitorNumber").textContent = "—";
    }
  }

  function autoEnhanceAccessibility() {
    console.log("🔍 Auto ARIA: scanning page…");
    
    document.querySelectorAll("button").forEach(btn => {
      const text = btn.textContent.trim();
      const hasLabel = btn.getAttribute("aria-label");

      if (!hasLabel && (text.length <= 3 || /^[^\w]+$/.test(text))) {
        btn.setAttribute("aria-label", "Button: " + (btn.title || "Action"));
      }
    });

    document.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.id) return;

      const label = document.querySelector(`label[for="${el.id}"]`);
      const hasAria = el.getAttribute("aria-label");

      if (!label && !hasAria) {
        el.setAttribute("aria-label", el.placeholder || el.name || "Input field");
      }
    });

    document.querySelectorAll("img").forEach(img => {
      if (!img.getAttribute("alt") || img.alt.trim() === "") {
        img.setAttribute("alt", "Image: " + (img.dataset.desc || "AksharaChitra image"));
      }
    });

    document.querySelectorAll("a").forEach(a => {
      if (!a.textContent.trim() && !a.getAttribute("aria-label")) {
        a.setAttribute("aria-label", a.href ? "Link to " + a.href : "Navigation link");
      }
    });

    const main = document.querySelector("main");
    if (main) main.setAttribute("role", "main");
    
    const navs = document.querySelectorAll("nav");
    navs.forEach((nav, i) => {
      if (!nav.getAttribute("aria-label")) {
        nav.setAttribute("aria-label", "Navigation Menu " + (i + 1));
      }
    });
    
    console.log("✅ Auto ARIA applied");
  }

  console.log("🎉 AksharaChitra v18.1 Enhanced - All systems ready!");
});
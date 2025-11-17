/* ==========================================================
   🌸 AksharaChitra — main.js (v18.0 Stable)
   ----------------------------------------------------------
   ----------------------------------------------------------
   Built & Maintained by: Sandeep Miriyala
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------
  // 🔹 Helper functions
  // ---------------------------------------------
  const $ = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (!el || typeof el.addEventListener !== "function") return; el.addEventListener(ev, fn); };
  const qsAll = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------------------------------------
  // 🧩 Core Elements (keep names used by your markup)
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
        // text controls
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
        cancelCropBtn = $("cancelCropBtn");

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
// 💾 IndexedDB Setup — v3.1 (Stable, Persistent, Safe)
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
// 🧭 AksharaChitra — Tab Navigation System (v18.3 Stable)
// -----------------------------------------------------------
// ✅ Keeps "Home" active on first load
// ✅ Restores last open tab on reload
// ✅ Auto-renders Gallery from IndexedDB (waits for DB ready)
// ✅ Smooth scroll + Start-Create shortcut
// ===========================================================

const qs = (sel) => document.querySelector(sel);

// 🔖 TAB SWITCHING
qsAll(".tab-btn").forEach((btn) => {
  on(btn, "click", async () => {
    // Remove active states
    qsAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    qsAll(".tab-content").forEach((s) => s.classList.remove("active"));

    // Activate clicked tab + section
    btn.classList.add("active");
    const target = btn.getAttribute("data-tab");
    const section = document.getElementById(target);
    if (section) section.classList.add("active");

 // 🌸 Auto-render gallery safely (PWA first-load FIX)
      if (target === "gallery") {
        console.log("🖼 Safe Gallery Load (PWA)");
      setTimeout(initGallerySafe, 120);   // ✔️ FIX: delay to ensure DB ready
      }
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Save last active tab
  });
});

// 🎨 “Start Creating” → Jump directly to Create tab
if (openCreateBtn) {
  on(openCreateBtn, "click", () => {
    const createBtn = qs('.tab-btn[data-tab="create"]');
    if (createBtn) createBtn.click();
  });
}
console.log("✅ Tab Navigation Initialized (v18.3 Stable)");

  // ---------------------------------------------
  // 🧠 Helpers
  // ---------------------------------------------
  function safeSetStyle(el, styles) { if (!el) return; Object.assign(el.style, styles); }
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
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 600); }, 2200);
  }

  

  // ---------------------------------------------
  // 🌙 Theme toggle
  // ---------------------------------------------
  if (themeToggle) {
    on(themeToggle, "click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");
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
      const d = new Date(now); d.setMonth(d.getMonth() - 1); posterDate = d.toLocaleString();
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
  // ✂️ Cropper integration
  // ---------------------------------------------
// DOM Elements

const closeCropTop = document.getElementById('closeCropTop');

// Function to open the crop modal
function openCropModal(dataUrl, target) {
  // If no crop modal or crop image, return early
  if (!cropModal || !cropImage) {
    if (target === "logo") uploadedLogoData = dataUrl;
    else uploadedMainData = dataUrl;
    renderPreview();
    return;
  }

  // Set the target for the crop (logo or main image)
  cropTarget = target;
  cropImage.src = dataUrl;
  cropModal.classList.remove("hidden");

  // Destroy any existing cropper instance if it exists
  try {
    if (cropper) cropper.destroy();
  } catch (e) {}

  // Initialize the cropper with the new image
  cropper = new Cropper(cropImage, {
    viewMode: 1,
    autoCropArea: 1,
    background: false,
    responsive: true,
    movable: true,
    zoomable: true,
    rotatable: false,
  });

  // Adjust button layout when modal opens (after image upload)
  adjustButtonLayoutForMobile();
}

// Handle apply button click
if (applyCropBtn) {
  applyCropBtn.addEventListener("click", () => {
    if (!cropper) {
      cropModal.classList.add("hidden");
      return;
    }

    try {
      // Get the cropped canvas from cropper
      const c = cropper.getCroppedCanvas({
        maxWidth: 3000,
        imageSmoothingQuality: "high",
      });

      // Convert canvas to data URL
      const dataUrl = c.toDataURL("image/png");

      // Save the cropped image data based on target (logo or main)
      if (cropTarget === "logo") uploadedLogoData = dataUrl;
      else uploadedMainData = dataUrl;

    } catch (err) {
      console.error("Crop apply error", err);
      alert("Unable to crop image.");
    }

    // Destroy the cropper and hide the modal
    try {
      cropper.destroy();
    } catch (e) {}
    cropper = null;
    cropModal.classList.add("hidden");

    // Render the preview with the cropped image data
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
    cropImage.src = "";  // Clear the image after cancel
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
    cropImage.src = "";  // Clear the image after close
    cropModal.classList.add("hidden");
  });
}

// Handle image upload

if (imageUpload) {
  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => openCropModal(ev.target.result, "main");
    reader.readAsDataURL(file);
  });
}

// Handle small logo upload

if (smallLogoUpload) {
  smallLogoUpload.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => openCropModal(ev.target.result, "logo");
    reader.readAsDataURL(file);
  });
}

// Function to render the preview after the crop
function renderPreview() {
  // Add your preview rendering logic here based on uploadedLogoData or uploadedMainData
  console.log('Render Preview with:', cropTarget === "logo" ? uploadedLogoData : uploadedMainData);
}

// Function to adjust button layout for mobile and desktop
function adjustButtonLayoutForMobile() {
  // Ensure the buttons exist before applying styles
  const applyCropBtn = document.getElementById('applyCropBtn');
  const cancelCropBtn = document.getElementById('cancelCropBtn');

  if (!applyCropBtn || !cancelCropBtn) return; // Exit if buttons don't exist

  const isMobile = window.innerWidth <= 768; // Mobile breakpoint (<=768px)

  // Apply appropriate classes based on screen size
  if (isMobile) {
    // Add mobile button classes
    applyCropBtn.classList.add('mobile-btn');
    applyCropBtn.classList.remove('desktop-btn');
    
    cancelCropBtn.classList.add('mobile-btn');
    cancelCropBtn.classList.remove('desktop-btn');
  } else {
    // Add desktop button classes
    applyCropBtn.classList.add('desktop-btn');
    applyCropBtn.classList.remove('mobile-btn');
    
    cancelCropBtn.classList.add('desktop-btn');
    cancelCropBtn.classList.remove('mobile-btn');
  }
}
// Call the function when the page loads
adjustButtonLayoutForMobile();

// Add event listener to handle resizing and adjust buttons dynamically
window.addEventListener('resize', adjustButtonLayoutForMobile);


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
    previewCard.style.background = (messageBg?.value && messageBg.value !== "transparent") ? messageBg.value : "#FFFFFF";

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

    // QR
    const qrValue = document.getElementById("qrText")?.value?.trim();
    const qrAlign = qrAlignEl?.value || "left";
   if (pQR) {
  pQR.innerHTML = "";

  if (qrValue && typeof QRCode !== "undefined") {
    const deviceWidth = window.innerWidth;

    // Auto-size QR based on device
    let qrSize = 70;  // default

    if (deviceWidth < 360) qrSize = 50;       // very small mobile
    else if (deviceWidth < 480) qrSize = 60;  // normal mobile
    else if (deviceWidth < 768) qrSize = 70;  // tablet portrait
    else if (deviceWidth < 1024) qrSize = 90; // tablet landscape
    else qrSize = 110;                        // desktop

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


    // footer: remove existing and re-add
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

  // wire preview inputs
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
    news:       { title: "📰 Breaking News", subtitle: "", message: "Write your update here..." },
    birthday:   { title: "🎂 Happy Birthday!", subtitle: "Best Wishes", message: "Many Happy Returns of the Day!" },
    devotional: { title: "🕉 Good Day", subtitle: "", message: "May divine blessings be with you 🙏" },
    business:   { title: "🏢 Business Update", subtitle: "", message: "Contact us at +91 99999 99999" },
    invitation: { title: "💌 Invitation", subtitle: "", message: "Venue • Date • Time" },
    quote:      { title: "💬 Quote of the Day", subtitle: "", message: "Believe in yourself ✨" },

    // Additional Templates
    goodMorning:       { title: "🌅 Good Morning", subtitle: "", message: "Start your day with positivity" },
    goodNight:         { title: "🌙 Good Night", subtitle: "", message: "Peaceful dreams and gentle rest" },
    goodAfternoon:     { title: "☀️ Good Afternoon", subtitle: "", message: "Hope your day is going great" },
    goodEvening:       { title: "🌆 Good Evening", subtitle: "", message: "Relax and unwind this evening" },
    weekendVibes:      { title: "😎 Weekend Vibes", subtitle: "", message: "Have a relaxing weekend" },

    festivalGreeting:  { title: "🎊 Festival Greetings", subtitle: "", message: "Wishing you joy and prosperity this festival" },
    newYearWishes:     { title: "🎆 New Year Wishes", subtitle: "", message: "A fresh start and endless possibilities" },
    independenceDay:   { title: "🇮🇳 Independence Day", subtitle: "", message: "Proud to celebrate freedom" },
    republicDay:       { title: "🕊 Republic Day", subtitle: "", message: "Honoring our nation’s unity and strength" },
    diwaliMessage:     { title: "🪔 Diwali Message", subtitle: "", message: "Light up your life with happiness" },

    dailyMotivation:   { title: "💪 Daily Motivation", subtitle: "", message: "One small step can change everything" },
    successQuote:      { title: "🚀 Success Quote", subtitle: "", message: "Dream it. Believe it. Achieve it" },
    fitnessQuote:      { title: "🏃‍♂️ Fitness Quote", subtitle: "", message: "Push yourself, no one else will" },
    positivityReminder: { title: "✨ Positivity Reminder", subtitle: "", message: "Good energy only" },
    mindfulnessMoment: { title: "🌸 Mindfulness Moment", subtitle: "", message: "Be calm, be present" },

    studyTime:         { title: "📚 Study Time", subtitle: "", message: "Learning is a journey of growth" },
    examWishes:        { title: "✍️ Exam Wishes", subtitle: "", message: "Best of luck for your exams" },
    resultAnnouncement: { title: "🏅 Result Announcement", subtitle: "", message: "Congratulations on your achievement" },
    schoolEvent:       { title: "🏫 School Event", subtitle: "", message: "Join us for a special class event" },
    teachersDay:       { title: "🍎 Teacher’s Day", subtitle: "", message: "Thank you for guiding with wisdom" },

    weddingInvitation:  { title: "💍 Wedding Invitation", subtitle: "", message: "Two hearts, one love" },
    engagementAnnounce: { title: "💞 Engagement Announcement", subtitle: "", message: "We said yes!" },
    babyShower:         { title: "👶 Baby Shower", subtitle: "", message: "A little miracle is on the way" },
    housewarming:       { title: "🏠 Housewarming", subtitle: "", message: "Warm wishes for our new home" },
    farewellCelebration: { title: "🌈 Farewell Celebration", subtitle: "", message: "Goodbyes are new beginnings" },

    jobVacancy:        { title: "🤝 Job Vacancy", subtitle: "", message: "We’re hiring! Join our team" },
    offerDiscount:     { title: "💸 Offer/Discount", subtitle: "", message: "Special sale this weekend" },
    achievementPost:   { title: "🏆 Achievement Post", subtitle: "", message: "Proud moment unlocked" },
    productLaunch:     { title: "🚀 Product Launch", subtitle: "", message: "Introducing something exciting" },
    serviceUpdate:     { title: "🔧 Service Update", subtitle: "", message: "Check out our latest features" }
  },

  tel: {
    news:       { title: "📰 బ్రేకింగ్ న్యూస్", subtitle: "", message: "మీ అప్డేట్ ఇక్కడ రాయండి..." },
    birthday:   { title: "🎂 జన్మదిన శుభాకాంక్షలు!", subtitle: "మంచి ఆశీస్సులు", message: "హ్యాపీ బర్త్‌డే 🎉" },
    devotional: { title: "🕉 శుభోదయం", subtitle: "", message: "దేవుని ఆశీస్సులు మీతో ఉండాలి 🙏" },
    business:   { title: "🏢 వ్యాపార అప్డేట్", subtitle: "", message: "మమ్మల్ని సంప్రదించండి: +91 99999 99999" },
    invitation: { title: "💌 ఆహ్వానం", subtitle: "", message: "స్థలం • తేదీ • సమయం" },
    quote:      { title: "💬 నేటి ఆలోచన", subtitle: "", message: "మీ మీద నమ్మకం పెట్టుకోండి ✨" },

    goodMorning:       { title: "🌅 శుభోదయం", subtitle: "", message: "మీ రోజు సానుకూలతతో ప్రారంభించండి" },
    goodNight:         { title: "🌙 శుభ రాత్రి", subtitle: "", message: "శాంతియుత నిద్రలు మరియు సున్నితమైన విశ్రాంతి" },
    goodAfternoon:     { title: "☀️ శుభ మధ్యాహ్నం", subtitle: "", message: "మీ రోజు బాగుండాలని ఆశిస్తున్నాము" },
    goodEvening:       { title: "🌆 శుభ సాయంత్రం", subtitle: "", message: "ఈ సాయంత్రం విశ్రాంతిగా ఉండండి" },
    weekendVibes:      { title: "😎 వీకెండ్ వైబ్‌స్కు", subtitle: "", message: "విశ్రాంత్యంతో పూట గడపండి" },

    festivalGreeting:  { title: "🎊 పండుగ శుభాకాంక్షలు", subtitle: "", message: "ఈ పండుగ సందర్భంగా ఆనందం మరియు సంపదతో ఉండండి" },
    newYearWishes:     { title: "🎆 కొత్త సంవత్సర శుభాకాంక్షలు", subtitle: "", message: "కొత్త ఆరంభం మరియు సర్వసాధారణ అవకాశాలు" },
    independenceDay:   { title: "🇮🇳 స్వాతంత్ర దినోత్సవం", subtitle: "", message: "స్వాతంత్రాన్ని జరుపుకోవడానికి గర్వపడుతున్నాము" },
    republicDay:       { title: "🕊 గణతంత్ర దినోత్సవం", subtitle: "", message: "మా జాతి ఐక్యత మరియు బలాన్ని గౌరవించండి" },
    diwaliMessage:     { title: "🪔 దీపావళి సందేశం", subtitle: "", message: "మీ జీవితాన్ని సంతోషంతో వెలిగించండి" },

    dailyMotivation:   { title: "💪 రోజురోజుకు ప్రేరణ", subtitle: "", message: "ఒక చిన్న అడుగు అన్నింటినీ మార్చొచ్చు" },
    successQuote:      { title: "🚀 విజయం సందేశం", subtitle: "", message: "కలలు కనండి. నమ్మండి. సాధించండి" },
    fitnessQuote:      { title: "🏃‍♂️ ఆరోగ్య సందేశం", subtitle: "", message: "ప్రసన్నంగా ప్రేరేపించుకోండి ఇలాంటి కారణాల కోసం" },
    positivityReminder: { title: "✨ సానుకూలత రిమైంటర్", subtitle: "", message: "మాత్రమే మంచిది ఉर्जा" },
    mindfulnessMoment: { title: "🌸 మనోనివేద నిమిషం", subtitle: "", message: "శాంతియుతంగా ఉండు, ప్రస్తుతానికి ఉండండి" },

    studyTime:         { title: "📚 పఠనం సమయం", subtitle: "", message: "వారిద్దరు ఉన్నతికి పాఠం" },
    examWishes:        { title: "✍️ పరీక్ష శుభాకాంక్షలు", subtitle: "", message: "మీ పరీక్షల కోసo శుభాకాంక్షలు" },
    resultAnnouncement: { title: "🏅 ఫలితాల ప్రకటింపు", subtitle: "", message: "మీ విజయాన్ని అభినందనలు" },
    schoolEvent:       { title: "🏫 విద్యాలయ కార్యక్రమం", subtitle: "", message: "ప్రత్యేక తరగతి కార్యక్రమానికి మాకు జత కావండి" },
    teachersDay:       { title: "🍎 గురువు దినోత్సవం", subtitle: "", message: "జ్ఞానంతో మార్గనిర్దేశం చేసినందుకు ధన్యవాదాలు" },

    weddingInvitation:  { title: "💍 పెళ్లి ఆహ్వానం", subtitle: "", message: "రెండు హృదయాలు, ఒక ప్రేమ" },
    engagementAnnounce: { title: "💞 నిశ్చయ అభినందనలు", subtitle: "", message: "మేము ఓకే అని చెప్పారు!" },
    babyShower:         { title: "👶 బేబీ షవర్", subtitle: "", message: "చిన్న అద్భుతం రాలనుంది" },
    housewarming:       { title: "🏠 ఇళ్ళ ప్రవేశం", subtitle: "", message: "మా ఇంటికి హృదయపూర్వక శుభాకాంక్షలు" },
    farewellCelebration: { title: "🌈 వీడ్కోలు వేడుక", subtitle: "", message: "వీడ్కొల్లు అనేది కొత్త ప్రారంభం" },

    jobVacancy:        { title: "🤝 ఉద్యోగ అవకాశము", subtitle: "", message: "మేము ఉద్యోగులను తీసుకుంటున్నాము! జట్టులో చేరండి" },
    offerDiscount:     { title: "💸 ఆఫర్ / డిస్కౌంట్", subtitle: "", message: "ఈ వీకెండ్ ప్రత్యేక అమ్మకాలు" },
    achievementPost:   { title: "🏆 సాధన పోస్ట్", subtitle: "", message: "గర్వపూర్వక క్షణం" },
    productLaunch:     { title: "🚀 ఉత్పత్తి ప్రారంభం", subtitle: "", message: "ఒక రోమాంచకమైన విషయం పరిచయం" },
    serviceUpdate:     { title: "🔧 సేవా నవీకరణ", subtitle: "", message: "మేము తాజా లక్షణాలను చూసుకోండి" }
  },


  hin: {
    news:       { title: "📰 ब्रेकिंग न्यूज़", subtitle: "", message: "अपना अपडेट यहाँ लिखें..." },
    birthday:   { title: "🎂 जन्मदिन मुबारक!", subtitle: "शुभकामनाएँ", message: "हैप्पी बर्थडे 🎉" },
    devotional: { title: "🕉 शुभ दिन", subtitle: "", message: "भगवान की कृपा आप पर बनी रहे 🙏" },
    business:   { title: "🏢 व्यापार अपडेट", subtitle: "", message: "संपर्क करें: +91 99999 99999" },
    invitation: { title: "💌 निमंत्रण", subtitle: "", message: "स्थान • तिथि • समय" },
    quote:      { title: "💬 आज का विचार", subtitle: "", message: "अपने आप पर विश्वास रखें ✨" }
  },

  san: {
    news:       { title: "📰 ताजा वार्ताः", subtitle: "", message: "अत्र समाचारं लिखतु..." },
    birthday:   { title: "🎂 जन्मदिनशुभाशयाः!", subtitle: "शुभकामनाः", message: "हैप्पी बर्थडे 🎉" },
    devotional: { title: "🕉 शुभदिनम्", subtitle: "", message: "ईश्वरस्य आशीर्वादाः भवन्तु 🙏" },
    business:   { title: "🏢 व्यवसायसूचना", subtitle: "", message: "सम्पर्कः: +91 99999 99999" },
    invitation: { title: "💌 आमन्त्रणम्", subtitle: "", message: "स्थानम् • तिथिः • समयः" },
    quote:      { title: "💬 आज्यस्य विचारः", subtitle: "", message: "आत्मविश्वासः कुर्वन्तु ✨" }
  },

  tam: {
    news:       { title: "📰 உடனடி செய்தி", subtitle: "", message: "உங்கள் தகவலை எழுதுங்கள்..." },
    birthday:   { title: "🎂 பிறந்தநாள் வாழ்த்துகள்!", subtitle: "அன்பு வாழ்த்துகள்", message: "Happy Birthday 🎉" },
    devotional: { title: "🕉 இனிய நாள்", subtitle: "", message: "தெய்வ ஆசீர்வாதம் உங்களுடன் 🙏" },
    business:   { title: "🏢 வணிக அறிவிப்பு", subtitle: "", message: "தொடர்பு: +91 99999 99999" },
    invitation: { title: "💌 அழைப்பிதழ்", subtitle: "", message: "இடம் • தேதி • நேரம்" },
    quote:      { title: "💬 இன்று ஒரு சிந்தனை", subtitle: "", message: "உங்களை நம்புங்கள் ✨" }
  },

  kan: {
    news:       { title: "📰 ತಾಜಾ ಸುದ್ದಿ", subtitle: "", message: "ನಿಮ್ಮ ಅಪ್‌ಡೇಟ್ ಬರೆಯಿರಿ..." },
    birthday:   { title: "🎂 ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!", subtitle: "ಶುಭಾಶಯಗಳು", message: "Happy Birthday 🎉" },
    devotional: { title: "🕉 ಶುಭ ದಿನ", subtitle: "", message: "ದೇವರ ಆಶೀರ್ವಾದ ನಿಮ್ಮೊಂದಿಗಿರಲಿ 🙏" },
    business:   { title: "🏢 ವ್ಯವಹಾರದ ಮಾಹಿತಿ", subtitle: "", message: "ಸಂಪರ್ಕಿಸಿ: +91 99999 99999" },
    invitation: { title: "💌 ಆಹ್ವಾನ", subtitle: "", message: "ಸ್ಥಳ • ದಿನಾಂಕ • ಸಮಯ" },
    quote:      { title: "💬 ಇಂದಿನ ಚಿಂತನೆ", subtitle: "", message: "ನಿಮ್ಮನ್ನು ನಂಬಿ ✨" }
  },

  mal: {
    news:       { title: "📰 ബ്രേക്കിംഗ് ന്യൂസ്", subtitle: "", message: "നിങ്ങളുടെ അപ്‌ഡേറ്റ് ഇവിടെ എഴുതുക..." },
    birthday:   { title: "🎂 ജന്മദിനാശംസകൾ!", subtitle: "നല്ല ആശംസകൾ", message: "Happy Birthday 🎉" },
    devotional: { title: "🕉 നല്ല ദിവസം", subtitle: "", message: "ദൈവാനുഗ്രഹം നിങ്ങളോടൊപ്പം 🙏" },
    business:   { title: "🏢 ബിസിനസ് അപ്ഡേറ്റ്", subtitle: "", message: "ബന്ധപ്പെടുക: +91 99999 99999" },
    invitation: { title: "💌 ക്ഷണം", subtitle: "", message: "സ്ഥലം • തീയതി • സമയം" },
    quote:      { title: "💬 ഇന്നത്തെ ചിന്ത", subtitle: "", message: "സ്വയം വിശ്വസിക്കുക ✨" }
  },

  ori: {
    news:       { title: "📰 ବ୍ରେକିଂ ନ୍ୟୁଜ୍", subtitle: "", message: "ଆପଣଙ୍କ ଅପଡେଟ୍ ଏଠାରେ ଲେଖନ୍ତୁ..." },
    birthday:   { title: "🎂 ଜନ୍ମଦିନ ଶୁଭେଚ୍ଛା!", subtitle: "ଶୁଭକାମନା", message: "Happy Birthday 🎉" },
    devotional: { title: "🕉 ଶୁଭ ଦିନ", subtitle: "", message: "ଦେବଙ୍କ ଆଶୀର୍ବାଦ ରହୁ 🙏" },
    business:   { title: "🏢 ବ୍ୟବସାୟ ସୂଚନା", subtitle: "", message: "ଯୋଗାଯୋଗ: +91 99999 99999" },
    invitation: { title: "💌 ଆମନ୍ତ୍ରଣ", subtitle: "", message: "ସ୍ଥାନ • ତାରିଖ • ସମୟ" },
    quote:      { title: "💬 ଆଜିର ଚିନ୍ତା", subtitle: "", message: "ନିଜକୁ ବିଶ୍ୱାସ କରନ୍ତୁ ✨" }
  }
}

// =====================================
// 📌 Apply Selected Template in Language
// =====================================
if (templateSelect) {
  on(templateSelect, "change", () => {
    const lang = languageSelect ? languageSelect.value : "en";
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


  // language placeholders
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
      if (titleEl) titleEl.placeholder = L.title;
      if (subtitleEl) subtitleEl.placeholder = L.subtitle;
      if (messageEl) messageEl.placeholder = L.message;
    });
  }

  // initial render
  renderPreview();
// ---------------------------------------------
// 🖼️ Final Image Generation (v3.9 — White Footer + Black Dotted Divider)
// ---------------------------------------------
async function generateImage({ download = false } = {}) {
  if (!previewCard) {
    alert("Preview not found");
    return null;
  }

  // ✅ Ensure html2canvas loaded
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

  // ✅ Validate input
  const titleText = titleEl?.value?.trim() || "";
  if (!titleText) {
    showToast("⚠️ Please enter a title before generating your poster!", "#E53935");
    return null;
  }

 // ✅ Responsive poster width & height (based on user device)
      const deviceWidth = window.innerWidth || 800;
      const width = Math.min(1200, Math.max(600, deviceWidth * 1.5));
      const height = Math.round(width * 9 / 16);
      const scale = Math.min(3, window.devicePixelRatio || 2);


  // Save original styles
  const originalWidth = previewCard.style.width;
  const originalHeight = previewCard.style.height;
  const prevPadding = previewCard.style.padding;

  // Hide any visible footer
  const htmlFooter = previewCard.querySelector(".ak-footer");
  const footerWasHidden = htmlFooter && htmlFooter.style.display === "none";
  if (htmlFooter) htmlFooter.style.display = "none";

  // Expand preview for full render
  previewCard.style.width = width + "px";
  previewCard.style.height = height + "px";
  previewCard.style.padding = "20px 30px 24px 30px";
  previewCard.style.overflow = "visible";

  // Overlay
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

    // Capture the current preview
    const baseCanvas = await html2canvas(previewCard, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      allowTaint: true,
    });

    // New canvas with footer
    const footerHeightPx = 40 * scale;
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = baseCanvas.width;
    finalCanvas.height = baseCanvas.height + footerHeightPx;

    const ctx = finalCanvas.getContext("2d");
    ctx.drawImage(baseCanvas, 0, 0);

    // ---------------------------------------------
    // ⚫ Footer Section (Black Background)
    // ---------------------------------------------
    const footerTop = baseCanvas.height;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, footerTop, finalCanvas.width, footerHeightPx);
    // ---------------------------------------------
    // ✍️ Footer Text (Light Gray)
    // ---------------------------------------------
    const fontSize = Math.max(10, Math.round(12 * scale));
    ctx.font = `${fontSize}px Montserrat, Arial, sans-serif`;
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#e0e0e0"; // soft white-gray text

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
      ctx.fillStyle = "#f44336"; // red accent dot
      ctx.fill();
    }

    // ---------------------------------------------
    // 🖼️ Export Image
    // ---------------------------------------------
    const dataUrl = finalCanvas.toDataURL("image/png");
    if (!dataUrl || dataUrl.length < 30000) {
      showToast("⚠️ Generated image seems empty — please add content.", "#E53935");
      restorePreview();
      return null;
    }

    // ✅ Auto Download
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


  // ---------------------------------------------
  // Buttons wiring
  // ---------------------------------------------
  if (generateBtn) on(generateBtn, "click", async () => { await generateImage({ download: false }); });
  if (downloadBtn) on(downloadBtn, "click", async () => { await generateImage({ download: true }); });

  // ---------------------------------------------
// 📤 Share (native + WhatsApp + fallback)
// ---------------------------------------------
async function sharePoster(isWhatsApp = false) {
  try {
    const dataUrl = await generateImage();
    if (!dataUrl) return;

    // convert to blob + file
    const resp = await fetch(dataUrl);
    const blob = await resp.blob();
    const file = new File([blob], "AksharaChitra_Poster.png", { type: blob.type });

    // ✅ Native share (works on Android, PWA, Chrome mobile)
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "AksharaChitra Poster 🎨",
        text: "Created with AksharaChitra — Multilingual Poster Maker 🌸",
      });
      showToast("✅ Shared successfully!", "#43A047");
      return;
    }
    // ⚠️ Fallback: download + open WhatsApp/text
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

// ---------------------------------------------
// 🔗 Wire both share buttons
// ---------------------------------------------
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

/* ============================================================
   FINAL — RESPONSIVE, CLEAN & OPTIMIZED GALLERY RENDER FUNCTION
   Works perfectly with your existing HTML structure.
   ============================================================ */
async function renderIndexedGallery({
  sortBy = "newest",
  filter = "",
  page = 1,
  pageSize = 12,
} = {}) {
  const galleryContainer = document.getElementById("galleryContainer");
  if (!galleryContainer) return;

  galleryContainer.style.minHeight = "120px";
  galleryContainer.innerHTML = ""; // Clear for a fresh render

  // -------------------------------
  // HEADER (Controls): Always show
  // -------------------------------
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

  // -------------------------------
  // GRID HOLDER: Placeholders/spinner
  // -------------------------------
  let gridWrap = document.createElement("div");
  gridWrap.className = "gallery-grid-wrap";
  gridWrap.innerHTML = `<div class="gallery-loading">Loading…</div>`;
  galleryContainer.appendChild(gridWrap);

  // -------------------------------
  // DATA FETCH
  // -------------------------------
  let all = [];
  try {
    all = await getAllFromDB();
  } catch (e) {
    gridWrap.innerHTML = `<div class="gallery-empty">Could not load gallery.</div>`;
    return;
  }
  all = Array.isArray(all) ? all : [];
  const total = all.length;

  // Update total count
  header.querySelector("#TotalCount").textContent = `Total: ${total}`;

  // Restore select inputs and filter
  header.querySelector("#sortSelect").value = sortBy;
  header.querySelector("#pageSizeSelect").value = pageSize;
  header.querySelector("#galleryFilter").value = filter;

  // FILTER/SORT
  let filtered = all.slice();
  const f = filter.trim().toLowerCase();
  if (f) filtered = filtered.filter(x => (x.title || "").toLowerCase().includes(f));
  if (sortBy === "newest")    filtered.sort((a, b) => b.ts - a.ts);
  if (sortBy === "oldest")    filtered.sort((a, b) => a.ts - b.ts);
  if (sortBy === "name-asc")  filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  if (sortBy === "name-desc") filtered.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

  // PAGINATION
  const totalFiltered = filtered.length;
  const ps = Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(totalFiltered / ps));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * ps;
  const items = filtered.slice(start, start + ps);

  // EMPTY STATE
  if (!items.length) {
    gridWrap.innerHTML = `<div class="gallery-empty">No posters found.</div>`;
  } else {
    // GALLERY GRID
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
    gridWrap.innerHTML = ""; // Remove spinner/empty
    gridWrap.appendChild(grid);

    // PAGINATION BAR
    const pager = document.createElement("div");
    pager.className = "gallery-pagination";
    pager.innerHTML = `
      ${currentPage > 1 ? `<button id="prevPage" class="btn ghost small">◀ Prev</button>` : ""}
      <span class="page-num">${currentPage} / ${totalPages}</span>
      ${currentPage < totalPages ? `<button id="nextPage" class="btn ghost small">Next ▶</button>` : ""}
    `;
    gridWrap.appendChild(pager);

    // EVENT HANDLERS FOR PAGINATION
    pager.querySelector("#prevPage")?.addEventListener("click", () =>
      renderIndexedGallery({ sortBy, filter, page: currentPage - 1, pageSize: ps })
    );
    pager.querySelector("#nextPage")?.addEventListener("click", () =>
      renderIndexedGallery({ sortBy, filter, page: currentPage + 1, pageSize: ps })
    );

    // CARD BUTTON HANDLERS
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

  // EVENT HANDLERS FOR HEADER (CONTROLS)
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

/* ==========================================================
   GLOBAL FUNCTIONS REQUIRED BY GALLERY
   (Fixes: openPreviewModal not defined, downloadPoster not defined,
           sharePoster not defined)
   ========================================================== */

/* ---------------------------------------------
   1) FULLSCREEN PREVIEW MODAL
---------------------------------------------- */
window.openPreviewModal = function (item) {
  // Remove old modal if exists
  const old = document.getElementById("akPreviewModal");
  if (old) old.remove();

  // Create modal
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

      <!-- CLOSE BUTTON (LEFT SIDE SUPPORT READY IN CSS) -->
      <button class="btn ghost small" id="closePreview">✖</button>
    </div>

    <img src="${item.dataUrl}" class="ak-preview-img" alt="Poster">

    <div class="ak-preview-actions">
      <button class="btn primary" id="previewDownload">⬇ Download</button>
    </div>
  `;

  modal.appendChild(box);
  document.body.appendChild(modal);

  /* ---------------------------
     BUTTON HANDLERS
  --------------------------- */

  document.getElementById("closePreview").onclick = () => modal.remove();
  document.getElementById("previewDownload").onclick = () => downloadPoster(item);

  /* ---------------------------
     CLICK OUTSIDE TO CLOSE
  --------------------------- */
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
};


/* ---------------------------------------------
   2) DOWNLOAD ONE POSTER
---------------------------------------------- */
window.downloadPoster = function (item) {
  const a = document.createElement("a");
  a.href = item.dataUrl;
  a.download = `${(item.title || "poster").replace(/[^\w\- ]/g, "")}.png`;
  a.click();
};


/* ---------------------------------------------
   3) SHARE ONE POSTER
---------------------------------------------- */
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

    // WhatsApp fallback
    const msg = `Poster: ${item.title || ""}\nCreated: ${new Date(item.ts).toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");

  } catch (err) {
    console.error("Share failed", err);
    showToast("Share failed", "#E53935");
  }
};


// =============================================================
// 🌸 AksharaChitra — Universal Voice Typing + Read Aloud (v20)
// -------------------------------------------------------------
// ✅ Speech Typing (Chrome / Edge)
// ✅ Auto Readback (All Browsers)
// ✅ Graceful fallback for Safari / Firefox
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

// ---------------------------------------------
// 🗣️ Speech Typing (if supported)
// ---------------------------------------------
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
    if(selected === undefined) {
      console.log("No language selected, defaulting to en-IN");
    }
    else  if(selected in langMap) {
      recog.lang = langMap[selected];
      console.log("Language found in langMap:", langMap[selected]);
    }
   
    else {
      recog.lang = "en-IN"; 
      console.log("Selected language not found in langMap, defaulting to en-IN");
    }
  }

  if (languageSelect) on(languageSelect, "change", updateLanguage);
  updateLanguage();

  // 🎤 Start
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

  // 🛑 Stop
  on(stopVoiceBtn, "click", () => {
    try { recog.stop(); } catch {}
    startVoiceBtn.classList.remove("listening");
    showToast("🛑 Stopped listening", "#E53935");
  });

  // ✅ Result
  recog.onresult = (ev) => {
    const transcript = ev.results[0][0].transcript.trim();
    if (!transcript) return;

    messageEl.value = (messageEl.value ? messageEl.value + " " : "") + transcript;
    if (typeof renderPreview === "function") renderPreview();

    readText(transcript, languageSelect.value);
  };

  recog.onend = () => startVoiceBtn.classList.remove("listening");

} else {
  // 🪶 Fallback for Safari / Firefox
  startVoiceBtn.disabled = true;
  stopVoiceBtn.disabled = true;
  showToast("🎙️ Voice typing not supported in this browser.", "#F57C00");
}

// ---------------------------------------------
// 🔊 Universal Text-to-Speech (All browsers)
// ---------------------------------------------
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

  // Pick voice matching the language
  const voices = synth.getVoices();
  const match = voices.find(v => v.lang === utter.lang);
  if (match) utter.voice = match;

  synth.cancel();
  synth.speak(utter);
  showToast(`🔊 Speaking in ${langCode.toUpperCase()}...`, "#3949ab");
}

// 🔘 Optional button to read full message
const readBtn = $("readMessageBtn");
if (readBtn) {
  on(readBtn, "click", () => readText(messageEl.value, languageSelect.value));
}

// Load voices (important for Safari)
if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.onvoiceschanged = () => synth.getVoices();
}


// Select OCR elements
const ocrImageInput = document.getElementById('ocrImageInput');
const startOcrBtn = document.getElementById('startOcrBtn');
const ocrResult = document.getElementById('ocrResult');
const pasteOcrToMessageBtn = document.getElementById('pasteOcrToMessageBtn');

// Function to clear OCR inputs and reset UI
function clearOcrInputs() {
  if (ocrImageInput) ocrImageInput.value = '';           // Clear file input
  if (ocrResult) ocrResult.value = '';                   // Clear OCR result textarea
  if (startOcrBtn) startOcrBtn.disabled = true;          // Disable start OCR button
  if (pasteOcrToMessageBtn) pasteOcrToMessageBtn.disabled = true;  // Disable paste button
}

// Example usage - attach to some reset or clear button
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
    uploadedMainData = ""; uploadedLogoData = "";
    if (imageUpload) imageUpload.value = ""; if (smallLogoUpload) smallLogoUpload.value = "";
    try { if (cropper) cropper.destroy(); } catch (e) {}
    cropper = null; cropTarget = null; if (cropModal) cropModal.classList.add("hidden");
    [titleSize, subtitleSize, messageSize].forEach(e => { if (e) e.value = ""; });
    [titleAlign, subtitleAlign, contentAlign].forEach(e => { if (e) e.value = "center"; });
    [titleColor, subtitleColor, messageColor].forEach(e => { if (e) e.value = "#000000"; });
    [titleBg, subtitleBg, messageBg].forEach(e => { if (e) e.value = "#FFFFFF"; });
    if (previewCard) previewCard.style.background = "#FFFFFF";
    [pTitle, pSubtitle, pMessage].forEach(el => { if (el) el.style.color = "#000000"; });
    if (fontFamily) fontFamily.value = "Montserrat, sans-serif"; if (imagePosition) imagePosition.value = "center";
    if (languageSelect) languageSelect.value = "en";
    if (posterDateOption) posterDateOption.value = ""; if (customDate) customDate.value = ""; posterDate = "";
    const qrText = $("qrText"); if (qrText) qrText.value = "";
    const templateSelect = $("templateSelect"); if (templateSelect) templateSelect.value = "";
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch {}
    setTimeout(renderPreview, 120);
    const msg = document.createElement("div"); msg.textContent = "✅ All fields and settings have been reset!";
    Object.assign(msg.style, { position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "#4CAF50", color: "#fff", padding: "10px 18px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", fontFamily: "Montserrat, sans-serif", fontSize: "0.9rem", zIndex: "9999", opacity: "0", transition: "opacity 0.3s ease" });
    document.body.appendChild(msg); setTimeout(() => msg.style.opacity = "1", 50); setTimeout(() => { msg.style.opacity = "0"; setTimeout(() => msg.remove(), 600); }, 2500);
   clearOcrInputs();
  });

  // ---------------------------------------------
  // Go to top
  // ---------------------------------------------
  if (goTopBtn) {
    on(goTopBtn, "click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", () => { goTopBtn.style.display = window.scrollY > 300 ? "block" : "none"; });
  }

  // ---------------------------------------------
  // Autosave + restore
  // ---------------------------------------------
  setInterval(() => {
    try {
      const state = { title: titleEl?.value || "", subtitle: subtitleEl?.value || "", message: messageEl?.value || "", ts: Date.now() };
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

  // footer year
  const yr = $("year"); if (yr) yr.textContent = new Date().getFullYear();

  // expose API for debugging
  window.ak = { renderPreview, generateImage, renderIndexedGallery, saveToDB, deleteFromDB };
  console.log("✅ AksharaChitra v18.0 loaded successfully!");
/* ==========================================================
   🌐 FIX PWA FIRST-LOAD GALLERY BUG (Android Chrome)
   Ensures Gallery loads ONLY after:
   ✔ ServiceWorker ready
   ✔ DOM settled
   ✔ IndexedDB opened
   ========================================================== */
async function initGallerySafe() {
  // 1. Wait until Service Worker is fully active
  if (navigator.serviceWorker) {
    try {
      await navigator.serviceWorker.ready;  // Wait for service worker to be ready
    } catch (e) {}
  }

  // 2. Wait for DOM to be fully painted (important for PWAs)
  await new Promise(r => requestAnimationFrame(r));

  // 3. Small delay to ensure UI is loaded and ready
  await new Promise(r => setTimeout(r, 150));  // Increased delay to ensure readiness

  // 4. Ensure IndexedDB is ready
  await openDB();

  // 5. Finally load the gallery
  renderIndexedGallery();
}


window.initGallerySafe = initGallerySafe;

/* ------------------------------------------------------------------
   🌐 Unified Tab + Mobile Menu Controller (Final Stable Version)
   ------------------------------------------------------------------ */

const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

// Open / close menu
if (hamburgerBtn && mobileMenu) {
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("open");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      mobileMenu.classList.remove("open");
    }
  });
}

// -----------------------------------------------------------
// ⭐ UNIFIED TAB SWITCH FUNCTION (desktop + mobile + external)
// -----------------------------------------------------------
function activateTab(tab) {
  // Hide all sections
  document.querySelectorAll(".tab-content")
    .forEach(sec => sec.classList.remove("active"));

  // Remove active from buttons
  document.querySelectorAll(".tab-btn")
    .forEach(b => b.classList.remove("active"));

  // Show selected section
  const section = document.getElementById(tab);
  if (section) section.classList.add("active");

  // Highlight desktop nav
  const desktopBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (desktopBtn) desktopBtn.classList.add("active");

  // Special: Gallery
  if (tab === "gallery") {
    setTimeout(initGallerySafe, 120);
  }

  // Close mobile menu if open
  if (mobileMenu) mobileMenu.classList.remove("open");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.activateTab = activateTab; // If needed globally

// Desktop nav
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

// Mobile nav
document.querySelectorAll(".m-item").forEach(item => {
  item.addEventListener("click", () => activateTab(item.dataset.tab));
});

// Default tab on first load
activateTab("home");




// SHARE BUTTON ON HOME PAGE
const shareHomeBtn = document.getElementById("home_feature_share_btn");

if (shareHomeBtn) {
  shareHomeBtn.onclick = async () => {
    // 🌟 COMPREHENSIVE SHARE MESSAGE - Covers ALL features
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

    // 1️⃣ Try Native Share API First
    if (navigator.share) {
      try {
        await navigator.share(data);
        return; // Success - stop here
      } catch (error) {
        // User cancelled share dialog
        if (error.name === 'AbortError') {
          console.log('Share cancelled by user');
          return; // Don't force other methods if user cancelled intentionally
        }
        console.log('Native share failed, trying fallbacks:', error);
      }
    }

    // 2️⃣ WhatsApp Fallback (Mobile Preferred)
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Direct WhatsApp share
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      const whatsappWindow = window.open(whatsappUrl, "_blank");
      
      // If popup blocked, try clipboard
      if (!whatsappWindow) {
        await fallbackToClipboard(message);
      }
      return;
    }

    // 3️⃣ Desktop: Clipboard First, then offer options
    await fallbackToClipboard(message);
  };
}

// 🎯 Clipboard Fallback Function
async function fallbackToClipboard(message) {
  try {
    await navigator.clipboard.writeText(message);
    
    // Success alert with options
    const shareNow = confirm(
      "✅ Message copied to clipboard!\n\n" +
      "📋 You can now paste it anywhere to share.\n\n" +
      "Would you like to open WhatsApp Web?"
    );
    
    if (shareNow) {
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
    }
  } catch (clipError) {
    // Final fallback: Manual copy via prompt
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

// 🎯 Optional: Add share analytics/tracking
function trackShare(method) {
  console.log(`Share attempted via: ${method}`);
  // Add your analytics here if needed
  // Example: gtag('event', 'share', { method: method });
}
});

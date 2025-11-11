/* ==========================================================
   🌸 AksharaChitra — create-section.js (v15.30)
   ----------------------------------------------------------
   Features:
   • Dynamic font switching by language
   • Collapsible Poster Information (hidden by default)
   • Smooth toggle animation + responsive design
   • Real-time preview + font update
   • Home language preview toggle
   ----------------------------------------------------------
   Author: Sandeep Miriyala
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------------- Element References ----------------------
  const languageSelect = q("#language");
  const templateSelect = q("#templateSelect");
  const titleEl = q("#title");
  const subtitleEl = q("#subtitle");
  const messageEl = q("#message");
  const fontFamilySelect = q("#fontFamily");
  const previewCard = q("#previewCard");
  const previewLangSelect = q("#previewLangSelect");

  // ---------------------- Poster Info UI ----------------------
  let infoBox = q("#posterInfoBox");
  let toggleBtn = q("#toggleInfoBtn");

  // Create container + button if missing
  if (previewCard && !infoBox) {
    const container = document.createElement("div");
    container.className = "poster-info-container";

    toggleBtn = document.createElement("button");
    toggleBtn.id = "toggleInfoBtn";
    toggleBtn.className = "info-toggle-btn";
    toggleBtn.textContent = "🧾 Show Poster Info";

    infoBox = document.createElement("div");
    infoBox.id = "posterInfoBox";
    infoBox.className = "poster-info-box hidden";
    infoBox.innerHTML = `
      <h3>🧾 Poster Information</h3>
      <p id="infoLang">🌐 Language: —</p>
      <p id="infoTemplate">🧩 Template: —</p>
      <p id="infoFont">✍️ Font: —</p>
      <p id="infoTitle">🖋️ Title: —</p>
      <p id="infoSubtitle">🪶 Subtitle: —</p>
      <p id="infoMessage">💬 Message: —</p>
    `;

    container.appendChild(toggleBtn);
    container.appendChild(infoBox);
    previewCard.parentNode.insertBefore(container, previewCard);
  }

  // --- Poster Info fields ---
  const infoLang = q("#infoLang");
  const infoTemplate = q("#infoTemplate");
  const infoFont = q("#infoFont");
  const infoTitle = q("#infoTitle");
  const infoSubtitle = q("#infoSubtitle");
  const infoMessage = q("#infoMessage");

  // --- Poster Preview text fields ---
  const pTitle = q("#pTitle");
  const pSubtitle = q("#pSubtitle");
  const pMessage = q("#pMessage");

  // --- Font preview ---
  let fontPreview = q("#fontPreview");
  if (!fontPreview && fontFamilySelect) {
    fontPreview = document.createElement("p");
    fontPreview.id = "fontPreview";
    fontPreview.style.cssText = `
      margin-top:8px;font-size:1.05rem;text-align:center;
      background:#f1f4fa;border-radius:8px;padding:8px;
      color:#222;font-family:'Poppins',sans-serif;`;
    fontFamilySelect.parentNode.insertBefore(fontPreview, fontFamilySelect.nextSibling);
  }

  // ---------------------- Font Map ----------------------
  const FONT_MAP = {
en: [
  "Montserrat",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Playfair Display",
  "Oswald",
  "Raleway",
  "Inter",
  "Bebas Neue",
  "Nunito",
  "Merriweather",
  "Pacifico",
  "Cinzel",
  "Quicksand",
  "Josefin Sans",
  "DM Serif Display",
  "Great Vibes",
  "Lobster",
  "Dancing Script",
  "Comfortaa",
  "Courgette",
  "Righteous",
  "Orbitron",
  "Exo 2",
  "Prompt",
  "Ubuntu",
  "Fira Sans",
  "Source Sans Pro",
  "Arvo"
],

    te: ["Noto Sans Telugu", "NTR", "Ramabhadra", "Mandali", "Veturi", "Sirivennela", "Ramaneeya" ,"Ramaraja","RaviPrakash","TenaliRamakrishna-Regular"
      ,"TANA","TimmanaRegular"
    ],
    hi: ["Noto Serif Devanagari", "Hind", "Karma"],
    sa: ["Tiro Devanagari Sanskrit", "Noto Serif Devanagari"],
    ta: ["Noto Sans Tamil", "Tiro Tamil"],
    kn: ["Noto Sans Kannada"],
    ml: ["Noto Sans Malayalam"],
    or: ["Noto Sans Oriya"]
  };

  // ---------------------- Sample Text ----------------------
  const SAMPLE_TEXT = {
    en: "Create beautiful posters easily!",
    te: "ఇంచక్కటి తెలుగు వదలి ఇతర భాషలెందుకురా 🎨",
    hi: "सुंदर पोस्टर बनाएँ 🌸",
    sa: "सौन्दर्यमयं पोस्टरं निर्मियताम् 🕉️",
    ta: "அழகான போஸ்டரை உருவாக்குங்கள் 🎉",
    kn: "ಅಂದವಾದ ಪೋಸ್ಟರ್ ರಚಿಸಿ 🌈",
    ml: "അലങ്കാരമായ പോസ്റ്റർ സൃഷ്ടിക്കുക 🌺",
    or: "ସୁନ୍ଦର ପୋଷ୍ଟର ତିଆରି କରନ୍ତୁ 💫"
  };

  // ---------------------- Utility ----------------------
  const safeSet = (el, txt) => el && (el.textContent = txt);

  // ---------------------- Font Handling ----------------------
  function updateFontList(lang) {
    if (!fontFamilySelect) return;
    const fonts = FONT_MAP[lang] || FONT_MAP.en;
    fontFamilySelect.innerHTML = "";
    fonts.forEach((font) => {
      const opt = document.createElement("option");
      opt.value = font;
      opt.textContent = font;
      fontFamilySelect.appendChild(opt);
    });
    updateFontPreview();
  }

  // ---------------------- Summary + Preview ----------------------
  function updateSummaryAndPreview() {
    const langText = languageSelect ? languageSelect.options[languageSelect.selectedIndex].text : "—";
    const templateText = templateSelect ? templateSelect.value || "—" : "—";
    const fontText = fontFamilySelect ? fontFamilySelect.value || "—" : "—";
    const titleText = titleEl ? titleEl.value || "—" : "—";
    const subtitleText = subtitleEl ? subtitleEl.value || "—" : "—";
    const messageText = messageEl ? messageEl.value || "—" : "—";

    safeSet(infoLang, `🌐 Language: ${langText}`);
    safeSet(infoTemplate, `🧩 Template: ${templateText}`);
    safeSet(infoFont, `✍️ Font: ${fontText}`);
    safeSet(infoTitle, `🖋️ Title: ${titleText}`);
    safeSet(infoSubtitle, `🪶 Subtitle: ${subtitleText}`);
    safeSet(infoMessage, `💬 Message: ${messageText}`);

    if (pTitle) pTitle.textContent = titleText === "—" ? "" : titleText;
    if (pSubtitle) pSubtitle.textContent = subtitleText === "—" ? "" : subtitleText;
    if (pMessage) pMessage.textContent = messageText === "—" ? "" : messageText;
    if (previewCard && fontFamilySelect) previewCard.style.fontFamily = fontFamilySelect.value;
  }

  // ---------------------- Font Preview ----------------------
  function updateFontPreview() {
    const lang = languageSelect ? languageSelect.value : "en";
    const font = fontFamilySelect ? fontFamilySelect.value : "";
    const sample = SAMPLE_TEXT[lang] || SAMPLE_TEXT.en;
    if (fontPreview) {
      fontPreview.textContent = sample;
      fontPreview.style.fontFamily = font;
      fontPreview.style.display = "block";
    }
    updateSummaryAndPreview();
  }

  // ---------------------- Home Preview Grid ----------------------
  function updateHomePreview(lang) {
    const cards = qa("#fontPreviewGrid .font-card");
    cards.forEach((card) => {
      if (card.dataset.lang === lang) {
        card.style.display = "block";
        card.style.opacity = "1";
      } else {
        card.style.display = "none";
        card.style.opacity = "0";
      }
    });
  }

  // ---------------------- Info Box Toggle ----------------------
  if (toggleBtn && infoBox) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = infoBox.classList.toggle("hidden");
      toggleBtn.textContent = isHidden ? "🧾 Show Poster Info" : "❌ Hide Poster Info";
    });
  }

  // ---------------------- Event Listeners ----------------------
  if (languageSelect) languageSelect.addEventListener("change", () => updateFontList(languageSelect.value));
  if (templateSelect) templateSelect.addEventListener("change", updateSummaryAndPreview);
  if (fontFamilySelect) fontFamilySelect.addEventListener("change", updateFontPreview);
  if (titleEl) titleEl.addEventListener("input", updateSummaryAndPreview);
  if (subtitleEl) subtitleEl.addEventListener("input", updateSummaryAndPreview);
  if (messageEl) messageEl.addEventListener("input", updateSummaryAndPreview);

  if (previewLangSelect) {
    updateHomePreview(previewLangSelect.value);
    previewLangSelect.addEventListener("change", (e) => updateHomePreview(e.target.value));
  }

  // ---------------------- Initialize ----------------------
  if (languageSelect) updateFontList(languageSelect.value || "en");
  updateSummaryAndPreview();
});

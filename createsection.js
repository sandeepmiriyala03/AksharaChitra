/* ==========================================================
   🌸 AksharaChitra — create-section.js (v18.0)
   ----------------------------------------------------------
   Upgrades:
   • Title / Subtitle / Message Font Family selectors
   • Live preview under each selector (3 preview boxes)
   • Poster Info Box shows all 3 fonts individually
   • Full language → font auto-loading for all selectors
   • Smooth reactive update for previewCard also
   ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  // ---------------------- Inputs ----------------------
  const languageSelect = q("#language");
  const templateSelect = q("#templateSelect");

  const titleEl = q("#title");
  const subtitleEl = q("#subtitle");
  const messageEl = q("#message");

  // Font selectors
  const titleFontFamily = q("#titleFontFamily");
  const subtitleFontFamily = q("#subtitleFontFamily");
  const messageFontFamily = q("#fontFamily");

  // Poster preview fields
  const pTitle = q("#pTitle");
  const pSubtitle = q("#pSubtitle");
  const pMessage = q("#pMessage");

  // Info box
  const infoLang = q("#infoLang");
  const infoTemplate = q("#infoTemplate");
  const infoFont = q("#infoFont");
  const infoTitle = q("#infoTitle");
  const infoSubtitle = q("#infoSubtitle");
  const infoMessage = q("#infoMessage");

  // ---------------------- Preview Boxes ----------------------
  function insertPreviewBox(afterEl, id) {
    if (!afterEl) return null;
    let box = q(`#${id}`);

    if (!box) {
      box = document.createElement("div");
      box.id = id;
      box.style.cssText = `
        margin-top:6px;
        padding:8px;
        background:var(--glass);
        border-radius:8px;
        box-shadow:var(--shadow-sm);
        font-size:1rem;
        text-align:center;
      `;
      afterEl.parentNode.insertBefore(box, afterEl.nextSibling);
    }
    return box;
  }

  const titlePreviewBox = insertPreviewBox(titleFontFamily, "titleFontPreview");
  const subtitlePreviewBox = insertPreviewBox(subtitleFontFamily, "subtitleFontPreview");
  const messagePreviewBox = insertPreviewBox(messageFontFamily, "messageFontPreview");

  // ---------------------- FONT MAP ----------------------
  const FONT_MAP = {
    eng: ["Arvo","Bebas Neue","Cinzel","Comfortaa","DM Serif Display","Inter",
         "Lato","Lobster","Merriweather","Montserrat","Nunito","Open Sans",
         "Playfair Display","Poppins","Prompt","Quicksand","Raleway",
         "Roboto","Ubuntu"],
      tel: [
        "Mandali",
        "Noto Sans Telugu",
        "NTR",
        "Ramabhadra",
        "Gidugu",
        //appaji fonts here
        "RamaneeyaWin",
        "Ramaraja",
        "RaviPrakash",
        "Sirivennela",
        "TANA",
        "TenaliRamakrishna",
        "Timmana",
        "Veturi"
      ],

    hin: ["Hind","Karma","Noto Serif Devanagari"],
    san: ["Noto Serif Devanagari","Tiro Devanagari Sanskrit"],
    tam: ["Noto Sans Tamil","Tiro Tamil"],
    kan: ["Noto Sans Kannada"],
    mal: ["Noto Sans Malayalam"],
    ori: ["Noto Sans Oriya"]
  };

  // ---------------------- SAMPLE TEXT ----------------------
  const SAMPLE_TEXT = {
    eng: "The quick brown fox jumps over the lazy dog",
    tel: "ఇంచక్కటి తెలుగు వదలి ఇతర భాషలెందుకురా..",
    hin: "उदाहरण: सुंदर पोस्टर टेक्स्ट",
    san: "उदाहरणम्: सुन्दरम् लेखनम्",
    tam: "உதாரணம்: அழகான உரை",
    kan: "ಉದಾಹರಣೆ: ಸುಂದರ ಪೋಸ್ಟರ್",
    mal: "ഉദാഹരണം: മനോഹരമായ ടെക്സ്റ്റ്",
    ori: "ଉଦାହରଣ: ସୁନ୍ଦର ପୋଷ୍ଟର ଟେକ୍ସଟ୍"
  };

  // ---------------------- HELPERS ----------------------
  const safeSet = (el, txt) => el && (el.textContent = txt);

  function fillFonts(selectEl, fonts) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    fonts.forEach(font => {
      const opt = document.createElement("option");
      opt.value = font;
      opt.textContent = font;
      selectEl.appendChild(opt);
    });
  }

  // ---------------------- LOAD FONTS (ALL THREE SELECTORS) ----------------------
  function loadFontsForLanguage(lang) {
    const fonts = FONT_MAP[lang] || FONT_MAP["en"];

    fillFonts(titleFontFamily, fonts);
    fillFonts(subtitleFontFamily, fonts);
    fillFonts(messageFontFamily, fonts);

    updateAllPreviews();
  }

  // ---------------------- UPDATE PREVIEW + INFO BOX ----------------------
  function updateAllPreviews() {
    const lang = languageSelect?.value || "en";

    // font values
    const titleFont = titleFontFamily?.value;
    const subtitleFont = subtitleFontFamily?.value;
    const messageFont = messageFontFamily?.value;

    // text inputs
    const t = titleEl?.value || "";
    const s = subtitleEl?.value || "";
    const m = messageEl?.value || "";

    // poster box preview
    if (pTitle)  pTitle.style.fontFamily = titleFont;
    if (pSubtitle) pSubtitle.style.fontFamily = subtitleFont;
    if (pMessage) pMessage.style.fontFamily = messageFont;

    if (pTitle) pTitle.textContent = t;
    if (pSubtitle) pSubtitle.textContent = s;
    if (pMessage) pMessage.textContent = m;

    // 🔥 preview boxes (below selectors)
    if (titlePreviewBox) {
      titlePreviewBox.textContent = t || SAMPLE_TEXT[lang];
      titlePreviewBox.style.fontFamily = titleFont;
    }

    if (subtitlePreviewBox) {
      subtitlePreviewBox.textContent = s || SAMPLE_TEXT[lang];
      subtitlePreviewBox.style.fontFamily = subtitleFont;
    }

    if (messagePreviewBox) {
      messagePreviewBox.textContent = m || SAMPLE_TEXT[lang];
      messagePreviewBox.style.fontFamily = messageFont;
    }

    // 🔥 poster info box
    safeSet(infoLang, `🌐 Language: ${languageSelect?.options[languageSelect.selectedIndex].text}`);
    safeSet(infoTemplate, `🧩 Template: ${templateSelect?.value || "—"}`);
    safeSet(infoFont,
      `✍️ Fonts → 
       Title: ${titleFont}, 
       Subtitle: ${subtitleFont}, 
       Message: ${messageFont}`
    );
    safeSet(infoTitle, `🖋️ Title: ${t || "—"}`);
    safeSet(infoSubtitle, `🪶 Subtitle: ${s || "—"}`);
    safeSet(infoMessage, `💬 Message: ${m || "—"}`);
  }

  // ---------------------- EVENTS ----------------------
  languageSelect?.addEventListener("change", () => {
    loadFontsForLanguage(languageSelect.value);
  });

  templateSelect?.addEventListener("change", updateAllPreviews);

  [titleEl, subtitleEl, messageEl].forEach(el =>
    el?.addEventListener("input", updateAllPreviews)
  );

  [titleFontFamily, subtitleFontFamily, messageFontFamily].forEach(sel =>
    sel?.addEventListener("change", updateAllPreviews)
  );

  // ---------------------- INIT ----------------------
  loadFontsForLanguage(languageSelect?.value || "en");
  updateAllPreviews();
});

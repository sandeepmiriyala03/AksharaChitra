/* ==========================================================
   🌸 AksharaChitra — create-section.js (v18.1)
   ----------------------------------------------------------
   Upgrades:
   • Title / Subtitle / Message Font Family selectors
   • Live preview under each selector (3 preview boxes)
   • Poster Info Box shows all 3 fonts individually
   • Full language → font auto-loading for all selectors
   • Smooth reactive update for previewCard also
   • ✨ Replaced alerts with styled message displays
   ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {


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
        "Chathura-Bold",
  "Chathura-ExtraBold",
  "Chathura-Light",
  "Chathura-Regular",
  "Chathura-Thin",
  "RamaneeyaWin",
  "Ramaraja-Regular",
  "RaviPrakash",
  "Sirivennela",
  "TANA",
  "TenaliRamakrishna-Regular",
  "TimmanaRegular",
  "Veturi"
      ],

    hin: ["Hind","Karma","Noto Serif Devanagari"],
    san: ["Noto Serif Devanagari","Tiro Devanagari Sanskrit"],
    tam: ["Noto Sans Tamil","Tiro Tamil"],
    kan: ["Noto Sans Kannada"],
    mal: ["Noto Sans Malayalam"],
    ori: ["Noto Sans Oriya"]
  };
  const q = (sel) => document.querySelector(sel);


  // ---------------------- MESSAGE DISPLAY SYSTEM ----------------------
  function showMessage(text, type = "info") {
    // Remove existing message if any
    const existing = q("#fontMessage");
    if (existing) existing.remove();

    // Create message element
    const msg = document.createElement("div");
    msg.id = "fontMessage";
    
    const colors = {
      success: { bg: "#d4edda", border: "#c3e6cb", text: "#155724", icon: "✓" },
      error: { bg: "#f8d7da", border: "#f5c6cb", text: "#721c24", icon: "✗" },
      warning: { bg: "#fff3cd", border: "#ffeaa7", text: "#856404", icon: "⚠" },
      info: { bg: "#d1ecf1", border: "#bee5eb", text: "#0c5460", icon: "ℹ" }
    };

    const style = colors[type] || colors.info;

    msg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px 20px;
      background: ${style.bg};
      border: 2px solid ${style.border};
      border-radius: 12px;
      color: ${style.text};
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      display: flex;
      align-items: center;
      gap: 12px;
    `;

    msg.innerHTML = `
      <span style="font-size: 1.3rem;">${style.icon}</span>
      <span style="flex: 1;">${text}</span>
      <button onclick="this.parentElement.remove()" style="
        background: transparent;
        border: none;
        color: ${style.text};
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
    `;

    // Add animation
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    if (!q("#messageStyles")) {
      styleSheet.id = "messageStyles";
      document.head.appendChild(styleSheet);
    }

    document.body.appendChild(msg);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (msg && msg.parentElement) {
        msg.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => msg.remove(), 300);
      }
    }, 4000);
  }


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
  const loadLocalBtn = document.getElementById("fontSelect_local");
const localFontsDropdown = document.getElementById("fontSelect_savelocal");
const localFontInfo = document.getElementById("CreatelocalFontInfo");
const saveLocalFontBtn = document.getElementById("fontSelect_saveLocal");
let CUSTOM_FONTS = JSON.parse(localStorage.getItem("FontsConfig") || "{}");

  Object.keys(FONT_MAP).forEach(lang => {
    if (!CUSTOM_FONTS[lang]) CUSTOM_FONTS[lang] = [];
    FONT_MAP[lang] = [...new Set([...FONT_MAP[lang], ...CUSTOM_FONTS[lang]])].sort();
  });

  loadLocalBtn.onclick = loadLocalFonts;
  const langSelect = document.getElementById("language");
async function loadLocalFonts() {
  if (!window.queryLocalFonts) {
    showMessage("Local Font Access API is not supported in this browser.", "error");
    return;
  }

  try {
    const fonts = await window.queryLocalFonts();
    localFontsDropdown.innerHTML = "";

    const lang = langSelect.value; // Get currently selected language

    // Use a Set for faster exact match checking
    const langFontsSet = new Set(FONT_MAP[lang] || FONT_MAP["eng"]);

    // Filter fonts where the full font name exactly matches any language font name
    const filteredFonts = fonts.filter(f => langFontsSet.has(f.fullName));

    // If no filtered fonts found, fallback to showing all fonts but mark it
    const displayFonts = filteredFonts.length ? filteredFonts : fonts;

    displayFonts.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f.fullName;
      opt.textContent = f.fullName;
      localFontsDropdown.appendChild(opt);
    });

    if (displayFonts.length > 0) {
      localFontsDropdown.style.display = "inline-block";
      saveLocalFontBtn.style.display = "inline-block";
      localFontInfo.style.display = "block";
      localFontInfo.textContent = filteredFonts.length
        ? `${filteredFonts.length} fonts found for ${lang}`
        : `No exact font matches found for ${lang}, showing all (${fonts.length})`;
    }
  } catch (error) {
    showMessage("Permission denied to access local fonts.", "warning");
  }
}


saveLocalFontBtn.onclick = () => {
  const lang = langSelect.value;
  const name = localFontsDropdown.value;

  if (!name) {
    showMessage("Please select a font first!", "warning");
    return;
  }

  if (FONT_MAP[lang].includes(name)) {
    showMessage(`Font "${name}" is already added!`, "info");
    return;
  }

  if (!CUSTOM_FONTS[lang]) {
    CUSTOM_FONTS[lang] = [];
  }

  CUSTOM_FONTS[lang].push(name);
  localStorage.setItem("FontsConfig", JSON.stringify(CUSTOM_FONTS));

  FONT_MAP[lang].push(name);
  FONT_MAP[lang].sort();

  fillFonts(titleFontFamily, FONT_MAP[lang]);
  fillFonts(subtitleFontFamily, FONT_MAP[lang]);
  fillFonts(messageFontFamily, FONT_MAP[lang]);
  
  showMessage(`Font "${name}" successfully added! 🎉`, "success");
};
});
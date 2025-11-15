/* ==========================================================
   🌸 AksharaChitra — Home Section Script (v15 FINAL)
   ----------------------------------------------------------
   ✔ Font Selection + Search
   ✔ Auto Sample Preview
   ✔ Save Custom Fonts per Language
   ✔ Local Font Access API (FIXED)
   ✔ Browser AI Capability Detector
   ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------
     FONT MAP + SAMPLE TEXT
  ---------------------------------------------------------- */
  const FONT_MAP = {
    en: ["Arvo","Bebas Neue","Cinzel","Comfortaa","DM Serif Display","Inter",
         "Lato","Lobster","Montserrat","Nunito","Open Sans","Playfair Display",
         "Poppins","Raleway","Roboto","Ubuntu"],
    te: ["Mandali","NTR","Ramabhadra","Ramaneeya","Ramaraja","RaviPrakash",
         "Sirivennela","TenaliRamakrishna-Regular","TimmanaRegular","Veturi"],
    hi: ["Hind","Karma","Noto Serif Devanagari"],
    sa: ["Noto Serif Devanagari","Tiro Devanagari Sanskrit"],
    ta: ["Noto Sans Tamil","Tiro Tamil"],
    kn: ["Noto Sans Kannada"],
    ml: ["Noto Sans Malayalam"],
    or: ["Noto Sans Oriya"]
  };

  /* Load custom saved fonts */
  let CUSTOM_FONTS = JSON.parse(localStorage.getItem("ac_custom_fonts") || "{}");
  for (const lang of Object.keys(FONT_MAP)) {
    if (!CUSTOM_FONTS[lang]) CUSTOM_FONTS[lang] = [];
    FONT_MAP[lang].push(...CUSTOM_FONTS[lang]);
  }

  const SAMPLE_TEXT = {
    en: "Create beautiful posters easily!",
    te: "అందమైన పోస్టర్ సృష్టించండి 🎨",
    hi: "सुंदर पोस्टर बनाएँ 🌸",
    sa: "सौन्दर्यमयं पोस्टरं निर्मियताम् 🕉️",
    ta: "அழகான போஸ்டரை உருவாக்குங்கள் 🎉",
    kn: "ಅಂದವಾದ ಪೋಸ್ಟರ್ ರಚಿಸಿ 🌈",
    ml: "അലങ്കാരമായ പോസ്റ്റർ സൃഷ്ടിക്കുക 🌺",
    or: "ସୁନ୍ଦର ପୋଷ୍ଟର ତିଆରି କରନ୍ତୁ 💫"
  };

  /* ----------------------------------------------------------
     DOM ELEMENTS
  ---------------------------------------------------------- */
  const langSelect = document.getElementById("previewLangSelect");
  const fontPreviewGrid = document.getElementById("fontPreviewGrid");
  let fontOutput = document.getElementById("fontOutput");

  /* Ensure fontOutput exists only once */
  function ensureFontOutput() {
    const all = document.querySelectorAll("#fontOutput");
    if (all.length > 1) {
      for (let i = 1; i < all.length; i++) all[i].remove();
    }
  }
  ensureFontOutput();

  /* ----------------------------------------------------------
     Font Search + Dropdown
  ---------------------------------------------------------- */
  const container = document.createElement("div");
  container.style.marginTop = "10px";

  const fontSearch = document.createElement("input");
  fontSearch.placeholder = "🔍 Search fonts...";
  fontSearch.className = "font-search";
  fontSearch.style = `
    width: 100%;
    padding: 8px;
    margin-bottom: 6px;
    border-radius: 8px;
    border: 1px solid #bbb;
  `;
  container.appendChild(fontSearch);

  const fontSelect = document.createElement("select");
  fontSelect.id = "fontSelect";
  fontSelect.className = "font-select-minimal";
  fontSelect.style.width = "100%";
  container.appendChild(fontSelect);

  /* Insert UI after language selector */
  langSelect.insertAdjacentElement("afterend", container);

  /* ----------------------------------------------------------
     Fade animation
  ---------------------------------------------------------- */
  function fade(el) {
    el.style.opacity = "0.01";
    el.style.transform = "translateY(4px)";
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 10);
  }

  /* ----------------------------------------------------------
     Update Fonts
  ---------------------------------------------------------- */
  function updateFontDropdown(lang) {
    fontSelect.innerHTML = "";
    const fonts = FONT_MAP[lang] || [];

    fonts.forEach(font => {
      const opt = document.createElement("option");
      opt.value = font;
      opt.textContent = font;
      fontSelect.appendChild(opt);
    });

    fontSelect.value = fonts[0];
  }

  function applyFont(font) {
    fontOutput.style.fontFamily = `'${font}', inherit`;
    fade(fontOutput);
  }

  function updateSampleText(lang) {
    fontOutput.textContent = SAMPLE_TEXT[lang];
    applyFont(fontSelect.value);
  }

  /* ----------------------------------------------------------
     Show only the selected language card
  ---------------------------------------------------------- */
  function showOnlyLanguageCards(lang) {
    const cards = fontPreviewGrid.querySelectorAll(".font-card");
    cards.forEach(card => {
      card.style.display = card.dataset.lang === lang ? "block" : "none";
    });
  }

  /* ----------------------------------------------------------
     Live Search Filter
  ---------------------------------------------------------- */
  fontSearch.addEventListener("input", () => {
    const q = fontSearch.value.toLowerCase();
    Array.from(fontSelect.options).forEach(opt => {
      opt.style.display = opt.value.toLowerCase().includes(q) ? "block" : "none";
    });
  });

  /* ----------------------------------------------------------
     ✨ LOCAL FONT ACCESS API (Fully Working)
  ---------------------------------------------------------- */
  const loadLocalBtn = document.getElementById("loadLocalFontsBtn");
  const localFontsDropdown = document.getElementById("localFontsDropdown");
  const localFontInfo = document.getElementById("localFontInfo");
  const saveLocalFontBtn = document.getElementById("saveLocalFontBtn");

  async function loadLocalFonts() {
    if (!window.queryLocalFonts) {
      alert("Local Font Access API not supported in this browser.");
      return;
    }

    try {
      const fonts = await window.queryLocalFonts();

      localFontsDropdown.innerHTML = "";
      localFontsDropdown.style.display = "block";
      localFontInfo.style.display = "block";
      saveLocalFontBtn.style.display = "block";

      fonts.forEach(font => {
        const opt = document.createElement("option");
        opt.value = font.fullName;
        opt.textContent = font.fullName;
        localFontsDropdown.appendChild(opt);
      });

      localFontInfo.textContent = `${fonts.length} system fonts found`;

      localFontsDropdown.addEventListener("change", () => {
        fontOutput.style.fontFamily = `'${localFontsDropdown.value}', inherit`;
        fade(fontOutput);
      });

    } catch (err) {
      console.error(err);
      alert("Unable to access system fonts. Permission denied.");
    }
  }

  if (loadLocalBtn) loadLocalBtn.onclick = loadLocalFonts;

  /* Save selected font */
  saveLocalFontBtn.onclick = () => {
    const lang = langSelect.value;
    const name = localFontsDropdown.value;

    if (!name) return alert("Select a font first!");

    CUSTOM_FONTS[lang].push(name);
    localStorage.setItem("ac_custom_fonts", JSON.stringify(CUSTOM_FONTS));

    FONT_MAP[lang].push(name);

    updateFontDropdown(lang);
    alert(`Font "${name}" saved to ${lang} font family!`);
  };

  /* ----------------------------------------------------------
     Events
  ---------------------------------------------------------- */
  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    updateFontDropdown(lang);
    updateSampleText(lang);
    showOnlyLanguageCards(lang);
  });

  fontSelect.addEventListener("change", () => applyFont(fontSelect.value));

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  updateFontDropdown("en");
  updateSampleText("en");
  showOnlyLanguageCards("en");

  console.log("✨ Home Section Ready (v15 FINAL)");

  /* ----------------------------------------------------------
     🤖 Browser AI Capability Detector
  ---------------------------------------------------------- */
  const aiList = document.getElementById("aiCapabilityList");
  aiList.innerHTML = "";

  function addCap(name, ok) {
    const el = document.createElement("div");
    el.className = "ai-cap-item";
    el.innerHTML = `
      <span>${name}</span>
      <strong style="color:${ok ? 'green' : 'red'}">${ok ? "✔ Available" : "✖ No"}</strong>
    `;
    aiList.appendChild(el);
  }

  addCap("WebGPU", !!navigator.gpu);
  addCap("WebGL", (() => { try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl");
  } catch { return false; }})());
  addCap("Speech Recognition", !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  addCap("Text-to-Speech", "speechSynthesis" in window);
  addCap("Local File Access API", "showOpenFilePicker" in window);
  addCap("Clipboard API", !!navigator.clipboard);
  addCap("Local Font Access API", "queryLocalFonts" in window);
  addCap("WebNN", "ml" in navigator);
  addCap("Web Workers", !!window.Worker);
  addCap("Storage Manager", "storage" in navigator);
  addCap("Device RAM", navigator.deviceMemory || "Unknown");
  addCap("CPU Threads", navigator.hardwareConcurrency || "Unknown");

});

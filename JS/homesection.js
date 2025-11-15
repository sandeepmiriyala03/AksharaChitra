/* ==========================================================
   🌸 AksharaChitra — Home Section Script (v14.1 CLEAN)
   ----------------------------------------------------------
   ✔ Show only English card by default
   ✔ Dynamic font dropdown
   ✔ Font Search (live filter)
   ✔ Browser AI Capability Detector 🤖  
  
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
  const fontOutput = document.getElementById("fontOutput");

  /* ----------------------------------------------------------
      FONT SELECT + SEARCH UI
  ---------------------------------------------------------- */
  const container = document.createElement("div");
  container.style.marginTop = "10px";

  // Search Input
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

  // Font Dropdown
  const fontSelect = document.createElement("select");
  fontSelect.id = "fontSelect";
  fontSelect.className = "font-select-minimal";
  fontSelect.style.width = "100%";
  container.appendChild(fontSelect);

  langSelect.insertAdjacentElement("afterend", container);

  /* ----------------------------------------------------------
     Fade helper
  ---------------------------------------------------------- */
  function fade(el) {
    el.classList.remove("show");
    setTimeout(() => el.classList.add("show"), 10);
  }

  /* ----------------------------------------------------------
     Dropdown Handling
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

    fontSelect.value = fonts[0]; // first item default
  }

  function applyFont(font) {
    fontOutput.style.fontFamily = `'${font}'`;
    fade(fontOutput);
  }

  function updateSampleText(lang) {
    fontOutput.textContent = SAMPLE_TEXT[lang];
    applyFont(fontSelect.value);
  }

  /* ----------------------------------------------------------
     Show Only Language Card
  ---------------------------------------------------------- */
  function showOnlyLanguageCards(lang) {
    const cards = fontPreviewGrid.querySelectorAll(".font-card");
    cards.forEach(card => {
      card.style.display = card.dataset.lang === lang ? "block" : "none";
    });
  }

  /* ----------------------------------------------------------
     Search Filter
  ---------------------------------------------------------- */
  fontSearch.addEventListener("input", () => {
    const key = fontSearch.value.toLowerCase();
    Array.from(fontSelect.options).forEach(opt => {
      opt.style.display = opt.value.toLowerCase().includes(key)
        ? "block"
        : "none";
    });
  });

  /* ----------------------------------------------------------
     EVENTS
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

  console.log("✨ Home Section Ready (v14.1 — Clean + Search + Browser AI)");

  /* ----------------------------------------------------------
     🤖 BROWSER AI CAPABILITY DETECTOR
  ---------------------------------------------------------- */
  const aiList = document.getElementById("aiCapabilityList");
  if (aiList) aiList.innerHTML = "";

  function addCap(name, ok) {
    if (!aiList) return;
    const item = document.createElement("div");
    item.className = "ai-cap-item";
    item.innerHTML = `
      <span>${name}</span>
      <strong style="color:${ok ? 'green' : 'red'}">${ok ? "✔ Available" : "✖ No"}</strong>
    `;
    aiList.appendChild(item);
  }

  addCap("WebGPU (Local AI Acceleration)", !!navigator.gpu);
  addCap("WebGL Renderer", (() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch {
      return false;
    }
  })());
  addCap("Speech Recognition (Voice Input)", "SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  addCap("Text-to-Speech (TTS)", "speechSynthesis" in window);
  addCap("Local File Access API", "showOpenFilePicker" in window);
  addCap("Clipboard API", !!navigator.clipboard);
  addCap("Local Font Access API", "queryLocalFonts" in window);
  addCap("WebNN (Neural Network API)", "ml" in navigator);
  addCap("Web Workers (AI Threads)", !!window.Worker);
  addCap("Storage Manager (Offline Models)", "storage" in navigator);
  addCap("Device RAM", navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown");
  addCap("CPU Threads", navigator.hardwareConcurrency || "Unknown");

});

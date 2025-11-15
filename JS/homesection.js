/* ==========================================================
   🌸 AksharaChitra — Home Section Script (v17.2 FINAL)
   ----------------------------------------------------------
   ✔ Dynamic Preview Card (P3)
   ✔ Selected Language ONLY
   ✔ Selected Font Applies to Full Card
   ✔ Duplicate Check + A→Z Sorting
   ✔ Local Font Access API
   ✔ Custom Font Save per Language
   ✔ Searchable Dropdown
   ✔ Browser AI Capability Detector ✔ (ADDED)
   ==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------
     1) FONT MAP & SAMPLE TEXT
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
     2) LOAD CUSTOM FONTS
  ---------------------------------------------------------- */
  let CUSTOM_FONTS = JSON.parse(localStorage.getItem("ac_custom_fonts") || "{}");

  Object.keys(FONT_MAP).forEach(lang => {
    if (!CUSTOM_FONTS[lang]) CUSTOM_FONTS[lang] = [];
    FONT_MAP[lang] = [...new Set([...FONT_MAP[lang], ...CUSTOM_FONTS[lang]])].sort();
  });


  /* ----------------------------------------------------------
     3) DOM ELEMENTS
  ---------------------------------------------------------- */
  const langSelect = document.getElementById("previewLangSelect");
  const previewContainer = document.getElementById("previewCardContainer");

  const loadLocalBtn = document.getElementById("loadLocalFontsBtn");
  const localFontsDropdown = document.getElementById("localFontsDropdown");
  const localFontInfo = document.getElementById("localFontInfo");
  const saveLocalFontBtn = document.getElementById("saveLocalFontBtn");

  const aiList = document.getElementById("aiCapabilityList");


  /* ----------------------------------------------------------
     4) BUILD PREVIEW CARD (P3)
  ---------------------------------------------------------- */
  const previewCard = document.createElement("div");
  previewCard.className = "preview-card-modern";

  const previewLang = document.createElement("div");
  previewLang.className = "preview-lang";

  const previewFont = document.createElement("div");
  previewFont.className = "preview-font";

  const previewText = document.createElement("p");
  previewText.className = "preview-text";

  previewCard.append(previewLang, previewFont, previewText);
  previewContainer.appendChild(previewCard);


  /* ----------------------------------------------------------
     5) FONT SEARCH + DROPDOWN
  ---------------------------------------------------------- */
  const wrapper = document.createElement("div");
  wrapper.style.marginTop = "12px";

  const fontSearch = document.createElement("input");
  fontSearch.placeholder = "🔍 Search fonts...";
  fontSearch.className = "font-search";

  const fontSelect = document.createElement("select");
  fontSelect.id = "fontSelect";
  fontSelect.className = "font-select-minimal";

  wrapper.append(fontSearch, fontSelect);
  previewCard.insertAdjacentElement("afterend", wrapper);


  /* ----------------------------------------------------------
     6) UPDATE FUNCTIONS
  ---------------------------------------------------------- */
  function updateFontDropdown(lang) {
    fontSelect.innerHTML = "";
    FONT_MAP[lang].forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      fontSelect.appendChild(opt);
    });
    fontSelect.value = FONT_MAP[lang][0];
  }

  function applySelectedFont(font) {
    previewCard.style.fontFamily = `'${font}', inherit`;
    previewFont.textContent = font;

    // Always show correct language sample text
    previewText.textContent = SAMPLE_TEXT[langSelect.value];
  }

  function updatePreview(lang) {
    previewLang.textContent = langSelect.options[langSelect.selectedIndex].text;
    previewText.textContent = SAMPLE_TEXT[lang];
    applySelectedFont(fontSelect.value);
  }


  /* ----------------------------------------------------------
     7) SEARCH FILTER
  ---------------------------------------------------------- */
  fontSearch.addEventListener("input", () => {
    const q = fontSearch.value.toLowerCase();
    [...fontSelect.options].forEach(opt => {
      opt.style.display = opt.value.toLowerCase().includes(q) ? "block" : "none";
    });
  });


  /* ----------------------------------------------------------
     8) LOCAL FONT ACCESS (System Fonts)
  ---------------------------------------------------------- */
  async function loadLocalFonts() {
    if (!window.queryLocalFonts)
      return alert("Local Font Access API not supported in this browser.");

    try {
      const fonts = await window.queryLocalFonts();

      localFontsDropdown.innerHTML = "";
      localFontsDropdown.style.display = "block";
      localFontInfo.style.display = "block";
      saveLocalFontBtn.style.display = "block";

      fonts.forEach(f => {
        const o = document.createElement("option");
        o.value = f.fullName;
        o.textContent = f.fullName;
        localFontsDropdown.appendChild(o);
      });

      localFontInfo.textContent = `${fonts.length} fonts found`;

      localFontsDropdown.onchange = () => {
        applySelectedFont(localFontsDropdown.value);
      };

    } catch {
      alert("System fonts permission denied.");
    }
  }

  loadLocalBtn.onclick = loadLocalFonts;


  /* ----------------------------------------------------------
     9) SAVE FONT (Duplicate Check)
  ---------------------------------------------------------- */
  saveLocalFontBtn.onclick = () => {
    const lang = langSelect.value;
    const name = localFontsDropdown.value;

    if (!name) return alert("Select a font first!");
    if (FONT_MAP[lang].includes(name))
      return alert("❗ This font is already added.");

    CUSTOM_FONTS[lang].push(name);
    localStorage.setItem("ac_custom_fonts", JSON.stringify(CUSTOM_FONTS));

    FONT_MAP[lang].push(name);
    FONT_MAP[lang].sort();

    updateFontDropdown(lang);

    alert(`🎉 Font "${name}" added successfully!`);
  };


  /* ----------------------------------------------------------
     10) EVENTS
  ---------------------------------------------------------- */
  langSelect.onchange = () => {
    updateFontDropdown(langSelect.value);
    updatePreview(langSelect.value);
  };

  fontSelect.onchange = () => {
    applySelectedFont(fontSelect.value);
  };


  /* ----------------------------------------------------------
     11) INIT
  ---------------------------------------------------------- */
  updateFontDropdown("en");
  updatePreview("en");


  /* ----------------------------------------------------------
     12) 🤖 BROWSER AI CAPABILITY DETECTOR (ADDED)
  ---------------------------------------------------------- */

  aiList.innerHTML = ""; // Clear existing list

  function addCap(name, ok) {
    const item = document.createElement("div");
    item.className = "ai-cap-item";
    item.innerHTML = `
      <span>${name}</span>
      <strong style="color:${ok ? "green" : "red"}">
        ${ok ? "✔ Available" : "✖ Not Supported"}
      </strong>
    `;
    aiList.appendChild(item);
  }

  addCap("WebGPU", !!navigator.gpu);
  addCap("WebGL", !!document.createElement("canvas").getContext("webgl"));
  addCap("Speech Recognition", !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  addCap("Text-to-Speech", "speechSynthesis" in window);
  addCap("Local File Access API", !!window.showOpenFilePicker);
  addCap("Clipboard API", !!navigator.clipboard);
  addCap("Local Font Access API", !!window.queryLocalFonts);
  addCap("WebNN", !!navigator.ml);
  addCap("Web Workers", !!window.Worker);
  addCap("Storage Manager", !!navigator.storage);
  addCap("Device RAM", navigator.deviceMemory || "Unknown");
  addCap("CPU Threads", navigator.hardwareConcurrency || "Unknown");

});

/* ==========================================================
   🌸 AksharaChitra — Home Section Script (v17.4 FINAL STABLE)
   ==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------------------------
     1) FONT MAP & SAMPLE TEXT
  ---------------------------------------------------------- */
  const FONT_MAP = {
    en: ["Arvo","Bebas Neue","Cinzel","Comfortaa","DM Serif Display","Inter",
         "Lato","Lobster","Montserrat","Nunito","Open Sans","Playfair Display",
         "Poppins","Raleway","Roboto","Ubuntu"],
    te: ["Mandali",
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
    sa: "सौन्दर्यमयं पोस्टेरं निर्मियताम्",
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
  const fontFamilyWrapper = document.querySelector(".font-family-wrapper");

  const previewContainer = document.getElementById("previewCardContainer");
  const loadLocalBtn = document.getElementById("loadLocalFontsBtn");
  const localFontsDropdown = document.getElementById("localFontsDropdown");
  const localFontInfo = document.getElementById("localFontInfo");
  const saveLocalFontBtn = document.getElementById("saveLocalFontBtn");




  /* ----------------------------------------------------------
     4) PREVIEW CARD
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
     5) FONT LABEL + DROPDOWN (Correct Order)
  ---------------------------------------------------------- */
  const fontLabel = document.createElement("div");
  fontLabel.textContent = "Font Family (English)";
  fontLabel.className = "font-label-dynamic";

  const fontSelect = document.createElement("select");
  fontSelect.id = "fontSelect";
  fontSelect.className = "font-select-minimal";

  // Append correctly ONCE
  fontFamilyWrapper.append(fontLabel, fontSelect);

  function updateFontLabel() {
    fontLabel.textContent = `Font Family (${langSelect.options[langSelect.selectedIndex].text})`;
  }


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
    const lang = langSelect.value;

    previewText.style.fontFamily = `'${font}', inherit`;
    previewFont.textContent = font;
    previewText.textContent = SAMPLE_TEXT[lang];
  }

  function updatePreview(lang) {
    previewLang.textContent = langSelect.options[langSelect.selectedIndex].text;
    previewText.textContent = SAMPLE_TEXT[lang];
    applySelectedFont(fontSelect.value);
    updateFontLabel();
  }


  /* ----------------------------------------------------------
     7) LOCAL FONTS
  ---------------------------------------------------------- */
  async function loadLocalFonts() {
    if (!window.queryLocalFonts)
      return alert("Local Font Access API not supported.");

    try {
      const fonts = await window.queryLocalFonts();
      localFontsDropdown.innerHTML = "";
      localFontsDropdown.style.display = "block";
      saveLocalFontBtn.style.display = "block";
      localFontInfo.style.display = "block";

      fonts.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.fullName;
        opt.textContent = f.fullName;
        localFontsDropdown.appendChild(opt);
      });

      localFontInfo.textContent = `${fonts.length} fonts found`;
      localFontsDropdown.onchange = () => applySelectedFont(localFontsDropdown.value);

    } catch {
      alert("Permission denied.");
    }
  }

  loadLocalBtn.onclick = loadLocalFonts;


  /* ----------------------------------------------------------
     8) SAVE CUSTOM FONT
  ---------------------------------------------------------- */
  saveLocalFontBtn.onclick = () => {
    const lang = langSelect.value;
    const name = localFontsDropdown.value;

    if (!name) return alert("Select a font first!");
    if (FONT_MAP[lang].includes(name))
      return alert("Font already added!");

    CUSTOM_FONTS[lang].push(name);
    localStorage.setItem("ac_custom_fonts", JSON.stringify(CUSTOM_FONTS));

    FONT_MAP[lang].push(name);
    FONT_MAP[lang].sort();

    updateFontDropdown(lang);
    alert(`Font "${name}" saved!`);
  };


  /* ----------------------------------------------------------
     9) EVENTS
  ---------------------------------------------------------- */
  langSelect.onchange = () => {
    updateFontDropdown(langSelect.value);
    updatePreview(langSelect.value);
  };

  fontSelect.onchange = () => applySelectedFont(fontSelect.value);


  /* ----------------------------------------------------------
     10) INIT
  ---------------------------------------------------------- */
  updateFontDropdown("en");
  updatePreview("en");




});

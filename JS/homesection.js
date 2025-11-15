/* ==========================================================
   🌸 AksharaChitra — Home Section Script (v12.0)
   ----------------------------------------------------------
   ✔ Show only English card by default
   ✔ Dynamic font dropdown
   ✔ Font Search (live filter)
   ✔ Favorite Fonts ⭐
   ✔ AI Font Recommendation 🎯
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
  ----------------------------------------------------------- */
  const langSelect = document.getElementById("previewLangSelect");
  const fontPreviewGrid = document.getElementById("fontPreviewGrid");
  const fontOutput = document.getElementById("fontOutput");

  /* ----------------------------------------------------------
      FONT SELECT + SEARCH + FAVORITES UI
  ----------------------------------------------------------- */
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

  // Favorites Area
  const favTitle = document.createElement("p");
  favTitle.textContent = "⭐ Favorite Fonts";
  favTitle.style.marginTop = "10px";
  const favBox = document.createElement("div");
  favBox.id = "favoriteFonts";
  favBox.style.display = "flex";
  favBox.style.flexWrap = "wrap";
  favBox.style.gap = "8px";

  container.appendChild(favTitle);
  container.appendChild(favBox);

  langSelect.insertAdjacentElement("afterend", container);

  /* ----------------------------------------------------------
     Fade Helper
  ----------------------------------------------------------- */
  function fade(el) {
    if (!el) return;
    el.classList.remove("show");
    setTimeout(() => el.classList.add("show"), 10);
  }

  /* ----------------------------------------------------------
     FAVORITES (stored in localStorage)
  ----------------------------------------------------------- */
  let favoriteFonts = JSON.parse(localStorage.getItem("ac_favorites") || "[]");

  function updateFavoritesUI() {
    favBox.innerHTML = "";
    favoriteFonts.forEach(font => {
      const tag = document.createElement("div");
      tag.textContent = font;
      tag.style = `
        padding: 5px 10px;
        border-radius: 6px;
        background: #eee;
        cursor: pointer;
        font-family: '${font}';
      `;
      tag.onclick = () => {
        fontSelect.value = font;
        applyFont(font);
      };
      favBox.appendChild(tag);
    });
  }

  function toggleFavorite(font) {
    if (favoriteFonts.includes(font)) {
      favoriteFonts = favoriteFonts.filter(f => f !== font);
    } else {
      favoriteFonts.push(font);
    }
    localStorage.setItem("ac_favorites", JSON.stringify(favoriteFonts));
    updateFavoritesUI();
  }

  /* ----------------------------------------------------------
     AI FONT RECOMMENDATION
  ----------------------------------------------------------- */
  function aiRecommendFont(lang) {
    // Can later integrate WebLLM
    const logic = {
      en: "Montserrat",
      te: "Mandali",
      hi: "Hind",
      sa: "Tiro Devanagari Sanskrit",
      ta: "Noto Sans Tamil",
      kn: "Noto Sans Kannada",
      ml: "Noto Sans Malayalam",
      or: "Noto Sans Oriya"
    };
    return logic[lang] || "Montserrat";
  }

  /* ----------------------------------------------------------
     Update Font Dropdown
  ----------------------------------------------------------- */
  function updateFontDropdown(lang) {
    fontSelect.innerHTML = "";

    const fonts = FONT_MAP[lang] || [];

    fonts.forEach(font => {
      const opt = document.createElement("option");
      opt.value = font;
      opt.textContent = font;
      fontSelect.appendChild(opt);
    });

    // AI recommended font → select automatically
    const recommended = aiRecommendFont(lang);
    if (fonts.includes(recommended)) {
      fontSelect.value = recommended;
    } else {
      fontSelect.selectedIndex = 0;
    }
  }

  /* ----------------------------------------------------------
     Update Sample Text
  ----------------------------------------------------------- */
  function applyFont(font) {
    fontOutput.style.fontFamily = `'${font}'`;
    fade(fontOutput);
  }

  function updateSampleText(lang) {
    fontOutput.textContent = SAMPLE_TEXT[lang];
    const defaultFont = fontSelect.value;
    applyFont(defaultFont);
  }

  /* ----------------------------------------------------------
     Show only selected language card
  ----------------------------------------------------------- */
  function showOnlyLanguageCards(lang) {
    const cards = fontPreviewGrid.querySelectorAll(".font-card");
    cards.forEach(card => {
      card.style.display = card.dataset.lang === lang ? "block" : "none";
    });
  }

  /* ----------------------------------------------------------
     SEARCH FILTER
  ----------------------------------------------------------- */
  fontSearch.addEventListener("input", () => {
    const keyword = fontSearch.value.toLowerCase();
    Array.from(fontSelect.options).forEach(opt => {
      opt.style.display = opt.value.toLowerCase().includes(keyword)
        ? "block"
        : "none";
    });
  });

  /* ----------------------------------------------------------
     EVENTS
  ----------------------------------------------------------- */
  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    updateFontDropdown(lang);
    updateSampleText(lang);
    showOnlyLanguageCards(lang);
  });

  fontSelect.addEventListener("change", () => {
    applyFont(fontSelect.value);
  });

  // Double-tap on font output → add to favorites
  fontOutput.addEventListener("dblclick", () => {
    toggleFavorite(fontSelect.value);
  });

  /* ----------------------------------------------------------
     INIT — Default English
  ----------------------------------------------------------- */
  updateFontDropdown("en");
  updateSampleText("en");
  showOnlyLanguageCards("en");
  updateFavoritesUI();

  console.log("✨ Home Section Ready (Search + Favorites + AI Suggestions)");
});

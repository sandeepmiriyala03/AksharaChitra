// 🗣️ AksharaChitra — Home Section Script with Dynamic Font Preview + TTS

// ---------------------- Font Data ----------------------
const FONT_MAP = {
  en: [
    "Arvo", "Bebas Neue", "Cinzel", "Comfortaa", "Courgette", "DM Serif Display",
    "Dancing Script", "Exo 2", "Fira Sans", "Great Vibes", "Inter", "Josefin Sans",
    "Lato", "Lobster", "Merriweather", "Montserrat", "Nunito", "Open Sans",
    "Orbitron", "Oswald", "Pacifico", "Playfair Display", "Poppins", "Prompt",
    "Quicksand", "Raleway", "Righteous", "Roboto", "Source Sans Pro", "Ubuntu"
  ],
  te: ["Mandali", "Noto Sans Telugu", "NTR", "Ramabhadra", "Ramaneeya", "Ramaraja", "RaviPrakash", "Sirivennela", "TANA", "TenaliRamakrishna-Regular", "TimmanaRegular", "Veturi"],
  hi: ["Hind", "Karma", "Noto Serif Devanagari"],
  sa: ["Noto Serif Devanagari", "Tiro Devanagari Sanskrit"],
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

// ---------------------- Initialize ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const langSelect = document.getElementById("previewLangSelect");
  const ttsBtn = document.getElementById("ttsBtn");
  const fontPreviewGrid = document.getElementById("fontPreviewGrid");

  // Create compact font dropdown
  const fontSelect = document.createElement("select");
  fontSelect.id = "fontSelect";
  fontSelect.className = "font-select-minimal";
  langSelect.insertAdjacentElement("afterend", fontSelect);

  // Preview output
  const fontOutput = document.createElement("p");
  fontOutput.id = "fontOutput";
  fontOutput.textContent = "Select a language to preview sample text.";
  fontOutput.className = "font-output";
  fontPreviewGrid.insertAdjacentElement("beforebegin", fontOutput);

  // ---------------------- Event Listeners ----------------------
  langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    updateFontDropdown(lang);
    updateSampleText(lang);
  });

  fontSelect.addEventListener("change", () => {
    const font = fontSelect.value;
    fontOutput.style.fontFamily = `'${font}'`;
  });

  // ---------------------- Helper Functions ----------------------
  function updateFontDropdown(lang) {
    fontSelect.innerHTML = "";
    if (FONT_MAP[lang]) {
      FONT_MAP[lang].forEach(font => {
        const option = document.createElement("option");
        option.value = font;
        option.textContent = font;
        fontSelect.appendChild(option);
      });
      fontSelect.style.display = "inline-block";
    } else {
      fontSelect.style.display = "none";
    }
  }

  function updateSampleText(lang) {
    fontOutput.textContent = SAMPLE_TEXT[lang] || "Select a language to preview.";
    fontOutput.style.fontFamily = "inherit";
  }

  // Default
  updateFontDropdown("en");
  updateSampleText("en");

  console.log("✅ AksharaChitra Home Section — Font Preview Ready");
});

// Get all references to form fields and buttons
const languageSelect = document.getElementById('language');
const dateTimeInput = document.getElementById('dateTime');
const backgroundColorInput = document.getElementById('backgroundColor');
const imageUpload = document.getElementById('imageUpload');
const imagePositionSelect = document.getElementById('imagePosition');
const mainTitleInput = document.getElementById('mainTitle');
const subTitleInput = document.getElementById('subTitle');
const footerInput = document.getElementById('footerText');
const contentInput = document.getElementById('textContent');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const fontSizeSelect = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const fontFamilySelect = document.getElementById('fontFamily');
const textAlignSelect = document.getElementById('textAlign');

const generateBtn = document.getElementById('generateBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const generatedImage = document.getElementById('generatedImage');
const form = document.getElementById('form');

let uploadedImageDataUrl = '';
let undoStack = [];
let redoStack = [];

// Helper to get font family by language
function getFontFamily(lang) {
  if (lang === 'telugu') {
    return "'Noto Sans Telugu', 'Gautami', serif";
  } else {
    return "'Arial', sans-serif";
  }
}

// Update preview area with current inputs and styles
function updatePreview() {
  const lang = languageSelect.value;
  const fontFamily = getFontFamily(lang);
  const style = `
    font-weight: ${boldBtn.classList.contains('active') ? 'bold' : 'normal'};
    font-style: ${italicBtn.classList.contains('active') ? 'italic' : 'normal'};
    font-size: ${fontSizeSelect.value}px;
    color: ${fontColorInput.value};
    font-family: ${fontFamily};
    text-align: ${textAlignSelect.value};
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
  `;

  preview.style.backgroundColor = backgroundColorInput.value;

  const mainTitle = mainTitleInput.value.trim();
  const subTitle = subTitleInput.value.trim();
  const footer = footerInput.value.trim();
  const content = contentInput.value.trim().replace(/\n/g, '<br>');

  let imageHtml = '';
  if (uploadedImageDataUrl) {
    imageHtml = `<img src="${uploadedImageDataUrl}" alt="Uploaded Image" style="max-width:40%; max-height:220px; border-radius:8px; margin:8px;" />`;
  }

  let contentHtml = `<div style="${style}">${content}</div>`;

  // Reduced gap between header and subtitle by lowering margin-bottom & margin-top
  let html = `
    <h1 style="font-family:${fontFamily}; text-align:center; margin-bottom:4px;">${mainTitle}</h1>
    <h3 style="font-family:${fontFamily}; text-align:center; font-weight:normal; color:#555; margin-top:2px; margin-bottom:10px;">${subTitle}</h3>
  `;

  if (imagePositionSelect.value === 'left') {
    html += `
      <div style="display:flex; gap:1rem; justify-content:center; align-items:flex-start;">
        ${imageHtml}
        <div style="max-width:55%;">${contentHtml}</div>
      </div>`;
  } else if (imagePositionSelect.value === 'right') {
    html += `
      <div style="display:flex; gap:1rem; justify-content:center; align-items:flex-start;">
        <div style="max-width:55%;">${contentHtml}</div>
        ${imageHtml}
      </div>`;
  } else if (imagePositionSelect.value === 'top') {
    html += `
      <div style="text-align:center;">
        ${imageHtml}
        ${contentHtml}
      </div>`;
  } else {
    html += `
      <div style="text-align:center;">
        ${contentHtml}
        ${imageHtml}
      </div>`;
  }

  html += `
    <footer style="font-size:0.9em; color:#777; text-align:center; margin-top:10px; font-family:${fontFamily};">
      ${footer}
    </footer>`;

  // Date/time removed intentionally

  preview.innerHTML = html;
}

// State management with undo/redo stacks
function pushUndoState() {
  undoStack.push(preview.innerHTML);
  if (undoStack.length > 50) undoStack.shift();
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(preview.innerHTML);
  preview.innerHTML = undoStack.pop();
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(preview.innerHTML);
  preview.innerHTML = redoStack.pop();
}

// Event listeners for controls
boldBtn.addEventListener('click', () => {
  boldBtn.classList.toggle('active');
  boldBtn.setAttribute('aria-pressed', boldBtn.classList.contains('active'));
  pushUndoState();
  updatePreview();
});

italicBtn.addEventListener('click', () => {
  italicBtn.classList.toggle('active');
  italicBtn.setAttribute('aria-pressed', italicBtn.classList.contains('active'));
  pushUndoState();
  updatePreview();
});

fontSizeSelect.addEventListener('change', () => {
  pushUndoState();
  updatePreview();
});
fontColorInput.addEventListener('input', () => {
  pushUndoState();
  updatePreview();
});
languageSelect.addEventListener('change', () => {
  pushUndoState();
  updatePreview();
});
mainTitleInput.addEventListener('input', () => {
  pushUndoState();
  updatePreview();
});
subTitleInput.addEventListener('input', () => {
  pushUndoState();
  updatePreview();
});
footerInput.addEventListener('input', () => {
  pushUndoState();
  updatePreview();
});
contentInput.addEventListener('input', () => {
  pushUndoState();
  updatePreview();
});
imagePositionSelect.addEventListener('change', () => {
  pushUndoState();
  updatePreview();
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    uploadedImageDataUrl = '';
    updatePreview();
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageDataUrl = event.target.result;
    pushUndoState();
    updatePreview();
  };
  reader.readAsDataURL(file);
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

generateBtn.addEventListener('click', () => {
  generateBtn.disabled = true;
  html2canvas(preview, { scale: 2, backgroundColor: backgroundColorInput.value }).then(canvas => {
    generatedImage.src = canvas.toDataURL('image/png');
    generatedImage.style.display = 'block';

    downloadBtn.style.display = 'inline-block';
    shareBtn.style.display = 'inline-block';
    editBtn.style.display = 'inline-block';
    deleteBtn.style.display = 'inline-block';

    generateBtn.style.display = 'none';
    form.style.display = 'none';

    generateBtn.disabled = false;
  });
});

editBtn.addEventListener('click', () => {
  form.style.display = 'block';
  generatedImage.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';

  generateBtn.style.display = 'inline-block';
});

downloadBtn.addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = generatedImage.src;
  let filenameInput = document.getElementById('fileNameInput');
  let filename = filenameInput ? filenameInput.value.trim() : '';
  if (!filename) filename = 'styled-text-image';
  if (!filename.toLowerCase().endsWith('.png')) filename += '.png';
  a.download = filename;
  a.click();
});

shareBtn.addEventListener('click', () => {
  if (!navigator.share) {
    alert('Web Share API not supported in this browser.');
    return;
  }
  fetch(generatedImage.src).then(res => res.blob()).then(blob => {
    const filenameInput = document.getElementById('fileNameInput');
    const filename = filenameInput ? filenameInput.value.trim() : 'styled-text-image.png';
    const file = new File([blob], filename, { type: 'image/png' });
    navigator.share({
      files: [file],
      title: 'Shared Image',
      text: 'Check out the styled text and image I created.'
    });
  }).catch(() => alert('Sharing failed.'));
});

deleteBtn.addEventListener('click', () => {
  generatedImage.src = '';
  generatedImage.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';

  form.style.display = 'block';
  generateBtn.style.display = 'inline-block';

  uploadedImageDataUrl = '';
  imageUpload.value = '';
  updatePreview();

  undoStack = [];
  redoStack = [];
});

// Add Clear All button
const clearAllBtn = document.createElement('button');
clearAllBtn.textContent = 'Clear All';
clearAllBtn.type = 'button';
clearAllBtn.style.marginLeft = '10px';
form.appendChild(clearAllBtn);

clearAllBtn.addEventListener('click', () => {
  languageSelect.value = 'english';
  dateTimeInput.value = '';
  backgroundColorInput.value = '#ffffff';
  imageUpload.value = '';
  uploadedImageDataUrl = '';
  imagePositionSelect.value = 'left';
  mainTitleInput.value = '';
  subTitleInput.value = '';
  footerInput.value = '';
  contentInput.value = '';
  boldBtn.classList.remove('active');
  boldBtn.setAttribute('aria-pressed', 'false');
  italicBtn.classList.remove('active');
  italicBtn.setAttribute('aria-pressed', 'false');
  fontSizeSelect.value = '20';
  fontColorInput.value = '#000000';
  fontFamilySelect.value = 'Arial, sans-serif';
  textAlignSelect.value = 'center';

  preview.innerHTML = '';
  generatedImage.src = '';
  generatedImage.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';

  generateBtn.style.display = 'inline-block';
  form.style.display = 'block';

  undoStack = [];
  redoStack = [];

  updatePreview();
});

// Initialize preview
window.addEventListener('load', () => {
  updatePreview();
  undoStack.push(preview.innerHTML);
});
const goTopBtn = document.getElementById('goTopBtn');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    goTopBtn.style.display = 'block';
  } else {
    goTopBtn.style.display = 'none';
  }
});

goTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Enable your install button here
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (outcome === 'accepted') {
    console.log('User accepted install prompt');
  } else {
    console.log('User dismissed install prompt');
  }
});

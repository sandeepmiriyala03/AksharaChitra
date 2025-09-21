// Element references for inputs, buttons, preview area, etc.
const languageSelect = document.getElementById('language');
const dateTimeInput = document.getElementById('dateTime');
const backgroundColorInput = document.getElementById('backgroundColor');
const imageUpload = document.getElementById('imageUpload');
const imagePositionSelect = document.getElementById('imagePosition');
const mainTitleInput = document.getElementById('mainTitle');
const subTitleInput = document.getElementById('subTitle');

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

const preview = document.getElementById('preview'); // Container where preview content is dynamically rendered
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const generatedImageContainer = document.getElementById('generatedImageContainer'); // container of image + buttons
const form = document.getElementById('form');

const cropModal = document.getElementById('cropModal'); // Modal for cropping uploaded image
const cropImage = document.getElementById('cropImage'); // <img> element inside crop modal
const cancelCropBtn = document.getElementById('cancelCropBtn');
const cropConfirmBtn = document.getElementById('cropConfirmBtn');

let uploadedImageUrl = ''; // Data URL for uploaded and cropped image
let undoStack = []; // Stack to hold previous preview states to support Undo
let redoStack = []; // Stack to hold states for Redo
let cropperInstance = null; // Cropper.js instance for image cropping

function getFontFamily(lang) {
  return lang === 'telugu' ? "'Noto Sans Telugu', 'Gautami', serif" : "'Arial', sans-serif";
}

// Format user selected datetime string or return empty string
function getFormattedDateTime() {
  if (!dateTimeInput.value) return '';
  const dt = new Date(dateTimeInput.value);
  if (isNaN(dt)) return '';
  return dt.toLocaleString();
}

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
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
    margin: 12px 0;
  `;

  preview.style.backgroundColor = backgroundColorInput.value;
  preview.style.padding = '30px 20px';
  preview.style.borderRadius = '14px';
  preview.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
  preview.style.maxWidth = '720px';
  preview.style.margin = 'auto';

  const mainTitle = mainTitleInput.value.trim();
  const subTitle = subTitleInput.value.trim();
 
  const content = contentInput.value.trim().replace(/\n/g, '<br>');
  const formattedDateTime = getFormattedDateTime();

  let imageHtml = '';
  if (uploadedImageUrl) {
    imageHtml = `<img src="${uploadedImageUrl}" alt="Uploaded Image" style="max-width:30%; max-height:220px; border-radius:14px; margin:8px 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.18);">`;
  }

  let contentHtml = `<div style="${style} padding: 10px 14px; background-color: rgba(255,255,255,0.9); border-radius: 8px; box-shadow: inset 0 0 8px rgba(0,0,0,0.05);">${content}</div>`;

  const mainTitleHtml = `<h1 style="font-family:${fontFamily}; text-align:center; font-size: 2.8rem; margin-bottom: 6px; letter-spacing: 0.04em; font-weight: 700; color: #222;">${mainTitle}</h1>`;

  const subTitleHtml = `<h3 style="font-family:${fontFamily}; text-align:center; font-weight:normal; font-size: 1.25rem; color:#666; margin-top: 0; margin-bottom: 20px;">${subTitle}</h3>`;

  let middleHtml = '';
  if (imagePositionSelect.value === 'left') {
    middleHtml = `
      <div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px;">
        ${imageHtml}<div style="flex:1;">${contentHtml}</div>
      </div>`;
  } else if (imagePositionSelect.value === 'right') {
    middleHtml = `
      <div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px;">
        <div style="flex:1;">${contentHtml}</div>${imageHtml}
      </div>`;
  } else if (imagePositionSelect.value === 'top') {
    middleHtml = `<div style="text-align: center; margin-bottom: 16px;">${imageHtml}</div>${contentHtml}`;
  } else {
    middleHtml = `${contentHtml}<div style="text-align: center; margin-top: 16px;">${imageHtml}</div>`;
  }

  

  preview.innerHTML = mainTitleHtml + subTitleHtml + middleHtml ;
}

function pushUndoState() {
  undoStack.push(preview.innerHTML);
  if (undoStack.length > 50) undoStack.shift();
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(preview.innerHTML);
  preview.innerHTML = undoStack.pop();
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(preview.innerHTML);
  preview.innerHTML = redoStack.pop();
}

const controls = [
  boldBtn, italicBtn, fontSizeSelect, fontColorInput,
  languageSelect, mainTitleInput, subTitleInput,
  contentInput, imagePositionSelect
];

controls.forEach(control => {
  if (control === boldBtn || control === italicBtn) {
    control.addEventListener('click', () => {
      control.classList.toggle('active');
      control.setAttribute('aria-pressed', control.classList.contains('active'));
      pushUndoState();
      updatePreview();
    });
  } else {
    control.addEventListener('input', () => {
      pushUndoState();
      updatePreview();
    });
    control.addEventListener('change', () => {
      pushUndoState();
      updatePreview();
    });
  }
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    uploadedImageUrl = '';
    updatePreview();
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    cropImage.src = event.target.result;
    cropModal.style.display = 'flex';
    cropImage.onload = () => {
      if (cropperInstance) cropperInstance.destroy();
      cropperInstance = new Cropper(cropImage, {
        aspectRatio: NaN,
        viewMode: 1,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
        background: false,
        modal: true,
        autoCropArea: 1,
      });
    };
  };
  reader.readAsDataURL(file);
});

cancelCropBtn.addEventListener('click', () => {
  if (cropperInstance) cropperInstance.destroy();
  cropperInstance = null;
  cropModal.style.display = 'none';
  imageUpload.value = '';
  uploadedImageUrl = '';
  updatePreview();
});

cropConfirmBtn.addEventListener('click', () => {
  if (!cropperInstance) return;
  const canvas = cropperInstance.getCroppedCanvas({
    maxWidth: 800,
    maxHeight: 800,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  uploadedImageUrl = canvas.toDataURL();
  updatePreview();
  cropperInstance.destroy();
  cropperInstance = null;
  cropModal.style.display = 'none';
});

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

generateBtn.addEventListener('click', () => {
  if (generateBtn.disabled) return;

  generateBtn.disabled = true;

  const container = document.createElement('div');
  container.id = 'captureContainer';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.background = backgroundColorInput.value || '#fff';
  container.style.padding = '30px 20px';
  container.style.width = preview.offsetWidth + 40 + 'px';
  container.style.fontFamily = preview.style.fontFamily;
  container.style.color = preview.style.color;
  container.style.textAlign = preview.style.textAlign;
  container.style.zIndex = '10000';
  container.style.borderRadius = '14px';
  container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';

  const previewClone = preview.cloneNode(true);
  previewClone.style.margin = '0';
  container.appendChild(previewClone);

  document.body.appendChild(container);

  const imgs = container.querySelectorAll('img');
  let loadedCount = 0;

  if (imgs.length === 0) {
    captureCanvas(container);
  } else {
    imgs.forEach(img => {
      if (img.complete) {
        loadedCount++;
        if (loadedCount === imgs.length) captureCanvas(container);
      } else {
        img.onload = img.onerror = () => {
          loadedCount++;
          if (loadedCount === imgs.length) captureCanvas(container);
        };
      }
    });
  }

  function captureCanvas(node) {
    html2canvas(node, {
      scale: 2,
      backgroundColor: backgroundColorInput.value || '#fff',
      useCORS: true,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    }).then(canvas => {
      container.remove();

      preview.style.display = 'block';
      form.style.display = 'block';
      downloadBtn.style.display = 'inline-block';
      shareBtn.style.display = 'inline-block';
      editBtn.style.display = 'inline-block';
      deleteBtn.style.display = 'inline-block';

      if (generatedImageContainer) generatedImageContainer.style.display = 'none';

      generateBtn.disabled = false;

      generatedImageContainer.generatedImageDataUrl = canvas.toDataURL();

    }).catch(error => {
      console.error('html2canvas error:', error);
      alert('Failed to generate image. Please try again.');
      container.remove();
      generateBtn.disabled = false;
    });
  }
});

editBtn.addEventListener('click', () => {
  preview.style.display = 'block';
  form.style.display = 'block';

  downloadBtn.style.display = 'inline-block';
  shareBtn.style.display = 'inline-block';
  editBtn.style.display = 'inline-block';
  deleteBtn.style.display = 'inline-block';

  if (generatedImageContainer) generatedImageContainer.style.display = 'none';

  generateBtn.disabled = false;
});

downloadBtn.addEventListener('click', () => {
  captureAndDownloadPreview();
});

shareBtn.addEventListener('click', () => {
  captureAndSharePreview();
});

deleteBtn.addEventListener('click', () => {
  uploadedImageUrl = '';
  imageUpload.value = '';
  preview.innerHTML = '';
  form.style.display = 'none';
  preview.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';

  if (generatedImageContainer) generatedImageContainer.style.display = 'none';

  generateBtn.style.display = 'inline-block';
  generateBtn.disabled = false;

  undoStack = [];
  redoStack = [];
  location.reload();
});

const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', () => {
  languageSelect.value = 'english';
  dateTimeInput.value = '';
  backgroundColorInput.value = '#ffffff';
  imageUpload.value = '';
  uploadedImageUrl = '';
  imagePositionSelect.value = 'left';
  mainTitleInput.value = '';
  subTitleInput.value = '';

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
  form.style.display = 'none';
  preview.style.display = 'none';

  if (generatedImageContainer) generatedImageContainer.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';

  generateBtn.style.display = 'inline-block';
  generateBtn.disabled = false;

  undoStack = [];
  redoStack = [];
  location.reload();
});

undoBtn.addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(preview.innerHTML);
  preview.innerHTML = undoStack.pop();
});

redoBtn.addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(preview.innerHTML);
  preview.innerHTML = redoStack.pop();
});

window.addEventListener('load', () => {
  updatePreview();
  undoStack.push(preview.innerHTML);
  preview.style.display = 'block';
  form.style.display = 'block';
  generateBtn.disabled = false;
  if (generatedImageContainer) generatedImageContainer.style.display = 'none';

  downloadBtn.style.display = 'none';
  shareBtn.style.display = 'none';
  editBtn.style.display = 'none';
  deleteBtn.style.display = 'none';
});

const goTopBtn = document.getElementById('goTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) goTopBtn.style.display = 'block';
  else goTopBtn.style.display = 'none';
});
goTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function captureAndDownloadPreview() {
  const container = preview.cloneNode(true);
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.background = backgroundColorInput.value || '#fff';
  container.style.padding = preview.style.padding;
  container.style.width = preview.offsetWidth + 'px';
  container.style.fontFamily = preview.style.fontFamily;
  container.style.color = preview.style.color;
  container.style.textAlign = preview.style.textAlign;
  container.style.borderRadius = preview.style.borderRadius;
  container.style.boxShadow = preview.style.boxShadow;
  container.style.zIndex = '10000';

  document.body.appendChild(container);

  html2canvas(container, {
    scale: 2,
    backgroundColor: backgroundColorInput.value || '#fff',
    useCORS: true,
  }).then(canvas => {
    document.body.removeChild(container);
    const dataUrl = canvas.toDataURL();
    const a = document.createElement('a');
    a.href = dataUrl;
    const filenameInput = document.getElementById('fileNameInput');
    let filename = filenameInput ? filenameInput.value.trim() : 'styled-image';
    if (!filename.toLowerCase().endsWith('.png')) filename += '.png';
    a.download = filename;
    a.click();
  }).catch(() => {
    document.body.removeChild(container);
    alert('Failed to download image.');
  });
}

function captureAndSharePreview() {
  if (!navigator.share) {
    alert('Web Share API not supported on this device/browser.');
    return;
  }

  const container = preview.cloneNode(true);
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.background = backgroundColorInput.value || '#fff';
  container.style.padding = preview.style.padding;
  container.style.width = preview.offsetWidth + 'px';
  container.style.fontFamily = preview.style.fontFamily;
  container.style.color = preview.style.color;
  container.style.textAlign = preview.style.textAlign;
  container.style.borderRadius = preview.style.borderRadius;
  container.style.boxShadow = preview.style.boxShadow;
  container.style.zIndex = '10000';

  document.body.appendChild(container);

  html2canvas(container, {
    scale: 2,
    backgroundColor: backgroundColorInput.value || '#fff',
    useCORS: true,
  }).then(canvas => {
    document.body.removeChild(container);
    canvas.toBlob(blob => {
      if (!blob) {
        alert('Failed to share image.');
        return;
      }
      const filenameInput = document.getElementById('fileNameInput');
      const filename = filenameInput ? filenameInput.value.trim() : 'styled-image.png';
      const file = new File([blob], filename, { type: 'image/png' });
      navigator.share({
        files: [file],
        title: 'Shared Image',
        text: 'Check out this image I created',
      }).catch(() => alert('Sharing failed'));
    });
  }).catch(() => {
    document.body.removeChild(container);
    alert('Failed to share image.');
  });
}

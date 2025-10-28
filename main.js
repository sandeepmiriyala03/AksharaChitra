/* main.js — AksharaChitra v6.0 (Final) */

document.addEventListener("DOMContentLoaded", () => {

  /* THEME */
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
  });
  if (localStorage.getItem("ak_theme_dark") === "true") document.body.classList.add("dark");

  /* TABS */
  document.querySelectorAll(".tab-btn").forEach(tab=>{
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".tab-content").forEach(s=>s.classList.remove("active"));
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });
  // data-open buttons
  document.querySelectorAll('[data-open]').forEach(btn=> btn.addEventListener('click', ()=> {
    const t = btn.dataset.open;
    document.querySelector(`.tab-btn[data-tab="${t}"]`)?.click();
  }));

  /* ELEMENTS */
  const titleEl = document.getElementById("title");
  const subtitleEl = document.getElementById("subtitle");
  const messageEl = document.getElementById("message");
  const fontFamily = document.getElementById("fontFamily");
  const fontSize = document.getElementById("fontSize");
  const textColor = document.getElementById("textColor");
  const bgColor = document.getElementById("bgColor");
  const qrText = document.getElementById("qrText");
  const imageUpload = document.getElementById("imageUpload");
  const templateSelect = document.getElementById("templateSelect");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const shareBtn = document.getElementById("shareBtn");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const speechBtn = document.getElementById("speechBtn");
  const installBtn = document.getElementById("installBtn");

  const previewCard = document.getElementById("previewCard");
  const pTitle = document.getElementById("pTitle");
  const pSubtitle = document.getElementById("pSubtitle");
  const pMessage = document.getElementById("pMessage");
  const pImage = document.getElementById("pImage");
  const pQR = document.getElementById("pQR");
  const galleryGrid = document.getElementById("galleryGrid");
  const welcomeSamples = document.getElementById("welcomeSamples");

  let uploadedDataUrl = "";
  let cropper = null;

  /* SMART TEMPLATES */
  const SMART_TEMPLATES = {
    news: { bg: "#ffffff", color: "#222222", title: "📰 Breaking News", message: "Your latest update here!" },
    birthday: { bg: "#fff0f7", color: "#5b2a86", title: "🎂 Happy Birthday!", message: "Wishing you joy!" },
    devotional: { bg: "#fff7e6", color: "#6b3a00", title: "🕉️ శుభ దినం", message: "Blessings & peace." },
    business: { bg: "#f1f5f9", color: "#111111", title: "Your Business", message: "Contact: +91 99999 99999" },
    invitation: { bg: "#f0fff4", color: "#064e3b", title: "You’re Invited", message: "Venue • Date • Time" },
    quote: { bg: "#f8fbff", color: "#0f172a", title: "Inspiration", message: "Believe in yourself." }
  };

  templateSelect?.addEventListener('change', ()=> {
    const t = SMART_TEMPLATES[templateSelect.value];
    if (t) {
      titleEl.value = t.title;
      messageEl.value = t.message;
      bgColor.value = t.bg;
      textColor.value = t.color;
      renderPreview();
    }
  });

  /* WELCOME SAMPLE IMAGES (assets) */
  const SAMPLES = [
    { src: "assets/sample1.jpg", title: "Festival Sample" },
    { src: "assets/sample2.jpg", title: "Birthday Sample" },
    { src: "assets/sample3.jpg", title: "Business Sample" }
  ];
  function buildWelcomeSamples(){
    if(!welcomeSamples) return;
    welcomeSamples.innerHTML = '';
    SAMPLES.forEach(s => {
      const img = document.createElement('img'); img.src = s.src; img.alt = s.title; img.title = s.title;
      img.addEventListener('click', ()=> {
        titleEl.value = s.title;
        messageEl.value = 'Sample: ' + s.title;
        renderPreview();
        document.querySelector('.tab-btn[data-tab="create"]').click();
      });
      welcomeSamples.appendChild(img);
    });
  }
  buildWelcomeSamples();

  /* CROPPER (modal) */
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  const cancelCropBtn = document.getElementById("cancelCropBtn");
  const applyCropBtn = document.getElementById("applyCropBtn");

  imageUpload?.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      cropImage.src = ev.target.result;
      cropModal.classList.remove('hidden');
      cropImage.onload = () => {
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, { viewMode:1, autoCropArea:1, background:false });
      };
    };
    reader.readAsDataURL(f);
  });
  cancelCropBtn?.addEventListener('click', ()=> {
    cropModal.classList.add('hidden');
    if (cropper) { cropper.destroy(); cropper = null; }
    imageUpload.value = '';
  });
  applyCropBtn?.addEventListener('click', ()=> {
    if(!cropper) return;
    const canvas = cropper.getCroppedCanvas({ maxWidth:1080 });
    uploadedDataUrl = canvas.toDataURL('image/png');
    cropModal.classList.add('hidden');
    cropper.destroy(); cropper = null;
    renderPreview();
  });

  /* LIVE PREVIEW */
  function renderPreview(){
    pTitle.textContent = titleEl.value || '';
    pSubtitle.textContent = subtitleEl.value || '';
    pMessage.innerHTML = (messageEl.value || '').replace(/\n/g, '<br>');
    previewCard.style.background = bgColor.value || '#ffffff';
    previewCard.style.color = textColor.value || '#111';
    previewCard.style.fontFamily = fontFamily.value || 'Montserrat, sans-serif';
    previewCard.style.fontSize = (fontSize.value || 20) + 'px';

    pImage.innerHTML = '';
    if (uploadedDataUrl) {
      const img = document.createElement('img'); img.src = uploadedDataUrl; img.className = 'preview-img';
      pImage.appendChild(img);
    }
    pQR.innerHTML = '';
    if (qrText.value && qrText.value.trim()) {
      const q = document.createElement('img');
      q.src = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(qrText.value);
      q.alt = 'QR';
      pQR.appendChild(q);
    }
    autoFitText(previewCard, '#pMessage');
  }
  [titleEl, subtitleEl, messageEl, fontFamily, fontSize, textColor, bgColor, qrText].forEach(el => {
    if (!el) return;
    el.addEventListener('input', renderPreview);
  });
  renderPreview();

  /* AUTO-FIT TEXT */
  function autoFitText(container, selector, min=12, max=48){
    const el = container.querySelector(selector);
    if(!el) return;
    let size = max;
    el.style.fontSize = size + 'px';
    // reduce until fits
    while (container.scrollHeight > container.clientHeight && size > min){
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }

  /* GENERATE IMAGE + WATERMARK + PROMPT FILENAME */
  async function generateImage(){
    try {
      generateBtn.disabled = true;
      const clone = previewCard.cloneNode(true);
      clone.style.width = getRenderWidth() + 'px';
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: null });
      document.body.removeChild(clone);

      const ctx = canvas.getContext('2d');
      ctx.font = '16px Montserrat';
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.textAlign = 'right';
      ctx.fillText('aksharachitra.netlify.app', canvas.width - 20, canvas.height - 20);

      const dataUrl = canvas.toDataURL('image/png');
      const filename = prompt('Enter file name', 'aksharachitra') || 'aksharachitra';
      const a = document.createElement('a'); a.href = dataUrl; a.download = filename + '.png'; a.click();

    } catch (e) {
      console.error(e); alert('Failed to generate image.');
    } finally { generateBtn.disabled = false; }
  }
  generateBtn?.addEventListener('click', generateImage);
  downloadBtn?.addEventListener('click', generateImage);

  function getRenderWidth(){ return 1080; }

  /* SHARE */
  shareBtn?.addEventListener('click', async () => {
    try {
      const canvas = await html2canvas(previewCard, { scale: 2 });
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], 'aksharachitra.png', { type: 'image/png' });
      if (navigator.canShare && navigator.share) {
        await navigator.share({ files: [file], title: 'AksharaChitra' });
      } else {
        alert('Share not available on this device/browser — please download instead.');
      }
    } catch (err) {
      console.error(err); alert('Share failed.');
    }
  });

  /* SAVE TO GALLERY */
  saveBtn?.addEventListener('click', async ()=> {
    try {
      const canvas = await html2canvas(previewCard, { scale: 1 });
      const data = canvas.toDataURL('image/png');
      const list = JSON.parse(localStorage.getItem('ak_gallery_v6') || '[]');
      list.unshift({ title: titleEl.value || 'Untitled', ts: Date.now(), data });
      while(list.length > 60) list.pop();
      localStorage.setItem('ak_gallery_v6', JSON.stringify(list));
      renderGallery();
      alert('Saved to My Creations');
    } catch (e) {
      console.error(e); alert('Save failed');
    }
  });

  /* RENDER GALLERY */
  function renderGallery(){
    if(!galleryGrid) return;
    const list = JSON.parse(localStorage.getItem('ak_gallery_v6') || '[]');
    galleryGrid.innerHTML = '';
    if(!list.length){ galleryGrid.innerHTML = '<div class="muted">No saved designs yet</div>'; return; }
    list.forEach(item => {
      const img = document.createElement('img'); img.src = item.data; img.title = item.title + ' • ' + new Date(item.ts).toLocaleString();
      img.addEventListener('click', ()=> {
        const open = confirm('Open design in new tab? OK = open, Cancel = download');
        if(open) window.open(item.data, '_blank');
        else { const a = document.createElement('a'); a.href = item.data; a.download = (item.title||'design') + '.png'; a.click(); }
      });
      galleryGrid.appendChild(img);
    });
  }
  renderGallery();

  /* CLEAR */
  clearBtn?.addEventListener('click', ()=> {
    if(!confirm('Clear form fields?')) return;
    [titleEl, subtitleEl, messageEl, qrText].forEach(e=> e.value = '');
    uploadedDataUrl = ''; imageUpload.value = '';
    renderPreview();
  });

  /* CLEAR ALL DATA */
  document.getElementById('clearAllBtn')?.addEventListener('click', ()=> {
    if(!confirm('Clear ALL local data (gallery, autosaves, settings)?')) return;
    localStorage.removeItem('ak_gallery_v6'); localStorage.removeItem('ak_autosave_v6'); localStorage.removeItem('ak_theme_dark');
    location.reload();
  });

  /* AUTO-SAVE DRAFT */
  function autoSave(){
    const s = { title: titleEl.value, subtitle: subtitleEl.value, message: messageEl.value, fontFamily: fontFamily.value, fontSize: fontSize.value, textColor: textColor.value, bgColor: bgColor.value, qrText: qrText.value };
    localStorage.setItem('ak_autosave_v6', JSON.stringify(s));
  }
  setInterval(autoSave, 3000);

  function loadAutoSave(){
    const s = JSON.parse(localStorage.getItem('ak_autosave_v6') || '{}');
    if(!s) return;
    if(s.title) titleEl.value = s.title;
    if(s.subtitle) subtitleEl.value = s.subtitle;
    if(s.message) messageEl.value = s.message;
    if(s.fontFamily) fontFamily.value = s.fontFamily;
    if(s.fontSize) fontSize.value = s.fontSize;
    if(s.textColor) textColor.value = s.textColor;
    if(s.bgColor) bgColor.value = s.bgColor;
    if(s.qrText) qrText.value = s.qrText;
    renderPreview();
  }
  loadAutoSave();

  /* SPEECH-TO-TEXT */
  speechBtn?.addEventListener('click', ()=>{
    if(!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert('Speech recognition not supported in this browser.');
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => {
      const txt = Array.from(e.results).map(r => r[0].transcript).join(' ');
      messageEl.value = (messageEl.value ? messageEl.value + '\n' : '') + txt;
      renderPreview();
    };
    rec.onerror = ()=> alert('Speech recognition error.');
    rec.start();
  });

  /* AI helpers (simple offline heuristics) */
  const SUGGEST = { warm: ["Wishing you light and joy.","May your day be bright."], formal:["Please be informed.","Best regards."], poetic:["Petals fall, memories remain.","Like a lamp, your life shine."] };
  document.getElementById('aiSuggest')?.addEventListener('click', ()=> {
    const tone = document.getElementById('aiTone').value || 'warm';
    const pick = SUGGEST[tone][Math.floor(Math.random()*SUGGEST[tone].length)];
    document.getElementById('aiOutput').value = pick;
  });
  document.getElementById('aiTranslate')?.addEventListener('click', ()=> {
    const map = {'happy':'శుభ','birthday':'పుట్టినరోజు','love':'ప్రేమ'};
    const t = (messageEl.value || titleEl.value || '').split(/\b/).map(w => map[w.toLowerCase()]||w).join('');
    document.getElementById('aiOutput').value = t || 'Type short English phrase';
  });
  document.getElementById('aiSansk')?.addEventListener('click', ()=> {
    const t = (messageEl.value || titleEl.value || '').replace(/\brama\b/gi, 'राम').replace(/\bom\b/gi, 'ॐ');
    document.getElementById('aiOutput').value = t || 'Enter text';
  });
  document.getElementById('aiUse')?.addEventListener('click', ()=> {
    const out = document.getElementById('aiOutput').value || '';
    if(!out) return alert('No AI output');
    messageEl.value = (messageEl.value ? messageEl.value + '\n' : '') + out;
    renderPreview();
    document.querySelector('.tab-btn[data-tab="create"]')?.click();
  });
  document.getElementById('aiStyle')?.addEventListener('click', ()=> {
    const txt = (titleEl.value + ' ' + messageEl.value).toLowerCase();
    if(/diwali|deepavali|diyas|festival/.test(txt)) { bgColor.value='#fff6e6'; textColor.value='#5b3711'; fontFamily.value="'Noto Sans Telugu', serif"; }
    else if(/birthday/.test(txt)){ bgColor.value='#fff0f7'; textColor.value='#5b2a86'; fontFamily.value='Montserrat, sans-serif'; }
    renderPreview();
  });

  /* PWA install prompt */
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e)=> {
    e.preventDefault(); deferredPrompt = e; installBtn.classList.remove('hidden');
  });
  installBtn?.addEventListener('click', async ()=> {
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if(outcome === 'accepted') installBtn.classList.add('hidden');
  });

  /* HELPERS */
  function renderGallery(){ // used above too
    if(!galleryGrid) return;
    const list = JSON.parse(localStorage.getItem('ak_gallery_v6') || '[]');
    galleryGrid.innerHTML = '';
    if(!list.length) { galleryGrid.innerHTML = '<div class="muted">No saved designs</div>'; return; }
    list.forEach(item => {
      const img = document.createElement('img'); img.src = item.data; img.title = item.title;
      img.addEventListener('click', ()=> {
        const open = confirm('Open? OK=open, Cancel=download');
        if(open) window.open(item.data,'_blank'); else { const a = document.createElement('a'); a.href=item.data; a.download=(item.title||'design')+'.png'; a.click(); }
      });
      galleryGrid.appendChild(img);
    });
  }
  renderGallery();

  /* expose debug api */
  window.akshara = { renderPreview, generateImage, renderGallery };

});

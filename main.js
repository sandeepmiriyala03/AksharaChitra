document.addEventListener("DOMContentLoaded", () => {
    const id = (x) => document.getElementById(x);

    // --- Core Elements ---
    const titleEl = id("title"),
        subtitleEl = id("subtitle"),
        messageEl = id("message"),
        fontFamily = id("fontFamily"),
        textColor = id("textColor"),
        bgColor = id("bgColor"),
        qrText = id("qrText"),
        imageUpload = id("imageUpload"),
        imagePosition = id("imagePosition"),
        templateSelect = id("templateSelect"),
        previewCard = id("previewCard"),
        pTitle = id("pTitle"), // pTitle element from HTML
        pSubtitle = id("pSubtitle"), // pSubtitle element from HTML
        pMessage = id("pMessage"), // pMessage element from HTML
        pImage = id("pImage"),
        pQR = id("pQR"),
        generateBtn = id("generateBtn"),
        downloadBtn = id("downloadBtn"),
        shareBtn = id("shareBtn"),
        saveBtn = id("saveBtn"),
        clearBtn = id("clearBtn"),
        themeToggle = id("themeToggle");

    // --- Font & Alignment Controls ---
    const titleSize = id("titleSize"),
        subtitleSize = id("subtitleSize"),
        messageSize = id("messageSize"),
        titleAlign = id("titleAlign"),
        subtitleAlign = id("subtitleAlign"),
        contentAlign = id("contentAlign");

    // --- Text Shadow (Glow) Controls ---
    let shadowColor = "#000000";
    let shadowBlur = 0;
    const shadowColorInput = id("shadowColor");
    const shadowBlurInput = id("shadowBlur");
    
    // --- Gallery Grid Element ---
    const galleryGrid = id("galleryGrid");


    // --- Theme Toggle ---
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("ak_theme_dark", document.body.classList.contains("dark"));
    });
    if (localStorage.getItem("ak_theme_dark") === "true")
        document.body.classList.add("dark");

    // --- Tab Navigation ---
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach((sec) => sec.classList.remove("active"));
            btn.classList.add("active");
            const targetTab = btn.getAttribute("data-tab");
            const section = document.getElementById(targetTab);
            if (section) section.classList.add("active");
        });
    });

    // --- Templates ---
    const TEMPLATES = {
        news: { title: "📰 Breaking News", msg: "Your news here", bg: "#ffffff", color: "#111111" },
        birthday: { title: "🎂 Happy Birthday!", msg: "Wishing you joy!", bg: "#fff0f7", color: "#5b2a86" },
        devotional: { title: "🕉 శుభ దినం", msg: "May divine grace bless you", bg: "#fff7e6", color: "#6b3a00" },
        business: { title: "Your Business", msg: "Contact: +91 99999 99999", bg: "#f1f5f9", color: "#111111" },
        invitation: { title: "Invitation", msg: "Venue • Date • Time", bg: "#f0fff4", color: "#064e3b" },
        quote: { title: "Quote", msg: "Believe in yourself!", bg: "#f8fbff", color: "#0f172a" },
    };

    templateSelect.addEventListener("change", () => {
        const t = TEMPLATES[templateSelect.value];
        if (!t) return;
        titleEl.value = t.title;
        messageEl.value = t.msg;
        bgColor.value = t.bg;
        textColor.value = t.color;
        renderPreview();
    });

    // --- Image Upload + Crop ---
    let uploadedDataUrl = "";
    let cropper = null;

    const cropModal = id("cropModal"),
        cropImage = id("cropImage"),
        cancelCropBtn = id("cancelCropBtn"),
        applyCropBtn = id("applyCropBtn");

    imageUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            cropImage.src = ev.target.result;
            cropModal.classList.remove("hidden");
            cropImage.onload = () => {
                if (cropper) cropper.destroy();
                if (typeof Cropper !== 'undefined') {
                    cropper = new Cropper(cropImage, { viewMode: 1, autoCropArea: 1 });
                } else {
                    console.error("Cropper library is not loaded.");
                    uploadedDataUrl = ev.target.result;
                    cropModal.classList.add("hidden");
                    renderPreview();
                }
            };
        };
        reader.readAsDataURL(file);
    });

    cancelCropBtn.addEventListener("click", () => {
        cropModal.classList.add("hidden");
        cropper?.destroy();
        cropper = null;
        imageUpload.value = "";
    });

    applyCropBtn.addEventListener("click", () => {
        if (!cropper) return;
        try {
            const canvas = cropper.getCroppedCanvas({ maxWidth: 2500 }); 
            uploadedDataUrl = canvas.toDataURL("image/png");
        } catch (e) {
            console.error("Error cropping image:", e);
            alert("Error cropping image. Please try again.");
            return;
        }
        
        cropModal.classList.add("hidden");
        cropper.destroy();
        cropper = null;
        renderPreview();
    });

    // --- Render Preview (Final Fixes for Text Visibility & Styles) ---
    function renderPreview() {
        previewCard.style.background = bgColor.value;
        previewCard.style.color = textColor.value;
        previewCard.style.fontFamily = fontFamily.value;

        const shadow = shadowBlur > 0 ? `0 0 ${shadowBlur}px ${shadowColor}` : "none";
        
        // Apply text shadow to all text elements
        pTitle.style.textShadow = shadow;
        pSubtitle.style.textShadow = shadow;
        pMessage.style.textShadow = shadow;
        
        // Apply font family explicitly to text elements
        pTitle.style.fontFamily = fontFamily.value;
        pSubtitle.style.fontFamily = fontFamily.value;
        pMessage.style.fontFamily = fontFamily.value;


        // Title
        pTitle.className = "p-title"; // ⭐ CRITICAL: Apply the CSS class for styling (font-weight, margin)
        pTitle.textContent = titleEl.value || "";
        pTitle.style.fontSize = titleSize.value + "px";
        pTitle.style.textAlign = titleAlign.value;
        pTitle.style.whiteSpace = "normal"; 
        pTitle.style.display = "block"; 
        pTitle.style.width = "100%"; 
        pTitle.style.boxSizing = "border-box";
        

        // Subtitle
        pSubtitle.className = "p-subtitle"; // ⭐ CRITICAL: Apply the CSS class for styling (font-weight, margin)
        pSubtitle.textContent = subtitleEl.value || "";
        pSubtitle.style.fontSize = subtitleSize.value + "px";
        pSubtitle.style.textAlign = subtitleAlign.value;
        pSubtitle.style.whiteSpace = "normal"; 
        pSubtitle.style.display = "block";
        pSubtitle.style.width = "100%";
        pSubtitle.style.boxSizing = "border-box";


        // Message
        pMessage.className = "p-body"; // ⭐ CRITICAL: Apply the CSS class for styling (margin, line-height)
        pMessage.innerHTML = (messageEl.value || "").replace(/\n/g, "<br>");
        pMessage.style.fontSize = messageSize.value + "px";
        pMessage.style.textAlign = contentAlign.value;
        pMessage.style.whiteSpace = "normal"; 
        pMessage.style.display = "block";


        // Image
        const pos = imagePosition.value || "center";
        // The pImage element MUST exist in your HTML
        pImage.className = "p-image align-" + pos; 
        pImage.innerHTML = "";
        if (uploadedDataUrl) {
            const img = document.createElement("img");
            img.src = uploadedDataUrl;
            img.alt = "Uploaded Image";
            pImage.appendChild(img);
        }

        // QR Code
        pQR.innerHTML = "";
        if (qrText.value.trim()) {
            const q = document.createElement("img");
            q.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(qrText.value);
            q.alt = "QR";
            pQR.appendChild(q);
        }
    }

    // --- Live Input Binding (Same) ---
    [
        titleEl, subtitleEl, messageEl, fontFamily, textColor, bgColor, qrText,
        imagePosition, titleSize, subtitleSize, messageSize, titleAlign,
        subtitleAlign, contentAlign
    ].forEach((el) => el?.addEventListener("input", renderPreview));

    if (shadowColorInput && shadowBlurInput) {
        shadowColorInput.addEventListener("input", (e) => {
            shadowColor = e.target.value;
            renderPreview();
        });
        shadowBlurInput.addEventListener("input", (e) => {
            shadowBlur = parseInt(e.target.value);
            renderPreview();
        });
    }

    // --- Generate / Download ---
    async function generateImage(download) {
        try {
            // High scale for sharp output
            const canvas = await html2canvas(previewCard, { scale: 4 }); 
            const ctx = canvas.getContext("2d");
            // Watermark application
            ctx.font = "32px Montserrat"; 
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.textAlign = "right";
            ctx.fillText("aksharachitra.netlify.app", canvas.width - 40, canvas.height - 40);

            const data = canvas.toDataURL("image/png");
            
            if (download) {
                const filename = prompt("Enter file name", "AksharaChitra") || "AksharaChitra";
                const a = document.createElement("a");
                a.href = data;
                a.download = filename + ".png";
                a.click();
            }
            return data; 
        } catch (err) {
            alert("⚠️ Failed to generate image. Ensure html2canvas library is loaded.");
            console.error(err);
            return null;
        }
    }
    
    // Updated button handlers for clarity
    generateBtn.addEventListener("click", () => generateImage(true));
    downloadBtn.addEventListener("click", () => generateImage(true)); 

    // --- Share API (Same) ---
    shareBtn.addEventListener("click", async () => {
        const dataUrl = await generateImage(false); 
        if (!dataUrl) return;

        try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], "aksharachitra.png", { type: "image/png" });

            if (navigator.canShare && navigator.share) {
                await navigator.share({ 
                    files: [file], 
                    title: "AksharaChitra Poster",
                    text: "Check out my poster created with AksharaChitra!",
                    url: window.location.href 
                });
            } else {
                alert("Sharing not natively supported on this device. Please use the 'Download' button and share the saved image.");
            }
        } catch (err) {
            console.error("Share failed:", err);
            alert("Failed to share image.");
        }
    });


    // --- Save Offline (Same) ---
    saveBtn.addEventListener("click", async () => {
        try {
            const canvas = await html2canvas(previewCard, { scale: 1 }); 
            const data = canvas.toDataURL("image/png");
            const list = JSON.parse(localStorage.getItem("ak_gallery_v7") || "[]");
            list.unshift({ title: titleEl.value || "Untitled", ts: Date.now(), data });
            while (list.length > 50) list.pop();
            localStorage.setItem("ak_gallery_v7", JSON.stringify(list));
            alert("💾 Saved to My Creations (Offline).");
            if (document.getElementById("gallery").classList.contains("active")) {
                loadGallery();
            }
        } catch (err) {
             alert("⚠️ Failed to save image.");
             console.error(err);
        }
    });

    // --- Clear Fields (Same) ---
    clearBtn.addEventListener("click", () => {
        if (!confirm("Clear all fields?")) return;
        [titleEl, subtitleEl, messageEl, qrText].forEach((e) => (e.value = ""));
        uploadedDataUrl = "";
        imageUpload.value = "";
        shadowBlur = 0;
        shadowColor = "#000000";
        textColor.value = "#111111";
        bgColor.value = "#ffffff";
        shadowColorInput.value = "#000000";
        shadowBlurInput.value = "0";
        renderPreview();
    });

    // --- Auto Save (Same) ---
    setInterval(() => {
        const s = {
            title: titleEl.value, subtitle: subtitleEl.value, message: messageEl.value,
            fontFamily: fontFamily.value, textColor: textColor.value, bgColor: bgColor.value,
            qrText: qrText.value, imagePos: imagePosition.value, titleSize: titleSize.value,
            subtitleSize: subtitleSize.value, messageSize: messageSize.value, titleAlign: titleAlign.value,
            subtitleAlign: subtitleAlign.value, contentAlign: contentAlign.value,
            shadowBlur, shadowColor
        };
        localStorage.setItem("ak_autosave_v7", JSON.stringify(s));
    }, 3000);

    // --- Load Saved (Same) ---
    const saved = JSON.parse(localStorage.getItem("ak_autosave_v7") || "null");
    if (saved) {
        Object.keys(saved).forEach((k) => {
            if (k === "shadowBlur") {
                shadowBlur = saved[k];
                if (shadowBlurInput) shadowBlurInput.value = saved[k];
            } else if (k === "shadowColor") {
                shadowColor = saved[k];
                if (shadowColorInput) shadowColorInput.value = saved[k];
            }
            else if (id(k)) id(k).value = saved[k];
        });
        renderPreview();
    }

    renderPreview();
});

// === (Remaining functions: Feedback Modal Logic, Gallery Rendering - UNCHANGED) ===
function loadGallery() {
    const grid = document.getElementById("galleryGrid");
    const list = JSON.parse(localStorage.getItem("ak_gallery_v7") || "[]");

    if (!grid) return; 

    grid.innerHTML = ""; 

    if (list.length === 0) {
        grid.innerHTML = `<p class="muted">No saved creations yet. Save your designs to view them here!</p>`;
        return;
    }

    list.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `
            <img src="${item.data}" alt="${item.title}" title="${item.title}" />
            <div class="gallery-meta">
                <span>${item.title}</span>
                <button class="btn delete-btn" data-index="${index}" title="Delete this design">🗑️</button>
            </div>
        `;
        grid.appendChild(div);
    });

    grid.querySelectorAll("img").forEach((img) => {
        img.addEventListener("click", () => {
            const w = window.open();
            w.document.write(`<img src="${img.src}" style="max-width:100%;display:block;margin:auto;">`);
        });
    });

    grid.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.dataset.index);
            const confirmDelete = confirm("Delete this saved creation?");
            if (confirmDelete) {
                list.splice(index, 1);
                localStorage.setItem("ak_gallery_v7", JSON.stringify(list));
                loadGallery(); 
            }
        });
    });
}

const galleryTabBtn = document.querySelector('button[data-tab="gallery"]');
if (galleryTabBtn) {
    galleryTabBtn.addEventListener("click", loadGallery);
}
if (document.getElementById("gallery") && document.getElementById("gallery").classList.contains("active")) {
    loadGallery();
}

document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('openFeedbackModal');
    const modal = document.getElementById('feedbackModal');
    const iframe = document.getElementById('feedbackIframe');
    const closeBtn = document.getElementById('closeFeedbackModal');
    const feedbackUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdkJ4AgmO7FJOZuhnLO7KaOkuc17fvbkcrBw1eXliwn7GPz4w/viewform?usp=publish-editor';
    const fallbackLink = document.getElementById('feedbackNewTab');
    const openInTabFromModal = document.getElementById('openInTabFromModal');

    if (fallbackLink) fallbackLink.href = feedbackUrl;
    if (openInTabFromModal) openInTabFromModal.href = feedbackUrl;

    function openModal() {
        iframe.src = feedbackUrl;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            try {
                const href = iframe.contentWindow && iframe.contentWindow.location && iframe.contentWindow.location.href;
                if (!href) throw new Error('iframe inaccessible');
            } catch (e) {
                window.open(feedbackUrl, '_blank', 'noopener');
                closeModal();
            }
        }, 700);
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        iframe.src = 'about:blank';
    }

    if(openBtn) openBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);

    if(modal) modal.addEventListener('click', (ev) => {
        if (ev.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
    });
});

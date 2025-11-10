  // 🕉️ Check Panchangam Engine
  const box = document.getElementById("panchangamContent");
  if (typeof panchang === "undefined") {
    if (box) box.innerHTML = `<p style="color:red;">⚠️ Panchangam data not loaded. Please refresh.</p>`;
    console.error("⚠️ Panchangam script not loaded or missing /js/panchang.js");
    return;
  }

  // 🌼 Utility: Add a visual loading shimmer
  function showLoading(targetBox) {
    targetBox.innerHTML = `
      <div class="loading-box">
        <div class="loader"></div>
        <p>🔄 పంచాంగం లెక్కించబడుతోంది...</p>
      </div>`;
  }

  // 🪔 Render Panchangam Function
  async function renderPanchangam(date) {
    if (!box) return;
    showLoading(box);

    panchang.calculate(date, () => {
      box.innerHTML = `
        <div class="panchangam-card fade-in" id="panchangPoster">

          <h3>${panchang.Raasi.name} రాశి • ${panchang.teluguYears} సంవత్సరం</h3>

          <p class="date-line">
            ${date.toLocaleDateString("te-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </p>
          <hr>
          <p>🌅 <strong>తిథి:</strong> ${panchang.Tithi.name}</p>
          <p>🕰️ <strong>తిథి ప్రారంభం:</strong> ${panchang.Tithi.start}</p>
          <p>🔔 <strong>తిథి ముగింపు:</strong> ${panchang.Tithi.end}</p>
          <p>🌙 <strong>నక్షత్రం:</strong> ${panchang.Nakshatra.name}</p>
          <p>🌟 <strong>యోగం:</strong> ${panchang.Yoga.name}</p>
          <p>🕉️ <strong>కరణం:</strong> ${panchang.Karna.name}</p>
       
          <p>📜 <strong>అయనాంశం:</strong> ${panchang.Ayanamsa.name}</p>

        </div>

        <div class="panchang-actions">
          <button id="downloadPanchangBtn" class="btn primary">📸 Download as Poster</button>
        </div>
      `;

      // 🎨 Download Poster Logic
      const downloadBtn = document.getElementById("downloadPanchangBtn");
      if (!downloadBtn) return;

      downloadBtn.addEventListener("click", async () => {
        const poster = document.getElementById("panchangPoster");
        if (!poster) return;

        // Prevent multiple downloads
        downloadBtn.disabled = true;
        downloadBtn.textContent = "⏳ Generating Poster...";

        // Clone poster (to safely add footer)
        const clone = poster.cloneNode(true);
        clone.style.position = "relative";

        // Footer creation
        const footer = document.createElement("div");
        footer.className = "ak-footer";
        footer.style.position = "absolute";
        footer.style.bottom = "6px";
        footer.style.left = "12px";
        footer.style.right = "12px";
        footer.style.display = "flex";
        footer.style.alignItems = "center";
        footer.style.justifyContent = "space-between";
        footer.style.fontSize = "11px";
        footer.style.opacity = "0.85";
        footer.style.color = "#333";

        const now = new Date();
        const formatted = now.toLocaleString("en-IN", {
          day: "2-digit", month: "2-digit", year: "2-digit",
          hour: "2-digit", minute: "2-digit", hour12: true
        }).replace(",", "");

        const dateSpan = document.createElement("span");
        dateSpan.textContent = formatted;

        const logoGroup = document.createElement("div");
        logoGroup.style.display = "flex";
        logoGroup.style.alignItems = "center";
        logoGroup.style.gap = "6px";

        const logoImg = document.createElement("img");
        logoImg.src = "logo.png";
        logoImg.style.width = "16px";
        logoImg.style.height = "16px";
        logoImg.style.borderRadius = "4px";

        const logoText = document.createElement("span");
        logoText.textContent = "AksharaChitra";
        logoText.style.fontStyle = "italic";
        logoText.style.fontWeight = "600";
        logoText.style.color = "#5a4500";

        logoGroup.appendChild(logoImg);
        logoGroup.appendChild(logoText);
        footer.appendChild(dateSpan);
        footer.appendChild(logoGroup);
        clone.appendChild(footer);

        // Create temp container for capture
        const tempContainer = document.createElement("div");
        tempContainer.style.position = "fixed";
        tempContainer.style.left = "-9999px";
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        try {
          const canvas = await html2canvas(clone, { backgroundColor: "#fffdf7", scale: 2 });
          const link = document.createElement("a");
          link.download = `Panchangam_${now.toISOString().slice(0, 10)}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();

          downloadBtn.textContent = "✅ Poster Saved!";
          setTimeout(() => {
            downloadBtn.textContent = "📸 Download as Poster";
            downloadBtn.disabled = false;
          }, 1500);
        } catch (err) {
          console.error("❌ Error generating poster:", err);
          alert("Unable to generate poster. Please try again.");
          downloadBtn.textContent = "📸 Download as Poster";
          downloadBtn.disabled = false;
        } finally {
          tempContainer.remove();
        }
      });
    });
  }

  // 🪔 Load Today’s Panchangam by Default
  const today = new Date();
  renderPanchangam(today);

  // 🕹️ Navigation Buttons
  if (box) {
    const navDiv = document.createElement("div");
    navDiv.className = "panchang-nav";
    navDiv.innerHTML = `
      <button id="prevDay" class="btn ghost">⬅️ నిన్నటి</button>
      <button id="todayBtn" class="btn primary">📅 ఈ రోజు</button>
      <button id="nextDay" class="btn ghost">➡️ రేపటి</button>
    `;
    box.before(navDiv);

    document.getElementById("prevDay").addEventListener("click", () => {
      today.setDate(today.getDate() - 1);
      renderPanchangam(today);
    });

    document.getElementById("nextDay").addEventListener("click", () => {
      today.setDate(today.getDate() + 1);
      renderPanchangam(today);
    });

    document.getElementById("todayBtn").addEventListener("click", () => {
      today.setTime(Date.now());
      renderPanchangam(today);
    });
  }

  // 🕉️ Om Circle Animation
  const omCircle = document.querySelector(".om-circle");
  if (omCircle) {
    omCircle.addEventListener("mouseenter", () => {
      omCircle.style.transform = "scale(1.15) rotate(5deg)";
    });
    omCircle.addEventListener("mouseleave", () => {
      omCircle.style.transform = "scale(1) rotate(0)";
    });
  }
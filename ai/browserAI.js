document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("aiCapabilitiesList");
  if (!container) {
    console.error("Error: #aiCapabilitiesList container not found in DOM.");
    return; // Exit since container is missing
  }

  // AI capabilities with offline/online usage and roadmap flags
  const capabilities = [
    { name: "WebGPU", supported: !!navigator.gpu, offline: false, online: false, sectionId: 'webglDemo', used: false, planned: true },
    { name: "WebGL", supported: !!document.createElement("canvas").getContext("webgl"), offline: true, online: true, sectionId: 'webglDemo', used: true, planned: false },
    { name: "Speech Recognition", supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition), offline: true, online: true, sectionId: 'voiceInputDemo', used: true, planned: false },
    { name: "Text-to-Speech", supported: "speechSynthesis" in window, offline: true, online: true, sectionId: 'ttsDemo', used: true, planned: false },
    { name: "Local File Access API", supported: !!window.showOpenFilePicker, offline: true, online: true, sectionId: 'fileAccessDemo', used: true, planned: false },
    { name: "Clipboard API", supported: !!navigator.clipboard, offline: true, online: true, sectionId: 'clipboardDemo', used: true, planned: false },
    { name: "Local Font Access API", supported: !!window.queryLocalFonts, offline: true, online: true, sectionId: null, used: false, planned: true },
    { name: "WebNN", supported: !!navigator.ml, offline: false, online: false, sectionId: null, used: false, planned: true },
    { name: "Web Workers", supported: !!window.Worker, offline: true, online: true, sectionId: 'webWorkerDemo', used: true, planned: false },
    { name: "Storage Manager", supported: !!navigator.storage, offline: true, online: true, sectionId: 'storageDemo', used: true, planned: false },
    { name: "Device RAM", supported: navigator.deviceMemory || "Unknown", offline: true, online: true, sectionId: null, used: false, planned: false },
    { name: "CPU Threads", supported: navigator.hardwareConcurrency || "Unknown", offline: true, online: true, sectionId: null, used: false, planned: false }
  ];

  // Calculate usage summary
  const total = capabilities.length;
  const usedCount = capabilities.filter(c => c.used).length;
  const plannedCount = capabilities.filter(c => c.planned).length;

  // Create and insert summary block before capabilities list
  const summaryDiv = document.createElement("div");
  summaryDiv.className = "ai-cap-summary";
  summaryDiv.innerHTML = `
    <p><strong>Total AI/Browser Capabilities:</strong> ${total}</p>
    <p><strong>Currently Used:</strong> ${usedCount}</p>
    <p><strong>Planned for Roadmap:</strong> ${plannedCount}</p>
  `;
  container.parentNode.insertBefore(summaryDiv, container);

  function statClass(flag) {
    return flag ? "available" : "unavailable";
  }

  function statIcon(flag) {
    return flag ? "✔ Available" : "✖ Not Supported";
  }

  container.innerHTML = "";

  capabilities.forEach(({ name, supported, offline, online, sectionId }) => {
    const item = document.createElement("div");
    item.className = "ai-cap-item";

    const demoToggleHtml = sectionId ? `
      <button class="demo-toggle-btn" aria-expanded="false" aria-controls="${sectionId}" aria-label="Toggle demo for ${name}">
        ▶ Show Demo
      </button>
      <div id="${sectionId}" class="demo-container hidden" aria-hidden="true"></div>
    ` : "";

    item.innerHTML = `
      <span>${name}</span>
      <div>Supported: <strong class="${statClass(supported)}">${statIcon(supported)}</strong></div>
      <div>Used Offline: <strong class="${statClass(offline)}">${statIcon(offline)}</strong></div>
      <div>Used Online: <strong class="${statClass(online)}">${statIcon(online)}</strong></div>
      ${demoToggleHtml}
    `;

    container.appendChild(item);
  });

  container.querySelectorAll('.demo-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls');
      const demoElem = document.getElementById(targetId);
      if (!demoElem) return;

      const isHidden = demoElem.classList.contains('hidden');

      container.querySelectorAll('.demo-container').forEach(el => {
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
      });
      container.querySelectorAll('.demo-toggle-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.textContent = '▶ Show Demo';
      });

      if (isHidden) {
        demoElem.classList.remove('hidden');
        demoElem.setAttribute('aria-hidden', 'false');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '▼ Hide Demo';

        switch (targetId) {
          case 'webglDemo':
            demoElem.innerHTML = `<p><strong>WebGL Demo:</strong> Accelerated GPU rendering used for poster previews and effects.</p>`;
            break;
          case 'voiceInputDemo':
            demoElem.innerHTML = `<p><strong>Voice Input Demo:</strong> Use microphone to dictate poster text with speech recognition.</p>`;
            break;
          case 'ttsDemo':
            demoElem.innerHTML = `<p><strong>Text-to-Speech Demo:</strong> Hear your poster content read aloud via browser's speech synthesis.</p>`;
            break;
          case 'fileAccessDemo':
            demoElem.innerHTML = `<p><strong>Local File Access:</strong> Open/save poster assets directly from device storage.</p>`;
            break;
          case 'clipboardDemo':
            demoElem.innerHTML = `<p><strong>Clipboard Access:</strong> Copy and paste text/images easily.</p>`;
            break;
          case 'webWorkerDemo':
            demoElem.innerHTML = `<p><strong>Web Workers Demo:</strong> Background poster generation for smooth UI performance.</p>`;
            break;
          case 'storageDemo':
            demoElem.innerHTML = `<p><strong>Offline Storage:</strong> Posters saved with IndexedDB for offline access.</p>`;
            break;
          default:
            demoElem.innerHTML = `<p>No demo available.</p>`;
        }
      }
    });
  });
});

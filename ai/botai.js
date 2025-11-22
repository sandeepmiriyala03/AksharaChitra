// =========================================
// AksharaChitra Chatbot – Full Clean Version
// FAQ → IndexedDB → API Fallback
// =========================================

// -------- 1. FAQ Dictionary --------
const dictionary = {
  "what is aksharachitra": "AksharaChitra is India's first AI-powered multilingual poster maker, offline and free, supporting 8 Indian languages and 52 native fonts.",
  "how to use aksharachitra": "Enter your text, select language, choose template & font, add images/QR, and generate instantly.",
  "can i use aksharachitra offline": "Yes! AksharaChitra works fully offline after first load as a PWA.",
  "which languages are supported": "Supported: Telugu, Hindi, Tamil, Kannada, Malayalam, Sanskrit, Odia & English.",
  "how many fonts are available": "There are 52+ built-in native Indian fonts.",
  "does it support voice input": "Yes, smart voice input + TTS for all Indian languages.",
  "can i extract text from images": "Yes, AI OCR extracts text from images instantly.",
  "is my data private": "100% private. Everything is stored only on your device.",
  "can i generate qr codes": "Yes, built-in QR generator is included.",
  "do i need to register": "No signup required — start immediately.",
  "are there templates available": "Yes, 35 templates: festivals, quotes, events, invitations.",
  "can i save my poster": "Yes, download as Image or PDF.",
  "is aksharachitra free": "Completely free — always.",
  "does it support dark mode": "Yes, beautiful dark mode included.",
  "is aksharachitra available on mobile": "Yes, works on mobile, desktop & tablet.",
  "how to ask for help": "Use the AI chat bubble anytime."
};


// -------- 2. Find Local Answer --------
function findAnswer(query) {
  const q = query.toLowerCase();
  if (dictionary[q]) return dictionary[q];

  for (let key in dictionary) {
    if (q.includes(key)) return dictionary[key];
  }
  return null;
}


// -------- 3. IndexedDB Save/Fetch --------
function saveToDB(question, answer) {
  const req = indexedDB.open("chatbotDB", 1);

  req.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("faq")) {
      db.createObjectStore("faq", { keyPath: "question" });
    }
  };

  req.onsuccess = e => {
    const db = e.target.result;
    const tx = db.transaction("faq", "readwrite");
    tx.objectStore("faq").put({ question, answer });
  };
}

function getFromDB(query, callback) {
  const req = indexedDB.open("chatbotDB", 1);

  req.onsuccess = e => {
    const db = e.target.result;
    const tx = db.transaction("faq", "readonly");
    const store = tx.objectStore("faq");
    const request = store.get(query);

    request.onsuccess = () => {
      callback(request.result ? request.result.answer : null);
    };
  };
}


// -------- 4. Main Chat Logic (FAQ → DB → API) --------
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  const log = document.getElementById("chatLog");
  if (!text) return;

  log.innerHTML += `<b>You:</b> ${text}<br>`;
  input.value = "";

  const lowerText = text.toLowerCase();

  // Step 1 — FAQ
  const faq = findAnswer(lowerText);
  if (faq) {
    log.innerHTML += `<b>AI:</b> ${faq}<br>`;
    saveToDB(lowerText, faq);
    log.scrollTop = log.scrollHeight;
    return;
  }

  // Step 2 — IndexedDB
  getFromDB(lowerText, async (dbAnswer) => {
    if (dbAnswer) {
      log.innerHTML += `<b>AI:</b> ${dbAnswer}<br>`;
      log.scrollTop = log.scrollHeight;
      return;
    }

    try {
      // Step 3 — API Fallback
      const res = await fetch("/.netlify/functions/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();
      log.innerHTML += `<b>AI:</b> ${data.reply}<br>`;
      saveToDB(lowerText, data.reply);

    } catch (err) {
      log.innerHTML += `<b>AI:</b> Network error. Please try again.<br>`;
      console.error(err);
    }

    log.scrollTop = log.scrollHeight;
  });
}


// -------- 5. Global Key / Button Events --------

// Send on Enter
document.addEventListener("keydown", (e) => {
  const input = document.getElementById("chatInput");
  if (document.activeElement === input && e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Send on button click
document.getElementById("sendBtn").addEventListener("click", sendMessage);


// -------- 6. Chat Bubble Controls --------
const bubble = document.getElementById("chatBubble");
const windowBox = document.getElementById("chatWindow");
const closeBtn = document.getElementById("chatClose");

bubble.onclick = () => {
  windowBox.style.display = "flex";
  bubble.style.display = "none";
};

closeBtn.onclick = () => {
  windowBox.style.display = "none";
  bubble.style.display = "flex";
};

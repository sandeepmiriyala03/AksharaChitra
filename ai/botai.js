// =========================================
// AksharaChitra Chatbot – Dual Engine Version
// FAQ → IndexedDB → CloudAI → Local Web-LLM
// =========================================

// -----------------------------------------
// 1. FAQ Dictionary
// -----------------------------------------
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
  "how to ask for help": "Use the AI chat bubble anytime.",
  "hi": "Hi! How can I help you today?",
  "hello": "Hello! 😊 What would you like to know?",
  "hey": "Hey there! How can I assist you?",
  "good morning": "Good morning! 🌸 How can I help?",
  "good afternoon": "Good afternoon! What would you like to do?",
  "good evening": "Good evening! Need any help?",
  "bye": "Bye! Have a great day 😊",
  "good night": "Good night! 🌙 Take care.",
  "thanks": "You're welcome! 😊",
  "thank you": "Happy to help!",
  "ok": "Okay!",
  "okk": "Okay!",
  "k": "Sure!",
  "who are you": "I'm Akshara AI — here to help you with poster-making questions!",
  "what is your name": "I'm Akshara AI, your assistant inside AksharaChitra.",
  "help": "Sure! Ask me anything about creating posters, templates, fonts, or features.",
  "how are you": "I'm doing great! Thanks for asking 😊",
  "what are you doing": "I'm here waiting to help you!",
  "nice": "Glad you liked it! 😊",
  "super": "Thank you!",
  "awesome": "Happy to hear that! ✨",
  "who made you": "I am part of the AksharaChitra project created by Sandeep Miriyala.",
  "what can you do": "I can answer questions about AksharaChitra features, help guides, templates, fonts, and more!"
};


// -----------------------------------------
// 2. Find Local Answer (Dictionary)
// -----------------------------------------
function findAnswer(query) {
  const q = query.toLowerCase();
  if (dictionary[q]) return dictionary[q];

  for (let key in dictionary) {
    if (q.includes(key)) return dictionary[key];
  }
  return null;
}


// -----------------------------------------
// 3. IndexedDB (FAQ)
// -----------------------------------------
function openDB(callback) {
  const req = indexedDB.open("chatbotDB", 2);

  req.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains("faq")) {
      db.createObjectStore("faq", { keyPath: "question" });
    }
  };

  req.onsuccess = e => callback(e.target.result);
  req.onerror = err => console.error("IndexedDB error:", err);
}

function saveToDB(question, answer) {
  openDB(db => {
    const tx = db.transaction("faq", "readwrite");
    tx.objectStore("faq").put({ question, answer });
  });
}

function getFromDB(query, callback) {
  openDB(db => {
    const tx = db.transaction("faq", "readonly");
    const req = tx.objectStore("faq").get(query);

    req.onsuccess = () => {
      callback(req.result ? req.result.answer : null);
    };
    req.onerror = () => callback(null);
  });
}


// -----------------------------------------
// 4. Web-LLM (Local LLM)
// -----------------------------------------
let localModel = null;
let localReady = false;

// Load local model
async function loadLocalLLM() {
  engineLabel.innerHTML = "Loading Local AI... ⏳";

  const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers");

  localModel = await pipeline("text-generation", "Xenova/gpt2");
  
  localReady = true;
  engineLabel.innerHTML = "Using: <b>💻 Local AI (Web-LLM)</b> ✔ Ready";
}

loadLocalLLM();

// Local LLM reply
async function localLLMReply(msg) {
  if (!localReady) return "⏳ Local AI still loading...";
  
  const output = await localModel(msg, { max_new_tokens: 40 });
  return output[0].generated_text;
}


// -----------------------------------------
// 5. Cloud API (Grok)
// -----------------------------------------
async function cloudAI(text) {
  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) throw new Error("Network error");

    const data = await res.json();
    return data.reply;

  } catch (err) {
    return "Network error. Please try again.";
  }
}


// -----------------------------------------
// 6. Master Send Function (Dual Engine)
// -----------------------------------------
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  const log = document.getElementById("chatLog");
  const engine = document.getElementById("aiMode").value;

  if (!text) return;

  log.innerHTML += `<b>You:</b> ${text}<br>`;
  input.value = "";

  const lowerText = text.toLowerCase();


  // Step 1: FAQ
  const faq = findAnswer(lowerText);
  if (faq) {
    log.innerHTML += `<b>AI:</b> ${faq}<br>`;
    saveToDB(lowerText, faq);
    return;
  }


  // Step 2: IndexedDB
  getFromDB(lowerText, async (dbAnswer) => {
    if (dbAnswer) {
      log.innerHTML += `<b>AI:</b> ${dbAnswer}<br>`;
      return;
    }

    // Step 3: Engine selection
    let reply = "";

    if (engine === "local") {
      reply = await localLLMReply(text);
    } else {
      reply = await cloudAI(text);
    }

    log.innerHTML += `<b>AI:</b> ${reply}<br>`;
    saveToDB(lowerText, reply);
    log.scrollTop = log.scrollHeight;
  });
}


// -----------------------------------------
// 7. Event Listeners
// -----------------------------------------
document.addEventListener("keydown", (e) => {
  if (document.activeElement === chatInput && e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);


// -----------------------------------------
// 8. Chat Window Controls
// -----------------------------------------
chatBubble.onclick = () => {
  chatWindow.style.display = "flex";
  chatBubble.style.display = "none";
};

chatClose.onclick = () => {
  chatWindow.style.display = "none";
  chatBubble.style.display = "flex";
};


// -----------------------------------------
// 9. Engine Indicator Updater
// -----------------------------------------
const engineLabel = document.getElementById("engineIndicator");

document.getElementById("aiMode").addEventListener("change", function () {
  if (this.value === "cloud") {
    engineLabel.innerHTML = "Using: <b>🌐 Cloud AI (Grok)</b>";
  } else {
    engineLabel.innerHTML = "Using: <b>💻 Local AI (Web-LLM)</b>";
  }
});


// -----------------------------------------
// 10. Clear Chat Button
// -----------------------------------------
document.getElementById("clearChat").onclick = () => {
  document.getElementById("chatLog").innerHTML = "";
};

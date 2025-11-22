// =========================================
// AksharaChitra Chatbot – Dual Engine Version
// FAQ → IndexedDB → CloudAI → Local Web-LLM
// =========================================


// -----------------------------------------
// 0. DOM ELEMENTS (must be declared before use)
// -----------------------------------------
const engineLabel = document.getElementById("engineIndicator");
const chatLog = document.getElementById("chatLog");
const chatInput = document.getElementById("chatInput");
const aiMode = document.getElementById("aiMode");
const clearChatBtn = document.getElementById("clearChat");
const sendBtn = document.getElementById("sendBtn");


// -----------------------------------------
// 1. FAQ Dictionary
// -----------------------------------------
const dictionary = {
  "what is aksharachitra": "AksharaChitra is India's first AI-powered multilingual poster maker, offline and free, supporting 8 Indian languages and 52 native fonts.",
  "how to use aksharachitra": "Enter your text, select language, choose template & font, add images/QR, and generate instantly.",
  "can i use aksharachitra offline": "Yes! Works fully offline after first load as a PWA.",
  "which languages are supported": "Supported: Telugu, Hindi, Tamil, Kannada, Malayalam, Sanskrit, Odia & English.",
  "how many fonts are available": "There are 52+ built-in native Indian fonts.",
  "does it support voice input": "Yes, voice input + text-to-speech.",
  "can i extract text from images": "Yes, AI OCR extracts text instantly.",
  "is my data private": "100% private. Everything stays on your device.",
  "can i generate qr codes": "Yes, built-in QR generator available.",
  "do i need to register": "No signup required.",
  "are there templates available": "Yes, festival, quotes, event templates.",
  "can i save my poster": "Yes, download as Image or PDF.",
  "is aksharachitra free": "Completely free.",
  "does it support dark mode": "Yes, beautiful dark mode included.",
  "is aksharachitra available on mobile": "Yes, mobile + desktop + tablet.",
  "how to ask for help": "Use the AI chat bubble anytime.",
  "hi": "Hi! How can I help you?",
  "hello": "Hello! 😊 What would you like to know?",
  "hey": "Hey there! How can I assist you?",
  "good morning": "Good morning! 🌸",
  "good afternoon": "Good afternoon!",
  "good evening": "Good evening!",
  "bye": "Bye! Have a great day 😊",
  "good night": "Good night! 🌙",
  "thanks": "You're welcome! 😊",
  "thank you": "Happy to help!",
  "ok": "Okay!",
  "k": "Sure!",
  "who are you": "I'm Akshara AI — your assistant!",
  "what is your name": "I'm Akshara AI.",
  "help": "Ask me anything about posters, fonts, OCR or templates.",
  "who made you": "I am part of the AksharaChitra project created by Sandeep Miriyala.",
  "what can you do": "I answer questions about AksharaChitra features."
};


// -----------------------------------------
// 2. Find Local Answer (dictionary)
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
// 3. IndexedDB (FAQ Cache)
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
}

function saveToDB(question, answer) {
  openDB(db => {
    db.transaction("faq", "readwrite")
      .objectStore("faq")
      .put({ question, answer });
  });
}

function getFromDB(query, callback) {
  openDB(db => {
    const req = db.transaction("faq", "readonly")
      .objectStore("faq")
      .get(query);

    req.onsuccess = () => {
      callback(req.result ? req.result.answer : null);
    };
  });
}


// -----------------------------------------
// 4. Web-LLM (Local AI)
// -----------------------------------------
let localModel = null;
let localReady = false;

async function loadLocalLLM() {
  engineLabel.innerHTML = "Loading Local AI... ⏳";

  const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers");

  localModel = await pipeline("text-generation", "Xenova/gpt2");
  localReady = true;

  engineLabel.innerHTML = "Using: <b>💻 Local AI (Web-LLM)</b> ✔ Ready";
}

loadLocalLLM();

async function localLLMReply(msg) {
  if (!localReady) return "⏳ Local AI loading...";
  const out = await localModel(msg, { max_new_tokens: 40 });
  return out[0].generated_text;
}


// -----------------------------------------
// 5. Cloud AI (Grok)
// -----------------------------------------
async function cloudAI(text) {
  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) throw new Error("Network error");
    return (await res.json()).reply;

  } catch (err) {
    return "🌐 Network error. Please try again.";
  }
}


// -----------------------------------------
// 6. Master Message Handler
// -----------------------------------------
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatLog.innerHTML += `<b>You:</b> ${text}<br>`;
  chatInput.value = "";

  const lower = text.toLowerCase();

  // Step 1 – Dictionary
  const faq = findAnswer(lower);
  if (faq) {
    chatLog.innerHTML += `<b>AI:</b> ${faq}<br>`;
    saveToDB(lower, faq);
    chatLog.scrollTop = chatLog.scrollHeight;
    return;
  }

  // Step 2 – IndexedDB exact match
  getFromDB(lower, async (dbAnswer) => {
    if (dbAnswer) {
      chatLog.innerHTML += `<b>AI:</b> ${dbAnswer}<br>`;
      chatLog.scrollTop = chatLog.scrollHeight;
      return;
    }

    // Step 3 – Engine Selection
    const reply = (aiMode.value === "local")
      ? await localLLMReply(text)
      : await cloudAI(text);

    chatLog.innerHTML += `<b>AI:</b> ${reply}<br>`;
    saveToDB(lower, reply);

    chatLog.scrollTop = chatLog.scrollHeight;
  });
}


// -----------------------------------------
// 7. UI Event Listeners
// -----------------------------------------
sendBtn.addEventListener("click", sendMessage);

document.addEventListener("keydown", e => {
  if (document.activeElement === chatInput && e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});


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
// 9. Engine Mode Indicator
// -----------------------------------------
aiMode.addEventListener("change", () => {
  engineLabel.innerHTML =
    aiMode.value === "cloud"
      ? "Using: <b>🌐 Cloud AI (Grok)</b>"
      : "Using: <b>💻 Local AI (Web-LLM)</b>";
});


// -----------------------------------------
// 10. Clear Chat
// -----------------------------------------
clearChatBtn.onclick = () => {
  chatLog.innerHTML = "";
};

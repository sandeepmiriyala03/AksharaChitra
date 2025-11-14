document.getElementById("aiTranslateBtn").onclick = async () => {
  const input = aiInputText.value.trim();
  const target = aiTargetLang.value;

  if (!input) {
    aiOutputText.value = "Please enter text.";
    return;
  }

  // ---- SAFETY CHECK ----
  if (!window.ai || !window.ai.languageModel) {
    aiOutputText.value =
      "❌ Browser AI not supported.\nUse Chrome 123+ or enable Experimental Web Platform Features.";
    return;
  }

  try {
    // Create session
    const session = await window.ai.languageModel.create({
      model: "text",     // ✔ fallback for most devices
      systemPrompt: "You are a translation engine."
    });

    const prompt = `Translate the following text into ${target}:\n${input}`;

    // send request
    const result = await session.prompt(prompt);

    aiOutputText.value = result;
  } catch (err) {
    aiOutputText.value = "⚠️ Error: " + err.message;
  }
};

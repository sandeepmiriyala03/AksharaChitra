export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : (event.body || {});
    const { message } = body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: data.choices?.[0]?.message?.content ?? "No reply from AI."
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "AI error: " + err.message })
    };
  }
};

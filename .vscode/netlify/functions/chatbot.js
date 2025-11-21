import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body || "{}");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_GROQ_API_KEY"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: data.choices[0].message.content
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "AI error: " + err.message })
    };
  }
};
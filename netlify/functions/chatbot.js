export const handler = async (event) => {
  try {
    // Parse POST JSON body
    const body = event.body ? JSON.parse(event.body) : {};
    const message = body.message;

    // Input validation
    if (!message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: "Missing 'message' in request body" })
      };
    }

    // Secure: Check for API key in Netlify environment
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set");
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: "GROQ_API_KEY is not set" })
      };
    }

    // Call Groq OpenAI-compatible endpoint
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message }
          ]
        })
      }
    );

    // Handle Groq errors
    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error", response.status, errText);
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: `Groq error ${response.status}: ${errText}` })
      };
    }

    // Parse Groq's reply
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No reply from AI.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    // Any unexpected error
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: "AI error: " + err.message })
    };
  }
};

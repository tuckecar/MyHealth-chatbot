import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Critical: Check if the API Key exists before the server starts
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing from your environment variables!");
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Error: No message provided." });
  }

  console.log("📩 Incoming message:", message);

  try {
    // UPDATED: Using the Gemini 3 Flash Preview model name and v1beta endpoint
    const modelId = "gemini-3-flash-preview"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `You are a helpful health assistant. Respond clearly and briefly.\n\nUser: ${message}` }]
          }
        ],
        // Optional: Adding generation config for better stability
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      })
    });

    const data = await response.json();

    // Check if the Google API returned an error
    if (data.error) {
      console.error("❌ Google API Error:", data.error.message);
      return res.status(data.error.code || 500).json({ 
        reply: "The AI is currently unavailable.",
        debug: data.error.message 
      });
    }

    // Extract the text safely from the new Gemini 3 response structure
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    
    console.log("🤖 Gemini Response Sent.");
    res.json({ reply });

  } catch (error) {
    console.error("❌ Server Crash Error:", error.message);
    res.status(500).json({ reply: "Internal server error." });
  }
});

// Use Render's dynamic port or default to 3000 for local testing
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});
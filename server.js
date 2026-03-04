import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import fetch from "node-fetch"; // Uncomment this if you are on Node v16 or lower

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Check for API key on startup
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in environment variables.");
}

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Error: No message provided." });
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a helpful health assistant. Respond briefly.\n\nUser: ${message}` }] }]
      })
    });

    const data = await response.json();

    // If Google returns an error (like 400 or 429), catch it here
    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(data.error.code || 500).json({ reply: "AI Error: " + data.error.message });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply });

  } catch (error) {
    console.error("Server Crash Error:", error);
    res.status(500).json({ reply: "Server internal error." });
  }
});

const PORT = process.env.PORT || 3000;
// Using "0.0.0.0" is essential for Render to map the internal port correctly
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
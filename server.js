import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  console.log("Incoming message:", message);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful health assistant.\n\nUser: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from model.";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ reply: "AI service unavailable." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
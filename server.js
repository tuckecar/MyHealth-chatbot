import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ reply: "Please enter a message." });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      `You are a helpful health assistant. Answer clearly and briefly.\n\nUser: ${message}`
    );

    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ reply: "AI service unavailable." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
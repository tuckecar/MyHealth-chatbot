import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch(
  "https://router.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: `<s>[INST] You are a helpful health assistant. ${message} [/INST]`,
    }),
  }
);

    const data = await response.json();

    console.log("HF RESPONSE:", data);

    const aiReply =
      data?.[0]?.generated_text || "No response from model.";

    res.json({ reply: aiReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "AI service unavailable." });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
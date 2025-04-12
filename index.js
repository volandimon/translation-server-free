import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/translate", async (req, res) => {
  const { texts, from, to } = req.body;

  if (!Array.isArray(texts) || !from || !to) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const results = await Promise.all(
      texts.map(async (text) => {
        const response = await fetch("https://libretranslate.com/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            source: from,
            target: to,
            format: "text"
          })
        });
        const data = await response.json();
        return data.translatedText;
      })
    );

    res.json({ translations: results });
  } catch (err) {
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

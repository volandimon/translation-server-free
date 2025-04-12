import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/translate", async (req, res) => {
  const { texts, from, to } = req.body;

  console.log("Received request:", { texts, from, to });

  if (!Array.isArray(texts) || !from || !to) {
    console.error("❌ Invalid request: Missing or invalid parameters.");
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const results = await Promise.all(
      texts.map(async (text) => {
        console.log(`Translating: "${text}"`);

        try {
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
          
          if (!data.translatedText) {
            console.error(`❌ Translation failed for "${text}". Response:`, data);
            return null;
          }

          console.log(`✔️ Translated "${text}" → "${data.translatedText}"`);
          return data.translatedText;
        } catch (err) {
          console.error(`❌ Error translating "${text}":`, err.message);
          return null;
        }
      })
    );

    res.json({ translations: results });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ error: "Translation failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = 'a41e9b44-e608-4253-80c2-8f1d388b52fc:fx';

app.use(cors());
app.use(express.json());

app.post("/translate", async (req, res) => {
  const { texts, from, to } = req.body;

  console.log("Received request:", { texts, from, to });

  if (!Array.isArray(texts) || !from || !to) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    const results = await Promise.all(
      texts.map(async (text) => {
        console.log(`Translating: "{text}"`);

        try {
          const response = await fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization": `DeepL-Auth-Key ${API_KEY}`
            },
            body: new URLSearchParams({
              text,
              source_lang: from.toUpperCase(),
              target_lang: to.toUpperCase()
            })
          });

          const data = await response.json();

          if (!data.translations || !data.translations[0]) {
            console.error(`❌ Translation failed for "{text}". Response:`, data);
            return null;
          }

          console.log(`✔️ Translated "{text}" → "{data.translations[0].text}"`);
          return data.translations[0].text;
        } catch (err) {
          console.error(`❌ Error translating "{text}":`, err.message);
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

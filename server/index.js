// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('❌ Missing GROQ_API_KEY in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// 用 Groq API，和 OpenAI SDK 相同，只是 baseURL 不同
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const MODEL = "llama-3.1-8b-instant";

app.get('/health', (req, res) => {
  res.json({ ok: true, model: MODEL, time: new Date().toISOString() });
});

app.post('/api/compare', async (req, res) => {
  const items = (req.body?.items || []).map(s => String(s).trim()).filter(Boolean).slice(0, 10);
  if (!items.length) return res.status(400).json({ error: 'items is required' });

  try {
    const prompt = `
Compare the following items: ${items.join(", ")}.

Return ONLY valid JSON in this format:
{
  "criteria": ["pros","cons","summary","price","size","weight","popularity","rating"],
  "table": [
    { 
      "item": "string", 
      "pros": ["string"...], 
      "cons": ["string"...], 
      "summary": "string",
      "price": "string",
      "size": "string",
      "weight": "string",
      "popularity": "string",
      "rating": "string"
    }
  ],
  "recommendation": { "winner": "string", "reason": "string" }
}

Rules:
- Always include all criteria fields, even if you estimate values.
- "price": approximate cost (e.g. "$999", "Affordable", "N/A").
- "size": approximate dimensions or capacity (e.g. "13-inch", "Medium", "N/A").
- "weight": approximate weight (e.g. "1.3kg", "Light", "N/A").
- "popularity": qualitative or 1–10 scale (e.g. "8/10", "Popular", "N/A").
- "rating": user rating 1–5 stars (e.g. "4.5/5", "★★★★☆", "N/A").
- Pros/cons should be concise bullet phrases.
- recommendation.winner must be one of the input items.
- Do not include any explanation outside the JSON.
`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      temperature: 0.6,
      messages: [
        { role: "system", content: "You are a strict comparison assistant. Always output JSON only, no text outside JSON." },
        { role: "user", content: prompt }
      ]
    });

    const content = completion.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content);

    res.json(parsed);
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ error: "Groq AI generation failed", detail: String(err.message || err) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✅ Groq server running at http://localhost:${PORT}`));

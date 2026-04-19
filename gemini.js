const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

router.post('/analyze-spending', async (req, res) => {
  const transactions = req.body.transactions || [];
  const prompt = `
You are a friendly, non-judgmental financial literacy coach.

Here are the user's last 90 days of transactions (JSON):
${JSON.stringify(transactions, null, 2)}

Please do the following in plain English — no financial jargon:
1. Summarize overall spending behavior in 2-3 sentences.
2. List the top 3 spending categories with approximate totals.
3. Flag any recurring charges over $10/month.
4. Note roughly how much is going toward interest or fees.
5. End with 2-3 specific questions the user should ask their credit union.

Be encouraging and supportive throughout.
`;
  try {
    const result = await model.generateContent(prompt);
    res.json({ analysis: result.response.text() });
  } catch (err) {
    console.error('analyze-spending error', err.message);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});

router.post('/decode-jargon', async (req, res) => {
  const { term, accountContext } = req.body;
  const prompt = `
Explain the financial term "${term}" to someone with no financial background.
${accountContext ? `Context about this user's account: ${accountContext}` : ''}

Include:
1. A plain-English definition (2-3 sentences max).
2. Why this term matters for them personally.
3. One specific question they should ask their credit union about it.
`;
  try {
    const result = await model.generateContent(prompt);
    res.json({ explanation: result.response.text() });
  } catch (err) {
    console.error('decode-jargon error', err.message);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});

router.post('/chat', async (req, res) => {
  const { messages, accountSummary } = req.body;
  const systemPrompt = `
You are Alex, a friendly and knowledgeable credit union advisor at Acentra Credit Union.
${accountSummary ? `User account summary: ${JSON.stringify(accountSummary)}` : ''}

Rules:
- Keep each response to 3-5 sentences max.
- Always end with one follow-up question or a concrete next step.
- Never give specific legal or tax advice — refer to professionals for those.
- Gently encourage the user to speak with a real advisor when appropriate.
`;
  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: "Understood. I'm ready to help as Alex." }] },
      ...messages.slice(0, -1).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ],
  });
  try {
    const result = await chat.sendMessage(messages.at(-1).content);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('chat error', err.message);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});
// This stays in memory for the duration of the session
let cachedNCUAData = null;

/**
 * Call this ONCE when the app starts
 */
export async function initNCUAData() {
    if (cachedNCUAData) return cachedNCUAData;

    const targetUrl = "https://ncua.gov/analysis/cuso-economic-data/credit-union-bank-rates";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const json = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(json.contents, 'text/html');
        const rows = Array.from(doc.querySelectorAll('table tr'));

        cachedNCUAData = rows.map(row => {
            const cells = row.querySelectorAll('td');
            return {
                product: cells[0]?.innerText.trim(),
                cu_rate: parseFloat(cells[1]?.innerText),
                bank_rate: parseFloat(cells[2]?.innerText)
            };
        }).filter(item => item.product && !isNaN(item.cu_rate));

        console.log("NCUA Data cached successfully.");
        return cachedNCUAData;
    } catch (err) {
        console.error("Failed to fetch NCUA data:", err);
        return null;
    }
}

export async function predictFuture( advanceTime) {
    // 1. Construct the prompt with passed-in variables
    const prompt = `Context: I am providing historical data from the NCUA. ` +
    `Data: ${JSON.stringify(cachedNCUAData)}. ` +
    `Task: Analyze auto and mortgage loan trends. Predict changes over ${advanceTime} years. ` +
    `Return JSON: { "inflationRate": float, "marketRate": float, "recessionProbability": float }`;
    
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json'
                }
            })
        });

        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) throw new Error("No response from AI");

        return JSON.parse(rawText); // Just return the object
    } catch (error) {
        console.error("Prediction fetch failed:", error);
        return null;
    }
}

module.exports = router;

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

//Route for generating AI tips based on user data
router.post("/generate-tips", async (req, res) => {
    try {
        const { userData, typicalData } = req.body;

        // 1. Construct the prompt on the server for security
        // Construct a structured prompt for 2.5-flash
        const prompt = `
            Context: Financial Simulation Results
            User Income: $${userData.monthlyIncome}
            
            Current Spending vs Recommended (50/30/20):
            - Needs: $${userData.userNeeds} (Goal: $${typicalData.needs})
            - Wants: $${userData.userWants} (Goal: $${typicalData.wants})
            - Savings: $${userData.userSavings} (Goal: $${typicalData.savings})

            Task: Provide exactly 3 short, actionable financial tips based on the data above.
            Constraints:
            - Focus on the category with the largest overspend.
            - Keep each tip under 15 words.
            - Do not use markdown (no asterisks, no bolding).
            - Return only the tips as a plain text list.
        `;

        // 2. Call the Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // 3. Send the result back to the frontend
        res.json({ advice: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate tips" });
    }
});

module.exports = router;



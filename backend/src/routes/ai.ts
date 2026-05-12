import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const ANTHROPIC_READY = !!process.env.ANTHROPIC_API_KEY;

const anthropic = ANTHROPIC_READY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const buildSystemPrompt = (userContext: any) => `
You are SANO AI, a caring skin health assistant built for Ghanaian and African users.

User: ${userContext?.name ?? 'Abena'}, Fitzpatrick ${userContext?.fitzpatrick ?? 'V'}, concern: ${userContext?.primaryConcern ?? 'hyperpigmentation'}, Glow Score: ${userContext?.glowScore ?? 74}/100, Cycle Day: ${userContext?.cycleDay ?? 22}, Region: ${userContext?.region ?? 'Greater Accra'}.

Rules:
- Speak warmly and personally. Reference their scan data.
- Recommend products from Ghana: Ernest Chemists (Osu), Entrance Pharmacy, Melcom.
- For serious symptoms: always recommend seeing a doctor.
- Keep responses to 3–4 sentences unless more is genuinely needed.
- Use occasional gentle emojis. Never be clinical or cold.
- You are NOT a medical doctor. Never diagnose. Always suggest.
`.trim();

router.post('/chat', async (req, res) => {
  const { message, history = [], userContext = {} } = req.body;

  if (!ANTHROPIC_READY || !anthropic) {
    return res.json({
      response: 'AI chat not yet configured. Add ANTHROPIC_API_KEY to activate Claude.',
      demo: true,
    });
  }

  try {
    const messages = [
      ...history.map((h: any) => ({ role: h.me ? 'user' : 'assistant', content: h.txt })),
      { role: 'user', content: message },
    ];

    const result = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      system: buildSystemPrompt(userContext),
      messages,
    });

    res.json({ response: result.content[0].text });
  } catch (err: any) {
    res.status(500).json({
      error: 'AI service error',
      response: 'I had trouble responding. Please try again.',
    });
  }
});

export default router;

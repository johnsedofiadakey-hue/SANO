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

    const block = result.content[0];
    if (block.type === 'text') {
      res.json({ response: block.text });
    } else {
      res.json({ response: 'I received a non-text response from the AI.' });
    }
  } catch (err: any) {
    res.status(500).json({
      error: 'AI service error',
      response: 'I had trouble responding. Please try again.',
    });
  }
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://sano-1.onrender.com';

router.post('/heartrate', async (req, res) => {
  const { video_base64 } = req.body;

  if (!video_base64) {
    return res.status(400).json({ error: 'No video provided' });
  }

  try {
    console.log(`Forwarding vitals to AI service at ${AI_SERVICE_URL}/analyze/heartrate`);
    
    const params = new URLSearchParams();
    params.append('video_base64', video_base64);

    const response = await fetch(`${AI_SERVICE_URL}/analyze/heartrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-AI-Secret-Token': process.env.AI_SERVICE_SECRET || '',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI service error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error in /ai/heartrate:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.post('/routine', async (req, res) => {
  const { condition, userContext = {} } = req.body;

  if (!ANTHROPIC_READY || !anthropic) {
    return res.json({
      routine: [
        { id: '1', name: 'Gentle Cleanser', brand: 'CeraVe', step: 1, emoji: '🧴', pharmacies: ['Ernest Chemists'] },
        { id: '2', name: 'Moisturiser SPF 50+', brand: 'Neutrogena', step: 2, emoji: '☀️', pharmacies: ['Melcom'] },
      ],
      demo: true,
    });
  }

  try {
    const prompt = `
Generate a personalized skincare routine for a user with the following profile:
Name: ${userContext.name || 'Abena'}
Fitzpatrick Tone: ${userContext.fitzpatrick || 'V'}
Skin Type: ${userContext.skinType || 'combination'}
Primary Concern: ${condition || 'healthy skin'}

The routine should have 3 to 5 steps.
For each step, provide:
- name: Product name
- brand: Suggested brand (accessible in Ghana)
- step: Step number (1, 2, 3...)
- emoji: A relevant emoji
- conflict: Any usage warnings (optional)
- pharmacies: List of pharmacies in Accra where it can be found (choose from: Ernest Chemists, Entrance Pharmacy, Melcom).

Return the response as a JSON array of objects matching this interface:
interface RoutineProduct {
  id: string;
  name: string;
  brand: string;
  step: number;
  emoji: string;
  conflict?: string;
  pharmacies: string[];
}

Return ONLY the JSON array. No markdown formatting, no explanation.
`.trim();

    const result = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: 'You are a skincare expert. Return ONLY valid JSON array.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = result.content[0];
    if (content.type === 'text') {
      const jsonText = content.text.trim().replace(/```json\n?|```/g, '');
      const routine = JSON.parse(jsonText);
      res.json({ routine });
    } else {
      res.status(500).json({ error: 'AI returned non-text content' });
    }
  } catch (error: any) {
    console.error('Error in /ai/routine:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

router.post('/foundation', async (req, res) => {
  const { fitzpatrick, undertone } = req.body;

  if (!ANTHROPIC_READY || !anthropic) {
    return res.json({
      matches: [
        { brand: 'Fenty Beauty', shade: '420', code: '420', match_confidence: 0.95, swatch_hex: '#8B5E3C', available_accra: false },
        { brand: 'Black Opal', shade: 'Hazelnut', code: 'HZ', match_confidence: 0.92, swatch_hex: '#7A4428', available_accra: true, accra_store: 'Ernest Chemists' },
      ],
      demo: true,
    });
  }

  try {
    const prompt = `
Generate foundation shade matches for a user with:
Fitzpatrick Tone: ${fitzpatrick || 'V'}
Undertone: ${undertone || 'neutral'}

Suggest 3 to 4 brands available in Ghana (e.g., Fenty Beauty, MAC, L'Oreal, Black Opal).
For each match, provide:
- brand: Brand name
- shade: Shade name/number
- code: Shade code
- match_confidence: Float between 0.8 and 1.0
- swatch_hex: Hex color code for the shade
- available_accra: Boolean
- accra_store: Store name (optional)

Return the response as a JSON array of objects matching this interface:
interface FoundationMatch {
  brand: string;
  shade: string;
  code: string;
  match_confidence: number;
  swatch_hex: string;
  available_accra: boolean;
  accra_store?: string;
}

Return ONLY the JSON array. No markdown formatting, no explanation.
`.trim();

    const result = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: 'You are a makeup expert. Return ONLY valid JSON array.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = result.content[0];
    if (content.type === 'text') {
      const jsonText = content.text.trim().replace(/```json\n?|```/g, '');
      const matches = JSON.parse(jsonText);
      res.json({ matches });
    } else {
      res.status(500).json({ error: 'AI returned non-text content' });
    }
  } catch (error: any) {
    console.error('Error in /ai/foundation:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

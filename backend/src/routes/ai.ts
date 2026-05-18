import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const ANTHROPIC_READY = !!process.env.ANTHROPIC_API_KEY;

const anthropic = ANTHROPIC_READY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const buildSystemPrompt = (userContext: any) => `
You are SANO AI, a caring skin health assistant built for Ghanaian and African users.

User: ${userContext?.userName ?? userContext?.name ?? 'the user'}, Fitzpatrick ${userContext?.fitzpatrick ?? 'unknown'}, concern: ${userContext?.skinConcerns?.[0] ?? userContext?.primaryConcern ?? 'general skincare'}, Glow Score: ${userContext?.glowScore ?? 'not yet measured'}/100, Cycle Day: ${userContext?.cycleDay ?? 'not tracked'}, Region: ${userContext?.region ?? 'Ghana'}${userContext?.heartRate ? `, Heart Rate: ${userContext.heartRate} BPM` : ''}.

Rules:
- Speak warmly and personally. Reference their scan data and health metrics when relevant.
- Recommend products from Ghana: Ernest Chemists (Osu), Entrance Pharmacy, Melcom.
- For serious symptoms: always recommend seeing a doctor.
- Keep responses to 3–4 sentences unless more is genuinely needed.
- Use occasional gentle emojis. Never be clinical or cold.
- You are NOT a medical doctor. Never diagnose. Always suggest.
`.trim();

router.post('/chat', async (req, res) => {
  const { message, history = [], userContext = {}, context = {} } = req.body;
  const finalContext = { ...userContext, ...context };

  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'message too long (max 2000 characters)' });
  }
  if (!Array.isArray(history) || history.length > 30) {
    return res.status(400).json({ error: 'history must be an array with at most 30 messages' });
  }

  if (!ANTHROPIC_READY || !anthropic) {
    return res.json({
      response: 'AI chat not yet configured. Add ANTHROPIC_API_KEY to activate Claude.',
      demo: true,
    });
  }

  try {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.map((h: any) => ({
        role: (h.me ? 'user' : 'assistant') as 'user' | 'assistant',
        content: String(h.txt ?? ''),
      })),
      { role: 'user', content: message },
    ];

    const result = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: buildSystemPrompt(finalContext),
      messages,
    });

    const block = result.content[0];
    if (block.type === 'text') {
      res.json({ response: block.text });
    } else {
      res.json({ response: 'I received a non-text response from the AI.' });
    }
  } catch (err: any) {
    console.error('[AI /chat] Anthropic error:', err?.status, err?.message);
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
    console.error('Vitals AI service failed or timed out:', error.message);
    res.status(503).json({
      error: 'Heart rate service unavailable',
      message: 'Analysis failed. Please try again — hold your finger still over the camera lens.',
    });
  }
});

router.post('/routine', async (req, res) => {
  const { condition, userContext = {} } = req.body;

  if (condition !== undefined && (typeof condition !== 'string' || condition.length > 200)) {
    return res.status(400).json({ error: 'condition must be a string under 200 characters' });
  }

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
Name: the user
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
      model: 'claude-sonnet-4-6',
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

  if (fitzpatrick !== undefined && (typeof fitzpatrick !== 'number' || fitzpatrick < 1 || fitzpatrick > 6)) {
    return res.status(400).json({ error: 'fitzpatrick must be a number between 1 and 6' });
  }
  const VALID_UNDERTONES = ['warm', 'cool', 'neutral', 'olive', undefined, null, ''];
  if (!VALID_UNDERTONES.includes(undertone)) {
    return res.status(400).json({ error: 'Invalid undertone' });
  }

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
      model: 'claude-sonnet-4-6',
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

router.post('/product', async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'product name is required' });
  }
  if (name.length > 200) {
    return res.status(400).json({ error: 'product name too long (max 200 characters)' });
  }

  if (!ANTHROPIC_READY || !anthropic) {
    return res.json({
      product: {
        name: name || 'The Ordinary Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        barcode: '769915191076',
        authentic: true,
        compatibility: 82,
        ingredients: [
          { name: 'Niacinamide', purpose: 'Brightening, pore minimising', rating: 'safe', forDarkSkin: 'Excellent for hyperpigmentation on dark skin' },
          { name: 'Zinc PCA', purpose: 'Oil control, anti-inflammatory', rating: 'safe' },
          { name: 'Aqua (Water)', purpose: 'Solvent', rating: 'safe' },
          { name: 'Phenoxyethanol', purpose: 'Preservative', rating: 'caution' },
        ],
      },
      demo: true,
    });
  }

  try {
    const prompt = `
Analyze the skincare product named "${name}".
Provide:
- name: Product name
- brand: Brand name
- barcode: A fake or real barcode if you know it
- authentic: true
- compatibility: Float between 50 and 100
- ingredients: Array of objects with:
  - name: Ingredient name
  - purpose: Purpose
  - rating: 'safe' | 'caution' | 'avoid'
  - forDarkSkin: Custom note if good or bad for dark skin (optional)

Return the response as a JSON object matching this interface:
interface ProductAnalysis {
  name: string;
  brand: string;
  barcode: string;
  authentic: boolean;
  compatibility: number;
  ingredients: {
    name: string;
    purpose: string;
    rating: 'safe' | 'caution' | 'avoid';
    forDarkSkin?: string;
  }[];
}

Return ONLY the JSON object. No markdown formatting, no explanation.
`.trim();

    const result = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are a cosmetic chemist. Return ONLY valid JSON object.',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = result.content[0];
    if (content.type === 'text') {
      const jsonText = content.text.trim().replace(/```json\n?|```/g, '');
      const product = JSON.parse(jsonText);
      res.json({ product });
    } else {
      res.status(500).json({ error: 'AI returned non-text content' });
    }
  } catch (error: any) {
    console.error('Error in /ai/product:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

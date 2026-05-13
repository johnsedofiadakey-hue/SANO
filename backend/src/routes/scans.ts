import express from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const ANTHROPIC_READY = !!process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_READY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://sano-1.onrender.com';

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const bodyArea = req.body.body_area;

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageBase64 = file.buffer.toString('base64');

    // If Anthropic is ready, use Claude Vision!
    if (ANTHROPIC_READY && anthropic) {
      console.log('Using Claude Vision for skin analysis...');
      try {
        const result = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          system: 'You are a dermatologist AI. Analyze the image and return ONLY a JSON object matching this schema: { "scan_id": "string", "conditions": [ { "name": "string", "location": "string", "severity": 0.0-1.0, "confidence": 0.0-1.0, "doctor_confirmed": false } ], "skin_tone": 1-6, "model_version": "claude-3.5-sonnet", "processing_time_ms": 0 }',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: imageBase64,
                  },
                },
                {
                  type: 'text',
                  text: `Analyze this skin image of the ${bodyArea}. Return the results in the requested JSON format.`,
                },
              ],
            },
          ],
        });

        const block = result.content[0];
        if (block.type === 'text') {
          // Extract JSON from text (sometimes Claude wraps it in ```json)
          const text = block.text;
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            data.scan_id = `claude_scan_${Date.now()}`;
            data.processing_time_ms = 1000; // Fake it for now
            return res.json(data);
          }
        }
        throw new Error('Claude did not return valid JSON');
      } catch (err: any) {
        console.error('Claude Vision failed:', err);
        // Fallback to AI service or mock if Claude fails!
      }
    }

    // Fallback to AI service
    console.log(`Forwarding scan to AI service at ${AI_SERVICE_URL}/analyze/skin`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

    const response = await fetch(`${AI_SERVICE_URL}/analyze/skin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AI-Secret-Token': process.env.AI_SERVICE_SECRET || '',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        area: bodyArea,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI service error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('AI service timeout');
      return res.status(504).json({ error: 'Gateway Timeout', message: 'AI service took too long to respond.' });
    }
    console.error('Error in /scans/upload:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

import express from 'express';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://sano-1.onrender.com';

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const bodyArea = req.body.body_area;

    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageBase64 = file.buffer.toString('base64');

    console.log(`Forwarding scan to AI service at ${AI_SERVICE_URL}/analyze/skin`);

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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI service error: ${response.status}`, errorText);
      return res.status(response.status).json({ error: 'AI service error', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error('Error in /scans/upload:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;

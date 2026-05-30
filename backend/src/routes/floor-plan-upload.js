import { Router } from 'express';
import multer from 'multer';

const router = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_PDF_TYPE = 'application/pdf';

// Use memory storage for multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE }
});

// POST /api/floor-plan-upload
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const imageFile = req.files?.image?.[0];
    const pdfFile = req.files?.pdf?.[0];

    // Validate image
    if (imageFile) {
      if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.mimetype)) {
        return res.status(400).json({ success: false, error: 'Unsupported image format. Accepted: PNG, JPG, WEBP' });
      }
    }

    // Validate and process PDF
    if (pdfFile) {
      if (pdfFile.mimetype !== ACCEPTED_PDF_TYPE) {
        return res.status(400).json({ success: false, error: 'Unsupported file format. Only PDF is accepted for metadata' });
      }

      const zones = await extractZonesFromPDF(pdfFile.buffer);
      return res.json({ success: true, zones });
    }

    return res.json({ success: true, zones: [] });
  } catch (error) {
    console.error('Floor plan upload error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

async function extractZonesFromPDF(buffer) {
  const base64 = buffer.toString('base64');

  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const systemPrompt = `You are an expert floor plan analysis system for a warehouse management application.
Analyze this PDF floor plan document and extract all warehouse zones/areas.
Return ONLY a valid JSON array with no markdown formatting (no \`\`\`json blocks).
Each object in the array must have:
- id: string (unique zone identifier, e.g., "zone-a", "zone-b")
- name: string (descriptive name of the zone, e.g., "Storage Area A", "Cold Room")
- position: object with x, y, width, height as percentage values (0-100) representing the zone's position on the floor plan

Example format:
[{"id":"zone-a","name":"Storage Area A","position":{"x":10,"y":10,"width":30,"height":40}}]

If you cannot identify any zones, return an empty array [].`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: 'application/pdf', data: base64 } }
        ]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch { return []; }
    }
    return [];
  }
}

export default router;

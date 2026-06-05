import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = Router();

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
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

      console.log('--- Image File Upload Received ---');
      console.log('Originalname:', imageFile?.originalname);
      console.log('Mimetype:', imageFile?.mimetype);
      console.log('Size:', imageFile?.size);

      // Validate: at least an image must be provided
      if (!imageFile) {
        return res.status(400).json({ success: false, error: 'An image file is required (PNG, JPG, or WEBP)' });
      }

      // Validate image type / extension
      const extension = imageFile.originalname ? imageFile.originalname.split('.').pop().toLowerCase() : '';
      const isValidImage = ACCEPTED_IMAGE_TYPES.includes(imageFile.mimetype) || 
                          ['png', 'jpg', 'jpeg', 'webp'].includes(extension);

      if (!isValidImage) {
        return res.status(400).json({ success: false, error: 'Unsupported image format. Accepted: PNG, JPG, WEBP' });
      }

      // Validate PDF type if provided
      if (pdfFile && pdfFile.mimetype !== ACCEPTED_PDF_TYPE) {
      return res.status(400).json({ success: false, error: 'Unsupported file format. Only PDF is accepted for metadata' });
    }

      // Normalize mimetype for Gemini API (e.g. mapping octet-stream or image/jpg to image/jpeg)
      let normalizedMimeType = imageFile.mimetype;
      if (extension === 'jpg' || extension === 'jpeg') {
        normalizedMimeType = 'image/jpeg';
      } else if (extension === 'png') {
        normalizedMimeType = 'image/png';
      } else if (extension === 'webp') {
        normalizedMimeType = 'image/webp';
      }

      let zones;
      const userApiKey = req.headers['x-gemini-api-key'] || req.headers['x-gemini-key'];

      if (pdfFile) {
        // Enhanced zone extraction: image + PDF combined analysis
        zones = await extractZonesFromImageAndPDF(imageFile.buffer, normalizedMimeType, pdfFile.buffer, userApiKey);
      } else {
        // Image-only zone detection
        zones = await extractZonesFromImage(imageFile.buffer, normalizedMimeType, userApiKey);
      }

    return res.json({ success: true, zones });
  } catch (error) {
    console.error('Floor plan upload error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

/**
 * Get the Gemini API key from environment variables.
 * Supports both GEMINI_API_KEY and NEXT_PUBLIC_GEMINI_API_KEY.
 */
function getApiKey(userApiKey) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in environment.');
  }
  return apiKey;
}

/**
 * Parse Gemini response text into a zones array.
 */
function parseZonesFromText(text) {
  // Strip markdown code fences if present
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    // Try to extract array from object
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    // Fallback: try to find a JSON array in the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch { return []; }
    }
    return [];
  }
}

const ZONE_EXTRACTION_PROMPT = `You are an expert floor plan analysis system for a warehouse management application.
Carefully analyze this floor plan image and detect ALL distinct zones, rooms, or areas visible.

For each zone detected, determine:
1. A unique identifier based on visible labels or inferred function (e.g., "A-1", "zone-cold")
2. A descriptive name using any visible text labels, or inferred from the zone's appearance
3. The bounding box position as percentage values (0-100) of image dimensions
4. A theme color category:
   - "blue" for loading, receiving, logistics areas
   - "cyan" for cold storage, refrigerated areas
   - "purple" for preparation, tray setting areas
   - "warm" for hot processing, extraction, or dry storage
   - "green" for general production, QC, labs, offices
   - "hazard" for hazardous material storage, chemical areas
5. A symbol/icon category based on context:
   - "snowflake" for cold storage, freezing, cooling zones, or ice packing areas
   - "flame" for hot processing, baking ovens, heating zones, kitchens, or heat extraction areas
   - "door" for security checkpoints, main entrance, exit gates, lockups, or restricted zones
   - "wash" for wet areas, washing rooms, sanitation, chemical cleanup, liquids, or hydration zones
   - "machinery" for generator rooms, server hubs, conveyer belts, machine operations, or heavy tooling
   - "none" for generic dry storage, loading bays, offices, or other standard storage areas

Return ONLY a valid JSON array with no markdown formatting.
Each object must have:
- id: string (unique zone identifier)
- name: string (descriptive name)
- position: object with x, y, width, height as percentage values (0-100)
- theme: string (one of: blue, cyan, purple, warm, green, hazard)
- iconType: string (one of: snowflake, flame, door, wash, machinery, none)

Be precise with positions — they should closely match where zones appear in the image.
If you cannot identify any zones, return an empty array [].`;

const ENHANCED_ZONE_PROMPT = `You are an expert floor plan analysis system for a warehouse management application.
Analyze this floor plan image together with the accompanying PDF document for enhanced zone extraction.
The PDF may contain additional textual information about zones, labels, dimensions, or area designations that complement the visual floor plan.
Combine visual analysis of the image with textual data from the PDF to produce the most accurate zone detection.

For each zone detected, determine:
1. A unique identifier based on visible labels or inferred function
2. A descriptive name using visible text labels from image or PDF
3. The bounding box position as percentage values (0-100) of image dimensions
4. A theme color category:
   - "blue" for loading, receiving, logistics areas
   - "cyan" for cold storage, refrigerated areas
   - "purple" for preparation, tray setting areas
   - "warm" for hot processing, extraction, or dry storage
   - "green" for general production, QC, labs, offices
   - "hazard" for hazardous material storage, chemical areas
5. A symbol/icon category based on context:
   - "snowflake" for cold storage, freezing, cooling zones, or ice packing areas
   - "flame" for hot processing, baking ovens, heating zones, kitchens, or heat extraction areas
   - "door" for security checkpoints, main entrance, exit gates, lockups, or restricted zones
   - "wash" for wet areas, washing rooms, sanitation, chemical cleanup, liquids, or hydration zones
   - "machinery" for generator rooms, server hubs, conveyer belts, machine operations, or heavy tooling
   - "none" for generic dry storage, loading bays, offices, or other standard storage areas

Return ONLY a valid JSON array with no markdown formatting.
Each object must have:
- id: string (unique zone identifier)
- name: string (descriptive name)
- position: object with x, y, width, height as percentage values (0-100)
- theme: string (one of: blue, cyan, purple, warm, green, hazard)
- iconType: string (one of: snowflake, flame, door, wash, machinery, none)

Be precise with positions — they should closely match where zones appear in the image.
If you cannot identify any zones, return an empty array [].`;

/**
 * Call Gemini API with model fallback, retry for 429, and JSON format enforcement.
 */
async function getAvailableGeminiModels(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    const flashModels = (data.models || [])
      .map(m => m.name?.replace('models/', ''))
      .filter(name => name && name.includes('flash') && !name.includes('tts') && !name.includes('thinking'))
      .sort((a, b) => {
        // Prefer higher version numbers and non-lite first
        const version = n => {
          const m = n.match(/(\d+)\.(\d+)/);
          return m ? parseFloat(`${m[1]}.${m[2]}`) : 0;
        };
        const diff = version(b) - version(a);
        if (diff !== 0) return diff;
        // prefer non-lite over lite
        if (a.includes('lite') && !b.includes('lite')) return 1;
        if (!a.includes('lite') && b.includes('lite')) return -1;
        return 0;
      });
    return flashModels.length > 0 ? flashModels : null;
  } catch {
    return null;
  }
}

async function callGeminiWithFallback(contents, generationConfig = {}, userApiKey) {
  const apiKey = getApiKey(userApiKey);
  const discoveredModels = await getAvailableGeminiModels(apiKey);
  const models = discoveredModels || ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  console.log('Using Gemini models:', models);
  let lastError = null;

  for (const model of models) {
    // Retry up to 2 times for 429 rate-limit errors with exponential backoff
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              ...generationConfig,
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.status === 429 && attempt < 2) {
          // Rate limited — wait and retry same model
          const waitMs = (attempt + 1) * 5000; // 5s, 10s
          console.warn(`Model ${model} rate limited (429), retrying in ${waitMs / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error.message);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text === undefined || text === null) {
          throw new Error('Empty response');
        }

        return text;
      } catch (err) {
        console.warn(`Model ${model} failed in backend (attempt ${attempt + 1}):`, err.message);
        lastError = err;
        if (attempt < 2 && err.message?.includes('429')) {
          const waitMs = (attempt + 1) * 5000;
          await new Promise(resolve => setTimeout(resolve, waitMs));
          continue;
        }
        break; // Move to next model
      }
    }
  }

  throw new Error(`All Gemini models failed on backend. Last error: ${lastError?.message || 'Unknown'}`);
}

/**
 * Extract zones from an image using Gemini AI.
 */
async function extractZonesFromImage(imageBuffer, mimeType, userApiKey) {
  const base64Image = imageBuffer.toString('base64');
  const contents = [{
    parts: [
      { text: ZONE_EXTRACTION_PROMPT },
      { inlineData: { mimeType, data: base64Image } }
    ]
  }];

  const text = await callGeminiWithFallback(contents, {}, userApiKey);
  return parseZonesFromText(text);
}

/**
 * Extract text from a PDF buffer.
 */
async function extractTextFromPDF(pdfBuffer) {
  try {
    const array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);
    const instance = new pdfParse.PDFParse(array);
    const result = await instance.getText();
    return result.text || '';
  } catch (err) {
    console.error('Error parsing PDF text:', err);
    return '';
  }
}

/**
 * Extract zones from an image + PDF using Gemini AI for enhanced analysis.
 */
async function extractZonesFromImageAndPDF(imageBuffer, imageMimeType, pdfBuffer, userApiKey) {
  const base64Image = imageBuffer.toString('base64');
  
  // Extract text from PDF to send in prompt
  const pdfText = await extractTextFromPDF(pdfBuffer);
  
  const prompt = `${ENHANCED_ZONE_PROMPT}

Here is the textual metadata content extracted from the uploaded PDF document to assist in zone description and details:
---
${pdfText}
---`;

  const contents = [{
    parts: [
      { text: prompt },
      { inlineData: { mimeType: imageMimeType, data: base64Image } }
    ]
  }];

  const text = await callGeminiWithFallback(contents, {}, userApiKey);
  return parseZonesFromText(text);
}

export default router;

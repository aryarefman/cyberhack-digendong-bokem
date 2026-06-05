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
      const zoneList = req.body?.zoneList;

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
        // Guided zone detection using PDF text as guidance
        zones = await extractZonesFromImageAndPDF(imageFile.buffer, normalizedMimeType, pdfFile.buffer, userApiKey);
      } else if (zoneList) {
        // Guided zone detection using parsed CSV zone names/IDs as guidance
        zones = await extractZonesFromImageWithGuidance(imageFile.buffer, normalizedMimeType, zoneList, userApiKey);
      } else {
        // Pure image-only zone detection
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
function normalizeZonePosition(position) {
  if (!position) return { x: 40, y: 40, width: 20, height: 20 };
  let x = Number(position.x);
  let y = Number(position.y);
  let width = Number(position.width || position.w);
  let height = Number(position.height || position.h);

  if (isNaN(x)) x = 40;
  if (isNaN(y)) y = 40;
  if (isNaN(width)) width = 20;
  if (isNaN(height)) height = 20;

  // 1. Check if coordinates are on a 0-1 scale (all values <= 1 and at least one is > 0)
  const hasSmallVal = (x > 0 && x <= 1) || (y > 0 && y <= 1) || (width > 0 && width <= 1) || (height > 0 && height <= 1);
  const maxVal = Math.max(x, y, width, height);
  if (hasSmallVal && maxVal <= 1) {
    x = x * 100;
    y = y * 100;
    width = width * 100;
    height = height * 100;
  } else if (x > 100 || y > 100 || width > 100 || height > 100) {
    // 2. Check if coordinates are on a 0-1000 scale (any value is > 100)
    x = x / 10;
    y = y / 10;
    width = width / 10;
    height = height / 10;
  }

  // 3. Clamp values to ensure safe margins inside the 0-100 percentage canvas
  x = Math.max(0, Math.min(95, x));
  y = Math.max(0, Math.min(95, y));
  width = Math.max(5, Math.min(100 - x, width));
  height = Math.max(5, Math.min(100 - y, height));

  return {
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
    width: parseFloat(width.toFixed(2)),
    height: parseFloat(height.toFixed(2))
  };
}

function parseZonesFromText(text) {
  // Strip markdown code fences if present
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  let zones = [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) zones = parsed;
    else {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) zones = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback: try to find a JSON array in the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try { zones = JSON.parse(jsonMatch[0]); } catch {}
    }
  }

  if (Array.isArray(zones)) {
    return zones.map(z => ({
      ...z,
      position: normalizeZonePosition(z.position)
    }));
  }
  return [];
}

const ZONE_EXTRACTION_PROMPT = `You are an expert floor plan analysis system for a warehouse management application.
Carefully analyze the provided floor plan image and detect ALL distinct zones, rooms, or warehouse areas visible.

For each zone/room/area detected:
1. Identify its name/label from the text labels visible in the image (e.g. "LOADING DOCK", "Cold Storage", "QC & Lab").
2. Set its "id" to match the label or a code (e.g., "A-1", "D-1", "E-1", or matching prefix).
3. Determine its precise bounding box position as percentages (0-100) of the image's dimensions:
   - x: the horizontal start position of the zone (from the left edge of the image)
   - y: the vertical start position of the zone (from the top edge of the image)
   - width: the horizontal width of the zone
   - height: the vertical height of the zone
   
Rules for Bounding Boxes:
- Bounding boxes must correspond to the actual rooms, walls, or sections drawn on the blueprint.
- Ensure the zones DO NOT overlap each other (they should sit side by side cleanly, matching the walls in the layout).
- Be extremely precise and logical. The boxes should cover the entire warehouse sections nicely without leaving empty gaps unless it's a corridor.

4. Select a theme color category based on context:
   - "blue" for loading, receiving, logistics areas
   - "cyan" for cold storage, refrigerated areas
   - "purple" for preparation, tray setting areas
   - "warm" for hot processing, extraction, or dry storage
   - "green" for general production, QC, labs, offices
   - "hazard" for hazardous material storage, chemical areas
5. Select a symbol/icon category based on context:
   - "snowflake" for cold storage, freezing, cooling zones, or ice packing areas
   - "flame" for hot processing, baking ovens, heating zones, kitchens, or heat extraction areas
   - "door" for security checkpoints, main entrance, exit gates, lockups, or restricted zones
   - "wash" for wet areas, washing rooms, sanitation, chemical cleanup, liquids, or hydration zones
   - "machinery" for generator rooms, server hubs, conveyer belts, machine operations, or heavy tooling
   - "none" for generic dry storage, loading bays, offices, or other standard storage areas

Return ONLY a valid JSON array with no markdown formatting.
Each object must have exactly:
- id: string
- name: string
- position: { x: number, y: number, width: number, height: number }
- theme: string
- iconType: string

Example of a valid entry:
{
  "id": "D-1",
  "name": "Cold Storage Facility",
  "position": { "x": 75, "y": 10, "width": 25, "height": 60 },
  "theme": "cyan",
  "iconType": "snowflake"
}`;

const ENHANCED_ZONE_PROMPT = `You are an expert floor plan analysis system for a warehouse management application.
Analyze this floor plan image together with the accompanying PDF document for enhanced zone extraction.
The PDF may contain additional textual information about zones, labels, dimensions, or area designations that complement the visual floor plan.
Combine visual analysis of the image with textual data from the PDF to produce the most accurate zone detection.

For each zone detected, determine:
1. A unique identifier based on visible labels or inferred function
2. A descriptive name using visible text labels from image or PDF
3. The bounding box position as percentage values (0-100) of image dimensions. Bounding boxes must NOT overlap unless nested.
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
async function callGeminiWithFallback(contents, generationConfig = {}, userApiKey) {
  const apiKey = getApiKey(userApiKey);
  // Prioritize Gemini 2.5 Pro for superior spatial visual layouts, falling back to Flash models
  const models = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
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
    const instance = new pdfParse.PDFParse({ data: pdfBuffer });
    const result = await instance.getText();
    return result.text || '';
  } catch (err) {
    console.error('Error parsing PDF text:', err);
    return '';
  }
}

const GUIDED_ZONE_EXTRACTION_PROMPT = `You are an expert floor plan analysis system for a warehouse management application.
You are given a floor plan blueprint image and a list of warehouse zones to find.
Your goal is to locate each of these zones visually in the blueprint image and determine their precise layout boundaries (bounding boxes).

Instructions:
1. Scan the floor plan image for text labels, room outlines, walls, or sections that match the names/IDs in the provided list.
2. For each zone listed, find its corresponding physical room/area in the blueprint image.
3. Calculate its bounding box coordinates as percentages (0-100) of the image's dimensions:
   - x: the horizontal start position of the zone (0-100)
   - y: the vertical start position of the zone (0-100)
   - width: the width of the zone (0-100)
   - height: the height of the zone (0-100)

Rules:
- The bounding box must match the actual visual walls and boundaries of that room in the blueprint.
- Do NOT make up positions. If a zone is not visible in the blueprint, do not return it.
- Do NOT draw a rigid grid over the whole image. The coordinates should correspond precisely to the actual drawn sections in the blueprint.

Return ONLY a valid JSON array. Each object must have:
- id: string (the zone ID from the list)
- name: string (the zone name from the list)
- position: { x: number, y: number, width: number, height: number }
- theme: string (one of: blue, cyan, purple, warm, green, hazard)
- iconType: string (one of: snowflake, flame, door, wash, machinery, none)`;

/**
 * Extract zones from an image + PDF using Gemini AI for enhanced analysis.
 */
async function extractZonesFromImageAndPDF(imageBuffer, imageMimeType, pdfBuffer, userApiKey) {
  // Extract text from PDF to send in prompt
  const pdfText = await extractTextFromPDF(pdfBuffer);
  if (!pdfText) {
    console.log('No text extracted from PDF. Returning image-only zones.');
    return extractZonesFromImage(imageBuffer, imageMimeType, userApiKey);
  }

  const base64Image = imageBuffer.toString('base64');
  
  const prompt = `${GUIDED_ZONE_EXTRACTION_PROMPT}

We are looking for these specific zones in the floor plan image. Use this list of zones extracted from the PDF as guidance to find them visually on the blueprint image:
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

/**
 * Extract zones from an image guided by a parsed CSV zone list.
 */
async function extractZonesFromImageWithGuidance(imageBuffer, imageMimeType, zoneListText, userApiKey) {
  const base64Image = imageBuffer.toString('base64');
  
  const prompt = `${GUIDED_ZONE_EXTRACTION_PROMPT}

We are looking for these specific zones in the floor plan image. Use this list of zones as guidance to find them visually on the blueprint image:
---
${zoneListText}
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

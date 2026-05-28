import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ACCEPTED_PDF_TYPE = 'application/pdf';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const pdfFile = formData.get('pdf');

    // Validate image file if provided
    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Image file exceeds 10MB limit' },
          { status: 400 }
        );
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
        return NextResponse.json(
          { success: false, error: 'Unsupported image format. Accepted: PNG, JPG, WEBP' },
          { status: 400 }
        );
      }
    }

    // Validate PDF file if provided
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'PDF file exceeds 10MB limit' },
          { status: 400 }
        );
      }
      if (pdfFile.type !== ACCEPTED_PDF_TYPE) {
        return NextResponse.json(
          { success: false, error: 'Unsupported file format. Only PDF is accepted for metadata' },
          { status: 400 }
        );
      }

      // Extract zone info using Gemini AI
      const zones = await extractZonesFromPDF(pdfFile);
      return NextResponse.json({ success: true, zones });
    }

    // If only image provided (no PDF), return success with empty zones
    return NextResponse.json({ success: true, zones: [] });
  } catch (error) {
    console.error('Floor plan upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function extractZonesFromPDF(pdfFile) {
  const buffer = Buffer.from(await pdfFile.arrayBuffer());
  const base64 = buffer.toString('base64');

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyCk7MLn1egt_KdMnsaCOnh4bw1kS-B-K3I';
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

  // Clean up any markdown formatting from the response
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // Parse JSON from Gemini response
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If response contains an array within an object, try to extract it
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    // Fallback: try to find JSON array in the text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return [];
      }
    }
    return [];
  }
}

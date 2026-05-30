import { NextResponse } from 'next/server';
import { verifyJwt } from '@/utils/jwt';
import pool from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    // 1. Verify Authentication & RBAC
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyJwt(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    if (!['QC', 'PPIC', 'Admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // 2. Parse Request (Extract FormData instead of JSON)
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'Image file is required' }, { status: 400 });
    }

    // Convert the file Blob to ArrayBuffer, then to a raw Base64 string
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 3. Roboflow Serverless API Inference
    const roboflowApiKey = process.env.ROBOFLOW_API_KEY;
    if (!roboflowApiKey) {
      throw new Error('ROBOFLOW_API_KEY is not configured in .env.local');
    }

    const roboflowUrl = `https://serverless.roboflow.com/plants-diseases-detection-and-classification/12?api_key=${roboflowApiKey}`;
    
    const rfResponse = await fetch(roboflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Image,
    });

    if (!rfResponse.ok) {
      const errText = await rfResponse.text();
      console.error('Roboflow Error:', errText);
      throw new Error('Gagal menganalisis gambar dengan Roboflow API.');
    }

    const rfResult = await rfResponse.json();
    
    // Extract predictions and map class names
    let detectionsText = "No specific anomalies detected";
    let roboflowLabel = "None";
    
    if (rfResult.predictions && rfResult.predictions.length > 0) {
      // Map all detected classes into a comma-separated string
      const detectedClasses = rfResult.predictions.map(p => p.class);
      detectionsText = detectedClasses.join(', ');
      roboflowLabel = detectionsText;
    }

    // 4. Gemini Assessment via @google/genai SDK
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    
    const geminiPrompt = `You are an enterprise QC auditor for Sima Arome botanical extracts factory. The vision model detected these plant states/anomalies on the raw material: ${detectionsText}.
Rules:
1. If any toxic keywords like 'spot', 'rot', 'blight', or 'scab' are present, set 'status' to 'REJECTED'.
2. If clean or healthy, set 'status' to 'ACCEPTED'.
3. Write a professional 1-sentence engineering justification in English for the 'reason' field.
Respond ONLY with a valid JSON object matching this structure:
{ "status": "ACCEPTED" or "REJECTED", "confidence": 95.5, "reason": "Your 1-sentence report here." }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiPrompt,
    });

    let geminiText = response.text;
    geminiText = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let geminiData;
    try {
      geminiData = JSON.parse(geminiText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', geminiText);
      throw new Error('Gagal memproses response JSON dari Gemini.');
    }

    const status = geminiData.status;
    const confidence = geminiData.confidence;
    const reason = geminiData.reason;

    // 5. Database Logging
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const logDetail = `QC Inspection via Roboflow: Detected [${roboflowLabel}]. Status: ${status}. Reason: ${reason}`;

    try {
      await pool.query(
        'INSERT INTO audit_logs (timestamp, username, role, action, detail, module) VALUES ($1, $2, $3, $4, $5, $6)',
        [timestamp, user.name, user.role, 'AI Inspection', logDetail, 'QC Vision']
      );
    } catch (dbError) {
      console.error('Error logging to database:', dbError);
    }

    // 6. Return Response
    return NextResponse.json({
      success: true,
      status: status,
      confidence: confidence,
      reason: reason,
      roboflowLabel: roboflowLabel
    });

  } catch (error) {
    console.error('QC Vision API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Image Report Analysis (MedScan) - Gemini proxy (JWT protected)
 *
 * Security: calls Gemini from backend so API key is not exposed to browser.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function extractJson(text) {
  if (!text || typeof text !== 'string') return null;

  let t = text.trim();
  t = t.replace(/```json/gi, '```').replace(/```/g, '').trim();

  if (t.startsWith('{') && t.endsWith('}')) return t;
  if (t.startsWith('[') && t.endsWith(']')) return t;

  const objStart = t.indexOf('{');
  if (objStart !== -1) {
    let depth = 0;
    for (let i = objStart; i < t.length; i++) {
      const ch = t[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth === 0) return t.slice(objStart, i + 1);
    }
  }

  const arrStart = t.indexOf('[');
  if (arrStart !== -1) {
    let depth = 0;
    for (let i = arrStart; i < t.length; i++) {
      const ch = t[i];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      if (depth === 0) return t.slice(arrStart, i + 1);
    }
  }

  return null;
}

// @route   POST /api/report-image
// @body    { data: base64, type: mimeType }
router.post(
  '/',
  protect,
  [
    body('data').isString().notEmpty().withMessage('Image data required'),
    body('type').isString().notEmpty().withMessage('Mime type required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const systemPrompt = `
You are a professional medical report analysis assistant. Your task is to extract data from medical test images and provide a structured JSON response.

Analyze the image and return a JSON object with this exact structure:
{
  "overview": {
    "patientName": "Extracted name or 'Not specified'",
    "date": "Date of test",
    "reportType": "e.g., Complete Blood Count, Lipid Profile"
  },
  "biomarkers": [
    {
      "name": "Biomarker name",
      "value": "Value with unit",
      "range": "Reference range",
      "status": "Normal" | "High" | "Low",
      "note": "Short explanation of what this specific marker means"
    }
  ],
  "interpretation": "A professional summary of the findings in plain language.",
  "actionableSteps": ["Suggestion 1", "Suggestion 2"],
  "disclaimer": "AI-generated summary for informational purposes only. Consult a physician."
}

RULES:
- Be extremely precise with numerical values and units.
- Compare values against the provided reference ranges in the image to determine status.
- If a value is missing or illegible, omit that biomarker.
- Maintain a professional and helpful tone.

IMPORTANT: Output ONLY valid JSON. Do not include markdown, code fences, or extra commentary.
`.trim();

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Analyze this medical report image and return structured JSON according to your instructions.' },
              { inlineData: { mimeType: req.body.type, data: req.body.data } },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1200,
        },
      };

      const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error?.message || `Gemini API error (HTTP ${r.status})`;
        return res.status(r.status).json({ error: msg });
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return res.status(502).json({ error: 'No response from AI' });

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        const extracted = extractJson(text);
        if (!extracted) return res.status(502).json({ error: 'AI response was not valid JSON' });
        try {
          parsed = JSON.parse(extracted);
        } catch {
          return res.status(502).json({ error: 'AI response was not valid JSON' });
        }
      }

      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Image report analysis error' });
    }
  }
);

export default router;


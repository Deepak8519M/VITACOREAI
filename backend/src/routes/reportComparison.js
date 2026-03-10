/**
 * Report Comparison - Gemini proxy (JWT protected)
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

  // Remove common markdown code fences anywhere in the text
  let t = text.trim();
  t = t.replace(/```json/gi, '```').replace(/```/g, '').trim();

  // If it's already pure JSON, return directly
  if (t.startsWith('{') && t.endsWith('}')) return t;
  if (t.startsWith('[') && t.endsWith(']')) return t;

  // Extract first balanced JSON object
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

  // Extract first balanced JSON array
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

// @route   POST /api/report-comparison
// @body    { reportOld: {data,mimeType}, reportNew: {data,mimeType} }
router.post(
  '/',
  protect,
  [
    body('reportOld.data').isString().notEmpty().withMessage('Old report data required'),
    body('reportOld.type').isString().notEmpty().withMessage('Old report mime type required'),
    body('reportNew.data').isString().notEmpty().withMessage('New report data required'),
    body('reportNew.type').isString().notEmpty().withMessage('New report mime type required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const systemPrompt = `
You are a specialized medical report analyst.
Analyze two medical reports: an older one and a recent one.
1. Extract key health markers (Blood Glucose, Cholesterol, BP, Hemoglobin, etc.).
2. Compare the values between 'Old' and 'New'.
3. Determine the 'Status': "Improved", "Worsened", "Stable", or "Needs Attention".
4. Provide a clear summary of the overall trend.

IMPORTANT: Output ONLY valid JSON. Do not include markdown, code fences, or extra commentary.

Response Format: JSON strictly following this schema:
{
  "summary": "Brief overall interpretation of changes",
  "keyChanges": ["list of most critical 2-3 changes"],
  "metrics": [
    {
      "parameter": "Name of test/metric",
      "oldValue": "value from older report",
      "newValue": "value from recent report",
      "unit": "e.g. mg/dL, mmHg",
      "status": "Improved" | "Worsened" | "Stable" | "Needs Attention",
      "notes": "Medical context for the change"
    }
  ]
}`.trim();

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Compare these two medical reports and provide a detailed analysis.' },
              { inlineData: { mimeType: req.body.reportOld.type, data: req.body.reportOld.data } },
              { inlineData: { mimeType: req.body.reportNew.type, data: req.body.reportNew.data } },
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
          // Provide a short hint without dumping full content
          return res.status(502).json({ error: 'AI response was not valid JSON' });
        }
      }

      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Report comparison error' });
    }
  }
);

export default router;


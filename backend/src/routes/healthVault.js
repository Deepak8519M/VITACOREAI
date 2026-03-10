/**
 * Health Vault - AI extraction proxy (JWT protected)
 *
 * Extracts category/date/provider/title/summary from an uploaded image/PDF.
 * Uses Gemini server-side so the API key is not exposed to the browser.
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
  return null;
}

// POST /api/health-vault/analyze
// body: { data: base64, type: mimeType, fileName?: string }
router.post(
  '/analyze',
  protect,
  [
    body('data').isString().notEmpty().withMessage('File data required'),
    body('type').isString().notEmpty().withMessage('Mime type required'),
    body('fileName').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const today = new Date().toISOString().slice(0, 10);
      const systemPrompt = `
You are a medical document intake assistant for a personal Health Vault.

Task: read the document (image or PDF) and extract metadata for organizing it.

Return ONLY a JSON object with this exact structure:
{
  "category": "Prescription" | "Lab Report" | "Scan" | "Other",
  "date": "YYYY-MM-DD",
  "provider": "Hospital/Clinic/Doctor/Lab name or 'Unknown Provider'",
  "title": "Short descriptive title",
  "summary": "One sentence summary"
}

Rules:
- Date MUST be YYYY-MM-DD. Use the document issued/signed date. If not visible, use "${today}".
- Provider should be a proper name (avoid generic 'Hospital' if a name exists).
- Title should be concise (e.g., "CBC Report", "Metformin Prescription", "CT Chest Scan").
- Summary should be 1 sentence, professional, no diagnosis claims beyond what is explicitly stated.
- Output ONLY valid JSON. No markdown, no code fences, no extra text.
      `.trim();

      const mimeType = (req.body.type || '').includes('pdf') ? 'application/pdf' : req.body.type;
      const filenameHint = req.body.fileName ? `Filename hint: ${req.body.fileName}` : 'Filename hint: (none)';

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Extract Health Vault metadata. ${filenameHint}` },
              { inlineData: { mimeType, data: req.body.data } },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 400,
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
        parsed = JSON.parse(extracted);
      }

      // Basic normalization
      const allowed = new Set(['Prescription', 'Lab Report', 'Scan', 'Other']);
      const out = {
        category: allowed.has(parsed?.category) ? parsed.category : 'Other',
        date: typeof parsed?.date === 'string' && parsed.date ? parsed.date : today,
        provider: typeof parsed?.provider === 'string' && parsed.provider ? parsed.provider : 'Unknown Provider',
        title: typeof parsed?.title === 'string' && parsed.title ? parsed.title : (req.body.fileName || 'Health document'),
        summary: typeof parsed?.summary === 'string' ? parsed.summary : '',
      };

      return res.json(out);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Health Vault analyze error' });
    }
  }
);

export default router;


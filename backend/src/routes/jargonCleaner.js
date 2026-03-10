/**
 * Medical Jargon Cleaner - Gemini proxy (JWT protected)
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

// POST /api/jargon/clean
// body: { text: string }
router.post(
  '/clean',
  protect,
  [body('text').isString().trim().notEmpty().withMessage('Text is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const systemPrompt = `
You are a patient-centered medical communications expert. Your goal is to rewrite complex medical reports into plain, empathetic, and clear English (around an 8th-grade reading level).

GUIDELINES:
1. PRESERVE MEANING: Do not lose the clinical significance.
2. REMOVE JARGON: Replace technical terms with simple descriptions.
3. STRUCTURE: Narrative explanation first, followed by a glossary.
4. DO NOT DIAGNOSE: Use phrasing like "The document notes..." or "This typically refers to...".
5. NO MEDICAL ADVICE: Do not tell the user what to do next. Suggest they discuss with their doctor.
6. STYLE: Clear, calm, and professional.

RESPONSE FORMAT:
{
  "explanation": "Markdown formatted paragraphs of the simple explanation",
  "glossary": [
    {"term": "Original Term", "definition": "Simple definition"}
  ]
}

Output ONLY valid JSON, no markdown fences or extra commentary.
      `.trim();

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: req.body.text }],
          },
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.25,
          maxOutputTokens: 900,
          responseSchema: {
            type: 'OBJECT',
            properties: {
              explanation: { type: 'STRING' },
              glossary: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    term: { type: 'STRING' },
                    definition: { type: 'STRING' },
                  },
                },
              },
            },
          },
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

      if (!parsed || typeof parsed !== 'object') {
        return res.status(502).json({ error: 'AI response was not valid JSON' });
      }

      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Medical jargon cleaner error' });
    }
  }
);

export default router;


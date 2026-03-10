/**
 * Health Chatbot routes - Gemini proxy (JWT protected)
 *
 * Security: calls Gemini from backend so API key is not exposed to browser.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function toContents(history = [], message) {
  const contents = [];
  for (const item of history) {
    if (!item) continue;
    const role = item.role === 'model' ? 'model' : 'user';
    const text = typeof item.text === 'string' ? item.text : '';
    if (text.trim()) contents.push({ role, parts: [{ text }] });
  }
  if (typeof message === 'string' && message.trim()) {
    contents.push({ role: 'user', parts: [{ text: message.trim() }] });
  }
  return contents;
}

// @route   POST /api/chat
// @body    { message: string, history?: Array<{role:'user'|'model', text:string}> }
router.post(
  '/',
  protect,
  [
    body('message').isString().trim().notEmpty().withMessage('Message is required'),
    body('history').optional().isArray().withMessage('History must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const systemPrompt = `
You are VitaCore AI Health Assistant.
- Be clear, precise, and professional.
- Do NOT claim to diagnose; provide educational guidance only.
- If symptoms are severe or urgent, advise emergency care.
- Prefer asking 1-2 clarifying questions when information is missing.
`;

      const contents = toContents(req.body.history, req.body.message);
      if (contents.length === 0) return res.status(400).json({ error: 'Empty message' });

      const payload = {
        contents,
        systemInstruction: { parts: [{ text: systemPrompt.trim() }] },
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512
        }
      };

      const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.error?.message || `Gemini API error (HTTP ${r.status})`;
        return res.status(r.status).json({ error: msg });
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.json({ text });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Chatbot error' });
    }
  }
);

export default router;


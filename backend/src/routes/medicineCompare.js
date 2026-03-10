/**
 * Smart Medicine Price Comparator - Gemini proxy (JWT protected)
 *
 * Security: calls Gemini from backend so API key is not exposed to browser.
 * Note: Uses AI to synthesize price comparisons; does not hit real pharmacy APIs.
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

// @route   POST /api/medicine/compare
// @body    { query: string, location?: string }
router.post(
  '/compare',
  protect,
  [
    body('query').isString().trim().notEmpty().withMessage('Medicine query is required'),
    body('location').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Server not configured: GOOGLE_AI_API_KEY missing' });

      const model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash';

      const { query, location = '' } = req.body;
      const systemPrompt = `
You are a Smart Medicine Price Comparator for an Indian health-tech platform (VitaCore AI).

Your job:
- Given a medicine query (brand/generic/dosage/symptom) and optional location, you must synthesize a realistic but clearly estimated price comparison across major Indian online pharmacies (Tata 1mg, PharmEasy, Apollo Pharmacy, Netmeds).
- You MUST output a structured JSON object with the fields described below.
- Always be conservative and realistic with pricing and discounts. Use INR (₹).
- If the query is vague (e.g. "diabetes medicine"), pick one common, representative medicine but mention this clearly in the summary.

Output ONLY valid JSON, no markdown or commentary.

JSON schema you MUST follow:
{
  "normalizedQuery": "string",
  "location": "string",
  "brand": {
    "name": "string",
    "genericName": "string",
    "strength": "string",
    "form": "Tablet | Capsule | Syrup | Injection | Other",
    "activeIngredient": "string"
  },
  "platforms": [
    {
      "name": "Tata 1mg | PharmEasy | Apollo Pharmacy | Netmeds | Other",
      "medicineName": "string",
      "stripSize": "string", 
      "mrp": number,
      "discountPercent": number,
      "finalPrice": number,
      "availability": "In stock | Out of stock | Limited stock",
      "deliveryTime": "e.g. 1-2 days",
      "url": "string"
    }
  ],
  "genericOptions": [
    {
      "name": "string",
      "manufacturer": "string",
      "finalPrice": number,
      "stripSize": "string",
      "savingsPercentVsBrand": number
    }
  ],
  "savings": {
    "bestPrice": number,
    "averagePrice": number,
    "potentialSavings": number,
    "currency": "INR"
  },
  "info": {
    "uses": "string",
    "dosage": "string",
    "sideEffects": "string",
    "warnings": "string",
    "manufacturer": "string"
  },
  "priceTrend": {
    "direction": "up | down | stable",
    "changePercent": number,
    "comment": "string"
  },
  "alerts": [
    "Smart, user-facing insights about savings, generics, or availability"
  ]
}

Rules:
- Platforms array MUST have at least 2 entries when possible.
- genericOptions MAY be empty if no clear generic exists.
- prices and discounts must be internally consistent (finalPrice = mrp * (1 - discountPercent/100)).
- Do NOT invent impossible discounts (>60% is rarely realistic for branded medicines).
      `.trim();

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `User query: "${query}". Location (if any): "${location}". Build a detailed price comparison JSON as per your instructions.`,
              },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 900,
          responseSchema: {
            type: 'OBJECT',
            properties: {
              normalizedQuery: { type: 'STRING' },
              location: { type: 'STRING' },
              brand: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  genericName: { type: 'STRING' },
                  strength: { type: 'STRING' },
                  form: { type: 'STRING' },
                  activeIngredient: { type: 'STRING' },
                },
              },
              platforms: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING' },
                    medicineName: { type: 'STRING' },
                    stripSize: { type: 'STRING' },
                    mrp: { type: 'NUMBER' },
                    discountPercent: { type: 'NUMBER' },
                    finalPrice: { type: 'NUMBER' },
                    availability: { type: 'STRING' },
                    deliveryTime: { type: 'STRING' },
                    url: { type: 'STRING' },
                  },
                },
              },
              genericOptions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING' },
                    manufacturer: { type: 'STRING' },
                    finalPrice: { type: 'NUMBER' },
                    stripSize: { type: 'STRING' },
                    savingsPercentVsBrand: { type: 'NUMBER' },
                  },
                },
              },
              savings: {
                type: 'OBJECT',
                properties: {
                  bestPrice: { type: 'NUMBER' },
                  averagePrice: { type: 'NUMBER' },
                  potentialSavings: { type: 'NUMBER' },
                  currency: { type: 'STRING' },
                },
              },
              info: {
                type: 'OBJECT',
                properties: {
                  uses: { type: 'STRING' },
                  dosage: { type: 'STRING' },
                  sideEffects: { type: 'STRING' },
                  warnings: { type: 'STRING' },
                  manufacturer: { type: 'STRING' },
                },
              },
              priceTrend: {
                type: 'OBJECT',
                properties: {
                  direction: { type: 'STRING' },
                  changePercent: { type: 'NUMBER' },
                  comment: { type: 'STRING' },
                },
              },
              alerts: {
                type: 'ARRAY',
                items: { type: 'STRING' },
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
        if (extracted) {
          try {
            parsed = JSON.parse(extracted);
          } catch {
            parsed = null;
          }
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        // Fallback: return a minimal structured object instead of a 502
        const fallback = {
          normalizedQuery: query,
          location,
          brand: {
            name: query,
            genericName: '',
            strength: '',
            form: 'Other',
            activeIngredient: '',
          },
          platforms: [],
          genericOptions: [],
          savings: {
            bestPrice: 0,
            averagePrice: 0,
            potentialSavings: 0,
            currency: 'INR',
          },
          info: {
            uses: 'Price comparison temporarily unavailable. Please try again later.',
            dosage: '',
            sideEffects: '',
            warnings: '',
            manufacturer: '',
          },
          priceTrend: {
            direction: 'stable',
            changePercent: 0,
            comment: 'Trend unavailable.',
          },
          alerts: ['Price comparison service is temporarily unavailable. Showing fallback information only.'],
        };
        return res.json(fallback);
      }

      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Medicine comparison error' });
    }
  }
);

export default router;


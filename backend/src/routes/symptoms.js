/**
 * Symptom checker - Proxy to ML API
 */

import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const ML_API = process.env.ML_API_URL || 'http://localhost:8000';

// @route   POST /api/symptoms/check
router.post('/check', protect, async (req, res) => {
  try {
    const response = await fetch(`${ML_API}/symptoms/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Symptom checker unavailable' });
    }

    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

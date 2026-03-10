/**
 * Prediction routes - Proxy to ML API and store history
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import Prediction from '../models/Prediction.js';

const router = express.Router();
const ML_API = process.env.ML_API_URL || 'http://localhost:8000';

// @route   POST /api/predictions/:diseaseType
router.post('/:diseaseType', protect, async (req, res) => {
  try {
    const { diseaseType } = req.params;
    const validTypes = ['diabetes', 'heart', 'stroke', 'kidney', 'liver', 'lung_cancer', 'breast_cancer', 'hypertension'];
    if (!validTypes.includes(diseaseType)) {
      return res.status(400).json({ error: 'Invalid disease type' });
    }

    const response = await fetch(`${ML_API}/predict/${diseaseType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err || 'ML API error' });
    }

    const result = await response.json();

    // Store prediction history
    await Prediction.create({
      user: req.user._id,
      diseaseType,
      inputs: req.body,
      result
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Prediction service unavailable' });
  }
});

// @route   GET /api/predictions/history
router.get('/history', protect, async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/predictions/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const agg = await Prediction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$diseaseType', count: { $sum: 1 }, lastRisk: { $last: '$result.risk' } } }
    ]);
    res.json(agg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

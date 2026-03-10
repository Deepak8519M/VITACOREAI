/**
 * VITAL ID routes - Emergency profile (JWT protected)
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import VitalProfile from '../models/VitalProfile.js';
import crypto from 'crypto';

const router = express.Router();

const BLOOD_GROUPS = new Set(['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown']);
const DONOR_STATUS = new Set(['Yes','No','Not Specified']);

// GET /api/vital-id
router.get('/', protect, async (req, res) => {
  try {
    let profile = await VitalProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await VitalProfile.create({
        user: req.user._id,
        name: req.user.name || '',
        contacts: []
      });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function safePublicProfile(profile) {
  return {
    name: profile.name || '',
    bloodGroup: profile.bloodGroup || 'Unknown',
    organDonor: profile.organDonor || 'Not Specified',
    primaryLanguage: profile.primaryLanguage || '',
    religiousPreferences: profile.religiousPreferences || '',
    emsInstructions: profile.emsInstructions || '',
    allergies: profile.allergies || '',
    conditions: profile.conditions || '',
    medications: profile.medications || '',
    extraNotes: profile.extraNotes || '',
    contacts: Array.isArray(profile.contacts) ? profile.contacts : [],
    updatedAt: profile.updatedAt,
  };
}

// GET /api/vital-id/public/:token (no auth)
router.get('/public/:token', async (req, res) => {
  try {
    const token = (req.params.token || '').trim();
    if (!token) return res.status(400).json({ error: 'Missing token' });

    const profile = await VitalProfile.findOne({ shareToken: token, shareEnabled: true });
    if (!profile) return res.status(404).json({ error: 'Not found' });

    return res.json(safePublicProfile(profile));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/vital-id/share (JWT) -> enable + generate new token
router.post('/share', protect, async (req, res) => {
  try {
    let profile = await VitalProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await VitalProfile.create({
        user: req.user._id,
        name: req.user.name || '',
        contacts: []
      });
    }

    const token = crypto.randomBytes(24).toString('hex'); // 48 chars
    profile.shareEnabled = true;
    profile.shareToken = token;
    profile.shareCreatedAt = new Date();
    await profile.save();

    return res.json({ shareEnabled: true, shareToken: token, shareCreatedAt: profile.shareCreatedAt });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vital-id/share (JWT) -> revoke
router.delete('/share', protect, async (req, res) => {
  try {
    const profile = await VitalProfile.findOne({ user: req.user._id });
    if (!profile) return res.json({ shareEnabled: false });

    profile.shareEnabled = false;
    profile.shareToken = null;
    profile.shareCreatedAt = null;
    await profile.save();

    return res.json({ shareEnabled: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/vital-id
router.put(
  '/',
  protect,
  [
    body('name').optional().isString(),
    body('bloodGroup').optional().isString(),
    body('organDonor').optional().isString(),
    body('primaryLanguage').optional().isString(),
    body('religiousPreferences').optional().isString(),
    body('emsInstructions').optional().isString(),
    body('allergies').optional().isString(),
    body('conditions').optional().isString(),
    body('medications').optional().isString(),
    body('extraNotes').optional().isString(),
    body('contacts').optional().isArray(),
    body('contacts.*.name').optional().isString(),
    body('contacts.*.relationship').optional().isString(),
    body('contacts.*.phone').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const update = { ...req.body };

      if (update.bloodGroup && !BLOOD_GROUPS.has(update.bloodGroup)) {
        return res.status(400).json({ error: 'Invalid bloodGroup' });
      }
      if (update.organDonor && !DONOR_STATUS.has(update.organDonor)) {
        return res.status(400).json({ error: 'Invalid organDonor' });
      }
      if (Array.isArray(update.contacts) && update.contacts.length > 10) {
        return res.status(400).json({ error: 'Too many contacts (max 10)' });
      }

      const profile = await VitalProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: update },
        { new: true, upsert: true, runValidators: true }
      );

      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;


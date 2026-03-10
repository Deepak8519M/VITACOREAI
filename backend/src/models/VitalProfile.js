/**
 * VITAL ID - Emergency medical profile stored per user
 */

import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const vitalProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    name: { type: String, default: '' },
    bloodGroup: { type: String, default: 'Unknown' },
    organDonor: { type: String, default: 'Not Specified' },
    primaryLanguage: { type: String, default: '' },
    religiousPreferences: { type: String, default: '' },
    emsInstructions: { type: String, default: '' },

    allergies: { type: String, default: '' },
    conditions: { type: String, default: '' },
    medications: { type: String, default: '' },
    extraNotes: { type: String, default: '' },

    contacts: { type: [contactSchema], default: [] },

    // Public share (read-only) for responders via tokenized link/QR
    shareEnabled: { type: Boolean, default: false },
    shareToken: { type: String, default: null, index: true, unique: true, sparse: true },
    shareCreatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('VitalProfile', vitalProfileSchema);


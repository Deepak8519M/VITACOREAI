/**
 * Medical record storage model (encrypted in production)
 */

import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  // Store encrypted data or path to encrypted file
  encryptedData: { type: Buffer },
  filePath: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('MedicalRecord', medicalRecordSchema);

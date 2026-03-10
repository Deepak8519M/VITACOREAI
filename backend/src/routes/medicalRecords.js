/**
 * Medical records - Upload, store, list
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import MedicalRecord from '../models/MedicalRecord.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// @route   POST /api/medical-records/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const record = await MedicalRecord.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      filePath: req.file.path,
      description: req.body.description
    });

    res.status(201).json({ _id: record._id, originalName: record.originalName, createdAt: record.createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/medical-records
router.get('/', protect, async (req, res) => {
  try {
    const records = await MedicalRecord.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(records.map(r => ({ _id: r._id, originalName: r.originalName, size: r.size, createdAt: r.createdAt, description: r.description })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/medical-records/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (record.filePath && fs.existsSync(record.filePath)) fs.unlinkSync(record.filePath);
    await MedicalRecord.deleteOne({ _id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

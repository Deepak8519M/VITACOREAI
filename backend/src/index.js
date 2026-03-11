/**
 * VitaCore AI - Backend Server
 * Main entry point for the Node.js/Express API
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import predictionRoutes from './routes/predictions.js';
import medicalRecordsRoutes from './routes/medicalRecords.js';
import symptomRoutes from './routes/symptoms.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import reportComparisonRoutes from './routes/reportComparison.js';
import vitalIdRoutes from './routes/vitalId.js';
import reportImageRoutes from './routes/reportImage.js';
import healthVaultRoutes from './routes/healthVault.js';
import medicineCompareRoutes from './routes/medicineCompare.js';
import jargonCleanerRoutes from './routes/jargonCleaner.js';
import smartMedicineAltRoutes from './routes/smartMedicineAlt.js';
import nppaToolsRoutes from './routes/nppaTools.js';
import vitalSignsRoutes from './routes/vitalSigns.js';
import medicationManagementRoutes from './routes/medicationManagement.js';
import medicinePriceAIRoutes from './routes/medicinePriceAI.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting - relaxed in development to avoid blocking sign up/login testing
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
// Allow larger JSON payloads for report comparison base64 uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/medical-records', medicalRecordsRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/report-comparison', reportComparisonRoutes);
app.use('/api/vital-id', vitalIdRoutes);
app.use('/api/report-image', reportImageRoutes);
app.use('/api/health-vault', healthVaultRoutes);
app.use('/api/medicine', medicineCompareRoutes);
app.use('/api/jargon', jargonCleanerRoutes);
app.use('/api/smart-medicine', smartMedicineAltRoutes);
app.use('/api/nppa', nppaToolsRoutes);
app.use('/api/vital-signs', vitalSignsRoutes);
app.use('/api/medication-management', medicationManagementRoutes);
app.use('/api/medicine-price', medicinePriceAIRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VitaCore AI API is running' });
});

app.listen(PORT, () => {
  console.log(`VitaCore API running on port ${PORT}`);
});

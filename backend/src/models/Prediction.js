/**
 * Prediction history model
 */

import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diseaseType: { type: String, required: true }, // diabetes, heart, stroke, kidney, liver, lung_cancer, breast_cancer, hypertension
  inputs: { type: Object, required: true },
  result: { type: Object, required: true }, // { risk, percentage, explanation, suggestions }
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Prediction', predictionSchema);

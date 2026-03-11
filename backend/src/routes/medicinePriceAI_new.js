/**
 * Medicine Price AI Routes
 * Integration with real medicine price dataset
 */

import express from 'express';
import { protect } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load real medicine dataset
let medicineDataset = [];
try {
  const datasetPath = path.join(__dirname, '../../../medicine-price-ai/backend/data/medicine_price_dataset.csv');
  if (fs.existsSync(datasetPath)) {
    const csvData = fs.readFileSync(datasetPath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const medicine = {};
        headers.forEach((header, index) => {
          medicine[header.trim()] = values[index] ? values[index].trim() : '';
        });
        medicineDataset.push(medicine);
      }
    }
    console.log(`✅ Loaded ${medicineDataset.length} medicines from dataset`);
  } else {
    console.log('⚠️ Dataset file not found, using fallback data');
  }
} catch (error) {
  console.error('❌ Error loading dataset:', error);
}

// Helper function to find medicines by name
function findMedicinesByName(name) {
  return medicineDataset.filter(med => 
    med.medicine_name.toLowerCase().includes(name.toLowerCase())
  );
}

// Helper function to find alternatives
function findAlternatives(medicineName) {
  const targetMed = findMedicinesByName(medicineName)[0];
  if (!targetMed) return [];
  
  return medicineDataset.filter(med => 
    med.medicine_name.toLowerCase().includes(medicineName.toLowerCase()) ||
    (med.category === targetMed.category && med.company !== targetMed.company)
  ).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
}

// Helper function to find medicines by symptoms (simplified mapping)
function findMedicinesBySymptoms(symptoms) {
  const symptomMapping = {
    'fever': ['Paracetamol', 'Napa', 'Ace'],
    'headache': ['Paracetamol', 'Napa', 'Ace'],
    'pain': ['Paracetamol', 'Napa', 'Ace'],
    'diabetes': ['Insulin'],
    'infection': ['Ace', 'Seclo'],
    'cold': ['Ceevit', 'Ace'],
    'cough': ['Ceevit', 'Ace'],
    'stomach': ['Seclo', 'Napa']
  };
  
  const recommendedMeds = new Set();
  
  symptoms.forEach(symptom => {
    const symptomLower = symptom.toLowerCase();
    if (symptomMapping[symptomLower]) {
      symptomMapping[symptomLower].forEach(med => recommendedMeds.add(med));
    }
  });
  
  return Array.from(recommendedMeds).map(medName => 
    findMedicinesByName(medName)[0]
  ).filter(med => med).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
}

// Price Prediction using real data
router.post('/predict-price', protect, async (req, res) => {
  try {
    const { category, company, import_status, demand_level, dosage_mg } = req.body;
    
    // Find similar medicines in dataset
    const similarMeds = medicineDataset.filter(med => {
      let match = true;
      if (category && med.category !== category) match = false;
      if (company && med.company !== company) match = false;
      if (import_status && med.import_status !== import_status) match = false;
      if (demand_level && med.demand_level !== demand_level) match = false;
      if (dosage_mg && med.dosage_mg !== dosage_mg) match = false;
      return match;
    });
    
    if (similarMeds.length > 0) {
      // Calculate average price from similar medicines
      const avgPrice = similarMeds.reduce((sum, med) => sum + parseFloat(med.price), 0) / similarMeds.length;
      
      res.json({
        predicted_price: Math.round(avgPrice * 100) / 100,
        based_on: similarMeds.length,
        similar_medicines: similarMeds.slice(0, 3).map(med => ({
          name: med.medicine_name,
          company: med.company,
          price: med.price
        }))
      });
    } else {
      // Fallback calculation
      const basePrice = 150;
      const categoryMultiplier = { 'Tablet': 1.0, 'Capsule': 1.2, 'Injection': 2.0, 'Syrup': 0.8, 'Ointment': 1.5 }[category] || 1.0;
      const demandMultiplier = { 'Low': 0.8, 'Medium': 1.0, 'High': 1.3 }[demand_level] || 1.0;
      const importMultiplier = import_status === 'Imported' ? 1.2 : 1.0;
      
      const predictedPrice = basePrice * categoryMultiplier * demandMultiplier * importMultiplier;
      
      res.json({
        predicted_price: Math.round(predictedPrice),
        based_on: 0,
        note: "No similar medicines found in dataset"
      });
    }
  } catch (error) {
    console.error('Price prediction error:', error);
    res.status(500).json({ error: 'Price prediction failed' });
  }
});

// Prescription Cost Calculator using real data
router.post('/prescription-cost', protect, async (req, res) => {
  try {
    const { medicines } = req.body;
    
    const result = [];
    let totalCost = 0;
    
    for (const medName of medicines) {
      const foundMed = findMedicinesByName(medName);
      
      if (foundMed.length > 0) {
        // Use the first found medicine
        const med = foundMed[0];
        const price = parseFloat(med.price);
        totalCost += price;
        
        result.push({
          medicine: med.medicine_name,
          company: med.company,
          category: med.category,
          dosage_mg: med.dosage_mg,
          pack_size: med.pack_size,
          price: Math.round(price * 100) / 100
        });
      } else {
        // Medicine not found in dataset
        const fallbackPrice = 200;
        totalCost += fallbackPrice;
        
        result.push({
          medicine: medName,
          company: 'Unknown',
          category: 'Unknown',
          dosage_mg: 'Unknown',
          pack_size: 'Unknown',
          price: fallbackPrice,
          note: 'Not found in dataset'
        });
      }
    }
    
    res.json({
      medicines: result,
      total_cost: Math.round(totalCost * 100) / 100,
      currency: '₹'
    });
  } catch (error) {
    console.error('Prescription cost error:', error);
    res.status(500).json({ error: 'Prescription cost calculation failed' });
  }
});

// Medicine Alternatives using real data
router.post('/medicine-alternatives', protect, async (req, res) => {
  try {
    const { medicine } = req.body;
    
    const alternatives = findAlternatives(medicine);
    
    if (alternatives.length > 0) {
      const cheapest = alternatives[0]; // Already sorted by price
      
      res.json({
        medicine: medicine,
        alternatives: alternatives.map(med => ({
          medicine_name: med.medicine_name,
          company: med.company,
          category: med.category,
          dosage_mg: med.dosage_mg,
          pack_size: med.pack_size,
          price: Math.round(parseFloat(med.price) * 100) / 100,
          import_status: med.import_status,
          prescription_required: med.prescription_required
        })),
        cheapest_option: cheapest.medicine_name,
        cheapest_company: cheapest.company,
        price: Math.round(parseFloat(cheapest.price) * 100) / 100,
        total_alternatives: alternatives.length
      });
    } else {
      res.json({
        medicine: medicine,
        alternatives: [],
        message: "No alternatives found in dataset",
        note: "Try searching with different medicine name"
      });
    }
  } catch (error) {
    console.error('Medicine alternatives error:', error);
    res.status(500).json({ error: 'Finding alternatives failed' });
  }
});

// Symptom Medicine Recommender using real data
router.post('/symptom-medicine', protect, async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    const recommendedMeds = findMedicinesBySymptoms(symptoms);
    
    const result = recommendedMeds.map(med => ({
      medicine_name: med.medicine_name,
      company: med.company,
      category: med.category,
      dosage_mg: med.dosage_mg,
      pack_size: med.pack_size,
      price: Math.round(parseFloat(med.price) * 100) / 100,
      import_status: med.import_status,
      prescription_required: med.prescription_required
    }));
    
    const totalCost = result.reduce((sum, med) => sum + med.price, 0);
    
    res.json({
      symptoms: symptoms,
      recommended_medicines: result,
      estimated_treatment_cost: Math.round(totalCost * 100) / 100,
      currency: '₹',
      total_recommendations: result.length
    });
  } catch (error) {
    console.error('Symptom medicine error:', error);
    res.status(500).json({ error: 'Symptom recommendation failed' });
  }
});

// Get all medicines (for search/dropdown)
router.get('/medicines', protect, async (req, res) => {
  try {
    const { search, category, company } = req.query;
    
    let filteredMeds = medicineDataset;
    
    if (search) {
      filteredMeds = filteredMeds.filter(med => 
        med.medicine_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      filteredMeds = filteredMeds.filter(med => med.category === category);
    }
    
    if (company) {
      filteredMeds = filteredMeds.filter(med => med.company === company);
    }
    
    res.json({
      medicines: filteredMeds.slice(0, 50).map(med => ({
        medicine_name: med.medicine_name,
        company: med.company,
        category: med.category,
        dosage_mg: med.dosage_mg,
        price: med.price
      })),
      total: filteredMeds.length
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

export default router;

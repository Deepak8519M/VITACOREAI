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
  const datasetPath = path.join(__dirname, '../data/medicine_price_dataset.csv');
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
    console.log('Expected path:', datasetPath);
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
  
  // Find exact alternatives: same category, different companies, similar dosage range
  const alternatives = medicineDataset.filter(med => {
    // Exclude the same medicine and same company
    if (med.medicine_name.toLowerCase() === medicineName.toLowerCase() || 
        med.company === targetMed.company) {
      return false;
    }
    
    // Must be same category
    if (med.category !== targetMed.category) {
      return false;
    }
    
    // Similar dosage range (within 50% difference)
    const targetDosage = parseFloat(targetMed.dosage_mg) || 0;
    const medDosage = parseFloat(med.dosage_mg) || 0;
    if (targetDosage > 0 && medDosage > 0) {
      const dosageDiff = Math.abs(targetDosage - medDosage) / targetDosage;
      if (dosageDiff > 0.5) return false; // More than 50% difference in dosage
    }
    
    return true;
  }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  
  // Limit to top 10 most relevant alternatives
  return alternatives.slice(0, 10);
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

// Price Prediction using weighted similarity algorithm
router.post('/predict-price', protect, async (req, res) => {
  try {
    const { category, company, import_status, demand_level, dosage_mg } = req.body;
    
    // Weighted similarity scoring
    const scoreSimilarity = (med, input) => {
      let score = 0;
      let maxScore = 100;
      
      // Category match (30% weight)
      if (input.category && med.category === input.category) {
        score += 30;
      }
      
      // Company match (20% weight)
      if (input.company && med.company === input.company) {
        score += 20;
      }
      
      // Dosage similarity (25% weight) - range-based matching
      if (input.dosage_mg) {
        const inputDosage = parseFloat(input.dosage_mg);
        const medDosage = parseFloat(med.dosage_mg);
        if (inputDosage > 0 && medDosage > 0) {
          const dosageDiff = Math.abs(inputDosage - medDosage);
          if (dosageDiff === 0) {
            score += 25; // Exact match
          } else if (dosageDiff <= inputDosage * 0.2) {
            score += 20; // Within 20%
          } else if (dosageDiff <= inputDosage * 0.5) {
            score += 15; // Within 50%
          } else if (dosageDiff <= inputDosage * 1.0) {
            score += 10; // Within 100%
          } else {
            score += 5; // Some similarity
          }
        }
      }
      
      // Import status match (15% weight)
      if (input.import_status && med.import_status === input.import_status) {
        score += 15;
      }
      
      // Demand level match (10% weight)
      if (input.demand_level && med.demand_level === input.demand_level) {
        score += 10;
      }
      
      return score;
    };
    
    // Find and score all medicines
    const scoredMeds = medicineDataset
      .map(med => ({
        ...med,
        similarityScore: scoreSimilarity(med, { category, company, import_status, demand_level, dosage_mg })
      }))
      .filter(med => med.similarityScore > 0) // Only include medicines with some similarity
      .sort((a, b) => b.similarityScore - a.similarityScore); // Sort by similarity score
    
    // Use top matches for prediction (minimum 30% similarity)
    const goodMatches = scoredMeds.filter(med => med.similarityScore >= 30);
    
    if (goodMatches.length > 0) {
      // Weighted average based on similarity scores
      const totalWeight = goodMatches.reduce((sum, med) => sum + med.similarityScore, 0);
      const weightedPrice = goodMatches.reduce((sum, med) => 
        sum + (parseFloat(med.price) * med.similarityScore), 0
      ) / totalWeight;
      
      res.json({
        predicted_price: Math.round(weightedPrice * 100) / 100,
        based_on: goodMatches.length,
        confidence: Math.round((goodMatches[0].similarityScore / 100) * 100),
        similar_medicines: goodMatches.slice(0, 5).map(med => ({
          name: med.medicine_name,
          company: med.company,
          price: med.price,
          score: med.similarityScore,
          category: med.category,
          dosage: med.dosage_mg
        }))
      });
    } else {
      // Enhanced fallback calculation
      const basePrice = 150;
      const categoryMultiplier = { 
        'Tablet': 1.0, 
        'Capsule': 1.2, 
        'Injection': 2.0, 
        'Syrup': 0.8, 
        'Ointment': 1.5 
      }[category] || 1.0;
      const demandMultiplier = { 
        'Low': 0.8, 
        'Medium': 1.0, 
        'High': 1.3 
      }[demand_level] || 1.0;
      const importMultiplier = import_status === 'Imported' ? 1.2 : 1.0;
      
      // Add dosage-based adjustment
      let dosageMultiplier = 1.0;
      if (dosage_mg) {
        const dosage = parseFloat(dosage_mg);
        if (dosage <= 100) dosageMultiplier = 0.7;
        else if (dosage <= 250) dosageMultiplier = 1.0;
        else if (dosage <= 500) dosageMultiplier = 1.3;
        else dosageMultiplier = 1.6;
      }
      
      const predictedPrice = basePrice * categoryMultiplier * demandMultiplier * importMultiplier * dosageMultiplier;
      
      res.json({
        predicted_price: Math.round(predictedPrice),
        based_on: 0,
        confidence: 25,
        note: "No similar medicines found - using algorithmic fallback"
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

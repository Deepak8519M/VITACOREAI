import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Mock database for medications and interactions
const medicationDB = {
  interactions: [
    {
      id: 1,
      medications: ['warfarin', 'aspirin'],
      severity: 'high',
      effect: 'Increased risk of bleeding',
      recommendation: 'Monitor for signs of bleeding, consider alternative therapy',
      mechanism: 'Both medications affect blood clotting'
    },
    {
      id: 2,
      medications: ['lisinopril', 'potassium'],
      severity: 'medium',
      effect: 'Hyperkalemia risk',
      recommendation: 'Monitor potassium levels regularly',
      mechanism: 'ACE inhibitors can increase potassium levels'
    },
    {
      id: 3,
      medications: ['metformin', 'ibuprofen'],
      severity: 'low',
      effect: 'Slightly increased risk of lactic acidosis',
      recommendation: 'Use with caution, monitor kidney function',
      mechanism: 'NSAIDs can affect kidney function'
    },
    {
      id: 4,
      medications: ['simvastatin', 'clarithromycin'],
      severity: 'high',
      effect: 'Increased risk of rhabdomyolysis',
      recommendation: 'Avoid concurrent use, consider alternative antibiotic',
      mechanism: 'Clarithromycin inhibits simvastatin metabolism'
    },
    {
      id: 5,
      medications: ['digoxin', 'verapamil'],
      severity: 'medium',
      effect: 'Increased digoxin levels',
      recommendation: 'Monitor digoxin levels, adjust dosage',
      mechanism: 'Calcium channel blockers can increase digoxin absorption'
    }
  ],
  drugInfo: {
    'warfarin': {
      class: 'Anticoagulant',
      commonDosages: ['1mg', '2mg', '5mg', '10mg'],
      frequency: 'once daily',
      withFood: false,
      precautions: ['Monitor INR regularly', 'Avoid vitamin K supplements', 'Watch for bleeding']
    },
    'aspirin': {
      class: 'Antiplatelet',
      commonDosages: ['81mg', '325mg'],
      frequency: 'once daily',
      withFood: true,
      precautions: ['Take with food to avoid stomach upset', 'May increase bleeding risk']
    },
    'lisinopril': {
      class: 'ACE Inhibitor',
      commonDosages: ['10mg', '20mg', '40mg'],
      frequency: 'once daily',
      withFood: false,
      precautions: ['Monitor blood pressure', 'Watch for cough', 'Avoid potassium supplements']
    },
    'metformin': {
      class: 'Antidiabetic',
      commonDosages: ['500mg', '850mg', '1000mg'],
      frequency: 'twice daily',
      withFood: true,
      precautions: ['Take with meals', 'Monitor kidney function', 'Watch for lactic acidosis symptoms']
    },
    'simvastatin': {
      class: 'Statin',
      commonDosages: ['20mg', '40mg', '80mg'],
      frequency: 'once daily',
      withFood: false,
      precautions: ['Take in evening', 'Monitor liver enzymes', 'Avoid grapefruit']
    }
  }
}

// Get medication information
router.get('/info/:medication', (req, res) => {
  try {
    const { medication } = req.params
    const medicationName = medication.toLowerCase()
    
    const info = medicationDB.drugInfo[medicationName]
    
    if (!info) {
      return res.status(404).json({ 
        error: 'Medication not found',
        message: 'This medication is not in our database'
      })
    }
    
    res.json({
      medication: medicationName,
      ...info,
      alternatives: ['Alternative 1', 'Alternative 2'] // Mock alternatives
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medication information' })
  }
})

// Check drug interactions
router.post('/interactions', (req, res) => {
  try {
    const { medications } = req.body
    
    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Please provide at least 2 medications to check for interactions'
      })
    }
    
    const normalizedMeds = medications.map(med => med.toLowerCase().trim())
    const foundInteractions = []
    
    // Check for interactions
    medicationDB.interactions.forEach(interaction => {
      const matchingMeds = interaction.medications.filter(med => 
        normalizedMeds.some(userMed => 
          userMed.includes(med) || med.includes(userMed)
        )
      )
      
      if (matchingMeds.length >= 2) {
        foundInteractions.push({
          ...interaction,
          detectedMedications: matchingMeds,
          confidence: 'high'
        })
      }
    })
    
    // Sort by severity
    const severityOrder = { high: 3, medium: 2, low: 1 }
    foundInteractions.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
    
    res.json({
      medications: normalizedMeds,
      interactions: foundInteractions,
      totalInteractions: foundInteractions.length,
      checkedAt: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to check interactions' })
  }
})

// Get dosage guidelines
router.get('/dosage/:medication', (req, res) => {
  try {
    const { medication } = req.params
    const { weight, age, weightUnit } = req.query
    
    const medicationName = medication.toLowerCase()
    const info = medicationDB.drugInfo[medicationName]
    
    if (!info) {
      return res.status(404).json({ 
        error: 'Medication not found',
        message: 'This medication is not in our database'
      })
    }
    
    // Calculate dosage based on weight if provided
    let dosageRecommendation = info.commonDosages[0] // Default to first dosage
    
    if (weight) {
      const weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : parseFloat(weight)
      
      // Simple dosage calculation based on weight ranges
      if (weightInKg < 50) {
        dosageRecommendation = info.commonDosages[0] // Lower dose
      } else if (weightInKg > 80) {
        dosageRecommendation = info.commonDosages[info.commonDosages.length - 1] // Higher dose
      }
    }
    
    res.json({
      medication: medicationName,
      class: info.class,
      recommendedDosage: dosageRecommendation,
      frequency: info.frequency,
      withFood: info.withFood,
      precautions: info.precautions,
      alternatives: ['Alternative 1', 'Alternative 2'],
      calculatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get dosage information' })
  }
})

// Search medications
router.get('/search', (req, res) => {
  try {
    const { query } = req.query
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters'
      })
    }
    
    const searchTerm = query.toLowerCase()
    const results = []
    
    // Search through medication database
    Object.keys(medicationDB.drugInfo).forEach(medication => {
      if (medication.includes(searchTerm)) {
        results.push({
          name: medication,
          class: medicationDB.drugInfo[medication].class,
          commonDosages: medicationDB.drugInfo[medication].commonDosages
        })
      }
    })
    
    res.json({
      query: searchTerm,
      results: results.slice(0, 10), // Limit to 10 results
      total: results.length
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to search medications' })
  }
})

// Get drug class information
router.get('/class/:drugClass', (req, res) => {
  try {
    const { drugClass } = req.params
    const className = drugClass.toLowerCase()
    
    const medicationsInClass = Object.keys(medicationDB.drugInfo)
      .filter(med => medicationDB.drugInfo[med].class.toLowerCase() === className)
      .map(med => ({
        name: med,
        ...medicationDB.drugInfo[med]
      }))
    
    if (medicationsInClass.length === 0) {
      return res.status(404).json({ 
        error: 'Drug class not found',
        message: 'No medications found for this class'
      })
    }
    
    res.json({
      drugClass: className,
      medications: medicationsInClass,
      total: medicationsInClass.length
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get drug class information' })
  }
})

// Get pharmacy information (mock)
router.get('/pharmacies', (req, res) => {
  try {
    const { location, zipCode } = req.query
    
    // Mock pharmacy data
    const pharmacies = [
      {
        id: 1,
        name: 'CVS Pharmacy',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 123-4567',
        hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
        services: ['Prescription filling', 'Immunizations', 'Health screenings'],
        distance: '0.5 miles'
      },
      {
        id: 2,
        name: 'Walgreens',
        address: '456 Oak Ave',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 987-6543',
        hours: '24 hours',
        services: ['Prescription filling', 'Photo services', 'Health clinics'],
        distance: '1.2 miles'
      },
      {
        id: 3,
        name: 'Rite Aid',
        address: '789 Pine Rd',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        phone: '(555) 456-7890',
        hours: 'Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-7PM',
        services: ['Prescription filling', 'Wellness products', 'Vaccinations'],
        distance: '2.1 miles'
      }
    ]
    
    res.json({
      location: location || 'Current location',
      pharmacies: pharmacies,
      total: pharmacies.length
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pharmacy information' })
  }
})

// Get refill reminders (mock)
router.get('/refill-reminders', (req, res) => {
  try {
    const { userId } = req.query
    
    // Mock refill reminders
    const reminders = [
      {
        id: 1,
        medication: 'Lisinopril',
        dosage: '10mg',
        currentSupply: 15,
        totalSupply: 30,
        dailyDosage: 1,
        daysRemaining: 15,
        refillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pharmacy: 'CVS Pharmacy',
        status: 'moderate',
        lastRefill: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        medication: 'Metformin',
        dosage: '500mg',
        currentSupply: 8,
        totalSupply: 60,
        dailyDosage: 2,
        daysRemaining: 4,
        refillDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pharmacy: 'Walgreens',
        status: 'critical',
        lastRefill: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    res.json({
      userId: userId || 'anonymous',
      reminders: reminders,
      total: reminders.length,
      criticalRefills: reminders.filter(r => r.status === 'critical').length
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch refill reminders' })
  }
})

export default router

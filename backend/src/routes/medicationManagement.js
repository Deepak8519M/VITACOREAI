import express from 'express'
import { body, query, param, validationResult } from 'express-validator'
import auth from '../middleware/auth.js'
import { Medication, DrugInteraction, DrugInfo } from '../models/Medication.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiting for medication endpoints
const medicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many medication requests, please try again later.' }
})

// Get medication information from database
router.get('/info/:medication', [
  medicationLimiter,
  auth,
  param('medication').isLength({ min: 2, max: 100 }).withMessage('Medication name must be 2-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { medication } = req.params
    const medicationName = medication.toLowerCase().trim()
    
    const info = await DrugInfo.findOne({ name: medicationName }).lean()
    
    if (!info) {
      return res.status(404).json({ 
        error: 'Medication not found',
        message: 'This medication is not in our database'
      })
    }
    
    res.json({
      success: true,
      medication: info.name,
      class: info.class,
      commonDosages: info.commonDosages,
      frequency: info.frequency,
      withFood: info.withFood,
      precautions: info.precautions,
      alternatives: info.alternatives
    })
  } catch (error) {
    console.error('Medication info fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch medication information',
      message: 'Internal server error'
    })
  }
})

// Check drug interactions from database
router.post('/interactions', [
  medicationLimiter,
  auth,
  body('medications').isArray({ min: 2, max: 10 }).withMessage('Please provide 2-10 medications'),
  body('medications.*').isLength({ min: 2, max: 100 }).withMessage('Each medication name must be 2-100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { medications } = req.body
    
    const normalizedMeds = medications.map(med => med.toLowerCase().trim())
    const foundInteractions = []
    
    // Check for interactions in database
    for (const interaction of await DrugInteraction.find().lean()) {
      const matchingMeds = interaction.medications.filter(med => 
        normalizedMeds.some(userMed => 
          userMed.includes(med) || med.includes(userMed)
        )
      )
      
      if (matchingMeds.length >= 2) {
        foundInteractions.push({
          id: interaction._id,
          medications: matchingMeds,
          severity: interaction.severity,
          effect: interaction.effect,
          recommendation: interaction.recommendation,
          mechanism: interaction.mechanism,
          confidence: 'high'
        })
      }
    }
    
    // Sort by severity (high > medium > low)
    const severityOrder = { high: 3, medium: 2, low: 1 }
    foundInteractions.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
    
    res.json({
      success: true,
      medications: normalizedMeds,
      interactions: foundInteractions,
      totalInteractions: foundInteractions.length,
      checkedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Drug interaction check error:', error)
    res.status(500).json({ 
      error: 'Failed to check interactions',
      message: 'Internal server error'
    })
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

// Get refill reminders from database
router.get('/refill-reminders', [
  medicationLimiter,
  auth,
  query('userId').optional().isString().withMessage('User ID must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      })
    }

    // Get medications for the authenticated user
    const medications = await Medication.find({ 
      userId: req.user.id,
      status: 'active'
    }).lean()
    
    const reminders = medications.map(med => {
      const daysRemaining = Math.ceil((med.refillDate - new Date()) / (1000 * 60 * 60 * 24))
      const adherenceRate = ((med.totalSupply - med.currentSupply) / med.totalSupply) * 100
      
      let status = 'low'
      if (daysRemaining <= 7) status = 'critical'
      else if (daysRemaining <= 14) status = 'moderate'
      
      return {
        id: med._id,
        medication: med.name,
        dosage: med.dosage,
        currentSupply: med.currentSupply,
        totalSupply: med.totalSupply,
        dailyDosage: med.dailyDosage,
        daysRemaining: Math.max(0, daysRemaining),
        refillDate: med.refillDate.toISOString().split('T')[0],
        pharmacy: med.pharmacy || 'Not specified',
        status,
        adherenceRate: Math.round(adherenceRate),
        lastRefill: med.lastRefill.toISOString()
      }
    })
    
    // Sort by urgency (critical first)
    reminders.sort((a, b) => {
      const statusOrder = { critical: 3, moderate: 2, low: 1 }
      return statusOrder[b.status] - statusOrder[a.status]
    })
    
    res.json({
      success: true,
      userId: req.user.id,
      reminders: reminders,
      total: reminders.length,
      criticalRefills: reminders.filter(r => r.status === 'critical').length,
      moderateRefills: reminders.filter(r => r.status === 'moderate').length,
      generatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Refill reminders fetch error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch refill reminders',
      message: 'Internal server error'
    })
  }
})

export default router

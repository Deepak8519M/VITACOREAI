import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Mock database for vital signs tracking
const vitalSignsDB = {
  bmi: [],
  bloodPressure: [],
  heartRate: [],
  bloodSugar: [],
  temperature: []
}

// Health risk calculators
const calculateBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'blue', risk: 'low' }
  if (bmi < 25) return { category: 'Normal weight', color: 'emerald', risk: 'normal' }
  if (bmi < 30) return { category: 'Overweight', color: 'amber', risk: 'moderate' }
  return { category: 'Obese', color: 'rose', risk: 'high' }
}

const calculateBloodPressureCategory = (systolic, diastolic) => {
  if (systolic < 120 && diastolic < 80) {
    return { category: 'Normal', color: 'emerald', risk: 'low' }
  }
  if (systolic < 130 && diastolic < 80) {
    return { category: 'Elevated', color: 'amber', risk: 'moderate' }
  }
  if (systolic < 140 || diastolic < 90) {
    return { category: 'Stage 1 Hypertension', color: 'orange', risk: 'high' }
  }
  if (systolic < 180 || diastolic < 120) {
    return { category: 'Stage 2 Hypertension', color: 'rose', risk: 'high' }
  }
  return { category: 'Hypertensive Crisis', color: 'red', risk: 'critical' }
}

const calculateHeartRateZone = (heartRate, activity, age = 30) => {
  const maxHR = 220 - age
  
  if (activity === 'resting') {
    if (heartRate < 60) return { zone: 'Bradycardia', color: 'blue', risk: 'low' }
    if (heartRate < 100) return { zone: 'Normal', color: 'emerald', risk: 'normal' }
    return { zone: 'Tachycardia', color: 'amber', risk: 'moderate' }
  } else {
    const percentage = (heartRate / maxHR) * 100
    if (percentage < 50) return { zone: 'Recovery', color: 'blue', risk: 'low' }
    if (percentage < 60) return { zone: 'Fat Burn', color: 'emerald', risk: 'normal' }
    if (percentage < 70) return { zone: 'Cardio', color: 'amber', risk: 'moderate' }
    if (percentage < 85) return { zone: 'Peak', color: 'orange', risk: 'high' }
    return { zone: 'Maximum', color: 'rose', risk: 'critical' }
  }
}

const calculateBloodSugarCategory = (glucose, timing) => {
  if (timing === 'fasting') {
    if (glucose < 70) return { category: 'Low', color: 'blue', risk: 'low' }
    if (glucose < 100) return { category: 'Normal', color: 'emerald', risk: 'normal' }
    if (glucose < 126) return { category: 'Prediabetes', color: 'amber', risk: 'moderate' }
    return { category: 'Diabetes', color: 'rose', risk: 'high' }
  } else {
    if (glucose < 70) return { category: 'Low', color: 'blue', risk: 'low' }
    if (glucose < 140) return { category: 'Normal', color: 'emerald', risk: 'normal' }
    if (glucose < 200) return { category: 'Prediabetes', color: 'amber', risk: 'moderate' }
    return { category: 'Diabetes', color: 'rose', risk: 'high' }
  }
}

const calculateTemperatureCategory = (temp, unit) => {
  const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp
  
  if (celsius < 36.1) return { category: 'Hypothermia', color: 'blue', risk: 'critical' }
  if (celsius < 37.5) return { category: 'Normal', color: 'emerald', risk: 'normal' }
  if (celsius < 38.5) return { category: 'Fever', color: 'amber', risk: 'moderate' }
  if (celsius < 39.5) return { category: 'High Fever', color: 'orange', risk: 'high' }
  return { category: 'Very High Fever', color: 'rose', risk: 'critical' }
}

// BMI Calculator
router.post('/bmi/calculate', (req, res) => {
  try {
    const { height, weight, heightUnit = 'cm', weightUnit = 'kg' } = req.body
    
    if (!height || !weight) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Height and weight are required'
      })
    }
    
    // Convert to metric if needed
    let heightInMeters = heightUnit === 'cm' ? height / 100 : height
    let weightInKg = weightUnit === 'lbs' ? weight * 0.453592 : weight
    
    const bmi = weightInKg / (heightInMeters * heightInMeters)
    const category = calculateBMICategory(bmi)
    
    // Calculate ideal weight range
    const idealWeightMin = 18.5 * heightInMeters * heightInMeters
    const idealWeightMax = 24.9 * heightInMeters * heightInMeters
    
    res.json({
      bmi: parseFloat(bmi.toFixed(1)),
      category: category.category,
      color: category.color,
      risk: category.risk,
      height: height,
      weight: weight,
      idealWeightRange: {
        min: parseFloat(idealWeightMin.toFixed(1)),
        max: parseFloat(idealWeightMax.toFixed(1)),
        unit: 'kg'
      },
      recommendations: [
        category.category === 'Underweight' ? 'Increase caloric intake with nutrient-dense foods' :
        category.category === 'Normal weight' ? 'Maintain current healthy lifestyle' :
        category.category === 'Overweight' ? 'Consider reducing caloric intake and increasing physical activity' :
        'Consult healthcare provider for weight management plan',
        'Monitor BMI regularly',
        'Maintain balanced diet and regular exercise'
      ],
      calculatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate BMI' })
  }
})

// Save BMI entry
router.post('/bmi/save', (req, res) => {
  try {
    const { userId, height, weight, bmi, category, notes } = req.body
    
    const entry = {
      id: Date.now(),
      userId: userId || 'anonymous',
      height,
      weight,
      bmi,
      category,
      notes: notes || '',
      date: new Date().toISOString()
    }
    
    vitalSignsDB.bmi.push(entry)
    
    res.json({
      success: true,
      entry: entry,
      message: 'BMI entry saved successfully'
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to save BMI entry' })
  }
})

// Blood Pressure Tracker
router.post('/blood-pressure/save', (req, res) => {
  try {
    const { userId, systolic, diastolic, pulse, notes, position = 'sitting' } = req.body
    
    if (!systolic || !diastolic) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Systolic and diastolic pressures are required'
      })
    }
    
    const category = calculateBloodPressureCategory(parseInt(systolic), parseInt(diastolic))
    
    const entry = {
      id: Date.now(),
      userId: userId || 'anonymous',
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: pulse ? parseInt(pulse) : null,
      notes: notes || '',
      position,
      category: category.category,
      color: category.color,
      risk: category.risk,
      date: new Date().toISOString()
    }
    
    vitalSignsDB.bloodPressure.push(entry)
    
    res.json({
      success: true,
      entry: entry,
      message: 'Blood pressure reading saved successfully',
      recommendations: [
        category.category === 'Normal' ? 'Continue healthy lifestyle' :
        category.category === 'Elevated' ? 'Consider dietary changes and exercise' :
        category.category.includes('Hypertension') ? 'Consult healthcare provider' :
        'Seek immediate medical attention',
        'Monitor blood pressure regularly',
        'Reduce sodium intake',
        'Maintain healthy weight'
      ]
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to save blood pressure reading' })
  }
})

// Heart Rate Monitor
router.post('/heart-rate/save', (req, res) => {
  try {
    const { userId, heartRate, activity, duration, notes, age = 30 } = req.body
    
    if (!heartRate) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Heart rate is required'
      })
    }
    
    const zone = calculateHeartRateZone(parseInt(heartRate), activity, age)
    
    const entry = {
      id: Date.now(),
      userId: userId || 'anonymous',
      heartRate: parseInt(heartRate),
      activity: activity || 'resting',
      duration: duration ? parseInt(duration) : null,
      notes: notes || '',
      age,
      zone: zone.zone,
      color: zone.color,
      risk: zone.risk,
      date: new Date().toISOString()
    }
    
    vitalSignsDB.heartRate.push(entry)
    
    res.json({
      success: true,
      entry: entry,
      message: 'Heart rate reading saved successfully',
      recommendations: [
        zone.zone === 'Normal' ? 'Continue regular monitoring' :
        zone.zone === 'Bradycardia' ? 'Consult healthcare provider if symptomatic' :
        zone.zone === 'Tachycardia' ? 'Monitor for underlying causes' :
        'Stay within target heart rate zones during exercise',
        'Monitor heart rate trends over time',
        'Consult healthcare provider for abnormal readings'
      ]
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to save heart rate reading' })
  }
})

// Blood Sugar Logger
router.post('/blood-sugar/save', (req, res) => {
  try {
    const { userId, glucose, timing, meal, notes, medication = '' } = req.body
    
    if (!glucose) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Glucose level is required'
      })
    }
    
    const category = calculateBloodSugarCategory(parseFloat(glucose), timing)
    
    const entry = {
      id: Date.now(),
      userId: userId || 'anonymous',
      glucose: parseFloat(glucose),
      timing: timing || 'fasting',
      meal: meal || '',
      notes: notes || '',
      medication,
      category: category.category,
      color: category.color,
      risk: category.risk,
      date: new Date().toISOString()
    }
    
    vitalSignsDB.bloodSugar.push(entry)
    
    res.json({
      success: true,
      entry: entry,
      message: 'Blood sugar reading saved successfully',
      recommendations: [
        category.category === 'Normal' ? 'Continue current management plan' :
        category.category === 'Low' ? 'Consume glucose and monitor closely' :
        category.category === 'Prediabetes' ? 'Consider lifestyle modifications' :
        'Consult healthcare provider for management plan',
        'Monitor blood sugar regularly',
        'Maintain consistent meal timing',
        'Follow medication schedule as prescribed'
      ]
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to save blood sugar reading' })
  }
})

// Temperature Tracker
router.post('/temperature/save', (req, res) => {
  try {
    const { userId, temperature, unit, symptoms, notes } = req.body
    
    if (!temperature) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Temperature is required'
      })
    }
    
    const category = calculateTemperatureCategory(parseFloat(temperature), unit)
    
    const entry = {
      id: Date.now(),
      userId: userId || 'anonymous',
      temperature: parseFloat(temperature),
      unit: unit || 'celsius',
      symptoms: symptoms || [],
      notes: notes || '',
      category: category.category,
      color: category.color,
      risk: category.risk,
      date: new Date().toISOString()
    }
    
    vitalSignsDB.temperature.push(entry)
    
    res.json({
      success: true,
      entry: entry,
      message: 'Temperature reading saved successfully',
      recommendations: [
        category.category === 'Normal' ? 'Continue regular monitoring' :
        category.category === 'Fever' ? 'Rest and stay hydrated' :
        category.category === 'High Fever' ? 'Consider fever-reducing medication' :
        'Seek immediate medical attention',
        'Monitor temperature regularly',
        'Stay hydrated',
        'Rest adequately'
      ]
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to save temperature reading' })
  }
})

// Get vital signs history
router.get('/history/:type', (req, res) => {
  try {
    const { type } = req.params
    const { userId, limit = 10, startDate, endDate } = req.query
    
    // Convert kebab-case to camelCase for database lookup
    const dbKey = type.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
    
    if (!vitalSignsDB[dbKey]) {
      return res.status(404).json({ 
        error: 'Invalid vital sign type',
        message: 'Valid types are: bmi, blood-pressure, heart-rate, blood-sugar, temperature'
      })
    }
    
    let entries = vitalSignsDB[dbKey]
    
    // Filter by user
    if (userId) {
      entries = entries.filter(entry => entry.userId === userId)
    }
    
    // Filter by date range
    if (startDate) {
      entries = entries.filter(entry => new Date(entry.date) >= new Date(startDate))
    }
    if (endDate) {
      entries = entries.filter(entry => new Date(entry.date) <= new Date(endDate))
    }
    
    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    // Apply limit
    if (limit) {
      entries = entries.slice(0, parseInt(limit))
    }
    
    res.json({
      success: true,
      entries: entries,
      total: entries.length,
      type: type
    })
    
  } catch (error) {
    console.error('Error fetching vital signs history:', error)
    res.status(500).json({ error: 'Failed to fetch vital signs history' })
  }
})

// Get vital signs statistics
router.get('/stats/:type', (req, res) => {
  try {
    const { type } = req.params
    const { userId, period = '30' } = req.query
    
    // Convert kebab-case to camelCase for database lookup
    const dbKey = type.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
    
    if (!vitalSignsDB[dbKey]) {
      return res.status(404).json({ 
        error: 'Invalid vital sign type',
        message: 'Valid types are: bmi, blood-pressure, heart-rate, blood-sugar, temperature'
      })
    }
    
    let entries = vitalSignsDB[dbKey]
    
    // Filter by user
    if (userId) {
      entries = entries.filter(entry => entry.userId === userId)
    }
    
    // Filter by period (days)
    const periodDays = parseInt(period)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - periodDays)
    
    entries = entries.filter(entry => new Date(entry.date) >= cutoffDate)
    
    // Calculate statistics based on type
    let stats = {
      totalEntries: entries.length,
      period: periodDays,
      type: type
    }
    
    if (dbKey === 'bmi' && entries.length > 0) {
      const avgBMI = entries.reduce((sum, entry) => sum + entry.bmi, 0) / entries.length
      stats.averageValue = parseFloat(avgBMI.toFixed(1))
      stats.latestValue = entries[0].bmi
      stats.latestCategory = entries[0].category
    } else if (dbKey === 'bloodPressure' && entries.length > 0) {
      const avgSystolic = entries.reduce((sum, entry) => sum + entry.systolic, 0) / entries.length
      const avgDiastolic = entries.reduce((sum, entry) => sum + entry.diastolic, 0) / entries.length
      stats.averageSystolic = Math.round(avgSystolic)
      stats.averageDiastolic = Math.round(avgDiastolic)
      stats.latestSystolic = entries[0].systolic
      stats.latestDiastolic = entries[0].diastolic
      stats.latestCategory = entries[0].category || 'Normal'
    } else if (dbKey === 'heartRate' && entries.length > 0) {
      const avgHR = entries.reduce((sum, entry) => sum + entry.heartRate, 0) / entries.length
      stats.averageValue = Math.round(avgHR)
      stats.latestValue = entries[0].heartRate
      stats.latestZone = entries[0].zone || 'Normal'
    } else if (dbKey === 'bloodSugar' && entries.length > 0) {
      const avgGlucose = entries.reduce((sum, entry) => sum + entry.glucose, 0) / entries.length
      stats.averageValue = Math.round(avgGlucose)
      stats.latestValue = entries[0].glucose
      stats.latestCategory = entries[0].category || 'Normal'
    } else if (dbKey === 'temperature' && entries.length > 0) {
      const avgTemp = entries.reduce((sum, entry) => sum + entry.temperature, 0) / entries.length
      stats.averageValue = parseFloat(avgTemp.toFixed(1))
      stats.latestValue = entries[0].temperature
      stats.latestCategory = entries[0].category || 'Normal'
    }
    
    res.json({
      success: true,
      stats: stats
    })
    
  } catch (error) {
    console.error('Error fetching vital signs statistics:', error)
    res.status(500).json({ error: 'Failed to fetch vital signs statistics' })
  }
})

// Health risk assessment
router.post('/risk-assessment', (req, res) => {
  try {
    const { userId, age, gender, vitals } = req.body
    
    const risks = {
      cardiovascular: { risk: 'low', factors: [], score: 0 },
      diabetes: { risk: 'low', factors: [], score: 0 },
      metabolic: { risk: 'low', factors: [], score: 0 }
    }
    
    // Analyze BMI
    if (vitals.bmi) {
      const bmi = parseFloat(vitals.bmi.bmi)
      if (bmi >= 30) {
        risks.cardiovascular.risk = 'high'
        risks.cardiovascular.factors.push('Obesity (BMI: ' + bmi + ')')
        risks.cardiovascular.score += 3
        
        risks.diabetes.risk = 'high'
        risks.diabetes.factors.push('Obesity (BMI: ' + bmi + ')')
        risks.diabetes.score += 3
        
        risks.metabolic.risk = 'high'
        risks.metabolic.factors.push('Obesity (BMI: ' + bmi + ')')
        risks.metabolic.score += 3
      } else if (bmi >= 25) {
        risks.cardiovascular.risk = 'moderate'
        risks.cardiovascular.factors.push('Overweight (BMI: ' + bmi + ')')
        risks.cardiovascular.score += 2
        
        risks.diabetes.risk = 'moderate'
        risks.diabetes.factors.push('Overweight (BMI: ' + bmi + ')')
        risks.diabetes.score += 2
      }
    }
    
    // Analyze blood pressure
    if (vitals.bloodPressure) {
      const bp = vitals.bloodPressure
      if (bp.systolic >= 140 || bp.diastolic >= 90) {
        risks.cardiovascular.risk = 'high'
        risks.cardiovascular.factors.push('High blood pressure (' + bp.systolic + '/' + bp.diastolic + ')')
        risks.cardiovascular.score += 3
      } else if (bp.systolic >= 130 || bp.diastolic >= 80) {
        risks.cardiovascular.risk = 'moderate'
        risks.cardiovascular.factors.push('Elevated blood pressure (' + bp.systolic + '/' + bp.diastolic + ')')
        risks.cardiovascular.score += 2
      }
    }
    
    // Analyze blood sugar
    if (vitals.bloodSugar) {
      const bs = vitals.bloodSugar
      if (bs.glucose >= 126) {
        risks.diabetes.risk = 'high'
        risks.diabetes.factors.push('High fasting glucose (' + bs.glucose + ' mg/dL)')
        risks.diabetes.score += 3
      } else if (bs.glucose >= 100) {
        risks.diabetes.risk = 'moderate'
        risks.diabetes.factors.push('Elevated fasting glucose (' + bs.glucose + ' mg/dL)')
        risks.diabetes.score += 2
      }
    }
    
    // Age factor
    if (age) {
      if (age >= 65) {
        risks.cardiovascular.score += 2
        risks.cardiovascular.factors.push('Age 65 or older')
      } else if (age >= 45) {
        risks.cardiovascular.score += 1
        risks.cardiovascular.factors.push('Age 45-64')
      }
    }
    
    // Calculate overall risk
    const totalScore = risks.cardiovascular.score + risks.diabetes.score + risks.metabolic.score
    let overallRisk = 'low'
    if (totalScore >= 6) overallRisk = 'high'
    else if (totalScore >= 3) overallRisk = 'moderate'
    
    res.json({
      overallRisk,
      totalScore,
      risks,
      recommendations: [
        overallRisk === 'high' ? 'Consult healthcare provider for comprehensive evaluation' :
        overallRisk === 'moderate' ? 'Consider lifestyle modifications and regular monitoring' :
        'Continue healthy lifestyle and regular checkups',
        'Maintain regular vital signs monitoring',
        'Follow balanced diet and exercise routine',
        'Attend routine medical checkups'
      ],
      assessedAt: new Date().toISOString()
    })
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete risk assessment' })
  }
})

export default router

import { useState, useEffect } from 'react'
import { 
  Activity, Heart, Droplets, Thermometer, TrendingUp, Calendar, Clock, 
  Plus, Edit2, Trash2, AlertCircle, CheckCircle2, BarChart3, Target,
  Pill, Bell, Calculator, RefreshCw, Download, Share2, Filter, Search
} from 'lucide-react'

const VitalSignsTracker = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState('bmi')
  const [vitals, setVitals] = useState({
    bmi: [],
    bloodPressure: [],
    heartRate: [],
    bloodSugar: [],
    temperature: []
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  // Fetch vital signs history on component mount
  useEffect(() => {
    const fetchVitalSignsHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No authentication token found')
          return
        }

        const types = ['bmi', 'blood-pressure', 'heart-rate', 'blood-sugar', 'temperature']
        const promises = types.map(type => 
          fetch(`/api/vital-signs/history/${type}?limit=10`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => {
              if (!res.ok) {
                if (res.status === 401) {
                  throw new Error('Authentication required. Please log in again.')
                }
                throw new Error(`HTTP error! status: ${res.status}`)
              }
              return res.json()
            })
            .then(data => ({ type, entries: data.entries || [] }))
            .catch(error => {
              console.error(`Failed to fetch ${type} history:`, error)
              return { type, entries: [] }
            })
        )
        
        const results = await Promise.all(promises)
        const newVitals = { ...vitals }
        
        results.forEach(({ type, entries }) => {
          if (type === 'blood-pressure') {
            newVitals.bloodPressure = entries
          } else if (type === 'heart-rate') {
            newVitals.heartRate = entries
          } else if (type === 'blood-sugar') {
            newVitals.bloodSugar = entries
          } else if (type === 'temperature') {
            newVitals.temperature = entries
          } else {
            newVitals[type] = entries
          }
        })
        
        setVitals(newVitals)
      } catch (error) {
        console.error('Failed to fetch vital signs history:', error)
        alert('Failed to load vital signs data. Please refresh the page.')
      }
    }

    fetchVitalSignsHistory()
  }, [])

  // BMI Calculator
  const BMICalculator = () => {
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [bmiResult, setBmiResult] = useState(null)

    const calculateBMI = () => {
      if (height && weight) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        setBmiResult({
          value: bmi.toFixed(1),
          category: getBMICategory(bmi),
          color: getBMIColor(bmi)
        })
      }
    }

    const getBMICategory = (bmi) => {
      if (bmi < 18.5) return 'Underweight'
      if (bmi < 25) return 'Normal weight'
      if (bmi < 30) return 'Overweight'
      return 'Obese'
    }

    const getBMIColor = (bmi) => {
      if (bmi < 18.5) return 'text-blue-400'
      if (bmi < 25) return 'text-emerald-400'
      if (bmi < 30) return 'text-amber-400'
      return 'text-rose-400'
    }

    const getBMIRecommendations = (bmi) => {
      if (bmi < 18.5) {
        return [
          'Increase caloric intake with nutrient-dense foods',
          'Include protein-rich foods in every meal',
          'Add healthy fats like nuts and avocados',
          'Consider strength training to build muscle mass',
          'Consult with a nutritionist for weight gain plan'
        ]
      } else if (bmi < 25) {
        return [
          'Maintain current healthy lifestyle',
          'Continue balanced diet and regular exercise',
          'Monitor weight monthly',
          'Stay hydrated and get adequate sleep',
          'Keep up regular physical activity'
        ]
      } else if (bmi < 30) {
        return [
          'Reduce caloric intake by 500 calories per day',
          'Increase physical activity to 150 minutes weekly',
          'Focus on portion control and mindful eating',
          'Limit processed foods and added sugars',
          'Include more vegetables and lean proteins'
        ]
      } else {
        return [
          'Consult healthcare provider for weight management',
          'Consider medically supervised weight loss program',
          'Aim for 5-10% weight loss initially',
          'Monitor blood pressure and blood sugar regularly',
          'Join support group for accountability and motivation'
        ]
      }
    }

    const saveBMI = async () => {
      if (bmiResult && height && weight) {
        try {
          const response = await fetch('/api/vital-signs/bmi/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              height: parseFloat(height),
              weight: parseFloat(weight),
              bmi: parseFloat(bmiResult.value),
              category: bmiResult.category,
              notes: ''
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const newEntry = data.entry
            
            setVitals(prev => ({
              ...prev,
              bmi: [newEntry, ...prev.bmi]
            }))
            
            // Show success message
            alert('BMI saved successfully!')
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to save BMI')
          }
          
          setHeight('')
          setWeight('')
          setBmiResult(null)
          setShowAddForm(false)
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        } catch (error) {
          console.error('Error saving BMI:', error)
          alert(`Failed to save BMI: ${error.message}. Please try again.`)
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            BMI Calculator
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="70"
              />
            </div>
          </div>

          <button
            onClick={calculateBMI}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-4"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className={`p-4 rounded-lg bg-slate-800/50 border border-slate-700 mb-4`}>
              <div className="text-center">
                <div className={`text-3xl font-bold ${bmiResult.color}`}>
                  {bmiResult.value}
                </div>
                <div className="text-slate-300 mt-1">{bmiResult.category}</div>
              </div>
              <button
                onClick={saveBMI}
                className="w-full mt-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Save to History
              </button>
            </div>
          )}
        </div>

        {/* BMI History */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">BMI History</h4>
          <div className="space-y-2">
            {vitals.bmi.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{entry.bmi}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    entry.category === 'Normal weight' ? 'bg-emerald-500/20 text-emerald-400' :
                    entry.category === 'Overweight' ? 'bg-amber-500/20 text-amber-400' :
                    entry.category === 'Obese' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {entry.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Blood Pressure Tracker
  const BloodPressureTracker = () => {
    const [systolic, setSystolic] = useState('')
    const [diastolic, setDiastolic] = useState('')
    const [pulse, setPulse] = useState('')
    const [notes, setNotes] = useState('')

    const getBPCategory = (sys, dia) => {
      if (sys < 120 && dia < 80) return { category: 'Normal', color: 'emerald', risk: 'low' }
      if (sys < 130 && dia < 80) return { category: 'Elevated', color: 'amber', risk: 'moderate' }
      if (sys < 140 || dia < 90) return { category: 'Stage 1 Hypertension', color: 'orange', risk: 'high' }
      if (sys < 180 || dia < 120) return { category: 'Stage 2 Hypertension', color: 'rose', risk: 'high' }
      return { category: 'Hypertensive Crisis', color: 'red', risk: 'critical' }
    }

    const getBPRecommendations = (sys, dia) => {
      if (sys < 120 && dia < 80) {
        return [
          'Continue heart-healthy lifestyle',
          'Maintain balanced diet low in sodium',
          'Exercise regularly (150 minutes per week)',
          'Limit alcohol consumption',
          'Manage stress effectively'
        ]
      } else if (sys < 130 && dia < 80) {
        return [
          'Reduce sodium intake to less than 2,300mg per day',
          'Increase physical activity to 150 minutes weekly',
          'Maintain healthy weight',
          'Limit alcohol to 1 drink per day (women) or 2 (men)',
          'Monitor blood pressure monthly'
        ]
      } else if (sys < 140 || dia < 90) {
        return [
          'Start DASH diet (Dietary Approaches to Stop Hypertension)',
          'Reduce sodium to less than 1,500mg per day',
          'Exercise 30 minutes most days of the week',
          'Consider medication consultation with healthcare provider',
          'Monitor blood pressure weekly'
        ]
      } else if (sys < 180 || dia < 120) {
        return [
          'Consult healthcare provider immediately',
          'Start antihypertensive medication as prescribed',
          'Follow strict lifestyle modifications',
          'Monitor blood pressure twice daily',
          'Avoid high-stress situations'
        ]
      } else {
        return [
          'Seek emergency medical attention immediately',
          'Call emergency services or go to nearest emergency room',
          'Do not wait - this is a medical emergency',
          'Symptoms may include severe headache, chest pain, shortness of breath',
          'This condition can lead to stroke, heart attack, or organ damage'
        ]
      }
    }

    const calculatePulsePressure = (sys, dia) => {
      return sys - dia
    }

    const calculateMeanArterialPressure = (sys, dia) => {
      return dia + (sys - dia) / 3
    }

    const saveBP = async () => {
      if (systolic && diastolic) {
        const category = getBPCategory(parseInt(systolic), parseInt(diastolic))
        try {
          const response = await fetch('/api/vital-signs/blood-pressure/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              systolic: parseInt(systolic),
              diastolic: parseInt(diastolic),
              pulse: pulse ? parseInt(pulse) : null,
              notes,
              position: 'sitting'
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const newEntry = data.entry
            
            setVitals(prev => ({
              ...prev,
              bloodPressure: [newEntry, ...prev.bloodPressure]
            }))
            
            // Show success message
            alert('Blood pressure saved successfully!')
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to save blood pressure')
          }
          
          setSystolic('')
          setDiastolic('')
          setPulse('')
          setNotes('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        } catch (error) {
          console.error('Error saving blood pressure:', error)
          alert(`Failed to save blood pressure: ${error.message}. Please try again.`)
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Blood Pressure Tracker
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Systolic (mmHg)
              </label>
              <input
                type="number"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Diastolic (mmHg)
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="80"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pulse (bpm) - Optional
              </label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
                placeholder="After exercise, stressed..."
              />
            </div>
          </div>

          <button
            onClick={saveBP}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Reading
          </button>
        </div>

        {/* BP History */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">Recent Readings</h4>
          <div className="space-y-2">
            {vitals.bloodPressure.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{entry.systolic}/{entry.diastolic}</span>
                  {entry.pulse && <span className="text-slate-400 text-sm">• {entry.pulse} bpm</span>}
                  <span className={`text-xs px-2 py-1 rounded-full bg-${entry.color}-500/20 text-${entry.color}-400`}>
                    {entry.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Heart Rate Monitor
  const HeartRateMonitor = () => {
    const [heartRate, setHeartRate] = useState('')
    const [activity, setActivity] = useState('resting')
    const [duration, setDuration] = useState('')

    const getHRZone = (hr, act, age = 30) => {
      const maxHR = 220 - age
      
      if (act === 'resting') {
        if (hr < 60) return { zone: 'Bradycardia', color: 'blue', risk: 'low', description: 'Heart rate is below normal resting range' }
        if (hr < 100) return { zone: 'Normal', color: 'emerald', risk: 'normal', description: 'Heart rate is within normal resting range' }
        return { zone: 'Tachycardia', color: 'amber', risk: 'moderate', description: 'Heart rate is above normal resting range' }
      } else {
        const percentage = (hr / maxHR) * 100
        if (percentage < 50) return { zone: 'Recovery', color: 'blue', risk: 'low', description: 'Light intensity - good for warm-up and cool-down' }
        if (percentage < 60) return { zone: 'Fat Burn', color: 'emerald', risk: 'normal', description: 'Moderate intensity - optimal for fat burning' }
        if (percentage < 70) return { zone: 'Cardio', color: 'amber', risk: 'moderate', description: 'Challenging intensity - improves cardiovascular fitness' }
        if (percentage < 85) return { zone: 'Peak', color: 'orange', risk: 'high', description: 'High intensity - for experienced athletes' }
        return { zone: 'Maximum', color: 'rose', risk: 'critical', description: 'Maximum effort - use with caution' }
      }
    }

    const calculateTargetHRZones = (age = 30) => {
      const maxHR = 220 - age
      return {
        recovery: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.6) },
        fatBurn: { min: Math.round(maxHR * 0.6), max: Math.round(maxHR * 0.7) },
        cardio: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.8) },
        peak: { min: Math.round(maxHR * 0.8), max: Math.round(maxHR * 0.85) },
        maximum: maxHR
      }
    }

    const getHRRecommendations = (hr, activity, age = 30) => {
      const zone = getHRZone(hr, activity, age)
      
      if (activity === 'resting') {
        if (hr < 60) {
          return [
            'Consult healthcare provider if experiencing dizziness or fatigue',
            'Ensure adequate hydration and nutrition',
            'Consider gradual increase in physical activity',
            'Monitor for symptoms like shortness of breath',
            'Avoid sudden changes in posture'
          ]
        } else if (hr < 100) {
          return [
            'Maintain regular cardiovascular exercise',
            'Continue healthy lifestyle habits',
            'Monitor resting heart rate weekly',
            'Stay well hydrated',
            'Get adequate sleep (7-9 hours)'
          ]
        } else {
          return [
            'Reduce caffeine and stimulant intake',
            'Practice stress management techniques',
            'Ensure adequate rest and recovery',
            'Check for fever or illness',
            'Consult healthcare provider if persistent'
          ]
        }
      } else {
        return [
          zone.description,
          'Stay within target heart rate zone for optimal benefits',
          'Monitor perceived exertion (should be able to talk)',
          'Stay hydrated during exercise',
          'Cool down properly after intense exercise'
        ]
      }
    }

    const saveHR = async () => {
      if (heartRate) {
        const zone = getHRZone(parseInt(heartRate), activity)
        try {
          const response = await fetch('/api/vital-signs/heart-rate/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              heartRate: parseInt(heartRate),
              activity,
              duration: duration ? parseInt(duration) : null,
              age: 30
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const newEntry = data.entry
            
            setVitals(prev => ({
              ...prev,
              heartRate: [newEntry, ...prev.heartRate]
            }))
          } else {
            // Save locally if API fails
            const newEntry = {
              id: Date.now(),
              date: new Date().toISOString(),
              heartRate: parseInt(heartRate),
              activity,
              duration: duration ? parseInt(duration) : null,
              zone: zone.zone,
              color: zone.color
            }
            setVitals(prev => ({
              ...prev,
              heartRate: [newEntry, ...prev.heartRate]
            }))
            console.log('Saved locally (API unavailable)')
          }
          
          setHeartRate('')
          setDuration('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        } catch (error) {
          console.error('Error saving heart rate:', error)
          // Still save locally even if API fails
          const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            heartRate: parseInt(heartRate),
            activity,
            duration: duration ? parseInt(duration) : null,
            zone: zone.zone,
            color: zone.color
          }
          setVitals(prev => ({
            ...prev,
            heartRate: [newEntry, ...prev.heartRate]
          }))
          setHeartRate('')
          setDuration('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-500" />
            Heart Rate Monitor
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
                placeholder="72"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Activity Type
              </label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              >
                <option value="resting">Resting</option>
                <option value="walking">Walking</option>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="strength">Strength Training</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Duration (minutes) - Optional
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              placeholder="30"
            />
          </div>

          <button
            onClick={saveHR}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Heart Rate
          </button>
        </div>

        {/* HR History */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">Heart Rate History</h4>
          <div className="space-y-2">
            {vitals.heartRate.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{entry.heartRate} bpm</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                    {entry.activity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${entry.color}-500/20 text-${entry.color}-400`}>
                    {entry.zone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Blood Sugar Logger
  const BloodSugarLogger = () => {
    const [glucose, setGlucose] = useState('')
    const [timing, setTiming] = useState('fasting')
    const [meal, setMeal] = useState('')

    const getBSCategory = (glucose, timing) => {
      if (timing === 'fasting') {
        if (glucose < 70) return { category: 'Hypoglycemia', color: 'blue', risk: 'critical', description: 'Blood sugar is dangerously low' }
        if (glucose < 100) return { category: 'Normal', color: 'emerald', risk: 'normal', description: 'Blood sugar is within normal range' }
        if (glucose < 126) return { category: 'Prediabetes', color: 'amber', risk: 'moderate', description: 'Blood sugar is elevated, risk of diabetes' }
        return { category: 'Diabetes', color: 'rose', risk: 'high', description: 'Blood sugar indicates diabetes' }
      } else {
        if (glucose < 70) return { category: 'Hypoglycemia', color: 'blue', risk: 'critical', description: 'Blood sugar is dangerously low' }
        if (glucose < 140) return { category: 'Normal', color: 'emerald', risk: 'normal', description: 'Blood sugar is within normal range' }
        if (glucose < 200) return { category: 'Prediabetes', color: 'amber', risk: 'moderate', description: 'Blood sugar is elevated, risk of diabetes' }
        return { category: 'Diabetes', color: 'rose', risk: 'high', description: 'Blood sugar indicates diabetes' }
      }
    }

    const getBSRecommendations = (glucose, timing) => {
      const category = getBSCategory(glucose, timing)
      
      if (glucose < 70) {
        return [
          'Consume 15-20 grams of fast-acting carbohydrates immediately',
          'Examples: 4 oz fruit juice, regular soda, or glucose tablets',
          'Recheck blood sugar after 15 minutes',
          'Follow with protein/carb snack if next meal >1 hour away',
          'Seek emergency care if unconscious or seizure occurs'
        ]
      } else if (timing === 'fasting') {
        if (glucose < 100) {
          return [
            'Maintain current diet and exercise routine',
            'Continue regular monitoring as advised',
            'Stay hydrated and maintain healthy sleep patterns',
            'Avoid skipping meals',
            'Monitor for changes in symptoms or medications'
          ]
        } else if (glucose < 126) {
          return [
            'Reduce carbohydrate intake, especially refined sugars',
            'Increase fiber intake with vegetables and whole grains',
            'Exercise 30 minutes most days of the week',
            'Maintain healthy weight',
            'Consult healthcare provider for diabetes prevention'
          ]
        } else {
          return [
            'Consult healthcare provider immediately',
            'Start diabetes management plan',
            'Monitor blood sugar multiple times daily',
            'Follow medication regimen as prescribed',
            'Consider diabetes education program'
          ]
        }
      } else {
        if (glucose < 140) {
          return [
            'Post-meal response is normal',
            'Continue balanced meal planning',
            'Monitor 2 hours after meals periodically',
            'Maintain portion control',
            'Stay active after meals when possible'
          ]
        } else if (glucose < 200) {
          return [
            'Reduce meal portions and carbohydrates',
          'Choose low-glycemic index foods',
          'Exercise 30 minutes after meals to help lower glucose',
          'Monitor post-meal levels regularly',
          'Consult healthcare provider for dietary adjustments'
          ]
        } else {
          return [
            'Post-meal glucose is too high - seek medical advice',
            'May need medication adjustment',
            'Avoid high-carbohydrate meals',
            'Monitor more frequently after meals',
            'Consider consulting with dietitian'
          ]
        }
      }
    }

    const calculateHbA1cEstimate = (avgGlucose) => {
      return (avgGlucose + 46.7) / 28.7
    }

    const getInsulinSensitivity = (weight) => {
      // Rough estimate: 1 unit of insulin lowers glucose by ~50 mg/dL per 100kg body weight
      return 50 / (weight / 100)
    }

    const saveBS = async () => {
      if (glucose) {
        const category = getBSCategory(parseFloat(glucose), timing)
        try {
          const response = await fetch('/api/vital-signs/blood-sugar/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              glucose: parseFloat(glucose),
              timing,
              meal,
              medication: '',
              notes: ''
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const newEntry = data.entry
            
            setVitals(prev => ({
              ...prev,
              bloodSugar: [newEntry, ...prev.bloodSugar]
            }))
          } else {
            // Save locally if API fails
            const newEntry = {
              id: Date.now(),
              date: new Date().toISOString(),
              glucose: parseFloat(glucose),
              timing,
              meal,
              category: category.category,
              color: category.color
            }
            setVitals(prev => ({
              ...prev,
              bloodSugar: [newEntry, ...prev.bloodSugar]
            }))
            console.log('Saved locally (API unavailable)')
          }
          
          setGlucose('')
          setMeal('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        } catch (error) {
          console.error('Error saving blood sugar:', error)
          // Still save locally even if API fails
          const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            glucose: parseFloat(glucose),
            timing,
            meal,
            category: category.category,
            color: category.color
          }
          setVitals(prev => ({
            ...prev,
            bloodSugar: [newEntry, ...prev.bloodSugar]
          }))
          setGlucose('')
          setMeal('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            Blood Sugar Logger
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Glucose (mg/dL)
              </label>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="95"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timing
              </label>
              <select
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="fasting">Fasting</option>
                <option value="before_meal">Before Meal</option>
                <option value="after_meal">After Meal (2 hours)</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Meal Description (Optional)
            </label>
            <input
              type="text"
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              placeholder="Breakfast: oatmeal with berries"
            />
          </div>

          <button
            onClick={saveBS}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Reading
          </button>
        </div>

        {/* BS History */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">Glucose History</h4>
          <div className="space-y-2">
            {vitals.bloodSugar.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Droplets className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{entry.glucose} mg/dL</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                    {entry.timing.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${entry.color}-500/20 text-${entry.color}-400`}>
                    {entry.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Temperature Tracker
  const TemperatureTracker = () => {
    const [temperature, setTemperature] = useState('')
    const [unit, setUnit] = useState('celsius')
    const [symptoms, setSymptoms] = useState('')

    const getTempCategory = (temp, unit) => {
      const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp
      
      if (celsius < 35.0) return { category: 'Severe Hypothermia', color: 'blue', risk: 'critical', description: 'Life-threatening low body temperature' }
      if (celsius < 36.1) return { category: 'Mild Hypothermia', color: 'blue', risk: 'moderate', description: 'Body temperature is below normal' }
      if (celsius < 37.5) return { category: 'Normal', color: 'emerald', risk: 'normal', description: 'Body temperature is within normal range' }
      if (celsius < 38.5) return { category: 'Low-grade Fever', color: 'amber', risk: 'low', description: 'Mild elevation in body temperature' }
      if (celsius < 39.5) return { category: 'Moderate Fever', color: 'orange', risk: 'moderate', description: 'Significant elevation in body temperature' }
      if (celsius < 41.0) return { category: 'High Fever', color: 'rose', risk: 'high', description: 'Dangerously high body temperature' }
      return { category: 'Hyperpyrexia', color: 'red', risk: 'critical', description: 'Medical emergency - extremely high temperature' }
    }

    const getTempRecommendations = (temp, unit) => {
      const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp
      const category = getTempCategory(temp, unit)
      
      if (celsius < 35.0) {
        return [
          'Seek emergency medical attention immediately',
          'Remove wet clothing and dry the person',
          'Use warm blankets and heating pads',
          'Provide warm fluids if conscious',
          'Monitor breathing and pulse continuously'
        ]
      } else if (celsius < 36.1) {
        return [
          'Warm up gradually with blankets and warm clothing',
          'Drink warm beverages',
          'Avoid sudden temperature changes',
          'Monitor for continued temperature drop',
          'Consider medical evaluation if persistent'
        ]
      } else if (celsius < 37.5) {
        return [
          'Temperature is normal - no action needed',
          'Continue regular health monitoring',
          'Maintain comfortable environment',
          'Stay hydrated',
          'Monitor for any changes'
        ]
      } else if (celsius < 38.5) {
        return [
          'Rest and increase fluid intake',
          'Use light clothing and keep room cool',
          'Consider acetaminophen or ibuprofen if uncomfortable',
          'Monitor temperature every 4 hours',
          'Seek medical care if fever persists > 3 days'
        ]
      } else if (celsius < 39.5) {
        return [
          'Increase fluid intake significantly',
          'Use fever-reducing medication as directed',
          'Apply cool compresses to forehead and wrists',
          'Monitor for signs of dehydration',
          'Consult healthcare provider if fever > 2 days'
        ]
      } else if (celsius < 41.0) {
        return [
          'Seek immediate medical attention',
          'Use cooling measures while waiting for medical care',
          'Remove excess clothing',
          'Apply cool, wet cloths to skin',
          'Monitor for confusion or seizures'
        ]
      } else {
        return [
          'EMERGENCY - Call emergency services immediately',
          'This is a life-threatening situation',
          'Use aggressive cooling measures',
          'Monitor vital signs continuously',
          'Prepare for possible complications'
        ]
      }
    }

    const calculateFeverResponse = (temp, unit) => {
      const celsius = unit === 'fahrenheit' ? (temp - 32) * 5/9 : temp
      
      if (celsius >= 38.5) {
        const increase = celsius - 37.0
        return {
          heartRateIncrease: Math.round(increase * 10), // ~10 bpm per degree
          metabolicIncrease: Math.round(increase * 13), // ~13% metabolic increase per degree
          fluidLoss: Math.round(increase * 500) // ~500ml extra fluid loss per degree
        }
      }
      return null
    }

    const saveTemp = async () => {
      if (temperature) {
        const category = getTempCategory(parseFloat(temperature), unit)
        try {
          const response = await fetch('/api/vital-signs/temperature/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              temperature: parseFloat(temperature),
              unit,
              symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
              notes: ''
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const newEntry = data.entry
            
            setVitals(prev => ({
              ...prev,
              temperature: [newEntry, ...prev.temperature]
            }))
          } else {
            // Save locally if API fails
            const newEntry = {
              id: Date.now(),
              date: new Date().toISOString(),
              temperature: parseFloat(temperature),
              unit,
              symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
              category: category.category,
              color: category.color
            }
            setVitals(prev => ({
              ...prev,
              temperature: [newEntry, ...prev.temperature]
            }))
            console.log('Saved locally (API unavailable)')
          }
          
          setTemperature('')
          setSymptoms('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        } catch (error) {
          console.error('Error saving temperature:', error)
          // Still save locally even if API fails
          const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            temperature: parseFloat(temperature),
            unit,
            symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
            category: category.category,
            color: category.color
          }
          setVitals(prev => ({
            ...prev,
            temperature: [newEntry, ...prev.temperature]
          }))
          setTemperature('')
          setSymptoms('')
          
          // Refresh parent statistics
          if (onRefresh) {
            onRefresh()
          }
        }
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            Temperature Tracker
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Temperature
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="37.0"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="celsius">°C</option>
                  <option value="fahrenheit">°F</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Symptoms (Optional)
              </label>
              <input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Headache, chills, fatigue"
              />
            </div>
          </div>

          <button
            onClick={saveTemp}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Temperature
          </button>
        </div>

        {/* Temperature History */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">Temperature History</h4>
          <div className="space-y-2">
            {vitals.temperature.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {entry.temperature}°{entry.unit === 'celsius' ? 'C' : 'F'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${entry.color}-500/20 text-${entry.color}-400`}>
                    {entry.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'bmi', name: 'BMI Calculator', icon: Target, component: BMICalculator },
    { id: 'bp', name: 'Blood Pressure', icon: Heart, component: BloodPressureTracker },
    { id: 'hr', name: 'Heart Rate', icon: Activity, component: HeartRateMonitor },
    { id: 'bs', name: 'Blood Sugar', icon: Droplets, component: BloodSugarLogger },
    { id: 'temp', name: 'Temperature', icon: Thermometer, component: TemperatureTracker }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || BMICalculator

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Vital Signs Tracker</h2>
          <p className="text-slate-400">Monitor and track your vital health metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id 
                ? 'text-blue-400 border-blue-400' 
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <ActiveComponent />
      </div>
    </div>
  )
}

export default VitalSignsTracker

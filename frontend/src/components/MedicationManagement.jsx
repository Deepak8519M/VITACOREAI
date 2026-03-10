import { useState, useEffect } from 'react'
import { 
  Pill, Bell, Calculator, RefreshCw, Clock, Calendar, AlertCircle, CheckCircle2,
  Plus, Edit2, Trash2, Download, Share2, Search, Filter, Activity, Heart,
  Droplets, Thermometer, Target, BarChart3, TrendingUp, Users, FileText,
  Syringe, Tablets, Shield, Info, ChevronRight, ChevronDown
} from 'lucide-react'

const MedicationManagement = () => {
  const [activeTab, setActiveTab] = useState('reminders')
  const [medications, setMedications] = useState([])
  const [reminders, setReminders] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedication, setSelectedMedication] = useState(null)

  // Fetch medication data on component mount
  useEffect(() => {
    const fetchMedicationData = async () => {
      try {
        // Fetch reminders
        const remindersResponse = await fetch('/api/medication-management/refill-reminders')
        if (remindersResponse.ok) {
          const remindersData = await remindersResponse.json()
          setReminders(remindersData.reminders || [])
        }
      } catch (error) {
        console.error('Failed to fetch medication data:', error)
      }
    }

    fetchMedicationData()
  }, [])

  // Medication Reminder System
  const MedicationReminders = () => {
    const [newReminder, setNewReminder] = useState({
      medicationName: '',
      dosage: '',
      frequency: 'daily',
      time: '09:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      withFood: false
    })

    const addReminder = () => {
      if (newReminder.medicationName && newReminder.dosage && newReminder.time) {
        const reminder = {
          id: Date.now(),
          ...newReminder,
          active: true,
          createdAt: new Date().toISOString()
        }
        setReminders([...reminders, reminder])
        setNewReminder({
          medicationName: '',
          dosage: '',
          frequency: 'daily',
          time: '09:00',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: '',
          withFood: false
        })
        setShowAddForm(false)
      }
    }

    const toggleReminder = (id) => {
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, active: !r.active } : r
      ))
    }

    const deleteReminder = (id) => {
      setReminders(reminders.filter(r => r.id !== id))
    }

    const upcomingReminders = reminders
      .filter(r => r.active)
      .sort((a, b) => a.time.localeCompare(b.time))

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Medication Reminders
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-white font-medium mb-4">New Medication Reminder</h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={newReminder.medicationName}
                  onChange={(e) => setNewReminder({...newReminder, medicationName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Metformin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={newReminder.dosage}
                  onChange={(e) => setNewReminder({...newReminder, dosage: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Frequency
                </label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder({...newReminder, frequency: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="as_needed">As Needed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newReminder.startDate}
                  onChange={(e) => setNewReminder({...newReminder, startDate: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={newReminder.endDate}
                  onChange={(e) => setNewReminder({...newReminder, endDate: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={newReminder.notes}
                onChange={(e) => setNewReminder({...newReminder, notes: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                rows="2"
                placeholder="Take with water, avoid grapefruit..."
              />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="withFood"
                checked={newReminder.withFood}
                onChange={(e) => setNewReminder({...newReminder, withFood: e.target.checked})}
                className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-blue-500 focus:outline-none focus:border-blue-500"
              />
              <label htmlFor="withFood" className="text-sm text-slate-300">
                Take with food
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addReminder}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Reminder
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="text-white font-medium mb-4">Today's Schedule</h4>
          <div className="space-y-2">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">{reminder.medicationName}</div>
                      <div className="text-slate-400 text-sm">{reminder.dosage} • {reminder.time}</div>
                      {reminder.withFood && (
                        <div className="text-amber-400 text-xs">Take with food</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        reminder.active 
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {reminder.active ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No medication reminders set</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Drug Interaction Checker
  const DrugInteractionChecker = () => {
    const [medications, setMedications] = useState(['', ''])
    const [interactions, setInteractions] = useState([])
    const [isChecking, setIsChecking] = useState(false)

    const addMedicationField = () => {
      setMedications([...medications, ''])
    }

    const removeMedicationField = (index) => {
      setMedications(medications.filter((_, i) => i !== index))
    }

    const updateMedication = (index, value) => {
      setMedications(medications.map((med, i) => i === index ? value : med))
    }

    const checkInteractions = async () => {
      setIsChecking(true)
      const validMeds = medications.filter(med => med.trim())
      
      try {
        const response = await fetch('/api/medication-management/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            medications: validMeds
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setInteractions(data.interactions || [])
        } else {
          console.error('Failed to check interactions')
          setInteractions([])
        }
      } catch (error) {
        console.error('Error checking interactions:', error)
        setInteractions([])
      } finally {
        setIsChecking(false)
      }
    }

    const getSeverityColor = (severity) => {
      switch(severity) {
        case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
        case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
        default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Drug Interaction Checker
          </h3>
          
          <div className="space-y-3 mb-4">
            {medications.map((medication, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => updateMedication(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter medication name"
                />
                {medications.length > 2 && (
                  <button
                    onClick={() => removeMedicationField(index)}
                    className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={addMedicationField}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Add Medication
            </button>
            <button
              onClick={checkInteractions}
              disabled={isChecking || medications.filter(m => m.trim()).length < 2}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              {isChecking ? 'Checking...' : 'Check Interactions'}
            </button>
          </div>

          {/* Interaction Results */}
          {interactions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-white font-medium">Potential Interactions Found:</h4>
              {interactions.map((interaction, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(interaction.severity)}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium capitalize">{interaction.severity} Risk</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50">
                          {interaction.medications.join(' + ')}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{interaction.effect}</p>
                      <p className="text-xs opacity-80">{interaction.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {interactions.length === 0 && !isChecking && medications.filter(m => m.trim()).length >= 2 && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400">No known interactions detected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Dosage Calculator
  const DosageCalculator = () => {
    const [patientInfo, setPatientInfo] = useState({
      weight: '',
      age: '',
      weightUnit: 'kg',
      dosagePerKg: '',
      concentration: '',
      frequency: 'daily'
    })
    const [result, setResult] = useState(null)

    const calculateDosage = () => {
      const weight = parseFloat(patientInfo.weight)
      const dosagePerKg = parseFloat(patientInfo.dosagePerKg)
      const concentration = parseFloat(patientInfo.concentration)
      
      if (weight && dosagePerKg) {
        const totalDosage = weight * dosagePerKg
        const volume = concentration ? (totalDosage / concentration) : null
        
        setResult({
          totalDosage: totalDosage.toFixed(2),
          volume: volume ? volume.toFixed(2) : null,
          frequency: patientInfo.frequency,
          weight: weight,
          unit: patientInfo.weightUnit
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-500" />
            Dosage Calculator
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Patient Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={patientInfo.weight}
                  onChange={(e) => setPatientInfo({...patientInfo, weight: e.target.value})}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="70"
                />
                <select
                  value={patientInfo.weightUnit}
                  onChange={(e) => setPatientInfo({...patientInfo, weightUnit: e.target.value})}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Patient Age
              </label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="35"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dosage per {patientInfo.weightUnit}
              </label>
              <input
                type="number"
                step="0.1"
                value={patientInfo.dosagePerKg}
                onChange={(e) => setPatientInfo({...patientInfo, dosagePerKg: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Concentration (mg/mL) - Optional
              </label>
              <input
                type="number"
                step="0.1"
                value={patientInfo.concentration}
                onChange={(e) => setPatientInfo({...patientInfo, concentration: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                placeholder="10"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Frequency
            </label>
            <select
              value={patientInfo.frequency}
              onChange={(e) => setPatientInfo({...patientInfo, frequency: e.target.value})}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="twice_daily">Twice Daily</option>
              <option value="three_times">Three Times Daily</option>
              <option value="four_times">Four Times Daily</option>
            </select>
          </div>

          <button
            onClick={calculateDosage}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Calculate Dosage
          </button>
        </div>

        {/* Dosage Results */}
        {result && (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-white font-medium mb-4">Calculated Dosage</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border-emerald-500/20">
                <div className="text-emerald-400 text-sm mb-1">Total Dosage</div>
                <div className="text-2xl font-bold text-white">{result.totalDosage} mg</div>
                <div className="text-slate-400 text-sm">{result.frequency}</div>
              </div>
              {result.volume && (
                <div className="p-4 rounded-lg bg-blue-500/10 border-blue-500/20">
                  <div className="text-blue-400 text-sm mb-1">Volume Required</div>
                  <div className="text-2xl font-bold text-white">{result.volume} mL</div>
                  <div className="text-slate-400 text-sm">per dose</div>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-300">
                  This calculation is for reference only. Always verify with a healthcare professional.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Refill Tracker
  const RefillTracker = () => {
    const [medications, setMedications] = useState([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [newMedication, setNewMedication] = useState({
      name: '',
      currentSupply: '',
      totalSupply: '',
      dailyDosage: '',
      refillDate: '',
      pharmacy: '',
      doctor: ''
    })

    // Fetch refill medications on component mount
    useEffect(() => {
      const fetchRefillMedications = async () => {
        try {
          const response = await fetch('/api/medication-management/refill-reminders')
          if (response.ok) {
            const data = await response.json()
            setMedications(data.reminders || [])
          }
        } catch (error) {
          console.error('Failed to fetch refill medications:', error)
        }
      }

      fetchRefillMedications()
    }, [])

    const addMedication = async () => {
      if (newMedication.name && newMedication.totalSupply && newMedication.dailyDosage) {
        try {
          const medication = {
            id: Date.now(),
            ...newMedication,
            currentSupply: parseInt(newMedication.currentSupply) || parseInt(newMedication.totalSupply),
            totalSupply: parseInt(newMedication.totalSupply),
            dailyDosage: parseInt(newMedication.dailyDosage),
            createdAt: new Date().toISOString()
          }
          
          // In a real app, this would save to backend
          setMedications([...medications, medication])
          setNewMedication({
            name: '',
            currentSupply: '',
            totalSupply: '',
            dailyDosage: '',
            refillDate: '',
            pharmacy: '',
            doctor: ''
          })
          setShowAddForm(false)
        } catch (error) {
          console.error('Error adding medication:', error)
        }
      }
    }

    const updateSupply = async (id, newSupply) => {
      try {
        // In a real app, this would update backend
        setMedications(medications.map(med => 
          med.id === id ? { ...med, currentSupply: newSupply } : med
        ))
      } catch (error) {
        console.error('Error updating supply:', error)
      }
    }

    const calculateDaysRemaining = (medication) => {
      return Math.floor(medication.currentSupply / medication.dailyDosage)
    }

    const getSupplyStatus = (daysRemaining) => {
      if (daysRemaining <= 7) return { status: 'Critical', color: 'rose' }
      if (daysRemaining <= 14) return { status: 'Low', color: 'amber' }
      if (daysRemaining <= 30) return { status: 'Moderate', color: 'blue' }
      return { status: 'Good', color: 'emerald' }
    }

    const getRefillRecommendations = (daysRemaining) => {
      if (daysRemaining <= 7) {
        return [
          'Contact pharmacy immediately for refill',
          'Call healthcare provider for prescription renewal if needed',
          'Consider emergency supply if critical medication',
          'Set up automatic refills for future',
          'Document refill dates in calendar'
        ]
      } else if (daysRemaining <= 14) {
        return [
          'Schedule refill appointment within 3-5 days',
          'Call pharmacy to check refill availability',
          'Set calendar reminder for refill date',
          'Check if prescription has refills remaining',
          'Consider mail-order pharmacy for convenience'
        ]
      } else if (daysRemaining <= 30) {
        return [
          'Plan refill for next 2-3 weeks',
          'Check insurance coverage for refills',
          'Consider 90-day supply if available',
          'Set up medication synchronization',
          'Review medication adherence'
        ]
      } else {
        return [
          'Continue taking medication as prescribed',
          'Monitor supply levels monthly',
          'Maintain good medication storage',
          'Report any side effects to healthcare provider',
          'Keep medication list updated'
        ]
      }
    }

    const calculateMedicationAdherence = (medication) => {
      const daysSinceStart = Math.floor((new Date() - new Date(medication.createdAt)) / (1000 * 60 * 60 * 24))
      const expectedDoses = daysSinceStart * medication.dailyDosage
      const takenDoses = medication.totalSupply - medication.currentSupply
      return Math.round((takenDoses / expectedDoses) * 100)
    }

    const sortedMedications = medications.sort((a, b) => {
      const daysA = calculateDaysRemaining(a)
      const daysB = calculateDaysRemaining(b)
      return daysA - daysB
    })

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-500" />
            Refill Tracker
          </h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Medication
          </button>
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-white font-medium mb-4">Add Medication to Track</h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Lisinopril"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Total Supply (tablets/capsules)
                </label>
                <input
                  type="number"
                  value={newMedication.totalSupply}
                  onChange={(e) => setNewMedication({...newMedication, totalSupply: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Supply
                </label>
                <input
                  type="number"
                  value={newMedication.currentSupply}
                  onChange={(e) => setNewMedication({...newMedication, currentSupply: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Daily Dosage
                </label>
                <input
                  type="number"
                  value={newMedication.dailyDosage}
                  onChange={(e) => setNewMedication({...newMedication, dailyDosage: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Refill Date (Optional)
                </label>
                <input
                  type="date"
                  value={newMedication.refillDate}
                  onChange={(e) => setNewMedication({...newMedication, refillDate: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Pharmacy (Optional)
                </label>
                <input
                  type="text"
                  value={newMedication.pharmacy}
                  onChange={(e) => setNewMedication({...newMedication, pharmacy: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="CVS Pharmacy"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prescribing Doctor (Optional)
              </label>
              <input
                type="text"
                value={newMedication.doctor}
                onChange={(e) => setNewMedication({...newMedication, doctor: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Dr. Smith"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addMedication}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Medication
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Medication List */}
        <div className="space-y-3">
          {sortedMedications.length > 0 ? (
            sortedMedications.map((medication) => {
              const daysRemaining = calculateDaysRemaining(medication)
              const supplyStatus = getSupplyStatus(daysRemaining)
              const supplyPercentage = (medication.currentSupply / medication.totalSupply) * 100
              
              return (
                <div key={medication.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{medication.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-sm">
                          {medication.currentSupply} / {medication.totalSupply} tablets
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full bg-${supplyStatus.color}-500/20 text-${supplyStatus.color}-400`}>
                          {supplyStatus.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{daysRemaining}</div>
                      <div className="text-slate-400 text-sm">days left</div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full bg-${supplyStatus.color}-500`}
                      style={{ width: `${supplyPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      {medication.dailyDosage} tablet(s) daily
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={medication.currentSupply}
                        onChange={(e) => updateSupply(medication.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        min="0"
                        max={medication.totalSupply}
                      />
                      <button className="p-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {(medication.refillDate || medication.pharmacy || medication.doctor) && (
                    <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400">
                      {medication.refillDate && <div>Refill: {new Date(medication.refillDate).toLocaleDateString()}</div>}
                      {medication.pharmacy && <div>Pharmacy: {medication.pharmacy}</div>}
                      {medication.doctor && <div>Doctor: {medication.doctor}</div>}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-slate-400">
              <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No medications being tracked</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'reminders', name: 'Reminders', icon: Bell, component: MedicationReminders },
    { id: 'interactions', name: 'Drug Interactions', icon: Shield, component: DrugInteractionChecker },
    { id: 'calculator', name: 'Dosage Calculator', icon: Calculator, component: DosageCalculator },
    { id: 'refill', name: 'Refill Tracker', icon: RefreshCw, component: RefillTracker }
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MedicationReminders

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Medication Management</h2>
          <p className="text-slate-400">Manage medications, check interactions, and track refills</p>
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
                ? 'text-purple-400 border-purple-400' 
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

export default MedicationManagement

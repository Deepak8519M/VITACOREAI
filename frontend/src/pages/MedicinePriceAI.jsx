import React, { useState, useEffect } from 'react'
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  Pill, 
  Calculator, 
  Lightbulb, 
  Activity,
  Package,
  Building,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Star,
  BarChart3,
  Target,
  Zap,
  IndianRupee,
  Filter,
  Database,
  Clock,
  Shield,
  FileText,
  ChevronDown,
  Info,
  TrendingDown,
  Heart,
  Award,
  Sparkles,
  Globe,
  TestTube,
  Stethoscope,
  Thermometer,
  Brain,
  Eye,
  Bone,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Download,
  Share2,
  Bookmark,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  Settings,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Package as PackageIcon,
  Building as BuildingIcon,
  Clock as ClockIcon,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  Database as DatabaseIcon,
  Calculator as CalculatorIcon,
  Lightbulb as LightbulbIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  RefreshCw as RefreshCwIcon,
  Download as DownloadIcon,
  Share2 as Share2Icon,
  Bookmark as BookmarkIcon,
  AlertTriangle as AlertTriangleIcon,
  Check as CheckIcon,
  X as XIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  MoreVertical as MoreVerticalIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Grid3x3 as Grid3x3Icon,
  List as ListIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  HelpCircle as HelpCircleIcon,
  MessageSquare as MessageSquareIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon
} from 'lucide-react'
import api from '../utils/api'

export default function MedicinePriceAI() {
  const [activeTab, setActiveTab] = useState('predict')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [predictions, setPredictions] = useState([])
  const [alternatives, setAlternatives] = useState([])
  const [prescriptionCost, setPrescriptionCost] = useState(null)
  const [symptomRecommendations, setSymptomRecommendations] = useState(null)
  const [allMedicines, setAllMedicines] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedMedicine, setSelectedMedicine] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [savedItems, setSavedItems] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonList, setComparisonList] = useState([])

  // Form states with only backend-expected fields
  const [predictionForm, setPredictionForm] = useState({
    category: '',
    company: '',
    import_status: '',
    demand_level: '',
    dosage_mg: ''
  })

  const [prescriptionForm, setPrescriptionForm] = useState({
    medicines: ['']
  })

  const [symptomForm, setSymptomForm] = useState({
    symptoms: ['']
  })

  const [medicineForm, setMedicineForm] = useState({
    medicine: ''
  })

  // Load medicines for dropdowns
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await api.get('/medicine-price/medicines')
        setAllMedicines(response.data.medicines || [])
      } catch (error) {
        console.error('Failed to load medicines:', error)
      }
    }
    loadMedicines()
  }, [])

  // Get unique values from dataset
  const categories = [...new Set(allMedicines.map(m => m.category))].filter(Boolean).sort()
  const companies = [...new Set(allMedicines.map(m => m.company))].filter(Boolean).sort()
  const importStatuses = [...new Set(allMedicines.map(m => m.import_status))].filter(Boolean).sort()
  const demandLevels = [...new Set(allMedicines.map(m => m.demand_level))].filter(Boolean).sort()
  const dosageOptions = [...new Set(allMedicines.map(m => m.dosage_mg))].filter(Boolean).sort((a, b) => parseFloat(a) - parseFloat(b))
  const packSizes = [...new Set(allMedicines.map(m => m.pack_size))].filter(Boolean).sort((a, b) => parseFloat(a) - parseFloat(b))
  const expiryOptions = [...new Set(allMedicines.map(m => m.expiry_months))].filter(Boolean).sort((a, b) => parseFloat(a) - parseFloat(b))

  // Price Prediction
  const handlePricePrediction = async () => {
    setLoading(true)
    try {
      const response = await api.post('/medicine-price/predict-price', predictionForm)
      setPredictions([{
        ...predictionForm,
        ...response.data,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      console.error('Prediction failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Medicine Alternatives
  const handleFindAlternatives = async () => {
    setLoading(true)
    try {
      const response = await api.post('/medicine-price/medicine-alternatives', medicineForm)
      setAlternatives([response.data])
    } catch (error) {
      console.error('Failed to find alternatives:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prescription Cost Calculator
  const handlePrescriptionCost = async () => {
    setLoading(true)
    try {
      const medicines = prescriptionForm.medicines.filter(m => m.trim() !== '')
      const response = await api.post('/medicine-price/prescription-cost', { medicines })
      setPrescriptionCost(response.data)
    } catch (error) {
      console.error('Failed to calculate cost:', error)
    } finally {
      setLoading(false)
    }
  }

  // Symptom Medicine Recommender
  const handleSymptomRecommendations = async () => {
    setLoading(true)
    try {
      const symptoms = symptomForm.symptoms.filter(s => s.trim() !== '')
      const response = await api.post('/medicine-price/symptom-medicine', { symptoms })
      setSymptomRecommendations(response.data)
    } catch (error) {
      console.error('Failed to get recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPrescriptionMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, '']
    }))
  }

  const addSymptom = () => {
    setSymptomForm(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }))
  }

  const removePrescriptionMedicine = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }))
  }

  const removeSymptom = (index) => {
    setSymptomForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }))
  }

  const addToComparison = (medicine) => {
    if (!comparisonList.find(m => m.medicine_name === medicine.medicine_name)) {
      setComparisonList(prev => [...prev, medicine])
    }
  }

  const removeFromComparison = (medicineName) => {
    setComparisonList(prev => prev.filter(m => m.medicine_name !== medicineName))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      {/* Premium Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/25">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Medicine Price AI
              </h1>
              <p className="text-slate-400 text-lg">Advanced pharmaceutical pricing intelligence with 5000+ medicines</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">{allMedicines.length.toLocaleString()}</p>
                <p className="text-sm text-slate-400">Total Medicines</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-6 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-400">{alternatives.length}</p>
                <p className="text-sm text-slate-400">Alternatives Found</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Accurate matches</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{prescriptionCost ? 1 : 0}</p>
                <p className="text-sm text-slate-400">Cost Calculations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-sm">
              <IndianRupee className="w-4 h-4" />
              <span>Real pricing</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-2xl p-6 border border-orange-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-400">{symptomRecommendations ? 1 : 0}</p>
                <p className="text-sm text-slate-400">Recommendations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <Brain className="w-4 h-4" />
              <span>AI-powered</span>
            </div>
          </div>
        </div>

        {/* Premium Tab Navigation */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-2 border border-slate-800 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'predict', label: 'Price Prediction', icon: TrendingUp, color: 'emerald' },
              { id: 'alternatives', label: 'Find Alternatives', icon: Target, color: 'blue' },
              { id: 'prescription', label: 'Cost Calculator', icon: Calculator, color: 'purple' },
              { id: 'symptoms', label: 'Symptom Advisor', icon: Lightbulb, color: 'orange' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Premium Tab Content */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800">
          {/* Price Prediction Tab */}
          {activeTab === 'predict' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Price Prediction</h2>
                  <p className="text-slate-400">Get accurate price predictions based on real market data and advanced algorithms</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Enhanced Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-400" />
                      Prediction Parameters
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Category *</label>
                        <select
                          value={predictionForm.category}
                          onChange={(e) => setPredictionForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Company</label>
                        <select
                          value={predictionForm.company}
                          onChange={(e) => setPredictionForm(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select Company</option>
                          {companies.map(company => (
                            <option key={company} value={company}>{company}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Dosage (mg)</label>
                        <select
                          value={predictionForm.dosage_mg}
                          onChange={(e) => setPredictionForm(prev => ({ ...prev, dosage_mg: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select Dosage</option>
                          {dosageOptions.map(dosage => (
                            <option key={dosage} value={dosage}>{dosage}mg</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Import Status</label>
                        <select
                          value={predictionForm.import_status}
                          onChange={(e) => setPredictionForm(prev => ({ ...prev, import_status: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select Status</option>
                          {importStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Demand Level</label>
                        <select
                          value={predictionForm.demand_level}
                          onChange={(e) => setPredictionForm(prev => ({ ...prev, demand_level: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select Demand</option>
                          {demandLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={handlePricePrediction}
                        disabled={loading || !predictionForm.category}
                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Predicting Price...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Predict Price
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Results */}
                <div className="lg:col-span-2">
                  {predictions.length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Prediction Results
                      </h3>
                      
                      {predictions.map((pred, index) => (
                        <div key={index} className="space-y-6">
                          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-slate-300">Predicted Price:</span>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-6 h-6 text-emerald-400" />
                                <span className="text-4xl font-bold text-emerald-400">{pred.predicted_price}</span>
                              </div>
                            </div>
                            
                            {pred.based_on > 0 && (
                              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Database className="w-4 h-4 text-emerald-400" />
                                  <span className="text-sm text-emerald-400">Based on {pred.based_on} similar medicines</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {pred.similar_medicines.map((med, idx) => (
                                    <div key={idx} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                      <div className="text-white font-medium">{med.name}</div>
                                      <div className="text-slate-400 text-sm">{med.company}</div>
                                      <div className="text-emerald-400 text-sm font-medium">₹{med.price}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {pred.category && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Category</div>
                                  <div className="text-white font-medium">{pred.category}</div>
                                </div>
                              )}
                              {pred.company && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Company</div>
                                  <div className="text-white font-medium">{pred.company}</div>
                                </div>
                              )}
                              {pred.dosage_mg && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Dosage</div>
                                  <div className="text-white font-medium">{pred.dosage_mg}mg</div>
                                </div>
                              )}
                              {pred.pack_size && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Pack Size</div>
                                  <div className="text-white font-medium">{pred.pack_size} units</div>
                                </div>
                              )}
                              {pred.manufacturing_cost && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Mfg. Cost</div>
                                  <div className="text-white font-medium">₹{pred.manufacturing_cost}</div>
                                </div>
                              )}
                              {pred.import_status && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Import Status</div>
                                  <div className="text-white font-medium">{pred.import_status}</div>
                                </div>
                              )}
                              {pred.demand_level && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Demand Level</div>
                                  <div className="text-white font-medium">{pred.demand_level}</div>
                                </div>
                              )}
                              {pred.expiry_months && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Expiry</div>
                                  <div className="text-white font-medium">{pred.expiry_months} months</div>
                                </div>
                              )}
                              {pred.prescription_required && (
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div className="text-slate-400 text-xs mb-1">Prescription</div>
                                  <div className="text-white font-medium">{pred.prescription_required === '1' ? 'Required' : 'Optional'}</div>
                                </div>
                              )}
                              {pred.predicted_price && (
                                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg p-3 border border-emerald-500/30">
                                  <div className="text-emerald-400 text-xs mb-1">Predicted Price</div>
                                  <div className="text-emerald-400 font-bold text-lg">₹{pred.predicted_price}</div>
                                </div>
                              )}
                            </div>

                            {pred.note && (
                              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                                <Info className="w-4 h-4" />
                                <span>{pred.note}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Medicine Alternatives Tab */}
          {activeTab === 'alternatives' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Find Medicine Alternatives</h2>
                  <p className="text-slate-400">Discover cheaper alternatives from real market data with intelligent matching</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-blue-400" />
                      Search Medicine
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Medicine Name</label>
                        <input
                          type="text"
                          value={medicineForm.medicine}
                          onChange={(e) => setMedicineForm(prev => ({ ...prev, medicine: e.target.value }))}
                          placeholder="Enter medicine name (e.g., Paracetamol, Napa, Ace)"
                          list="medicines"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <datalist id="medicines">
                          {allMedicines.slice(0, 50).map(med => (
                            <option key={med.medicine_name} value={med.medicine_name} />
                          ))}
                        </datalist>
                      </div>

                      <button
                        onClick={handleFindAlternatives}
                        disabled={loading || !medicineForm.medicine}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Finding Alternatives...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            Find Alternatives
                          </>
                        )}
                      </button>

                      {/* Quick Suggestions */}
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm text-slate-400 mb-2">Popular Searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {['Paracetamol', 'Napa', 'Ace', 'Seclo', 'Insulin'].map(med => (
                            <button
                              key={med}
                              onClick={() => setMedicineForm(prev => ({ ...prev, medicine: med }))}
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                            >
                              {med}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {alternatives.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl p-8 border border-blue-500/20 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        Alternative Medicines
                      </h3>
                      
                      {alternatives.map((alt, index) => (
                        <div key={index} className="space-y-4">
                          {alt.alternatives.length > 0 ? (
                            <>
                              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="text-lg font-semibold text-white">{alt.medicine}</h4>
                                    <p className="text-blue-400 text-sm">{alt.total_alternatives} alternatives found</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-slate-400">Best Price:</p>
                                    <p className="text-2xl font-bold text-green-400">₹{alt.price}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="grid gap-4">
                                {alt.alternatives.map((med, idx) => (
                                  <div key={idx} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <div className="text-lg font-medium text-white mb-1">{med.medicine_name}</div>
                                        <div className="text-slate-400 text-sm mb-2">{med.company} • {med.category}</div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-2xl font-bold text-white">₹{med.price}</span>
                                          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                            {med.category}
                                          </span>
                                          {med.prescription_required === '1' && (
                                            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                                              Rx Required
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => addToComparison(med)}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                        title="Add to comparison"
                                      >
                                        <PlusCircle className="w-5 h-5 text-blue-400" />
                                      </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                      <div className="bg-slate-900/50 rounded-lg p-2">
                                        <div className="text-slate-400 text-xs">Dosage</div>
                                        <div className="text-white font-medium">{med.dosage_mg}mg</div>
                                      </div>
                                      <div className="bg-slate-900/50 rounded-lg p-2">
                                        <div className="text-slate-400 text-xs">Pack Size</div>
                                        <div className="text-white font-medium">{med.pack_size}</div>
                                      </div>
                                      <div className="bg-slate-900/50 rounded-lg p-2">
                                        <div className="text-slate-400 text-xs">Import Status</div>
                                        <div className="text-white font-medium">{med.import_status}</div>
                                      </div>
                                      <div className="bg-slate-900/50 rounded-lg p-2">
                                        <div className="text-slate-400 text-xs">Prescription</div>
                                        <div className="text-white font-medium">{med.prescription_required === '1' ? 'Required' : 'Optional'}</div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span className="text-green-400 font-medium">
                                      Best Option: {alt.cheapest_option} ({alt.cheapest_company})
                                    </span>
                                  </div>
                                  <div className="text-green-400 font-bold text-xl">₹{alt.price}</div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-12">
                              <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                              <p className="text-amber-400 text-lg font-medium">{alt.message}</p>
                              <p className="text-slate-400 mt-2">{alt.note}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Prescription Cost Calculator Tab */}
          {activeTab === 'prescription' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Prescription Cost Calculator</h2>
                  <p className="text-slate-400">Calculate total cost of your prescription with real-time pricing</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      Medicine List
                    </h3>
                    
                    <div className="space-y-4">
                      {prescriptionForm.medicines.map((medicine, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={medicine}
                            onChange={(e) => {
                              const newMedicines = [...prescriptionForm.medicines]
                              newMedicines[index] = e.target.value
                              setPrescriptionForm(prev => ({ ...prev, medicines: newMedicines }))
                            }}
                            placeholder="Enter medicine name"
                            list="prescription-meds"
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors"
                          />
                          {index === prescriptionForm.medicines.length - 1 ? (
                            <button
                              onClick={addPrescriptionMedicine}
                              className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => removePrescriptionMedicine(index)}
                              className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <datalist id="prescription-meds">
                        {allMedicines.slice(0, 50).map(med => (
                          <option key={med.medicine_name} value={med.medicine_name} />
                        ))}
                      </datalist>

                      <button
                        onClick={handlePrescriptionCost}
                        disabled={loading || prescriptionForm.medicines.every(m => !m.trim())}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-400 hover:to-pink-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Calculating Cost...
                          </>
                        ) : (
                          <>
                            <Calculator className="w-5 h-5" />
                            Calculate Total Cost
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {prescriptionCost && (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Cost Breakdown
                      </h3>
                      
                      <div className="space-y-4 mb-6">
                        {prescriptionCost.medicines.map((med, index) => (
                          <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="text-lg font-medium text-white mb-1">{med.medicine}</div>
                                <div className="text-slate-400 text-sm mb-2">{med.company} • {med.category}</div>
                                {med.note && (
                                  <div className="text-amber-400 text-xs bg-amber-500/10 rounded-lg p-2 border border-amber-500/20">
                                    {med.note}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white">₹{med.price}</div>
                                <div className="text-xs text-slate-400">{med.dosage_mg}mg • {med.pack_size} pack</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-semibold text-white">Total Cost:</span>
                            <p className="text-sm text-slate-400 mt-1">For {prescriptionCost.medicines.length} medicines</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-6 h-6 text-purple-400" />
                            <span className="text-3xl font-bold text-purple-400">{prescriptionCost.total_cost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Symptom Medicine Recommender Tab */}
          {activeTab === 'symptoms' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Symptom Medicine Advisor</h2>
                  <p className="text-slate-400">Get AI-powered medicine recommendations based on your symptoms</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-orange-400" />
                      Your Symptoms
                    </h3>
                    
                    <div className="space-y-4">
                      {symptomForm.symptoms.map((symptom, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={symptom}
                            onChange={(e) => {
                              const newSymptoms = [...symptomForm.symptoms]
                              newSymptoms[index] = e.target.value
                              setSymptomForm(prev => ({ ...prev, symptoms: newSymptoms }))
                            }}
                            placeholder="Enter symptom (e.g., fever, headache, pain)"
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-colors"
                          />
                          {index === symptomForm.symptoms.length - 1 ? (
                            <button
                              onClick={addSymptom}
                              className="px-4 py-3 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                            >
                              <PlusCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => removeSymptom(index)}
                              className="px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <MinusCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={handleSymptomRecommendations}
                        disabled={loading || symptomForm.symptoms.every(s => !s.trim())}
                        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-400 hover:to-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Analyzing Symptoms...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Get Recommendations
                          </>
                        )}
                      </button>

                      {/* Common Symptoms */}
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm text-slate-400 mb-2">Common Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {['fever', 'headache', 'pain', 'cold', 'cough', 'stomach'].map(symptom => (
                            <button
                              key={symptom}
                              onClick={() => {
                                const newSymptoms = [...symptomForm.symptoms]
                                if (!newSymptoms.includes(symptom)) {
                                  newSymptoms[newSymptoms.length - 1] = symptom
                                  setSymptomForm(prev => ({ ...prev, symptoms: [...newSymptoms, ''] }))
                                }
                              }}
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
                            >
                              {symptom}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  {symptomRecommendations && (
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm">
                      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-orange-400" />
                        Recommended Medicines
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-orange-400" />
                            <span className="text-slate-400">For symptoms:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {symptomRecommendations.symptoms.map((symptom, index) => (
                              <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid gap-4">
                          {symptomRecommendations.recommended_medicines.map((med, index) => (
                            <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-orange-500/50 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="text-lg font-medium text-white mb-1">{med.medicine_name}</div>
                                  <div className="text-slate-400 text-sm mb-2">{med.company} • {med.category}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">₹{med.price}</span>
                                    <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs">
                                      {med.dosage_mg}mg
                                    </span>
                                    {med.prescription_required === '1' && (
                                      <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                                        Rx Required
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => addToComparison(med)}
                                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                  title="Add to comparison"
                                >
                                  <PlusCircle className="w-5 h-5 text-orange-400" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <div className="text-slate-400 text-xs">Pack Size</div>
                                  <div className="text-white font-medium">{med.pack_size}</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <div className="text-slate-400 text-xs">Import Status</div>
                                  <div className="text-white font-medium">{med.import_status}</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <div className="text-slate-400 text-xs">Prescription</div>
                                  <div className="text-white font-medium">{med.prescription_required === '1' ? 'Required' : 'Optional'}</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-2">
                                  <div className="text-slate-400 text-xs">Expiry</div>
                                  <div className="text-white font-medium">{med.expiry_months} months</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-semibold text-white">Estimated Treatment Cost:</span>
                              <p className="text-sm text-slate-400 mt-1">{symptomRecommendations.total_recommendations} medicines recommended</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-6 h-6 text-orange-400" />
                              <span className="text-3xl font-bold text-orange-400">{symptomRecommendations.estimated_treatment_cost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Panel */}
        {comparisonList.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-slate-900 rounded-2xl p-4 border border-slate-700 shadow-2xl max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Comparison ({comparisonList.length})</h4>
              <button
                onClick={() => setComparisonList([])}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {comparisonList.map((med, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{med.medicine_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">₹{med.price}</span>
                    <button
                      onClick={() => removeFromComparison(med.medicine_name)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

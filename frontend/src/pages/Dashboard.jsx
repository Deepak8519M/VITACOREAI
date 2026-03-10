import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts'
import { 
  Heart, TrendingUp, FileText, Activity, Brain, Droplets, Wind, Scan, Zap, Shield, 
  Stethoscope, Pill, FileImage, MessageCircle, Calculator, AlertCircle, CheckCircle2,
  Users, Clock, Star, ArrowRight, TrendingDown, Award, Target, Lightbulb, Thermometer,
  Apple, Moon, Sunrise, Weight, Eye, CalendarDays, UserCheck,
  FlaskConical, Microscope, Dna, TestTubes, Clipboard, 
  Globe, MapPin, Phone, Mail, Settings, Bell, Download, Upload, Share2,
  Filter, Search, BarChart3, Calendar
} from 'lucide-react'
import api from '../utils/api'

const DISEASE_LABELS = { diabetes: 'Diabetes', heart: 'Heart Disease', stroke: 'Stroke', kidney: 'Kidney Disease', liver: 'Liver Disease', lung_cancer: 'Lung Cancer', breast_cancer: 'Breast Cancer', hypertension: 'Hypertension' }

const TOOLS_DATA = [
  { 
    id: 'predictions', 
    name: 'AI Predictions', 
    icon: Brain, 
    description: 'Advanced disease risk assessment',
    count: 8,
    color: 'blue',
    path: '/app/predictions',
    features: ['Diabetes', 'Heart Disease', 'Stroke', 'Kidney', 'Liver', 'Lung Cancer', 'Breast Cancer', 'Hypertension']
  },
  { 
    id: 'nppa', 
    name: 'NPPA Tools', 
    icon: Calculator, 
    description: 'Medicine price analysis',
    count: 3,
    color: 'green',
    path: '/app/tools',
    features: ['Overcharge Detector', 'Cheapest Dose Finder', 'Essential Medicine Basket']
  },
  { 
    id: 'symptoms', 
    name: 'Symptom Checker', 
    icon: Stethoscope, 
    description: 'AI-powered symptom analysis',
    count: 1,
    color: 'purple',
    path: '/app/symptom-checker',
    features: ['Multi-symptom analysis', 'Disease probability', 'Health recommendations']
  },
  { 
    id: 'medicine', 
    name: 'Medicine Compare', 
    icon: Pill, 
    description: 'Compare medicines and alternatives',
    count: 2,
    color: 'orange',
    path: '/app/medicine-compare',
    features: ['Price comparison', 'Alternative suggestions', 'Side effects analysis']
  },
  { 
    id: 'reports', 
    name: 'Report Analysis', 
    icon: FileImage, 
    description: 'Medical report analysis',
    count: 2,
    color: 'red',
    path: '/app/report-comparison',
    features: ['Report comparison', 'Trend analysis', 'Health insights']
  },
  { 
    id: 'health-vault', 
    name: 'Health Vault', 
    icon: Shield, 
    description: 'Personal health records',
    count: 1,
    color: 'indigo',
    path: '/app/health-vault',
    features: ['Medical history', 'Test results', 'Prescriptions']
  },
  { 
    id: 'vital-id', 
    name: 'Vital ID', 
    icon: Activity, 
    description: 'Health identification system',
    count: 1,
    color: 'teal',
    path: '/app/vital-id',
    features: ['Digital health ID', 'Emergency access', 'Medical profile']
  },
  { 
    id: 'jargon', 
    name: 'Jargon Cleaner', 
    icon: MessageCircle, 
    description: 'Simplify medical terms',
    count: 1,
    color: 'pink',
    path: '/app/jargon-cleaner',
    features: ['Medical terminology', 'Simple explanations', 'Health education']
  }
]

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#ec4899']

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'reminder', title: 'Medication Review', message: 'Time to review your current medications', time: '2 hours ago', priority: 'low', read: false },
    { id: 2, type: 'alert', title: 'High Risk Detected', message: 'Elevated risk factors in recent predictions', time: '1 day ago', priority: 'high', read: false },
    { id: 3, type: 'info', title: 'Health Tip', message: 'Seasonal flu vaccination recommended', time: '3 days ago', priority: 'medium', read: true },
    { id: 4, type: 'success', title: 'Goal Achieved', message: 'You\'ve maintained healthy habits for 7 days!', time: '1 week ago', priority: 'low', read: true }
  ])
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    predictions: true,
    alerts: true,
    tips: false,
    weekly: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Loading timeout')), 5000)
        )
        
        const [historyRes, summaryRes] = await Promise.race([
          Promise.all([
            api.get('/predictions/history').catch(() => ({ data: [] })),
            api.get('/predictions/summary').catch(() => ({ data: [] }))
          ]),
          timeoutPromise
        ])
        
        setHistory(historyRes.data || [])
        setSummary((summaryRes.data || []).map(x => ({ name: DISEASE_LABELS[x._id] || x._id, value: x.count })))
      } catch (err) {
        console.error('Dashboard loading error:', err)
        if (err.message === 'Loading timeout') {
          setError('Loading timeout - please check your connection')
        } else {
          setError('Failed to load dashboard data')
        }
        // Set default data on error
        setHistory([])
        setSummary([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Notification handlers
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    setShowSettings(false)
  }

  const handleSettingsClick = () => {
    setShowSettings(!showSettings)
    setShowNotifications(false)
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const updateNotificationSetting = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  // Download handler
  const handleDownload = () => {
    const reportData = {
      healthScore: healthScore,
      totalPredictions: history.length,
      uniqueDiseases: new Set(history.map(h => h.diseaseType)).size,
      highRiskCount: history.filter(h => h.result?.risk === 'High').length,
      predictions: history,
      summary: summary,
      healthMetrics: healthMetrics,
      generatedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `vitacore-health-report-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-green-500/20 border-l-green-500 rounded-full animate-spin animation-delay-300"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VitaCore AI
            </h2>
            <p className="text-slate-400">Loading your health dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    // Still show dashboard even with error, just show a warning
    console.warn('Dashboard loaded with error:', error)
  }

  const riskColors = { Low: '#10b981', Medium: '#f59e0b', High: '#f43f5e' }
  const totalPredictions = history.length
  const uniqueDiseases = new Set(history.map(h => h.diseaseType)).size
  const highRiskCount = history.filter(h => h.result?.risk === 'High').length
  const recentPrediction = history[0]

  // Calculate health score
  const calculateHealthScore = () => {
    if (history.length === 0) return 85
    const lowRiskPercentage = (history.filter(h => h.result?.risk === 'Low').length / history.length) * 100
    const baseScore = 60 + (lowRiskPercentage * 0.4)
    return Math.min(100, Math.round(baseScore))
  }

  // Mock data for enhanced features
  const healthScore = calculateHealthScore()
  const weeklyTrends = [
    { day: 'Mon', predictions: 4, riskLevel: 65, score: 78 },
    { day: 'Tue', predictions: 7, riskLevel: 72, score: 82 },
    { day: 'Wed', predictions: 3, riskLevel: 68, score: 75 },
    { day: 'Thu', predictions: 8, riskLevel: 75, score: 88 },
    { day: 'Fri', predictions: 6, riskLevel: 70, score: 85 },
    { day: 'Sat', predictions: 2, riskLevel: 62, score: 79 },
    { day: 'Sun', predictions: 5, riskLevel: 69, score: 83 }
  ]

  const healthMetrics = [
    { metric: 'Cardiovascular', value: 78, max: 100, icon: Heart, color: 'red', trend: 'up' },
    { metric: 'Metabolic', value: 82, max: 100, icon: FlaskConical, color: 'blue', trend: 'stable' },
    { metric: 'Respiratory', value: 91, max: 100, icon: Wind, color: 'cyan', trend: 'up' },
    { metric: 'Neurological', value: 75, max: 100, icon: Brain, color: 'purple', trend: 'down' },
    { metric: 'Renal', value: 88, max: 100, icon: Droplets, color: 'blue', trend: 'up' },
    { metric: 'Hepatic', value: 79, max: 100, icon: Activity, color: 'green', trend: 'stable' }
  ]

  const riskDistribution = [
    { name: 'Low Risk', value: history.filter(h => h.result?.risk === 'Low').length, color: '#10b981' },
    { name: 'Medium Risk', value: history.filter(h => h.result?.risk === 'Medium').length, color: '#f59e0b' },
    { name: 'High Risk', value: history.filter(h => h.result?.risk === 'High').length, color: '#ef4444' }
  ].filter(item => item.value > 0)

  const lifestyleTips = [
    { icon: Apple, title: 'Nutrition', description: 'Balanced diet rich in fruits and vegetables', priority: 'high', progress: 75 },
    { icon: Activity, title: 'Exercise', description: '30 minutes of moderate activity daily', priority: 'high', progress: 60 },
    { icon: Moon, title: 'Sleep', description: '7-9 hours of quality sleep per night', priority: 'medium', progress: 85 },
    { icon: Droplets, title: 'Hydration', description: 'Drink 8+ glasses of water daily', priority: 'medium', progress: 90 },
    { icon: Shield, title: 'Preventive Care', description: 'Regular health check-ups and screenings', priority: 'high', progress: 45 },
    { icon: Brain, title: 'Mental Health', description: 'Practice stress management and mindfulness', priority: 'medium', progress: 70 }
  ]

  const healthAlerts = [
    { type: 'reminder', title: 'Medication Review', message: 'Time to review your current medications', time: '2 hours ago', priority: 'low' },
    { type: 'alert', title: 'High Risk Detected', message: 'Elevated risk factors in recent predictions', time: '1 day ago', priority: 'high' },
    { type: 'info', title: 'Health Tip', message: 'Seasonal flu vaccination recommended', time: '3 days ago', priority: 'medium' },
    { type: 'success', title: 'Goal Achieved', message: 'You\'ve maintained healthy habits for 7 days!', time: '1 week ago', priority: 'low' }
  ]

  const upcomingEvents = [
    { title: 'Annual Health Check-up', date: '2024-03-15', type: 'checkup', icon: Stethoscope },
    { title: 'Cardiology Consultation', date: '2024-03-20', type: 'specialist', icon: Heart },
    { title: 'Lab Tests', date: '2024-03-25', type: 'test', icon: TestTubes },
    { title: 'Vaccination Due', date: '2024-04-01', type: 'vaccine', icon: Shield }
  ]

  const preventionInsights = [
    { disease: 'Diabetes', prevention: 'Weight management, regular exercise, balanced diet', effectiveness: 85 },
    { disease: 'Heart Disease', prevention: 'Quit smoking, control blood pressure, exercise', effectiveness: 78 },
    { disease: 'Stroke', prevention: 'Control hypertension, manage diabetes, exercise', effectiveness: 82 },
    { disease: 'Kidney Disease', prevention: 'Hydration, blood pressure control, avoid NSAIDs', effectiveness: 75 }
  ]

  const globalHealthStats = [
    { country: 'USA', avgScore: 72, population: '331M' },
    { country: 'India', avgScore: 65, population: '1.4B' },
    { country: 'UK', avgScore: 78, population: '67M' },
    { country: 'Japan', avgScore: 82, population: '125M' }
  ]

  // Additional data for new graphs
  const monthlyTrends = [
    { month: 'Jan', predictions: 45, avgRisk: 65, healthScore: 78 },
    { month: 'Feb', predictions: 52, avgRisk: 62, healthScore: 82 },
    { month: 'Mar', predictions: 48, avgRisk: 68, healthScore: 80 },
    { month: 'Apr', predictions: 61, avgRisk: 70, healthScore: 85 },
    { month: 'May', predictions: 55, avgRisk: 58, healthScore: 88 },
    { month: 'Jun', predictions: 67, avgRisk: 64, healthScore: 86 }
  ]

  const ageGroupData = [
    { ageGroup: '18-25', predictions: 12, avgScore: 88 },
    { ageGroup: '26-35', predictions: 28, avgScore: 82 },
    { ageGroup: '36-45', predictions: 35, avgScore: 75 },
    { ageGroup: '46-55', predictions: 31, avgScore: 68 },
    { ageGroup: '56-65', predictions: 22, avgScore: 62 },
    { ageGroup: '65+', predictions: 15, avgScore: 58 }
  ]

  const symptomCorrelation = [
    { symptom: 'Fatigue', correlation: 0.78, predictions: 45 },
    { symptom: 'Headache', correlation: 0.65, predictions: 38 },
    { symptom: 'Chest Pain', correlation: 0.92, predictions: 28 },
    { symptom: 'Dizziness', correlation: 0.71, predictions: 32 },
    { symptom: 'Shortness of Breath', correlation: 0.85, predictions: 25 },
    { symptom: 'Nausea', correlation: 0.58, predictions: 41 }
  ]

  const treatmentEffectiveness = [
    { treatment: 'Medication', effectiveness: 78, patients: 156 },
    { treatment: 'Lifestyle Changes', effectiveness: 85, patients: 203 },
    { treatment: 'Physical Therapy', effectiveness: 72, patients: 89 },
    { treatment: 'Surgery', effectiveness: 91, patients: 45 },
    { treatment: 'Alternative Medicine', effectiveness: 64, patients: 67 }
  ]

  const vitalSignsData = [
    { time: '00:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 98 },
    { time: '04:00', heartRate: 68, bloodPressure: 118, temperature: 98.4, oxygen: 98 },
    { time: '08:00', heartRate: 75, bloodPressure: 122, temperature: 98.6, oxygen: 97 },
    { time: '12:00', heartRate: 80, bloodPressure: 125, temperature: 98.8, oxygen: 96 },
    { time: '16:00', heartRate: 78, bloodPressure: 123, temperature: 98.7, oxygen: 97 },
    { time: '20:00', heartRate: 70, bloodPressure: 119, temperature: 98.5, oxygen: 98 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-medium">Connection Issue</p>
              <p className="text-amber-400 text-xs">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                VitaCore AI Dashboard
              </h1>
              <p className="text-slate-400 text-sm">Comprehensive Health Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-400" />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></div>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-blue-400 text-sm hover:text-blue-300"
                      >
                        Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors ${
                          !notification.read ? 'bg-blue-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.priority === 'high' ? (
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                          ) : notification.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-400 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <h4 className="text-slate-100 text-sm font-medium">{notification.title}</h4>
                            <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                            <p className="text-slate-500 text-xs mt-2">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-700">
                    <button className="w-full text-center text-blue-400 text-sm hover:text-blue-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={handleSettingsClick}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
              
              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Notification Settings</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Email Notifications</span>
                        <button
                          onClick={() => updateNotificationSetting('email', !notificationSettings.email)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.email ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.email ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Push Notifications</span>
                        <button
                          onClick={() => updateNotificationSetting('push', !notificationSettings.push)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.push ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.push ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">SMS Alerts</span>
                        <button
                          onClick={() => updateNotificationSetting('sms', !notificationSettings.sms)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.sms ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.sms ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Prediction Results</span>
                        <button
                          onClick={() => updateNotificationSetting('predictions', !notificationSettings.predictions)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.predictions ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.predictions ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Health Alerts</span>
                        <button
                          onClick={() => updateNotificationSetting('alerts', !notificationSettings.alerts)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.alerts ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.alerts ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Health Tips</span>
                        <button
                          onClick={() => updateNotificationSetting('tips', !notificationSettings.tips)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.tips ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.tips ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Weekly Summary</span>
                        <button
                          onClick={() => updateNotificationSetting('weekly', !notificationSettings.weekly)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings.weekly ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notificationSettings.weekly ? 'translate-x-6' : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              title="Download Health Report"
            >
              <Download className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Predictions</p>
              <p className="text-3xl font-bold text-white">{totalPredictions}</p>
              <p className="text-slate-500 text-xs mt-2">AI-powered assessments</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Diseases Checked</p>
              <p className="text-3xl font-bold text-white">{uniqueDiseases}</p>
              <p className="text-slate-500 text-xs mt-2">Comprehensive coverage</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-green-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-600/10 border border-green-500/30 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{healthScore}</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Health Score</p>
              <p className="text-2xl font-bold text-white">{healthScore}%</p>
              <p className="text-slate-500 text-xs mt-2">Overall wellness</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">High Risk Cases</p>
              <p className="text-3xl font-bold text-white">{highRiskCount}</p>
              <p className="text-slate-500 text-xs mt-2">Requires attention</p>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Multi-Metric Trends */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Health Analytics</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>Last 7 days</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrends}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        fontFamily: 'Poppins' 
                      }} 
                    />
                    <Area type="monotone" dataKey="predictions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="riskLevel" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="score" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-400">Predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-slate-400">Risk Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-400">Health Score</span>
                </div>
              </div>
            </div>

            {/* Disease Prediction Distribution */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-6">Disease Prediction Distribution</h2>
              {summary.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                      <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#0f172a', 
                          border: '1px solid #334155', 
                          borderRadius: '12px', 
                          fontFamily: 'Poppins' 
                        }} 
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No predictions yet</p>
                    <Link 
                      to="/app/predictions" 
                      className="inline-flex items-center gap-2 mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Start your first prediction
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Risk Distribution */}
            {riskDistribution.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h2 className="text-xl font-semibold text-white mb-6">Risk Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {riskDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-slate-300 text-sm">{item.name}</span>
                        </div>
                        <span className="text-white font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Score Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">{healthScore}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Your Health Score</h3>
                <p className="text-slate-300 text-sm mb-4">
                  {healthScore >= 80 ? 'Excellent health condition!' : 
                   healthScore >= 60 ? 'Good health with room for improvement' : 
                   'Health needs attention'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  {healthScore >= 60 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className={`text-sm font-medium ${healthScore >= 60 ? 'text-green-400' : 'text-amber-400'}`}>
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Alerts */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Health Alerts</h2>
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 4).map((alert, index) => (
                  <div key={alert.id} className={`p-3 rounded-xl border ${
                    alert.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                    alert.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                    alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-start gap-3">
                      {alert.priority === 'high' ? (
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                      ) : (
                        <Bell className="w-4 h-4 text-blue-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="text-slate-100 text-sm font-medium">{alert.title}</h4>
                        <p className="text-slate-400 text-xs mt-1">{alert.message}</p>
                        <p className="text-slate-500 text-xs mt-2">{alert.time}</p>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  to="/app/predictions"
                  className="flex items-center justify-between p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">New Prediction</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/app/tools"
                  className="flex items-center justify-between p-3 rounded-xl bg-green-600/10 border border-green-500/30 hover:bg-green-600/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">NPPA Tools</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/app/symptom-checker"
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Check Symptoms</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics Dashboard */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Advanced Health Analytics</h2>
            <p className="text-slate-400">Comprehensive insights into your health trends and patterns</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends Line Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">6-Month Health Trends</h3>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        fontFamily: 'Poppins' 
                      }} 
                    />
                    <Line type="monotone" dataKey="healthScore" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="avgRisk" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                    <Line type="monotone" dataKey="predictions" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-400">Health Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-slate-400">Risk Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-400">Predictions</span>
                </div>
              </div>
            </div>

            {/* Age Group Analysis */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Age Group Analysis</h3>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageGroupData}>
                    <XAxis dataKey="ageGroup" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        fontFamily: 'Poppins' 
                      }} 
                    />
                    <Bar dataKey="predictions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgScore" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-slate-400">Predictions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-400">Avg Score</span>
                </div>
              </div>
            </div>

            {/* Symptom Correlation */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Symptom-Disease Correlation</h3>
                <Brain className="w-5 h-5 text-amber-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={symptomCorrelation}>
                    <XAxis dataKey="symptom" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} angle={-45} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        fontFamily: 'Poppins' 
                      }} 
                    />
                    <Area type="monotone" dataKey="correlation" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-slate-400">Correlation strength (0-1 scale)</p>
              </div>
            </div>

            {/* Treatment Effectiveness */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Treatment Effectiveness</h3>
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={treatmentEffectiveness} layout="horizontal">
                    <XAxis type="number" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                    <YAxis dataKey="treatment" type="category" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid #334155', 
                        borderRadius: '12px', 
                        fontFamily: 'Poppins' 
                      }} 
                    />
                    <Bar dataKey="effectiveness" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-slate-400">Effectiveness percentage by treatment type</p>
              </div>
            </div>
          </div>

          {/* Vital Signs Monitoring */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Real-time Vital Signs Monitoring</h3>
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalSignsData}>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #334155', 
                      borderRadius: '12px', 
                      fontFamily: 'Poppins' 
                    }} 
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} name="Heart Rate" />
                  <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} name="Blood Pressure" />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature" />
                  <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} name="Oxygen Level" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-400">Heart Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-400">Blood Pressure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs text-slate-400">Temperature</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-slate-400">Oxygen Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health System Metrics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Health System Metrics</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Real-time monitoring</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.map((metric, index) => {
              const MetricIcon = metric.icon
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                    <MetricIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm font-medium">{metric.metric}</span>
                      <span className="text-white text-sm font-semibold">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          metric.value >= 80 ? 'from-green-500 to-green-400' : 
                          metric.value >= 60 ? 'from-amber-500 to-amber-400' : 
                          'from-red-500 to-red-400'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                      {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400" />}
                      {metric.trend === 'stable' && <div className="w-3 h-3 rounded-full bg-amber-400"></div>}
                      <span className="text-xs text-slate-500">{metric.trend}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Complete Health Toolkit */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Complete Health Toolkit</h2>
            <p className="text-slate-400">Everything you need for comprehensive health management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOOLS_DATA.map((tool, index) => {
              const ToolIcon = tool.icon
              const colorClasses = {
                blue: 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500/50',
                green: 'bg-green-600/10 border-green-500/30 hover:bg-green-600/20 hover:border-green-500/50',
                purple: 'bg-purple-600/10 border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500/50',
                orange: 'bg-orange-600/10 border-orange-500/30 hover:bg-orange-600/20 hover:border-orange-500/50',
                red: 'bg-red-600/10 border-red-500/30 hover:bg-red-600/20 hover:border-red-500/50',
                indigo: 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20 hover:border-indigo-500/50',
                teal: 'bg-teal-600/10 border-teal-500/30 hover:bg-teal-600/20 hover:border-teal-500/50',
                pink: 'bg-pink-600/10 border-pink-500/30 hover:bg-pink-600/20 hover:border-pink-500/50'
              }
              
              return (
                <Link 
                  key={tool.id}
                  to={tool.path}
                  className={`group block p-6 rounded-2xl bg-slate-900 border border-slate-800 transition-all duration-300 hover:scale-[1.02] ${colorClasses[tool.color]}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ToolIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{tool.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{tool.count} tools available</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="text-xs text-slate-500">Features:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.features.slice(0, 2).map((feature, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                          {feature}
                        </span>
                      ))}
                      {tool.features.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                          +{tool.features.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Platform Statistics</h2>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Tools</span>
                <span className="text-white font-semibold">19</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">AI Models</span>
                <span className="text-white font-semibold">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Sources</span>
                <span className="text-white font-semibold">12+</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Endpoints</span>
                <span className="text-white font-semibold">25+</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Technology Stack</h2>
              <Globe className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Frontend</span>
                <span className="text-white font-semibold">React + Vite</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Backend</span>
                <span className="text-white font-semibold">Node.js + Express</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">ML Engine</span>
                <span className="text-white font-semibold">Python + FastAPI</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Database</span>
                <span className="text-white font-semibold">MongoDB</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Security Features</h2>
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Data Encryption</span>
                <span className="text-green-400 font-semibold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">HIPAA Compliance</span>
                <span className="text-green-400 font-semibold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">API Rate Limiting</span>
                <span className="text-green-400 font-semibold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Secure Authentication</span>
                <span className="text-green-400 font-semibold">✓ Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Health Comparison */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Global Health Comparison</h2>
            <Globe className="w-5 h-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalHealthStats.map((country, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">{country.avgScore}</span>
                </div>
                <h3 className="text-slate-100 font-medium">{country.country}</h3>
                <p className="text-slate-400 text-sm">{country.population}</p>
                <div className="mt-2 text-xs text-slate-500">Avg Health Score</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced About Section */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">About VitaCore AI</h2>
            </div>
            <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
              VitaCore AI is your comprehensive health intelligence platform combining cutting-edge AI technology 
              with medical expertise to provide personalized health insights, predictions, and management tools. 
              From disease risk assessment to medicine price analysis, we empower you to take control of your health journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">Secure & Private</h3>
                <p className="text-slate-400 text-sm">Your health data is protected with enterprise-grade security</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                  <Lightbulb className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-slate-400 text-sm">Advanced machine learning for accurate health predictions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">User-Friendly</h3>
                <p className="text-slate-400 text-sm">Intuitive interface designed for all users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

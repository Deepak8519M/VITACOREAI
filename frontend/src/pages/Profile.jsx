import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { 
  User, Mail, Phone, Calendar, MapPin, Shield, Heart, Activity, 
  Award, Bell, Settings, Download, Upload, Camera, Edit3, 
  CheckCircle2, AlertCircle, Clock, Star, TrendingUp, FileText,
  Stethoscope, Pill, FlaskConical, Dna, Globe, Brain, ArrowRight,
  Lock, Key, Smartphone, Monitor, Eye, EyeOff, Save, X
} from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState('personal')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Profile data - initialized with real user data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    bloodType: user?.bloodType || '',
    height: user?.height || '',
    weight: user?.weight || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || '',
    address: user?.address || '',
    occupation: user?.occupation || '',
    insuranceProvider: user?.insuranceProvider || '',
    insuranceId: user?.insuranceId || '',
    primaryPhysician: user?.primaryPhysician || '',
    physicianPhone: user?.physicianPhone || '',
    allergies: user?.allergies || '',
    medications: user?.medications || '',
    medicalConditions: user?.medicalConditions || '',
    lastCheckup: user?.lastCheckup || ''
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    predictions: true,
    alerts: true,
    tips: false,
    weekly: true,
    marketing: false
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareData: true,
    publicProfile: false,
    analytics: true,
    cookies: true,
    location: false,
    biometric: true
  })

  // Health stats - calculated from real platform data
  const [healthStats, setHealthStats] = useState({
    totalPredictions: 0,
    healthScore: 0,
    lastPrediction: null,
    conditionsMonitored: 0,
    riskLevel: 'Low',
    membershipSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-06-15',
    achievements: 0,
    streak: 0
  })

  // Load real health statistics
  const loadHealthStats = async () => {
    try {
      // Get prediction history
      const historyResponse = await api.get('/predictions/history')
      const predictions = historyResponse.data || []
      
      // Get prediction summary
      const summaryResponse = await api.get('/predictions/summary')
      const summary = summaryResponse.data || []
      
      // Calculate real stats
      const totalPredictions = predictions.length
      const lastPrediction = predictions.length > 0 ? new Date(predictions[0].createdAt).toLocaleDateString() : null
      const conditionsMonitored = summary.length
      
      // Calculate health score based on predictions
      let healthScore = 85 // Base score
      if (predictions.length > 0) {
        const lowRiskCount = predictions.filter(p => p.result?.risk === 'Low').length
        const riskPercentage = (lowRiskCount / predictions.length) * 100
        healthScore = Math.round(60 + (riskPercentage * 0.4)) // Score based on risk distribution
      }
      
      // Calculate risk level
      const highRiskCount = predictions.filter(p => p.result?.risk === 'High').length
      const mediumRiskCount = predictions.filter(p => p.result?.risk === 'Medium').length
      let riskLevel = 'Low'
      if (highRiskCount > 0) riskLevel = 'High'
      else if (mediumRiskCount > 0) riskLevel = 'Medium'
      
      // Calculate achievements based on activity
      const achievements = Math.min(12, Math.floor(totalPredictions / 5) + 1)
      
      // Calculate streak (consecutive days with predictions)
      let streak = 0
      if (predictions.length > 0) {
        const today = new Date()
        const sortedPredictions = predictions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        for (let i = 0; i < sortedPredictions.length; i++) {
          const predictionDate = new Date(sortedPredictions[i].createdAt)
          const daysDiff = Math.floor((today - predictionDate) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === i) {
            streak++
          } else {
            break
          }
        }
      }
      
      setHealthStats({
        totalPredictions,
        healthScore,
        lastPrediction,
        conditionsMonitored,
        riskLevel,
        membershipSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2023-06-15',
        achievements,
        streak
      })
    } catch (err) {
      console.error('Failed to load health stats:', err)
      // Set default values on error
      setHealthStats(prev => ({
        ...prev,
        totalPredictions: 0,
        healthScore: 75,
        lastPrediction: null,
        conditionsMonitored: 0
      }))
    }
  }

  // Load real recent activity
  const [recentActivity, setRecentActivity] = useState([])
  
  const loadRecentActivity = async () => {
    try {
      const response = await api.get('/predictions/history')
      const predictions = response.data || []
      
      const activities = predictions.slice(0, 5).map((prediction, index) => ({
        id: prediction.id,
        type: 'prediction',
        title: `${prediction.diseaseType} Prediction`,
        description: `Risk: ${prediction.result?.risk || 'Unknown'}`,
        date: new Date(prediction.createdAt).toLocaleDateString(),
        timeAgo: getTimeAgo(new Date(prediction.createdAt)),
        icon: Brain,
        color: prediction.result?.risk === 'High' ? 'red' : prediction.result?.risk === 'Medium' ? 'amber' : 'blue'
      }))
      
      setRecentActivity(activities)
    } catch (err) {
      console.error('Failed to load recent activity:', err)
      setRecentActivity([])
    }
  }
  
  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInMs = now - date
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  useEffect(() => {
    // Load all real data from API
    loadProfileData()
    loadHealthStats()
    loadRecentActivity()
  }, [])

  const loadProfileData = async () => {
    try {
      const response = await api.get('/users/profile')
      if (response.data) {
        setProfileData(prev => ({ 
          ...prev, 
          ...response.data,
          // Ensure user data is always included
          name: response.data.name || user?.name || '',
          email: response.data.email || user?.email || ''
        }))
      }
    } catch (err) {
      console.error('Failed to load profile data:', err)
      // Set basic user data on error
      setProfileData(prev => ({ 
        ...prev, 
        name: user?.name || '',
        email: user?.email || ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await api.put('/users/profile', profileData)
      setMsg('Profile updated successfully!')
      setEditMode(false)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMsg('Passwords do not match')
      return
    }
    
    setLoading(true)
    setMsg('')
    try {
      await api.put('/users/password', passwordData)
      setMsg('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setMsg(err.response?.data?.error || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('avatar', file)
        await api.post('/users/avatar', formData)
        setMsg('Avatar updated successfully!')
        loadProfileData()
      } catch (err) {
        setMsg('Avatar upload failed')
      } finally {
        setLoading(false)
      }
    }
  }

  const updateNotificationSetting = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }))
  }

  const updatePrivacySetting = (key, value) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your personal information and health data</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button 
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30">
        <div className="flex items-start gap-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
              <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium">
                Active Member
              </div>
            </div>
            <p className="text-slate-400 mb-4">{profileData.email}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{healthStats.healthScore}</div>
                <div className="text-xs text-slate-400">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{healthStats.totalPredictions}</div>
                <div className="text-xs text-slate-400">Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{healthStats.streak}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{healthStats.achievements}</div>
                <div className="text-xs text-slate-400">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'medical', label: 'Medical Info', icon: Heart },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'privacy', label: 'Privacy', icon: Lock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm cursor-not-allowed"
                    />
                    <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Blood Type</label>
                    <select
                      value={profileData.bloodType}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bloodType: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Physical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      value={profileData.height}
                      onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      value={profileData.weight}
                      onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Emergency Contact</label>
                    <input
                      type="text"
                      value={profileData.emergencyContact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Emergency Phone</label>
                    <input
                      type="tel"
                      value={profileData.emergencyPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-6 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Medical Info Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Medical Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Occupation</label>
                    <input
                      type="text"
                      value={profileData.occupation}
                      onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Allergies</label>
                    <textarea
                      value={profileData.allergies}
                      onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                      disabled={!editMode}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Current Medications</label>
                    <textarea
                      value={profileData.medications}
                      onChange={(e) => setProfileData(prev => ({ ...prev, medications: e.target.value }))}
                      disabled={!editMode}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Medical Conditions</label>
                    <textarea
                      value={profileData.medicalConditions}
                      onChange={(e) => setProfileData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                      disabled={!editMode}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Last Checkup</label>
                    <input
                      type="date"
                      value={profileData.lastCheckup}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastCheckup: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Insurance Provider</label>
                    <input
                      type="text"
                      value={profileData.insuranceProvider}
                      onChange={(e) => setProfileData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Insurance ID</label>
                    <input
                      type="text"
                      value={profileData.insuranceId}
                      onChange={(e) => setProfileData(prev => ({ ...prev, insuranceId: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Primary Physician</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Physician Name</label>
                    <input
                      type="text"
                      value={profileData.primaryPhysician}
                      onChange={(e) => setProfileData(prev => ({ ...prev, primaryPhysician: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Physician Phone</label>
                    <input
                      type="tel"
                      value={profileData.physicianPhone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, physicianPhone: e.target.value }))}
                      disabled={!editMode}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Two-Factor Authentication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Enable 2FA</p>
                      <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-white text-sm">Windows PC</p>
                        <p className="text-slate-400 text-xs">Chrome • New York, USA</p>
                      </div>
                    </div>
                    <button className="text-red-400 text-sm hover:text-red-300">Revoke</button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-white text-sm">iPhone 14</p>
                        <p className="text-slate-400 text-xs">Safari • New York, USA</p>
                      </div>
                    </div>
                    <button className="text-red-400 text-sm hover:text-red-300">Revoke</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-slate-400 text-sm">Receive updates via email</p>
                    </div>
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
                    <div>
                      <p className="text-white font-medium">SMS Notifications</p>
                      <p className="text-slate-400 text-sm">Get text message alerts</p>
                    </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-slate-400 text-sm">Browser push notifications</p>
                    </div>
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
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Notification Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Prediction Results</p>
                      <p className="text-slate-400 text-sm">Get notified about prediction results</p>
                    </div>
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
                    <div>
                      <p className="text-white font-medium">Health Alerts</p>
                      <p className="text-slate-400 text-sm">Important health notifications</p>
                    </div>
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
                    <div>
                      <p className="text-white font-medium">Health Tips</p>
                      <p className="text-slate-400 text-sm">Weekly health and wellness tips</p>
                    </div>
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
                    <div>
                      <p className="text-white font-medium">Weekly Summary</p>
                      <p className="text-slate-400 text-sm">Weekly health report summary</p>
                    </div>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Marketing</p>
                      <p className="text-slate-400 text-sm">Promotional offers and updates</p>
                    </div>
                    <button
                      onClick={() => updateNotificationSetting('marketing', !notificationSettings.marketing)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        notificationSettings.marketing ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationSettings.marketing ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Data Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Share Anonymous Data</p>
                      <p className="text-slate-400 text-sm">Help improve our services with anonymous data</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('shareData', !privacySettings.shareData)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        privacySettings.shareData ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        privacySettings.shareData ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Public Profile</p>
                      <p className="text-slate-400 text-sm">Make your profile visible to other users</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('publicProfile', !privacySettings.publicProfile)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        privacySettings.publicProfile ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        privacySettings.publicProfile ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Analytics</p>
                      <p className="text-slate-400 text-sm">Help us understand how you use our service</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('analytics', !privacySettings.analytics)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        privacySettings.analytics ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        privacySettings.analytics ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Location Services</p>
                      <p className="text-slate-400 text-sm">Allow location-based health recommendations</p>
                    </div>
                    <button
                      onClick={() => updatePrivacySetting('location', !privacySettings.location)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        privacySettings.location ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        privacySettings.location ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold text-white mb-6">Data Management</h3>
                <div className="space-y-4">
                  <button className="w-full px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-600/20 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download My Data
                  </button>
                  <button className="w-full px-4 py-3 rounded-xl bg-amber-600/10 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-600/20 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Request Data Report
                  </button>
                  <button className="w-full px-4 py-3 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-600/20 transition-colors flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Display */}
          {msg && (
            <div className={`p-4 rounded-xl ${
              msg.includes('failed') || msg.includes('do not match')
                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}>
              <div className="flex items-center gap-3">
                {msg.includes('failed') || msg.includes('do not match') ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <p className="text-sm font-medium">{msg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Health Stats Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-6">Health Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Member Since</span>
                <span className="text-white text-sm font-medium">{healthStats.membershipSince}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total Predictions</span>
                <span className="text-white text-sm font-medium">{healthStats.totalPredictions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Health Score</span>
                <span className="text-white text-sm font-medium">{healthStats.healthScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Risk Level</span>
                <span className={`text-sm font-medium ${
                  healthStats.riskLevel === 'Low' ? 'text-green-400' : 
                  healthStats.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{healthStats.riskLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Prediction</span>
                <span className="text-white text-sm font-medium">{healthStats.lastPrediction}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-600/20 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                View Health Report
              </button>
              <button className="w-full px-4 py-3 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-600/20 transition-colors flex items-center justify-center gap-2">
                <Award className="w-4 h-4" />
                View Achievements
              </button>
              <button className="w-full px-4 py-3 rounded-xl bg-green-600/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-600/20 transition-colors flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Health Trends
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${activity.color}-600/20 flex items-center justify-center`}>
                      <activity.icon className="w-4 h-4 text-${activity.color}-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.title}</p>
                      <p className="text-slate-400 text-xs">{activity.description}</p>
                      <p className="text-slate-500 text-xs">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No recent activity</p>
                  <Link 
                    to="/app/predictions" 
                    className="inline-flex items-center gap-2 mt-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Start your first prediction
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

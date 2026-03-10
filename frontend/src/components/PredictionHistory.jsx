import { useState, useEffect } from 'react'
import { 
  Calendar, Clock, TrendingUp, TrendingDown, Activity, Heart, Brain, Droplets, Wind, Scan, Zap,
  Filter, Search, Download, BarChart3, PieChart, Users, Target, Award, ChevronRight, Eye,
  AlertCircle, CheckCircle2, Info, Star, ArrowUp, ArrowDown, Minus, RefreshCw, FileText
} from 'lucide-react'
import api from '../utils/api'

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPredictionHistory()
  }, [])

  const fetchPredictionHistory = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/predictions/history')
      setPredictions(data)
      setError('')
    } catch (err) {
      console.error('Error fetching prediction history:', err)
      setError('Failed to load prediction history')
    } finally {
      setLoading(false)
    }
  }

  const getDiseaseIcon = (disease) => {
    const icons = {
      diabetes: Activity,
      heart: Heart,
      stroke: Brain,
      kidney: Droplets,
      liver: Activity,
      lung_cancer: Wind,
      breast_cancer: Scan,
      hypertension: Zap
    }
    return icons[disease] || Activity
  }

  const getDiseaseColor = (disease) => {
    const colors = {
      diabetes: 'blue',
      heart: 'red',
      stroke: 'purple',
      kidney: 'cyan',
      liver: 'green',
      lung_cancer: 'indigo',
      breast_cancer: 'pink',
      hypertension: 'orange'
    }
    return colors[disease] || 'blue'
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-600/10', border: 'border-blue-600/20', icon: 'text-blue-500' },
      red: { bg: 'bg-red-600/10', border: 'border-red-600/20', icon: 'text-red-500' },
      purple: { bg: 'bg-purple-600/10', border: 'border-purple-600/20', icon: 'text-purple-500' },
      cyan: { bg: 'bg-cyan-600/10', border: 'border-cyan-600/20', icon: 'text-cyan-500' },
      green: { bg: 'bg-green-600/10', border: 'border-green-600/20', icon: 'text-green-500' },
      indigo: { bg: 'bg-indigo-600/10', border: 'border-indigo-600/20', icon: 'text-indigo-500' },
      pink: { bg: 'bg-pink-600/10', border: 'border-pink-600/20', icon: 'text-pink-500' },
      orange: { bg: 'bg-orange-600/10', border: 'border-orange-600/20', icon: 'text-orange-500' }
    }
    return colors[color] || colors.blue
  }

  const getRiskColor = (risk) => {
    const colors = {
      Low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
      Medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
      High: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', icon: AlertCircle }
    }
    return colors[risk] || colors.Medium
  }

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-rose-400" />
    if (current < previous) return <ArrowDown className="w-4 h-4 text-emerald-400" />
    return <Minus className="w-4 h-4 text-amber-400" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getDiseaseName = (diseaseType) => {
    const names = {
      diabetes: 'Diabetes Mellitus',
      heart: 'Cardiovascular Disease',
      stroke: 'Stroke Risk',
      kidney: 'Chronic Kidney Disease',
      liver: 'Liver Disease',
      lung_cancer: 'Lung Cancer',
      breast_cancer: 'Breast Cancer',
      hypertension: 'Hypertension'
    }
    return names[diseaseType] || diseaseType
  }

  const filteredPredictions = predictions.filter(prediction => {
    const matchesFilter = filter === 'all' || prediction.risk.toLowerCase() === filter.toLowerCase()
    const matchesSearch = getDiseaseName(prediction.diseaseType).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatDate(prediction.createdAt).includes(searchTerm)
    return matchesFilter && matchesSearch
  })

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'risk') return (b.result?.percentage || 0) - (a.result?.percentage || 0)
    if (sortBy === 'confidence') return (b.result?.confidence || 0) - (a.result?.confidence || 0)
    return 0
  })

  const stats = {
    total: predictions.length,
    highRisk: predictions.filter(p => p.result?.risk === 'High').length,
    avgRisk: predictions.length > 0 ? Math.round(predictions.reduce((sum, p) => sum + (p.result?.percentage || 0), 0) / predictions.length) : 0,
    followUps: predictions.length // All predictions should have follow-up recommendations
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Prediction History
          </h2>
          <p className="text-slate-400">Track your health assessment history and trends</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchPredictionHistory}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Total Assessments</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-2xl font-bold text-white">{stats.highRisk}</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">High Risk Results</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-2xl font-bold text-white">{stats.avgRisk}%</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Average Risk Score</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-2xl font-bold text-white">{stats.followUps}</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Follow-ups Required</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search predictions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          >
            <option value="date">Sort by Date</option>
            <option value="risk">Sort by Risk</option>
            <option value="confidence">Sort by Confidence</option>
          </select>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-3">
        {sortedPredictions.map((prediction, idx) => {
          const DiseaseIcon = getDiseaseIcon(prediction.diseaseType)
          const diseaseColor = getDiseaseColor(prediction.diseaseType)
          const colorClasses = getColorClasses(diseaseColor)
          const riskColors = getRiskColor(prediction.result?.risk || 'Medium')
          const RiskIcon = riskColors.icon
          
          return (
            <div key={prediction._id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                    <DiseaseIcon className={`w-6 h-6 ${colorClasses.icon}`} strokeWidth={1.8} />
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold">{getDiseaseName(prediction.diseaseType)}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(prediction.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(prediction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <RiskIcon className={`w-4 h-4 ${riskColors.text}`} />
                      <span className={`font-semibold ${riskColors.text}`}>{prediction.result?.risk || 'Medium'}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{prediction.result?.percentage || 0}%</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Model Accuracy</p>
                    <p className="text-sm font-medium text-white">61%</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
                      <FileText className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-400 text-sm">Follow-up consultation recommended</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedPredictions.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">No Prediction History</h3>
          <p className="text-slate-400 mb-4">You haven't made any predictions yet. Start by taking a health assessment.</p>
          <button 
            onClick={() => window.location.href = '/app/predictions'}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Make First Prediction
          </button>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Error Loading History</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={fetchPredictionHistory}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default PredictionHistory

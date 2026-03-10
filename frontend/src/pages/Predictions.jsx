import { Link } from 'react-router-dom'
import { Heart, Brain, Activity, Droplets, Wind, Scan, Zap, TrendingUp, Shield, Clock, Star, ArrowRight, Sparkles, BarChart3, Users, Target, Calendar, History } from 'lucide-react'

const DISEASES = [
  { 
    id: 'diabetes', 
    name: 'Diabetes', 
    icon: Activity, 
    desc: 'Predict diabetes risk from metabolic factors',
    color: 'blue',
    prevalence: '10.5%',
    accuracy: '59%',
    timeEstimate: '2 min',
    riskLevel: 'moderate',
    tags: ['Metabolic', 'Blood Sugar', 'Lifestyle']
  },
  { 
    id: 'heart', 
    name: 'Heart Disease', 
    icon: Heart, 
    desc: 'Assess cardiovascular disease likelihood',
    color: 'red',
    prevalence: '31.0%',
    accuracy: '61%',
    timeEstimate: '3 min',
    riskLevel: 'high',
    tags: ['Cardiovascular', 'Critical', 'Age-related']
  },
  { 
    id: 'stroke', 
    name: 'Stroke', 
    icon: Brain, 
    desc: 'Estimate stroke risk based on lifestyle & health',
    color: 'purple',
    prevalence: '2.5%',
    accuracy: '59%',
    timeEstimate: '3 min',
    riskLevel: 'high',
    tags: ['Neurological', 'Emergency', 'Blood Pressure']
  },
  { 
    id: 'kidney', 
    name: 'Kidney Disease', 
    icon: Droplets, 
    desc: 'Evaluate kidney function indicators',
    color: 'cyan',
    prevalence: '15.0%',
    accuracy: '61%',
    timeEstimate: '2 min',
    riskLevel: 'moderate',
    tags: ['Renal', 'Filtration', 'Metabolic']
  },
  { 
    id: 'liver', 
    name: 'Liver Disease', 
    icon: Activity, 
    desc: 'Assess liver health markers',
    color: 'green',
    prevalence: '4.5%',
    accuracy: '59%',
    timeEstimate: '2 min',
    riskLevel: 'moderate',
    tags: ['Hepatic', 'Detox', 'Enzymes']
  },
  { 
    id: 'lung_cancer', 
    name: 'Lung Cancer', 
    icon: Wind, 
    desc: 'Risk assessment from symptoms & factors',
    color: 'indigo',
    prevalence: '2.2%',
    accuracy: '58%',
    timeEstimate: '4 min',
    riskLevel: 'high',
    tags: ['Oncology', 'Respiratory', 'Critical']
  },
  { 
    id: 'breast_cancer', 
    name: 'Breast Cancer', 
    icon: Scan, 
    desc: 'Prediction from tissue measurements',
    color: 'pink',
    prevalence: '12.9%',
    accuracy: '59%',
    timeEstimate: '3 min',
    riskLevel: 'high',
    tags: ['Oncology', 'Screening', 'Women Health']
  },
  { 
    id: 'hypertension', 
    name: 'Hypertension', 
    icon: Zap, 
    desc: 'Blood pressure risk prediction',
    color: 'orange',
    prevalence: '45.0%',
    accuracy: '66%',
    timeEstimate: '2 min',
    riskLevel: 'moderate',
    tags: ['Cardiovascular', 'Silent Killer', 'Lifestyle']
  }
]

const getColorClasses = (color) => {
  const colors = {
    blue: { bg: 'bg-blue-600/10', border: 'border-blue-600/20', icon: 'text-blue-500', hover: 'hover:bg-blue-600/15', glow: 'shadow-blue-500/10' },
    red: { bg: 'bg-red-600/10', border: 'border-red-600/20', icon: 'text-red-500', hover: 'hover:bg-red-600/15', glow: 'shadow-red-500/10' },
    purple: { bg: 'bg-purple-600/10', border: 'border-purple-600/20', icon: 'text-purple-500', hover: 'hover:bg-purple-600/15', glow: 'shadow-purple-500/10' },
    cyan: { bg: 'bg-cyan-600/10', border: 'border-cyan-600/20', icon: 'text-cyan-500', hover: 'hover:bg-cyan-600/15', glow: 'shadow-cyan-500/10' },
    green: { bg: 'bg-green-600/10', border: 'border-green-600/20', icon: 'text-green-500', hover: 'hover:bg-green-600/15', glow: 'shadow-green-500/10' },
    indigo: { bg: 'bg-indigo-600/10', border: 'border-indigo-600/20', icon: 'text-indigo-500', hover: 'hover:bg-indigo-600/15', glow: 'shadow-indigo-500/10' },
    pink: { bg: 'bg-pink-600/10', border: 'border-pink-600/20', icon: 'text-pink-500', hover: 'hover:bg-pink-600/15', glow: 'shadow-pink-500/10' },
    orange: { bg: 'bg-orange-600/10', border: 'border-orange-600/20', icon: 'text-orange-500', hover: 'hover:bg-orange-600/15', glow: 'shadow-orange-500/10' }
  }
  return colors[color] || colors.blue
}

const getRiskLevelColor = (level) => {
  const colors = {
    low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  }
  return colors[level] || colors.moderate
}

export default function Predictions() {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-500" strokeWidth={2} />
          <h1 className="text-3xl font-bold text-white">AI Disease Predictions</h1>
          <Sparkles className="w-6 h-6 text-blue-500" strokeWidth={2} />
        </div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Advanced machine learning models for early disease detection and risk assessment
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-6">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 justify-center">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-white">8</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Diseases Covered</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 justify-center">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-white">60%</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Avg Accuracy</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-bold text-white">2.5</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Min Test Time</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 justify-center">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold text-white">50K+</span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Predictions Made</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-3 mt-6">
          <Link 
            to="/app/predictions/history"
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            View History
          </Link>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Assessment
          </button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-2 justify-center">
        {['All', 'Most Common', 'Critical', 'Preventable', 'Screening'].map((filter) => (
          <button
            key={filter}
            className="px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm hover:border-blue-500 hover:text-blue-400 transition-all"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Disease Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DISEASES.map(({ id, name, icon: Icon, desc, color, prevalence, accuracy, timeEstimate, riskLevel, tags }) => {
          const colorClasses = getColorClasses(color)
          const riskColor = getRiskLevelColor(riskLevel)
          
          return (
            <Link key={id} to={`/app/predictions/${id}`}
              className={`group block p-6 rounded-2xl bg-slate-900 border ${colorClasses.border} hover:border-slate-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${colorClasses.glow}`}>
              
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center group-hover:${colorClasses.hover} transition-all duration-300`}>
                  <Icon className={`w-6 h-6 ${colorClasses.icon}`} strokeWidth={1.8} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${riskColor} border font-medium`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-lg bg-slate-800/50 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-slate-500">Prevalence</p>
                  <p className="text-sm font-semibold text-white">{prevalence}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-slate-500">Accuracy</p>
                  <p className="text-sm font-semibold text-green-400">{accuracy}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/30">
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="text-sm font-semibold text-blue-400">{timeEstimate}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className={`text-sm font-medium ${colorClasses.icon} group-hover:underline flex items-center gap-1`}>
                  Run prediction
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-3 h-3 text-amber-500 fill-current" strokeWidth={0} />
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20">
          <Shield className="w-5 h-5 text-blue-500" strokeWidth={2} />
          <p className="text-slate-300 text-sm">
            All predictions are powered by medically validated AI models
          </p>
        </div>
      </div>
    </div>
  )
}

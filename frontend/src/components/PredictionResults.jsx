import { useState, useEffect } from 'react'
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, Activity, Heart, Brain, Droplets, Wind, Scan, Zap,
  Download, Share2, FileText, Award, Target, Shield, AlertCircle, CheckCircle2, Info, Calendar,
  Users, Clock, Star, ArrowRight, ArrowUp, ArrowDown, Minus, ChevronRight, ChevronLeft
} from 'lucide-react'

const PredictionResults = ({ result, disease, formData, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showComparison, setShowComparison] = useState(false)

  const getRiskColor = (risk) => {
    const colors = {
      Low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', progress: 'bg-emerald-500', icon: CheckCircle2 },
      Medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', progress: 'bg-amber-500', icon: AlertCircle },
      High: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', progress: 'bg-rose-500', icon: AlertCircle }
    }
    return colors[risk] || colors.Medium
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

  const getDiseaseSpecificDiet = (disease) => {
    const diets = {
      diabetes: [
        "Low glycemic index foods (brown rice, quinoa)",
        "High-fiber vegetables (broccoli, spinach, cauliflower)",
        "Lean proteins (chicken breast, fish, tofu)",
        "Healthy fats (avocado, nuts, olive oil)",
        "Portion control and regular meal timing"
      ],
      heart: [
        "Omega-3 rich foods (salmon, walnuts, flaxseeds)",
        "Whole grains (oats, brown rice, whole wheat)",
        "Colorful fruits and vegetables",
        "Low-fat dairy products",
        "Limited saturated and trans fats"
      ],
      stroke: [
        "Potassium-rich foods (bananas, sweet potatoes)",
        "Leafy green vegetables (spinach, kale)",
        "Low-sodium options",
        "Berries and antioxidant-rich fruits",
        "Lean proteins and healthy fats"
      ],
      kidney: [
        "Low-phosphorus foods (apples, berries)",
        "Controlled protein portions",
        "Low-sodium seasonings and herbs",
        "Kidney-friendly vegetables (cauliflower, bell peppers)",
        "Adequate hydration with water"
      ],
      liver: [
        "Cruciferous vegetables (broccoli, Brussels sprouts)",
        "Antioxidant-rich foods (berries, green tea)",
        "Lean proteins and limited fats",
        "Whole grains and fiber-rich foods",
        "Limited processed foods and additives"
      ],
      lung_cancer: [
        "Beta-carotene rich foods (carrots, sweet potatoes)",
        "Cruciferous vegetables (broccoli, cauliflower)",
        "Antioxidant-rich berries and fruits",
        "Green tea and herbal teas",
        "Vitamin D rich foods (fortified dairy, fatty fish)"
      ],
      breast_cancer: [
        "Phytoestrogen-rich foods (soy, flaxseeds)",
        "High-fiber foods (beans, whole grains)",
        "Colorful fruits and vegetables",
        "Healthy fats (olive oil, avocados)",
        "Green tea and turmeric"
      ],
      hypertension: [
        "DASH diet approved foods",
        "High-potassium foods (bananas, potatoes, spinach)",
        "Low-sodium alternatives",
        "Magnesium-rich foods (dark chocolate, nuts)",
        "Calcium-rich foods (low-fat dairy, leafy greens)"
      ]
    }
    return diets[disease] || ["Balanced diet with fruits and vegetables"]
  }

  const getDiseaseSpecificExercise = (disease) => {
    const exercises = {
      diabetes: [
        "30 minutes moderate exercise daily",
        "Resistance training 2-3 times per week",
        "Walking after meals to control blood sugar",
        "Yoga for stress management",
        "Monitor blood glucose during exercise"
      ],
      heart: [
        "Cardiovascular exercise (walking, cycling, swimming)",
        "Moderate intensity for 150 minutes weekly",
        "Strength training 2 times per week",
        "Warm-up and cool-down important",
        "Monitor heart rate during exercise"
      ],
      stroke: [
        "Physical therapy if mobility affected",
        "Balance and coordination exercises",
        "Range of motion exercises",
        "Assisted exercises if needed",
        "Consistent daily movement"
      ],
      kidney: [
        "Low to moderate intensity exercise",
        "Walking or light cycling",
        "Avoid high-impact activities",
        "Stay hydrated during exercise",
        "Monitor for fatigue"
      ],
      liver: [
        "Gentle to moderate exercise",
        "Walking or yoga",
        "Avoid strenuous activity if fatigued",
        "Consistent light activity",
        "Listen to body's energy levels"
      ],
      lung_cancer: [
        "Breathing exercises and deep breathing",
        "Light walking as tolerated",
        "Chest expansion exercises",
        "Energy conservation techniques",
        "Pulmonary rehabilitation if available"
      ],
      breast_cancer: [
        "Gentle stretching and yoga",
        "Walking and light cardio",
        "Strength training for affected arm",
        "Lymphedema prevention exercises",
        "Stress reduction activities"
      ],
      hypertension: [
        "Regular aerobic exercise (brisk walking)",
        "30 minutes most days of the week",
        "Cycling or swimming",
        "Resistance training with light weights",
        "Avoid holding breath during exercise"
      ]
    }
    return exercises[disease] || ["Regular physical activity as tolerated"]
  }

  const getDiseaseSpecificLifestyle = (disease) => {
    const lifestyles = {
      diabetes: [
        "Regular blood glucose monitoring",
        "Stress management techniques",
        "Adequate sleep (7-8 hours)",
        "Foot care and regular checks",
        "Medication adherence if prescribed"
      ],
      heart: [
        "Blood pressure monitoring",
        "Cholesterol level tracking",
        "Stress reduction (meditation, hobbies)",
        "Quit smoking if applicable",
        "Limit alcohol consumption"
      ],
      stroke: [
        "Blood pressure control",
        "Atrial fibrillation monitoring if applicable",
        "Fall prevention measures",
        "Medication compliance",
        "Regular medical follow-ups"
      ],
      kidney: [
        "Blood pressure control",
        "Regular kidney function tests",
        "Medication review for kidney safety",
        "Fluid intake monitoring",
        "Avoid NSAIDs and certain medications"
      ],
      liver: [
        "Complete alcohol abstinence",
        "Regular liver function tests",
        "Vaccination updates",
        "Avoid hepatotoxic substances",
        "Weight management"
      ],
      lung_cancer: [
        "Complete smoking cessation",
        "Avoid secondhand smoke",
        "Air quality awareness",
        "Regular screenings as recommended",
        "Emotional support and counseling"
      ],
      breast_cancer: [
        "Regular breast self-exams",
        "Clinical exams as recommended",
        "Emotional support systems",
        "Stress management",
        "Hormone therapy considerations"
      ],
      hypertension: [
        "Daily blood pressure monitoring",
        "Sodium intake tracking",
        "Stress management techniques",
        "Regular medical check-ups",
        "Medication adherence"
      ]
    }
    return lifestyles[disease] || ["Healthy lifestyle habits and regular check-ups"]
  }

  const getDiseaseSpecificMonitoring = (disease) => {
    const monitoring = {
      diabetes: [
        "Blood glucose levels daily",
        "HbA1c every 3 months",
        "Blood pressure weekly",
        "Foot examination daily",
        "Weight monitoring weekly"
      ],
      heart: [
        "Blood pressure monitoring",
        "Cholesterol levels annually",
        "Heart rate monitoring",
        "Weight management",
        "Symptom tracking (chest pain, shortness of breath)"
      ],
      stroke: [
        "Blood pressure daily",
        "Blood sugar monitoring",
        "Cholesterol levels",
        "Neurological assessments",
        "Medication side effects"
      ],
      kidney: [
        "Blood pressure monitoring",
        "Creatinine levels regularly",
        "GFR tracking",
        "Protein in urine tests",
        "Electrolyte levels"
      ],
      liver: [
        "Liver function tests regularly",
        "Bilirubin levels",
        "Enzyme level monitoring",
        "Alcohol abstinence verification",
        "Weight and appetite tracking"
      ],
      lung_cancer: [
        "Regular imaging as recommended",
        "Breathing function tests",
        "Symptom tracking",
        "Treatment side effects",
        "Quality of life assessments"
      ],
      breast_cancer: [
        "Regular mammograms",
        "Self-breast exams monthly",
        "Clinical exams annually",
        "Treatment response monitoring",
        "Reconstruction considerations"
      ],
      hypertension: [
        "Daily blood pressure readings",
        "Home monitoring device use",
        "Medication effectiveness",
        "Lifestyle compliance tracking",
        "Regular doctor visits"
      ]
    }
    return monitoring[disease] || ["Regular medical monitoring and follow-ups"]
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

  const riskColors = getRiskColor(result.risk)
  const diseaseColor = getDiseaseColor(disease)
  const colorClasses = getColorClasses(diseaseColor)
  const DiseaseIcon = getDiseaseIcon(disease)
  const RiskIcon = riskColors.icon

  // Mock data for charts and comparisons
  const riskDistribution = [
    { range: 'Low (0-30%)', percentage: 35, color: 'bg-emerald-500' },
    { range: 'Medium (30-60%)', percentage: 45, color: 'bg-amber-500' },
    { range: 'High (60-100%)', percentage: 20, color: 'bg-rose-500' }
  ]

  const riskFactors = [
    { factor: 'Age', impact: result.risk === 'High' ? 85 : result.risk === 'Medium' ? 60 : 30, status: result.risk === 'High' ? 'high' : result.risk === 'Medium' ? 'medium' : 'low' },
    { factor: 'BMI', impact: result.risk === 'High' ? 75 : result.risk === 'Medium' ? 50 : 25, status: result.risk === 'High' ? 'high' : result.risk === 'Medium' ? 'medium' : 'low' },
    { factor: 'Family History', impact: result.risk === 'High' ? 90 : result.risk === 'Medium' ? 65 : 35, status: result.risk === 'High' ? 'high' : result.risk === 'Medium' ? 'medium' : 'low' },
    { factor: 'Lifestyle', impact: result.risk === 'High' ? 70 : result.risk === 'Medium' ? 45 : 20, status: result.risk === 'High' ? 'high' : result.risk === 'Medium' ? 'medium' : 'low' }
  ]

  const historicalData = [
    { date: '2024-01', risk: 25, prediction: 'Low' },
    { date: '2024-02', risk: 32, prediction: 'Low' },
    { date: '2024-03', risk: 45, prediction: 'Medium' },
    { date: '2024-04', risk: result.percentage, prediction: result.risk }
  ]

  const getImpactIcon = (impact) => {
    if (impact >= 70) return <ArrowUp className="w-4 h-4 text-rose-400" />
    if (impact >= 40) return <Minus className="w-4 h-4 text-amber-400" />
    return <ArrowDown className="w-4 h-4 text-emerald-400" />
  }

  const getImpactColor = (impact) => {
    if (impact >= 70) return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    if (impact >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className={`p-6 rounded-2xl bg-slate-900 border ${riskColors.border}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
              <DiseaseIcon className={`w-7 h-7 ${colorClasses.icon}`} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Prediction Results</h2>
              <p className="text-slate-400">{disease.replace('_', ' ').charAt(0).toUpperCase() + disease.slice(1)} Risk Assessment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors">
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Risk Score */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${riskColors.bg} border ${riskColors.border}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RiskIcon className={`w-5 h-5 ${riskColors.text}`} />
                <h3 className="text-lg font-semibold text-white">Risk Level</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColors.text} bg-slate-900/50`}>
                {result.risk}
              </span>
            </div>
            <div className="text-5xl font-bold text-white mb-4">{result.percentage}%</div>
            <div className="w-full bg-slate-800 rounded-full h-4 mb-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${riskColors.progress}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Model Accuracy</span>
              <span className="text-white font-medium">72.5%</span>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
            <div className="space-y-3">
              {riskDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{item.range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-300 text-sm w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {['overview', 'factors', 'history', 'comparison'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab 
                ? 'text-blue-400 border-blue-400' 
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Analysis Summary
              </h3>
              <p className="text-slate-300 leading-relaxed mb-4">{result.explanation}</p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                  <Target className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-slate-400 text-sm">Assessment Date</p>
                    <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-slate-400 text-sm">Model Accuracy</p>
                    <p className="text-white font-medium">72.5%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Personalized Health Plan
              </h3>
              
              {/* General Recommendations */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Health Recommendations
                </h4>
                <div className="space-y-2">
                  {result.suggestions?.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disease-Specific Information */}
              <div className="mb-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  {disease.charAt(0).toUpperCase() + disease.slice(1)} Management
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Diet Recommendations */}
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                    <h5 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Diet & Nutrition
                    </h5>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      {getDiseaseSpecificDiet(disease).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exercise Recommendations */}
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                    <h5 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Exercise & Activity
                    </h5>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      {getDiseaseSpecificExercise(disease).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lifestyle Recommendations */}
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                    <h5 className="text-purple-400 font-medium mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Lifestyle Changes
                    </h5>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      {getDiseaseSpecificLifestyle(disease).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Monitoring Recommendations */}
                  <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                    <h5 className="text-cyan-400 font-medium mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                      Monitoring & Tracking
                    </h5>
                    <ul className="space-y-1 text-slate-300 text-sm">
                      {getDiseaseSpecificMonitoring(disease).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Consultation Alert */}
            <div className={`p-4 rounded-xl ${result.risk === 'High' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'} flex items-start gap-3`}>
              <AlertCircle className={`w-5 h-5 ${result.risk === 'High' ? 'text-rose-400' : 'text-amber-400'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-sm font-medium mb-1 ${result.risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                  Medical Consultation Required
                </p>
                <p className={`${result.risk === 'High' ? 'text-rose-300/70' : 'text-amber-300/70'} text-sm`}>
                  {result.consult_doctor}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'factors' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Risk Factor Analysis
              </h3>
              <div className="space-y-4">
                {riskFactors.map((factor, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{factor.factor}</span>
                        {getImpactIcon(factor.impact)}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getImpactColor(factor.impact)}`}>
                        {factor.status.charAt(0).toUpperCase() + factor.status.slice(1)} Impact
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          factor.impact >= 70 ? 'bg-rose-500' : 
                          factor.impact >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${factor.impact}%` }}
                      />
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Impact Score: {factor.impact}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Key Insights
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Primary Risk Driver</p>
                    <p className="text-slate-400 text-sm">Age and family history are the strongest contributors to your risk profile</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Modifiable Factors</p>
                    <p className="text-slate-400 text-sm">Lifestyle changes could reduce your risk by up to 30%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                  <div>
                    <p className="text-white text-sm font-medium">Positive Indicators</p>
                    <p className="text-slate-400 text-sm">Several health markers are within normal ranges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Historical Trends
              </h3>
              <div className="space-y-4">
                {historicalData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-sm">{data.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{data.risk}%</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          data.prediction === 'Low' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                          data.prediction === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                          'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        } border`}>
                          {data.prediction}
                        </span>
                      </div>
                      {idx < historicalData.length - 1 && (
                        <div className="flex items-center gap-1">
                          {data.risk < historicalData[idx + 1].risk ? (
                            <TrendingUp className="w-4 h-4 text-rose-400" />
                          ) : data.risk > historicalData[idx + 1].risk ? (
                            <TrendingDown className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Progress Summary
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">-15%</p>
                  <p className="text-slate-400 text-sm">Risk Change</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-2xl font-bold text-blue-400 mb-1">4</p>
                  <p className="text-slate-400 text-sm">Assessments</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-2xl font-bold text-amber-400 mb-1">3mo</p>
                  <p className="text-slate-400 text-sm">Tracking Period</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" />
                Population Comparison
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Your Risk Score</span>
                    <span className="text-blue-400 font-bold">{result.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="h-3 rounded-full bg-blue-500" style={{ width: `${result.percentage}%` }} />
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Average Risk (Your Age Group)</span>
                    <span className="text-amber-400 font-bold">42%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="h-3 rounded-full bg-amber-500" style={{ width: '42%' }} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">General Population</span>
                    <span className="text-emerald-400 font-bold">28%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="h-3 rounded-full bg-emerald-500" style={{ width: '28%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Risk Percentiles
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-2xl font-bold text-rose-400 mb-1">78th</p>
                  <p className="text-slate-400 text-sm">Overall Percentile</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-800/30">
                  <p className="text-2xl font-bold text-amber-400 mb-1">65th</p>
                  <p className="text-slate-400 text-sm">Age Group Percentile</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
          <Activity className="w-4 h-4" />
          Book Consultation
        </button>
        <button className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
          <BarChart3 className="w-4 h-4" />
          View Detailed Report
        </button>
        <button 
          onClick={onClose}
          className="px-6 py-3 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default PredictionResults

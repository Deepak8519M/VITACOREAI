import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  AlertCircle, CheckCircle2, Info, Loader2, TrendingUp, Activity, Heart, Brain, Droplets, Wind, Scan, Zap,
  ArrowRight, ArrowLeft, Save, Download, Share2, RefreshCw, Eye, EyeOff, Calculator, FileText, Shield,
  Clock, Target, Award, BarChart3, PieChart, TrendingDown, Users, Stethoscope, Pill, FlaskConical
} from 'lucide-react'
import api from '../utils/api'
import PredictionResults from '../components/PredictionResults'

const SCHEMAS = {
  diabetes: [
    { key: 'pregnancies', label: 'Pregnancies', type: 'number', default: 0, icon: Activity, unit: '', range: [0, 20], description: 'Number of pregnancies' },
    { key: 'glucose', label: 'Glucose Level', type: 'number', default: 100, icon: Droplets, unit: 'mg/dL', range: [50, 200], description: 'Blood glucose concentration' },
    { key: 'blood_pressure', label: 'Blood Pressure', type: 'number', default: 70, icon: Heart, unit: 'mm Hg', range: [40, 200], description: 'Diastolic blood pressure' },
    { key: 'skin_thickness', label: 'Skin Thickness', type: 'number', default: 20, icon: Activity, unit: 'mm', range: [0, 100], description: 'Triceps skin fold thickness' },
    { key: 'insulin', label: 'Insulin', type: 'number', default: 80, icon: Activity, unit: 'µU/mL', range: [0, 900], description: '2-Hour serum insulin' },
    { key: 'bmi', label: 'BMI', type: 'number', default: 25, icon: Activity, unit: 'kg/m²', range: [10, 60], description: 'Body mass index' },
    { key: 'diabetes_pedigree', label: 'Diabetes Pedigree', type: 'number', default: 0.5, icon: Activity, unit: '', step: 0.01, range: [0, 3], description: 'Diabetes family history function' },
    { key: 'age', label: 'Age', type: 'number', default: 35, icon: Clock, unit: 'years', range: [1, 100], description: 'Age in years' }
  ],
  heart: [
    { key: 'age', label: 'Age', type: 'number', default: 55, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'sex', label: 'Sex', type: 'select', default: 1, icon: Users, options: [{value: 1, label: 'Male'}, {value: 0, label: 'Female'}] },
    { key: 'cp', label: 'Chest Pain Type', type: 'select', default: 0, icon: Heart, options: [
      {value: 0, label: 'Typical Angina'}, {value: 1, label: 'Atypical Angina'}, 
      {value: 2, label: 'Non-anginal Pain'}, {value: 3, label: 'Asymptomatic'}
    ]},
    { key: 'trestbps', label: 'Resting Blood Pressure', type: 'number', default: 120, icon: Heart, unit: 'mm Hg', range: [80, 200] },
    { key: 'chol', label: 'Cholesterol', type: 'number', default: 200, icon: Activity, unit: 'mg/dL', range: [100, 600] },
    { key: 'fbs', label: 'Fasting Blood Sugar', type: 'select', default: 0, icon: Activity, options: [
      {value: 0, label: '< 120 mg/dL'}, {value: 1, label: '> 120 mg/dL'}
    ]},
    { key: 'restecg', label: 'Rest ECG', type: 'select', default: 0, icon: Activity, options: [
      {value: 0, label: 'Normal'}, {value: 1, label: 'ST-T abnormality'}, {value: 2, label: 'LV hypertrophy'}
    ]},
    { key: 'thalach', label: 'Max Heart Rate', type: 'number', default: 150, icon: Heart, unit: 'bpm', range: [60, 220] },
    { key: 'exang', label: 'Exercise Angina', type: 'select', default: 0, icon: Heart, options: [
      {value: 0, label: 'No'}, {value: 1, label: 'Yes'}
    ]},
    { key: 'oldpeak', label: 'ST Depression', type: 'number', default: 1, icon: Activity, unit: 'mm', step: 0.1, range: [0, 10] },
    { key: 'slope', label: 'ST Slope', type: 'select', default: 1, icon: TrendingUp, options: [
      {value: 0, label: 'Upsloping'}, {value: 1, label: 'Flat'}, {value: 2, label: 'Downsloping'}
    ]},
    { key: 'ca', label: 'Major Vessels', type: 'number', default: 0, icon: Activity, unit: '', range: [0, 4] },
    { key: 'thal', label: 'Thalassemia', type: 'select', default: 2, icon: Activity, options: [
      {value: 1, label: 'Normal'}, {value: 2, label: 'Fixed defect'}, {value: 3, label: 'Reversible defect'}
    ]}
  ],
  stroke: [
    { key: 'gender', label: 'Gender', type: 'select', default: 1, icon: Users, options: [{value: 1, label: 'Male'}, {value: 0, label: 'Female'}] },
    { key: 'age', label: 'Age', type: 'number', default: 55, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'hypertension', label: 'Hypertension', type: 'select', default: 0, icon: Heart, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'heart_disease', label: 'Heart Disease', type: 'select', default: 0, icon: Heart, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'ever_married', label: 'Marital Status', type: 'select', default: 1, icon: Users, options: [{value: 0, label: 'Never married'}, {value: 1, label: 'Ever married'}] },
    { key: 'work_type', label: 'Work Type', type: 'select', default: 2, icon: Activity, options: [
      {value: 0, label: 'Never worked'}, {value: 1, label: 'Private'}, {value: 2, label: 'Self-employed'}, 
      {value: 3, label: 'Govt job'}, {value: 4, label: 'Children'}, {value: 5, label: 'Student'}
    ]},
    { key: 'residence_type', label: 'Residence Type', type: 'select', default: 1, icon: Activity, options: [
      {value: 0, label: 'Rural'}, {value: 1, label: 'Urban'}
    ]},
    { key: 'avg_glucose_level', label: 'Average Glucose', type: 'number', default: 100, icon: Activity, unit: 'mg/dL', range: [50, 300] },
    { key: 'bmi', label: 'BMI', type: 'number', default: 25, icon: Activity, unit: 'kg/m²', range: [10, 60] },
    { key: 'smoking_status', label: 'Smoking Status', type: 'select', default: 1, icon: Activity, options: [
      {value: 0, label: 'Never smoked'}, {value: 1, label: 'Formerly smoked'}, {value: 2, label: 'Smokes'}, {value: 3, label: 'Unknown'}
    ]}
  ],
  kidney: [
    { key: 'age', label: 'Age', type: 'number', default: 55, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'bp', label: 'Blood Pressure', type: 'number', default: 80, icon: Heart, unit: 'mm Hg', range: [50, 180] },
    { key: 'sg', label: 'Specific Gravity', type: 'number', default: 1.02, icon: Droplets, unit: '', step: 0.01, range: [1.0, 1.05] },
    { key: 'al', label: 'Albumin', type: 'number', default: 0, icon: Activity, unit: '', range: [0, 5] },
    { key: 'su', label: 'Sugar', type: 'number', default: 0, icon: Activity, unit: '', range: [0, 5] },
    { key: 'rbc', label: 'RBC', type: 'select', default: 1, icon: Activity, options: [{value: 0, label: 'Abnormal'}, {value: 1, label: 'Normal'}] },
    { key: 'pc', label: 'Pus Cell', type: 'select', default: 0, icon: Activity, options: [{value: 0, label: 'Abnormal'}, {value: 1, label: 'Normal'}] },
    { key: 'bgr', label: 'Blood Glucose', type: 'number', default: 120, icon: Activity, unit: 'mg/dL', range: [50, 500] },
    { key: 'bu', label: 'Blood Urea', type: 'number', default: 40, icon: Activity, unit: 'mg/dL', range: [10, 300] },
    { key: 'sc', label: 'Serum Creatinine', type: 'number', default: 1.2, icon: Activity, unit: 'mg/dL', step: 0.1, range: [0.1, 10] },
    { key: 'hemo', label: 'Hemoglobin', type: 'number', default: 14, icon: Activity, unit: 'g/dL', range: [3, 20] }
  ],
  liver: [
    { key: 'age', label: 'Age', type: 'number', default: 55, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'gender', label: 'Gender', type: 'select', default: 1, icon: Users, options: [{value: 1, label: 'Male'}, {value: 0, label: 'Female'}] },
    { key: 'total_bilirubin', label: 'Total Bilirubin', type: 'number', default: 1, icon: Activity, unit: 'mg/dL', step: 0.1, range: [0, 75] },
    { key: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', default: 0.3, icon: Activity, unit: 'mg/dL', step: 0.1, range: [0, 20] },
    { key: 'alkaline_phosphatase', label: 'Alkaline Phosphatase', type: 'number', default: 200, icon: Activity, unit: 'IU/L', range: [50, 2000] },
    { key: 'alamine_aminotransferase', label: 'ALT', type: 'number', default: 40, icon: Activity, unit: 'U/L', range: [10, 2000] },
    { key: 'aspartate_aminotransferase', label: 'AST', type: 'number', default: 35, icon: Activity, unit: 'U/L', range: [10, 5000] },
    { key: 'total_proteins', label: 'Total Proteins', type: 'number', default: 7, icon: Activity, unit: 'g/dL', step: 0.1, range: [2, 10] },
    { key: 'albumin', label: 'Albumin', type: 'number', default: 4, icon: Activity, unit: 'g/dL', step: 0.1, range: [0, 6] }
  ],
  lung_cancer: [
    { key: 'age', label: 'Age', type: 'number', default: 60, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'gender', label: 'Gender', type: 'select', default: 1, icon: Users, options: [{value: 1, label: 'Male'}, {value: 0, label: 'Female'}] },
    { key: 'smoking', label: 'Smoking', type: 'select', default: 1, icon: Activity, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'chest_pain', label: 'Chest Pain', type: 'select', default: 0, icon: Heart, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'coughing_blood', label: 'Coughing Blood', type: 'select', default: 0, icon: Activity, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'fatigue', label: 'Fatigue', type: 'select', default: 0, icon: Activity, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'weight_loss', label: 'Weight Loss', type: 'select', default: 0, icon: Activity, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'shortness_of_breath', label: 'Shortness of Breath', type: 'select', default: 0, icon: Wind, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] }
  ],
  breast_cancer: [
    { key: 'radius_mean', label: 'Radius Mean', type: 'number', default: 14, icon: Activity, unit: 'mm', step: 0.1, range: [5, 30] },
    { key: 'texture_mean', label: 'Texture Mean', type: 'number', default: 19, icon: Activity, unit: '', step: 0.1, range: [5, 40] },
    { key: 'perimeter_mean', label: 'Perimeter Mean', type: 'number', default: 90, icon: Activity, unit: 'mm', range: [40, 200] },
    { key: 'area_mean', label: 'Area Mean', type: 'number', default: 650, icon: Activity, unit: 'mm²', range: [100, 2500] },
    { key: 'smoothness_mean', label: 'Smoothness', type: 'number', default: 0.1, icon: Activity, unit: '', step: 0.01, range: [0, 0.2] }
  ],
  hypertension: [
    { key: 'age', label: 'Age', type: 'number', default: 50, icon: Clock, unit: 'years', range: [1, 100] },
    { key: 'sex', label: 'Sex', type: 'select', default: 1, icon: Users, options: [{value: 1, label: 'Male'}, {value: 0, label: 'Female'}] },
    { key: 'bmi', label: 'BMI', type: 'number', default: 28, icon: Activity, unit: 'kg/m²', range: [10, 60] },
    { key: 'heart_rate', label: 'Heart Rate', type: 'number', default: 75, icon: Heart, unit: 'bpm', range: [40, 200] },
    { key: 'glucose', label: 'Glucose', type: 'number', default: 100, icon: Activity, unit: 'mg/dL', range: [50, 300] },
    { key: 'cholesterol', label: 'Cholesterol', type: 'number', default: 200, icon: Activity, unit: 'mg/dL', range: [100, 400] },
    { key: 'smoking', label: 'Smoking', type: 'select', default: 0, icon: Activity, options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { key: 'salt_intake', label: 'Salt Intake', type: 'select', default: 1, icon: Activity, options: [
      {value: 0, label: 'Low'}, {value: 1, label: 'Medium'}, {value: 2, label: 'High'}
    ]},
    { key: 'stress_level', label: 'Stress Level', type: 'select', default: 1, icon: Brain, options: [
      {value: 0, label: 'Low'}, {value: 1, label: 'Medium'}, {value: 2, label: 'High'}, {value: 3, label: 'Very High'}
    ]}
  ]
}

const DISEASE_INFO = {
  diabetes: { 
    name: 'Diabetes Mellitus', 
    icon: Activity, 
    color: 'blue',
    description: 'Type 2 Diabetes risk assessment using metabolic indicators',
    prevalence: '10.5% of adults',
    accuracy: '59%',
    timeEstimate: '2 minutes',
    riskFactors: ['Family history', 'Obesity', 'Age > 45', 'Physical inactivity', 'High blood pressure']
  },
  heart: { 
    name: 'Cardiovascular Disease', 
    icon: Heart, 
    color: 'red',
    description: 'Heart disease risk assessment using cardiac health markers',
    prevalence: '31.0% of adults',
    accuracy: '61%',
    timeEstimate: '3 minutes',
    riskFactors: ['High cholesterol', 'High blood pressure', 'Smoking', 'Diabetes', 'Family history']
  },
  stroke: { 
    name: 'Stroke Risk', 
    icon: Brain, 
    color: 'purple',
    description: 'Stroke probability assessment based on lifestyle and health factors',
    prevalence: '2.5% of adults',
    accuracy: '59%',
    timeEstimate: '3 minutes',
    riskFactors: ['High blood pressure', 'Atrial fibrillation', 'Smoking', 'Diabetes', 'Age > 65']
  },
  kidney: { 
    name: 'Chronic Kidney Disease', 
    icon: Droplets, 
    color: 'cyan',
    description: 'Kidney function assessment using renal biomarkers',
    prevalence: '15.0% of adults',
    accuracy: '61%',
    timeEstimate: '2 minutes',
    riskFactors: ['Diabetes', 'High blood pressure', 'Family history', 'Age > 60', 'Obesity']
  },
  liver: { 
    name: 'Liver Disease', 
    icon: Activity, 
    color: 'green',
    description: 'Liver health assessment using hepatic function tests',
    prevalence: '4.5% of adults',
    accuracy: '59%',
    timeEstimate: '2 minutes',
    riskFactors: ['Alcohol use', 'Viral hepatitis', 'Obesity', 'Diabetes', 'Medications']
  },
  lung_cancer: { 
    name: 'Lung Cancer Risk', 
    icon: Wind, 
    color: 'indigo',
    description: 'Lung cancer risk assessment using symptoms and risk factors',
    prevalence: '2.2% of adults',
    accuracy: '58%',
    timeEstimate: '4 minutes',
    riskFactors: ['Smoking', 'Radon exposure', 'Air pollution', 'Family history', 'Occupational exposure']
  },
  breast_cancer: { 
    name: 'Breast Cancer Risk', 
    icon: Scan, 
    color: 'pink',
    description: 'Breast cancer assessment using tissue characteristics',
    prevalence: '12.9% of women',
    accuracy: '59%',
    timeEstimate: '3 minutes',
    riskFactors: ['Age > 50', 'Family history', 'Genetic mutations', 'Dense breast tissue', 'Hormone therapy']
  },
  hypertension: { 
    name: 'Hypertension', 
    icon: Zap, 
    color: 'orange',
    description: 'High blood pressure risk assessment using cardiovascular markers',
    prevalence: '45.0% of adults',
    accuracy: '66%',
    timeEstimate: '2 minutes',
    riskFactors: ['Age > 65', 'Obesity', 'High sodium diet', 'Sedentary lifestyle', 'Alcohol use']
  }
}

export default function PredictionForm() {
  const { disease } = useParams()
  const schema = SCHEMAS[disease]
  const diseaseInfo = DISEASE_INFO[disease]
  const [form, setForm] = useState(schema ? Object.fromEntries(schema.map(f => [f.key, f.default])) : {})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!schema) return <div className="text-rose-400 font-medium">Invalid disease</div>

  const handleInputChange = (key, value) => {
    const field = schema.find(f => f.key === key)
    const numValue = field?.type === 'number' ? parseFloat(value) || 0 : value
    setForm(prevForm => ({ ...prevForm, [key]: numValue }))
    
    // Clear validation errors for this field immediately
    setValidationErrors(prevErrors => {
      const newErrors = { ...prevErrors }
      delete newErrors[key]
      return newErrors
    })
  }

  const validateField = (key, value) => {
    const field = schema.find(f => f.key === key)
    if (!field) return null
    
    // Only validate range if it's a number field and has a valid range
    if (field.type === 'number' && field.range) {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && (numValue < field.range[0] || numValue > field.range[1])) {
        return `Value must be between ${field.range[0]} and ${field.range[1]}`
      }
    }
    return null
  }

  const validateForm = () => {
    const errors = {}
    
    schema.forEach(field => {
      const value = form[field.key]
      const error = validateField(field.key, value)
      if (error) {
        errors[field.key] = error
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      setError('Please correct the validation errors before submitting')
      return
    }
    
    setError('')
    setResult(null)
    setLoading(true)
    setShowResults(false)
    
    try {
      const { data } = await api.post(`/predictions/${disease}`, form)
      setResult(data)
      setShowResults(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(Object.fromEntries(schema.map(f => [f.key, f.default])))
    setResult(null)
    setError('')
    setShowResults(false)
    setCurrentStep(0)
    setValidationErrors({})
  }

  const getRiskColor = (risk) => {
    const colors = {
      Low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', progress: 'bg-emerald-500' },
      Medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', progress: 'bg-amber-500' },
      High: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', progress: 'bg-rose-500' }
    }
    return colors[risk] || colors.Medium
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

  const colorClasses = getColorClasses(diseaseInfo.color)
  const Icon = diseaseInfo.icon

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/app/predictions" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Predictions
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Disease Info Card */}
          <div className={`p-6 rounded-2xl bg-slate-900 border ${colorClasses.border}`}>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${colorClasses.icon}`} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{diseaseInfo.name} Prediction</h1>
                <p className="text-slate-400 mb-4">{diseaseInfo.description}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-500">Prevalence</p>
                    <p className="text-sm font-semibold text-white">{diseaseInfo.prevalence}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-500">Accuracy</p>
                    <p className="text-sm font-semibold text-green-400">{diseaseInfo.accuracy}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-500">Time Estimate</p>
                    <p className="text-sm font-semibold text-blue-400">{diseaseInfo.timeEstimate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Form Progress</span>
              <span className="text-sm text-white font-medium">
                {Object.values(form).filter((v, i) => v !== null && v !== undefined && v !== '').length} / {schema.length} fields
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(form).filter((v, i) => v !== null && v !== undefined && v !== '').length / schema.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Health Parameters</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm hover:bg-slate-700 transition-colors"
                >
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-sm hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {schema.map((field) => {
                const FieldIcon = field.icon || Activity
                const hasError = validationErrors[field.key]
                
                return (
                  <div key={field.key} className="space-y-2">
                    <label className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                      <FieldIcon className="w-4 h-4 text-slate-500" />
                      {field.label}
                      {field.unit && <span className="text-slate-500 text-xs">({field.unit})</span>}
                    </label>
                    
                    {field.type === 'select' ? (
                      <select
                        value={form[field.key]}
                        onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))}
                        className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all ${
                          hasError ? 'border-rose-500' : 'border-slate-800'
                        }`}
                      >
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type}
                          step={field.step}
                          value={form[field.key]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={`w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all ${
                            hasError ? 'border-rose-500' : 'border-slate-800'
                          }`}
                        />
                        {showAdvanced && field.range && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                            {field.range[0]}-{field.range[1]}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {hasError && (
                      <p className="text-rose-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {hasError}
                      </p>
                    )}
                    
                    {showAdvanced && field.description && (
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {field.description}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4" />
                    Run Prediction
                  </>
                )}
              </button>
              
              <button
                type="button"
                className="px-6 py-3 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Factors */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Key Risk Factors
            </h3>
            <div className="space-y-2">
              {diseaseInfo.riskFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-slate-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Assessment Tips
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">Use recent medical test results for best accuracy</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">Answer all questions honestly and completely</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-slate-400 text-sm">Consult healthcare provider for medical decisions</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 text-sm font-medium mb-1">Medical Disclaimer</p>
                <p className="text-amber-300/70 text-xs leading-relaxed">
                  This AI prediction is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && result && (
        <PredictionResults 
          result={result} 
          disease={disease} 
          formData={form}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  )
}

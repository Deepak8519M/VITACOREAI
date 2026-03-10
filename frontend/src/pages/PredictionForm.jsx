import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import api from '../utils/api'

const SCHEMAS = {
  diabetes: [
    { key: 'pregnancies', label: 'Pregnancies', type: 'number', default: 0 },
    { key: 'glucose', label: 'Glucose', type: 'number', default: 100 },
    { key: 'blood_pressure', label: 'Blood Pressure', type: 'number', default: 70 },
    { key: 'skin_thickness', label: 'Skin Thickness', type: 'number', default: 20 },
    { key: 'insulin', label: 'Insulin', type: 'number', default: 80 },
    { key: 'bmi', label: 'BMI', type: 'number', default: 25 },
    { key: 'diabetes_pedigree', label: 'Diabetes Pedigree', type: 'number', default: 0.5, step: 0.01 },
    { key: 'age', label: 'Age', type: 'number', default: 35 }
  ],
  heart: [
    { key: 'age', label: 'Age', type: 'number', default: 55 },
    { key: 'sex', label: 'Sex (1=M, 0=F)', type: 'number', default: 1 },
    { key: 'cp', label: 'Chest Pain Type', type: 'number', default: 0 },
    { key: 'trestbps', label: 'Resting BP', type: 'number', default: 120 },
    { key: 'chol', label: 'Cholesterol', type: 'number', default: 200 },
    { key: 'fbs', label: 'Fasting Blood Sugar >120', type: 'number', default: 0 },
    { key: 'restecg', label: 'Rest ECG', type: 'number', default: 0 },
    { key: 'thalach', label: 'Max Heart Rate', type: 'number', default: 150 },
    { key: 'exang', label: 'Exercise Angina', type: 'number', default: 0 },
    { key: 'oldpeak', label: 'ST Depression', type: 'number', default: 1, step: 0.1 },
    { key: 'slope', label: 'Slope', type: 'number', default: 1 },
    { key: 'ca', label: 'Major Vessels', type: 'number', default: 0 },
    { key: 'thal', label: 'Thal', type: 'number', default: 2 }
  ],
  stroke: [
    { key: 'gender', label: 'Gender (1=M, 0=F)', type: 'number', default: 1 },
    { key: 'age', label: 'Age', type: 'number', default: 55 },
    { key: 'hypertension', label: 'Hypertension', type: 'number', default: 0 },
    { key: 'heart_disease', label: 'Heart Disease', type: 'number', default: 0 },
    { key: 'ever_married', label: 'Ever Married', type: 'number', default: 1 },
    { key: 'work_type', label: 'Work Type', type: 'number', default: 2 },
    { key: 'residence_type', label: 'Residence Type', type: 'number', default: 1 },
    { key: 'avg_glucose_level', label: 'Avg Glucose', type: 'number', default: 100 },
    { key: 'bmi', label: 'BMI', type: 'number', default: 25 },
    { key: 'smoking_status', label: 'Smoking Status', type: 'number', default: 1 }
  ],
  kidney: [
    { key: 'age', label: 'Age', type: 'number', default: 55 },
    { key: 'bp', label: 'Blood Pressure', type: 'number', default: 80 },
    { key: 'sg', label: 'Specific Gravity', type: 'number', default: 1.02, step: 0.01 },
    { key: 'al', label: 'Albumin', type: 'number', default: 0 },
    { key: 'su', label: 'Sugar', type: 'number', default: 0 },
    { key: 'rbc', label: 'RBC', type: 'number', default: 1 },
    { key: 'pc', label: 'Pus Cell', type: 'number', default: 0 },
    { key: 'bgr', label: 'Blood Glucose', type: 'number', default: 120 },
    { key: 'bu', label: 'Blood Urea', type: 'number', default: 40 },
    { key: 'sc', label: 'Serum Creatinine', type: 'number', default: 1.2, step: 0.1 },
    { key: 'hemo', label: 'Hemoglobin', type: 'number', default: 14 }
  ],
  liver: [
    { key: 'age', label: 'Age', type: 'number', default: 55 },
    { key: 'gender', label: 'Gender (1=M, 0=F)', type: 'number', default: 1 },
    { key: 'total_bilirubin', label: 'Total Bilirubin', type: 'number', default: 1, step: 0.1 },
    { key: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', default: 0.3, step: 0.1 },
    { key: 'alkaline_phosphatase', label: 'Alkaline Phosphatase', type: 'number', default: 200 },
    { key: 'alamine_aminotransferase', label: 'ALT', type: 'number', default: 40 },
    { key: 'aspartate_aminotransferase', label: 'AST', type: 'number', default: 35 },
    { key: 'total_proteins', label: 'Total Proteins', type: 'number', default: 7, step: 0.1 },
    { key: 'albumin', label: 'Albumin', type: 'number', default: 4, step: 0.1 }
  ],
  lung_cancer: [
    { key: 'age', label: 'Age', type: 'number', default: 60 },
    { key: 'gender', label: 'Gender', type: 'number', default: 1 },
    { key: 'smoking', label: 'Smoking', type: 'number', default: 1 },
    { key: 'chest_pain', label: 'Chest Pain', type: 'number', default: 0 },
    { key: 'coughing_blood', label: 'Coughing Blood', type: 'number', default: 0 },
    { key: 'fatigue', label: 'Fatigue', type: 'number', default: 0 },
    { key: 'weight_loss', label: 'Weight Loss', type: 'number', default: 0 },
    { key: 'shortness_of_breath', label: 'Shortness of Breath', type: 'number', default: 0 }
  ],
  breast_cancer: [
    { key: 'radius_mean', label: 'Radius Mean', type: 'number', default: 14, step: 0.1 },
    { key: 'texture_mean', label: 'Texture Mean', type: 'number', default: 19, step: 0.1 },
    { key: 'perimeter_mean', label: 'Perimeter Mean', type: 'number', default: 90 },
    { key: 'area_mean', label: 'Area Mean', type: 'number', default: 650 },
    { key: 'smoothness_mean', label: 'Smoothness', type: 'number', default: 0.1, step: 0.01 }
  ],
  hypertension: [
    { key: 'age', label: 'Age', type: 'number', default: 50 },
    { key: 'sex', label: 'Sex (1=M, 0=F)', type: 'number', default: 1 },
    { key: 'bmi', label: 'BMI', type: 'number', default: 28 },
    { key: 'heart_rate', label: 'Heart Rate', type: 'number', default: 75 },
    { key: 'glucose', label: 'Glucose', type: 'number', default: 100 },
    { key: 'cholesterol', label: 'Cholesterol', type: 'number', default: 200 },
    { key: 'smoking', label: 'Smoking', type: 'number', default: 0 },
    { key: 'salt_intake', label: 'Salt Intake (0-2)', type: 'number', default: 1 },
    { key: 'stress_level', label: 'Stress Level (0-3)', type: 'number', default: 1 }
  ]
}

export default function PredictionForm() {
  const { disease } = useParams()
  const schema = SCHEMAS[disease]
  const [form, setForm] = useState(schema ? Object.fromEntries(schema.map(f => [f.key, f.default])) : {})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!schema) return <div className="text-rose-400 font-medium">Invalid disease</div>

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await api.post(`/predictions/${disease}`, form)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const riskColor = result ? { Low: 'text-emerald-400', Medium: 'text-amber-400', High: 'text-rose-400' }[result.risk] : ''

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/app/predictions" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors">← Back</Link>
        <h1 className="text-xl font-semibold text-white capitalize">{disease.replace('_', ' ')} Prediction</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {schema.map(f => (
            <div key={f.key}>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">{f.label}</label>
              <input type={f.type} step={f.step} value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
            </div>
          ))}
        </div>
        {error && <p className="text-rose-400 text-sm mb-4 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">{error}</p>}
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
          {loading ? 'Predicting...' : 'Run Prediction'}
        </button>
      </form>

      {result && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-slide-up">
          <h2 className="text-base font-semibold text-white mb-4">Results</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-xl font-semibold ${riskColor}`}>{result.risk} Risk</span>
            <span className="text-slate-500 text-sm">{result.percentage}%</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.explanation}</p>
          <div className="mb-4">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Suggestions</h3>
            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
              {result.suggestions?.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
            {result.consult_doctor}
          </div>
        </div>
      )}
    </div>
  )
}

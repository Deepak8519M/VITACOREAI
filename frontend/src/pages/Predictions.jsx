import { Link } from 'react-router-dom'
import { Heart, Brain, Activity, Droplets, Wind, Scan, Zap } from 'lucide-react'

const DISEASES = [
  { id: 'diabetes', name: 'Diabetes', icon: Activity, desc: 'Predict diabetes risk from metabolic factors' },
  { id: 'heart', name: 'Heart Disease', icon: Heart, desc: 'Assess cardiovascular disease likelihood' },
  { id: 'stroke', name: 'Stroke', icon: Brain, desc: 'Estimate stroke risk based on lifestyle & health' },
  { id: 'kidney', name: 'Kidney Disease', icon: Droplets, desc: 'Evaluate kidney function indicators' },
  { id: 'liver', name: 'Liver Disease', icon: Activity, desc: 'Assess liver health markers' },
  { id: 'lung_cancer', name: 'Lung Cancer', icon: Wind, desc: 'Risk assessment from symptoms & factors' },
  { id: 'breast_cancer', name: 'Breast Cancer', icon: Scan, desc: 'Prediction from tissue measurements' },
  { id: 'hypertension', name: 'Hypertension', icon: Zap, desc: 'Blood pressure risk prediction' }
]

export default function Predictions() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Disease Predictions</h1>
        <p className="text-slate-400 text-sm mt-0.5">Select a disease to run AI-powered risk assessment</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {DISEASES.map(({ id, name, icon: Icon, desc }) => (
          <Link key={id} to={`/app/predictions/${id}`}
            className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4 group-hover:bg-blue-600/15 transition-colors">
              <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1.5">{name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
            <span className="text-blue-500 text-sm font-medium group-hover:underline">Run prediction →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

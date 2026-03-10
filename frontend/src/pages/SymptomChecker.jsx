import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, ArrowLeft } from 'lucide-react'
import api from '../utils/api'

const SUGGESTIONS = ['headache', 'chest pain', 'fatigue', 'shortness of breath', 'nausea', 'fever', 'cough', 'dizziness', 'swelling', 'abdominal pain']

export default function SymptomChecker() {
  const [input, setInput] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const addSymptom = (s) => {
    const s_ = (typeof s === 'string' ? s : input.trim()).toLowerCase()
    if (s_ && !symptoms.includes(s_)) setSymptoms([...symptoms, s_])
    setInput('')
  }

  const removeSymptom = (s) => setSymptoms(symptoms.filter(x => x !== s))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (symptoms.length === 0) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/symptoms/check', { symptoms })
      setResult(data)
    } catch (err) {
      setResult({ guidance: 'Symptom checker unavailable. Please try again later.', possible_conditions: {} })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/app/tools"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Tools
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
            <Stethoscope className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
          </div>
          Symptom Checker
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Enter symptoms for pre-consultation guidance. Not a diagnosis.</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={(e) => { e.preventDefault(); addSymptom(); }}>
          <label className="block text-slate-400 text-sm font-medium mb-2">Add symptoms</label>
          <div className="flex gap-2 mb-4">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="e.g. headache, fatigue"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-blue-600/10 text-blue-500 font-medium text-sm hover:bg-blue-600/15 transition-colors border border-slate-800">
              Add
            </button>
          </div>
        </form>
        <p className="text-slate-500 text-sm mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => addSymptom(s)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-sm font-medium hover:bg-blue-600/10 hover:text-blue-500 transition-colors border border-slate-800">
              + {s}
            </button>
          ))}
        </div>
        {symptoms.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {symptoms.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-500 text-sm font-medium border border-slate-800">
                {s}
                <button type="button" onClick={() => removeSymptom(s)} className="hover:text-rose-400 transition-colors">×</button>
              </span>
            ))}
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading || symptoms.length === 0}
          className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
          {loading ? 'Analyzing...' : 'Check Symptoms'}
        </button>
      </div>

      {result && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-slide-up">
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{result.guidance}</p>
          {Object.keys(result.possible_conditions || {}).length > 0 && (
            <div className="mb-4">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Possible considerations</h3>
              <ul className="space-y-2">
                {Object.entries(result.possible_conditions).map(([sym, conditions]) => (
                  <li key={sym} className="text-slate-100 text-sm">
                    <span className="text-blue-500 font-medium">{sym}:</span>{' '}
                    {Array.isArray(conditions) ? conditions.join(', ') : conditions}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-amber-400 text-sm font-medium">Always consult a healthcare provider for accurate diagnosis.</p>
        </div>
      )}
    </div>
  )
}

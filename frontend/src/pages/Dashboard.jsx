import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Heart, TrendingUp, FileText } from 'lucide-react'
import api from '../utils/api'

const DISEASE_LABELS = { diabetes: 'Diabetes', heart: 'Heart', stroke: 'Stroke', kidney: 'Kidney', liver: 'Liver', lung_cancer: 'Lung Cancer', breast_cancer: 'Breast Cancer', hypertension: 'Hypertension' }

export default function Dashboard() {
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/predictions/history'), api.get('/predictions/summary')])
      .then(([h, s]) => {
        setHistory(h.data)
        setSummary(s.data.map(x => ({ name: DISEASE_LABELS[x._id] || x._id, value: x.count })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse text-slate-400 font-medium">Loading dashboard...</div>

  const riskColors = { Low: '#10b981', Medium: '#f59e0b', High: '#f43f5e' }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Health Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your prediction history and risk summary</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4">
            <Heart className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Predictions</p>
          <p className="text-2xl font-semibold text-slate-100 mt-1">{history.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Diseases Checked</p>
          <p className="text-2xl font-semibold text-slate-100 mt-1">{new Set(history.map(h => h.diseaseType)).size}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
          </div>
          <p className="text-slate-500 text-sm font-medium">Recent</p>
          <p className="text-lg font-semibold text-slate-100 mt-1">{history[0] ? DISEASE_LABELS[history[0].diseaseType] : '—'}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-4">Predictions by Disease</h2>
          {summary.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontFamily: 'Poppins' }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No predictions yet. <Link to="/app/predictions" className="text-blue-500 font-medium hover:underline">Run a prediction</Link></p>
          )}
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-4">Recent Predictions</h2>
          {history.slice(0, 5).length > 0 ? (
            <ul className="space-y-0">
              {history.slice(0, 5).map((p, i) => (
                <li key={i} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                  <span className="text-slate-100 font-medium text-sm">{DISEASE_LABELS[p.diseaseType]}</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: `${riskColors[p.result?.risk] || '#64748b'}20`, color: riskColors[p.result?.risk] || '#94a3b8' }}>
                    {p.result?.risk || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No predictions yet.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/app/predictions" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
          New Prediction
        </Link>
        <Link to="/app/tools" className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100 transition-all">
          Tools
        </Link>
        <Link to="/app/symptom-checker" className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100 transition-all">
          Symptom Checker
        </Link>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload, FileText, ArrowRight, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2,
  Activity, ChevronRight, RefreshCw
} from 'lucide-react'
import api from '../utils/api'

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = (err) => reject(err)
  })
}

const StatusBadge = ({ status }) => {
  const configs = {
    Improved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Worsened: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Stable: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Needs Attention': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
  const Icons = { Improved: TrendingUp, Worsened: TrendingDown, Stable: Minus, 'Needs Attention': AlertCircle }
  const Icon = Icons[status] || Minus
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${configs[status] || configs.Stable}`}>
      <Icon size={12} />
      {status}
    </span>
  )
}

export default function ReportComparison() {
  const [reportOld, setReportOld] = useState({ data: null, type: null, name: null })
  const [reportNew, setReportNew] = useState({ data: null, type: null, name: null })
  const [isComparing, setIsComparing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUpload = async (e, version) => {
    const file = e.target.files[0]
    if (!file) return
    const base64 = await fileToBase64(file)
    const update = { data: base64, type: file.type, name: file.name }
    if (version === 'old') setReportOld(update)
    else setReportNew(update)
  }

  const runComparison = async () => {
    if (!reportOld.data || !reportNew.data) {
      setError('Please upload both reports to begin comparison.')
      return
    }
    setIsComparing(true)
    setError(null)
    setAnalysis(null)

    const systemPrompt = `You are a specialized medical report analyst. 
Analyze two medical reports: an older one and a recent one.
1. Extract key health markers (Blood Glucose, Cholesterol, BP, Hemoglobin, etc.).
2. Compare the values between 'Old' and 'New'.
3. Determine the 'Status': "Improved", "Worsened", "Stable", or "Needs Attention".
4. Provide a clear summary of the overall trend.

Response Format: JSON strictly following this schema:
{
  "summary": "Brief overall interpretation of changes",
  "keyChanges": ["list of most critical 2-3 changes"],
  "metrics": [
    {
      "parameter": "Name of test/metric",
      "oldValue": "value from older report",
      "newValue": "value from recent report",
      "unit": "e.g. mg/dL, mmHg",
      "status": "Improved" | "Worsened" | "Stable" | "Needs Attention",
      "notes": "Medical context for the change"
    }
  ]
}`

    try {
      const { data } = await api.post('/report-comparison', {
        reportOld: { data: reportOld.data, type: reportOld.type },
        reportNew: { data: reportNew.data, type: reportNew.type }
      })
      setAnalysis(data)
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Unknown error'
      setError(`Analysis failed: ${msg}`)
    } finally {
      setIsComparing(false)
    }
  }

  const reset = () => {
    setAnalysis(null)
    setReportOld({ data: null, type: null, name: null })
    setReportNew({ data: null, type: null, name: null })
    setError(null)
  }

  return (
    <div className="max-w-6xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/app/tools" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">← Tools</Link>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              Report Comparison
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Upload historical and current medical reports to track your health progress</p>
          </div>
        </div>
        {analysis && (
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors">
            <RefreshCw size={16} strokeWidth={1.8} /> New Comparison
          </button>
        )}
      </div>

      {!analysis ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm">1</span>
                  Historical Report
                </h2>
                {reportOld.data && <CheckCircle2 className="text-emerald-500" size={20} strokeWidth={1.8} />}
              </div>
              <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${reportOld.data ? 'border-blue-500/50 bg-blue-600/10' : 'border-slate-800 hover:border-blue-500/40 hover:bg-slate-800'}`}>
                {reportOld.data ? (
                  <div className="text-center p-4">
                    <FileText className="mx-auto text-blue-500 mb-2" size={28} strokeWidth={1.8} />
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{reportOld.name}</p>
                    <span className="text-xs text-blue-500 mt-1 block">Click to change</span>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-500 mb-2" size={28} strokeWidth={1.8} />
                    <p className="text-sm font-medium text-slate-300">Select old report</p>
                    <p className="text-xs text-slate-500 mt-1">Image or PDF supported</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, 'old')} />
              </label>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm">2</span>
                  Current Report
                </h2>
                {reportNew.data && <CheckCircle2 className="text-emerald-500" size={20} strokeWidth={1.8} />}
              </div>
              <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all ${reportNew.data ? 'border-blue-500/50 bg-blue-600/10' : 'border-slate-800 hover:border-blue-500/40 hover:bg-slate-800'}`}>
                {reportNew.data ? (
                  <div className="text-center p-4">
                    <FileText className="mx-auto text-blue-500 mb-2" size={28} strokeWidth={1.8} />
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{reportNew.name}</p>
                    <span className="text-xs text-blue-500 mt-1 block">Click to change</span>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto text-slate-500 mb-2" size={28} strokeWidth={1.8} />
                    <p className="text-sm font-medium text-slate-300">Select recent report</p>
                    <p className="text-xs text-slate-500 mt-1">Image or PDF supported</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => handleFileUpload(e, 'new')} />
              </label>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
              <AlertCircle size={20} className="text-rose-500 flex-shrink-0" strokeWidth={1.8} />
              {error}
            </div>
          )}

          <button
            onClick={runComparison}
            disabled={!reportOld.data || !reportNew.data || isComparing}
            className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all ${isComparing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-500/20'}`}
          >
            {isComparing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                Analyzing Reports...
              </>
            ) : (
              <>
                Compare Reports
                <ArrowRight size={20} strokeWidth={1.8} />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4">Overall Assessment</h3>
              <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>
            <div className="p-6 rounded-xl bg-blue-600/10 border border-blue-500/20">
              <h3 className="text-base font-semibold text-blue-500 mb-4 flex items-center gap-2">
                <Activity size={18} strokeWidth={1.8} /> Key Highlights
              </h3>
              <ul className="space-y-3">
                {analysis.keyChanges?.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ChevronRight size={16} className="mt-0.5 flex-shrink-0 text-blue-500" strokeWidth={1.8} />
                    <span className="text-sm font-medium text-slate-200 leading-tight">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Detailed Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-semibold">Parameter</th>
                    <th className="px-4 py-3 text-center font-semibold">Old</th>
                    <th className="px-4 py-3 text-center font-semibold">New</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {analysis.metrics?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-100">{item.parameter}</td>
                      <td className="px-4 py-4 text-center text-slate-400 text-sm">{item.oldValue} <span className="text-xs text-slate-500 block">{item.unit}</span></td>
                      <td className="px-4 py-4 text-center font-medium text-white text-sm">{item.newValue} <span className="text-xs text-slate-500 block">{item.unit}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center"><StatusBadge status={item.status} /></div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400 max-w-xs italic">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-slate-500 text-xs">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-slate-600" strokeWidth={1.8} />
            <p>
              <strong className="text-slate-400">Medical Disclaimer:</strong> This comparison is AI-generated for informational purposes only. It is not a clinical diagnosis. Always consult a qualified healthcare provider for medical decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

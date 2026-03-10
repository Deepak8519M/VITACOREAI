import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GitCompare, Info, AlertCircle, Activity, ArrowLeft } from 'lucide-react'
import api from '../utils/api'

const DEFAULT_FORM = {
  classId: '',
  relaSource: 'ATC',
  scoreType: 0,
  top: 5,
}

const SCORE_OPTIONS = [
  { value: 0, label: 'Equivalence (same / very similar class)' },
  { value: 1, label: 'Includes (broader class that contains this one)' },
  { value: 2, label: 'Included-in (narrower class contained in this one)' },
]

export default function SmartMedicineAlt() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!form.classId.trim()) {
      setError('Please enter a drug class ID (e.g. L01E).')
      return
    }

    try {
      setLoading(true)
      const { data } = await api.post('/smart-medicine/alternatives', {
        classId: form.classId.trim(),
        relaSource: form.relaSource,
        scoreType: Number(form.scoreType),
        top: Number(form.top) || 5,
      })
      setResult(data)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Unable to fetch alternatives. Please try again later.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/app/tools"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Tools
        </Link>
      </div>

      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
            <GitCompare className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Smart Medicine Alternative Finder</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Find clinically similar drug classes using the official RxClass / RxNav API when a medicine is expensive,
              unavailable, or causing issues.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Powered by RxClass (no API key required)</span>
        </div>
      </header>

      <section className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Drug class ID (ATC / other)
            </label>
            <input
              type="text"
              value={form.classId}
              onChange={(e) => handleChange('classId', e.target.value)}
              placeholder="e.g. L01E (Protein kinase inhibitors)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
            <p className="text-[11px] text-slate-500">
              You can look up ATC class IDs externally and paste them here. This tool then finds closely related
              medicine classes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Relation source
              </label>
              <select
                value={form.relaSource}
                onChange={(e) => handleChange('relaSource', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="ATC">ATC (Anatomical Therapeutic Chemical)</option>
                <option value="MEDRT">MED-RT</option>
                <option value="SNOMEDCT">SNOMED CT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Max results</label>
              <input
                type="number"
                min={1}
                max={50}
                value={form.top}
                onChange={(e) => handleChange('top', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Similarity mode (scoreType)
            </label>
            <div className="space-y-1 rounded-2xl bg-slate-950/40 border border-slate-800 p-3">
              {SCORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('scoreType', opt.value)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                    Number(form.scoreType) === opt.value
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/40'
                      : 'text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span className="font-semibold">Mode {opt.value}:</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-60 transition-all"
          >
            {loading ? 'Searching alternatives…' : 'Find alternative classes'}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 flex gap-3">
            <div className="mt-1">
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-100 text-sm">How this works</p>
              <p className="text-xs text-slate-400">
                RxClass computes similarity between drug classes based on how much their member drugs overlap. The{' '}
                <span className="text-blue-300 font-semibold">equivalence score</span> reflects how similar the classes
                are, while the{' '}
                <span className="text-amber-300 font-semibold">inclusion score</span> indicates whether one class is
                mostly contained within another.
              </p>
              <p className="text-[11px] text-slate-500">
                This tool is for research and decision support only. Final choices must be made by licensed clinicians.
              </p>
            </div>
          </div>
        </aside>
      </section>

      {result && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                Input class • {result.rela_source || 'ATC'}
              </p>
              <p className="text-slate-100 text-sm font-semibold mt-1">
                Class ID: <span className="font-mono text-blue-300">{result.input_class}</span>
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Mode <span className="font-mono text-slate-300">{result.score_type}</span> • Top{' '}
              <span className="font-mono text-slate-300">{result.top}</span>
            </p>
          </div>

          <div className="mt-2 space-y-3">
            {result.similar_classes && result.similar_classes.length > 0 ? (
              result.similar_classes.map((cls) => (
                <div
                  key={`${cls.class_id}-${cls.class_name}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-slate-100 text-sm font-semibold">{cls.class_name || 'Unnamed class'}</p>
                    <p className="text-xs text-slate-500">
                      ID:{' '}
                      <span className="font-mono text-blue-300">
                        {cls.class_id || '—'}
                      </span>{' '}
                      • Type:{' '}
                      <span className="font-mono text-slate-300">
                        {cls.class_type || '—'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Overlap:{' '}
                      <span className="text-slate-200 font-semibold">
                        {cls.intersection ?? '—'}
                      </span>{' '}
                      shared members out of{' '}
                      <span className="text-slate-200 font-semibold">
                        {cls.members_in_input_class ?? '—'}
                      </span>{' '}
                      (input) and{' '}
                      <span className="text-slate-200 font-semibold">
                        {cls.members_in_result_class ?? '—'}
                      </span>{' '}
                      (result).
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] text-emerald-300 font-semibold">
                        Eq score:{' '}
                        {typeof cls.equivalence_score === 'number'
                          ? cls.equivalence_score.toFixed(2)
                          : '—'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] text-amber-300 font-semibold">
                        Incl score:{' '}
                        {typeof cls.inclusion_score === 'number'
                          ? cls.inclusion_score.toFixed(2)
                          : '—'}
                      </span>
                    </div>
                    {cls.ingredient_rxcuis && cls.ingredient_rxcuis.length > 0 && (
                      <p className="text-[10px] text-slate-500 max-w-xs">
                        <span className="font-semibold text-slate-300">Example members RXCUI:</span>{' '}
                        {cls.ingredient_rxcuis.slice(0, 4).join(', ')}
                        {cls.ingredient_rxcuis.length > 4 && ' …'}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No similar classes found for this classId and relation source.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}


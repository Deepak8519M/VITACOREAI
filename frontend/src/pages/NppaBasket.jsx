import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Plus, Trash2, IndianRupee, ClipboardList } from 'lucide-react'
import api from '../utils/api'

const emptyItem = () => ({
  name: '',
  dosage: '',
  unitsPerMonth: '',
})

export default function NppaBasket() {
  const [items, setItems] = useState([emptyItem()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    )
  }

  const addRow = () => {
    setItems((prev) => [...prev, emptyItem()])
  }

  const removeRow = (idx) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleaned = items
      .map((it) => ({
        name: it.name.trim(),
        dosage: it.dosage.trim(),
        unitsPerMonth: Number(it.unitsPerMonth) || 0,
      }))
      .filter((it) => it.name && it.unitsPerMonth > 0)

    if (!cleaned.length) return

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/nppa/basket', { items: cleaned })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to estimate NPPA basket cost. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <Link
          to="/app/tools"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Tools
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Essential Medicine Basket Estimator</h1>
            <p className="text-slate-400 text-sm mt-1">
              Build a monthly chronic‑care basket and see minimum cost based on NPPA ceiling prices.
            </p>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
      >
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-3 items-end"
            >
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  Medicine (generic or brand)
                </label>
                <input
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder="e.g. Amlodipine, Metformin, Atorvastatin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  Dose / form (optional)
                </label>
                <input
                  value={item.dosage}
                  onChange={(e) => updateItem(idx, 'dosage', e.target.value)}
                  placeholder="5 mg, 10 mg, 500 mg, 250 mg/5 mL"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
                  Units / month
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.unitsPerMonth}
                  onChange={(e) => updateItem(idx, 'unitsPerMonth', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors mt-6"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add medicine
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
          >
            {loading ? 'Calculating…' : 'Estimate basket cost'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Monthly basket cost</p>
              <div className="flex items-baseline gap-1 text-2xl font-semibold text-slate-100">
                <IndianRupee className="w-4 h-4 text-slate-300" />
                <span>{result.total_monthly_cost}</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Yearly basket cost</p>
              <div className="flex items-baseline gap-1 text-xl font-semibold text-slate-100">
                <IndianRupee className="w-4 h-4 text-slate-300" />
                <span>{result.total_yearly_cost}</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">Medicines in basket</p>
              <p className="text-2xl font-semibold text-slate-100">{result.items.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <table className="min-w-full text-xs text-left border-collapse">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-4 font-medium">Medicine</th>
                  <th className="py-2 pr-4 font-medium">Dosage</th>
                  <th className="py-2 pr-4 font-medium text-right">Units / month</th>
                  <th className="py-2 pr-4 font-medium text-right">Ceiling ₹ / unit</th>
                  <th className="py-2 pr-4 font-medium text-right">Monthly cost (₹)</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-slate-900/60 last:border-0">
                    <td className="py-2 pr-4 text-slate-100 font-semibold">{it.name}</td>
                    <td className="py-2 pr-4 text-slate-300">{it.dosage}</td>
                    <td className="py-2 pr-4 text-right text-slate-300">
                      {it.unitsPerMonth || it.units_per_month}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-300">
                      {it.unit_ceiling_price != null ? it.unit_ceiling_price : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-100 font-semibold">
                      {it.monthly_cost != null ? it.monthly_cost : '—'}
                    </td>
                    <td className="py-2 pr-4 text-slate-400">
                      {it.found === false ? (
                        <span className="text-amber-300">Not found in NPPA list</span>
                      ) : (
                        <span className="text-emerald-300">Matched to {it.generic_name}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


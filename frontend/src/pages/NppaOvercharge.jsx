import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, IndianRupee, Info, Scale, ShieldAlert } from 'lucide-react'
import api from '../utils/api'

export default function NppaOvercharge() {
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [paidPerUnit, setPaidPerUnit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !paidPerUnit || !quantity) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/nppa/overcharge', {
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        paidPerUnit: Number(paidPerUnit),
        quantity: Number(quantity),
      })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to check NPPA ceiling price. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = (() => {
    if (!result) return null
    const s = result.status
    if (s === 'above_ceiling') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
          Above NPPA ceiling
        </span>
      )
    }
    if (s === 'below_ceiling') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
          Below NPPA ceiling
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/30 text-[11px] font-semibold">
        At NPPA ceiling
      </span>
    )
  })()

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
            <Scale className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">NPPA Price Overcharge Detector</h1>
            <p className="text-slate-400 text-sm mt-1">
              Compare what you paid against official NPPA ceiling prices for scheduled medicines.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 max-w-xs">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
          <p>
            NPPA ceiling prices are per unit (tablet / capsule / ml). This tool estimates whether the billed amount is
            above that ceiling.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
      >
        <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-4">
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
              Medicine name (generic or brand)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amlodipine 5 mg, Atorvastatin 10 mg"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
              Dosage (optional)
            </label>
            <input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 5 mg, 10 mg, 250 mg/5 mL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
              Your price per unit (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={paidPerUnit}
              onChange={(e) => setPaidPerUnit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
              Quantity on bill (units)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim() || !paidPerUnit || !quantity}
          className="mt-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-400 border-t-blue-400 rounded-full animate-spin" />
              Checking NPPA price…
            </>
          ) : (
            'Check against NPPA ceiling'
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                NPPA reference class
              </p>
              {statusBadge}
            </div>
            <h2 className="text-lg font-semibold text-slate-100">
              {result.reference.brand_name || result.reference.generic_name}
            </h2>
            <p className="text-sm text-slate-400">
              {result.reference.generic_name}{' '}
              {result.reference.dosage && <span>· {result.reference.dosage}</span>}
            </p>
            <p className="text-xs text-slate-500">
              Source: <span className="text-slate-200 font-medium">{result.reference.source}</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-500 uppercase mb-1">Ceiling price / unit</p>
                <div className="flex items-baseline gap-1 text-slate-100 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{result.reference.unit_ceiling_price}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-500 uppercase mb-1">Your price / unit</p>
                <div className="flex items-baseline gap-1 text-slate-100 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{result.input.paid_per_unit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Bill summary
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-500 uppercase mb-1">Official total (NPPA)</p>
                <div className="flex items-baseline gap-1 text-slate-100 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{result.official_total}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {result.input.quantity} × ₹{result.reference.unit_ceiling_price}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-[11px] text-slate-500 uppercase mb-1">You paid</p>
                <div className="flex items-baseline gap-1 text-slate-100 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{result.input.paid_total}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {result.input.quantity} × ₹{result.input.paid_per_unit}
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-500 uppercase mb-1">Difference vs ceiling</p>
                <p className="text-sm text-slate-100 font-semibold">
                  {result.difference > 0 ? '+' : ''}
                  {result.difference} ₹ ({result.overcharge_percent > 0 ? '+' : ''}
                  {result.overcharge_percent}%)
                </p>
              </div>
              {result.status === 'above_ceiling' && (
                <p className="text-[11px] text-rose-300 max-w-xs">
                  This appears to be above the NPPA ceiling price. Keep the bill and consult your pharmacist, doctor,
                  or local authority if needed.
                </p>
              )}
              {result.status === 'below_ceiling' && (
                <p className="text-[11px] text-emerald-300 max-w-xs">
                  This bill is within the NPPA ceiling price. Prices may still vary slightly due to taxes and pack
                  sizes.
                </p>
              )}
              {result.status === 'at_ceiling' && (
                <p className="text-[11px] text-slate-300 max-w-xs">
                  This bill is aligned very closely with the NPPA ceiling price for this medicine.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


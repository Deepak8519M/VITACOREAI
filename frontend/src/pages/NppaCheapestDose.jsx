import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Pill, Info, IndianRupee } from 'lucide-react'
import api from '../utils/api'

export default function NppaCheapestDose() {
  const [molecule, setMolecule] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!molecule.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.get('/nppa/cheapest', {
        params: { molecule: molecule.trim() },
      })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Unable to fetch NPPA dose information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
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
            <Pill className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Cheapest NPPA Dose Finder</h1>
            <p className="text-slate-400 text-sm mt-1">
              See which strengths and forms of a molecule have the lowest NPPA ceiling price per unit.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 max-w-xs">
          <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
          <p>
            Useful when choosing between available tablet strengths or pack options for long‑term therapy (e.g.
            amlodipine, atorvastatin).
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
      >
        <div className="space-y-2">
          <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">
            Molecule name (generic)
          </label>
          <input
            value={molecule}
            onChange={(e) => setMolecule(e.target.value)}
            placeholder="e.g. Amlodipine, Atorvastatin, Metformin"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !molecule.trim()}
          className="mt-2 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
        >
          {loading ? 'Finding cheapest doses…' : 'Find cheapest NPPA doses'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
              Molecule summary
            </p>
            <p className="text-sm text-slate-200 font-semibold">
              {result.generic_matched} <span className="text-slate-500">(search: {result.molecule})</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Found {result.doses.length} NPPA‑listed dose / form combinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-100">Dose & form comparison</p>
              <p className="text-[11px] text-slate-500">
                Rows sorted from lowest to highest ceiling price per unit
              </p>
            </div>
            <table className="min-w-full text-xs text-left border-collapse">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-4 font-medium">Dosage / form</th>
                  <th className="py-2 pr-4 font-medium text-right">Min price / unit (₹)</th>
                  <th className="py-2 pr-4 font-medium">Example brand</th>
                  <th className="py-2 pr-4 font-medium">Manufacturer</th>
                  <th className="py-2 pr-4 font-medium text-right"># entries</th>
                </tr>
              </thead>
              <tbody>
                {result.doses.map((d, idx) => {
                  const isCheapest = idx === 0
                  return (
                    <tr
                      key={idx}
                      className={`border-b border-slate-900/60 last:border-0 ${
                        isCheapest ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-2 pr-4 text-slate-100 font-semibold">{d.dosage}</td>
                      <td className="py-2 pr-4 text-right text-slate-100 font-semibold">
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 text-slate-300" />
                          {d.min_price}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-300">{d.example_brand}</td>
                      <td className="py-2 pr-4 text-slate-300">{d.example_manufacturer}</td>
                      <td className="py-2 pr-4 text-right text-slate-400">{d.count}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


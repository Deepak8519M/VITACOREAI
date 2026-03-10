import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Search,
  MapPin,
  Pill,
  AlertCircle,
  Loader2,
  IndianRupee,
} from 'lucide-react'
import api from '../utils/api'

export default function MedicineComparator() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/medicine/compare', { query: query.trim(), location: location.trim() })
      setResult(data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to compare prices. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cheapest = result?.cheapest || null

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <Link
          to="/app/tools"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-100 transition-colors"
        >
          <span className="text-base leading-none">←</span>
          Back to Tools
        </Link>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <span className="inline-flex w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
            </span>
            Medicine Price Comparator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search a medicine and compare prices across brands for the same generic drug.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Medicine</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. Dolo 650, Crocin 650, Paracetamol 650 mg"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Location (optional)</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City / pincode (e.g. Mumbai, 560001)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
            {loading ? 'Comparing…' : 'Compare Prices'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Try: <span className="text-slate-300">“Dolo 650”</span>, <span className="text-slate-300">“Crocin 650”</span>, or <span className="text-slate-300">“Metformin 500”</span>.
        </p>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-10 flex flex-col items-center text-center shadow-xl">
          <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center border border-slate-800 mb-5">
            <Pill className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Search any medicine to start</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            We’ll show brands for the same generic and highlight the cheapest option from our reference dataset.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Generic</p>
              <p className="text-lg font-semibold text-slate-100">{result.generic}</p>
              {result.location && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Search term: {result.query}</span>
                </p>
              )}
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Best price</p>
              <div className="flex items-baseline gap-1 text-2xl font-semibold text-emerald-400">
                <IndianRupee className="w-4 h-4" />
                <span>{result.summary?.bestPrice ?? cheapest?.price ?? '—'}</span>
              </div>
              {cheapest && (
                <p className="text-xs text-slate-400 mt-1">
                  for <span className="text-slate-100 font-semibold">{cheapest.brand}</span> ({cheapest.source})
                </p>
              )}
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Average price</p>
              <div className="flex items-baseline gap-1 text-xl font-semibold text-slate-100">
                <IndianRupee className="w-4 h-4 text-slate-300" />
                <span>{result.summary?.averagePrice ?? '—'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across {result.summary?.totalBrands || result.brands?.length || 0} brands</p>
            </div>
          </div>

          {/* Brands table */}
          {Array.isArray(result.brands) && result.brands.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-100">Brand comparison</p>
                <p className="text-[11px] text-slate-500">Cheapest row highlighted in green</p>
              </div>
              <table className="min-w-full text-xs text-left border-collapse">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Brand</th>
                    <th className="py-2 pr-4 font-medium">Dosage</th>
                    <th className="py-2 pr-4 font-medium">Manufacturer</th>
                    <th className="py-2 pr-4 font-medium">Source</th>
                    <th className="py-2 pr-4 font-medium text-right">Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.brands.map((b, idx) => {
                    const isCheapest = cheapest && b.brand === cheapest.brand && b.price === cheapest.price
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-slate-900/60 last:border-0 ${
                          isCheapest ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        <td className="py-2 pr-4 text-slate-100 font-semibold">{b.brand}</td>
                        <td className="py-2 pr-4 text-slate-300">{b.dosage}</td>
                        <td className="py-2 pr-4 text-slate-300">{b.manufacturer}</td>
                        <td className="py-2 pr-4 text-slate-300">{b.source}</td>
                        <td className="py-2 pr-4 text-right text-slate-100 font-semibold">
                          {b.price}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


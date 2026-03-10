import { useState } from 'react'
import {
  Activity,
  Search,
  MapPin,
  Pill,
  AlertCircle,
  Loader2,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  IndianRupee,
  LineChart,
  Sparkles
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

  const cheapestPlatform = (() => {
    if (!result?.platforms || !Array.isArray(result.platforms)) return null
    return [...result.platforms].sort((a, b) => (a.finalPrice || 0) - (b.finalPrice || 0))[0]
  })()

  const trendIcon = (() => {
    const dir = result?.priceTrend?.direction
    if (dir === 'down') return <ArrowDownRight className="w-4 h-4 text-emerald-400" />
    if (dir === 'up') return <ArrowUpRight className="w-4 h-4 text-rose-400" />
    return <Minus className="w-4 h-4 text-slate-400" />
  })()

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <span className="inline-flex w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
            </span>
            Smart Medicine Price Comparator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search any medicine and compare estimated prices, generics, and savings across major online platforms.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>AI-synthesized prices · Use as guidance only</span>
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
                placeholder="e.g. Paracetamol 500mg, Metformin 850mg, Crocin"
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
          Try: <span className="text-slate-300">“Crocin 500mg”</span>, <span className="text-slate-300">“Metformin 500 mg”</span>, or <span className="text-slate-300">“diabetes tablet”</span>.
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
            <LineChart className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Search any medicine to start</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            We’ll estimate prices across Tata 1mg, PharmEasy, Apollo Pharmacy, Netmeds and suggest generic alternatives to help you save.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Top summary row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Best price</p>
              <div className="flex items-baseline gap-1 text-2xl font-semibold text-emerald-400">
                <IndianRupee className="w-4 h-4" />
                <span>{result.savings?.bestPrice?.toFixed?.(2) ?? result.savings?.bestPrice ?? '—'}</span>
              </div>
              {cheapestPlatform && (
                <p className="text-xs text-slate-400 mt-1">
                  on <span className="text-slate-100 font-semibold">{cheapestPlatform.name}</span>
                </p>
              )}
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Average price</p>
              <div className="flex items-baseline gap-1 text-xl font-semibold text-slate-100">
                <IndianRupee className="w-4 h-4 text-slate-300" />
                <span>{result.savings?.averagePrice?.toFixed?.(2) ?? result.savings?.averagePrice ?? '—'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all listed platforms</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Potential savings</p>
              <div className="flex items-baseline gap-1 text-xl font-semibold text-emerald-400">
                <IndianRupee className="w-4 h-4" />
                <span>{result.savings?.potentialSavings?.toFixed?.(2) ?? result.savings?.potentialSavings ?? '—'}</span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-1">vs average price · green = cheaper</p>
            </div>
          </div>

          {/* Brand + info */}
          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Selected brand</p>
              <h2 className="text-lg font-semibold text-slate-100">{result.brand?.name || result.normalizedQuery}</h2>
              <p className="text-sm text-slate-400">
                {result.brand?.strength && <span>{result.brand.strength} · </span>}
                {result.brand?.form && <span>{result.brand.form}</span>}
              </p>
              <p className="text-xs text-slate-500">
                Active ingredient:{' '}
                <span className="text-slate-200 font-medium">{result.brand?.activeIngredient || '—'}</span>
              </p>
              {result.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  Estimates for <span className="text-slate-200 font-medium">{result.location}</span>
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <LineChart className="w-4 h-4 text-blue-400" />
                AI price outlook
              </p>
              <div className="flex items-center gap-3 mt-1">
                {trendIcon}
                <p className="text-sm text-slate-200">
                  {typeof result.priceTrend?.changePercent === 'number' && (
                    <span className="font-semibold">
                      {result.priceTrend.changePercent > 0 ? '+' : ''}
                      {result.priceTrend.changePercent.toFixed(1)}%
                    </span>
                  )}{' '}
                  <span className="text-slate-400 text-xs">
                    {result.priceTrend?.comment || 'Price trend information not available.'}
                  </span>
                </p>
              </div>
              {Array.isArray(result.alerts) && result.alerts.length > 0 && (
                <ul className="mt-2 text-xs text-slate-400 space-y-1">
                  {result.alerts.map((a, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Platforms table */}
          {Array.isArray(result.platforms) && result.platforms.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-100">Platform comparison</p>
                <p className="text-[11px] text-slate-500">Green highlight = cheapest option</p>
              </div>
              <table className="min-w-full text-xs text-left border-collapse">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Platform</th>
                    <th className="py-2 pr-4 font-medium">Medicine</th>
                    <th className="py-2 pr-4 font-medium text-right">MRP</th>
                    <th className="py-2 pr-4 font-medium text-right">Discount</th>
                    <th className="py-2 pr-4 font-medium text-right">Final price</th>
                    <th className="py-2 pr-4 font-medium">Availability</th>
                    <th className="py-2 pr-4 font-medium">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {result.platforms.map((p, idx) => {
                    const isCheapest = cheapestPlatform && p.name === cheapestPlatform.name && p.finalPrice === cheapestPlatform.finalPrice
                    return (
                      <tr key={idx} className="border-b border-slate-900/60 last:border-0">
                        <td className="py-2 pr-4 text-slate-100 font-semibold">{p.name}</td>
                        <td className="py-2 pr-4 text-slate-300">
                          <div className="flex flex-col">
                            <span>{p.medicineName || result.brand?.name}</span>
                            {p.stripSize && <span className="text-[10px] text-slate-500">{p.stripSize}</span>}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-400">
                          {typeof p.mrp === 'number' ? `₹${p.mrp.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-400">
                          {typeof p.discountPercent === 'number' ? `${p.discountPercent.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          <span
                            className={`inline-flex items-center justify-end gap-1 text-xs px-2 py-1 rounded-lg ${
                              isCheapest ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40' : 'text-slate-100'
                            }`}
                          >
                            {typeof p.finalPrice === 'number' ? `₹${p.finalPrice.toFixed(2)}` : '—'}
                            {isCheapest && <span className="text-[9px] uppercase font-semibold">cheapest</span>}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-slate-300">
                          {p.availability || '—'}
                        </td>
                        <td className="py-2 pr-4 text-slate-400">
                          {p.deliveryTime || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Generic alternatives + info */}
          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Generic alternatives</p>
              {Array.isArray(result.genericOptions) && result.genericOptions.length > 0 ? (
                <div className="space-y-3">
                  {result.genericOptions.map((g, i) => (
                    <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{g.name}</p>
                          <p className="text-[11px] text-slate-500">{g.manufacturer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">
                            ₹{g.finalPrice?.toFixed?.(2) ?? g.finalPrice ?? '—'}
                          </p>
                          {typeof g.savingsPercentVsBrand === 'number' && (
                            <p className="text-[11px] text-emerald-300">
                              Save {g.savingsPercentVsBrand.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                      {g.stripSize && (
                        <p className="mt-1 text-[10px] text-slate-500">Pack: {g.stripSize}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No clear generic alternatives were identified. This may be a branded or combination medicine.
                </p>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Medicine information</p>
              <div className="space-y-2 text-xs text-slate-300">
                {result.info?.uses && (
                  <div>
                    <p className="font-semibold text-slate-100 mb-0.5">Uses</p>
                    <p className="text-slate-400">{result.info.uses}</p>
                  </div>
                )}
                {result.info?.dosage && (
                  <div>
                    <p className="font-semibold text-slate-100 mb-0.5">Dosage (general)</p>
                    <p className="text-slate-400">{result.info.dosage}</p>
                  </div>
                )}
                {result.info?.sideEffects && (
                  <div>
                    <p className="font-semibold text-slate-100 mb-0.5">Common side effects</p>
                    <p className="text-slate-400">{result.info.sideEffects}</p>
                  </div>
                )}
                {result.info?.warnings && (
                  <div>
                    <p className="font-semibold text-slate-100 mb-0.5">Warnings</p>
                    <p className="text-slate-400">{result.info.warnings}</p>
                  </div>
                )}
                {result.info?.manufacturer && (
                  <p className="text-[11px] text-slate-500">
                    Manufacturer: <span className="text-slate-200">{result.info.manufacturer}</span>
                  </p>
                )}
              </div>
              <p className="mt-2 text-[10px] text-amber-300/80">
                This information is AI-generated and for educational purposes only. Always follow your doctor’s prescription and local pharmacist’s advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


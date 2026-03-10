import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Pill,
  AlertCircle,
  ChevronRight,
  Info,
  Crosshair,
  Filter
} from 'lucide-react'

export default function PharmacyLocator() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [pharmacies, setPharmacies] = useState([])
  const [error, setError] = useState(null)
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [sortBy, setSortBy] = useState('distance') // distance | name
  const [medicineFilter, setMedicineFilter] = useState('')

  // Mock Medicine Data (client-side demo)
  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', basePrice: 15, stock: 'High' },
    { id: 2, name: 'Amoxicillin 250mg', basePrice: 45, stock: 'Medium' },
    { id: 3, name: 'Cetirizine 10mg', basePrice: 12, stock: 'High' },
    { id: 4, name: 'Metformin 500mg', basePrice: 30, stock: 'Low' },
    { id: 5, name: 'Ibuprofen 400mg', basePrice: 22, stock: 'High' },
    { id: 6, name: 'Azithromycin 500mg', basePrice: 65, stock: 'Medium' },
  ]

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return (R * c).toFixed(1)
  }

  const fetchNearby = async (lat, lon) => {
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:5000, ${lat}, ${lon});
          way["amenity"="pharmacy"](around:5000, ${lat}, ${lon});
        );
        out center;
      `
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
      const res = await fetch(url)
      const data = await res.json()

      if (!data.elements?.length) {
        setError('No pharmacies found within 5km of this location.')
        setPharmacies([])
        return
      }

      const results = data.elements.map(el => {
        const pLat = el.lat || el.center?.lat
        const pLon = el.lon || el.center?.lon
        return {
          id: el.id,
          name: el.tags?.name || 'Local Pharmacy',
          address: el.tags?.['addr:street']
            ? `${el.tags?.['addr:housenumber'] || ''} ${el.tags?.['addr:street']}`.trim()
            : 'Address details available on map',
          phone: el.tags?.phone || el.tags?.['contact:phone'] || 'No contact info',
          hours: el.tags?.opening_hours || 'Contact for hours',
          isOpen: el.tags?.opening_hours?.toLowerCase().includes('24/7') || false,
          lat: pLat,
          lon: pLon,
          distValue: pLat && pLon ? parseFloat(calculateDistance(lat, lon, pLat, pLon)) : Number.POSITIVE_INFINITY
        }
      })

      setPharmacies(results)
    } catch {
      setError('Failed to fetch data from OpenStreetMap. Please try again later.')
      setPharmacies([])
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim() || query === 'My Location') return

    setLoading(true)
    setError(null)

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      const res = await fetch(geoUrl, { headers: { 'User-Agent': 'VitaCore-PharmaMap/1.0' } })
      const data = await res.json()

      if (!data.length) throw new Error('Location not found. Try a city or pincode.')

      const { lat, lon, display_name } = data[0]
      setQuery(display_name.split(',')[0])
      await fetchNearby(parseFloat(lat), parseFloat(lon))
    } catch (err) {
      setError(err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGeoLocation = () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setQuery('My Location')
        await fetchNearby(pos.coords.latitude, pos.coords.longitude)
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        if (err.code === err.PERMISSION_DENIED) setError('Location access denied. Allow permissions in browser settings.')
        else if (err.code === err.POSITION_UNAVAILABLE) setError('Location unavailable. Try searching manually.')
        else if (err.code === err.TIMEOUT) setError('Location request timed out. Check your connection.')
        else setError('An unknown error occurred while retrieving location.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const sortedPharmacies = useMemo(() => {
    return [...pharmacies].sort((a, b) => {
      if (sortBy === 'distance') return a.distValue - b.distValue
      return a.name.localeCompare(b.name)
    })
  }, [pharmacies, sortBy])

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => m.name.toLowerCase().includes(medicineFilter.toLowerCase()))
  }, [medicines, medicineFilter])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans rounded-2xl border border-slate-800 overflow-hidden">
      <header className="bg-slate-900 text-white p-6 shadow-lg sticky top-0 z-20 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/app/tools"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100 transition-colors"
            >
              <span className="text-base leading-none">←</span>
              Back to Tools
            </Link>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/10 p-2 rounded-xl border border-slate-800">
                <Pill className="w-6 h-6 text-blue-500" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight">PharmaMap</h1>
                <p className="text-slate-400 text-xs font-medium">Local Pharmacy Finder (OpenStreetMap)</p>
              </div>
            </div>
            <button
              onClick={handleGeoLocation}
              disabled={loading}
              className={`p-2 rounded-xl transition-all shadow-sm flex items-center gap-2 px-4 text-sm font-semibold border border-slate-800 ${loading ? 'bg-slate-800 cursor-not-allowed text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]'}`}
            >
              <Crosshair className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
              <span className="hidden sm:inline">Near Me</span>
            </button>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Enter area, city, or pincode..."
              className="w-full py-3.5 pl-5 pr-14 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 shadow-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-base placeholder:text-slate-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              disabled={loading}
            >
              <Search className="w-5 h-5" strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {pharmacies.length > 0 && (
          <div className="flex items-center justify-between mb-6 gap-3 px-1">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-200">{pharmacies.length}</span> pharmacies
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSortBy('distance')}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all ${sortBy === 'distance' ? 'bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-500'}`}
              >
                Closest
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all ${sortBy === 'name' ? 'bg-slate-800 text-blue-500 shadow-sm' : 'text-slate-500'}`}
              >
                Name
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-slate-200 font-semibold">Finding Pharmacies...</p>
              <p className="text-slate-500 text-sm">Fetching live OpenStreetMap data</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-2xl text-center shadow-sm max-w-lg mx-auto animate-fade-in">
            <div className="bg-rose-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <AlertCircle className="w-8 h-8 text-rose-400" strokeWidth={1.8} />
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-2">Something went wrong</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error}</p>
            <button
              onClick={() => { setError(null); setPharmacies([]) }}
              className="bg-slate-800 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPharmacies.map((p) => (
              <div
                key={p.id}
                className={`bg-slate-900 rounded-2xl border transition-all overflow-hidden ${selectedPharmacy?.id === p.id ? 'border-blue-500/50 shadow-xl shadow-blue-900/10' : 'border-slate-800 hover:border-blue-500/30'}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100">{p.name}</h3>
                        {p.isOpen && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest border border-emerald-500/20">
                            Always Open
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 flex items-start gap-1.5 mb-5 font-medium">
                        <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.8} /> {p.address}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-slate-950/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} /> {p.phone}
                        </span>
                        <span className="bg-slate-950/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.8} /> {p.hours.length > 25 ? 'Hours Available' : p.hours}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <button
                        onClick={() => window.open(`https://www.openstreetmap.org/directions?engine=osrm_car&route=%3B${p.lat}%2C${p.lon}`, '_blank')}
                        className="w-14 h-14 bg-slate-800 text-slate-200 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center group border border-slate-700"
                        title="Get Directions"
                      >
                        <Navigation className="w-7 h-7 group-hover:rotate-12 transition-transform" strokeWidth={1.8} />
                      </button>
                      <span className="text-[11px] font-semibold text-blue-500 bg-blue-600/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {Number.isFinite(p.distValue) ? `${p.distValue} km` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 mt-4 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPharmacy(selectedPharmacy?.id === p.id ? null : p)}
                      className="text-blue-500 text-sm font-semibold flex items-center gap-1 group"
                    >
                      Compare Prices
                      <ChevronRight className={`w-4 h-4 transition-transform ${selectedPharmacy?.id === p.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} strokeWidth={1.8} />
                    </button>
                    {p.hours.includes('24') && <span className="text-[10px] text-slate-500 font-semibold">Verified Provider</span>}
                  </div>
                </div>

                {selectedPharmacy?.id === p.id && (
                  <div className="bg-slate-950/40 border-t border-slate-800 p-6 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-600/10 p-1.5 rounded-lg text-blue-500 border border-slate-800">
                          <Filter className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                        <h4 className="font-semibold text-slate-100 text-base">Store Inventory</h4>
                      </div>
                      <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" strokeWidth={1.8} />
                        <input
                          type="text"
                          placeholder="Search medicine..."
                          className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl text-sm w-full sm:w-56 outline-none shadow-sm transition-all text-slate-100 placeholder:text-slate-500"
                          value={medicineFilter}
                          onChange={(e) => setMedicineFilter(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMedicines.length > 0 ? filteredMedicines.map(med => (
                        <div key={med.id} className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-blue-500/20 transition-all shadow-sm">
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{med.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${med.stock === 'Low' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-tighter">{med.stock} Stock</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-blue-500">₹{med.basePrice + (p.id % 5)}</p>
                            <p className="text-[9px] font-semibold text-slate-600 uppercase">Per Strip</p>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-10 text-center">
                          <p className="text-slate-500 text-sm font-semibold italic">No results found for &quot;{medicineFilter}&quot;</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && pharmacies.length === 0 && !error && (
          <div className="text-center py-24 px-6 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="bg-blue-600/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner border border-slate-800">
                <MapPin className="w-12 h-12 text-blue-500" strokeWidth={1.8} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-full shadow-lg border border-slate-800">
                <Search className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              </div>
            </div>
            <div className="max-w-xs mx-auto">
              <h2 className="text-2xl font-semibold text-slate-100">Ready to Locate?</h2>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Click <strong className="text-slate-200">&quot;Near Me&quot;</strong> to use your GPS or type a city name above to find pharmacies.
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="bg-amber-500/10 p-4 rounded-2xl text-amber-400 shrink-0 border border-amber-500/20">
            <Info className="w-8 h-8" strokeWidth={1.8} />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-semibold text-slate-100 text-sm uppercase tracking-widest">Medical Accuracy Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Data is aggregated from OpenStreetMap and simulated inventory models. Actual store prices and availability may differ.
              <strong className="text-slate-200"> Always call the pharmacy to confirm</strong> before visiting for critical needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}


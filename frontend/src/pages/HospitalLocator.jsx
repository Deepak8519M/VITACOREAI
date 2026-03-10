import { useMemo, useState } from 'react'
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Navigation,
  AlertCircle,
  Filter,
  Stethoscope,
  Activity,
  ArrowUpDown,
  Info
} from 'lucide-react'

/**
 * Nearby Hospital Locator (MediLocate)
 * Uses Nominatim for geocoding and Overpass API for POI data.
 */
export default function HospitalLocator() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [error, setError] = useState(null)
  const [userCoords, setUserCoords] = useState(null)
  const [filters, setFilters] = useState({
    type: 'all',
    emergencyOnly: false,
    sortBy: 'distance'
  })

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

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'VitaCore-MediLocate/1.0' } })
      const geoData = await geoRes.json()

      if (!geoData?.length) throw new Error('Location not found. Try entering a city or pincode.')

      const { lat, lon, display_name } = geoData[0]
      const latNum = parseFloat(lat)
      const lonNum = parseFloat(lon)
      setUserCoords({ lat: latNum, lon: lonNum, name: display_name })

      const overpassUrl =
        `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];` +
        `(node["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum});` +
        `way["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum});` +
        `relation["amenity"~"hospital|clinic|doctors"](around:10000,${latNum},${lonNum}););out center;`

      const hospitalRes = await fetch(overpassUrl)
      const hospitalData = await hospitalRes.json()

      const processed = (hospitalData.elements || []).map(item => {
        const tags = item.tags || {}
        const hLat = item.lat || item.center?.lat
        const hLon = item.lon || item.center?.lon

        return {
          id: item.id,
          name: tags.name || 'Unnamed Healthcare Center',
          type: tags.amenity === 'hospital' ? 'Hospital' : (tags.amenity === 'clinic' ? 'Clinic' : 'General Practice'),
          address: [
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city'],
            tags['addr:postcode']
          ].filter(Boolean).join(', ') || 'Address not listed',
          phone: tags.phone || tags['contact:phone'] || 'N/A',
          emergency: tags.emergency === 'yes' ? 'Available' : 'Not Specified',
          hours: tags.opening_hours || 'Contact for timing',
          specialty: tags.healthcare?.replace(/_/g, ' ') || tags.speciality || 'General Medicine',
          lat: hLat,
          lon: hLon,
          distance: (hLat && hLon) ? calculateDistance(latNum, lonNum, hLat, hLon) : '—'
        }
      })

      setHospitals(processed)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredHospitals = useMemo(() => {
    let list = [...hospitals]

    if (filters.emergencyOnly) list = list.filter(h => h.emergency === 'Available')
    if (filters.type !== 'all') list = list.filter(h => h.type.toLowerCase() === filters.type.toLowerCase())

    list.sort((a, b) => {
      if (filters.sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

    return list
  }, [hospitals, filters])

  const openNavigation = (lat, lon) => {
    const url = `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lon}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 font-sans text-slate-100 rounded-2xl border border-slate-800 overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-md">
                <Activity className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">MediLocate</h1>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
              <input
                type="text"
                placeholder="Enter area, city, or pincode..."
                className="w-full pl-10 pr-24 py-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-100 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!userCoords && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-blue-900/30 p-6 rounded-full mb-6 border border-blue-500/30">
              <MapPin className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Find Help Near You</h2>
            <p className="text-slate-400 max-w-md">
              Enter your location above to find hospitals, clinics, and emergency care centers within a 10km radius.
            </p>
          </div>
        )}

        {userCoords && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Search Results</span>
                <h2 className="text-2xl font-bold mt-1 text-white">Hospitals near {searchQuery}</h2>
                <p className="text-slate-400 text-sm mt-1 truncate max-w-md">{userCoords.name}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 text-sm">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-200 outline-none"
                    value={filters.type}
                    onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="all" className="bg-slate-900">All Types</option>
                    <option value="hospital" className="bg-slate-900">Hospitals</option>
                    <option value="clinic" className="bg-slate-900">Clinics</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 text-sm">
                  <ArrowUpDown className="w-4 h-4 text-slate-500" />
                  <select
                    className="bg-transparent border-none focus:ring-0 p-0 text-slate-200 outline-none"
                    value={filters.sortBy}
                    onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                  >
                    <option value="distance" className="bg-slate-900">By Distance</option>
                    <option value="name" className="bg-slate-900">By Name</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700 text-sm cursor-pointer hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    className="rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    checked={filters.emergencyOnly}
                    onChange={(e) => setFilters(f => ({ ...f, emergencyOnly: e.target.checked }))}
                  />
                  <span className="text-slate-200">Emergency Only</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-900 h-64 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Search Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredHospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all group overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${hospital.type === 'Hospital' ? 'bg-blue-900/40 text-blue-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
                      {hospital.type}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                      <MapPin className="w-3 h-3" />
                      {hospital.distance} km
                    </div>
                  </div>

                  <h3 className="text-lg font-bold leading-tight mb-2 text-white group-hover:text-blue-400 transition-colors">
                    {hospital.name}
                  </h3>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-start gap-2 text-sm text-slate-400">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                      <span className="line-clamp-2">{hospital.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="w-4 h-4 flex-shrink-0 text-slate-500" />
                      <span>{hospital.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Stethoscope className="w-4 h-4 flex-shrink-0 text-slate-500" />
                      <span className="capitalize">{hospital.specialty}</span>
                    </div>

                    {hospital.emergency === 'Available' && (
                      <div className="flex items-center gap-2 text-sm font-medium text-rose-300 bg-rose-900/30 px-3 py-1.5 rounded-lg w-fit border border-rose-500/20">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <span>Emergency: 24/7 Available</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{hospital.hours === 'Contact for timing' ? 'Check hours' : 'Open'}</span>
                  </div>
                  <button
                    onClick={() => openNavigation(hospital.lat, hospital.lon)}
                    className="flex items-center gap-2 bg-slate-800 text-slate-200 px-4 py-2 rounded-lg border border-slate-700 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {userCoords && !loading && !error && filteredHospitals.length === 0 && (
          <div className="bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-800">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">No results found</h3>
            <p className="text-slate-400">Try adjusting your filters or searching for a broader area.</p>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-slate-800 text-center">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl mx-auto flex items-start gap-4 text-left border border-slate-800">
            <Info className="w-6 h-6 text-slate-500 mt-1 flex-shrink-0" />
            <div className="text-sm text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-200 mb-1">Disclaimer & Privacy</p>
              This feature is intended for informational and navigation assistance only. Data is sourced from OpenStreetMap contributors. Hospital availability, specialties, and emergency services may vary. Users are strongly advised to contact the facility directly before visiting for critical care.
              <br /><br />
              <span className="opacity-60 italic">© {new Date().getFullYear()} MediLocate. Powered by OpenStreetMap.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}


import { useEffect, useMemo, useState } from 'react'
import {
  Upload,
  Trash2,
  FileText,
  FolderOpen,
  ShieldCheck,
  Clock,
  Filter,
  Calendar,
  Activity,
  Stethoscope,
  CheckCircle2,
  Search,
  Sparkles,
  X
} from 'lucide-react'
import api from '../utils/api'

const CATEGORIES = {
  ALL: 'All',
  PRESCRIPTION: 'Prescription',
  LAB_REPORT: 'Lab Report',
  SCAN: 'Scan',
  OTHER: 'Other'
}

const CATEGORY_COLORS = {
  [CATEGORIES.PRESCRIPTION]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [CATEGORIES.LAB_REPORT]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  [CATEGORIES.SCAN]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  [CATEGORIES.OTHER]: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
}

function CategoryIcon({ category, className = 'w-4 h-4' }) {
  switch (category) {
    case CATEGORIES.PRESCRIPTION:
      return <Stethoscope className={className} />
    case CATEGORIES.LAB_REPORT:
      return <Activity className={className} />
    case CATEGORIES.SCAN:
      return <FileText className={className} />
    default:
      return <FileText className={className} />
  }
}

export default function HealthVault() {
  const [records, setRecords] = useState([])
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(CATEGORIES.ALL)
  const [searchQuery, setSearchQuery] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanMeta, setScanMeta] = useState(null)

  const fetchRecords = () => {
    setLoadingList(true)
    setError('')
    api.get('/medical-records')
      .then(r => setRecords(r.data || []))
      .catch(e => setError(e?.response?.data?.error || 'Failed to load vault items'))
      .finally(() => setLoadingList(false))
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoadingUpload(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    if (desc) fd.append('description', desc)
    try {
      await api.post('/medical-records/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      setDesc('')
      fetchRecords()
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed')
    } finally {
      setLoadingUpload(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from your Health Vault?')) return
    setError('')
    try {
      await api.delete(`/medical-records/${id}`)
      fetchRecords()
    } catch (err) {
      setError(err?.response?.data?.error || 'Delete failed')
    }
  }

  const totalSizeKb = records.reduce((sum, r) => sum + (r.size || 0), 0) / 1024

  const fileToBase64 = (f) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(f)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (e) => reject(e)
    })
  }

  const openScan = () => {
    if (!file) return
    setScanOpen(true)
    setScanError('')
    setScanMeta(null)
  }

  const runScan = async () => {
    if (!file) return
    setScanLoading(true)
    setScanError('')
    try {
      const dataUrl = await fileToBase64(file)
      const pure = String(dataUrl).split(',')[1] || ''
      const { data } = await api.post('/health-vault/analyze', {
        data: pure,
        type: file.type || 'application/octet-stream',
        fileName: file.name || ''
      })
      setScanMeta({
        category: data?.category || 'Other',
        date: data?.date || new Date().toISOString().slice(0, 10),
        provider: data?.provider || 'Unknown Provider',
        title: data?.title || (file.name || 'Health document'),
        summary: data?.summary || ''
      })
    } catch (e) {
      setScanError(e?.response?.data?.error || 'Failed to extract details. Try a clearer image/PDF.')
    } finally {
      setScanLoading(false)
    }
  }

  const applyScanToLabel = () => {
    if (!scanMeta) return
    // Store structured metadata inside description for reliable timeline rendering.
    // Format: HV|Category|YYYY-MM-DD|Provider|Title|Summary
    const safe = (s) => String(s || '').replaceAll('|', ' ').replaceAll('\n', ' ').trim()
    const hv = `HV|${safe(scanMeta.category)}|${safe(scanMeta.date)}|${safe(scanMeta.provider)}|${safe(scanMeta.title)}|${safe(scanMeta.summary)}`
    setDesc(hv)
    setScanOpen(false)
  }

  const docs = useMemo(() => {
    return (records || []).map(r => {
      const originalName = r.originalName || 'file'
      const rawDesc = r.description || ''

      // Parse structured HV metadata if present
      if (rawDesc.startsWith('HV|')) {
        const parts = rawDesc.split('|')
        const category = parts[1] || 'Other'
        const date = parts[2] || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
        const provider = parts[3] || 'Unknown Provider'
        const title = parts[4] || originalName
        const summary = parts.slice(5).join('|') || ''
        return {
          id: r._id,
          title,
          category: Object.values(CATEGORIES).includes(category) ? category : CATEGORIES.OTHER,
          date,
          provider,
          summary: summary || '—',
          fileName: originalName
        }
      }

      const name = originalName.toLowerCase()
      const label = rawDesc.toLowerCase()
      const text = `${name} ${label}`

      let category = CATEGORIES.OTHER
      if (/(rx|prescription|tablet|capsule|dose)/i.test(text)) {
        category = CATEGORIES.PRESCRIPTION
      } else if (/(lab|test|blood|cbc|lipid|panel|report)/i.test(text)) {
        category = CATEGORIES.LAB_REPORT
      } else if (/(scan|mri|ct|x[- ]?ray|ultrasound|imaging)/i.test(text)) {
        category = CATEGORIES.SCAN
      }

      const date = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)

      return {
        id: r._id,
        title: r.description || originalName || 'Untitled document',
        category,
        date,
        provider: 'Uploaded to Health Vault',
        summary: r.description || 'No summary provided.',
        fileName: originalName
      }
    })
  }, [records])

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return docs
      .filter(d => (filter === CATEGORIES.ALL || d.category === filter))
      .filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.provider.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [docs, filter, searchQuery])

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <span className="inline-flex w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/30 items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
            </span>
            Health Vault
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Secure space for lab reports, prescriptions, discharge summaries and other health documents.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={1.8} />
          <span>Encrypted in your account · Only you can manage this vault</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Upload area */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-100">Add a new document</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Ideal for blood tests, imaging reports, consultation notes and prescriptions.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Recent files appear at the top</span>
          </div>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-slate-400 text-xs font-medium mb-1.5">Choose file</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="block w-full text-slate-400 text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600/15 file:text-blue-400 file:font-medium file:hover:bg-blue-600/25"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Supported: PDF, images, and text. Max 10MB per file.
            </p>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-slate-400 text-xs font-medium mb-1.5">Label (optional)</label>
            <input
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 w-full"
              placeholder="e.g. Lipid profile – Jan 2026"
            />
          </div>
          <button
            type="button"
            disabled={!file || loadingUpload}
            onClick={openScan}
            className="px-5 py-3 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 text-sm font-semibold hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            title="Extract date, provider, category, title, summary"
          >
            <Sparkles className="w-4 h-4 text-blue-400" strokeWidth={1.8} />
            Scan & Extract
          </button>
          <button
            type="submit"
            disabled={loadingUpload || !file}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
          >
            <Upload className="w-4 h-4" strokeWidth={1.8} />
            {loadingUpload ? 'Uploading…' : 'Upload to Vault'}
          </button>
        </form>
      </div>

      {/* Scan & Extract Modal */}
      {scanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => !scanLoading && setScanOpen(false)} />
          <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Scan & Extract
                </h3>
                <p className="text-xs text-slate-500 mt-1">AI will extract category, date, provider, title and summary.</p>
              </div>
              <button
                onClick={() => setScanOpen(false)}
                disabled={scanLoading}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {scanError && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                  {scanError}
                </div>
              )}

              {!scanMeta ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <p className="text-sm text-slate-200 font-semibold">Selected file</p>
                  <p className="text-xs text-slate-500 mt-1 break-all">{file?.name}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={runScan}
                      disabled={scanLoading}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all"
                    >
                      {scanLoading ? 'Extracting…' : 'Start extraction'}
                    </button>
                    <button
                      onClick={() => setScanOpen(false)}
                      disabled={scanLoading}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 text-sm font-semibold hover:bg-slate-900 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Date</label>
                      <input
                        type="date"
                        value={scanMeta.date}
                        onChange={(e) => setScanMeta(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Category</label>
                      <select
                        value={scanMeta.category}
                        onChange={(e) => setScanMeta(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                      >
                        {[CATEGORIES.PRESCRIPTION, CATEGORIES.LAB_REPORT, CATEGORIES.SCAN, CATEGORIES.OTHER].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Title</label>
                    <input
                      value={scanMeta.title}
                      onChange={(e) => setScanMeta(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                      placeholder="e.g. CBC Report"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Provider</label>
                    <input
                      value={scanMeta.provider}
                      onChange={(e) => setScanMeta(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                      placeholder="Hospital / clinic / doctor"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Summary</label>
                    <textarea
                      value={scanMeta.summary}
                      onChange={(e) => setScanMeta(prev => ({ ...prev, summary: e.target.value }))}
                      className="w-full min-h-[90px] px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40 resize-none"
                      placeholder="One sentence summary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => { setScanMeta(null); setScanError(''); }}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-200 text-sm font-semibold hover:bg-slate-900 transition-all"
                    >
                      Rescan
                    </button>
                    <button
                      onClick={applyScanToLabel}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all"
                    >
                      Apply to upload
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline + summary */}
      <div className="grid md:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Timeline history
              </h2>
              <p className="text-xs text-slate-500">
                {loadingList
                  ? 'Loading your vault…'
                  : records.length === 0
                    ? 'No documents yet. Upload your first report above.'
                    : `${records.length} document${records.length > 1 ? 's' : ''} stored in your vault.`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search vault…"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500/40"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.values(CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                  filter === cat
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                {cat === CATEGORIES.ALL ? (
                  <Filter className="w-3 h-3" />
                ) : (
                  <CategoryIcon category={cat} className="w-3 h-3" />
                )}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {loadingList ? (
            <div className="py-8 text-sm text-slate-500">Fetching items…</div>
          ) : filteredDocs.length === 0 ? (
            <div className="mt-4 py-6 px-4 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
              <span>No records match your filters yet. Try changing the category or search.</span>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-4 before:w-[2px] before:bg-slate-800">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="relative">
                  <div
                    className={`absolute -left-[15px] top-5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                      doc.category === CATEGORIES.PRESCRIPTION
                        ? 'bg-blue-500'
                        : doc.category === CATEGORIES.LAB_REPORT
                          ? 'bg-purple-500'
                          : doc.category === CATEGORIES.SCAN
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                    }`}
                  />
                  <div className="bg-slate-950/70 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${CATEGORY_COLORS[doc.category]}`}>
                        {doc.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(doc.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100 mb-1">{doc.title}</h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-2">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                      {doc.provider}
                    </p>
                    <p className="text-xs text-slate-400 italic bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      "{doc.summary}"
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-600 font-mono truncate">{doc.fileName}</span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
              Vault summary
            </p>
            <p className="text-sm text-slate-300">
              Documents: <span className="font-semibold text-white">{records.length}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Approx. size used:{' '}
              <span className="font-medium text-slate-200">
                {totalSizeKb ? `${totalSizeKb.toFixed(1)} KB` : '0 KB'}
              </span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-100 mb-1">How Health Vault auto‑categorizes</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Prescription, lab report, or scan are inferred from the file name and label.</li>
              <li>Use clear labels like “CBC lab report – Mar 2026” for best categorization.</li>
              <li>You can always delete and re‑upload if you want to rename or relabel a document.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold">Smart organization</span>
            </div>
            <p>
              Health Vault keeps your history organized into a chronological timeline so you can quickly
              review how your medical journey evolves over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


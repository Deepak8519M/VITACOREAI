import { useEffect, useState } from 'react'
import { Upload, Trash2, FileText, FolderOpen, ShieldCheck, Clock } from 'lucide-react'
import api from '../utils/api'

export default function HealthVault() {
  const [records, setRecords] = useState([])
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState('')

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
            type="submit"
            disabled={loadingUpload || !file}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all"
          >
            <Upload className="w-4 h-4" strokeWidth={1.8} />
            {loadingUpload ? 'Uploading…' : 'Upload to Vault'}
          </button>
        </form>
      </div>

      {/* Summary + list */}
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Stored documents</h2>
              <p className="text-xs text-slate-500">
                {loadingList
                  ? 'Loading your vault…'
                  : records.length === 0
                    ? 'No documents yet. Upload your first report above.'
                    : `${records.length} item${records.length > 1 ? 's' : ''} stored in your vault.`}
              </p>
            </div>
          </div>

          {loadingList ? (
            <div className="py-8 text-sm text-slate-500">Fetching items…</div>
          ) : records.length === 0 ? (
            <div className="mt-4 py-6 px-4 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
              <span>Nothing here yet. Start by uploading a recent lab report or prescription.</span>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-slate-800">
              {records.map(r => (
                <li key={r._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-100 font-medium text-sm truncate">
                        {r.originalName}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate">
                        {(r.description || 'Unlabelled')} · {r.size ? `${(r.size / 1024).toFixed(1)} KB` : ''} ·{' '}
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
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
            <p className="font-semibold text-slate-100 mb-1">How to use Health Vault</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload lab reports, imaging summaries, prescriptions and discharge papers.</li>
              <li>Use clear labels like “Thyroid profile – Mar 2026” to stay organized.</li>
              <li>Keep sensitive IDs out of file names; store them only where necessary.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}


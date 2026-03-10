import { useState, useEffect } from 'react'
import { Upload, Trash2, FileText } from 'lucide-react'
import api from '../utils/api'

export default function MedicalRecords() {
  const [records, setRecords] = useState([])
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(true)

  const fetchRecords = () => {
    api.get('/medical-records').then(r => setRecords(r.data)).finally(() => setLoadingList(false))
  }

  useEffect(() => fetchRecords(), [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (desc) fd.append('description', desc)
    try {
      await api.post('/medical-records/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      setDesc('')
      fetchRecords()
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try {
      await api.delete(`/medical-records/${id}`)
      fetchRecords()
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Medical Records</h1>
        <p className="text-slate-400 text-sm mt-0.5">Securely store and manage your medical documents</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-4">Upload Report</h2>
        <form onSubmit={handleUpload} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5">File</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={e => setFile(e.target.files[0])}
              className="block w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600/10 file:text-blue-500 file:font-medium" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Description (optional)</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              placeholder="e.g. Annual checkup 2024" />
          </div>
          <button type="submit" disabled={loading || !file}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
            <Upload className="w-4 h-4" strokeWidth={1.8} />
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-4">Your Records</h2>
        {loadingList ? (
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" strokeWidth={1.8} />
            No records yet. Upload a file above.
          </p>
        ) : (
          <ul className="space-y-0">
            {records.map(r => (
              <li key={r._id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-slate-100 font-medium text-sm">{r.originalName}</p>
                    <p className="text-slate-500 text-xs">{r.description || '—'} • {r.size ? `${(r.size / 1024).toFixed(1)} KB` : ''} • {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(r._id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

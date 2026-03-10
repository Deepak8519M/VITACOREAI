import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      await api.put('/users/profile', { name })
      setMsg('Profile updated')
    } catch (err) {
      setMsg(err.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account settings</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm cursor-not-allowed" />
            <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
          </div>
          {msg && <p className={`text-sm font-medium ${msg.includes('failed') ? 'text-rose-400' : 'text-emerald-400'}`}>{msg}</p>}
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

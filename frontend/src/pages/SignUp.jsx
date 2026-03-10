import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
            <Activity className="w-5 h-5 text-blue-500" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold gradient-text tracking-tight">VitaCore AI</span>
        </Link>
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
          <h1 className="text-xl font-semibold text-white mb-6">Create account</h1>
          {error && <p className="text-rose-400 text-sm mb-4 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="Your name" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm font-medium mb-1.5">Password (min 6 characters)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-5 text-center text-slate-400 text-sm">
            Already have an account? <Link to="/login" className="text-blue-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

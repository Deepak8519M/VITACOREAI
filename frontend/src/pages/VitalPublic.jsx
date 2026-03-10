import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShieldAlert, Phone, Copy, Check, HeartPulse } from 'lucide-react'
import api from '../utils/api'

export default function VitalPublic() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setData(null)
    api.get(`/vital-id/public/${encodeURIComponent(token || '')}`)
      .then(r => mounted && setData(r.data))
      .catch(e => {
        if (!mounted) return
        setError(e?.response?.data?.error || 'This emergency link is invalid or has been revoked.')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [token])

  const contacts = useMemo(() => {
    const cs = Array.isArray(data?.contacts) ? data.contacts : []
    return cs.filter(c => (c?.name || c?.phone))
  }, [data])

  const copy = async (text) => {
    try {
      if (!text) return
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
        <div className="relative">
          <HeartPulse className="w-14 h-14 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse"></div>
        </div>
        <p className="mt-8 text-slate-500 font-semibold tracking-widest uppercase text-[10px]">Loading emergency profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="p-7 md:p-9 bg-gradient-to-br from-rose-600/90 to-rose-600/60 text-white">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">VITAL ID (Read-only)</p>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight break-words flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-white/95" strokeWidth={1.8} />
                  {data?.name || 'Unnamed'}
                </h1>
                <p className="text-white/80 text-sm">
                  If this is an emergency, call your local emergency number.
                </p>
              </div>
              <Link
                to="/"
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white/90 text-sm font-semibold hover:bg-white/15 transition-all"
              >
                VitaCore
              </Link>
            </div>
          </div>

          <div className="p-7 md:p-9 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                {error}
              </div>
            )}

            {!error && data && (
              <>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Blood</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{data.bloodGroup || 'Unknown'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Donor</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{data.organDonor || 'Not Specified'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Language</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{data.primaryLanguage || '—'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Allergies</p>
                    <p className="mt-2 text-slate-100 whitespace-pre-wrap">{data.allergies || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Conditions</p>
                    <p className="mt-2 text-slate-100 whitespace-pre-wrap">{data.conditions || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Medications</p>
                    <p className="mt-2 text-slate-100 whitespace-pre-wrap">{data.medications || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">EMS instructions</p>
                    <p className="mt-2 text-slate-100 whitespace-pre-wrap">{data.emsInstructions || '—'}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Emergency contacts</p>
                  <div className="mt-3 space-y-3">
                    {contacts.length === 0 && <p className="text-slate-400 text-sm">No contacts provided.</p>}
                    {contacts.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">{c.name || 'Contact'}</p>
                          <p className="text-slate-400 text-sm truncate">{[c.relationship, c.phone].filter(Boolean).join(' • ') || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.phone && (
                            <>
                              <a
                                href={`tel:${c.phone}`}
                                className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all inline-flex items-center gap-2"
                              >
                                <Phone className="w-4 h-4" strokeWidth={1.8} />
                                Call
                              </a>
                              <button
                                onClick={() => copy(c.phone)}
                                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-100 text-sm font-semibold hover:bg-slate-900 transition-all inline-flex items-center gap-2"
                              >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.8} /> : <Copy className="w-4 h-4" strokeWidth={1.8} />}
                                Copy
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-200 text-sm">
                  This is a shared emergency profile link. It may be incomplete or outdated. Always confirm critical info with the person when possible.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


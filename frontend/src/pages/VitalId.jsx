import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Phone,
  Edit2,
  Save,
  X,
  Lock,
  Unlock,
  HeartPulse,
  ShieldAlert,
  Copy,
  Check,
  Globe,
  HandMetal,
  AlertTriangle,
  Stethoscope,
  Pill,
  FileText
} from 'lucide-react'
import api from '../utils/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const DONOR_STATUS = ['Yes', 'No', 'Not Specified']

const emptyProfile = {
  name: '',
  bloodGroup: 'Unknown',
  organDonor: 'Not Specified',
  primaryLanguage: '',
  religiousPreferences: '',
  emsInstructions: '',
  allergies: '',
  conditions: '',
  medications: '',
  extraNotes: '',
  contacts: [{ name: '', relationship: '', phone: '' }],
  shareEnabled: false,
  shareToken: null,
  shareCreatedAt: null
}

function normalizeProfile(p) {
  const profile = { ...emptyProfile, ...(p || {}) }
  if (!Array.isArray(profile.contacts) || profile.contacts.length === 0) {
    profile.contacts = [{ name: '', relationship: '', phone: '' }]
  }
  return profile
}

export default function VitalId() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLocked, setIsLocked] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(null)
  const [shareBusy, setShareBusy] = useState(false)

  const [profile, setProfile] = useState(emptyProfile)
  const [draft, setDraft] = useState(emptyProfile)

  useEffect(() => {
    let mounted = true
    api.get('/vital-id')
      .then(r => {
        if (!mounted) return
        const p = normalizeProfile(r.data)
        setProfile(p)
        setDraft(p)
      })
      .catch(e => {
        if (!mounted) return
        setError(e?.response?.data?.error || 'Failed to load VITAL ID')
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const hasEmergencyContacts = useMemo(() => {
    return draft.contacts?.some(c => (c?.name || c?.phone))
  }, [draft.contacts])

  const shareLink = useMemo(() => {
    if (!profile?.shareEnabled || !profile?.shareToken) return ''
    return `${window.location.origin}/vital/${profile.shareToken}`
  }, [profile?.shareEnabled, profile?.shareToken])

  const copyToClipboard = async (text, id) => {
    try {
      if (!text) return
      await navigator.clipboard.writeText(text)
      setCopyFeedback(id)
      setTimeout(() => setCopyFeedback(null), 1500)
    } catch {
      // ignore
    }
  }

  const generateShare = async () => {
    if (isLocked || isEditing) return
    setError('')
    setShareBusy(true)
    try {
      const { data } = await api.post('/vital-id/share')
      const next = normalizeProfile({ ...profile, ...data, shareEnabled: true })
      setProfile(next)
      setDraft(next)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to generate share link')
    } finally {
      setShareBusy(false)
    }
  }

  const revokeShare = async () => {
    if (isLocked || isEditing) return
    setError('')
    setShareBusy(true)
    try {
      await api.delete('/vital-id/share')
      const next = normalizeProfile({ ...profile, shareEnabled: false, shareToken: null, shareCreatedAt: null })
      setProfile(next)
      setDraft(next)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to revoke share link')
    } finally {
      setShareBusy(false)
    }
  }

  const addContact = () => {
    setDraft(prev => ({ ...prev, contacts: [...(prev.contacts || []), { name: '', relationship: '', phone: '' }] }))
  }

  const removeContact = (idx) => {
    setDraft(prev => ({ ...prev, contacts: (prev.contacts || []).filter((_, i) => i !== idx) }))
  }

  const updateContact = (idx, field, value) => {
    setDraft(prev => {
      const contacts = [...(prev.contacts || [])]
      contacts[idx] = { ...(contacts[idx] || {}), [field]: value }
      return { ...prev, contacts }
    })
  }

  const startEdit = () => {
    setDraft(profile)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  const save = async () => {
    setError('')
    try {
      const payload = { ...draft }
      const { data } = await api.put('/vital-id', payload)
      const p = normalizeProfile(data)
      setProfile(p)
      setDraft(p)
      setIsEditing(false)
      setIsLocked(true)
    } catch (e) {
      setError(e?.response?.data?.error || 'Save failed')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-slate-950">
        <div className="relative">
          <HeartPulse className="w-14 h-14 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse"></div>
        </div>
        <p className="mt-8 text-slate-500 font-semibold tracking-widest uppercase text-[10px]">Loading VITAL ID</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" strokeWidth={1.8} />
            </div>
            VITAL ID
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Emergency medical profile for responders (not a diagnosis).</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isEditing && (
            <button
              onClick={() => setIsLocked(v => !v)}
              className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isLocked
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  : 'bg-white text-slate-950 border-white hover:bg-slate-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {isLocked ? <Lock className="w-4 h-4" strokeWidth={1.8} /> : <Unlock className="w-4 h-4" strokeWidth={1.8} />}
                {isLocked ? 'Locked' : 'Unlocked'}
              </span>
            </button>
          )}

          {!isLocked && !isEditing && (
            <button
              onClick={startEdit}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 active:scale-[0.98] transition-all shadow-lg shadow-rose-900/20"
            >
              <span className="inline-flex items-center gap-2">
                <Edit2 className="w-4 h-4" strokeWidth={1.8} />
                Edit
              </span>
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-900 transition-all"
              >
                <span className="inline-flex items-center gap-2">
                  <X className="w-4 h-4" strokeWidth={1.8} />
                  Cancel
                </span>
              </button>
              <button
                onClick={save}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20"
              >
                <span className="inline-flex items-center gap-2">
                  <Save className="w-4 h-4" strokeWidth={1.8} />
                  Save
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Share Emergency Link (Public Read-only) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Share Emergency Link</p>
            <div className="mt-2 flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-blue-400" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold">
                  {profile.shareEnabled && profile.shareToken ? 'Active public link' : 'Not shared yet'}
                </p>
                <p className="text-slate-400 text-sm">
                  Generates a read-only link + QR for responders. You can revoke anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              disabled={isLocked || isEditing || shareBusy}
              onClick={generateShare}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                isLocked || isEditing || shareBusy
                  ? 'bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
              }`}
            >
              {profile.shareEnabled ? 'Regenerate' : 'Generate'}
            </button>
            <button
              disabled={isLocked || isEditing || shareBusy || !profile.shareEnabled}
              onClick={revokeShare}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isLocked || isEditing || shareBusy || !profile.shareEnabled
                  ? 'bg-slate-950/50 border border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/20'
              }`}
            >
              Revoke
            </button>
            {shareLink && (
              <button
                onClick={() => copyToClipboard(shareLink, 'share-link')}
                className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-100 text-sm font-semibold hover:bg-slate-900 transition-all inline-flex items-center gap-2"
              >
                {copyFeedback === 'share-link' ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.8} /> : <Copy className="w-4 h-4" strokeWidth={1.8} />}
                Copy link
              </button>
            )}
          </div>
        </div>

        {shareLink && (
          <div className="border-t border-slate-800 p-6 md:p-7 bg-slate-950/30">
            <div className="grid lg:grid-cols-[1fr_240px] gap-6 items-start">
              <div className="space-y-3 min-w-0">
                <p className="text-slate-300 text-sm font-semibold">Emergency URL</p>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                  <p className="text-slate-100 text-sm break-all">{shareLink}</p>
                </div>
                <p className="text-slate-500 text-xs">
                  Tip: keep VITAL ID updated. Regenerate if you ever shared it with the wrong person/device.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-white p-4">
                {shareLink ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(shareLink)}`}
                    alt="VITAL ID emergency QR code"
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="w-full aspect-square bg-slate-100/70 rounded-xl animate-pulse" />
                )}
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-600 text-center">
                  Scan to open
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary Emergency Card */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="p-8 md:p-10 bg-gradient-to-br from-rose-600/90 to-rose-600/60 text-white">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80">Emergency Profile</p>
              {!isEditing ? (
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight break-words">
                  {profile.name || 'Unnamed'}
                </h2>
              ) : (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full max-w-xl px-5 py-4 rounded-2xl bg-black/20 border border-white/20 text-white text-2xl md:text-3xl font-semibold outline-none focus:border-white/40"
                  placeholder="Full name"
                />
              )}
            </div>

            <div className="flex gap-4">
              <div className="bg-white/95 text-slate-950 rounded-3xl p-6 min-w-[140px] text-center shadow-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-rose-600 mb-2">Blood</p>
                {!isEditing ? (
                  <p className="text-4xl font-semibold leading-none">{profile.bloodGroup}</p>
                ) : (
                  <select
                    value={draft.bloodGroup}
                    onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })}
                    className="w-full bg-transparent text-slate-950 text-2xl font-semibold outline-none"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                )}
              </div>

              <div className="bg-black/30 border border-white/20 rounded-3xl p-6 min-w-[160px] text-center backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80 mb-2">Donor</p>
                {!isEditing ? (
                  <p className="text-2xl font-semibold leading-none">{profile.organDonor}</p>
                ) : (
                  <select
                    value={draft.organDonor}
                    onChange={(e) => setDraft({ ...draft, organDonor: e.target.value })}
                    className="w-full bg-transparent text-white text-lg font-semibold outline-none"
                  >
                    {DONOR_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* EMS Instructions */}
        <div className="p-8 md:p-10 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">EMS Specific Instructions</h3>
              <p className="text-xs text-slate-500">Highest priority guidance for first responders</p>
            </div>
          </div>

          {!isEditing ? (
            <p className={`text-lg font-semibold leading-relaxed ${profile.emsInstructions ? 'text-slate-100' : 'text-slate-600 italic'}`}>
              {profile.emsInstructions || 'No EMS instructions provided.'}
            </p>
          ) : (
            <textarea
              value={draft.emsInstructions}
              onChange={(e) => setDraft({ ...draft, emsInstructions: e.target.value })}
              className="w-full min-h-[120px] p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-rose-500/50"
              placeholder="Critical information for EMS (e.g. DNR details, airway issues, etc.)"
            />
          )}
        </div>

        {/* Clinical info */}
        <div className="p-8 md:p-10 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={1.8} />
              <h4 className="text-sm font-semibold text-slate-100">Allergies</h4>
            </div>
            {!isEditing ? (
              <p className={`text-sm leading-relaxed ${profile.allergies ? 'text-rose-300' : 'text-slate-600 italic'}`}>
                {profile.allergies || 'No known allergies listed.'}
              </p>
            ) : (
              <textarea
                value={draft.allergies}
                onChange={(e) => setDraft({ ...draft, allergies: e.target.value })}
                className="w-full min-h-[110px] p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 outline-none focus:border-amber-400/40"
                placeholder="e.g. Penicillin, peanuts, latex"
              />
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Stethoscope className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              <h4 className="text-sm font-semibold text-slate-100">Conditions</h4>
            </div>
            {!isEditing ? (
              <p className={`text-sm leading-relaxed ${profile.conditions ? 'text-slate-200' : 'text-slate-600 italic'}`}>
                {profile.conditions || 'No conditions listed.'}
              </p>
            ) : (
              <textarea
                value={draft.conditions}
                onChange={(e) => setDraft({ ...draft, conditions: e.target.value })}
                className="w-full min-h-[110px] p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 outline-none focus:border-blue-500/40"
                placeholder="e.g. Diabetes, asthma, epilepsy"
              />
            )}
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Pill className="w-5 h-5 text-purple-400" strokeWidth={1.8} />
              <h4 className="text-sm font-semibold text-slate-100">Medications</h4>
            </div>
            {!isEditing ? (
              <p className={`text-sm leading-relaxed ${profile.medications ? 'text-slate-200' : 'text-slate-600 italic'}`}>
                {profile.medications || 'No medications listed.'}
              </p>
            ) : (
              <textarea
                value={draft.medications}
                onChange={(e) => setDraft({ ...draft, medications: e.target.value })}
                className="w-full min-h-[110px] p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 outline-none focus:border-purple-400/40"
                placeholder="e.g. Metformin 500mg, inhaler"
              />
            )}
          </div>
        </div>
      </div>

      {/* Secondary info + contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-slate-800 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Primary language</p>
                {!isEditing ? (
                  <p className="text-sm font-semibold text-slate-100">{profile.primaryLanguage || 'Not specified'}</p>
                ) : (
                  <input
                    value={draft.primaryLanguage}
                    onChange={(e) => setDraft({ ...draft, primaryLanguage: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                    placeholder="e.g. English"
                  />
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-slate-800 flex items-center justify-center">
                <HandMetal className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Religious preferences</p>
                {!isEditing ? (
                  <p className="text-sm font-semibold text-slate-100">{profile.religiousPreferences || 'Not specified'}</p>
                ) : (
                  <input
                    value={draft.religiousPreferences}
                    onChange={(e) => setDraft({ ...draft, religiousPreferences: e.target.value })}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                    placeholder="Treatment restrictions?"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-slate-400" strokeWidth={1.8} />
              <h4 className="text-sm font-semibold text-slate-100">Extra notes</h4>
            </div>
            {!isEditing ? (
              <p className={`text-sm leading-relaxed ${profile.extraNotes ? 'text-slate-300' : 'text-slate-600 italic'}`}>
                {profile.extraNotes || 'No extra notes.'}
              </p>
            ) : (
              <textarea
                value={draft.extraNotes}
                onChange={(e) => setDraft({ ...draft, extraNotes: e.target.value })}
                className="w-full min-h-[120px] p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-100 outline-none focus:border-blue-500/40"
                placeholder="Anything else responders should know (implants, preferred hospital, etc.)"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">Emergency contacts</p>
                <p className="text-xs text-slate-500">Tap call or copy number</p>
              </div>
              {isEditing && (
                <button
                  onClick={addContact}
                  className="px-3 py-2 rounded-xl bg-white text-slate-950 text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" strokeWidth={1.8} />
                    Add
                  </span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {(isEditing ? draft.contacts : profile.contacts).map((c, idx) => {
                const key = `c-${idx}`
                const phone = (c?.phone || '').trim()
                return (
                  <div key={key} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            value={c?.name || ''}
                            onChange={(e) => updateContact(idx, 'name', e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                            placeholder="Name"
                          />
                          <button
                            onClick={() => removeContact(idx)}
                            className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Remove"
                          >
                            <X className="w-4 h-4" strokeWidth={1.8} />
                          </button>
                        </div>
                        <input
                          value={c?.relationship || ''}
                          onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                          placeholder="Relationship"
                        />
                        <input
                          value={c?.phone || ''}
                          onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/40"
                          placeholder="Phone"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-slate-100 font-semibold text-sm">{c?.name || '—'}</p>
                          <p className="text-slate-500 text-xs">{c?.relationship || '—'}</p>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          <a
                            href={phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : undefined}
                            className={`col-span-4 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                              phone ? 'bg-slate-800 text-white hover:bg-rose-600 active:scale-[0.98]' : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                            }`}
                            onClick={(e) => { if (!phone) e.preventDefault() }}
                          >
                            <Phone className="w-4 h-4" strokeWidth={1.8} />
                            {phone ? phone : 'No phone'}
                          </a>
                          <button
                            onClick={() => copyToClipboard(phone, key)}
                            disabled={!phone}
                            className={`col-span-1 px-3 py-2.5 rounded-xl border transition-all flex items-center justify-center ${
                              !phone
                                ? 'border-slate-800 text-slate-700 cursor-not-allowed'
                                : copyFeedback === key
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                            }`}
                            title="Copy"
                          >
                            {copyFeedback === key ? <Check className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={1.8} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {!isEditing && !hasEmergencyContacts && (
                <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm">
                  Add at least one emergency contact in edit mode.
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
            <p className="font-semibold mb-1">Reminder</p>
            This tool stores your emergency profile in your VitaCore account. Keep it updated and always verify details with a clinician.
          </div>
        </div>
      </div>
    </div>
  )
}


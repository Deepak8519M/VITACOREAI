import { useEffect, useMemo, useRef, useState } from 'react'
import { MessagesSquare, Send, AlertCircle, ShieldAlert } from 'lucide-react'
import api from '../utils/api'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Hi, I’m VitaCore AI Health Assistant. Tell me your symptoms, age, and any known conditions/medications. This is not a diagnosis.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  const history = useMemo(() => {
    // send limited history to keep requests small
    const tail = messages.slice(-10).map(m => ({ role: m.role, text: m.text }))
    return tail
  }, [messages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setError('')
    setLoading(true)
    setInput('')

    const next = [...messages, { role: 'user', text }]
    setMessages(next)

    try {
      const { data } = await api.post('/chat', { message: text, history })
      const reply = (data?.text || '').trim() || 'Sorry, I could not generate a response right now.'
      setMessages(cur => [...cur, { role: 'model', text: reply }])
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Chat failed'
      setError(msg)
      setMessages(cur => [...cur, { role: 'model', text: 'I’m having trouble connecting right now. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
            <MessagesSquare className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
          </div>
          Health Chatbot
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Ask health questions, understand risk factors, and get guidance. Not a diagnosis.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-start gap-3 text-slate-400 text-sm">
          <ShieldAlert className="w-4 h-4 mt-0.5 text-amber-400" strokeWidth={1.8} />
          <p>
            If you have chest pain, trouble breathing, fainting, severe bleeding, or stroke symptoms, seek emergency care immediately.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="h-[420px] overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white border-blue-500/30'
                    : 'bg-slate-950/40 text-slate-200 border-slate-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm border bg-slate-950/40 text-slate-300 border-slate-800">
                <span className="animate-pulse">Typing…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-800 p-4">
          {error && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" strokeWidth={1.8} />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Type your question… (press Enter to send)"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" strokeWidth={1.8} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


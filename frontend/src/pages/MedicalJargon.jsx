import { useState } from 'react'
import {
  FileText,
  Sparkles,
  Trash2,
  AlertCircle,
  Loader2,
  Copy,
  BookOpen
} from 'lucide-react'
import api from '../utils/api'

const SAMPLE_TEXT = `Patient presents with acute myocardial infarction. Troponin levels are elevated. EKG shows ST-segment elevation in leads II, III, and aVF. Patient was started on dual antiplatelet therapy and high-dose statins. Echocardiogram demonstrates reduced left ventricular ejection fraction.`

function formatMarkdown(text) {
  if (!text) return ''
  return text
    .split('\n\n')
    .map(
      p =>
        `<p class="mb-4">${p.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-white font-semibold">$1</strong>'
        )}</p>`
    )
    .join('')
}

export default function MedicalJargon() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState('')

  const callGeminiDirect = async (input) => {
    const apiKey = import.meta.env.VITE_GEMINI_JARGON_KEY || import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Gemini API key not configured in frontend (.env)')
    }

    const systemPrompt = `You are a patient-centered medical communications expert. Your goal is to rewrite complex medical reports into plain, empathetic, and clear English (around an 8th-grade reading level).

GUIDELINES:
1. PRESERVE MEANING: Do not lose the clinical significance.
2. REMOVE JARGON: Replace technical terms with simple descriptions.
3. STRUCTURE: Narrative explanation first, followed by a glossary.
4. DO NOT DIAGNOSE: Use phrasing like "The document notes..." or "This typically refers to...".
5. NO MEDICAL ADVICE: Do not tell the user what to do next. Suggest they discuss with their doctor.
6. STYLE: Clear, calm, and professional.

RESPONSE FORMAT:
{
  "explanation": "Markdown formatted paragraphs of the simple explanation",
  "glossary": [
    {"term": "Original Term", "definition": "Simple definition"}
  ]
}

Output ONLY valid JSON, no markdown fences or extra commentary.`

    const model = 'gemini-2.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const payload = {
      contents: [{ role: 'user', parts: [{ text: input }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25,
        maxOutputTokens: 900,
        responseSchema: {
          type: 'OBJECT',
          properties: {
            explanation: { type: 'STRING' },
            glossary: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  term: { type: 'STRING' },
                  definition: { type: 'STRING' }
                }
              }
            }
          }
        }
      }
    }

    let delay = 1000
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          const msg = data?.error?.message || `Gemini error: HTTP ${resp.status}`
          throw new Error(msg)
        }
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) throw new Error('Empty response from Gemini')
        try {
          return JSON.parse(text)
        } catch {
          const cleaned = text.trim().replace(/```json/gi, '```').replace(/```/g, '').trim()
          return JSON.parse(cleaned)
        }
      } catch (err) {
        if (attempt === 3) throw err
        await new Promise(r => setTimeout(r, delay))
        delay *= 2
      }
    }
  }

  const handleSimplify = async () => {
    const input = text.trim()
    if (!input) {
      setFeedback('Please paste some medical text first.')
      setTimeout(() => setFeedback(''), 2500)
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let data
      // Prefer direct Gemini if key is present; otherwise fall back to backend route
      if (import.meta.env.VITE_GEMINI_JARGON_KEY || import.meta.env.VITE_GEMINI_API_KEY) {
        data = await callGeminiDirect(input)
      } else {
        const resp = await api.post('/jargon/clean', { text: input })
        data = resp.data
      }
      setResult({
        explanationHtml: formatMarkdown(data.explanation || ''),
        glossary: Array.isArray(data.glossary) ? data.glossary : []
      })
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to simplify text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setError('')
  }

  const handleUseSample = () => {
    setText(SAMPLE_TEXT)
    setFeedback('Sample text inserted.')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleCopy = () => {
    if (!result?.explanationHtml) return
    const temp = document.createElement('div')
    temp.innerHTML = result.explanationHtml
    const plain = temp.innerText
    navigator.clipboard.writeText(plain).then(() => {
      setFeedback('Copied to clipboard.')
      setTimeout(() => setFeedback(''), 2000)
    })
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in">
      <header className="text-center mb-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-3 text-blue-400 border border-blue-500/20">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Medical Jargon Cleaner</h1>
        <p className="mt-2 text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
          Paste complex medical report text and get a clear, patient‑friendly explanation with a terminology breakdown.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input side */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Paste medical text
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Use example
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={SAMPLE_TEXT}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 text-sm outline-none focus:border-blue-500/50 resize-none placeholder:text-slate-600"
            />

            <button
              type="button"
              onClick={handleSimplify}
              disabled={loading}
              className="w-full mt-5 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-900/40 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'De‑jargonizing…' : 'Simplify explanation'}
            </button>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl flex gap-3 items-start text-xs text-slate-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-[2px]" />
            <p>
              <span className="font-semibold text-slate-200">Disclaimer:</span> This tool is for educational purposes
              only and does not provide medical advice, diagnosis, or treatment. Always discuss your results with a
              licensed healthcare professional.
            </p>
          </div>
        </div>

        {/* Output side */}
        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 flex flex-col items-center justify-center min-h-[260px] text-slate-600 text-center">
              <BookOpen className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Your simplified explanation will appear here.</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Paste text on the left and click <span className="text-slate-300 font-medium">Simplify explanation</span>.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[260px]">
              <div className="w-8 h-8 border-3 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">De‑jargonizing medical content…</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 border-l-4 border-l-blue-500 shadow-xl p-5">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Simple explanation
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    title="Copy explanation"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div
                  className="text-sm text-slate-300 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.explanationHtml }}
                />
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Terminology breakdown
                </h3>
                {(!result.glossary || result.glossary.length === 0) && (
                  <p className="text-xs text-slate-500">
                    No specific jargon terms were identified. The explanation already uses simplified language.
                  </p>
                )}
                {result.glossary && result.glossary.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {result.glossary.map((g, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors"
                      >
                        <span className="font-semibold text-blue-300 text-sm">{g.term}:</span>{' '}
                        <span className="text-slate-300 text-sm">{g.definition}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full text-xs shadow-2xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  )
}


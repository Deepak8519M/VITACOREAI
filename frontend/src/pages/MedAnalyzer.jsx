import React, { useState, useRef } from 'react'
import {
  Camera,
  Upload,
  Search,
  Info,
  AlertTriangle,
  Stethoscope,
  ShieldAlert,
  Clock,
  FlaskConical,
  Thermometer,
  RefreshCcw,
  ChevronRight,
  Eye,
  BookOpen,
  Scan,
  Keyboard
} from 'lucide-react'

// WARNING: Keeping API key in frontend is NOT recommended for production.
// You asked explicitly to keep it here instead of .env.
// Replace this placeholder with your real key for local testing only.
const API_KEY = 'AIzaSyBBGDpK84cPIH_CnnU-MMh6j0fh-Md7l4E'
const MODEL = 'gemini-2.5-flash'

const InfoSection = ({ icon: Icon, title, content, color = 'blue', list = false, className = '' }) => {
  const colorClasses = {
    blue: 'border-blue-900/50 bg-blue-950/20 text-blue-400',
    green: 'border-emerald-900/50 bg-emerald-950/20 text-emerald-400',
    purple: 'border-purple-900/50 bg-purple-950/20 text-purple-400',
    amber: 'border-amber-900/50 bg-amber-950/20 text-amber-300',
    red: 'border-red-900/50 bg-red-950/20 text-red-400',
    indigo: 'border-indigo-900/50 bg-indigo-950/20 text-indigo-400',
    slate: 'border-slate-800 bg-slate-900 text-slate-400'
  }
  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div className={`p-6 rounded-3xl border ${classes} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-slate-900/50`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>
      </div>
      {list ? (
        <ul className="space-y-3">
          {(Array.isArray(content) ? content : []).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
              <span className="leading-relaxed">{item || '—'}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed font-light">
          {content || 'Information not available'}
        </p>
      )}
    </div>
  )
}

export default function MedAnalyzer() {
  const [image, setImage] = useState(null)
  const [base64Image, setBase64Image] = useState(null)
  const [imageMimeType, setImageMimeType] = useState('image/jpeg')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [viewMode, setViewMode] = useState('full')
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const mime = file.type || 'image/jpeg'
      setImageMimeType(mime)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(URL.createObjectURL(file))
        setBase64Image(String(reader.result).split(',')[1] || '')
        setAnalysisResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const callGemini = async (prompt, imageData = null, mimeType = 'image/jpeg') => {
    if (!API_KEY.trim()) {
      throw new Error('API key is missing. Set it in MedAnalyzer.jsx.')
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            ...(imageData ? [{ inlineData: { mimeType, data: imageData } }] : [])
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            brandName: { type: 'STRING' },
            genericName: { type: 'STRING' },
            category: { type: 'STRING' },
            dosageForm: { type: 'STRING' },
            simpleExplanation: { type: 'STRING' },
            uses: { type: 'ARRAY', items: { type: 'STRING' } },
            mechanism: { type: 'STRING' },
            dosagePattern: { type: 'STRING' },
            commonSideEffects: { type: 'ARRAY', items: { type: 'STRING' } },
            seriousSideEffects: { type: 'ARRAY', items: { type: 'STRING' } },
            precautions: { type: 'ARRAY', items: { type: 'STRING' } },
            interactions: { type: 'ARRAY', items: { type: 'STRING' } },
            storage: { type: 'STRING' }
          },
          required: ['brandName', 'genericName', 'simpleExplanation']
        }
      }
    }

    let retries = 0
    const maxRetries = 4
    let delay = 1000

    while (retries < maxRetries) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        )

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const msg = data?.error?.message || `Gemini API error ${response.status}`
          throw new Error(msg)
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) throw new Error('No valid response content from Gemini')

        try {
          return JSON.parse(text)
        } catch {
          const cleaned = text.trim().replace(/```json/gi, '```').replace(/```/g, '').trim()
          return JSON.parse(cleaned)
        }
      } catch (err) {
        retries++
        if (retries === maxRetries) throw err
        await new Promise(res => setTimeout(res, delay))
        delay *= 2
      }
    }
  }

  const analyzeImage = async () => {
    if (!base64Image) return
    setLoading(true)
    setError(null)
    try {
      const prompt = `You are a senior medical pharmacist. Carefully analyze this medicine strip / packaging image.
Identify brand name, generic name(s)/salt(s), strength/dosage.
Provide educational information in VERY SIMPLE LANGUAGE.
Rules:
- Use "What it treats" instead of "Indications"
- Use "Who should avoid this" instead of "Contraindications"
- Return valid JSON only as per schema.`

      const result = await callGemini(prompt, base64Image, imageMimeType)
      setAnalysisResult(result)
    } catch (err) {
      console.error(err)
      let msg = 'Unable to analyze the image. Please try again.'
      if (String(err.message || '').includes('API key')) msg = 'API key is missing or invalid.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const analyzeManual = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    setLoading(true)
    setError(null)
    try {
      const prompt = `You are a senior medical pharmacist. Provide detailed but simple educational information for the medicine: "${manualInput.trim()}".
Use easy language.
Rules:
- Use "What it treats" instead of "Indications"
- Use "Who should avoid this" instead of "Contraindications"
- Return valid JSON only as per schema.`

      const result = await callGemini(prompt)
      setAnalysisResult(result)
    } catch (err) {
      console.error(err)
      let msg = 'Could not retrieve information. Please check spelling.'
      if (String(err.message || '').includes('API key')) msg = 'API key is missing or invalid.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setBase64Image(null)
    setImageMimeType('image/jpeg')
    setAnalysisResult(null)
    setError(null)
    setManualInput('')
  }

  return (
    <div
      className="min-h-screen bg-[#020617] text-slate-50 pb-20 selection:bg-blue-500/30 animate-fade-in"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`}
      </style>

      <header className="bg-[#4338CA] border-b border-indigo-500/30 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg shadow-indigo-950/20 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <Stethoscope size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">MedAnalyzer</h1>
            <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Safe Knowledge AI</span>
          </div>
        </div>
        {analysisResult && (
          <button
            onClick={reset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-2 border border-white/20 backdrop-blur-sm"
          >
            <RefreshCcw size={14} /> NEW ANALYSIS
          </button>
        )}
      </header>

      <main className={`mx-auto px-4 py-8 transition-all duration-500 ${analysisResult ? 'max-w-5xl' : 'max-w-2xl'}`}>
        {/* Input */}
        {!analysisResult && !loading && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white">Medicine Recognition</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Upload a clear photo of the strip or type the name to start.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative overflow-hidden bg-[#0f172a] border border-[#1e293b] p-10 rounded-[2.5rem] text-center transition-all hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="bg-[#1e293b] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                  <Camera size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Scan Package</h3>
                <p className="text-slate-500 text-sm">Best for blister packs & bottles</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-blue-400 font-bold text-xs">
                  <Scan size={14} /> TAP TO CAPTURE
                </div>
              </button>

              <div className="bg-[#0f172a] border border-[#1e293b] p-10 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Keyboard size={20} />
                  </div>
                  <h3 className="font-bold text-white">Manual Search</h3>
                </div>
                <form onSubmit={analyzeManual} className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Augmentin 625 or Paracetamol..."
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="w-full bg-[#1e293b] text-slate-50 text-lg px-6 py-5 rounded-2xl border border-[#334155] focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim()}
                    className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest"
                  >
                    IDENTIFY
                  </button>
                </form>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            {image && !analysisResult && (
              <div className="relative rounded-[3rem] overflow-hidden border border-[#1e293b] shadow-2xl">
                <img src={image} alt="Preview" className="w-full max-h-96 object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent flex flex-col justify-end p-10">
                  <button
                    onClick={analyzeImage}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.4)] flex items-center justify-center gap-3 transition-transform active:scale-95 text-lg"
                  >
                    <Eye size={24} /> ANALYZE THIS IMAGE
                  </button>
                  <button
                    onClick={() => setImage(null)}
                    className="mt-5 text-slate-500 text-sm font-bold hover:text-white transition-colors"
                  >
                    DISCARD IMAGE
                  </button>
                </div>
              </div>
            )}

            <div className="bg-amber-950/20 border border-amber-900/50 p-6 rounded-3xl flex gap-4">
              <AlertTriangle className="text-amber-300 shrink-0" size={24} />
              <div className="space-y-1">
                <h4 className="text-amber-300 font-bold text-sm uppercase tracking-wider">Educational Information Only</h4>
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  This analysis is powered by AI and should not be used for medical decisions. Never take medicine
                  without a professional prescription.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-10">
              <div className="w-28 h-28 border-4 border-blue-900/20 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-blue-400 animate-pulse">
                <FlaskConical size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Processing Components</h2>
            <p className="text-slate-500 text-sm mt-3 font-medium tracking-wide">Cross-referencing drug databases...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && !analysisResult && (
          <div className="bg-red-950/20 border border-red-900/50 p-12 rounded-[3rem] text-center">
            <div className="bg-red-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShieldAlert size={48} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Unable to Identify</h3>
            <p className="text-red-200/60 text-sm mb-10 leading-relaxed max-w-sm mx-auto">{error}</p>
            <button
              onClick={reset}
              className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-900/30 transition-all uppercase tracking-widest"
            >
              TRY NEW SCAN
            </button>
          </div>
        )}

        {/* Results */}
        {analysisResult && !loading && (
          <div className="space-y-8">
            <div className="bg-[#0f172a] rounded-[3rem] p-10 shadow-2xl border border-[#1e293b] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-blue-500/5 rotate-12">
                <Stethoscope size={240} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-900/50">
                      {analysisResult.category || 'General'}
                    </span>
                    <span className="px-4 py-1.5 bg-slate-800 text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl">
                      {analysisResult.dosageForm || 'Medicine'}
                    </span>
                  </div>
                  <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
                    {analysisResult.brandName || 'Unknown Brand'}
                  </h2>
                  <p className="text-blue-400 text-xl font-bold flex items-center gap-4 mt-4">
                    <span className="w-12 h-1.5 bg-blue-600 rounded-full" />
                    {analysisResult.genericName || 'Unknown Generic'}
                  </p>
                </div>

                <div className="w-full md:w-72">
                  <div className="flex p-2 bg-[#1e293b] rounded-[1.5rem] gap-2">
                    <button
                      onClick={() => setViewMode('simple')}
                      className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${
                        viewMode === 'simple'
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      BASIC
                    </button>
                    <button
                      onClick={() => setViewMode('full')}
                      className={`flex-1 py-3 rounded-xl text-xs font-black tracking-widest transition-all ${
                        viewMode === 'full'
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      DETAILED
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {viewMode === 'simple' ? (
              <div className="bg-[#0f172a] p-10 rounded-[3rem] shadow-xl border border-[#1e293b] space-y-10">
                <div className="flex items-start gap-8">
                  <div className="bg-blue-600/10 p-5 rounded-3xl text-blue-400 shrink-0 shadow-inner">
                    <BookOpen size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Main Purpose</h3>
                    <p className="text-slate-400 text-lg leading-relaxed font-light">
                      {analysisResult.simpleExplanation || 'No explanation available'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#1e293b] pt-10">
                  <div className="space-y-5">
                    <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ChevronRight size={16} /> Key Usage
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(analysisResult.uses) ? analysisResult.uses : []).slice(0, 4).map((use, i) => (
                        <span
                          key={i}
                          className="px-5 py-3 bg-[#1e293b] text-slate-200 text-sm rounded-2xl border border-[#334155] font-medium"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-950/10 p-6 rounded-[2rem] border border-amber-900/30 self-start">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShieldAlert size={16} /> Who should avoid this?
                    </h4>
                    <p className="text-sm text-amber-200/60 leading-relaxed italic">
                      {Array.isArray(analysisResult.precautions) && analysisResult.precautions[0]
                        ? analysisResult.precautions[0]
                        : 'Consult your doctor before use.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <InfoSection icon={Info} title="What is this used for?" content={analysisResult.simpleExplanation} color="blue" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoSection icon={Stethoscope} title="What it treats" content={analysisResult.uses} list color="green" />
                    <InfoSection icon={FlaskConical} title="How it works" content={analysisResult.mechanism} color="purple" />
                  </div>
                  <InfoSection icon={AlertTriangle} title="Who should avoid this?" content={analysisResult.precautions} list color="amber" />
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <div className="p-6 rounded-[2.5rem] border border-red-900/50 bg-red-950/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-900/30 rounded-lg text-red-400">
                        <ShieldAlert size={20} />
                      </div>
                      <h3 className="font-bold text-white tracking-tight">Safety Watch</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-red-400/50 uppercase tracking-[0.2em] mb-3">
                          Common reactions
                        </p>
                        <ul className="space-y-2">
                          {(Array.isArray(analysisResult.commonSideEffects) ? analysisResult.commonSideEffects : []).map(
                            (item, i) => (
                              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="mt-1.5 w-1 h-1 bg-red-500 rounded-full shrink-0" />
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div className="p-4 bg-red-900/30 rounded-2xl border border-red-800/40">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">
                          Urgent warnings
                        </p>
                        <ul className="space-y-2">
                          {(Array.isArray(analysisResult.seriousSideEffects)
                            ? analysisResult.seriousSideEffects
                            : []
                          ).map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-red-100 font-bold leading-tight flex items-start gap-2"
                            >
                              <span>⚠</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <InfoSection
                    icon={Clock}
                    title="How to use"
                    content={`${analysisResult.dosagePattern || "Follow doctor's instructions"}\n\nStrictly follow doctor advice.`}
                    color="indigo"
                  />

                  <InfoSection
                    icon={Thermometer}
                    title="Storage"
                    content={analysisResult.storage || 'Store in cool, dry place away from children.'}
                    color="slate"
                  />
                </div>
              </div>
            )}

            <div className="bg-[#0f172a] text-slate-400 p-10 rounded-[3rem] mt-12 border border-[#1e293b] flex flex-col md:flex-row gap-8 items-start">
              <div className="bg-blue-600/10 p-4 rounded-2xl text-blue-500 shrink-0">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-black tracking-tight text-white uppercase">Health Safety Protocol</h4>
                <p className="text-sm leading-relaxed font-light opacity-70 italic">
                  MedAnalyzer provides data extracted via AI for informational awareness only. This is not medical advice.
                  Medications can have different effects depending on individual history, allergies, and other concurrent
                  drugs. Always verify this information with your primary healthcare provider. In an emergency, dial your
                  local emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {analysisResult && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none px-4">
            <button
              onClick={reset}
              className="pointer-events-auto bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-full font-black text-xs tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center gap-4 transition-all hover:-translate-y-1 active:scale-95 border-2 border-blue-400/30"
            >
              <RefreshCcw size={18} className="transition-transform duration-500" />
              ANALYZE ANOTHER
            </button>
          </div>
        )}
      </main>
    </div>
  )
}


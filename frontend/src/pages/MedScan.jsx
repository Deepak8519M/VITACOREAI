import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Search,
  Download,
  FileCheck,
  Image as ImageIcon,
  BookOpen,
  Stethoscope
} from 'lucide-react'
import api from '../utils/api'

export default function MedScan() {
  const [imageUrl, setImageUrl] = useState(null)
  const [base64Image, setBase64Image] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  const fileInputRef = useRef(null)
  const glossaryRef = useRef(null)
  const reportRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    script.async = true
    script.onload = () => setCanvasLoaded(true)
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG/JPG/WEBP).')
      return
    }
    setError(null)
    setAnalysis(null)
    setImageUrl(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1]
      setBase64Image(base64Data)
    }
    reader.readAsDataURL(file)
  }

  const analyzeReport = async () => {
    if (!base64Image) return
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const { data } = await api.post('/report-image', {
        data: base64Image,
        type: 'image/png'
      })
      setAnalysis(data)
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Analysis failed'
      setError(`Analysis failed. ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadReportText = () => {
    if (!analysis) return
    let content = 'MEDICAL ANALYSIS REPORT\n'
    content += '========================\n\n'
    content += `Type: ${analysis.overview?.reportType}\n`
    content += `Patient: ${analysis.overview?.patientName}\n`
    content += `Date: ${analysis.overview?.date}\n\n`
    content += 'BIOMARKERS:\n'
    content += '------------------------\n'
    ;(analysis.biomarkers || []).forEach(b => {
      content += `${(b.name || '').padEnd(25)}: ${(b.value || '').padEnd(15)} [Range: ${(b.range || '').padEnd(15)}] Status: ${b.status}\n`
      content += `Note: ${b.note}\n\n`
    })
    content += 'INTERPRETATION:\n'
    content += `${analysis.interpretation}\n\n`
    content += 'ACTION STEPS:\n'
    ;(analysis.actionableSteps || []).forEach((s, i) => (content += `${i + 1}. ${s}\n`))
    content += '\nDISCLAIMER:\n'
    content += `${analysis.disclaimer}\n`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Medical_Report_${(analysis.overview?.date || '').replace(/\//g, '-') || 'medscan'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const saveReportAsImage = async () => {
    if (!analysis || !window.html2canvas) return
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      const element = reportRef.current
      if (!element) throw new Error('Report element not found')
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#020617',
        logging: false,
        onclone: (doc) => {
          const glossary = doc.getElementById('glossary-section')
          if (glossary) {
            glossary.style.display = 'block'
            glossary.style.visibility = 'visible'
            glossary.style.opacity = '1'
          }
        }
      })
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = `MedScan_Report_${(analysis.overview?.date || '').replace(/\//g, '-') || 'medscan'}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Capture Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'high':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      case 'low':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  }

  const scrollToGlossary = () => {
    glossaryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-base">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span>MedScan AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Private
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-800">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-200">
              <Upload className="w-4 h-4 text-blue-400" />
              Upload report image
            </h2>
            <div
              onClick={() => fileInputRef.current.click()}
              className={`group border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                imageUrl ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800'
              }`}
            >
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
              />
              {imageUrl ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-semibold bg-blue-600 px-3 py-1.5 rounded-full">Change file</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="w-11 h-11 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-700">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Drop your report here</p>
                  <p className="text-[11px] text-slate-500 mt-1">High-res PNG/JPG/WEBP</p>
                </div>
              )}
            </div>
            {imageUrl && (
              <button
                onClick={analyzeReport}
                disabled={loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze report
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl text-xs text-amber-100 leading-relaxed space-y-1">
            <div className="flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <p className="font-semibold text-amber-300">Disclaimer</p>
            </div>
            <p>
              This AI tool extracts and structures data from your report for educational purposes only.
              It does not replace professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="lg:col-span-8 space-y-4">
          {!analysis && !loading && !error && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <Stethoscope className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-slate-200 font-semibold text-lg">Awaiting report</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs">
                Upload a clear lab or diagnostic report image to generate a structured summary.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <h3 className="text-slate-200 font-semibold text-base">Processing report...</h3>
              <p className="text-slate-500 text-xs mt-1">Extracting values and matching them to reference ranges.</p>
            </div>
          )}

          {error && (
            <div className="bg-slate-900 rounded-2xl border border-rose-500/30 p-8 text-center">
              <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-slate-200 text-sm font-semibold">{error}</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-600/10 rounded-xl border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Analysis complete</p>
                    <p className="text-[11px] text-slate-500">
                      {analysis.overview?.patientName} • {analysis.overview?.date}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={scrollToGlossary}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    Glossary
                  </button>
                  <button
                    onClick={downloadReportText}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    TXT
                  </button>
                  <button
                    onClick={saveReportAsImage}
                    disabled={!canvasLoaded}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm text-[11px]"
                  >
                    {canvasLoaded ? <ImageIcon className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save image
                  </button>
                </div>
              </div>

              <div ref={reportRef} id="full-report-content" className="space-y-4 bg-slate-950 rounded-2xl p-3 sm:p-4">
                <div className="bg-blue-600 p-4 rounded-2xl text-white shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold uppercase tracking-tight">
                        {analysis.overview?.reportType || 'Analysis Report'}
                      </h2>
                      <p className="text-xs text-blue-100 flex items-center gap-1 mt-1">
                        <FileText className="w-3.5 h-3.5" />
                        {analysis.overview?.patientName || 'Not specified'} • {analysis.overview?.date}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Biomarkers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="pb-2 font-semibold text-slate-400">Parameter</th>
                            <th className="pb-2 font-semibold text-slate-400">Value</th>
                            <th className="pb-2 font-semibold text-slate-400">Range</th>
                            <th className="pb-2 font-semibold text-slate-400 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analysis.biomarkers || []).map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 pr-3">
                                <div className="font-semibold text-slate-100 text-xs">{item.name}</div>
                              </td>
                              <td className="py-3 text-[11px] font-mono font-semibold text-slate-100">{item.value}</td>
                              <td className="py-3 text-[11px] text-slate-400">{item.range}</td>
                              <td className="py-3 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(item.status)}`}>
                                  {(item.status || '').toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <Activity className="w-3.5 h-3.5 text-blue-400" /> Interpretation
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{analysis.interpretation}"
                    </p>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Suggested next steps
                    </h3>
                    <ul className="space-y-1.5">
                      {(analysis.actionableSteps || []).map((s, idx) => (
                        <li key={idx} className="flex gap-2 text-[11px] text-slate-400">
                          <ArrowRight className="w-3 h-3 text-blue-400 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  ref={glossaryRef}
                  id="glossary-section"
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Glossary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(analysis.biomarkers || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-colors"
                      >
                        <p className="text-xs font-semibold text-blue-300 mb-1">{item.name}</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {item.note || 'See clinician for further interpretation.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center py-3 border-t border-slate-800/60">
                  <p className="text-[10px] text-slate-600">
                    {analysis.disclaimer} • MedScan AI • {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


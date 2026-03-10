import { Link } from 'react-router-dom'
import { Activity, Shield, Brain, BarChart3, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
              <Activity className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
            <span className="text-lg font-semibold gradient-text tracking-tight">VitaCore AI</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/login" className="px-4 py-2 text-slate-400 hover:text-slate-100 text-sm font-medium transition-all rounded-xl hover:bg-slate-900">
              Sign in
            </Link>
            <Link to="/signup" className="ml-1 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-36 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 animate-fade-in leading-tight">
            AI-Powered <span className="gradient-text">Healthcare</span> Prediction
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-normal leading-relaxed">
            Multi-disease prediction, secure health management, and intelligent symptom analysis — all in one platform.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/signup" className="px-7 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20">
              Start Free
            </Link>
            <Link to="/login" className="px-7 py-3.5 rounded-2xl border border-slate-800 text-slate-400 font-medium text-sm hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Brain, title: '8 Disease Models', desc: 'Diabetes, heart, stroke, kidney, liver, cancer & more' },
            { icon: Shield, title: 'Secure & Private', desc: 'Encrypted storage, JWT auth, HIPAA-aware architecture' },
            { icon: BarChart3, title: 'Health Analytics', desc: 'Dashboard, charts, and prediction history' },
            { icon: Zap, title: 'Symptom Checker', desc: 'Pre-consultation guidance before seeing a doctor' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 animate-slide-up">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4 group-hover:bg-blue-600/15 transition-colors">
                <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-1.5">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm font-medium">VitaCore AI © {new Date().getFullYear()} — Premium Healthcare Platform</p>
      </footer>
    </div>
  )
}

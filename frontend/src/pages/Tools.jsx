import { Link } from 'react-router-dom'
import { GitCompare } from 'lucide-react'

const TOOLS = [
  {
    id: 'report-comparison',
    name: 'Report Comparison',
    icon: GitCompare,
    desc: 'Upload historical and current medical reports to track health progress with AI analysis.',
    path: '/app/tools/report-comparison'
  }
]

export default function Tools() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tools</h1>
        <p className="text-slate-400 text-sm mt-0.5">AI-powered utilities for your health journey</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TOOLS.map(({ id, name, icon: Icon, desc, path }) => (
          <Link key={id} to={path}
            className="group block p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4 group-hover:bg-blue-600/15 transition-colors">
              <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1.5">{name}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">{desc}</p>
            <span className="text-blue-500 text-sm font-medium group-hover:underline">Open tool →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

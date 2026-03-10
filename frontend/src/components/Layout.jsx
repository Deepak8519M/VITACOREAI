import { Outlet, NavLink } from 'react-router-dom'
import { Activity, Heart, FileText, User, Stethoscope, LayoutDashboard, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/predictions', icon: Heart, label: 'Predictions' },
  { to: '/app/tools', icon: Wrench, label: 'Tools' },
  { to: '/app/symptom-checker', icon: Stethoscope, label: 'Symptom Checker' },
  { to: '/app/medical-records', icon: FileText, label: 'Medical Records' },
  { to: '/app/profile', icon: User, label: 'Profile' }
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <NavLink to="/app" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
              <Activity className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
            <span className="text-lg font-semibold gradient-text tracking-tight">VitaCore AI</span>
          </NavLink>
        </div>
        <nav className="flex-1 p-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/app'} className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-600/10 text-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`
            }>
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-slate-500 text-xs truncate px-4 mb-2">{user?.email}</p>
          <button onClick={logout} className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

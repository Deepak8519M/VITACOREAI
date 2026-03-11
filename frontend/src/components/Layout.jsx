import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Activity, Heart, FileText, User, LayoutDashboard, Wrench, FolderOpen, ChevronLeft, ChevronRight, Activity as ActivityIcon, Pill, DollarSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/predictions', icon: Heart, label: 'Predictions' },
  { to: '/app/vital-signs', icon: ActivityIcon, label: 'Vital Signs' },
  { to: '/app/medication-management', icon: Pill, label: 'Medications' },
  { to: '/app/medicine-price-ai', icon: DollarSign, label: 'Medicine Price AI' },
  { to: '/app/tools', icon: Wrench, label: 'Tools' },
  { to: '/app/health-vault', icon: FolderOpen, label: 'Health Vault' },
  { to: '/app/profile', icon: User, label: 'Profile' }
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className={`bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <NavLink to="/app" className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-slate-800">
              <Activity className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold gradient-text tracking-tight">VitaCore AI</span>
            )}
          </NavLink>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors ml-1"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app'}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-500'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          {!collapsed && <p className="text-slate-500 text-xs truncate px-4 mb-2">{user?.email}</p>}
          <button onClick={logout} className={`w-full ${collapsed ? 'px-0 text-center' : 'px-4 text-left'} py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-sm font-medium transition-colors`}>
            Sign out
          </button>
        </div>
      </aside>
      <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <Outlet />
      </main>
    </div>
  )
}

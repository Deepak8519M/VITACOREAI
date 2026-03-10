import { useState, useEffect } from 'react'
import MedicationManagement from '../components/MedicationManagement'
import { Pill, Bell, Calculator, RefreshCw, Shield, Clock, AlertCircle } from 'lucide-react'

const MedicationPage = () => {
  const [stats, setStats] = useState({
    totalMedications: 0,
    activeReminders: 0,
    criticalRefills: 0,
    upcomingDoses: 0
  })

  useEffect(() => {
    // Fetch medication statistics
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/medication-management/refill-reminders')
        if (response.ok) {
          const data = await response.json()
          setStats(prev => ({
            ...prev,
            totalMedications: data.total || 0,
            criticalRefills: data.criticalRefills || 0,
            activeReminders: data.reminders?.filter(r => r.active).length || 0
          }))
        }
      } catch (error) {
        console.error('Failed to fetch medication stats:', error)
        // Set default values if API fails
        setStats({
          totalMedications: 0,
          activeReminders: 0,
          criticalRefills: 0,
          upcomingDoses: 0
        })
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Medication Management</h1>
              <p className="text-slate-400">Manage medications, check interactions, and track refills</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Pill className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-slate-400">Total Medications</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalMedications}</div>
            <div className="text-sm text-slate-400 mt-1">Tracked</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-slate-400">Active Reminders</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeReminders}</div>
            <div className="text-sm text-slate-400 mt-1">Set up</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-sm text-slate-400">Critical Refills</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.criticalRefills}</div>
            <div className="text-sm text-slate-400 mt-1">Need attention</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm text-slate-400">Next Dose</span>
            </div>
            <div className="text-2xl font-bold text-white">2:30 PM</div>
            <div className="text-sm text-slate-400 mt-1">Metformin</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Quick Reminder</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Set up a new medication reminder in seconds</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Add Reminder
            </button>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Check Interactions</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Verify medication safety and interactions</p>
            <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors">
              Check Now
            </button>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Calculate Dosage</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">Calculate accurate medication dosages</p>
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
              Calculate
            </button>
          </div>
        </div>

        {/* Main Content */}
        <MedicationManagement />
      </div>
    </div>
  )
}

export default MedicationPage

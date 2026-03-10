import { useState, useEffect } from 'react'
import VitalSignsTracker from '../components/VitalSignsTracker'
import { Activity, Heart, Droplets, Thermometer, Target, BarChart3, TrendingUp } from 'lucide-react'

const VitalSignsPage = () => {
  const [stats, setStats] = useState({
    totalReadings: 0,
    todayReadings: 0,
    averageBMI: 0,
    latestBP: { systolic: 0, diastolic: 0 }
  })

  // Fetch vital signs statistics
  const fetchStats = async () => {
    try {
      // Fetch multiple statistics
      const [bmiResponse, bpResponse, totalResponse] = await Promise.all([
        fetch('/api/vital-signs/stats/bmi?period=30'),
        fetch('/api/vital-signs/stats/blood-pressure?period=30'),
        fetch('/api/vital-signs/history/bmi?limit=100')
      ])

      let newStats = {
        totalReadings: 0,
        todayReadings: 0,
        averageBMI: 0,
        latestBP: { systolic: 0, diastolic: 0 }
      }

      // Process BMI stats
      if (bmiResponse.ok) {
        const bmiData = await bmiResponse.json()
        if (bmiData.success && bmiData.stats) {
          newStats.averageBMI = bmiData.stats.averageValue || 0
          newStats.totalReadings += bmiData.stats.totalEntries || 0
        }
      }

      // Process Blood Pressure stats
      if (bpResponse.ok) {
        const bpData = await bpResponse.json()
        if (bpData.success && bpData.stats) {
          newStats.latestBP = {
            systolic: bpData.stats.latestSystolic || 0,
            diastolic: bpData.stats.latestDiastolic || 0
          }
          newStats.totalReadings += bpData.stats.totalEntries || 0
        }
      }

      // Process total readings from history
      if (totalResponse.ok) {
        const totalData = await totalResponse.json()
        if (totalData.success && totalData.entries) {
          newStats.totalReadings = totalData.entries.length
          
          // Calculate today's readings
          const today = new Date().toDateString()
          const todayReadings = totalData.entries.filter(entry => 
            new Date(entry.date).toDateString() === today
          ).length
          newStats.todayReadings = todayReadings
        }
      }

      setStats(newStats)
    } catch (error) {
      console.error('Failed to fetch vital signs stats:', error)
      // Set default values if API fails
      setStats({
        totalReadings: 0,
        todayReadings: 0,
        averageBMI: 0,
        latestBP: { systolic: 0, diastolic: 0 }
      })
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Vital Signs Tracker</h1>
              <p className="text-slate-400">Monitor and track your essential health metrics</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-slate-400">Total Readings</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalReadings}</div>
            <div className="text-sm text-slate-400 mt-1">All time</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-sm text-slate-400">Average BMI</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageBMI}</div>
            <div className="text-sm text-slate-400 mt-1">kg/m²</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-sm text-slate-400">Latest BP</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.latestBP.systolic}/{stats.latestBP.diastolic}
            </div>
            <div className="text-sm text-slate-400 mt-1">mmHg</div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm text-slate-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.todayReadings}</div>
            <div className="text-sm text-slate-400 mt-1">Readings</div>
          </div>
        </div>

        {/* Main Content */}
        <VitalSignsTracker onRefresh={fetchStats} />
      </div>
    </div>
  )
}

export default VitalSignsPage

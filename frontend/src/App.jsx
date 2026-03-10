import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import PredictionForm from './pages/PredictionForm'
import MedicalRecords from './pages/MedicalRecords'
import Profile from './pages/Profile'
import SymptomChecker from './pages/SymptomChecker'
import Tools from './pages/Tools'
import ReportComparison from './pages/ReportComparison'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-pulse text-blue-500 font-medium">Loading...</div></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="predictions/:disease" element={<PredictionForm />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/report-comparison" element={<ReportComparison />} />
        <Route path="medical-records" element={<MedicalRecords />} />
        <Route path="profile" element={<Profile />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

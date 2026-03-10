import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import PredictionForm from './pages/PredictionForm'
import PredictionHistoryPage from './pages/PredictionHistoryPage'
import MedicalRecords from './pages/MedicalRecords'
import HealthVault from './pages/HealthVault'
import Profile from './pages/Profile'
import SymptomChecker from './pages/SymptomChecker'
import Tools from './pages/Tools'
import ReportComparison from './pages/ReportComparison'
import Chatbot from './pages/Chatbot'
import HospitalLocator from './pages/HospitalLocator'
import PharmacyLocator from './pages/PharmacyLocator'
import VitalId from './pages/VitalId'
import MedScan from './pages/MedScan'
import VitalPublic from './pages/VitalPublic'
import MedicineComparator from './pages/MedicineComparator'
import MedicalJargon from './pages/MedicalJargon'
import MedAnalyzer from './pages/MedAnalyzer'
import VitalSense from './pages/VitalSense'
import SmartMedicineAlt from './pages/SmartMedicineAlt'
import NppaOvercharge from './pages/NppaOvercharge'
import NppaCheapestDose from './pages/NppaCheapestDose'
import NppaBasket from './pages/NppaBasket'
import VitalSignsPage from './pages/VitalSignsPage'
import MedicationPage from './pages/MedicationPage'

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
      <Route path="/vital/:token" element={<VitalPublic />} />
      <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="predictions/:disease" element={<PredictionForm />} />
        <Route path="predictions/history" element={<PredictionHistoryPage />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/report-comparison" element={<ReportComparison />} />
        <Route path="tools/chatbot" element={<Chatbot />} />
        <Route path="tools/hospital-locator" element={<HospitalLocator />} />
        <Route path="tools/pharmacy-locator" element={<PharmacyLocator />} />
        <Route path="tools/vital-id" element={<VitalId />} />
        <Route path="tools/medscan" element={<MedScan />} />
        <Route path="tools/medicine-comparator" element={<MedicineComparator />} />
        <Route path="tools/medical-jargon" element={<MedicalJargon />} />
        <Route path="tools/med-analyzer" element={<MedAnalyzer />} />
        <Route path="tools/smart-alternatives" element={<SmartMedicineAlt />} />
        <Route path="tools/nppa-overcharge" element={<NppaOvercharge />} />
        <Route path="tools/nppa-cheapest-dose" element={<NppaCheapestDose />} />
        <Route path="tools/nppa-basket" element={<NppaBasket />} />
        <Route path="tools/vitalsense" element={<VitalSense />} />
        <Route path="vital-signs" element={<VitalSignsPage />} />
        <Route path="medication-management" element={<MedicationPage />} />
        <Route path="health-vault" element={<HealthVault />} />
        <Route path="medical-records" element={<Navigate to="/app/health-vault" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

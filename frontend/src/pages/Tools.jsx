import { Link } from 'react-router-dom'
import { GitCompare, MessagesSquare, MapPin, Pill, ShieldAlert, ScanText, Activity, FileText, Scan, HeartPulse, Stethoscope, Scale, ClipboardList } from 'lucide-react'

const TOOLS = [
  {
    id: 'report-comparison',
    name: 'Report Comparison',
    icon: GitCompare,
    desc: 'Upload historical and current medical reports to track health progress with AI analysis.',
    path: '/app/tools/report-comparison'
  },
  {
    id: 'health-chatbot',
    name: 'Health Chatbot',
    icon: MessagesSquare,
    desc: 'Chat with VitaCore AI for health guidance, symptom questions, and next-step suggestions.',
    path: '/app/tools/chatbot'
  },
  {
    id: 'hospital-locator',
    name: 'Nearby Hospital Locator',
    icon: MapPin,
    desc: 'Search any city/area/pincode and find nearby hospitals and clinics (OpenStreetMap).',
    path: '/app/tools/hospital-locator'
  },
  {
    id: 'pharmacy-locator',
    name: 'Nearby Pharmacy Locator',
    icon: Pill,
    desc: 'Find pharmacies near a location (or near you) and view simulated medicine price comparisons.',
    path: '/app/tools/pharmacy-locator'
  },
  {
    id: 'medicine-comparator',
    name: 'Medicine Price Comparator',
    icon: Activity,
    desc: 'Search a medicine and compare prices across brands for the same generic using NPPA data.',
    path: '/app/tools/medicine-comparator'
  },
  {
    id: 'smart-medicine-alt',
    name: 'Smart Medicine Alternatives',
    icon: GitCompare,
    desc: 'Use RxClass to discover clinically similar medicine classes and potential alternatives when a drug is expensive or unavailable.',
    path: '/app/tools/smart-alternatives'
  },
  {
    id: 'nppa-overcharge',
    name: 'NPPA Overcharge Detector',
    icon: Scale,
    desc: 'Enter billed price vs quantity and see if it exceeds official NPPA ceiling prices for that medicine.',
    path: '/app/tools/nppa-overcharge'
  },
  {
    id: 'nppa-cheapest-dose',
    name: 'Cheapest NPPA Dose Finder',
    icon: Pill,
    desc: 'For a given molecule, find which strengths/forms have the lowest NPPA ceiling price per unit.',
    path: '/app/tools/nppa-cheapest-dose'
  },
  {
    id: 'nppa-basket',
    name: 'Medicine Basket Estimator',
    icon: ClipboardList,
    desc: 'Build a monthly chronic‑care basket and estimate total monthly/yearly cost from NPPA ceilings.',
    path: '/app/tools/nppa-basket'
  },
  {
    id: 'medical-jargon',
    name: 'Medical Jargon Cleaner',
    icon: FileText,
    desc: 'Paste complex medical text and get a clear, patient-friendly explanation with a glossary.',
    path: '/app/tools/medical-jargon'
  },
  {
    id: 'vital-id',
    name: 'VITAL ID',
    icon: ShieldAlert,
    desc: 'Emergency medical profile: blood group, allergies, medications, EMS instructions, and contacts.',
    path: '/app/tools/vital-id'
  },
  {
    id: 'medscan',
    name: 'MedScan AI',
    icon: ScanText,
    desc: 'Upload a medical report image to extract biomarkers, ranges, and a structured summary.',
    path: '/app/tools/medscan'
  },
  {
    id: 'med-analyzer',
    name: 'MedAnalyzer',
    icon: Scan,
    desc: 'Scan a medicine strip or search by name to understand its purpose, safety, and usage in simple language.',
    path: '/app/tools/med-analyzer'
  },
  {
    id: 'vitalsense',
    name: 'VitalSense Assessment',
    icon: HeartPulse,
    desc: 'Step-through AI symptom assessment that summarizes risks, lifestyle advice, and suggested screenings.',
    path: '/app/tools/vitalsense'
  },
  {
    id: 'symptom-checker',
    name: 'Symptom Checker',
    icon: Stethoscope,
    desc: 'Quickly enter symptoms to get structured pre-consultation guidance (not a diagnosis).',
    path: '/app/symptom-checker'
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

import { Link } from 'react-router-dom'
import { 
  Activity, Shield, Brain, BarChart3, Zap, Heart, Stethoscope, Pill, FileImage, 
  MessageCircle, Calculator, Users, Star, ArrowRight, CheckCircle2, TrendingUp,
  Award, Globe, Lightbulb, Target, Clock, Database, Cloud, Lock, Cpu,
  FlaskConical, Microscope, Dna, TestTubes, UserCheck, FileText,
  PieChart, LineChart, Calendar, Bell, Download, Settings, Search, Filter
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              VitaCore AI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="#features" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors">
              Features
            </Link>
            <Link to="#tools" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors">
              Tools
            </Link>
            <Link to="#technology" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors">
              Technology
            </Link>
            <Link to="#security" className="text-slate-400 hover:text-slate-100 text-sm font-medium transition-colors">
              Security
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-slate-400 hover:text-slate-100 text-sm font-medium transition-all rounded-xl hover:bg-slate-900">
              Sign in
            </Link>
            <Link to="/signup" className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 mb-8">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Trusted by 10,000+ Healthcare Professionals</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
            AI-Powered <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Healthcare</span> Platform
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto font-normal leading-relaxed">
            Comprehensive disease prediction, intelligent symptom analysis, medicine price comparison, 
            and secure health management — all powered by cutting-edge AI technology.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link to="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-2xl border border-slate-700 text-slate-300 font-medium text-base hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 transition-all">
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">8+</div>
              <div className="text-slate-400 text-sm">AI Disease Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">19</div>
              <div className="text-slate-400 text-sm">Healthcare Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-slate-400 text-sm">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Comprehensive Healthcare Features</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need for intelligent health management in one powerful platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Brain, title: 'AI Disease Prediction', desc: '8 advanced ML models for diabetes, heart disease, stroke, cancer, and more', color: 'blue' },
              { icon: Stethoscope, title: 'Symptom Checker', desc: 'AI-powered symptom analysis with disease probability assessment', color: 'purple' },
              { icon: Calculator, title: 'NPPA Tools', desc: 'Medicine price analysis, overcharge detection, and cheapest dose finder', color: 'green' },
              { icon: FileImage, title: 'Report Analysis', desc: 'Medical report comparison and trend analysis with AI insights', color: 'red' },
              { icon: Shield, title: 'Health Vault', desc: 'Secure personal health records with encrypted storage', color: 'indigo' },
              { icon: Activity, title: 'Vital ID', desc: 'Digital health identification for emergency medical access', color: 'teal' },
              { icon: Pill, title: 'Medicine Compare', desc: 'Compare medicines, find alternatives, and analyze side effects', color: 'orange' },
              { icon: MessageCircle, title: 'Jargon Cleaner', desc: 'Simplify complex medical terms into easy-to-understand language', color: 'pink' }
            ].map(({ icon: Icon, title, desc, color }, index) => (
              <div key={title} className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]">
                <div className={`w-12 h-12 rounded-xl bg-${color}-600/10 border border-${color}-500/30 flex items-center justify-center mb-4 group-hover:bg-${color}-600/20 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${color}-400`} strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Analytics Dashboard Preview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/30 mb-6">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm font-medium">Advanced Analytics</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Intelligent Health Dashboard</h2>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                Get comprehensive insights into your health with real-time analytics, 
                risk assessments, and personalized recommendations powered by AI.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Heart, text: 'Real-time health score calculation' },
                  { icon: TrendingUp, text: 'Weekly health trends and patterns' },
                  { icon: Target, text: 'Personalized risk assessment' },
                  { icon: Lightbulb, text: 'AI-generated health recommendations' }
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">85</span>
                  </div>
                  <p className="text-white font-semibold mb-2">Your Health Score</p>
                  <p className="text-slate-400 text-sm">Excellent health condition!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="technology" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cutting-Edge Technology Stack</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built with the latest technologies to ensure reliability, security, and performance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Frontend</h3>
              <p className="text-slate-400">React + Vite + Tailwind CSS</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Backend</h3>
              <p className="text-slate-400">Node.js + Express + MongoDB</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">ML Engine</h3>
              <p className="text-slate-400">Python + FastAPI + TensorFlow</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Cloud className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Infrastructure</h3>
              <p className="text-slate-400">Cloud + Docker + CI/CD</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade Security</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Your health data is protected with industry-leading security measures and compliance standards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Data Encryption</h3>
              <p className="text-slate-400">End-to-end encryption for all health data and communications</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">HIPAA Compliant</h3>
              <p className="text-slate-400">Built following healthcare data protection regulations</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Access Control</h3>
              <p className="text-slate-400">Role-based permissions and secure authentication</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics & Impact */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Making a Real Impact</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Join thousands of healthcare professionals and patients using VitaCore AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-slate-400">Predictions Made</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-slate-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              See what doctors and medical experts say about VitaCore AI
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"VitaCore AI has revolutionized how we approach early disease detection. The accuracy is remarkable."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Dr. Sarah Johnson</p>
                  <p className="text-slate-400 text-sm">Cardiologist</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"The symptom checker is incredibly accurate. It helps me prioritize patient care effectively."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Dr. Michael Chen</p>
                  <p className="text-slate-400 text-sm">Emergency Physician</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-slate-300 mb-4">"The NPPA tools have helped my patients save significantly on medication costs."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">Dr. Emily Davis</p>
                  <p className="text-slate-400 text-sm">General Practitioner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Healthcare?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of healthcare professionals and patients using VitaCore AI for intelligent health management
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-base hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-2xl border border-slate-600 text-slate-300 font-medium text-base hover:bg-slate-900 hover:border-slate-500 hover:text-slate-100 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VitaCore AI
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered healthcare platform for intelligent disease prediction and health management.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link to="/app/predictions" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Disease Prediction
                </Link>
                <Link to="/app/symptom-checker" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Symptom Checker
                </Link>
                <Link to="/app/tools" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  NPPA Tools
                </Link>
                <Link to="/app/health-vault" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Health Vault
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  About Us
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Technology
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Security
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  HIPAA Compliance
                </Link>
                <Link to="#" className="block text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  GDPR Compliance
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 text-sm font-medium">
                VitaCore AI © {new Date().getFullYear()} — Premium Healthcare Platform
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <Link to="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  Twitter
                </Link>
                <Link to="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  LinkedIn
                </Link>
                <Link to="#" className="text-slate-400 hover:text-slate-300 text-sm transition-colors">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

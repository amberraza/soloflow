import { Link } from 'react-router-dom';
import { Scale, FileText, Calculator, Shield, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Calculator,
    title: 'SC Child Support Wizard',
    desc: 'Step-by-step financial declaration built for South Carolina family court. Enter once, generate SCCA 430 instantly.',
  },
  {
    icon: FileText,
    title: 'PDF Generator',
    desc: 'One-click SCCA 430 PDF generation with real case data. No more manual forms — just download and e-file.',
  },
  {
    icon: Shield,
    title: 'Trust Accounting',
    desc: 'Automatic IOLTA trust balance tracking per matter. Clear audit trails and real-time balances.',
  },
  {
    icon: Scale,
    title: 'Matter Management',
    desc: 'Track cases, clients, and deadlines from a single dashboard. Built for solo practitioners, not BigLaw.',
  },
];

const howItWorks = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up in 30 seconds. No credit card required for the free financial wizard.' },
  { step: '02', title: 'Run the Wizard', desc: 'Enter income, deductions, expenses, and custody details. Our SC-specific math handles the rest.' },
  { step: '03', title: 'Generate & File', desc: 'Download a court-ready SCCA 430 PDF. Embed the intake widget on your site to capture leads.' },
  { step: '04', title: 'Manage & Grow', desc: 'Track matters, trust balances, and client intake from one dashboard. Your practice, simplified.' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="text-blue-600" size={24} />
              <span className="text-xl font-bold text-slate-900">SoloFlow</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">Log In</Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600 hover:text-slate-900 py-2">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-slate-600 hover:text-slate-900 py-2">How It Works</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-700 py-2">Log In</Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <CheckCircle size={14} />
              Built for South Carolina Solo Attorneys
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Your practice runs on billables.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Your paperwork writes itself.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              SoloFlow handles the SC-specific child support math, SCCA 430 PDF generation, 
              trust accounting, and client intake — so you can focus on your cases, not your forms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/tools/financial-wizard"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300"
              >
                Try the Financial Wizard
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                Create Free Account
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-6">
              No credit card required. Free financial wizard available to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TRUST BAR */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm text-slate-400">
            <span className="font-medium text-slate-500">SC-specific child support math</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-medium text-slate-500">SCCA 430 PDF generation</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-medium text-slate-500">Client intake widget</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-medium text-slate-500">Trust balance tracking</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything a solo family law attorney needs
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No bloated practice management suites. Just the tools that actually save you time.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <feat.icon className="text-blue-600" size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              From intake to e-filing in minutes
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              No training required. No onboarding call. Just clear tools that work.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-md shadow-blue-200">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 md:p-16 shadow-2xl shadow-blue-200/50">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to stop wrestling with forms?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
              Start with the free financial wizard. No account needed — just try it and see.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/tools/financial-wizard"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg"
              >
                Try the Financial Wizard Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-300/30 text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-500/30 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Scale size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-700">SoloFlow</span>
              <span className="text-slate-300">|</span>
              <span>Legal vertical SaaS for solo attorneys</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <span>© 2026 SoloFlow</span>
              <Link to="/login" className="hover:text-slate-600 transition-colors">Log In</Link>
              <Link to="/signup" className="hover:text-slate-600 transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

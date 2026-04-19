import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpenText, Building2, MessageCircle, BarChart3, CalendarClock,
  Mail, ArrowRight, Menu, X, Shield, Zap, TrendingUp, CheckCircle2,
  Stethoscope, ImageIcon, ListTodo, Heart,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import AppLogo from '../components/AppLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const isDark = useThemeStore((s) => s.isDark);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: Users,
      title: 'Complete Patient Management',
      description: 'Add, edit, and track patients with full medical history, insurance info, age, phone, and status. Filter by clinic, search instantly, and view detailed patient profiles.',
    },
    {
      icon: BookOpenText,
      title: 'Session & Treatment Logging',
      description: 'Log every session with treatment category, cost breakdown, clinical notes, and media attachments. Track upcoming appointments and session history per patient.',
    },
    {
      icon: Building2,
      title: 'Multi-Clinic & Commission',
      description: 'Assign patients to specific clinics with custom commission rates. Override default percentages per patient. Your earnings are auto-calculated per session.',
    },
    {
      icon: ImageIcon,
      title: 'X-Ray & Media Uploads',
      description: 'Attach X-rays, clinical photos, and documents directly to patient sessions via Cloudinary. Build a complete visual timeline of every case.',
    },
    {
      icon: BarChart3,
      title: 'Revenue & Career Analytics',
      description: 'Track monthly earnings, total revenue, treatment distribution, and career growth over time. Visualize your performance with interactive charts.',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Integration',
      description: 'One-click WhatsApp messaging for any patient. Send follow-ups, prescriptions, and appointment reminders directly from the patient card.',
    },
    {
      icon: ListTodo,
      title: 'Task Management',
      description: 'Built-in task board to manage your daily clinical to-dos, follow-ups, and reminders. Stay organized across all your clinics.',
    },
  ];

  const stats = [
    { value: '100%', label: 'Free Forever' },
    { value: '0', label: 'Hidden Fees' },
    { value: '∞', label: 'Patients & Clinics' },
    { value: 'PWA', label: 'Install on Any Device' },
  ];

  const pricingFeatures = [
    'Unlimited patients & sessions',
    'Unlimited clinics with custom commissions',
    'Revenue & career analytics dashboards',
    'WhatsApp integration',
    'Task management',
    'Multi-device PWA support',
    'Dark & light mode',
    'Patient filtering by clinic',
    'Session history & treatment tracking',
    'Priority support via WhatsApp',
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1A1A1A] transition-colors duration-300">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STICKY NAVBAR */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-xl border-b border-[#E0DFDC] dark:border-[#3A3A3A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <AppLogo size="sm" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#191919] dark:text-white hover:text-[#0A66C2] transition-colors font-medium text-sm">
              Features
            </a>
            <a href="#pricing" className="text-[#191919] dark:text-white hover:text-[#0A66C2] transition-colors font-medium text-sm">
              Pricing
            </a>
            <a href="#how-it-works" className="text-[#191919] dark:text-white hover:text-[#0A66C2] transition-colors font-medium text-sm">
              How It Works
            </a>
            <a href="#feedback" className="text-[#191919] dark:text-white hover:text-[#0A66C2] transition-colors font-medium text-sm">
              Contact
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              {token ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 text-sm font-bold bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 shadow-none rounded-lg transition-colors"
                >
                  Go to Dashboard
                </motion.button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-bold text-[#0A66C2] hover:bg-[#0A66C2]/5 shadow-none border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCTA}
                    className="px-5 py-2 text-sm font-bold bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 shadow-none rounded-lg transition-colors"
                  >
                    Get Started — It's Free
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#252525] border-t border-[#E0DFDC] dark:border-[#3A3A3A] p-4 space-y-3"
          >
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#191919] dark:text-white hover:text-[#0A66C2] font-medium">Features</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#191919] dark:text-white hover:text-[#0A66C2] font-medium">Pricing</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#191919] dark:text-white hover:text-[#0A66C2] font-medium">How It Works</a>
            <a href="#feedback" onClick={() => setIsMobileMenuOpen(false)} className="block text-[#191919] dark:text-white hover:text-[#0A66C2] font-medium">Contact</a>
            {!token && (
              <div className="flex gap-2 pt-3">
                <Link to="/login" className="px-4 py-2.5 text-sm font-bold text-[#0A66C2] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg hover:bg-[#0A66C2]/5 transition-colors flex-1 text-center">Log In</Link>
                <button onClick={handleCTA} className="px-4 py-2.5 text-sm font-bold bg-[#0A66C2] text-white rounded-lg hover:bg-[#0A66C2]/90 transition-colors flex-1">Get Started Free</button>
              </div>
            )}
          </motion.div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
        >
          {/* Free Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-emerald-500/20"
          >
            <Heart size={16} className="fill-current" />
            Free — No Credit Card Required
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#191919] dark:text-white mb-6 leading-tight">
            Your Entire Dental career,{' '}
            <span className="text-[#0A66C2]">In One App.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#666666] dark:text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
            DentStory is the all-in-one clinical platform for dentists. Manage patients, add sessions with X-rays, track commissions across multiple clinics, analyze your career growth, and message patients on WhatsApp — completely free.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              className="px-8 py-3.5 text-base font-bold bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 rounded-xl shadow-lg shadow-[#0A66C2]/20 transition-all w-full sm:w-auto"
            >
              {token ? 'Go to Dashboard' : 'Create Free Account'}
            </motion.button>
            <a
              href="#features"
              className="px-8 py-3.5 text-base font-bold text-[#191919] dark:text-white border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-[#0A66C2]/5 rounded-xl transition-all w-full sm:w-auto text-center"
            >
              See All Features ↓
            </a>
          </div>
        </motion.div>

        {/* STATS BAR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#0A66C2]">{stat.value}</p>
              <p className="text-xs text-[#666666] dark:text-gray-400 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* DASHBOARD MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl overflow-hidden shadow-xl shadow-black/5"
        >
          {/* Mac-Style Title Bar */}
          <div className="h-10 bg-[#F3F2EF] dark:bg-[#1A1A1A] border-b border-[#E0DFDC] dark:border-[#3A3A3A] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E74C3C]"></div>
            <div className="w-3 h-3 rounded-full bg-[#F5871E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#057642]"></div>
            <span className="ml-3 text-xs text-[#666666] dark:text-gray-500 font-medium">DentStory — Dashboard</span>
          </div>

          {/* Mockup Content */}
          <div className="flex h-80 md:h-[400px]">
            {/* Left Sidebar */}
            <div className="w-14 bg-[#F3F2EF] dark:bg-[#1A1A1A] border-r border-[#E0DFDC] dark:border-[#3A3A3A] p-2 hidden md:flex flex-col items-center gap-3 pt-4">
              <div className="w-9 h-9 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center">
                <Users size={18} />
              </div>
              {[BarChart3, Building2, CalendarClock, ListTodo].map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-[#E0DFDC] dark:bg-[#3A3A3A] text-[#666] dark:text-gray-400 flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition-colors cursor-pointer">
                  <Icon size={18} />
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-6 overflow-auto">
              <div className="space-y-4">
                {/* Stat Cards Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Patients', value: '47', color: 'text-[#0A66C2]' },
                    { label: 'This Month', value: 'EGP 12,500', color: 'text-emerald-500' },
                    { label: 'Your Cut', value: 'EGP 4,800', color: 'text-amber-500' },
                    { label: 'Active Clinics', value: '3', color: 'text-violet-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg p-3">
                      <p className="text-xs text-[#666] dark:text-gray-400">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg p-4">
                    <p className="text-sm font-bold text-[#191919] dark:text-white mb-3">Monthly Revenue</p>
                    <div className="h-20 flex items-end justify-between gap-1.5">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#0A66C2] rounded-t opacity-70 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg p-4">
                    <p className="text-sm font-bold text-[#191919] dark:text-white mb-3">Treatments</p>
                    <div className="space-y-2">
                      {[
                        { name: 'Root Canal', pct: 35 },
                        { name: 'Scaling', pct: 25 },
                        { name: 'Extraction', pct: 20 },
                        { name: 'Composite', pct: 15 },
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-[#666] dark:text-gray-400 w-20 truncate">{t.name}</span>
                          <div className="flex-1 h-2 bg-[#E0DFDC] dark:bg-[#3A3A3A] rounded-full overflow-hidden">
                            <div className="h-full bg-[#0A66C2] rounded-full" style={{ width: `${t.pct}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES GRID - 8 CARDS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-white dark:bg-[#252525] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#191919] dark:text-white mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-lg text-[#666666] dark:text-gray-300">
              Built by a dentist, for dentists. Every feature solves a real problem you face daily.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-6 hover:border-[#0A66C2] dark:hover:border-[#0A66C2] transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0A66C2] group-hover:text-white transition-colors">
                    <Icon size={24} className="text-[#0A66C2] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-[#191919] dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#666666] dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* PRICING — FREE FOREVER */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="pricing" className="bg-[#F3F2EF] dark:bg-[#1A1A1A] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#191919] dark:text-white mb-4">
              Free
            </h2>
            <p className="text-lg text-[#666666] dark:text-gray-300 max-w-2xl mx-auto">
              DentStory is built by a dentist who understands the financial pressure. Every feature is free — no trials, no limits, no credit card.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-white dark:bg-[#252525] border-2 border-[#0A66C2] rounded-2xl overflow-hidden shadow-xl shadow-[#0A66C2]/10">
              {/* Header */}
              <div className="bg-[#0A66C2] px-8 py-6 text-center">
                <p className="text-white/80 text-sm font-medium mb-1">The Only Plan</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-white/60 text-lg">/forever</span>
                </div>
              </div>

              {/* Feature List */}
              <div className="px-8 py-6 space-y-3">
                {pricingFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <span className="text-sm text-[#191919] dark:text-gray-200">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="px-8 pb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCTA}
                  className="w-full py-3.5 text-base font-bold bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 rounded-xl shadow-lg shadow-[#0A66C2]/20 transition-all"
                >
                  {token ? 'Go to Dashboard' : 'Create Your Free Account'}
                </motion.button>
                <p className="text-center text-xs text-[#666] dark:text-gray-500 mt-3">
                  No credit card • No trial • No limits
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-white dark:bg-[#252525] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-bold text-[#191919] dark:text-white text-center mb-4"
          >
            Start in 3 Simple Steps
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center text-lg text-[#666] dark:text-gray-300 mb-16 max-w-2xl mx-auto"
          >
            Get up and running in under 2 minutes. No setup fees, no complicated onboarding.
          </motion.p>

          {/* Steps */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 max-w-4xl mx-auto"
          >
            {[
              { step: 1, title: 'Create Account', desc: 'Sign up in seconds — just name, email, and password. No payment info needed.' },
              { step: 2, title: 'Add Clinics & Patients', desc: 'Set up your clinics with commission rates, then add patients and assign them.' },
              { step: 3, title: 'Add & Grow', desc: 'Add sessions, track earnings, analyze your career. Everything auto-calculates.' },
            ].map((s, i) => (
              <motion.div key={i} className="contents">
                <motion.div
                  variants={cardVariant}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-6 text-center w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold mx-auto mb-4 text-lg">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-[#191919] dark:text-white mb-2 text-lg">{s.title}</h3>
                  <p className="text-sm text-[#666666] dark:text-gray-300">{s.desc}</p>
                </motion.div>

                {i < 2 && (
                  <div className="hidden md:block text-[#0A66C2]">
                    <ArrowRight size={28} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEEDBACK & CONTACT */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="feedback" className="bg-[#F3F2EF] dark:bg-[#1A1A1A] py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#191919] dark:text-white mb-4">
              Built in public. Shaped by you.
            </h2>
            <p className="text-lg text-[#666666] dark:text-gray-300">
              DentStory is in active development. Have a feature request? Found a bug? Reach out directly.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {/* WhatsApp Card */}
            <motion.a
              variants={cardVariant}
              whileHover={{ scale: 1.02 }}
              href="https://wa.me/201019876800?text=Hello%20DentStory%20Team,%20I%20have%20a%20suggestion:"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-8 text-center hover:border-[#0A66C2] dark:hover:border-[#0A66C2] transition-all cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0A66C2] transition-colors">
                <MessageCircle size={28} className="text-[#0A66C2] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] dark:text-white mb-2">WhatsApp Us</h3>
              <p className="text-[#666666] dark:text-gray-300 text-sm mb-4">Chat with us directly for instant feedback.</p>
              <div className="inline-block px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg font-semibold text-sm group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                Send Message
              </div>
            </motion.a>

            {/* Email Card */}
            <motion.a
              variants={cardVariant}
              whileHover={{ scale: 1.02 }}
              href="mailto:omarselema52@gmail.com?subject=DentStory%20Feedback%20and%20Suggestions"
              className="group bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-8 text-center hover:border-[#0A66C2] dark:hover:border-[#0A66C2] transition-all cursor-pointer"
            >
              <div className="w-14 h-14 bg-[#0A66C2]/10 dark:bg-[#0A66C2]/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0A66C2] transition-colors">
                <Mail size={28} className="text-[#0A66C2] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#191919] dark:text-white mb-2">Email Us</h3>
              <p className="text-[#666666] dark:text-gray-300 text-sm mb-4">Detailed feedback? Send us an email anytime.</p>
              <div className="inline-block px-4 py-2 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg font-semibold text-sm group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                Send Email
              </div>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FINAL CTA BANNER */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#0A66C2] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to streamline your practice?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join DentStory today — it takes less than 30 seconds and costs absolutely nothing.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCTA}
              className="px-10 py-4 text-lg font-bold bg-white text-[#0A66C2] rounded-xl hover:bg-white/90 shadow-lg transition-all"
            >
              {token ? 'Go to Dashboard →' : 'Create Your Free Account →'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-white dark:bg-[#252525] border-t border-[#E0DFDC] dark:border-[#3A3A3A] py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <AppLogo size="sm" />
            <span className="text-sm text-[#666666] dark:text-gray-400">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-[#0A66C2] font-medium text-sm">
            <a href="#features" className="hover:text-[#0A66C2]/80 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0A66C2]/80 transition-colors">Pricing</a>
            <a href="#feedback" className="hover:text-[#0A66C2]/80 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

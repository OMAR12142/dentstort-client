import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpenText, Building2, MessageCircle, BarChart3, CalendarClock,
  Mail, ArrowRight, Menu, X, Shield, Zap, TrendingUp, CheckCircle2,
  Stethoscope, ImageIcon, ListTodo, Heart, Globe, Sparkles, Smartphone,
  DollarSign, Lock, SmartphoneIcon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import AppLogo from '../components/AppLogo';
import SEO from '../components/common/SEO';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { usePublicPortfolio } from '../hooks/usePortfolio';

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const isDark = useThemeStore((s) => s.isDark);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStickyBadge, setShowStickyBadge] = useState(false);
  const { data: demoPortfolio } = usePublicPortfolio('dr-mohamed-farid');

  useEffect(() => {
    const html = document.documentElement;
    const originalTheme = html.getAttribute('data-theme');
    const hasDarkClass = html.classList.contains('dark');

    // Force Dark Theme for Landing Page
    html.setAttribute('data-theme', 'dark');
    html.classList.add('dark');

    const handleScroll = () => {
      setShowStickyBadge(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Restore user's preference when leaving
      if (originalTheme) html.setAttribute('data-theme', originalTheme);
      if (!hasDarkClass) html.classList.remove('dark');
    };
  }, []);

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DentStory",
    "operatingSystem": "Web, Windows, Android, iOS",
    "applicationCategory": "HealthApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "All-in-one clinical management platform for dentists. Manage patients, clinical sessions, and revenue dashboards.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "120"
    }
  };

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Smart Patient Directory',
      description: 'Centralized patient records with medical alerts, insurance tracking, and instant search. Your entire practice, organized.',
      category: 'Clinical Core'
    },
    {
      icon: BookOpenText,
      title: 'Session & Procedure Logging',
      description: 'Log treatment categories, clinical notes, and session costs in seconds. No more messy notebooks or lost records.',
      category: 'Clinical Core'
    },
    {
      icon: ImageIcon,
      title: 'Clinical Media Library',
      description: 'Securely upload X-rays and clinical photos directly to patient sessions. Build a visual timeline of every patient case.',
      category: 'Clinical Core'
    },
    {
      icon: Globe,
      title: 'generate your Portfolio',
      description: 'Instantly generate a public professional portfolio. Showcase your best clinical results to patients and medical partners, and easily share it with anyone as your CV.',
      category: 'Branding'
    },
    {
      icon: BarChart3,
      title: 'Revenue Analytics',
      description: 'Visualize your monthly earnings, patient growth, and top treatments with interactive financial dashboards.',
      category: 'Business'
    },
    {
      icon: Building2,
      title: 'Multi-Clinic Switching',
      description: 'Manage multiple clinics with unique commission  and independent revenue tracking in one workspace.',
      category: 'Business'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Quick-Sync',
      description: 'Directly message patients from their card. Pre-fill follow-up notes and appointment reminders with one tap.',
      category: 'Efficiency'
    },

  ];

  const highlights = [
    {
      icon: Zap,
      title: 'Blazing Fast',
      desc: 'Optimized for the clinical workflow. Zero-lag patient switching.'
    },
    {
      icon: Lock,
      title: 'Privacy Focused',
      desc: 'Your patient data is yours. Secure Cloudinary encryption.'
    },
    {
      icon: Sparkles,
      title: 'Modern UI',
      desc: 'Beautiful dark mode and premium professional aesthetics.'
    }
  ];

  const pricingFeatures = [
    'Unlimited patients and clinics',
    'Full clinical session history',
    'Secure media & X-ray storage',
    'Personal Clinical Portfolio page',
    'Finance & Revenue dashboards',
    'Smart clinical Task manager',
    'Direct WhatsApp messaging',
    'PWA Mobile Install support',
    ' Dark/Light mode',
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A] transition-colors duration-300 font-sans text-white">
      <SEO
        title="Management Software for Dentists"
        description="The all-in-one SaaS platform for modern dentists. Manage patient records, clinical sessions, and earnings with ease."
        jsonLd={jsonLd}
      />

      <PublicNavbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pb-10 md:pt-12 md:pb-32">
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Hero Text */}
            <div className="flex-1 text-center lg:text-left  lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-emerald-500/20"
              >
                <Heart size={14} className="fill-current" />
                Helping 100+ Dentists to Grow              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight"
              >
                Your Entire Dental Story, <span className="text-primary">In One Place.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium"
              >
                DentStory is the all-in-one clinical SaaS designed for Dentists. Manage patients, analyze revenue, and showcase your portfolio.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start mt-4"
              >
                <button
                  onClick={handleCTA}
                  className="px-8 py-3.5 sm:py-4 bg-primary text-white text-base sm:text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
                >
                  {token ? 'Go to Dashboard' : 'Start Your Dental Story'}
                </button>
                <a
                  href="#features"
                  className="px-8 py-3.5 sm:py-4 bg-[#252525] border border-white/10 text-white text-base sm:text-lg font-black rounded-2xl hover:bg-white/5 transition-all w-full sm:w-auto text-center"
                >
                  Explore Features
                </a>
              </motion.div>

              {/* Platform Availability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252525] border border-white/5 shadow-inner">
                  <Globe size={14} className="text-sky-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Web App</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#252525] border border-white/5 shadow-inner relative overflow-hidden group cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <SmartphoneIcon size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Soon on Google Play</span>
                </div>
              </motion.div>
            </div>

            {/* Premium Dashboard Preview Overlay */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1 w-full max-w-2xl relative mt-12 lg:mt-0"
              style={{ perspective: 1000 }}
            >
              {/* Main glowing backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-sky-500/20 blur-[80px] rounded-full pointer-events-none" />

              <motion.div
                className="relative bg-[#1A1A1A]/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                whileHover={{ rotateY: -2, rotateX: 2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Mac-style Window Header */}
                <div className="h-12 bg-white/5 flex items-center px-5 gap-4 border-b border-white/5 backdrop-blur-md">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-6 py-1.5 rounded-full bg-black/40 border border-white/5">
                      <Lock size={12} className="text-white/40" />
                      <span className="text-[11px] font-medium text-white/50 tracking-wide">app.dentstory.site</span>
                    </div>
                  </div>
                  <div className="w-12" /> {/* Spacer for centering */}
                </div>

                <div className="p-6 space-y-6">
                  {/* Top Stats Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
                        <DollarSign size={48} />
                      </div>
                      <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest mb-2 relative z-10">Monthly Revenue</p>
                      <h4 className="text-3xl font-black text-white relative z-10">EGP 24.5K</h4>
                      <p className="text-xs text-emerald-400 font-medium mt-3 flex items-center gap-1 relative z-10">
                        <TrendingUp size={12} /> +12.5% vs last month
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
                        <Users size={48} />
                      </div>
                      <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest mb-2 relative z-10">Active Patients</p>
                      <h4 className="text-3xl font-black text-white relative z-10">1,284</h4>
                      <p className="text-xs text-emerald-400 font-medium mt-3 flex items-center gap-1 relative z-10">
                        <TrendingUp size={12} /> +45 new this month
                      </p>
                    </div>
                  </div>

                  {/* Patient List Mockup */}
                  <div className="bg-black/20 rounded-2xl border border-white/5 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[11px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <CalendarClock size={14} className="text-primary" /> Today's Sessions
                      </p>
                      <button className="text-[10px] text-primary font-bold hover:underline tracking-wider uppercase">View All</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          name: 'Ahmed Hassan', op: 'Dental Implants', status: 'In Progress',
                          avatarBg: 'bg-primary/20', avatarText: 'text-primary', avatarBorder: 'border-primary/30',
                          statusBg: 'bg-primary/10', statusText: 'text-primary', statusBorder: 'border-primary/20'
                        },
                        {
                          name: 'Sara Mohamed', op: 'Orthodontics', status: 'Completed',
                          avatarBg: 'bg-emerald-500/20', avatarText: 'text-emerald-500', avatarBorder: 'border-emerald-500/30',
                          statusBg: 'bg-emerald-500/10', statusText: 'text-emerald-400', statusBorder: 'border-emerald-500/20'
                        },
                        {
                          name: 'Omar Ali', op: 'Root Canal', status: 'Waiting',
                          avatarBg: 'bg-amber-500/20', avatarText: 'text-amber-500', avatarBorder: 'border-amber-500/30',
                          statusBg: 'bg-amber-500/10', statusText: 'text-amber-400', statusBorder: 'border-amber-500/20'
                        }
                      ].map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 group/item">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-full ${p.avatarBg} flex items-center justify-center ${p.avatarText} font-bold text-sm border ${p.avatarBorder}`}>
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover/item:text-primary transition-colors">{p.name}</p>
                              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-0.5">{p.op}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] px-3 py-1.5 ${p.statusBg} ${p.statusText} rounded-lg font-black uppercase tracking-wider border ${p.statusBorder}`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>


              {/* Floating Element 2: Install App Badge */}
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute -right-4 lg:-right-8 bottom-12 lg:bottom-16 bg-[#1A1A1A]/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 hidden sm:flex items-center gap-4 z-10"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/20">
                  <SmartphoneIcon size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white mb-1">Install App</p>
                  <p className="text-[10px] text-white/50 font-medium">Available on iOS & Android</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 1.5 DEMO VIDEO SECTION ── */}
      <section id="how-it-works" className="py-20 md:py-32 bg-[#0A0A0A] relative overflow-hidden border-t border-white/5">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/5 text-gray-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/10"
            >
              How it works
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              See DentStory <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">in Action</span>
            </h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Watch this quick demo to see how easy it is to manage your clinics, patients, portfolio, and financial records all in one place.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full max-w-5xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,198,255,0.15)] bg-[#1A1A1A]"
          >
            {/* Mac-style Window Header */}
            <div className="h-10 md:h-12 bg-[#252525] flex items-center px-4 md:px-5 gap-4 border-b border-white/5">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 md:px-6 py-1 md:py-1.5 rounded-full bg-black/40 border border-white/5">
                  <Lock size={12} className="text-white/40" />
                  <span className="text-[10px] md:text-[11px] font-medium text-white/50 tracking-wider">dentstory.site/demo</span>
                </div>
              </div>
              <div className="w-10 md:w-16" /> {/* Spacer for centering */}
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-[#000]">
              {/* Overlay loader before iframe loads if needed, but iframe is direct */}
              <iframe
                src="https://drive.google.com/file/d/18VKWYI014AHz0I1nglU-74Iygz_Lq1ts/preview"
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay"
                allowFullScreen
                title="DentStory Demo Video"
              ></iframe>
            </div>
          </motion.div>

          {/* Mobile Fullscreen Fallback Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center md:hidden relative z-20"
          >
            <a
              href="https://drive.google.com/file/d/18VKWYI014AHz0I1nglU-74Iygz_Lq1ts/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(0,198,255,0.3)]"
            >
              <SmartphoneIcon size={16} />
              Open Full Video Mode
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── 2. PORTFOLIO SHOWCASE ── */}
      <section id="portfolio" className="bg-primary py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-white opacity-[0.03] skew-x-[-20deg] translate-x-32" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/20"
            >
              <Sparkles size={14} className="fill-current" />
              Public Doctor Portfolio
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Your Clinical Identity,<br />Beautifully Showcased.</h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-8 font-medium">
              Turn your everyday sessions into a public professional storefront. DentStory automatically builds a beautiful, SEO-optimized portfolio from your clinical records to share with patients and peers.
            </p>

            <div className="flex flex-col gap-4 mb-10 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                "One-click public case publishing",
                "Built-in Before & After galleries",
                "Shareable custom portfolio link",
                "Zero coding or design skills needed"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-white">
                  <CheckCircle2 size={20} className="text-white shrink-0 opacity-80" />
                  <span className="font-bold">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a
                href="https://dentstory.site/portfolio/dr-mohamed-farid"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-primary text-base sm:text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                View Live Example <ArrowRight size={20} />
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
            <a
              href="https://dentstory.site/portfolio/dr-mohamed-farid"
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative"
            >
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-sky-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>

              <div className="relative bg-white dark:bg-[#1A1A1A] rounded-3xl p-5 shadow-2xl border border-white/20 group-hover:scale-[1.02] transition-all duration-300">

                <div className="aspect-[4/3] rounded-2xl bg-[#F3F2EF] dark:bg-[#252525] overflow-hidden relative mb-5 border border-[#E0DFDC] dark:border-white/10 group-hover:shadow-lg transition-all duration-500">
                  <img
                    src="/doctorfarid.jpeg"
                    alt="Doctor Profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute bottom-3 right-3 bg-[#0A66C2] text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10">
                    <p className="text-[9px] font-black uppercase tracking-widest">one of doctors portfolio </p>
                  </div>
                </div>

                <div className="px-2 pb-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="text-[#191919] dark:text-white font-black text-xl leading-tight group-hover:text-primary transition-colors">
                        {demoPortfolio?.dentist?.name ? `Dr. ${demoPortfolio.dentist.name}` : 'Dr. Mohamed Farid'}
                      </h3>
                      <p className="text-[#666666] dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {demoPortfolio?.services?.length > 0 ? demoPortfolio.services[0] : 'Implants & Esthetics'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E0DFDC] dark:border-white/10">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-black text-[#191919] dark:text-white">{demoPortfolio?.pagination?.totalItems || 24}</p>
                        <p className="text-[9px] text-[#666666] dark:text-gray-500 uppercase tracking-widest font-bold">Cases</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#191919] dark:text-white">{demoPortfolio?.yearsOfExperience || 8}yr</p>
                        <p className="text-[9px] text-[#666666] dark:text-gray-500 uppercase tracking-widest font-bold">Exp.</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#F3F2EF] dark:bg-[#252525] flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={18} className="text-[#666666] dark:text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>

              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURE MISSION ── */}
      <section id="features" className="bg-[#252525] py-16 sm:py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">DentStory features.</h2>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              Every feature in DentStory is designed to solve a friction point in the surgical and clinical workflow. Zero fluff, maximum performance.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-5 sm:p-8 bg-[#1A1A1A] rounded-2xl sm:rounded-3xl border border-white/5 hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#252525] flex items-center justify-center text-primary mb-4 sm:mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <f.icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-primary tracking-tighter sm:tracking-widest mb-1 sm:mb-2 opacity-60">{f.category}</p>
                <h3 className="text-sm sm:text-xl font-bold text-white mb-2 sm:mb-4 leading-tight">{f.title}</h3>
                <p className="text-[10px] sm:text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PRICING MISSION ── */}
      <section id="pricing" className="py-16 sm:py-24 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-[#252525] rounded-3xl sm:rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row">

            {/* Pricing Left */}
            <div className="p-10 lg:p-16 flex-1 bg-primary text-white relative">
              <div className="absolute top-0 right-0 p-8">
                <Heart size={40} className="text-white/20 fill-white/10" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mb-4">Our Commitment</p>
              <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">Free. <br />for Early Users. <br />Join Now..</h2>
              <p className="text-lg text-white/80 font-medium leading-relaxed max-w-sm mb-12">
                DentStory is built by a dentist for the surgical family. We don't believe in limits or high access fees for critical clinical data.
              </p>
              <div className="flex items-center gap-4 py-8 border-t border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">0 Hidden Fees • $0 Access Cost</p>
              </div>
            </div>

            {/* Pricing Right */}
            <div className="p-10 lg:p-16 flex-1 bg-[#252525]">
              <h3 className="text-2xl font-black text-white mb-8">What's included?</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {pricingFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-base-content opacity-70">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCTA}
                className="w-full py-4 sm:py-5 bg-primary text-white text-base sm:text-lg font-black rounded-2xl hover:scale-[1.01] active:scale-95 transition-all"
              >
                Start Your denta Story
              </button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-base-content opacity-30 mt-4">Takes 30 seconds • No Card needed</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. FINAL MISSION ── */}
      <section className="bg-[#252525] py-16 sm:py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to take your career to the next level?</h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium">
            Join the clinical family today. Streamline your sessions, track your growth, and showcase your expertise in one beautiful workspace.
          </p>
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 bg-primary text-white text-lg sm:text-xl font-black rounded-2xl hover:scale-[1.05] active:scale-95 transition-all"
          >
            Get Started for Free
          </button>

          {/* ── Simple Support Hub ── */}
          <div id="feedback" className=" sm:mt-16 text-center max-w-xl mx-auto px-4">
            <h3 className="text-2xl font-black text-white mb-4 "> Support.</h3>
            <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
              Have feedback, need advice, or ran into an issue? Reach out to us.            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/201019876800?text=Hello%20Omar,%20I%20have%20some%20feedback/advice%20regarding%20DentStory."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-black hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
              <a
                href="mailto:omarselema52@gmail.com?subject=DentStory Feedback"
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[#252525] text-white text-sm font-black border border-white/5 hover:bg-white/10 active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <Mail size={18} /> Gmail
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* ── STICKY PWA BADGE ── */}
      <AnimatePresence>
        {showStickyBadge && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-6 right-6 z-[60] bg-[#252525] p-4 rounded-3xl border border-white/10 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
              <SmartphoneIcon size={20} />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-white">Install App</p>
              <p className="text-[9px] text-gray-500 font-bold whitespace-nowrap">Tap "Add to Home Screen" in browser</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

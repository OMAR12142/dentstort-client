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

export default function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const isDark = useThemeStore((s) => s.isDark);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStickyBadge, setShowStickyBadge] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBadge(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      title: 'Automated Portfolio',
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
    {
      icon: Smartphone,
      title: 'Progressive Web App',
      description: 'Install DentStory on your iPhone, Android, or PC.',
      category: 'Efficiency'
    }
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
    'Automatic Dark/Light mode',
    'Priority clinical support'
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-[#1A1A1A] transition-colors duration-300 font-sans">
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
                className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#191919] dark:text-white mb-6 leading-[1.1] tracking-tight"
              >
                Your Entire Dental Story, <span className="text-primary">In One Place.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-xl text-[#666666] dark:text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0 font-medium"
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
                  className="px-8 py-3.5 sm:py-4 bg-white dark:bg-[#252525] border border-base-content/10 text-base-content text-base sm:text-lg font-black rounded-2xl hover:bg-base-content/5 transition-all w-full sm:w-auto text-center"
                >
                  Explore Features
                </a>
              </motion.div>

              {/* USP Highlights */}
            </div>

            {/* Dashboard Preview Overlay */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1 w-full max-w-2xl relative"
            >
              <div className="bg-white dark:bg-[#252525] rounded-3xl border border-base-content/10 shadow-2xl overflow-hidden">
                <div className="h-8 bg-base-200 flex items-center px-4 gap-1.5 border-b border-base-content/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
                  <span className="text-[10px] ml-2 font-black text-base-content/30 uppercase tracking-widest">Dashboard</span>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Quick Stats Mockup */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider mb-1">Monthly Earnings</p>
                      <p className="text-2xl font-black text-primary">EGP 14.2K</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider mb-1">Active Patients</p>
                      <p className="text-2xl font-black text-emerald-500">284</p>
                    </div>
                  </div>
                  {/* Patient List Mockup */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Current Clinical Rotation</p>
                    {[
                      { name: 'Ahmed Hassan', op: 'Implants', status: 'active' },
                      { name: 'Sara Mohamed', op: 'Orthodontics', status: 'In Progress' }
                    ].map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-base-100 border border-base-content/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{p.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold">{p.name}</p>
                            <p className="text-[10px] uppercase text-base-content/50">{p.op}</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg font-bold">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-[#252525] p-5 rounded-3xl shadow-xl border border-base-content/10 hidden md:flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
                  <SmartphoneIcon />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Install App</p>
                  <p className="text-[10px] text-base-content/50">Tap "Add to Home Screen" in browser</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. FEATURE MISSION ── */}
      <section id="features" className="bg-white dark:bg-[#252525] py-16 sm:py-24 border-y border-base-content/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-[#191919] dark:text-white mb-6 tracking-tight">DentStory features.</h2>
            <p className="text-lg text-[#666666] dark:text-gray-400 font-medium leading-relaxed">
              Every feature in DentStory is designed to solve a friction point in the surgical and clinical workflow. Zero fluff, maximum performance.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-5 sm:p-8 bg-[#F3F2EF] dark:bg-[#1A1A1A] rounded-2xl sm:rounded-3xl border border-base-content/5 hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white dark:bg-[#252525] flex items-center justify-center text-primary mb-4 sm:mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                  <f.icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-primary tracking-tighter sm:tracking-widest mb-1 sm:mb-2 opacity-60">{f.category}</p>
                <h3 className="text-sm sm:text-xl font-bold text-[#191919] dark:text-white mb-2 sm:mb-4 leading-tight">{f.title}</h3>
                <p className="text-[10px] sm:text-sm text-[#666666] dark:text-gray-400 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PORTFOLIO SHOWCASE ── */}
      <section className="bg-primary py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-full bg-white opacity-[0.03] skew-x-[-20deg] translate-x-32" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built-in Professional Portfolio.</h2>
            <p className="text-lg text-white/80 leading-relaxed max-w-xl mb-8 font-medium">
              Transform your professional journey into a beautiful public storefront. Showcase implants, cosmetics, and surgical results automatically with one-click case publishing.            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-3 shadow-2xl rotate-2 border border-base-content/5">
              <div className="aspect-[4/5] rounded-[2rem] bg-white dark:bg-[#252525] overflow-hidden relative border border-base-content/10 flex flex-col">
                {/* Portfolio Header */}
                <div className="h-20 bg-primary/10 relative">
                  <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] p-0.5 border-2 border-primary/20">
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">OS</div>
                  </div>
                  <div className="absolute -bottom-2 left-16 bg-emerald-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-[#252525] uppercase tracking-tighter">Verified</div>
                </div>

                <div className="px-6 pt-8 pb-4">
                  <p className="text-[11px] font-black text-[#191919] dark:text-white">Dr. mohamed farid </p>
                  <p className="text-[8px] text-[#666666] uppercase tracking-widest mt-0.5">Implants & Esthetics</p>

                  {/* Stats Row */}
                  <div className="flex gap-4 mt-4">
                    <div>
                      <p className="text-[10px] font-black text-primary">24</p>
                      <p className="text-[6px] text-[#666666] uppercase">Cases</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary">8yr</p>
                      <p className="text-[6px] text-[#666666] uppercase">Exp.</p>
                    </div>
                  </div>
                </div>

                {/* Cases Grid */}
                <div className="flex-1 px-4 pb-4 overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 h-full">
                    {[
                      { title: 'Full Mouth Rehab', cat: 'Surgery' },
                      { title: 'Veneers Case', cat: 'Cosmetic' },
                      { title: 'Molar Implant', cat: 'Surgery' },
                      { title: 'Smile Design', cat: 'Esthetics' }
                    ].map((c, i) => (
                      <div key={i} className="bg-base-200 dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-base-content/5 flex flex-col">
                        <div className="flex-1 bg-primary/5 flex items-center justify-center">
                          <ImageIcon size={12} className="opacity-20 text-primary" />
                        </div>
                        <div className="p-2">
                          <p className="text-[7px] font-black text-[#191919] dark:text-white truncate">{c.title}</p>
                          <p className="text-[5px] text-primary uppercase font-bold opacity-70">{c.cat}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PRICING MISSION ── */}
      <section id="pricing" className="py-16 sm:py-24 bg-[#F3F2EF] dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white dark:bg-[#252525] rounded-3xl sm:rounded-[3rem] border border-base-content/5 shadow-2xl overflow-hidden flex flex-col lg:flex-row">

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
            <div className="p-10 lg:p-16 flex-1 bg-white dark:bg-[#252525]">
              <h3 className="text-2xl font-black text-base-content mb-8">What's included?</h3>
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
      <section className="bg-white dark:bg-[#252525] py-16 sm:py-24 border-t border-base-content/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-[#191919] dark:text-white mb-8">Ready to take your career to the next level?</h2>
          <p className="text-xl text-[#666666] dark:text-gray-400 mb-12 leading-relaxed font-medium">
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
            <h3 className="text-2xl font-black text-[#191919] dark:text-white mb-4 "> Support.</h3>
            <p className="text-[#666666] dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed">
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
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-[#F3F2EF] dark:bg-[#252525] text-[#191919] dark:text-white text-sm font-black border border-base-content/5 hover:bg-base-content/10 active:scale-95 transition-all w-full sm:w-auto justify-center"
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
            className="fixed bottom-6 right-6 z-[60] bg-white dark:bg-[#252525] p-4 rounded-3xl border border-base-content/10 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
              <SmartphoneIcon size={20} />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#191919] dark:text-white">Install App</p>
              <p className="text-[9px] text-[#666666] dark:text-gray-500 font-bold whitespace-nowrap">Tap "Add to Home Screen" in browser</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

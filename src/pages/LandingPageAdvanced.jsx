import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpenText, Building2, MessageCircle, BarChart3, CalendarClock,
  Mail, ArrowRight, Menu, X, Shield, Zap, TrendingUp, CheckCircle2,
  Stethoscope, ImageIcon, ListTodo, Heart, Globe, Sparkles, Smartphone,
  DollarSign, Lock, SmartphoneIcon, Download, ArrowLeftRight, Check, Copy, Star, ShieldCheck,
  Award
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { slugifyDoctorName } from '../utils/slugifyDoctor';
import AppLogo from '../components/AppLogo';
import SEO from '../components/common/SEO';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { usePublicPortfolio } from '../hooks/usePortfolio';
import IosInstallModal from '../components/IosInstallModal';
import toast from 'react-hot-toast';

function DentStoryToothIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 3.5C5.2 3.5 3.5 5.4 3.5 8.1C3.5 10.7 4.6 13.1 5.4 15.6C6.1 17.8 6.8 20.5 8.3 20.5C9.5 20.5 9.9 18.4 10.6 16.7C11 15.7 11.4 15.2 12 15.2C12.6 15.2 13 15.7 13.4 16.7C14.1 18.4 14.5 20.5 15.7 20.5C17.2 20.5 17.9 17.8 18.6 15.6C19.4 13.1 20.5 10.7 20.5 8.1C20.5 5.4 18.8 3.5 16.5 3.5C14.8 3.5 13.5 4.4 12 4.4C10.5 4.4 9.2 3.5 7.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 7.5C9.4 6.9 10.6 6.7 11.8 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const isArabic = useLanguageStore((s) => s.isArabic);
  const dashboardRoute = user?.role === 'admin' ? '/admin' : '/dashboard';

  const [showStickyBadge, setShowStickyBadge] = useState(false);
  const { data: demoPortfolio } = usePublicPortfolio('dr-mohamed-farid');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  // If already authenticated and not explicitly viewing the landing page via ?landing=1, redirect
  useEffect(() => {
    if (token && searchParams.get('landing') !== '1') {
      navigate(dashboardRoute, { replace: true });
    }
  }, [token, searchParams, dashboardRoute, navigate]);

  // Live Portfolio Link Generator States
  const [customDoctorName, setCustomDoctorName] = useState(null);
  const defaultDoctorName = isArabic ? 'د. كريم محمود' : 'Dr. Karim Mahmoud';
  const doctorNameInput = customDoctorName !== null ? customDoctorName : defaultDoctorName;
  const setDoctorNameInput = (val) => setCustomDoctorName(val);

  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWhatsAppDemo, setShowWhatsAppDemo] = useState(false);
  const sliderContainerRef = useRef(null);
  const peekAnimationRef = useRef(null);

  // Subtle initial peek animation to invite interaction (50% -> 38% -> 62% -> 50%)
  useEffect(() => {
    let startTime = null;
    const duration = 2400; // 2.4s gentle cycle
    const startPos = 50;

    const animate = (timestamp) => {
      if (hasInteracted) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth sine wave: ±12%
      const offset = Math.sin(progress * 2 * Math.PI) * -12;
      setSliderPos(startPos + offset);

      if (progress < 1 && !hasInteracted) {
        peekAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setSliderPos(50);
      }
    };

    const timer = setTimeout(() => {
      peekAnimationRef.current = requestAnimationFrame(animate);
    }, 700);

    return () => {
      clearTimeout(timer);
      if (peekAnimationRef.current) cancelAnimationFrame(peekAnimationRef.current);
    };
  }, [hasInteracted]);

  const stopPeek = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      if (peekAnimationRef.current) cancelAnimationFrame(peekAnimationRef.current);
    }
  };

  // Close WhatsApp demo on Escape key press
  useEffect(() => {
    if (!showWhatsAppDemo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowWhatsAppDemo(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWhatsAppDemo]);

  const computedSlug = slugifyDoctorName(doctorNameInput, 'dr-your-name');

  const getDoctorInitials = (name) => {
    if (!name) return 'DS';
    const clean = name.replace(/^(د\.?|د\/|دكتور[ة]?|dr\.?|doctor)\s+/i, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'DR';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDoctorHeading = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return isArabic ? 'د. طبيب أسنان' : 'Dr. Dentist';

    const isArabicText = /[\u0600-\u06FF]/.test(trimmed);
    if (isArabicText) {
      if (/^(د\.?|د\/|دكتور[ة]?)\s*/i.test(trimmed)) {
        return trimmed;
      }
      return `د. ${trimmed}`;
    }

    // Latin names: Strip existing leading dr/doctor prefix and auto Title-Case each word
    const withoutTitle = trimmed.replace(/^(dr\.?|doctor)\s+/i, '').trim();
    if (!withoutTitle) {
      return 'Dr. Dentist';
    }

    const titleCased = withoutTitle
      .split(/\s+/)
      .map((word) => {
        if (!word) return '';
        if (word.length <= 3 && word === word.toUpperCase() && word.length > 1) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');

    return `Dr. ${titleCased}`;
  };

  const updateSliderPosition = useCallback((clientX) => {
    const el = sliderContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(94, Math.max(6, pct)));
  }, []);

  const handlePointerDown = (e) => {
    stopPeek();
    setIsDraggingSlider(true);
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    updateSliderPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingSlider) return;
    updateSliderPosition(e.clientX);
  };

  const handlePointerEnd = (e) => {
    if (!isDraggingSlider) return;
    setIsDraggingSlider(false);
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleCopyLink = async () => {
    const fullUrl = `https://dentstory.site/portfolio/${computedSlug}`;
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        success = true;
      }
    } catch {
      // fallback to execCommand below
    }
    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = fullUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        // ignore
      }
    }
    setCopiedLink(true);
    toast.success(isArabic ? 'تم نسخ رابط المحفظة!' : 'Portfolio link copied!');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleClaimPortfolio = () => {
    const cleanName = doctorNameInput.trim() || (isArabic ? 'د. كريم محمود' : 'Dr. Karim Mahmoud');
    const cleanSlug = computedSlug || 'dr-dentist';
    const claimData = {
      claimedName: cleanName,
      claimedSlug: cleanSlug,
      claimedAt: Date.now(),
    };
    try {
      sessionStorage.setItem('dentstory_claimed_portfolio', JSON.stringify(claimData));
    } catch {
      // ignore
    }

    if (token) {
      navigate('/portfolio/manage');
      return;
    }

    navigate(`/register?slug=${encodeURIComponent(cleanSlug)}&name=${encodeURIComponent(cleanName)}`);
  };

  const sampleChips = [
    { label: 'د. كريم محمود', name: 'د. كريم محمود' },
    { label: 'Dr. Sara Ahmed', name: 'Dr. Sara Ahmed' },
    { label: 'د. عمر سليم', name: 'د. عمر سليم' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBadge(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // Check if user is on iOS
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream;
      if (isIos) {
        setShowIosGuide(true);
      } else {
        toast('App is already installed, or your browser requires manual installation (Share > Add to Home Screen).', {
          icon: '📱',
        });
      }
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

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
      navigate(dashboardRoute);
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
    <div className="min-h-screen bg-base-100 transition-colors duration-300 font-sans text-base-content">
      <SEO
        title="Management Software for Dentists"
        description="The all-in-one platform for modern dentists. Manage patient records, clinical sessions, and earnings with ease."
        jsonLd={jsonLd}
      />

      <PublicNavbar />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14">
        {/* Abstract Background Design */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-24 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

            {/* Hero Text & Live Generator Input */}
            <div className="flex-1 text-center lg:text-start lg:pt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-3 sm:mb-4 border border-emerald-500/20"
              >
                <Heart size={14} className="fill-current" />
                {isArabic ? 'يساعد أكثر من 100+ طبيب أسنان للنمو' : 'Helping 100+ Dentists to Grow'}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl lg:text-6xl font-black text-base-content mb-3 sm:mb-4 leading-[1.1] tracking-tight"
              >
                {isArabic ? (
                  <>قصتك الطبية بالكامل، <span className="text-primary">في مكان واحد.</span></>
                ) : (
                  <>Your Entire Dental Story, <span className="text-primary">In One Place.</span></>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-lg text-base-content/70 leading-relaxed mb-4 sm:mb-5 max-w-xl mx-auto lg:mx-0 font-medium"
              >
                {isArabic
                  ? 'المنصة السحابية المتكاملة لأطباء الأسنان. إدارة ملفات المرضى، الإيرادات، ومحفظة حالاتك السريرية برابط مخصص واحترافي.'
                  : 'DentStory is the all-in-one clinical  designed for Dentists. Manage patients, analyze revenue, and showcase your portfolio with a custom branded link.'}
              </motion.p>

              {/* ── Live Portfolio Link Generator Input Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-base-100/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-primary/25 shadow-lg mb-4 max-w-xl mx-auto lg:mx-0 text-start"
              >
                {/* Step 1 Helper Label */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="badge badge-primary badge-sm font-black text-[10px] uppercase tracking-wider px-2 py-0.5 shrink-0">
                      {isArabic ? 'الخطوة ١: اكتب اسمك هنا' : 'Step 1: Type your name here'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-base-content/70 truncate">
                      {isArabic ? 'وشاهد رابطك يتحدث مباشرة' : 'and watch your link update live'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-primary font-bold hidden sm:inline shrink-0" dir="ltr">
                    /{computedSlug}
                  </span>
                </div>

                {/* Interactive Input Box with Focus Ring & Clear Button */}
                <div className="relative mb-2.5">
                  <div className="relative flex items-center bg-base-100 rounded-xl sm:rounded-2xl border-2 border-primary/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 shadow-sm transition-all">
                    <div className="ps-3 text-primary shrink-0 pointer-events-none">
                      <Stethoscope size={18} />
                    </div>
                    <input
                      type="text"
                      value={doctorNameInput}
                      onChange={(e) => setDoctorNameInput(e.target.value)}
                      placeholder={isArabic ? 'مثال: د. كريم محمود' : 'e.g. Dr. Karim Mahmoud'}
                      className="w-full ps-2.5 pe-16 py-2.5 sm:py-3 bg-transparent text-base-content font-bold text-sm sm:text-base focus:outline-none placeholder:text-base-content/40 placeholder:font-normal"
                      autoComplete="off"
                      spellCheck="false"
                    />
                    <div className="absolute inset-y-0 end-2 flex items-center gap-1">
                      {doctorNameInput.trim() && (
                        <button
                          type="button"
                          onClick={() => setDoctorNameInput('')}
                          className="w-6 h-6 rounded-full bg-base-200 hover:bg-base-300 text-base-content/60 hover:text-base-content flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title={isArabic ? 'مسح الاسم' : 'Clear name'}
                          aria-label="Clear name"
                        >
                          <X size={12} className="stroke-[2.5]" />
                        </button>
                      )}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-black tracking-wider uppercase pointer-events-none shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isArabic ? 'مباشر' : 'LIVE'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Sample Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-base-content/60">
                    {isArabic ? 'جرّب أسماء جاهزة:' : 'Quick samples:'}
                  </span>
                  {sampleChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDoctorNameInput(chip.name)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        doctorNameInput === chip.name
                          ? 'bg-primary text-primary-content border-primary shadow-sm'
                          : 'bg-base-200 text-base-content/80 border-neutral-light hover:border-primary/50 hover:bg-base-300'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Prominent CTA Layout: High-contrast button pair when logged in, or Claim Free CTA when unauthenticated */}
                {token ? (
                  <div className="pt-2.5 border-t border-neutral-light/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
                    {/* Primary CTA (flex-1 prominent solid button h-11) */}
                    <button
                      type="button"
                      onClick={() => navigate(dashboardRoute)}
                      className="flex-1 h-11 px-5 bg-primary hover:bg-primary/90 text-primary-content font-bold text-sm sm:text-base rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer shrink-0 sm:shrink"
                    >
                      <span>{isArabic ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}</span>
                      <ArrowRight size={16} className="rtl:rotate-180 shrink-0" />
                    </button>

                    {/* Secondary CTA (clean bordered button h-11) */}
                    <button
                      type="button"
                      onClick={handleClaimPortfolio}
                      className="h-11 px-4 sm:px-5 bg-base-100 hover:bg-base-200 text-base-content border border-neutral-light font-semibold text-xs sm:text-sm rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>{isArabic ? 'استخدم الرابط في البورتفوليو' : 'Use Link in Portfolio'}</span>
                      <ArrowRight size={14} className="rtl:rotate-180 shrink-0 text-base-content/60" />
                    </button>
                  </div>
                ) : (
                  <div className="pt-2.5 border-t border-neutral-light/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={handleClaimPortfolio}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-content text-sm sm:text-base font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>
                        {isArabic ? 'احجز الرابط ده مجانًا ←' : 'Claim This Link Free →'}
                      </span>
                    </button>

                    <span className="text-[11px] text-base-content/60 font-medium">
                      {isArabic ? '✓ مجانًا 100% بدون أي رسوم' : '✓ 100% Free • No card required'}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Secondary Download Button & Platform Availability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
              >
                <button
                  type="button"
                  onClick={handleInstallPWA}
                  className="px-4 py-2 bg-base-200 border border-neutral-light text-base-content text-xs font-black rounded-xl hover:bg-base-content/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  {isArabic ? 'تحميل التطبيق' : 'Download App'}
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 border border-neutral-light">
                  <Globe size={13} className="text-sky-500 dark:text-sky-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-base-content/60">Web App</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-base-200 border border-neutral-light">
                  <SmartphoneIcon size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-base-content/60">Android PWA</span>
                </div>
              </motion.div>
            </div>

            {/* ── Interactive Live Portfolio Showcase Preview Frame ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex-1 w-full max-w-lg lg:max-w-xl relative mt-6 lg:mt-0"
              style={{ perspective: 1000 }}
            >
              {/* Main glowing backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-sky-500/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative bg-base-200/95 backdrop-blur-2xl rounded-[1.75rem] border border-neutral-light shadow-2xl overflow-hidden text-start">
                {/* Browser Header Bar */}
                <div className="h-10 bg-base-100/90 flex items-center px-3 sm:px-4 gap-2.5 border-b border-neutral-light backdrop-blur-md">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center min-w-0">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200 border border-neutral-light max-w-full overflow-hidden">
                      <Lock size={11} className="text-emerald-500 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-mono text-base-content/70 truncate" dir="ltr">
                        dentstory.site/portfolio/<strong className="text-primary font-bold">{computedSlug}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          copiedLink
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'hover:bg-base-content/10 text-base-content/60 hover:text-base-content'
                        }`}
                        title={isArabic ? 'نسخ الرابط' : 'Copy link'}
                        aria-label="Copy portfolio link"
                      >
                        {copiedLink ? (
                          <>
                            <Check size={11} className="text-emerald-500 stroke-[2.5]" />
                            <span className="text-[9px] font-black uppercase tracking-wider">{isArabic ? 'تم النسخ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preview Card Body */}
                <div className="p-3 sm:p-3.5 space-y-2.5">
                  {/* Doctor Profile Banner Card */}
                  <div className="rounded-xl bg-base-100 border border-neutral-light overflow-hidden shadow-sm">
                    {/* Compact Branded Cover */}
                    <div className="h-16 sm:h-20 bg-gradient-to-r from-primary via-sky-600 to-indigo-900 relative flex items-start justify-end p-2 sm:p-2.5 overflow-hidden">
                      {/* Ambient soft glow orbs */}
                      <div className="absolute -top-10 -end-10 w-44 h-44 rounded-full bg-sky-300/20 blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-12 -start-8 w-44 h-44 rounded-full bg-primary/30 blur-2xl pointer-events-none" />

                      {/* Subtle Architectural Wave Accent at bottom of banner */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 1440 160"
                        preserveAspectRatio="none"
                        className="absolute inset-x-0 bottom-0 w-full h-7 pointer-events-none text-white/[0.08]"
                      >
                        <path
                          fill="currentColor"
                          d="M0,96 C320,160 640,20 960,84 C1180,126 1340,104 1440,80 L1440,160 L0,160 Z"
                        />
                      </svg>

                      {/* Architectural DentStory Tooth Emblem Watermark (End Side, opposite avatar) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 end-3 sm:end-5 flex items-center gap-1.5 text-white opacity-[0.14]"
                      >
                        <DentStoryToothIcon className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-black uppercase leading-none tracking-[0.2em] text-[10px] sm:text-xs">
                            DENTSTORY
                          </span>
                          <span className="mt-0.5 font-bold uppercase tracking-[0.22em] text-[6px]">
                            FOR DENTISTS
                          </span>
                        </div>
                      </div>

                      {/* Frosted-Glass DentStory Verified Pill (Top-End Corner) */}
                      <div className="relative z-10 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] font-semibold shadow-sm">
                        <DentStoryToothIcon className="w-3 h-3 text-sky-200 shrink-0" />
                        <span>{isArabic ? 'محفظة معتمدة' : 'DentStory Verified'}</span>
                      </div>
                    </div>

                    {/* Circular Overlapping Avatar, Doctor Info & Actions Body */}
                    <div className="px-3 sm:px-4 pb-3 pt-0 relative">
                      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                        {/* Start Side: Overlapping Avatar + Doctor Info */}
                        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                          {/* Signature Circular Overlapping Avatar with High Contrast & Active Status Dot */}
                          <div className="relative -mt-7 sm:-mt-8 shrink-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-black text-base sm:text-lg flex items-center justify-center shadow-lg ring-4 ring-base-100 border border-white/10">
                              {getDoctorInitials(doctorNameInput)}
                            </div>
                            {/* Subtle green active status dot */}
                            <span
                              className="absolute bottom-0 end-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 ring-2 ring-base-100 shadow-sm"
                              title={isArabic ? 'متصل الآن' : 'Active'}
                            />
                          </div>

                          {/* Doctor Name, Specialty Subtitle & Compact Trust Micro-pills */}
                          <div className="pt-1 min-w-0 space-y-0.5">
                            <h4 className="text-sm sm:text-base font-black text-base-content flex items-center gap-1.5 truncate">
                              <span className="truncate">{formatDoctorHeading(doctorNameInput)}</span>
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary text-primary-content shrink-0" title="DentStory Verified">
                                <Check size={9} className="stroke-[3]" />
                              </span>
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-base-content/60 font-medium truncate">
                              {isArabic ? 'طب وجراحة وتجميل الأسنان • القاهرة' : 'Cosmetic Dentistry & Implantology • Cairo'}
                            </p>

                            {/* Compact Trust Micro-Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Award size={10} className="shrink-0" />
                                <span>{isArabic ? '٨+ سنوات خبرة' : '8+ Yrs Exp'}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                                <CheckCircle2 size={10} className="shrink-0" />
                                <span>{isArabic ? '٢٤ حالة موثقة' : '24 Cases'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* End Side: WhatsApp CTA Button — Cleanly below banner inside card body */}
                        <div className="pt-1.5 sm:pt-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowWhatsAppDemo((prev) => !prev)}
                            aria-expanded={showWhatsAppDemo}
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-white text-[11px] sm:text-xs font-bold shadow-sm hover:shadow hover:brightness-105 active:scale-95 transition-all cursor-pointer ${
                              showWhatsAppDemo
                                ? 'bg-emerald-600 ring-2 ring-emerald-400/50'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                            title={isArabic ? 'اضغط لمعاينة رسالة المريض التلقائية' : 'Click to preview automated patient WhatsApp inquiry'}
                          >
                            <WhatsAppIcon size={13} className="fill-current" />
                            <span>{isArabic ? 'واتساب' : 'WhatsApp'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Before & After Comparison Case (True Dental Smile Transformation) */}
                  <div className="rounded-xl bg-base-100 border border-neutral-light p-2.5 sm:p-3 shadow-sm space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="badge badge-primary badge-xs sm:badge-sm font-bold text-[9px] sm:text-[10px] shrink-0">
                          {isArabic ? 'حالة سريرية' : 'Clinical Case'}
                        </span>
                        <span className="text-xs font-bold text-base-content truncate">
                          {isArabic ? 'ابتسامة هوليوود (فينير إيماكس)' : 'Hollywood Smile (E-Max Veneers)'}
                        </span>
                      </div>
                      <span className="text-[10px] text-base-content/60 font-medium flex items-center gap-1 shrink-0">
                        <ArrowLeftRight size={11} className="text-primary" />
                        <span>{isArabic ? 'حرّك للمقارنة' : 'Drag to compare'}</span>
                      </span>
                    </div>

                    {/* Draggable Slider Window with Clean Proportions & Macro Smile Visual */}
                    <div
                      ref={sliderContainerRef}
                      onMouseEnter={stopPeek}
                      onTouchStart={stopPeek}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerEnd}
                      onPointerCancel={handlePointerEnd}
                      className="relative h-36 sm:h-40 max-h-44 w-full rounded-xl overflow-hidden bg-base-300 border border-neutral-light select-none touch-none cursor-ew-resize group"
                    >
                      {/* After image layer (base / right) — Dazzling Hollywood Smile Veneers */}
                      <img
                        src="/smile-macro.jpg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?auto=format&fit=crop&w=800&q=80';
                        }}
                        alt="After treatment smile"
                        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none brightness-105 contrast-104"
                        loading="lazy"
                      />

                      {/* Before image layer (clipped / left) — Authentic natural pre-treatment tooth shade */}
                      <div
                        className="absolute inset-0 pointer-events-none overflow-hidden"
                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      >
                        <img
                          src="/smile-macro.jpg"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1677026010083-78ec7f1b84ed?auto=format&fit=crop&w=800&q=80';
                          }}
                          alt="Before treatment"
                          className="absolute inset-0 w-full h-full object-cover object-center"
                          style={{ filter: 'sepia(0.55) saturate(1.4) brightness(0.86) contrast(0.95)' }}
                          loading="lazy"
                        />
                      </div>

                      {/* Corner Badges */}
                      <span className="pointer-events-none absolute top-2 start-2 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-black/65 text-white backdrop-blur-sm shadow-sm">
                        {isArabic ? 'قبل' : 'Before'}
                      </span>
                      <span className="pointer-events-none absolute top-2 end-2 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-primary/90 text-primary-content backdrop-blur-sm shadow-sm">
                        {isArabic ? 'بعد' : 'After'}
                      </span>

                      {/* Draggable divider line & circular thumb handle */}
                      <div
                        style={{ left: `${sliderPos}%` }}
                        className="absolute inset-y-0 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                      >
                        <div className="w-0.5 h-full bg-white shadow-[0_0_6px_rgba(0,0,0,0.6)]" />
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-base-100 text-primary border-2 border-primary shadow-lg flex items-center justify-center group-hover:scale-110 active:scale-95 transition-transform">
                          <ArrowLeftRight size={12} className="stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    {/* Authentic DentStory Portfolio Footer Strip */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-light/70 text-[10px] sm:text-[11px] text-base-content/70 font-medium gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck size={13} className="text-primary shrink-0" />
                        <span className="truncate">
                          {isArabic
                            ? '١٢ حالة سريرية موثقة • محفظة معتمدة'
                            : '12 Documented Cases • Verified Portfolio'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold shrink-0 border border-primary/20" dir="ltr">
                        <span>/{computedSlug}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Simulated WhatsApp Patient Inquiry Demo Overlay ── */}
                <AnimatePresence>
                  {showWhatsAppDemo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setShowWhatsAppDemo(false);
                      }}
                      className="absolute inset-0 z-30 bg-black/55 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center select-none"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="w-full max-w-sm bg-base-100 border border-neutral-light rounded-2xl shadow-2xl overflow-hidden text-start"
                        role="dialog"
                        aria-modal="true"
                        aria-label={isArabic ? 'معاينة رسالة المريض' : 'Patient Inquiry Preview'}
                      >
                        {/* WhatsApp Card Header */}
                        <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white px-3.5 py-2.5 flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                              <WhatsAppIcon size={15} className="fill-current" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[11px] sm:text-xs font-bold truncate leading-tight">
                                {formatDoctorHeading(doctorNameInput)}
                              </div>
                              <div className="text-[9px] text-white/80 font-medium truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{isArabic ? 'معاينة رسالة المريض' : 'Patient Inquiry Preview'}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowWhatsAppDemo(false)}
                            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            aria-label={isArabic ? 'إغلاق المعاينة' : 'Close preview'}
                            title={isArabic ? 'إغلاق المعاينة' : 'Close preview'}
                          >
                            <X size={14} className="stroke-[2.5]" />
                          </button>
                        </div>

                        {/* WhatsApp Message Body */}
                        <div className="p-3.5 bg-base-200/50 dark:bg-base-300/30 space-y-2.5">
                          {/* Chat Context Bubble */}
                          <div className="flex justify-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-base-100/90 text-base-content/60 text-[9px] font-bold shadow-2xs border border-neutral-light/60">
                              {isArabic ? 'رسالة واردة من مريض حقيقي' : 'Incoming Patient Inquiry'}
                            </span>
                          </div>

                          {/* Pre-filled Patient Message Bubble */}
                          <div className="bg-base-100 border border-neutral-light/80 text-base-content rounded-2xl rounded-ss-xs p-3 shadow-sm space-y-1.5 relative max-w-[95%]">
                            <p className="text-xs sm:text-[13px] leading-relaxed text-base-content font-medium">
                              {isArabic ? (
                                <>
                                  أهلاً <strong className="font-bold text-base-content">{formatDoctorHeading(doctorNameInput)}</strong>، شفت حالاتك على DentStory (<span className="text-primary font-mono font-bold" dir="ltr">dentstory.site/portfolio/{computedSlug}</span>) وحابب أحجز استشارة في العيادة.
                                </>
                              ) : (
                                <>
                                  Hello <strong className="font-bold text-base-content">{formatDoctorHeading(doctorNameInput)}</strong>, I saw your clinical cases on DentStory (<span className="text-primary font-mono font-bold" dir="ltr">dentstory.site/portfolio/{computedSlug}</span>) and would like to book a consultation.
                                </>
                              )}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-[9px] text-base-content/40 font-mono pt-0.5">
                              <span>10:42 AM</span>
                              <Check size={11} className="text-sky-500 stroke-[2.5]" />
                            </div>
                          </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-3 bg-base-100 border-t border-neutral-light flex flex-col sm:flex-row items-center justify-between gap-2 text-start">
                          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-base-content/70 font-medium">
                            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                            <span>
                              {isArabic
                                ? 'مباشرة على واتساب عيادتك • بدون عمولة'
                                : 'Direct to your WhatsApp • 0% commission'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowWhatsAppDemo(false);
                              handleClaimPortfolio();
                            }}
                            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-content text-[11px] sm:text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0"
                          >
                            <span>
                              {token
                                ? (isArabic ? 'إدارة محفظتك' : 'Manage Portfolio')
                                : (isArabic ? 'احجز رابطك الآن ←' : 'Claim Your Link Now →')}
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 1.5 DEMO VIDEO SECTION ── */}
      <section id="how-it-works" className="py-20 md:py-32 bg-base-200 relative overflow-hidden border-t border-neutral-light">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-base-100 text-base-content/70 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-neutral-light"
            >
              How it works
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-base-content tracking-tight mb-6">
              See DentStory <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">in Action</span>
            </h2>
            <p className="text-base-content/70 font-medium max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
              Watch this quick demo to see how easy it is to manage your clinics, patients, portfolio, and financial records all in one place.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative w-full max-w-5xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-neutral-light shadow-[0_0_80px_rgba(0,198,255,0.15)] bg-base-100"
          >
            {/* Mac-style Window Header */}
            <div className="h-10 md:h-12 bg-base-200 flex items-center px-4 md:px-5 gap-4 border-b border-neutral-light">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-4 md:px-6 py-1 md:py-1.5 rounded-full bg-base-100 border border-neutral-light">
                  <Lock size={12} className="text-base-content/40" />
                  <span className="text-[10px] md:text-[11px] font-medium text-base-content/60 tracking-wider">dentstory.site/demo</span>
                </div>
              </div>
              <div className="w-10 md:w-16" /> {/* Spacer for centering */}
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-[#000]">
              <video
                src="/dentstory mobile demo sound-.mp4"
                className="absolute top-0 left-0 w-full h-full"
                controls
                title="DentStory Demo Video"
              />
            </div>
          </motion.div>


        </div>
      </section>

      {/* ── 2. PORTFOLIO SHOWCASE ── */}
      <section id="portfolio" className="bg-[#0A66C2] py-8 sm:py-12 relative overflow-hidden">
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
                "One-click for case publishing",
                "Built-in Before & After galleries",
                "Shareable custom portfolio link",
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
                className="px-8 py-4 bg-white text-[#0A66C2] text-base sm:text-lg font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center gap-2 w-full sm:w-auto justify-center"
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

              <div className="relative bg-base-200 rounded-3xl p-5 shadow-2xl border border-neutral-light group-hover:scale-[1.02] transition-all duration-300">

                <div className="aspect-[4/3] rounded-2xl bg-base-100 overflow-hidden relative mb-5 border border-neutral-light group-hover:shadow-lg transition-all duration-500">
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
                      <h3 className="text-base-content font-black text-xl leading-tight group-hover:text-primary transition-colors">
                        {demoPortfolio?.dentist?.name ? `Dr. ${demoPortfolio.dentist.name}` : 'Dr. Mohamed Farid'}
                      </h3>
                      <p className="text-base-content/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {demoPortfolio?.services?.length > 0 ? demoPortfolio.services[0] : 'Implants & Esthetics'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-light">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs font-black text-base-content">{demoPortfolio?.pagination?.totalItems || 24}</p>
                        <p className="text-[9px] text-base-content/50 uppercase tracking-widest font-bold">Cases</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-base-content">{demoPortfolio?.yearsOfExperience || 8}yr</p>
                        <p className="text-[9px] text-base-content/50 uppercase tracking-widest font-bold">Exp.</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-content transition-colors">
                      <ArrowRight size={18} className="text-base-content/60 group-hover:text-primary-content transition-colors" />
                    </div>
                  </div>
                </div>

              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURE MISSION ── */}
      <section id="features" className="bg-base-200 py-16 sm:py-24 border-y border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-base-content mb-6 tracking-tight">DentStory features.</h2>
            <p className="text-lg text-base-content/70 font-medium leading-relaxed">
              Every feature in DentStory is designed to solve a friction point in the surgical and clinical workflow. Zero fluff, maximum performance.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-5 sm:p-8 bg-base-100 rounded-2xl sm:rounded-3xl border border-neutral-light hover:border-primary/40 transition-all group"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-base-200 flex items-center justify-center text-primary mb-4 sm:mb-6 shadow-sm group-hover:bg-primary group-hover:text-primary-content transition-all border border-neutral-light">
                  <f.icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <p className="text-[8px] sm:text-[10px] font-black uppercase text-primary tracking-tighter sm:tracking-widest mb-1 sm:mb-2 opacity-70">{f.category}</p>
                <h3 className="text-sm sm:text-xl font-bold text-base-content mb-2 sm:mb-4 leading-tight">{f.title}</h3>
                <p className="text-[10px] sm:text-sm text-base-content/70 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PRICING MISSION ── */}
      <section id="pricing" className="py-16 sm:py-24 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-base-200 rounded-3xl sm:rounded-[3rem] border border-neutral-light shadow-2xl overflow-hidden flex flex-col lg:flex-row">

            {/* Pricing Left */}
            <div className="p-10 lg:p-16 flex-1 bg-[#0A66C2] text-white relative">
              <div className="absolute top-0 right-0 p-8">
                <Heart size={40} className="text-white/20 fill-white/10" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-4">Our Commitment</p>
              <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">Free. <br />for Early Users. <br />Join Now..</h2>
              <p className="text-lg text-white/85 font-medium leading-relaxed max-w-sm mb-12">
                DentStory is built by a dentist for the surgical family. We don't believe in limits or high access fees for critical clinical data.
              </p>
              <div className="flex items-center gap-4 py-8 border-t border-white/15">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">0 Hidden Fees • $0 Access Cost</p>
              </div>
            </div>

            {/* Pricing Right */}
            <div className="p-10 lg:p-16 flex-1 bg-base-200">
              <h3 className="text-2xl font-black text-base-content mb-8">What's included?</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {pricingFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                    <span className="text-sm font-bold text-base-content/80">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCTA}
                className="w-full py-4 sm:py-5 bg-primary text-primary-content text-base sm:text-lg font-black rounded-2xl hover:scale-[1.01] active:scale-95 transition-all"
              >
                Start Your denta Story
              </button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-base-content/40 mt-4">Takes 30 seconds • No Card needed</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. FINAL MISSION ── */}
      <section className="bg-base-200 py-16 sm:py-24 border-t border-neutral-light">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-base-content mb-8">Ready to take your career to the next level?</h2>
          <p className="text-xl text-base-content/70 mb-12 leading-relaxed font-medium">
            Join the clinical family today. Streamline your sessions, track your growth, and showcase your expertise in one beautiful workspace.
          </p>
          <button
            onClick={handleCTA}
            className="w-full sm:w-auto px-10 sm:px-12 py-4 sm:py-5 bg-primary text-primary-content text-lg sm:text-xl font-black rounded-2xl hover:scale-[1.05] active:scale-95 transition-all"
          >
            Get Started for Free
          </button>

          {/* ── Simple Support Hub ── */}
          <div id="feedback" className="mt-16 sm:mt-24 text-center max-w-xl mx-auto px-4">
            <h3 className="text-2xl font-black text-base-content mb-4 "> Support.</h3>
            <p className="text-base-content/70 text-sm font-medium mb-10 leading-relaxed">
              Have feedback, need advice, or ran into an issue? Reach out to us.            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/201098854397?text=Hello%20Omar,%20I%20have%20some%20feedback/advice%20regarding%20DentStory."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-emerald-500 text-white text-sm font-black hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto justify-center"
              >
                <WhatsAppIcon size={18} /> WhatsApp
              </a>
              <a
                href="mailto:omarselema52@gmail.com?subject=DentStory Feedback"
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-base-100 text-base-content text-sm font-black border border-neutral-light hover:bg-base-content/5 active:scale-95 transition-all w-full sm:w-auto justify-center"
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
            className="fixed bottom-6 right-6 z-[60] bg-base-200 p-4 rounded-3xl border border-neutral-light shadow-xl flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center text-white">
              <SmartphoneIcon size={20} />
            </div>
            <div className="pr-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-base-content">Install App</p>
              <p className="text-[9px] text-base-content/60 font-bold whitespace-nowrap">Tap "Add to Home Screen" in browser</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* IOS Install Guide Modal */}
      <IosInstallModal open={showIosGuide} onClose={() => setShowIosGuide(false)} />
    </div>
  );
}

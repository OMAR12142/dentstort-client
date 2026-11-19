import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon, ArrowLeft, Shield } from 'lucide-react';
import { useLogin, useGoogleLogin } from '../hooks/useAuth';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import AppLogo from '../components/AppLogo';
import GoogleAuthButton from '../components/GoogleAuthButton';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AuthShowcasePanel from '../components/auth/AuthShowcasePanel';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const { mutate, isPending, error } = useLogin();
  const { mutate: googleLoginMutate, isPending: googlePending } = useGoogleLogin();
  const [showPw, setShowPw] = useState(false);
  const [vErrors, setVErrors] = useState({});
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isArabic = useLanguageStore((s) => s.isArabic);

  // Preserve claimed portfolio parameters across login & register
  const [claimedPortfolio] = useState(() => {
    const qSlug = searchParams.get('slug');
    const qName = searchParams.get('name');
    if (qSlug) {
      const data = { claimedSlug: qSlug, claimedName: qName || '' };
      try {
        sessionStorage.setItem('dentstory_claimed_portfolio', JSON.stringify(data));
      } catch {
        // ignore
      }
      return data;
    }
    try {
      const stored = sessionStorage.getItem('dentstory_claimed_portfolio');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const registerUrl = searchParams.toString() ? `/register?${searchParams.toString()}` : '/register';

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email')?.trim();
    const password = fd.get('password');

    const errs = {};
    if (!email) {
      errs.email = isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = isArabic ? 'أدخل بريد إلكتروني صحيح' : 'Enter a valid email address';
    }
    if (!password) {
      errs.password = isArabic ? 'كلمة المرور مطلوبة' : 'Password is required';
    }

    if (Object.keys(errs).length) {
      setVErrors(errs);
      return;
    }

    setVErrors({});
    mutate({ email, password });
  };

  return (
    <div className="min-h-dvh w-full overflow-x-clip bg-base-100 text-base-content flex flex-col lg:flex-row">
      {/* ── Left Column: Authentication Form ── */}
      <div className="flex-1 flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-12 xl:px-16 relative z-10 w-full min-h-dvh overflow-y-auto">
        {/* A. Unified Top Utility Bar */}
        <div className="w-full max-w-[420px] mx-auto flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-base-content/70 hover:text-primary hover:bg-base-200 border border-neutral-light/70 transition-all cursor-pointer shadow-2xs"
            title={isArabic ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
          >
            {isArabic ? (
              <>
                <ArrowLeft size={13} className="rotate-180" />
                <span>العودة للرئيسية</span>
              </>
            ) : (
              <>
                <ArrowLeft size={13} />
                <span>Back to Home</span>
              </>
            )}
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher className="h-9 px-2.5 sm:px-3 text-xs font-semibold bg-base-100 border border-neutral-light text-base-content/80 hover:text-primary hover:border-primary/40 shrink-0 shadow-2xs" />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-9 w-9 p-0 flex items-center justify-center rounded-xl bg-base-100 border border-neutral-light text-base-content/70 hover:text-primary hover:border-primary/40 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* B. Center Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px] mx-auto my-auto py-2"
        >
          {/* Brand Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Link to="/" className="hover:opacity-85 transition-opacity" title="DentStory">
              <AppLogo size="lg" />
            </Link>
          </div>

          <div className="text-center sm:text-start mb-6">
            <h2 className="text-2xl font-black text-base-content tracking-tight">
              {isArabic ? 'مرحبًا بعودتك' : 'Welcome Back'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-base-content/70 font-medium">
              {isArabic
                ? 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى عيادتك.'
                : 'Enter your email and password to access your clinic.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-error/10 text-error text-xs rounded-xl p-3 border border-error/20 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error.response?.data?.message || (isArabic ? 'فشل تسجيل الدخول. تحقق من بياناتك.' : 'Login failed. Please check your credentials.')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-base-content/80 mb-1.5 text-start">
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Mail size={15} className={vErrors.email ? 'text-error' : ''} />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="doctor@example.com"
                  onChange={() => vErrors.email && setVErrors((p) => ({ ...p, email: undefined }))}
                  className={`input w-full h-11 ps-10 pe-10 rounded-xl bg-base-200/50 border border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-base sm:text-sm text-base-content ${
                    vErrors.email ? 'border-error focus:border-error focus:ring-error' : ''
                  }`}
                  autoComplete="email"
                />
              </div>
              {vErrors.email && (
                <div className="flex items-center gap-1 text-[11px] text-error mt-1 font-semibold text-start">
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{vErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-base-content/80">
                  {isArabic ? 'كلمة المرور' : 'Password'} <span className="text-error">*</span>
                </label>
                <a
                  href="https://wa.me/201098854397?text=Hello%20Support,%20I%20forgot%20my%20password%20for%20DentStory%20and%20need%20help%20resetting%20it."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-primary hover:underline transition-colors"
                >
                  {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </a>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Lock size={15} className={vErrors.password ? 'text-error' : ''} />
                </div>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  onChange={() => vErrors.password && setVErrors((p) => ({ ...p, password: undefined }))}
                  className={`input w-full h-11 ps-10 pe-10 rounded-xl bg-base-200/50 border border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-base sm:text-sm text-base-content ${
                    vErrors.password ? 'border-error focus:border-error focus:ring-error' : ''
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 end-3 flex items-center text-base-content/40 hover:text-base-content transition-colors cursor-pointer p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {vErrors.password && (
                <div className="flex items-center gap-1 text-[11px] text-error mt-1 font-semibold text-start">
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{vErrors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || googlePending}
              className="btn w-full h-11 rounded-xl text-white text-sm font-bold border-0 bg-primary hover:bg-primary/90 mt-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              {isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-light/70" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-base-100 px-3 text-base-content/50">
                {isArabic ? 'أو المتابعة باستخدام' : 'Or continue with'}
              </span>
            </div>
          </div>

          {/* Google Auth Button */}
          <div className="flex justify-center">
            <GoogleAuthButton
              onSuccess={(token) => googleLoginMutate(token)}
              isPending={googlePending}
              text={isArabic ? 'المتابعة باستخدام Google' : 'Continue with Google'}
            />
          </div>

          {/* Switch to Register */}
          <p className="text-center text-xs text-base-content/70 mt-6 font-medium">
            {isArabic ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
            <Link to={registerUrl} className="text-primary font-bold hover:underline transition-all">
              {isArabic ? 'إنشاء حساب جديد' : 'Create an account'}
            </Link>
          </p>
        </motion.div>

        {/* Bottom Security / Trust Caption */}
        <div className="w-full max-w-[420px] mx-auto text-center text-[11px] text-base-content/40 flex items-center justify-center gap-1.5 pt-4">
          <Shield size={12} className="shrink-0" />
          <span>
            {isArabic
              ? 'منصة DentStory • تشفير آمن وحماية سريرية ٢٥٦-بت'
              : 'DentStory Platform • 256-bit Clinical Encryption'}
          </span>
        </div>
      </div>

      {/* ── Right Column: Branded SaaS Showcase Panel ── */}
      <AuthShowcasePanel mode="login" claimedPortfolio={claimedPortfolio} isArabic={isArabic} />
    </div>
  );
}

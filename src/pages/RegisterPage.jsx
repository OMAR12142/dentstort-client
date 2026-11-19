import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, Sun, Moon, Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { useRegister, useGoogleLogin } from '../hooks/useAuth';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import GoogleAuthButton from '../components/GoogleAuthButton';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AuthShowcasePanel from '../components/auth/AuthShowcasePanel';
import { z } from 'zod';
import AppLogo from '../components/AppLogo';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(1, 'Mobile number is required'),
});

function getPasswordStrength(pwd, isArabic) {
  if (!pwd) return null;
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8 && /[0-9]/.test(pwd)) score += 1;
  if (/[A-Z]/.test(pwd) || (/[a-z]/.test(pwd) && /[0-9]/.test(pwd))) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 10) score += 1;

  const finalScore = Math.min(4, Math.max(1, score));
  switch (finalScore) {
    case 1:
      return { score: 1, label: isArabic ? 'ضعيفة' : 'Weak', color: 'bg-error', textColor: 'text-error' };
    case 2:
      return { score: 2, label: isArabic ? 'مقبولة' : 'Fair', color: 'bg-warning', textColor: 'text-warning' };
    case 3:
      return { score: 3, label: isArabic ? 'جيدة' : 'Good', color: 'bg-info', textColor: 'text-info' };
    case 4:
    default:
      return { score: 4, label: isArabic ? 'قوية جدًا' : 'Strong', color: 'bg-success', textColor: 'text-success' };
  }
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { mutate, isPending, error } = useRegister();
  const { mutate: googleRegisterMutate, isPending: googlePending } = useGoogleLogin();
  const [showPw, setShowPw] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [vErrors, setVErrors] = useState({});
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isArabic = useLanguageStore((s) => s.isArabic);
  const loginLink = searchParams.toString() ? `/login?${searchParams.toString()}` : '/login';

  // Claimed portfolio parameters from Landing Page Hero
  const [claimedPortfolio] = useState(() => {
    const qSlug = searchParams.get('slug');
    const qName = searchParams.get('name');
    if (qSlug) {
      const data = { claimedSlug: qSlug, claimedName: qName || '' };
      try {
        sessionStorage.setItem('dentstory_claimed_portfolio', JSON.stringify(data));
      } catch {
        // ignore storage error
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

  const clearError = (field) => {
    if (vErrors[field]) setVErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const raw = Object.fromEntries(fd);
    const result = schema.safeParse(raw);
    if (!result.success) {
      const errs = {};
      result.error.issues.forEach((i) => {
        const field = i.path[0];
        if (isArabic) {
          if (field === 'name') errs.name = 'الاسم بالكامل مطلوب';
          else if (field === 'email') errs.email = 'أدخل بريد إلكتروني صحيح';
          else if (field === 'password') errs.password = 'كلمة المرور يجب أن لا تقل عن ٦ أحرف';
          else if (field === 'phone') errs.phone = 'رقم الهاتف مطلوب';
          else errs[field] = i.message;
        } else {
          errs[field] = i.message;
        }
      });
      setVErrors(errs);
      return;
    }
    setVErrors({});
    mutate(result.data);
  };

  const strength = getPasswordStrength(passwordValue, isArabic);

  return (
    <div className="min-h-dvh w-full overflow-x-clip bg-base-100 text-base-content flex flex-col lg:flex-row">
      {/* ── Left Column: Form ── */}
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
          <div className="flex items-center justify-center gap-3 mb-5">
            <Link to="/" className="hover:opacity-85 transition-opacity" title="DentStory">
              <AppLogo size="lg" />
            </Link>
          </div>

          <div className="text-center sm:text-start mb-5">
            <h2 className="text-2xl font-black text-base-content tracking-tight">
              {isArabic ? 'إنشاء حساب جديد' : 'Create Account'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-base-content/70 font-medium">
              {isArabic
                ? 'انضم إلى DentStory لإدارة مرضاك وسجلاتك المالية ومحفظتك السريرية.'
                : 'Join DentStory to manage your patients, finances, and public portfolio.'}
            </p>
          </div>

          {/* Reserved Portfolio Banner */}
          {claimedPortfolio?.claimedSlug && (
            <div className="mb-4 p-3 rounded-2xl bg-primary/10 border border-primary/25 flex items-start gap-2.5 text-primary text-start">
              <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Sparkles size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-base-content">
                    {isArabic ? 'رابط محفظتك محجوز وجاهز للتفعيل:' : 'Your Portfolio Link is Reserved:'}
                  </span>
                  <span className="badge badge-primary badge-xs uppercase font-black text-[8px]">
                    {isArabic ? 'مجاني' : 'Free'}
                  </span>
                </div>
                <div className="font-mono text-[11px] sm:text-xs font-bold text-primary truncate pt-0.5" dir="ltr">
                  dentstory.site/portfolio/{claimedPortfolio.claimedSlug}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-error/10 text-error text-xs rounded-xl p-3 border border-error/20 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error.response?.data?.message || (isArabic ? 'فشل إنشاء الحساب. حاول مرة أخرى.' : 'Registration failed. Please try again.')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-bold text-base-content/80 mb-1 text-start">
                {isArabic ? 'الاسم بالكامل' : 'Full Name'} <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-base-content/40">
                  <User size={15} className={vErrors.name ? 'text-error' : ''} />
                </div>
                <input
                  name="name"
                  type="text"
                  defaultValue={claimedPortfolio?.claimedName || ''}
                  placeholder={isArabic ? 'د. محمد فريد' : 'Dr. Mohamed Farid'}
                  onChange={() => clearError('name')}
                  className={`input w-full h-11 ps-10 pe-10 rounded-xl bg-base-200/50 border border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-base sm:text-sm text-base-content ${
                    vErrors.name ? 'border-error focus:border-error focus:ring-error' : ''
                  }`}
                  autoComplete="name"
                />
              </div>
              {vErrors.name && (
                <div className="flex items-center gap-1 text-[11px] text-error mt-1 font-semibold text-start">
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{vErrors.name}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-base-content/80 mb-1 text-start">
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
                  onChange={() => clearError('email')}
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

            {/* Password Field with Dynamic Strength Meter */}
            <div>
              <label className="block text-xs font-bold text-base-content/80 mb-1 text-start">
                {isArabic ? 'كلمة المرور' : 'Password'} <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Lock size={15} className={vErrors.password ? 'text-error' : ''} />
                </div>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordValue}
                  onChange={(e) => {
                    clearError('password');
                    setPasswordValue(e.target.value);
                  }}
                  className={`input w-full h-11 ps-10 pe-10 rounded-xl bg-base-200/50 border border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-base sm:text-sm text-base-content ${
                    vErrors.password ? 'border-error focus:border-error focus:ring-error' : ''
                  }`}
                  autoComplete="new-password"
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

              {/* Interactive Password Strength Meter */}
              {strength && (
                <div className="space-y-1 pt-1.5 text-start">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-base-content/60">
                      {isArabic ? 'قوة كلمة المرور:' : 'Password strength:'}
                    </span>
                    <span className={strength.textColor}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-base-300 dark:bg-base-100/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {vErrors.password && (
                <div className="flex items-center gap-1 text-[11px] text-error mt-1 font-semibold text-start">
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{vErrors.password}</span>
                </div>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-bold text-base-content/80 mb-1 text-start">
                {isArabic ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} <span className="text-error">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Phone size={15} className={vErrors.phone ? 'text-error' : ''} />
                </div>
                <input
                  name="phone"
                  type="tel"
                  placeholder={isArabic ? '010 1234 5678' : '+20 10 1234 5678'}
                  onChange={() => clearError('phone')}
                  className={`input w-full h-11 ps-10 pe-10 rounded-xl bg-base-200/50 border border-neutral-light focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all text-base sm:text-sm text-base-content ${
                    vErrors.phone ? 'border-error focus:border-error focus:ring-error' : ''
                  }`}
                  autoComplete="tel"
                />
              </div>
              {vErrors.phone && (
                <div className="flex items-center gap-1 text-[11px] text-error mt-1 font-semibold text-start">
                  <AlertCircle size={11} className="shrink-0" />
                  <span>{vErrors.phone}</span>
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
                <span>{isArabic ? 'إنشاء الحساب مجانًا' : 'Create Free Account'}</span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-4">
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
          <div className="flex justify-center mb-4">
            <GoogleAuthButton
              onSuccess={(token) => googleRegisterMutate(token)}
              isPending={googlePending}
              text={isArabic ? 'التسجيل باستخدام Google' : 'Sign up with Google'}
            />
          </div>

          {/* Switch to Login */}
          <p className="text-center text-xs text-base-content/70 font-medium">
            {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
            <Link to={loginLink} className="text-primary font-bold hover:underline transition-all">
              {isArabic ? 'تسجيل الدخول' : 'Sign In'}
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
      <AuthShowcasePanel mode="register" claimedPortfolio={claimedPortfolio} isArabic={isArabic} />
    </div>
  );
}

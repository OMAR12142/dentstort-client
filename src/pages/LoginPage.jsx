import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useLogin, useGoogleLogin } from '../hooks/useAuth';
import { useThemeStore } from '../store/themeStore';
import AppLogo from '../components/AppLogo';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function LoginPage() {
  const { mutate, isPending, error } = useLogin();
  const { mutate: googleLoginMutate, isPending: googlePending, error: googleError } = useGoogleLogin();
  const [showPw, setShowPw] = useState(false);
  const [vErrors, setVErrors] = useState({});
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get('email')?.trim();
    const password = fd.get('password');

    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';

    if (Object.keys(errs).length) {
      setVErrors(errs);
      return;
    }

    setVErrors({});
    mutate({ email, password });
  };

  return (
    <div className="h-dvh w-full bg-base-200 flex overflow-hidden">
      {/* Theme Toggle Button - Top Right */}
      <div className="fixed top-4 right-6 md:top-6 md:right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost text-secondary border border-[#E0DFDC] dark:border-[#38434F] bg-base-100/50 dark:bg-base-100/10 backdrop-blur-sm hover:bg-base-100/80 dark:hover:bg-base-100/20 shadow-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
        </motion.button>
      </div>

      {/* Left Column: Form */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-sm lg:w-96 max-h-full overflow-y-auto custom-scrollbar px-2"
        >
          {/* Branding */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <AppLogo size="lg" />
          </div>

          <h2 className="text-xl font-bold text-base-content tracking-tight">Welcome Back</h2>
          <p className="mt-1 text-[11px] text-base-content/70">
            Enter your credentials to access your account.
          </p>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] rounded-lg px-3 py-1.5 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle size={12} className="shrink-0" />
              {error.response?.data?.message || 'Login failed.'}
            </div>
          )}

          <div className="mt-5">
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-[10px] font-semibold text-base-content/80 mb-1">
                  Email Address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={13} className={vErrors.email ? 'text-error' : 'text-base-content/40'} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    onChange={() => vErrors.email && setVErrors((p) => ({ ...p, email: undefined }))}
                    className={`input input-bordered w-full pl-10 rounded-xl bg-base-200/50 border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs h-10 ${vErrors.email ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  />
                </div>
                {vErrors.email && (
                  <div className="flex items-center gap-1 text-[9px] text-error mt-0.5 font-medium">
                    <AlertCircle size={10} />
                    {vErrors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-base-content/80 mb-1">
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={13} className={vErrors.password ? 'text-error' : 'text-base-content/40'} />
                  </div>
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    onChange={() => vErrors.password && setVErrors((p) => ({ ...p, password: undefined }))}
                    className={`input input-bordered w-full pl-10 pr-10 rounded-xl bg-base-200/50 border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary transition-all text-xs h-10 ${vErrors.password ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {vErrors.password && (
                  <div className="flex items-center gap-1 text-[9px] text-error mt-0.5 font-medium">
                    <AlertCircle size={10} />
                    {vErrors.password}
                  </div>
                )}
                <div className="flex justify-end mt-1">
                  <a href="#" className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot Password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || googlePending}
                className="btn w-full h-10 rounded-xl text-white text-xs font-bold border-0 bg-primary hover:bg-primary/90 mt-2 shadow-sm transition-all active:scale-[0.98]"
              >
                {isPending ? <span className="loading loading-spinner loading-xs" /> : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-light/50"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-bold">
                <span className="bg-base-200 px-3 text-base-content/40">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleAuthButton
                onSuccess={(token) => googleLoginMutate(token)}
                isPending={googlePending}
                text="Sign in with Google"
              />
            </div>

            <p className="text-center text-[11px] text-base-content/70 mt-5 pb-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline transition-all">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Hero Image Branding */}
      <div className="hidden lg:block lg:flex-1 relative bg-base-100 overflow-hidden border-l border-neutral-light">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src="/dental-bg.png"
            alt="Clinic Hero"
          />
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 p-12 text-white"
        >
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold tracking-tight mb-4 text-white">
              "Managing patients cases and financials has never been this seamless."
            </h3>
            <p className="text-lg text-white/80 font-medium opacity-90">
              Streamline patient care and financial management—all in one seamless workflow.            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-base-100/10 backdrop-blur-sm border border-base-100/20 flex items-center justify-center font-bold text-base-100">

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

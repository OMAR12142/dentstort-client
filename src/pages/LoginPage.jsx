import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useLogin } from '../hooks/useAuth';
import { useThemeStore } from '../store/themeStore';
import AppLogo from '../components/AppLogo';

export default function LoginPage() {
  const { mutate, isPending, error } = useLogin();
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
          className="w-full max-w-sm lg:w-96"
        >
          {/* Branding */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <AppLogo size="xl" />
          </div>

          <h2 className="text-2xl font-bold text-base-content tracking-tight">Welcome back</h2>
          <p className="mt-1 text-xs text-base-content/70">
            Please enter your details to sign in to your account.
          </p>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg px-3 py-2 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              {error.response?.data?.message || 'Login failed'}
            </div>
          )}

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div>
                <label className="block text-xs font-medium text-base-content/80 mb-1">
                  Email address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={14} className={vErrors.email ? 'text-error' : 'text-base-content/40'} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="omar@gmail.com"
                    onChange={() => vErrors.email && setVErrors((p) => ({ ...p, email: undefined }))}
                    className={`input input-bordered w-full pl-10 rounded-lg bg-base-200 border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-xs h-10 ${vErrors.email ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  />
                </div>
                {vErrors.email && (
                  <div className="flex items-center gap-1 text-xs text-error mt-0.5">
                    <AlertCircle size={12} />
                    {vErrors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-base-content/80 mb-1">
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={14} className={vErrors.password ? 'text-error' : 'text-base-content/40'} />
                  </div>
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    onChange={() => vErrors.password && setVErrors((p) => ({ ...p, password: undefined }))}
                    className={`input input-bordered w-full pl-10 pr-10 rounded-lg bg-base-200 border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-xs h-10 ${vErrors.password ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content/70 transition-colors"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {vErrors.password && (
                  <div className="flex items-center gap-1 text-xs text-error mt-0.5">
                    <AlertCircle size={12} />
                    {vErrors.password}
                  </div>
                )}
                <div className="flex justify-end mt-1">
                  <a href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn w-full h-12 rounded-lg text-white text-base font-bold border-0 bg-primary hover:bg-primary/90 mt-3 shadow-none"
              >
                {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Log In'}
              </button>
            </form>


            <p className="text-center text-xs text-base-content/70 mt-4 pb-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline transition-all">
                Sign up free
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

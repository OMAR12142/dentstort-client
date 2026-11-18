import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Sun, Moon, Share2, Check, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import AppLogo from '../AppLogo';
import LanguageSwitcher from '../LanguageSwitcher';

export default function PublicNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('portfolio');
  const token = useAuthStore((s) => s.accessToken);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPortfolioPage = location.pathname.startsWith('/portfolio/');
  const portfolioSlugMatch = location.pathname.match(/^\/portfolio\/([^/]+)/);
  const portfolioSlug = portfolioSlugMatch ? portfolioSlugMatch[1] : null;

  const navLinks = isPortfolioPage ? [] : [
    { name: 'How it Works', href: '/#how-it-works' },
    { name: 'Features', href: '/#features' },
    { name: 'Doctor Portfolio', href: '/#portfolio' },
    { name: 'Support', href: '/#feedback' },
  ];

  const handleSharePortfolio = async () => {
    const shareUrl = portfolioSlug
      ? `${window.location.origin}/portfolio/${portfolioSlug}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable in insecure contexts
    }
  };

  const handleContactScroll = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (portfolioSlug) {
      navigate(`/portfolio/${portfolioSlug}#contact`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-base-200/85 backdrop-blur-xl border-b border-neutral-light transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-2 font-sans">
        
        {/* Brand Area */}
        <div className="flex items-center shrink-0">
          <Link to="/" className="flex items-center group">
            <AppLogo size="sm" className="group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Center Nav Links (Marketing / Landing routes only) */}
        {!isPortfolioPage && (
          <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/60 hover:text-primary transition-all relative group/link"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/link:w-full" />
              </a>
            ))}
          </div>
        )}

        {/* Right Section / Action Hub */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Toggle (Desktop & Mobile) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 sm:p-2.5 rounded-xl bg-base-100 border border-neutral-light text-base-content/70 hover:text-primary hover:border-primary/40 transition-all cursor-pointer shrink-0"
          >
            {isDark ? <Sun size={17} className="text-yellow-500" /> : <Moon size={17} />}
          </button>

          {isPortfolioPage ? (
            <>
              <LanguageSwitcher className="flex bg-base-100 border border-neutral-light text-base-content/80 hover:text-primary hover:border-primary/40 px-2 sm:px-2.5 shrink-0" />

              {/* Share Portfolio (Copy Link) */}
              <button
                type="button"
                onClick={handleSharePortfolio}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all cursor-pointer shrink-0"
                aria-label={t('public.sharePortfolio')}
              >
                {copied ? <Check size={15} className="text-success" /> : <Share2 size={15} />}
                <span className="hidden md:inline">
                  {copied ? t('public.copied') : t('public.sharePortfolio')}
                </span>
              </button>

              {/* Smooth-Scroll Contact CTA */}
              <button
                type="button"
                onClick={handleContactScroll}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-content hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <MessageCircle size={15} />
                <span>{t('public.contact')}</span>
              </button>
            </>
          ) : (
            <>
              <LanguageSwitcher className="hidden sm:flex text-base-content/70 hover:text-base-content" />

              <div className="hidden sm:flex items-center gap-1 bg-base-100 p-1.5 rounded-2xl border border-neutral-light shadow-inner">
                {token ? (
                  <Link
                    to="/dashboard"
                    className="px-6 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-primary text-primary-content border-0 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 rounded-xl transition-all flex items-center gap-2"
                  >
                    Dashboard <ArrowRight size={14} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-5 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-base-content/70 hover:text-primary transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="px-7 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-primary text-primary-content border-0 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 rounded-xl transition-all"
                    >
                      Join Free
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile CTA Pill */}
              {!token && (
                <Link
                  to="/register"
                  className="sm:hidden px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-content rounded-xl"
                >
                  Start Free
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <div className="flex items-center gap-2 lg:hidden">
                <LanguageSwitcher className="text-base-content" />
                {navLinks.length > 0 && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2.5 text-base-content bg-base-100 rounded-xl border border-neutral-light outline-none"
                    aria-label="Toggle navigation menu"
                  >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay (Landing routes only) */}
      <AnimatePresence>
        {!isPortfolioPage && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-base-200 border-t border-neutral-light p-6 space-y-4 overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-xs font-black uppercase tracking-[.15em] text-base-content hover:bg-primary/5 rounded-xl transition-all flex items-center justify-between group"
                >
                  {link.name}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </a>
              ))}
            </div>
            
            {!token && (
              <div className="flex flex-col gap-3 pt-4 border-t border-neutral-light">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest text-base-content text-center border border-neutral-light rounded-2xl hover:bg-base-100 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest bg-primary text-primary-content text-center rounded-2xl active:scale-95 transition-all"
                >
                  Get Started for Free
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

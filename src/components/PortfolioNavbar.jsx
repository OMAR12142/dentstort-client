import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MessageCircle, ArrowLeft, Sun, Moon, Share2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';
import AppLogo from './AppLogo';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * PortfolioNavbar — Specialized navigation for public clinical portfolios.
 * Focusing on "Verified Professional" branding, sharing, and patient conversion.
 */
export default function PortfolioNavbar({ isCaseView = false }) {
  const { t } = useTranslation('portfolio');
  const { isDark, toggleTheme } = useThemeStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = slug ? `${window.location.origin}/portfolio/${slug}` : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (slug) {
      navigate(`/portfolio/${slug}#contact`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-base-200/85 backdrop-blur-xl border-b border-neutral-light px-2.5 sm:px-6 h-14 sm:h-16 transition-colors duration-300 w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-1.5 sm:gap-2.5 min-w-0">
        {/* ── Start Side: Back or Branding ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {isCaseView ? (
            <Link
              to={`/portfolio/${slug}`}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-base-content/70 hover:text-primary transition-colors group"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-base-100 border border-neutral-light flex items-center justify-center group-hover:bg-primary/10 transition-all shrink-0">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rtl:rotate-180" />
              </div>
              <span className="hidden sm:inline truncate">{t('navbar.backToProfile')}</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 group shrink-0 scale-[0.82] sm:scale-100 origin-left rtl:origin-right">
              <AppLogo size="sm" className="w-24 sm:w-28 md:w-32" />
              <div className="h-6 w-[1px] bg-neutral-light hidden md:block mx-1" />
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-lg border border-primary/20">
                <ShieldCheck size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-tight">
                  {t('navbar.verifiedPortfolio')}
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* ── End Side: Tools & Actions ── */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-7 h-7 sm:w-9 sm:h-9 p-0 flex items-center justify-center rounded-lg sm:rounded-xl bg-base-100 border border-neutral-light text-base-content/70 hover:text-primary transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          <LanguageSwitcher className="h-7 sm:h-9 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold bg-base-100 border border-neutral-light shrink-0" />

          <button
            type="button"
            onClick={handleShare}
            className="w-7 h-7 sm:w-9 sm:h-9 md:w-auto md:h-9 p-0 md:px-3 inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl text-xs font-bold bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all cursor-pointer shrink-0"
            aria-label={t('public.sharePortfolio')}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
            ) : (
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden md:inline">{copied ? t('public.copied') : t('public.sharePortfolio')}</span>
          </button>

          <button
            type="button"
            onClick={handleContact}
            className="h-7 sm:h-9 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 bg-primary text-primary-content rounded-lg sm:rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span>{t('public.contact')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

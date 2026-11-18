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
    <nav className="sticky top-0 z-50 bg-base-200/85 backdrop-blur-xl border-b border-neutral-light px-3 sm:px-4 h-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-1.5 sm:gap-2">
        {/* ── Start Side: Back or Branding ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {isCaseView ? (
            <Link
              to={`/portfolio/${slug}`}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-base-content/70 hover:text-primary transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-base-100 border border-neutral-light flex items-center justify-center group-hover:bg-primary/10 transition-all shrink-0">
                <ArrowLeft size={16} className="rtl:rotate-180" />
              </div>
              <span className="hidden sm:inline truncate">{t('navbar.backToProfile')}</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <AppLogo size="sm" className="w-28 sm:w-32" />
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-base-100 border border-neutral-light text-base-content/70 hover:text-primary transition-colors cursor-pointer shrink-0"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} className="text-yellow-500" /> : <Moon size={17} />}
          </button>

          <LanguageSwitcher className="bg-base-100 border border-neutral-light shrink-0 px-2 sm:px-2.5" />

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all cursor-pointer shrink-0"
            aria-label={t('public.sharePortfolio')}
          >
            {copied ? <Check size={15} className="text-success" /> : <Share2 size={15} />}
            <span className="hidden md:inline">{copied ? t('public.copied') : t('public.sharePortfolio')}</span>
          </button>

          <button
            type="button"
            onClick={handleContact}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-primary text-primary-content text-xs font-bold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <MessageCircle size={15} />
            <span>{t('public.contact')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

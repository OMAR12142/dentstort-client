import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import AppLogo from './AppLogo';

/**
 * PortfolioNavbar — Specialized navigation for public clinical portfolios.
 * Focusing on "Verified Professional" branding and patient conversion.
 */
export default function PortfolioNavbar({ dentistName, isCaseView = false }) {
  const { isDark, toggleTheme } = useThemeStore();
  const { slug } = useParams();

  return (
    <nav className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-content/5 px-4 h-16 sm:h-18">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* ── Left Side: Back or Branding ── */}
        <div className="flex items-center gap-4">
          {isCaseView ? (
            <Link 
              to={`/portfolio/${slug}`}
              className="flex items-center gap-2 text-sm font-bold text-base-content/70 hover:text-primary transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                <ArrowLeft size={16} />
              </div>
              <span className="hidden sm:inline">Back to Profile</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 group">
              <AppLogo size="sm" />
              <div className="h-6 w-[1px] bg-base-content/10 hidden sm:block mx-1"></div>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">
                <ShieldCheck size={12} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Verified Portfolio</span>
              </div>
            </Link>
          )}
        </div>

        {/* ── Right Side: Action & Tools ── */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-base-content animate-in fade-in duration-500"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link 
            to={`/portfolio/${slug}#contact`}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            <MessageCircle size={16} className="hidden xs:block" />
            <span>Consult Doctor</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';

/**
 * Language Switcher Toggle
 * Compact EN/AR toggle button with smooth animation
 */
export default function LanguageSwitcher({ className = '' }) {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className={`relative flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl text-base-content/80 hover:bg-base-200 transition-colors cursor-pointer ${className.includes('px-') ? '' : 'px-2 sm:px-2.5'} ${className.includes('py-') || className.includes('h-') ? '' : 'py-1 sm:py-1.5'} ${className}`}
      title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 hidden min-[400px]:inline-block" />
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide shrink-0"
      >
        {language === 'en' ? 'AR' : 'EN'}
      </motion.span>
    </button>
  );
}

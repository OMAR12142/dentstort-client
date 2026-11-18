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
      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-base-content/80 hover:bg-base-200 transition-colors ${className}`}
      title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
      aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <Languages size={18} />
      <motion.span
        key={language}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="text-xs font-bold uppercase tracking-wide"
      >
        {language === 'en' ? 'AR' : 'EN'}
      </motion.span>
    </button>
  );
}

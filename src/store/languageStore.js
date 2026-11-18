import { create } from 'zustand';
import i18n from '../i18n';

/**
 * Global Language Store (Zustand)
 * - Persists to localStorage (key: dentstory-lang)
 * - Toggles between English (LTR) and Arabic (RTL)
 * - Syncs with i18next on change
 */
export const useLanguageStore = create((set) => {
  const initLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem('dentstory-lang');
    if (stored && (stored === 'en' || stored === 'ar')) return stored;
    return 'en'; // Default to English
  };

  const applyLanguage = (lang) => {
    if (typeof document === 'undefined') return;
    const isArabic = lang === 'ar';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
    localStorage.setItem('dentstory-lang', lang);
  };

  // Apply initial language
  const initialLang = initLanguage();
  // Defer applying until after i18n is ready
  if (typeof window !== 'undefined') {
    setTimeout(() => applyLanguage(initialLang), 0);
  }

  return {
    language: initialLang,
    isArabic: initialLang === 'ar',

    setLanguage: (lang) => {
      set({ language: lang, isArabic: lang === 'ar' });
      applyLanguage(lang);
    },

    toggleLanguage: () => {
      set((state) => {
        const newLang = state.language === 'en' ? 'ar' : 'en';
        applyLanguage(newLang);
        return { language: newLang, isArabic: newLang === 'ar' };
      });
    },
  };
});

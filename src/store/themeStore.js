import { create } from 'zustand';

/**
 * Global Theme Store (Zustand)
 * - Persists to localStorage
 * - Applied to <html> tag on load
 * - Accessible across all routes (public & protected)
 * - DEFAULT: Dark Mode
 */
export const useThemeStore = create((set) => {
  // Initialize theme from localStorage or default to DARK
  const initTheme = () => {
    if (typeof window === 'undefined') return true; // SSR: default to dark
    
    const stored = localStorage.getItem('dentstore-theme');
    if (stored) return stored === 'dark';
    
    // Default to DARK mode (changed from system preference)
    return true;
  };

  // Apply theme to DOM
  const applyTheme = (isDark) => {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  };

  return {
    isDark: initTheme(),

    setIsDark: (isDark) => {
      set({ isDark });
      localStorage.setItem('dentstore-theme', isDark ? 'dark' : 'light');
      applyTheme(isDark);
    },

    toggleTheme: () => {
      set((state) => {
        const newIsDark = !state.isDark;
        localStorage.setItem('dentstore-theme', newIsDark ? 'dark' : 'light');
        applyTheme(newIsDark);
        return { isDark: newIsDark };
      });
    },
  };
});

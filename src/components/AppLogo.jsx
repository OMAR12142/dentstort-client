/**
 * AppLogo — switches between dark/light logo based on current theme.
 *
 * Props:
 *   size  – 'sm' (32px) | 'md' (40px) | 'lg' (48px) | 'xl' (64px)
 *   className – extra classes
 */

import logoLight from '../assets/dentstory logo-512.png';
import logoDark from '../assets/dark dentstory logo-512.png';

import { useThemeStore } from '../store/themeStore';

const sizes = {
  sm: 'h-8 w-32',
  md: 'h-10 w-40',
  lg: 'h-12 w-48',
  xl: 'h-16 w-64',
};

export default function AppLogo({ size = 'md', className = '', forceTheme }) {
  const isDarkStore = useThemeStore((s) => s.isDark);
  const isDark = forceTheme ? (forceTheme === 'dark') : isDarkStore;

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      <img
        src={logoLight}
        alt="DentStory"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isDark ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        draggable={false}
      />
      <img
        src={logoDark}
        alt="DentStory"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        draggable={false}
      />
    </div>
  );
}

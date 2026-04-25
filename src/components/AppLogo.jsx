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

export default function AppLogo({ size = 'md', className = '' }) {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <img
      src={isDark ? logoDark : logoLight}
      alt="DentStory"
      className={`${sizes[size]} object-contain transition-opacity duration-200 ${className}`}
      draggable={false}
    />
  );
}

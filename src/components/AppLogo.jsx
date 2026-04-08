/**
 * AppLogo — switches between dark/light logo based on current theme.
 *
 * Props:
 *   size  – 'sm' (32px) | 'md' (40px) | 'lg' (48px) | 'xl' (64px)
 *   className – extra classes
 */

// Light-mode logo (used when isDark = false)
const logoLight = new URL('../assets/dentstory logo-512.png', import.meta.url).href;
// Dark-mode logo (used when isDark = true)
const logoDark = new URL('../assets/dark dentstory logo-512.png', import.meta.url).href;

import { useThemeStore } from '../store/themeStore';

const sizes = {
  sm: 'h-12 w-auto',
  md: 'h-18 w-auto',
  lg: 'h-24 w-auto',
  xl: 'h-36 w-auto',
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

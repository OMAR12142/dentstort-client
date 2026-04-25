import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Sun, Moon, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useLogout } from '../hooks/useAuth';
import AppLogo from './AppLogo';

export default function TopHeader({ setMobileOpen }) {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { mutate: logout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full h-[72px] bg-base-100 border-b border-neutral-light shadow-sm px-4 flex items-center justify-between">
      
      {/* ── Left side: Hamburger & Logo ── */}
      <div className="flex items-center gap-2">
        {/* Mobile Hamburger (lg:hidden) */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 text-base-content/80 hover:bg-base-200 rounded-xl transition-colors"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>

        {/* Global Logo */}
        <Link to="/dashboard" className="hidden lg:flex items-center gap-2 ml-1 lg:ml-2">
          <AppLogo size="md" />
        </Link>
      </div>

      {/* ── Right side: Theme & Dropdown ── */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 rounded-xl text-base-content/80 hover:bg-base-200 transition-colors"
          title="Toggle Theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Vertical Divider */}
        <div className="w-[1px] h-6 bg-neutral-light mx-1 hidden sm:block"></div>

        {/* User Dropdown Profile Workspace */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1 sm:pr-3 rounded-full hover:bg-base-200 transition-colors"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              {user?.profilePhoto?.url ? (
                <img src={user.profilePhoto.url} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'D'}
                </span>
              )}
            </div>
            
            {/* Name & Role (Hidden on very small screens) */}
            <div className="hidden sm:flex flex-col items-start px-1 pointer-events-none">
              <span className="text-sm font-semibold text-base-content leading-none">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[11px] text-base-content/50 font-medium mt-1">
                {user?.role === 'admin' ? 'Admin' : 'Dentist'}
              </span>
            </div>

            {/* Chevron */}
            <ChevronDown size={14} className={`text-base-content/50 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 bg-base-100 border border-neutral-light rounded-xl shadow-xl overflow-hidden py-2"
              >
                {/* Mobile-only name display inside dropdown */}
                <div className="sm:hidden px-4 py-3 border-b border-neutral-light/50 mb-2">
                  <p className="text-sm font-bold text-base-content truncate">{user?.name}</p>
                  <p className="text-xs text-base-content/60 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-base-content/80 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <Settings size={18} />
                  Account Settings
                </Link>

                <div className="h-[1px] bg-neutral-light/50 my-1"></div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

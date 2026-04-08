import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import AppLogo from '../components/AppLogo';

// ── Admin sidebar navigation items ────────────
const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/revenue', icon: DollarSign, label: 'Revenue', end: false },
  { to: '/admin/dentists', icon: Users, label: 'Dentists', end: false },
];

function SidebarLink({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm md:text-base font-medium ${
          isActive
            ? 'bg-primary/10 text-primary shadow-none'
            : 'text-base-content/70 hover:text-base-content hover:bg-base-100'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const { mutate: logout } = useLogout();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-base-200 text-base-content transition-colors duration-200">
      {/* ─── Mobile Header ─── */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-neutral-light bg-base-200 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <span className="text-xs font-semibold text-primary">Super Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-base-content hover:bg-base-100 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-base-content hover:bg-base-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ─── Mobile Slide-down Nav ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden overflow-hidden border-b border-neutral-light bg-base-200 px-4 pb-3"
          >
            <div className="flex flex-col gap-1 pt-1">
              {adminNavItems.map((item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-base-200 border-r border-neutral-light px-4 py-6 fixed h-full z-40">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2 mb-6 lg:mb-8">
          <AppLogo size="md" />
          <span className="text-xs font-semibold text-primary">Super Admin</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {adminNavItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-neutral-light pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-base-content truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2 px-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-2.5 rounded-lg text-base-content hover:bg-base-100 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => logout()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 md:ml-64 relative overflow-x-hidden min-w-0 bg-base-100 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  TrendingUp,
  ListTodo,
  ArrowLeft,
} from 'lucide-react';
import { useLogout } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useSuspensionGuard, SuspensionOverlay } from '../hooks/useSuspensionGuard';
import AppLogo from '../components/AppLogo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clinics', icon: Building2, label: 'Clinics' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Earnings' },
  { to: '/career-analytics', icon: TrendingUp, label: 'Career' },
];

function SidebarLink({ to, icon: Icon, label }) {
  const location = useLocation();
  const basePath = location.pathname.replace(/\/$/, '') || '/';
  const isActive = basePath === to;

  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm md:text-base font-medium ${isActive
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

export default function MainLayout() {
  const { mutate: logout } = useLogout();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  // Handle potential trailing slashes for robust route checking
  const basePath = location.pathname.replace(/\/$/, '') || '/';
  const rootPaths = ['/dashboard', '/clinics', '/patients', '/tasks', '/analytics', '/career-analytics', '/'];
  const showBackButton = !rootPaths.includes(basePath);

  // ── Real-time suspension detection ──────────
  const isSuspended = useSuspensionGuard();

  return (
    <div className="min-h-screen flex bg-base-200 text-base-content transition-colors duration-200">
      {/* Suspension overlay — renders on top of everything */}
      {isSuspended && <SuspensionOverlay />}
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-base-200 border-r border-neutral-light px-4 py-6 fixed h-full z-40">
        {/* Branding */}
        <div className="flex items-center px-2 mb-4 md:mb-6 lg:mb-8 hover:opacity-80 transition-opacity">
          <Link to="/dashboard">
            <AppLogo size="md" />
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-neutral-light pt-4 mt-4">
          <div className="flex items-center gap-3 px-4 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-base-content truncate">
                {user?.name || 'Dentist'}
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
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-6 relative">
        {/* Mobile Header with Theme Toggle */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-light bg-base-200">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Link to="/dashboard">
              <AppLogo size="sm" />
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-base-content bg-base-200 hover:bg-base-300 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-4 lg:p-4 sm:p-6 md:p-8 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-base-200/90 backdrop-blur-lg border-t border-neutral-light z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-[11px] font-medium transition-colors duration-200 min-w-[56px] ${isActive ? 'text-primary' : 'text-base-content/60'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, BarChart3, TrendingUp, ListTodo, Briefcase, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useLayoutStore } from '../store/layoutStore';
import AppLogo from './AppLogo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clinics', icon: Building2, label: 'Clinics' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/analytics', icon: BarChart3, label: 'Earnings' },
  { to: '/career-analytics', icon: TrendingUp, label: 'Career' },
  { to: '/portfolio/manage', icon: Briefcase, label: 'Portfolio' },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { isSidebarExpanded, toggleSidebar } = useLayoutStore();
  const location = useLocation();

  // On route change, close mobile sidebar automatically
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  // Framer Motion variants
  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 80 },
  };

  const mobileSidebarVariants = {
    closed: { x: '-100%', transition: { type: 'tween', duration: 0.3 } },
    open: { x: 0, transition: { type: 'tween', duration: 0.3 } },
  };

  const labelVariants = {
    expanded: { opacity: 1, x: 0, display: 'block', transition: { duration: 0.2, delay: 0.1 } },
    collapsed: { opacity: 0, x: -10, transition: { duration: 0.2 }, transitionEnd: { display: 'none' } },
  };

  const navItemClass = (isActive, expanded) => `
    relative flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200
    ${expanded ? 'justify-start' : 'justify-center'}
    ${isActive 
      ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
      : 'text-base-content/60 hover:text-base-content hover:bg-base-200'}
  `;

  const renderNavLinks = (expanded) => (
    <nav className="flex flex-col gap-2 p-3">
      {navItems.map((item) => {
        const isActive = location.pathname.replace(/\/$/, '') === item.to || (item.to === '/' && location.pathname === '/');
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={!expanded ? item.label : undefined}
            className={navItemClass(isActive, expanded)}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md"
                initial={false}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon size={expanded ? 20 : 22} className={isActive ? 'text-primary' : 'text-base-content/60'} />
            <motion.span
              variants={labelVariants}
              initial={expanded ? 'expanded' : 'collapsed'}
              animate={expanded ? 'expanded' : 'collapsed'}
              className="font-semibold text-[15px] whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-base-neutral/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              variants={mobileSidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-base-100 border-r border-neutral-light shadow-2xl z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 h-[72px] border-b border-neutral-light/50 shrink-0">
                <AppLogo size="md" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors text-base-content/70"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
                {renderNavLinks(true)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sticky Sidebar (Sits under TopHeader) ─── */}
      {/* 
        Note: The wrapper layout puts this below the header. 
        So top-0 is removed, and it uses height tracking flex-grow.
      */}
      <motion.aside
        variants={sidebarVariants}
        initial={isSidebarExpanded ? 'expanded' : 'collapsed'}
        animate={isSidebarExpanded ? 'expanded' : 'collapsed'}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className="hidden lg:flex flex-col relative bg-base-100 border-r border-neutral-light z-30 shadow-sm"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-base-100 border border-neutral-light rounded-full p-1.5 shadow-sm hover:bg-base-200 transition-colors z-50 text-base-content/50 hover:text-base-content"
        >
          {isSidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="flex flex-col flex-1 overflow-x-hidden overflow-y-auto no-scrollbar pt-6">
          {renderNavLinks(isSidebarExpanded)}
        </div>
      </motion.aside>
    </>
  );
}

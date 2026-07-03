import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Receipt, Briefcase, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/clinics', icon: Building2, label: 'Clinics' },
  { to: '/analytics', icon: BarChart3, label: 'Earnings' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/portfolio/manage', icon: Briefcase, label: 'Portfolio' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-slate-200 dark:border-base-content/10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] pb-safe">
      <nav className="flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          // Check if active (exact match or starts with path for nested routes like /patients/:id)
          const isActive = location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to + '/'));
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center w-full h-full text-center tap-highlight-transparent"
            >
              <div className={`flex flex-col items-center justify-center transition-colors duration-200 ${isActive ? 'text-primary' : 'text-base-content/50 hover:text-base-content/80'}`}>
                <item.icon size={22} className={`mb-1 transition-transform ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </div>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute top-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

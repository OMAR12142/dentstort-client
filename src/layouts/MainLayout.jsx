import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSuspensionGuard, SuspensionOverlay } from '../hooks/useSuspensionGuard';
import TopHeader from '../components/TopHeader';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // ── Real-time suspension detection ──────────
  const isSuspended = useSuspensionGuard();

  return (
    <div className="h-screen w-full flex flex-col bg-base-200 text-base-content overflow-hidden font-sans">
      {isSuspended && <SuspensionOverlay />}

      {/* Global Top Navigation Bar */}
      <TopHeader setMobileOpen={setMobileOpen} />

      {/* Main App Canvas underneath Header */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Navigation Sidebar (Desktop stays flex, Mobile relies on Sidebar overlay) */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

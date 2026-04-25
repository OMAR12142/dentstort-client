import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';
import PublicFooter from '../components/common/PublicFooter';

/**
 * PortfolioLayout — A clean, minimal layout for public portfolio pages.
 * Integrates the main platform's Nav and Footer for consistent branding.
 */
export default function PortfolioLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      {/* Integrated Main Navbar */}
      <PublicNavbar />

      {/* ── Page Content ── */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Integrated Main Footer */}
      <PublicFooter />
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AppLogo from '../AppLogo';

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.accessToken);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCTA = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const isPortfolioPage = location.pathname.includes('/portfolio/');
  const navLinks = isPortfolioPage ? [] : [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Contact', href: '/#feedback' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-xl border-b border-[#E0DFDC] dark:border-[#3A3A3A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <AppLogo size="sm" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[#191919] dark:text-white hover:text-[#0A66C2] transition-colors font-medium text-sm"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Section / Actions */}
        <div className="flex items-center gap-2">
          {token ? (
            <Link
              to="/dashboard"
              className="px-4 py-1.5 sm:px-6 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#0A66C2]/20"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0A66C2] hover:bg-[#0A66C2]/5 rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 sm:px-5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-[#0A66C2] text-white border-0 hover:bg-[#0A66C2]/90 rounded-xl transition-all shadow-lg shadow-[#0A66C2]/20"
              >
                Join Free
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle — Only if there are links to show */}
          {navLinks.length > 0 && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#191919] dark:text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#252525] border-t border-[#E0DFDC] dark:border-[#3A3A3A] p-4 space-y-3 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-[#191919] dark:text-white hover:text-[#0A66C2] font-medium"
              >
                {link.name}
              </a>
            ))}
            {!token && (
              <div className="flex gap-2 pt-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-bold text-[#0A66C2] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-lg hover:bg-[#0A66C2]/5 transition-colors flex-1 text-center"
                >
                  Log In
                </Link>
                <button
                  onClick={handleCTA}
                  className="px-4 py-2.5 text-sm font-bold bg-[#0A66C2] text-white rounded-lg hover:bg-[#0A66C2]/90 transition-colors flex-1"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

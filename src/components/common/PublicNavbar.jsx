import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
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
    { name: 'Showcase', href: '/#cases-section' },
    { name: 'Support', href: '/#feedback' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between font-sans">
        
        {/* Brand Area */}
        <div className="flex-1 flex items-center">
          <Link to="/" className="flex items-center group">
            <AppLogo size="sm" forceTheme="dark" className="group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-all relative group/link"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/link:w-full" />
            </a>
          ))}
        </div>

        {/* Right Section / Action Hub */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <div className="hidden sm:flex items-center gap-1 bg-[#252525] p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {token ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-primary text-white border-0 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 rounded-xl transition-all flex items-center gap-2"
              >
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-7 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-primary text-white border-0 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 rounded-xl transition-all"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile CTA Pill */}
          {!token && (
            <Link
              to="/register"
              className="sm:hidden px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-xl"
            >
              Start Free
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          {navLinks.length > 0 && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 text-white bg-[#252525] rounded-xl border border-white/5 outline-none"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1A1A1A] border-t border-white/5 p-6 space-y-4 overflow-hidden shadow-2xl"
          >
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-xs font-black uppercase tracking-[.15em] text-white hover:bg-primary/5 rounded-xl transition-all flex items-center justify-between group"
                >
                  {link.name}
                  <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </a>
              ))}
            </div>
            
            {!token && (
              <div className="flex flex-col gap-3 pt-4 border-t border-base-content/5">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest text-white text-center border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-xs font-black uppercase tracking-widest bg-primary text-white text-center rounded-2xl active:scale-95 transition-all"
                >
                  Get Started for Free
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

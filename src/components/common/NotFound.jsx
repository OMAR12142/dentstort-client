import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Home } from 'lucide-react';
import Card from '../Card';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
      {/* Massive subtle background 404 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden h-full">
        <span className="text-[300px] md:text-[400px] font-black text-base-content/[0.03] tracking-tighter leading-none">
          404
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="text-center p-8 sm:p-10 border-neutral-light bg-base-100/95 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-base-200 flex items-center justify-center mb-6 border border-neutral-light"
          >
            <Search size={48} className="text-secondary" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-base-content tracking-tight mb-2">
            Page Not Found
          </h1>
          <p className="text-base-content/70 text-sm mb-8 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline btn-primary font-semibold rounded-lg flex-1 gap-2 border-neutral-light"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link
              to="/"
              className="btn btn-primary text-white border-0 shadow-none rounded-lg font-semibold flex-1 gap-2"
            >
              <Home size={18} />
              Dashboard
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, AlertCircle, CheckCircle, Bell, ExternalLink } from 'lucide-react';
import { useActiveAnnouncement } from '../hooks/useAdmin';

export default function AnnouncementBanner() {
  const { data: active, isLoading } = useActiveAnnouncement();
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (active && active.type === 'banner') {
      const storageKey = `dismissed_announcement_${active._id}`;
      
      if (active.displayFrequency === 'always') {
        setIsVisible(true);
        return;
      }

      if (active.displayFrequency === 'once') {
        const dismissed = localStorage.getItem(storageKey);
        if (!dismissed) setIsVisible(true);
        return;
      }

      const dismissed = sessionStorage.getItem(storageKey);
      if (!dismissed) setIsVisible(true);
    }
  }, [active]);

  const handleDismiss = (e) => {
    e.stopPropagation(); // Don't trigger modal
    setIsVisible(false);
    if (!active?._id) return;

    const storageKey = `dismissed_announcement_${active._id}`;
    if (active.displayFrequency === 'once') {
      localStorage.setItem(storageKey, 'true');
    } else if (active.displayFrequency === 'session') {
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  if (isLoading || !active || !isVisible || active.type !== 'banner') return null;

  const getStyles = (severity) => {
    switch (severity) {
      case 'success': return { bg: 'bg-emerald-500', icon: <CheckCircle size={14} /> };
      case 'warning': return { bg: 'bg-amber-500', icon: <AlertTriangle size={14} /> };
      case 'error': return { bg: 'bg-rose-500', icon: <AlertCircle size={14} /> };
      default: return { bg: 'bg-[#0A66C2]', icon: <Bell size={14} /> };
    }
  };

  const styles = getStyles(active.severity);

  return (
    <>
      <AnimatePresence>
        <motion.div
           initial={{ height: 0 }}
           animate={{ height: 'auto' }}
           exit={{ height: 0 }}
           className={`w-full overflow-hidden relative z-[60] border-b border-white/10 ${styles.bg}`}
           onMouseEnter={() => setIsPaused(true)}
           onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center h-10 relative">
            {/* Ticker Content */}
            <motion.div
              className="flex items-center whitespace-nowrap cursor-pointer hover:underline decoration-white/30 decoration-2 underline-offset-4"
              onClick={() => setShowModal(true)}
              animate={isPaused ? {} : { x: [0, -1000] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 px-12 text-white">
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 bg-white/20 p-1 rounded-md">{styles.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{active.title}:</span>
                    <span className="text-xs font-bold tracking-wide">{active.content}</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Static Close Button Overlay */}
            <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center bg-inherit shadow-[-20px_0_20px_-5px_rgba(0,0,0,0.1)]">
               <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/20 rounded-full text-white transition-all"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-base-content/5 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-2 ${styles.bg}`} />
              
              <div className="flex justify-between items-start mb-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${styles.bg} text-white`}>
                    {styles.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-base-content uppercase tracking-widest">{active.title}</h2>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Clinical Announcement</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-base-200 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-base-200/50 p-6 rounded-3xl mb-6">
                <p className="text-base text-base-content font-medium leading-relaxed italic">
                  "{active.content}"
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                <span>DentStory Broadcast Hub</span>
                <span>{new Date(active.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className={`w-full py-4 rounded-2xl ${styles.bg} text-white text-xs font-black uppercase tracking-[0.2em] mt-8 hover:scale-[1.02] active:scale-95 transition-all shadow-lg`}
              >
                Acknowledge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A Floating Action Button (FAB) that only appears on mobile screens.
 * Designed to be placed at the bottom right, above the BottomNav.
 */
export default function MobileFAB({ onClick, icon: Icon, label, show = true, colorClass = "bg-primary text-primary-content" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          // lg:hidden -> only visible on mobile
          // bottom-20 -> sits right above the 16px (64px height) BottomNav + some padding
          className={`lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-colors ${colorClass}`}
          aria-label={label}
        >
          {Icon && <Icon size={24} strokeWidth={2.5} />}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

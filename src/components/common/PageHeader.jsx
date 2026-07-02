import React from 'react';
import { motion } from 'framer-motion';

export default function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  actionComponent, 
  badgeText 
}) {
  return (
    <div className="relative mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-neutral-light/40">
      <div className="space-y-1.5">
        {badgeText && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md mb-1"
          >
            {badgeText}
          </motion.div>
        )}
        
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon size={26} strokeWidth={2.5} className="text-primary" />
          )}
          {!Icon && (
            <div className="w-1.5 h-7 bg-primary rounded-full" />
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            {title}
          </h1>
        </div>
        
        {subtitle && (
          <div className="text-base-content/60 text-sm font-medium ml-1 lg:ml-4 flex items-center gap-2 max-w-2xl">
            {subtitle}
          </div>
        )}
      </div>

      {actionComponent && (
        <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
          {actionComponent}
        </div>
      )}
    </div>
  );
}

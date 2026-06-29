import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import SEO from '../components/common/SEO';
import demoVideo from '../assets/dentstory mobile demo sound-.mp4';

export default function HowToUsePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <SEO title="How to Use DentStory" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <PlayCircle size={28} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">How to Use DentStory</h1>
          <p className="text-sm text-base-content/60 mt-1">Watch this quick guide to master the platform and manage your clinics like a pro.</p>
        </div>
      </motion.div>

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative w-full rounded-3xl overflow-hidden border border-neutral-light shadow-xl bg-base-200 aspect-video"
      >
        <video
          src={demoVideo}
          className="absolute top-0 left-0 w-full h-full"
          controls
          title="DentStory Video Guide"
        />
      </motion.div>
      
      {/* Mobile Fullscreen Fallback Button */}
      <div className="mt-4 flex justify-center md:hidden">
        <a
          href={demoVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm"
        >
          <PlayCircle size={16} />
          Open Full Video Mode
        </a>
      </div>
    </div>
  );
}

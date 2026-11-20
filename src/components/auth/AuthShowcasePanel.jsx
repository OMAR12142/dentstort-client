import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

function DentStoryToothIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 3.5C5.2 3.5 3.5 5.4 3.5 8.1C3.5 10.7 4.6 13.1 5.4 15.6C6.1 17.8 6.8 20.5 8.3 20.5C9.5 20.5 9.9 18.4 10.6 16.7C11 15.7 11.4 15.2 12 15.2C12.6 15.2 13 15.7 13.4 16.7C14.1 18.4 14.5 20.5 15.7 20.5C17.2 20.5 17.9 17.8 18.6 15.6C19.4 13.1 20.5 10.7 20.5 8.1C20.5 5.4 18.8 3.5 16.5 3.5C14.8 3.5 13.5 4.4 12 4.4C10.5 4.4 9.2 3.5 7.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 7.5C9.4 6.9 10.6 6.7 11.8 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AuthShowcasePanel({ isArabic = false }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-base-100 border-s border-neutral-light overflow-hidden flex-col justify-end p-8 xl:p-12 text-base-content select-none">
      {/* ── 1. Clean, Unobstructed Dental Clinic Photograph Layer ── */}
      <div className="absolute inset-0 z-0">
        {!imgError ? (
          <img
            src="/clinic-natural.jpg"
            onError={(e) => {
              if (!e.currentTarget.dataset.retried) {
                e.currentTarget.dataset.retried = 'true';
                e.currentTarget.src = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80';
              } else {
                setImgError(true);
              }
            }}
            alt="Modern Dental Clinic"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          /* Graceful clinical gradient fallback if image fails completely */
          <div className="w-full h-full bg-gradient-to-br from-primary/25 via-base-200 to-base-100" />
        )}

        {/* Subtle bottom edge blend integrating smoothly with the form half */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── 2. Minimal DentStory Quote Card Only (Bottom of Photo) ── */}
      <div className="relative z-10 w-full flex justify-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md w-full bg-base-100/85 backdrop-blur-md border border-neutral-light rounded-2xl px-5 py-4 shadow-lg text-base-content"
        >
          <p className="text-sm sm:text-base font-semibold text-base-content/95 leading-relaxed text-start">
            {isArabic
              ? '“كل حالة تعالجها هي قصة نجاح تستحق أن تُروى.”'
              : '“Every clinical case you treat is a story worth sharing.”'}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-base-content/80 text-start">
            <DentStoryToothIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="tracking-wide">DentStory</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

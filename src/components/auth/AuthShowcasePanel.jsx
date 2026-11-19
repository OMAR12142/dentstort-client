import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  Sparkles, ShieldCheck, CheckCircle2, ArrowLeftRight
} from 'lucide-react';
import WhatsAppIcon from '../WhatsAppIcon';

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

export default function AuthShowcasePanel({ mode = 'login', claimedPortfolio = null, isArabic = false }) {
  const isRegister = mode === 'register';
  const hasClaimedLink = Boolean(claimedPortfolio?.claimedSlug);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-base-100 border-s border-neutral-light overflow-hidden flex-col justify-between p-8 xl:p-12 text-base-content select-none">
      {/* ── 1. Theme-Synced Authentic Dental Clinic Photography Layer ── */}
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

        {/* Subtle, theme-synced clinical blend keeping real photo natural */}
        <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-primary/10 to-transparent pointer-events-none" />

        {/* Soft radial glow accent for brand depth */}
        <div className="absolute -bottom-24 -start-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* ── 2. DentStory-Branded Top-End Pill ── */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-100/85 backdrop-blur-md border border-neutral-light text-base-content text-xs font-semibold shadow-sm">
          <DentStoryToothIcon className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>{isArabic ? 'محفظة DentStory السريرية' : 'DentStory Clinical Portfolio'}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-100/85 backdrop-blur-md border border-neutral-light text-[11px] font-mono text-base-content/80 shadow-sm" dir="ltr">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>dentstory.site</span>
        </div>
      </div>

      {/* ── 3. DentStory-Branded Editorial Story Card (Matching Light & Dark Mood) ── */}
      <div className="relative z-10 mt-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-base-100/90 backdrop-blur-xl border border-neutral-light shadow-2xl rounded-2xl p-6 sm:p-7 text-base-content relative overflow-hidden text-start"
        >
          {/* Sleek top brand accent indicator */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

          {/* Soft ambient inner glow */}
          <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

          {isRegister && hasClaimedLink ? (
            /* ── Register Mode with Claimed Portfolio ── */
            <div className="space-y-4">
              {/* Reserved Link Banner Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-bold">
                <Sparkles size={13} className="shrink-0 text-primary" />
                <span className="font-mono font-bold" dir="ltr">dentstory.site/portfolio/{claimedPortfolio.claimedSlug}</span>
                <span className="text-[10px] uppercase font-black tracking-wider text-primary bg-primary/15 px-1.5 py-0.5 rounded-md">
                  {isArabic ? 'محجوز' : 'Reserved'}
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight leading-snug">
                  {isArabic
                    ? 'حوّل كل حالة تعالجها إلى قصة نجاح تبني ثقة مرضاك.'
                    : 'Turn every clinical case into a trusted patient story.'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-base-content/75 font-medium leading-relaxed">
                  {isArabic
                    ? `أهلاً د. ${claimedPortfolio.claimedName || 'طبيب أسنان'}، رابطك السريري المخصص محجوز وجاهز للنشر فور إتمام التسجيل مجانًا.`
                    : `Welcome Dr. ${claimedPortfolio.claimedName || 'Dentist'}, your personalized clinical portfolio link is reserved and ready to publish immediately after signup.`}
                </p>
              </div>

              {/* Real Trust Icons Row (Zero empty circles) */}
              <div className="pt-3 border-t border-neutral-light/70 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>{isArabic ? 'بدون عمولة 0%' : '0% Commission'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                  <WhatsAppIcon size={13} className="fill-current shrink-0" />
                  <span>{isArabic ? 'حجز مباشر عبر واتساب' : 'Direct WhatsApp Booking'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{isArabic ? 'محفظة طبيب معتمدة' : 'Verified Practitioner'}</span>
                </div>
              </div>
            </div>
          ) : (
            /* ── Login Mode OR General Register ── */
            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary mb-2">
                  <Sparkles size={12} />
                  <span>{isArabic ? 'منصة متكاملة لأطباء الأسنان' : 'The Clinical SaaS for Dentists'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight leading-snug">
                  {isArabic
                    ? 'حوّل كل حالة تعالجها إلى قصة نجاح تبني ثقة مرضاك.'
                    : 'Turn every clinical case into a trusted patient story.'}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-base-content/75 font-medium leading-relaxed">
                  {isArabic
                    ? 'سجلات متكاملة للمرضى، وضوح مالي كامل، ومحفظة حالات تفاعلية قبل وبعد — مصممة خصيصاً لأطباء وعيادات الأسنان.'
                    : 'Centralized patient records, automated revenue clarity, and a shareable Before & After portfolio — built specifically for modern dental clinics.'}
                </p>
              </div>

              {/* Real Trust Icons Row (Zero empty circles) */}
              <div className="pt-3 border-t border-neutral-light/70 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                  <ArrowLeftRight size={13} className="shrink-0" />
                  <span>{isArabic ? 'معرض حالات قبل وبعد' : 'Before & After Showcase'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{isArabic ? 'سجلات عيادة ذكية' : 'Smart Clinic Records'}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold">
                  <WhatsAppIcon size={13} className="fill-current shrink-0" />
                  <span>{isArabic ? 'حجز مباشر عبر واتساب' : 'Direct WhatsApp Booking'}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

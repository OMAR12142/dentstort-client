import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '../SafeImage';
import { getCoverThemePreset } from '../../../utils/portfolioCoverThemes';

/**
 * Crisp inline vector DentStory tooth emblem.
 */
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

/**
 * BrandedPortfolioCover — Reusable DentStory-branded clinical cover canvas.
 * Supports custom cover photos (full-bleed SafeImage + protective vignette)
 * and 4 curated presets with geometric/wave accents, end-side DentStory vector
 * brand signature, and a frosted-glass clickable DentStory marketing pill.
 */
export default function BrandedPortfolioCover({
  coverPhoto,
  coverTheme,
  alt = 'Portfolio cover',
  className = 'w-full h-48 sm:h-60 md:h-64 rounded-2xl',
  compact = false,
  interactive = true,
  patternId = 'dentstory-cover-grid',
  children,
}) {
  const { t } = useTranslation('portfolio');
  const preset = getCoverThemePreset(coverTheme);
  const hasCustomCover = Boolean(coverPhoto);
  const isLightPreset = !hasCustomCover && preset.isLightSurface;

  const pillContent = (
    <>
      <span className="inline-flex items-center gap-1.5 font-black tracking-[0.14em] text-[10px] sm:text-[11px] uppercase">
        <DentStoryToothIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
        <span>DENTSTORY</span>
      </span>
      <span className="h-3.5 w-px bg-white/25 hidden xs:inline-block sm:inline-block" />
      <span className="relative hidden sm:inline-grid items-center text-[10px] font-semibold tracking-wide">
        <span className="col-start-1 row-start-1 text-white/85 transition-opacity duration-200 group-hover/brand:opacity-0">
          {t('public.verifiedClinicalPortfolio')}
        </span>
        <span className="col-start-1 row-start-1 inline-flex items-center gap-1 text-sky-200 opacity-0 transition-opacity duration-200 group-hover/brand:opacity-100">
          <span>{t('public.createYours')}</span>
          <ArrowRight size={11} className="rtl:rotate-180" />
        </span>
      </span>
    </>
  );

  return (
    <div
      className={`relative overflow-hidden shadow-lg border border-neutral-light/60 ${
        hasCustomCover ? 'bg-base-100' : preset.gradientClass
      } ${className}`}
    >
      {hasCustomCover ? (
        <>
          <SafeImage
            src={coverPhoto}
            alt={alt}
            className="w-full h-full object-cover"
            fallbackClassName={`w-full h-full ${preset.gradientClass}`}
            fallback={<div className="w-full h-full" />}
          />
          {/* Subtle protective vignette gradient for readability */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />
        </>
      ) : (
        <>
          {/* Soft Ambient Glow Orbs */}
          <div
            className={`absolute -top-16 -end-16 w-72 h-72 rounded-full blur-3xl pointer-events-none ${preset.orbPrimaryClass}`}
          />
          <div
            className={`absolute -bottom-24 -start-12 w-80 h-80 rounded-full blur-3xl pointer-events-none ${preset.orbSecondaryClass}`}
          />

          {/* Subtle Clinical Geometric Grid */}
          <svg
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full pointer-events-none ${
              isLightPreset
                ? 'text-slate-800 opacity-[0.09] dark:text-white dark:opacity-[0.12]'
                : 'text-white opacity-[0.13]'
            }`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id={patternId} width="36" height="36" patternUnits="userSpaceOnUse">
                <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.75" />
                <circle cx="0" cy="0" r="1.4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>

          {/* Subtle Clinical Wave Accent */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            className={`absolute inset-x-0 bottom-0 w-full ${
              compact ? 'h-14' : 'h-20 sm:h-24'
            } pointer-events-none ${
              isLightPreset ? 'text-primary/10 dark:text-white/5' : 'text-white/[0.08]'
            }`}
          >
            <path
              fill="currentColor"
              d="M0,96 C320,160 640,20 960,84 C1180,126 1340,104 1440,80 L1440,160 L0,160 Z"
            />
          </svg>

          {/* Architectural DentStory Tooth Emblem + Brand Signature (End Side, Opposite Avatar) */}
          <div
            aria-hidden="true"
            className={`pointer-events-none select-none absolute top-1/2 -translate-y-1/2 ${
              compact ? 'end-4' : 'end-4 sm:end-10 md:end-14'
            } flex items-center gap-2 sm:gap-4 ${
              isLightPreset
                ? 'text-slate-900 opacity-[0.12] dark:text-white dark:opacity-[0.14]'
                : 'text-white opacity-[0.15]'
            }`}
          >
            <DentStoryToothIcon
              className={compact ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-12 h-12 sm:w-20 sm:h-20'}
            />
            <div className="flex flex-col">
              <span
                className={`font-black uppercase leading-none tracking-[0.22em] ${
                  compact ? 'text-base sm:text-xl' : 'text-lg sm:text-3xl md:text-4xl'
                }`}
              >
                DENTSTORY
              </span>
              <span
                className={`mt-1 font-bold uppercase tracking-[0.26em] ${
                  compact ? 'text-[7px]' : 'text-[8px] sm:text-[10px]'
                }`}
              >
                FOR DENTIST PORTFOLIO
              </span>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/5 dark:from-black/35" />
        </>
      )}

      {/* Clickable Frosted-Glass DentStory Marketing Pill (Top-End Corner) */}
      {interactive ? (
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group/brand absolute top-2.5 sm:top-3.5 end-2.5 sm:end-3.5 z-10 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md shadow-sm transition-all"
          title={`DentStory — ${t('public.createYours')}`}
        >
          {pillContent}
        </a>
      ) : (
        <div className="group/brand absolute top-2.5 sm:top-3 end-2.5 sm:end-3 z-10 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/45 text-white border border-white/20 backdrop-blur-md shadow-sm">
          {pillContent}
        </div>
      )}

      {children}
    </div>
  );
}


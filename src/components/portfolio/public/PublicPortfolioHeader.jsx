import React from 'react';
import { User, Award, Briefcase, MapPin, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '../SafeImage';
import BrandedPortfolioCover from './BrandedPortfolioCover';
import { formatDoctorDisplayName } from '../../../utils/portfolioFormatters';
import api from '../../../api/axios';

/**
 * PublicPortfolioHeader — Branded DentStory marketing cover (custom coverPhoto or curated
 * coverTheme preset), overlapping circular avatar, doctor identity, clinic subtitle,
 * unified trust stat pills, and sleek frosted-glass "Download CV" action button.
 */
export default function PublicPortfolioHeader({
  dentist,
  slug,
  coverPhoto,
  coverTheme,
  clinicName,
  yearsOfExperience,
  totalCases = 0,
  cvUrl,
  cvFileName,
  visibility,
  onPhotoClick,
}) {
  const { t, i18n } = useTranslation('portfolio');
  const isArabic = i18n.language?.startsWith('ar');
  const displayName = formatDoctorDisplayName(dentist?.name, isArabic);

  const rawApiUrl =
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    api?.defaults?.baseURL ||
    '';

  const apiOrigin = (() => {
    let origin = '';
    if (rawApiUrl && rawApiUrl !== 'undefined' && rawApiUrl !== '/') {
      origin = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    }
    if (origin) {
      return origin;
    }
    if (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      return 'http://localhost:5001';
    }
    return 'https://dentstory-api.vercel.app';
  })();

  const portfolioSlug = slug || dentist?.slug || '';
  const cvPdfUrl = portfolioSlug
    ? `${apiOrigin}/api/portfolio/public/${encodeURIComponent(portfolioSlug)}/cv.pdf`
    : cvUrl;

  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const safePdfFileName = cvFileName || `${displayName.replace(/\s+/g, '_')}_CV.pdf`;
  const finalPdfFileName = /\.pdf$/i.test(safePdfFileName) ? safePdfFileName : `${safePdfFileName}.pdf`;
  const finalHref = isIOS ? cvPdfUrl : `${cvPdfUrl}?download=1`;

  return (
    <div className="bg-base-200 border-b border-neutral-light pb-4 shadow-sm relative overflow-hidden transition-colors duration-300">
      {/* ── Branded DentStory Cover Banner (Custom Photo or Curated Preset) ── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4">
        <BrandedPortfolioCover
          coverPhoto={coverPhoto}
          coverTheme={coverTheme}
          alt={`${displayName} cover`}
          className="w-full h-36 sm:h-44 md:h-48 rounded-2xl"
          patternId="public-portfolio-cover-grid"
          interactive
        />
      </div>

      {/* ── Overlapping Avatar, Identity, Unified Trust Stats & Sleek CV Action ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-10 sm:-mt-12 px-2 sm:px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4 text-center sm:text-start min-w-0 w-full md:w-auto">
            {/* Overlapping Circular Avatar */}
            <div
              onClick={onPhotoClick}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-base-100 bg-base-100 shadow-lg shrink-0 transition-transform hover:scale-105 duration-300 cursor-pointer"
            >
              <SafeImage
                src={dentist?.profilePhoto?.url}
                alt={displayName}
                className="w-full h-full object-cover"
                fallback={<User size={34} className="text-primary/40" />}
                fallbackClassName="w-full h-full flex items-center justify-center bg-primary/10"
              />
            </div>

            {/* Doctor Name, Clinic Subtitle & Inline Trust Pills */}
            <div className="pb-0.5 space-y-1.5 min-w-0 w-full sm:w-auto">
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight break-words [overflow-wrap:anywhere] leading-tight">
                  {displayName}
                </h1>
                {clinicName && visibility?.clinicInfo !== false && (
                  <p className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm font-semibold text-base-content/70 max-w-full">
                    <MapPin size={13} className="text-primary shrink-0" />
                    <span className="break-words [overflow-wrap:anywhere]">{clinicName}</span>
                  </p>
                )}
              </div>

              {((yearsOfExperience > 0 && visibility?.yearsOfExperience !== false) ||
                (totalCases > 0 && visibility?.casesCount !== false)) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                  {yearsOfExperience > 0 && visibility?.yearsOfExperience !== false && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/25 dark:bg-success/20">
                      <Award size={12} className="shrink-0" />
                      {t('public.yearsExpPlus', { count: yearsOfExperience })}
                    </span>
                  )}
                  {totalCases > 0 && visibility?.casesCount !== false && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/25 dark:bg-primary/20">
                      <Briefcase size={12} className="shrink-0" />
                      {totalCases === 1
                        ? t('public.documentedCase')
                        : t('public.documentedCases', { count: totalCases })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sleek Frosted-Glass "Download CV" CTA Button */}
          {cvUrl && visibility?.cv !== false && (
            <div className="flex items-center justify-center md:justify-end pb-0.5 shrink-0 w-full md:w-auto">
              <a
                href={finalHref}
                target="_blank"
                rel="noopener noreferrer"
                {...(!isIOS ? { download: finalPdfFileName } : {})}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-base-100/85 hover:bg-base-100 text-base-content border border-neutral-light/80 hover:border-primary/50 shadow-sm backdrop-blur-md transition-all cursor-pointer group"
                title={t('public.downloadCv', 'Download CV')}
                aria-label={t('public.downloadCv', 'Download CV')}
              >
                <Download size={15} className="text-primary shrink-0 transition-transform group-hover:scale-110 group-hover:translate-y-0.5" />
                <span>{t('public.downloadCv', 'Download CV')}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  PDF
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

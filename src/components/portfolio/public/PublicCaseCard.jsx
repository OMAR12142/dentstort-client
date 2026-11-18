import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, Briefcase, Images } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SafeImage from '../SafeImage';

/**
 * PublicCaseCard — Clinical-grade case study card for the public portfolio showcase grid.
 * Supports both single-cover images and side-by-side Before/After split previews.
 * Scaled for 2-column mobile layout and 3-column desktop layout.
 */
export default function PublicCaseCard({ caseData, slug }) {
  const { t, i18n } = useTranslation('portfolio');
  const isArabic = i18n.language?.startsWith('ar');

  const hasBeforeAfter =
    Boolean(caseData.beforeImage) &&
    Boolean(caseData.afterImage) &&
    caseData.beforeImage !== caseData.afterImage;

  const totalImages = Array.isArray(caseData.selectedImages)
    ? caseData.selectedImages.length
    : caseData.coverImage
      ? 1
      : 0;

  const treatmentList = Array.isArray(caseData.treatmentType)
    ? caseData.treatmentType.filter(Boolean)
    : caseData.treatmentType
      ? [caseData.treatmentType]
      : ['General'];
  const primaryTreatment = treatmentList[0] || 'General';
  const extraTreatmentCount = Math.max(0, treatmentList.length - 1);

  const formattedDate = caseData.publishedAt
    ? new Date(caseData.publishedAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="h-full">
      <Link
        to={`/portfolio/${slug}/case/${caseData._id}`}
        className="group flex flex-col h-full bg-base-200 rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-light hover:border-primary/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        {/* ── Media Frame (4:3) ── */}
        <div className="aspect-[4/3] relative overflow-hidden bg-base-100 shrink-0">
          {hasBeforeAfter ? (
            <div className="grid grid-cols-2 w-full h-full relative">
              <div className="relative w-full h-full overflow-hidden">
                <SafeImage
                  src={caseData.beforeImage}
                  alt={`${caseData.title} — Before`}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  fallback={<Briefcase size={28} className="text-base-content/15" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                />
              </div>
              <div className="relative w-full h-full overflow-hidden">
                <SafeImage
                  src={caseData.afterImage}
                  alt={`${caseData.title} — After`}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  fallback={<Briefcase size={28} className="text-base-content/15" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                />
              </div>

              {/* Bottom legibility scrim */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              {/* Center divider line & comparison emblem */}
              <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/85 dark:bg-base-100/90 shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-base-200/95 text-primary border border-neutral-light shadow-md backdrop-blur-sm flex items-center justify-center">
                <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>

              {/* Bottom Before / After pills */}
              <span className="pointer-events-none absolute bottom-1.5 sm:bottom-2 start-1.5 sm:start-2 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-black/65 text-white border border-white/15 backdrop-blur-md shadow-sm">
                Before
              </span>
              <span className="pointer-events-none absolute bottom-1.5 sm:bottom-2 end-1.5 sm:end-2 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-content shadow-sm">
                After
              </span>
            </div>
          ) : (
            <>
              <SafeImage
                src={caseData.coverImage || caseData.selectedImages?.[0]}
                alt={caseData.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                fallback={<Briefcase size={36} className="text-base-content/15" />}
                fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {totalImages > 1 && (
                <span className="pointer-events-none absolute top-1.5 sm:top-2.5 end-1.5 sm:end-2.5 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/60 text-white border border-white/15 backdrop-blur-md shadow-sm">
                  <Images size={10} className="shrink-0" />
                  <span>{totalImages}</span>
                </span>
              )}
            </>
          )}

          {/* Top-start Treatment Category Badge */}
          <div className="pointer-events-none absolute top-1.5 sm:top-2.5 start-1.5 sm:start-2.5 flex items-center gap-1 max-w-[72%] sm:max-w-[75%]">
            <span className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-wide bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-md shadow-sm truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate">{primaryTreatment}</span>
              {extraTreatmentCount > 0 && (
                <span className="text-primary shrink-0 text-[8px] sm:text-[10px]">+{extraTreatmentCount}</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Card Body & Footer ── */}
        <div className="p-2.5 sm:p-4 flex flex-col flex-1">
          <div className="mb-2 sm:mb-3">
            <h3 className="font-bold text-xs sm:text-base text-base-content group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2 leading-snug">
              {caseData.title}
            </h3>

            {caseData.description && (
              <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-sm text-base-content/70 line-clamp-2 leading-relaxed">
                {caseData.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-2 sm:pt-3 border-t border-neutral-light/70 flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0">
              {hasBeforeAfter ? (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold bg-primary/10 text-primary truncate max-w-full">
                  <ArrowLeftRight size={10} className="shrink-0 sm:w-3 sm:h-3" />
                  <span className="truncate">{t('public.beforeAfter')}</span>
                </span>
              ) : totalImages > 1 ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-base-content/60 truncate max-w-full">
                  <Images size={11} className="shrink-0" />
                  <span className="truncate">{totalImages} {isArabic ? 'صور' : 'Photos'}</span>
                </span>
              ) : formattedDate ? (
                <span className="text-[9px] sm:text-[11px] font-medium text-base-content/55 truncate block">
                  {formattedDate}
                </span>
              ) : (
                <span className="text-[9px] sm:text-[11px] font-medium text-base-content/55 truncate block">
                  {isArabic ? 'حالة سريرية' : 'Clinical Case'}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-bold text-base-content/75 group-hover:text-primary transition-colors shrink-0">
              <span className="hidden sm:inline">{t('public.viewCase')}</span>
              <span className="sm:hidden">{isArabic ? 'عرض' : 'View'}</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform shrink-0" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

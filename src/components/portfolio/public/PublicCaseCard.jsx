import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeftRight, Briefcase, Images } from 'lucide-react';
import SafeImage from '../SafeImage';

/**
 * PublicCaseCard — Clinical-grade case study card for the public portfolio showcase grid.
 * Supports both single-cover images and side-by-side Before/After split previews.
 */
export default function PublicCaseCard({ caseData, slug }) {
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
        className="group flex flex-col h-full bg-base-200 rounded-2xl overflow-hidden border border-neutral-light hover:border-primary/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                  fallback={<Briefcase size={32} className="text-base-content/15" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                />
              </div>
              <div className="relative w-full h-full overflow-hidden">
                <SafeImage
                  src={caseData.afterImage}
                  alt={`${caseData.title} — After`}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                  fallback={<Briefcase size={32} className="text-base-content/15" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                />
              </div>

              {/* Bottom legibility scrim */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

              {/* Center divider line & comparison emblem */}
              <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/85 dark:bg-base-100/90 shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-base-200/95 text-primary border border-neutral-light shadow-md backdrop-blur-sm flex items-center justify-center">
                <ArrowLeftRight size={13} />
              </div>

              {/* Bottom Before / After pills */}
              <span className="pointer-events-none absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-black/65 text-white border border-white/15 backdrop-blur-md shadow-sm">
                Before
              </span>
              <span className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-content shadow-sm">
                After
              </span>
            </div>
          ) : (
            <>
              <SafeImage
                src={caseData.coverImage || caseData.selectedImages?.[0]}
                alt={caseData.title}
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                fallback={<Briefcase size={40} className="text-base-content/15" />}
                fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {totalImages > 1 && (
                <span className="pointer-events-none absolute top-2.5 end-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/60 text-white border border-white/15 backdrop-blur-md shadow-sm">
                  <Images size={11} />
                  {totalImages}
                </span>
              )}
            </>
          )}

          {/* Top-start Treatment Category Badge */}
          <div className="pointer-events-none absolute top-2.5 start-2.5 flex items-center gap-1 max-w-[70%]">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-md shadow-sm truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="truncate">{primaryTreatment}</span>
              {extraTreatmentCount > 0 && (
                <span className="text-primary shrink-0">+{extraTreatmentCount}</span>
              )}
            </span>
          </div>
        </div>

        {/* ── Card Body & Footer ── */}
        <div className="p-3.5 sm:p-5 flex flex-col flex-1">
          <div className="mb-3">
            <h3 className="font-bold text-sm sm:text-lg text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {caseData.title}
            </h3>

            {caseData.description && (
              <p className="mt-1.5 text-xs sm:text-sm text-base-content/70 line-clamp-2 leading-relaxed">
                {caseData.description}
              </p>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-neutral-light/70 flex items-center justify-between gap-2">
            <div className="min-w-0">
              {hasBeforeAfter ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-primary/10 text-primary">
                  <ArrowLeftRight size={11} />
                  <span className="truncate">Before &amp; After</span>
                </span>
              ) : totalImages > 1 ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-base-content/60">
                  <Images size={12} />
                  {totalImages} Photos
                </span>
              ) : formattedDate ? (
                <span className="text-[10px] sm:text-[11px] font-medium text-base-content/55">
                  {formattedDate}
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-medium text-base-content/55">
                  Clinical Case
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-base-content/75 group-hover:text-primary transition-colors shrink-0">
              <span>View Case</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

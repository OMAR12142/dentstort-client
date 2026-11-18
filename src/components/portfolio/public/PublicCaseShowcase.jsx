import React, { useState } from 'react';
import { Briefcase, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PublicCaseCard from './PublicCaseCard';

/**
 * PublicCaseShowcase — Manages treatment filters, Before & After quick filter,
 * cases grid, and pagination with natural LTR/RTL ordering.
 */
export default function PublicCaseShowcase({
  cases,
  slug,
  selectedFilter,
  setSelectedFilter,
  treatmentTypes,
  pagination,
  page,
  onPageChange,
}) {
  const { t } = useTranslation('portfolio');
  const [beforeAfterOnly, setBeforeAfterOnly] = useState(false);

  // Always guarantee 'All' is first in reading order (LTR & RTL)
  const orderedTreatmentTypes = [
    'All',
    ...treatmentTypes.filter((type) => type && type !== 'All'),
  ];

  const filteredCases = (cases || []).filter((c) => {
    const matchesTreatment =
      selectedFilter === 'All'
        ? true
        : Array.isArray(c.treatmentType)
          ? c.treatmentType.includes(selectedFilter)
          : c.treatmentType === selectedFilter;

    if (!matchesTreatment) return false;

    if (beforeAfterOnly) {
      return (
        Boolean(c.beforeImage) &&
        Boolean(c.afterImage) &&
        c.beforeImage !== c.afterImage
      );
    }

    return true;
  });

  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleResetFilters = () => {
    setBeforeAfterOnly(false);
    setSelectedFilter('All');
  };

  return (
    <div id="cases-section" className="pt-1 pb-4">
      <section>
        {/* ── Compact Section Header Bar ── */}
        <header className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-4 border-b border-neutral-light">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
              {t('public.caseShowcase')}
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60 font-medium">
              {t('public.documentedJourney')}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
              {t('public.totalCases', { count: totalItems })}
            </span>
            {totalPages > 1 && (
              <span className="text-xs font-bold text-base-content/60">
                {t('public.pageOf', { page, total: totalPages })}
              </span>
            )}
          </div>
        </header>

        {/* ── Treatment Filter Bar ('All' first + Before & After Quick Filter) ── */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5">
          {orderedTreatmentTypes.map((type) => {
            const isActive = selectedFilter === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedFilter(type)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-content border-primary shadow-sm shadow-primary/20'
                    : 'bg-base-200 text-base-content/75 border-neutral-light hover:border-primary/50 hover:text-primary'
                }`}
              >
                {type === 'All' ? t('public.all') : type}
              </button>
            );
          })}

          {/* Dedicated Before & After Quick Filter Toggle */}
          <button
            type="button"
            onClick={() => {
              setBeforeAfterOnly((prev) => !prev);
              if (page !== 1) onPageChange(1);
            }}
            aria-pressed={beforeAfterOnly}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              beforeAfterOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                : 'bg-base-200 text-base-content/80 border-neutral-light hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
          >
            <ArrowLeftRight size={13} />
            <span>{t('public.beforeAfter')}</span>
          </button>
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-14 px-4 bg-base-200 rounded-2xl border-2 border-dashed border-neutral-light space-y-3">
            <Briefcase size={38} className="mx-auto text-base-content/25" />
            <p className="font-bold text-base-content/60 text-sm">
              {selectedFilter !== 'All' || beforeAfterOnly
                ? t('public.noMatchingCases')
                : t('public.noCases')}
            </p>
            {(selectedFilter !== 'All' || beforeAfterOnly) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-content hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {t('public.showAllCases')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
              {filteredCases.map((c) => (
                <PublicCaseCard key={c._id} caseData={c} slug={slug} />
              ))}
            </div>

            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (() => {
              const handlePageChange = (newPage) => {
                onPageChange(newPage);
                const el = document.getElementById('cases-section');
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 100;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              };

              const getPageNumbers = () => {
                const pages = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (page <= 3) {
                    pages.push(1, 2, 3, 4, '...', totalPages);
                  } else if (page >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
                  }
                }
                return pages;
              };

              return (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-4 pb-4">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all bg-base-200 border border-neutral-light hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed text-base-content cursor-pointer"
                  >
                    {t('public.prev')}
                  </button>

                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {getPageNumbers().map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={p === '...'}
                        onClick={() => p !== '...' && handlePageChange(p)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all ${
                          p === '...'
                            ? 'text-base-content/60 cursor-default'
                            : page === p
                              ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                              : 'text-base-content/70 hover:bg-base-200 cursor-pointer'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-3.5 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all bg-base-200 border border-neutral-light hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed text-base-content cursor-pointer"
                  >
                    {t('public.next')}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </section>
    </div>
  );
}

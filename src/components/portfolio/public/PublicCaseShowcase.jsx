import React from 'react';
import { Briefcase } from 'lucide-react';
import PublicCaseCard from './PublicCaseCard';

/**
 * PublicCaseShowcase — Manages the treatment filters, cases grid, and pagination.
 */
export default function PublicCaseShowcase({
  cases,
  slug,
  selectedFilter,
  setSelectedFilter,
  treatmentTypes,
  pagination,
  page,
  onPageChange
}) {
  const filteredCases = cases.filter(c => {
    if (selectedFilter === 'All') return true;
    if (Array.isArray(c.treatmentType)) {
      return c.treatmentType.includes(selectedFilter);
    }
    return c.treatmentType === selectedFilter;
  });
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div id="cases-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:py-12 border-t border-slate-200 dark:border-base-content/10">
      <section>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-base-content tracking-tight">Case Showcase</h2>
            <p className="text-sm text-base-content/60 dark:text-gray-400 font-medium italic">Documented journey</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase border border-primary/20">
              {totalItems} Total Cases
            </span>
            {totalPages > 1 && (
              <span className="text-[10px] font-bold text-base-content/60 tracking-wider uppercase">
                Page {page} of {totalPages}
              </span>
            )}
          </div>
        </header>

        {/* ── Treatment Filter Bar ── */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-3 mb-10 sm:mb-12">
          {treatmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type)}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 pb-1 pt-1 sm:gap-2.5 px-2 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all border ${selectedFilter === type
                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                : 'bg-white dark:bg-base-100 text-base-content/60 border-slate-200 dark:border-base-content/10 hover:border-primary'
                }`}
            >
              <span className="truncate w-full text-center sm:text-left">{type}</span>
            </button>
          ))}
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-base-100 rounded-3xl border-2 border-dashed border-slate-200 dark:border-base-content/10">
            <Briefcase size={48} className="mx-auto text-base-content/20 mb-6" />
            <p className="font-bold text-base-content/40 uppercase text-sm tracking-widest">
              No {selectedFilter !== 'All' ? selectedFilter : ''} cases available
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {filteredCases.map((c, i) => (
                <PublicCaseCard key={c._id} caseData={c} slug={slug} i={i} />
              ))}
            </div>

            {/* ── Pagination Controls ── */}
            {totalPages > 1 && (() => {
              const handlePageChange = (newPage) => {
                onPageChange(newPage);
                const el = document.getElementById('cases-section');
                if (el) {
                  // Scroll slightly above the section for better UX
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
                <div className="flex flex-wrap items-center justify-center gap-2 pt-8 pb-4 sm:pb-12">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-base-content/10 hover:bg-white dark:hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed text-base-content"
                  >
                    Prev
                  </button>

                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {getPageNumbers().map((p, i) => (
                      <button
                        key={i}
                        disabled={p === '...'}
                        onClick={() => p !== '...' && handlePageChange(p)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs font-bold transition-all ${
                          p === '...'
                            ? 'text-base-content/60 cursor-default'
                            : page === p
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-base-content/60 hover:bg-white dark:hover:bg-[#252525]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-base-100 border border-slate-200 dark:border-base-content/10 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed text-base-content"
                  >
                    Next
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

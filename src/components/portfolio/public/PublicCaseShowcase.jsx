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
  const filteredCases = cases.filter(c => selectedFilter === 'All' || c.treatmentType === selectedFilter);
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div id="cases-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:py-12 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
      <section>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-[#191919] dark:text-white tracking-tight">Case Showcase</h2>
            <p className="text-sm text-[#423535] dark:text-gray-400 font-medium italic">Documented journey</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] text-[10px] font-bold rounded-full uppercase border border-[#0A66C2]/20">
              {totalItems} Total Cases
            </span>
            {totalPages > 1 && (
              <span className="text-[10px] font-bold text-[#666666] tracking-wider uppercase">
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
                ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xl shadow-[#0A66C2]/20'
                : 'bg-white dark:bg-[#252525] text-[#666666] dark:text-gray-400 border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]'
                }`}
            >
              <span className="truncate w-full text-center sm:text-left">{type}</span>
            </button>
          ))}
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#252525] rounded-3xl border-2 border-dashed border-[#E0DFDC] dark:border-[#3A3A3A]">
            <Briefcase size={48} className="mx-auto text-[#666666]/20 mb-6" />
            <p className="font-bold text-[#666666]/40 uppercase text-sm tracking-widest">
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
            {selectedFilter === 'All' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 pb-4 sm:pb-12">
                <button
                  disabled={page === 1}
                  onClick={() => onPageChange(page - 1)}
                  className="px-6 py-2 rounded-xl text-xs font-bold transition-all border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-white dark:hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed text-[#191919] dark:text-white"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onPageChange(i + 1)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${page === i + 1
                        ? 'bg-[#0A66C2] text-white shadow-lg shadow-[#0A66C2]/20'
                        : 'text-[#666666] hover:bg-white dark:hover:bg-[#252525]'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => onPageChange(page + 1)}
                  className="px-6 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed text-[#191919] dark:text-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

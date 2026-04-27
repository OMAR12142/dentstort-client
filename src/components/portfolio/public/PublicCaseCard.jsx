import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase } from 'lucide-react';

/**
 * PublicCaseCard — Individual case study card for the showcase grid.
 */
export default function PublicCaseCard({ caseData, slug, i }) {
  return (
    <div key={caseData._id}>
      <Link
        to={`/portfolio/${slug}/case/${caseData._id}`}
        className="group block bg-white dark:bg-[#252525] rounded-3xl overflow-hidden border border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]/40 shadow-sm hover:shadow-2xl transition-all duration-500"
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-[#F3F2EF] dark:bg-[#1A1A1A]">
          {caseData.coverImage ? (
            <img 
              src={caseData.coverImage} 
              alt={caseData.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Briefcase size={40} className="text-[#666666]/10" />
            </div>
          )}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-sm text-[#0A66C2] text-[8px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg shadow-sm border border-[#E0DFDC] dark:border-[#3A3A3A] shrink-0">
              {caseData.treatmentType || 'General'}
            </span>
            {caseData.category && (
              <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-black/70 text-white text-[8px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg shadow-sm border border-white/10 shrink-0">
                {caseData.category}
              </span>
            )}
          </div>
        </div>
        <div className="p-3 sm:p-6">
          <h3 className="font-bold text-sm sm:text-xl text-[#191919] dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-1 mb-2 sm:mb-4">
            {caseData.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#666666] dark:text-gray-400 group-hover:text-[#0A66C2] transition-colors">
              <span className="hidden xs:inline">View Case Study</span> 
              <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

import React from 'react';
import { User, Award } from 'lucide-react';

/**
 * PublicPortfolioHeader — Displays the clinician's banner, profile photo, and key identity stats.
 */
export default function PublicPortfolioHeader({ dentist, yearsOfExperience, onPhotoClick }) {
  return (
    <div className="bg-white dark:bg-[#252525] border-b border-[#E0DFDC] dark:border-[#3A3A3A] pb-4 mb-2 shadow-sm relative overflow-hidden">

      {/* Banner with Primary Brand Color */}
      <div className="w-full max-w-7xl mx-auto sm:px-4 lg:px-8 mt-0 sm:mt-4">
        <div className="w-full h-40 sm:h-64 bg-[#050505] relative rounded-br-[80px] sm:rounded-br-[160px] sm:rounded-tl-[40px] overflow-hidden shadow-2xl group">

          {/* Mesh Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2] via-[#001D3D] to-[#000814] opacity-80" />

          {/* Architectural Glows */}
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#0A66C2]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[100px]" />

          {/* Logo Mark Typography Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-center">
            <h2 className="text-[80px] sm:text-[180px] font-black text-white/[0.03] leading-none tracking-tighter uppercase whitespace-nowrap">
              DENTSTORY
            </h2>
          </div>

          {/* Creative Glass Element (Branding Card) */}

          {/* Pattern Overlay */}
          <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M0 38.59V40h1.41l.59-.59V38H0v.59zM0 1.41V0h1.41L0 1.41zM38.59 0H40v1.41L38.59 0zM40 38.59V40h-1.41L40 38.59zM0 20h1v1H0v-1zm1 0h1v1H1v-1zm1 0h1v1H2v-1zm1 0h1v1H3v-1zm1 0h1v1H4v-1zm1 0h1v1H5v-1zm1 0h1v1H6v-1zm1 0h1v1H7v-1zm1 0h1v1H8v-1zm1 0h1v1H9v-1zm1 0h1v1H10v-1zm1 0h1v1H11v-1zm1 0h1v1H12v-1zm1 0h1v1H13v-1zm1 0h1v1H14v-1zm1 0h1v1H15v-1zm1 0h1v1H16v-1zm1 0h1v1H17v-1zm1 0h1v1H18v-1zm1 0h1v1H19v-1zm1 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1zm0 1h-1v-1h1v1z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 pointer-events-none`} />

          {/* Bottom Glow Fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Identity Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            {/* Overlapping Avatar */}
            <div
              onClick={onPhotoClick}
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-[6px] border-white dark:border-[#252525] bg-white dark:bg-[#252525] shadow-xl shrink-0 transition-transform hover:scale-105 duration-500 cursor-pointer"
            >
              {dentist.profilePhoto?.url ? (
                <img src={dentist.profilePhoto.url} alt={dentist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0A66C2]/10">
                  <User size={40} className="text-[#0A66C2]/40" />
                </div>
              )}
            </div>

            {/* Mini Identity */}
            <div className="pb-2 space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#191919] dark:text-white tracking-tight">
                Dr. {dentist.name}
              </h1>
            </div>
          </div>

          {/* Quick Stats/Badges */}
          <div className="shrink-0 flex items-center justify-center md:pb-4 gap-3">
            {yearsOfExperience > 0 && (
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#057642]/10 text-[#057642] border border-[#057642]/20 flex items-center gap-1.5 dark:bg-[#057642]/20">
                <Award size={12} /> {yearsOfExperience} years experience
              </span>
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

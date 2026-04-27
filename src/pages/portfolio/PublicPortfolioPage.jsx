import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, Mail, Phone, MapPin, ArrowRight, Award, Sparkles, MessageCircle, X,
  Activity, Anchor, Zap, Layers, ShieldCheck, RefreshCcw, LayoutGrid, AppWindow, Stethoscope
} from 'lucide-react';
import { usePublicPortfolio } from '../../hooks/usePortfolio';
import SEO from '../../components/common/SEO';
import WhatsAppIcon from '../../components/WhatsAppIcon';

/**
 * PublicPortfolioPage — Enhanced clinical showcase for a dentist.
 * Matches the premium design language of PublicCaseDetailPage.
 */
export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const limit = 6;

  const { data, isLoading, error } = usePublicPortfolio(slug, page, limit);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const TREATMENT_ICONS = {
    'All': <LayoutGrid size={18} />,
    'Surgery': <Stethoscope size={18} />,
    'Implant': <Anchor size={18} />,
    'Endo': <Zap size={18} />,
    'Perio': <Layers size={18} />,
    'Fixed': <ShieldCheck size={18} />,
    'Removable': <RefreshCcw size={18} />,
    'Restorative': <Sparkles size={18} />,
    'General': <AppWindow size={18} />
  };

  // Scroll to grid on page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const element = document.getElementById('cases-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-base-100">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-base-content/40 text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Profile</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 bg-base-100">
        <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center">
          <User size={32} className="text-base-content/30" />
        </div>
        <h2 className="text-2xl font-black text-base-content">Profile Not Found</h2>
        <Link to="/" className="btn btn-primary rounded-full px-8">Return Home</Link>
      </div>
    );
  }

  const { dentist, bio, yearsOfExperience, services, contactEmail, contactPhone, clinicName, clinicAddress, cases, pagination } = data;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] min-h-screen pb-2 font-sans transition-colors duration-300">
      <SEO
        title={`Dr. ${dentist.name} — Dental Portfolio`}
        description={bio ? bio.substring(0, 150) : `View Dr. ${dentist.name}'s professional clinical portfolio.`}
      />

      {/* ── 1. Synced Profile Header ── */}
      <div className="bg-white dark:bg-[#252525] border-b border-[#E0DFDC] dark:border-[#3A3A3A] pb-4 mb-2 shadow-sm relative overflow-hidden">

        {/* Banner with Primary Brand Color */}
        <div className="w-full max-w-7xl mx-auto sm:px-4 lg:px-8 mt-0 sm:mt-4">
          <div className="w-full h-32 sm:h-48 bg-[#0A66C2] relative sm:rounded-3xl overflow-hidden shadow-inner group">
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10 pointer-events-none`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Identity Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 sm:-mt-16 relative z-10">

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Overlapping Avatar */}
              <div
                onClick={() => setProfilePhotoOpen(true)}
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
                {/* <p className="text-xs font-semibold text-[#0A66C2] uppercase">
                  {clinicName || 'Verified Clinical Professional'}
                </p> */}
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
      </div>

      {/* ── 2. Information Row (Bio & Contact) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Bio Section */}
          <div className="lg:col-span-8 w-full overflow-hidden">
            <section className="   rounded-2xl p-5 sm:p-8 overflow-hidden w-full">
              <h2 className="text-xs font-bold text-[#666666] dark:text-gray-400 uppercase mb-1 flex items-center gap-3">
                <span className="w-8 h-px bg-[#0A66C2]/30" /> Professional Experience
              </h2>
              {bio ? (
                <div className="space-y-4 w-full">
                  <p className={`text-base sm:text-lg text-[#191919] dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words overflow-hidden ${!isExpanded ? 'line-clamp-[12]' : ''}`}>
                    {bio}
                  </p>
                  {bio.length > 500 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[#0A66C2] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity mt-4"
                    >
                      {isExpanded ? '↑ Show Less' : '↓ Read Full Bio'}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[#666666] dark:text-gray-500 italic font-medium">Information not available</p>
              )}

              {/* services Badges Integration */}
              {services && services.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
                  <h3 className="text-[10px] font-black text-[#666666] uppercase tracking-[0.2em] mb-4">Core Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-[#0A66C2]/5 text-[#0A66C2] text-xs font-bold rounded-xl border border-[#0A66C2]/20 hover:bg-[#0A66C2]/10 transition-colors"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4">
            <div className="  rounded-2xl  sm:p-8 shadow-sm h-full flex flex-col justify-between">

              <div className=" space-y-4 mt-auto">
                {contactPhone && (
                  <a
                    href={`https://wa.me/${contactPhone.replace(/\D/g, '').startsWith('0') ? '20' + contactPhone.replace(/\D/g, '').substring(1) : contactPhone.replace(/\D/g, '').startsWith('20') ? contactPhone.replace(/\D/g, '') : '20' + contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Dr. ${dentist.name}, I am interested in booking a consultation regarding your portfolio.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn bg-[#00c066] hover:bg-[#18a666] text-white border-none rounded-xl font-bold gap-2 h-12 shadow-lg shadow-[#057642]/20"
                  >
                    <WhatsAppIcon size={18} /> WhatsApp Contact
                  </a>
                )}
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="w-full btn bg-white dark:bg-[#3A3A3A] text-[#191919] dark:text-white border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-gray-50 dark:hover:bg-[#444] rounded-xl font-bold gap-2 h-12">
                    <Mail size={18} /> Send Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Full-Width Case Showcase ── */}
      <div id="cases-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
        <section>
          <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-[#191919] dark:text-white tracking-tight">Case Showcase</h2>

              <p className="text-sm text-[#423535] dark:text-gray-400 font-medium italic">  documented journey </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] text-[10px] font-bold rounded-full uppercase border border-[#0A66C2]/20">
                {pagination?.totalItems || 0} Total Cases
              </span>
              {totalPages > 1 && (
                <span className="text-[10px] font-bold text-[#666666] tracking-wider uppercase">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>
          </header>

          {/* ── Treatment Filter Bar ── */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-3 mb-16 lg:mb-20">
            {Object.keys(TREATMENT_ICONS).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 pb-1 pt-1 sm:gap-2.5 px-2 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all border ${selectedFilter === type
                  ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-xl shadow-[#0A66C2]/20'
                  : 'bg-white dark:bg-[#252525] text-[#666666] dark:text-gray-400 border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]'
                  }`}
              >
                <span className={selectedFilter === type ? 'text-white' : 'text-[#0A66C2]'}>
                  {TREATMENT_ICONS[type]}
                </span>
                <span className="truncate w-full text-center sm:text-left">{type}</span>
              </button>
            ))}
          </div>

          {cases.filter(c => selectedFilter === 'All' || c.treatmentType === selectedFilter).length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-[#252525] rounded-3xl border-2 border-dashed border-[#E0DFDC] dark:border-[#3A3A3A]">
              <Briefcase size={48} className="mx-auto text-[#666666]/20 mb-6" />
              <p className="font-bold text-[#666666]/40 uppercase text-sm tracking-widest">No {selectedFilter !== 'All' ? selectedFilter : ''} cases available</p>
            </div>
          ) : (
            <div className="space-y-16">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {cases
                  .filter(c => selectedFilter === 'All' || c.treatmentType === selectedFilter)
                  .map((c, i) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={`/portfolio/${slug}/case/${c._id}`}
                        className="group block bg-white dark:bg-[#252525] rounded-3xl overflow-hidden border border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]/40 shadow-sm hover:shadow-2xl transition-all duration-500"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden bg-[#F3F2EF] dark:bg-[#1A1A1A]">
                          {c.coverImage ? (
                            <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Briefcase size={40} className="text-[#666666]/10" /></div>
                          )}
                          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                            <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-sm text-[#0A66C2] text-[8px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg shadow-sm border border-[#E0DFDC] dark:border-[#3A3A3A] flex items-center gap-1 sm:gap-1.5 shrink-0">
                              {TREATMENT_ICONS[c.treatmentType || 'General']}
                              <span className="hidden xs:inline">{c.treatmentType || 'General'}</span>
                            </span>
                            {c.category && (
                              <span className="px-1.5 sm:px-3 py-0.5 sm:py-1 bg-black/70 text-white text-[8px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg shadow-sm border border-white/10 shrink-0">
                                {c.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 sm:p-6">
                          <h3 className="font-bold text-sm sm:text-xl text-[#191919] dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-1 mb-2 sm:mb-4">
                            {c.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-[#666666] dark:text-gray-400 group-hover:text-[#0A66C2] transition-colors">
                              <span className="hidden xs:inline">View Case Study</span> <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
              </div>

              {/* ── Pagination Controls ── */}
              {selectedFilter === 'All' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-6 py-2 rounded-xl text-xs font-bold transition-all border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-white dark:hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed text-[#191919] dark:text-white"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
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
                    onClick={() => handlePageChange(page + 1)}
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

      {/* ── Profile Photo Lightbox ── */}
      <AnimatePresence>
        {profilePhotoOpen && dentist.profilePhoto?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setProfilePhotoOpen(false)}
          >
            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={dentist.profilePhoto.url}
              alt={dentist.name}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

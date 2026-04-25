import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, ChevronLeft, ChevronRight,
  Share2, Check, Briefcase, User, ZoomIn
} from 'lucide-react';
import { usePublicPortfolio } from '../../hooks/usePortfolio';
import SEO from '../../components/common/SEO';

export default function PublicCaseDetailPage() {
  const { slug, caseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePublicPortfolio(slug);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F3F2EF] dark:bg-[#1A1A1A]">
        <div className="text-center space-y-4">
          <span className="loading loading-spinner loading-lg text-[#0A66C2]" />
          <p className="text-[#666666] dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Loading Clinical Data</p>
        </div>
      </div>
    );
  }

  const caseData = data?.cases?.find(c => c._id === caseId);

  if (error || !data || !caseData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 bg-[#F3F2EF] dark:bg-[#1A1A1A]">
        <div className="w-20 h-20 bg-white dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-full flex items-center justify-center">
          <Briefcase size={32} className="text-[#666666] dark:text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#191919] dark:text-white">Record Not Found</h2>
        <button onClick={() => navigate(-1)} className="btn bg-[#0A66C2] text-white rounded-full px-8 border-none hover:bg-[#0A66C2]/90">Return</button>
      </div>
    );
  }

  const dentist = data.dentist;
  const allImagesRaw = caseData.selectedImages || [];
  const allImages = caseData.coverImage
    ? [caseData.coverImage, ...allImagesRaw.filter(img => img !== caseData.coverImage)]
    : allImagesRaw;

  const otherCases = data.cases.filter(c => c._id !== caseId).slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${caseData.title} | Dr. ${dentist.name}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] min-h-screen pb-24 font-sans transition-colors duration-300">
      <SEO
        title={`${caseData.title} — Dr. ${dentist.name}`}
        description={caseData.description?.substring(0, 150) || `Clinical case detail on Dr. ${dentist.name}'s portfolio.`}
      />

      {/* ── 1. Compact Case Header ── */}
      <div className="bg-white dark:bg-[#252525] border-b border-[#E0DFDC] dark:border-[#3A3A3A] pb-6 relative overflow-hidden">

        {/* Top Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to={`/portfolio/${slug}`} className="flex items-center gap-2 text-xs font-bold text-[#666666] dark:text-gray-400 hover:text-[#0A66C2] transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Portfolio
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="btn btn-xs btn-outline border-[#E0DFDC] dark:border-[#3A3A3A] text-[#191919] dark:text-white rounded-full px-4 font-bold uppercase transition-all hover:bg-[#0A66C2]/5">
              {copied ? <Check size={12} className="text-success" /> : <Share2 size={12} />} {copied ? 'Linked!' : 'Share'}
            </button>
          </div>
        </div>

        {/* Case Title Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-bold text-[#191919] dark:text-white tracking-tight leading-none">
                {caseData.title}
              </h1>
            </div>

            {/* Minimized Doctor Identity */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#E0DFDC]/50 dark:border-[#3A3A3A]/50">
              <div 
                onClick={() => setProfilePhotoOpen(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-[#3A3A3A] shadow-sm shrink-0 cursor-pointer hover:scale-110 transition-transform"
              >
                {dentist.profilePhoto?.url ? (
                  <img src={dentist.profilePhoto.url} alt={dentist.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="w-full h-full p-2 bg-[#F3F2EF] dark:bg-[#1A1A1A] text-[#666666]/50" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#191919] dark:text-white">Dr. {dentist.name}</p>
                <p className="text-[10px] font-semibold text-[#666666] dark:text-gray-500 uppercase">{data.clinicName || 'Clinical Case'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Case Focus ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="">

          {/* Case Details */}
          <div className="lg:col-span-8 space-y-6">

            {caseData.description && (
              <section className="bg-white w-full dark:bg-[#252525] border border-[#E0DFDC] dark:border-[#3A3A3A] p-6 sm:p-8 rounded-2xl mt-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#0A66C2]" />
                <p className="text-lg text-[#191919] dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{caseData.description}</p>
              </section>
            )}

            {/* Gallery Grid */}
            <section className="pt-8">
              <h3 className="text-xs font-bold text-[#666666] dark:text-gray-400 uppercase mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-[#E0DFDC] dark:bg-[#3A3A3A]" /> Case Gallery
              </h3>

              {allImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {allImages.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      onClick={() => openLightbox(i)}
                      className="group relative aspect-[4/3] rounded-3xl overflow-hidden bg-white dark:bg-[#252525] cursor-pointer border border-[#E0DFDC] dark:border-[#3A3A3A] shadow-sm transition-all"
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-[#0A66C2]/0 group-hover:bg-[#0A66C2]/5 transition-colors" />
                      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <ZoomIn size={18} className="text-[#0A66C2]" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center bg-white dark:bg-[#252525] rounded-3xl border border-[#E0DFDC] dark:border-[#3A3A3A]">
                  <p className="font-bold text-[#666666] dark:text-gray-500 text-xs uppercase">No images found for this case</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ── 3. More from Doctor Showcase ── */}
      {otherCases.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-12 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#191919] dark:text-white tracking-tight leading-none text-center sm:text-left">More from Dr. {dentist.name}</h2>
              <p className="text-[10px] font-black text-[#666666] dark:text-gray-400 uppercase tracking-widest mt-1 text-center sm:text-left">Explore other  results</p>
            </div>
            <Link
              to={`/portfolio/${slug}`}
              className="text-xs font-black text-[#0A66C2] uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center justify-center gap-2"
            >
              View Full Portfolio <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCases.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/portfolio/${slug}/case/${c._id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="group block bg-white dark:bg-[#252525] rounded-3xl overflow-hidden border border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]/40 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-[#F3F2EF] dark:bg-[#1A1A1A]">
                    {c.coverImage ? (
                      <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase size={32} className="text-[#666666]/10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-sm text-[#0A66C2] text-[9px] font-black uppercase rounded-lg shadow-sm border border-[#E0DFDC] dark:border-[#3A3A3A]">
                        {c.category || 'Clinical Case'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-[#191919] dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><X size={32} /></button>
            <motion.img
              key={lightboxIndex}
              src={allImages[lightboxIndex]}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-10 flex gap-4">
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p - 1 + allImages.length) % allImages.length); }} className="btn btn-circle bg-white/10 border-none text-white overflow-hidden hover:bg-white/20"><ChevronLeft /></button>
                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % allImages.length); }} className="btn btn-circle bg-white/10 border-none text-white overflow-hidden hover:bg-white/20"><ChevronRight /></button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
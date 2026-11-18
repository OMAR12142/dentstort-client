import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, X, ChevronLeft, ChevronRight,
  Share2, Check, Briefcase, User, ZoomIn, Columns2, EyeOff
} from 'lucide-react';
import { usePublicPortfolio, usePublicCase } from '../../hooks/usePortfolio';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import SEO from '../../components/common/SEO';
import SafeImage from '../../components/portfolio/SafeImage';
import BeforeAfterSlider from '../../components/portfolio/public/BeforeAfterSlider';
import PublicCaseDetailSkeleton from '../../components/portfolio/public/PublicCaseDetailSkeleton';
import { formatDoctorDisplayName } from '../../utils/portfolioFormatters';

function scrollToTopInstant() {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    window.scrollTo(0, 0);
  }
}

export default function PublicCaseDetailPage() {
  const { slug, caseId } = useParams();
  const navigate = useNavigate();

  // Always start at the top when entering or switching between cases
  useEffect(() => {
    scrollToTopInstant();
  }, [slug, caseId]);
  
  // Fetch specific case data independently of pagination
  const { data: caseRes, isLoading: caseLoading, error: caseError } = usePublicCase(slug, caseId);
  // Fetch portfolio data for "other cases" context
  const { data: portfolioRes, isLoading: portLoading } = usePublicPortfolio(slug);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  const caseData = caseRes?.case;
  const dentist = caseRes?.dentist;

  const metaTitle =
    caseData && dentist ? `${caseData.title} — Dr. ${dentist.name} | DentStory` : null;
  const metaDescription =
    caseData && dentist
      ? caseData.description
        ? caseData.description.substring(0, 150)
        : `Clinical case detail on Dr. ${dentist.name}'s portfolio.`
      : null;
  useDocumentMeta(metaTitle, metaDescription);

  if (caseLoading || portLoading) {
    return <PublicCaseDetailSkeleton />;
  }

  if (caseError || !caseData || !dentist) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 bg-base-100">
        <div className="w-20 h-20 bg-base-200 border border-neutral-light rounded-full flex items-center justify-center">
          <Briefcase size={32} className="text-base-content/60" />
        </div>
        <h2 className="text-2xl font-bold text-base-content">Record Not Found</h2>
        <button onClick={() => navigate(-1)} className="btn bg-primary text-primary-content rounded-full px-8 border-none hover:bg-primary/90">Return</button>
      </div>
    );
  }

  const allImagesRaw = caseData.selectedImages || [];
  const allImages = caseData.coverImage
    ? [caseData.coverImage, ...allImagesRaw.filter(img => img !== caseData.coverImage)]
    : allImagesRaw;

  const hasExplicitBeforeAfter =
    Boolean(caseData.beforeImage) &&
    Boolean(caseData.afterImage) &&
    caseData.beforeImage !== caseData.afterImage &&
    allImages.includes(caseData.beforeImage) &&
    allImages.includes(caseData.afterImage);

  const sliderBeforeImage = hasExplicitBeforeAfter ? caseData.beforeImage : allImages[0];
  const sliderAfterImage = hasExplicitBeforeAfter ? caseData.afterImage : allImages[1];

  const otherCases = portfolioRes?.cases?.filter(c => c._id !== caseId).slice(0, 3) || [];

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

  const treatmentTypes = Array.isArray(caseData.treatmentType)
    ? caseData.treatmentType.filter(Boolean)
    : caseData.treatmentType
      ? [caseData.treatmentType]
      : ['General'];
  const doctorDisplayName = formatDoctorDisplayName(dentist.name);

  return (
    <div className="bg-base-100 min-h-screen pb-16 font-sans transition-colors duration-300">
      <SEO
        title={`${caseData.title} — ${doctorDisplayName}`}
        description={caseData.description?.substring(0, 150) || `Clinical case detail on ${doctorDisplayName}'s portfolio.`}
      />

      {caseRes?.isDraftPreview && (
        <div className="bg-warning/15 border-b border-warning/30 text-base-content">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <EyeOff size={15} className="text-warning shrink-0" />
              <span>Private Draft Preview — This case is not visible to patients until your portfolio is live.</span>
            </div>
            <Link
              to="/portfolio/manage"
              className="px-3 py-1 rounded-lg bg-base-200 border border-neutral-light text-xs font-bold text-base-content hover:border-primary hover:text-primary transition-colors shrink-0"
            >
              Back to Editor
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. Compact Case Header ── */}
      <div className="bg-base-200 border-b border-neutral-light transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/portfolio/${slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-base-content/65 hover:text-primary transition-colors uppercase tracking-wider"
            >
              <ArrowLeft size={15} className="rtl:rotate-180 shrink-0" />
              <span className="truncate">Back to Portfolio</span>
            </Link>
            <button
              type="button"
              onClick={handleShare}
              className="btn btn-xs btn-outline border-neutral-light text-base-content rounded-full px-3.5 font-bold uppercase transition-all hover:bg-primary/5 shrink-0"
            >
              {copied ? <Check size={12} className="text-success" /> : <Share2 size={12} />} {copied ? 'Linked!' : 'Share'}
            </button>
          </div>

          {/* Treatment Pills, Title & Compact Doctor Badge */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {treatmentTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
                  >
                    {type}
                  </span>
                ))}
                {caseData.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-100 text-base-content/75 border border-neutral-light">
                    {caseData.category}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight leading-snug break-words">
                {caseData.title}
              </h1>
            </div>

            {/* Compact Doctor Badge */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-light/60">
              <div
                onClick={() => setProfilePhotoOpen(true)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-base-100 shadow-sm shrink-0 cursor-pointer hover:scale-105 transition-transform"
              >
                <SafeImage
                  src={dentist.profilePhoto?.url}
                  alt={doctorDisplayName}
                  className="w-full h-full object-cover"
                  fallback={<User size={16} className="text-base-content/50" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs sm:text-sm font-bold text-base-content truncate">{doctorDisplayName}</p>
                {portfolioRes?.clinicName && (
                  <p className="text-[10px] font-semibold text-base-content/60 truncate max-w-[180px]">
                    {portfolioRes.clinicName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Editorial Body (Before/After Showcase + Compact Gallery + Clinical Summary) ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Interactive Before/After Comparison (fits in viewport right below header) */}
        {allImages.length >= 2 && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-bold text-base-content/60 uppercase tracking-wider flex items-center gap-2.5">
                <span className="w-6 h-px bg-primary/40" />
                <span>Clinical Transformation</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowComparison((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  showComparison
                    ? 'bg-primary text-primary-content border-primary'
                    : 'bg-base-200 text-base-content border-neutral-light hover:border-primary'
                }`}
              >
                <Columns2 size={13} />
                {showComparison ? 'Hide Before / After' : 'Compare Before / After'}
              </button>
            </div>

            {showComparison && (
              <BeforeAfterSlider
                beforeImage={sliderBeforeImage}
                afterImage={sliderAfterImage}
                altPrefix={caseData.title}
              />
            )}
          </section>
        )}

        {/* Compact Clinical Gallery Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold text-base-content/60 uppercase tracking-wider flex items-center gap-2.5">
              <span className="w-6 h-px bg-primary/40" />
              <span>Case Photos ({allImages.length})</span>
            </h2>
            {allImages.length > 0 && (
              <span className="text-[11px] text-base-content/55 font-medium">
                Click any photo to view fullscreen
              </span>
            )}
          </div>

          {allImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allImages.map((img, i) => {
                const isBefore = hasExplicitBeforeAfter && caseData.beforeImage === img;
                const isAfter = hasExplicitBeforeAfter && caseData.afterImage === img;
                const isCover = caseData.coverImage === img;
                const badgeLabel = isBefore ? 'Before' : isAfter ? 'After' : isCover ? 'Cover' : null;

                return (
                  <motion.div
                    key={`${img}-${i}`}
                    whileHover={{ y: -2 }}
                    onClick={() => openLightbox(i)}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-base-200 cursor-pointer border border-neutral-light hover:border-primary/50 shadow-sm transition-all"
                  >
                    <SafeImage
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      fallback={<Briefcase size={24} className="text-base-content/15" />}
                      fallbackClassName="w-full h-full flex items-center justify-center bg-base-200"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                    {badgeLabel && (
                      <span
                        className={`pointer-events-none absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm ${
                          isBefore
                            ? 'bg-black/70 text-white border border-white/15 backdrop-blur-sm'
                            : isAfter
                              ? 'bg-primary text-primary-content'
                              : 'bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-sm'
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 bg-base-200/90 backdrop-blur-md rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow border border-neutral-light">
                      <ZoomIn size={14} className="text-primary" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-base-200 rounded-2xl border border-neutral-light">
              <p className="font-bold text-base-content/60 text-xs uppercase">No images found for this case</p>
            </div>
          )}
        </section>

        {/* Clean Clinical Summary Card */}
        {caseData.description && (
          <section className="bg-base-200 w-full border border-neutral-light p-4 sm:p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <h2 className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider mb-2">
              Clinical Notes
            </h2>
            <p className="text-sm sm:text-base text-base-content/90 leading-relaxed whitespace-pre-wrap break-words">
              {caseData.description}
            </p>
          </section>
        )}
      </div>

      {/* ── 3. More from Doctor Showcase ── */}
      {otherCases.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 pt-8 border-t border-neutral-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-base-content tracking-tight">
                More from {doctorDisplayName}
              </h2>
              <p className="text-[11px] font-semibold text-base-content/60">
                Explore other documented results
              </p>
            </div>
            <Link
              to={`/portfolio/${slug}`}
              className="text-xs font-bold text-primary uppercase tracking-wider hover:opacity-75 transition-opacity inline-flex items-center justify-center gap-1.5"
            >
              View Full Portfolio <ChevronRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {otherCases.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/portfolio/${slug}/case/${c._id}`}
                  className="group block bg-base-200 rounded-2xl overflow-hidden border border-neutral-light hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-base-100">
                    <SafeImage
                      src={c.coverImage || c.selectedImages?.[0]}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      fallback={<Briefcase size={28} className="text-base-content/15" />}
                      fallbackClassName="w-full h-full flex items-center justify-center bg-base-100"
                    />
                    {c.category && (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 bg-base-200/90 backdrop-blur-sm text-primary text-[9px] font-bold uppercase rounded-md shadow-sm border border-neutral-light">
                          {c.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base text-base-content group-hover:text-primary transition-colors line-clamp-1">
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              aria-label="Close fullscreen gallery"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 end-4 sm:top-6 sm:end-6 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all z-20 cursor-pointer"
            >
              <X size={24} />
            </button>
            <motion.img
              key={lightboxIndex}
              src={allImages[lightboxIndex]}
              className="max-w-[94vw] max-h-[80dvh] sm:max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-6 sm:bottom-10 flex items-center gap-4 z-20">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p - 1 + allImages.length) % allImages.length); }}
                  className="btn btn-circle bg-white/15 border-none text-white hover:bg-white/25"
                >
                  <ChevronLeft className="rtl:rotate-180" />
                </button>
                <span className="text-xs font-bold text-white/80 tabular-nums">
                  {lightboxIndex + 1} / {allImages.length}
                </span>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % allImages.length); }}
                  className="btn btn-circle bg-white/15 border-none text-white hover:bg-white/25"
                >
                  <ChevronRight className="rtl:rotate-180" />
                </button>
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
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setProfilePhotoOpen(false)}
          >
            <button
              type="button"
              aria-label="Close profile photo"
              onClick={() => setProfilePhotoOpen(false)}
              className="absolute top-4 end-4 sm:top-6 sm:end-6 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all z-20 cursor-pointer"
            >
              <X size={24} />
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
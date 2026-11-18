import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { User, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePublicPortfolio } from '../../hooks/usePortfolio';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import SEO from '../../components/common/SEO';

// Refactored Components
import PublicPortfolioSkeleton from '../../components/portfolio/public/PublicPortfolioSkeleton';
import PublicPortfolioHeader from '../../components/portfolio/public/PublicPortfolioHeader';
import PublicPortfolioInfo from '../../components/portfolio/public/PublicPortfolioInfo';
import PublicCaseShowcase from '../../components/portfolio/public/PublicCaseShowcase';
import PublicProfilePhotoLightbox from '../../components/portfolio/public/PublicProfilePhotoLightbox';
import { formatDoctorDisplayName } from '../../utils/portfolioFormatters';

/**
 * PublicPortfolioPage — Enhanced clinical showcase for a dentist.
 * Matches the premium design language of PublicCaseDetailPage.
 */
export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation('portfolio');
  const isArabic = i18n.language?.startsWith('ar');
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [profilePhotoOpen, setProfilePhotoOpen] = useState(false);
  const limit = 12;
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { data, isLoading, error } = usePublicPortfolio(slug, page, limit, selectedFilter);

  const loadedDentistName = data?.dentist?.name;
  const formattedDoctorTitle = loadedDentistName
    ? formatDoctorDisplayName(loadedDentistName, isArabic)
    : null;
  const metaTitle = formattedDoctorTitle
    ? `${formattedDoctorTitle} — Dental Portfolio | DentStory`
    : null;
  const metaDescription = formattedDoctorTitle
    ? data?.bio
      ? data.bio.substring(0, 150)
      : `View ${formattedDoctorTitle}'s professional clinical portfolio.`
    : null;
  useDocumentMeta(metaTitle, metaDescription);

  // Always start at the top on entry / slug change (unless targeting #contact anchor)
  useEffect(() => {
    if (location.hash === '#contact') return;
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [slug, location.hash]);

  // Support smooth scroll to #contact when navigating from a Case Detail page
  useEffect(() => {
    if (!isLoading && data && location.hash === '#contact') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isLoading, data, location.hash]);

  const BASE_TREATMENT_TYPES = [
    'All', 'Surgery', 'Implant', 'Endo', 'Perio', 'Fixed', 'Removable', 'Restorative', 'General'
  ];

  // Use the available types returned by the backend (which scans the whole portfolio, not just one page)
  const dynamicTreatmentTypes = data?.availableTreatmentTypes || [];
    
  // Merge base types with any dynamic custom ones, removing duplicates
  const TREATMENT_TYPES = [...new Set([...BASE_TREATMENT_TYPES, ...dynamicTreatmentTypes])];

  const handleFilterChange = (type) => {
    setSelectedFilter(type);
    setPage(1); // Reset to page 1 when changing filters
  };

  // Scroll to grid on page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const element = document.getElementById('cases-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) return <PublicPortfolioSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 bg-base-100">
        <div className="w-20 h-20 bg-base-200 border border-neutral-light rounded-full flex items-center justify-center">
          <User size={32} className="text-base-content/30" />
        </div>
        <h2 className="text-2xl font-black text-base-content">{t('public.profileNotFound')}</h2>
        <Link to="/" className="btn btn-primary rounded-full px-8">{t('public.returnHome')}</Link>
      </div>
    );
  }

  const {
    dentist,
    coverPhoto,
    coverTheme,
    bio,
    yearsOfExperience,
    services,
    contactEmail,
    contactPhone,
    clinicName,
    clinicAddress,
    cases,
    pagination,
    isDraftPreview,
  } = data;

  return (
    <div className="bg-base-100 min-h-screen pb-8 font-sans transition-colors duration-300">
      <SEO
        title={`${formattedDoctorTitle} — Dental Portfolio`}
        description={bio ? bio.substring(0, 150) : `View ${formattedDoctorTitle}'s professional clinical portfolio.`}
      />

      {/* ── Private Owner Draft Preview Banner ── */}
      {isDraftPreview && (
        <div className="bg-warning/15 border-b border-warning/30 text-base-content">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <EyeOff size={15} className="text-warning shrink-0" />
              <span>
                {isArabic
                  ? 'أنت تشاهد معاينة خاصة (مسودة) — هذا المعرض غير مرئي للمرضى حتى تقوم بنشره.'
                  : 'Private Draft Preview — This portfolio is not visible to patients until you click Go Live Now.'}
              </span>
            </div>
            <Link
              to="/portfolio/manage"
              className="px-3 py-1 rounded-lg bg-base-200 border border-neutral-light text-xs font-bold text-base-content hover:border-primary hover:text-primary transition-colors shrink-0"
            >
              {isArabic ? 'العودة إلى المحرر' : 'Back to Editor'}
            </Link>
          </div>
        </div>
      )}

      {/* ── 1. Profile Header ── */}
      <PublicPortfolioHeader
        dentist={dentist}
        coverPhoto={coverPhoto}
        coverTheme={coverTheme}
        clinicName={clinicName}
        yearsOfExperience={yearsOfExperience}
        totalCases={pagination?.totalItems || cases?.length || 0}
        onPhotoClick={() => setProfilePhotoOpen(true)}
      />

      {/* ── 2. Information Row (Bio & Contact Card) + 3. Case Showcase ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        <PublicPortfolioInfo
          bio={bio}
          services={services}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          clinicName={clinicName}
          clinicAddress={clinicAddress}
          dentistName={dentist.name}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />

        <PublicCaseShowcase
          cases={cases}
          slug={slug}
          selectedFilter={selectedFilter}
          setSelectedFilter={handleFilterChange}
          treatmentTypes={TREATMENT_TYPES}
          pagination={pagination}
          page={page}
          onPageChange={handlePageChange}
        />
      </div>

      {/* ── Lightbox Overlay ── */}
      <PublicProfilePhotoLightbox
        isOpen={profilePhotoOpen}
        photoUrl={dentist.profilePhoto?.url}
        dentistName={dentist.name}
        onClose={() => setProfilePhotoOpen(false)}
      />
    </div>
  );
}

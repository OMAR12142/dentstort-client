import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { usePublicPortfolio } from '../../hooks/usePortfolio';
import SEO from '../../components/common/SEO';

// Refactored Components
import PublicPortfolioSkeleton from '../../components/portfolio/public/PublicPortfolioSkeleton';
import PublicPortfolioHeader from '../../components/portfolio/public/PublicPortfolioHeader';
import PublicPortfolioInfo from '../../components/portfolio/public/PublicPortfolioInfo';
import PublicCaseShowcase from '../../components/portfolio/public/PublicCaseShowcase';
import PublicProfilePhotoLightbox from '../../components/portfolio/public/PublicProfilePhotoLightbox';

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

  const TREATMENT_TYPES = [
    'All', 'Surgery', 'Implant', 'Endo', 'Perio', 'Fixed', 'Removable', 'Restorative', 'General'
  ];

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
        <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center">
          <User size={32} className="text-base-content/30" />
        </div>
        <h2 className="text-2xl font-black text-base-content">Profile Not Found</h2>
        <Link to="/" className="btn btn-primary rounded-full px-8">Return Home</Link>
      </div>
    );
  }

  const {
    dentist, bio, yearsOfExperience, services, contactEmail, contactPhone, cases, pagination
  } = data;

  return (
    <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] min-h-screen pb-2 font-sans transition-colors duration-300">
      <SEO
        title={`Dr. ${dentist.name} — Dental Portfolio`}
        description={bio ? bio.substring(0, 150) : `View Dr. ${dentist.name}'s professional clinical portfolio.`}
      />

      {/* ── 1. Profile Header ── */}
      <PublicPortfolioHeader
        dentist={dentist}
        yearsOfExperience={yearsOfExperience}
        onPhotoClick={() => setProfilePhotoOpen(true)}
      />

      {/* ── 2. Information Row (Bio & Contact) ── */}
      <div className="py-4">
        <PublicPortfolioInfo
          bio={bio}
          services={services}
          contactEmail={contactEmail}
          contactPhone={contactPhone}
          dentistName={dentist.name}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      </div>

      {/* ── 3. Case Showcase ── */}
      <PublicCaseShowcase
        cases={cases}
        slug={slug}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        treatmentTypes={TREATMENT_TYPES}
        pagination={pagination}
        page={page}
        onPageChange={handlePageChange}
      />

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

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Globe, GlobeLock, Eye, EyeOff, Share2, Plus, Pencil, Trash2, X, Upload, ArrowLeftRight, Images,
  Briefcase, Mail, Phone, MapPin, Clock, CheckCircle2, User, ExternalLink, Link2,
  AlertCircle, Loader2, Image as ImageIcon, Check, ChevronLeft, ChevronRight, FileText, Search
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SEO from '../../components/common/SEO';
import SafeImage from '../../components/portfolio/SafeImage';
import PortfolioEditorSkeleton, { MediaLibrarySkeleton } from '../../components/portfolio/PortfolioEditorSkeleton';
import BrandedPortfolioCover from '../../components/portfolio/public/BrandedPortfolioCover';
import { PORTFOLIO_COVER_THEMES, getCoverThemePreset } from '../../utils/portfolioCoverThemes';
import { formatDoctorDisplayName } from '../../utils/portfolioFormatters';
import { useAuthStore } from '../../store/authStore';
import {
  useMyPortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useUploadPortfolioCover,
  useTogglePortfolio,
  usePublishCase,
  useEditCase,
  useDeleteCase,
  useReorderCase,
  useUploadPortfolioImages,
  useMediaLibrary,
} from '../../hooks/usePortfolio';

// ════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════
const TREATMENT_TYPES = [
  'Surgery', 'Implant', 'Endo', 'Perio', 'Fixed', 'Removable', 'Restorative', 'General'
];
const MAX_CASE_IMAGES = 8;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate device-picked image files (MIME, 5 MB limit, remaining slots up to 8)
 * and upload valid files via the portfolio direct-upload mutation.
 */
function handleDeviceCaseUpload({
  files,
  selectedImages,
  uploadImages,
  setSelectedImages,
  setCoverImage,
  setError,
}) {
  if (!files.length) return;

  const remainingSlots = MAX_CASE_IMAGES - selectedImages.length;
  if (remainingSlots <= 0) {
    setError(`Maximum of ${MAX_CASE_IMAGES} images allowed per case.`);
    return;
  }

  const validFiles = [];
  const reasons = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      reasons.push('Only JPG, PNG, and WebP images are allowed.');
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      reasons.push('Each image must be 5 MB or smaller.');
      continue;
    }
    validFiles.push(file);
  }

  if (validFiles.length === 0) {
    setError([...new Set(reasons)].join(' ') || 'No valid images selected.');
    return;
  }

  const toUpload = validFiles.slice(0, remainingSlots);
  if (validFiles.length > remainingSlots) {
    reasons.push(`Only uploading ${remainingSlots} image(s) to stay within the ${MAX_CASE_IMAGES}-image limit.`);
  }

  const warningMsg = [...new Set(reasons)].join(' ');
  setError(warningMsg);

  uploadImages(toUpload, {
    onSuccess: (res) => {
      const uploadedUrls = Array.isArray(res?.urls) ? res.urls : [];
      if (uploadedUrls.length === 0) {
        setError('Upload completed, but no image URLs were returned.');
        return;
      }
      setSelectedImages((prev) => {
        const merged = [...prev];
        for (const url of uploadedUrls) {
          if (!merged.includes(url) && merged.length < MAX_CASE_IMAGES) {
            merged.push(url);
          }
        }
        setCoverImage((curr) => curr || merged[0] || '');
        return merged;
      });
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'Failed to upload images. Please try again.');
    },
  });
}

function DeviceImageUploadZone({ selectedCount, isUploading, onFilesSelected, compact = false }) {
  const remaining = Math.max(0, MAX_CASE_IMAGES - selectedCount);
  const disabled = isUploading || remaining === 0;

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (picked.length > 0) {
      onFilesSelected(picked);
    }
  };

  if (compact) {
    return (
      <label
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-base-100 text-base-content/50 border-neutral-light'
            : 'cursor-pointer bg-primary/10 text-primary border-primary/30 hover:bg-primary/15'
        }`}
      >
        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {isUploading ? 'Uploading...' : `Upload from Device (${remaining} left)`}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          className="hidden"
          onChange={handleChange}
        />
      </label>
    );
  }

  return (
    <label
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-dashed rounded-2xl p-4 transition-all ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-neutral-light bg-base-100/50'
          : 'cursor-pointer border-primary/35 bg-primary/5 hover:border-primary hover:bg-primary/10'
      }`}
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-base-200 border border-neutral-light flex items-center justify-center text-primary shrink-0">
          {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        </div>
        <div>
          <p className="text-xs font-bold text-base-content">
            {isUploading
              ? 'Uploading photos from device...'
              : remaining === 0
                ? `Maximum of ${MAX_CASE_IMAGES} photos reached`
                : 'Upload from Device / Gallery'}
          </p>
          <p className="text-[11px] text-base-content/60">
            JPG, PNG, or WebP · Max 5 MB each · {remaining} of {MAX_CASE_IMAGES} slots remaining
          </p>
        </div>
      </div>
      <span className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-content text-[11px] font-bold shrink-0">
        {isUploading ? 'Uploading...' : 'Choose Files'}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled}
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}

function BeforeAfterStatusBar({ selectedImages, beforeImage, afterImage, onClear }) {
  if (selectedImages.length < 2) return null;
  const beforeIdx = beforeImage ? selectedImages.indexOf(beforeImage) : -1;
  const afterIdx = afterImage ? selectedImages.indexOf(afterImage) : -1;
  const hasAny = beforeIdx !== -1 || afterIdx !== -1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-base-100 border border-neutral-light rounded-xl px-3.5 py-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2 text-base-content/80">
        <span className="font-bold uppercase text-[10px] tracking-wider text-base-content/60">
          Before / After Slider:
        </span>
        {hasAny ? (
          <>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${beforeIdx !== -1 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-base-200 text-base-content/50 border border-neutral-light'}`}>
              Before: {beforeIdx !== -1 ? `Photo #${beforeIdx + 1}` : 'Not set'}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${afterIdx !== -1 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-base-200 text-base-content/50 border border-neutral-light'}`}>
              After: {afterIdx !== -1 ? `Photo #${afterIdx + 1}` : 'Not set'}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-base-content/60">
            Optional — pick a Before &amp; After photo below (defaults to first 2 photos).
          </span>
        )}
      </div>
      {hasAny && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-bold text-base-content/60 hover:text-error transition-colors cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function ProfileIdentityForm({ portfolio, updatePortfolio, isUpdating }) {
  const [slugInput, setSlugInput] = useState(portfolio.slug || '');
  const [bio, setBio] = useState(portfolio.bio || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(portfolio.yearsOfExperience || 0);
  const [servicesInput, setServicesInput] = useState((portfolio.services || []).join(', '));
  const [contactEmail, setContactEmail] = useState(portfolio.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(portfolio.contactPhone || '');
  const [clinicName, setClinicName] = useState(portfolio.clinicName || '');
  const [clinicAddress, setClinicAddress] = useState(portfolio.clinicAddress || '');
  const [showClinicInfo, setShowClinicInfo] = useState(portfolio.showClinicInfo !== false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const successTimerRef = useRef(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    setProfileError('');
    if (successTimerRef.current) clearTimeout(successTimerRef.current);

    const payload = {
      bio,
      yearsOfExperience: parseInt(yearsOfExperience, 10) || 0,
      services: servicesInput.split(',').map((s) => s.trim()).filter(Boolean),
      contactEmail,
      contactPhone,
      clinicName,
      clinicAddress,
      showClinicInfo,
    };

    const trimmedSlug = slugInput.trim().toLowerCase();
    if (trimmedSlug && trimmedSlug !== portfolio.slug) {
      payload.slug = trimmedSlug;
    }

    updatePortfolio(payload, {
      onSuccess: (updated) => {
        if (updated?.slug) setSlugInput(updated.slug);
        setUpdateSuccess(true);
        successTimerRef.current = setTimeout(() => setUpdateSuccess(false), 3000);
      },
      onError: (err) => {
        setProfileError(err?.response?.data?.message || 'Failed to save profile changes. Please try again.');
      },
    });
  };

  const slugPreview = slugInput
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (
    <div className="bg-base-200 border border-neutral-light rounded-2xl overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-neutral-light flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Briefcase size={16} className="text-primary" />
          </div>
          <h2 className="text-base font-bold text-base-content">Profile Identity</h2>
        </div>
        <AnimatePresence>
          {updateSuccess && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-success text-xs font-bold flex items-center gap-1 bg-success/10 px-3 py-1.5 rounded-full"
            >
              <CheckCircle2 size={14} /> Saved Successfully
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {profileError && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/25 flex items-center gap-2.5 text-error text-xs font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {/* Custom Portfolio URL / Slug */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-base-content flex items-center gap-2">
            <Link2 size={16} className="text-primary" /> Custom Portfolio URL
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center rounded-xl border border-neutral-light bg-base-100 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <span className="px-4 py-2.5 sm:py-3 text-xs font-semibold text-base-content/55 bg-base-200/70 border-b sm:border-b-0 sm:border-e border-neutral-light select-all truncate">
              {window.location.origin}/portfolio/
            </span>
            <input
              type="text"
              value={slugInput}
              onChange={(e) => {
                setSlugInput(e.target.value);
                setProfileError('');
              }}
              placeholder="dr-your-name"
              className="flex-1 bg-transparent py-2.5 sm:py-3 px-4 text-sm font-semibold text-base-content focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-base-content/60">
            Letters, numbers, and hyphens only (3–60 characters). Preview:{' '}
            <span className="font-mono text-primary">/portfolio/{slugPreview || portfolio.slug}</span>
          </p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-base-content flex items-center gap-2">
            Professional Summary
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full bg-base-100 border border-neutral-light rounded-xl p-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
            placeholder="Introduce yourself to patients. Mention your specialties, philosophy, and professional background..."
          />
        </div>

        {/* Experience and Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-base-content">Years of Clinical Experience</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60" size={16} />
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                min="0"
                className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 pl-10 pr-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-base-content">Clinical Specialties</label>
            <input
              type="text"
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="e.g. Implants, Cosmetic Dentistry, Orthodontics"
              className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <p className="text-[10px] text-base-content/60 font-medium">Separate specialties with commas.</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-light">
          <div className="space-y-2">
            <label className="text-sm font-bold text-base-content flex items-center gap-2">
              <Mail size={16} className="text-primary" /> Public Inquiry Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="dr.name@example.com"
              className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-base-content flex items-center gap-2">
              <Phone size={16} className="text-[#25D366]" /> WhatsApp / Phone
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+20 123 456 7890"
              className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Clinic Information + Visibility Toggle */}
        <div className="space-y-4 pt-4 border-t border-neutral-light">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-base-100 border border-neutral-light rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              {showClinicInfo ? (
                <Eye size={16} className="text-primary shrink-0" />
              ) : (
                <EyeOff size={16} className="text-base-content/50 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-base-content">
                  Show clinic name &amp; location publicly
                </p>
                <p className="text-[11px] text-base-content/60">
                  {showClinicInfo
                    ? 'Visitors can see your clinic name and address on your public portfolio.'
                    : 'Hidden — your workplace name and address will not be shown on your public portfolio.'}
                </p>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={showClinicInfo}
                onChange={(e) => setShowClinicInfo(e.target.checked)}
                className="toggle toggle-primary toggle-sm"
              />
              <span className="text-xs font-bold text-base-content/80">
                {showClinicInfo ? 'Visible' : 'Hidden'}
              </span>
            </label>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${showClinicInfo ? 'opacity-100' : 'opacity-60'}`}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-base-content flex items-center gap-2">
                <MapPin size={16} className="text-error" /> Clinic Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Dental Care Center"
                className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-base-content">Clinic Address</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="Full street address or city..."
                className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-primary text-primary-content px-10 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Apply Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ════════════════════════════════════════════════
//  MAIN EDITOR PAGE
// ════════════════════════════════════════════════
export default function PortfolioEditorPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data: portfolio, isLoading } = useMyPortfolio(page, limit);
  const { mutate: createPortfolio, isPending: isCreating } = useCreatePortfolio();
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolio();
  const { mutate: uploadCoverPhoto, isPending: isUploadingCover } = useUploadPortfolioCover();
  const { mutate: togglePortfolio, isPending: isToggling } = useTogglePortfolio();
  const { mutate: deleteCase } = useDeleteCase();

  // Modal states
  const [addCaseModal, setAddCaseModal] = useState(false);
  const [editCaseModal, setEditCaseModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copied, setCopied] = useState(false);

  // Cover feedback state
  const [coverError, setCoverError] = useState('');
  const [coverSaved, setCoverSaved] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'cases'

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (!portfolio.isPublished) {
      toast('Link copied! Remember to click "Go Live Now" before patients can view your portfolio.', {
        icon: '⚠️',
        duration: 4500,
      });
    }
  };

  const flashCoverSaved = () => {
    setCoverSaved(true);
    setTimeout(() => setCoverSaved(false), 2500);
  };

  const handleCoverFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCoverError('');
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setCoverError('Only JPG, PNG, and WebP images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setCoverError('Cover photo must be 5 MB or smaller.');
      return;
    }
    uploadCoverPhoto(file, {
      onSuccess: () => flashCoverSaved(),
      onError: (err) => setCoverError(err?.response?.data?.message || 'Failed to upload cover photo.'),
    });
  };

  const handleRemoveCoverPhoto = () => {
    setCoverError('');
    updatePortfolio({ coverPhoto: null }, {
      onSuccess: () => flashCoverSaved(),
      onError: (err) => setCoverError(err?.response?.data?.message || 'Failed to remove cover photo.'),
    });
  };

  const handleSelectCoverTheme = (themeId) => {
    setCoverError('');
    updatePortfolio({ coverTheme: themeId }, {
      onSuccess: () => flashCoverSaved(),
      onError: (err) => setCoverError(err?.response?.data?.message || 'Failed to update cover theme.'),
    });
  };

  const { mutate: reorderCase } = useReorderCase();

  const handleReorder = (caseId, direction) => {
    reorderCase({ caseId, direction });
  };

  const handleDeleteCase = (caseId) => {
    deleteCase(caseId, {
      onSuccess: () => {
        setConfirmDelete(null);
        if (page > 1 && portfolio?.publishedCases?.length === 1) {
          setPage((p) => Math.max(1, p - 1));
        }
      },
    });
  };

  // ── Loading state ──
  if (isLoading) {
    return <PortfolioEditorSkeleton />;
  }

  // ── No portfolio yet — show creation CTA ──
  if (!portfolio) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <SEO title="Portfolio Editor" noindex />
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-base-content tracking-tight">Portfolio</h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Create your public portfolio to showcase your dental work.
          </p>
        </div>

        <Card className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Briefcase size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-base-content mb-2">Create Your Portfolio</h2>
          <p className="text-sm text-base-content/60 max-w-md mx-auto mb-6">
            Build a beautiful, shareable page to showcase your clinical work to patients and colleagues. Like Behance, but for dentists.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 max-w-md mx-auto mb-8 text-left">
            <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
              <AlertCircle size={16} /> How to build your portfolio?
            </h3>
            <p className="text-xs text-base-content/70 leading-relaxed mb-3">
              You can start showcasing your work right away in two easy ways:
            </p>
            <ol className="text-xs text-base-content/70 list-decimal list-inside space-y-2 ml-1 font-medium">
              <li><strong>Upload directly from your phone or computer gallery</strong> (up to 8 photos per case).</li>
              <li>Or pick existing clinical photos from your <strong>Session Media Library</strong>.</li>
              <li>Mark your <strong>Before &amp; After</strong> photos, preview your draft, and go live!</li>
            </ol>
          </div>
          <Button
            onClick={() => createPortfolio({})}
            loading={isCreating}
            className="px-8"
          >
            <Plus size={18} />
            Create Portfolio
          </Button>
        </Card>
      </div>
    );
  }

  // ── Portfolio exists — show editor ──
  const publicUrl = `${window.location.origin}/portfolio/${portfolio.slug}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <SEO title="Portfolio Editor" noindex />

      {/* ── 1. Identity Dashboard Header ── */}
      <div className="bg-base-200 border border-neutral-light shadow-sm rounded-2xl p-4 sm:p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <Globe className="text-primary" size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-base-content tracking-tight">Public Portfolio</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${portfolio.isPublished
                  ? 'bg-success/10 text-success border-success/20'
                  : 'bg-warning/15 text-warning border-warning/30'
                  }`}>
                  {portfolio.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-base-content/65 hover:text-primary transition-colors max-w-full truncate"
              >
                <Link2 size={12} className="text-primary shrink-0" />
                <span className="truncate">{publicUrl}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            {/* Toggle Published */}
            <button
              type="button"
              disabled={isToggling}
              onClick={() => togglePortfolio()}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${portfolio.isPublished
                ? 'bg-base-100 text-error border-error/30 hover:bg-error/5'
                : 'bg-primary text-primary-content border-transparent hover:bg-primary/90 shadow-lg shadow-primary/20'
                }`}
            >
              {isToggling ? (
                <Loader2 size={16} className="animate-spin" />
              ) : portfolio.isPublished ? (
                <GlobeLock size={16} />
              ) : (
                <Globe size={16} />
              )}
              {isToggling
                ? 'Updating...'
                : portfolio.isPublished
                  ? 'Unpublish'
                  : 'Go Live Now'}
            </button>

            {/* Copy & Preview (Always available — Preview Draft when unpublished) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all whitespace-nowrap"
              >
                <Eye size={16} className="shrink-0" />
                <span>{portfolio.isPublished ? 'Preview' : 'Preview Draft'}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-base-100 text-base-content/75 border border-neutral-light hover:border-primary/40 hover:text-primary transition-all cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check size={16} className="text-success shrink-0" /> : <Share2 size={16} className="shrink-0" />}
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex items-center gap-1 bg-base-200 p-1 rounded-2xl border border-neutral-light w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile'
            ? 'bg-primary text-primary-content shadow-md'
            : 'text-base-content/60 hover:bg-base-100'
            }`}
        >
          <Briefcase size={16} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'cases'
            ? 'bg-primary text-primary-content shadow-md'
            : 'text-base-content/60 hover:bg-base-100'
            }`}
        >
          <ImageIcon size={16} />
          Cases
          {(portfolio.pagination?.totalItems || portfolio.publishedCases?.length) > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ms-1 ${activeTab === 'cases' ? 'bg-white/20' : 'bg-base-content/10 text-base-content'}`}>
              {portfolio.pagination?.totalItems || portfolio.publishedCases.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="profile" className="space-y-6">
          {/* ── Account Identity Shortcut (Avatar & Display Name) ── */}
          <div className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/25 bg-base-100 shrink-0">
                <SafeImage
                  src={user?.profilePhoto?.url}
                  alt={user?.name || 'Doctor profile'}
                  className="w-full h-full object-cover"
                  fallback={<User size={24} className="text-primary/40" />}
                  fallbackClassName="w-full h-full flex items-center justify-center bg-primary/10"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-base-content truncate">
                  {formatDoctorDisplayName(user?.name || 'Dentist')}
                </p>
                <p className="text-xs text-base-content/60">
                  Your public portfolio displays your account profile photo and display name.
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all shrink-0"
            >
              <span>Update Photo &amp; Name in Account Settings</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          {/* ── Profile Cover Appearance Customizer ── */}
          {(() => {
            const activeCoverTheme = portfolio.coverTheme || 'clinical-blue';
            const activePreset = getCoverThemePreset(activeCoverTheme);
            const hasCustomCover = Boolean(portfolio.coverPhoto);
            return (
              <div className="bg-base-200 border border-neutral-light rounded-2xl overflow-hidden shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-neutral-light flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ImageIcon size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-base-content">Profile Cover Appearance</h2>
                      <p className="text-[11px] text-base-content/60">Upload a custom clinic banner or choose a curated clinical preset.</p>
                    </div>
                  </div>
                  {coverSaved && (
                    <span className="text-success text-xs font-bold flex items-center gap-1 bg-success/10 px-3 py-1.5 rounded-full shrink-0">
                      <CheckCircle2 size={14} /> Updated
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-6 space-y-5">
                  {coverError && (
                    <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-error text-xs font-bold">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{coverError}</span>
                    </div>
                  )}

                  {/* Live Branded DentStory Cover Preview */}
                  <BrandedPortfolioCover
                    coverPhoto={portfolio.coverPhoto}
                    coverTheme={activeCoverTheme}
                    alt="Profile cover preview"
                    className="w-full h-36 sm:h-44 rounded-2xl"
                    patternId="editor-portfolio-cover-grid"
                    compact
                    interactive={false}
                  >
                    <span
                      className={`absolute bottom-3 start-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                        !hasCustomCover && activePreset.isLightSurface
                          ? 'bg-base-100/85 text-base-content border-neutral-light dark:bg-white/15 dark:text-white dark:border-white/20'
                          : 'bg-black/45 text-white border-white/15'
                      }`}
                    >
                      {hasCustomCover ? 'Custom Cover Photo' : activePreset.name}
                    </span>
                  </BrandedPortfolioCover>

                  {/* Upload / Remove Cover Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isUploadingCover
                            ? 'opacity-60 cursor-not-allowed bg-base-100 text-base-content/60 border-neutral-light'
                            : 'cursor-pointer bg-primary text-primary-content border-primary hover:bg-primary/90 shadow-md shadow-primary/20'
                        }`}
                      >
                        {isUploadingCover ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                        <span>{isUploadingCover ? 'Uploading Cover...' : 'Upload Cover Photo'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={isUploadingCover}
                          className="hidden"
                          onChange={handleCoverFileSelect}
                        />
                      </label>

                      {hasCustomCover && (
                        <button
                          type="button"
                          disabled={isUpdating || isUploadingCover}
                          onClick={handleRemoveCoverPhoto}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-base-100 text-error border border-error/30 hover:bg-error/10 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>Remove Cover Photo</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-base-content/60">
                      JPG, PNG, or WebP · Max 5 MB · Recommended 1600×500
                    </p>
                  </div>

                  {/* Curated Cover Theme Presets */}
                  <div className="pt-4 border-t border-neutral-light space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-base-content">Curated Cover Presets</span>
                      {hasCustomCover && (
                        <span className="text-[11px] text-base-content/60">
                          Shown whenever no custom cover photo is set
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PORTFOLIO_COVER_THEMES.map((preset) => {
                        const isSelected = activeCoverTheme === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleSelectCoverTheme(preset.id)}
                            className={`group text-start rounded-xl p-2 bg-base-100 border-2 transition-all cursor-pointer disabled:opacity-60 ${
                              isSelected
                                ? 'border-primary shadow-md shadow-primary/15'
                                : 'border-neutral-light hover:border-primary/40'
                            }`}
                          >
                            <div className={`w-full h-12 rounded-lg relative overflow-hidden border border-black/10 ${preset.swatchClass}`}>
                              {isSelected && (
                                <span className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center shadow">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs font-bold text-base-content truncate px-0.5">
                              {preset.name}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <ProfileIdentityForm
            key={portfolio._id}
            portfolio={portfolio}
            updatePortfolio={updatePortfolio}
            isUpdating={isUpdating}
          />
        </motion.div>
      )}

      {/* ── Tab Content: Cases Gallery ── */}
      {activeTab === 'cases' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="cases">
          <div className="bg-base-200 border border-base-content/10 rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-base-content/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} className="text-primary" />
                </div>
                <h2 className="text-base font-bold text-base-content">Clinical Portfolio Gallery</h2>
              </div>
              <button
                onClick={() => setAddCaseModal(true)}
                className="bg-primary text-white px-4 sm:px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus size={16} /> Add Case Study
              </button>
            </div>

            {(!portfolio.publishedCases || portfolio.publishedCases.length === 0) ? (
              <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border-2 border-dashed border-base-content/5">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ImageIcon size={28} className="text-base-content/30" />
                </div>
                <h3 className="text-sm font-bold text-base-content mb-2">No Clinical Cases Yet</h3>

                <div className="bg-base-200 border border-neutral-light rounded-xl p-5 max-w-sm mx-auto mb-6 text-left">
                  <h4 className="text-xs font-bold text-base-content mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-primary" /> Ready to add your first case?
                  </h4>
                  <ol className="text-xs text-base-content/70 list-decimal list-inside space-y-2 ml-1 font-medium">
                    <li>Upload up to <strong>8 photos</strong> directly from your phone or computer gallery</li>
                    <li>Or pick existing clinical photos from your <strong>Session Media Library</strong></li>
                    <li>Select a cover &amp; optional <strong>Before / After</strong> pair to publish!</li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => setAddCaseModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-content text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <Plus size={15} /> Add Your First Case Study
                </button>
              </div>
            ) : (
              <div className="space-y-10 p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.publishedCases.map((c) => {
                    const hasBeforeAfter =
                      Boolean(c.beforeImage) &&
                      Boolean(c.afterImage) &&
                      c.beforeImage !== c.afterImage;
                    const totalImages = Array.isArray(c.selectedImages)
                      ? c.selectedImages.length
                      : c.coverImage
                        ? 1
                        : 0;
                    const treatmentList = Array.isArray(c.treatmentType)
                      ? c.treatmentType.filter(Boolean)
                      : c.treatmentType
                        ? [c.treatmentType]
                        : ['General'];
                    const primaryTreatment = treatmentList[0] || 'General';

                    return (
                      <div
                        key={c._id}
                        className="group flex flex-col h-full bg-base-100 border border-neutral-light rounded-2xl overflow-hidden hover:border-primary/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="aspect-[4/3] bg-base-200 overflow-hidden relative shrink-0">
                          {hasBeforeAfter ? (
                            <div className="grid grid-cols-2 w-full h-full relative">
                              <div className="relative w-full h-full overflow-hidden">
                                <SafeImage
                                  src={c.beforeImage}
                                  alt={`${c.title} — Before`}
                                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                                  fallback={<ImageIcon size={28} className="text-base-content/15" />}
                                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-200"
                                />
                              </div>
                              <div className="relative w-full h-full overflow-hidden">
                                <SafeImage
                                  src={c.afterImage}
                                  alt={`${c.title} — After`}
                                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                                  fallback={<ImageIcon size={28} className="text-base-content/15" />}
                                  fallbackClassName="w-full h-full flex items-center justify-center bg-base-200"
                                />
                              </div>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                              <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/85 dark:bg-base-100/90 shadow-[0_0_8px_rgba(0,0,0,0.4)]" />
                              <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-base-200/95 text-primary border border-neutral-light shadow-md backdrop-blur-sm flex items-center justify-center">
                                <ArrowLeftRight size={12} />
                              </div>
                              <span className="pointer-events-none absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-black/65 text-white border border-white/15 backdrop-blur-md shadow-sm">
                                Before
                              </span>
                              <span className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-content shadow-sm">
                                After
                              </span>
                            </div>
                          ) : (
                            <>
                              <SafeImage
                                src={c.coverImage || c.selectedImages?.[0]}
                                alt={c.title}
                                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
                                fallback={<ImageIcon size={32} className="text-base-content/15" />}
                                fallbackClassName="w-full h-full flex items-center justify-center bg-base-200"
                              />
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              {totalImages > 1 && (
                                <span className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white border border-white/15 backdrop-blur-md shadow-sm">
                                  <Images size={11} />
                                  {totalImages}
                                </span>
                              )}
                            </>
                          )}

                          {/* Top-left treatment pill (clear of top-right editor controls) */}
                          <span className="pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-md shadow-sm max-w-[52%] truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate">{primaryTreatment}</span>
                          </span>

                          <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-start gap-1 p-1 z-10">
                            {/* Reordering Controls */}
                            <div className="flex flex-col gap-1 mr-1">
                              <button
                                onClick={() => handleReorder(c._id, 'up')}
                                className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                title="Move Up"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                              </button>
                              <button
                                onClick={() => handleReorder(c._id, 'down')}
                                className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                                title="Move Down"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                              </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditCaseModal(c)}
                                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all active:scale-90"
                                title="Edit Case"
                              >
                                <Pencil size={16} className="sm:size-[14px]" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(c._id)}
                                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all active:scale-90"
                                title="Delete Case"
                              >
                                <Trash2 size={16} className="sm:size-[14px]" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                          <div className="mb-3">
                            <h3 className="text-sm font-bold text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                              {c.title}
                            </h3>
                            {c.description && (
                              <p className="mt-1 text-xs text-base-content/65 line-clamp-2 leading-relaxed">
                                {c.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-auto pt-3 border-t border-neutral-light/70 flex items-center justify-between gap-2">
                            {hasBeforeAfter ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                                <ArrowLeftRight size={10} />
                                Before &amp; After
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-base-content/60">
                                <Images size={11} />
                                {totalImages} {totalImages === 1 ? 'Photo' : 'Photos'}
                              </span>
                            )}
                            <span className="text-[10px] text-base-content/60 font-medium italic">Published</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Pagination Controls ── */}
                {portfolio.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-light bg-base-100 text-base-content disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {[...Array(portfolio.pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${page === i + 1 ? 'bg-primary text-primary-content shadow-md' : 'text-base-content/60 hover:bg-base-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={page === portfolio.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-light bg-base-100 text-base-content disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Add Case Modal ── */}
      <AnimatePresence>
        {addCaseModal && (
          <AddCaseModal onClose={() => setAddCaseModal(false)} />
        )}
      </AnimatePresence>

      {/* ── Edit Case Modal ── */}
      <AnimatePresence>
        {editCaseModal && (
          <EditCaseModal caseData={editCaseModal} onClose={() => setEditCaseModal(null)} />
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-base-200 rounded-2xl shadow-xl max-w-sm w-full z-10 border border-neutral-light p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 className="font-bold text-lg text-base-content mb-2">Remove Case?</h3>
              <p className="text-sm text-base-content/70 mb-6">
                This will remove the case from your public portfolio. The original session data is not affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl font-semibold hover:bg-base-100 transition-colors text-base-content/70">Cancel</button>
                <button onClick={() => handleDeleteCase(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-colors">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom categories from localStorage (shared by AddCaseModal & EditCaseModal)
function getCustomCategories() {
  try { return JSON.parse(localStorage.getItem('gd_custom_categories') || '[]'); }
  catch { return []; }
}

function saveCustomCategory(cat) {
  const existing = getCustomCategories();
  if (!existing.includes(cat)) {
    localStorage.setItem('gd_custom_categories', JSON.stringify([...existing, cat]));
  }
}

// ════════════════════════════════════════════════
//  ADD CASE MODAL (Multi-step Image Picker)
// ════════════════════════════════════════════════
function AddCaseModal({ onClose }) {
  const { data: library, isLoading: isLibraryLoading } = useMediaLibrary();
  const { mutate: publishCase, isPending } = usePublishCase();
  const { mutate: uploadImages, isPending: isUploading } = useUploadPortfolioImages();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [customCatInput, setCustomCatInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const allCategories = [...new Set([...TREATMENT_TYPES, ...getCustomCategories()])];

  const toggleTreatmentType = (type) => {
    setTreatmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setError('');
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    saveCustomCategory(trimmed);
    if (!treatmentTypes.includes(trimmed)) {
      setTreatmentTypes((prev) => [...prev, trimmed]);
    }
    setCustomCatInput('');
    setShowCustomInput(false);
    setError('');
  };

  const toggleImage = (url) => {
    const isSelected = selectedImages.includes(url);
    if (!isSelected && selectedImages.length >= MAX_CASE_IMAGES) {
      setError(`You can select a maximum of ${MAX_CASE_IMAGES} images per case.`);
      return;
    }
    setError('');
    const newSelections = isSelected
      ? selectedImages.filter((u) => u !== url)
      : [...selectedImages, url];
    setSelectedImages(newSelections);
    if (isSelected) {
      if (coverImage === url) {
        setCoverImage(newSelections.length > 0 ? newSelections[0] : '');
      }
      if (newSelections.length < 2) {
        setBeforeImage(null);
        setAfterImage(null);
      } else {
        if (beforeImage === url) setBeforeImage(null);
        if (afterImage === url) setAfterImage(null);
      }
    }
  };

  const removeImage = (url) => {
    const next = selectedImages.filter((u) => u !== url);
    setSelectedImages(next);
    if (coverImage === url) {
      setCoverImage(next.length > 0 ? next[0] : '');
    }
    if (next.length < 2) {
      setBeforeImage(null);
      setAfterImage(null);
    } else {
      if (beforeImage === url) setBeforeImage(null);
      if (afterImage === url) setAfterImage(null);
    }
    setError('');
  };

  const toggleBeforeImage = (url) => {
    setError('');
    if (beforeImage === url) {
      setBeforeImage(null);
    } else {
      setBeforeImage(url);
      if (afterImage === url) setAfterImage(null);
    }
  };

  const toggleAfterImage = (url) => {
    setError('');
    if (afterImage === url) {
      setAfterImage(null);
    } else {
      setAfterImage(url);
      if (beforeImage === url) setBeforeImage(null);
    }
  };

  const onDeviceUpload = (pickedFiles) => {
    handleDeviceCaseUpload({
      files: pickedFiles,
      selectedImages,
      uploadImages,
      setSelectedImages,
      setCoverImage,
      setError,
    });
  };

  const moveImage = (index, delta) => {
    setSelectedImages((prev) => {
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (selectedImages.length === 0) { setError('Select or upload at least one image to proceed.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) { setError('Title is required to proceed.'); return; }
      if (treatmentTypes.length === 0) { setError('Select at least one treatment type.'); return; }
      if (!coverImage && selectedImages.length > 0) setCoverImage(selectedImages[0]);
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isPending || isUploading) return;
    setError('');

    if (!title.trim()) {
      setError('Title is required to publish.');
      return;
    }
    if (selectedImages.length === 0) {
      setError('Select or upload at least one image to publish.');
      return;
    }
    if (selectedImages.length > MAX_CASE_IMAGES) {
      setError(`Maximum of ${MAX_CASE_IMAGES} images allowed per case.`);
      return;
    }
    if ((beforeImage && !afterImage) || (!beforeImage && afterImage)) {
      setError('Please select both a Before and After image, or clear the partial selection.');
      return;
    }

    const resolvedCover = selectedImages.includes(coverImage) ? coverImage : selectedImages[0];

    publishCase({
      title: title.trim(),
      description,
      category,
      treatmentType: treatmentTypes.length > 0 ? treatmentTypes : ['General'],
      selectedImages,
      coverImage: resolvedCover,
      beforeImage: beforeImage || null,
      afterImage: afterImage || null,
    }, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err?.response?.data?.message || 'Failed to publish case'),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#191919]/60 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 50 }}
        className="relative bg-base-200 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-neutral-light max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-neutral-light bg-base-100/60 shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-base-content tracking-tight">Post New Result</h3>
            <button onClick={onClose} className="p-2 rounded-xl border border-neutral-light hover:bg-base-100 transition-colors text-base-content">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step >= s ? 'bg-primary text-primary-content shadow-md shadow-primary/30' : 'bg-base-content/10 text-base-content/50'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-5 sm:w-8 h-0.5 rounded transition-all ${step > s ? 'bg-primary' : 'bg-base-content/15'}`} />}
              </div>
            ))}
            <span className="ms-1 sm:ms-2 text-xs font-bold text-base-content/60 uppercase tracking-wider truncate">
              {step === 1 ? 'Media Library' : step === 2 ? 'Clinical Details' : 'Final Preview'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-3 rounded-2xl border border-neutral-light shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedImages.length >= MAX_CASE_IMAGES ? 'bg-error/10 text-error border-error/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                    {selectedImages.length} / {MAX_CASE_IMAGES} Selected
                  </div>
                  <p className="text-[10px] font-bold text-base-content/60 uppercase tracking-tight">Maximum allowed per case</p>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-base-200 text-base-content border border-neutral-light rounded-xl py-2 px-11 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <DeviceImageUploadZone
                selectedCount={selectedImages.length}
                isUploading={isUploading}
                onFilesSelected={onDeviceUpload}
              />

              {selectedImages.length > 0 && (
                <div className="border border-neutral-light rounded-2xl p-3 bg-base-100 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                    Selected Photos ({selectedImages.length} / {MAX_CASE_IMAGES})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((img, i) => (
                      <div key={img} className="relative w-14 h-14 rounded-xl overflow-hidden border border-primary/40 bg-base-200">
                        <SafeImage src={img} className="w-full h-full object-cover" alt={`Selected ${i + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-error transition-colors"
                          title="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                  Or Choose from Session Media Library
                </p>
                {isLibraryLoading ? (
                  <MediaLibrarySkeleton />
                ) : (
                  library?.filter(session => session.patientName.toLowerCase().includes(searchQuery.toLowerCase())).map((session) => (
                    <div key={session.sessionId} className="border border-neutral-light rounded-2xl p-4 bg-base-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-base-content uppercase tracking-tight">{session.patientName}</span>
                        <span className="text-[10px] font-medium text-base-content/60">{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {session.images.map((img, i) => (
                          <div key={i} onClick={() => toggleImage(img)} className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative border-2 ${selectedImages.includes(img) ? 'border-primary shadow-lg scale-95' : 'border-transparent hover:border-primary/40'}`}>
                            <SafeImage src={img} className="w-full h-full object-cover" alt="" />
                            {selectedImages.includes(img) && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                <Check size={12} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Clinical Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upper Jaw Reconstruction"
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Procedure Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Card Highlight Tag (Optional — shown publicly)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Smile Makeover, Single Visit, Full Arch"
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-base-content">Treatment Type *</label>

                {/* Selected tags */}
                {treatmentTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {treatmentTypes.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => toggleTreatmentType(cat)}
                          className="hover:text-error transition-colors ml-0.5"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Category chips */}
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((type) => {
                    const isSelected = treatmentTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleTreatmentType(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                          ? 'bg-primary text-primary-content border-primary shadow-md shadow-primary/20'
                          : 'bg-base-100 text-base-content/70 border-neutral-light hover:border-primary'
                          }`}
                      >
                        {type}
                      </button>
                    );
                  })}

                  {/* Add Custom button */}
                  {!showCustomInput && (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Custom
                    </button>
                  )}
                </div>

                {/* Custom category input */}
                {showCustomInput && (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      autoFocus
                      className="flex-1 bg-base-100 text-base-content border border-neutral-light rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Type custom category..."
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); }
                        if (e.key === 'Escape') { setShowCustomInput(false); setCustomCatInput(''); }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      disabled={!customCatInput.trim()}
                      className="px-4 py-2 bg-primary text-primary-content rounded-xl text-xs font-bold disabled:opacity-40 transition-all"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomInput(false); setCustomCatInput(''); }}
                      className="p-2 rounded-xl text-base-content/60 hover:bg-base-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-base-100 rounded-2xl p-6 border border-neutral-light">
                <h4 className="font-bold text-xl text-base-content mb-2">{title}</h4>
                <p className="text-sm text-base-content/60 leading-relaxed italic">{description || 'No description provided.'}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-base-content/60 uppercase">
                  Pick Cover &amp; Image Order ({selectedImages.length} / {MAX_CASE_IMAGES})
                </p>
                {selectedImages.length < MAX_CASE_IMAGES && (
                  <DeviceImageUploadZone
                    selectedCount={selectedImages.length}
                    isUploading={isUploading}
                    onFilesSelected={onDeviceUpload}
                    compact
                  />
                )}
              </div>
              <BeforeAfterStatusBar
                selectedImages={selectedImages}
                beforeImage={beforeImage}
                afterImage={afterImage}
                onClear={() => { setBeforeImage(null); setAfterImage(null); setError(''); }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedImages.map((img, i) => {
                  const isBefore = beforeImage === img;
                  const isAfter = afterImage === img;
                  return (
                    <div key={img} className={`rounded-2xl overflow-hidden border-2 bg-base-100 transition-all ${coverImage === img ? 'border-primary shadow-lg' : 'border-neutral-light hover:border-primary/50'}`}>
                      <div onClick={() => setCoverImage(img)} className="cursor-pointer aspect-square overflow-hidden relative">
                        <SafeImage src={img} className="w-full h-full object-cover" alt={`Selected ${i + 1}`} />
                        {selectedImages.length > 1 && (
                          <div className="absolute top-1.5 left-1.5 flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={i === 0}
                              onClick={() => moveImage(i, -1)}
                              className="w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-black/85 disabled:opacity-30 transition-colors"
                              title="Move Earlier"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={i === selectedImages.length - 1}
                              onClick={() => moveImage(i, 1)}
                              className="w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-black/85 disabled:opacity-30 transition-colors"
                              title="Move Later"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(img); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-error transition-colors"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                        {coverImage === img && (
                          <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-primary text-primary-content text-[8px] font-bold rounded-md uppercase tracking-widest shadow">
                            Main
                          </span>
                        )}
                      </div>
                      {selectedImages.length >= 2 && (
                        <div className="grid grid-cols-2 gap-1 p-1.5 bg-base-200 border-t border-neutral-light">
                          <button
                            type="button"
                            onClick={() => toggleBeforeImage(img)}
                            className={`py-1.5 min-h-[30px] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isBefore
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-base-100 text-base-content/70 border border-neutral-light hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400'
                            }`}
                          >
                            Before
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAfterImage(img)}
                            className={`py-1.5 min-h-[30px] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isAfter
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-base-100 text-base-content/70 border border-neutral-light hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          >
                            After
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-neutral-light bg-base-100/60 flex items-center justify-between flex-row-reverse gap-2 shrink-0">
          {step < 3 ? (
            <Button onClick={nextStep} disabled={isUploading} className="px-5 sm:px-8 shadow-xl shadow-primary/20">
              Next Stage <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={isPending} disabled={isUploading} className="px-6 sm:px-10 shadow-xl shadow-primary/20">
              Publish Clinical Case
            </Button>
          )}
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-4 sm:px-5 py-2.5 font-bold text-xs text-base-content/70 hover:bg-base-200 rounded-xl border border-neutral-light transition-all">Back</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Small helper for the session listing
function UserIcon({ name }) {
  return (
    <span className="flex items-center gap-1 font-semibold text-base-content/80">
      <FileText size={12} /> {name}
    </span>
  );
}

// ════════════════════════════════════════════════
//  EDIT CASE MODAL
// ════════════════════════════════════════════════
function EditCaseModal({ caseData, onClose }) {
  const { data: library, isLoading: isLibraryLoading } = useMediaLibrary();
  const { mutate: editCase, isPending } = useEditCase();
  const { mutate: uploadImages, isPending: isUploading } = useUploadPortfolioImages();

  const initialTreatments = Array.isArray(caseData.treatmentType)
    ? caseData.treatmentType.filter(Boolean)
    : caseData.treatmentType
      ? [caseData.treatmentType]
      : ['General'];

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(caseData.title || '');
  const [description, setDescription] = useState(caseData.description || '');
  const [category, setCategory] = useState(caseData.category || '');
  const [treatmentTypes, setTreatmentTypes] = useState(
    initialTreatments.length > 0 ? initialTreatments : ['General']
  );
  const [customCatInput, setCustomCatInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedImages, setSelectedImages] = useState(caseData.selectedImages || []);
  const [coverImage, setCoverImage] = useState(caseData.coverImage || (caseData.selectedImages?.[0] || ''));
  const [beforeImage, setBeforeImage] = useState(caseData.beforeImage || null);
  const [afterImage, setAfterImage] = useState(caseData.afterImage || null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = [...new Set([...TREATMENT_TYPES, ...getCustomCategories(), ...treatmentTypes])];

  const toggleTreatmentType = (type) => {
    setTreatmentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setError('');
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;
    saveCustomCategory(trimmed);
    if (!treatmentTypes.includes(trimmed)) {
      setTreatmentTypes((prev) => [...prev, trimmed]);
    }
    setCustomCatInput('');
    setShowCustomInput(false);
    setError('');
  };

  const toggleImage = (url) => {
    const isSelected = selectedImages.includes(url);
    if (!isSelected && selectedImages.length >= MAX_CASE_IMAGES) {
      setError(`Maximum of ${MAX_CASE_IMAGES} images allowed.`);
      return;
    }
    setError('');
    const newSelections = isSelected
      ? selectedImages.filter((u) => u !== url)
      : [...selectedImages, url];
    setSelectedImages(newSelections);
    if (isSelected) {
      if (coverImage === url) {
        setCoverImage(newSelections.length > 0 ? newSelections[0] : '');
      }
      if (newSelections.length < 2) {
        setBeforeImage(null);
        setAfterImage(null);
      } else {
        if (beforeImage === url) setBeforeImage(null);
        if (afterImage === url) setAfterImage(null);
      }
    }
  };

  const removeImage = (url) => {
    const next = selectedImages.filter((u) => u !== url);
    setSelectedImages(next);
    if (coverImage === url) {
      setCoverImage(next.length > 0 ? next[0] : '');
    }
    if (next.length < 2) {
      setBeforeImage(null);
      setAfterImage(null);
    } else {
      if (beforeImage === url) setBeforeImage(null);
      if (afterImage === url) setAfterImage(null);
    }
    setError('');
  };

  const toggleBeforeImage = (url) => {
    setError('');
    if (beforeImage === url) {
      setBeforeImage(null);
    } else {
      setBeforeImage(url);
      if (afterImage === url) setAfterImage(null);
    }
  };

  const toggleAfterImage = (url) => {
    setError('');
    if (afterImage === url) {
      setAfterImage(null);
    } else {
      setAfterImage(url);
      if (beforeImage === url) setBeforeImage(null);
    }
  };

  const onDeviceUpload = (pickedFiles) => {
    handleDeviceCaseUpload({
      files: pickedFiles,
      selectedImages,
      uploadImages,
      setSelectedImages,
      setCoverImage,
      setError,
    });
  };

  const moveImage = (index, delta) => {
    setSelectedImages((prev) => {
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (selectedImages.length === 0) { setError('Select or upload at least one image to proceed.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) { setError('Title is required to proceed.'); return; }
      if (treatmentTypes.length === 0) { setError('Select at least one treatment type to proceed.'); return; }
      if (!coverImage && selectedImages.length > 0) setCoverImage(selectedImages[0]);
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isPending || isUploading) return;
    setError('');

    if (!title.trim()) {
      setError('Title is required to save changes.');
      return;
    }
    if (treatmentTypes.length === 0) {
      setError('Select at least one treatment type to save changes.');
      return;
    }
    if (selectedImages.length === 0) {
      setError('Select or upload at least one image to save changes.');
      return;
    }
    if (selectedImages.length > MAX_CASE_IMAGES) {
      setError(`Maximum of ${MAX_CASE_IMAGES} images allowed per case.`);
      return;
    }
    if ((beforeImage && !afterImage) || (!beforeImage && afterImage)) {
      setError('Please select both a Before and After image, or clear the partial selection.');
      return;
    }

    const resolvedCover = selectedImages.includes(coverImage) ? coverImage : selectedImages[0];

    editCase({
      caseId: caseData._id,
      title: title.trim(),
      description,
      category,
      treatmentType: treatmentTypes,
      selectedImages,
      coverImage: resolvedCover,
      beforeImage: beforeImage || null,
      afterImage: afterImage || null,
    }, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err?.response?.data?.message || 'Failed to update case'),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#191919]/60 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 50 }}
        className="relative bg-base-200 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-neutral-light max-h-[90dvh] sm:max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-neutral-light bg-base-100/60 shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="font-bold text-lg sm:text-xl text-base-content tracking-tight">Edit Case Study</h3>
            <button onClick={onClose} className="p-2 rounded-xl border border-neutral-light hover:bg-base-100 transition-colors text-base-content">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-0.5">
            <button type="button" onClick={() => setStep(1)} className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all whitespace-nowrap shrink-0 ${step === 1 ? 'border-primary text-primary' : 'border-transparent text-base-content/60'}`}>1. Photos</button>
            <button type="button" onClick={() => setStep(2)} className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all whitespace-nowrap shrink-0 ${step === 2 ? 'border-primary text-primary' : 'border-transparent text-base-content/60'}`}>2. Details</button>
            <button type="button" onClick={() => setStep(3)} className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all whitespace-nowrap shrink-0 ${step === 3 ? 'border-primary text-primary' : 'border-transparent text-base-content/60'}`}>3. Preview &amp; Before/After</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-base-100 p-3 rounded-xl border border-neutral-light">
                <span className="text-[10px] font-black uppercase text-base-content/60 tracking-widest">Selected: {selectedImages.length} / {MAX_CASE_IMAGES}</span>
                <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">Limit: {MAX_CASE_IMAGES} Photos</span>
              </div>

              <DeviceImageUploadZone
                selectedCount={selectedImages.length}
                isUploading={isUploading}
                onFilesSelected={onDeviceUpload}
              />

              {selectedImages.length > 0 && (
                <div className="border border-neutral-light rounded-xl p-3 bg-base-100 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                    Selected Photos ({selectedImages.length} / {MAX_CASE_IMAGES})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedImages.map((img, i) => (
                      <div key={img} className="relative w-14 h-14 rounded-lg overflow-hidden border border-primary/40 bg-base-200">
                        <SafeImage src={img} className="w-full h-full object-cover" alt={`Selected ${i + 1}`} />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-error transition-colors"
                          title="Remove image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" />
                <input
                  type="text"
                  placeholder="Filter gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/60">
                  Or Choose from Session Media Library
                </p>
                {isLibraryLoading ? (
                  <MediaLibrarySkeleton />
                ) : (
                  library?.filter(s => s.patientName.toLowerCase().includes(searchQuery.toLowerCase())).map(session => (
                    <div key={session.sessionId} className="border border-neutral-light bg-base-100 rounded-xl p-3">
                      <p className="text-xs font-bold mb-2 text-base-content/60">{session.patientName}</p>
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {session.images.map((img, idx) => (
                          <div key={idx} onClick={() => toggleImage(img)} className={`aspect-square rounded-lg overflow-hidden cursor-pointer relative border-2 ${selectedImages.includes(img) ? 'border-primary' : 'border-transparent'}`}>
                            <SafeImage src={img} className="w-full h-full object-cover" alt="" />
                            {selectedImages.includes(img) && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-content flex items-center justify-center">
                                <Check size={10} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Clinical Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upper Jaw Reconstruction"
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Procedure Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-base-content">Card Highlight Tag (Optional — shown publicly)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Smile Makeover, Single Visit, Full Arch"
                  className="w-full bg-base-100 text-base-content border border-neutral-light rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-base-content">Treatment Type *</label>

                {treatmentTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {treatmentTypes.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => toggleTreatmentType(cat)}
                          className="hover:text-error transition-colors ml-0.5"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {allCategories.map((type) => {
                    const isSelected = treatmentTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleTreatmentType(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                          ? 'bg-primary text-primary-content border-primary shadow-md shadow-primary/20'
                          : 'bg-base-100 text-base-content/70 border-neutral-light hover:border-primary'
                          }`}
                      >
                        {type}
                      </button>
                    );
                  })}

                  {!showCustomInput && (
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-dashed border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Custom
                    </button>
                  )}
                </div>

                {showCustomInput && (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      autoFocus
                      className="flex-1 bg-base-100 text-base-content border border-neutral-light rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Type custom category..."
                      value={customCatInput}
                      onChange={(e) => setCustomCatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); }
                        if (e.key === 'Escape') { setShowCustomInput(false); setCustomCatInput(''); }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      disabled={!customCatInput.trim()}
                      className="px-4 py-2 bg-primary text-primary-content rounded-xl text-xs font-bold disabled:opacity-40 transition-all"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomInput(false); setCustomCatInput(''); }}
                      className="p-2 rounded-xl text-base-content/60 hover:bg-base-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-base-content/60 uppercase">
                  Pick Display Cover &amp; Image Order ({selectedImages.length} / {MAX_CASE_IMAGES})
                </p>
                {selectedImages.length < MAX_CASE_IMAGES && (
                  <DeviceImageUploadZone
                    selectedCount={selectedImages.length}
                    isUploading={isUploading}
                    onFilesSelected={onDeviceUpload}
                    compact
                  />
                )}
              </div>
              <BeforeAfterStatusBar
                selectedImages={selectedImages}
                beforeImage={beforeImage}
                afterImage={afterImage}
                onClear={() => { setBeforeImage(null); setAfterImage(null); setError(''); }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedImages.map((img, idx) => {
                  const isBefore = beforeImage === img;
                  const isAfter = afterImage === img;
                  return (
                    <div key={img} className={`rounded-xl overflow-hidden border-2 bg-base-100 transition-all ${coverImage === img ? 'border-primary shadow-md' : 'border-neutral-light hover:border-primary/50'}`}>
                      <div onClick={() => setCoverImage(img)} className="cursor-pointer aspect-square overflow-hidden relative">
                        <SafeImage src={img} className="w-full h-full object-cover" alt={`Selected ${idx + 1}`} />
                        {selectedImages.length > 1 && (
                          <div className="absolute top-1.5 left-1.5 flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveImage(idx, -1)}
                              className="w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-black/85 disabled:opacity-30 transition-colors"
                              title="Move Earlier"
                            >
                              <ChevronLeft size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === selectedImages.length - 1}
                              onClick={() => moveImage(idx, 1)}
                              className="w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-black/85 disabled:opacity-30 transition-colors"
                              title="Move Later"
                            >
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(img); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/65 text-white flex items-center justify-center hover:bg-error transition-colors"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                        {coverImage === img && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-primary text-primary-content text-[8px] font-bold rounded uppercase tracking-widest shadow">
                            Main
                          </span>
                        )}
                      </div>
                      {selectedImages.length >= 2 && (
                        <div className="grid grid-cols-2 gap-1 p-1.5 bg-base-200 border-t border-neutral-light">
                          <button
                            type="button"
                            onClick={() => toggleBeforeImage(img)}
                            className={`py-1.5 min-h-[30px] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isBefore
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-base-100 text-base-content/70 border border-neutral-light hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400'
                            }`}
                          >
                            Before
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAfterImage(img)}
                            className={`py-1.5 min-h-[30px] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                              isAfter
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-base-100 text-base-content/70 border border-neutral-light hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                            }`}
                          >
                            After
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-neutral-light bg-base-100/60 flex items-center justify-between gap-2 shrink-0">
          <button onClick={onClose} className="px-4 sm:px-6 py-2.5 font-bold text-xs text-base-content/60 hover:text-base-content transition-colors">Cancel</button>
          <div className="flex gap-2 sm:gap-3">
            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-4 sm:px-6 py-2.5 bg-base-100 border border-neutral-light text-base-content rounded-xl font-bold text-xs hover:bg-base-200 transition-colors">Back</button>}
            {step < 3 ? (
              <button onClick={nextStep} disabled={isUploading} className="bg-primary text-primary-content px-6 sm:px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 disabled:opacity-50">Next</button>
            ) : (
              <Button onClick={handleSubmit} loading={isPending} disabled={isUploading} className="px-6 sm:px-10">Confirm Edits</Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

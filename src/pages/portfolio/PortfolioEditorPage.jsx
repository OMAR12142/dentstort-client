import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Globe, GlobeLock, Eye, EyeOff, Share2, Copy, Plus, Pencil, Trash2, X, Upload, ArrowLeftRight, Images,
  Briefcase, Mail, Phone, MapPin, Clock, CheckCircle2, User, ExternalLink, Link2,
  AlertCircle, Loader2, Image as ImageIcon, Check, ChevronLeft, ChevronRight, FileText, Search,
  Star, ArrowUpToLine, ArrowUpDown
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
import api from '../../api/axios';
import {
  useMyPortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useUpdateVisibility,
  useUploadPortfolioCover,
  useUploadPortfolioCv,
  useDeletePortfolioCv,
  useTogglePortfolio,
  usePublishCase,
  useEditCase,
  useDeleteCase,
  useReorderCase,
  useToggleFeaturedCase,
  useMoveCasePosition,
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

const DEFAULT_VISIBILITY = Object.freeze({
  clinicInfo: true,
  yearsOfExperience: true,
  casesCount: true,
  bio: true,
  specialties: true,
  cv: true,
  whatsapp: true,
  phone: true,
  email: true,
  locationCard: true,
  socialLinks: true,
});

function VisibilityToggle({ visible, onToggle, label }) {
  const { t } = useTranslation('portfolio');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={visible}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer select-none shrink-0 ${
        visible
          ? 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/20'
          : 'bg-base-300 text-base-content/60 border-neutral-light hover:bg-base-200'
      }`}
      title={
        visible
          ? t('visibility.clickToHide', 'Visible on public portfolio. Click to hide.')
          : t('visibility.clickToShow', 'Hidden on public portfolio. Click to show.')
      }
    >
      {visible ? (
        <Eye size={13} className="shrink-0" />
      ) : (
        <EyeOff size={13} className="shrink-0 text-base-content/50" />
      )}
      <span>{label || (visible ? t('visibility.visible', 'Visible') : t('visibility.hidden', 'Hidden'))}</span>
    </button>
  );
}

function ProfileIdentityForm({
  portfolio,
  updatePortfolio,
  isUpdating,
  visibility,
  onToggleVisibility,
}) {
  const { t } = useTranslation('portfolio');
  const [slugInput, setSlugInput] = useState(portfolio.slug || '');
  const [bio, setBio] = useState(portfolio.bio || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(portfolio.yearsOfExperience || 0);
  const [servicesInput, setServicesInput] = useState((portfolio.services || []).join(', '));
  const [contactEmail, setContactEmail] = useState(portfolio.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(portfolio.contactPhone || '');
  const [clinicName, setClinicName] = useState(portfolio.clinicName || '');
  const [clinicAddress, setClinicAddress] = useState(portfolio.clinicAddress || '');
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
      showClinicInfo: visibility?.clinicInfo !== false,
      visibility,
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
        <div
          className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
            visibility?.bio === false
              ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
              : 'bg-base-100 border-neutral-light'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-bold text-base-content flex items-center gap-2">
              {t('visibility.bio', 'Professional Summary')}
            </label>
            <VisibilityToggle
              visible={visibility?.bio !== false}
              onToggle={() => onToggleVisibility('bio')}
            />
          </div>
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
          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.yearsOfExperience === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-bold text-base-content">
                {t('visibility.yearsOfExperience', 'Years of Clinical Experience')}
              </label>
              <VisibilityToggle
                visible={visibility?.yearsOfExperience !== false}
                onToggle={() => onToggleVisibility('yearsOfExperience')}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/60 rtl:left-auto rtl:right-4" size={16} />
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                min="0"
                className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.specialties === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-bold text-base-content">
                {t('visibility.specialties', 'Clinical Specialties')}
              </label>
              <VisibilityToggle
                visible={visibility?.specialties !== false}
                onToggle={() => onToggleVisibility('specialties')}
              />
            </div>
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
          {/* Public Inquiry Email */}
          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.email === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-bold text-base-content flex items-center gap-2">
                <Mail size={16} className="text-primary shrink-0" />
                <span className="truncate">{t('visibility.email', 'Public Inquiry Email')}</span>
              </label>
              <VisibilityToggle
                visible={visibility?.email !== false}
                onToggle={() => onToggleVisibility('email')}
              />
            </div>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="dr.name@example.com"
              className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* WhatsApp / Phone with dual toggles */}
          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.whatsapp === false && visibility?.phone === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-bold text-base-content flex items-center gap-2">
                <Phone size={16} className="text-[#25D366] shrink-0" />
                <span className="truncate">WhatsApp / Phone</span>
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <VisibilityToggle
                  visible={visibility?.whatsapp !== false}
                  onToggle={() => onToggleVisibility('whatsapp')}
                  label={`WA: ${visibility?.whatsapp !== false ? t('visibility.visible', 'Visible') : t('visibility.hidden', 'Hidden')}`}
                />
                <VisibilityToggle
                  visible={visibility?.phone !== false}
                  onToggle={() => onToggleVisibility('phone')}
                  label={`Call: ${visibility?.phone !== false ? t('visibility.visible', 'Visible') : t('visibility.hidden', 'Hidden')}`}
                />
              </div>
            </div>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+20 123 456 7890"
              className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Clinic Information (Name & Location Card) */}
        <div className="space-y-4 pt-4 border-t border-neutral-light">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Name */}
            <div
              className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
                visibility?.clinicInfo === false
                  ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                  : 'bg-base-100 border-neutral-light'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-bold text-base-content flex items-center gap-2">
                  <MapPin size={16} className="text-error shrink-0" />
                  <span className="truncate">{t('visibility.clinicInfo', 'Clinic Name & Location')}</span>
                </label>
                <VisibilityToggle
                  visible={visibility?.clinicInfo !== false}
                  onToggle={() => onToggleVisibility('clinicInfo')}
                />
              </div>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Dental Care Center"
                className="w-full bg-base-100 border border-neutral-light rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Clinic Address (Location Card) */}
            <div
              className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
                visibility?.locationCard === false
                  ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                  : 'bg-base-100 border-neutral-light'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-bold text-base-content flex items-center gap-2">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span className="truncate">{t('visibility.locationCard', 'Clinic Location Card')}</span>
                </label>
                <VisibilityToggle
                  visible={visibility?.locationCard !== false}
                  onToggle={() => onToggleVisibility('locationCard')}
                />
              </div>
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

        {/* Header Badges & Social Links Visibility Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-light">
          {/* Documented Cases Count Badge */}
          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.casesCount === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Briefcase size={16} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-base-content truncate">
                  {t('visibility.casesCount', 'Documented Cases Badge')}
                </span>
              </div>
              <VisibilityToggle
                visible={visibility?.casesCount !== false}
                onToggle={() => onToggleVisibility('casesCount')}
              />
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              Display the documented cases trust badge in your public portfolio header banner.
            </p>
          </div>

          {/* Social Media Links */}
          <div
            className={`space-y-2 p-3.5 sm:p-4 rounded-xl border transition-all ${
              visibility?.socialLinks === false
                ? 'opacity-75 bg-base-100/50 border-dashed border-base-content/20'
                : 'bg-base-100 border-neutral-light'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link2 size={16} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-base-content truncate">
                  {t('visibility.socialLinks', 'Social Media Links')}
                </span>
              </div>
              <VisibilityToggle
                visible={visibility?.socialLinks !== false}
                onToggle={() => onToggleVisibility('socialLinks')}
              />
            </div>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              Display external profiles and social media icons on your public portfolio page.
            </p>
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

/**
 * Generate a compact windowed page list with ellipsis (at most 7 items).
 */
function getWindowedPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  const pages = [1];
  if (currentPage > 3) {
    pages.push('ellipsis-left');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    pages.push(2, 3, 4);
  } else if (currentPage >= totalPages - 2) {
    pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
  } else {
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis-right');
  }

  pages.push(totalPages);

  const unique = [];
  const seenNumbers = new Set();
  for (const item of pages) {
    if (typeof item === 'number') {
      if (!seenNumbers.has(item)) {
        seenNumbers.add(item);
        unique.push(item);
      }
    } else {
      unique.push(item);
    }
  }
  return unique;
}

// ════════════════════════════════════════════════
//  MAIN EDITOR PAGE
// ════════════════════════════════════════════════
export default function PortfolioEditorPage() {
  const { t } = useTranslation('portfolio');
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [selectedCategory, setSelectedCategory] = useState('');
  const { data: portfolio, isLoading } = useMyPortfolio(page, limit, selectedCategory);

  const totalPages = portfolio?.pagination?.totalPages || 1;
  const casesSectionRef = useRef(null);

  useEffect(() => {
    if (portfolio && page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [portfolio, page, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    if (casesSectionRef.current) {
      casesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { mutate: createPortfolio, isPending: isCreating } = useCreatePortfolio();
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolio();
  const { mutate: updateVisibilityMutation } = useUpdateVisibility();
  const { mutate: uploadCoverPhoto, isPending: isUploadingCover } = useUploadPortfolioCover();
  const { mutate: uploadCv, isPending: isUploadingCv } = useUploadPortfolioCv();
  const { mutate: deleteCv, isPending: isDeletingCv } = useDeletePortfolioCv();
  const { mutate: togglePortfolio, isPending: isToggling } = useTogglePortfolio();
  const { mutate: deleteCase } = useDeleteCase();

  // Local visibility overrides for optimistic UI
  const [localVisibility, setLocalVisibility] = useState({});

  // Merge server visibility with local user overrides and defaults
  const visibility = {
    ...DEFAULT_VISIBILITY,
    ...(portfolio?.visibility || {}),
    ...(portfolio?.showClinicInfo === false && portfolio?.visibility?.clinicInfo === undefined ? { clinicInfo: false } : {}),
    ...localVisibility,
  };

  const handleToggleVisibility = (key) => {
    const nextVal = visibility[key] === false;
    const updated = {
      ...visibility,
      [key]: nextVal,
    };
    setLocalVisibility((prev) => ({
      ...prev,
      [key]: nextVal,
    }));
    updateVisibilityMutation(updated, {
      onSuccess: () => {
        setLocalVisibility((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      },
      onError: () => {
        setLocalVisibility((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        toast.error(t('visibility.updateError', 'Failed to update visibility'));
      },
    });
  };

  const handleShowAllVisibility = () => {
    const allVisible = {
      clinicInfo: true,
      yearsOfExperience: true,
      casesCount: true,
      bio: true,
      specialties: true,
      cv: true,
      whatsapp: true,
      phone: true,
      email: true,
      locationCard: true,
      socialLinks: true,
    };
    setLocalVisibility(allVisible);
    updateVisibilityMutation(allVisible, {
      onSuccess: () => {
        setLocalVisibility({});
        toast.success(t('visibility.allShownToast', 'All public fields are now visible'));
      },
      onError: () => {
        setLocalVisibility({});
        toast.error(t('visibility.updateError', 'Failed to update visibility'));
      },
    });
  };

  const visibleCount = Object.keys(DEFAULT_VISIBILITY).filter((k) => visibility[k] !== false).length;
  const totalAllCases = portfolio?.totalAllCases ?? (portfolio?.publishedCases?.length || 0);
  const featuredCasesCount = (portfolio?.publishedCases || []).filter((c) => c.isFeatured).length;

  // Modal states
  const [addCaseModal, setAddCaseModal] = useState(false);
  const [editCaseModal, setEditCaseModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copied, setCopied] = useState(false);

  // Cover feedback state
  const [coverError, setCoverError] = useState('');
  const [coverSaved, setCoverSaved] = useState(false);

  // CV feedback state
  const [cvError, setCvError] = useState('');
  const [cvSaved, setCvSaved] = useState(false);
  const [isPreviewingCv, setIsPreviewingCv] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'cases'

  // Claimed portfolio data from Landing Page Hero
  const [claimedData] = useState(() => {
    try {
      const stored = sessionStorage.getItem('dentstory_claimed_portfolio');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleCreatePortfolio = () => {
    const payload = {};
    if (claimedData?.claimedSlug) {
      payload.slug = claimedData.claimedSlug;
    }
    createPortfolio(payload, {
      onSuccess: () => {
        try {
          sessionStorage.removeItem('dentstory_claimed_portfolio');
        } catch {
          // ignore storage error
        }
      },
    });
  };

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

  const flashCvSaved = () => {
    setCvSaved(true);
    setTimeout(() => setCvSaved(false), 2500);
  };

  const handleCvFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setCvError('');
    if (file.type !== 'application/pdf') {
      setCvError(t('editor.cvPdfOnly', 'Only PDF documents are allowed.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCvError(t('editor.cvSizeLimit', 'CV file must be 5 MB or smaller.'));
      return;
    }
    uploadCv(file, {
      onSuccess: () => {
        flashCvSaved();
        toast.success(t('editor.savedSuccess', 'CV updated successfully'));
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || t('editor.cvUploadFailed', 'Failed to upload CV.');
        setCvError(msg);
        toast.error(msg);
      },
    });
  };

  const handleRemoveCv = () => {
    setCvError('');
    deleteCv(undefined, {
      onSuccess: () => {
        flashCvSaved();
        toast.success(t('editor.savedSuccess', 'CV removed successfully'));
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Failed to remove CV.';
        setCvError(msg);
        toast.error(msg);
      },
    });
  };

  const handlePreviewCv = async () => {
    if (!portfolio?.cvUrl) return;
    const previewTab = window.open('about:blank', '_blank');
    if (previewTab) {
      try {
        previewTab.document.title = t('editor.loadingPreview', 'Loading preview...');
      } catch {
        // ignore cross-origin error
      }
    }
    try {
      setIsPreviewingCv(true);
      const res = await api.get('/api/portfolio/me/cv/preview', { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      if (previewTab && !previewTab.closed) {
        previewTab.location.href = blobUrl;
      } else {
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      if (previewTab && !previewTab.closed) {
        previewTab.close();
      }
      console.error('CV Preview error:', err);
      toast.error(t('editor.cvPreviewError', 'Failed to load CV preview.'));
    } finally {
      setIsPreviewingCv(false);
    }
  };

  const { mutate: reorderCase } = useReorderCase();
  const { mutate: toggleFeaturedMutation, isPending: isTogglingFeatured } = useToggleFeaturedCase();
  const { mutate: movePositionMutation, isPending: isMovingPosition } = useMoveCasePosition();

  const [rankPopoverCaseId, setRankPopoverCaseId] = useState(null);
  const [directRankInput, setDirectRankInput] = useState('');

  const handleReorder = (caseId, direction) => {
    reorderCase(
      { caseId, direction },
      {
        onSuccess: () => {
          toast.success(t('toast.caseReordered', 'Cases reordered successfully'));
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || 'Failed to reorder cases');
        },
      }
    );
  };

  const handleToggleFeatured = (caseId, isFeatured) => {
    toggleFeaturedMutation(
      { caseId, isFeatured },
      {
        onSuccess: (data) => {
          toast.success(
            data?.isFeatured
              ? t('cases.casePinned', 'Case featured and pinned to top')
              : t('cases.caseUnpinned', 'Case unpinned')
          );
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || 'Failed to update featured status');
        },
      }
    );
  };

  const handleMovePosition = (caseId, targetPosition) => {
    const pos = parseInt(targetPosition, 10);
    if (isNaN(pos) || pos < 1) {
      toast.error('Please enter a valid rank position.');
      return;
    }
    movePositionMutation(
      { caseId, position: pos },
      {
        onSuccess: () => {
          setRankPopoverCaseId(null);
          toast.success(t('cases.positionUpdated', 'Case position updated successfully'));
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || 'Failed to move case position');
        },
      }
    );
  };

  const handleDirectRankSubmit = (caseId) => {
    handleMovePosition(caseId, directRankInput);
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
          {claimedData?.claimedSlug && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 max-w-md mx-auto">
              <Link2 size={15} className="shrink-0 text-primary" />
              <span className="truncate">
                Reserved Link: <span className="font-mono underline">dentstory.site/portfolio/{claimedData.claimedSlug}</span>
              </span>
            </div>
          )}

          <Button
            onClick={handleCreatePortfolio}
            loading={isCreating}
            className="px-8"
          >
            <Plus size={18} />
            {claimedData?.claimedSlug ? `Create Portfolio (${claimedData.claimedSlug})` : 'Create Portfolio'}
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
              <div className="mt-1 flex items-center gap-2 max-w-full">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/65 hover:text-primary transition-colors min-w-0 max-w-full truncate"
                >
                  <Link2 size={12} className="text-primary shrink-0" />
                  <span className="truncate">{publicUrl}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title={copied ? t('editor.copiedUrl', 'Copied!') : t('editor.copyPortfolioUrl', 'Copy URL')}
                  aria-label={copied ? t('editor.copiedUrl', 'Copied!') : t('editor.copyPortfolioUrl', 'Copy URL')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-base-100 hover:bg-base-300 text-base-content/75 hover:text-primary border border-neutral-light transition-all cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-success shrink-0" />
                      <span className="text-success font-extrabold text-[10px]">{t('editor.copiedUrl', 'Copied!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="shrink-0" />
                      <span className="text-[10px] font-bold">{t('editor.copyPortfolioUrl', 'Copy URL')}</span>
                    </>
                  )}
                </button>
              </div>
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

      {/* ── 2. Full-Width 2-Step Interactive Journey Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {/* Step 1: Profile & Visibility */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('profile');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`group relative text-start p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-2 border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm'
              : 'bg-base-100 border border-neutral-light hover:border-primary/50 hover:bg-base-200/50 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-content shadow-sm shadow-primary/25'
                    : 'bg-base-200 text-base-content/70 group-hover:text-primary group-hover:bg-primary/10'
                }`}
              >
                <User size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-base-200 text-base-content/60'
                    }`}
                  >
                    {t('editor.step1Badge', 'Step 1')}
                  </span>
                  {activeTab === 'profile' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {t('editor.activeStatus', 'Active')}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-base-content mt-1 truncate">
                  {t('editor.step1Title', 'Profile & Visibility')}
                </h2>
              </div>
            </div>

            <div className="shrink-0 flex items-center pt-1">
              {activeTab !== 'profile' && (
                <ChevronRight
                  size={18}
                  className="text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-all"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-base-content/65 mt-2.5 line-clamp-1">
            {t('editor.step1Subtitle', 'Bio, specialties, CV & field visibility')}
          </p>

          {/* Live Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-neutral-light/60">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-base-200 text-base-content/80 border border-neutral-light/80">
              <Eye size={12} className="text-primary shrink-0" />
              <span>{visibleCount}/11 {t('editor.visibleFields', 'Fields Visible')}</span>
            </span>
            {portfolio?.cvUrl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                <FileText size={12} className="shrink-0" />
                <span>{t('editor.cvAttached', 'CV Attached')}</span>
              </span>
            )}
          </div>
        </button>

        {/* Step 2: Clinical Cases */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('cases');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`group relative text-start p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'cases'
              ? 'border-2 border-primary bg-primary/5 ring-4 ring-primary/10 shadow-sm'
              : 'bg-base-100 border border-neutral-light hover:border-primary/50 hover:bg-base-200/50 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  activeTab === 'cases'
                    ? 'bg-primary text-primary-content shadow-sm shadow-primary/25'
                    : 'bg-base-200 text-base-content/70 group-hover:text-primary group-hover:bg-primary/10'
                }`}
              >
                <ImageIcon size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTab === 'cases'
                        ? 'bg-primary/15 text-primary'
                        : 'bg-base-200 text-base-content/60'
                    }`}
                  >
                    {t('editor.step2Badge', 'Step 2')}
                  </span>
                  {activeTab === 'cases' && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {t('editor.activeStatus', 'Active')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-base sm:text-lg font-bold text-base-content truncate">
                    {t('editor.step2Title', 'Clinical Cases')}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/25">
                    {totalAllCases}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center pt-1">
              {activeTab !== 'cases' && (
                <ChevronRight
                  size={18}
                  className="text-base-content/40 group-hover:text-primary group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-all"
                />
              )}
            </div>
          </div>

          <p className="text-xs text-base-content/65 mt-2.5 line-clamp-1">
            {t('editor.step2Subtitle', 'Before & after cases, categories & priority')}
          </p>

          {/* Live Status Indicators */}
          <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-neutral-light/60">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-base-200 text-base-content/80 border border-neutral-light/80">
              <span>{totalAllCases} {t('editor.totalCases', 'Cases Documented')}</span>
            </span>
            {featuredCasesCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-warning/15 text-warning-content dark:text-warning border border-warning/30">
                <Star size={12} className="text-warning fill-warning shrink-0" />
                <span>{featuredCasesCount} {t('editor.pinnedCases', 'Pinned to Top')}</span>
              </span>
            )}
          </div>
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="profile" className="space-y-6">
          {/* ── Public Portfolio Visibility Master Bar ── */}
          <div className="bg-base-200 border border-neutral-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Eye size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-base-content">
                    {t('visibility.summaryTitle', 'Public Portfolio Visibility Controls')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25">
                    {visibleCount} / 11 {t('visibility.visible', 'Visible')}
                  </span>
                </div>
                <p className="text-xs text-base-content/60 mt-0.5">
                  {t('visibility.summarySubtitle', 'fields currently visible to visitors')}
                </p>
              </div>
            </div>

            {visibleCount < 11 && (
              <button
                type="button"
                onClick={handleShowAllVisibility}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-content hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0 cursor-pointer"
              >
                <Eye size={14} />
                <span>{t('visibility.showAll', 'Show All')}</span>
              </button>
            )}
          </div>

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

          {/* ── Doctor CV (PDF) Section ── */}
          <div className="bg-base-200 border border-neutral-light rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-light flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-base-content">{t('editor.cvTitle', 'Curriculum Vitae (CV / Resume)')}</h2>
                  <p className="text-[11px] text-base-content/60">{t('editor.cvSubtitle', 'Upload your professional CV/resume in PDF format for prospective patients and clinics.')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <VisibilityToggle
                  visible={visibility?.cv !== false}
                  onToggle={() => handleToggleVisibility('cv')}
                />
                {cvSaved && (
                  <span className="text-success text-xs font-bold flex items-center gap-1 bg-success/10 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={14} /> {t('editor.savedSuccess', 'Updated')}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`p-4 sm:p-6 space-y-4 transition-all ${
                visibility?.cv === false ? 'opacity-75 bg-base-100/40 border-dashed border-base-content/20' : ''
              }`}
            >
              {cvError && (
                <div className="p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-center gap-2.5 text-error text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{cvError}</span>
                </div>
              )}

              {portfolio.cvUrl ? (
                <div className="bg-base-100 border border-neutral-light rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0 border border-error/20">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-base-content truncate">
                        {portfolio.cvFileName || 'Doctor_CV.pdf'}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {t('editor.cvReadyDesc', 'PDF document linked and visible for download on your public portfolio.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isPreviewingCv}
                      onClick={handlePreviewCv}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-base-200 text-base-content border border-neutral-light hover:border-primary/40 hover:text-primary transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isPreviewingCv ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <ExternalLink size={13} />
                      )}
                      <span>{isPreviewingCv ? t('editor.loadingPreview', 'Loading...') : t('editor.cvPreview', 'Preview')}</span>
                    </button>

                    <label
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isUploadingCv
                          ? 'opacity-60 cursor-not-allowed bg-base-100 text-base-content/60 border-neutral-light'
                          : 'cursor-pointer bg-base-200 hover:bg-base-300 text-base-content border-neutral-light hover:border-primary/40'
                      }`}
                    >
                      {isUploadingCv ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{isUploadingCv ? t('editor.cvUploading', 'Uploading...') : t('editor.cvReplace', 'Replace')}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={isUploadingCv}
                        className="hidden"
                        onChange={handleCvFileSelect}
                      />
                    </label>

                    <button
                      type="button"
                      disabled={isDeletingCv || isUploadingCv}
                      onClick={handleRemoveCv}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-base-100 text-error border border-error/30 hover:bg-error/10 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isDeletingCv ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      <span>{isDeletingCv ? t('editor.cvDeleting', 'Removing...') : t('editor.cvRemove', 'Remove')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-light rounded-2xl p-6 text-center bg-base-100/50 hover:border-primary/40 transition-colors flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-base-content">
                      {t('editor.cvUploadPrompt', 'Upload your Curriculum Vitae (CV)')}
                    </p>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      {t('editor.cvRequirements', 'PDF only · Maximum 5 MB · Displayed as a download button on your public portfolio')}
                    </p>
                  </div>
                  <label
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isUploadingCv
                        ? 'opacity-60 cursor-not-allowed bg-base-100 text-base-content/60 border-neutral-light'
                        : 'cursor-pointer bg-primary text-primary-content border-primary hover:bg-primary/90 shadow-md shadow-primary/20'
                    }`}
                  >
                    {isUploadingCv ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    <span>{isUploadingCv ? t('editor.cvUploading', 'Uploading CV...') : t('editor.cvChoosePdf', 'Select PDF File')}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={isUploadingCv}
                      className="hidden"
                      onChange={handleCvFileSelect}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <ProfileIdentityForm
            key={portfolio._id}
            portfolio={portfolio}
            updatePortfolio={updatePortfolio}
            isUpdating={isUpdating}
            visibility={visibility}
            onToggleVisibility={handleToggleVisibility}
          />

          {/* Guided Flow Navigation Banner to Step 2: Cases */}
          <div className="bg-base-200/60 border border-neutral-light rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 text-center sm:text-start min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ImageIcon size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-base-content">
                  {t('editor.readyForStep2Title', 'Profile configured? Proceed to Clinical Cases')}
                </h3>
                <p className="text-xs text-base-content/65">
                  {t('editor.readyForStep2Subtitle', 'Showcase before & after treatments, sort by specialty, and pin your best work.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('cases');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-content hover:bg-primary/90 shadow-md shadow-primary/25 transition-all cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <span>
                {t('editor.nextStepCases', {
                  count: totalAllCases,
                  defaultValue: `Next Step: Manage Clinical Cases (${totalAllCases})`,
                })}
              </span>
              <ChevronRight size={16} className="rtl:rotate-180 shrink-0" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Tab Content: Cases Gallery ── */}
      {activeTab === 'cases' && (() => {
        const totalAllCases = portfolio?.totalAllCases ?? (portfolio?.publishedCases?.length || 0);
        const categories = Array.isArray(portfolio?.categories) ? portfolio.categories : [];

        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="cases">
            <div ref={casesSectionRef} id="cases-section" className="bg-base-200 border border-base-content/10 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 dark:border-base-content/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ImageIcon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-base-content">{t('editor.portfolioGallery', 'Clinical Portfolio Gallery')}</h2>
                    {totalAllCases > 0 && (
                      <p className="text-[11px] text-base-content/60 font-medium">
                        {t('editor.filterSubtitle', 'Filter your published clinical cases by treatment specialty')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-base-100 hover:bg-base-300 text-base-content/80 hover:text-primary border border-neutral-light/80 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={14} className="rtl:rotate-180 shrink-0 text-primary" />
                    <span>{t('editor.backToProfile', 'Back to Profile & Visibility')}</span>
                  </button>

                  <button
                    onClick={() => setAddCaseModal(true)}
                    className="bg-primary text-white px-4 sm:px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm shadow-primary/20"
                  >
                    <Plus size={16} /> {t('editor.addCaseStudy', 'Add Case Study')}
                  </button>
                </div>
              </div>

              {totalAllCases === 0 ? (
                <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border-2 border-dashed border-base-content/5 m-4 sm:m-6">
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
                <>
                  {/* ── Category Filter Bar ── */}
                  <div className="px-4 sm:px-6 py-3.5 bg-base-100/60 border-b border-neutral-light flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {/* "All" Filter Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedCategory !== '') {
                            setSelectedCategory('');
                            setPage(1);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          !selectedCategory
                            ? 'bg-primary text-primary-content border-primary shadow-sm shadow-primary/20'
                            : 'bg-base-200 text-base-content/75 border-neutral-light hover:border-primary/50 hover:text-primary hover:bg-base-300'
                        }`}
                      >
                        <span>{t('editor.allCategories', 'All')}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            !selectedCategory
                              ? 'bg-primary-content/20 text-primary-content'
                              : 'bg-base-100 text-base-content/70 border border-neutral-light'
                          }`}
                        >
                          {totalAllCases}
                        </span>
                      </button>

                      {/* Per-Category Pills */}
                      {categories.map((cat) => {
                        const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                setSelectedCategory(cat.name);
                                setPage(1);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-primary text-primary-content border-primary shadow-sm shadow-primary/20'
                                : 'bg-base-200 text-base-content/75 border-neutral-light hover:border-primary/50 hover:text-primary hover:bg-base-300'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                isSelected
                                  ? 'bg-primary-content/20 text-primary-content'
                                  : 'bg-base-100 text-base-content/70 border border-neutral-light'
                              }`}
                            >
                              {cat.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Reorder Disabled Hint */}
                    {selectedCategory && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-base-content/65 bg-base-200/80 border border-neutral-light px-2.5 py-1 rounded-lg">
                        <AlertCircle size={13} className="text-primary shrink-0" />
                        <span>{t('editor.reorderDisabledHint', 'Switch to "All" to reorder cases')}</span>
                      </div>
                    )}
                  </div>

                  {(!portfolio.publishedCases || portfolio.publishedCases.length === 0) ? (
                    <div className="text-center py-16 px-4 bg-base-100 rounded-2xl border-2 border-dashed border-base-content/5 m-4 sm:m-6">
                      <div className="w-14 h-14 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-3 shadow-sm text-base-content/40">
                        <Search size={24} />
                      </div>
                      <h3 className="text-sm font-bold text-base-content mb-1">
                        {t('editor.noCasesInCategory', 'No cases in this category')}
                      </h3>
                      <p className="text-xs text-base-content/60 mb-5 max-w-sm mx-auto">
                        {t('editor.noCasesInCategoryDesc', 'There are no published case studies matching the selected filter.')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('');
                          setPage(1);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-content text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-sm shadow-primary/20"
                      >
                        {t('editor.showAllCases', 'Show all cases')}
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

                          {/* Top-start controls: Rank Badge + Pin/Star Button + Category Pill */}
                          <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5 z-10 max-w-[65%]">
                            {/* Interactive Rank Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (rankPopoverCaseId === c._id) {
                                  setRankPopoverCaseId(null);
                                } else {
                                  setRankPopoverCaseId(c._id);
                                  setDirectRankInput(String(c.globalRank || c.order + 1));
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md shadow-sm transition-all cursor-pointer shrink-0"
                              title={t('cases.changeRank', 'Change case order / rank')}
                            >
                              <span>#{c.globalRank || c.order + 1}</span>
                              <ArrowUpDown size={10} className="opacity-70" />
                            </button>

                            {/* Pin / Featured Star Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFeatured(c._id, !c.isFeatured);
                              }}
                              disabled={isTogglingFeatured}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-sm shrink-0 disabled:opacity-60 ${
                                c.isFeatured
                                  ? 'bg-amber-500 text-white border border-amber-400'
                                  : 'bg-black/60 hover:bg-black/85 text-white/70 hover:text-amber-400 border border-white/20'
                              }`}
                              title={c.isFeatured ? t('cases.unpinCase', 'Unpin case') : t('cases.pinCase', 'Pin case to top (Feature)')}
                            >
                              <Star size={12} className={c.isFeatured ? 'fill-white text-white' : ''} />
                            </button>

                            {/* Treatment Category Pill */}
                            <span className="pointer-events-none inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-base-200/90 text-base-content border border-neutral-light backdrop-blur-md shadow-sm truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                              <span className="truncate">{primaryTreatment}</span>
                            </span>
                          </div>

                          {/* Rank Reordering Popover */}
                          {rankPopoverCaseId === c._id && (
                            <div
                              className="absolute inset-x-2 top-10 sm:top-11 z-30 bg-base-100/95 dark:bg-base-200/95 backdrop-blur-lg border border-neutral-light shadow-2xl rounded-xl p-3 text-start animate-in fade-in zoom-in-95 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-light">
                                <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
                                  <ArrowUpDown size={13} className="text-primary shrink-0" />
                                  <span>{t('cases.caseOrder', 'Case Priority Order')}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRankPopoverCaseId(null)}
                                  className="w-5 h-5 rounded-md text-base-content/60 hover:text-base-content hover:bg-base-300 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Close"
                                >
                                  <X size={12} />
                                </button>
                              </div>

                              {/* Quick "Move to #1" Button */}
                              <button
                                type="button"
                                disabled={(c.globalRank || c.order + 1) === 1 || isMovingPosition}
                                onClick={() => handleMovePosition(c._id, 1)}
                                className="w-full mb-2.5 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowUpToLine size={13} className="shrink-0" />
                                <span>{t('cases.moveToTop', 'Move to #1 (Top)')}</span>
                              </button>

                              {/* Direct Rank Input */}
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-base-content/70 block">
                                  {t('cases.jumpToRank', 'Jump to Rank')} (1 - {totalAllCases})
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="1"
                                    max={totalAllCases}
                                    value={directRankInput}
                                    onChange={(e) => setDirectRankInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleDirectRankSubmit(c._id);
                                      }
                                    }}
                                    className="w-full bg-base-200 border border-neutral-light rounded-lg px-2.5 py-1 text-xs text-base-content font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                    placeholder="1"
                                  />
                                  <button
                                    type="button"
                                    disabled={isMovingPosition || !directRankInput}
                                    onClick={() => handleDirectRankSubmit(c._id)}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-primary text-primary-content hover:bg-primary/90 transition-all shrink-0 disabled:opacity-50 cursor-pointer shadow-sm shadow-primary/20"
                                  >
                                    {isMovingPosition ? <Loader2 size={12} className="animate-spin" /> : t('cases.apply', 'Apply')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="absolute top-2 end-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-start gap-1 p-1 z-10">
                            {/* Reordering Controls — only available in 'All' view to preserve global order */}
                            {!selectedCategory && (
                              <div className="flex flex-col gap-1 me-1">
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
                            )}

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
                {portfolio.pagination?.totalPages > 1 && (() => {
                  const totalPages = portfolio.pagination.totalPages;
                  const pageItems = getWindowedPageNumbers(page, totalPages);

                  return (
                    <div className="border-t border-neutral-light/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                      {/* Page Status Caption */}
                      <div className="text-xs font-bold text-base-content/70 text-center sm:text-start">
                        {t('public.pageOf', { page, total: totalPages, defaultValue: `Page ${page} of ${totalPages}` })}
                      </div>

                      {/* Pagination Action Bar */}
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap">
                        {/* Previous Button */}
                        <button
                          type="button"
                          disabled={page <= 1}
                          onClick={() => handlePageChange(page - 1)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:bg-base-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={t('public.prev', 'Prev')}
                          aria-label={t('public.prev', 'Prev')}
                        >
                          <ChevronLeft size={14} className="rtl:rotate-180 shrink-0" />
                          <span className="hidden xs:inline">{t('public.prev', 'Prev')}</span>
                        </button>

                        {/* Windowed Page Number Pills */}
                        <div className="flex items-center gap-1">
                          {pageItems.map((item, idx) => {
                            if (typeof item === 'string') {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold text-base-content/40 select-none"
                                >
                                  …
                                </span>
                              );
                            }

                            const isCurrent = item === page;
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => handlePageChange(item)}
                                aria-current={isCurrent ? 'page' : undefined}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                  isCurrent
                                    ? 'bg-primary text-primary-content shadow-sm shadow-primary/25 ring-2 ring-primary/20'
                                    : 'bg-base-100 hover:bg-base-200 text-base-content border border-neutral-light hover:border-primary/40'
                                }`}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          disabled={page >= totalPages}
                          onClick={() => handlePageChange(page + 1)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-base-100 text-base-content border border-neutral-light hover:border-primary/40 hover:bg-base-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title={t('public.next', 'Next')}
                          aria-label={t('public.next', 'Next')}
                        >
                          <span className="hidden xs:inline">{t('public.next', 'Next')}</span>
                          <ChevronRight size={14} className="rtl:rotate-180 shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
})()}

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

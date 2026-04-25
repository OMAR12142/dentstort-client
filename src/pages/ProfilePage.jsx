import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, ShieldCheck, AlertCircle,
  CheckCircle2, Camera, Trash2, Loader2, Lock, ChevronRight, Eye, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile, useUploadPhoto, useRemovePhoto } from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import SEO from '../components/common/SEO';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef(null);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Feedback & Modal
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [viewPhotoModal, setViewPhotoModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: uploadPhoto, isPending: isUploadingPhoto } = useUploadPhoto();
  const { mutate: removePhoto, isPending: isRemovingPhoto } = useRemovePhoto();

  const hasPhoto = !!user?.profilePhoto?.url;
  const isPhotoLoading = isUploadingPhoto || isRemovingPhoto;

  /* ── Handlers ─────────────────────────────── */
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Only JPG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image must be under 2 MB');
      return;
    }
    uploadPhoto(file, {
      onError: (err) => setPhotoError(err?.response?.data?.message || 'Upload failed'),
    });
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoError('');
    setConfirmDeleteModal(false);
    removePhoto(undefined, {
      onError: (err) => setPhotoError(err?.response?.data?.message || 'Remove failed'),
    });
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    updateProfile({ name, phone }, {
      onSuccess: () => { setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000); },
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <SEO title="My Profile" noindex />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">Account Settings</h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
          Manage your profile, personal information, and security.
        </p>
      </div>

      {/* ── Profile Card (Photo + Info) ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8">
            {/* Avatar & Photo Actions */}
            <div className="flex flex-col items-center sm:items-start gap-4 shrink-0">
              <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-md ring-1 ring-neutral-light relative bg-base-200">
                {isPhotoLoading && (
                  <div className="absolute inset-0 bg-base-neutral/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 size={32} className="text-primary animate-spin" />
                  </div>
                )}
                {hasPhoto ? (
                  <img src={user.profilePhoto.url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User size={48} className="text-primary/60" />
                  </div>
                )}
              </div>

              {/* Explicit Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPhotoLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Camera size={14} />
                  {hasPhoto ? 'Change Photo' : 'Upload Photo'}
                </button>
                {hasPhoto && (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewPhotoModal(true)}
                      className="p-1.5 rounded-lg text-primary border border-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                      title="View full photo"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteModal(true)}
                      disabled={isPhotoLoading}
                      className="p-1.5 rounded-lg text-error border border-error hover:bg-error/10 transition-colors disabled:opacity-50"
                      title="Remove photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left sm:pt-2">
              <h2 className="text-xl lg:text-2xl font-extrabold text-base-content tracking-tight">{user?.name}</h2>
              <p className="text-sm text-base-content/60 mt-0.5">{user?.email}</p>

              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {user?.role === 'admin' ? 'Administrator' : 'Dentist'}
                </span>
                {user?.phone && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-base-200 text-base-content/70 flex items-center gap-1">
                    <Phone size={11} />
                    {user.phone}
                  </span>
                )}
              </div>

              {photoError && (
                <p className="text-xs text-error mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {photoError}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Personal Information ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="text-base font-bold text-base-content">Personal Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-sm">Full Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-base-200"
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-sm">Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +2010..."
                  className="input input-bordered w-full bg-base-200"
                />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-sm">Email Address</span>
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input input-bordered w-full bg-base-300/50 opacity-60 cursor-not-allowed"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50 italic">Contact support to change your email.</span>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" variant="primary" loading={isUpdatingProfile} className="px-6">
                Save Changes
              </Button>
              <AnimatePresence>
                {profileSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-success text-sm font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={15} /> Saved!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* ── Security Link ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link to="/profile/security">
          <Card className="p-0 overflow-hidden hover:border-warning/30 transition-all cursor-pointer group">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center group-hover:bg-warning/15 transition-colors">
                  <Lock size={20} className="text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-base-content text-sm">Change Password</h3>
                  <p className="text-xs text-base-content/50 mt-0.5">Update your password to keep your account secure</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-base-content/40 group-hover:text-warning transition-colors" />
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* ── Photo View Modal ── */}
      <AnimatePresence>
        {viewPhotoModal && hasPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewPhotoModal(false)}
              className="absolute inset-0 bg-base-neutral/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full max-h-[85vh] flex flex-col z-10 border border-neutral-light/50"
            >
              <div className="flex items-center justify-between p-4 border-b border-neutral-light shrink-0">
                <h3 className="font-bold text-base-content text-lg">Profile Photo</h3>
                <button
                  onClick={() => setViewPhotoModal(false)}
                  className="p-1.5 rounded-lg text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-base-200/50">
                <img
                  src={user.profilePhoto.url}
                  alt={user.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-neutral-light shadow-sm"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {confirmDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteModal(false)}
              className="absolute inset-0 bg-base-neutral/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-base-100 rounded-2xl shadow-xl overflow-hidden max-w-sm w-full z-10 border border-neutral-light/50 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 className="font-bold text-base-content text-lg mb-2">Delete Profile Photo?</h3>
              <p className="text-sm text-base-content/70 mb-6">
                Are you sure you want to remove your profile photo? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl text-base-content/70 font-semibold hover:bg-base-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="flex-1 px-4 py-2 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

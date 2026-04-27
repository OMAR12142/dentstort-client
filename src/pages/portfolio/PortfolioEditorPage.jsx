import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, GlobeLock, Eye, Share2, Plus, Pencil, Trash2, X,
  Briefcase, Mail, Phone, MapPin, Clock, CheckCircle2,
  AlertCircle, Loader2, Image as ImageIcon, Copy, Check, ChevronRight, FileText, Search
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SEO from '../../components/common/SEO';
import {
  useMyPortfolio,
  useCreatePortfolio,
  useUpdatePortfolio,
  useTogglePortfolio,
  usePublishCase,
  useEditCase,
  useDeleteCase,
  useReorderCase,
  useMediaLibrary,
} from '../../hooks/usePortfolio';

// ════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════
const TREATMENT_TYPES = [
  'Surgery', 'Implant', 'Endo', 'Perio', 'Fixed', 'Removable', 'Restorative', 'General'
];

// ════════════════════════════════════════════════
//  MAIN EDITOR PAGE
// ════════════════════════════════════════════════
export default function PortfolioEditorPage() {
  const [page, setPage] = useState(1);
  const limit = 6;
  const { data: portfolio, isLoading } = useMyPortfolio(page, limit);
  const { mutate: createPortfolio, isPending: isCreating } = useCreatePortfolio();
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolio();
  const { mutate: togglePortfolio } = useTogglePortfolio();
  const { mutate: deleteCase } = useDeleteCase();

  // Modal states
  const [addCaseModal, setAddCaseModal] = useState(false);
  const [editCaseModal, setEditCaseModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [copied, setCopied] = useState(false);

  // Profile form
  const [bio, setBio] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [servicesInput, setServicesInput] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'cases'

  // Sync form from portfolio data
  if (portfolio && !profileLoaded) {
    setBio(portfolio.bio || '');
    setYearsOfExperience(portfolio.yearsOfExperience || 0);
    setServicesInput((portfolio.services || []).join(', '));
    setContactEmail(portfolio.contactEmail || '');
    setContactPhone(portfolio.contactPhone || '');
    setClinicName(portfolio.clinicName || '');
    setClinicAddress(portfolio.clinicAddress || '');
    setProfileLoaded(true);
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUpdateSuccess(false);
    updatePortfolio({
      bio,
      yearsOfExperience: parseInt(yearsOfExperience, 10) || 0,
      services: servicesInput.split(',').map((s) => s.trim()).filter(Boolean),
      contactEmail,
      contactPhone,
      clinicName,
      clinicAddress,
    }, {
      onSuccess: () => setUpdateSuccess(true),
    });
  };

  const { mutate: reorderCase } = useReorderCase();
  
  const handleReorder = (caseId, direction) => {
    reorderCase({ caseId, direction });
  };

  const handleDeleteCase = (caseId) => {
    deleteCase(caseId, {
      onSuccess: () => setConfirmDelete(null)
    });
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
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
      <div className="bg-base-200 border border-base-content/10 shadow-sm rounded-2xl p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A66C2]/5 rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#0A66C2]/10 flex items-center justify-center border border-[#0A66C2]/20 shrink-0">
              <Globe className="text-[#0A66C2]" size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold text-[#191919] dark:text-white tracking-tight">Public Portfolio</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${portfolio.isPublished
                    ? 'bg-[#057642]/10 text-[#057642] border-[#057642]/20'
                    : 'bg-[#666666]/10 text-[#666666] border-[#666666]/20'
                  }`}>
                  {portfolio.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Toggle Published */}
            <button
              onClick={() => togglePortfolio()}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all border ${portfolio.isPublished
                  ? 'bg-white dark:bg-[#1A1A1A] text-[#E74C3C] border-[#E74C3C]/30 hover:bg-[#E74C3C]/5'
                  : 'bg-[#0A66C2] text-white border-transparent hover:bg-[#0A66C2]/90 shadow-lg shadow-[#0A66C2]/20'
                }`}
            >
              {portfolio.isPublished ? <GlobeLock size={16} /> : <Globe size={16} />}
              {portfolio.isPublished ? 'Unpublish' : 'Go Live Now'}
            </button>

            {/* Copy & Preview */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {portfolio.isPublished && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-base-100 text-base-content border border-base-content/10 hover:bg-base-content/5 transition-all"
                >
                  <Eye size={16} />
                  Preview
                </a>
              )}
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-base-100 text-base-content/60 border border-base-content/10 hover:bg-base-content/5 transition-all"
              >
                {copied ? <Check size={16} className="text-[#057642]" /> : <Share2 size={16} />}
                {copied ? 'Copied' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex items-center gap-1 bg-base-200 p-1 rounded-2xl border border-base-content/10 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile'
              ? 'bg-[#0A66C2] text-white shadow-md'
              : 'text-[#666666] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
            }`}
        >
          <Briefcase size={16} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'cases'
              ? 'bg-[#0A66C2] text-white shadow-md'
              : 'text-[#666666] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
            }`}
        >
          <ImageIcon size={16} />
          Cases
          {portfolio.publishedCases?.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-1 ${activeTab === 'cases' ? 'bg-white/20' : 'bg-[#E0DFDC] dark:bg-[#3A3A3A] text-[#666666]'}`}>
              {portfolio.publishedCases.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="profile">
          <div className="bg-base-200 border border-base-content/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E0DFDC] dark:border-[#3A3A3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center">
                  <Briefcase size={16} className="text-[#0A66C2]" />
                </div>
                <h2 className="text-base font-bold text-[#191919] dark:text-white">Profile Identity</h2>
              </div>
              <AnimatePresence>
                {updateSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[#057642] text-xs font-bold flex items-center gap-1 bg-[#057642]/10 px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle2 size={14} /> Saved Successfully
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-8">
              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white flex items-center gap-2">
                  Professional Summary
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-base-100 border border-base-content/10 rounded-xl p-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
                  placeholder="Introduce yourself to patients. Mention your specialties, philosophy, and professional background..."
                />
              </div>

              {/* Experience and Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white">Years of Clinical Experience</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] dark:text-gray-500" size={16} />
                    <input
                      type="number"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      min="0"
                      className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 pl-10 pr-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white">Clinical Specialties</label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    placeholder="e.g. Implants, Cosmetic Dentistry, Orthodontics"
                    className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-[#666666] font-medium">Separate specialties with commas.</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E0DFDC] dark:border-[#3A3A3A]">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white flex items-center gap-2">
                    <Mail size={16} className="text-[#0A66C2]" /> Public Inquiry Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="dr.name@example.com"
                    className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white flex items-center gap-2">
                    <Phone size={16} className="text-[#25D366]" /> WhatsApp / Phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+20 123 456 7890"
                    className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Clinic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-[#E74C3C]" /> Clinic Name
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Dental Care Center"
                    className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#191919] dark:text-white">Clinic Address</label>
                  <input
                    type="text"
                    value={clinicAddress}
                    onChange={(e) => setClinicAddress(e.target.value)}
                    placeholder="Full street address or city..."
                    className="w-full bg-base-100 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-[#0A66C2] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#0A66C2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#0A66C2]/20"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : 'Apply Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* ── Tab Content: Cases Gallery ── */}
      {activeTab === 'cases' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="cases">
          <div className="bg-base-200 border border-base-content/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E0DFDC] dark:border-[#3A3A3A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center">
                  <ImageIcon size={16} className="text-[#0A66C2]" />
                </div>
                <h2 className="text-base font-bold text-[#191919] dark:text-white">Clinical Portfolio Gallery</h2>
              </div>
              <button
                onClick={() => setAddCaseModal(true)}
                className="bg-[#0A66C2] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#0A66C2]/90 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> Add Case Study
              </button>
            </div>

            {(!portfolio.publishedCases || portfolio.publishedCases.length === 0) ? (
              <div className="text-center py-16 bg-base-100 rounded-2xl border-2 border-dashed border-base-content/5">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ImageIcon size={28} className="text-base-content/30" />
                </div>
                <h3 className="text-sm font-bold text-base-content mb-1">No Clinical Cases Yet</h3>
                <p className="text-xs text-base-content/50 mb-6 max-w-xs mx-auto">Start building your clinical brand by publishing your first procedure gallery.</p>
                <button
                  onClick={() => setAddCaseModal(true)}
                  className="text-[#0A66C2] text-xs font-bold hover:underline py-1"
                >
                  + Publish a Case Study
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolio.publishedCases.map((c) => (
                    <div
                      key={c._id}
                      className="group bg-base-100 border border-base-content/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="aspect-[4/3] bg-base-200 overflow-hidden relative">
                        {c.coverImage ? (
                          <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={32} className="text-[#666666]/10" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-start gap-1 p-1">
                          {/* Reordering Controls */}
                          <div className="flex flex-col gap-1 mr-1">
                            <button
                              onClick={() => handleReorder(c._id, 'up')}
                              className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                              title="Move Up"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                            </button>
                            <button
                              onClick={() => handleReorder(c._id, 'down')}
                              className="w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                              title="Move Down"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </button>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setEditCaseModal(c)} 
                              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center shadow-lg hover:bg-[#0A66C2]/90 transition-all active:scale-90"
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
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-base-content line-clamp-1 mb-1 group-hover:text-primary transition-colors">{c.title}</h3>
                        <div className="flex items-center justify-between mt-3">
                          {c.category && (
                            <span className="text-[10px] font-bold text-[#0A66C2] uppercase bg-[#0A66C2]/5 px-2 py-0.5 rounded">
                              {c.category}
                            </span>
                          )}
                          <span className="text-[10px] text-[#666666] font-medium italic">Published</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Pagination Controls ── */}
                {portfolio.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E0DFDC] dark:border-[#3A3A3A] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Prev
                    </button>
                    <div className="flex gap-1">
                      {[...Array(portfolio.pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${page === i + 1 ? 'bg-[#0A66C2] text-white shadow-md' : 'text-[#666666] hover:bg-gray-100 dark:hover:bg-[#333]'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={page === portfolio.pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E0DFDC] dark:border-[#3A3A3A] disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="absolute inset-0 bg-base-neutral/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-base-100 rounded-2xl shadow-xl max-w-sm w-full z-10 border border-neutral-light/50 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 className="font-bold text-lg mb-2">Remove Case?</h3>
              <p className="text-sm text-base-content/70 mb-6">
                This will remove the case from your public portfolio. The original session data is not affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 rounded-xl font-semibold hover:bg-base-200 transition-colors text-base-content/70">Cancel</button>
                <button onClick={() => handleDeleteCase(confirmDelete)} className="flex-1 px-4 py-2 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-colors">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════
//  ADD CASE MODAL (Multi-step Image Picker)
// ════════════════════════════════════════════════
function AddCaseModal({ onClose }) {
  const { data: library, isLoading } = useMediaLibrary();
  const { mutate: publishCase, isPending } = usePublishCase();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [treatmentType, setTreatmentType] = useState('General');
  const [selectedImages, setSelectedImages] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const toggleImage = (url) => {
    setSelectedImages((prev) => {
      const isSelected = prev.includes(url);
      if (!isSelected && prev.length >= 5) {
        setError('You can select a maximum of 5 images per case.');
        return prev;
      }
      setError('');
      const newSelections = isSelected ? prev.filter((u) => u !== url) : [...prev, url];
      if (coverImage === url && isSelected) {
        setCoverImage(newSelections.length > 0 ? newSelections[0] : '');
      }
      return newSelections;
    });
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!title.trim()) { setError('Title is required to proceed.'); return; }
      setStep(2);
    } else if (step === 2) {
      if (selectedImages.length === 0) { setError('Select at least one image to proceed.'); return; }
      if (!coverImage && selectedImages.length > 0) setCoverImage(selectedImages[0]);
      setStep(3);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    publishCase({
      title,
      description,
      category,
      treatmentType,
      selectedImages,
      coverImage: coverImage || selectedImages[0],
    }, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err?.response?.data?.message || 'Failed to publish case'),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#191919]/60 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-[#252525] rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-[#E0DFDC] dark:border-[#3A3A3A] max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-[#E0DFDC] dark:border-[#3A3A3A] bg-gray-50/30 dark:bg-[#1A1A1A]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-[#191919] dark:text-white tracking-tight">Post New Result</h3>
            <button onClick={onClose} className="p-2 rounded-xl border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-white dark:hover:bg-[#333] transition-colors text-[#191919] dark:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= s ? 'bg-[#0A66C2] text-white' : 'bg-[#E0DFDC] dark:bg-[#3A3A3A] text-[#666666]'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-[#0A66C2]' : 'bg-[#E0DFDC] dark:bg-[#3A3A3A]'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs font-bold text-[#666666] uppercase tracking-widest">
              {step === 1 ? 'Clinical Details' : step === 2 ? 'Media Library' : 'Final Preview'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[#E74C3C]/10 border border-[#E74C3C]/20 flex items-center gap-3 text-[#E74C3C] text-sm font-bold">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Clinical Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upper Jaw Reconstruction"
                  className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Procedure Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Trial/Patient Note (Internal)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Case #12, VIP Patient"
                  className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/20 focus:border-[#0A66C2]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Treatment Type *</label>
                <div className="flex flex-wrap gap-2">
                  {TREATMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTreatmentType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${treatmentType === type
                        ? 'bg-[#0A66C2] text-white border-[#0A66C2] shadow-md shadow-[#0A66C2]/20'
                        : 'bg-white dark:bg-[#1A1A1A] text-[#666666] border-[#E0DFDC] dark:border-[#3A3A3A] hover:border-[#0A66C2]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#252525] p-3 rounded-2xl border border-[#E0DFDC] dark:border-[#3A3A3A] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedImages.length === 5 ? 'bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C]/30' : 'bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/30'}`}>
                    {selectedImages.length} / 5 Selected
                  </div>
                  <p className="text-[10px] font-bold text-[#666666] dark:text-gray-400 uppercase tracking-tight">Maximum allowed per case</p>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl py-2 px-11 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {library?.filter(session => session.patientName.toLowerCase().includes(searchQuery.toLowerCase())).map((session) => (
                  <div key={session.sessionId} className="border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-2xl p-4 bg-white dark:bg-[#1A1A1A]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#191919] dark:text-white uppercase tracking-tight">{session.patientName}</span>
                      <span className="text-[10px] font-medium text-[#666666]">{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {session.images.map((img, i) => (
                        <div key={i} onClick={() => toggleImage(img)} className={`aspect-square rounded-xl overflow-hidden cursor-pointer relative border-2 ${selectedImages.includes(img) ? 'border-[#0A66C2] shadow-lg scale-95' : 'border-transparent hover:border-[#0A66C2]/40'}`}>
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          {selectedImages.includes(img) && (
                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center">
                              <Check size={12} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-[#F3F2EF] dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#E0DFDC] dark:border-[#3A3A3A]">
                <h4 className="font-bold text-xl text-[#191919] dark:text-white mb-2">{title}</h4>
                <p className="text-sm text-[#666666] dark:text-gray-400 leading-relaxed italic">{description || 'No description provided.'}</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {selectedImages.map((img, i) => (
                  <div key={i} onClick={() => setCoverImage(img)} className={`cursor-pointer aspect-square rounded-2xl overflow-hidden relative border-2 ${coverImage === img ? 'border-[#0A66C2] shadow-xl scale-95' : 'border-transparent opacity-60 hover:opacity-100 transition-all'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    {coverImage === img && <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#0A66C2] text-white text-[8px] font-bold rounded-lg uppercase tracking-widest">Main</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-[#E0DFDC] dark:border-[#3A3A3A] bg-gray-50/30 dark:bg-[#1A1A1A]/30 flex items-center justify-between flex-row-reverse">
          {step < 3 ? (
            <Button onClick={nextStep} className="px-8 shadow-xl shadow-[#0A66C2]/20">
              Next Stage <ChevronRight size={18} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={isPending} className="px-10 shadow-xl shadow-[#0A66C2]/20">
              Publish Clinical Case
            </Button>
          )}
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="px-5 py-2 font-bold text-xs text-[#666666] hover:bg-white dark:hover:bg-[#333] rounded-xl border border-[#E0DFDC] dark:border-[#3A3A3A] transition-all">Back</button>
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
  const { data: library, isLoading } = useMediaLibrary();
  const { mutate: editCase, isPending } = useEditCase();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(caseData.title || '');
  const [description, setDescription] = useState(caseData.description || '');
  const [category, setCategory] = useState(caseData.category || '');
  const [treatmentType, setTreatmentType] = useState(caseData.treatmentType || 'General');
  const [selectedImages, setSelectedImages] = useState(caseData.selectedImages || []);
  const [coverImage, setCoverImage] = useState(caseData.coverImage || (caseData.selectedImages?.[0] || ''));
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleImage = (url) => {
    setSelectedImages((prev) => {
      const isSelected = prev.includes(url);
      if (!isSelected && prev.length >= 5) {
        setError('Maximum of 5 images allowed.');
        return prev;
      }
      const newSelections = isSelected ? prev.filter((u) => u !== url) : [...prev, url];
      if (coverImage === url && isSelected) {
        setCoverImage(newSelections.length > 0 ? newSelections[0] : '');
      }
      return newSelections;
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    editCase({
      caseId: caseData._id,
      title,
      description,
      category,
      treatmentType,
      selectedImages,
      coverImage: coverImage || selectedImages[0]
    }, {
      onSuccess: () => onClose(),
      onError: (err) => setError(err?.response?.data?.message || 'Failed to update case'),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#191919]/60 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white dark:bg-[#252525] rounded-3xl shadow-2xl max-w-2xl w-full z-10 border border-[#E0DFDC] dark:border-[#3A3A3A] max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-[#E0DFDC] dark:border-[#3A3A3A] bg-gray-50/30 dark:bg-[#1A1A1A]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-[#191919] dark:text-white tracking-tight">Edit Case Study</h3>
            <button onClick={onClose} className="p-2 rounded-xl border border-[#E0DFDC] dark:border-[#3A3A3A] hover:bg-white dark:hover:bg-[#333] transition-colors text-[#191919] dark:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${step === 1 ? 'border-[#0A66C2] text-[#0A66C2]' : 'border-transparent text-[#666666]'}`}>1. Details</button>
            <button onClick={() => setStep(2)} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${step === 2 ? 'border-[#0A66C2] text-[#0A66C2]' : 'border-transparent text-[#666666]'}`}>2. Images</button>
            <button onClick={() => setStep(3)} className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-all ${step === 3 ? 'border-[#0A66C2] text-[#0A66C2]' : 'border-transparent text-[#666666]'}`}>3. Finalize</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[#E74C3C]/10 border border-[#E74C3C]/20 text-[#E74C3C] text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl py-3 px-4 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-4 text-sm resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#191919] dark:text-white">Treatment Type</label>
                <div className="flex flex-wrap gap-2">
                  {TREATMENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTreatmentType(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${treatmentType === type
                        ? 'bg-[#0A66C2] text-white border-[#0A66C2]'
                        : 'bg-white dark:bg-[#1A1A1A] text-[#666666] border-[#E0DFDC] dark:border-[#3A3A3A]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-black/20 p-3 rounded-xl border border-[#E0DFDC] dark:border-[#3A3A3A]">
                <span className="text-[10px] font-black uppercase text-[#666666] dark:text-gray-400 tracking-widest">Selected: {selectedImages.length} / 5</span>
                <span className="text-[9px] font-bold text-[#E74C3C] uppercase tracking-tighter">Limit: 5 Photos</span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Filter gallery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F3F2EF] dark:bg-[#1A1A1A] border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl py-2 pl-10 pr-4 text-xs"
                />
              </div>
              <div className="space-y-4">
                {library?.filter(s => s.patientName.toLowerCase().includes(searchQuery.toLowerCase())).map(session => (
                  <div key={session.sessionId} className="border border-[#E0DFDC] dark:border-[#3A3A3A] rounded-xl p-3">
                    <p className="text-xs font-bold mb-2 text-[#666666]">{session.patientName}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {session.images.map((img, idx) => (
                        <div key={idx} onClick={() => toggleImage(img)} className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedImages.includes(img) ? 'border-[#0A66C2]' : 'border-transparent'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <p className="text-xs font-bold text-[#666666] uppercase">Pick Display Cover</p>
              <div className="grid grid-cols-4 gap-3">
                {selectedImages.map((img, idx) => (
                  <div key={idx} onClick={() => setCoverImage(img)} className={`cursor-pointer aspect-square rounded-xl overflow-hidden relative border-2 ${coverImage === img ? 'border-[#0A66C2]' : 'border-transparent'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#E0DFDC] dark:border-[#3A3A3A] flex items-center justify-between">
          <button onClick={onClose} className="px-6 py-2.5 font-bold text-xs text-[#666666]">Cancel</button>
          <div className="flex gap-3">
            {step > 1 && <button onClick={() => setStep(s => s - 1)} className="px-6 py-2.5 bg-gray-100 rounded-xl font-bold text-xs">Back</button>}
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)} className="bg-[#0A66C2] text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-[#0A66C2]/20">Next</button>
            ) : (
              <Button onClick={handleSubmit} loading={isPending} className="px-10">Confirm Edits</Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

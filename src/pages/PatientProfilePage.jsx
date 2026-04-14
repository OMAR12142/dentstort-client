import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Building2,
  DollarSign,
  AlertTriangle,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  MapPin,
  Briefcase,
  Pill,
  ListChecks,
  Check,
  X,
  ArrowLeft,
  Phone,
  CreditCard,
  Wallet,
  Percent,
  Receipt,
} from 'lucide-react';
import { usePatient, useUpdatePatient, useDeletePatient } from '../hooks/usePatients';
import { useSessions, useDeleteSession } from '../hooks/useSessions';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/Badge';
import Card from '../components/Card';
import LogSessionModal from '../components/LogSessionModal';
import ImageLightboxModal from '../components/ImageLightboxModal';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { calculateAge } from '../utils/dateUtils';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/10 text-success border border-success/20';
    case 'On-Hold': return 'bg-warning/10 text-warning-content border border-warning/20';
    case 'Dropped': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'Active':
    default: return 'bg-info/10 text-info border border-info/20';
  }
};

// ── Helper Components ─────────────────────────
const ExpandableText = ({ text, limit = 200 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowButton = text.length > limit;

  if (!shouldShowButton) {
    return (
      <p className="text-sm text-base-content/70 leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap">
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-1 min-w-0 w-full overflow-hidden">
      <p className={`text-sm text-base-content/70 leading-relaxed [overflow-wrap:anywhere] break-all whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-bold text-primary hover:underline transition-all"
      >
        {isExpanded ? 'Show Less' : 'Read Full Details'}
      </button>
    </div>
  );
};

const InfoBlock = ({ icon: Icon, label, value, colorClass = "text-primary" }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 bg-base-100/40 p-3 rounded-xl border border-neutral-light/20 min-w-0">
      <div className={`w-8 h-8 rounded-lg ${colorClass} bg-current/10 flex items-center justify-center shrink-0`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">
          {label}
        </p>
        <p className="text-sm font-semibold text-base-content [overflow-wrap:anywhere] break-words leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
};

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading: loadP, isError: isErrorP, error: errorP, refetch: refetchP } = usePatient(id);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const { mutate: deletePatient, isPending: isDeletingPatient } = useDeletePatient();
  const { data: sessionsData, isLoading: loadS, isError: isErrorS, error: errorS, refetch: refetchS } = useSessions(id);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const [showLogSession, setShowLogSession] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], index: 0 });
  const [showToast, setShowToast] = useState(false);

  const sessions = Array.isArray(sessionsData)
    ? sessionsData
    : sessionsData?.sessions || [];

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const financialSummary = useMemo(() => {
    let total_cost = 0;
    let total_paid = 0;
    let total_cut = 0;

    sortedSessions.forEach((s) => {
      total_cost += s.cost || 0;
      total_paid += s.paid || 0;
      total_cut += s.cut || 0;
    });

    return {
      total_cost,
      total_paid,
      remaining_balance: total_cost - total_paid,
      total_cut,
    };
  }, [sortedSessions]);

  const handleEdit = (session) => {
    setSessionToEdit(session);
    setShowLogSession(true);
  };

  const handleDeleteClick = (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteSession(sessionId);
    }
  };

  const handleCloseModal = () => {
    setShowLogSession(false);
    setSessionToEdit(null);
  };

  const handleStatusUpdate = (newStatus) => {
    updatePatient(
      { id: patient._id, data: { status: newStatus } },
      {
        onSuccess: () => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        },
      }
    );
  };

  const handleDeletePatientClick = () => {
    if (window.confirm('Are you sure you want to delete this patient permanently? This action cannot be undone.')) {
      deletePatient(patient._id, {
        onSuccess: () => {
          navigate('/patients');
        }
      });
    }
  };



  if (loadP || loadS) return <ProfileSkeleton />;

  if (isErrorP || isErrorS) {
    const error = errorP || errorS;
    const refetch = () => { refetchP(); refetchS(); };
    return <ErrorState error={error} refetch={refetch} />;
  }

  if (!patient) {
    return (
      <div className="text-center py-20 text-base-content/70">Patient not found.</div>
    );
  }

  const warnings = (patient.medical_history || []).filter(
    (h) => /allergy|diabetic|heart|hypertension/i.test(h)
  );

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden px-0.5">
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-none text-white font-medium border border-success">
            <CheckCircle size={20} />
            <span>Patient file marked as completed</span>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-2">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-1.5 text-sm font-medium text-base-content/70 hover:text-primary transition-colors cursor-pointer"
          title="Back to Patients"
        >
          <ArrowLeft size={18} />
          <span>Back to Patients</span>
        </button>
      </div>

      {/* Patient Header - Professional Hero Layout */}
      <div className="relative group">
        <Card className="overflow-hidden border border-neutral-light/50 overflow-visible p-4 sm:p-6 lg:p-8">
          <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
            {/* Top Row: Avatar & Primary Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0 w-full">
                <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center text-3xl font-bold border-4 border-primary/10 shrink-0 shadow-lg">
                  {patient.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-center sm:text-left min-w-0 flex-1 w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2 sm:gap-4 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight break-all [overflow-wrap:anywhere] leading-tight">
                      {patient.name}
                    </h1>
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-black rounded-lg whitespace-nowrap shrink-0 tracking-widest ring-1 ring-inset ring-current/20 w-fit mx-auto sm:mx-0 ${getStatusColor(patient.status)}`}>
                      {patient.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2 gap-y-2">
                    {patient.clinic_id?.name && (
                      <div className="flex items-center gap-1.5 text-primary font-bold text-xs bg-primary/10 py-1 px-3 rounded-full w-fit">
                        <Building2 size={13} />
                        {patient.clinic_id.name}
                      </div>
                    )}
                    {patient.createdAt && (
                      <div className="flex items-center gap-1.5 text-base-content/50 font-bold text-xs bg-base-200/50 py-1 px-3 rounded-full w-fit">
                        <Clock size={13} />
                        Joined {new Date(patient.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                {/* Status Selector */}
                <div className="relative w-full sm:w-auto">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/50 z-20">
                    {isUpdating ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <ListChecks size={16} />
                    )}
                  </div>
                  <select
                    value={patient.status || 'Active'}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={isUpdating}
                    className={`select select-md pl-10 pr-10 rounded-xl font-black text-sm appearance-none cursor-pointer transition-all w-full sm:w-44 h-11 border-2 ${getStatusColor(patient.status)} active:scale-95`}
                  >
                    <option value="Active">Active Case</option>
                    <option value="On-Hold">On-Hold</option>
                    <option value="Completed">Completed Case</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowLogSession(true)}
                  className="btn h-11 min-h-0 bg-primary hover:bg-primary-focus text-white border-0 rounded-xl px-6 font-bold text-sm w-full sm:w-auto active:scale-95 transition-all gap-2"
                >
                  <Plus size={18} />
                  Add Session
                </button>

                <button
                  onClick={handleDeletePatientClick}
                  disabled={isDeletingPatient}
                  className="btn h-11 min-h-0 bg-base-200/50 hover:bg-error/10 text-error border border-error/20 hover:border-error/30 rounded-xl px-4 w-full sm:w-auto active:scale-95 transition-all outline-none tooltip tooltip-bottom"
                  data-tip="Delete Patient"
                >
                  {isDeletingPatient ? <span className="loading loading-spinner loading-xs" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>

            {/* Middle Row: Information Blocks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <InfoBlock
                icon={Phone}
                label="Primary Phone"
                value={patient.phone}
                colorClass="text-emerald-500"
              />
              <InfoBlock
                icon={Phone}
                label="Secondary Phone"
                value={patient.phone2}
                colorClass="text-secondary"
              />
              <InfoBlock
                icon={CalendarDays}
                label="Age"
                value={patient.dateOfBirth || patient.age != null ? `${patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age} Years` : null}
                colorClass="text-indigo-500"
              />
              <InfoBlock
                icon={Briefcase}
                label="Occupation"
                value={patient.job}
                colorClass="text-cyan-500"
              />
            </div>

            {/* Bottom Row: Address & Warning Area */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-stretch">
              {patient.address && (
                <div className="flex-1 w-full bg-base-100/40 p-4 rounded-xl border border-neutral-light/20 flex items-center gap-3 min-w-0 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-black text-rose-600 tracking-wider">Address</p>
                    <p className="text-sm font-semibold text-base-content break-all [overflow-wrap:anywhere] leading-snug">{patient.address}</p>
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="flex-1 min-w-0 w-full bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} className="animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Medical Alert</p>
                    <p className="text-sm font-black text-amber-700 dark:text-amber-400 break-all [overflow-wrap:anywhere] uppercase leading-snug">
                      {warnings.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Overview Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-light/30">
              <div className="bg-info/10 p-3 rounded-xl border border-info/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 text-info flex items-center justify-center shrink-0">
                  <Receipt size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-info/80 tracking-wider">Total Cost</p>
                  <p className="text-sm font-black text-info">EGP {financialSummary.total_cost.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-success/10 p-3 rounded-xl border border-success/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center shrink-0">
                  <CreditCard size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-success/80 tracking-wider">Total Paid</p>
                  <p className="text-sm font-black text-success">EGP {financialSummary.total_paid.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-error/10 p-3 rounded-xl border border-error/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error/20 text-error flex items-center justify-center shrink-0">
                  <Wallet size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-error/80 tracking-wider">Remaining</p>
                  <p className="text-sm font-black text-error">EGP {financialSummary.remaining_balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-primary/10 p-3 rounded-xl border border-primary/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Percent size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-primary/80 tracking-wider">Your Cut</p>
                  <p className="text-sm font-black text-primary">EGP {financialSummary.total_cut.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Treatment Plan Summary → Links to sub-page */}
      <Link
        to={`/patients/${patient._id}/treatment-plan`}
        className="block group"
      >
        <Card className="p-4 sm:p-5 mb-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <ListChecks size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-base-content">Treatment Plan</h2>
                {(patient.treatment_plan?.length || 0) > 0 && (
                  <span className="px-2 py-0.5 text-xs font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {patient.treatment_plan.filter(i => i.isCompleted).length}/{patient.treatment_plan.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-base-content/50 mt-0.5">
                {!patient.treatment_plan?.length
                  ? 'No steps yet — tap to add'
                  : `${patient.treatment_plan.filter(i => i.isCompleted).length} of ${patient.treatment_plan.length} steps completed`
                }
              </p>
            </div>
            <ArrowLeft size={16} className="text-base-content/30 rotate-180 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>

          {/* Mini progress bar */}
          {(patient.treatment_plan?.length || 0) > 0 && (
            <div className="mt-3 w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.round((patient.treatment_plan.filter(i => i.isCompleted).length / patient.treatment_plan.length) * 100)}%` }}
              />
            </div>
          )}
        </Card>
      </Link>

      {/* Sessions Timeline */}
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-bold text-base-content">Session History</h2>
        {sessions.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-black bg-primary/10 text-primary rounded-full">
            {sessions.length}
          </span>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <Clock size={40} className="mx-auto mb-3 text-base-content/30" />
          <p className="text-base-content/70">No sessions recorded yet.</p>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {sortedSessions.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative flex gap-3 sm:gap-4"
            >
              {/* Timeline dot & line */}
              <div className="flex flex-col items-center mt-6">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-base-200 z-10 shrink-0" />
                {i !== sortedSessions.length - 1 && (
                  <div className="w-0.5 bg-primary/20 flex-1 mt-2" />
                )}
              </div>

              <Card className="flex-1">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-base-content">
                      <CalendarDays size={15} className="text-primary" />
                      {new Date(s.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {s.clinic_id && (
                      <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                        <Building2 size={12} />
                        {typeof s.clinic_id === 'object' ? s.clinic_id.name : 'Clinic'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-base-content/40 hover:text-primary transition-colors"
                      title="Edit session"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(s._id)}
                      disabled={isDeleting}
                      className="p-1.5 text-base-content/40 hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete session"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Treatment Details - Robust for long text */}
                {s.treatment_details && (
                  <div className="bg-base-100/50 rounded-xl p-4 border border-neutral-light/30 mb-4 shadow-inner min-w-0">
                    <h1 className="text-[13px] text-primary dark:text-indigo-400 uppercase font-black mb-2 tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Treatment Details
                    </h1>
                    <div className="min-w-0 overflow-hidden">
                      <ExpandableText text={s.treatment_details} limit={250} />
                    </div>
                  </div>
                )}

                {/* Financials - Dynamic Grid for large currency values */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3">
                  <div className="bg-base-100/80 rounded-lg p-3 text-center border border-neutral-light/10">
                    <p className="text-xs text-base-content/70 mb-0.5">Total Cost</p>
                    <p className="text-sm font-bold text-base-content [overflow-wrap:anywhere]">
                      {s.total_cost?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 text-center border border-green-200/30">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Paid</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-300 [overflow-wrap:anywhere]">
                      {s.amount_paid?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 text-center border border-amber-200/30">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Remaining</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300 [overflow-wrap:anywhere]">
                      {s.remaining_balance?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-sky-50 dark:bg-sky-900/10 rounded-lg p-3 text-center border border-sky-200/30">
                    <p className="text-xs text-sky-600 dark:text-sky-400 mb-0.5">Your Cut</p>
                    <p className="text-sm font-bold text-sky-700 dark:text-sky-300 [overflow-wrap:anywhere]">
                      {s.dentist_cut?.toLocaleString()} EGP
                    </p>
                  </div>
                </div>

                {/* Next Appointment */}
                {s.next_appointment && (
                  <p className="text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mb-3">
                    <Clock size={13} />
                    Next:{' '}
                    {new Date(s.next_appointment).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {/* Media thumbnails */}
                {s.media_urls?.length > 0 && (
                  <div className="flex gap-3 mt-4 flex-wrap border-t border-neutral-light pt-4">
                    {s.media_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightbox({ isOpen: true, images: s.media_urls, index: idx })}
                        className="w-20 sm:w-24 h-20 sm:h-24 rounded-xl overflow-hidden border border-neutral-light hover:ring-2 hover:ring-primary transition-all focus:outline-none shadow-sm relative group"
                      >
                        <img
                          src={url}
                          alt={`Session media ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <LogSessionModal
        open={showLogSession}
        onClose={handleCloseModal}
        initialPatientId={id}
        sessionToEdit={sessionToEdit}
      />

      <ImageLightboxModal
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
        images={lightbox.images}
        initialIndex={lightbox.index}
      />
    </div>
  );
}

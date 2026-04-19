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
  Activity,
  ShieldCheck,
  StickyNote,
  Send,
} from 'lucide-react';
import { usePatient, useUpdatePatient, useDeletePatient } from '../hooks/usePatients';
import { useSessions, useDeleteSession } from '../hooks/useSessions';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/Modal';
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
  const [noteInput, setNoteInput] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const sessions = Array.isArray(sessionsData)
    ? sessionsData
    : sessionsData?.sessions || [];

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [sessions]);

  const financialSummary = useMemo(() => {
    let cost = 0;
    let paid = 0;
    let cut = 0;

    sortedSessions.forEach((s) => {
      cost += Number(s.total_cost) || 0;
      paid += Number(s.amount_paid) || 0;
      cut += Number(s.dentist_cut) || 0;
    });

    return {
      total_cost: cost,
      total_paid: paid,
      remaining_balance: cost - paid,
      total_cut: cut,
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

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote = { text: noteInput.trim(), createdAt: new Date() };
    const updatedNotes = [newNote, ...(patient.notes || [])];

    updatePatient({ id: patient._id, data: { notes: updatedNotes } }, {
      onSuccess: () => setNoteInput('')
    });
  };

  const handleDeleteNote = (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    const updatedNotes = (patient.notes || []).filter(n => n._id !== noteId);
    updatePatient({ id: patient._id, data: { notes: updatedNotes } });
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note._id);
    setEditingText(note.text);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  const handleUpdateNote = (noteId) => {
    if (!editingText.trim()) return;
    const updatedNotes = (patient.notes || []).map(n =>
      n._id === noteId ? { ...n, text: editingText.trim() } : n
    );

    updatePatient({ id: patient._id, data: { notes: updatedNotes } }, {
      onSuccess: () => {
        setEditingNoteId(null);
        setEditingText('');
      }
    });
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
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
              <div className="flex flex-col items-center sm:items-start gap-4 min-w-0 flex-1">
                <div className="text-center sm:text-left min-w-0 w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3 sm:gap-4 mb-3">
                    <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight break-all [overflow-wrap:anywhere] leading-none">
                      {patient.name}
                    </h1>
                    <span className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-xl whitespace-nowrap shrink-0 tracking-[0.2em] ring-1 ring-inset ring-current/20 w-fit mx-auto sm:mx-0 ${getStatusColor(patient.status)}`}>
                      {patient.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    {patient.clinic_id?.name && (
                      <div className="flex items-center gap-1.5 text-primary-content font-bold text-[10px] uppercase tracking-wider bg-primary py-1.5 px-3 rounded-lg shadow-sm">
                        <Building2 size={12} />
                        {patient.clinic_id.name}
                      </div>
                    )}
                    {patient.createdAt && (
                      <div className="flex items-center gap-1.5 text-base-content/50 font-bold text-[10px] uppercase tracking-wider bg-base-200/80 py-1.5 px-3 rounded-lg">
                        <Clock size={12} />
                        Joined {new Date(patient.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                {/* Secondary Actions Row */}
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="relative flex-1 sm:flex-none p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-all active:scale-95 group/notes flex items-center justify-center gap-2"
                    title="Patient Notes"
                  >
                    <StickyNote size={20} className="group-hover/notes:rotate-12 transition-transform" />
                    <span className="text-xs font-black uppercase sm:hidden">Notes</span>
                    {patient.notes?.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-1 w-5 h-5 flex items-center justify-center bg-amber-600 text-white text-[10px] font-black rounded-full border-2 border-white shadow-sm ring-1 ring-amber-600/20">
                        {patient.notes.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={handleDeletePatientClick}
                    disabled={isDeletingPatient}
                    className="flex-1 sm:flex-none p-3 bg-base-200/50 hover:bg-error/10 text-error border border-neutral-light/50 hover:border-error/30 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 sm:px-4"
                  >
                    <Trash2 size={20} />
                    <span className="text-xs font-black uppercase sm:hidden">Delete</span>
                  </button>
                </div>

                {/* Status & Add Row */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base-content/50 z-20">
                      {isUpdating ? <span className="loading loading-spinner loading-xs" /> : <ListChecks size={18} />}
                    </div>
                    <select
                      value={patient.status || 'Active'}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={isUpdating}
                      className={`select select-md w-full pl-10 pr-10 rounded-2xl font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer transition-all h-12 border-2 ${getStatusColor(patient.status)} active:scale-95`}
                    >
                      <option value="Active">Active Case</option>
                      <option value="On-Hold">On-Hold</option>
                      <option value="Completed">Completed Case</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowLogSession(true)}
                    className="btn h-12 min-h-0 bg-primary hover:bg-primary-focus text-white border-0 rounded-2xl px-6 font-black text-xs uppercase tracking-widest active:scale-95 transition-all gap-2 flex-1"
                  >
                    <Plus size={20} strokeWidth={3} />
                    Add Session
                  </button>
                </div>
              </div>
            </div>

            {/* Information Blocks Grid - Expanded & Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <InfoBlock
                icon={Phone}
                label="Primary Phone"
                value={patient.phone}
                colorClass="text-emerald-500"
              />
              <InfoBlock
                icon={Phone}
                label="Secondary"
                value={patient.phone2}
                colorClass="text-secondary"
              />
              <InfoBlock
                icon={CalendarDays}
                label="Age"
                value={patient.dateOfBirth || patient.age != null ? `${patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : patient.age} Y` : null}
                colorClass="text-indigo-500"
              />
              <InfoBlock
                icon={Briefcase}
                label="Job"
                value={patient.job}
                colorClass="text-cyan-500"
              />
              <InfoBlock
                icon={ShieldCheck}
                label="Insurance"
                value={patient.insuranceCompany || 'Private'}
                colorClass="text-blue-500"
              />
              <InfoBlock
                icon={Pill}
                label="Med. History"
                value={patient.medical_history?.length > 0 ? patient.medical_history.join(', ') : 'None'}
                colorClass="text-orange-500"
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-6 border-t border-neutral-light/30">
              <div className="bg-info/5 p-3 sm:p-4 rounded-2xl border border-info/20 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <Receipt size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-info/60 tracking-widest mb-0.5">Total Cost</p>
                  <p className="text-sm sm:text-base font-black text-info leading-none">EGP {financialSummary.total_cost.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-success/5 p-3 sm:p-4 rounded-2xl border border-success/20 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-success/60 tracking-widest mb-0.5">Total Paid</p>
                  <p className="text-sm sm:text-base font-black text-success leading-none">EGP {financialSummary.total_paid.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-error/5 p-3 sm:p-4 rounded-2xl border border-error/20 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                  <Wallet size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-error/60 tracking-widest mb-0.5">Balance</p>
                  <p className="text-sm sm:text-base font-black text-error leading-none">EGP {financialSummary.remaining_balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-900/5 p-3 sm:p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-black text-indigo-500/60 tracking-widest mb-0.5">Dentist Cut</p>
                  <p className="text-sm sm:text-base font-black text-indigo-600 leading-none">EGP {financialSummary.total_cut.toLocaleString()}</p>
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

                {/* Financials - Dynamic Grid (2 columns on mobile/tablet) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="bg-base-100/80 rounded-xl p-2 text-center border border-neutral-light/10">
                    <p className="text-[10px] uppercase font-bold text-base-content/50 tracking-wider mb-0.5">Cost</p>
                    <p className="text-[13px] font-black text-base-content truncate">
                      {s.total_cost?.toLocaleString()} <span className="text-[10px] font-normal opacity-50">EGP</span>
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-2 text-center border border-green-200/30">
                    <p className="text-[10px] uppercase font-bold text-green-600/70 dark:text-green-400/70 tracking-wider mb-0.5">Paid</p>
                    <p className="text-[13px] font-black text-green-700 dark:text-green-300 truncate">
                      {s.amount_paid?.toLocaleString()} <span className="text-[10px] font-normal opacity-50">EGP</span>
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-2 text-center border border-amber-200/30">
                    <p className="text-[10px] uppercase font-bold text-amber-600/70 dark:text-amber-400/70 tracking-wider mb-0.5">Bal.</p>
                    <p className="text-[13px] font-black text-amber-700 dark:text-amber-300 truncate">
                      {s.remaining_balance?.toLocaleString()} <span className="text-[10px] font-normal opacity-50">EGP</span>
                    </p>
                  </div>
                  <div className="bg-sky-50 dark:bg-sky-900/10 rounded-xl p-2 text-center border border-sky-200/30">
                    <p className="text-[10px] uppercase font-bold text-sky-600/70 dark:text-sky-400/70 tracking-wider mb-0.5">Cut</p>
                    <p className="text-[13px] font-black text-sky-700 dark:text-sky-300 truncate">
                      {s.dentist_cut?.toLocaleString()} <span className="text-[10px] font-normal opacity-50">EGP</span>
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

      {/* Patient Notes Modal */}
      <Modal
        open={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Patient Notes"
        size="md"
      >
        <div className="flex items-center gap-3 mb-6 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <StickyNote size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-base-content">Patient Notes</h3>
            <p className="text-[10px] uppercase font-black text-base-content/40 tracking-wider">Chronological observations & feedback</p>
          </div>
        </div>

        {/* Note Input */}
        <div className="flex gap-2 mb-6">
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder="Add a clinical note..."
            className="textarea textarea-bordered flex-1 min-h-[48px] max-h-[160px] rounded-xl text-sm transition-all focus:border-amber-500 border-2 resize-none"
            rows="1"
            autoFocus
          />
          <button
            onClick={handleAddNote}
            disabled={!noteInput.trim() || isUpdating}
            className="btn bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-auto min-h-0 px-4 self-stretch border-0 active:scale-95 transition-all"
          >
            {isUpdating ? <span className="loading loading-spinner loading-xs" /> : <Send size={18} />}
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {!(patient.notes?.length) ? (
            <div className="text-center py-8 bg-base-200/30 rounded-2xl border border-dashed border-neutral-light/50">
              <p className="text-xs text-base-content/40 italic">Note history is empty</p>
            </div>
          ) : (
            [...(patient.notes || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group relative p-4 rounded-xl border transition-all ${editingNoteId === note._id ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100 ring-inset' : 'bg-base-100 border-neutral-light/30 hover:border-amber-200'
                  }`}
              >
                {editingNoteId === note._id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="textarea textarea-bordered w-full min-h-[80px] rounded-xl text-sm transition-all focus:border-amber-500 border-2 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-ghost btn-sm rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateNote(note._id)}
                        disabled={!editingText.trim() || isUpdating}
                        className="btn bg-amber-600 hover:bg-amber-700 text-white btn-sm rounded-lg text-xs border-0"
                      >
                        {isUpdating ? <span className="loading loading-spinner loading-xs" /> : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-base-content leading-relaxed whitespace-pre-wrap break-words">
                        {note.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock size={10} className="text-base-content/30" />
                        <p className="text-[9px] font-black text-base-content/30 uppercase tracking-widest">
                          {new Date(note.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="p-1.5 text-base-content/20 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        title="Edit note"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="p-1.5 text-base-content/20 hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}

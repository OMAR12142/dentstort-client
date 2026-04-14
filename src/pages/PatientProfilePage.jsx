<<<<<<< Updated upstream
import { useState } from 'react';
import { useParams } from 'react-router-dom';
=======
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
} from 'lucide-react';
import { usePatient, useUpdatePatient } from '../hooks/usePatients';
import { useSessions, useDeleteSession } from '../hooks/useSessions';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/Badge';
import Card from '../components/Card';
import LogSessionModal from '../components/LogSessionModal';
import ImageLightboxModal from '../components/ImageLightboxModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/10 text-success border border-success/20';
    case 'On-Hold': return 'bg-warning/10 text-warning-content border border-warning/20';
    case 'Dropped': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'Active':
    default: return 'bg-info/10 text-info border border-info/20';
  }
};

export default function PatientProfilePage() {
  const { id } = useParams();
  const { data: patient, isLoading: loadP, isError: isErrorP, error: errorP, refetch: refetchP } = usePatient(id);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
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

  const handleMarkCompleted = () => {
    if (window.confirm("Are you sure you want to close this patient's file?")) {
      updatePatient({ id, status: 'Completed' }, {
        onSuccess: () => {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
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
    <div className="space-y-6">
      {showToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-none text-white font-medium border border-success">
            <CheckCircle size={20} />
            <span>Patient file marked as completed</span>
          </div>
        </div>
      )}

      {/* Patient Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0">
              {patient.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-base-content">{patient.name}</h1>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                  {patient.status || 'Active'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-base-content/70 mt-1">
                {patient.age && <span>Age {patient.age}</span>}
                {patient.phone && <span>📞 {patient.phone}</span>}
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {patient.status !== 'Completed' && (
              <button
                onClick={handleMarkCompleted}
                disabled={isUpdating}
                className="btn btn-sm bg-[#057642]/10 text-[#057642] border border-[#057642]/20 hover:bg-[#057642] hover:text-white transition-all rounded-lg flex-1 sm:flex-none gap-1"
                title="Mark as Completed"
              >
                {isUpdating ? <span className="loading loading-spinner loading-sm" /> : <CheckCircle size={16} />}
                Mark as Completed
              </button>
            )}
            <button
              onClick={() => setShowLogSession(true)}
              className="btn btn-lg sm:text-sm rounded-lg text-white border-0 gap-1 bg-primary flex-1 sm:flex-none"
            >
              <Plus size={16} />
              Log Session
            </button>
          </div>
        </div>

        {/* Medical History */}
        {patient.medical_history?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {patient.medical_history.map((h) => (
              <Badge key={h} label={h} />
            ))}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
              ⚠ Medical Alert: {warnings.join(', ')}
            </p>
          </div>
        )}
      </Card>
=======
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
>>>>>>> Stashed changes

      {/* Sessions Timeline */}
      <h2 className="text-lg font-bold text-base-content">Session History</h2>

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
                      <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
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

                {s.treatment_details && (
                  <p className="text-sm text-base-content/70 mb-3 leading-relaxed">
                    {s.treatment_details}
                  </p>
                )}

                {/* Financials */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-3">
                  <div className="bg-base-100/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-base-content/70 mb-0.5">Total Cost</p>
                    <p className="text-sm font-bold text-base-content">
                      {s.total_cost?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-0.5">Paid</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-300">
                      {s.amount_paid?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Remaining</p>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {s.remaining_balance?.toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-sky-600 dark:text-sky-400 mb-0.5">Your Cut</p>
                    <p className="text-sm font-bold text-sky-700 dark:text-sky-300">
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
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {s.media_urls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightbox({ isOpen: true, images: s.media_urls, index: idx })}
                        className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-light hover:ring-2 hover:ring-primary transition-all focus:outline-none"
                      >
                        <img
                          src={url}
                          alt={`Session media ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
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

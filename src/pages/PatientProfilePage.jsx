import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { usePatient, useUpdatePatient } from '../hooks/usePatients';
import { useSessions, useDeleteSession } from '../hooks/useSessions';
import ProfileSkeleton from '../components/skeletons/ProfileSkeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/Badge';
import Card from '../components/Card';
import LogSessionModal from '../components/LogSessionModal';
import ImageLightboxModal from '../components/ImageLightboxModal';
import WhatsAppIcon from '../components/WhatsAppIcon';

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
  const navigate = useNavigate();
  const { data: patient, isLoading: loadP, isError: isErrorP, error: errorP, refetch: refetchP } = usePatient(id);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const { data: sessionsData, isLoading: loadS, isError: isErrorS, error: errorS, refetch: refetchS } = useSessions(id);
  const { mutate: deleteSession, isPending: isDeleting } = useDeleteSession();

  const [showLogSession, setShowLogSession] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], index: 0 });
  const [showToast, setShowToast] = useState(false);
  const [newPlanItem, setNewPlanItem] = useState('');
  const [editingPlanIndex, setEditingPlanIndex] = useState(null);
  const [editPlanText, setEditPlanText] = useState('');

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

  const handleStatusChange = () => {
    const newStatus = patient.status === 'Completed' ? 'Active' : 'Completed';
    updatePatient({ id: patient._id, data: { status: newStatus } });
  };

  const handleTogglePlanItem = (idx) => {
    const newPlan = [...(patient.treatment_plan || [])];
    newPlan[idx].isCompleted = !newPlan[idx].isCompleted;
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
  };

  const handleDeletePlanItem = (idx) => {
    if (!window.confirm("Remove this item from the treatment plan?")) return;
    const newPlan = [...(patient.treatment_plan || [])];
    newPlan.splice(idx, 1);
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
  };

  const handleAddPlanItem = (e) => {
    e.preventDefault();
    if (!newPlanItem.trim()) return;
    const newPlan = [...(patient.treatment_plan || []), { text: newPlanItem.trim(), isCompleted: false }];
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
    setNewPlanItem('');
  };

  const handleStartEditPlanItem = (idx, text) => {
    setEditingPlanIndex(idx);
    setEditPlanText(text);
  };

  const handleSaveEditPlanItem = (idx) => {
    if (!editPlanText.trim()) return;
    const newPlan = [...(patient.treatment_plan || [])];
    newPlan[idx].text = editPlanText.trim();
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
    setEditingPlanIndex(null);
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
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/70 mt-1">
                {patient.age && <span>Age {patient.age}</span>}
                {patient.phone && (
                  <span className="flex items-center gap-1 font-medium">
                    <WhatsAppIcon size={14} className="text-emerald-500 opacity-90" /> {patient.phone}
                  </span>
                )}
                {patient.phone2 && (
                  <span className="flex items-center gap-1 font-medium">
                    <Phone size={13} className="text-secondary opacity-80" /> {patient.phone2}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-indigo-500" /> {patient.address}
                  </span>
                )}
                {patient.job && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-cyan-500" /> {patient.job}
                  </span>
                )}
              </div>
            </div>
          </div>

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
              Add Session
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

        {/* Drugs / Medications */}
        {patient.drugs?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-base-content/60 mb-1.5 flex items-center gap-1">
              <Pill size={13} className="text-pink-500" /> Current Medications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {patient.drugs.map((d) => (
                <span
                  key={d}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border border-pink-200 dark:border-pink-700"
                >
                  {d}
                </span>
              ))}
            </div>
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

      {/* Treatment Plan Section */}
      <Card className="p-4 sm:p-6 mb-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <ListChecks size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-base-content">Treatment Plan</h2>
          {patient.treatment_plan?.length > 0 && (
            <div className="ml-auto flex items-center gap-2 text-xs font-medium">
              <span className="text-success bg-success/10 px-2 py-0.5 rounded-full">
                {patient.treatment_plan.filter(i => i.isCompleted).length} done
              </span>
              <span className="text-base-content/50">of {patient.treatment_plan.length}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {(!patient.treatment_plan || patient.treatment_plan.length === 0) ? (
            <p className="text-sm text-base-content/50 italic py-2">No treatment plan added yet. Add items below.</p>
          ) : (
            patient.treatment_plan.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-start gap-3 p-3 rounded-xl border transition-all ${item.isCompleted
                  ? 'bg-base-200/50 border-transparent opacity-60'
                  : 'bg-base-100 border-neutral-light hover:border-indigo-200'
                  }`}
              >
                {editingPlanIndex === idx ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      className="input input-sm border-indigo-400 focus:border-indigo-500 flex-1 rounded-lg"
                      value={editPlanText}
                      onChange={(e) => setEditPlanText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditPlanItem(idx);
                        else if (e.key === 'Escape') setEditingPlanIndex(null);
                      }}
                    />
                    <button onClick={() => handleSaveEditPlanItem(idx)} className="btn btn-sm btn-ghost text-success rounded-lg" title="Save">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingPlanIndex(null)} className="btn btn-sm btn-ghost text-base-content/50 hover:text-error rounded-lg" title="Cancel">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="flex-1 min-w-0 flex items-start gap-3 cursor-pointer"
                      onClick={() => handleTogglePlanItem(idx)}
                    >
                      <button
                        className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${item.isCompleted
                          ? 'bg-success border-success text-white'
                          : 'border-base-content/30 hover:border-indigo-400'
                          }`}
                      >
                        {item.isCompleted && <Check size={14} strokeWidth={3} />}
                      </button>
                      <p className={`text-sm md:text-base font-medium break-words leading-tight transition-all ${item.isCompleted ? 'text-base-content/60 line-through decoration-2' : 'text-base-content'
                        }`}>
                        {item.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEditPlanItem(idx, item.text); }}
                        className="text-base-content/30 hover:text-primary transition-colors p-1"
                        title="Edit item"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePlanItem(idx); }}
                        className="text-base-content/30 hover:text-error transition-colors p-1"
                        title="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddPlanItem} className="flex gap-2">
          <input
            type="text"
            className="input input-sm md:input-md input-bordered flex-1 rounded-xl focus:border-indigo-400"
            placeholder="Add new step (e.g. Scaling, Upper Right Molar Fill...)"
            value={newPlanItem}
            onChange={(e) => setNewPlanItem(e.target.value)}
            disabled={isUpdating}
          />
          <button
            type="submit"
            disabled={!newPlanItem.trim() || isUpdating}
            className="btn btn-sm md:btn-md bg-primary   cursor-pointer text-white border-0 rounded-xl px-4"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Step</span>
          </button>
        </form>
      </Card>

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

                {/* Treatment */}
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

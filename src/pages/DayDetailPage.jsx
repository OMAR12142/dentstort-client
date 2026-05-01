import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  DollarSign,
  FileText,
  Tag,
  Plus,
  CheckCircle2,
  XCircle,
  Trash2,
  Image,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSessionsByDate } from '../hooks/useSessions';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
} from '../hooks/useAppointments';
import { useCreatePatient } from '../hooks/usePatients';
import AppointmentModal from '../components/AppointmentModal';
import LogSessionModal from '../components/LogSessionModal';
import Modal from '../components/Modal';
import Card from '../components/Card';

// ── Status styling ────────────────────────────
const STATUS_BADGE = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  'no-show': 'bg-amber-100 text-amber-700 border-amber-200',
};

const TYPE_LABELS = {
  consultation: 'Consultation',
  'follow-up': 'Follow-up',
  procedure: 'Procedure',
  emergency: 'Emergency',
  other: 'Other',
};

export default function DayDetailPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [conflictError, setConflictError] = useState('');
  const [logSessionModalOpen, setLogSessionModalOpen] = useState(false);
  const [logSessionPatientId, setLogSessionPatientId] = useState('');
  const [logSessionLinkedAptId, setLogSessionLinkedAptId] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Determine if this day is in the past or future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  const isPast = selectedDate < today;
  const isToday = selectedDate.getTime() === today.getTime();

  // Fetch data
  const { data: sessions = [], isLoading: loadingSessions } = useSessionsByDate(date);
  const { data: appointments = [], isLoading: loadingAppointments } = useAppointments(date, date);

  // Mutations
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const statusMutation = useUpdateAppointmentStatus();
  const deleteMutation = useDeleteAppointment();
  const createPatientMutation = useCreatePatient();

  const isLoading = loadingSessions || loadingAppointments;

  // For today: show both sessions and upcoming appointments
  // For past: show sessions only
  // For future: show appointments only
  const activeAppointments = useMemo(() => {
    return appointments.filter(a => a.status !== 'cancelled' && a.status !== 'no-show');
  }, [appointments]);

  // Format the date for display
  const displayDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // ── Handlers ────────────────────────────────
  const handleSubmit = (data) => {
    setConflictError('');
    const mutation = data.id ? updateMutation : createMutation;

    mutation.mutate(data, {
      onSuccess: () => {
        toast.success(data.id ? 'Appointment updated' : 'Appointment booked');
        setModalOpen(false);
        setEditingAppointment(null);
      },
      onError: (err) => {
        const msg = err?.response?.data?.message || 'Failed';
        if (err?.response?.status === 409) setConflictError(msg);
        else toast.error(msg);
      },
    });
  };

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status }, {
      onSuccess: () => toast.success(`Marked as ${status}`),
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed'),
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Appointment deleted'),
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed'),
    });
  };

  const handleCreatePatient = (patientData, callback) => {
    const payload = { name: patientData.name };
    if (patientData.phone) payload.phone = patientData.phone;
    if (patientData.clinic_id) payload.clinic_id = patientData.clinic_id;

    createPatientMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`Patient "${created.name}" created`);
        callback(created);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create patient'),
    });
  };

  const openEditModal = (apt) => {
    setEditingAppointment(apt);
    setConflictError('');
    setModalOpen(true);
  };

  const openNewModal = () => {
    setEditingAppointment(null);
    setConflictError('');
    setModalOpen(true);
  };

  // ── Loading state ───────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5 pb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 bg-base-300 rounded animate-pulse" />
          <div className="h-8 w-48 bg-base-300 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-base-300 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/appointments')}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-2"
          >
            <ArrowLeft size={16} /> Back to Calendar
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content flex items-center gap-2">
            <Calendar size={24} className="text-primary" />
            {displayDate}
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            {isPast && !isToday
              ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} completed`
              : isToday
                ? `${sessions.length} session${sessions.length !== 1 ? 's' : ''} done · ${activeAppointments.length} upcoming`
                : `${activeAppointments.length} appointment${activeAppointments.length !== 1 ? 's' : ''} scheduled`
            }
          </p>
        </div>

        {/* Only show "New Appointment" for today or future */}
        {(!isPast || isToday) && (
          <button onClick={openNewModal} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> New Appointment
          </button>
        )}
      </div>

      {/* ── Past Sessions ────────────────────── */}
      {(isPast || isToday) && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Clinical Sessions
            {sessions.length > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {sessions.length}
              </span>
            )}
          </h2>

          {sessions.length === 0 ? (
            <Card className="p-6 text-center">
              <FileText size={32} className="mx-auto mb-3 text-base-content/20" />
              <p className="text-sm text-base-content/50">No sessions recorded on this day.</p>
            </Card>
          ) : (
            sessions.map((session, idx) => (
              <motion.div
                key={session._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4 hover:border-primary/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Patient & Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/patients/${session.patient_id?._id}`}
                          className="font-bold text-base text-base-content hover:text-primary transition-colors"
                        >
                          {session.patient_id?.name || 'Unknown Patient'}
                        </Link>
                        {session.patient_id?.phone && (
                          <span className="text-xs text-base-content/40 flex items-center gap-1">
                            <Phone size={10} /> {session.patient_id.phone}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {session.clinic_id?.name && (
                          <span className="text-xs px-2 py-0.5 bg-base-200 rounded-md font-medium text-base-content/60 flex items-center gap-1">
                            <Building2 size={10} /> {session.clinic_id.name}
                          </span>
                        )}
                        {(Array.isArray(session.treatment_category) ? session.treatment_category : session.treatment_category ? [session.treatment_category] : []).map((cat, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md font-medium">
                            {cat}
                          </span>
                        ))}
                        {session.media_urls?.length > 0 && (
                          <span className="text-xs text-base-content/40 flex items-center gap-1">
                            <Image size={10} /> {session.media_urls.length} photo{session.media_urls.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {session.treatment_details && (
                        <p className="text-xs text-base-content/60 line-clamp-2">
                          {session.treatment_details}
                        </p>
                      )}
                    </div>

                    {/* Financial Summary */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-base-content">
                          {session.total_cost?.toLocaleString()} <span className="text-xs font-normal text-base-content/40">EGP</span>
                        </p>
                        <p className="text-[10px] text-base-content/40">
                          Paid: {session.amount_paid?.toLocaleString()} · Cut: {session.dentist_cut?.toLocaleString()}
                        </p>
                      </div>
                      {session.remaining_balance > 0 && (
                        <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-lg font-bold border border-warning/20">
                          -{session.remaining_balance.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── Future Appointments ───────────────── */}
      {(!isPast || isToday) && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            {isToday ? 'Remaining Appointments' : 'Scheduled Appointments'}
            {activeAppointments.length > 0 && (
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {activeAppointments.length}
              </span>
            )}
          </h2>

          {activeAppointments.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar size={32} className="mx-auto mb-3 text-base-content/20" />
              <p className="text-sm text-base-content/50">
                {isToday ? 'No more appointments today.' : 'No appointments scheduled for this day.'}
              </p>
            </Card>
          ) : (
            activeAppointments.map((apt, idx) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="p-4 hover:border-primary/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left — Patient & Time */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-base-content/50 bg-base-200 px-2 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                        <Link
                          to={`/patients/${apt.patient_id?._id}`}
                          className="font-bold text-base text-base-content hover:text-primary transition-colors"
                        >
                          {apt.patient_id?.name || 'Unknown Patient'}
                        </Link>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${STATUS_BADGE[apt.status]}`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-primary flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(apt.startTime)} — {formatTime(apt.endTime)}
                        </span>
                        {apt.clinic_id?.name && (
                          <span className="text-xs px-2 py-0.5 bg-base-200 rounded-md font-medium text-base-content/60 flex items-center gap-1">
                            <Building2 size={10} /> {apt.clinic_id.name}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-base-200 rounded-md font-medium text-base-content/50 flex items-center gap-1">
                          <Tag size={10} /> {TYPE_LABELS[apt.type] || apt.type}
                        </span>
                      </div>

                    </div>

                    {/* Right — Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        onClick={() => {
                          setLogSessionPatientId(apt.patient_id?._id);
                          setLogSessionLinkedAptId(apt._id);
                          setLogSessionModalOpen(true);
                        }}
                        className="btn btn-xs btn-primary gap-1"
                      >
                        <Plus size={12} /> Log Session
                      </button>
                      <button
                        onClick={() => openEditModal(apt)}
                        className="btn btn-xs btn-ghost"
                      >
                        Edit
                      </button>
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(apt._id, 'confirmed')}
                          className="btn btn-xs btn-success gap-1"
                        >
                          <CheckCircle2 size={12} /> Confirm
                        </button>
                      )}
                      {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                        <button
                          onClick={() => handleStatusChange(apt._id, 'completed')}
                          className="btn btn-xs btn-ghost gap-1"
                        >
                          <CheckCircle2 size={12} /> Done
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(apt._id)}
                        className="btn btn-xs btn-ghost text-error gap-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAppointment(null); }}
        onSubmit={handleSubmit}
        appointment={editingAppointment}
        defaultDate={date}
        defaultStartTime="09:00"
        defaultEndTime="09:30"
        conflictError={conflictError}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreatePatient={handleCreatePatient}
      />

      {/* Log Session Modal */}
      <LogSessionModal
        open={logSessionModalOpen}
        onClose={() => {
          setLogSessionModalOpen(false);
          setLogSessionPatientId('');
          setLogSessionLinkedAptId('');
        }}
        initialPatientId={logSessionPatientId}
        linkedAppointmentId={logSessionLinkedAptId}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-error">
            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
            <p className="font-medium text-base-content">Are you sure you want to permanently delete this appointment?</p>
          </div>
          <p className="text-sm text-base-content/70">
            This action cannot be undone. Note: If this was auto-generated from a clinical session, the original clinical session will not be deleted.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light/50">
            <button
              className="btn btn-ghost"
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() => {
                handleDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

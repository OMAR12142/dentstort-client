import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, AlertTriangle, Clock, User, Building2, FileText, Tag } from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';
import Modal from './Modal';

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no-show', label: 'No Show' },
];

export default function AppointmentModal({
  open,
  onClose,
  onSubmit,
  appointment = null,
  defaultDate = '',
  defaultStartTime = '',
  defaultEndTime = '',
  conflictError = '',
  isSubmitting = false,
  onCreatePatient,
}) {
  const isEditing = !!appointment;

  // Form state
  const [patientId, setPatientId] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('consultation');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');

  // Data
  const { data: patientsData } = usePatients({ search: patientSearch, limit: 8 });
  const { data: clinicsData } = useClinics();
  const patients = patientsData?.patients || [];
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  // Selected patient display name
  const selectedPatient = useMemo(() => {
    if (!patientId) return null;
    return patients.find((p) => p._id === patientId);
  }, [patientId, patients]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (appointment) {
        setPatientId(appointment.patient_id?._id || appointment.patient_id || '');
        setClinicId(appointment.clinic_id?._id || appointment.clinic_id || '');
        setDate(appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '');
        setStartTime(appointment.startTime || '');
        setEndTime(appointment.endTime || '');
        setType(appointment.type || 'consultation');
        setStatus(appointment.status || 'scheduled');
        setNotes(appointment.notes || '');
        setPatientSearch(appointment.patient_id?.name || '');
      } else {
        setPatientId('');
        setClinicId(clinics.length === 1 ? clinics[0]._id : '');
        setDate(defaultDate || '');
        setStartTime(defaultStartTime || '');
        setEndTime(defaultEndTime || '');
        setType('consultation');
        setStatus('scheduled');
        setNotes('');
        setPatientSearch('');
      }
      setShowPatientDropdown(false);
      setShowNewPatientForm(false);
      setNewPatientName('');
      setNewPatientPhone('');
    }
  }, [open, appointment, defaultDate, defaultStartTime, defaultEndTime]);

  const handleSelectPatient = (patient) => {
    setPatientId(patient._id);
    setPatientSearch(patient.name);
    setShowPatientDropdown(false);
    
    // Automatically select the patient's default clinic if they have one
    if (patient.clinic_id) {
      const pClinicId = typeof patient.clinic_id === 'object' ? patient.clinic_id._id : patient.clinic_id;
      // Only set it if it exists in our current clinics list
      if (clinics.some(c => c._id === pClinicId)) {
        setClinicId(pClinicId);
      }
    }
  };

  const handleCreateNewPatient = () => {
    if (onCreatePatient && newPatientName.trim()) {
      onCreatePatient({ 
        name: newPatientName.trim(), 
        phone: newPatientPhone.trim(),
        clinic_id: clinicId 
      }, (created) => {
        setPatientId(created._id);
        setPatientSearch(created.name);
        setShowNewPatientForm(false);
        setNewPatientName('');
        setNewPatientPhone('');
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...(appointment?._id ? { id: appointment._id } : {}),
      patient_id: patientId,
      clinic_id: clinicId,
      date,
      startTime,
      endTime,
      type,
      status,
      notes,
    });
  };

  const canSubmit = patientId && clinicId && date && startTime && endTime && !isSubmitting;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Appointment' : 'New Appointment'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Conflict Warning */}
        {conflictError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/20 text-error">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{conflictError}</p>
          </div>
        )}

        {/* Patient Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-base-content flex items-center gap-1.5">
            <User size={14} /> Patient <span className="text-error">*</span>
          </label>

          {!showNewPatientForm ? (
            <div className="relative">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setPatientId('');
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                  placeholder="Search patients..."
                  className="input input-bordered w-full pl-10 text-sm"
                />
              </div>

              {showPatientDropdown && patientSearch && (
                <div className="absolute z-50 top-full mt-1 w-full bg-base-100 border border-neutral-light rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {patients.length === 0 ? (
                    <div className="p-3 text-center text-sm text-base-content/50">No patients found</div>
                  ) : (
                    patients.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 transition-colors flex items-center justify-between ${
                          patientId === p._id ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content'
                        }`}
                      >
                        <span>{p.name}</span>
                        {p.phone && <span className="text-xs text-base-content/40">{p.phone}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowNewPatientForm(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add new patient
              </button>
            </div>
          ) : (
            <div className="space-y-2 p-3 rounded-lg bg-base-200/50 border border-neutral-light">
              <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider">New Patient</p>
              <input
                type="text"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                placeholder="Patient name *"
                className="input input-bordered w-full input-sm text-sm"
                autoFocus
              />
              <input
                type="text"
                value={newPatientPhone}
                onChange={(e) => setNewPatientPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="input input-bordered w-full input-sm text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateNewPatient}
                  disabled={!newPatientName.trim()}
                  className="btn btn-sm btn-primary"
                >
                  Create & Select
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clinic */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-base-content flex items-center gap-1.5">
            <Building2 size={14} /> Clinic <span className="text-error">*</span>
          </label>
          <select
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            className="select select-bordered w-full text-sm"
          >
            <option value="">Select clinic</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Date & Time Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content">Date <span className="text-error">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input input-bordered w-full text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content flex items-center gap-1">
              <Clock size={12} /> Start <span className="text-error">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input input-bordered w-full text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content flex items-center gap-1">
              <Clock size={12} /> End <span className="text-error">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input input-bordered w-full text-sm"
            />
          </div>
        </div>

        {/* Type & Status Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content flex items-center gap-1.5">
              <Tag size={14} /> Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="select select-bordered w-full text-sm"
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {isEditing && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select select-bordered w-full text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-base-content flex items-center gap-1.5">
            <FileText size={14} /> Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pre-visit notes (optional)"
            rows={2}
            className="textarea textarea-bordered w-full text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            {isSubmitting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : isEditing ? (
              'Update Appointment'
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

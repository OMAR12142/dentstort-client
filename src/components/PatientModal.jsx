import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Calendar,
  AlertCircle,
  Building2,
  Percent,
  Stethoscope,
} from 'lucide-react';
import Modal from './Modal';
import { useCreatePatient, useUpdatePatient } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';

/**
 * Unified Add / Edit Patient Modal
 *
 * Props:
 *   open          – boolean
 *   onClose       – fn()
 *   patientToEdit – patient object (for edit mode) | null (for add mode)
 */
export default function PatientModal({ open, onClose, patientToEdit = null }) {
  const isEdit = !!patientToEdit;

  const { mutate: createMutate, isPending: createPending } = useCreatePatient();
  const { mutate: updateMutate, isPending: updatePending } = useUpdatePatient();
  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  const isPending = createPending || updatePending;

  // ── Form state ────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    medical_history: '',
    status: 'Active',
    insuranceCompany: 'Private',
    clinic_id: '',
    commission_percentage: '',
  });
  const [errors, setErrors] = useState({});

  // ── Populate form in edit mode ────────────────
  useEffect(() => {
    if (open) {
      if (isEdit && patientToEdit) {
        setForm({
          name: patientToEdit.name || '',
          age: patientToEdit.age ?? '',
          phone: patientToEdit.phone || '',
          medical_history: (patientToEdit.medical_history || []).join(', '),
          status: patientToEdit.status || 'Active',
          insuranceCompany: patientToEdit.insuranceCompany || 'Private',
          clinic_id: patientToEdit.clinic_id?._id || patientToEdit.clinic_id || '',
          commission_percentage:
            patientToEdit.commission_percentage !== null &&
            patientToEdit.commission_percentage !== undefined
              ? String(patientToEdit.commission_percentage)
              : '',
        });
      } else {
        setForm({
          name: '',
          age: '',
          phone: '',
          medical_history: '',
          status: 'Active',
          insuranceCompany: 'Private',
          clinic_id: '',
          commission_percentage: '',
        });
      }
      setErrors({});
    }
  }, [open, patientToEdit, isEdit]);

  // ── Auto-fill commission when clinic changes ──
  const handleClinicChange = (clinicId) => {
    const clinic = clinics.find((c) => c._id === clinicId);
    setForm((prev) => ({
      ...prev,
      clinic_id: clinicId,
      commission_percentage: clinic
        ? String(clinic.default_commission_percentage)
        : '',
    }));
    clearError('clinic_id');
  };

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const clearError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Validate & Submit ─────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.clinic_id) errs.clinic_id = 'Please select a clinic';
    if (form.commission_percentage === '') errs.commission_percentage = 'Commission % is required';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      name: form.name.trim(),
      status: form.status,
      insuranceCompany: form.insuranceCompany || 'Private',
      medical_history: form.medical_history
        ? form.medical_history.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

<<<<<<< Updated upstream
    if (form.age !== '') payload.age = parseInt(form.age, 10);
    if (form.phone.trim()) payload.phone = form.phone.trim();
=======
    if (form.dateOfBirth !== '') payload.dateOfBirth = form.dateOfBirth;
    payload.phone = form.phone.trim();
    payload.phone2 = form.phone2.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.job.trim()) payload.job = form.job.trim();
>>>>>>> Stashed changes
    if (form.clinic_id) payload.clinic_id = form.clinic_id;
    if (form.commission_percentage !== '')
      payload.commission_percentage = parseFloat(form.commission_percentage);

    if (isEdit) {
      updateMutate(
        { id: patientToEdit._id, data: payload },
        {
          onSuccess: () => {
            setErrors({});
            onClose();
          },
        }
      );
    } else {
      createMutate(payload, {
        onSuccess: () => {
          setErrors({});
          onClose();
        },
      });
    }
  };

  // ── Find selected clinic for info display ─────
  const selectedClinic = clinics.find((c) => c._id === form.clinic_id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Patient' : 'Add New Patient'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Full Name */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <User size={15} className="text-sky-500" />
            Full Name <span className="text-error">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className={`input input-bordered w-full rounded-lg transition-all ${
              errors.name ? 'border-error focus:border-error' : 'focus:border-sky-400'
            }`}
            placeholder="Omar Mahmoud"
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={13} /> {errors.name}
            </div>
          )}
        </motion.div>

        {/* Age & Phone */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" /> Age
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-amber-400"
              placeholder="28"
              min="0"
              max="150"
            />
          </div>
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Phone size={14} className="text-teal-500" /> Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-teal-400"
              placeholder="+20 1xx xxx xxxx"
            />
          </div>
        </motion.div>

        {/* Clinic & Commission */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Building2 size={14} className="text-violet-500" /> Clinic <span className="text-error">*</span>
            </label>
            <select
              value={form.clinic_id}
              onChange={(e) => handleClinicChange(e.target.value)}
              className={`select select-bordered w-full rounded-lg ${
                errors.clinic_id ? 'border-error' : 'focus:border-violet-400'
              }`}
            >
              <option value="">— No clinic —</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.clinic_id && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle size={13} /> {errors.clinic_id}
              </div>
            )}
          </div>

          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Percent size={14} className="text-emerald-500" /> Commission % <span className="text-error">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.commission_percentage}
              onChange={(e) => setField('commission_percentage', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-emerald-400"
              placeholder={
                selectedClinic
                  ? `${selectedClinic.default_commission_percentage}% (default)`
                  : 'e.g. 30'
              }
            />
            {selectedClinic && form.commission_percentage !== '' &&
              parseFloat(form.commission_percentage) !== selectedClinic.default_commission_percentage && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} />
                Overriding clinic default ({selectedClinic.default_commission_percentage}%)
              </p>
            )}
          </div>
        </motion.div>

        {/* Insurance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Stethoscope size={14} className="text-rose-400" /> Insurance
          </label>
          <input
            value={form.insuranceCompany}
            onChange={(e) => setField('insuranceCompany', e.target.value)}
            className="input input-bordered w-full rounded-lg focus:border-rose-400"
            placeholder="Private"
          />
        </motion.div>

        {/* Medical History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-500" /> Medical History
          </label>
          <textarea
            value={form.medical_history}
            onChange={(e) => setField('medical_history', e.target.value)}
            className="textarea textarea-bordered w-full rounded-lg resize-none focus:border-orange-400"
            placeholder="e.g., Diabetic, Penicillin Allergy"
            rows="2"
          />
          <p className="text-xs text-base-content/50 mt-1">
            💡 Separate multiple conditions with commas
          </p>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <User size={14} className="text-secondary" /> Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
            className="select select-bordered w-full rounded-lg focus:border-primary"
          >
            <option value="Active">Active</option>
            <option value="On-Hold">On-Hold</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3 pt-2"
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost rounded-lg flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn rounded-lg text-white border-0 bg-primary flex-1"
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                {isEdit ? 'Saving…' : 'Adding…'}
              </>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              '+ Add Patient'
            )}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}

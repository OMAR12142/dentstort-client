import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Calendar,
  AlertCircle,
  Building2,
  Percent,
  Stethoscope,
  MapPin,
  Pill,
  Briefcase,
  Plus,
  Trash2,
  X,
  Info,
} from 'lucide-react';
import Modal from './Modal';
import { useCreatePatient, useUpdatePatient } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';
import { useInsuranceProviders, useAddInsuranceProvider, useDeleteInsuranceProvider } from '../hooks/useInsurance';

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

  // ── Insurance providers ───────────────────────
  const { data: savedProviders = ['Private'] } = useInsuranceProviders();
  const { mutate: addProvider } = useAddInsuranceProvider();
  const { mutate: deleteProvider } = useDeleteInsuranceProvider();
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [newInsuranceName, setNewInsuranceName] = useState('');

  const isPending = createPending || updatePending;

  // ── Form state ────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    phone2: '',
    address: '',
    job: '',
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
          dateOfBirth: patientToEdit.dateOfBirth ? new Date(patientToEdit.dateOfBirth).toISOString().split('T')[0] : '',
          phone: patientToEdit.phone || '',
          phone2: patientToEdit.phone2 || '',
          address: patientToEdit.address || '',
          job: patientToEdit.job || '',
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
          dateOfBirth: '',
          phone: '',
          phone2: '',
          address: '',
          job: '',
          medical_history: '',
          status: 'Active',
          insuranceCompany: 'Private',
          clinic_id: '',
          commission_percentage: '',
        });
      }
      setErrors({});
      setShowAddInsurance(false);
      setNewInsuranceName('');
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

    if (form.dateOfBirth !== '') payload.dateOfBirth = form.dateOfBirth;
    payload.phone = form.phone.trim();
    payload.phone2 = form.phone2.trim();
    if (form.address.trim()) payload.address = form.address.trim();
    if (form.job.trim()) payload.job = form.job.trim();
    if (form.clinic_id) payload.clinic_id = form.clinic_id;
    if (form.commission_percentage !== '')
      payload.commission_percentage = parseFloat(form.commission_percentage);

    if (isEdit) {
      updateMutate(
        { id: patientToEdit._id, data: payload },
        {
          onSuccess: () => {
            // Auto-save insurance provider if it's new
            if (payload.insuranceCompany && payload.insuranceCompany !== 'Private') {
              const isKnown = savedProviders.some(
                (p) => p.toLowerCase() === payload.insuranceCompany.toLowerCase()
              );
              if (!isKnown) addProvider(payload.insuranceCompany);
            }
            setErrors({});
            onClose();
          },
        }
      );
    } else {
      createMutate(payload, {
        onSuccess: () => {
          // Auto-save insurance provider if it's new
          if (payload.insuranceCompany && payload.insuranceCompany !== 'Private') {
            const isKnown = savedProviders.some(
              (p) => p.toLowerCase() === payload.insuranceCompany.toLowerCase()
            );
            if (!isKnown) addProvider(payload.insuranceCompany);
          }
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
              <Calendar size={14} className="text-amber-500" /> Date of Birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setField('dateOfBirth', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-amber-400 text-sm"
              max={new Date().toISOString().split('T')[0]}
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

        {/* Alternative Phone */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Phone size={14} className="text-emerald-500" /> Alternative Phone <span className="text-xs text-base-content/50 pr-1 truncate font-normal">(Optional)</span>
          </label>
          <input
            value={form.phone2}
            onChange={(e) => setField('phone2', e.target.value)}
            className="input input-bordered w-full rounded-lg focus:border-emerald-400"
            placeholder="+20 1xx xxx xxxx"
          />
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

          {!showAddInsurance ? (
            /* ── Dropdown of saved providers ── */
            <select
              value={form.insuranceCompany}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW__') {
                  setShowAddInsurance(true);
                  setNewInsuranceName('');
                } else {
                  setField('insuranceCompany', e.target.value);
                }
              }}
              className="select select-bordered w-full rounded-lg focus:border-rose-400"
            >
              {savedProviders.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="__ADD_NEW__">＋ Add New Insurance…</option>
            </select>
          ) : (
            /* ── Add New Insurance inline form ── */
            <div className="flex gap-2">
              <input
                autoFocus
                value={newInsuranceName}
                onChange={(e) => setNewInsuranceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = newInsuranceName.trim();
                    if (trimmed) {
                      addProvider(trimmed);
                      setField('insuranceCompany', trimmed);
                      setShowAddInsurance(false);
                      setNewInsuranceName('');
                    }
                  } else if (e.key === 'Escape') {
                    setShowAddInsurance(false);
                  }
                }}
                className="input input-bordered flex-1 rounded-lg focus:border-rose-400"
                placeholder="e.g., MetLife, AXA…"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = newInsuranceName.trim();
                  if (trimmed) {
                    addProvider(trimmed);
                    setField('insuranceCompany', trimmed);
                    setShowAddInsurance(false);
                    setNewInsuranceName('');
                  }
                }}
                className="btn btn-sm bg-rose-500 text-white border-0 hover:bg-rose-600 rounded-lg px-3"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowAddInsurance(false)}
                className="btn btn-sm btn-ghost rounded-lg px-3"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Address & Job */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="grid grid-cols-2 gap-3"
        >
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500" /> Address
            </label>
            <input
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-indigo-400"
              placeholder="e.g., Cairo, Egypt"
            />
          </div>
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Briefcase size={14} className="text-cyan-500" /> Job
            </label>
            <input
              value={form.job}
              onChange={(e) => setField('job', e.target.value)}
              className="input input-bordered w-full rounded-lg focus:border-cyan-400"
              placeholder="e.g., Engineer"
            />
          </div>
        </motion.div>

        {/* Medical History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-500" /> Medical History & Drugs
          </label>
          <textarea
            value={form.medical_history}
            onChange={(e) => setField('medical_history', e.target.value)}
            className="textarea textarea-bordered w-full rounded-lg resize-none focus:border-orange-400"
            placeholder="e.g., Diabetic, Penicillin Allergy, Aspirin, Metformin"
            rows="2"
          />
          <p className="text-xs text-base-content/50 mt-1 flex items-center">
            <Info size={12} className="mr-1 shrink-0" /> Separate multiple conditions or drugs with commas
          </p>
        </motion.div>


        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
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
          transition={{ delay: 0.19 }}
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

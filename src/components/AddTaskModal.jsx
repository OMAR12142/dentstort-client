import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, ListTodo, Tag, Building2, CalendarDays, User, Info } from 'lucide-react';
import Modal from './Modal';
import { useCreateTask } from '../hooks/useTasks';
import { useClinics } from '../hooks/useClinics';
import { usePatients } from '../hooks/usePatients';

export default function AddTaskModal({ open, onClose }) {
  const { mutate, isPending } = useCreateTask();
  const { data: clinicsData } = useClinics();

  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];
  const { data: patientsData } = usePatients({ page: 1, limit: 100 });
  const patients = patientsData?.patients || [];

  const [formData, setFormData] = useState({
    text: '',
    type: 'General',
    clinic_id: '',
    patient_id: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormData({ text: '', type: 'General', clinic_id: '', patient_id: '', dueDate: '' });
    }
  }, [open]);

  const clearError = (field) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!formData.text.trim()) {
      errs.text = 'Task description is required';
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      text: formData.text.trim(),
      type: formData.type,
      clinic_id: formData.clinic_id || null,
      patient_id: formData.patient_id || null,
      dueDate: formData.dueDate || null,
    };

    mutate(payload, {
      onSuccess: () => {
        setFormData({ text: '', type: 'General', clinic_id: '', patient_id: '', dueDate: '' });
        setErrors({});
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Task Description */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <ListTodo size={14} className="text-violet-500" />
            Task Description <span className="text-error">*</span>
          </label>
          <textarea
            className={`textarea textarea-bordered w-full rounded-lg focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all resize-none ${errors.text ? 'border-error focus:border-error focus:ring-error' : ''}`}
            placeholder="e.g., Send patient report to lab, Follow up with John..."
            rows="3"
            value={formData.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
          {errors.text && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={14} />
              {errors.text}
            </div>
          )}
        </motion.div>

        {/* Task Type */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Tag size={14} className="text-sky-500" />
            Task Type
          </label>
          <select
            className="select select-bordered w-full rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="General">General</option>
            <option value="Lab_Work">Lab Work</option>
            <option value="Follow_Up">Follow Up</option>
            <option value="Financial">Financial</option>
          </select>
        </motion.div>

        {/* Clinic (Optional) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Building2 size={14} className="text-teal-500" />
            Clinic <span className="text-xs text-base-content/50">(Optional)</span>
          </label>
          <select
            className="select select-bordered w-full rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            value={formData.clinic_id}
            onChange={(e) => handleChange('clinic_id', e.target.value)}
          >
            <option value="">Select clinic...</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Patient (only for Follow_Up) */}
        {formData.type === 'Follow_Up' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <User size={14} className="text-sky-500" />
              Patient <span className="text-xs text-base-content/50">(Optional)</span>
            </label>
            <select
              className="select select-bordered w-full rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
              value={formData.patient_id}
              onChange={(e) => handleChange('patient_id', e.target.value)}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}{p.phone ? ` — ${p.phone}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-base-content/50 mt-1.5 flex items-start gap-1">
              <Info size={12} className="mt-0.5 shrink-0" /> Linking a patient enables the WhatsApp quick-call button on this task.
            </p>
          </motion.div>
        )}

        {/* Due Date (Optional) */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <CalendarDays size={14} className="text-amber-500" />
            Due Date <span className="text-xs text-base-content/50">(Optional)</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </motion.div>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn btn-ghost rounded-lg flex-1">
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
                Adding...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Task
              </>
            )}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}

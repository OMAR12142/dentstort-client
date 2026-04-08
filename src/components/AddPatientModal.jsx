import { useState, useEffect } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import { useCreatePatient } from '../hooks/usePatients';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.coerce.number().int().min(0).optional(),
  phone: z.string().optional(),
  medical_history: z.string().optional(),
  status: z.enum(['Active', 'On-Hold', 'Completed', 'Dropped']).optional().default('Active'),
});

export default function AddPatientModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePatient();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const raw = Object.fromEntries(fd);

    const result = schema.safeParse(raw);
    if (!result.success) {
      const errs = {};
      result.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    const medical_history = raw.medical_history
      ? raw.medical_history.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    mutate(
      { ...result.data, medical_history },
      {
        onSuccess: () => {
          setErrors({});
          onClose();
        },
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Patient" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="label text-sm md:text-base font-semibold text-base-content/80 flex items-center gap-2">
            <User size={16} className="text-sky-500" />
            Full Name <span className="text-error">*</span>
          </label>
          <input
            name="name"
            onChange={() => errors.name && setErrors((p) => ({ ...p, name: undefined }))}
            className={`input input-bordered w-full rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all ${
              errors.name ? 'border-error focus:border-error focus:ring-error' : ''
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={14} />
              {errors.name}
            </div>
          )}
        </motion.div>

        {/* Age & Phone Grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Age */}
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" />
              Age
            </label>
            <input
              name="age"
              type="number"
              className="input input-bordered w-full rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              placeholder="28"
              min="0"
              max="150"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Phone size={14} className="text-teal-500" />
              Phone
            </label>
            <input
              name="phone"
              className="input input-bordered w-full rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              placeholder="+20 1xx xxx xxxx"
            />
          </div>
        </motion.div>

        {/* Medical History */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <AlertCircle size={14} className="text-orange-500" />
            Medical History
          </label>
          <textarea
            name="medical_history"
            className="textarea textarea-bordered w-full rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all resize-none"
            placeholder="e.g., Diabetic, Penicillin Allergy, Hypertension"
            rows="3"
          />
          <p className="text-xs text-base-content/50 mt-1.5">
            💡 Tip: Separate multiple conditions with commas
          </p>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <User size={14} className="text-secondary" />
            Patient Status
          </label>
          <select
            name="status"
            className="select select-bordered w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            defaultValue="Active"
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
          className="flex gap-3 pt-4"
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
                Adding...
              </>
            ) : (
              '+ Add Patient'
            )}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}


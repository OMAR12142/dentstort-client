import { useState, useEffect } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Phone, Calendar, AlertCircle, MapPin, Pill, Briefcase, Info, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { useCreatePatient } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  clinic_id: z.string().min(1, 'Clinic is required'),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  address: z.string().optional(),
  job: z.string().optional(),
  medical_history: z.string().optional(),
  status: z.enum(['Active', 'On-Hold', 'Completed', 'Dropped']).optional().default('Active'),
});

export default function AddPatientModal({ open, onClose }) {
  const { mutate, isPending } = useCreatePatient();
  const { data: clinicsData, isLoading: clinicsLoading } = useClinics();
  const [errors, setErrors] = useState({});

  const clinics = Array.isArray(clinicsData) ? clinicsData : (clinicsData?.clinics || []);

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
      {clinics.length === 0 && !clinicsLoading ? (
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-8 text-center space-y-5 my-2">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-inner">
            <Building2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-amber-900 text-lg">you must add clinic that you work in first to add patients </h3>
            <p className="text-amber-900 text-sm leading-relaxed max-w-[280px] mx-auto">
              You must add at least one clinic before you can add patients to assign your patients to it .
            </p>
          </div>
          <Link
            to="/clinics"
            onClick={onClose}
            className="btn btn-warning w-full rounded-xl shadow-sm border-0 font-bold"
          >
            Go to Clinics Page
          </Link>
        </div>
      ) : (
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
              className={`input input-bordered w-full rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all ${errors.name ? 'border-error focus:border-error focus:ring-error' : ''
                }`}
              placeholder="Omar Mahmoud"
            />
            {errors.name && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
          </motion.div>

          {/* Clinic Selection */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-500" />
              Assign to Clinic <span className="text-error">*</span>
            </label>
            <select
              name="clinic_id"
              onChange={() => errors.clinic_id && setErrors((p) => ({ ...p, clinic_id: undefined }))}
              className={`select select-bordered w-full rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all ${errors.clinic_id ? 'border-error focus:border-error focus:ring-error' : ''
                }`}
            >
              <option value="">Select a Clinic</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.clinic_id && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle size={14} />
                {errors.clinic_id}
              </div>
            )}
          </motion.div>

          {/* Age & Phone Grid */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Age */}
            <div>
              <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
                <Calendar size={14} className="text-amber-500" />
                Date of Birth
              </label>
              <input
                name="dateOfBirth"
                type="date"
                className="input input-bordered w-full rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-sm"
                max={new Date().toISOString().split('T')[0]}
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

          {/* Alternative Phone */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <Phone size={14} className="text-emerald-500" />
              Alternative Phone <span className="text-xs text-base-content/50 pr-1 truncate font-normal">(Optional)</span>
            </label>
            <input
              name="phone2"
              className="input input-bordered w-full rounded-lg focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
              placeholder="+20 1xx xxx xxxx"
            />
          </motion.div>

          {/* Medical History */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
              <AlertCircle size={14} className="text-orange-500" />
              Medical History & Drugs
            </label>
            <textarea
              name="medical_history"
              className="textarea textarea-bordered w-full rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all resize-none"
              placeholder="e.g., Diabetic, Penicillin Allergy, Aspirin, Metformin"
              rows="2"
            />
            <p className="text-xs text-base-content/50 mt-1.5 flex items-center">
              <Info size={12} className="mr-1 shrink-0" /> Tip: Separate multiple conditions or drugs with commas
            </p>
          </motion.div>


          {/* Address & Job */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Address */}
            <div>
              <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
                <MapPin size={14} className="text-indigo-500" />
                Address
              </label>
              <input
                name="address"
                className="input input-bordered w-full rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                placeholder="e.g., Cairo, Egypt"
              />
            </div>

            {/* Job */}
            <div>
              <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
                <Briefcase size={14} className="text-cyan-500" />
                Job
              </label>
              <input
                name="job"
                className="input input-bordered w-full rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                placeholder="e.g., Engineer"
              />
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.35 }}
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
      )}
    </Modal>
  );
}


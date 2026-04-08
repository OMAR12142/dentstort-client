import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Trash2, Plus, AlertCircle, Building2, MapPin, Percent } from 'lucide-react';
import Modal from './Modal';
import { useCreateClinic } from '../hooks/useClinics';

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const schema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().optional(),
  default_commission_percentage: z.coerce
    .number({ invalid_type_error: 'Commission is required' })
    .min(0, 'Must be 0-100')
    .max(100, 'Must be 0-100'),
});

export default function AddClinicModal({ open, onClose }) {
  const { mutate, isPending } = useCreateClinic();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    default_commission_percentage: '',
  });
  const [workingDays, setWorkingDays] = useState([]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormData({ name: '', address: '', default_commission_percentage: '' });
      setWorkingDays([]);
    }
  }, [open]);

  const clearError = (field) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleAddShift = () => {
    setWorkingDays((prev) => [...prev, { day: 'Saturday', start_time: '10:00', end_time: '18:00' }]);
  };

  const handleRemoveShift = (index) => {
    setWorkingDays((prev) => prev.filter((_, i) => i !== index));
  };

  const handleShiftChange = (index, field, value) => {
    setWorkingDays((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = schema.safeParse(formData);
    if (!result.success) {
      const errs = {};
      result.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    const payload = {
      ...result.data,
      working_days: workingDays,
    };

    mutate(payload, {
      onSuccess: () => {
        setErrors({});
        setFormData({ name: '', address: '', default_commission_percentage: '' });
        setWorkingDays([]);
        onClose();
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Clinic" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Clinic Name */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            Clinic Name <span className="text-error">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`input input-bordered w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.name ? 'border-error focus:border-error focus:ring-error' : ''}`}
            placeholder="Bright Smile Dental"
          />
          {errors.name && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={14} />
              {errors.name}
            </div>
          )}
        </motion.div>

        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <MapPin size={14} className="text-teal-500" />
            Address
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="input input-bordered w-full rounded-lg focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
            placeholder="123 Main St, Cairo"
          />
        </motion.div>

        {/* Commission */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Percent size={14} className="text-amber-500" />
            Commission Percentage <span className="text-error">*</span>
          </label>
          <input
            name="default_commission_percentage"
            type="number"
            step="0.5"
            value={formData.default_commission_percentage}
            onChange={handleInputChange}
            className={`input input-bordered w-full rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all ${errors.default_commission_percentage ? 'border-error focus:border-error focus:ring-error' : ''}`}
            placeholder="40"
          />
          {errors.default_commission_percentage && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={14} />
              {errors.default_commission_percentage}
            </div>
          )}
        </motion.div>

        {/* Working Days Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="border-t border-neutral-light pt-4"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-base-content/80">
              Working Days <span className="text-xs text-base-content/50">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={handleAddShift}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add Day/Shift
            </button>
          </div>

          {workingDays.length === 0 ? (
            <p className="text-xs text-base-content/60 italic">
              No working days added yet. Click "Add Day/Shift" to set your clinic hours.
            </p>
          ) : (
            <div className="space-y-3">
              {workingDays.map((shift, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-base-100/50 hover:bg-base-100 transition-colors"
                >
                  <select
                    value={shift.day}
                    onChange={(e) => handleShiftChange(idx, 'day', e.target.value)}
                    className="select select-bordered select-sm rounded-lg w-full sm:w-40"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="time"
                      value={shift.start_time}
                      onChange={(e) => handleShiftChange(idx, 'start_time', e.target.value)}
                      className="input input-bordered input-sm rounded-lg w-full sm:w-28"
                    />
                    <span className="text-xs font-medium text-base-content/50 shrink-0">to</span>
                  </div>

                  <input
                    type="time"
                    value={shift.end_time}
                    onChange={(e) => handleShiftChange(idx, 'end_time', e.target.value)}
                    className="input input-bordered input-sm rounded-lg w-full sm:w-28"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveShift(idx)}
                    className="p-2 text-base-content/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors shrink-0 ml-auto sm:ml-0"
                    title="Remove shift"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 pt-4"
        >
          <button type="button" onClick={onClose} className="btn btn-ghost rounded-lg flex-1">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn rounded-lg text-white border-0 bg-primary flex-1"
          >
            {isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save Clinic'}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}

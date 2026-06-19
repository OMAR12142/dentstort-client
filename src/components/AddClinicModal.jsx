import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Trash2, Plus, AlertCircle, Building2, MapPin, Percent, DollarSign, CalendarDays } from 'lucide-react';
import Modal from './Modal';
import { useCreateClinic, useUpdateClinic } from '../hooks/useClinics';
import { useCreateFixedSalary, useUpdateFixedSalary, useDeleteFixedSalary } from '../hooks/useFixedSalary';
import toast from 'react-hot-toast';

const daysOfWeek = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const schema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().optional(),
  default_commission_percentage: z.coerce
    .number({ invalid_type_error: 'Commission is required' })
    .min(0, 'Must be 0-100')
    .max(100, 'Must be 0-100'),
});

export default function AddClinicModal({ open, onClose, clinic = null, fixedSalary = null }) {
  const { mutateAsync: createClinicAsync, isPending: isCreating } = useCreateClinic();
  const { mutateAsync: updateClinicAsync, isPending: isUpdating } = useUpdateClinic();
  
  const { mutateAsync: createFixedSalaryAsync } = useCreateFixedSalary();
  const { mutateAsync: updateFixedSalaryAsync } = useUpdateFixedSalary();
  const { mutateAsync: deleteFixedSalaryAsync } = useDeleteFixedSalary();

  const isPending = isCreating || isUpdating;

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    default_commission_percentage: '',
  });
  const [workingDays, setWorkingDays] = useState([]);
  
  const [hasFixedSalary, setHasFixedSalary] = useState(false);
  const [fixedSalaryAmount, setFixedSalaryAmount] = useState('');
  const [fixedSalaryDay, setFixedSalaryDay] = useState('');

  useEffect(() => {
    if (open) {
      setErrors({});
      if (clinic) {
        setFormData({
          name: clinic.name || '',
          address: clinic.address || '',
          default_commission_percentage: clinic.default_commission_percentage ?? '',
        });
        // clone workingDays array so edits don't directly mutate state props
        setWorkingDays(clinic.working_days ? JSON.parse(JSON.stringify(clinic.working_days)) : []);

        if (fixedSalary) {
          setHasFixedSalary(true);
          setFixedSalaryAmount(fixedSalary.amount || '');
          setFixedSalaryDay(fixedSalary.salary_day || '');
        } else {
          setHasFixedSalary(false);
          setFixedSalaryAmount('');
          setFixedSalaryDay('');
        }
      } else {
        setFormData({ name: '', address: '', default_commission_percentage: '' });
        setWorkingDays([]);
        setHasFixedSalary(false);
        setFixedSalaryAmount('');
        setFixedSalaryDay('');
      }
    }
  }, [open, clinic, fixedSalary]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = schema.safeParse(formData);
    const errs = {};
    if (!result.success) {
      result.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
    }

    if (hasFixedSalary) {
      const amt = Number(fixedSalaryAmount);
      if (!fixedSalaryAmount || isNaN(amt) || amt <= 0) {
        errs.fixedSalaryAmount = 'Valid amount > 0 is required';
      }
      const day = Number(fixedSalaryDay);
      if (!fixedSalaryDay || isNaN(day) || day < 1 || day > 28) {
        errs.fixedSalaryDay = 'Day must be between 1 and 28';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      ...result.data,
      working_days: workingDays,
    };

    try {
      let savedClinic;
      if (clinic) {
        savedClinic = await updateClinicAsync({ id: clinic._id, ...payload });
      } else {
        savedClinic = await createClinicAsync(payload);
      }

      const clinicId = savedClinic?._id || clinic?._id;
      
      if (hasFixedSalary && fixedSalaryAmount && fixedSalaryDay) {
        if (fixedSalary) {
          await updateFixedSalaryAsync({ id: fixedSalary._id, data: { amount: fixedSalaryAmount, salary_day: fixedSalaryDay }});
        } else if (clinicId) {
          await createFixedSalaryAsync({ clinic_id: clinicId, amount: fixedSalaryAmount, salary_day: fixedSalaryDay });
        }
      } else if (!hasFixedSalary && fixedSalary) {
        await deleteFixedSalaryAsync(fixedSalary._id);
      }

      setErrors({});
      setFormData({ name: '', address: '', default_commission_percentage: '' });
      setWorkingDays([]);
      setHasFixedSalary(false);
      setFixedSalaryAmount('');
      setFixedSalaryDay('');
      onClose();
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save changes.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={clinic ? "Edit Clinic" : "Add Clinic"} size="lg">
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
            <MapPin size={14} className="text-primary/60" />
            Address
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="input input-bordered w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="123 Main St, Cairo"
          />
        </motion.div>

        {/* Commission */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="label text-sm font-semibold text-base-content/80 flex items-center gap-2">
            <Percent size={14} className="text-primary/60" />
            Commission Percentage <span className="text-error">*</span>
          </label>
          <input
            name="default_commission_percentage"
            type="number"
            step="0.5"
            value={formData.default_commission_percentage}
            onChange={handleInputChange}
            className={`input input-bordered w-full rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-all ${errors.default_commission_percentage ? 'border-error focus:border-error focus:ring-error' : ''}`}
            placeholder="40"
          />
          {errors.default_commission_percentage && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
               <AlertCircle size={14} />
               {errors.default_commission_percentage}
            </div>
          )}
        </motion.div>

        {/* Fixed Salary Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="bg-base-200/50 p-3 rounded-xl border border-neutral-light/50">
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input 
              type="checkbox" 
              className="checkbox checkbox-sm checkbox-primary" 
              checked={hasFixedSalary}
              onChange={(e) => setHasFixedSalary(e.target.checked)}
            />
            <span className="text-sm font-bold text-base-content">Add Fixed Salary</span>
          </label>
          
          {hasFixedSalary && (
            <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="label text-xs font-semibold text-base-content/80 flex items-center gap-1.5 pt-0">
                  <DollarSign size={12} className="text-success" /> Amount (EGP)
                </label>
                <input
                  type="number"
                  value={fixedSalaryAmount}
                  onChange={(e) => {
                    setFixedSalaryAmount(e.target.value);
                    clearError('fixedSalaryAmount');
                  }}
                  className={`input input-sm input-bordered w-full rounded-lg focus:border-primary ${errors.fixedSalaryAmount ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  placeholder="5000"
                />
                {errors.fixedSalaryAmount && (
                  <div className="flex items-center gap-1.5 text-[10px] text-error mt-1">
                    <AlertCircle size={10} />
                    {errors.fixedSalaryAmount}
                  </div>
                )}
              </div>
              <div>
                <label className="label text-xs font-semibold text-base-content/80 flex items-center gap-1.5 pt-0">
                  <CalendarDays size={12} className="text-primary" /> Salary Day (1-28)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={fixedSalaryDay}
                  onChange={(e) => {
                    setFixedSalaryDay(e.target.value);
                    clearError('fixedSalaryDay');
                  }}
                  className={`input input-sm input-bordered w-full rounded-lg focus:border-primary ${errors.fixedSalaryDay ? 'border-error focus:border-error focus:ring-error' : ''}`}
                  placeholder="10"
                />
                {errors.fixedSalaryDay && (
                  <div className="flex items-center gap-1.5 text-[10px] text-error mt-1">
                    <AlertCircle size={10} />
                    {errors.fixedSalaryDay}
                  </div>
                )}
              </div>
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
            {isPending ? <span className="loading loading-spinner loading-sm" /> : (clinic ? 'Save Changes' : 'Save Clinic')}
          </button>
        </motion.div>
      </form>
    </Modal>
  );
}

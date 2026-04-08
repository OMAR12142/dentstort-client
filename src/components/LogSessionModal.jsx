import { useState, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import { useCreateSession, useUpdateSession } from '../hooks/useSessions';
import { usePatients } from '../hooks/usePatients';

export default function LogSessionModal({ open, onClose, initialPatientId, sessionToEdit }) {
  const { mutate: createMutate, isPending: createPending } = useCreateSession();
  const { mutate: updateMutate, isPending: updatePending } = useUpdateSession();
  const { data: patientsData } = usePatients({ page: 1, limit: 200 });

  const patients = patientsData?.patients || [];


  const isEditMode = !!sessionToEdit;
  const isPending = createPending || updatePending;

  const [files, setFiles] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    treatment_category: '',
    treatment_details: '',
    total_cost: '',
    amount_paid: '',
    next_appointment: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && sessionToEdit) {
      setSelectedPatientId(sessionToEdit.patient_id);
      setFormData({
        date: new Date(sessionToEdit.date).toISOString().slice(0, 10),
        treatment_category: sessionToEdit.treatment_category || '',
        treatment_details: sessionToEdit.treatment_details || '',
        total_cost: sessionToEdit.total_cost || '',
        amount_paid: sessionToEdit.amount_paid || '',
        next_appointment: sessionToEdit.next_appointment
          ? new Date(sessionToEdit.next_appointment).toISOString().slice(0, 10)
          : '',
      });
      setFiles([]);
    } else {
      if (initialPatientId) {
        setSelectedPatientId(initialPatientId);
      } else {
        setSelectedPatientId('');
      }
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        treatment_category: '',
        treatment_details: '',
        total_cost: '',
        amount_paid: '',
        next_appointment: '',
      });
      setFiles([]);
    }
    setPatientSearch('');
    setErrors({});
  }, [open, sessionToEdit, initialPatientId, isEditMode]);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const clearError = (field) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!selectedPatientId) errs.patient_id = 'Please select a patient';
    if (!formData.treatment_category) errs.treatment_category = 'Please select a treatment category';
    if (!formData.total_cost || Number(formData.total_cost) <= 0)
      errs.total_cost = 'Enter a valid cost greater than 0';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (isEditMode) {
      const fd = new FormData();
      fd.append('patient_id', selectedPatientId);
      fd.append('date', formData.date);
      fd.append('treatment_category', formData.treatment_category);
      fd.append('treatment_details', formData.treatment_details);
      fd.append('total_cost', formData.total_cost);
      fd.append('amount_paid', formData.amount_paid || '0');
      if (formData.next_appointment) {
        fd.append('next_appointment', formData.next_appointment);
      }
      
      if (files.length > 0) {
        files.forEach((f) => fd.append('images', f));
      }

      updateMutate(
        { id: sessionToEdit._id, formData: fd },
        {
          onSuccess: () => {
            setFiles([]);
            setErrors({});
            onClose();
          },
        }
      );
    } else {
      const fd = new FormData();
      fd.append('patient_id', selectedPatientId);
      fd.append('date', formData.date);
      fd.append('treatment_category', formData.treatment_category);
      fd.append('treatment_details', formData.treatment_details);
      fd.append('total_cost', formData.total_cost);
      fd.append('amount_paid', formData.amount_paid || '0');
      if (formData.next_appointment) {
        fd.append('next_appointment', formData.next_appointment);
      }
      if (files.length > 0) {
        files.forEach((f) => fd.append('images', f));
      }

      createMutate(fd, {
        onSuccess: () => {
          setFiles([]);
          setErrors({});
          setPatientSearch('');
          onClose();
        },
      });
    }
  };

  const modalTitle = isEditMode ? 'Edit Session' : 'Log Session';
  const errCls = 'border-error focus:border-error focus:ring-error';

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Patient selector only – clinic comes from patient record */}
          <div className="md:col-span-2">
            <label className="label text-sm font-semibold text-base-content/80">
              Patient <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Search patient…"
              className="input input-bordered w-full rounded-lg mb-1"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                clearError('patient_id');
              }}
              disabled={isEditMode}
            />
            <select
              name="patient_id"
              className={`select select-bordered w-full rounded-lg ${errors.patient_id ? errCls : ''}`}
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                clearError('patient_id');
              }}
              disabled={isEditMode}
            >
              <option value="" disabled>Choose patient</option>
              {filteredPatients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                  {p.clinic_id?.name ? ` — ${p.clinic_id.name}` : ''}
                  {p.commission_percentage !== null && p.commission_percentage !== undefined
                    ? ` (${p.commission_percentage}%)`
                    : ''}
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle size={14} />
                {errors.patient_id}
              </div>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">Date</label>
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleFormChange('date', e.target.value)}
            className="input input-bordered w-full rounded-lg"
          />
        </div>

        {/* Treatment Category */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">
            Treatment Category <span className="text-error">*</span>
          </label>
          <select
            name="treatment_category"
            className={`select select-bordered w-full rounded-lg ${errors.treatment_category ? errCls : ''}`}
            value={formData.treatment_category}
            onChange={(e) => handleFormChange('treatment_category', e.target.value)}
          >
            <option value="" disabled>Choose treatment type</option>
            <option value="Endodontics">Endodontics</option>
            <option value="Surgery">Surgery</option>
            <option value="Restorative">Restorative</option>
            <option value="Prosthodontics">Prosthodontics</option>
            <option value="Orthodontics">Orthodontics</option>
            <option value="Pedodontics">Pedodontics</option>
            <option value="Cosmetic">Cosmetic</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
          {errors.treatment_category && (
            <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
              <AlertCircle size={14} />
              {errors.treatment_category}
            </div>
          )}
        </div>

        {/* Treatment Details */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">Treatment Details</label>
          <textarea
            name="treatment_details"
            rows={3}
            className="textarea textarea-bordered w-full rounded-lg resize-none"
            placeholder="Root canal on upper left molar…"
            value={formData.treatment_details}
            onChange={(e) => handleFormChange('treatment_details', e.target.value)}
          />
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-sm font-semibold text-base-content/80">
              Total Cost <span className="text-error">*</span>
            </label>
            <input
              name="total_cost"
              type="number"
              step="0.01"
              className={`input input-bordered w-full rounded-lg ${errors.total_cost ? errCls : ''}`}
              placeholder="500"
              value={formData.total_cost}
              onChange={(e) => handleFormChange('total_cost', e.target.value)}
            />
            {errors.total_cost && (
              <div className="flex items-center gap-1.5 text-xs text-error mt-1.5">
                <AlertCircle size={14} />
                {errors.total_cost}
              </div>
            )}
          </div>
          <div>
            <label className="label text-sm font-semibold text-base-content/80">Amount Paid</label>
            <input
              name="amount_paid"
              type="number"
              step="0.01"
              className="input input-bordered w-full rounded-lg"
              placeholder="200"
              value={formData.amount_paid}
              onChange={(e) => handleFormChange('amount_paid', e.target.value)}
            />
          </div>
        </div>

        {/* Next Appointment */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">Next Appointment</label>
          <input
            name="next_appointment"
            type="datetime-local"
            className="input input-bordered w-full rounded-lg"
            value={formData.next_appointment}
            onChange={(e) => handleFormChange('next_appointment', e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">
            Upload Media
            <span className="text-xs text-base-content/50 ml-1">(up to 5 images)</span>
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-light rounded-lg p-4 sm:p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <Upload size={28} className="text-base-content/50 mb-2" />
            <span className="text-sm text-base-content/70">
              Click to upload X-rays or photos
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {files.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-neutral-light"
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn w-full sm:w-auto rounded-lg text-white border-0 bg-primary"
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm" />
          ) : isEditMode ? (
            'Update Session'
          ) : (
            'Save Session'
          )}
        </button>
      </form>
    </Modal>
  );
}

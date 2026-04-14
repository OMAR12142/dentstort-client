import { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, Plus } from 'lucide-react';
import Modal from './Modal';
import { useCreateSession, useUpdateSession } from '../hooks/useSessions';
import { usePatients } from '../hooks/usePatients';

const DEFAULT_CATEGORIES = [
  'Surgery', 'Implant', 'Endo', 'Perio', 'Fixed', 'Removable', 'Restorative', 'General',
];

const getCustomCategories = () => {
  try {
    return JSON.parse(localStorage.getItem('gd_custom_categories') || '[]');
  } catch { return []; }
};

const saveCustomCategory = (cat) => {
  const existing = getCustomCategories();
  if (!existing.includes(cat)) {
    localStorage.setItem('gd_custom_categories', JSON.stringify([...existing, cat]));
  }
};

export default function LogSessionModal({ open, onClose, initialPatientId, sessionToEdit }) {
  const { mutate: createMutate, isPending: createPending } = useCreateSession();
  const { mutate: updateMutate, isPending: updatePending } = useUpdateSession();
  const { data: patientsData } = usePatients({ page: 1, limit: 200 });

  const patients = patientsData?.patients || [];

  const isEditMode = !!sessionToEdit;
  const isPending = createPending || updatePending;

  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || '');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    treatment_categories: [],
    treatment_details: '',
    total_cost: '',
    amount_paid: '',
    next_appointment: '',
  });
  const [errors, setErrors] = useState({});
  const [customCatInput, setCustomCatInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Build the full list of available categories
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...getCustomCategories()])];

  useEffect(() => {
    if (isEditMode && sessionToEdit) {
      setSelectedPatientId(sessionToEdit.patient_id);

      // Handle legacy single string or new array format
      let cats = [];
      if (Array.isArray(sessionToEdit.treatment_category)) {
        cats = sessionToEdit.treatment_category;
      } else if (sessionToEdit.treatment_category) {
        cats = [sessionToEdit.treatment_category];
      }

      setFormData({
        date: new Date(sessionToEdit.date).toISOString().slice(0, 10),
        treatment_categories: cats,
        treatment_details: sessionToEdit.treatment_details || '',
        total_cost: sessionToEdit.total_cost || '',
        amount_paid: sessionToEdit.amount_paid || '',
        next_appointment: sessionToEdit.next_appointment
          ? new Date(sessionToEdit.next_appointment).toISOString().slice(0, 10)
          : '',
      });
      setFiles([]);
      setExistingMedia(sessionToEdit.media_urls || []);
    } else {
      if (initialPatientId) {
        setSelectedPatientId(initialPatientId);
      } else {
        setSelectedPatientId('');
      }
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        treatment_categories: [],
        treatment_details: '',
        total_cost: '',
        amount_paid: '',
        next_appointment: '',
      });
      setFiles([]);
      setExistingMedia([]);
    }
    setPatientSearch('');
    setErrors({});
    setCustomCatInput('');
    setShowCustomInput(false);
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

  // ── Category handlers ────────────────────────
  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const cats = prev.treatment_categories.includes(cat)
        ? prev.treatment_categories.filter(c => c !== cat)
        : [...prev.treatment_categories, cat];
      return { ...prev, treatment_categories: cats };
    });
    clearError('treatment_category');
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCatInput.trim();
    if (!trimmed) return;

    // Save to localStorage for future use
    saveCustomCategory(trimmed);

    // Add to current selection if not already there
    setFormData((prev) => {
      const cats = prev.treatment_categories.includes(trimmed)
        ? prev.treatment_categories
        : [...prev.treatment_categories, trimmed];
      return { ...prev, treatment_categories: cats };
    });

    setCustomCatInput('');
    setShowCustomInput(false);
    clearError('treatment_category');
  };

  const handleFiles = (e) => {
    const maxAllowed = 5 - existingMedia.length;
    if (maxAllowed <= 0) {
      setErrors(p => ({ ...p, media: 'Maximum of 5 images reached. Remove existing ones to add more.' }));
      return;
    }
    
    const selected = Array.from(e.target.files);
    if (selected.length > maxAllowed) {
      setErrors(p => ({ ...p, media: `You can only add ${maxAllowed} more image(s).` }));
      setFiles(selected.slice(0, maxAllowed));
    } else {
      setFiles(selected);
      clearError('media');
    }
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));
  const removeExistingMedia = (idx) => setExistingMedia((m) => m.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!selectedPatientId) errs.patient_id = 'Please select a patient';
    if (formData.treatment_categories.length === 0) errs.treatment_category = 'Please select at least one treatment type';

    if (existingMedia.length + files.length > 5) {
      errs.media = 'Total images cannot exceed 5. Please remove some.';
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (isEditMode) {
      const fd = new FormData();
      fd.append('patient_id', selectedPatientId);
      fd.append('date', formData.date);
      fd.append('treatment_category', JSON.stringify(formData.treatment_categories));
      fd.append('treatment_details', formData.treatment_details);
      fd.append('total_cost', formData.total_cost);
      fd.append('amount_paid', formData.amount_paid || '0');
      if (formData.next_appointment) {
        fd.append('next_appointment', formData.next_appointment);
      }
      
      // Send the current list of existing media URLs as kept
      fd.append('existing_media', JSON.stringify(existingMedia));
      
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
      fd.append('treatment_category', JSON.stringify(formData.treatment_categories));
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

        {/* Treatment Category - Multi-Tag Picker */}
        <div>
          <label className="label text-sm font-semibold text-base-content/80">
            Treatment Type <span className="text-error">*</span>
          </label>
<<<<<<< Updated upstream
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
=======

          {/* Selected tags */}
          {formData.treatment_categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {formData.treatment_categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary border border-primary/20"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="hover:text-error transition-colors ml-0.5"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Category chips to pick from */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allCategories.map((cat) => {
              const isSelected = formData.treatment_categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary'
                      : 'bg-base-100 text-base-content/70 border-neutral-light hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              );
            })}

            {/* Add Custom button */}
            {!showCustomInput && (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                Custom
              </button>
            )}
          </div>

          {/* Custom category input */}
          {showCustomInput && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                autoFocus
                className="input input-sm input-bordered flex-1 rounded-lg"
                placeholder="Type custom category (e.g. Insurance)..."
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCategory(); }
                  if (e.key === 'Escape') { setShowCustomInput(false); setCustomCatInput(''); }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomCategory}
                disabled={!customCatInput.trim()}
                className="btn btn-sm bg-primary text-white border-0 rounded-lg px-4"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowCustomInput(false); setCustomCatInput(''); }}
                className="btn btn-sm btn-ghost text-base-content/50 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          )}

>>>>>>> Stashed changes
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
              Total Cost
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
            <span className="text-xs text-base-content/50 ml-1">
              ({5 - existingMedia.length - files.length} slots remaining)
            </span>
          </label>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer transition-colors ${
            errors.media ? 'border-error bg-error/5' : 'border-neutral-light hover:border-primary hover:bg-primary/5'
          }`}>
            <Upload size={28} className={`${errors.media ? 'text-error' : 'text-base-content/50'} mb-2`} />
            <span className={`text-sm ${errors.media ? 'text-error font-medium' : 'text-base-content/70'}`}>
              {errors.media ? errors.media : isEditMode ? 'Click to add more media' : 'Click to upload X-rays or photos'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
          </label>

          {/* Existing Media */}
          {isEditMode && existingMedia.length > 0 && (
            <div className="mt-4">
              <span className="text-[10px] uppercase font-bold text-base-content/40 mb-2 block tracking-wider">
                Current Media
              </span>
              <div className="flex gap-2 flex-wrap">
                {existingMedia.map((url, i) => (
                  <div
                    key={`existing-${i}`}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden border border-neutral-light bg-base-300"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(i)}
                      className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      title="Remove from session"
                    >
                      <X size={20} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Uploads Preview */}
          {files.length > 0 && (
            <div className="mt-4">
               <span className="text-[10px] uppercase font-bold text-primary mb-2 block tracking-wider">
                New Media to Upload
              </span>
              <div className="flex gap-2 flex-wrap">
                {files.map((f, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative group w-16 h-16 rounded-lg overflow-hidden border border-primary/30"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <div className="absolute top-0 right-0 p-1">
                      <div className="w-2 h-2 bg-primary rounded-full shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
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

import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Calendar,
  Building2,
  Percent,
  Stethoscope,
  MapPin,
  Briefcase,
  Pill,
  Clock,
  Activity,
} from 'lucide-react';
import Modal from './Modal';
import Badge from './Badge';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/10 text-success border border-success/20';
    case 'On-Hold': return 'bg-warning/10 text-warning-content border border-warning/20';
    case 'Dropped': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'Active':
    default: return 'bg-info/10 text-info border border-info/20';
  }
};

export default function PatientDetailsModal({ open, onClose, patient }) {
  if (!patient) return null;

  return (
    <Modal open={open} onClose={onClose} title="Patient Overview" size="md">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex items-start gap-4 pb-4 border-b border-neutral-light">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{patient.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-base-content break-words">{patient.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                {patient.status || 'Active'}
              </span>
              <span className="text-xs text-base-content/60 flex items-center gap-1">
                <Clock size={12} />
                Added {new Date(patient.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200/50 p-3 rounded-xl border border-neutral-light">
            <div className="flex items-center gap-1.5 text-base-content/60 mb-1">
              <Calendar size={14} className="text-amber-500" />
              <span className="text-xs font-semibold">Age</span>
            </div>
            <p className="font-medium text-base-content">{patient.age ? `${patient.age} years` : 'Not provided'}</p>
          </div>

          <div className="bg-base-200/50 p-3 rounded-xl border border-neutral-light">
            <div className="flex items-center gap-1.5 text-base-content/60 mb-1">
              <Phone size={14} className="text-teal-500" />
              <span className="text-xs font-semibold">Phone</span>
            </div>
            <p className="font-medium text-base-content">{patient.phone || 'Not provided'}</p>
          </div>

          <div className="bg-base-200/50 p-3 rounded-xl border border-neutral-light">
            <div className="flex items-center gap-1.5 text-base-content/60 mb-1">
              <MapPin size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold">Address</span>
            </div>
            <p className="font-medium text-base-content truncate" title={patient.address}>{patient.address || 'Not provided'}</p>
          </div>

          <div className="bg-base-200/50 p-3 rounded-xl border border-neutral-light">
            <div className="flex items-center gap-1.5 text-base-content/60 mb-1">
              <Briefcase size={14} className="text-cyan-500" />
              <span className="text-xs font-semibold">Job / Title</span>
            </div>
            <p className="font-medium text-base-content truncate" title={patient.job}>{patient.job || 'Not provided'}</p>
          </div>
        </div>

        {/* Clinical Info Group */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-rose-50/50 dark:bg-rose-900/10 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <Stethoscope size={16} className="text-rose-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-rose-500/80">Insurance Provider</p>
              <p className="font-medium text-base-content">{patient.insuranceCompany || 'Private'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-violet-50/50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-100 dark:border-violet-900/30">
            <Building2 size={16} className="text-violet-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-violet-500/80">Primary Clinic</p>
              <p className="font-medium text-base-content truncate">{patient.clinic_id?.name || 'Unknown Clinic'}</p>
            </div>
            <div className="text-right flex items-center justify-end gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/40 rounded-lg">
              <Percent size={12} className="text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{patient.commission_percentage}%</span>
            </div>
          </div>
        </div>

        {/* Medical Section */}
        <div className="space-y-4 pt-2 border-t border-neutral-light">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-orange-500" />
              <h3 className="font-bold text-sm text-base-content">Medical History</h3>
            </div>
            {patient.medical_history?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.medical_history.map((item, i) => (
                  <Badge key={i} label={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/50 italic px-2">No active medical history</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill size={16} className="text-pink-500" />
              <h3 className="font-bold text-sm text-base-content">Current Medications</h3>
            </div>
            {patient.drugs?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.drugs.map((drug, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
                  >
                    {drug}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-base-content/50 italic px-2">No active medications</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

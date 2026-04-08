import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Percent, Plus, Clock, Zap, Trash2 } from 'lucide-react';
import { useClinics, useDeleteClinic } from '../hooks/useClinics';
import { CardSkeleton } from '../components/Skeleton';
import Card from '../components/Card';
import AddClinicModal from '../components/AddClinicModal';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function ClinicsPage() {
  const { data, isLoading } = useClinics();
  const { mutate: deleteClinic, isPending: isDeleting } = useDeleteClinic();
  const [showAdd, setShowAdd] = useState(false);

  const clinics = Array.isArray(data) ? data : data?.clinics || [];

  const todaysShifts = useMemo(() => {
    const today = new Date();
    const todayName = daysOfWeek[today.getDay()];
    return clinics.filter((clinic) =>
      clinic.working_days?.some((shift) => shift.day === todayName)
    );
  }, [clinics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Clinics</h1>
          <p className="text-base-content/70 text-sm mt-0.5">
            Manage the clinics you work at.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-sm rounded-lg text-white border-0 gap-1 bg-primary w-full sm:w-auto"
        >
          <Plus size={16} />
          Add Clinic
        </button>
      </div>

      {/* Today's Shifts */}
      {!isLoading && clinics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-base-content">Today's Shifts</h2>
          </div>

          {todaysShifts.length === 0 ? (
            <Card className="text-center py-6">
              <p className="text-base-content/70 text-sm">
                ✨ No clinic shifts today. Enjoy your well-deserved rest!
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaysShifts.map((clinic, idx) => {
                const todayShiftsForClinic = clinic.working_days.filter(
                  (shift) => shift.day === daysOfWeek[new Date().getDay()]
                );
                return todayShiftsForClinic.map((shift, shiftIdx) => (
                  <motion.div
                    key={`${clinic._id}-${shiftIdx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + shiftIdx) * 0.05 }}
                    className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 sm:p-5 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-base-content">{clinic.name}</h3>
                        {clinic.address && (
                          <p className="text-sm text-base-content/70 flex items-center gap-1.5 mt-1">
                            <MapPin size={14} className="shrink-0" />
                            {clinic.address}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full shrink-0 w-fit">
                        <Clock size={14} className="text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ));
              })}
            </div>
          )}
        </div>
      )}

      {/* Clinics Grid */}
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : clinics.length === 0 ? (
        <Card className="text-center py-16">
          <Building2 size={48} className="text-base-content/30 mx-auto mb-4" />
          <p className="text-base-content/70">No clinics yet. Add your first clinic to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {clinics.map((clinic, i) => (
            <motion.div
              key={clinic._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-primary/30 transition-all group h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Building2 size={22} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Percent size={12} />
                      {clinic.default_commission_percentage}%
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${clinic.name}?`)) {
                          deleteClinic(clinic._id);
                        }
                      }}
                      disabled={isDeleting}
                      className="p-1.5 text-base-content/40 hover:text-error hover:bg-error/10 rounded-lg transition-colors border-0"
                      title="Delete Clinic"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-base-content mb-1">{clinic.name}</h3>

                {clinic.address && (
                  <p className="text-sm text-base-content/70 flex items-center gap-1.5 mb-2 mt-2">
                    <MapPin size={14} className="shrink-0" />
                    {clinic.address}
                  </p>
                )}

                {clinic.working_days && clinic.working_days.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-light">
                    <p className="text-xs font-semibold text-base-content/60 uppercase mb-2 flex items-center gap-1">
                      <Clock size={12} />
                      Working Hours
                    </p>
                    <div className="space-y-1">
                      {clinic.working_days.map((shift, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-base-content/70 flex items-center justify-between px-2 py-1.5 rounded bg-base-100/50"
                        >
                          <span className="font-medium">{shift.day}</span>
                          <span className="text-base-content/60">
                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <AddClinicModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

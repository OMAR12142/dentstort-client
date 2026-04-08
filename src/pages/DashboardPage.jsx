import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  CalendarClock,
  UserPlus,
  ClipboardPlus,
  MessageCircle,
  Calendar,
  Clock,
  ListTodo,
  ArrowRight,
} from 'lucide-react';
import { useDashboardStats } from '../hooks/useAnalytics';
import { usePatients } from '../hooks/usePatients';
import { useUpcomingAppointments } from '../hooks/useSessions';
import { useTasks } from '../hooks/useTasks';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import ErrorState from '../components/common/ErrorState';
import Card from '../components/Card';
import PatientModal from '../components/PatientModal';
import LogSessionModal from '../components/LogSessionModal';

const timeframeOptions = [
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const getTimeframeLabel = (timeframe) => {
  const option = timeframeOptions.find((opt) => opt.value === timeframe);
  return option?.label || 'This Month';
};

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState('monthly');
  const { data: stats, isLoading: loadStats, isFetching: isFetchingStats, isError: isErrorStats, error: errorStats, refetch: refetchStats } = useDashboardStats(timeframe);
  const { data: patientsData, isLoading: loadP, isError: isErrorP, error: errorP, refetch: refetchP } = usePatients({ page: 1, limit: 5 });
  const { data: appointmentsData, isLoading: loadA, isError: isErrorA, error: errorA, refetch: refetchA } = useUpcomingAppointments();
  const { data: tasksData, isLoading: loadT, isError: isErrorT, error: errorT, refetch: refetchT } = useTasks();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showLogSession, setShowLogSession] = useState(false);

  const totalEarnings = stats?.stats?.totalEarnings || 0;
  const totalSessions = stats?.stats?.totalSessions || 0;
  const patientsAdded = stats?.stats?.patientsAdded || 0;
  const activePatients = stats?.stats?.activePatients || 0;
  const earnings = stats?.earnings || [];

  const totalPatients = patientsData?.totalPatients || 0;
  const appointments = appointmentsData?.appointments || [];
  const tasks = tasksData?.tasks || [];
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  
  const isLoading = loadStats || loadP || loadA || loadT;
  const isFetching = isFetchingStats;

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const formatAppointmentTime = (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Today, ${appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    }

    if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;
    }

    return appointmentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) return <DashboardSkeleton />;

  if (isErrorStats || isErrorP || isErrorA || isErrorT) {
    const error = errorStats || errorP || errorA || errorT;
    const refetch = () => {
      refetchStats();
      refetchP();
      refetchA();
      refetchT();
    };
    return <ErrorState error={error} refetch={refetch} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-20 lg:pb-0">
      {/* Header with Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">Dashboard</h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Welcome back — here's your overview.
          </p>
        </div>

        {/* Timeframe Selector - LinkedIn Flat Style */}
        <div className="join bg-base-200/50 p-1 rounded-lg border border-neutral-light w-full sm:w-auto">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              disabled={isFetching}
              className={`btn btn-sm join-item border-none font-medium transition-all ${
                timeframe === option.value
                  ? 'bg-base-100 shadow-sm text-primary'
                  : 'btn-ghost text-secondary hover:bg-transparent disabled:opacity-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards - 2x2 on mobile, 3 columns on desktop */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
        animate={{ opacity: isFetching ? 0.6 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card 1 - Earnings */}
        <Card className="hover:border-primary/40 transition-colors p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign size={18} className="sm:text-[22px] text-emerald-500" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content break-words">
            {totalEarnings.toLocaleString()} EGP
          </p>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">{getTimeframeLabel(timeframe)} Earnings</p>
        </Card>

        {/* Card 2 - Patients Added in Timeframe */}
        <Card className="hover:border-primary/40 transition-colors p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-sky-50 flex items-center justify-center">
              <UserPlus size={18} className="sm:text-[22px] text-sky-500" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-sky-500 bg-sky-50 px-2 py-1 rounded-full whitespace-nowrap">
              Added
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content break-words">
            {patientsAdded}
          </p>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">Patients {getTimeframeLabel(timeframe).toLowerCase()}</p>
        </Card>

        {/* Card 3 - Sessions This Timeframe */}
        <Card className="hover:border-primary/40 transition-colors p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-violet-50 flex items-center justify-center">
              <CalendarClock size={18} className="sm:text-[22px] text-violet-500" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-violet-500 bg-violet-50 px-2 py-1 rounded-full whitespace-nowrap">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-base-content break-words">
            {totalSessions}
          </p>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">Sessions {getTimeframeLabel(timeframe).toLowerCase()}</p>
        </Card>
      </motion.div>

      {/* Upcoming Appointments */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar size={18} className="sm:text-[20px] text-primary" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-base-content">Upcoming Appointments</h2>
          {appointments.length > 0 && (
            <span className="ml-auto bg-teal-100 text-primary text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
              {appointments.length} scheduled
            </span>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-base-content/70">
            <Calendar size={32} className="sm:text-[40px] mx-auto mb-3 text-base-content/30" />
            <p className="text-xs sm:text-sm">No upcoming appointments scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {appointments.map((apt, idx) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-base-100/50 hover:bg-base-100 transition-colors group"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base text-base-content truncate">
                      {apt.patient_id?.name || 'Unknown Patient'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-base-content/60 flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="sm:text-[12px]" />
                      {formatAppointmentTime(apt.next_appointment)}
                    </p>
                  </div>
                </div>

                {apt.patient_id?.phone && (
                  <a
                    href={getWhatsAppLink(apt.patient_id.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 text-zinc-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-all duration-200 shrink-0"
                    title="Chat on WhatsApp"
                    aria-label="Chat on WhatsApp"
                  >
                    <MessageCircle size={16} className="sm:text-[18px]" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Smart Shift Tasks Preview */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <ListTodo size={16} className="sm:text-[20px] text-violet-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-base-content">Smart Shift Tasks</h2>
          </div>
          {tasks.length > 0 && (
            <span className="bg-violet-100 text-violet-700 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
              {activeTasks.length} active
            </span>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-4 sm:py-6 text-base-content/70">
            <p className="text-xs sm:text-sm mb-3 sm:mb-4">No tasks yet. Head to the Tasks page to get started!</p>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              Go to Tasks <ArrowRight size={14} className="sm:text-[16px]" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {activeTasks.slice(0, 3).map((task, idx) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-base-100/50 hover:bg-base-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-500 shrink-0" />
                  <p className="text-xs sm:text-sm font-medium text-base-content break-words line-clamp-2">
                    {task.text}
                  </p>
                </div>
                {task.clinic_id?.name && (
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-base-300/50 rounded truncate shrink-0 max-w-[80px] sm:max-w-none">
                    {task.clinic_id.name}
                  </span>
                )}
              </motion.div>
            ))}
            {activeTasks.length > 0 && (
              <div className="text-center pt-2">
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
                >
                  {activeTasks.length > 3
                    ? `View all tasks (${activeTasks.length} active)`
                    : 'Manage tasks'}{' '}
                  <ArrowRight size={12} className="sm:text-[14px]" />
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Earnings by Clinic */}
      {earnings?.length > 0 && (
        <Card className="p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-base-content mb-3 sm:mb-4">Earnings by Clinic ({getTimeframeLabel(timeframe)})</h2>
          <div className="space-y-3 sm:space-y-4">
            {earnings.map((e, idx) => {
              const pct = totalEarnings ? (e.totalDentistCut / totalEarnings) * 100 : 0;
              return (
                <motion.div
                  key={e.clinic_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="font-medium text-base-content truncate max-w-[60%]">{e.clinicName}</span>
                    <span className="text-base-content/70 whitespace-nowrap">{e.totalDentistCut.toLocaleString()} EGP</span>
                  </div>
                  <div className="w-full bg-base-100 rounded-full h-1.5 sm:h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="h-1.5 sm:h-2 rounded-full bg-primary"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* FABs - تحسين للموبايل */}
      {/* FABs - جنب بعض في الموبايل */}
      <div className="fixed bottom-18 right-4 sm:bottom-8 sm:right-6 flex flex-row gap-3 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogSession(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          title="Log Session"
        >
          <ClipboardPlus size={20} className="sm:text-[24px]" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddPatient(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-base-200 text-sky-600 border border-neutral-light hover:bg-sky-50 transition-colors flex items-center justify-center"
          title="Add Patient"
        >
          <UserPlus size={20} className="sm:text-[24px]" />
        </motion.button>
      </div>
      <PatientModal open={showAddPatient} onClose={() => setShowAddPatient(false)} patientToEdit={null} />
      <LogSessionModal open={showLogSession} onClose={() => setShowLogSession(false)} />

    </div>
  );
}
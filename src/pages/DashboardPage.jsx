import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  Zap,
  MapPin,
  Plus,
  Receipt,
  TrendingDown,
} from 'lucide-react';
import { useClinics } from '../hooks/useClinics';
import { useDashboardStats } from '../hooks/useAnalytics';
import { usePatients } from '../hooks/usePatients';
import { useTodaysAppointments } from '../hooks/useAppointments';
import { useTasks } from '../hooks/useTasks';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import ErrorState from '../components/common/ErrorState';
import SEO from '../components/common/SEO';
import PageHeader from '../components/common/PageHeader';
import { useAuthStore } from '../store/authStore';
import Card from '../components/Card';
import PatientModal from '../components/PatientModal';
import LogSessionModal from '../components/LogSessionModal';
import WhatsAppIcon from '../components/WhatsAppIcon';

// Timeframe options — labels resolved at render time via t()
const timeframeKeys = [
  { value: 'monthly', labelKey: 'timeframe.thisMonth' },
  { value: 'yearly', labelKey: 'timeframe.thisYear' },
  { value: 'all', labelKey: 'timeframe.allTime' },
];

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard');
  const isRtl = i18n.language === 'ar';
  const [timeframe, setTimeframe] = useState('monthly');
  const { data: stats, isLoading: loadStats, isFetching: isFetchingStats, isError: isErrorStats, error: errorStats, refetch: refetchStats } = useDashboardStats(timeframe);
  const { data: patientsData, isLoading: loadP, isError: isErrorP, error: errorP, refetch: refetchP } = usePatients({ page: 1, limit: 5 });
  const { data: appointmentsData, isLoading: loadA, isError: isErrorA, error: errorA, refetch: refetchA } = useTodaysAppointments();
  const { data: tasksData, isLoading: loadT, isError: isErrorT, error: errorT, refetch: refetchT } = useTasks();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting', 'Good Morning') + ' ☀️';
    if (hour < 18) return t('greeting', 'Good Morning') + ' 🌤️';
    return t('greeting', 'Good Morning') + ' 🌙';
  };

  const getTimeframeLabel = (tf) => {
    const option = timeframeKeys.find((opt) => opt.value === tf);
    return option ? t(option.labelKey) : t('timeframe.thisMonth');
  };
  const { data: clinicsData, isLoading: loadC, isError: isErrorC, refetch: refetchC } = useClinics();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [logSessionModalOpen, setLogSessionModalOpen] = useState(false);
  const [logSessionPatientId, setLogSessionPatientId] = useState('');
  const [logSessionLinkedAptId, setLogSessionLinkedAptId] = useState('');
  const [showLogSession, setShowLogSession] = useState(false);

  const totalEarnings = stats?.stats?.totalEarnings || 0;
  const totalSessions = stats?.stats?.totalSessions || 0;
  const patientsAdded = stats?.stats?.patientsAdded || 0;
  const activePatients = stats?.stats?.activePatients || 0;
  const monthlyFixedSalary = stats?.stats?.monthly_fixed_salary || 0;
  const totalExpenses = stats?.stats?.totalExpenses || 0;
  const totalIncome = totalEarnings + monthlyFixedSalary;
  const netProfit = totalIncome - totalExpenses;
  const earnings = stats?.earnings || [];

  const totalPatients = patientsData?.totalPatients || 0;
  const appointments = appointmentsData || [];
  const tasks = tasksData?.tasks || [];
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];
  
  const todaysShifts = useMemo(() => {
    const today = new Date();
    const todayName = daysOfWeek[today.getDay()];
    return clinics.filter((clinic) =>
      clinic.working_days?.some((shift) => shift.day === todayName)
    );
  }, [clinics]);
  
  const isLoading = loadStats || loadP || loadA || loadT || loadC;
  const isFetching = isFetchingStats;

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone;
    }
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}`;
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title={`${getGreeting()}`}
        subtitle={
          <>
            {t('title', "Here's what's happening")}
            {isFetchingStats && <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary" />}
          </>
        }
        actionComponent={
          <div className="join bg-base-100 p-1 rounded-xl border border-neutral-light shadow-sm w-full sm:w-auto">
            {timeframeKeys.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                disabled={isFetching}
                className={`btn btn-sm join-item border-none font-medium transition-all rounded-lg ${
                  timeframe === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200 disabled:opacity-50'
                }`}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
        }
      />

      {/* Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        
        {/* Left Column - Main Analytics & Shifts (Takes 2 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6 sm:space-y-8">
          
          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
            animate={{ opacity: isFetching ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
          >
        {/* Card 1 - Earnings */}
        <Card className="hover:border-success/40 transition-all duration-300 p-3 sm:p-4 relative overflow-hidden group bg-gradient-to-br from-success/5 to-transparent border border-success/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center text-success transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <DollarSign size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-wider border border-success/20">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-black text-base-content break-words drop-shadow-sm">
            {totalIncome.toLocaleString()} <span className="text-xs font-bold text-success uppercase tracking-tighter">EGP</span>
          </p>
          <p className="text-[10px] font-bold text-base-content/50 mt-2 uppercase tracking-widest">{getTimeframeLabel(timeframe)} Total Income</p>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-colors duration-500" />
        </Card>

        {/* Card 1.5 - Fixed Salary */}
        <Card className="hover:border-success/40 transition-all duration-300 p-3 sm:p-4 relative overflow-hidden group bg-gradient-to-br from-success/5 to-transparent border border-success/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 rounded-xl bg-success/20 flex items-center justify-center text-success transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <DollarSign size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-success bg-success/10 px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-wider border border-success/20">
              Fixed
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-black text-base-content break-words drop-shadow-sm">
            {monthlyFixedSalary.toLocaleString()} <span className="text-xs font-bold text-success uppercase tracking-tighter">EGP</span>
          </p>
          <p className="text-[10px] font-bold text-base-content/50 mt-2 uppercase tracking-widest">Fixed Salary</p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-colors duration-500" />
        </Card>


        {/* Card 3 - Sessions */}
        <Card className="hover:border-primary/40 transition-all duration-300 p-3 sm:p-4 relative overflow-hidden group bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(var(--p),0.2)]">
              <CalendarClock size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-wider border border-primary/20">
              History
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-black text-base-content break-words drop-shadow-sm">
            {totalSessions}
          </p>
          <p className="text-[10px] font-bold text-base-content/50 mt-2 uppercase tracking-widest">Sessions {getTimeframeLabel(timeframe).toLowerCase()}</p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
        </Card>

        {/* Card - Expenses */}
        <Card className="hover:border-error/40 transition-all duration-300 p-3 sm:p-4 relative overflow-hidden group bg-gradient-to-br from-error/5 to-transparent border border-error/10 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 rounded-xl bg-error/20 flex items-center justify-center text-error transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Receipt size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-error bg-error/10 px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-wider border border-error/20">
              Spent
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-black text-base-content break-words drop-shadow-sm">
            {totalExpenses.toLocaleString()} <span className="text-xs font-bold text-error uppercase tracking-tighter">EGP</span>
          </p>
          <p className="text-[10px] font-bold text-base-content/50 mt-2 uppercase tracking-widest">Expenses {getTimeframeLabel(timeframe).toLowerCase()}</p>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-error/10 rounded-full blur-2xl group-hover:bg-error/20 transition-colors duration-500" />
        </Card>

        {/* Card - Net Profit */}
        <Card className={`transition-all duration-300 p-3 sm:p-4 relative overflow-hidden group border backdrop-blur-xl col-span-2 xl:col-span-1 ${netProfit >= 0 ? 'bg-gradient-to-br from-success/5 to-transparent border-success/10 hover:border-success/40' : 'bg-gradient-to-br from-error/5 to-transparent border-error/10 hover:border-error/40'}`}>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(var(--p),0.1)] ${netProfit >= 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
              <TrendingDown size={16} strokeWidth={2.5} className={netProfit >= 0 ? 'rotate-180' : ''} />
            </div>
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap uppercase tracking-wider border ${netProfit >= 0 ? 'text-success bg-success/10 border-success/20' : 'text-error bg-error/10 border-error/20'}`}>
              Net
            </span>
          </div>
          <p className="text-xl lg:text-2xl font-black text-base-content break-words drop-shadow-sm">
            {netProfit.toLocaleString()} <span className={`text-xs font-bold uppercase tracking-tighter ${netProfit >= 0 ? 'text-success' : 'text-error'}`}>EGP</span>
          </p>
          <p className="text-[10px] font-bold text-base-content/50 mt-2 uppercase tracking-widest">Net Profit</p>
          <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-colors duration-500 ${netProfit >= 0 ? 'bg-success/10 group-hover:bg-success/20' : 'bg-error/10 group-hover:bg-error/20'}`} />
        </Card>

          </motion.div>

          {/* Today's Shifts section */}
      {!isLoading && clinics.length > 0 && (
        <Card className="p-4 sm:p-5 border border-primary/20 bg-primary/5 dark:bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap size={18} className="sm:text-[20px] text-white" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-base-content text-primary">Today's Shifts</h2>
          </div>

          {todaysShifts.length === 0 ? (
            <div className="text-center py-4 text-primary/70">
              <p className="text-xs sm:text-sm font-medium">✨ No clinic shifts today. Enjoy your day!</p>
            </div>
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-base-100/80 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-base-content whitespace-nowrap overflow-hidden text-ellipsis">{clinic.name}</h3>
                      {clinic.address && (
                        <p className="text-xs text-base-content/70 flex items-center gap-1 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          <MapPin size={12} className="shrink-0" />
                          {clinic.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-md shrink-0 w-fit">
                      <Clock size={12} className="text-primary" />
                      <span className="text-xs font-bold text-primary">
                        {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                      </span>
                    </div>
                  </motion.div>
                ));
              })}
            </div>
          )}
        </Card>
      )}

      {/* Earnings by Clinic */}
      {earnings?.length > 0 && (
        <Card className="p-5 sm:p-6 border-neutral-light/50 bg-base-100/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-base-content tracking-tight uppercase">Clinic Earnings</h2>
              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{getTimeframeLabel(timeframe)} Overview</p>
            </div>
          </div>
          <div className="space-y-4">
            {earnings.map((e, idx) => {
              const pct = totalEarnings ? (e.totalDentistCut / totalEarnings) * 100 : 0;
              return (
                <motion.div
                  key={e.clinic_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-bold text-base-content flex-1 min-w-0 pr-2">{e.clinicName}</span>
                    <span className="text-base-content font-black">{e.totalDentistCut.toLocaleString()} <span className="text-[10px] opacity-40 uppercase tracking-widest">EGP</span></span>
                  </div>
                  <div className="w-full bg-base-200/50 rounded-full h-2 overflow-hidden border border-neutral-light/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

    </div> {/* End Left Column */}

    {/* Right Column - Agenda & Tasks (Takes 1 col on lg, 1 col on xl) */}
    <div className="space-y-6 sm:space-y-8">
      
      {/* Today's Appointments */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar size={18} className="sm:text-[20px] text-primary" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-base-content">Today's Appointments</h2>
          {appointments.length > 0 && (
            <span className="ml-auto bg-teal-100 text-primary text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
              {appointments.length} scheduled
            </span>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-base-content/70">
            <Calendar size={32} className="sm:text-[40px] mx-auto mb-3 text-base-content/30" />
            <p className="text-xs sm:text-sm">No appointments scheduled for today.</p>
            <Link
              to="/appointments"
              className="inline-flex items-center gap-1.5 mt-3 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Open Calendar <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {appointments.map((apt, idx) => (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col gap-3 p-3 rounded-xl bg-base-100/50 hover:bg-base-100 transition-colors group border border-transparent hover:border-neutral-light/50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/patients/${apt.patient_id?._id}`} className="block hover:text-primary transition-colors">
                      <p className="font-bold text-[15px] text-base-content break-words leading-tight">
                        {apt.patient_id?.name || 'Unknown Patient'}
                      </p>
                    </Link>
                    <p className="text-xs text-base-content/50 flex items-center gap-1.5 mt-1 font-medium">
                      <Clock size={12} className="shrink-0 text-base-content/40" />
                      {apt.startTime} · {apt.clinic_id?.name || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pl-5">
                  <button
                    onClick={() => {
                      setLogSessionPatientId(apt.patient_id?._id);
                      setLogSessionLinkedAptId(apt._id);
                      setLogSessionModalOpen(true);
                    }}
                    className="btn btn-sm bg-primary/10 hover:bg-primary/20 text-primary border-none flex-1 gap-2 shadow-sm"
                  >
                    <Plus size={14} /> Log Session
                  </button>

                  {apt.patient_id?.phone && (
                    <a
                      href={getWhatsAppLink(apt.patient_id.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost hover:bg-[#25D366]/10 hover:text-[#25D366] text-base-content/30 shrink-0 px-2"
                      title="Chat on WhatsApp"
                      aria-label="Chat on WhatsApp"
                    >
                      <WhatsAppIcon size={18} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
            <div className="text-center pt-2">
              <Link
                to="/appointments"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
              >
                View full calendar <ArrowRight size={12} className="sm:text-[14px]" />
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Smart Shift Tasks Preview */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ListTodo size={16} className="sm:text-[20px] text-primary" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-base-content">Smart Shift Tasks</h2>
          </div>
          {tasks.length > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
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
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-xs sm:text-sm font-medium text-base-content break-words line-clamp-2">
                    {task.text}
                  </p>
                </div>
                {task.clinic_id?.name && (
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-base-100 text-primary font-bold border border-primary/10 rounded-lg truncate shrink-0 max-w-[80px] sm:max-w-none">
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
      
    </div> {/* End Right Column */}
  </div> {/* End Dashboard Grid */}

  {/* FABs */}


      {/* FABs - تحسين للموبايل */}
      {/* FABs - جنب بعض في الموبايل */}
      <div className="fixed bottom-18 right-4 sm:bottom-8 sm:right-6 flex flex-row gap-3 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLogSession(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          title="Add Session"
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
      <LogSessionModal 
        open={showLogSession || logSessionModalOpen} 
        onClose={() => {
          setShowLogSession(false);
          setLogSessionModalOpen(false);
          setLogSessionPatientId('');
          setLogSessionLinkedAptId('');
        }} 
        initialPatientId={logSessionPatientId}
        linkedAppointmentId={logSessionLinkedAptId}
      />
    </div>
  );
}
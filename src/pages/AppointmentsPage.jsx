import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarDays, Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAppointments,
  useCreateAppointment,
} from '../hooks/useAppointments';
import { useClinics } from '../hooks/useClinics';
import { useCreatePatient } from '../hooks/usePatients';
import AppointmentModal from '../components/AppointmentModal';
import Card from '../components/Card';
import '../styles/fullcalendar-overrides.css';

// ── Status dot color map ─────────────────────
const DOT_COLORS = {
  past: '#10B981', // Green
  future: '#3B82F6', // Blue
};

const CalendarSkeleton = () => (
  <div className="w-full space-y-4 animate-pulse p-4">
    <div className="grid grid-cols-7 gap-2 sm:gap-4">
      {/* Day headers */}
      {[...Array(7)].map((_, i) => (
        <div key={`h-${i}`} className="h-4 bg-base-300/50 rounded-full w-12 mx-auto"></div>
      ))}
      {/* Grid cells */}
      {[...Array(35)].map((_, i) => (
        <div key={i} className="aspect-square bg-base-200/50 rounded-xl border border-base-300/20 flex flex-col p-2 min-h-[80px] sm:min-h-[100px]">
          <div className="h-4 w-6 bg-base-300/50 rounded-md"></div>
          <div className="mt-auto flex gap-1 justify-center py-1">
            <div className="w-2 h-2 rounded-full bg-base-300/50"></div>
            <div className="w-2 h-2 rounded-full bg-base-300/50"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [clinicFilter, setClinicFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState('');
  const [defaultStartTime, setDefaultStartTime] = useState('09:00');
  const [defaultEndTime, setDefaultEndTime] = useState('09:30');
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Data
  const { data: appointments = [], isLoading, isFetching } = useAppointments(
    dateRange.start, dateRange.end, clinicFilter
  );
  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  // Mutations
  const createMutation = useCreateAppointment();
  const createPatientMutation = useCreatePatient();

  // ── Transform appointments into events based on view ──
  const events = useMemo(() => {
    if (currentView === 'dayGridMonth') {
      // Group appointments by date
      const byDate = {};
      appointments.forEach((apt) => {
        // Use substring to avoid timezone shift from `new Date()`
        const dateStr = apt.date.substring(0, 10);
        if (!byDate[dateStr]) byDate[dateStr] = [];
        byDate[dateStr].push(apt);
      });

      // Create one event per day showing count
      return Object.entries(byDate).map(([dateStr, apts]) => {
        const activeApts = apts.filter(a => a.status !== 'cancelled' && a.status !== 'no-show');
        return {
          id: `day-${dateStr}`,
          start: dateStr,
          allDay: true,
          display: 'background',
          backgroundColor: 'oklch(var(--p) / 0.08)',
          extendedProps: { count: activeApts.length, appointments: apts },
        };
      });
    } else {
      // For Week and Day views, show actual time blocks
      const now = new Date();
      const localTodayStr = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');

      return appointments
        .filter(a => a.status !== 'cancelled' && a.status !== 'no-show')
        .map(apt => {
          const dateStr = apt.date.substring(0, 10);
          const isPast = dateStr < localTodayStr || (dateStr === localTodayStr && apt.status === 'completed');
          
          return {
            id: apt._id,
            title: `${apt.patient_id?.name || 'Unknown Patient'} (${apt.type || 'Appt'})`,
            start: `${dateStr}T${apt.startTime}:00`,
            end: `${dateStr}T${apt.endTime}:00`,
            backgroundColor: isPast ? DOT_COLORS.past : DOT_COLORS.future,
            borderColor: isPast ? DOT_COLORS.past : DOT_COLORS.future,
            extendedProps: { isIndividual: true, appointment: apt }
          };
        });
    }
  }, [appointments, currentView]);

  // ── Day cell content — show appointment count dots ──
  const dayCellContent = useCallback((arg) => {
    if (arg.view.type !== 'dayGridMonth') return undefined; // Let FullCalendar handle defaults
    // Get local YYYY-MM-DD safely
    const localDateStr = [
      arg.date.getFullYear(),
      String(arg.date.getMonth() + 1).padStart(2, '0'),
      String(arg.date.getDate()).padStart(2, '0')
    ].join('-');
    
    // Group appointments by date safely
    const dayApts = appointments.filter(apt => apt.date.substring(0, 10) === localDateStr);
    const activeApts = dayApts.filter(a => a.status !== 'cancelled' && a.status !== 'no-show');

    // Today's local date for color logic
    const now = new Date();
    const localTodayStr = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');

    const isPast = localDateStr < localTodayStr;
    const dotColor = isPast ? DOT_COLORS.past : DOT_COLORS.future;

    return (
      <div className="flex flex-col items-center gap-1 w-full">
        <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>
        {activeApts.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {activeApts.length <= 3 ? (
              activeApts.map((apt, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              ))
            ) : (
              <>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
                <span className="text-[10px] font-bold" style={{ color: dotColor }}>+{activeApts.length - 2}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }, [appointments]);

  // ── Calendar callbacks ──────────────────────
  const handleDatesSet = useCallback((dateInfo) => {
    setDateRange({ start: dateInfo.startStr, end: dateInfo.endStr });
    setCurrentView(dateInfo.view.type);
  }, []);

  // Click on a day or time slot
  const handleDateClick = useCallback((info) => {
    if (currentView === 'dayGridMonth') {
      const dateStr = info.dateStr;
      navigate(`/appointments/day/${dateStr}`);
    } else {
      // Week/Day view: click an empty time slot to book
      const localDateStr = [
        info.date.getFullYear(),
        String(info.date.getMonth() + 1).padStart(2, '0'),
        String(info.date.getDate()).padStart(2, '0')
      ].join('-');
      
      const hours = String(info.date.getHours()).padStart(2, '0');
      const minutes = String(info.date.getMinutes()).padStart(2, '0');
      const startTimeStr = `${hours}:${minutes}`;

      const endDate = new Date(info.date.getTime() + 30 * 60000);
      const endHours = String(endDate.getHours()).padStart(2, '0');
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
      const endTimeStr = `${endHours}:${endMinutes}`;

      setDefaultDate(localDateStr);
      setDefaultStartTime(startTimeStr);
      setDefaultEndTime(endTimeStr);
      setModalOpen(true);
    }
  }, [navigate, currentView]);

  const handleEventClick = useCallback((info) => {
    if (info.event.extendedProps.isIndividual) {
      const apt = info.event.extendedProps.appointment;
      const dateStr = apt.date.substring(0, 10);
      navigate(`/appointments/day/${dateStr}`);
    }
  }, [navigate]);

  // ── Modal handlers ──────────────────────────
  const handleSubmit = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Appointment booked');
        setModalOpen(false);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || 'Failed to book');
      },
    });
  };

  const handleCreatePatient = (patientData, callback) => {
    const payload = { name: patientData.name };
    if (patientData.phone) payload.phone = patientData.phone;
    if (patientData.clinic_id) payload.clinic_id = patientData.clinic_id;

    createPatientMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success(`Patient "${created.name}" created`);
        callback(created);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to create patient'),
    });
  };

  const openNewModal = () => {
    setDefaultDate(new Date().toISOString().split('T')[0]);
    setDefaultStartTime('09:00');
    setDefaultEndTime('09:30');
    setModalOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content flex items-center gap-2">
            <CalendarDays size={24} className="text-primary" />
            Appointments
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Tap any day to see details · Your scheduling overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {clinics.length > 1 && (
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              className="select select-bordered select-sm text-sm min-w-[140px]"
            >
              <option value="">All Clinics</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}

          <button onClick={openNewModal} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> New Appointment
          </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DOT_COLORS.past }} />
          <span className="text-xs font-medium text-base-content/60">Past Appointments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DOT_COLORS.future }} />
          <span className="text-xs font-medium text-base-content/60">Upcoming Appointments</span>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-3 sm:p-5 overflow-hidden relative min-h-[400px]">
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <>
              {/* Subtle Pulse Overlay for navigation fetches */}
              {isFetching && (
                <div className="absolute inset-0 bg-base-100/10 backdrop-blur-[1px] z-10 rounded-box animate-pulse pointer-events-none" />
              )}
              
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                dayCellContent={dayCellContent}
                height="auto"
                firstDay={6}
                dayMaxEvents={0}
                fixedWeekCount={false}
                slotMinTime="08:00:00"
                slotMaxTime="23:00:00"
                allDaySlot={false}
              />
            </>
          )}
        </Card>
      </motion.div>

      {/* Booking Modal */}
      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultDate={defaultDate}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
        isSubmitting={createMutation.isPending}
        onCreatePatient={handleCreatePatient}
      />
    </div>
  );
}

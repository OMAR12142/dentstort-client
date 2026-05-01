import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointmentsApi,
  getTodaysAppointmentsApi,
  getPatientAppointmentsApi,
  createAppointmentApi,
  updateAppointmentApi,
  updateAppointmentStatusApi,
  deleteAppointmentApi,
} from '../api/appointments';

/**
 * Fetch appointments for a date range (powers FullCalendar).
 */
export const useAppointments = (start, end, clinicId) =>
  useQuery({
    queryKey: ['appointments', start, end, clinicId],
    queryFn: () => getAppointmentsApi({ start, end, clinicId }),
    enabled: !!start && !!end,
  });

/**
 * Fetch today's appointments (Dashboard widget).
 */
export const useTodaysAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: getTodaysAppointmentsApi,
  });

/**
 * Fetch upcoming appointments for a specific patient.
 */
export const usePatientAppointments = (patientId) =>
  useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: () => getPatientAppointmentsApi(patientId),
    enabled: !!patientId,
  });

/**
 * Create a new appointment.
 */
export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAppointmentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * Update an appointment (reschedule, edit details).
 */
export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppointmentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * Quick status toggle for an appointment.
 */
export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppointmentStatusApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

/**
 * Delete an appointment.
 */
export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointmentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

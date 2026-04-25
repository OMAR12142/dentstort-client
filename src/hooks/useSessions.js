import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessionsByPatientApi,
  getUpcomingAppointmentsApi,
  createSessionApi,
  updateSessionApi,
  deleteSessionApi,
} from '../api/sessions';

export const useSessions = (patientId, page = 1, limit = 10) =>
  useQuery({
    queryKey: ['sessions', patientId, page, limit],
    queryFn: () => getSessionsByPatientApi(patientId, page, limit),
    enabled: !!patientId,
  });

export const useUpcomingAppointments = () =>
  useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: getUpcomingAppointmentsApi,
  });

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSessionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useUpdateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSessionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSessionApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPatientsApi,
  getPatientByIdApi,
  createPatientApi,
  updatePatientApi,
  deletePatientApi,
} from '../api/patients';

export const usePatients = ({ page = 1, limit = 10, clinic_id = '', search = '', status = '', sortBy = '', dateFrom = '', dateTo = '' } = {}) =>
  useQuery({
    queryKey: ['patients', page, limit, clinic_id, search, status, sortBy, dateFrom, dateTo],
    queryFn: () => getPatientsApi({ page, limit, clinic_id, search, status, sortBy, dateFrom, dateTo }),
    placeholderData: (prev) => prev,
  });

export const usePatient = (id) =>
  useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientByIdApi(id),
    enabled: !!id,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePatientApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['patient'] });
    },
  });
};

export const useDeletePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePatientApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
    onError: (error) => {
      alert(error.response?.data?.message || error.message || 'Failed to delete patient');
      console.error('Delete Patient Error:', error);
    }
  });
};

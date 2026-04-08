import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinicsApi, createClinicApi, updateClinicApi, deleteClinicApi } from '../api/clinics';

export const useClinics = () =>
  useQuery({
    queryKey: ['clinics'],
    queryFn: getClinicsApi,
  });

export const useCreateClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClinicApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinics'] }),
  });
};

export const useUpdateClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateClinicApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinics'] }),
  });
};

export const useDeleteClinic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClinicApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clinics'] }),
  });
};

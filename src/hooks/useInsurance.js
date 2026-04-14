import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInsuranceProvidersApi,
  addInsuranceProviderApi,
  deleteInsuranceProviderApi,
  renameInsuranceProviderApi,
} from '../api/insurance';

export const useInsuranceProviders = () =>
  useQuery({
    queryKey: ['insuranceProviders'],
    queryFn: getInsuranceProvidersApi,
  });

export const useAddInsuranceProvider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addInsuranceProviderApi,
    onSuccess: (data) => {
      // Optimistic — set fresh data directly from the server response
      qc.setQueryData(['insuranceProviders'], data);
    },
  });
};

export const useDeleteInsuranceProvider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteInsuranceProviderApi,
    onSuccess: (data) => {
      qc.setQueryData(['insuranceProviders'], data);
    },
  });
};

export const useRenameInsuranceProvider = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: renameInsuranceProviderApi,
    onSuccess: (data) => {
      qc.setQueryData(['insuranceProviders'], data);
    },
  });
};

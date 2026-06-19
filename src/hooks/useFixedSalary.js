import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getFixedSalaries,
  createFixedSalary,
  updateFixedSalary,
  deleteFixedSalary,
} from '../api/fixedSalary';

// ── GET ──────────────────────────────────────────
export function useFixedSalaries() {
  return useQuery({
    queryKey: ['fixedSalaries'],
    queryFn: getFixedSalaries,
  });
}

// ── CREATE ───────────────────────────────────────
export function useCreateFixedSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFixedSalary,
    onSuccess: () => {
      toast.success('Fixed salary created successfully');
      queryClient.invalidateQueries({ queryKey: ['fixedSalaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create fixed salary');
    },
  });
}

// ── UPDATE ───────────────────────────────────────
export function useUpdateFixedSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFixedSalary,
    onSuccess: () => {
      toast.success('Fixed salary updated successfully');
      queryClient.invalidateQueries({ queryKey: ['fixedSalaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update fixed salary');
    },
  });
}

// ── DELETE ───────────────────────────────────────
export function useDeleteFixedSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFixedSalary,
    onSuccess: () => {
      toast.success('Fixed salary removed');
      queryClient.invalidateQueries({ queryKey: ['fixedSalaries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete fixed salary');
    },
  });
}

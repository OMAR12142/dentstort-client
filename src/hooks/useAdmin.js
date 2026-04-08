import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStatsApi,
  getAdminDentistsApi,
  getRevenueStatsApi,
  getDentistProfileApi,
  toggleDentistStatusApi,
} from '../api/admin';

/**
 * Fetch platform-wide statistics (total dentists, sessions, insurance distribution).
 */
export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStatsApi,
  });

/**
 * Fetch platform revenue stats (global totals, monthly chart, leaderboard).
 */
export const useRevenueStats = () =>
  useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: getRevenueStatsApi,
  });

/**
 * Fetch all dentists with optional search filter.
 */
export const useAdminDentists = (search = '') =>
  useQuery({
    queryKey: ['admin', 'dentists', search],
    queryFn: () => getAdminDentistsApi(search),
    keepPreviousData: true,
  });

/**
 * Fetch a single dentist's full profile (drill-down).
 */
export const useDentistProfile = (id) =>
  useQuery({
    queryKey: ['admin', 'dentist', id],
    queryFn: () => getDentistProfileApi(id),
    enabled: !!id,
  });

/**
 * Toggle a dentist's status between 'active' and 'suspended'.
 */
export const useToggleDentistStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleDentistStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'dentists'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

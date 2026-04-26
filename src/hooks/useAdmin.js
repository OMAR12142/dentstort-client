import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminStatsApi,
  getAdminDentistsApi,
  getRevenueStatsApi,
  getDentistProfileApi,
  toggleDentistStatusApi,
  resetDentistPasswordApi,
  getAdminAnnouncementsApi,
  createAnnouncementApi,
  toggleAnnouncementApi,
  deleteAnnouncementApi,
  getActiveAnnouncementApi,
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
 * Fetch all dentists with optional search and pagination.
 */
export const useAdminDentists = (filters = {}) =>
  useQuery({
    queryKey: ['admin', 'dentists', filters],
    queryFn: () => getAdminDentistsApi(filters),
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

/**
 * Force a password reset for a dentist (generates new temporary password).
 */
export const useResetDentistPassword = () => {
  return useMutation({
    mutationFn: resetDentistPasswordApi,
  });
};

/**
 * Fetch all announcements for admin view.
 */
export const useAdminAnnouncements = () =>
  useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: getAdminAnnouncementsApi,
  });

/**
 * Create a new announcement.
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnouncementApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });
};

/**
 * Toggle announcement isActive state.
 */
export const useToggleAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleAnnouncementApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement', 'active'] });
    },
  });
};

/**
 * Delete an announcement.
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnouncementApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });
};

/**
 * Public/Auth: Get the single active announcement to show to the dentist.
 */
export const useActiveAnnouncement = () =>
  useQuery({
    queryKey: ['announcement', 'active'],
    queryFn: getActiveAnnouncementApi,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

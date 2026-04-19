import { useQuery } from '@tanstack/react-query';
import { getDashboardStatsApi, getMonthlyEarningsApi, getTreatmentDistributionApi, getEarningsHistoryApi } from '../api/analytics';

export const useDashboardStats = (timeframe = 'monthly') =>
  useQuery({
    queryKey: ['analytics', 'dashboard-stats', timeframe],
    queryFn: () => getDashboardStatsApi(timeframe),
  });

export const useMonthlyEarnings = () =>
  useQuery({
    queryKey: ['analytics', 'monthly-earnings'],
    queryFn: getMonthlyEarningsApi,
  });

export const useTreatmentDistribution = (filters = {}) =>
  useQuery({
    queryKey: ['analytics', 'treatment-distribution', filters],
    queryFn: () => getTreatmentDistributionApi(filters),
  });

export const useEarningsHistory = (filters = {}) =>
  useQuery({
    queryKey: ['analytics', 'earnings-history', filters],
    queryFn: () => getEarningsHistoryApi(filters),
  });

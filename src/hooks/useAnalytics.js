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

export const useTreatmentDistribution = () =>
  useQuery({
    queryKey: ['analytics', 'treatment-distribution'],
    queryFn: getTreatmentDistributionApi,
  });

export const useEarningsHistory = (year, month) =>
  useQuery({
    queryKey: ['analytics', 'earnings-history', year, month],
    queryFn: () => getEarningsHistoryApi(year, month),
  });

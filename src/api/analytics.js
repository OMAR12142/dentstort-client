import api from './axios';

export const getDashboardStatsApi = (timeframe = 'monthly') =>
  api.get('/api/analytics/dashboard-stats', { params: { timeframe } }).then((r) => r.data);

export const getMonthlyEarningsApi = () =>
  api.get('/api/analytics/monthly-earnings').then((r) => r.data);

export const getTreatmentDistributionApi = (filters = {}) =>
  api.get('/api/analytics/treatments', { params: filters }).then((r) => r.data);

export const getEarningsHistoryApi = (filters = {}) => {
  return api.get('/api/analytics/earnings-history', { params: filters }).then((r) => r.data);
};

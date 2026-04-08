import api from './axios';

export const getDashboardStatsApi = (timeframe = 'monthly') =>
  api.get('/api/analytics/dashboard-stats', { params: { timeframe } }).then((r) => r.data);

export const getMonthlyEarningsApi = () =>
  api.get('/api/analytics/monthly-earnings').then((r) => r.data);

export const getTreatmentDistributionApi = () =>
  api.get('/api/analytics/treatments').then((r) => r.data);

export const getEarningsHistoryApi = (year, month) => {
  const params = { year };
  if (month) params.month = month;
  return api.get('/api/analytics/earnings-history', { params }).then((r) => r.data);
};

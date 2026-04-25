import api from './axios';

// ── GET /api/admin/stats ──────────────────────
export const getAdminStatsApi = () =>
  api.get('/api/admin/stats').then((r) => r.data);

// ── GET /api/admin/revenue ────────────────────
export const getRevenueStatsApi = () =>
  api.get('/api/admin/revenue').then((r) => r.data);

// ── GET /api/admin/dentists?search=keyword&page=1&limit=10
export const getAdminDentistsApi = (filters = {}) =>
  api
    .get('/api/admin/dentists', { 
      params: { 
        search: filters.search || '',
        page: filters.page || 1,
        limit: filters.limit || 10
      } 
    })
    .then((r) => r.data);

// ── GET /api/admin/dentists/:id ───────────────
export const getDentistProfileApi = (id) =>
  api.get(`/api/admin/dentists/${id}`).then((r) => r.data);

// ── PATCH /api/admin/dentists/:id/status ──────
export const toggleDentistStatusApi = (id) =>
  api.patch(`/api/admin/dentists/${id}/status`).then((r) => r.data);

// ── POST /api/admin/dentists/:id/reset-password
export const resetDentistPasswordApi = (id) =>
  api.post(`/api/admin/dentists/${id}/reset-password`).then((r) => r.data);

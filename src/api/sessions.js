import api from './axios';

export const getSessionsByPatientApi = (patientId, page = 1, limit = 10) =>
  api.get(`/api/sessions`, { params: { patient_id: patientId, page, limit } }).then((r) => r.data);

export const getUpcomingAppointmentsApi = () =>
  api.get('/api/sessions/upcoming').then((r) => r.data);

export const createSessionApi = (formData) =>
  api
    .post('/api/sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const updateSessionApi = ({ id, formData }) =>
  api
    .put(`/api/sessions/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);

export const deleteSessionApi = (id) =>
  api.delete(`/api/sessions/${id}`).then((r) => r.data);

export const getSessionsByDateApi = (date) =>
  api.get('/api/sessions/by-date', { params: { date } }).then((r) => r.data);

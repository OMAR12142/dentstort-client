import api from './axios';

// ── GET /api/appointments?start=...&end=...&clinic_id=...
export const getAppointmentsApi = ({ start, end, clinicId }) =>
  api.get('/api/appointments', { params: { start, end, clinic_id: clinicId || '' } }).then((r) => r.data);

// ── GET /api/appointments/today
export const getTodaysAppointmentsApi = () =>
  api.get('/api/appointments/today').then((r) => r.data);

// ── GET /api/appointments/patient/:patientId
export const getPatientAppointmentsApi = (patientId) =>
  api.get(`/api/appointments/patient/${patientId}`).then((r) => r.data);

// ── POST /api/appointments
export const createAppointmentApi = (data) =>
  api.post('/api/appointments', data).then((r) => r.data);

// ── PUT /api/appointments/:id
export const updateAppointmentApi = ({ id, ...data }) =>
  api.put(`/api/appointments/${id}`, data).then((r) => r.data);

// ── PATCH /api/appointments/:id/status
export const updateAppointmentStatusApi = ({ id, status }) =>
  api.patch(`/api/appointments/${id}/status`, { status }).then((r) => r.data);

// ── DELETE /api/appointments/:id
export const deleteAppointmentApi = (id) =>
  api.delete(`/api/appointments/${id}`).then((r) => r.data);

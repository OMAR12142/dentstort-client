import api from './axios';

export const getClinicsApi = () =>
  api.get('/api/clinics').then((r) => r.data);

export const createClinicApi = (data) =>
  api.post('/api/clinics', data).then((r) => r.data);

export const updateClinicApi = ({ id, ...data }) =>
  api.put(`/api/clinics/${id}`, data).then((r) => r.data);

export const deleteClinicApi = (id) =>
  api.delete(`/api/clinics/${id}`).then((r) => r.data);

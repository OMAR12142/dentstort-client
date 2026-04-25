import api from './axios';

export const getPatientsApi = ({ page = 1, limit = 10, clinic_id = '', search = '', status = '', sortBy = '', dateFrom = '', dateTo = '' } = {}) => {
  const params = { page, limit };
  if (clinic_id) params.clinic_id = clinic_id;
  if (search) params.search = search;
  if (status) params.status = status;
  if (sortBy) params.sortBy = sortBy;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  return api.get('/api/patients', { params }).then((r) => r.data);
};

export const getPatientByIdApi = (id) =>
  api.get(`/api/patients/${id}`).then((r) => r.data);

export const createPatientApi = (data) =>
  api.post('/api/patients', data).then((r) => r.data);

export const updatePatientApi = ({ id, data }) =>
  api.put(`/api/patients/${id}`, data).then((r) => r.data);

export const deletePatientApi = (id) =>
  api.delete(`/api/patients/${id}`).then((r) => r.data);

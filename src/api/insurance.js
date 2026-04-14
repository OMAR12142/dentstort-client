import api from './axios';

export const getInsuranceProvidersApi = () =>
  api.get('/api/insurance').then((r) => r.data);

export const addInsuranceProviderApi = (name) =>
  api.post('/api/insurance', { name }).then((r) => r.data);

export const deleteInsuranceProviderApi = (name) =>
  api.delete(`/api/insurance/${encodeURIComponent(name)}`).then((r) => r.data);

export const renameInsuranceProviderApi = ({ oldName, newName }) =>
  api.put(`/api/insurance/${encodeURIComponent(oldName)}`, { newName }).then((r) => r.data);

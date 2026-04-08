import api from './axios';

export const loginApi = (credentials) =>
  api.post('/api/auth/login', credentials).then((r) => r.data);

export const registerApi = (data) =>
  api.post('/api/auth/register', data).then((r) => r.data);

export const refreshApi = () =>
  api.post('/api/auth/refresh').then((r) => r.data);

export const logoutApi = () =>
  api.post('/api/auth/logout').then((r) => r.data);

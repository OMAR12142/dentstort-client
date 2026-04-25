import api from './axios';

export const loginApi = (credentials) =>
  api.post('/api/auth/login', credentials).then((r) => r.data);

export const registerApi = (data) =>
  api.post('/api/auth/register', data).then((r) => r.data);

export const refreshApi = () =>
  api.post('/api/auth/refresh').then((r) => r.data);

export const logoutApi = () =>
  api.post('/api/auth/logout').then((r) => r.data);

export const updateProfileApi = (data) =>
  api.put('/api/auth/profile', data).then((r) => r.data);

export const updatePasswordApi = (data) =>
  api.put('/api/auth/password', data).then((r) => r.data);

export const uploadPhotoApi = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/api/auth/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

export const removePhotoApi = () =>
  api.delete('/api/auth/photo').then((r) => r.data);

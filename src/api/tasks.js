import api from './axios';

export const getTasksApi = () =>
  api.get('/api/tasks').then((r) => r.data);

export const createTaskApi = (taskData) =>
  api.post('/api/tasks', taskData).then((r) => r.data);

export const toggleTaskApi = (taskId) =>
  api.patch(`/api/tasks/${taskId}`).then((r) => r.data);

export const updateTaskApi = (taskId, taskData) =>
  api.put(`/api/tasks/${taskId}`, taskData).then((r) => r.data);

export const deleteTaskApi = (taskId) =>
  api.delete(`/api/tasks/${taskId}`).then((r) => r.data);

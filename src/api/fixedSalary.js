import api from './axios';

export const getFixedSalaries = async () => {
  const { data } = await api.get('/api/fixed-salaries');
  return data;
};

export const createFixedSalary = async (salaryData) => {
  const { data } = await api.post('/api/fixed-salaries', salaryData);
  return data;
};

export const updateFixedSalary = async ({ id, data }) => {
  const response = await api.put(`/api/fixed-salaries/${id}`, data);
  return response.data;
};

export const deleteFixedSalary = async (id) => {
  const { data } = await api.delete(`/api/fixed-salaries/${id}`);
  return data;
};

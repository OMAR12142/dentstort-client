import api from './axios';

export const getExpenses = async (params = {}) => {
  const { data } = await api.get('/api/expenses', { params });
  return data;
};

export const getExpenseSummary = async (params = {}) => {
  const { data } = await api.get('/api/expenses/summary', { params });
  return data;
};

export const createExpense = async (expenseData) => {
  const { data } = await api.post('/api/expenses', expenseData);
  return data;
};

export const updateExpense = async ({ id, data: expenseData }) => {
  const { data } = await api.put(`/api/expenses/${id}`, expenseData);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await api.delete(`/api/expenses/${id}`);
  return data;
};

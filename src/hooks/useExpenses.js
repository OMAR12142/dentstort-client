import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../api/expenses';

// ── GET Expenses (paginated + filtered) ──────
export function useExpenses(filters = {}) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => getExpenses(filters),
    keepPreviousData: true,
  });
}

// ── GET Expense Summary ──────────────────────
export function useExpenseSummary(timeframe = 'monthly', clinicId) {
  return useQuery({
    queryKey: ['expenseSummary', timeframe, clinicId],
    queryFn: () =>
      getExpenseSummary({
        timeframe,
        ...(clinicId ? { clinic_id: clinicId } : {}),
      }),
  });
}

// ── CREATE ───────────────────────────────────
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      toast.success('expense was successfully added.');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['earningsHistory'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || ' error in adding The expense .');
    },
  });
}

// ── UPDATE ───────────────────────────────────
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      toast.success('expense was updated added');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['earningsHistory'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'expense updated failed');
    },
  });
}

// ── DELETE (soft) ────────────────────────────
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      toast.success(' expense was deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['earningsHistory'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || ' expense delete failed');
    },
  });
}

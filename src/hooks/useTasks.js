import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasksApi,
  createTaskApi,
  toggleTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '../api/tasks';

export const useTasks = () =>
  useQuery({
    queryKey: ['tasks'],
    queryFn: getTasksApi,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useToggleTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleTaskApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, taskData }) => updateTaskApi(taskId, taskData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

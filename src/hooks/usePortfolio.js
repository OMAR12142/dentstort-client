import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import axios from 'axios';

// ════════════════════════════════════════════════
// PUBLIC HOOKS (No auth required)
// ════════════════════════════════════════════════

/**
 * Fetch a public portfolio by slug.
 * Uses raw axios (no auth interceptor) for truly public access.
 */
export function usePublicPortfolio(slug, page = 1, limit = 12) {
  return useQuery({
    queryKey: ['publicPortfolio', slug, page, limit],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/portfolio/${slug}?page=${page}&limit=${limit}`
      );
      return data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch a single public case by slug + caseId.
 */
export function usePublicCase(slug, caseId) {
  return useQuery({
    queryKey: ['publicCase', slug, caseId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/portfolio/${slug}/case/${caseId}`
      );
      return data;
    },
    enabled: !!slug && !!caseId,
    staleTime: 1000 * 60 * 5,
  });
}

// ════════════════════════════════════════════════
// PROTECTED HOOKS (Auth required)
// ════════════════════════════════════════════════

/**
 * Fetch the current dentist's own portfolio.
 */
export function useMyPortfolio(page = 1, limit = 12) {
  return useQuery({
    queryKey: ['myPortfolio', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/portfolio/me/portfolio?page=${page}&limit=${limit}`);
      return data;
    },
  });
}

/**
 * Create a new portfolio.
 */
export function useCreatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const { data } = await api.post('/api/portfolio/me/portfolio', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Update portfolio bio/services/contact.
 */
export function useUpdatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const { data } = await api.put('/api/portfolio/me/portfolio', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Toggle portfolio publish/draft.
 */
export function useTogglePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put('/api/portfolio/me/portfolio/toggle');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Publish a new case to the portfolio.
 */
export function usePublishCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const { data } = await api.post('/api/portfolio/me/portfolio/cases', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Edit a published case.
 */
export function useEditCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, ...body }) => {
      const { data } = await api.put(`/api/portfolio/me/portfolio/cases/${caseId}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Delete (unpublish) a case.
 */
export function useDeleteCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (caseId) => {
      const { data } = await api.delete(`/api/portfolio/me/portfolio/cases/${caseId}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Reorder a case (up/down).
 */
export function useReorderCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, direction }) => {
      const { data } = await api.put(`/api/portfolio/me/portfolio/cases/${caseId}/reorder`, { direction });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['myPortfolio'] }),
  });
}

/**
 * Get the dentist's media library (all session images).
 */
export function useMediaLibrary() {
  return useQuery({
    queryKey: ['mediaLibrary'],
    queryFn: async () => {
      const { data } = await api.get('/api/portfolio/me/media-library');
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

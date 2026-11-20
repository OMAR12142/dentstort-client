import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const getDentistId = (user) => user?._id || user?.id || null;

const invalidateOwnPortfolio = (qc, initiatingDentistId) => {
  const currentDentistId = getDentistId(useAuthStore.getState().user);
  if (initiatingDentistId && initiatingDentistId === currentDentistId) {
    qc.invalidateQueries({ queryKey: ['myPortfolio', initiatingDentistId] });
  }
};

// ════════════════════════════════════════════════
// PUBLIC HOOKS (No auth required)
// ════════════════════════════════════════════════

/**
 * Fetch a public portfolio by slug.
 * Uses raw axios (no auth interceptor) for truly public access.
 */
export function usePublicPortfolio(slug, page = 1, limit = 12, treatmentType = 'All') {
  return useQuery({
    queryKey: ['publicPortfolio', slug, page, limit, treatmentType],
    queryFn: async () => {
      const envUrl = import.meta.env.VITE_API_URL;
      const baseUrl = (!envUrl || envUrl === 'undefined' || envUrl === '/') ? '' : envUrl.replace(/\/+$/, '');
      let url = `${baseUrl}/api/portfolio/${slug}?page=${page}&limit=${limit}`;
      if (treatmentType && treatmentType !== 'All') {
        url += `&treatmentType=${encodeURIComponent(treatmentType)}`;
      }
      const token = useAuthStore.getState().accessToken;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const { data } = await axios.get(url, config);
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
      const envUrl = import.meta.env.VITE_API_URL;
      const baseUrl = (!envUrl || envUrl === 'undefined' || envUrl === '/') ? '' : envUrl.replace(/\/+$/, '');
      const token = useAuthStore.getState().accessToken;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
      const { data } = await axios.get(
        `${baseUrl}/api/portfolio/${slug}/case/${caseId}`,
        config
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
 * Fetch the current dentist's own portfolio with optional category filtering.
 */
export function useMyPortfolio(page = 1, limit = 12, category = '') {
  const dentistId = useAuthStore((s) => getDentistId(s.user));
  const normalizedCategory = category && category !== 'all' && category !== 'All' ? category.trim() : '';
  const queryKey = normalizedCategory
    ? ['myPortfolio', dentistId, page, limit, normalizedCategory]
    : ['myPortfolio', dentistId, page, limit];

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      let url = `/api/portfolio/me/portfolio?page=${page}&limit=${limit}`;
      if (normalizedCategory) {
        url += `&category=${encodeURIComponent(normalizedCategory)}`;
      }
      const { data } = await api.get(url, { signal });
      return data;
    },
    enabled: !!dentistId,
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => invalidateOwnPortfolio(qc, context?.dentistId),
  });
}

/**
 * Update portfolio bio/services/contact/coverTheme/coverPhoto.
 */
export function useUpdatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body) => {
      const { data } = await api.put('/api/portfolio/me/portfolio', body);
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Update granular per-field public visibility controls.
 */
export function useUpdateVisibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (visibility) => {
      const { data } = await api.patch('/api/portfolio/me/visibility', { visibility });
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Upload a custom profile cover photo for the dentist's portfolio.
 */
export function useUploadPortfolioCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cover', file);
      const { data } = await api.post('/api/portfolio/me/portfolio/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Upload doctor CV (PDF) for portfolio.
 */
export function useUploadPortfolioCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cv', file);
      const { data } = await api.post('/api/portfolio/me/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['myPortfolio'] });
      qc.invalidateQueries({ queryKey: ['my-portfolio'] });
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
      qc.invalidateQueries({ queryKey: ['public-portfolio'] });
    },
  });
}

/**
 * Delete doctor CV from portfolio.
 */
export function useDeletePortfolioCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/api/portfolio/me/cv');
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['myPortfolio'] });
      qc.invalidateQueries({ queryKey: ['my-portfolio'] });
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
      qc.invalidateQueries({ queryKey: ['public-portfolio'] });
    },
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
      qc.invalidateQueries({ queryKey: ['publicCase'] });
    },
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => invalidateOwnPortfolio(qc, context?.dentistId),
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => invalidateOwnPortfolio(qc, context?.dentistId),
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => invalidateOwnPortfolio(qc, context?.dentistId),
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
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Pin / unpin (toggle featured) for a case.
 */
export function useToggleFeaturedCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, isFeatured }) => {
      const payload = typeof isFeatured === 'boolean' ? { isFeatured } : {};
      const { data } = await api.patch(`/api/portfolio/me/portfolio/cases/${caseId}/featured`, payload);
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Move a case directly to a specific 1-based global position.
 */
export function useMoveCasePosition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ caseId, position }) => {
      const { data } = await api.patch(`/api/portfolio/me/portfolio/cases/${caseId}/position`, { position });
      return data;
    },
    onMutate: () => ({ dentistId: getDentistId(useAuthStore.getState().user) }),
    onSuccess: (_data, _vars, context) => {
      invalidateOwnPortfolio(qc, context?.dentistId);
      qc.invalidateQueries({ queryKey: ['publicPortfolio'] });
    },
  });
}

/**
 * Upload images directly from the dentist's device for a portfolio case.
 * Accepts an array of File objects (up to 8 images, JPG/PNG/WebP, max 5 MB each).
 */
export function useUploadPortfolioImages() {
  return useMutation({
    mutationFn: async (files) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      const { data } = await api.post('/api/portfolio/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
  });
}

/**
 * Get the dentist's media library (all session images).
 */
export function useMediaLibrary() {
  const dentistId = useAuthStore((s) => getDentistId(s.user));
  return useQuery({
    queryKey: ['mediaLibrary', dentistId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/api/portfolio/me/media-library', { signal });
      return data;
    },
    enabled: !!dentistId,
    staleTime: 1000 * 60 * 2,
  });
}

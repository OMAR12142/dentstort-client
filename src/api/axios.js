import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const envUrl = import.meta.env?.VITE_API_URL;
const safeBaseUrl = (!envUrl || envUrl === 'undefined' || envUrl === '/') ? '' : envUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: safeBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──
api.interceptors.request.use((config) => {
  const { accessToken, authSessionVersion } = useAuthStore.getState();
  config._authSessionVersion = authSessionVersion;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─
let isRefreshing = false;
let refreshingSessionVersion = null;
let failedQueue = [];

const processQueue = (error, token = null, targetVersion = null) => {
  const remaining = [];
  failedQueue.forEach((entry) => {
    if (targetVersion === null || entry.sessionVersion === targetVersion) {
      if (error) entry.reject(error);
      else entry.resolve(token);
    } else {
      remaining.push(entry);
    }
  });
  failedQueue = remaining;
};

api.interceptors.response.use(
  (response) => {
    const requestVersion = response.config?._authSessionVersion;
    const currentVersion = useAuthStore.getState().authSessionVersion;
    if (requestVersion !== undefined && requestVersion !== currentVersion) {
      return Promise.reject(
        new axios.CanceledError('Request discarded due to authentication session change')
      );
    }
    return response;
  },
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const requestVersion = originalRequest?._authSessionVersion;
    const currentVersion = useAuthStore.getState().authSessionVersion;

    // Discard errors from requests started under a previous auth identity
    if (requestVersion !== undefined && requestVersion !== currentVersion) {
      return Promise.reject(
        new axios.CanceledError('Error discarded due to authentication session change')
      );
    }

    // ── Kill Switch: catch suspended accounts globally ──
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === 'ACCOUNT_SUSPENDED'
    ) {
      // Clear all auth state
      useAuthStore.getState().logout();
      // Force hard redirect (works outside React tree)
      window.location.href = '/suspended';
      return Promise.reject(error);
    }

    // ── Rate Limit Handler ──
    if (error.response?.status === 429) {
      alert('Too many requests. Please wait a moment before trying again.');
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      if (isRefreshing && refreshingSessionVersion === requestVersion) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, sessionVersion: requestVersion });
        }).then((token) => {
          if (useAuthStore.getState().authSessionVersion !== requestVersion) {
            return Promise.reject(
              new axios.CanceledError('Auth session changed while waiting for token refresh')
            );
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshingSessionVersion = requestVersion;

      try {
        const envUrl = import.meta.env?.VITE_API_URL;
        const baseUrl = (!envUrl || envUrl === 'undefined' || envUrl === '/') ? '' : envUrl.replace(/\/+$/, '');
        const { data } = await axios.post(
          `${baseUrl}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (useAuthStore.getState().authSessionVersion !== requestVersion) {
          const cancelErr = new axios.CanceledError('Auth session changed during token refresh');
          processQueue(cancelErr, null, requestVersion);
          return Promise.reject(cancelErr);
        }

        const newToken = data.accessToken;
        useAuthStore.getState().setToken(newToken);

        // Keep role in sync after silent refresh (e.g. admin promotion)
        if (data.role) {
          const currentUser = useAuthStore.getState().user;
          if (currentUser && currentUser.role !== data.role) {
            const updatedUser = { ...currentUser, role: data.role };
            localStorage.setItem('gd_user', JSON.stringify(updatedUser));
            useAuthStore.setState({ user: updatedUser });
          }
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken, requestVersion);

        return api(originalRequest);
      } catch (refreshError) {
        if (useAuthStore.getState().authSessionVersion !== requestVersion) {
          const cancelErr = new axios.CanceledError('Auth session changed during token refresh');
          processQueue(cancelErr, null, requestVersion);
          return Promise.reject(cancelErr);
        }
        processQueue(refreshError, null, requestVersion);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        if (refreshingSessionVersion === requestVersion) {
          isRefreshing = false;
          refreshingSessionVersion = null;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

import { create } from 'zustand';
import { clearUserQueryCache } from '../api/queryClient';

const AUTH_STORAGE_KEYS = new Set([
  'gd_token',
  'gd_user',
  'gd_admin_token',
  'gd_admin_user',
]);

const getOnboardingStorageKey = (userId) => {
  if (!userId) return 'dentstory_onboarding_status';
  return `dentstory_onboarding_status:${userId}`;
};

const safeParseStoredUser = (key = 'gd_user') => {
  if (typeof localStorage === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const getUserIdentityKey = (user) =>
  user?._id || user?.id || user?.email || null;

export const useAuthStore = create((set) => ({
  user: safeParseStoredUser('gd_user'),
  accessToken:
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('gd_token') || null
      : null,
  isShadowMode:
    typeof localStorage !== 'undefined'
      ? !!localStorage.getItem('gd_admin_token')
      : false,
  authSessionVersion: 0,

  setAuth: (user, accessToken, isShadow = false) => {
    if (isShadow) {
      if (!localStorage.getItem('gd_admin_token')) {
        // Store current admin before switching
        const currentUser = safeParseStoredUser('gd_user');
        const currentToken = localStorage.getItem('gd_token');
        if (currentUser && currentToken) {
          localStorage.setItem('gd_admin_user', JSON.stringify(currentUser));
          localStorage.setItem('gd_admin_token', currentToken);
        }
      }
    } else {
      // Normal authentication always clears any leftover shadow session state
      localStorage.removeItem('gd_admin_user');
      localStorage.removeItem('gd_admin_token');
    }

    localStorage.setItem('gd_user', JSON.stringify(user));
    localStorage.setItem('gd_token', accessToken);
    set((state) => ({
      user,
      accessToken,
      isShadowMode: Boolean(isShadow),
      authSessionVersion: state.authSessionVersion + 1,
    }));
    clearUserQueryCache();
  },

  setToken: (accessToken) => {
    localStorage.setItem('gd_token', accessToken);
    set({ accessToken });
  },

  updateUser: (user) => {
    localStorage.setItem('gd_user', JSON.stringify(user));
    set({ user });
  },

  exitShadowMode: () => {
    const adminUser = safeParseStoredUser('gd_admin_user');
    const adminToken = localStorage.getItem('gd_admin_token');

    if (adminUser && adminToken) {
      localStorage.setItem('gd_user', JSON.stringify(adminUser));
      localStorage.setItem('gd_token', adminToken);
      localStorage.removeItem('gd_admin_user');
      localStorage.removeItem('gd_admin_token');
      set((state) => ({
        user: adminUser,
        accessToken: adminToken,
        isShadowMode: false,
        authSessionVersion: state.authSessionVersion + 1,
      }));
      clearUserQueryCache();
      return true;
    }
    return false;
  },

  logout: () => {
    const currentUser = safeParseStoredUser('gd_user');
    const currentUserId = getUserIdentityKey(currentUser);

    if (currentUserId) {
      localStorage.removeItem(getOnboardingStorageKey(currentUserId));
    }

    localStorage.removeItem('gd_user');
    localStorage.removeItem('gd_token');
    localStorage.removeItem('gd_admin_user');
    localStorage.removeItem('gd_admin_token');
    set((state) => ({
      user: null,
      accessToken: null,
      isShadowMode: false,
      authSessionVersion: state.authSessionVersion + 1,
    }));
    clearUserQueryCache();
  },
}));

/**
 * Synchronize auth state and clear stale user-scoped query cache when
 * authentication keys change in another browser tab.
 */
export function syncAuthFromStorage(event) {
  if (event && event.key !== null && !AUTH_STORAGE_KEYS.has(event.key)) {
    return;
  }

  const prev = useAuthStore.getState();
  const nextUser = safeParseStoredUser('gd_user');
  const nextToken =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('gd_token') || null
      : null;
  const nextShadowMode =
    typeof localStorage !== 'undefined'
      ? !!localStorage.getItem('gd_admin_token')
      : false;

  const identityChanged =
    getUserIdentityKey(prev.user) !== getUserIdentityKey(nextUser);
  const tokenChanged = prev.accessToken !== nextToken;
  const shadowChanged = prev.isShadowMode !== nextShadowMode;
  const userChanged = JSON.stringify(prev.user) !== JSON.stringify(nextUser);

  if (!identityChanged && !tokenChanged && !shadowChanged && !userChanged) {
    return;
  }

  const sessionChanged = identityChanged || tokenChanged || shadowChanged;

  useAuthStore.setState((state) => ({
    user: nextUser,
    accessToken: nextToken,
    isShadowMode: nextShadowMode,
    authSessionVersion: sessionChanged
      ? state.authSessionVersion + 1
      : state.authSessionVersion,
  }));

  if (sessionChanged) {
    clearUserQueryCache();
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', syncAuthFromStorage);
}

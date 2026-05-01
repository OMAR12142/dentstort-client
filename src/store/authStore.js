import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('gd_user') || 'null'),
  accessToken: localStorage.getItem('gd_token') || null,
  isShadowMode: !!localStorage.getItem('gd_admin_token'),

  setAuth: (user, accessToken, isShadow = false) => {
    if (isShadow) {
      // Store current admin before switching
      const currentUser = JSON.parse(localStorage.getItem('gd_user'));
      const currentToken = localStorage.getItem('gd_token');
      localStorage.setItem('gd_admin_user', JSON.stringify(currentUser));
      localStorage.setItem('gd_admin_token', currentToken);
      set({ isShadowMode: true });
    }
    
    localStorage.setItem('gd_user', JSON.stringify(user));
    localStorage.setItem('gd_token', accessToken);
    set({ user, accessToken });
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
    const adminUser = JSON.parse(localStorage.getItem('gd_admin_user'));
    const adminToken = localStorage.getItem('gd_admin_token');
    
    if (adminUser && adminToken) {
      localStorage.setItem('gd_user', JSON.stringify(adminUser));
      localStorage.setItem('gd_token', adminToken);
      localStorage.removeItem('gd_admin_user');
      localStorage.removeItem('gd_admin_token');
      set({ user: adminUser, accessToken: adminToken, isShadowMode: false });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('gd_user');
    localStorage.removeItem('gd_token');
    localStorage.removeItem('gd_admin_user');
    localStorage.removeItem('gd_admin_token');
    set({ user: null, accessToken: null, isShadowMode: false });
  },
}));

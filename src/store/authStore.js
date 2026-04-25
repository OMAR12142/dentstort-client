import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('gd_user') || 'null'),
  accessToken: localStorage.getItem('gd_token') || null,

  setAuth: (user, accessToken) => {
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

  logout: () => {
    localStorage.removeItem('gd_user');
    localStorage.removeItem('gd_token');
    set({ user: null, accessToken: null });
  },
}));

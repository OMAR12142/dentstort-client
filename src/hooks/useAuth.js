import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi, logoutApi, updateProfileApi, updatePasswordApi, uploadPhotoApi, removePhotoApi, googleLoginApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const { accessToken, ...user } = data;
      setAuth(user, accessToken);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    },
  });
};

export const useGoogleLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: googleLoginApi,
    onSuccess: (data) => {
      const { accessToken, ...user } = data;
      setAuth(user, accessToken);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      const { accessToken, ...user } = data;
      setAuth(user, accessToken);
      navigate('/dashboard');
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });
};

export const useUpdateProfile = () => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: updatePasswordApi,
  });
};

export const useUploadPhoto = () => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPhotoApi,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useRemovePhoto = () => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePhotoApi,
    onSuccess: () => {
      const currentUser = useAuthStore.getState().user;
      updateUser({ ...currentUser, profilePhoto: { url: '', publicId: '' } });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};


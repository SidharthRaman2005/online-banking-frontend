import api from './api';

export const userService = {
  dashboard: () => api.get('/user/dashboard'),
  profile: () => api.get('/user/profile'),
  updateProfile: (payload) => api.put('/user/profile', payload),
  changePassword: (payload) => api.put('/user/change-password', payload),
};

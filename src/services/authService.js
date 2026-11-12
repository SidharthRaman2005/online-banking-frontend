import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  verifyGoogle: (credential) => api.post('/auth/google/verify', { credential }),
};

import api from './api';

export const upiService = {
  me: () => api.get('/upi/me'),
  resolve: (upiId) => api.get('/upi/resolve', { params: { upiId } }),
};

import api from './api';

export const adminService = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  accounts: (params) => api.get('/admin/accounts', { params }),
  transactions: (params) => api.get('/admin/transactions', { params }),
};

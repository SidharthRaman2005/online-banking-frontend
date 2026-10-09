import api from './api';

export const transactionService = {
  deposit: (payload) => api.post('/transactions/deposit', payload),
  withdraw: (payload) => api.post('/transactions/withdraw', payload),
  transfer: (payload) => api.post('/transactions/transfer', payload),
  history: (params) => api.get('/transactions', { params }),
  byReference: (reference) => api.get(`/transactions/${reference}`),
};

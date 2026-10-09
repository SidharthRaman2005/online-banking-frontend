import api from './api';

export const notificationService = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  remove: (id) => api.delete(`/notifications/${id}`),
};

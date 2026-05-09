import api from './api';

class NotificationService {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }

  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async sendTestNotification() {
    const response = await api.post('/notifications/test');
    return response.data;
  }
}

export default new NotificationService();

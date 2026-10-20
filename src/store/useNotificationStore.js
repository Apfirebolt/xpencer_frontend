import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetching: false,
  error: null,

  // Fetch all notifications for the authenticated user
  fetchNotifications: async () => {
    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get('/notifications', getAuthHeaders());
      set({ 
        notifications: res.data.notifications || [], 
        unreadCount: res.data.unreadCount || 0,
        fetching: false 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch notifications.";
      console.error("Failed to fetch notifications:", err);
      set({ fetching: false, error: errorMsg });
    }
  },

  // Mark a specific notification as read
  markAsRead: async (id) => {
    try {
      await httpClient.put(`/notifications/${id}/read`, {}, getAuthHeaders());
      set((state) => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await httpClient.put('/notifications/read-all', {}, getAuthHeaders());
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  },

  // Delete a notification by ID
  deleteNotification: async (id) => {
    try {
      await httpClient.delete(`/notifications/${id}`, getAuthHeaders());
      set((state) => {
        const target = state.notifications.find(n => n._id === id);
        const wasUnread = target && !target.isRead;
        return {
          notifications: state.notifications.filter(n => n._id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }
}));
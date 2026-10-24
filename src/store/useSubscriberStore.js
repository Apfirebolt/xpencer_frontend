import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useSubscriberStore = create((set) => ({
  subscribers: [],
  subscriber: null,
  loading: false,
  error: null,

  // Register a new newsletter subscriber
  subscribe: async (emailData) => {
    set({ loading: true, error: null });
    try {
      const payload = typeof emailData === 'string' ? { email: emailData } : emailData;
      const res = await httpClient.post('/subscribers', payload);
      const data = res.data;

      set({ 
        subscriber: data.subscriber || data, 
        loading: false 
      });
      return { success: true, message: data.message || "Successfully subscribed to the newsletter!" };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to subscribe.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (emailData) => {
    set({ loading: true, error: null });
    try {
      const payload = typeof emailData === 'string' ? { email: emailData } : emailData;
      const res = await httpClient.post('/subscribers/unsubscribe', payload);
      const data = res.data;

      set({ loading: false });
      return { success: true, message: data.message || "Successfully unsubscribed from the newsletter." };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to unsubscribe.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Fetch all subscribers (Admin only)
  fetchSubscribers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.get('/subscribers', getAuthHeaders());
      const data = res.data;

      set({ 
        subscribers: data.subscribers || data, 
        loading: false 
      });
      return { success: true, data: data.subscribers || data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch subscribers.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Clear errors or state if needed
  clearSubscriberError: () => set({ error: null }),
}));
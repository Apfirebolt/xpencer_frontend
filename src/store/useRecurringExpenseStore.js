import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useRecurringStore = create((set, get) => ({
  recurringList: [],
  loading: false,
  fetching: true,
  error: null,

  // Fetch all recurring expense templates (triggers monthly auto-generation on backend)
  fetchRecurring: async () => {
    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get('/recurring', getAuthHeaders());
      const data = res.data.recurring || res.data;
      set({ recurringList: Array.isArray(data) ? data : [], fetching: false });
    } catch (err) {
      console.error("Failed to fetch recurring expenses:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired or unauthorized. Please sign in again." 
        : "Failed to load recurring expenses.";
      set({ error: errorMsg, fetching: false, recurringList: [] });
    }
  },

  // Create a new recurring expense template
  createRecurring: async (recurringData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/recurring', recurringData, getAuthHeaders());
      const createdItem = res.data.recurring || res.data;
      
      // Prepend to current list
      set((state) => ({
        recurringList: [createdItem, ...state.recurringList],
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create recurring expense.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete a recurring expense template by ID
  deleteRecurring: async (recurringId) => {
    set({ loading: true, error: null });
    try {
      await httpClient.delete(`/recurring/${recurringId}`, getAuthHeaders());
      
      // Remove from current list
      set((state) => ({
        recurringList: state.recurringList.filter((item) => item._id !== recurringId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to delete recurring expense.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Compute total recurring monthly commitments dynamically
  getTotalRecurringMonthly: () => {
    const { recurringList } = get();
    return recurringList
      .filter((item) => item.isActive !== false)
      .reduce((sum, item) => {
        const amount = Number(item.amount || 0);
        if (item.frequency === 'yearly') return sum + (amount / 12);
        if (item.frequency === 'weekly') return sum + (amount * 4.33);
        return sum + amount; // default monthly
      }, 0);
  }
}));
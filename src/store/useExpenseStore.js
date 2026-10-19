import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  fetching: true,
  error: null,

  // Fetch all expenses with auth header
  fetchExpenses: async () => {
    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get('/expense', getAuthHeaders());
      console.log("Fetched expenses response:", res.data);
      const data = res.data.expenses || res.data;
      set({ expenses: Array.isArray(data) ? data : [], fetching: false });
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired or unauthorized. Please sign in again." 
        : "Failed to load expenses.";
      set({ error: errorMsg, fetching: false, expenses: [] });
    }
  },

  // Create a new expense with auth header
  createExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/expense', expenseData, getAuthHeaders());
      const createdExpense = res.data.expense || res.data;
      
      // Prepend to current list
      set((state) => ({
        expenses: [createdExpense, ...state.expenses],
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save expense.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Compute total spending dynamically
  getTotalSpent: () => {
    const { expenses } = get();
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }
}));
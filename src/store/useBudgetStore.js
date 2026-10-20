import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,
  fetching: true,
  error: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // Set active month/year filter
  setMonthYear: (month, year) => {
    set({ selectedMonth: month, selectedYear: year });
    get().fetchBudgets(month, year);
  },

  // Fetch budgets for a given month and year with auth header
  fetchBudgets: async (month, year) => {
    const m = month || get().selectedMonth;
    const y = year || get().selectedYear;

    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get(`/budget?month=${m}&year=${y}`, getAuthHeaders());
      const data = res.data.budgets || res.data;
      set({ 
        budgets: Array.isArray(data) ? data : [], 
        fetching: false,
        selectedMonth: m,
        selectedYear: y 
      });
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired or unauthorized. Please sign in again." 
        : "Failed to load budgets.";
      set({ error: errorMsg, fetching: false, budgets: [] });
    }
  },

  // Create or update a budget limit
  setBudget: async (budgetData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/budget', budgetData, getAuthHeaders());
      
      // Refresh the budget list for that month/year after saving
      const targetMonth = budgetData.month || get().selectedMonth;
      const targetYear = budgetData.year || get().selectedYear;
      await get().fetchBudgets(targetMonth, targetYear);

      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save budget.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete a budget by ID
  deleteBudget: async (budgetId) => {
    set({ loading: true, error: null });
    try {
      await httpClient.delete(`/budget/${budgetId}`, getAuthHeaders());
      set((state) => ({
        budgets: state.budgets.filter((b) => b._id !== budgetId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to delete budget.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Compute total budgeted amount across all categories for the month
  getTotalBudgetLimit: () => {
    const { budgets } = get();
    return budgets.reduce((sum, item) => sum + Number(item.limit || 0), 0);
  },

  // Compute total spent across all budgeted categories
  getTotalBudgetSpent: () => {
    const { budgets } = get();
    return budgets.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  }
}));
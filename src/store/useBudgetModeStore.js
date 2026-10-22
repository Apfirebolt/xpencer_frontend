import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useBudgetModeStore = create((set, get) => ({
  budgetModes: [],
  loading: false,
  fetching: true,
  error: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // Set active month/year filter and fetch data
  setMonthYear: (month, year) => {
    set({ selectedMonth: month, selectedYear: year });
    get().fetchBudgetModes(month, year);
  },

  // Fetch budget modes for a given month and year with auth header
  fetchBudgetModes: async (month, year) => {
    const m = month || get().selectedMonth;
    const y = year || get().selectedYear;

    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get(`/budget-mode?month=${m}&year=${y}`, getAuthHeaders());
      const data = res.data.budgetModes || res.data;
      set({ 
        budgetModes: Array.isArray(data) ? data : [], 
        fetching: false,
        selectedMonth: m,
        selectedYear: y 
      });
    } catch (err) {
      console.error("Failed to fetch budget modes:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired or unauthorized. Please sign in again." 
        : "Failed to load payment mode budgets.";
      set({ error: errorMsg, fetching: false, budgetModes: [] });
    }
  },

  // Create or update a payment mode budget limit
  setBudgetMode: async (budgetModeData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/budget-mode', budgetModeData, getAuthHeaders());
      
      // Refresh the budget mode list for that month/year after saving
      const targetMonth = budgetModeData.month || get().selectedMonth;
      const targetYear = budgetModeData.year || get().selectedYear;
      await get().fetchBudgetModes(targetMonth, targetYear);

      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save budget mode.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Delete a budget mode by ID
  deleteBudgetMode: async (budgetModeId) => {
    set({ loading: true, error: null });
    try {
      await httpClient.delete(`/budget-mode/${budgetModeId}`, getAuthHeaders());
      set((state) => ({
        budgetModes: state.budgetModes.filter((b) => b._id !== budgetModeId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to delete budget mode.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Compute total budgeted amount across all payment modes for the month
  getTotalBudgetModeLimit: () => {
    const { budgetModes } = get();
    return budgetModes.reduce((sum, item) => sum + Number(item.limit || 0), 0);
  },

  // Compute total spent across all budgeted payment modes
  getTotalBudgetModeSpent: () => {
    const { budgetModes } = get();
    return budgetModes.reduce((sum, item) => sum + Number(item.spent || 0), 0);
  }
}));
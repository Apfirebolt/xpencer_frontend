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
  pendingConfirmations: [],
  loading: false,
  fetching: true,
  fetchingPending: false,
  error: null,

  // Fetch all expenses with auth header
  fetchExpenses: async () => {
    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get('/expense', getAuthHeaders());
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

  // Dedicated store call for pending expenses awaiting confirmation
  fetchPendingConfirmations: async () => {
    set({ fetchingPending: true, error: null });
    try {
      const res = await httpClient.get('/expense?pendingConfirmation=true', getAuthHeaders());
      const data = res.data.expenses || res.data;
      set({ 
        pendingConfirmations: Array.isArray(data) ? data : [], 
        fetchingPending: false 
      });
    } catch (err) {
      console.error("Failed to fetch pending confirmations:", err);
      set({ 
        error: "Failed to load pending confirmations.", 
        fetchingPending: false, 
        pendingConfirmations: [] 
      });
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

  // Delete an expense by ID with auth header
  deleteExpense: async (expenseId) => {
    set({ loading: true, error: null });
    try {
      await httpClient.delete(`/expense/${expenseId}`, getAuthHeaders());
      
      set((state) => ({
        expenses: state.expenses.filter((exp) => exp._id !== expenseId),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      // Capture the 400 or 403 error message sent from backend
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete expense.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Mark split payment as paid (Debtor Action)
  markSplitPaymentPaid: async (expenseId) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.put(`/expense/${expenseId}/mark-paid`, {}, getAuthHeaders());
      const updatedExpense = res.data.expense || res.data;

      set((state) => ({
        expenses: state.expenses.map((exp) => (exp._id === expenseId ? updatedExpense : exp)),
        loading: false,
      }));
      return { success: true, message: res.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to mark payment as paid.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Confirm split payment received (Creditor / paidBy Action)
  confirmSplitPayment: async (expenseId) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.put(`/expense/${expenseId}/confirm-settlement`, {}, getAuthHeaders());
      const updatedExpense = res.data.expense || res.data;

      set((state) => ({
        // Update item in main expenses list
        expenses: state.expenses.map((exp) => (exp._id === expenseId ? updatedExpense : exp)),
        // Remove item from pending confirmations queue once verified
        pendingConfirmations: state.pendingConfirmations.filter((exp) => exp._id !== expenseId),
        loading: false,
      }));
      return { success: true, message: res.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to confirm payment settlement.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Generate random mock expenses (10, 20, 30, or 40 items)
  generateMockExpenses: async (count = 10, month, year) => {
    set({ loading: true, error: null });
    try {
      await httpClient.post('/expense/generate-mock', { count, month, year }, getAuthHeaders());
      // Refresh expenses list after generation
      await get().fetchExpenses();
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to generate mock expenses.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Clear all auto-generated test expenses
  clearMockExpenses: async () => {
    set({ loading: true, error: null });
    try {
      await httpClient.delete('/expense/generate-mock', getAuthHeaders());
      // Refresh expenses list after deletion
      await get().fetchExpenses();
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to clear mock expenses.";
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
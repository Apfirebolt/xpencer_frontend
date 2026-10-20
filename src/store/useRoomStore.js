import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useExpenseRoomStore = create((set, get) => ({
  rooms: [],
  fetching: true,
  loading: false,
  error: null,

  // Fetch all expense rooms for the user
  fetchRooms: async () => {
    set({ fetching: true, error: null });
    try {
      const res = await httpClient.get('/rooms', getAuthHeaders());
      const data = res.data.rooms || res.data;
      set({ rooms: Array.isArray(data) ? data : [], fetching: false });
    } catch (err) {
      console.error("Failed to fetch expense rooms:", err);
      const errorMsg = err.response?.status === 401 
        ? "Session expired or unauthorized. Please sign in again." 
        : "Failed to load expense rooms.";
      set({ error: errorMsg, fetching: false, rooms: [] });
    }
  },

  // Create a new expense room
  createRoom: async (roomData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/rooms', roomData, getAuthHeaders());
      const createdRoom = res.data.room || res.data;

      set((state) => ({
        rooms: [createdRoom, ...state.rooms],
        loading: false,
      }));
      return { success: true, room: createdRoom };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to create room.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Send a room join request to another user
  inviteUser: async (roomId, userEmail, notificationMessage) => {
    set({ loading: true, error: null });
    try {
      await httpClient.post(`/rooms/${roomId}/invite`, { userEmail, notificationMessage }, getAuthHeaders());
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to send invitation.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Accept or reject room join request
  respondToJoinRequest: async (requestId, status) => {
    set({ loading: true, error: null });
    try {
      await httpClient.put(`/rooms/requests/${requestId}`, { status }, getAuthHeaders());
      // Refresh rooms list after accepting/rejecting
      await get().fetchRooms();
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update request.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Add an expense to a room (with optional splitting across members)
  addRoomExpense: async (roomId, expenseData) => {
    set({ loading: true, error: null });
    try {
      await httpClient.post(`/rooms/${roomId}/expense`, expenseData, getAuthHeaders());
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to add room expense.";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  }
}));
import { create } from 'zustand';
import httpClient from '@/lib/api';
import Cookie from 'js-cookie';

// Helper to get authorization headers from cookies
const getAuthHeaders = () => {
  const token = Cookie.get('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Initialize user session from cookies on app load
  initializeAuth: () => {
    const userCookie = Cookie.get('user');
    const token = Cookie.get('token');
    if (userCookie && token) {
      try {
        const parsedUser = JSON.parse(userCookie);
        set({ user: parsedUser, isAuthenticated: true });
      } catch (err) {
        console.error("Failed to parse user cookie:", err);
        get().logout();
      }
    }
  },

  // Login action
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      console.log("Logging in with credentials:", credentials);
      const res = await httpClient.post('/auth/login', credentials);
      const data = res.data;

      // Set cookies
      Cookie.set('token', data.token, { expires: 7 });
      if (data.refreshToken) {
        Cookie.set('refreshToken', data.refreshToken, { expires: 30 });
      }
      Cookie.set('user', JSON.stringify(data), { expires: 7 });

      set({ user: data, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Invalid email or password.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Google Login action
  googleLogin: async (credential) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/auth/google', { credential });
      const data = res.data;

      // Set cookies
      Cookie.set('token', data.token, { expires: 7 });
      if (data.refreshToken) {
        Cookie.set('refreshToken', data.refreshToken, { expires: 30 });
      }
      Cookie.set('user', JSON.stringify(data), { expires: 7 });

      set({ user: data, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Google authentication failed.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Register action
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.post('/auth/register', userData);
      const data = res.data;

      Cookie.set('token', data.token, { expires: 7 });
      if (data.refreshToken) {
        Cookie.set('refreshToken', data.refreshToken, { expires: 30 });
      }
      Cookie.set('user', JSON.stringify(data), { expires: 7 });

      set({ user: data, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Fetch user profile
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.get('/auth/profile', getAuthHeaders());
      const userData = res.data;
      
      Cookie.set('user', JSON.stringify(userData), { expires: 7 });
      set({ user: userData, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      set({ error: "Failed to load user profile.", loading: false });
    }
  },

  // Update general profile details (firstName, lastName, email)
  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.put('/auth/profile', profileData, getAuthHeaders());
      const updatedUser = res.data;

      Cookie.set('user', JSON.stringify(updatedUser), { expires: 7 });
      set({ user: updatedUser, loading: false });
      return { success: true, message: "Profile updated successfully." };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update profile.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Update profile picture (expects an image File object)
  updateProfilePic: async (imageFile) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const headers = {
        ...getAuthHeaders().headers,
        'Content-Type': 'multipart/form-data',
      };

      const res = await httpClient.put('/auth/profile/pic', formData, { headers });
      const { profilePic } = res.data;

      // Update current user state with new profilePic object
      set((state) => {
        const updatedUser = { ...state.user, profilePic };
        Cookie.set('user', JSON.stringify(updatedUser), { expires: 7 });
        return { user: updatedUser, loading: false };
      });

      return { success: true, message: "Profile picture updated successfully." };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to upload profile picture.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.put('/auth/change-password', passwordData, getAuthHeaders());
      set({ loading: false });
      return { success: true, message: res.data.message || "Password updated successfully." };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update password.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Get joining room requests
  getJoiningRoomRequests: async () => {
    set({ loading: true, error: null });
    try {
      const res = await httpClient.get('/auth/room-requests', getAuthHeaders());
      set({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch joining room requests.";
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  // Logout action
  logout: () => {
    Cookie.remove('token');
    Cookie.remove('refreshToken');
    Cookie.remove('user');
    set({ user: null, isAuthenticated: false, error: null });
  }
}));
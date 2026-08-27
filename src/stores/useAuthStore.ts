import { create } from 'zustand';
import { User } from '@/types';
import { ApiClient } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('habitos_access_token'),
  isLoading: true,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      await ApiClient.login(credentials);
      const user = await ApiClient.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await ApiClient.register(data);
      const user = await ApiClient.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    ApiClient.clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('habitos_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const user = await ApiClient.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      ApiClient.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

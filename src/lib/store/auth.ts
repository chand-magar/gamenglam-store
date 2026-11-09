'use client';
import { create } from 'zustand';
import type { Customer } from '@/lib/types';

interface AuthState {
  customer:   Customer | null;
  isLoggedIn: boolean;
  setCustomer:(customer: Customer | null) => void;
  logout:     () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  customer:   null,
  isLoggedIn: false,

  setCustomer: (customer) =>
    set({ customer, isLoggedIn: !!customer }),

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ customer: null, isLoggedIn: false });
  },
}));

'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  ids:    string[];           // ← string (product_id UUID)
  toggle: (id: string) => void;
  has:    (id: string) => boolean;
  count:  number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids:   [],
      count: 0,

      toggle: (id) => {
        set((s) => {
          const ids = s.ids.includes(id)
            ? s.ids.filter((x) => x !== id)
            : [...s.ids, id];
          return { ids, count: ids.length };
        });
      },

      has: (id) => get().ids.includes(id),
    }),
    { name: 'game-n-glam-wishlist' },
  ),
);
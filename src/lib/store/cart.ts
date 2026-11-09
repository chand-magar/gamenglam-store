'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from '@/lib/types';

export interface CartProduct {
  product_id:   string;
  product_name: string;
  sku:          string;
  image_url?:   string | null;
  base_price?:  number;
}

export interface CartVariant {
  variant_id:    string;
  sku:           string;
  selling_price: number | null;
  mrp:           number | null;
  image_url?:    string | null;
  attributes?:   Record<string, string>; // code → display label
}

interface CartState {
  lines:      CartLine[];
  itemCount:  number;
  subtotal:   number;
  addItem:    (product: CartProduct, variant: CartVariant, qty?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty:  (variantId: string, qty: number) => void;
  clearCart:  () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines:     [],
      itemCount: 0,
      subtotal:  0,

      addItem: (product, variant, qty = 1) => {
        set((s) => {
          const lines = [...s.lines];
          // Use variant_id as unique key — each variant is a separate line
          const idx = lines.findIndex((l) => l.variant_id === variant.variant_id);

          const unitPrice = variant.selling_price ?? variant.mrp ?? product.base_price ?? 0;
          const newQty    = idx >= 0 ? lines[idx].qty + qty : qty;
          const lineTotal = (unitPrice * newQty).toFixed(2);

          // Build variant label from attributes
          const variantLabel = variant.attributes
            ? Object.values(variant.attributes).filter(Boolean).join(' · ')
            : variant.sku;

          if (idx >= 0) {
            lines[idx] = { ...lines[idx], qty: newQty, lineTotal };
          } else {
            lines.push({
              id:         product.product_id,  // product UUID
              variant_id: variant.variant_id,  // variant UUID — unique key
              qty,
              color:      variant.attributes?.color ?? null,
              size:       variant.attributes?.size  ?? null,
              brand:      product.sku,
              name:       product.product_name,
              sku:        variant.sku,
              price:      unitPrice,
              lineTotal,
              variant:    variantLabel || 'Standard',
              image_url:  variant.image_url ?? product.image_url ?? null,
            });
          }

          const itemCount = lines.reduce((a, l) => a + l.qty, 0);
          const subtotal  = lines.reduce((a, l) => a + parseFloat(l.lineTotal), 0);
          return { lines, itemCount, subtotal };
        });
      },

      removeItem: (variantId) => {
        set((s) => {
          const lines     = s.lines.filter((l) => l.variant_id !== variantId);
          const itemCount = lines.reduce((a, l) => a + l.qty, 0);
          const subtotal  = lines.reduce((a, l) => a + parseFloat(l.lineTotal), 0);
          return { lines, itemCount, subtotal };
        });
      },

      updateQty: (variantId, qty) => {
        if (qty < 1) { get().removeItem(variantId); return; }
        set((s) => {
          const lines = s.lines.map((l) =>
            l.variant_id === variantId
              ? { ...l, qty, lineTotal: (l.price * qty).toFixed(2) }
              : l,
          );
          const itemCount = lines.reduce((a, l) => a + l.qty, 0);
          const subtotal  = lines.reduce((a, l) => a + parseFloat(l.lineTotal), 0);
          return { lines, itemCount, subtotal };
        });
      },

      clearCart: () => set({ lines: [], itemCount: 0, subtotal: 0 }),
    }),
    { name: 'game-n-glam-cart' },
  ),
);
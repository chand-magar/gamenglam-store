'use client';
import { useState, useCallback } from 'react';

export interface OrderItem {
  order_item_no: number;
  order_item_id: string;
  variant_no:    number;
  product_name:  string;
  sku:           string;
  quantity:      number;
  unit_price:    number;
  total_price:   number;
}

export interface Order {
  order_no:     number;
  order_id:     string;
  order_ref:    string;
  customer_no:  number;
  address_no:   number;
  subtotal:     number;
  discount:     number;
  tax:          number;
  delivery_fee: number;
  total:        number;
  order_status: string;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  items:        OrderItem[];
}

export function useOrders() {
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res  = await window.fetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to load orders.');
      setOrders(
        Array.isArray(data.data)
          ? data.data.map((o: any) => ({ ...o, items: o.items ?? [] }))
          : [],
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { orders, isLoading, error, fetch };
}
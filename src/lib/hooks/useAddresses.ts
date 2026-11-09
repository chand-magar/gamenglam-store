'use client';
import { useState, useCallback } from 'react';
import type { Address } from '@/lib/types';

export function useAddresses() {
  const [addresses,   setAddresses]   = useState<Address[]>([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isSubmitting,setIsSubmitting] = useState(false);
  const [error,       setError]       = useState('');

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res  = await window.fetch('/api/addresses');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to load addresses.');
      setAddresses(Array.isArray(data.data) ? data.data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (body: Partial<Address>) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res  = await window.fetch('/api/addresses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to create address.');
      setAddresses((prev) => [...prev, data.data]);
      return data.data as Address;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create address.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const update = useCallback(async (id: string, body: Partial<Address>) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res  = await window.fetch(`/api/addresses/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to update address.');
      setAddresses((prev) =>
        prev.map((a) => a.address_id === id ? data.data : a),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update address.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await window.fetch(`/api/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete address.');
      setAddresses((prev) => prev.filter((a) => a.address_id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete address.');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { addresses, isLoading, isSubmitting, error, fetch, create, update, remove };
}
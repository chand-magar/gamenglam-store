'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';

export function AuthInitializer() {
  const { customer, setCustomer } = useAuthStore();

  useEffect(() => {
    if (customer) return;
    fetch('/api/me', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data?.data) setCustomer(data.data); })
      .catch(() => {});
  }, []);

  return null;
}

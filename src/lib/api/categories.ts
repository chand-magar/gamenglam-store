import type { Category } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data)
      ? json.data
          .filter((c: any) => c.status === 'A')
          .map((c: any) => ({
            category_id:   c.category_id,
            category_name: c.category_name,
            slug:          c.slug,
            details:       c.details   ?? null,
            status:        c.status,
            parent_id:     c.parent_id  ?? null,
            parent_no:     c.parent_no  ?? null,
            category_no:   c.category_no ?? 0,
          }))
      : [];
  } catch {
    return [];
  }
}
import type { Review } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function getProductReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data as Review[]) ?? [];
  } catch {
    return [];
  }
}

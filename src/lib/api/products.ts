import type { Product } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export function mapProduct(p: any): Product {
  const stockQty = p.default_stock_qty ?? p.stock_qty ?? 0;
  return {
    product_id:    p.product_id,
    category_id:   p.category_id ?? null,
    category_no:   p.category_no ?? 0,
    sku:           p.sku,
    product_name:  p.product_name,
    slug:          p.slug,
    description:   p.description ?? null,
    image_url:     p.image_url ?? null,
    base_price:    p.default_selling_price ?? p.default_mrp ?? 0,  // ← from variant
    originalPrice: p.default_mrp ?? null,                          // ← MRP as original
    default_variant_id: p.default_variant_id ?? null,
    stock:         stockQty === 0 ? 'out' : stockQty < 5 ? 'low' : 'in',
    is_featured:   p.is_featured ?? false,
    features:      Array.isArray(p.features)       ? p.features       : [],
    specs:         Array.isArray(p.specifications) ? p.specifications.map((s: any) => ({ k: s.key, v: s.value })) : [],
    reviewsN:      0,
  };
}

let cachedProducts: Product[] = [];
let cacheTime = 0;
const CACHE_TTL = 60_000;

async function fetchAllProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cachedProducts.length > 0 && now - cacheTime < CACHE_TTL) {
    return cachedProducts;
  }

  try {
    const res = await fetch(`${API_BASE}/products`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    cachedProducts = Array.isArray(json.data)
      ? json.data.filter((p: any) => p.status === 'active').map(mapProduct)
      : [];
    cacheTime = now;
    return cachedProducts;
  } catch {
    return [];
  }
}

export async function getProducts(params?: {
  limit?:       number;
  page?:        number;
  category_id?: string;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category_id) query.set('category_id', params.category_id);

    const url = `${API_BASE}/products${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, { cache: 'no-store' }); // ← fix caching
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data)
      ? json.data.filter((p: any) => p.status === 'active').map(mapProduct)
      : [];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await fetchAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}
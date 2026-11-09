const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export interface VariantImage {
  image_id:   string;
  image_url:  string;
  is_primary: boolean;
  sort_order: number;
}

export interface AttributeValueOption {
  attribute_value_id: string;
  display_label:      string;
  value:              string;
  color_hex?:         string;
}

export interface ProductAttribute {
  attribute_id:   string;
  attribute_name: string;
  code:           string;
  type:           string;
  values:         AttributeValueOption[];
}

export interface VariantWithAttributes {
  variant_id:     string;
  sku:            string;
  cost_price:     number | null;    // ← add
  mrp:            number | null;    // ← add
  selling_price:  number | null;    // ← add
  price_override: number | null;
  stock_qty:      number;
  weight_kg:      number | null;
  status:         string;
  attributes:     Record<string, string>;
}

export interface VariantListing {
  variant_id:    string;
  product_id:    string;
  product_name:  string;
  slug:          string;
  sku:           string;
  cost_price:    number | null;
  mrp:           number | null;
  selling_price: number | null;
  stock_qty:     number;
  image_url:     string | null;
  category_id:   string;
  is_featured:   boolean;
  attributes:    Record<string, string>;
}

export async function getVariantListing(categoryId?: string, attributeValues?: string[]): Promise<VariantListing[]> {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.set('category_id', categoryId);
    if (attributeValues?.length) params.set('values', attributeValues.join(','));
    const url = `${API_BASE}/product-variants/listing${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch { return []; }
}

export async function getVariantImages(variantId: string): Promise<VariantImage[]> {
  try {
    const res  = await fetch(`${API_BASE}/product-variants/${variantId}/images`, { cache:'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const imgs = Array.isArray(json.data) ? json.data : [];
    return imgs
      .map((img: any) => ({
        image_id:   img.image_id,
        image_url:  img.image_url,
        is_primary: img.is_primary ?? false,
        sort_order: img.sort_order ?? 0,
      }))
      .sort((a: VariantImage, b: VariantImage) =>
        (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order,
      );
  } catch { return []; }
}

export async function getProductVariants(productId: string): Promise<VariantWithAttributes[]> {
  try {
    const res  = await fetch(`${API_BASE}/products/${productId}/variants-with-attributes`, { cache:'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch { return []; }
}

export async function getProductAttributes(productId: string): Promise<ProductAttribute[]> {
  try {
    const res  = await fetch(`${API_BASE}/products/${productId}/attributes`, { cache:'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch { return []; }
}
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export interface AttributeValueOption {
  attribute_value_id: string;
  display_label:      string;
  value:              string;
  color_hex?:         string;
}

export interface AttributeWithValues {
  attribute_id:   string;
  attribute_name: string;
  code:           string;
  type:           string;
  values:         AttributeValueOption[];
}

export async function getAttributesByCategory(categoryId: string): Promise<AttributeWithValues[]> {
  try {
    const res = await fetch(`${API_BASE}/attributes/category/${categoryId}/values`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch { return []; }
}
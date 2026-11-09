import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params            = new URLSearchParams();

  const categoryId = searchParams.get('category_id');
  const values     = searchParams.get('values');
  if (categoryId) params.set('category_id', categoryId);
  if (values)     params.set('values', values);

  const url = `${API_BASE}/product-variants/listing${params.size ? '?' + params.toString() : ''}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) return NextResponse.json({ data: [] }, { status: res.status });

  const data = await res.json();
  return NextResponse.json({ data: Array.isArray(data.data) ? data.data : [] });
}

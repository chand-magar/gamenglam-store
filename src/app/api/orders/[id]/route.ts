import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const res  = await fetch(`${API_BASE}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache:   'no-store',
  });
  const data = await res.json();

  if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

  return NextResponse.json({ data: data.data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id }  = await params;
  const body    = await req.json();

  const res  = await fetch(`${API_BASE}/orders/${id}/status`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

  return NextResponse.json({ data: data.data });
}

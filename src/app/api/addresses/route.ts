import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res  = await fetch(`${API_BASE}/addresses`, {
    headers: { Authorization: `Bearer ${token}` },
    cache:   'no-store',
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

  return NextResponse.json({ data: Array.isArray(data.data) ? data.data : [] });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const res  = await fetch(`${API_BASE}/addresses`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

  return NextResponse.json({ data: data.data });
}
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode }                 from 'jwt-decode';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

interface CustomerToken {
  customer_id: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(`${API_BASE}/customers/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache:   'no-store',
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error ?? 'Unauthorized' },
      { status: res.status },
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { customer_id } = jwtDecode<CustomerToken>(token);
    const body = await req.json();

    const res = await fetch(`${API_BASE}/customers/${customer_id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

    return NextResponse.json({ data: data.data });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}

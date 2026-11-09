import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_BASE}/customers/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      email_id: body.email,    // ← API uses email_id not username
      password: body.password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error ?? 'Invalid email or password.' },
      { status: res.status },
    );
  }

  const response = NextResponse.json({
    success:  true,
    customer: data.data.customer,
  });

  // Set httpOnly cookies
  response.cookies.set('gng_access_token', data.data.access_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24, // 24 hours
  });

  response.cookies.set('gng_refresh_token', data.data.refresh_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
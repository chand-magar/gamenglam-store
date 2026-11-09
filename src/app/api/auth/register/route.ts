import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_BASE}/customers/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      first_name: body.first_name,
      last_name:  body.last_name,
      email_id:   body.email,
      mobile_no:  body.mobile_no ?? undefined,
      password:   body.password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error ?? 'Registration failed.' },
      { status: res.status },
    );
  }

  // Auto-login after register — set cookies
  const response = NextResponse.json({
    success:  true,
    customer: data.data.customer,
    message:  'Account created successfully.',
  });

  response.cookies.set('gng_access_token', data.data.access_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24,
  });

  response.cookies.set('gng_refresh_token', data.data.refresh_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24 * 7,
  });

  return response;
}
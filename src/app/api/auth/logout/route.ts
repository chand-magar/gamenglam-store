import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('gng_access_token',  '', { maxAge: 0, path: '/' });
  response.cookies.set('gng_refresh_token', '', { maxAge: 0, path: '/' });

  return response;
}

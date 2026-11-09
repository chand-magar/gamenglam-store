import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? 'Subscription failed.' },
        { status: res.status },
      );
    }

    return NextResponse.json({ success: true, message: data.message ?? 'Subscribed!' });
  } catch {
    return NextResponse.json({ error: 'Subscription failed.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode }                 from 'jwt-decode';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

interface CustomerToken {
  customer_no: number;
  customer_id: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded    = jwtDecode<CustomerToken>(token);
    const customerId = decoded.customer_id;

    const res  = await fetch(`${API_BASE}/orders/customer/${customerId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   'no-store',
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

    return NextResponse.json({
      data: Array.isArray(data.data)
        ? data.data.map((o: any) => ({ ...o, items: o.items ?? [] }))
        : [],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('gng_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const decoded    = jwtDecode<CustomerToken>(token);
    const customerNo = decoded.customer_no;

    const body = await req.json();

    const res = await fetch(`${API_BASE}/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({
        customer_no:  customerNo,
        address_id:   body.address_id,   // ← UUID now
        delivery_fee: body.delivery_fee  ?? 0,
        discount:     body.discount      ?? 0,
        notes:        body.notes         ?? null,
        items:        body.items.map((item: any) => ({
          variant_id: item.variant_id,  // ← UUID
          quantity:   item.quantity,
          unit_price: item.unit_price,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.error }, { status: res.status });

    return NextResponse.json({ data: data.data });
  } catch {
    return NextResponse.json({ error: 'Failed to place order.' }, { status: 500 });
  }
}
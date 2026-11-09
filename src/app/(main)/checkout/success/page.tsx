'use client';
import Link              from 'next/link';
import { CheckCircle }   from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense }      from 'react';

function SuccessContent() {
  const params  = useSearchParams();
  const orderRef = params.get('ref') ?? 'ORD-XXXXX';

  return (
    <div className="container" style={{ padding:'64px 36.8px', maxWidth:520, margin:'0 auto', textAlign:'center' }}>
      <CheckCircle size={52} color="var(--color-accent)" style={{ marginBottom:'13.8px' }} />
      <h1 style={{ margin:'13.8px 0 8px' }}>Order Placed!</h1>
      <p style={{ fontSize:16, fontFamily:'var(--font-heading)', color:'var(--color-accent-700)', margin:'0 0 8px' }}>
        {orderRef}
      </p>
      <p className="text-muted" style={{ fontSize:14, marginBottom:24 }}>
        Thank you for your order. You'll receive a confirmation once it's processed.
      </p>

      <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', padding:'18px', marginBottom:24, textAlign:'left' }}>
        <div style={{ fontSize:13, display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span className="text-muted">Order reference</span>
            <span style={{ fontWeight:600 }}>{orderRef}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span className="text-muted">Estimated delivery</span>
            <span>3–5 business days</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span className="text-muted">Payment</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <Link href="/account" className="btn btn-secondary">View Orders</Link>
        <Link href="/"        className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-muted">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';

const COUPONS: Record<string, number> = { WELCOME10: 10, SAVE10: 10 };

export default function CartPage() {
  const { lines, updateQty, removeItem, subtotal } = useCartStore();
  const [coupon,    setCoupon]    = useState('');
  const [discount,  setDiscount]  = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const tax   = (subtotal - discount) * 0.08;
  const total = subtotal - discount + tax;

  const applyCoupon = () => {
    const pct = COUPONS[coupon.toUpperCase()];
    if (pct) {
      setDiscount(subtotal * (pct / 100));
      setCouponMsg(`${coupon.toUpperCase()} applied — ${pct}% off`);
    } else {
      setDiscount(0);
      setCouponMsg('Coupon not found');
    }
  };

  if (lines.length === 0) {
    return (
      <div className="container" style={{ padding:'36.8px', textAlign:'center', paddingTop:80 }}>
        <ShoppingBag size={48} color="var(--color-accent)" style={{ marginBottom:'13.8px' }} />
        <h2>Your cart is empty</h2>
        <p className="text-muted" style={{ marginBottom:'18.4px' }}>Add some items to get started.</p>
        <Link href="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding:'27.6px 36.8px' }}>
      <h1 style={{ marginBottom:'18.4px' }}>Shopping Cart</h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:'27.6px' }}>

        {/* ── Lines ── */}
        <div>
          {lines.map((l) => (
            <div
              key={l.variant_id}  // ← unique variant key
              style={{ display:'grid', gridTemplateColumns:'80px 1fr auto', gap:'13.8px', padding:'13.8px 0', borderBottom:'1px solid var(--color-divider)', alignItems:'center' }}
            >
              {/* Image */}
              <div style={{ width:80, height:80, borderRadius:8, overflow:'hidden', background:'var(--color-neutral-100)', flexShrink:0 }}>
                {l.image_url ? (
                  <img
                    src={l.image_url}
                    alt={l.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                  />
                ) : (
                  <div style={{ width:'100%', height:'100%', background:'repeating-linear-gradient(45deg,var(--color-neutral-200) 0,var(--color-neutral-200) 8px,var(--color-neutral-100) 8px,var(--color-neutral-100) 16px)' }} />
                )}
              </div>

              {/* Info */}
              <div>
                <div className="card-meta">{l.brand}</div>
                <div className="card-title">{l.name}</div>
                <div className="text-muted" style={{ fontSize:12 }}>{l.variant}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="seg">
                    <button className="seg-opt" onClick={() => updateQty(l.variant_id, l.qty - 1)}>−</button>
                    <span className="seg-opt">{l.qty}</span>
                    <button className="seg-opt" onClick={() => updateQty(l.variant_id, l.qty + 1)}>+</button>
                  </div>
                  <button className="btn btn-ghost" onClick={() => removeItem(l.variant_id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:16 }}>
                ₹{l.lineTotal}
              </div>
            </div>
          ))}

          <div style={{ marginTop:'18.4px' }}>
            <Link href="/" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>

        {/* ── Summary ── */}
        <div style={{ border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', padding:'18.4px', height:'fit-content' }}>
          <h3 style={{ marginBottom:'13.8px' }}>Order Summary</h3>

          <div className="flex gap-2 mb-3">
            <input
              className="input"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
            />
            <button className="btn btn-secondary" onClick={applyCoupon}>Apply</button>
          </div>
          {couponMsg && (
            <div style={{ fontSize:12, color:'var(--color-accent-700)', marginBottom:'9.2px' }}>{couponMsg}</div>
          )}

          <div className="hr" />
          <div className="flex justify-between" style={{ fontSize:14, marginBottom:6 }}>
            <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between" style={{ fontSize:14, marginBottom:6, color:'var(--color-accent-700)' }}>
              <span>Discount</span><span>−₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between" style={{ fontSize:14, marginBottom:6 }}>
            <span>Tax (8%)</span><span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ fontSize:14, marginBottom:6 }}>
            <span>Shipping</span><span>Free</span>
          </div>
          <div className="hr" />
          <div className="flex justify-between" style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:18, marginBottom:'13.8px' }}>
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="btn btn-primary btn-block">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
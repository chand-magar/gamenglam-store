'use client';
import { useState, useEffect } from 'react';
import { useRouter }     from 'next/navigation';
import { useCartStore }  from '@/lib/store/cart';
import { useAddresses }  from '@/lib/hooks/useAddresses';
import { Lock }          from 'lucide-react';
import type { DeliveryOption, PaymentMethod } from '@/lib/types';

const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review'];

const DELIVERY_OPTIONS: DeliveryOption[] = [
  { key: 'standard', label: 'Standard', eta: '3–5 business days', price: 'Free'   },
  { key: 'express',  label: 'Express',  eta: '1–2 business days', price: '₹12.00' },
  { key: 'sameday',  label: 'Same-day', eta: 'Today by 9pm',      price: '₹19.00' },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card:     'Credit Card',
  debit:    'Debit Card',
  upi:      'UPI',
  gpay:     'Google Pay',
  applepay: 'Apple Pay',
  paypal:   'PayPal',
  cod:      'Cash on Delivery',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clearCart } = useCartStore();

  const {
    addresses,
    isLoading: addrLoading,
    fetch:     fetchAddresses,
  } = useAddresses();

  const [step,      setStep]      = useState(0);
  const [addressId, setAddressId] = useState('');
  const [delivery,  setDelivery]  = useState('standard');
  const [payment,   setPayment]   = useState<PaymentMethod>('cod');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (addresses.length > 0 && !addressId) {
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      setAddressId(def.address_id);
    }
  }, [addresses, addressId]);

  useEffect(() => {
    if (lines.length === 0 && step === 0) {
      router.push('/cart');
    }
  }, [lines, step, router]);

  const deliveryFee = delivery === 'express' ? 12 : delivery === 'sameday' ? 19 : 0;
  const tax         = subtotal * 0.08;
  const total       = subtotal + tax + deliveryFee;

  const selectedAddr = addresses.find((a) => a.address_id === addressId);
  const selectedDel  = DELIVERY_OPTIONS.find((d) => d.key === delivery)!;

  const placeOrder = async () => {
    setIsPlacing(true);
    setError('');
    try {
      const addr = addresses.find((a) => a.address_id === addressId);
      if (!addr) throw new Error('Please select a delivery address.');

      const res = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          address_id:   addr.address_id,   // ← UUID not address_no
          delivery_fee: deliveryFee,
          discount:     0,
          items: lines.map((l) => ({
            variant_id: l.variant_id,  // ← UUID
            quantity:   l.qty,
            unit_price: l.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to place order.');

      const orderId = data?.data?.order_ref ?? 'ORD-XXXXX';
      clearCart();
      router.push(`/checkout/success?ref=${orderId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (lines.length === 0) return null;

  return (
    <div className="container" style={{ padding:'27.6px 36.8px', maxWidth:900, margin:'0 auto' }}>
      <h1 style={{ textAlign:'center', marginBottom:'18.4px' }}>Checkout</h1>

      {/* Step indicator */}
      <div className="flex justify-center items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontFamily:'var(--font-heading)', border:`1.5px solid ${i <= step ? 'var(--color-accent)' : 'var(--color-divider)'}`, color: i < step ? '#fff' : i === step ? 'var(--color-accent-700)' : 'var(--color-neutral-500)', background: i < step ? 'var(--color-accent)' : 'transparent', transition:'all 0.2s' }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{ fontSize:13, color: i <= step ? 'var(--color-accent-700)' : 'var(--color-neutral-500)', fontWeight: i === step ? 600 : 400 }}>
              {label}
            </span>
            {i < 3 && <div style={{ width:40, height:1, background:'var(--color-divider)' }} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C', marginBottom:16 }}>
          {error}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'27.6px', alignItems:'start' }}>

        {/* Main step content */}
        <div style={{ border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', padding:'24px' }}>

          {/* Step 0 — Shipping */}
          {step === 0 && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Shipping Address</h3>
              {addrLoading ? (
                <p className="text-muted" style={{ fontSize:14 }}>Loading addresses…</p>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px', color:'var(--color-neutral-500)', fontSize:14 }}>
                  No saved addresses.{' '}
                  <a href="/account" style={{ color:'var(--color-accent-700)', fontWeight:600 }}>
                    Add one in your account
                  </a>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {addresses.map((a) => (
                    <label key={a.address_id} className="card" style={{ cursor:'pointer', flexDirection:'row', alignItems:'center', gap:'13.8px', borderColor: addressId === a.address_id ? 'var(--color-accent)' : 'var(--color-divider)' }}>
                      <input type="radio" name="addr" checked={addressId === a.address_id} onChange={() => setAddressId(a.address_id)} style={{ accentColor:'var(--color-accent)', flexShrink:0 }} />
                      <div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:2 }}>
                          <span className="card-title" style={{ fontSize:14 }}>{a.label}</span>
                          {a.is_default && <span className="tag tag-accent" style={{ fontSize:10 }}>Default</span>}
                        </div>
                        <div className="text-muted" style={{ fontSize:12 }}>
                          {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}
                        </div>
                        <div className="text-muted" style={{ fontSize:12 }}>
                          {a.city}, {a.state}, {a.country}{a.postal_code ? ` — ${a.postal_code}` : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop:16 }}>
                <button className="btn btn-primary" disabled={!addressId || addrLoading} onClick={() => setStep(1)}>
                  Continue to Delivery →
                </button>
              </div>
            </>
          )}

          {/* Step 1 — Delivery */}
          {step === 1 && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Delivery Method</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {DELIVERY_OPTIONS.map((d) => (
                  <label key={d.key} className="card" style={{ cursor:'pointer', flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderColor: delivery === d.key ? 'var(--color-accent)' : 'var(--color-divider)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <input type="radio" name="deliv" checked={delivery === d.key} onChange={() => setDelivery(d.key)} style={{ accentColor:'var(--color-accent)' }} />
                      <div>
                        <div className="card-title" style={{ fontSize:14 }}>{d.label}</div>
                        <div className="text-muted" style={{ fontSize:12 }}>{d.eta}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily:'var(--font-heading)', fontWeight:600 }}>{d.price}</div>
                  </label>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary"   onClick={() => setStep(2)}>Continue to Payment →</button>
              </div>
            </>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Payment Method</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'9.2px' }}>
                {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((pm) => (
                  <label key={pm} className="card" style={{ cursor:'pointer', flexDirection:'row', alignItems:'center', gap:'9.2px', borderColor: payment === pm ? 'var(--color-accent)' : 'var(--color-divider)', fontSize:14 }}>
                    <input type="radio" name="pay" checked={payment === pm} onChange={() => setPayment(pm)} style={{ accentColor:'var(--color-accent)' }} />
                    {PAYMENT_LABELS[pm]}
                  </label>
                ))}
              </div>

              {(payment === 'card' || payment === 'debit') && (
                <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:10 }}>
                  <div className="field">
                    <label>Card number</label>
                    <input className="input" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div className="field"><label>Expiry</label><input className="input" placeholder="MM / YY" /></div>
                    <div className="field"><label>CVC</label><input className="input" placeholder="•••" /></div>
                  </div>
                </div>
              )}

              {payment === 'cod' && (
                <div style={{ marginTop:12, background:'var(--color-accent-100)', border:'1px solid var(--color-accent-200)', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'var(--color-accent-800)' }}>
                  Pay with cash when your order is delivered. No extra charges.
                </div>
              )}

              <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:12, fontSize:12, color:'var(--color-neutral-600)' }}>
                <Lock size={13} /> Your payment information is encrypted and secure.
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:16 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary"   onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Review Order</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:14, marginBottom:16 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <span className="text-muted" style={{ minWidth:90 }}>Ship to</span>
                  <span>{selectedAddr ? `${selectedAddr.address_line1}, ${selectedAddr.city}, ${selectedAddr.state}` : '—'}</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <span className="text-muted" style={{ minWidth:90 }}>Delivery</span>
                  <span>{selectedDel.label} ({selectedDel.eta})</span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <span className="text-muted" style={{ minWidth:90 }}>Payment</span>
                  <span>{PAYMENT_LABELS[payment]}</span>
                </div>
              </div>

              <div className="hr" />

              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:12 }}>
                {lines.map((l) => (
                  <div key={l.variant_id} style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
                    <span>{l.name} × {l.qty}</span>
                    <span>₹{l.lineTotal}</span>
                  </div>
                ))}
              </div>

              <div className="hr" />

              <div style={{ display:'flex', flexDirection:'column', gap:4, fontSize:14, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Tax (8%)</span><span>₹{tax.toFixed(2)}</span></div>
                <div className="hr" style={{ margin:'6px 0' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:18 }}>
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={placeOrder} disabled={isPlacing} style={{ minWidth:140 }}>
                  {isPlacing ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Order summary sidebar */}
        <div style={{ border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', padding:'18.4px', position:'sticky', top:80 }}>
          <h3 style={{ marginBottom:'13.8px' }}>Order Summary</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
            {lines.map((l) => (
              <div key={l.variant_id} style={{ display:'grid', gridTemplateColumns:'40px 1fr auto', gap:10, alignItems:'center' }}>
                <div style={{ width:40, height:40, borderRadius:'var(--radius-md)', background:'var(--color-neutral-200)', overflow:'hidden' }}>
                  {l.image_url && <img src={l.image_url} alt={l.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, lineHeight:1.3 }}>{l.name}</div>
                  <div style={{ fontSize:11, color:'var(--color-neutral-600)' }}>{l.variant} · Qty {l.qty}</div>
                </div>
                <div style={{ fontSize:13, fontWeight:600 }}>₹{l.lineTotal}</div>
              </div>
            ))}
          </div>

          <div className="hr" />

          <div style={{ display:'flex', flexDirection:'column', gap:5, fontSize:13, marginTop:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Delivery</span><span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between' }}><span className="text-muted">Tax (8%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="hr" style={{ margin:'6px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:16 }}>
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
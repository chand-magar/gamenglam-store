'use client';
import { useState, useEffect } from 'react';
import Link                    from 'next/link';
import { useParams }           from 'next/navigation';
import { Package }             from 'lucide-react';

interface OrderItem {
  order_item_no: number;
  order_item_id: string;
  variant_no:    number;
  product_name:  string;
  sku:           string;
  attributes:    Record<string, string> | null;
  quantity:      number;
  unit_price:    number;
  total_price:   number;
}

interface Order {
  order_no:     number;
  order_id:     string;
  order_ref:    string;
  customer_no:  number;
  address_no:   number;
  subtotal:     number;
  discount:     number;
  tax:          number;
  delivery_fee: number;
  total:        number;
  order_status: string;
  notes:        string | null;
  created_at:   string;
  updated_at:   string;
  items:        OrderItem[];
}

const STATUS_COLOR: Record<string, string> = {
  pending:    'tag-outline',
  confirmed:  'tag-outline',
  processing: 'tag-outline',
  shipped:    'tag-outline',
  delivered:  'tag-accent',
  cancelled:  'tag-neutral',
  refunded:   'tag-neutral',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order,       setOrder]       = useState<Order | null>(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState('');
  const [cancelling,  setCancelling]  = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setOrder({ ...data.data, items: data.data.items ?? [] });
        else setError('Order not found.');
      })
      .catch(() => setError('Failed to load order.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError('');
    try {
      const res  = await fetch(`/api/orders/${order.order_id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ to_status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to cancel order.');
      setOrder((prev) => prev ? { ...prev, order_status: 'cancelled' } : prev);
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding:'36px', textAlign:'center' }}>
        <p className="text-muted">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding:'36px', textAlign:'center' }}>
        <p style={{ color:'#B91C1C' }}>{error || 'Order not found.'}</p>
        <Link href="/account" className="btn btn-secondary" style={{ marginTop:12 }}>
          Back to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding:'27.6px 36.8px', maxWidth:760, margin:'0 auto' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize:13, marginBottom:'18.4px' }}>
        <Link href="/account">Account</Link>
        <span className="text-muted"> / Orders / </span>
        <span className="text-muted">{order.order_ref}</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18.4px' }}>
        <div>
          <h2 style={{ margin:'0 0 4px' }}>{order.order_ref}</h2>
          <div className="text-muted" style={{ fontSize:13 }}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday:'long', year:'numeric', month:'long', day:'numeric',
            })}
          </div>
        </div>
        <span
          className={`tag ${STATUS_COLOR[order.order_status] ?? 'tag-outline'}`}
          style={{ fontSize:13, textTransform:'capitalize', padding:'4px 12px' }}
        >
          {order.order_status}
        </span>
      </div>

      {/* Items */}
      <div className="card" style={{ marginBottom:'18.4px', gap:0, padding:0, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--color-divider)', display:'flex', alignItems:'center', gap:8 }}>
          <Package size={15} color="var(--color-accent)" />
          <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15 }}>
            Order Items
          </span>
        </div>

        {order.items.length === 0 ? (
          <div style={{ padding:'24px', textAlign:'center', color:'var(--color-neutral-500)', fontSize:14 }}>
            No item details available.
          </div>
        ) : (
          <table className="table" style={{ margin:0 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th style={{ textAlign:'center' }}>Qty</th>
                <th style={{ textAlign:'right'  }}>Unit Price</th>
                <th style={{ textAlign:'right'  }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.order_item_id || item.variant_no}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:14 }}>{item.product_name}</div>
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <div style={{ fontSize:11, color:'var(--color-neutral-600)', marginTop:2 }}>
                        {Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize:12, color:'var(--color-neutral-600)' }}>
                    {item.sku}
                  </td>
                  <td style={{ textAlign:'center' }}>{item.quantity}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--font-heading)', fontWeight:600 }}>
                    ₹{Number(item.unit_price).toFixed(2)}
                  </td>
                  <td style={{ textAlign:'right', fontFamily:'var(--font-heading)', fontWeight:600 }}>
                    ₹{Number(item.total_price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'18.4px' }}>

        {/* Order summary */}
        <div className="card">
          <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, marginBottom:8 }}>
            Order Summary
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--color-accent-700)' }}>
                <span>Discount</span>
                <span>−₹{Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Tax</span>
              <span>₹{Number(order.tax).toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Delivery</span>
              <span>{order.delivery_fee === 0 ? 'Free' : `₹${Number(order.delivery_fee).toFixed(2)}`}</span>
            </div>
            <div style={{ height:1, background:'var(--color-divider)', margin:'4px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:17 }}>
              <span>Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order info */}
        <div className="card">
          <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, marginBottom:8 }}>
            Order Info
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Order Ref</span>
              <span style={{ fontWeight:600 }}>{order.order_ref}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Status</span>
              <span style={{ textTransform:'capitalize' }}>{order.order_status}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Placed</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span className="text-muted">Updated</span>
              <span>{new Date(order.updated_at).toLocaleDateString()}</span>
            </div>
            {order.notes && (
              <div>
                <span className="text-muted">Notes: </span>
                <span>{order.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {cancelError && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C', marginTop:'18.4px' }}>
          {cancelError}
        </div>
      )}
      <div style={{ display:'flex', gap:10, marginTop:'18.4px' }}>
        <Link href="/account" className="btn btn-secondary">
          ← Back to Orders
        </Link>
        {order.order_status === 'pending' && (
          <button
            className="btn btn-secondary"
            style={{ color:'#EF4444', borderColor:'#FEE2E2' }}
            disabled={cancelling}
            onClick={handleCancel}
          >
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
        {order.order_status === 'delivered' && (
          <Link href="/" className="btn btn-primary">
            Reorder
          </Link>
        )}
      </div>
    </div>
  );
}
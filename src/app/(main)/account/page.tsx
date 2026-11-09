'use client';
import { useState, useEffect, useCallback } from 'react';
import { Package, Heart, MapPin, CreditCard, Tag, Bell, Settings, LogOut, Plus, Pencil, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useAuthStore }     from '@/lib/store/auth';
import { useAddresses }     from '@/lib/hooks/useAddresses';
import { AddressModal }     from '@/components/account/AddressModal';
import { useRouter }        from 'next/navigation';
import type { Address }     from '@/lib/types';
import type { VariantListing } from '@/lib/api/variants';
import { useOrders }        from '@/lib/hooks/useOrders';
import Link                 from 'next/link';

const PAYMENT_METHODS = ['Visa •••• 4412 — exp 08/28', 'Mastercard •••• 7790 — exp 03/27'];

const COUPONS = [
  { code:'WELCOME10', desc:'10% off your first order', exp:'Aug 31, 2026' },
  { code:'FREESHIP',  desc:'Free shipping on orders $50+', exp:'ongoing'  },
];

const NOTIFICATIONS = [
  'Your order ORD-88190 has shipped',
  'Price drop: Trail Running Shoes now $94',
  '20% off Electronics this weekend',
];

const NAV_ITEMS = [
  { key:'orders',        label:'Orders',            icon:Package    },
  { key:'wishlist',      label:'Wishlist',           icon:Heart      },
  { key:'addresses',     label:'Addresses',          icon:MapPin     },
  { key:'payment',       label:'Payment Methods',    icon:CreditCard },
  { key:'coupons',       label:'Coupons',            icon:Tag        },
  { key:'notifications', label:'Notifications',      icon:Bell       },
  { key:'profile',       label:'Profile & Security', icon:Settings   },
  { key:'logout',        label:'Logout',             icon:LogOut     },
];

export default function AccountPage() {
  const router        = useRouter();
  const [tab, setTab] = useState('orders');

  const wishlistIds          = useWishlistStore((s) => s.ids);
  const toggleWishlist       = useWishlistStore((s) => s.toggle);
  const { customer, logout, setCustomer } = useAuthStore();

  const {
    addresses, isLoading: addrLoading, isSubmitting: addrSubmitting,
    error: addrError, fetch: fetchAddresses, create, update, remove,
  } = useAddresses();

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [editAddress,   setEditAddress]   = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Profile form state ──────────────────────────────────────────────────────
  const [profileForm,    setProfileForm]    = useState({ first_name: '', last_name: '', mobile_no: '' });
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError,   setProfileError]   = useState('');

  useEffect(() => {
    if (customer) {
      setProfileForm({
        first_name: customer.first_name ?? '',
        last_name:  customer.last_name  ?? '',
        mobile_no:  customer.mobile_no  ?? '',
      });
    }
  }, [customer]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);
    try {
      const res  = await fetch('/api/me', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          first_name: profileForm.first_name,
          last_name:  profileForm.last_name,
          mobile_no:  profileForm.mobile_no || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to save.');
      if (data?.data && customer) {
        setCustomer({ ...customer, ...data.data });
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Wishlist variants ───────────────────────────────────────────────────────
  const [wishlistVariants,      setWishlistVariants]      = useState<VariantListing[]>([]);
  const [wishlistLoading,       setWishlistLoading]       = useState(false);

  const fetchWishlistVariants = useCallback(async () => {
    if (wishlistIds.length === 0) { setWishlistVariants([]); return; }
    setWishlistLoading(true);
    try {
      const res  = await fetch('/api/variants');
      const data = await res.json();
      const all: VariantListing[] = Array.isArray(data?.data) ? data.data : [];
      // one card per product — keep the first variant encountered per product_id
      const seen  = new Set<string>();
      const items = all.filter((v) => {
        if (!wishlistIds.includes(v.product_id) || seen.has(v.product_id)) return false;
        seen.add(v.product_id);
        return true;
      });
      setWishlistVariants(items);
    } catch {
      setWishlistVariants([]);
    } finally {
      setWishlistLoading(false);
    }
  }, [wishlistIds]);

  // ── Orders ──────────────────────────────────────────────────────────────────
  const { orders, isLoading: ordersLoading, fetch: fetchOrders } = useOrders();

  useEffect(() => {
    if (tab === 'addresses') fetchAddresses();
    if (tab === 'orders')    fetchOrders();
    if (tab === 'wishlist')  fetchWishlistVariants();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleAddrSubmit = async (data: Partial<Address>) => {
    if (editAddress) {
      await update(editAddress.address_id, data);
    } else {
      await create(data);
    }
    setAddrModalOpen(false);
    setEditAddress(null);
  };

  const handleDeleteAddress = async (id: string) => {
    await remove(id);
    setDeleteConfirm(null);
  };

  const fullName = customer
    ? `${customer.first_name} ${customer.last_name}`
    : 'My Account';

  const initials = customer
    ? `${customer.first_name[0]}${customer.last_name[0]}`.toUpperCase()
    : 'ME';

  return (
    <div className="container" style={{ padding:'27.6px 36.8px' }}>

      {/* Profile header */}
      <div className="flex items-center gap-3 mb-8">
        <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--color-accent-200)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:18, color:'var(--color-accent-800)', flexShrink:0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ margin:0 }}>{fullName}</h2>
          <div className="text-muted" style={{ fontSize:13 }}>
            {customer?.email_id}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'27.6px' }}>

        {/* Sidebar */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => key === 'logout' ? handleLogout() : setTab(key)}
              style={{ padding:'9.2px 13.8px', borderRadius:'var(--radius-md)', cursor:'pointer', border:`1px solid ${tab === key ? 'var(--color-accent)' : 'transparent'}`, color: tab === key ? 'var(--color-accent-700)' : key === 'logout' ? '#EF4444' : 'var(--color-text)', background:'none', width:'100%', fontFamily:'var(--font-body)', fontSize:14, display:'flex', alignItems:'center', gap:8, textAlign:'left' }}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div>

          {/* Orders */}
          {tab === 'orders' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Orders</h3>

              {ordersLoading ? (
                <p className="text-muted" style={{ fontSize:14 }}>Loading orders…</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign:'center', padding:'36px', color:'var(--color-neutral-500)' }}>
                  <Package size={32} style={{ margin:'0 auto 8px', opacity:0.4 }} />
                  <p style={{ margin:0, fontSize:14 }}>No orders yet.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order Ref</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.order_id}>
                        <td style={{ fontFamily:'var(--font-heading)', fontWeight:600 }}>
                          {o.order_ref}
                        </td>
                        <td>
                          {new Date(o.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td>
                          <span
                            className={`tag ${
                              o.order_status === 'delivered'  ? 'tag-accent'  :
                              o.order_status === 'cancelled'  ? 'tag-neutral' :
                              'tag-outline'
                            }`}
                            style={{ fontSize:11, textTransform:'capitalize' }}
                          >
                            {o.order_status}
                          </span>
                        </td>
                        <td style={{ fontFamily:'var(--font-heading)', fontWeight:600 }}>
                          ${Number(o.total).toFixed(2)}
                        </td>
                        <td>
                          <Link
                            href={`/account/orders/${o.order_id}`}
                            style={{ fontSize:12, color:'var(--color-accent-700)' }}
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* Wishlist */}
          {tab === 'wishlist' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Wishlist</h3>

              {wishlistLoading ? (
                <p className="text-muted" style={{ fontSize:14 }}>Loading wishlist…</p>
              ) : wishlistVariants.length === 0 ? (
                <div style={{ textAlign:'center', padding:'36px', color:'var(--color-neutral-500)' }}>
                  <Heart size={32} style={{ margin:'0 auto 8px', opacity:0.4 }} />
                  <p style={{ margin:0, fontSize:14 }}>Your wishlist is empty.</p>
                  <Link href="/" className="btn btn-primary" style={{ marginTop:12, display:'inline-flex', fontSize:13 }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'13.8px' }}>
                  {wishlistVariants.map((v) => {
                    const price = v.selling_price ?? v.mrp ?? 0;
                    const stock = v.stock_qty > 5 ? 'in' : v.stock_qty > 0 ? 'low' : 'out';
                    return (
                      <div key={v.variant_id} className="card elev-sm" style={{ padding:0, overflow:'hidden' }}>
                        {/* Image */}
                        <Link href={`/product/${v.slug}`} style={{ display:'block' }}>
                          <div style={{ aspectRatio:'1/1', background:'var(--color-neutral-100)', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {v.image_url ? (
                              <img src={v.image_url} alt={v.product_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            ) : (
                              <span style={{ fontSize:11, color:'var(--color-neutral-500)', fontFamily:'monospace', padding:'0 8px', textAlign:'center' }}>{v.product_name}</span>
                            )}
                          </div>
                        </Link>
                        {/* Info */}
                        <div style={{ padding:'11px 13px' }}>
                          <Link href={`/product/${v.slug}`} style={{ fontWeight:600, fontSize:13, display:'block', marginBottom:4, color:'var(--color-text)', textDecoration:'none' }}>
                            {v.product_name}
                          </Link>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15 }}>
                              ${price.toFixed(2)}
                            </span>
                            <span className={`tag ${stock === 'in' ? 'tag-accent' : stock === 'low' ? 'tag-outline' : 'tag-neutral'}`} style={{ fontSize:10 }}>
                              {stock === 'in' ? 'In Stock' : stock === 'low' ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleWishlist(v.product_id)}
                            style={{ marginTop:8, width:'100%', padding:'6px', background:'none', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', color:'#EF4444', fontSize:12, cursor:'pointer', fontFamily:'var(--font-body)' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Addresses */}
          {tab === 'addresses' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'13.8px' }}>
                <h3 style={{ margin:0 }}>Addresses</h3>
                <button
                  className="btn btn-primary"
                  style={{ fontSize:13 }}
                  onClick={() => { setEditAddress(null); setAddrModalOpen(true); }}
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {addrError && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C', marginBottom:12 }}>
                  {addrError}
                </div>
              )}

              {addrLoading ? (
                <p className="text-muted">Loading addresses…</p>
              ) : addresses.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'36px', color:'var(--color-neutral-500)' }}>
                  <MapPin size={32} style={{ margin:'0 auto 8px', opacity:0.4 }} />
                  <p style={{ margin:0, fontSize:14 }}>No addresses yet.</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop:12, fontSize:13 }}
                    onClick={() => { setEditAddress(null); setAddrModalOpen(true); }}
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {addresses.map((a) => (
                    <div key={a.address_id} className="card" style={{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span className="card-title" style={{ fontSize:14 }}>{a.label}</span>
                          {a.is_default && <span className="tag tag-accent" style={{ fontSize:10 }}>Default</span>}
                        </div>
                        <div className="text-muted" style={{ fontSize:13 }}>
                          {a.address_line1}
                          {a.address_line2 && `, ${a.address_line2}`}
                        </div>
                        <div className="text-muted" style={{ fontSize:13 }}>
                          {a.city}, {a.state}, {a.country}
                          {a.postal_code && ` — ${a.postal_code}`}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <button
                          className="btn btn-icon"
                          title="Edit"
                          onClick={() => { setEditAddress(a); setAddrModalOpen(true); }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Delete"
                          style={{ borderColor:'#FEE2E2', color:'#EF4444' }}
                          onClick={() => setDeleteConfirm(a.address_id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Payment */}
          {tab === 'payment' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Payment Methods</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {PAYMENT_METHODS.map((pm) => (
                  <div key={pm} className="card" style={{ flexDirection:'row', alignItems:'center', gap:9 }}>
                    <CreditCard size={16} />{pm}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Coupons */}
          {tab === 'coupons' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Coupons</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {COUPONS.map((c) => (
                  <div key={c.code} className="card">
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span className="card-title" style={{ fontSize:14 }}>{c.code}</span>
                      <span className="tag tag-accent">{c.exp}</span>
                    </div>
                    <div className="text-muted" style={{ fontSize:13 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Notifications</h3>
              <div style={{ display:'flex', flexDirection:'column' }}>
                {NOTIFICATIONS.map((n) => (
                  <div key={n} style={{ padding:'9.2px 0', borderBottom:'1px solid var(--color-divider)', fontSize:13 }}>{n}</div>
                ))}
              </div>
            </>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <>
              <h3 style={{ marginBottom:'13.8px' }}>Profile & Security</h3>

              {profileError && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FEE2E2', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#B91C1C', marginBottom:12 }}>
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:13, color:'#15803D', marginBottom:12 }}>
                  Profile saved successfully.
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'13.8px', maxWidth:520 }}>
                <div className="field">
                  <label>First name</label>
                  <input
                    className="input"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input
                    className="input"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="input" value={customer?.email_id ?? ''} readOnly style={{ opacity:0.7 }} />
                </div>
                <div className="field">
                  <label>Mobile</label>
                  <input
                    className="input"
                    value={profileForm.mobile_no}
                    onChange={(e) => setProfileForm((f) => ({ ...f, mobile_no: e.target.value }))}
                    placeholder="+91 98XXXXXXXX"
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ marginTop:16 }}
                onClick={handleProfileSave}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Address modal */}
      <AddressModal
        open={addrModalOpen}
        onClose={() => { setAddrModalOpen(false); setEditAddress(null); }}
        onSubmit={handleAddrSubmit}
        editItem={editAddress}
        isSubmitting={addrSubmitting}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(32,31,29,0.5)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="card" style={{ padding:'28px', maxWidth:380, gap:16, textAlign:'center' }}>
            <Trash2 size={32} color="#EF4444" style={{ margin:'0 auto' }} />
            <h3 style={{ margin:0 }}>Delete Address</h3>
            <p className="text-muted" style={{ margin:0, fontSize:14 }}>
              Are you sure you want to delete this address? This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background:'#EF4444', borderColor:'#EF4444' }}
                disabled={addrSubmitting}
                onClick={() => handleDeleteAddress(deleteConfirm)}
              >
                {addrSubmitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

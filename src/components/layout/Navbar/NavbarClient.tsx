'use client';
import { useState, useRef, useEffect } from 'react';
import Link             from 'next/link';
import { useRouter }    from 'next/navigation';
import { ShoppingBag, Heart, User, Search, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore }     from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import { useAuthStore }     from '@/lib/store/auth';
import type { Category }    from '@/lib/types';

interface Props {
  navItems: Category[];
}

export function NavbarClient({ navItems }: Props) {
  const router        = useRouter();
  const itemCount     = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.count);
  const { customer, isLoggedIn, logout } = useAuthStore();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  };

  const initials = customer
    ? `${customer.first_name?.[0] ?? ''}${customer.last_name?.[0] ?? ''}`.toUpperCase()
    : '';

  const iconBtn: React.CSSProperties = {
    width: 36, height: 36, padding: 0,
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    border: '1px solid var(--color-divider)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative',
    color: 'var(--color-text)', transition: 'background 0.14s, border-color 0.14s',
    flexShrink: 0, textDecoration: 'none',
  };

  return (
    <>
      {/* ── Desktop action bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>

        {/* Search */}
        <div ref={searchRef} style={{ position:'relative' }}>
          {searchOpen ? (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--color-surface)', border:'1px solid var(--color-accent)', borderRadius:'var(--radius-md)', padding:'0 10px', height:36 }}>
              <Search size={14} style={{ color:'var(--color-accent)', flexShrink:0 }} />
              <input
                ref={searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                placeholder="Search products…"
                style={{ border:'none', outline:'none', background:'transparent', fontSize:13, color:'var(--color-text)', width:180, fontFamily:'var(--font-body)' }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-neutral-500)', display:'flex', padding:0 }}>
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={iconBtn}
              aria-label="Search"
              className="nav-icon-btn"
            >
              <Search size={16} />
            </button>
          )}
        </div>

        {/* Wishlist */}
        <Link href="/account/wishlist" style={iconBtn} aria-label="Wishlist" className="nav-icon-btn">
          <Heart size={16} />
          {wishlistCount > 0 && (
            <span style={{ position:'absolute', top:-5, right:-5, minWidth:17, height:17, borderRadius:9, background:'var(--color-accent)', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', lineHeight:1 }}>
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Cart */}
        <Link href="/cart" style={iconBtn} aria-label="Cart" className="nav-icon-btn">
          <ShoppingBag size={16} />
          {itemCount > 0 && (
            <span style={{ position:'absolute', top:-5, right:-5, minWidth:17, height:17, borderRadius:9, background:'var(--color-accent)', color:'#fff', fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', lineHeight:1 }}>
              {itemCount}
            </span>
          )}
        </Link>

        {/* Account */}
        {isLoggedIn ? (
          <div ref={accountRef} style={{ position:'relative' }}>
            <button
              onClick={() => setAccountOpen((v) => !v)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px 4px 4px', borderRadius:'var(--radius-md)', background: accountOpen ? 'var(--color-surface)' : 'transparent', border:'1px solid', borderColor: accountOpen ? 'var(--color-accent)' : 'var(--color-divider)', cursor:'pointer', transition:'all 0.14s', height:36 }}
              aria-label="Account menu"
            >
              <span style={{ width:26, height:26, borderRadius:'50%', background:'var(--color-accent)', color:'#fff', fontSize:10, fontWeight:700, fontFamily:'var(--font-heading)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, letterSpacing:'0.04em' }}>
                {initials || <User size={12} />}
              </span>
              <span style={{ fontSize:13, fontFamily:'var(--font-heading)', fontWeight:600, maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--color-text)' }}>
                {customer?.first_name}
              </span>
              <ChevronDown size={11} style={{ color:'var(--color-neutral-500)', flexShrink:0, transform: accountOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.15s' }} />
            </button>

            {accountOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'var(--color-bg)', border:'1px solid var(--color-divider)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-md)', minWidth:168, padding:6, zIndex:200 }}>
                <div style={{ padding:'8px 12px 6px', borderBottom:'1px solid var(--color-divider)', marginBottom:4 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--color-neutral-600)', fontFamily:'var(--font-heading)' }}>
                    {customer?.first_name} {customer?.last_name}
                  </div>
                  <div style={{ fontSize:11, color:'var(--color-neutral-500)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis' }}>
                    {customer?.email_id}
                  </div>
                </div>
                <Link href="/account" onClick={() => setAccountOpen(false)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:'var(--radius-md)', fontSize:13, color:'var(--color-text)', textDecoration:'none', transition:'background 0.12s' }} className="hover:bg-[var(--color-surface)]">
                  <User size={13} />
                  My Account
                </Link>
                <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 10px', borderRadius:'var(--radius-md)', fontSize:13, color:'#C53030', background:'none', border:'none', cursor:'pointer', transition:'background 0.12s', textAlign:'left' }} className="hover:bg-red-50">
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0 14px', height:36, borderRadius:'var(--radius-md)', background:'var(--color-accent)', color:'#fff', fontSize:13, fontFamily:'var(--font-heading)', fontWeight:600, textDecoration:'none', transition:'background 0.14s', border:'1.5px solid var(--color-accent)' }}
            className="hover:no-underline"
          >
            <User size={14} />
            Sign In
          </Link>
        )}

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          style={{ ...iconBtn, display:'none' }}
          className="mobile-hamburger"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div style={{ position:'fixed', top:63, left:0, right:0, background:'var(--color-bg)', borderBottom:'1px solid var(--color-divider)', boxShadow:'var(--shadow-md)', zIndex:150, paddingBottom:12 }}>
          {navItems.map((cat) => (
            <Link
              key={cat.category_id}
              href={`/category/${cat.slug}`}
              onClick={() => setMobileOpen(false)}
              style={{ display:'block', padding:'11px 20px', fontSize:14, fontFamily:'var(--font-heading)', fontWeight:600, color:'var(--color-text)', borderBottom:'1px solid var(--color-divider)', textDecoration:'none' }}
            >
              {cat.category_name}
            </Link>
          ))}
          <div style={{ padding:'12px 20px 4px', display:'flex', gap:12 }}>
            {isLoggedIn ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)} style={{ fontSize:13, color:'var(--color-accent-700)', fontWeight:600 }}>My Account</Link>
                <button onClick={() => { setMobileOpen(false); handleLogout(); }} style={{ background:'none', border:'none', fontSize:13, color:'#C53030', cursor:'pointer', fontWeight:600, padding:0 }}>Sign Out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ fontSize:13, color:'var(--color-accent-700)', fontWeight:600 }}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

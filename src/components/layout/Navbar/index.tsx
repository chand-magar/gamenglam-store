import Link from 'next/link';
import { NavbarClient } from './NavbarClient';
import { getCategories } from '@/lib/api/categories';
import type { Category } from '@/lib/types';

function MegaMenu({ subCategories }: { subCategories: Category[] }) {
  if (subCategories.length === 0) return null;
  return (
    <div className="mega-menu" style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', background:'var(--color-bg)', border:'1px solid var(--color-divider)', borderTop:'2px solid var(--color-accent)', borderRadius:'0 0 var(--radius-lg) var(--radius-lg)', boxShadow:'var(--shadow-md)', minWidth:180, padding:'8px 0', zIndex:100 }}>
      {subCategories.map((sub) => (
        <Link key={sub.category_id} href={`/category/${sub.slug}`} style={{ display:'block', padding:'7px 18px', fontSize:13, color:'var(--color-text)', transition:'background 0.12s' }} className="hover:bg-[var(--color-surface)] hover:no-underline">
          {sub.category_name}
        </Link>
      ))}
    </div>
  );
}

export async function Navbar() {
  const categories = await getCategories();

  const topLevel = categories.filter((c) => c.parent_id === null || c.parent_id === undefined);
  const subMap   = categories.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parent_id) { acc[c.parent_id] = [...(acc[c.parent_id] ?? []), c]; }
    return acc;
  }, {});

  return (
    <>
      {/* ── Announcement bar ── */}
      <div style={{ background:'linear-gradient(90deg, var(--color-accent-800) 0%, var(--color-accent-700) 50%, var(--color-accent-800) 100%)', color:'#fff', textAlign:'center', fontSize:12, fontFamily:'var(--font-heading)', fontWeight:600, letterSpacing:'0.05em', padding:'7px 16px', lineHeight:1.4 }}>
        🚚 Free delivery on orders above ₹499 &nbsp;·&nbsp; Use code <span style={{ background:'rgba(255,255,255,0.2)', padding:'1px 7px', borderRadius:3 }}>GNG10</span> for 10% off your first order
      </div>

      {/* ── Main header ── */}
      <header style={{ position:'sticky', top:0, zIndex:50, background:'var(--color-bg)', borderBottom:'1px solid var(--color-divider)', boxShadow:'var(--shadow-sm)' }}>
        <div className="container">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:60, gap:16 }}>

            {/* ── Logo ── */}
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:9, textDecoration:'none', flexShrink:0 }} className="hover:no-underline">
              <span style={{ width:34, height:34, borderRadius:'var(--radius-md)', background:'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-700) 100%)', color:'#fff', fontFamily:'var(--font-heading)', fontWeight:600, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', letterSpacing:'0.04em', flexShrink:0 }}>
                GnG
              </span>
              <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:18, color:'var(--color-text)', lineHeight:1.1 }}>
                Game n Glam
              </span>
            </Link>

            {/* ── Category nav (desktop) ── */}
            <nav style={{ display:'flex', alignItems:'center', gap:2, flex:1, justifyContent:'center' }} className="desktop-nav">
              {topLevel.map((cat) => {
                const subs = subMap[cat.category_id] ?? [];
                return (
                  <div key={cat.category_id} style={{ position:'relative' }} className="nav-item">
                    <span
                      style={{ display:'flex', alignItems:'center', gap:3, padding:'6px 10px', fontSize:13, fontFamily:'var(--font-heading)', fontWeight:600, color:'var(--color-neutral-700)', borderRadius:'var(--radius-md)', transition:'color 0.14s', whiteSpace:'nowrap', cursor:'default', userSelect:'none' }}
                      className="nav-link"
                    >
                      {cat.category_name}
                      {subs.length > 0 && (
                        <span style={{ fontSize:8, opacity:0.5, marginTop:1 }}>▼</span>
                      )}
                    </span>
                    {subs.length > 0 && <MegaMenu subCategories={subs} />}
                  </div>
                );
              })}
            </nav>

            {/* ── Right actions ── */}
            <NavbarClient navItems={topLevel} />
          </div>
        </div>

        {/* Gold accent rule */}
        <div style={{ height:2, background:'linear-gradient(90deg, transparent 0%, var(--color-accent-400) 30%, var(--color-accent) 50%, var(--color-accent-400) 70%, transparent 100%)' }} />

        <style>{`
          .nav-item .mega-menu { display: none; }
          .nav-item:hover .mega-menu { display: block; }
          .nav-link { position: relative; }
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 2px; left: 10px; right: 10px;
            height: 1.5px;
            background: var(--color-accent);
            transform: scaleX(0);
            transform-origin: center;
            transition: transform 0.2s ease;
          }
          .nav-link:hover { color: var(--color-text) !important; }
          .nav-link:hover::after { transform: scaleX(1); }
          .nav-icon-btn:hover { background: var(--color-surface) !important; border-color: var(--color-neutral-300) !important; }
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-hamburger { display: inline-flex !important; }
          }
        `}</style>
      </header>
    </>
  );
}

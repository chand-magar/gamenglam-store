import Link                               from 'next/link';
import { HomeTabsClient }                from '@/components/home/HomeTabsClient';
import type { HomeSection }             from '@/components/home/HomeTabsClient';
import { Newsletter }                    from '@/components/home/Newsletter';
import { HOME_REVIEWS }      from '@/lib/data/products';
import { getCategories }     from '@/lib/api/categories';
import { getVariantListing } from '@/lib/api/variants';

/* ─── category icon map ─────────────────── */
const ICON_MAP: Record<string, string> = {
  /* sports */
  cricket:'🏏', football:'⚽', basketball:'🏀', badminton:'🏸',
  tennis:'🎾', swimming:'🏊', cycling:'🚴', running:'🏃',
  fitness:'💪', gym:'🏋️', yoga:'🧘', sport:'🏅',
  /* fashion */
  clothing:'👕', apparel:'👕', fashion:'👗', footwear:'👟',
  shoes:'👟', accessories:'🎽', bags:'👜', luggage:'🧳',
  jewel:'💍', watch:'⌚',
  /* electronics */
  electronics:'💻', mobile:'📱', phone:'📱', laptop:'💻',
  computer:'🖥️', gadget:'📡', camera:'📷', audio:'🎧',
  tv:'📺', gaming:'🎮',
  /* home */
  home:'🏠', kitchen:'🍳', furniture:'🪑', decor:'🪴',
  bedding:'🛏️', appliance:'🔌',
  /* beauty & health */
  beauty:'💄', skincare:'🧴', makeup:'💋', cosmetics:'💄',
  health:'💊', wellness:'🌿', nutrition:'🥗',
  /* kids & more */
  toys:'🧸', kids:'🧸', baby:'🍼', books:'📚',
  stationery:'✏️', grocery:'🛒', food:'🍎', snacks:'🍿',
};
function icon(name: string) {
  const l = name.toLowerCase();
  for (const [k, v] of Object.entries(ICON_MAP)) { if (l.includes(k)) return v; }
  return '🛍️';
}

const GRADIENTS = [
  'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)',
  'linear-gradient(135deg,#1d4ed8 0%,#60a5fa 100%)',
  'linear-gradient(135deg,#065f46 0%,#34d399 100%)',
  'linear-gradient(135deg,#6d28d9 0%,#c084fc 100%)',
  'linear-gradient(135deg,#9f1239 0%,#fb7185 100%)',
  'linear-gradient(135deg,#0e7490 0%,#22d3ee 100%)',
  'linear-gradient(135deg,#854d0e 0%,#fbbf24 100%)',
  'linear-gradient(135deg,#064e3b 0%,#6ee7b7 100%)',
];

const FEATURES = [
  { icon:'🚚', title:'Free Delivery',  sub:'On orders above ₹499'        },
  { icon:'🔄', title:'Easy Returns',   sub:'10-day hassle-free returns'   },
  { icon:'🔒', title:'Secure Payments',sub:'100% safe & encrypted'        },
  { icon:'💬', title:'24/7 Support',   sub:'Always here to help'          },
];

const MARQUEE = [
  'FASHION','ELECTRONICS','HOME & KITCHEN','BEAUTY','SPORTS',
  'FOOTWEAR','GADGETS','TOYS','BOOKS','WELLNESS','ACCESSORIES','APPAREL',
];

export default async function HomePage() {
  const [categories, variants] = await Promise.all([
    getCategories(),
    getVariantListing(),
  ]);

  const topLevel  = categories.filter((c) => !c.parent_id).slice(0, 8);
  const firstSlug = topLevel[0]?.slug ?? '/';
  const heroCards = topLevel.slice(0, 4);

  // Map every category_id → its top-level parent category_id
  const parentMap: Record<string, string> = {};
  for (const cat of categories) {
    parentMap[cat.category_id] = cat.parent_id ?? cat.category_id;
  }

  // Group variants by top-level category
  const variantsByCat: Record<string, typeof variants> = {};
  for (const v of variants) {
    const topId = parentMap[v.category_id] ?? v.category_id;
    (variantsByCat[topId] ??= []).push(v);
  }

  const sections: HomeSection[] = topLevel
    .map((cat) => ({ category: cat, variants: (variantsByCat[cat.category_id] ?? []).slice(0, 8) }))
    .filter((s) => s.variants.length > 0);

  const featuredVariants = variants.filter((v) => v.is_featured).slice(0, 8);

  return (
    <>
      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero-section">
        <div className="container" style={{ position:'relative', zIndex:2, width:'100%' }}>
          <div className="hero-grid">

            {/* Left — copy */}
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Millions of Products · One Store
              </div>

              <h1 className="hero-heading">
                SHOP<br />
                <em>YOUR</em><br />
                WORLD.
              </h1>

              <p className="hero-sub">
                Fashion, Electronics, Home & Kitchen, Beauty, Sports and more — everything you need, delivered fast across India.
              </p>

              <div className="hero-actions">
                <Link href={`/category/${firstSlug}`} className="hero-btn-main">
                  Start Shopping
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/category" className="hero-btn-ghost">
                  All Departments
                </Link>
              </div>

              <div className="hero-stats">
                {[
                  { val:'500+',  label:'Products'       },
                  { val:'4.8★',  label:'Avg. Rating'    },
                  { val:'₹499+', label:'Free Delivery'  },
                ].map((s) => (
                  <div key={s.label} className="hero-stat">
                    <div className="hero-stat-val">{s.val}</div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — category preview cards */}
            <div className="hero-cards">
              {heroCards.map((cat) => (
                <Link key={cat.category_id} href={`/category/${cat.slug}`} className="hero-card">
                  <div className="hero-card-icon">{icon(cat.category_name)}</div>
                  <div className="hero-card-name">{cat.category_name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MARQUEE
      ══════════════════════════════════════ */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} style={{
              fontSize:11, fontWeight:700, letterSpacing:'0.2em',
              color: i % 2 === 0 ? '#fff' : 'rgba(255,255,255,0.38)',
              padding:'0 28px', fontFamily:'var(--font-body)',
            }}>
              {w} ✦
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURES
      ══════════════════════════════════════ */}
      <div className="feature-strip">
        <div className="container">
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-item">
                <div className="feature-item-icon">{f.icon}</div>
                <div>
                  <div className="feature-item-title">{f.title}</div>
                  <div className="feature-item-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DEPARTMENTS
      ══════════════════════════════════════ */}
      {topLevel.length > 0 && (
        <section className="store-section" style={{ background:'#fff' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="section-label">Browse</span>
                <h2 className="section-title">Shop by Category</h2>
              </div>
              <Link href="/category" className="section-head-link">
                All categories
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16 }}>
              {topLevel.map((cat, i) => (
                <Link
                  key={cat.category_id}
                  href={`/category/${cat.slug}`}
                  className="cat-tile"
                  style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                >
                  <div className="cat-tile-icon">{icon(cat.category_name)}</div>
                  <div className="cat-tile-name">{cat.category_name}</div>
                  <div className="cat-tile-arrow">Shop now →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          PRODUCTS
      ══════════════════════════════════════ */}
      <section className="store-section" style={{ background:'var(--color-surface)' }}>
        <div className="container">
          <HomeTabsClient sections={sections} featuredVariants={featuredVariants} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          TRUST / IMPACT NUMBERS
      ══════════════════════════════════════ */}
      <section style={{
        background:'#080808',
        padding:'64px 0', position:'relative', overflow:'hidden',
      }}>
        {/* Diagonal texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(-55deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 44px)', pointerEvents:'none' }} />
        {/* Indigo bloom */}
        <div style={{ position:'absolute', width:700, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(79,70,229,0.18) 0%,transparent 70%)', top:'-50%', right:'-5%', pointerEvents:'none' }} />

        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(129,140,248,0.8)', marginBottom:10, fontFamily:'var(--font-body)' }}>Why Game n Glam</span>
            <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(26px,3.5vw,38px)', fontWeight:600, color:'#fff', lineHeight:1.05 }}>Everything you need, in one place</h2>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0 }}>
            {[
              { val:'500+',  label:'Products Listed',    sub:'Across all categories'       },
              { val:'4.8★',  label:'Customer Rating',    sub:'Trusted by 2,000+ shoppers'  },
              { val:'₹499',  label:'Free Delivery From', sub:'Fast delivery across India'  },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding:'12px 40px', textAlign:'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontFamily:'var(--font-heading)', fontSize:'clamp(38px,5vw,58px)', fontWeight:700, color:'#fff', lineHeight:1, marginBottom:8 }}>{s.val}</div>
                <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.88)', marginBottom:5, fontFamily:'var(--font-body)' }}>{s.label}</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════ */}
      <section className="store-section" style={{ background:'#fff' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-label">Testimonials</span>
              <h2 className="section-title">Loved by our customers</h2>
            </div>
          </div>
          <div className="reviews-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:22 }}>
            {HOME_REVIEWS.map((r) => (
              <div key={r.name} className="review-card">
                <div className="review-quote">&ldquo;</div>
                <div className="review-stars">★★★★★</div>
                <p className="review-text">{r.text}</p>
                <div>
                  <div className="review-author">{r.name}</div>
                  <div className="review-product">{r.product}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════ */}
      <Newsletter />
    </>
  );
}

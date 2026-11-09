'use client';
import Link from 'next/link';
import type { VariantListing } from '@/lib/api/variants';
import type { Category } from '@/lib/types';

export interface HomeSection {
  category: Category;
  variants: VariantListing[];
}

interface Props {
  sections:         HomeSection[];
  featuredVariants: VariantListing[];
}

export function HomeTabsClient({ sections, featuredVariants }: Props) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:64 }}>

      {/* Featured section — only if admin marked any products is_featured */}
      {featuredVariants.length > 0 && (
        <ProductSection
          label="Editor's Pick"
          title="Top Picks For You"
          variants={featuredVariants}
          viewAllHref="/products"
        />
      )}

      {/* One section per top-level category */}
      {sections.map(({ category, variants }) => (
        <ProductSection
          key={category.category_id}
          label={category.category_name}
          title={`Trending in ${category.category_name}`}
          variants={variants}
          viewAllHref={`/category/${category.slug}`}
        />
      ))}

      {/* Fallback: no products at all */}
      {featuredVariants.length === 0 && sections.length === 0 && (
        <div style={{ textAlign:'center', padding:'72px 0', color:'var(--color-neutral-500)' }}>
          <div style={{ fontSize:44, marginBottom:14 }}>🛍️</div>
          <p style={{ fontFamily:'var(--font-heading)', fontSize:20, margin:'0 0 6px', color:'var(--color-text)' }}>
            No products yet.
          </p>
          <p style={{ fontSize:13, margin:0 }}>Add products in the admin console to have them appear here.</p>
        </div>
      )}
    </div>
  );
}

function ProductSection({ label, title, variants, viewAllHref }: {
  label:       string;
  title:       string;
  variants:    VariantListing[];
  viewAllHref: string;
}) {
  return (
    <div>
      <div className="section-head" style={{ marginBottom:24 }}>
        <div>
          <span className="section-label">{label}</span>
          <h2 className="section-title" style={{ margin:0 }}>{title}</h2>
        </div>
        <Link href={viewAllHref} className="section-head-link">
          View all
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className="products-grid">
        {variants.map((v) => <VariantCard key={v.variant_id} variant={v} />)}
      </div>
    </div>
  );
}

function VariantCard({ variant }: { variant: VariantListing }) {
  const price    = variant.selling_price ?? variant.mrp ?? 0;
  const mrp      = variant.mrp && variant.selling_price && variant.mrp > variant.selling_price
    ? variant.mrp : null;
  const discount = mrp ? Math.round((1 - price / mrp) * 100) : null;
  const isLow    = variant.stock_qty > 0 && variant.stock_qty <= 4;

  return (
    <Link href={`/product/${variant.slug}`} className="product-card">
      <div className="product-card-img-wrap">
        {variant.image_url ? (
          <img
            src={variant.image_url}
            alt={variant.product_name}
            className="product-card-img"
          />
        ) : (
          <div className="product-card-no-img">🏆</div>
        )}

        <div className="product-card-overlay">
          <div className="product-card-overlay-btn">View Product</div>
        </div>

        {discount !== null && (
          <div className="product-card-badge">-{discount}%</div>
        )}
        {variant.is_featured && !discount && (
          <div className="product-card-featured-badge">Featured</div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-name">{variant.product_name}</div>
        <div className="product-card-price-row">
          <span className="product-card-price">
            ₹{price.toLocaleString('en-IN', { minimumFractionDigits:0, maximumFractionDigits:0 })}
          </span>
          {mrp && (
            <span className="product-card-mrp">
              ₹{mrp.toLocaleString('en-IN', { minimumFractionDigits:0, maximumFractionDigits:0 })}
            </span>
          )}
        </div>
        {isLow && (
          <div className="product-card-low-stock">⚡ Only {variant.stock_qty} left</div>
        )}
      </div>
    </Link>
  );
}

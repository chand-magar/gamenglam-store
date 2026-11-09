import Link         from 'next/link';
import { notFound } from 'next/navigation';
import { ProductDetailClient }            from './ProductDetailClient';
import { getProductBySlug }               from '@/lib/api/products';
import { getProductVariants, getVariantImages, getProductAttributes, getVariantListing } from '@/lib/api/variants';
import { getCategories }                  from '@/lib/api/categories';
import { getProductReviews }              from '@/lib/api/reviews';
import type { VariantListing }            from '@/lib/api/variants';
import type { Metadata }                  from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return { title: product.product_name, description: product.description ?? undefined };
}

export default async function ProductPage({ params }: Props) {
  const { slug }  = await params;
  const product   = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, listingVariants, variants, attributes, reviews] = await Promise.all([
    getCategories(),
    getVariantListing(),
    getProductVariants(product.product_id),
    getProductAttributes(product.product_id),
    getProductReviews(product.product_id),
  ]);

  const defaultVariant = variants.find((v) => v.stock_qty > 0) ?? variants[0];
  const initialImages  = defaultVariant
    ? await getVariantImages(defaultVariant.variant_id)
    : [];

  const category = categories.find((c) => c.category_id === product.category_id);
  const related  = listingVariants
    .filter((v) => v.category_id === product.category_id && v.product_id !== product.product_id)
    .slice(0, 4);

  const gallery: string[] = [];
  if (product.image_url) gallery.push(product.image_url);
  for (const img of initialImages) {
    if (!gallery.includes(img.image_url)) gallery.push(img.image_url);
  }

  return (
    <div className="container" style={{ padding:'27.6px 36.8px' }}>
      <div style={{ fontSize:13, marginBottom:'13.8px' }}>
        <Link href="/">Home</Link>
        <span className="text-muted"> / </span>
        {category && (
          <>
            <Link href={`/category/${category.slug}`}>{category.category_name}</Link>
            <span className="text-muted"> / </span>
          </>
        )}
        <span className="text-muted">{product.product_name}</span>
      </div>

      <ProductDetailClient
        product={product}
        reviews={reviews}
        gallery={gallery}
        variants={variants}
        attributes={attributes}
        initialVariantId={defaultVariant?.variant_id ?? null}
      />

      {related.length > 0 && (
        <div style={{ paddingTop:'36.8px' }}>
          <h2 style={{ marginBottom:'18.4px' }}>You may also like</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18.4px' }}>
            {related.map((v) => (
              <VariantCard key={v.variant_id} variant={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Related variant card ──────────────────────────────────────────────────────
function VariantCard({ variant }: { variant: VariantListing }) {
  const price    = variant.selling_price ?? variant.mrp ?? 0;
  const mrp      = variant.mrp && variant.selling_price && variant.mrp > variant.selling_price
    ? variant.mrp
    : null;
  const discount = mrp ? Math.round((1 - price / mrp) * 100) : null;

  return (
    <Link href={`/product/${variant.slug}`} style={{ textDecoration:'none', color:'inherit' }}>
      <div
        style={{ border:'1px solid var(--color-divider)', borderRadius:12, overflow:'hidden', background:'var(--color-surface)', transition:'box-shadow 0.2s' }}
        className="hover:shadow-md group"
      >
        {/* Image */}
        <div style={{ aspectRatio:'1/1', overflow:'hidden', background:'var(--color-neutral-100)', position:'relative' }}>
          {variant.image_url ? (
            <img
              src={variant.image_url}
              alt={variant.product_name}
              style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
              className="group-hover:scale-105"
            />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-neutral-400)', fontSize:11 }}>
              No image
            </div>
          )}
          {discount && (
            <div style={{ position:'absolute', top:8, left:8, background:'var(--color-accent)', color:'#fff', fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>
              -{discount}%
            </div>
          )}
          {variant.stock_qty === 0 && (
            <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#6B7280' }}>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding:'10px 12px' }}>
          <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {variant.product_name}
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <span style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:15 }}>
              ₹{price.toFixed(2)}
            </span>
            {mrp && (
              <span style={{ fontSize:12, color:'var(--color-neutral-400)', textDecoration:'line-through' }}>
                ₹{mrp.toFixed(2)}
              </span>
            )}
          </div>
          {variant.stock_qty > 0 && variant.stock_qty <= 4 && (
            <div style={{ fontSize:11, color:'#F59E0B', marginTop:3 }}>
              Only {variant.stock_qty} left
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
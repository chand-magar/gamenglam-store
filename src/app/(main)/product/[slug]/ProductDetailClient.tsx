'use client';
import { useState, useEffect, useCallback } from 'react';
import { Truck, RotateCcw, ShieldCheck, Heart, Share2 } from 'lucide-react';
import { useCartStore }     from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import type { Product, Review } from '@/lib/types';
import type { ProductAttribute, VariantWithAttributes } from '@/lib/api/variants';
import { ReviewForm } from '@/components/product/ReviewForm';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const TABS     = ['Description', 'Specifications', 'Features', 'Reviews'];

interface Props {
  product:          Product;
  reviews:          Review[];
  gallery:          string[];
  variants:         VariantWithAttributes[];
  attributes:       ProductAttribute[];
  initialVariantId: string | null;
}

// Find variant matching all selected attribute values
function findMatchingVariant(
  variants: VariantWithAttributes[],
  selectedAttrs: Record<string, string>,
): VariantWithAttributes | null {
  const selectedKeys = Object.keys(selectedAttrs);
  if (selectedKeys.length === 0) return null;

  // Exact match first
  const exact = variants.find((v) =>
    selectedKeys.every((code) => v.attributes[code] === selectedAttrs[code]),
  );
  if (exact) return exact;

  // Partial match — most matching attributes, prefer in-stock
  const scored = variants
    .map((v) => ({
      variant: v,
      score:   selectedKeys.filter((code) => v.attributes[code] === selectedAttrs[code]).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.variant.stock_qty > 0 ? 1 : 0) - (a.variant.stock_qty > 0 ? 1 : 0));

  return scored[0]?.variant ?? null;
}

// Build default attrs — prefer in-stock variant's attribute combination
function buildDefaultAttrs(
  variants:   VariantWithAttributes[],
  attributes: ProductAttribute[],
  initialVariantId: string | null,
): Record<string, string> {
  const initialVariant = variants.find((v) => v.variant_id === initialVariantId)
    ?? variants.find((v) => v.stock_qty > 0)
    ?? variants[0];

  if (!initialVariant) return {};

  const defaults: Record<string, string> = {};
  for (const attr of attributes) {
    if (initialVariant.attributes[attr.code] !== undefined) {
      defaults[attr.code] = initialVariant.attributes[attr.code];
    }
  }
  return defaults;
}

export function ProductDetailClient({
  product, reviews, gallery, variants, attributes, initialVariantId,
}: Props) {
  const initialAttrs = buildDefaultAttrs(variants, attributes, initialVariantId);

  const [activeImage,      setActiveImage]      = useState<string | null>(gallery[0] ?? null);
  const [currentGallery,   setCurrentGallery]   = useState<string[]>(gallery);
  const [selectedAttrs,    setSelectedAttrs]     = useState<Record<string, string>>(initialAttrs);
  const [selectedVariant,  setSelectedVariant]   = useState<VariantWithAttributes | null>(
    variants.find((v) => v.variant_id === initialVariantId) ?? null,
  );
  const [qty,              setQty]              = useState(1);
  const [activeTab,        setActiveTab]        = useState('Description');
  const [loadingImages,    setLoadingImages]    = useState(false);
  const [reviewList,       setReviewList]       = useState<Review[]>(reviews);

  const addItem  = useCartStore((s) => s.addItem);
  const toggle   = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.product_id));

  const price = selectedVariant?.price_override
    ? Number(selectedVariant.price_override)
    : Number(product.base_price);

  const discountPct = product.originalPrice
    ? Math.round((1 - price / product.originalPrice) * 100)
    : null;

  const stockStatus = selectedVariant
    ? selectedVariant.stock_qty === 0 ? 'out'
    : selectedVariant.stock_qty < 5   ? 'low'
    : 'in'
    : product.stock;

  // Load images for a variant
  const loadVariantImages = useCallback(async (variantId: string) => {
    setLoadingImages(true);
    try {
      const res  = await fetch(`${API_BASE}/product-variants/${variantId}/images`);
      const json = await res.json();
      const imgs = Array.isArray(json.data) ? json.data : [];
      const sorted = [...imgs]
        .sort((a: any, b: any) =>
          (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order,
        )
        .map((img: any) => img.image_url as string);

      const newGallery: string[] = [];
      if (product.image_url) newGallery.push(product.image_url);
      for (const url of sorted) {
        if (!newGallery.includes(url)) newGallery.push(url);
      }
      setCurrentGallery(newGallery);
      setActiveImage(sorted[0] ?? product.image_url ?? null);
    } catch {}
    finally { setLoadingImages(false); }
  }, [product.image_url]);

  // When selected attrs change — find matching variant and load its images
  useEffect(() => {
    const matched = findMatchingVariant(variants, selectedAttrs);
    if (matched) {
      setSelectedVariant(matched);
      loadVariantImages(matched.variant_id);
      setQty(1);
    }
  }, [selectedAttrs]);

  // When attribute value changes — check if combo is in stock, auto-select available if not
  const handleAttrChange = (code: string, value: string) => {
    const newAttrs = { ...selectedAttrs, [code]: value };

    // Find exact match
    const exact = variants.find((v) =>
      Object.keys(newAttrs).every((k) => v.attributes[k] === newAttrs[k]),
    );

    if (exact && exact.stock_qty > 0) {
      // Exact match and in stock — use it
      setSelectedAttrs(newAttrs);
    } else {
      // Find best available in-stock variant with this attribute value
      const available = variants
        .filter((v) => v.attributes[code] === value && v.stock_qty > 0)
        .sort((a, b) => b.stock_qty - a.stock_qty);

      if (available.length > 0) {
        // Auto-adjust other attrs to match available variant
        const autoAttrs: Record<string, string> = {};
        for (const attr of attributes) {
          if (attr.code === code) {
            autoAttrs[attr.code] = value;
          } else {
            autoAttrs[attr.code] = available[0].attributes[attr.code] ?? newAttrs[attr.code];
          }
        }
        setSelectedAttrs(autoAttrs);
      } else {
        // No in-stock variant — still update selection (show out of stock)
        setSelectedAttrs(newAttrs);
      }
    }
  };

  // Check if a specific attribute value is available given current other selections
  const isValueAvailable = (attrCode: string, value: string): boolean => {
    const testAttrs = { ...selectedAttrs, [attrCode]: value };
    return variants.some((v) =>
      Object.keys(testAttrs).every((k) => v.attributes[k] === testAttrs[k]) && v.stock_qty > 0,
    );
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 440px', gap:'36px', alignItems:'start' }}>

      {/* ── Left — gallery ── */}
      <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'12px' }}>

        {/* Vertical thumbnails */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {currentGallery.map((url, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(url)}
              style={{ width:80, height:80, borderRadius:'var(--radius-md)', overflow:'hidden', cursor:'pointer', border:`2px solid ${activeImage === url ? 'var(--color-accent)' : 'var(--color-divider)'}`, flexShrink:0, transition:'border-color 0.15s' }}
            >
              <img src={url} alt={`view ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          ))}
        </div>

        {/* Main image */}
        <div style={{ aspectRatio:'1/1', position:'relative', overflow:'hidden', borderRadius:'var(--radius-lg)', background:'var(--color-neutral-200)' }}>
          {loadingImages && (
            <div style={{ position:'absolute', inset:0, background:'rgba(243,242,242,0.7)', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:28, height:28, border:'3px solid var(--color-accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          )}
          {activeImage ? (
            <img src={activeImage} alt={product.product_name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'repeating-linear-gradient(45deg,var(--color-neutral-200) 0,var(--color-neutral-200) 14px,var(--color-neutral-100) 14px,var(--color-neutral-100) 28px)' }}>
              <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--color-neutral-600)' }}>{product.product_name}</span>
            </div>
          )}
          <button
            style={{ position:'absolute', top:12, right:12, width:36, height:36, borderRadius:'50%', background:'var(--color-surface)', border:'1px solid var(--color-divider)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
            onClick={() => navigator.share?.({ title: product.product_name, url: window.location.href })}
          >
            <Share2 size={15} color="var(--color-neutral-600)" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ gridColumn:'1 / -1', marginTop:'18px' }}>
          <div className="seg" style={{ flexWrap:'wrap' }}>
            {TABS.map((t) => (
              <label key={t} className={`seg-opt ${activeTab === t ? 'active' : ''}`}>
                <input type="radio" name="dtab" checked={activeTab === t} onChange={() => setActiveTab(t)} />
                {t}
              </label>
            ))}
          </div>
          <div style={{ padding:'18px 0', fontSize:14, lineHeight:1.7 }}>
            {activeTab === 'Description' && <p style={{ margin:0 }}>{product.description ?? 'No description available.'}</p>}
            {activeTab === 'Specifications' && (
              product.specs.length > 0
                ? <table className="table"><tbody>{product.specs.map((s) => <tr key={s.k}><td style={{ width:200, fontWeight:600 }}>{s.k}</td><td>{s.v}</td></tr>)}</tbody></table>
                : <p className="text-muted">No specifications available.</p>
            )}
            {activeTab === 'Features' && (
              product.features.length > 0
                ? <ul style={{ margin:0, paddingLeft:'18px' }}>{product.features.map((f) => <li key={f}>{f}</li>)}</ul>
                : <p className="text-muted">No features listed.</p>
            )}
            {activeTab === 'Reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {reviewList.length > 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {reviewList.map((r) => (
                      <div key={r.review_id} className="card">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div>
                            <strong style={{ fontFamily:'var(--font-heading)', fontSize:15 }}>{r.customer_name}</strong>
                            <div style={{ color:'var(--color-accent)', fontSize:15, marginTop:2, letterSpacing:2 }}>
                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </div>
                          </div>
                          <span className="text-muted" style={{ fontSize:12, whiteSpace:'nowrap' }}>
                            {new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </div>
                        {r.title && <div style={{ fontWeight:600, fontSize:14 }}>{r.title}</div>}
                        <p className="card-body" style={{ margin:0 }}>{r.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ margin:0 }}>No reviews yet. Be the first!</p>
                )}
                <ReviewForm
                  productId={product.product_id}
                  onSubmitted={(r) => setReviewList((prev) => [r, ...prev])}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right — purchase panel ── */}
      <div style={{ position:'sticky', top:80, display:'flex', flexDirection:'column', gap:14 }}>

        {/* Title */}
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--color-accent-700)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
            {product.sku}
          </div>
          <h1 style={{ margin:'0 0 8px', fontSize:'clamp(20px,2.5vw,28px)', lineHeight:1.2 }}>
            {product.product_name}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ color:'var(--color-accent)', letterSpacing:2 }}>★★★★☆</span>
            <span style={{ color:'var(--color-neutral-600)' }}>{product.reviewsN.toLocaleString()} reviews</span>
          </div>
        </div>

        <div className="hr" />

        {/* Price */}
        <div>
          <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
            <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:32 }}>
              ${price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span style={{ fontSize:16, textDecoration:'line-through', color:'var(--color-neutral-500)' }}>
                ${product.originalPrice}
              </span>
            )}
            {discountPct && <span className="tag tag-accent" style={{ fontSize:12 }}>-{discountPct}%</span>}
          </div>
          <div style={{ fontSize:12, color:'var(--color-neutral-600)', marginTop:2 }}>Inclusive of all taxes</div>
        </div>

        {/* Attribute selectors */}
        {attributes.map((attr) => {
          const selectedValue = selectedAttrs[attr.code];
          const selectedLabel = attr.values.find((v) => v.value === selectedValue)?.display_label;

          return (
            <div key={attr.attribute_id}>
              <div style={{ fontSize:13, marginBottom:8 }}>
                <span style={{ fontWeight:600 }}>{attr.attribute_name}: </span>
                <span style={{ color:'var(--color-neutral-700)' }}>{selectedLabel ?? 'Select'}</span>
              </div>

              {attr.type === 'color' ? (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {attr.values.map((val) => {
                    const available = isValueAvailable(attr.code, val.value);
                    const selected  = selectedValue === val.value;
                    return (
                      <button
                        key={val.attribute_value_id}
                        onClick={() => handleAttrChange(attr.code, val.value)}
                        title={`${val.display_label}${!available ? ' (out of stock)' : ''}`}
                        style={{
                          width:34, height:34, borderRadius:'50%',
                          background: val.color_hex ?? '#ccc',
                          border:`3px solid ${selected ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                          cursor:'pointer', outline:'none', position:'relative',
                          boxShadow: selected ? '0 0 0 2px var(--color-bg),0 0 0 4px var(--color-accent)' : undefined,
                          opacity: available ? 1 : 0.4,
                          transition:'all 0.15s',
                        }}
                      >
                        {!available && (
                          <div style={{ position:'absolute', inset:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ width:'100%', height:2, background:'rgba(0,0,0,0.4)', transform:'rotate(-45deg)' }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {attr.values.map((val) => {
                    const available = isValueAvailable(attr.code, val.value);
                    const selected  = selectedValue === val.value;
                    return (
                      <button
                        key={val.attribute_value_id}
                        onClick={() => handleAttrChange(attr.code, val.value)}
                        title={available ? val.display_label : `${val.display_label} (out of stock)`}
                        style={{
                          padding:'5px 14px',
                          borderRadius:'var(--radius-md)',
                          border:`1.5px solid ${selected ? 'var(--color-accent)' : available ? 'var(--color-divider)' : 'var(--color-neutral-300)'}`,
                          background: selected ? 'var(--color-accent-100)' : 'transparent',
                          color: selected ? 'var(--color-accent-800)' : available ? 'var(--color-text)' : 'var(--color-neutral-400)',
                          cursor:'pointer', fontSize:13, fontWeight:500,
                          textDecoration: available ? 'none' : 'line-through',
                          transition:'all 0.15s', outline:'none',
                        }}
                      >
                        {val.display_label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Stock status */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span className={`tag ${stockStatus === 'in' ? 'tag-accent' : stockStatus === 'low' ? 'tag-outline' : 'tag-neutral'}`}>
            {stockStatus === 'in' ? 'In Stock' : stockStatus === 'low' ? `Only ${selectedVariant?.stock_qty} left` : 'Out of Stock'}
          </span>
          <span className="text-muted" style={{ fontSize:12 }}>
            SKU: {selectedVariant?.sku ?? product.sku}
          </span>
        </div>

        <div className="hr" />

        {/* Delivery info */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <Truck size={16} color="var(--color-accent)" />
            <div><div style={{ fontWeight:600 }}>Free Delivery</div><div className="text-muted" style={{ fontSize:12 }}>On orders over $50 · 3–5 days</div></div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <RotateCcw size={16} color="var(--color-accent)" />
            <div><div style={{ fontWeight:600 }}>30-day Returns</div><div className="text-muted" style={{ fontSize:12 }}>Easy free returns</div></div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <ShieldCheck size={16} color="var(--color-accent)" />
            <div><div style={{ fontWeight:600 }}>1-year Warranty</div><div className="text-muted" style={{ fontSize:12 }}>Included with purchase</div></div>
          </div>
        </div>

        <div className="hr" />

        {/* Qty + Add to cart */}
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div className="seg">
            <button className="seg-opt" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="seg-opt" style={{ minWidth:36, textAlign:'center' }}>{qty}</span>
            <button className="seg-opt" onClick={() => setQty((q) => Math.min(q + 1, selectedVariant?.stock_qty ?? 99))}>+</button>
          </div>
          <button
            className="btn btn-primary"
            style={{ flex:1, fontSize:14 }}
            disabled={stockStatus === 'out'}
            onClick={() => {
              if (!selectedVariant) return;
              addItem(
                {
                  product_id:   product.product_id,
                  product_name: product.product_name,
                  sku:          product.sku,
                  image_url:    product.image_url,
                  base_price:   price,
                },
                {
                  variant_id:    selectedVariant.variant_id,
                  sku:           selectedVariant.sku,
                  selling_price: selectedVariant.selling_price ?? null,
                  mrp:           selectedVariant.mrp ?? null,
                  image_url:     activeImage ?? product.image_url ?? null,
                  attributes:    selectedVariant.attributes,
                },
                qty,
              );
            }}
          >
            {stockStatus === 'out' ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggle(product.product_id)}
          style={{ width:'100%', border:'1.5px solid var(--color-divider)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', borderRadius:'var(--radius-md)', background:'transparent', cursor:'pointer', fontSize:14, fontFamily:'var(--font-heading)', fontWeight:600 }}
        >
          <Heart size={16} color="var(--color-accent)" fill={isWished ? 'var(--color-accent)' : 'none'} />
          {isWished ? 'Saved to Wishlist' : 'Add to Wishlist'}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--color-neutral-600)', justifyContent:'center' }}>
          <ShieldCheck size={13} /> Secure transaction
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
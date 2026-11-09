'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import type { VariantListing } from '@/lib/api/variants';
import type { AttributeWithValues } from '@/lib/api/attributes';
import { getVariantListing } from '@/lib/api/variants';


interface Props {
  category:   string;
  categoryId: string;           // ← add
  variants:   VariantListing[];
  attributes: AttributeWithValues[];
}

type SortKey = 'topSelling' | 'priceLow' | 'priceHigh';

const PAGE_SIZE = 9;

export function CategoryClient({ category, variants: initialVariants, attributes, categoryId }: Props) {
  
  const [variants, setVariants] = useState(initialVariants);
  const [sortBy,        setSortBy]        = useState<SortKey>('topSelling');
  const [viewMode,      setViewMode]      = useState<'grid' | 'list'>('grid');
  const [page,          setPage]          = useState(1);
  const [minPrice,      setMinPrice]      = useState('');
  const [maxPrice,      setMaxPrice]      = useState('');
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string[]>>({});

  const getPrice = (v: VariantListing) => v.selling_price ?? v.mrp ?? 0;

  const toggleAttrValue = (code: string, value: string) => {
    setSelectedAttrs((prev) => {
      const cur = prev[code] ?? [];
      return {
        ...prev,
        [code]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value],
      };
    });
    setPage(1);
  };

  const hasAttrFilters = Object.values(selectedAttrs).some((v) => v.length > 0);
  const hasFilters     = !!(minPrice || maxPrice || hasAttrFilters);

  const clearFilters = () => {
    setMinPrice(''); setMaxPrice(''); setSelectedAttrs({}); setPage(1);
  };

  const filtered = useMemo(() => {
  let list = [...variants];
  if (minPrice) list = list.filter((v) => getPrice(v) >= Number(minPrice));
  if (maxPrice) list = list.filter((v) => getPrice(v) <= Number(maxPrice));
  // ← remove attribute filter loop — backend handles it
  if (sortBy === 'priceLow')  list.sort((a, b) => getPrice(a) - getPrice(b));
  if (sortBy === 'priceHigh') list.sort((a, b) => getPrice(b) - getPrice(a));
  if (sortBy === 'topSelling') list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  return list;
}, [variants, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    const selectedValues = Object.values(selectedAttrs).flat();
    if (selectedValues.length === 0) {
      setVariants(initialVariants);
      return;
    }
    getVariantListing(categoryId, selectedValues).then(setVariants);
  }, [selectedAttrs, categoryId, initialVariants]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
        <div>
          <h1 style={{ margin:'0 0 4px' }}>{category}</h1>
          <p style={{ margin:0, fontSize:13, color:'var(--color-neutral-500)', fontFamily:'var(--font-body)' }}>Top selling products</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span className="text-muted" style={{ fontSize:13 }}>{filtered.length} results</span>
          <select
            style={{ fontSize:13, padding:'6px 28px 6px 12px', border:'1px solid var(--color-divider)', borderRadius:'var(--radius-md)', background:'var(--color-surface)', color:'var(--color-text)', fontFamily:'var(--font-body)', cursor:'pointer', appearance:'none', backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239b9797' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 8px center' }}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortKey); setPage(1); }}
          >
            <option value="topSelling">Top Selling</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
          <div className="seg">
            <label className={`seg-opt ${viewMode === 'grid' ? 'active' : ''}`}>
              <input type="radio" name="viewmode" onChange={() => setViewMode('grid')} />
              <LayoutGrid size={14} />
            </label>
            <label className={`seg-opt ${viewMode === 'list' ? 'active' : ''}`}>
              <input type="radio" name="viewmode" onChange={() => setViewMode('list')} />
              <List size={14} />
            </label>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:27 }}>

        {/* Sidebar */}
        <aside>
          {/* Price Range */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-neutral-500)' }}>
              Price Range
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input
                style={{ width:'100%', padding:'6px 10px', border:'1px solid var(--color-divider)', borderRadius:6, fontSize:13 }}
                placeholder="Min" type="number" value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              />
              <input
                style={{ width:'100%', padding:'6px 10px', border:'1px solid var(--color-divider)', borderRadius:6, fontSize:13 }}
                placeholder="Max" type="number" value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Attribute filters */}
          {attributes.map((attr) => (
            <div key={attr.attribute_id} style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-neutral-500)' }}>
                {attr.attribute_name}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {attr.values.map((val) => {
                  const selected = (selectedAttrs[attr.code] ?? []).includes(val.value);
                  const count    = variants.filter((v) => v.attributes?.[attr.code] === val.value).length;
                  return (
                    <label key={val.attribute_value_id} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color: selected ? 'var(--color-accent)' : 'var(--color-text)' }}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleAttrValue(attr.code, val.value)}
                        style={{ accentColor:'var(--color-accent)', width:14, height:14 }}
                      />
                      {attr.type === 'color' && val.color_hex && (
                        <span style={{ width:12, height:12, borderRadius:'50%', background:val.color_hex, border:'1px solid rgba(0,0,0,0.15)', flexShrink:0 }} />
                      )}
                      <span style={{ flex:1 }}>{val.display_label}</span>
                      <span style={{ fontSize:11, color:'var(--color-neutral-400)' }}>({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{ fontSize:12, padding:'5px 12px', border:'1px solid var(--color-divider)', borderRadius:6, background:'transparent', cursor:'pointer', color:'var(--color-neutral-600)' }}
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Grid */}
        <div>
          {paged.length === 0 ? (
            <div className="text-muted" style={{ textAlign:'center', padding:'64px 0', fontSize:14 }}>
              No products match your filters.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(3,1fr)' : '1fr', gap:18 }}>
              {paged.map((v) => <VariantCard key={v.variant_id} variant={v} viewMode={viewMode} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
              <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'btn btn-primary' : 'btn btn-secondary'}>{i + 1}</button>
              ))}
              <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VariantCard({ variant, viewMode }: { variant: VariantListing; viewMode: 'grid' | 'list' }) {
  const price    = variant.selling_price ?? variant.mrp ?? 0;
  const mrp      = variant.mrp && variant.selling_price && variant.mrp > variant.selling_price ? variant.mrp : null;
  const discount = mrp ? Math.round((1 - price / mrp) * 100) : null;
  const inStock  = variant.stock_qty > 0;
  const colorVal = variant.attributes?.color ?? variant.attributes?.colour;

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${variant.slug}`} style={{ textDecoration:'none', color:'inherit' }}>
        <div style={{ display:'flex', gap:16, padding:16, border:'1px solid var(--color-divider)', borderRadius:12, background:'var(--color-surface)' }} className="hover:shadow-md">
          <div style={{ width:100, height:100, flexShrink:0, borderRadius:8, overflow:'hidden', background:'var(--color-neutral-100)' }}>
            {variant.image_url
              ? <img src={variant.image_url} alt={variant.product_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-neutral-400)', fontSize:11 }}>No image</div>
            }
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:15, marginBottom:4 }}>{variant.product_name}</div>
            {colorVal && <div style={{ fontSize:12, color:'var(--color-neutral-500)', marginBottom:6, textTransform:'capitalize' }}>{colorVal.replace(/_/g, ' ')}</div>}
            <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
              <span style={{ fontFamily:'var(--font-heading)', fontSize:18, fontWeight:700 }}>₹{price.toFixed(2)}</span>
              {mrp && <span style={{ fontSize:13, color:'var(--color-neutral-400)', textDecoration:'line-through' }}>₹{mrp.toFixed(2)}</span>}
              {discount && <span style={{ fontSize:11, background:'var(--color-accent)', color:'#fff', padding:'1px 6px', borderRadius:4 }}>-{discount}%</span>}
            </div>
            <div style={{ fontSize:12, marginTop:6, color: inStock ? 'var(--color-accent)' : '#EF4444' }}>
              {inStock ? `In Stock (${variant.stock_qty})` : 'Out of Stock'}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${variant.slug}`} style={{ textDecoration:'none', color:'inherit' }}>
      <div style={{ border:'1px solid var(--color-divider)', borderRadius:12, overflow:'hidden', background:'var(--color-surface)', transition:'box-shadow 0.2s' }} className="hover:shadow-md group">
        <div style={{ aspectRatio:'1/1', overflow:'hidden', background:'var(--color-neutral-100)', position:'relative' }}>
          {variant.image_url
            ? <img src={variant.image_url} alt={variant.product_name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }} className="group-hover:scale-105" />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-neutral-400)', fontSize:11 }}>No image</div>
          }
          {discount && (
            <div style={{ position:'absolute', top:8, left:8, background:'var(--color-accent)', color:'#fff', fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:20 }}>-{discount}%</div>
          )}
          {!inStock && (
            <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#6B7280' }}>Out of Stock</span>
            </div>
          )}
        </div>
        <div style={{ padding:'10px 12px' }}>
          <div style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{variant.product_name}</div>
          {colorVal && <div style={{ fontSize:11, color:'var(--color-neutral-500)', marginTop:2, textTransform:'capitalize' }}>{colorVal.replace(/_/g, ' ')}</div>}
          <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
            <span style={{ fontFamily:'var(--font-heading)', fontWeight:700, fontSize:15 }}>₹{price.toFixed(2)}</span>
            {mrp && <span style={{ fontSize:12, color:'var(--color-neutral-400)', textDecoration:'line-through' }}>₹{mrp.toFixed(2)}</span>}
          </div>
          {variant.stock_qty > 0 && variant.stock_qty <= 4 && (
            <div style={{ fontSize:11, color:'#F59E0B', marginTop:3 }}>Only {variant.stock_qty} left</div>
          )}
        </div>
      </div>
    </Link>
  );
}
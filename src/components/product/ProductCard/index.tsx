'use client';
import Link  from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useCartStore }     from '@/lib/store/cart';
import { useWishlistStore } from '@/lib/store/wishlist';
import type { Product } from '@/lib/types';

interface Props { product: Product; }

const STOCK_LABEL: Record<string, string> = {
  in: 'In Stock', low: 'Only a few left', out: 'Out of Stock',
};

export function ProductCard({ product }: Props) {
  const addItem  = useCartStore((s) => s.addItem);
  const toggle   = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.product_id)); // ← string UUID

  return (
    <div className="card elev-sm" style={{ padding:0, overflow:'hidden' }}>

      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative">
        <div
          className="plate relative aspect-square flex items-center justify-center"
          style={{ margin:0, borderWidth:0, background:'repeating-linear-gradient(45deg,var(--color-neutral-200) 0,var(--color-neutral-200) 10px,var(--color-neutral-100) 10px,var(--color-neutral-100) 20px)', overflow:'hidden' }}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.product_name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span style={{ fontFamily:'monospace', fontSize:10, color:'var(--color-neutral-600)', textAlign:'center', padding:'0 13.8px' }}>
              {product.product_name}
            </span>
          )}

          {/* Badge */}
          {product.badge && (
            <span className="tag tag-accent absolute top-2 left-2" style={{ textTransform:'capitalize' }}>
              {product.badge}
            </span>
          )}

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.product_id); }} // ← string UUID
            className="btn btn-icon absolute top-1.5 right-1.5"
            style={{ background:'var(--color-surface)' }}
            aria-label="Toggle wishlist"
          >
            <Heart
              size={15}
              color="var(--color-accent)"
              fill={isWished ? 'var(--color-accent)' : 'none'}
            />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:'13.8px' }}>
        <div className="card-meta">{product.sku}</div>
        <Link
          href={`/product/${product.slug}`}
          className="card-title block hover:no-underline hover:text-[var(--color-accent-700)]"
        >
          {product.product_name}
        </Link>

        {/* Stock */}
        <div style={{ fontSize:11, margin:'4px 0 8px' }}>
          <span className={`tag ${
            product.stock === 'in'  ? 'tag-accent'  :
            product.stock === 'low' ? 'tag-outline' : 'tag-neutral'
          }`}>
            {STOCK_LABEL[product.stock]}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span style={{ fontFamily:'var(--font-heading)', fontWeight:600, fontSize:16 }}>
            ${Number(product.base_price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 'out'}
          className="btn btn-primary btn-block"
          style={{ fontSize:13 }}
        >
          {product.stock === 'out' ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
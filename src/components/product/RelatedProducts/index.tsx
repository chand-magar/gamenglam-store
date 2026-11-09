import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div>
      <h2 style={{ marginBottom:'18.4px' }}>You may also like</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18.4px' }}>
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

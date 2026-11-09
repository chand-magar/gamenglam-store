import Link              from 'next/link';
import { CategoryClient } from './CategoryClient';
import { getCategories }  from '@/lib/api/categories';
import { getVariantListing } from '@/lib/api/variants';
import { getAttributesByCategory } from '@/lib/api/attributes';
import type { Metadata }  from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug }   = await params;
  const categories = await getCategories();
  const category   = categories.find((c) => c.slug === slug);
  return { title: category?.category_name ?? slug };
}

export default async function CategoryPage({ params }: Props) {
  const { slug }   = await params;
  const categories = await getCategories();
  const category   = categories.find((c) => c.slug === slug);

  const [variants, attributes] = await Promise.all([
    getVariantListing(category?.category_id),
    category?.category_id
      ? getAttributesByCategory(category.category_id)
      : Promise.resolve([]),
  ]);

  return (
    <div className="container" style={{ padding:'27.6px 36.8px' }}>
      <div style={{ fontSize:13, marginBottom:'13.8px' }}>
        <Link href="/">Home</Link>
        <span className="text-muted"> / {category?.category_name ?? slug}</span>
      </div>
      <CategoryClient
        category={category?.category_name ?? slug}
        categoryId={category?.category_id ?? ''}   // ← add
        variants={variants}
        attributes={attributes}
      />
    </div>
  );
}
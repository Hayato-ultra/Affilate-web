import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCatalogProducts, ProductResult } from '../api';
import { optimizeImageUrl, handleImageError, getCurrencySymbol } from '../utils/images';
import SEO from '../components/SEO';

export default function FeaturedPage() {
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalogProducts({ page_size: 50, sort_by: 'created_at', order: 'desc', featured: 'true' })
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="pt-6 pb-20 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
        <SEO title="Featured" description="Curated picks from our catalog." />
        <div className="flex items-center justify-center py-20"><span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" /></div>
      </main>
    );
  }

  return (
    <main className="pt-6 pb-20 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <SEO title="Featured" description="Curated picks from our catalog." />
      <section className="mb-12">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">Featured</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Curated picks from our catalog.</p>
      </section>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">star</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No featured products yet</h3>
          <p className="text-on-surface-variant">Mark products as featured in the admin panel to show them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Link key={product.product_id} to={`/product/${product.product_id}`} className="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="aspect-square overflow-hidden bg-surface-container-low">
                <img src={optimizeImageUrl(product.images.thumbnail_url)} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImageError} />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">Featured</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase">{product.merchant.merchant_name}</span>
                </div>
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                <p className="font-headline-md text-primary mt-2">
                  {getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

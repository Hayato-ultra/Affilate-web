import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCatalogProduct, ProductResult } from '../api';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { optimizeImageUrl, handleImageError, getCurrencySymbol } from '../utils/images';
import SEO from '../components/SEO';

function Shimmer({ className }: { className: string }) {
  return <div className={`bg-surface-container-highest animate-pulse rounded ${className}`} />;
}

function ProductSkeleton() {
  return (
    <div className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden">
      <Shimmer className="aspect-square w-full" />
      <div className="p-5 space-y-3">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-5 w-full" />
        <Shimmer className="h-6 w-20" />
      </div>
    </div>
  );
}

function WishlistCard({
  product,
  onRemove,
}: {
  product: ProductResult;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group relative bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      <button
        onClick={() => onRemove(product.product_id)}
        className="absolute top-3 right-3 z-10 material-symbols-outlined text-error bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-error-container transition-all active:scale-90 shadow-sm"
        aria-label="Remove from wishlist"
      >
        close
      </button>
      <Link to={`/product/${product.product_id}`}>
        <div className="aspect-square overflow-hidden bg-surface-container-low">
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={optimizeImageUrl(product.images.thumbnail_url)}
            alt={product.title}
            onError={handleImageError}
          />
        </div>
        <div className="p-5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase">
            {product.merchant.merchant_name}
          </span>
          <h3 className="font-headline-md text-body-lg font-semibold text-on-surface line-clamp-1 mt-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="font-headline-md text-primary mt-2">
            {getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}
          </p>
        </div>
      </Link>
    </div>
  );
}

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistIds, toggle } = useWishlist();
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  const loadWishlist = useCallback(async () => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled(
        wishlistIds.map(id => getCatalogProduct(id))
      );
      const loaded: ProductResult[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') loaded.push(r.value);
      }
      setProducts(loaded);
    } catch (err: any) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [wishlistIds]);

  useEffect(() => {
    fetchedRef.current = true;
    loadWishlist();
  }, [loadWishlist]);

  function handleRemove(id: string) {
    toggle(id);
  }

  return (
    <main className="pt-6 pb-24 md:pb-12 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <SEO title="My Wishlist" description="Your saved favorite products." />

      <section className="mb-8">
        <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em] mb-2 block">Saved Items</span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">My Wishlist</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          {wishlistIds.length} {wishlistIds.length === 1 ? 'item' : 'items'} saved
        </p>
      </section>

      {!user && (
        <div className="mb-8 p-5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">person</span>
          <p className="font-body-md text-on-surface-variant mb-3">Sign in to sync your wishlist across devices.</p>
          <Link to="/login" className="inline-block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-sm hover:bg-cta-vibrant transition-all">
            Sign In
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg font-body-md">{error}</div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && wishlistIds.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">favorite</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Your wishlist is empty</h3>
          <p className="text-on-surface-variant mb-6">Save your favorite products to keep track of them.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm hover:bg-cta-vibrant transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            Browse Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <WishlistCard key={product.product_id} product={product} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </main>
  );
}

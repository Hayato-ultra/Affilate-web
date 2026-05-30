import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts, getCatalogProducts, processProductUrl, ProductResult, Pagination, ProcessUrlResponse } from '../api';
import { useDebounce } from '../hooks/useSearch';
import { optimizeImageUrl, handleImageError, getCurrencySymbol } from '../utils/images';
import SEO from '../components/SEO';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'relevance' },
];



function Shimmer({ className }: { className: string }) {
  return <div className={`bg-surface-container-highest animate-pulse rounded ${className}`} />;
}

function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-bento-gap">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-outline-variant/30 rounded overflow-hidden">
          <Shimmer className="aspect-square w-full" />
          <div className="p-6 space-y-3">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-full" />
            <Shimmer className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product, style }: { product: ProductResult; style?: React.CSSProperties }) {
  return (
    <Link
      to={`/product/${product.product_id}`}
      style={style}
      className="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-surface-container-low">
        <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={optimizeImageUrl(product.images.thumbnail_url)} alt={product.title} onError={handleImageError} />
      </div>
      <div className="p-5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase">{product.merchant.merchant_name}</span>
        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface line-clamp-1 mt-2 group-hover:text-primary transition-colors">{product.title}</h3>
        <p className="font-headline-md text-primary mt-2">{getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}</p>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort_by') || 'price_asc';
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const debouncedInput = useDebounce(inputValue, 300);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [error, setError] = useState('');
  const [urlResult, setUrlResult] = useState<ProcessUrlResponse | null>(null);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string, page = 1, sort: string = sortBy) => {
    if (!q.trim()) return;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const res = await searchProducts({ q, page, page_size: 24, sort_by: sort as any });
      if (page === 1) setResults(res.data);
      else setResults(prev => [...prev, ...res.data]);
      setPagination(res.pagination);
      setSearchParams({ q, sort_by: sort, page: String(page) }, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, 1, initialSort);
    } else {
      loadCatalog(1, initialCategory);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCatalog(page = 1, category = selectedCategory) {
    if (page === 1) setLoadingCatalog(true);
    else setLoadingMore(true);
    setError('');
    try {
      const sortMap: Record<string, string> = {
        price_asc: 'price_current',
        price_desc: 'price_current',
        relevance: 'created_at',
      };
      const sortField = sortMap[sortBy] || 'created_at';
      const order = sortBy === 'price_asc' ? 'asc' : 'desc';
      const res = await getCatalogProducts({ page, page_size: 24, sort_by: sortField, order, category: category || undefined });
      if (page === 1) setResults(res.data);
      else setResults(prev => [...prev, ...res.data]);
      setPagination(res.pagination);
      setSearchParams(prev => { if (category) prev.set('category', category); else prev.delete('category'); return prev; }, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoadingCatalog(false);
      setLoadingMore(false);
    }
  }

  function handleCategoryClick(cat: string) {
    const next = cat === selectedCategory ? '' : cat;
    setSelectedCategory(next);
    setUrlResult(null);
    if (query && !isUrl(query)) doSearch(query, 1, sortBy);
    else loadCatalog(1, next);
  }

  function isUrl(str: string): boolean {
    if (/^https?:\/\//i.test(str)) return true;
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(str)) return true;
    try { new URL(str); return true; } catch { return false; }
  }

  async function handleUrlSubmit(url: string) {
    setIsProcessingUrl(true);
    setError('');
    setUrlResult(null);
    try {
      const res = await processProductUrl(url);
      setUrlResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to process URL');
    } finally {
      setIsProcessingUrl(false);
    }
  }

  useEffect(() => {
    if (debouncedInput === undefined) return;
    const v = debouncedInput;
    if (isUrl(v) && v.includes('.')) {
      setQuery(v);
      handleUrlSubmit(v);
    } else {
      setUrlResult(null);
      setQuery(v);
      if (v.trim()) doSearch(v);
    }
  }, [debouncedInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = e.target.value;
    setSortBy(s);
    if (query) doSearch(query, 1, s as any);
    else loadCatalog(1);
  };

  const loadMore = useCallback(() => {
    if (!pagination?.has_next || loadingMore || loading) return;
    if (query) doSearch(query, pagination.page + 1);
    else loadCatalog(pagination.page + 1, selectedCategory);
  }, [pagination, loadingMore, loading, query, selectedCategory]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const showInitialSkeleton = loadingCatalog || (loading && results.length === 0);
  const showMoreSkeleton = loadingMore && results.length > 0;

  return (
    <main className="pt-6 pb-24 md:pb-12 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <SEO title="Search Products" description="Search and compare prices across Amazon, Flipkart, eBay, Meesho & Croma." />
      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em] mb-2 block">Premium Essentials</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">The Catalog</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative group">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-surface border border-outline-variant rounded-lg px-6 py-3 font-body-md text-body-md pr-12 focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex gap-3 mt-8 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleCategoryClick('')}
            className={`shrink-0 px-5 py-2 rounded-full font-label-sm transition-all border ${!selectedCategory ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
          >
            All
          </button>
          {['Apparel', 'Footwear', 'Accessories', 'Electronics', 'Home', 'Fitness', 'Food & Drink', 'Beauty'].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`shrink-0 px-5 py-2 rounded-full font-label-sm transition-all border ${selectedCategory === cat ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <div className="mb-10 max-w-xl">
        <div className="flex items-center bg-surface-container-low px-4 py-3 rounded-full border border-outline-variant/20">
          <span className="material-symbols-outlined text-outline">search</span>
          <input type="text" value={inputValue} onChange={handleInputChange} placeholder="Search curated goods..." className="bg-transparent border-none focus:ring-0 text-body-md ml-2 flex-1 outline-none" />
          {loading && <span className="w-4 h-4 border-2 border-outline border-t-primary rounded-full animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-error-container text-on-error-container rounded-lg font-body-md">{error}</div>
      )}

      {/* URL Processing Result */}
      {isProcessingUrl && (
        <div className="flex items-center justify-center py-16">
          <span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
          <span className="ml-4 font-body-md text-on-surface-variant">Processing product URL...</span>
        </div>
      )}

      {urlResult && !isProcessingUrl && (
        <div className="mb-10 bg-white border border-outline-variant/30 rounded-xl overflow-hidden">
          {/* Product Header */}
          <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="w-full md:w-48 shrink-0">
              <img
                src={urlResult.product.thumbnail_url || 'https://placehold.co/400x400?text=No+Image'}
                alt={urlResult.product.title}
                className="w-full aspect-square object-cover rounded-lg"
                onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'; }}
              />
            </div>
            <div className="flex-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">{urlResult.product.title || 'Unknown Product'}</h2>
              {urlResult.product.description && (
                <p className="font-body-md text-on-surface-variant line-clamp-2 mb-4">{urlResult.product.description}</p>
              )}
              {urlResult.product.price_current && (
                <span className="font-display-md text-primary">
                  {(urlResult.product.currency_code === 'INR' ? '\u20B9' : urlResult.product.currency_code || '$')}
                  {urlResult.product.price_current.toLocaleString()}
                </span>
              )}
              {urlResult.product.price_original && (
                <span className="font-body-md text-on-surface-variant line-through ml-3">
                  {(urlResult.product.currency_code === 'INR' ? '\u20B9' : urlResult.product.currency_code || '$')}
                  {urlResult.product.price_original.toLocaleString()}
                </span>
              )}
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
                Source: {urlResult.product.merchant_name || urlResult.product.merchant_platform}
              </p>
            </div>
          </div>

          {/* Cross-Platform Affiliate Links */}
          <div className="border-t border-outline-variant/30 bg-surface-container-low px-6 py-5">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Buy on these platforms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {urlResult.cross_platform.map((p, i) => {
                const sym: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
                return (
                  <a
                    key={i}
                    href={p.cloaked_url || p.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-4 bg-white border border-outline-variant/30 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all group"
                  >
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-surface-container-highest rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline">store</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{p.merchant_name}</p>
                      <p className="font-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {p.price ? `${sym[p.currency] || '$'}${p.price.toLocaleString()}` : 'View Product'}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary">open_in_new</span>
                  </a>
                );
              })}
            </div>
            {urlResult.saved_product_id && (
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-4">
                Product saved to catalog. <Link to={`/product/${urlResult.saved_product_id}`} className="text-primary hover:underline">View details</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1">
          {!urlResult && showInitialSkeleton && <ProductSkeletonGrid />}

          {!urlResult && !showInitialSkeleton && results.length === 0 && !loading && query && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">inventory_2</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No products found</h3>
              <p className="text-on-surface-variant">Try a different search term or browse our collections.</p>
            </div>
          )}

          {!urlResult && !showInitialSkeleton && results.length === 0 && !loading && !query && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">search</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Search across premium marketplaces</h3>
              <p className="text-on-surface-variant">Enter a product name above to find the best prices from Amazon, Flipkart, Meesho, Croma, and eBay.</p>
            </div>
          )}

          {!urlResult && results.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(product => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
                {showMoreSkeleton && Array.from({ length: 3 }).map((_, i) => (
                  <div key={`more-${i}`} className="bg-white border border-outline-variant/30 rounded overflow-hidden">
                    <Shimmer className="aspect-square w-full" />
                    <div className="p-6 space-y-3"><Shimmer className="h-3 w-16" /><Shimmer className="h-5 w-full" /><Shimmer className="h-6 w-20" /></div>
                  </div>
                ))}
              </div>
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-10" />
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <span className="w-6 h-6 border-2 border-outline border-t-primary rounded-full animate-spin" />
                </div>
              )}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <span className="w-6 h-6 border-2 border-outline border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
    </main>
  );
}

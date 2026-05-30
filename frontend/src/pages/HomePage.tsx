import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSettings, getCatalogProducts, ProductResult } from '../api';
import SEO from '../components/SEO';

interface SiteSettings {
  site_name?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta?: string;
  hero_image?: string;
  footer_tagline?: string;
  [key: string]: any;
}

const CATEGORIES = [
  { name: 'Apparel', icon: 'checkroom', color: 'from-blue-500 to-blue-600' },
  { name: 'Footwear', icon: 'steps', color: 'from-emerald-500 to-emerald-600' },
  { name: 'Accessories', icon: 'watch', color: 'from-purple-500 to-purple-600' },
  { name: 'Electronics', icon: 'devices', color: 'from-cyan-500 to-cyan-600' },
  { name: 'Home', icon: 'chair', color: 'from-amber-500 to-amber-600' },
  { name: 'Fitness', icon: 'fitness_center', color: 'from-rose-500 to-rose-600' },
  { name: 'Food & Drink', icon: 'restaurant', color: 'from-orange-500 to-orange-600' },
  { name: 'Beauty', icon: 'spa', color: 'from-pink-500 to-pink-600' },
];

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [trending, setTrending] = useState<ProductResult[]>([]);

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(() => {});
    getCatalogProducts({ page_size: 8, sort_by: 'created_at', order: 'desc' })
      .then(res => setTrending(res.data))
      .catch(() => {});
  }, []);

  const heroTitle = settings?.hero_title || 'Redefining Modern Authority.';
  const heroSubtitle = settings?.hero_subtitle || 'Spring / Summer 2024';
  const heroCta = settings?.hero_cta || 'Shop The Collection';
  const heroImage = settings?.hero_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB-S5p4VzHEQdqYwELAKNBEtQxmiV_wWyK6yZpQx-RJKAy6-FTv7UavQ8lWwIAHIiz35O58TPpHKSxgExnkWGGqF1s6Uct_n3P9kWyLCvcMKBRXnIvjHBTXIIVA2CSFUH7GAwwyvGKZSUVj7Rdi8KGtgbmZN0eeRmWYunarF29-m1fwAzAudI0yM0gV7KG4RgrTEfRXPTBjs2q0VZKWQ6uWw5UrrdgngqrvaXQvntBD2JVRwOv597Y1kv4Scec-AWeboEOmlNVZFYM';

  return (
    <>
      <SEO title="Home" description="Compare prices across Amazon, Flipkart, eBay, Meesho & Croma. Find the best deals with our affiliate aggregator engine." />
      <main className="pt-6 pb-20 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Hero */}
      <section className="mb-20">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl">
          <img className="w-full h-full object-cover" src={heroImage} alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/40 to-transparent flex items-center p-8 md:p-16">
            <div className="max-w-xl text-surface-bright">
              <span className="font-label-sm text-label-sm tracking-widest uppercase mb-4 block">{heroSubtitle}</span>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">{heroTitle}</h1>
              <Link to="/shop" className="inline-flex items-center gap-2 bg-cta-vibrant text-white px-8 py-4 font-headline-md text-[16px] rounded-lg hover:opacity-90 transition-all active:scale-95">
                {heroCta}<span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline-md text-headline-md text-on-surface">Shop by Category</h2>
          <Link to="/shop" className="font-label-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center gap-3 p-6 bg-white border border-outline-variant/30 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface text-center group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Trending Now</h2>
              <p className="font-body-md text-on-surface-variant">Latest additions to the catalog</p>
            </div>
            <Link to="/shop" className="font-label-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map(product => {
              const sym: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
              return (
                <Link key={product.product_id} to={`/product/${product.product_id}`} className="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="aspect-square overflow-hidden bg-surface-container-low">
                    <img src={product.images.thumbnail_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'; }} />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant uppercase">{product.merchant.merchant_name}</span>
                    <h3 className="font-headline-md text-body-lg font-semibold text-on-surface line-clamp-1 mt-2 group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="font-headline-md text-primary mt-2">{sym[product.price.currency_code] || product.price.currency_code}{product.price.current_price.toLocaleString()}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>search_insights</span>
          <h3 className="font-headline-md text-headline-md mb-2">Multi-Platform Search</h3>
          <p className="font-body-md text-on-surface-variant">Search Amazon, Flipkart, Meesho, Croma, and eBay simultaneously.</p>
        </div>
        <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>compare_arrows</span>
          <h3 className="font-headline-md text-headline-md mb-2">Best Price Found</h3>
          <p className="font-body-md text-on-surface-variant">Automatically sorted by price so you always get the best deal.</p>
        </div>
        <div className="p-8 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-4xl text-primary mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <h3 className="font-headline-md text-headline-md mb-2">Smart Matching</h3>
          <p className="font-body-md text-on-surface-variant">Exact model code matching and fuzzy token similarity for accurate results.</p>
        </div>
      </section>
    </main>
    </>
  );
}

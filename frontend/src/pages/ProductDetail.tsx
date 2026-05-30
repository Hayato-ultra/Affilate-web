import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ProductResult, getCatalogProduct, getPriceHistory, trackPrice, checkAlertStatus, PriceHistoryPoint } from '../api';
import { optimizeImageUrl, handleImageError, getCurrencySymbol } from '../utils/images';
import { useDebounce } from '../hooks/useSearch';
import { useWishlist } from '../hooks/useWishlist';
import SEO from '../components/SEO';

const ALERT_EMAIL_KEY = 'lumina_alert_email';

const PLATFORM_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  flipkart: '#2874F0',
  meesho: '#E91E63',
  croma: '#E02020',
  ebay: '#0064D2',
};

function PriceHistoryChart({ productId, currency }: { productId: string; currency: string }) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPriceHistory(productId, range)
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="w-6 h-6 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <p className="text-on-surface-variant text-body-md text-center py-8">
        Not enough price data yet. Check back after a few tracking cycles.
      </p>
    );
  }

  const minPrice = Math.min(...history.map(h => h.price));
  const maxPrice = Math.max(...history.map(h => h.price));
  const latestPrice = history[history.length - 1].price;
  const lowestPrice = Math.min(...history.filter(h => h.price > 0).map(h => h.price));
  const isLowest = latestPrice <= lowestPrice + 0.01;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[30, 90, 180].map(d => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all border ${
                range === d
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${isLowest ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {isLowest ? 'Lowest price in ' + range + 'd' : `${getCurrencySymbol(currency)}${minPrice.toLocaleString()} low`}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="recorded_at"
            tickFormatter={(v: string) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
          />
          <YAxis
            domain={[minPrice * 0.95, maxPrice * 1.05]}
            tickFormatter={(v: number) => getCurrencySymbol(currency) + v.toLocaleString()}
            tick={{ fontSize: 10 }}
            stroke="#9ca3af"
            width={60}
          />
          <Tooltip
            formatter={(value: any) => [getCurrencySymbol(currency) + Number(value).toLocaleString(), 'Price']}
            labelFormatter={(v: any) => new Date(v).toLocaleDateString()}
          />
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrackPriceButton({ productId, currentPrice, currency }: { productId: string; currentPrice: number; currency: string }) {
  const [email, setEmail] = useState(() => { try { return localStorage.getItem(ALERT_EMAIL_KEY) || ''; } catch { return ''; } });
  const [targetPrice, setTargetPrice] = useState(Math.round(currentPrice * 0.9));
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!email || !targetPrice) return;
    setStatus('saving');
    try {
      await trackPrice(productId, targetPrice, email, currency);
      try { localStorage.setItem(ALERT_EMAIL_KEY, email); } catch {}
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <span className="material-symbols-outlined text-green-600 text-2xl">notifications_active</span>
        <p className="font-body-md text-green-800 mt-1">We'll alert you when the price drops!</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary text-primary font-headline-md rounded-lg hover:bg-primary/5 transition-all"
      >
        <span className="material-symbols-outlined">notifications</span>
        Track Price
      </button>
      {expanded && (
        <div className="mt-3 p-4 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-3">
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full mt-1 px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant">Target price</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-body-md">{getCurrencySymbol(currency)}</span>
              <input
                type="number"
                value={targetPrice}
                onChange={e => setTargetPrice(Number(e.target.value))}
                min={1}
                className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              Current: {getCurrencySymbol(currency)}{currentPrice.toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={status === 'saving'}
            className="w-full py-2.5 bg-primary text-on-primary font-headline-md rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {status === 'saving' ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Set Alert'
            )}
          </button>
          {status === 'error' && (
            <p className="font-label-sm text-label-sm text-red-600 text-center">Failed to create alert. Try again.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertTriggered, setAlertTriggered] = useState<{ target_price: number; triggered_at: string } | null>(null);
  const { has, toggle } = useWishlist();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const stored = sessionStorage.getItem('lumina_product_' + id);
        if (stored) {
          setProduct(JSON.parse(stored));
          setLoading(false);
          return;
        }
        const result = await getCatalogProduct(id);
        setProduct(result);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id || !product) return;
    let savedEmail: string | null = null;
    try { savedEmail = localStorage.getItem(ALERT_EMAIL_KEY); } catch {}
    if (!savedEmail) return;
    checkAlertStatus(id, savedEmail).then(res => {
      if (res.triggered && res.alert) {
        setAlertTriggered(res.alert);
      }
    }).catch(() => {});
  }, [id, product?.price.current_price]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  if (!product) {
    return (
      <>
        <SEO title="Product Details" description="Product details and price comparison" />
        <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-margin-mobile">
        <span className="material-symbols-outlined text-6xl text-outline">inventory_2</span>
        <h1 className="font-headline-md text-headline-md">Product not found</h1>
        <Link to="/shop" className="text-primary hover:underline">Back to Shop</Link>
      </main>
      </>
    );
  }

  const platformColor = PLATFORM_COLORS[product.merchant.platform] || '#666';

  return (
    <main className="pt-6 pb-20 max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
      <SEO title={product?.title || 'Product Details'} description={product?.description?.slice(0, 160) || 'Product details and price comparison'} />
      <Link to="/shop" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-body-md">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to results
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image */}
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] bg-surface-container-low overflow-hidden rounded-xl">
            <img
              src={optimizeImageUrl(product.images.thumbnail_url, 800, 1000)}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          </div>
          {product.images.full_url.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {product.images.full_url.slice(0, 4).map((url, i) => (
                <div key={i} className="aspect-square bg-surface-container-low rounded-lg overflow-hidden">
                  <img src={optimizeImageUrl(url)} alt="" className="w-full h-full object-cover" loading="lazy" onError={handleImageError} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {alertTriggered && (
            <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-green-600 text-2xl">notifications_active</span>
              <div>
                <p className="font-headline-md text-headline-md text-green-800">Price Drop Alert!</p>
                <p className="font-body-md text-body-md text-green-700 mt-1">
                  Price dropped to <strong>{getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}</strong> —
                  below your target of {getCurrencySymbol(product.price.currency_code)}{alertTriggered.target_price.toLocaleString()}!
                </p>
                <p className="font-label-sm text-label-sm text-green-600 mt-1">
                  Triggered {new Date(alertTriggered.triggered_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <div>
            <span
              className="font-label-sm text-label-sm text-white px-3 py-1 rounded inline-block mb-3"
              style={{ backgroundColor: platformColor }}
            >
              {product.merchant.platform.toUpperCase()}
            </span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">{product.title}</h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="font-headline-md text-headline-md text-on-surface">
                {getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}
              </span>
              {product.price.original_price && (
                <span className="text-body-lg text-on-surface-variant line-through">
                  {getCurrencySymbol(product.price.currency_code)}{product.price.original_price.toLocaleString()}
                </span>
              )}
              <button
                onClick={() => toggle(product.product_id)}
                className={`ml-auto material-symbols-outlined p-2 rounded-full transition-all active:scale-90 ${
                  has(product.product_id)
                    ? 'text-error bg-error-container/30'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-error'
                }`}
                aria-label={has(product.product_id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {has(product.product_id) ? 'favorite' : 'favorite_border'}
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{product.description}</p>
          )}

          {/* Price History Chart */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-5">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Price History</h2>
            <PriceHistoryChart productId={product.product_id} currency={product.price.currency_code} />
          </div>

          {/* Track Price */}
          <TrackPriceButton
            productId={product.product_id}
            currentPrice={product.price.current_price}
            currency={product.price.currency_code}
          />

          {/* CTA */}
          <div className="flex flex-col gap-3 pt-4">
            {product.affiliate.cloaked_url || product.affiliate.raw_url ? (
              <a
                href={product.affiliate.cloaked_url || product.affiliate.raw_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-surface-charcoal text-surface-bright py-5 font-headline-md text-body-md rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                View on {product.merchant.merchant_name}
              </a>
            ) : (
              <span className="w-full bg-surface-container-highest text-on-surface-variant py-5 font-headline-md text-body-md rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                <span className="material-symbols-outlined">link_off</span>
                No merchant link available
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

import { ProductResult } from '../api';
import { optimizeImageUrl, handleImageError, getCurrencySymbol } from '../utils/images';
import { useWishlist } from '../hooks/useWishlist';

const PLATFORM_COLORS: Record<string, string> = {
  amazon: '#FF9900',
  flipkart: '#2874F0',
  meesho: '#E91E63',
  croma: '#E02020',
  ebay: '#0064D2',
};

interface ProductCardProps {
  product: ProductResult;
  style?: React.CSSProperties;
}

export default function ProductCard({ product, style }: ProductCardProps) {
  const platformColor = PLATFORM_COLORS[product.merchant.platform] || '#666';
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.product_id);

  return (
    <div
      style={style}
      className="group relative bg-white border border-outline-variant/30 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-surface-container-low relative">
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product.product_id); }}
          className={`absolute top-3 right-3 z-10 material-symbols-outlined p-1.5 rounded-full transition-all active:scale-90 shadow-sm ${
            isWishlisted
              ? 'text-error bg-white fill-current'
              : 'text-on-surface-variant bg-white/80 hover:bg-white hover:text-error'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? 'favorite' : 'favorite_border'}
        </button>
        <img
          src={optimizeImageUrl(product.images.thumbnail_url, 400, 400)}
          srcSet={`
            ${optimizeImageUrl(product.images.thumbnail_url, 200, 200)} 200w,
            ${optimizeImageUrl(product.images.thumbnail_url, 400, 400)} 400w,
            ${optimizeImageUrl(product.images.thumbnail_url, 600, 600)} 600w
          `}
          sizes="(max-width: 640px) 200px, (max-width: 1024px) 400px, 600px"
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />
        <span
          className="absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider"
          style={{ backgroundColor: platformColor }}
        >
          {product.merchant.platform}
        </span>
      </div>
      <div className="p-4">
        <p className="font-label-sm text-label-sm text-outline mb-1 uppercase">{product.merchant.merchant_name}</p>
        <h3 className="font-headline-md text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <p className="font-headline-md text-primary font-bold">
            {getCurrencySymbol(product.price.currency_code)}{product.price.current_price.toLocaleString()}
          </p>
          {product.price.original_price && (
            <p className="text-label-sm text-on-surface-variant line-through">
              {getCurrencySymbol(product.price.currency_code)}{product.price.original_price.toLocaleString()}
            </p>
          )}
        </div>
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {product.affiliate.cloaked_url || product.affiliate.raw_url ? (
            <a
              href={product.affiliate.cloaked_url || product.affiliate.raw_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-primary text-on-primary font-label-sm rounded hover:bg-cta-vibrant transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              View on {product.merchant.merchant_name}
            </a>
          ) : (
            <span className="flex items-center justify-center gap-2 py-3 bg-surface-container-highest text-on-surface-variant font-label-sm rounded cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">link_off</span>
              No link available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

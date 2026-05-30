export interface ProductResult {
  product_id: string;
  title: string;
  normalized_title: string;
  description: string;
  price: {
    current_price: number;
    original_price: number | null;
    currency_code: string;
  };
  merchant: {
    platform: 'amazon' | 'flipkart' | 'meesho' | 'croma' | 'ebay';
    merchant_name: string;
    merchant_logo_url: string;
  };
  images: {
    thumbnail_url: string;
    full_url: string[];
  };
  identifiers: {
    model_number: string | null;
    upc: string | null;
    ean: string | null;
    asin: string | null;
    sku: string | null;
  };
  match: {
    matched: boolean;
    match_method: 'exact_code' | 'fuzzy_tokens' | 'none' | 'exact_upc' | 'exact_ean' | 'exact_asin' | 'exact_sku' | 'exact_model';
    match_confidence: number;
    match_group_id: string;
  };
  affiliate: {
    cloaked_url: string;
    raw_url: string;
    merchant_tag: string;
  };
  metadata: {
    fetched_at: string;
    cache_hit: boolean;
    stale: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CacheEntry {
  query_key: string;
  results: ProductResult[];
  fetched_at: number;
  ttl_ms: number;
  staleness_threshold_ms: number;
}

export interface AggregatorResult {
  platform: ProductResult['merchant']['platform'];
  products: RawProduct[];
  error?: string;
  source: 'api' | 'scraper' | 'error';
}

export interface RawProduct {
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  currency: string;
  image_url: string;
  image_urls: string[];
  product_url: string;
  model_number: string | null;
  upc: string | null;
  ean: string | null;
  asin: string | null;
  sku: string | null;
  merchant_name: string;
  merchant_logo_url: string;
}

export interface CloakEntry {
  short_code: string;
  merchant: string;
  product_id: string;
  raw_url: string;
  merchant_tag: string;
  created_at: number;
  click_count: number;
}

export interface SearchQuery {
  q: string;
  page?: number;
  page_size?: number;
  merchant?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'relevance';
}

export interface CacheConfig {
  ttl_ms: number;
  staleness_ms: number;
  max_entries: number;
}

export interface AggregatorConfig {
  amazon: { access_key: string; secret_key: string; associate_tag: string; country: string };
  flipkart: { api_key: string; affiliate_id: string };
  ebay: { app_id: string; cert_id: string };
  meesho: { proxy_pool: string[]; max_retries: number };
  croma: { proxy_pool: string[]; max_retries: number };
  rate_limits: { platform: string; requests_per_second: number; burst: number }[];
}

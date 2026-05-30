export interface ProductPrice {
  current_price: number;
  original_price: number | null;
  currency_code: string;
}

export interface ProductMerchant {
  platform: 'amazon' | 'flipkart' | 'meesho' | 'croma' | 'ebay';
  merchant_name: string;
  merchant_logo_url: string;
}

export interface ProductImages {
  thumbnail_url: string;
  full_url: string[];
}

export interface ProductIdentifiers {
  model_number: string | null;
  upc: string | null;
  ean: string | null;
  asin: string | null;
  sku: string | null;
}

export interface ProductMatch {
  matched: boolean;
  match_method: 'exact_code' | 'fuzzy_tokens' | 'none';
  match_confidence: number;
  match_group_id: string;
}

export interface ProductAffiliate {
  cloaked_url: string;
  raw_url: string;
  merchant_tag: string;
}

export interface ProductMetadata {
  fetched_at: string;
  cache_hit: boolean;
  stale: boolean;
}

export interface ProductResult {
  product_id: string;
  title: string;
  normalized_title: string;
  description: string;
  price: ProductPrice;
  merchant: ProductMerchant;
  images: ProductImages;
  identifiers: ProductIdentifiers;
  match: ProductMatch;
  affiliate: ProductAffiliate;
  metadata: ProductMetadata;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchResponse {
  data: ProductResult[];
  pagination: PaginationInfo;
}

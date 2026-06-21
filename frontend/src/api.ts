const API_BASE = '/api';

export interface ApiError {
  error: string;
  message?: string;
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('lumina_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.token || null;
    }
  } catch {}
  return null;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options?.headers as Record<string, string> };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { headers, ...options });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || body.message || 'Request failed');
  }

  return res.json();
}

export interface Price {
  current_price: number;
  original_price: number | null;
  currency_code: string;
}

export interface Merchant {
  platform: 'amazon' | 'flipkart' | 'meesho' | 'croma' | 'ebay';
  merchant_name: string;
  merchant_logo_url: string;
}

export interface Images {
  thumbnail_url: string;
  full_url: string[];
}

export interface Identifiers {
  model_number: string | null;
  upc: string | null;
  ean: string | null;
  asin: string | null;
  sku: string | null;
}

export interface MatchInfo {
  matched: boolean;
  match_method: 'exact_code' | 'fuzzy_tokens' | 'none';
  match_confidence: number;
  match_group_id: string;
}

export interface AffiliateInfo {
  cloaked_url: string;
  raw_url: string;
  merchant_tag: string;
}

export interface Metadata {
  fetched_at: string;
  cache_hit: boolean;
  stale: boolean;
}

export interface ProductResult {
  product_id: string;
  title: string;
  normalized_title: string;
  description: string;
  price: Price;
  merchant: Merchant;
  images: Images;
  identifiers: Identifiers;
  match: MatchInfo;
  affiliate: AffiliateInfo;
  metadata: Metadata;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SearchResponse {
  data: ProductResult[];
  pagination: Pagination;
}

export interface SearchParams {
  q: string;
  page?: number;
  page_size?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'relevance';
  merchant?: string;
  min_price?: number;
  max_price?: number;
}

export function searchProducts(params: SearchParams): Promise<SearchResponse> {
  const query = new URLSearchParams();
  query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.merchant) query.set('merchant', params.merchant);
  return request<SearchResponse>(`/search?${query}`);
}

export interface CatalogParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
  category?: string;
  q?: string;
  featured?: string;
}

export function getCatalogProducts(params?: CatalogParams): Promise<SearchResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.page_size) query.set('page_size', String(params.page_size));
  if (params?.sort_by) query.set('sort_by', params.sort_by);
  if (params?.order) query.set('order', params.order);
  if (params?.category) query.set('category', params.category);
  if (params?.q) query.set('q', params.q);
  return request<SearchResponse>(`/products?${query}`);
}

export function getCatalogProduct(id: string): Promise<ProductResult> {
  return request<ProductResult>(`/products/${id}`);
}

export interface StatsResponse {
  cache: { total: number; stale: number; avgHits: number };
  redirects: { total: number; cloaked_links: number };
  aggregations: { total: number };
}

export interface AdminProduct {
  id: string;
  title: string;
  normalized_title: string;
  description: string;
  price_current: number;
  price_original: number | null;
  currency_code: string;
  merchant_platform: string;
  merchant_name: string;
  merchant_logo_url: string;
  thumbnail_url: string;
  category: string;
  brand: string;
  model_number: string | null;
  upc: string | null;
  ean: string | null;
  asin: string | null;
  sku: string | null;
  affiliate_url: string;
  featured: boolean;
  in_stock: boolean;
  match_method: string;
  match_confidence: number;
  created_at: string;
}

export interface AdminProductsResponse {
  data: AdminProduct[];
  pagination: { page: number; page_size: number; total: number };
}

export interface AdminStats {
  totalProducts: number;
  featured: number;
  outOfStock: number;
}

export function getAdminProducts(q?: string, page = 1): Promise<AdminProductsResponse> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  return request(`/admin/products?${params}`);
}

export function createAdminProduct(data: Partial<AdminProduct>): Promise<AdminProduct> {
  return request('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAdminProduct(id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteAdminProduct(id: string): Promise<{ success: boolean }> {
  return request(`/admin/products/${id}`, {
    method: 'DELETE',
  });
}

export function toggleFeatureProduct(id: string, featured: boolean): Promise<AdminProduct> {
  return request(`/admin/products/${id}/feature`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  });
}

export function getAdminStats(): Promise<AdminStats> {
  return request('/admin/stats');
}

export function getAdminSettings(): Promise<Record<string, any>> {
  return request('/admin/settings');
}

export function updateAdminSettings(settings: Record<string, any>): Promise<{ success: boolean }> {
  return request('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>('/stats');
}

export function getHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
  return request('/health');
}

export function getPublicSettings(): Promise<Record<string, any>> {
  return request('/settings');
}

export interface AuthResponse {
  user: { id: string; email: string; name: string; role?: string };
  token?: string;
}

export function authLogin(email: string, password: string): Promise<{ user: { id: string; email: string; name: string; role?: string }; token: string }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function authRegister(email: string, password: string, name?: string): Promise<AuthResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export function authMe(token: string): Promise<AuthResponse> {
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}

export function authLogout(token: string): Promise<{ success: boolean }> {
  return request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(res => {
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  });
}

export interface AnalyticsData {
  topProducts: Array<{ product_id: string; merchant: string; click_count: number; last_clicked_at: string }>;
  recentClicks: Array<{ clicked_at: string; short_code: string; referer: string }>;
}

export function getAdminAnalytics(): Promise<AnalyticsData> {
  return request('/admin/analytics');
}

export interface ScrapedData {
  title: string;
  description: string;
  price_current: number | null;
  price_original: number | null;
  currency_code: string;
  merchant_platform: string;
  merchant_name: string;
  thumbnail_url: string;
  brand: string;
  sku: string;
  category: string;
  model_number: string;
  upc: string;
  ean: string;
  asin: string;
  affiliate_url: string;
}

export function scrapeProductUrl(url: string): Promise<ScrapedData> {
  return request('/admin/scrape', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export interface ProcessedPlatform {
  merchant: string;
  merchant_name: string;
  affiliate_url: string;
  cloaked_url: string;
  short_code: string;
  price: number | null;
  currency: string;
  thumbnail: string;
  source: string;
}

export interface ProcessUrlResponse {
  product: ScrapedData;
  source: {
    platform: string;
    merchant_name: string;
    affiliate_url: string;
    cloaked_url: string;
    short_code: string;
  };
  cross_platform: ProcessedPlatform[];
  saved_product_id: string | null;
}

export async function processProductUrl(url: string): Promise<ProcessUrlResponse> {
  const { job_id } = await request<{ job_id: string; status: string }>('/process-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

  // Poll for result
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const status = await request<{ status: string; result?: ProcessUrlResponse; error?: string }>(`/process-url/${job_id}`);
    if (status.status === 'completed' && status.result) {
      return status.result;
    }
    if (status.status === 'failed') {
      throw new Error(status.error || 'URL processing failed');
    }
  }

  throw new Error('URL processing timed out');
}

export interface PriceHistoryPoint {
  product_id: string;
  price: number;
  currency: string;
  merchant: string;
  recorded_at: string;
}

export function getPriceHistory(productId: string, days = 90): Promise<{ data: PriceHistoryPoint[] }> {
  return request(`/products/${productId}/price-history?days=${days}`);
}

export function trackPrice(productId: string, targetPrice: number, email: string, currency = 'INR'): Promise<{ success: boolean; alert: any }> {
  return request(`/products/${productId}/track`, {
    method: 'POST',
    body: JSON.stringify({ target_price: targetPrice, email, currency }),
  });
}

export interface AlertStatus {
  triggered: boolean;
  alert: {
    target_price: number;
    triggered_at: string;
    active: boolean;
  } | null;
}

export function checkAlertStatus(productId: string, email: string): Promise<AlertStatus> {
  return request(`/products/${productId}/alert-status?email=${encodeURIComponent(email)}`);
}

export interface NotificationItem {
  id: number;
  product_id: string;
  product_title: string;
  target_price: number;
  current_price: number;
  currency: string;
  read: number;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread: number;
}

export function getNotifications(email: string): Promise<NotificationsResponse> {
  return request(`/notifications?email=${encodeURIComponent(email)}`);
}

export function markNotificationRead(id: number): Promise<{ success: boolean }> {
  return request(`/notifications/${id}/read`, { method: 'PATCH' });
}

import { createScopedLogger } from '../utils/logger';
import https from 'https';
import http from 'http';

const log = createScopedLogger('scrape');

export interface ScrapedProduct {
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

const MERCHANT_MAP: Record<string, { platform: string; name: string }> = {
  amazon: { platform: 'amazon', name: 'Amazon' },
  flipkart: { platform: 'flipkart', name: 'Flipkart' },
  ebay: { platform: 'ebay', name: 'eBay' },
  meesho: { platform: 'meesho', name: 'Meesho' },
  croma: { platform: 'croma', name: 'Croma' },
  walmart: { platform: 'amazon', name: 'Walmart' },
  bestbuy: { platform: 'amazon', name: 'Best Buy' },
  target: { platform: 'amazon', name: 'Target' },
};

function detectMerchant(url: string): { platform: string; name: string } {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
    for (const [key, val] of Object.entries(MERCHANT_MAP)) {
      if (hostname.includes(key)) return val;
    }
    const first = hostname.split('.')[0];
    return { platform: first, name: first.charAt(0).toUpperCase() + first.slice(1) };
  } catch {
    return { platform: 'amazon', name: 'Amazon' };
  }
}

function extractCurrency(text: string): string {
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('₹') || /Rs\b/i.test(text)) return 'INR';
  if (text.includes('¥')) return 'JPY';
  return 'USD';
}

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    mod.get(url, { headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    }}, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirect = new URL(res.headers.location, url).href;
        return fetchHtml(redirect).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractMetaContent(html: string, property: string): string {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegex(property)}["'][^>]+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  const regex2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapeRegex(property)}["']`, 'i');
  const match2 = html.match(regex2);
  return match2 ? match2[1] : '';
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) { results.push(...parsed); } else { results.push(parsed); }
    } catch {}
  }
  return results;
}

function extractTagContent(html: string, tag: string, attr: string, attrVal: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']${escapeRegex(attrVal)}["'][^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = html.match(regex);
  return match ? match[1].trim() : '';
}

function extractTitleTag(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : '';
}

export async function scrapeUrl(url: string): Promise<ScrapedProduct> {
  const result: ScrapedProduct = {
    title: '', description: '', price_current: null, price_original: null,
    currency_code: 'USD', merchant_platform: 'amazon', merchant_name: '',
    thumbnail_url: '', brand: '', sku: '',
    category: '', model_number: '', upc: '', ean: '', asin: '', affiliate_url: url,
  };

  // Extract ASIN from Amazon URL
  const urlLower = url.toLowerCase();
  const asinMatch = urlLower.match(/(?:dp|product|asin)\/([a-z0-9]{10})(?:[/?]|$)/i);
  if (asinMatch) result.asin = asinMatch[1].toUpperCase();

  const merchant = detectMerchant(url);
  result.merchant_platform = merchant.platform;
  result.merchant_name = merchant.name;

  try {
    const html = await fetchHtml(url);

    // JSON-LD structured data
    const jsonld = extractJsonLd(html).find((item: any) =>
      item['@type'] === 'Product' || (item['@type'] || '').includes('Product')
    );

    if (jsonld) {
      result.title = jsonld.name || result.title;
      result.description = jsonld.description || result.description;
      result.brand = jsonld.brand?.name || jsonld.brand || result.brand;
      result.sku = jsonld.sku || jsonld.mpn || result.sku;
      result.model_number = jsonld.mpn || jsonld.model || result.model_number;
      result.category = jsonld.category || (Array.isArray(jsonld.category) ? jsonld.category.join(', ') : '') || result.category;

      // GTIN identifiers
      const gtin = jsonld.gtin || jsonld.gtin12 || jsonld.gtin13 || jsonld.gtin14 || '';
      if (gtin) {
        if (gtin.length <= 12) result.upc = gtin;
        if (gtin.length === 13) result.ean = gtin;
      }

      if (jsonld.offers) {
        const offers = Array.isArray(jsonld.offers) ? jsonld.offers[0] : jsonld.offers;
        result.price_current = offers.price ? parsePrice(String(offers.price)) : null;
        result.price_original = offers.highPrice ? parsePrice(String(offers.highPrice)) : null;
        if (offers.priceCurrency) result.currency_code = offers.priceCurrency;
      }

      if (jsonld.image) {
        const img = Array.isArray(jsonld.image) ? jsonld.image[0] : jsonld.image;
        result.thumbnail_url = (typeof img === 'string' ? img : img?.url) || result.thumbnail_url;
      }
    }

    // Open Graph / meta tags fallback
    if (!result.title) result.title = extractMetaContent(html, 'og:title');
    if (!result.description) result.description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description');
    if (!result.thumbnail_url) result.thumbnail_url = extractMetaContent(html, 'og:image') || extractMetaContent(html, 'twitter:image');

    const ogPrice = extractMetaContent(html, 'product:price:amount') || extractMetaContent(html, 'og:price:amount');
    const ogCurrency = extractMetaContent(html, 'product:price:currency') || extractMetaContent(html, 'og:price:currency');

    if (!result.price_current && ogPrice) result.price_current = parsePrice(ogPrice);
    if (ogCurrency) result.currency_code = ogCurrency;

    // DOM fallback
    if (!result.title) {
      const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      result.title = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : extractTitleTag(html);
    }

    if (!result.price_current) {
      const priceRegex = /(?:₹|Rs\.?\s*|\$|€|£)([\d,]+\.?\d*)/i;
      const match = html.match(priceRegex);
      if (match) {
        result.price_current = parsePrice(match[0]);
        result.currency_code = extractCurrency(match[0]);
      }
    }

    // Clean up relative image URLs
    if (result.thumbnail_url && !result.thumbnail_url.startsWith('http')) {
      try {
        const base = new URL(url);
        result.thumbnail_url = new URL(result.thumbnail_url, base.origin).href;
      } catch {}
    }

    if (!result.title) result.title = new URL(url).pathname.split('/').filter(Boolean).pop() || 'Unknown Product';

  } catch (err: any) {
    log.error({ url, error: err.message }, 'Scrape failed');
    throw new Error(`Failed to scrape URL: ${err.message}`);
  }

  return result;
}

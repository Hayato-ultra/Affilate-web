import { scrapeUrl, ScrapedProduct, fetchHtml } from './scrape';
import { createScopedLogger } from '../utils/logger';

const log = createScopedLogger('search-platform');

interface PlatformConfig {
  searchUrl: (q: string) => string;
  productLink: (html: string) => string | null;
  merchantName: string;
}

function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

const PLATFORMS: Record<string, PlatformConfig> = {
  amazon: {
    searchUrl: (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    productLink(html: string) {
      const m = html.match(/href=["'](https?:\/\/[^"']*\/dp\/[A-Z0-9]{10}(?:[/?#][^"']*)?)["']/i);
      if (m) return m[1];
      const m2 = html.match(/href=["'](\/[^"']*\/dp\/[A-Z0-9]{10}(?:[/?#][^"']*)?)["']/i);
      return m2 ? resolveUrl(m2[1], 'https://www.amazon.in') : null;
    },
    merchantName: 'Amazon',
  },
  flipkart: {
    searchUrl: (q: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    productLink(html: string) {
      const m = html.match(/href=["'](\/[^"']*\/p\/[a-zA-Z0-9]+(?:[/?#][^"']*)?)["']/i);
      return m ? resolveUrl(m[1], 'https://www.flipkart.com') : null;
    },
    merchantName: 'Flipkart',
  },
  ebay: {
    searchUrl: (q: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_ipg=1`,
    productLink(html: string) {
      const m = html.match(/href=["'](https?:\/\/[^"']*\/itm\/\d+(?:[/?#][^"']*)?)["']/i);
      if (m) return m[1];
      const m2 = html.match(/href=["'](\/itm\/\d+(?:[/?#][^"']*)?)["']/i);
      return m2 ? resolveUrl(m2[1], 'https://www.ebay.com') : null;
    },
    merchantName: 'eBay',
  },
  meesho: {
    searchUrl: (q: string) => `https://www.meesho.com/search?q=${encodeURIComponent(q)}`,
    productLink(html: string) {
      const m = html.match(/href=["'](\/[^"']*\/product\/[^"']+)["']/i);
      return m ? resolveUrl(m[1], 'https://www.meesho.com') : null;
    },
    merchantName: 'Meesho',
  },
  croma: {
    searchUrl: (q: string) => `https://www.croma.com/search/?q=${encodeURIComponent(q)}`,
    productLink(html: string) {
      const m = html.match(/href=["'](\/[^"']+\/p\/\d+(?:[/?#][^"']*)?)["']/i);
      return m ? resolveUrl(m[1], 'https://www.croma.com') : null;
    },
    merchantName: 'Croma',
  },
};

export interface PlatformSearchResult {
  merchant: string;
  merchant_name: string;
  product_url: string;
  scraped: ScrapedProduct | null;
  error?: string;
}

export async function searchPlatform(platform: string, query: string, timeoutMs = 15000): Promise<PlatformSearchResult | null> {
  const cfg = PLATFORMS[platform];
  if (!cfg) {
    log.warn({ platform }, 'Unknown platform');
    return null;
  }

  const searchUrl = cfg.searchUrl(query);

  try {
    const html = await fetchHtml(searchUrl);

    const productUrl = cfg.productLink(html);
    if (!productUrl) {
      log.debug({ platform, searchUrl }, 'No product link found in search results');
      return null;
    }

    log.debug({ platform, productUrl }, 'Found product URL');

    try {
      const scraped = await scrapeUrl(productUrl);
      return {
        merchant: platform,
        merchant_name: cfg.merchantName,
        product_url: productUrl,
        scraped,
      };
    } catch (err: any) {
      log.error({ platform, productUrl, error: err.message }, 'Failed to scrape product page');
      return {
        merchant: platform,
        merchant_name: cfg.merchantName,
        product_url: productUrl,
        scraped: null,
        error: `Scrape failed: ${err.message}`,
      };
    }
  } catch (err: any) {
    log.debug({ platform, searchUrl, error: err.message }, 'Search request failed');
    return null;
  }
}

export async function searchAllPlatforms(
  query: string,
  excludePlatform?: string
): Promise<PlatformSearchResult[]> {
  const platforms = Object.keys(PLATFORMS).filter(p => p !== excludePlatform);

  const results = await Promise.allSettled(
    platforms.map(p => searchPlatform(p, query))
  );

  const fulfilled: PlatformSearchResult[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === 'fulfilled' && result.value) {
      fulfilled.push(result.value);
    }
  }

  return fulfilled;
}

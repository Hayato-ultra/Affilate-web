import { CacheConfig, AggregatorConfig } from '../types';

export function validateEnv(): string[] {
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';
  const required = isProd
    ? ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    : [];
  for (const key of required) {
    if (!process.env[key]) warnings.push(`CRITICAL: Missing ${key} in production`);
  }
  if (!process.env.RESEND_API_KEY) warnings.push('WARNING: RESEND_API_KEY not set — email alerts will not be delivered');
  if (!process.env.SUPABASE_URL) warnings.push('WARNING: SUPABASE_URL not set — fallback defaults used');
  if (!process.env.AMAZON_ACCESS_KEY) warnings.push('WARNING: AMAZON_ACCESS_KEY not set — Amazon aggregator will fail');
  if (!process.env.EBAY_APP_ID) warnings.push('WARNING: EBAY_APP_ID not set — eBay aggregator will fail');
  if (isProd && !process.env.CORS_ORIGIN) warnings.push('WARNING: CORS_ORIGIN not set — all origins allowed');
  return warnings;
}

export function safeErrorMessage(err: any): string {
  if (process.env.NODE_ENV === 'production') {
    return 'An internal error occurred';
  }
  return err?.message || String(err);
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'alerts@luminacommerce.com',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  db: {
    get path() { return process.env.DB_PATH || './data/affiliate.db'; },
  },

  cache: {
    ttl_ms: 12 * 60 * 60 * 1000,
    staleness_ms: 24 * 60 * 60 * 1000,
    max_entries: 10000,
  } satisfies CacheConfig,

  aggregators: {
    amazon: {
      access_key: process.env.AMAZON_ACCESS_KEY || '',
      secret_key: process.env.AMAZON_SECRET_KEY || '',
      associate_tag: process.env.AMAZON_ASSOCIATE_TAG || '',
      country: process.env.AMAZON_COUNTRY || 'IN',
    },
    flipkart: {
      api_key: process.env.FLIPKART_API_KEY || '',
      affiliate_id: process.env.FLIPKART_AFFILIATE_ID || '',
    },
    ebay: {
      app_id: process.env.EBAY_APP_ID || '',
      cert_id: process.env.EBAY_CERT_ID || '',
    },
    meesho: {
      proxy_pool: (process.env.MEESHO_PROXY_POOL || '').split(',').filter(Boolean),
      max_retries: 3,
    },
    croma: {
      proxy_pool: (process.env.CROMA_PROXY_POOL || '').split(',').filter(Boolean),
      max_retries: 3,
    },
    rate_limits: [
      { platform: 'amazon', requests_per_second: 1, burst: 5 },
      { platform: 'flipkart', requests_per_second: 2, burst: 10 },
      { platform: 'ebay', requests_per_second: 5, burst: 20 },
      { platform: 'meesho', requests_per_second: 0.5, burst: 2 },
      { platform: 'croma', requests_per_second: 0.5, burst: 2 },
    ],
  } satisfies AggregatorConfig,

  affiliate: {
    baseUrl: process.env.AFFILIATE_BASE_URL || 'http://localhost:3000',
    tagMap: {
      amazon: process.env.AMAZON_ASSOCIATE_TAG || 'affiliate-21',
      flipkart: process.env.FLIPKART_AFFILIATE_ID || 'affiliate123',
      ebay: process.env.EBAY_AFFILIATE_ID || 'affiliate456',
    } as Record<string, string>,
  },
};

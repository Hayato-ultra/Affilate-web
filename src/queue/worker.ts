import { Worker, Queue } from 'bullmq';
import { nanoid } from 'nanoid';
import { createScopedLogger } from '../utils/logger';
import { config } from '../utils/config';
import { evictStaleEntries } from '../cache/cache';
import { searchProducts } from '../pipeline';
import { refreshTrackedProducts, recordCurrentPrice } from '../tracking/price-tracker';
import { checkAlerts } from '../tracking/alert-service';
import { getDb } from '../db/connection';
import { scrapeUrl } from '../api/scrape';
import { parseUrl, injectAffiliateTag } from '../affiliate/parser';
import { searchAllPlatforms } from '../api/search-platform';
import { createCloakedLink, cloakedUrl } from '../affiliate/cloak';
import { getSupabaseAdmin } from '../db/supabase';

const log = createScopedLogger('worker');

export const aggregationQueue = new Queue('aggregation', {
  connection: { host: config.redis.host, port: config.redis.port },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});

export const cacheMaintenanceQueue = new Queue('cache-maintenance', {
  connection: { host: config.redis.host, port: config.redis.port },
});

export const priceTrackingQueue = new Queue('price-tracking', {
  connection: { host: config.redis.host, port: config.redis.port },
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 86400 },
  },
});

export const urlProcessingQueue = new Queue('url-processing', {
  connection: { host: config.redis.host, port: config.redis.port },
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 7200 },
    removeOnFail: { age: 86400 },
  },
});

const worker = new Worker('aggregation', async job => {
  const { query } = job.data;

  log.info({ jobId: job.id, query }, 'Processing aggregation job');

  try {
    const result = await searchProducts({ q: query, page_size: 50 });
    log.info({ jobId: job.id, query, count: result.data.length }, 'Aggregation job complete');
    return { success: true, count: result.data.length };
  } catch (err) {
    log.error({ jobId: job.id, query, error: (err as Error).message }, 'Aggregation job failed');
    throw err;
  }
}, {
  connection: { host: config.redis.host, port: config.redis.port },
  concurrency: 5,
  limiter: { max: 10, duration: 1000 },
});

const cacheWorker = new Worker('cache-maintenance', async () => {
  log.info('Running cache maintenance');
  const evicted = evictStaleEntries();
  log.info({ evicted }, 'Cache maintenance complete');
}, {
  connection: { host: config.redis.host, port: config.redis.port },
});

const urlWorker = new Worker('url-processing', async (job) => {
  const { url } = job.data;
  const jobId = job.id || nanoid(12);
  log.info({ jobId, url }, 'Processing URL job');

  const db = getDb();
  db.prepare(`INSERT OR REPLACE INTO url_processing_jobs (job_id, url, status) VALUES (?, ?, 'processing')`)
    .run(jobId, url);

  try {
    const scraped = await scrapeUrl(url);
    const parsed = parseUrl(url);
    const tag = config.affiliate.tagMap[scraped.merchant_platform] || '';
    const affiliateUrl = injectAffiliateTag(parsed.cleanUrl, scraped.merchant_platform, tag);
    const productId = scraped.asin || nanoid(10);
    const cloaked = createCloakedLink(affiliateUrl, scraped.merchant_platform, productId);

    const supabase = getSupabaseAdmin();

    const crossPlatform: any[] = [{
      merchant: scraped.merchant_platform,
      merchant_name: scraped.merchant_name,
      affiliate_url: affiliateUrl,
      cloaked_url: cloakedUrl(cloaked.short_code),
      short_code: cloaked.short_code,
      price: scraped.price_current,
      currency: scraped.currency_code,
      thumbnail: scraped.thumbnail_url,
      source: 'scraped',
    }];

    const liveResults = scraped.title
      ? await searchAllPlatforms(scraped.title, scraped.merchant_platform)
      : [];

    for (const result of liveResults) {
      if (!result.scraped) {
        const searchTag = config.affiliate.tagMap[result.merchant] || '';
        const affUrl = injectAffiliateTag(result.product_url, result.merchant, searchTag);
        crossPlatform.push({
          merchant: result.merchant,
          merchant_name: result.merchant_name,
          affiliate_url: affUrl,
          cloaked_url: affUrl,
          short_code: '',
          price: null,
          currency: '',
          thumbnail: '',
          source: 'live',
        });
        continue;
      }

      const s = result.scraped;
      const searchTag = config.affiliate.tagMap[result.merchant] || '';
      const affUrl = injectAffiliateTag(result.product_url, result.merchant, searchTag);
      const mc = createCloakedLink(affUrl, result.merchant, s.asin || nanoid(10));

      crossPlatform.push({
        merchant: result.merchant,
        merchant_name: result.merchant_name,
        affiliate_url: affUrl,
        cloaked_url: cloakedUrl(mc.short_code),
        short_code: mc.short_code,
        price: s.price_current,
        currency: s.currency_code,
        thumbnail: s.thumbnail_url,
        source: 'live',
      });

      try {
        let existingId: string | null = null;
        if (s.asin) {
          const { data: existing } = await supabase.from('products').select('id').eq('asin', s.asin).maybeSingle();
          if (existing) existingId = existing.id;
        }
        const productData = {
          title: s.title || scraped.title,
          normalized_title: (s.title || scraped.title).toLowerCase(),
          description: s.description || '',
          price_current: s.price_current,
          price_original: s.price_original,
          currency_code: s.currency_code || 'USD',
          merchant_platform: result.merchant,
          merchant_name: result.merchant_name,
          thumbnail_url: s.thumbnail_url || '',
          brand: s.brand || '',
          sku: s.sku || '',
          category: s.category || '',
          model_number: s.model_number || '',
          upc: s.upc || '',
          ean: s.ean || '',
          asin: s.asin || '',
          affiliate_url: affUrl,
          match_method: 'none',
          match_confidence: 0,
          featured: false,
          in_stock: true,
        };
        let savedId = existingId;
        if (existingId) {
          await supabase.from('products').update(productData).eq('id', existingId);
        } else {
          const { data: inserted } = await supabase.from('products').insert(productData).select('id').single();
          if (inserted) savedId = inserted.id;
        }
        if (savedId) {
          recordCurrentPrice(savedId).catch(e => log.error({ error: e.message, productId: savedId }, 'Failed to record cross-platform price history'));
        }
      } catch (err: any) {
        log.error({ error: err.message, merchant: result.merchant }, 'Failed to save cross-platform product');
      }
    }

    let savedProduct: any = null;
    if (scraped.title) {
      let existingId: string | null = null;
      if (scraped.asin) {
        const { data: existing } = await supabase.from('products').select('id').eq('asin', scraped.asin).maybeSingle();
        if (existing) existingId = existing.id;
      }

      const productData = {
        title: scraped.title,
        normalized_title: scraped.title.toLowerCase(),
        description: scraped.description || '',
        price_current: scraped.price_current,
        price_original: scraped.price_original,
        currency_code: scraped.currency_code || 'USD',
        merchant_platform: scraped.merchant_platform,
        merchant_name: scraped.merchant_name,
        thumbnail_url: scraped.thumbnail_url || '',
        brand: scraped.brand || '',
        sku: scraped.sku || '',
        category: scraped.category || '',
        model_number: scraped.model_number || '',
        upc: scraped.upc || '',
        ean: scraped.ean || '',
        asin: scraped.asin || '',
        affiliate_url: affiliateUrl,
        match_method: 'none',
        match_confidence: 0,
        featured: false,
        in_stock: true,
      };

      if (existingId) {
        const { data, error } = await supabase.from('products').update(productData).eq('id', existingId).select().single();
        if (!error) savedProduct = data;
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (!error) savedProduct = data;
      }
      if (savedProduct) {
        recordCurrentPrice(savedProduct.id).catch(e => log.error({ error: e.message, productId: savedProduct.id }, 'Failed to record source price history'));
      }
    }

    const result = {
      product: scraped,
      source: {
        platform: scraped.merchant_platform,
        merchant_name: scraped.merchant_name,
        affiliate_url: affiliateUrl,
        cloaked_url: cloakedUrl(cloaked.short_code),
        short_code: cloaked.short_code,
      },
      cross_platform: crossPlatform,
      saved_product_id: savedProduct?.id || null,
    };

    db.prepare(`UPDATE url_processing_jobs SET status = 'completed', result_blob = ?, completed_at = ? WHERE job_id = ?`)
      .run(JSON.stringify(result), Date.now(), jobId);

    log.info({ jobId, url }, 'URL processing job completed');
    return result;
  } catch (err: any) {
    const errorMsg = (err as Error).message || 'URL processing failed';
    db.prepare(`UPDATE url_processing_jobs SET status = 'failed', error = ?, completed_at = ? WHERE job_id = ?`)
      .run(errorMsg, Date.now(), jobId);
    log.error({ jobId, url, error: errorMsg }, 'URL processing job failed');
    throw err;
  }
}, {
  connection: { host: config.redis.host, port: config.redis.port },
  concurrency: 3,
  limiter: { max: 5, duration: 1000 },
});

const priceTrackingWorker = new Worker('price-tracking', async (job) => {
  const { action } = job.data;

  if (action === 'refresh') {
    log.info('Starting price refresh for tracked products');
    const count = await refreshTrackedProducts();
    log.info({ count }, 'Price refresh complete');
    const triggered = await checkAlerts();
    log.info({ triggered }, 'Alert check complete');
    return { refreshed: count, alertsTriggered: triggered };
  }

  log.warn({ action }, 'Unknown price tracking action');
}, {
  connection: { host: config.redis.host, port: config.redis.port },
  concurrency: 1,
});

worker.on('completed', job => log.info({ jobId: job.id }, 'Job completed'));
worker.on('failed', (job, err) => log.error({ jobId: job?.id, error: err.message }, 'Job failed'));

urlWorker.on('completed', job => log.info({ jobId: job.id }, 'URL job completed'));
urlWorker.on('failed', (job, err) => log.error({ jobId: job?.id, error: err.message }, 'URL job failed'));

export async function scheduleCacheMaintenance(): Promise<void> {
  await cacheMaintenanceQueue.add('evict-stale', {}, {
    repeat: { every: 6 * 60 * 60 * 1000 },
  });
  log.info('Cache maintenance scheduled every 6 hours');
}

export async function enqueueAggregation(query: string): Promise<void> {
  await aggregationQueue.add('aggregate', { query });
  log.debug({ query }, 'Aggregation enqueued');
}

export async function enqueueUrlProcessing(url: string): Promise<string> {
  const job = await urlProcessingQueue.add('process-url', { url });
  log.info({ jobId: job.id, url }, 'URL processing enqueued');

  const db = getDb();
  db.prepare(`INSERT OR IGNORE INTO url_processing_jobs (job_id, url, status) VALUES (?, ?, 'queued')`)
    .run(job.id!, url);

  return job.id!;
}

export async function schedulePriceTracking(): Promise<void> {
  await priceTrackingQueue.add('price-refresh', { action: 'refresh' }, {
    repeat: { every: 12 * 60 * 60 * 1000 },
  });
  log.info('Price tracking scheduled every 12 hours');
}

export async function triggerPriceRefresh(): Promise<void> {
  await priceTrackingQueue.add('price-refresh', { action: 'refresh' });
  log.info('Price refresh triggered');
}

log.info('Worker initialized');

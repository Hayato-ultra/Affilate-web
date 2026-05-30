import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { searchProducts } from '../pipeline';
import { resolveCloakedLink, recordClick, createCloakedLink, cloakedUrl } from '../affiliate/cloak';
import { cacheStats } from '../cache/cache';
import { getDb } from '../db/connection';
import { getSupabaseAdmin } from '../db/supabase';
import { createScopedLogger } from '../utils/logger';
import { searchRateLimit, apiRateLimit } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';
import { PaginatedResponse, ProductResult } from '../types';
import { getPriceHistory, recordCurrentPrice } from '../tracking/price-tracker';
import { checkAlerts } from '../tracking/alert-service';
import { scrapeUrl, ScrapedProduct } from './scrape';
import { parseUrl, injectAffiliateTag } from '../affiliate/parser';
import { config } from '../utils/config';
import { searchAllPlatforms, PlatformSearchResult } from './search-platform';
import { enqueueUrlProcessing } from '../queue/worker';
import { sanitizeHtml } from '../utils/xss';

const log = createScopedLogger('routes');
const router = Router();

function supabaseToProduct(row: any): ProductResult {
  const rawUrl = row.affiliate_url || row.product_url || '';
  const merchant = row.merchant_platform || 'amazon';
  const tag = config.affiliate.tagMap[merchant] || '';
  const parsedUrl = rawUrl ? injectAffiliateTag(rawUrl, merchant, tag) : '';

  return {
    product_id: row.id,
    title: sanitizeHtml(row.title || ''),
    normalized_title: sanitizeHtml(row.normalized_title || row.title || ''),
    description: sanitizeHtml(row.description || ''),
    price: {
      current_price: parseFloat(row.price_current),
      original_price: row.price_original ? parseFloat(row.price_original) : null,
      currency_code: row.currency_code,
    },
    merchant: {
      platform: merchant,
      merchant_name: sanitizeHtml(row.merchant_name || merchant || ''),
      merchant_logo_url: row.merchant_logo_url || '',
    },
    images: {
      thumbnail_url: row.thumbnail_url || '',
      full_url: [],
    },
    identifiers: {
      model_number: row.model_number || null,
      upc: row.upc || null,
      ean: row.ean || null,
      asin: row.asin || null,
      sku: row.sku || null,
    },
    match: {
      matched: row.match_method !== 'none' && row.match_method !== null,
      match_method: row.match_method || 'none',
      match_confidence: row.match_confidence || 0,
      match_group_id: row.match_group_id || '',
    },
    affiliate: {
      cloaked_url: parsedUrl,
      raw_url: parsedUrl,
      merchant_tag: tag,
    },
    metadata: {
      fetched_at: row.created_at || new Date().toISOString(),
      cache_hit: false,
      stale: false,
    },
  };
}

router.get('/search', searchRateLimit, async (req: Request, res: Response) => {
  const q = (req.query.q as string || '').trim();
  const page = parseInt(req.query.page as string || '1', 10);
  const page_size = Math.min(parseInt(req.query.page_size as string || '20', 10), 50);
  const sort_by = (req.query.sort_by as string || 'price_asc') as any;
  const merchant = req.query.merchant as string | undefined;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }

  try {
    const result = await searchProducts({ q, page, page_size, sort_by, merchant });
    res.json(result);
  } catch (err) {
    log.error({ query: q, error: (err as Error).message }, 'Search failed');
    res.status(500).json({ error: 'Search failed', message: (err as Error).message });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const page_size = Math.min(parseInt(req.query.page_size as string || '24', 10), 50);
    const sort_by = (req.query.sort_by as string) || 'created_at';
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';
    const category = req.query.category as string | undefined;
    const q = req.query.q as string | undefined;
    const featured = req.query.featured as string | undefined;

    let query = supabase.from('products').select('*', { count: 'exact', head: false });

    if (q?.trim()) {
      query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const from = (page - 1) * page_size;
    const to = from + page_size - 1;

    const { data, error, count } = await query
      .order(sort_by, { ascending: order === 'asc' })
      .range(from, to);

    if (error) {
      log.error({ error: error.message }, 'Supabase products query failed');
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    const products = (data || []).map(supabaseToProduct);
    const total = count || 0;

    res.json({
      data: products,
      pagination: {
        page,
        page_size,
        total_items: total,
        total_pages: Math.ceil(total / page_size) || 1,
        has_next: from + page_size < total,
        has_prev: page > 1,
      },
    });
  } catch (err) {
    log.error({ error: (err as Error).message }, 'Products route failed');
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();

    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(supabaseToProduct(data));
  } catch (err) {
    log.error({ error: (err as Error).message }, 'Product detail fetch failed');
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.get('/go/:shortCode', async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const entry = resolveCloakedLink(shortCode);
  if (!entry) {
    return res.status(404).json({ error: 'Link not found' });
  }

  recordClick(
    shortCode,
    req.ip,
    req.headers['user-agent'],
    req.headers['referer']
  );

  log.info({ shortCode, target: entry.raw_url.slice(0, 80) }, 'Redirect');
  res.redirect(301, entry.raw_url);
});

router.get('/stats', requireAuth, apiRateLimit, async (_req: Request, res: Response) => {
  try {
    const db = getDb();

    const totalRedirects = (db.prepare('SELECT COUNT(*) as c FROM click_analytics').get() as any).c;
    const totalCloaked = (db.prepare('SELECT COUNT(*) as c FROM cloaked_links').get() as any).c;
    const totalAggregations = (db.prepare('SELECT COUNT(*) as c FROM aggregator_log').get() as any).c;
    const cacheInfo = cacheStats();

    res.json({
      cache: cacheInfo,
      redirects: { total: totalRedirects, cloaked_links: totalCloaked },
      aggregations: { total: totalAggregations },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) return res.status(500).json({ error: 'Failed to fetch settings' });
    const settings: Record<string, any> = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/process-url', requireAuth, async (req: Request, res: Response) => {
  const url = typeof req.body.url === 'string' ? req.body.url.replace(/[<>\s]/g, '').slice(0, 2000) : '';

  if (!url) {
    return res.status(400).json({ error: 'url is required' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const scraped = await scrapeUrl(url);
    const parsed = parseUrl(url);
    const tag = config.affiliate.tagMap[scraped.merchant_platform] || '';
    const affiliateUrl = injectAffiliateTag(parsed.cleanUrl, scraped.merchant_platform, tag);
    const productId = scraped.asin || nanoid(10);
    const cloaked = createCloakedLink(affiliateUrl, scraped.merchant_platform, productId);

    const supabase = getSupabaseAdmin();

    // Start with the source product as the first platform entry
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

    // Live search all other platforms
    const liveResults = scraped.title
      ? await searchAllPlatforms(scraped.title, scraped.merchant_platform)
      : [];

    // Save each live result to Supabase and build cross-platform links
    for (const result of liveResults) {
      if (!result.scraped) {
        // Product URL found but couldn't scrape — still include if URL exists
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

      // Save/update in Supabase
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
        if (existingId) {
          await supabase.from('products').update(productData).eq('id', existingId);
        } else {
          await supabase.from('products').insert(productData);
        }
      } catch (err: any) {
        log.error({ error: err.message, merchant: result.merchant }, 'Failed to save cross-platform product');
      }
    }

    // Also save the source product
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
    }

    res.json({
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
    });
  } catch (err: any) {
    log.error({ url, error: err.message }, 'URL processing failed');
    res.status(500).json({ error: 'Failed to process URL', message: err.message });
  }
});

router.post('/products/:id/track', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { target_price, email, currency } = req.body;

  if (!target_price || !email) {
    return res.status(400).json({ error: 'target_price and email are required' });
  }

  const sanitizedEmail = typeof email === 'string' ? email.replace(/<[^>]*>/g, '').slice(0, 254) : '';
  if (!sanitizedEmail.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  req.body.email = sanitizedEmail; 
  if (typeof currency === 'string') {
    req.body.currency = currency.replace(/<[^>]*>/g, '').slice(0, 3);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        product_id: id,
        target_price,
        currency: currency || 'INR',
        email,
        active: true,
      })
      .select()
      .single();

    if (error) {
      log.error({ productId: id, error: error.message }, 'Failed to create alert');
      return res.status(500).json({ error: 'Failed to create price alert' });
    }

    await recordCurrentPrice(id);

    res.json({ success: true, alert: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create price alert' });
  }
});

router.get('/products/:id/price-history', async (req: Request, res: Response) => {
  const { id } = req.params;
  const days = parseInt(req.query.days as string || '90', 10);

  try {
    const history = await getPriceHistory(id, days);
    res.json({ data: history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

router.get('/products/:id/alert-status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const email = ((req.query.email as string) || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.json({ triggered: false });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('price_alerts')
      .select('target_price, triggered_at, active')
      .eq('product_id', id)
      .eq('email', email)
      .eq('active', false)
      .not('triggered_at', 'is', null)
      .order('triggered_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    res.json({
      triggered: !!data,
      alert: data || null,
    });
  } catch (err: any) {
    log.error({ error: err.message, productId: id }, 'Failed to check alert status');
    res.json({ triggered: false });
  }
});

router.get('/notifications', async (req: Request, res: Response) => {
  const email = ((req.query.email as string) || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return res.json({ notifications: [], unread: 0 });
  }

  try {
    const db = getDb();
    const notifications = db.prepare(`
      SELECT id, product_id, product_title, target_price, current_price, currency, read, created_at
      FROM notifications
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(email);

    const unread = db.prepare(`
      SELECT COUNT(*) as count FROM notifications WHERE email = ? AND read = 0
    `).get(email) as any;

    res.json({ notifications, unread: unread?.count || 0 });
  } catch (err: any) {
    log.error({ error: err.message }, 'Failed to fetch notifications');
    res.json({ notifications: [], unread: 0 });
  }
});

router.patch('/notifications/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(Number(id));
    res.json({ success: true });
  } catch (err: any) {
    log.error({ error: err.message }, 'Failed to mark notification read');
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;

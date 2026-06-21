import { Router, Request, Response } from 'express';
import { searchProducts } from '../pipeline';
import { resolveCloakedLink, recordClick } from '../affiliate/cloak';
import { cacheStats } from '../cache/cache';
import { getDb } from '../db/connection';
import { getSupabaseAdmin } from '../db/supabase';
import { createScopedLogger } from '../utils/logger';
import { validateUrl } from '../utils/ssrf';
import { searchRateLimit, apiRateLimit } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';
import { PaginatedResponse, ProductResult } from '../types';
import { getPriceHistory, recordCurrentPrice } from '../tracking/price-tracker';
import { checkAlerts } from '../tracking/alert-service';
import { injectAffiliateTag } from '../affiliate/parser';
import { config, safeErrorMessage } from '../utils/config';
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
    res.status(500).json({ error: 'Search failed', message: safeErrorMessage(err) });
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

  try {
    const url = new URL(entry.raw_url);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return res.status(400).json({ error: 'Invalid redirect URL' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid redirect URL' });
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

  const ssrfCheck = await validateUrl(url);
  if (!ssrfCheck.valid) {
    return res.status(400).json({ error: `URL blocked: ${ssrfCheck.reason}` });
  }

  try {
    const jobId = await enqueueUrlProcessing(url);
    res.json({ job_id: jobId, status: 'queued' });
  } catch (err: any) {
    log.error({ url, error: err.message }, 'Failed to enqueue URL processing');
    res.status(500).json({ error: 'Failed to enqueue URL processing' });
  }
});

router.get('/process-url/:jobId', async (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM url_processing_jobs WHERE job_id = ?').get(jobId) as any;

    if (!row) return res.status(404).json({ error: 'Job not found' });

    const response: any = { job_id: row.job_id, status: row.status };

    if (row.status === 'completed' && row.result_blob) {
      response.result = JSON.parse(row.result_blob);
    }
    if (row.status === 'failed') {
      response.error = row.error;
    }

    res.json(response);
  } catch (err: any) {
    log.error({ jobId, error: err.message }, 'Failed to fetch job status');
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

router.post('/products/:id/track', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { target_price, email, currency } = req.body;

  if (!target_price || !email) {
    return res.status(400).json({ error: 'target_price and email are required' });
  }

  const sanitizedEmail = typeof email === 'string' ? email.replace(/<[^>]*>/g, '').trim().slice(0, 254) : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(sanitizedEmail)) {
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
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

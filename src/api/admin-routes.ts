import { Router, Request, Response } from 'express';
import multer from 'multer';
import { getSupabaseAdmin } from '../db/supabase';
import { getDb } from '../db/connection';
import { createScopedLogger } from '../utils/logger';
import { scrapeUrl } from './scrape';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { sanitizeObject } from '../utils/xss';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const log = createScopedLogger('admin');
const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/products', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const page_size = Math.min(parseInt(req.query.page_size as string || '50', 10), 100);
    const q = req.query.q as string | undefined;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (q?.trim()) {
      query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%`);
    }

    const from = (page - 1) * page_size;
    const to = from + page_size - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({ data: data || [], pagination: { page, page_size, total: count || 0 } });
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin list products failed');
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = sanitizeObject(req.body, ['title', 'description', 'brand', 'category', 'merchant_name']);

    const product = {
      title: body.title,
      normalized_title: body.normalized_title || body.title,
      description: body.description || '',
      price_current: parseFloat(body.price_current) || 0,
      price_original: body.price_original ? parseFloat(body.price_original) : null,
      currency_code: body.currency_code || 'USD',
      merchant_platform: body.merchant_platform || 'amazon',
      merchant_name: body.merchant_name || body.merchant_platform || '',
      merchant_logo_url: body.merchant_logo_url || '',
      thumbnail_url: body.thumbnail_url || '',
      category: body.category || '',
      brand: body.brand || '',
      model_number: body.model_number || null,
      upc: body.upc || null,
      ean: body.ean || null,
      asin: body.asin || null,
      sku: body.sku || null,
      affiliate_url: body.affiliate_url || null,
      featured: body.featured === true || body.featured === 'true',
      in_stock: body.in_stock !== false && body.in_stock !== 'false',
      match_method: body.match_method || 'none',
      match_confidence: parseFloat(body.match_confidence) || 0,
    };

    const { data, error } = await supabase.from('products').insert(product).select().single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin create product failed');
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = sanitizeObject(req.body, ['title', 'description', 'brand', 'category', 'merchant_name']);
    const id = req.params.id;

    const updates: Record<string, any> = {};
    const fields = [
      'title', 'normalized_title', 'description', 'price_current', 'price_original',
      'currency_code', 'merchant_platform', 'merchant_name', 'merchant_logo_url',
      'thumbnail_url', 'category', 'brand', 'model_number', 'upc', 'ean', 'asin', 'sku',
      'affiliate_url', 'match_method', 'match_group_id',
    ];

    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f];
    }
    if (body.price_current !== undefined) updates.price_current = parseFloat(body.price_current);
    if (body.price_original !== undefined) updates.price_original = body.price_original ? parseFloat(body.price_original) : null;
    if (body.match_confidence !== undefined) updates.match_confidence = parseFloat(body.match_confidence);
    if (body.featured !== undefined) updates.featured = body.featured === true || body.featured === 'true';
    if (body.in_stock !== undefined) updates.in_stock = body.in_stock !== false && body.in_stock !== 'false';

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    res.json(data);
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin update product failed');
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin delete product failed');
    res.status(500).json({ error: err.message });
  }
});

router.patch('/products/:id/feature', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const featured = req.body.featured === true || req.body.featured === 'true';

    const { data, error } = await supabase.from('products').update({ featured }).eq('id', req.params.id).select().single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    res.json(data);
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin toggle feature failed');
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('site_settings').select('*');

    if (error) throw error;

    const settings: Record<string, any> = {};
    (data || []).forEach(row => { settings[row.key] = row.value; });

    res.json(settings);
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin get settings failed');
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = req.body;

    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value.replace(/<[^>]*>/g, '').slice(0, 2000) : JSON.stringify(value),
    }));

    for (const s of upserts) {
      const { error } = await supabase.from('site_settings').upsert(s, { onConflict: 'key' });
      if (error) throw error;
    }

    res.json({ success: true });
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin update settings failed');
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const supabase = getSupabaseAdmin();
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: featured } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('featured', true);
    const { count: outOfStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('in_stock', false);

    let clickData = { total: 0, unique_products: 0, today: 0, last7: 0 };
    try {
      const db = getDb();
      const total = db.prepare('SELECT COUNT(*) as c FROM click_analytics').get() as any;
      const today = db.prepare("SELECT COUNT(*) as c FROM click_analytics WHERE date(clicked_at) = date('now')").get() as any;
      const last7 = db.prepare("SELECT COUNT(*) as c FROM click_analytics WHERE clicked_at >= datetime('now', '-7 days')").get() as any;
      const uniqueProducts = db.prepare('SELECT COUNT(DISTINCT product_id) as c FROM cloaked_links WHERE click_count > 0').get() as any;
      clickData = {
        total: total?.c || 0,
        unique_products: uniqueProducts?.c || 0,
        today: today?.c || 0,
        last7: last7?.c || 0,
      };
    } catch {}

    res.json({
      totalProducts: totalProducts || 0,
      featured: featured || 0,
      outOfStock: outOfStock || 0,
      clicks: clickData,
    });
  } catch (err: any) {
    log.error({ error: err.message }, 'Admin stats failed');
    res.status(500).json({ error: err.message });
  }
});

router.get('/upload', (_req: Request, res: Response) => {
  res.json({ error: 'Use POST with multipart/form-data' });
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const supabase = getSupabaseAdmin();
    const ext = req.file.originalname.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = 'product-images';

    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
    if (bucketError?.message?.includes('not found')) {
      await supabase.storage.createBucket(bucket, { public: true });
    }

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    res.json({ url: urlData.publicUrl });
  } catch (err: any) {
    log.error({ error: err.message }, 'Upload failed');
    res.status(500).json({ error: err.message });
  }
});

router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const url = typeof req.body.url === 'string' ? req.body.url.replace(/[<>\s]/g, '').slice(0, 2000) : '';
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' });
    }
    const result = await scrapeUrl(url);
    res.json(result);
  } catch (err: any) {
    log.error({ error: err.message }, 'Scrape failed');
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const topProducts = db.prepare(`
      SELECT cl.product_id, cl.merchant, cl.click_count, cl.last_clicked_at
      FROM cloaked_links cl ORDER BY cl.click_count DESC LIMIT 10
    `).all();
    const recentClicks = db.prepare(`
      SELECT ca.clicked_at, ca.short_code, ca.ip_address, ca.referer
      FROM click_analytics ca ORDER BY ca.clicked_at DESC LIMIT 20
    `).all();
    res.json({ topProducts, recentClicks });
  } catch (err: any) {
    log.error({ error: err.message }, 'Analytics fetch failed');
    res.status(500).json({ error: err.message });
  }
});

export default router;

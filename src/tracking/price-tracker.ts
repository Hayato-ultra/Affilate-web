import { createScopedLogger } from '../utils/logger';
import { getSupabaseAdmin } from '../db/supabase';

const log = createScopedLogger('price-tracker');

interface PriceRecord {
  product_id: string;
  price: number;
  currency: string;
  merchant: string;
  recorded_at: string;
}

export async function recordCurrentPrice(productId: string): Promise<PriceRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data: product, error } = await supabase
    .from('products')
    .select('id, title, price_current, currency_code, merchant_platform')
    .eq('id', productId)
    .single();

  if (error || !product) {
    log.error({ productId, error: error?.message }, 'Product not found');
    return null;
  }

  const record = {
    product_id: product.id,
    price: product.price_current,
    currency: product.currency_code,
    merchant: product.merchant_platform,
    recorded_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from('price_history')
    .insert(record);

  if (insertError) {
    log.error({ productId, error: insertError.message }, 'Failed to record price');
    return null;
  }

  return record;
}

export async function getPriceHistory(
  productId: string,
  days: number = 90
): Promise<PriceRecord[]> {
  const supabase = getSupabaseAdmin();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .gte('recorded_at', cutoff.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    log.error({ productId, error: error.message }, 'Failed to fetch price history');
    return [];
  }

  return data || [];
}

export async function refreshTrackedProducts(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('product_id, target_price, currency, email')
    .eq('active', true);

  if (error) {
    log.error({ error: error.message }, 'Failed to fetch active alerts');
    return 0;
  }

  const uniqueProducts = [...new Set(alerts.map(a => a.product_id))];
  log.info({ trackedProducts: uniqueProducts.length }, 'Refreshing tracked products');

  let updatedCount = 0;
  for (const productId of uniqueProducts) {
    const record = await recordCurrentPrice(productId);
    if (record) updatedCount++;
  }

  return updatedCount;
}

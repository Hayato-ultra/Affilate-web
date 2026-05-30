import { createScopedLogger } from '../utils/logger';
import { getSupabaseAdmin } from '../db/supabase';
import { getDb } from '../db/connection';
import { getPriceHistory } from './price-tracker';
import { config } from '../utils/config';

const log = createScopedLogger('alert-service');

interface PriceAlert {
  id: string;
  product_id: string;
  target_price: number;
  currency: string;
  email: string;
  product_title?: string;
}

export async function checkAlerts(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select(`
      id,
      product_id,
      target_price,
      currency,
      email,
      products!inner(title)
    `)
    .eq('active', true);

  if (error) {
    log.error({ error: error.message }, 'Failed to fetch alerts');
    return 0;
  }

  let triggeredCount = 0;

  for (const alert of alerts as any[]) {
    const history = await getPriceHistory(alert.product_id, 1);
    if (history.length === 0) continue;

    const latestPrice = history[history.length - 1].price;

    if (latestPrice <= alert.target_price) {
      log.info({
        productId: alert.product_id,
        product: alert.products?.title,
        currentPrice: latestPrice,
        targetPrice: alert.target_price,
      }, 'Price alert triggered');

      await sendAlert(alert, latestPrice);

      await supabase
        .from('price_alerts')
        .update({ active: false, triggered_at: new Date().toISOString() })
        .eq('id', alert.id);

      triggeredCount++;
    }
  }

  return triggeredCount;
}

async function sendAlert(alert: any, currentPrice: number): Promise<void> {
  const productTitle = alert.products?.title || 'a product';
  const currencySymbols: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
  const sym = currencySymbols[alert.currency] || alert.currency + ' ';

  const subject = `Price Drop Alert: ${productTitle}`;
  const message = `The price has dropped to ${sym}${currentPrice.toLocaleString()} — below your target of ${sym}${alert.target_price.toLocaleString()}!`;

  log.info({ to: alert.email, subject, message }, 'Alert notification');

  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO notifications (email, product_id, product_title, target_price, current_price, currency)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(alert.email, alert.product_id, productTitle, alert.target_price, currentPrice, alert.currency);
    log.info({ to: alert.email, product: productTitle }, 'In-app notification saved');
  } catch (err: any) {
    log.error({ error: err.message }, 'Failed to save in-app notification');
  }

  if (!config.resend.apiKey) {
    log.warn('RESEND_API_KEY not set — skipping email delivery');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(config.resend.apiKey);

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background: #f5f5f5;">
        <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <h2 style="margin: 0 0 16px; color: #1a1a1a;">Price Drop Alert</h2>
          <p style="color: #555; line-height: 1.6;">The price of <strong>${escapeHtml(productTitle)}</strong> has dropped!</p>
          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
            <p style="margin: 0 0 4px; color: #166534; font-size: 14px;">Current Price</p>
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16a34a;">${sym}${currentPrice.toLocaleString()}</p>
            <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">Target: ${sym}${alert.target_price.toLocaleString()}</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 24px 0 0;">
            You received this because you set a price alert on Lumina Commerce.
          </p>
        </div>
      </body>
      </html>
    `;

    const { error: sendError } = await resend.emails.send({
      from: config.resend.fromEmail,
      to: alert.email,
      subject,
      html,
    });

    if (sendError) {
      log.error({ error: sendError, to: alert.email }, 'Failed to send alert email via Resend');
    } else {
      log.info({ to: alert.email, product: productTitle }, 'Alert email sent via Resend');
    }
  } catch (err: any) {
    log.error({ error: err.message }, 'Failed to send alert email');
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

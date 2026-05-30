import { nanoid } from 'nanoid';
import { getDb } from '../db/connection';
import { createScopedLogger } from '../utils/logger';
import { config } from '../utils/config';
import { parseUrl, injectAffiliateTag } from './parser';
import { CloakEntry } from '../types';

const log = createScopedLogger('cloak');

const SHORT_CODE_LENGTH = 8;

export function generateShortCode(): string {
  return nanoid(SHORT_CODE_LENGTH);
}

export function createCloakedLink(
  rawUrl: string,
  merchant: string,
  productId: string
): CloakEntry {
  const parsed = parseUrl(rawUrl);
  const tag = config.affiliate.tagMap[merchant] || '';
  const rawAffiliateUrl = injectAffiliateTag(parsed.cleanUrl, merchant, tag);

  const shortCode = generateShortCode();

  const entry: CloakEntry = {
    short_code: shortCode,
    merchant,
    product_id: productId,
    raw_url: rawAffiliateUrl,
    merchant_tag: tag,
    created_at: Date.now(),
    click_count: 0,
  };

  const db = getDb();
  db.prepare(`
    INSERT INTO cloaked_links (short_code, merchant, product_id, raw_url, merchant_tag, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(shortCode, merchant, productId, rawAffiliateUrl, tag, entry.created_at);

  log.debug({ shortCode, merchant, productId }, 'Cloaked link created');
  return entry;
}

export function resolveCloakedLink(shortCode: string): CloakEntry | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM cloaked_links WHERE short_code = ?').get(shortCode) as any;

  if (!row) return null;

  return {
    short_code: row.short_code,
    merchant: row.merchant,
    product_id: row.product_id,
    raw_url: row.raw_url,
    merchant_tag: row.merchant_tag,
    created_at: row.created_at,
    click_count: row.click_count,
  };
}

export function recordClick(shortCode: string, ip?: string, ua?: string, referer?: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE cloaked_links SET click_count = click_count + 1, last_clicked_at = ?
    WHERE short_code = ?
  `).run(Date.now(), shortCode);

  db.prepare(`
    INSERT INTO click_analytics (short_code, clicked_at, ip_address, user_agent, referer)
    VALUES (?, ?, ?, ?, ?)
  `).run(shortCode, Date.now(), ip || null, ua || null, referer || null);

  log.debug({ shortCode }, 'Click recorded');
}

export function getRedirectUrl(shortCode: string): string | null {
  const entry = resolveCloakedLink(shortCode);
  return entry ? entry.raw_url : null;
}

export function cloakedUrl(shortCode: string): string {
  return `/go/${shortCode}`;
}

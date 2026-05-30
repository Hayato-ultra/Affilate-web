import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sanitizeTitle, extractModelCode, extractIdentifiers } from '../src/normalize/sanitizer';
import { matchSingle } from '../src/normalize/matcher';
import { parseUrl, injectAffiliateTag } from '../src/affiliate/parser';
import { normalizeQuery, queryKey } from '../src/cache/cache';
import { getDb, closeDb } from '../src/db/connection';
import { createCloakedLink, resolveCloakedLink } from '../src/affiliate/cloak';
import { config, validateEnv } from '../src/utils/config';

describe('Full Pipeline Integration', () => {
  beforeAll(() => {
    process.env.DB_PATH = './data/test-integration.db';
    getDb();
  });

  afterAll(() => {
    closeDb();
  });

  it('sanitize → normalize → match pipeline works end-to-end', () => {
    const rawQuery = '  iPhone 15 Pro Max! Free Shipping  ';
    const normalized = normalizeQuery(rawQuery);
    expect(normalized).toBe('iphone 15 pro max free shipping');

    const sanitized = sanitizeTitle(rawQuery);
    expect(sanitized).toBe('iPhone 15 Pro Max!');

    const match = matchSingle(
      sanitized,
      'Latest Apple smartphone',
      'iPhone 15 Pro Max 256GB Deep Purple'
    );
    expect(match.matched).toBe(true);
  });

  it('affiliate link pipeline works end-to-end', () => {
    const rawUrl = 'https://www.amazon.in/dp/B0ABC?ref=nav_sb&tag=oldtag&utm_source=google';
    const parsed = parseUrl(rawUrl);
    expect(parsed.strippedParams.length).toBeGreaterThanOrEqual(3);

    const finalUrl = injectAffiliateTag(parsed.cleanUrl, 'amazon', 'newtag-21');
    expect(finalUrl).toContain('tag=newtag-21');
    expect(finalUrl).not.toContain('oldtag');
    expect(finalUrl).not.toContain('ref=nav_sb');
  });

  it('query key generation is deterministic', () => {
    expect(queryKey('iPhone 15')).toBe(queryKey('  iPhone   15!  '));
  });

  it('cache key includes sort_by and merchant', () => {
    const base = queryKey('phone');
    const sorted = queryKey('phone', 'price_asc');
    const filtered = queryKey('phone', 'price_asc', 'amazon');
    expect(sorted).toBe('q:phone:s:price_asc');
    expect(filtered).toBe('q:phone:s:price_asc:m:amazon');
    expect(sorted).not.toBe(base);
  });

  it('matching by UPC/EAN/ASIN identifier works', () => {
    const match = matchSingle(
      'Samsung TV',
      undefined,
      'Samsung 55" TV',
      undefined,
      { upc: '123456789012' },
      { upc: '123456789012' }
    );
    expect(match.matched).toBe(true);
    expect(match.match_method).toBe('exact_upc');
    expect(match.match_confidence).toBe(1);
  });

  it('matching falls back to fuzzy when no identifiers', () => {
    const match = matchSingle(
      'iPhone 15 Pro Max',
      undefined,
      'iPhone 15 Pro Max 256GB Deep Purple'
    );
    expect(match.matched).toBe(true);
    expect(match.match_method).toBe('fuzzy_tokens');
  });

  it('non-matching products return no match', () => {
    const match = matchSingle(
      'MacBook Pro',
      undefined,
      'Kitchen Mixer Blender 1000W'
    );
    expect(match.matched).toBe(false);
    expect(match.match_method).toBe('none');
  });

  it('environ validation warns on missing keys', () => {
    const warnings = validateEnv();
    expect(Array.isArray(warnings)).toBe(true);
  });

  it('extractIdentifiers finds ASIN in text', () => {
    const ids = extractIdentifiers('Product B012345678 goes here');
    expect(ids.asin).toBe('B012345678');
  });

  it('cloak and resolve round-trips correctly', () => {
    const entry = createCloakedLink('https://amazon.com/dp/B0TEST', 'amazon', 'test123');
    expect(entry.short_code).toBeTruthy();
    expect(entry.short_code.length).toBe(8);
    expect(entry.raw_url).toContain('https://amazon.com/dp/B0TEST');
    expect(entry.raw_url).toContain('tag=');

    const resolved = resolveCloakedLink(entry.short_code);
    expect(resolved).not.toBeNull();
    expect(resolved!.raw_url).toBe(entry.raw_url);
  });
});

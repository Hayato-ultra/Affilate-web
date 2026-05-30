import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { parseUrl, injectAffiliateTag } from '../src/affiliate/parser';
import { createCloakedLink, resolveCloakedLink, generateShortCode } from '../src/affiliate/cloak';
import { getDb, closeDb } from '../src/db/connection';

describe('Affiliate URL Parser', () => {
  it('strips tracking parameters', () => {
    const result = parseUrl('https://www.amazon.in/dp/B0ABC?tag=myaffiliate&ref=nav&utm_source=google');
    expect(result.strippedParams).toContain('tag');
    expect(result.strippedParams).toContain('ref');
    expect(result.strippedParams).toContain('utm_source');
    expect(result.cleanUrl).not.toContain('myaffiliate');
  });

  it('detects merchant from hostname', () => {
    expect(parseUrl('https://www.flipkart.com/product').merchant).toBe('flipkart');
    expect(parseUrl('https://www.amazon.in/dp/B0ABC').merchant).toBe('amazon');
  });
});

describe('Tag Injection', () => {
  it('injects amazon tag parameter', () => {
    const url = injectAffiliateTag('https://www.amazon.in/dp/B0ABC', 'amazon', 'mytag-21');
    expect(url).toContain('tag=mytag-21');
  });

  it('injects flipkart affid parameter', () => {
    const url = injectAffiliateTag('https://www.flipkart.com/product', 'flipkart', 'aff123');
    expect(url).toContain('affid=aff123');
  });
});

describe('Link Cloaking', () => {
  beforeAll(() => {
    process.env.DB_PATH = './data/test-affiliate.db';
    getDb();
  });

  afterEach(() => {
    const db = getDb();
    db.exec('DELETE FROM cloaked_links');
  });

  afterAll(() => {
    closeDb();
  });

  it('creates and resolves cloaked links', () => {
    const entry = createCloakedLink('https://www.amazon.in/dp/B0ABC?tag=oldtag', 'amazon', 'prod_1');
    expect(entry.short_code).toBeTruthy();
    expect(entry.short_code.length).toBe(8);

    const resolved = resolveCloakedLink(entry.short_code);
    expect(resolved).not.toBeNull();
    expect(resolved!.product_id).toBe('prod_1');
    expect(resolved!.merchant).toBe('amazon');
  });

  it('returns null for unknown short code', () => {
    expect(resolveCloakedLink('nonexist')).toBeNull();
  });
});

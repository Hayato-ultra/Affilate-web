import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { normalizeQuery, queryKey, lookupCache, writeCache, invalidateCache, cacheStats } from '../src/cache/cache';
import { getDb, closeDb } from '../src/db/connection';

describe('Cache Module', () => {
  beforeAll(() => {
    process.env.DB_PATH = './data/test-cache.db';
    getDb();
  });

  afterEach(() => {
    const db = getDb();
    db.exec('DELETE FROM cache_entries');
  });

  afterAll(() => {
    closeDb();
  });

  describe('normalizeQuery', () => {
    it('lowercases and strips punctuation', () => {
      expect(normalizeQuery('iPhone 15 Pro Max!')).toBe('iphone 15 pro max');
    });

    it('collapses whitespace', () => {
      expect(normalizeQuery('  samsung   galaxy   ')).toBe('samsung galaxy');
    });

    it('handles empty string', () => {
      expect(normalizeQuery('')).toBe('');
    });
  });

  describe('queryKey', () => {
    it('generates consistent keys', () => {
      expect(queryKey('iPhone 15')).toBe('q:iphone 15');
    });

    it('includes sort_by and merchant when provided', () => {
      expect(queryKey('phone', 'price_asc', 'amazon')).toBe('q:phone:s:price_asc:m:amazon');
    });
  });

  describe('lookupCache', () => {
    it('returns miss for unknown queries', async () => {
      const result = await lookupCache('nonexistent');
      expect(result.hit).toBe(false);
      expect(result.results).toEqual([]);
    });

    it('returns hit for cached queries', async () => {
      await writeCache('test product', [
        { product_id: '1', title: 'Test', price: { current_price: 100, original_price: null, currency_code: 'INR' }, match: { matched: true, match_method: 'fuzzy_tokens', match_confidence: 0.8, match_group_id: 'g1' } },
      ] as any);

      const result = await lookupCache('test product');
      expect(result.hit).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  describe('cacheStats', () => {
    it('returns stats', () => {
      const stats = cacheStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('stale');
      expect(stats).toHaveProperty('avgHits');
    });
  });
});

import Redis from 'ioredis';
import { getDb } from '../db/connection';
import { config } from '../utils/config';
import { createScopedLogger } from '../utils/logger';
import { CacheEntry, ProductResult } from '../types';

const log = createScopedLogger('cache');

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({ host: config.redis.host, port: config.redis.port, lazyConnect: true });
    redis.on('error', (err) => log.error({ error: err.message }, 'Redis connection error'));
  }
  return redis;
}

export async function initRedis(): Promise<void> {
  try {
    await getRedis().connect();
    log.info('Redis cache connected');
  } catch (err) {
    log.warn({ error: (err as Error).message }, 'Redis unavailable, falling back to SQLite');
    redis = null;
  }
}

export function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function queryKey(query: string, sortBy?: string, merchant?: string): string {
  const q = normalizeQuery(query);
  const s = sortBy && sortBy !== 'relevance' ? `:s:${sortBy}` : '';
  const m = merchant ? `:m:${merchant}` : '';
  return `q:${q}${s}${m}`;
}

const REDIS_TTL_S = Math.floor(config.cache.ttl_ms / 1000);

export async function lookupCache(query: string, sortBy?: string, merchant?: string): Promise<{
  hit: boolean;
  stale: boolean;
  results: ProductResult[];
}> {
  const key = queryKey(query, sortBy, merchant);
  const now = Date.now();

  // 1. Try Redis first (hot cache)
  if (redis) {
    try {
      const raw = await redis.get(key);
      if (raw) {
        const entry: CacheEntry = JSON.parse(raw);
        const age = now - entry.fetched_at;
        const stale = age > config.cache.staleness_ms;
        log.debug({ query: normalizeQuery(query), stale, age, source: 'redis' }, 'Cache hit');
        return { hit: true, stale, results: entry.results };
      }
    } catch (err) {
      log.warn({ error: (err as Error).message }, 'Redis read failed, falling back');
    }
  }

  // 2. Fallback to SQLite (warm cache)
  const db = getDb();
  const row = db.prepare('SELECT * FROM cache_entries WHERE query_key = ?').get(key) as any;

  if (!row) {
    log.debug({ query: normalizeQuery(query) }, 'Cache miss');
    return { hit: false, stale: false, results: [] };
  }

  db.prepare('UPDATE cache_entries SET hit_count = hit_count + 1 WHERE query_key = ?').run(key);

  const age = now - row.fetched_at;
  const stale = age > row.staleness_threshold_ms;
  const results: ProductResult[] = JSON.parse(row.results_blob);

  log.debug({ query: normalizeQuery(query), stale, age, hits: row.hit_count + 1, source: 'sqlite' }, 'Cache hit');
  return { hit: true, stale, results };
}

export async function writeCache(query: string, results: ProductResult[], sortBy?: string, merchant?: string): Promise<void> {
  const key = queryKey(query, sortBy, merchant);
  const now = Date.now();

  // 1. Write to Redis (hot cache)
  if (redis) {
    try {
      const entry: CacheEntry = {
        query_key: key,
        results,
        fetched_at: now,
        ttl_ms: config.cache.ttl_ms,
        staleness_threshold_ms: config.cache.staleness_ms,
      };
      await redis.setex(key, REDIS_TTL_S, JSON.stringify(entry));
    } catch (err) {
      log.warn({ error: (err as Error).message }, 'Redis write failed');
    }
  }

  // 2. Write to SQLite (warm cache / fallback)
  const db = getDb();
  const blob = JSON.stringify(results);

  db.prepare(`
    INSERT INTO cache_entries (query_key, results_blob, fetched_at, ttl_ms, staleness_threshold_ms, hit_count, updated_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
    ON CONFLICT(query_key) DO UPDATE SET
      results_blob = excluded.results_blob,
      fetched_at = excluded.fetched_at,
      updated_at = excluded.updated_at
  `).run(key, blob, now, config.cache.ttl_ms, config.cache.staleness_ms, now);

  log.debug({ query: normalizeQuery(query), count: results.length }, 'Cache written');
}

export function invalidateCache(query: string, sortBy?: string, merchant?: string): void {
  const key = queryKey(query, sortBy, merchant);
  // Invalidate Redis
  if (redis) {
    redis.del(key).catch(() => {});
  }
  // Invalidate SQLite
  const db = getDb();
  db.prepare('DELETE FROM cache_entries WHERE query_key = ?').run(key);
  log.info({ query: normalizeQuery(query) }, 'Cache invalidated');
}

export function evictStaleEntries(): number {
  const db = getDb();
  const cutoff = Date.now() - config.cache.ttl_ms;
  const result = db.prepare('DELETE FROM cache_entries WHERE fetched_at < ?').run(cutoff);
  if (result.changes > 0) {
    log.info({ removed: result.changes }, 'Evicted stale cache entries');
  }
  return result.changes;
}

export function cacheStats(): { total: number; stale: number; avgHits: number } {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM cache_entries').get() as any).c;
  const cutoff = Date.now() - config.cache.staleness_ms;
  const stale = (db.prepare('SELECT COUNT(*) as c FROM cache_entries WHERE fetched_at < ?').get(cutoff) as any).c;
  const avgHits = total > 0
    ? (db.prepare('SELECT AVG(hit_count) as avg FROM cache_entries').get() as any).avg
    : 0;
  return { total, stale, avgHits: Math.round(avgHits) };
}

export async function shouldRefreshCache(query: string, sortBy?: string, merchant?: string): Promise<boolean> {
  const { hit, stale, results } = await lookupCache(query, sortBy, merchant);
  if (!hit) return true;
  if (stale) return true;
  if (results.length === 0) return true;
  return false;
}

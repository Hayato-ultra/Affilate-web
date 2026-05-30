import { getDb, closeDb } from './connection';
import { logger } from '../utils/logger';

function seed() {
  const db = getDb();
  logger.info('Seeding database...');

  const sampleQueries = ['iphone 15', 'samsung galaxy s24', 'sony headphones', 'macbook air'];
  for (const q of sampleQueries) {
    db.prepare(`
      INSERT OR IGNORE INTO cache_entries (query_key, results_blob, fetched_at, ttl_ms, staleness_threshold_ms)
      VALUES (?, '[]', ?, 43200000, 86400000)
    `).run(`q:${q.toLowerCase().replace(/[^\w\s]/g, '').trim()}`, Date.now());
  }

  logger.info({ queries: sampleQueries.length }, 'Seed complete');
  closeDb();
}

seed();

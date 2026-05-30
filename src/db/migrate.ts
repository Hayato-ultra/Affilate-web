import fs from 'fs';
import path from 'path';
import { getDb, closeDb } from './connection';
import { logger } from '../utils/logger';

const MIGRATIONS_TABLE = '_migrations';

function ensureMigrationsTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      checksum TEXT NOT NULL
    );
  `);
}

function getAppliedMigrations(): Set<string> {
  const db = getDb();
  const rows = db.prepare(`SELECT name FROM ${MIGRATIONS_TABLE}`).all() as { name: string }[];
  return new Set(rows.map(r => r.name));
}

function markApplied(name: string, checksum: string): void {
  const db = getDb();
  db.prepare(`INSERT INTO ${MIGRATIONS_TABLE} (name, checksum) VALUES (?, ?)`).run(name, checksum);
}

function md5(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const chr = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function migrate(): void {
  const db = getDb();
  ensureMigrationsTable();

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    logger.info('No migrations directory found');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const applied = getAppliedMigrations();
  let count = 0;

  for (const file of files) {
    if (applied.has(file)) continue;

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    const checksum = md5(sql);

    logger.info({ migration: file }, 'Applying migration');

    db.exec('BEGIN');
    try {
      db.exec(sql);
      markApplied(file, checksum);
      db.exec('COMMIT');
      count++;
      logger.info({ migration: file }, 'Migration applied');
    } catch (err) {
      db.exec('ROLLBACK');
      logger.error({ migration: file, error: (err as Error).message }, 'Migration failed');
      throw err;
    }
  }

  logger.info({ applied: count }, 'Migrations complete');
}

// Run directly
if (require.main === module) {
  migrate();
  closeDb();
}

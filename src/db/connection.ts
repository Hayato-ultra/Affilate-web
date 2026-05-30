import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { migrate } from './migrate';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbDir = path.dirname(config.db.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(config.db.path);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');

    migrate();
    logger.info({ path: config.db.path }, 'Database initialized');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as any;
  }
}

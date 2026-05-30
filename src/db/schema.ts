export const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS cache_entries (
  query_key TEXT PRIMARY KEY,
  results_blob TEXT NOT NULL,
  fetched_at INTEGER NOT NULL,
  ttl_ms INTEGER NOT NULL DEFAULT 43200000,
  staleness_threshold_ms INTEGER NOT NULL DEFAULT 86400000,
  hit_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS cloaked_links (
  short_code TEXT PRIMARY KEY,
  merchant TEXT NOT NULL,
  product_id TEXT NOT NULL,
  raw_url TEXT NOT NULL,
  merchant_tag TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  click_count INTEGER NOT NULL DEFAULT 0,
  last_clicked_at INTEGER
);

CREATE TABLE IF NOT EXISTS click_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code TEXT NOT NULL,
  clicked_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  FOREIGN KEY (short_code) REFERENCES cloaked_links(short_code)
);

CREATE TABLE IF NOT EXISTS product_matches (
  match_group_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  match_method TEXT NOT NULL,
  match_confidence REAL NOT NULL,
  matched_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  PRIMARY KEY (match_group_id, product_id)
);

CREATE TABLE IF NOT EXISTS aggregator_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  query TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_cache_fetched ON cache_entries(fetched_at);
CREATE INDEX IF NOT EXISTS idx_cache_hit ON cache_entries(hit_count DESC);
CREATE INDEX IF NOT EXISTS idx_cloak_merchant ON cloaked_links(merchant);
CREATE INDEX IF NOT EXISTS idx_click_short ON click_analytics(short_code);
CREATE INDEX IF NOT EXISTS idx_matches_group ON product_matches(match_group_id);
CREATE INDEX IF NOT EXISTS idx_agglog_platform ON aggregator_log(platform, created_at);

-- Price tracking for historical charts and drop alerts
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  merchant TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  target_price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  email TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  triggered_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(active);

-- On-site notifications for price drop alerts
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL DEFAULT '',
  target_price REAL NOT NULL,
  current_price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(email, read);

CREATE TABLE IF NOT EXISTS url_processing_jobs (
  job_id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  result_blob TEXT,
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_url_jobs_status ON url_processing_jobs(status);
`;

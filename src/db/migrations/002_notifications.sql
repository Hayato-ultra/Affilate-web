-- 002_notifications: Add in-app notifications table

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

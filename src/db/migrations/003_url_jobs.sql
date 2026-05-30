-- 003_url_jobs: Async URL processing job results

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

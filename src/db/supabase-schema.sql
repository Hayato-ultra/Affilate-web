-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- Full schema for the affiliate aggregator engine.

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  normalized_title TEXT,
  description TEXT,
  price_current NUMERIC(12, 2) NOT NULL,
  price_original NUMERIC(12, 2),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  merchant_platform TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  merchant_logo_url TEXT,
  thumbnail_url TEXT,
  full_urls JSONB DEFAULT '[]',
  model_number TEXT,
  upc TEXT,
  ean TEXT,
  asin TEXT,
  sku TEXT,
  category TEXT,
  brand TEXT,
  affiliate_url TEXT,
  match_method TEXT DEFAULT 'none',
  match_confidence NUMERIC(4, 3) DEFAULT 0,
  match_group_id TEXT,
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_title ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price_current);
CREATE INDEX IF NOT EXISTS idx_products_merchant ON products(merchant_platform);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);

-- ============================================================
-- PRICE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  merchant TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, recorded_at DESC);

-- ============================================================
-- PRICE ALERTS
-- ============================================================
CREATE TABLE IF NOT EXISTS price_alerts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  email TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(email);

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES ('site_name', '"Lumina Commerce"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_title', '"Redefining Modern Authority."') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_subtitle', '"Spring / Summer 2024"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_cta', '"Shop The Collection"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_image', '""') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('footer_tagline', '"Excellence in Every Detail."') ON CONFLICT (key) DO NOTHING;

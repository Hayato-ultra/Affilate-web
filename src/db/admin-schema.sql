-- Run this in Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES ('site_name', '"Lumina Commerce"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_title', '"Redefining Modern Authority."') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_subtitle', '"Spring / Summer 2024"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_cta', '"Shop The Collection"') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('hero_image', '""') ON CONFLICT (key) DO NOTHING;
INSERT INTO site_settings (key, value) VALUES ('footer_tagline', '"Excellence in Every Detail."') ON CONFLICT (key) DO NOTHING;

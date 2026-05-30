import { createScopedLogger } from '../utils/logger';

const log = createScopedLogger('scraping-api');

export interface ScrapingApiConfig {
  provider: 'abstract' | 'scrapedo' | 'zenrows' | 'oxylabs' | 'none';
  apiKey: string;
}

function getConfig(): ScrapingApiConfig {
  return {
    provider: (process.env.SCRAPING_API_PROVIDER as ScrapingApiConfig['provider']) || 'none',
    apiKey: process.env.SCRAPING_API_KEY || '',
  };
}

function buildScrapingUrl(targetUrl: string, cfg: ScrapingApiConfig): string | null {
  switch (cfg.provider) {
    case 'abstract':
      return `https://website.abstractapi.com/v1/?api_key=${cfg.apiKey}&url=${encodeURIComponent(targetUrl)}`;
    case 'scrapedo':
      return `https://api.scrape.do?url=${encodeURIComponent(targetUrl)}&api_key=${cfg.apiKey}`;
    case 'zenrows':
      return `https://api.zenrows.com/v1/?apikey=${cfg.apiKey}&url=${encodeURIComponent(targetUrl)}`;
    case 'oxylabs':
      return `https://realtime.oxylabs.io/v1/queries?source=universal&url=${encodeURIComponent(targetUrl)}&render=html`;
    case 'none':
      return null;
    default:
      return null;
  }
}

async function fetchRaw(url: string, cfg: ScrapingApiConfig): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Scraping API error: ${response.status} ${await response.text().catch(() => '')}`);
  }

  return response.text();
}

function tryExtractHtmlFromJson(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return parsed.page_source || parsed.html || parsed.content || parsed.result || null;
  } catch {
    return null;
  }
}

export async function fetchWithScrapingApi(url: string): Promise<string> {
  const cfg = getConfig();
  const scrapingUrl = buildScrapingUrl(url, cfg);

  if (!scrapingUrl) {
    log.info('No scraping API configured, falling back to direct fetch');
    const { fetchHtml } = await import('./scrape');
    return fetchHtml(url);
  }

  log.debug({ provider: cfg.provider, url: url.slice(0, 80) }, 'Fetching via scraping API');

  const raw = await fetchRaw(scrapingUrl, cfg);

  // Providers that return JSON wrappers need HTML extraction
  if (cfg.provider === 'abstract' || cfg.provider === 'oxylabs') {
    const html = tryExtractHtmlFromJson(raw);
    if (html) return html;
    log.warn({ provider: cfg.provider }, 'JSON response did not contain HTML fields, returning raw');
  }

  return raw;
}
